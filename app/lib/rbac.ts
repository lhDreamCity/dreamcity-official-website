import type { PermissionCode, RoleName } from "./types";

/* ============================================================
   RBAC 角色 - 权限映射（单一事实来源）
   未来接入 Supabase 时，此表对应 role_permissions 表。
   开发期用静态数据，结构与线上一致，便于平滑迁移。
   ============================================================ */

/** 角色 → 权限集合 */
export const ROLE_PERMISSIONS: Record<RoleName, PermissionCode[]> = {
  /** 超级管理员：全站权限 */
  admin: [
    "course:view",
    "lesson:watch",
    "course:create",
    "course:edit",
    "lesson:manage",
    "content:publish",
    "user:manage",
    "role:manage",
    "member:manage",
    "analysis:view",
    "settings:manage",
  ],
  /** 讲师：管理课程内容 */
  teacher: [
    "course:view",
    "lesson:watch",
    "course:create",
    "course:edit",
    "lesson:manage",
    "content:publish",
    "analysis:view",
  ],
  /** 运营/编辑：内容与营销 */
  editor: [
    "course:view",
    "lesson:watch",
    "content:publish",
    "analysis:view",
  ],
  /** 登录学员：观看课程 */
  member: ["course:view", "lesson:watch"],
  /** 访客：仅看课程大纲 */
  guest: ["course:view"],
};

/** 角色中文名（界面展示） */
export const ROLE_LABELS: Record<RoleName, string> = {
  admin: "超级管理员",
  teacher: "讲师",
  editor: "运营/编辑",
  member: "登录学员",
  guest: "访客",
};

/** 权限点中文名（界面展示） */
export const PERMISSION_LABELS: Record<PermissionCode, string> = {
  "course:view": "查看课程",
  "lesson:watch": "观看课时",
  "course:create": "创建课程",
  "course:edit": "编辑课程",
  "lesson:manage": "管理课时",
  "content:publish": "发布内容",
  "user:manage": "用户管理",
  "role:manage": "角色管理",
  "member:manage": "学员管理",
  "analysis:view": "查看数据",
  "settings:manage": "站点配置",
};

/** 判断用户是否拥有某个角色 */
export function hasRole(roles: RoleName[], role: RoleName): boolean {
  return roles.includes(role);
}

/** 判断用户是否拥有任一角色（用于"允许列表"守卫） */
export function hasAnyRole(roles: RoleName[], allowed: RoleName[]): boolean {
  return roles.some((r) => allowed.includes(r));
}

/** 判断用户是否拥有某个权限点 */
export function hasPermission(
  permissions: PermissionCode[],
  perm: PermissionCode,
): boolean {
  return permissions.includes(perm);
}

/** 由角色集合展平出权限集合 */
export function resolvePermissions(roles: RoleName[]): PermissionCode[] {
  const set = new Set<PermissionCode>();
  for (const role of roles) {
    for (const perm of ROLE_PERMISSIONS[role]) {
      set.add(perm);
    }
  }
  return Array.from(set);
}

/** 全量角色列表（管理界面用） */
export const ALL_ROLES: RoleName[] = Object.keys(ROLE_PERMISSIONS) as RoleName[];

/** 全量权限列表（管理界面用） */
export const ALL_PERMISSIONS: PermissionCode[] = Object.keys(
  PERMISSION_LABELS,
) as PermissionCode[];
