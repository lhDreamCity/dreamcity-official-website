import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "../client";
import { newId } from "../../ulid";
import { randomBytes } from "node:crypto";

const { sessions } = schema;

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60_000; // 30 天

/** 生成 32 字节随机 sid，base64url 编码后 43 字符。 */
function newSid(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(input: {
  userId: string;
  userAgent?: string | null;
  ip?: string | null;
  ttlMs?: number;
}): Promise<schema.Session> {
  const now = Date.now();
  const ttl = input.ttlMs ?? DEFAULT_TTL_MS;
  const s: schema.NewSession = {
    id: newSid(),
    userId: input.userId,
    userAgent: input.userAgent ?? null,
    ip: input.ip ?? null,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: now + ttl,
    revokedAt: null,
  };
  await db.insert(sessions).values(s);
  return (await db.select().from(sessions).where(eq(sessions.id, s.id)))[0]!;
}

/** 验证并滑动：返回有效 session 或 null（不存在 / 过期 / 已撤销）。同时刷新 last_seen。 */
export async function getActiveSession(sid: string): Promise<schema.Session | null> {
  const rows = await db.select().from(sessions).where(eq(sessions.id, sid));
  const s = rows[0];
  if (!s) return null;
  if (s.revokedAt !== null) return null;
  if (Date.now() > s.expiresAt) return null;
  // 滑动（10 分钟内不重复写，避免每请求都写库）
  if (Date.now() - s.lastSeenAt > 10 * 60_000) {
    await db.update(sessions).set({ lastSeenAt: Date.now() }).where(eq(sessions.id, sid));
  }
  return s;
}

/** 主动撤销一个 session（登出 / 踢单个设备）。 */
export async function revokeSession(sid: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: Date.now() })
    .where(and(eq(sessions.id, sid), isNull(sessions.revokedAt)));
}

/** 撤销某 user 的所有未过期 session（改密后全踢 / 封号 / "踢出所有设备"）。 */
export async function revokeAllSessionsForUser(userId: string): Promise<number> {
  const r = await db
    .update(sessions)
    .set({ revokedAt: Date.now() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  return r.rowsAffected ?? 0;
}

/** 列出某 user 活跃 session（前端"我的设备"页用）。 */
export async function listActiveSessionsForUser(userId: string): Promise<schema.Session[]> {
  return db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        isNull(sessions.revokedAt),
        sql`${sessions.expiresAt} > ${Date.now()}`,
      ),
    );
}

/** 清理已撤销 / 过期 30 天以上的 session。M2 先手跑；M5 接 cleanup job。 */
export async function purgeOldSessions(): Promise<number> {
  const r = await db
    .delete(sessions)
    .where(
      sql`(${sessions.revokedAt} IS NOT NULL AND ${sessions.revokedAt} < ${Date.now() - 30 * 24 * 60 * 60_000})
        OR ${sessions.expiresAt} < ${Date.now() - 30 * 24 * 60 * 60_000}`,
    );
  return r.rowsAffected ?? 0;
}