import type { RoleName } from "./types";
import {
  listUsersWithRoles,
  countUsersByStatus,
  countNewUsersSince,
  type AdminUserWithRoles,
} from "./db/queries/users";

/* ============================================================
   Admin 后台数据源（Item 2 改造：改读 DB）

   - 旧的 adminUsers / adminStats 是写死的 mock；现在从 users + identities +
     user_roles 表拉真实数据。
   - 字段重塑：email 改为 primaryIdentifier（手机号 / 邮箱，库里就有的），
     membershipStatus 改为 status（active / disabled / deleted）。
   - 旧的"会员状态 / 订单 / 营收"是 6888 付费会员制遗物，README 已说明该模型
     下线，所以 AdminStats 不再含 totalOrders / revenue。
   ============================================================ */

export type AdminUserRow = {
  id: string;
  primaryIdentifier: string;
  nickname: string;
  roles: RoleName[];
  status: "active" | "disabled" | "deleted";
  joinDate: string;
  lastActive: string;
};

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  deletedUsers: number;
  weeklyNewUsers: number;
};

function formatDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatRelative(ms: number | null): string {
  if (ms == null) return "—";
  const diff = Date.now() - ms;
  if (diff < 0) return "刚刚";
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} 个月前`;
  return `${Math.floor(mo / 12)} 年前`;
}

function toAdminRow(u: AdminUserWithRoles): AdminUserRow {
  // 无显式角色视为 member（与 auth.ts getCurrentUser 行为一致）。
  const roles = (u.roles.length > 0 ? u.roles : ["member"]) as RoleName[];
  return {
    id: u.id,
    primaryIdentifier: u.primaryIdentifier ?? "—",
    nickname: u.nickname,
    roles,
    status: u.status,
    joinDate: formatDate(u.createdAt),
    lastActive: formatRelative(u.lastActiveAt),
  };
}

export async function loadAdminUsers(): Promise<AdminUserRow[]> {
  const rows = await listUsersWithRoles();
  return rows.map(toAdminRow);
}

export async function loadAdminStats(): Promise<AdminStats> {
  const [byStatus, weeklyNew] = await Promise.all([
    countUsersByStatus(),
    countNewUsersSince(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ]);
  return {
    totalUsers: (byStatus.active ?? 0) + (byStatus.disabled ?? 0) + (byStatus.deleted ?? 0),
    activeUsers: byStatus.active ?? 0,
    disabledUsers: byStatus.disabled ?? 0,
    deletedUsers: byStatus.deleted ?? 0,
    weeklyNewUsers: weeklyNew,
  };
}
