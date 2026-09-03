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

/* 学员登录：手机号 + 短信验证码。
   验证码由 /api/verify-code 签发（开发期 mock，生产期接短信服务商）。
   Cookie 值均经过 HMAC 签名，详见 app/lib/session-secret.ts。 */

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`login:${ip}`, 5, 60_000);
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
  const { phone, code } = body;

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

  return NextResponse.json({ ok: true, user: { phone, role: "member" } });
}