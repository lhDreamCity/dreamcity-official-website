/**
 * SMS verification codes for login / register (dev mock).
 *
 * Per-phone store of random 6-digit codes:
 *   - 5-minute TTL
 *   - max 5 attempts per code
 *   - one-shot: a successful check deletes the code
 *
 * This is dev/mock infrastructure: codes live in process memory and do not
 * survive a server restart. That's fine for the demo. For production, hand
 * off to a real SMS provider (阿里云 / 腾讯云) and keep the same shape.
 *
 * The fixed "123456" code from the original demo has been removed. Anyone
 * could register as a member with any phone + 123456 before; now the code is
 * unique per send, time-limited, and rate-limited at /api/verify-code.
 */

type Code = { code: string; expiresAt: number; attempts: number };
const codes = new Map<string, Code>();

const TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;

export function issueCode(phone: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  codes.set(phone, { code, expiresAt: Date.now() + TTL_MS, attempts: 0 });
  return code;
}

export type VerifyFailure =
  | "missing"
  | "expired"
  | "too-many-attempts"
  | "wrong-code";

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: VerifyFailure };

export function checkCode(
  phone: string,
  input: string | undefined,
): VerifyResult {
  if (!input) return { ok: false, reason: "missing" };
  const c = codes.get(phone);
  if (!c) return { ok: false, reason: "missing" };
  if (Date.now() > c.expiresAt) {
    codes.delete(phone);
    return { ok: false, reason: "expired" };
  }
  if (c.attempts >= MAX_ATTEMPTS) {
    codes.delete(phone);
    return { ok: false, reason: "too-many-attempts" };
  }
  c.attempts++;
  if (c.code !== input) return { ok: false, reason: "wrong-code" };
  codes.delete(phone);
  return { ok: true };
}

/** Friendly Chinese messages keyed by failure reason. */
export const VERIFY_ERROR_MESSAGES: Record<VerifyFailure, string> = {
  missing: "请先获取验证码",
  expired: "验证码已过期，请重新获取",
  "too-many-attempts": "尝试次数过多，请重新获取验证码",
  "wrong-code": "验证码不正确",
};