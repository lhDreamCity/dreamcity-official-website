/**
 * DreamCity DB 单例。
 *
 * 为什么不每次 new：
 *   - @libsql/client 每次 createClient 都打开 SQLite 文件 + 建 connection pool，
 *     Next.js dev HMR 会反复执行模块顶层代码 → 泄漏连接 / 锁文件。
 *   - 用 globalThis 缓存，dev HMR 重载时复用同一 client。
 *
 * 路径约定：
 *   - DATABASE_URL="file:./data/dreamcity.db"（默认；dev 用）
 *   - docker-compose / 生产设为 "file:/data/dreamcity.db"（挂在 named volume）
 *   - 单元测试可设 ":memory:" （每个进程独立内存 DB）
 *
 * WAL：开启 journal_mode=WAL 让读写不互斥；并发性 + 抗崩溃都更好。
 * busy_timeout：写入冲突时等 5s 再 fail，比默认的瞬时 fail 友好。
 */

import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";

type DbHandle = {
  client: Client;
  db: LibSQLDatabase<typeof schema>;
};

const globalForDb = globalThis as unknown as {
  __dreamcity_db__?: DbHandle;
};

function makeHandle(): DbHandle {
  const url = process.env.DATABASE_URL ?? "file:./data/dreamcity.db";

  // dev 模式自动确保目录存在；prod 由 docker-compose 准备
  if (url.startsWith("file:") && !url.includes(":memory:")) {
    const path = url.slice("file:".length);
    if (path.startsWith("./") || path.startsWith("/")) {
      const dir = dirname(path);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }

  const client = createClient({ url });

  // WAL + busy_timeout 用 raw SQL 设，逐条 execute（避开 batch 的事务包裹，
  // 因为 PRAGMA journal_mode 不能在事务里改）。
  // synchronous / foreign_keys / busy_timeout 都不是事务敏感的，但仍逐条更稳。
  for (const stmt of [
    "PRAGMA journal_mode = WAL",
    "PRAGMA synchronous = NORMAL",
    "PRAGMA foreign_keys = ON",
    "PRAGMA busy_timeout = 5000",
  ]) {
    client.execute(stmt);
  }

  const db = drizzle(client, { schema });
  return { client, db };
}

const handle = globalForDb.__dreamcity_db__ ?? makeHandle();
if (process.env.NODE_ENV !== "production") {
  globalForDb.__dreamcity_db__ = handle;
}

export const db = handle.db;
export const client = handle.client;
export { schema };