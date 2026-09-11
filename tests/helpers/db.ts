import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../app/lib/db/schema.ts";

// 测试环境必填的 env。IDENTIFIER_HASH_SECRET >= 32 字符。
//   在 import 阶段提前注入（verify.ts / identifier-hash.ts 在模块顶层就校验）。
if (!process.env.IDENTIFIER_HASH_SECRET && !process.env.SESSION_SECRET) {
  process.env.IDENTIFIER_HASH_SECRET =
    "test-identifier-hash-secret-do-not-use-in-prod-32+";
}

export type TestDb = {
  client: Client;
  db: LibSQLDatabase<typeof schema>;
  cleanup: () => void;
};

/**
 * 每个测试文件用一份新的 temp file DB + 跑 migration。
 *
 * 通过设置 DATABASE_URL + 让 client.ts 重新初始化 handle，让所有走
 * app/lib/db/client.ts 的 queries 路由到这份临时 DB。这样 setupTestDb
 * 之后的测试调用 createUser / createIdentity 等都自动落到独立 DB。
 *
 * 注意：因为 libsql client 缓存了 prepared statements / 连接，必须
 * 在切 URL 时把 client.ts 的缓存清掉。这里用动态 import + 删除模块缓存
 * 强制重新初始化。
 */
export async function setupTestDb(): Promise<TestDb> {
  const dir = mkdtempSync(join(tmpdir(), "dreamcity-test-"));
  const file = join(dir, "test.db");
  process.env.DATABASE_URL = `file:${file}`;

  // 强制重新初始化 app/lib/db/client.ts 模块，让它读新的 DATABASE_URL
  // 并拿到全新的 client。tsx/Node 模块缓存通过 query string 区分。
  const url = `file:///${file}?t=${Date.now()}-${Math.random()}`;
  const { db, client, schema } = await import(
    `../../app/lib/db/client.ts?${Date.now()}`
  );

  // 在新 URL 上跑 migration
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  migrate(db, { migrationsFolder: "./drizzle" });

  return {
    client,
    db,
    cleanup: () => client.close(),
  };
}