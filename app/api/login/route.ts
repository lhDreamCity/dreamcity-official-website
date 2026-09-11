import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiError, errorResponse } from "@/app/lib/errors";
import { SESSION_COOKIE, SESSION_COOKIE_OPTS } from "@/app/lib/auth";
import { findIdentityByHash } from "@/app/lib/db/queries/identities";
import {
  findCredential,
  isLocked,
  recordFailedAttempt,
  resetFailures,
} from "@/app/lib/db/queries/credentials";
import { checkCode as dbCheckCode } from "@/app/lib/db/queries/codes";
import { createSession } from "@/app/lib/db/queries/sessions";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { verifyPassword } from "@/app/lib/password";

/* POST /api/login
 *
 * body: { phone, method: "sms_code" | "password", code?, password? }
 *
 * 流程：
 *   method='sms_code':
 *     - 查 identity(phone) → 没注册 → 401 "该手机号未注册"
 *     - checkCode(purpose='login') → 错 → 401
 *     - 创建 session
 *
 *   method='password':
 *     - 查 identity(phone) → 没注册 → 401 "账号或密码错误"（不区分手机号未注册 vs 密码错）
 *     - 查 password credential → 不存在 → 401 "账号或密码错误"
 *     - 检查 lockedUntil → 还在锁 → 423
 *     - bcrypt 验密 → 错 → recordFailedAttempt → 401 "账号或密码错误"
 *     - 验密成功 → resetFailures → 创建 session
 *
 * 失败锁定：5 次连续失败 → 锁 15 分钟（DB-backed，多实例兼容）。
 * IP 限频：1 min / 10 次（防刷库）。
 */

const PHONE_RE = /^1\d{10}$/;
const PWD_MAX_FAILS = 5;
const PWD_LOCK_MS = 15 * 60_000;

type LoginBody = {
  phone?: string;
  method?: "sms_code" | "password";
  code?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`login:ip:${ip}`, 10, 60_000);
    if (!ipLimit.allowed) {
      throw new ApiError("rate-limited", "请求过于频繁，请稍后再试", ipLimit.retryAfterMs);
    }

    const body = (await req.json().catch(() => ({}))) as LoginBody;
    const phone = body.phone?.trim() ?? "";
    const method: "sms_code" | "password" =
      body.method === "password" ? "password" : "sms_code";

    if (!PHONE_RE.test(phone)) {
      throw new ApiError("bad-request", "请输入正确的手机号");
    }

    const identity = await findIdentityByHash("phone", phone);
    if (!identity) {
      throw new ApiError("unauthorized", "账号或密码错误");
    }

    if (method === "sms_code") {
      await loginBySms(identity.id, phone, body.code);
    } else {
      await loginByPassword(identity.id, body.password ?? "");
    }

    const session = await createSession({
      userId: identity.userId,
      userAgent: req.headers.get("user-agent"),
      ip,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, session.id, SESSION_COOKIE_OPTS);

    return NextResponse.json({
      ok: true,
      user: { id: identity.userId },
    });
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}

async function loginBySms(identityId: string, phone: string, code: string | undefined) {
  if (!code) {
    throw new ApiError("bad-request", "请输入验证码");
  }
  const r = await dbCheckCode("phone", phone, "login", code);
  if (!r.ok) {
    throw new ApiError("unauthorized", "验证码不正确或已失效");
  }
}

async function loginByPassword(identityId: string, password: string) {
  if (!password) {
    throw new ApiError("bad-request", "请输入密码");
  }
  const cred = await findCredential(identityId, "password");
  if (!cred || !cred.secretHash) {
    // 不区分"没设密码"和"密码错"，统一 401，避免攻击者枚举哪些手机号注册了密码
    throw new ApiError("unauthorized", "账号或密码错误");
  }
  if (isLocked(cred)) {
    const retryMs = (cred.lockedUntil ?? 0) - Date.now();
    throw new ApiError(
      "forbidden",
      `登录失败次数过多，请 ${Math.ceil(retryMs / 60_000)} 分钟后再试`,
      retryMs,
    );
  }
  const ok = await verifyPassword(password, cred.secretHash);
  if (!ok) {
    await recordFailedAttempt(cred.id, PWD_MAX_FAILS, PWD_LOCK_MS);
    throw new ApiError("unauthorized", "账号或密码错误");
  }
  await resetFailures(cred.id);
}