import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "../client";
import { newId } from "../../ulid";
import { hashSecret, verifySecret } from "../../password";
import { identifierHash, type IdentityType } from "../../identifier-hash";
import { randomInt } from "node:crypto";

const { verificationCodes: codes } = schema;

type Purpose = "login" | "register" | "reset_password" | "bind_phone";

const TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;

/** 生成 6 位数字验证码（CSPRNG，不用 Math.random）。 */
function newCode(): string {
  return String(randomInt(100000, 1000000));
}

export async function issueCode(
  type: IdentityType,
  identifier: string,
  purpose: Purpose,
): Promise<string> {
  const hash = identifierHash(type, identifier);
  // 同一 identifier + purpose 上"标记旧码已消费"（语义上等同于失效）。
  // 用 consumed_at 而不是 DELETE，是为了给 checkCode 的查询留下"已失效"的痕迹，
  //  用户拿到过期旧码时反馈"missing"而不是"wrong-code"（避免暴露"该手机号有新码"的边信道）。
  await db
    .update(codes)
    .set({ consumedAt: Date.now() })
    .where(
      and(
        eq(codes.identifierHash, hash),
        eq(codes.purpose, purpose),
        isNull(codes.consumedAt),
      ),
    );

  const plain = newCode();
  const now = Date.now();
  await db.insert(codes).values({
    id: newId(),
    identifierHash: hash,
    purpose,
    codeHash: await hashSecret(plain),
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    expiresAt: now + TTL_MS,
    consumedAt: null,
    createdAt: now,
  });
  return plain;
}

export type VerifyFailure = "missing" | "expired" | "too-many-attempts" | "wrong-code";

export type VerifyResult = { ok: true } | { ok: false; reason: VerifyFailure };

export async function checkCode(
  type: IdentityType,
  identifier: string,
  purpose: Purpose,
  input: string | undefined,
): Promise<VerifyResult> {
  if (!input) return { ok: false, reason: "missing" };
  const hash = identifierHash(type, identifier);
  const rows = await db
    .select()
    .from(codes)
    .where(
      and(
        eq(codes.identifierHash, hash),
        eq(codes.purpose, purpose),
        isNull(codes.consumedAt),
      ),
    );
  const c = rows[0];
  if (!c) return { ok: false, reason: "missing" };
  if (Date.now() > c.expiresAt) {
    await db.delete(codes).where(eq(codes.id, c.id));
    return { ok: false, reason: "expired" };
  }
  if (c.attempts >= c.maxAttempts) {
    await db.delete(codes).where(eq(codes.id, c.id));
    return { ok: false, reason: "too-many-attempts" };
  }
  // attempts++
  await db
    .update(codes)
    .set({ attempts: c.attempts + 1 })
    .where(eq(codes.id, c.id));
  const ok = await verifySecret(input, c.codeHash);
  if (!ok) return { ok: false, reason: "wrong-code" };
  // 一次性消费
  await db.delete(codes).where(eq(codes.id, c.id));
  return { ok: true };
}

/** 测试 / 后台 admin 调试用：列出当前活跃的某 purpose 验证码（仅 dev）。 */
export async function peekActiveCodesForTest(
  type: IdentityType,
  identifier: string,
  purpose: Purpose,
): Promise<number> {
  const hash = identifierHash(type, identifier);
  const rows = await db
    .select({ id: codes.id })
    .from(codes)
    .where(
      and(
        eq(codes.identifierHash, hash),
        eq(codes.purpose, purpose),
        isNull(codes.consumedAt),
      ),
    );
  return rows.length;
}

/** 清理过期 / 已消费 1h 以上的码。可放 setInterval；M2 先手跑。 */
export async function purgeExpiredCodes(): Promise<number> {
  const r = await db
    .delete(codes)
    .where(sql`${codes.expiresAt} < ${Date.now() - 60 * 60_000}`);
  return r.rowsAffected ?? 0;
}