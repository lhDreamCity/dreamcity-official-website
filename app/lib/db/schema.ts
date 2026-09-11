/**
 * DreamCity Web — Drizzle schema (SQLite via @libsql/client)
 *
 * 迁移策略：每张表 / 每个变更对应一个 SQL 文件，由 drizzle-kit 生成到 ./drizzle/，
 * 通过 scripts/db-migrate.ts 应用。所有表都有 created_at / updated_at（unix ms）。
 *
 * M2 起落地的表：
 *   - identities    : 用户绑定的身份凭证（手机号 / 邮箱 / 微信 OpenID）
 *   - credentials   : 登录方式（短信验证码 / 密码）
 *   - user_roles    : 用户↔角色 多对多
 *   - sessions      : 服务端会话（用于主动撤销 + 多端管理）
 *   - verification_codes : 验证码（替代 in-memory 的 verify.ts）
 *
 * 设计原则：
 *   - identifier 加密存 + identifier_hash HMAC 做查找键（库泄漏时不可反查）
 *   - password / code 用 bcrypt hash 存
 *   - session 是 32 字节随机串，cookie 只存 sid，不存用户信息
 */

import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

/* ------------------------------------------------------------
 * users — 用户主体
 * ------------------------------------------------------------ */
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // ULID
    nickname: text("nickname").notNull(),
    avatarUrl: text("avatar_url"),
    status: text("status", { enum: ["active", "disabled", "deleted"] })
      .notNull()
      .default("active"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    lastActiveAt: integer("last_active_at"),
  },
  (t) => ({
    statusIdx: index("idx_users_status").on(t.status),
  }),
);

/* ------------------------------------------------------------
 * identities — 身份凭证（手机号 / 邮箱 / 微信 OpenID）
 *
 * 一个 user 可绑定多个 identity（例如同时绑手机号和邮箱）。
 * 同类型同 identifier 唯一（防重复注册）。
 *
 *   identifier      加密存储，admin 后台解密展示用（基础课阶段不展示，仅保留能力）
 *   identifier_hash HMAC 查找键，库泄漏时不可反查
 *   verified_at     验证时间，NULL = 未验证
 * ------------------------------------------------------------ */
export const identities = sqliteTable(
  "identities",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["phone", "email", "wechat_openid"] }).notNull(),
    identifier: text("identifier").notNull(), // AES-GCM 密文（M5 启用，目前原文）
    identifierHash: text("identifier_hash").notNull(), // HMAC-SHA256 hex
    verifiedAt: integer("verified_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    typeHashIdx: uniqueIndex("uniq_identities_type_hash").on(t.type, t.identifierHash),
    userIdx: index("idx_identities_user").on(t.userId),
  }),
);

/* ------------------------------------------------------------
 * credentials — 登录方式
 *
 * 一个 identity 可挂多种 credentials：比如同一手机号既能短信登录也能密码登录。
 *
 *   kind            'password' | 'sms_code' | 'wechat_oauth'
 *   secret_hash     bcrypt hash（仅 password / sms_code 用；wechat_oauth 不存 secret）
 *   failed_attempts 登录失败计数，达到上限写 locked_until
 * ------------------------------------------------------------ */
export const credentials = sqliteTable(
  "credentials",
  {
    id: text("id").primaryKey(),
    identityId: text("identity_id")
      .notNull()
      .references(() => identities.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["password", "sms_code", "wechat_oauth"] }).notNull(),
    secretHash: text("secret_hash"), // bcrypt；null 表示 wechat_oauth（无密码）
    failedAttempts: integer("failed_attempts").notNull().default(0),
    lockedUntil: integer("locked_until"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => ({
    identityKindIdx: uniqueIndex("uniq_credentials_identity_kind").on(t.identityId, t.kind),
    identityIdx: index("idx_credentials_identity").on(t.identityId),
  }),
);

/* ------------------------------------------------------------
 * user_roles — 用户↔角色 多对多
 *
 * 角色由 rbac.ts 解析；该表只做存储。granted_by 记录授权人（admin 操作员 user_id）。
 * ------------------------------------------------------------ */
export const userRoles = sqliteTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["admin", "teacher", "editor", "member"] }).notNull(),
    grantedBy: text("granted_by"),
    grantedAt: integer("granted_at").notNull(),
  },
  (t) => ({
    pkIdx: uniqueIndex("pk_user_roles").on(t.userId, t.role),
    roleIdx: index("idx_user_roles_role").on(t.role),
  }),
);

/* ------------------------------------------------------------
 * sessions — 服务端会话
 *
 * cookie 里只存 sid（32字节 base64url）；user_id / expires_at / 撤销都查这张表。
 *
 *   revoked_at   NULL = 有效；非 NULL = 已撤销（主动登出 / 踢人 / 改密后全踢）
 *   expires_at   30 天过期；每次访问刷新 last_seen_at
 *
 * 单进程 libsql：DELETE 撤销 + UPDATE 滑动过期都极快。
 * 多实例部署时换 Redis SETEX 即可，schema 兼容。
 * ------------------------------------------------------------ */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    ip: text("ip"),
    createdAt: integer("created_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
    revokedAt: integer("revoked_at"),
  },
  (t) => ({
    userIdx: index("idx_sessions_user").on(t.userId),
    expiresIdx: index("idx_sessions_expires").on(t.expiresAt),
  }),
);

/* ------------------------------------------------------------
 * verification_codes — 验证码（短信 / 邮箱 / 改密等）
 *
 * 替代旧的 in-memory Map<phone, Code>。
 *
 *   identifier_hash   HMAC(phone/email)，库泄漏时不可反查
 *   purpose           'login' | 'register' | 'reset_password' | 'bind_phone'
 *   code_hash         bcrypt(code)；库不存明文，连日志都不打
 *   attempts          已尝试次数（含错误）；达 max_attempts 自动失效
 *   consumed_at       验证成功时间；issueCode 发新码时把旧码也标 consumed_at
 *
 * ------------------------------------------------------------ */
export const verificationCodes = sqliteTable(
  "verification_codes",
  {
    id: text("id").primaryKey(),
    identifierHash: text("identifier_hash").notNull(),
    purpose: text("purpose", {
      enum: ["login", "register", "reset_password", "bind_phone"],
    }).notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    expiresAt: integer("expires_at").notNull(),
    consumedAt: integer("consumed_at"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => ({
    lookupIdx: index("idx_codes_lookup").on(
      t.identifierHash,
      t.purpose,
      t.consumedAt,
      t.expiresAt,
    ),
    expiresIdx: index("idx_codes_expires").on(t.expiresAt),
  }),
);

/* 方便外部 import：所有表的类型化行 + 插入类型 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Identity = typeof identities.$inferSelect;
export type NewIdentity = typeof identities.$inferInsert;
export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type NewVerificationCode = typeof verificationCodes.$inferInsert;

/* 防止 ts 报未使用：sql 留个口子以后 raw query 用 */
export const _sql = sql;