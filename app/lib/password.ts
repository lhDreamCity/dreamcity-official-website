/**
 * 密码 hash / 验证（bcryptjs，纯 JS，无 native 编译）。
 *
 * rounds=10：~80ms 一次，登录 / 注册可接受；
 *  vs rounds=12（~300ms）则太慢——前后台还会并发登录 5 个 admin。
 *
 * 强度策略（M2 先简单版，后续可加 zxcvbn）：
 *   - 最少 8 位
 *   - 至少 1 个字母 + 1 个数字
 *
 * 数据库存的是 secret_hash（bcrypt 60 字符）。库泄漏时 bcrypt 让离线穷举很难。
 */

import bcrypt from "bcryptjs";

const ROUNDS = 10;
const MIN_LENGTH = 8;
const PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export type PasswordFailure =
  | "too-short"
  | "no-letter"
  | "no-digit";

export function validatePassword(password: string): { ok: true } | { ok: false; reason: PasswordFailure } {
  if (password.length < MIN_LENGTH) return { ok: false, reason: "too-short" };
  if (!PATTERN.test(password)) {
    if (!/[A-Za-z]/.test(password)) return { ok: false, reason: "no-letter" };
    return { ok: false, reason: "no-digit" };
  }
  return { ok: true };
}

export const PASSWORD_ERROR_MESSAGES: Record<PasswordFailure, string> = {
  "too-short": "密码至少 8 位",
  "no-letter": "密码需包含至少 1 个字母",
  "no-digit": "密码需包含至少 1 个数字",
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** bcrypt 也用于验证码 hash（6 位数字 + 任意 secret 都用同一接口）。 */
export async function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifySecret(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
