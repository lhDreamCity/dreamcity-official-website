/**
 * Tests for the dev-mock SMS verification code store.
 *
 * Each test uses a unique phone so the shared in-memory Map stays isolated.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCode, issueCode } from "../app/lib/verify.ts";

const PHONES = ["13800000001", "13800000002", "13800000003", "13800000004"];

test("issueCode returns a 6-digit code and checkCode verifies it", () => {
  const code = issueCode(PHONES[0]);
  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
  assert.deepEqual(checkCode(PHONES[0], code), { ok: true });
});

test("checkCode is one-shot — second call returns missing", () => {
  const phone = PHONES[1];
  const code = issueCode(phone);
  assert.deepEqual(checkCode(phone, code), { ok: true });
  // After success the code is consumed.
  assert.deepEqual(checkCode(phone, code), { ok: false, reason: "missing" });
});

test("wrong code increments attempts but does not consume", () => {
  const phone = PHONES[2];
  const real = issueCode(phone);
  const wrong = real === "000000" ? "111111" : "000000";
  assert.deepEqual(checkCode(phone, wrong), { ok: false, reason: "wrong-code" });
  // The real code still works.
  assert.deepEqual(checkCode(phone, real), { ok: true });
});

test("missing input is reported as missing", () => {
  const phone = PHONES[3];
  issueCode(phone);
  assert.deepEqual(checkCode(phone, undefined), { ok: false, reason: "missing" });
  assert.deepEqual(checkCode(phone, ""), { ok: false, reason: "missing" });
});

test("too many attempts consume the code", () => {
  const phone = "13800000099";
  const code = issueCode(phone);
  // 5 wrong attempts
  for (let i = 0; i < 5; i++) {
    const wrong = code === "000000" ? "111111" : "000000";
    checkCode(phone, wrong);
  }
  // Even the correct code now fails.
  const result = checkCode(phone, code);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "too-many-attempts");
});