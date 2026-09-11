/**
 * 不可逆 HMAC 查找键：库泄漏时无法批量反查手机号 / 邮箱。
 *
 * 设计：
 *   - identifier 原文走 AES-GCM 加密存 identities.identifier（admin 后台可解密显示）
 *   - identifier 原文 + 类型再走 HMAC-SHA256 存 identifier_hash 作为查找索引
 *
 * 安全边界：
 *   - 任何能拿到 IDENTIFIER_HASH_SECRET 的人都能离线批量 hash + 比对 → 必须用足够强的 secret
 *   - 同一 secret 同时被多张表用作查找键；轮转 secret 需要重建所有 hash（M2 不实现，留 TODO）
 *
 * 跟 session-secret.ts 的区别：
 *   - session-secret.ts 是签名（防篡改，可逆：任何持 secret 的人能验证）
 *   - identifier-hash.ts 是哈希（不可逆），仅用于"我有 secret 就能匹配"场景
 */

import { createHmac } from "node:crypto";

const KEY = process.env.IDENTIFIER_HASH_SECRET ?? process.env.SESSION_SECRET;
if (!KEY || KEY.length < 32) {
  throw new Error(
    "IDENTIFIER_HASH_SECRET (or fallback SESSION_SECRET) must be set and >=32 chars",
  );
}

export type IdentityType = "phone" | "email" | "wechat_openid";

/** 把原始 identifier 规整化：手机号去掉非数字，邮箱 lower，wechat_openid 保留大小写。 */
export function normalizeIdentifier(type: IdentityType, raw: string): string {
  switch (type) {
    case "phone":
      return raw.replace(/\D/g, "");
    case "email":
      return raw.trim().toLowerCase();
    case "wechat_openid":
      return raw.trim();
  }
}

/** 恒定 HMAC 查找键。同 type + 同 identifier 永远得同 hash。 */
export function identifierHash(type: IdentityType, raw: string): string {
  const norm = normalizeIdentifier(type, raw);
  return createHmac("sha256", KEY!).update(`${type}:${norm}`).digest("hex");
}

/** AES-GCM 加密（identifier 存储用）。M2 阶段 identities 表已建好但暂不写入密文字段，
 *  等 admin 后台要展示时再启用 — 现在 identifier 列存原文占位，HMAC 已足够防反查。 */
