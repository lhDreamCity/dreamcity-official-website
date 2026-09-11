import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiError, errorResponse } from "@/app/lib/errors";
import { SESSION_COOKIE, SESSION_COOKIE_OPTS } from "@/app/lib/auth";
import { createUser } from "@/app/lib/db/queries/users";
import { createIdentity, findIdentityByHash } from "@/app/lib/db/queries/identities";
import { createCredential } from "@/app/lib/db/queries/credentials";
import { grantRole } from "@/app/lib/db/queries/roles";
import { createSession } from "@/app/lib/db/queries/sessions";
import { checkCode as dbCheckCode } from "@/app/lib/db/queries/codes";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { PASSWORD_ERROR_MESSAGES, validatePassword } from "@/app/lib/password";

/* POST /api/register
 *
 * body: { phone, code, nickname, password? }
 *
 * 流程：
 *   1. 校验手机号格式 + IP 限频
 *   2. 校验验证码（DB-backed，purpose='register'）
 *   3. 手机号已注册 → 409 conflict
 *   4. 若带 password → 校验强度（8+ 位 + 字母 + 数字）
 *   5. 创建 user / identity (phone, verified=true)
 *   6. 创建 sms_code 占位 credential（标记该手机��已验证过）
 *   7. 若带 password → 创建 password credential
 *   8. 创建 session → 写 dcw_sid cookie
 *
 * password 可选；M3 起登录支持双路（sms_code / password），
 * 不设密码就只能走短信登录。
 */

const PHONE_RE = /^1\d{10}$/;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`register:ip:${ip}`, 5, 60_000);
    if (!ipLimit.allowed) {
      throw new ApiError("rate-limited", "请求过于频繁，请稍后再试", ipLimit.retryAfterMs);
    }

    const body = (await req.json().catch(() => ({}))) as {
      phone?: string;
      code?: string;
      nickname?: string;
      password?: string;
    };
    const phone = body.phone?.trim() ?? "";
    const code = body.code ?? "";
    const nickname = body.nickname?.trim() ?? "";
    const password = body.password ?? "";

    if (!PHONE_RE.test(phone)) {
      throw new ApiError("bad-request", "请输入正确的手机号");
    }
    if (!code) {
      throw new ApiError("bad-request", "请输入验证码");
    }
    if (!nickname) {
      throw new ApiError("bad-request", "请输入昵称");
    }
    if (nickname.length > 32) {
      throw new ApiError("bad-request", "昵称最长 32 个字符");
    }
    if (password) {
      const v = validatePassword(password);
      if (!v.ok) {
        throw new ApiError("bad-request", PASSWORD_ERROR_MESSAGES[v.reason]);
      }
    }

    const verify = await dbCheckCode("phone", phone, "register", code);
    if (!verify.ok) {
      throw new ApiError("unauthorized", "验证码不正确或已失效");
    }

    const existing = await findIdentityByHash("phone", phone);
    if (existing) {
      throw new ApiError("conflict", "该手机号已注册，请直接登录");
    }

    const user = await createUser({ nickname });
    const identity = await createIdentity({
      userId: user.id,
      type: "phone",
      identifier: phone,
      verified: true,
    });
    // sms_code credential 是占位：标记"该手机号已验证过"。
    // sms 登录实际不读 credential.secretHash，直接消费 verification_codes 表。
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
    await grantRole({ userId: user.id, role: "member", grantedBy: null });

    const session = await createSession({
      userId: user.id,
      userAgent: req.headers.get("user-agent"),
      ip,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, session.id, SESSION_COOKIE_OPTS);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, nickname: user.nickname },
    });
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}