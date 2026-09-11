export type Course = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  price: number | null;
  duration: string;
  level: string;
  status: "published" | "draft";
  lessons: Lesson[];
};

export type Lesson = {
  id: number;
  title: string;
  sort: number;
  videoUrl: string | null;
  duration: string;
  summary: string;
  resourceUrl?: string | null;
};

export type MembershipStatus = "none" | "active" | "expired";

/* ============================================================
   RBAC 模型
   ============================================================ */

/** 系统内角色 */
export type RoleName =
  | "admin" // 超级管理员：全站权限
  | "teacher" // 讲师：管理课程内容
  | "editor" // 运营/编辑：内容与营销
  | "member" // 登录学员：观看课程
  | "guest"; // 访客：未登录

/** 权限点编码（resource:action） */
export type PermissionCode =
  | "course:view" // 查看课程大纲
  | "lesson:watch" // 观看课时（登录学员）
  | "course:create" // 创建课程
  | "course:edit" // 编辑课程
  | "lesson:manage" // 管理课时/视频
  | "content:publish" // 发布内容
  | "user:manage" // 用户管理
  | "role:manage" // 角色管理
  | "member:manage" // 会员管理
  | "analysis:view" // 查看数据
  | "settings:manage"; // 站点配置

export type User = {
  id: string; // ULID
  email: string;
  nickname: string;
  isMember: boolean;
  membershipStatus: MembershipStatus;
  /** RBAC 角色列表（一个用户可有多个角色） */
  roles: RoleName[];
  /** 展平的权限点集合（由角色派生） */
  permissions: PermissionCode[];
};
