import { cookies } from "next/headers";
import type { RoleName, User } from "./types";
import { resolvePermissions } from "./rbac";
import { signValue, verifyValue } from "./session-secret";

/* ============================================================
   认证与会话
   会话通过 httpOnly Cookie 维护，登录后写入用户标识与角色。
   Cookie 值经过 HMAC-SHA256 签名（见 session-secret.ts），
   客户端无法篡改角色来绕过权限检查。
   ============================================================ */

export const USER_COOKIE = "dcw_user";
export const MEMBER_COOKIE = "dcw_member";
export const ROLE_COOKIE = "dcw_role";

const ALLOWED_ROLES: RoleName[] = ["admin", "teacher", "editor", "member"];

const COOKIE_BASE_OPTS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
};

/** Read and verify one of our signed cookies. Returns the payload or null. */
export async function readSignedCookie(name: string): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(name)?.value;
  return verifyValue(raw);
}

/**
 * Build a signed cookie value (HMAC over payload). Use this in route handlers
 * before passing to cookies().set().
 */
export async function signedCookieValue(payload: string): Promise<string> {
  return signValue(payload);
}

/**
 * Read the current user. Returns null if not logged in or if the session
 * cookie is tampered / unsigned / from a stale secret.
 */
export async function getCurrentUser(): Promise<User | null> {
  const user = await readSignedCookie(USER_COOKIE);
  if (!user) return null;

  const memberRaw = await readSignedCookie(MEMBER_COOKIE);
  const isMember = memberRaw === "1";

  const roleRaw = await readSignedCookie(ROLE_COOKIE);
  let roles: RoleName[];
  if (roleRaw && (ALLOWED_ROLES as string[]).includes(roleRaw)) {
    roles = [roleRaw as RoleName];
  } else {
    roles = isMember ? ["member"] : ["guest"];
  }

  const permissions = resolvePermissions(roles);

  return {
    id: 1,
    email: user,
    nickname: roles.includes("admin") ? "管理员" : "学员",
    isMember: isMember || roles.includes("member"),
    membershipStatus: isMember || roles.includes("member") ? "active" : "none",
    roles,
    permissions,
  };
}

/** Standard cookie options used when writing session cookies in API routes. */
export const SESSION_COOKIE_OPTS = {
  ...COOKIE_BASE_OPTS,
  secure: process.env.NODE_ENV === "production",
};