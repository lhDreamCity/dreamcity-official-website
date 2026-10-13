import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema, client } from "../client";
import { newId } from "../../ulid";

const { users, identities, userRoles } = schema;

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

/* ============================================================
   Admin 后台用户列表（Item 2 接入）
   ============================================================ */

export type AdminUserWithRoles = schema.User & {
  roles: string[];
  primaryIdentifier: string | null;
};

/** 全量用户 + 角色 + 第一个 phone/email identity。
 *  N+1（每用户 2 个子查询）：admin 后台列表场景，N 远小于线上用户量，可接受。
 *  未来上千用户再考虑 JOIN 一次性拿。
 */
export async function listUsersWithRoles(): Promise<AdminUserWithRoles[]> {
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  return Promise.all(
    allUsers.map(async (u) => {
      const [idRow, roleRows] = await Promise.all([
        db
          .select({ identifier: identities.identifier })
          .from(identities)
          .where(
            and(
              eq(identities.userId, u.id),
              inArray(identities.type, ["phone", "email"]),
            ),
          )
          .limit(1),
        db
          .select({ role: userRoles.role })
          .from(userRoles)
          .where(eq(userRoles.userId, u.id)),
      ]);
      return {
        ...u,
        roles: roleRows.map((r) => r.role),
        primaryIdentifier: idRow[0]?.identifier ?? null,
      };
    }),
  );
}

/** 按 status 计数。deleted 不计入"有效"，但 admin 仪表盘会单独显示。 */
export async function countUsersByStatus(): Promise<Record<string, number>> {
  const r = await client.execute(
    "SELECT status, COUNT(*) AS n FROM users GROUP BY status",
  );
  const counts: Record<string, number> = {};
  for (const row of r.rows) {
    counts[row.status as string] = Number(row.n);
  }
  return counts;
}

/** 指定时间戳以来新注册用户数。 */
export async function countNewUsersSince(tsMs: number): Promise<number> {
  const r = await client.execute({
    sql: "SELECT COUNT(*) AS n FROM users WHERE created_at >= ?",
    args: [tsMs],
  });
  return Number(r.rows[0]?.n ?? 0);
}