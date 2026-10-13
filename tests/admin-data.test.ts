import { test, before as testBefore } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb, type TestDb } from "./helpers/db";
import { createUser } from "../app/lib/db/queries/users";
import { createIdentity } from "../app/lib/db/queries/identities";
import { grantRole } from "../app/lib/db/queries/roles";
import { loadAdminUsers, loadAdminStats } from "../app/lib/admin-data";

let ctx: TestDb;

test("setup: fresh test DB with schema", async () => {
  ctx = await setupTestDb();
  assert.ok(ctx);
});

test("loadAdminUsers 返回管理员用户 + 角色 + 主标识符", async () => {
  const u = await createUser({ nickname: "管理员测试" });
  await createIdentity({
    userId: u.id,
    type: "phone",
    identifier: "13800138000",
    verified: true,
  });
  await grantRole({ userId: u.id, role: "admin" });
  await grantRole({ userId: u.id, role: "member" });

  const users = await loadAdminUsers();
  assert.equal(users.length, 1);
  assert.equal(users[0]!.nickname, "管理员测试");
  assert.equal(users[0]!.primaryIdentifier, "13800138000");
  assert.deepEqual(users[0]!.roles.slice().sort(), ["admin", "member"]);
  assert.equal(users[0]!.status, "active");
  // joinDate 是 YYYY-MM-DD 格式
  assert.match(users[0]!.joinDate, /^\d{4}-\d{2}-\d{2}$/);
});

test("loadAdminStats 数字与 DB 实际状态一致", async () => {
  // 上一个 test 留了一个 admin user
  const stats = await loadAdminStats();
  assert.equal(stats.totalUsers, 1);
  assert.equal(stats.activeUsers, 1);
  assert.equal(stats.disabledUsers, 0);
  assert.equal(stats.deletedUsers, 0);
  // 刚 create 的 user 算 7 天内
  assert.equal(stats.weeklyNewUsers, 1);
});

test("无 identity 的用户 primaryIdentifier 显示 —", async () => {
  const u = await createUser({ nickname: "无身份用户" });
  const users = await loadAdminUsers();
  const found = users.find((x) => x.id === u.id);
  assert.ok(found, "新建的无身份用户应出现在列表中");
  assert.equal(found!.primaryIdentifier, "—");
});

test("无显式角色的用户默认按 member 展示", async () => {
  const u = await createUser({ nickname: "无角色用户" });
  const users = await loadAdminUsers();
  const found = users.find((x) => x.id === u.id);
  assert.ok(found);
  assert.deepEqual(found!.roles, ["member"]);
});
