/**
 * 跑 drizzle 生成的 SQL migration。
 *
 * 用法：
 *   npm run db:migrate                # 跑 ./drizzle 全部未应用的 migration
 *   DATABASE_URL=":memory:" npm run db:migrate   # 测试用
 *
 * 由 docker-compose entrypoint 在容器启动时调用，保证 schema 与镜像版本对齐。
 */

import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../app/lib/db/client";

console.log("[db-migrate] applying migrations…");
const start = Date.now();
migrate(db, { migrationsFolder: "./drizzle" });
console.log(`[db-migrate] done in ${Date.now() - start}ms`);