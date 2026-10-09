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

/**
 * 为什么不缓存单例：tests/setupTestDb() 会改 DATABASE_URL 然后通过
 * `?t=<rand>` query string 强制重新 import 这个模块，每次拿到独立的 client。
 *
 * 生产环境：DATABASE_URL 不会变 → 多次 import 也会得到不同 client 对象，
 * 但每个 client 自己管理同一文件不冲突（libsql 内部用 advisory lock）。
 *
 * dev HMR：每次模块重载拿新连接，旧连接 GC 回收。libsql 的 close() 由 Node
 * 进程退出时自动触发；HMR 期间可能会有少量短暂泄漏，可接受。
 */

function buildHandle(url: string): { client: Client; db: LibSQLDatabase<typeof schema> } {
  if (url.startsWith("file:") && !url.includes(":memory:")) {
    const path = url.slice("file:".length);
    if (path.startsWith("./") || path.startsWith("/")) {
      const dir = dirname(path);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }

  const client = createClient({ url });

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

/**
 * 懒加载单例：每次访问 db / client 时检查 DATABASE_URL，变了就重建 handle。
 *
 * 为什么必须懒加载 + URL 变化检测：
 *   - 模块顶层不能直接 buildHandle()，因为测试里静态 import 这个模块时
 *     DATABASE_URL 还是空/默认；tests/setupTestDb() 之后才设成 tmp DB URL。
 *   - 不能缓存单例，因为测试每个文件切到一个新 tmp DB，URL 会变。
 *   - 生产环境 URL 永不变化 → 等价于"只 build 一次"，性能不受影响。
 */
let handle: { url: string; client: Client; db: LibSQLDatabase<typeof schema> } | null = null;

function getHandle() {
  const url = process.env.DATABASE_URL ?? "file:./data/dreamcity.db";
  if (!handle || handle.url !== url) {
    if (handle) {
      try { handle.client.close(); } catch {}
    }
    handle = { url, ...buildHandle(url) };
  }
  return handle;
}

/** 测试 helper：关闭当前 handle 并清缓存,迫使下次访问按当前 DATABASE_URL 重建。 */
export function _resetForTest() {
  if (handle) {
    try { handle.client.close(); } catch {}
    handle = null;
  }
}

/**
 * Proxy 转发：让 `db.X(...)` 在调用时才去 getHandle()。这样静态 import 这个模块的代码
 * (例如 verify.ts → queries/codes.ts → client.ts) 拿到的 db / client 永远指向
 * 当前 DATABASE_URL 对应的 handle，不用关心谁先 import 谁后改 env。
 *
 * 函数必须 bind 到真实 target ——@libsql 内部用 `instanceof Sqlite3Client` 校验 receiver,
 * 直接返回方法会丢失 `this`,触发 "Receiver must be an instance of class Sqlite3Client"。
 */
function makeProxy<T extends object>(getTarget: () => T): T {
  return new Proxy({} as T, {
    get(_t, prop) {
      const target = getTarget() as unknown as Record<PropertyKey, unknown>;
      const val = target[prop];
      return typeof val === "function" ? (val as (...a: unknown[]) => unknown).bind(target) : val;
    },
    has(_t, prop) {
      return prop in (getTarget() as object);
    },
  });
}

export const client = makeProxy(() => getHandle().client);
export const db = makeProxy(() => getHandle().db);

export { schema };