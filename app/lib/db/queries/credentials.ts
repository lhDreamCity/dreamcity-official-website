import { and, eq } from "drizzle-orm";
import { db, schema } from "../client";
import { newId } from "../../ulid";
import { hashPassword, hashSecret } from "../../password";

const { credentials } = schema;

type CredentialKind = "password" | "sms_code" | "wechat_oauth";

/** 给 identity 挂一种登录方式（password / sms_code）。wechat_oauth 不存 secret。 */
export async function createCredential(input: {
  identityId: string;
  kind: CredentialKind;
  secret?: string; // 明文密码 / 验证码；wechat_oauth 不传
}): Promise<schema.Credential> {
  if (input.kind === "wechat_oauth") {
    throw new Error("wechat_oauth credentials must be created via createWechatCredential");
  }
  if (!input.secret) {
    throw new Error(`${input.kind} credential requires a secret`);
  }
  const now = Date.now();
  const hash =
    input.kind === "password" ? await hashPassword(input.secret) : await hashSecret(input.secret);
  const c: schema.NewCredential = {
    id: newId(),
    identityId: input.identityId,
    kind: input.kind,
    secretHash: hash,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(credentials).values(c);
  return (
    await db.select().from(credentials).where(eq(credentials.id, c.id))
  )[0]!;
}

/** 微信 OAuth 不存 secret，仅占位（标记已绑定）。 */
export async function createWechatCredential(input: {
  identityId: string;
}): Promise<schema.Credential> {
  const now = Date.now();
  const c: schema.NewCredential = {
    id: newId(),
    identityId: input.identityId,
    kind: "wechat_oauth",
    secretHash: null,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(credentials).values(c);
  return (
    await db.select().from(credentials).where(eq(credentials.id, c.id))
  )[0]!;
}

export async function findCredential(
  identityId: string,
  kind: CredentialKind,
): Promise<schema.Credential | null> {
  const rows = await db
    .select()
    .from(credentials)
    .where(and(eq(credentials.identityId, identityId), eq(credentials.kind, kind)));
  return rows[0] ?? null;
}

/** 失败次数 +1；达到上限时设锁定 15 分钟。 */
export async function recordFailedAttempt(id: string, max: number, lockMs: number): Promise<void> {
  const rows = await db.select().from(credentials).where(eq(credentials.id, id));
  const c = rows[0];
  if (!c) return;
  const next = c.failedAttempts + 1;
  const lockedUntil = next >= max ? Date.now() + lockMs : c.lockedUntil;
  await db
    .update(credentials)
    .set({ failedAttempts: next, lockedUntil, updatedAt: Date.now() })
    .where(eq(credentials.id, id));
}

export async function resetFailures(id: string): Promise<void> {
  await db
    .update(credentials)
    .set({ failedAttempts: 0, lockedUntil: null, updatedAt: Date.now() })
    .where(eq(credentials.id, id));
}

/** 是否被锁定（locked_until > now）。 */
export function isLocked(c: schema.Credential): boolean {
  return c.lockedUntil !== null && c.lockedUntil > Date.now();
}

/** 改密码：删旧 credential + 建新的。 */
export async function replaceCredentialSecret(
  identityId: string,
  kind: CredentialKind,
  newSecret: string,
): Promise<void> {
  const c = await findCredential(identityId, kind);
  if (!c) {
    await createCredential({ identityId, kind, secret: newSecret });
    return;
  }
  const newHash = kind === "password" ? await hashPassword(newSecret) : await hashSecret(newSecret);
  await db
    .update(credentials)
    .set({
      secretHash: newHash,
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: Date.now(),
    })
    .where(eq(credentials.id, c.id));
}