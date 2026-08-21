import type { MembershipStatus, RoleName } from "./types";

/* ============================================================
   Admin 后台演示数据（mock）
   接入 Supabase 后由真实表驱动（profiles / user_roles / subscriptions）
   ============================================================ */

export type AdminUserRow = {
  id: number;
  email: string;
  nickname: string;
  roles: RoleName[];
  membershipStatus: MembershipStatus;
  joinDate: string;
  lastActive: string;
};

/** 全站用户列表（演示） */
export const adminUsers: AdminUserRow[] = [
  {
    id: 1,
    email: "admin@dreamcity.ai",
    nickname: "超级管理员",
    roles: ["admin"],
    membershipStatus: "active",
    joinDate: "2026-01-15",
    lastActive: "刚刚",
  },
  {
    id: 2,
    email: "teacher@dreamcity.ai",
    nickname: "讲师·晓晨",
    roles: ["teacher", "member"],
    membershipStatus: "active",
    joinDate: "2026-02-03",
    lastActive: "2 小时前",
  },
  {
    id: 3,
    email: "editor@dreamcity.ai",
    nickname: "运营·小美",
    roles: ["editor", "member"],
    membershipStatus: "active",
    joinDate: "2026-03-11",
    lastActive: "昨天",
  },
  {
    id: 4,
    email: "alice@example.com",
    nickname: "爱丽丝",
    roles: ["member"],
    membershipStatus: "active",
    joinDate: "2026-04-20",
    lastActive: "3 天前",
  },
  {
    id: 5,
    email: "bob@example.com",
    nickname: "博博",
    roles: ["member"],
    membershipStatus: "expired",
    joinDate: "2026-05-02",
    lastActive: "2 周前",
  },
  {
    id: 6,
    email: "carol@example.com",
    nickname: "卡洛",
    roles: ["guest"],
    membershipStatus: "none",
    joinDate: "2026-06-18",
    lastActive: "1 个月前",
  },
];

/** 概览统计（演示） */
export const adminStats = {
  totalUsers: adminUsers.length,
  activeMembers: adminUsers.filter((u) => u.membershipStatus === "active").length,
  expiredMembers: adminUsers.filter((u) => u.membershipStatus === "expired").length,
  totalOrders: 128,
  revenue: 388260, // 元
  weeklyNewUsers: 23,
};
