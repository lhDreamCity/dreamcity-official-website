/**
 * SMS / Email 验证码薄包装（DB-backed by queries/codes.ts）。
 *
 * 旧版：进程内 Map，重启丢验证码，多实例不一致。
 * 新版：所有验证码在 verification_codes 表，CSPRNG 生成 + bcrypt 存；
 *  库泄漏时：
 *    - 库无 identifier 明文（HMAC 查找）
 *    - 库无 code 明文（bcrypt hash）
 *  → 攻击者无法批量发码 / 反查手机号 / 离线穷举验证码。
 *
 * 验证返回的 reason 集合不变（missing / expired / too-many-attempts / wrong-code），
 *  以保持上层 UI 文案不变。
 */

import { issueCode as dbIssueCode, checkCode as dbCheckCode } from "./db/queries/codes";

export type VerifyFailure =
  | "missing"
  | "expired"
  | "too-many-attempts"
  | "wrong-code";

export type VerifyResult = { ok: true } | { ok: false; reason: VerifyFailure };

/** 给前端展示的友好中文消息。 */
export const VERIFY_ERROR_MESSAGES: Record<VerifyFailure, string> = {
  missing: "请先获取验证码",
  expired: "验证码已过期，请重新获取",
  "too-many-attempts": "尝试次数过多，请重新获取验证码",
  "wrong-code": "验证码不正确",
};

export async function issueCode(phone: string): Promise<string> {
  return dbIssueCode("phone", phone, "login"); // 兼容旧签名：默认 login
}

export async function checkCode(
  phone: string,
  input: string | undefined,
): Promise<VerifyResult> {
  return dbCheckCode("phone", phone, "login", input);
}