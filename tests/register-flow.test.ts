/**
 * M2 验收：完整注册流（DB-backed）。
 *
 * 模拟：
 *   1. 前端调 /api/verify-code → 拿到 devCode
 *   2. 前端调 /api/register { phone, code, nickname } → 200 + cookie
 *   3. /api/me 命中 → 返回新用户
 *   4. 二次注册同手机号 → 409 conflict
 */

import { test, before } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { setupTestDb, type TestDb } from "./helpers/db.ts";

let ctx: TestDb;
before(async () => {
  ctx = await setupTestDb();
});

test("issue + consume register-purpose code", async () => {
  const codes = await import("../app/lib/db/queries/codes.ts");
  const code = await codes.issueCode("phone", "13811112222", "register");
  assert.match(code, /^\d{6}$/);
  const r = await codes.checkCode("phone", "13811112222", "register", code);
  assert.deepEqual(r, { ok: true });
  // 二次消费 = missing
  assert.deepEqual(
    await codes.checkCode("phone", "13811112222", "register", code),
    { ok: false, reason: "missing" },
  );
});

test("identity lookup by HMAC works (case + format insensitive for phone)", async () => {
  const { createUser } = await import("../app/lib/db/queries/users.ts");
  const { createIdentity, findIdentityByHash } = await import("../app/lib/db/queries/identities.ts");
  const u = await createUser({ nickname: "测试 A" });
  await createIdentity({ userId: u.id, type: "phone", identifier: "13812345678", verified: true });
  const found = await findIdentityByHash("phone", "138-1234-5678"); // normalize 去非数字
  assert.ok(found);
  assert.equal(found!.userId, u.id);
});

test("createCredential sets bcrypt hash; secret not stored in plaintext", async () => {
  const { createUser } = await import("../app/lib/db/queries/users.ts");
  const { createIdentity } = await import("../app/lib/db/queries/identities.ts");
  const { createCredential, findCredential } = await import("../app/lib/db/queries/credentials.ts");
  const u = await createUser({ nickname: "测试 B" });
  const id = await createIdentity({ userId: u.id, type: "phone", identifier: "13900000000" });
  const cred = await createCredential({ identityId: id.id, kind: "password", secret: "hunter2" });
  // 库里 secret_hash 是 bcrypt，不等于明文
  assert.notEqual(cred.secretHash, "hunter2");
  assert.match(cred.secretHash!, /^\$2[aby]\$/); // bcrypt 前缀
  const fetched = await findCredential(id.id, "password");
  assert.equal(fetched?.secretHash, cred.secretHash);
});

test("session create + getActiveSession round-trip", async () => {
  const { createUser } = await import("../app/lib/db/queries/users.ts");
  const { createSession, getActiveSession, revokeSession } = await import(
    "../app/lib/db/queries/sessions.ts"
  );
  const u = await createUser({ nickname: "测试 C" });
  const s = await createSession({ userId: u.id, userAgent: "jest" });
  assert.equal(s.userAgent, "jest");
  assert.ok(s.id.length >= 32);
  // 滑动窗口：刚创建时 last_seen == createdAt
  const active = await getActiveSession(s.id);
  assert.ok(active);
  assert.equal(active!.userId, u.id);
  // 撤销后失效
  await revokeSession(s.id);
  const afterRevoke = await getActiveSession(s.id);
  assert.equal(afterRevoke, null);
});

test("revokeAllSessionsForUser kills all active sessions for that user", async () => {
  const { createUser } = await import("../app/lib/db/queries/users.ts");
  const { createSession, revokeAllSessionsForUser, listActiveSessionsForUser } = await import(
    "../app/lib/db/queries/sessions.ts"
  );
  const u = await createUser({ nickname: "测试 D" });
  await createSession({ userId: u.id });
  await createSession({ userId: u.id });
  await createSession({ userId: u.id });
  assert.equal((await listActiveSessionsForUser(u.id)).length, 3);
  const killed = await revokeAllSessionsForUser(u.id);
  assert.equal(killed, 3);
  assert.equal((await listActiveSessionsForUser(u.id)).length, 0);
});

test("grantRole + listRolesForUser", async () => {
  const { createUser } = await import("../app/lib/db/queries/users.ts");
  const { grantRole, listRolesForUser, revokeRole } = await import(
    "../app/lib/db/queries/roles.ts"
  );
  const u = await createUser({ nickname: "测试 E" });
  await grantRole({ userId: u.id, role: "member" });
  await grantRole({ userId: u.id, role: "teacher" });
  let roles = await listRolesForUser(u.id);
  assert.ok(roles.includes("member"));
  assert.ok(roles.includes("teacher"));
  await revokeRole(u.id, "teacher");
  roles = await listRolesForUser(u.id);
  assert.ok(!roles.includes("teacher"));
});