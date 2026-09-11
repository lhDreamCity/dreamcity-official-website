/**
 * M3 验收：双路登录（短信码 / 密码）+ 失败锁定。
 *
 * 测试场景：
 *   - 短信码：发码 → 消费 → 登录成功
 *   - 密码：注册时设密码 → 密码对 → 登录成功
 *   - 密码错：5 次 → 第 6 次被锁
 *   - 手机号未注册 → 401
 *   - 密码未设（注册时没传 password）→ 密码登录 401
 *   - sms_code credential 在 sms 登录不读 secretHash（验证码走 verification_codes 表）
 */

import { test, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb, type TestDb } from "./helpers/db.ts";

let ctx: TestDb;
before(async () => {
  ctx = await setupTestDb();
});

/** 完整跑一遍"注册→登录"流程，模拟前端。 */
async function registerUser(phone: string, nickname: string, password?: string) {
  const codes = await import("../app/lib/db/queries/codes.ts");
  const { createUser } = await import("../app/lib/db/queries/users.ts");
  const { createIdentity } = await import("../app/lib/db/queries/identities.ts");
  const { createCredential } = await import("../app/lib/db/queries/credentials.ts");
  const { grantRole } = await import("../app/lib/db/queries/roles.ts");

  const code = await codes.issueCode("phone", phone, "register");
  const verify = await codes.checkCode("phone", phone, "register", code);
  assert.deepEqual(verify, { ok: true });

  const user = await createUser({ nickname });
  const identity = await createIdentity({
    userId: user.id,
    type: "phone",
    identifier: phone,
    verified: true,
  });
  await createCredential({
    identityId: identity.id,
    kind: "sms_code",
    secret: "sms-verified",
  });
  if (password) {
    await createCredential({
      identityId: identity.id,
      kind: "password",
      secret: password,
    });
  }
  await grantRole({ userId: user.id, role: "member" });
  return { userId: user.id };
}

test("loginBySms: registered phone + correct code → session created", async () => {
  const { createSession, getActiveSession } = await import(
    "../app/lib/db/queries/sessions.ts"
  );
  const codes = await import("../app/lib/db/queries/codes.ts");
  const { findIdentityByHash } = await import("../app/lib/db/queries/identities.ts");
  const phone = "13800100001";
  await registerUser(phone, "sms-登录用户");

  const code = await codes.issueCode("phone", phone, "login");
  const verify = await codes.checkCode("phone", phone, "login", code);
  assert.deepEqual(verify, { ok: true });

  const identity = await findIdentityByHash("phone", phone);
  assert.ok(identity);
  const session = await createSession({ userId: identity!.userId, userAgent: "jest" });
  const active = await getActiveSession(session.id);
  assert.ok(active);
  assert.equal(active!.userId, identity!.userId);
});

test("loginBySms: unknown phone → 401 (handled at route layer)", async () => {
  // 路由层逻辑：findIdentityByHash 找不到 → throw ApiError("unauthorized", "账号或密码错误")
  // 这里测底下的 findIdentityByHash
  const { findIdentityByHash } = await import("../app/lib/db/queries/identities.ts");
  const found = await findIdentityByHash("phone", "13800000000");
  assert.equal(found, null);
});

test("loginByPassword: correct password → success path is wired", async () => {
  const { findCredential } = await import("../app/lib/db/queries/credentials.ts");
  const { findIdentityByHash } = await import("../app/lib/db/queries/identities.ts");
  const { verifyPassword } = await import("../app/lib/password.ts");
  const phone = "13800100002";
  await registerUser(phone, "pwd-登录用户", "hunter22");

  const identity = await findIdentityByHash("phone", phone);
  assert.ok(identity);
  const cred = await findCredential(identity!.id, "password");
  assert.ok(cred);
  assert.ok(await verifyPassword("hunter22", cred!.secretHash!));
  assert.equal(await verifyPassword("hunter23", cred!.secretHash!), false);
});

test("loginByPassword: no password set → findCredential returns null", async () => {
  const { findCredential } = await import("../app/lib/db/queries/credentials.ts");
  const { findIdentityByHash } = await import("../app/lib/db/queries/identities.ts");
  const phone = "13800100003";
  await registerUser(phone, "no-pwd-用户");
  const identity = await findIdentityByHash("phone", phone);
  assert.ok(identity);
  const cred = await findCredential(identity!.id, "password");
  assert.equal(cred, null); // 没设密码 → 密码登录走"账号或密码错误"
});

test("loginByPassword: 5 wrong attempts → 6th attempt locked (403)", async () => {
  const { findCredential } = await import("../app/lib/db/queries/credentials.ts");
  const { findIdentityByHash } = await import("../app/lib/db/queries/identities.ts");
  const { recordFailedAttempt, isLocked } = await import(
    "../app/lib/db/queries/credentials.ts"
  );
  const phone = "13800100004";
  await registerUser(phone, "锁定用户", "correct-pwd");

  const identity = await findIdentityByHash("phone", phone);
  const cred = await findCredential(identity!.id, "password");
  assert.ok(cred);
  // 前 4 次失败 → 还可继续试
  for (let i = 0; i < 4; i++) {
    await recordFailedAttempt(cred!.id, 5, 15 * 60_000);
  }
  let fresh = await findCredential(identity!.id, "password");
  assert.equal(isLocked(fresh!), false);
  assert.equal(fresh!.failedAttempts, 4);

  // 第 5 次失败 → 触发锁定
  await recordFailedAttempt(cred!.id, 5, 15 * 60_000);
  fresh = await findCredential(identity!.id, "password");
  assert.equal(isLocked(fresh!), true);
  assert.ok(fresh!.lockedUntil! > Date.now());
});

test("resetFailures unlocks a locked credential", async () => {
  const { findCredential, recordFailedAttempt, resetFailures, isLocked } = await import(
    "../app/lib/db/queries/credentials.ts"
  );
  const { findIdentityByHash } = await import("../app/lib/db/queries/identities.ts");
  const { createCredential } = await import("../app/lib/db/queries/credentials.ts");
  const { createUser } = await import("../app/lib/db/queries/users.ts");
  const { createIdentity } = await import("../app/lib/db/queries/identities.ts");

  const u = await createUser({ nickname: "解锁测试" });
  const id = await createIdentity({ userId: u.id, type: "phone", identifier: "13800100999" });
  const c = await createCredential({ identityId: id.id, kind: "password", secret: "x" });
  await recordFailedAttempt(c.id, 5, 15 * 60_000);
  await recordFailedAttempt(c.id, 5, 15 * 60_000);
  await recordFailedAttempt(c.id, 5, 15 * 60_000);
  await recordFailedAttempt(c.id, 5, 15 * 60_000);
  await recordFailedAttempt(c.id, 5, 15 * 60_000);
  let fresh = await findCredential(id.id, "password");
  assert.equal(isLocked(fresh!), true);

  await resetFailures(c.id);
  fresh = await findCredential(id.id, "password");
  assert.equal(isLocked(fresh!), false);
  assert.equal(fresh!.failedAttempts, 0);
  assert.equal(fresh!.lockedUntil, null);
});

test("validatePassword rejects weak passwords", async () => {
  const { validatePassword } = await import("../app/lib/password.ts");
  assert.deepEqual(validatePassword("short"), { ok: false, reason: "too-short" });
  assert.deepEqual(validatePassword("abcdefgh"), { ok: false, reason: "no-digit" });
  assert.deepEqual(validatePassword("12345678"), { ok: false, reason: "no-letter" });
  assert.deepEqual(validatePassword("hunter22"), { ok: true });
  assert.deepEqual(validatePassword("MyPwd12345"), { ok: true });
});

test("verifyPassword against hashed secret", async () => {
  const { hashPassword, verifyPassword } = await import("../app/lib/password.ts");
  const hash = await hashPassword("hunter22");
  assert.notEqual(hash, "hunter22");
  assert.match(hash, /^\$2[aby]\$/);
  assert.equal(await verifyPassword("hunter22", hash), true);
  assert.equal(await verifyPassword("hunter23", hash), false);
});