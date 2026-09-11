import { cookies } from "next/headers";
import type { RoleName, User } from "./types";
import { resolvePermissions } from "./rbac";
import { getActiveSession } from "./db/queries/sessions";
import { listRolesForUser } from "./db/queries/roles";
import { getUserById } from "./db/queries/users";

/* ============================================================
   认证与会话

   设计（从 M1 → M2 起更换）：
   - cookie 名：dcw_sid（替换旧的 dcw_user / dcw_member / dcw_role 三个 cookie）
   - cookie 值：32 字节 base64url 随机 sid（见 queries/sessions.ts）
   - 服务端：DB sessions 表查 sid → user_id → users + user_roles → User 对象
   - 用户主动改密 / 主动踢出 / 撤销 → 写 sessions.revoked_at
   - 多端登录：同一用户多个 sid 并存，互不干扰

   兼容性：M2 阶段保留旧 cookie 名读取能力，但写时只用新名。下个里程碑
   （M3 login 改造完成后）彻底删除旧 cookie。
   ============================================================ */

export const SESSION_COOKIE = "dcw_sid";
export const OLD_USER_COOKIE = "dcw_user";
export const OLD_MEMBER_COOKIE = "dcw_member";
export const OLD_ROLE_COOKIE = "dcw_role";

const ALLOWED_ROLES: RoleName[] = ["admin", "teacher", "editor", "member"];

const COOKIE_BASE_OPTS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
};

/** 写 session cookie 时统一用这套 opts。 */
export const SESSION_COOKIE_OPTS = {
  ...COOKIE_BASE_OPTS,
  secure: process.env.NODE_ENV === "production",
};

/**
 * 读 sid cookie，返回原始值。
 * 不做签名 / 不做 HMAC：sid 本身就是 32 字节随机数，安全等价于一个长 secret。
 */
export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * 解析当前请求的用户。
 * 返回 null：未登录 / sid 无效 / sid 过期 / sid 已撤销 / user 已 disabled。
 *
 * 注意：这里承担了"每次请求 → DB 查 session + user + roles"的开销。
 * libsql 单文件场景下 <5ms；多实例时换 Redis，结构兼容。
 */
export async function getCurrentUser(): Promise<User | null> {
  const sid = await readSessionCookie();
  if (!sid) return null;
  const session = await getActiveSession(sid);
  if (!session) return null;
  const user = await getUserById(session.userId);
  if (!user || user.status !== "active") return null;
  const dbRoles = await listRolesForUser(session.userId);
  // 没显式角色则视为 member（注册时默认）；显式 guest 角色才记 guest。
  const roles: RoleName[] =
    dbRoles.length > 0
      ? (dbRoles.filter((r) => (ALLOWED_ROLES as string[]).includes(r)) as RoleName[])
      : ["member"];

  const permissions = resolvePermissions(roles);
  return {
    id: user.id,
    email: "", // M2 暂留空；后续可加 email identity 展示
    nickname: user.nickname,
    isMember: true,
    membershipStatus: "active",
    roles,
    permissions,
  };
}

/**
 * 已废弃：保留旧签名避免外部调用破坏。M3 后删除。
 * 等价于 getCurrentUser 的旧版实现（基于 dcw_user cookie）。
 */
export async function readSignedCookie(name: string): Promise<string | null> {
  const store = await cookies();
  return store.get(name)?.value ?? null;
}
export async function signedCookieValue(payload: string): Promise<string> {
  return payload; // M2 阶段：旧 cookie 路径已废
}