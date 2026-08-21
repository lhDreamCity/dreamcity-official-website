import { redirect, notFound } from "next/navigation";
import type { PermissionCode, RoleName, User } from "./types";
import { getCurrentUser } from "./auth";
import { hasAnyRole, hasPermission } from "./rbac";

/* ============================================================
   服务端权限守卫
   在服务端组件 / Server Action 中调用，保护页面与接口。

   用法（页面顶层）：
     const user = await requireAuth();            // 需登录
     const user = await requireRole("admin");     // 需指定角色
     const user = await requirePermission("lesson:watch"); // 需权限
   ============================================================ */

const LOGIN_URL = "/login";
const FORBIDDEN_URL = "/forbidden"; // 403 页面

/** 需要登录；未登录跳登录页 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_URL);
  return user;
}

/** 需要任一指定角色；无则跳 403 */
export async function requireRole(
  ...allowed: RoleName[]
): Promise<User> {
  const user = await requireAuth();
  if (!hasAnyRole(user.roles, allowed)) redirect(FORBIDDEN_URL);
  return user;
}

/** 需要某个权限点；无则跳 403 */
export async function requirePermission(
  permission: PermissionCode,
): Promise<User> {
  const user = await requireAuth();
  if (!hasPermission(user.permissions, permission)) redirect(FORBIDDEN_URL);
  return user;
}

/** 可选用户：不强制登录，返回 user 或 null（供前台页面用） */
export async function optionalUser(): Promise<User | null> {
  return getCurrentUser();
}

/** 需要某个权限点；无权限返回 null（供 Server Action 内判空） */
export async function can(permission: PermissionCode): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return hasPermission(user.permissions, permission);
}

/** 需要某个权限点；无权限返回 404（隐藏敏感资源） */
export async function requirePermissionHidden(
  permission: PermissionCode,
): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.permissions, permission)) notFound();
  return user;
}
