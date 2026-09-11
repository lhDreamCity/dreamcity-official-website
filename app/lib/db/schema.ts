/**
 * DreamCity Web — Drizzle schema (SQLite via @libsql/client)
 *
 * 迁移策略：每张表 / 每个变更对应一个 SQL 文件，由 drizzle-kit 生成到 ./drizzle/，
 * 通过 scripts/db-migrate.ts 应用。所有表都有 created_at / updated_at（unix ms）。
 *
 * M1 试水：仅 users 一张表。M2 起逐步加 identities / credentials / sessions / codes /
 *         user_roles / audit_log。
 */

import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

/* ------------------------------------------------------------
 * users — 用户主体
 *
 * 一个 user 可关联多个 identities (手机号 / 邮箱 / 微信 OpenID)。
 * 当前 M1 只放最基础字段，M2 起加 status / last_active_at 等。
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
  (t) => [index("idx_users_status").on(t.status)],
);

/* 方便外部 import：所有表的类型化行 + 插入类型 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/* 防止 ts 报未使用：sql 留个口子以后 raw query 用 */
export const _sql = sql;
