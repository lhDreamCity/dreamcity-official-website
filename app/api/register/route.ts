import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MEMBER_COOKIE,
  ROLE_COOKIE,
  SESSION_COOKIE_OPTS,
  USER_COOKIE,
} from "@/app/lib/auth";
import { signValue } from "@/app/lib/session-secret";
import {
  VERIFY_ERROR_MESSAGES,
  checkCode,
} from "@/app/lib/verify";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";

/* 学员注册：手机号 + 短信验证码 + 昵称。
   注册成功即自动登录（学员角色）。
   验证码由 /api/verify-code 签发，Cookie 由 HMAC 签名。 */

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`register:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      },
    );
  }

  const body = await req.json().catch(() => ({}));
  const { phone, code, nickname } = body;

  if (!phone || !/^1\d{10}$/.test(String(phone))) {
    return NextResponse.json({ error: "请输入正确的手机号" }, { status: 400 });
  }

  const result = checkCode(String(phone), code);
  if (!result.ok) {
    return NextResponse.json(
      { error: VERIFY_ERROR_MESSAGES[result.reason] },
      { status: 401 },
    );
  }

  const store = await cookies();
  const opts = SESSION_COOKIE_OPTS;
  store.set(USER_COOKIE, await signValue(String(phone)), opts);
  store.set(MEMBER_COOKIE, await signValue("1"), opts);
  store.set(ROLE_COOKIE, await signValue("member"), opts);

  return NextResponse.json({
    ok: true,
    user: { phone, nickname, role: "member" },
  });
}