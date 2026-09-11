/**
 * 测试 helper：每个测试文件用一份新的内存 DB（含 migration）。
 *
 * 用法：
 *   import { setupTestDb } from "./helpers/db";
 *   const { db, client } = await setupTestDb();
 *
 * 内部实现：
 *   - 新建临时文件（每个测试独立），不走 :memory: 因为 libsql 的 WAL + :memory: + drizzle
 *     migrator 在并发场景下有过坑；用 temp file + 跑 migration 最稳。
 *   - migrate 来自 drizzle-orm/libsql/migrator。
 */

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../app/lib/db/schema.ts";

export type TestDb = {
  client: Client;
  db: LibSQLDatabase<typeof schema>;
  cleanup: () => void;
};

export async function setupTestDb(): Promise<TestDb> {
  const dir = mkdtempSync(join(tmpdir(), "dreamcity-test-"));
  const file = join(dir, "test.db");
  const client = createClient({ url: `file:${file}` });
  const db = drizzle(client, { schema });
  migrate(db, { migrationsFolder: "./drizzle" });
  return {
    client,
    db,
    cleanup: () => client.close(),
  };
}
