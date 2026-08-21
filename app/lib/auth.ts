import { cookies } from "next/headers";
import type { RoleName, User } from "./types";
import { resolvePermissions } from "./rbac";

/* ============================================================
   认证与会话（Supabase 占位）
   当前使用 cookie 标记模拟用户，未接真实 Supabase Auth。
   上线时替换为 Supabase 的 getUser() 即可，调用签名保持一致。

   开发期角色模拟：通过 dcw_role cookie 指定角色，
   例如 dcw_role=admin 模拟超级管理员。
   ============================================================ */

export const USER_COOKIE = "dcw_user";
export const MEMBER_COOKIE = "dcw_member";
export const ROLE_COOKIE = "dcw_role";

/** 允许通过 cookie 模拟的角色（仅开发期） */
const SIMULATED_ROLES: RoleName[] = ["admin", "teacher", "editor", "member"];

/**
 * 读取当前用户（占位）。Supabase 接入后替换为：
 *   const supabase = createClient();
 *   const { data } = await supabase.auth.getUser();
 */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;

  const isMember = store.get(MEMBER_COOKIE)?.value === "1";

  // 角色：dcw_role cookie 模拟，缺省时按会员/非会员推导
  const roleCookie = store.get(ROLE_COOKIE)?.value as RoleName | undefined;
  let roles: RoleName[];
  if (roleCookie && SIMULATED_ROLES.includes(roleCookie)) {
    roles = [roleCookie];
  } else {
    roles = isMember ? ["member"] : ["guest"];
  }

  // 展平权限
  const permissions = resolvePermissions(roles);

  return {
    id: 1,
    email: raw,
    nickname: roles.includes("admin") ? "管理员" : "学员",
    isMember: isMember || roles.includes("member"),
    membershipStatus: isMember ? "active" : roles.includes("member") ? "active" : "none",
    roles,
    permissions,
  };
}
