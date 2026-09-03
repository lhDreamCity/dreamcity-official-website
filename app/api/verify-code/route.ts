import { NextResponse } from "next/server";
import { issueCode } from "@/app/lib/verify";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";

/* 发送短信验证码。
   开发期：随机生成 6 位数字并返回 devCode 字段，方便测试。
   上线后：调用真实短信服务商（阿里云 / 腾讯云）下发，devCode 字段不再返回。 */

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`verify-code:${ip}`, 10, 60_000);
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
  const { phone } = body;
  if (!phone || !/^1\d{10}$/.test(String(phone))) {
    return NextResponse.json({ error: "请输入正确的手机号" }, { status: 400 });
  }

  const code = issueCode(String(phone));

  return NextResponse.json({
    ok: true,
    ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
  });
}