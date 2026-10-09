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
 * 通过设置 DATABASE_URL + 调用 client._resetForTest() 让所有走
 * app/lib/db/client.ts 的 queries 路由到这份临时 DB。setupTestDb
 * 之后的测试调用 createUser / createIdentity 等都自动落到独立 DB。
 */
export async function setupTestDb(): Promise<TestDb> {
  const dir = mkdtempSync(join(tmpdir(), "dreamcity-test-"));
  const file = join(dir, "test.db");
  process.env.DATABASE_URL = `file:${file}`;

  // 关闭并清空 client.ts 缓存的 handle,让下一次访问按新 DATABASE_URL 重建。
  // 不需要再依赖动态 import + ?t=... 的 cache-busting (Windows / Linux 行为不一致)。
  const { _resetForTest, db, client } = await import("../../app/lib/db/client.ts");
  _resetForTest();

  // 在新 DB 上跑 migration
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  migrate(db, { migrationsFolder: "./drizzle" });

  return {
    client,
    db,
    cleanup: () => client.close(),
  };
}