/**
 * M1 验收：DB client 单例 + users 表读写。
 *
 * 跑法：npm test （自动用 tests/helpers/db.ts 创建临时文件 DB + 跑 migration）
 */

import { test, before as testBefore } from "node:test";
import assert from "node:assert/strict";
import { ulid } from "ulid";
import { eq } from "drizzle-orm";
import { schema } from "../app/lib/db/client";
import { setupTestDb, type TestDb } from "./helpers/db";

const { users } = schema;

let ctx: TestDb;

test("setup: fresh test DB with schema", async () => {
  ctx = await setupTestDb();
  assert.ok(ctx);
});

test("client.execute SELECT 1 returns one row", async () => {
  const r = await ctx.client.execute("SELECT 1 AS ok");
  assert.equal(r.rows.length, 1);
});

test("users table is empty on fresh test DB", async () => {
  const r = await ctx.db.select().from(users);
  assert.equal(r.length, 0);
});

test("insert and read back a user", async () => {
  const id = ulid();
  const now = Date.now();
  await ctx.db.insert(users).values({
    id,
    nickname: "测试用户",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  const rows = await ctx.db.select().from(users).where(eq(users.id, id));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].nickname, "测试用户");
  assert.equal(rows[0].status, "active");
  assert.equal(rows[0].lastActiveAt, null);
});

test("users.id is primary key — duplicate id throws", async () => {
  const id = ulid();
  const now = Date.now();
  await ctx.db.insert(users).values({
    id,
    nickname: "first",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  await assert.rejects(
    ctx.db.insert(users).values({
      id,
      nickname: "second",
      status: "active",
      createdAt: now,
      updatedAt: now,
    }),
  );
});
