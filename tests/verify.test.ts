/**
 * M2: 验证新版 verify.ts（DB-backed）行为兼容旧的 dev-mock 行为。
 *
 * 旧 in-memory 实现 → 新 libsql-backed 实现，所有 API 签名保持：
 *   - issueCode(phone: string): Promise<string>
 *   - checkCode(phone: string, input: string | undefined): Promise<VerifyResult>
 *
 * 验收：reason 文案 / 一次性消费 / 失败计数 行为一致。
 */

import { test, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb, type TestDb } from "./helpers/db.ts";
import { checkCode, issueCode, VERIFY_ERROR_MESSAGES } from "../app/lib/verify.ts";

const PHONES = ["13800000001", "13800000002", "13800000003", "13800000004"];

let ctx: TestDb;
before(async () => {
  ctx = await setupTestDb();
});

test("issueCode returns a 6-digit code and checkCode verifies it", async () => {
  const code = await issueCode(PHONES[0]!);
  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
  assert.deepEqual(await checkCode(PHONES[0]!, code), { ok: true });
});

test("checkCode is one-shot — second call returns missing", async () => {
  const phone = PHONES[1]!;
  const code = await issueCode(phone);
  assert.deepEqual(await checkCode(phone, code), { ok: true });
  // After success the code is consumed.
  assert.deepEqual(await checkCode(phone, code), { ok: false, reason: "missing" });
});

test("wrong code increments attempts but does not consume", async () => {
  const phone = PHONES[2]!;
  const real = await issueCode(phone);
  const wrong = real === "000000" ? "111111" : "000000";
  assert.deepEqual(await checkCode(phone, wrong), { ok: false, reason: "wrong-code" });
  // The real code still works.
  assert.deepEqual(await checkCode(phone, real), { ok: true });
});

test("missing input is reported as missing", async () => {
  const phone = PHONES[3]!;
  await issueCode(phone);
  assert.deepEqual(await checkCode(phone, undefined), { ok: false, reason: "missing" });
  assert.deepEqual(await checkCode(phone, ""), { ok: false, reason: "missing" });
});

test("too many attempts consume the code", async () => {
  const phone = "13800000099";
  const code = await issueCode(phone);
  // 5 wrong attempts
  for (let i = 0; i < 5; i++) {
    const wrong = code === "000000" ? "111111" : "000000";
    await checkCode(phone, wrong);
  }
  // Even the correct code now fails.
  const result = await checkCode(phone, code);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "too-many-attempts");
});

test("VERIFY_ERROR_MESSAGES covers all failure reasons", () => {
  assert.equal(VERIFY_ERROR_MESSAGES.missing, "请先获取验证码");
  assert.equal(VERIFY_ERROR_MESSAGES.expired, "验证码已过期，请重新获取");
  assert.equal(VERIFY_ERROR_MESSAGES["too-many-attempts"], "尝试次数过多，请重新获取验证码");
  assert.equal(VERIFY_ERROR_MESSAGES["wrong-code"], "验证码不正确");
});

test("re-issuing same phone overwrites the previous code", async () => {
  const phone = "13800001111";
  const first = await issueCode(phone);
  const second = await issueCode(phone);
  assert.notEqual(first, second);
  // First code is now stale (issueCode marked it consumed_at). checkCode returns
  // wrong-code because the active row is `second`, whose hash != first's plaintext.
  // (matches the same reason any wrong-code attempt does, which is fine UX-wise)
  assert.deepEqual(await checkCode(phone, first), { ok: false, reason: "wrong-code" });
  // The second code still works.
  assert.deepEqual(await checkCode(phone, second), { ok: true });
});