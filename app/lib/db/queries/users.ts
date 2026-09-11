import { and, eq } from "drizzle-orm";
import { db, schema } from "../client";
import { newId } from "../../ulid";

const { users } = schema;

export async function createUser(input: { nickname: string }): Promise<schema.User> {
  const now = Date.now();
  const u: schema.NewUser = {
    id: newId(),
    nickname: input.nickname,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(users).values(u);
  return (await db.select().from(users).where(eq(users.id, u.id)))[0]!;
}

export async function getUserById(id: string): Promise<schema.User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0] ?? null;
}

/** 用户名变更（profile / admin 后台改）。M2 暂用。 */
export async function updateUserNickname(id: string, nickname: string): Promise<void> {
  await db
    .update(users)
    .set({ nickname, updatedAt: Date.now() })
    .where(eq(users.id, id));
}

/** 更新最后活跃时间（每次请求命中 session 时）。调用方负责节流（避免每请求都写）。 */
export async function touchUserActive(id: string): Promise<void> {
  await db.update(users).set({ lastActiveAt: Date.now() }).where(eq(users.id, id));
}