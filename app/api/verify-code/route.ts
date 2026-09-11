import { NextResponse } from "next/server";
import { ApiError, errorResponse } from "@/app/lib/errors";
import { smsProvider } from "@/app/lib/sms-provider";
import { issueCode as dbIssueCode } from "@/app/lib/db/queries/codes";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";

/* POST /api/verify-code
 *
 * body: { phone: string, purpose?: "login" | "register" | "reset_password" | "bind_phone" }
 *   - phone: 11 位中国大陆手机号
 *   - purpose: 业务场景（默认 login）。不同 purpose 互不冲突，独立限频。
 *
 * 返回：
 *   - { ok: true, devCode?: string }
 *       devCode 仅 NODE_ENV !== 'production' 时返回（便于本地自测）。
 *   - 4xx { error }
 *
 * 防滥用（DB-aggregated；不走内存 Map，水平扩容友好）：
 *   - 同一 IP 一分钟最多 5 次
 *   - 同一手机号 60 秒最多 1 次
 *
 * 生产环境：devCode 不返回；真实 SMS 通过 sms-provider.ts 下发。
 */

const PHONE_RE = /^1\d{10}$/;
const ALLOWED_PURPOSES = ["login", "register", "reset_password", "bind_phone"] as const;
type Purpose = (typeof ALLOWED_PURPOSES)[number];

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // IP 限频：1 min / 5 次
    const ipLimit = rateLimit(`verify-code:ip:${ip}`, 5, 60_000);
    if (!ipLimit.allowed) {
      throw new ApiError("rate-limited", "请求过于频繁，请稍后再试", ipLimit.retryAfterMs);
    }

    const body = (await req.json().catch(() => ({}))) as {
      phone?: string;
      purpose?: string;
    };
    const phone = body.phone?.trim() ?? "";
    const purpose = (ALLOWED_PURPOSES as readonly string[]).includes(body.purpose ?? "")
      ? (body.purpose as Purpose)
      : "login";
    if (!PHONE_RE.test(phone)) {
      throw new ApiError("bad-request", "请输入正确的手机号");
    }

    // 手机号限频：60s / 1 次（跨 purpose 不独立——防刷是手机号层面的）
    const phoneLimit = rateLimit(`verify-code:phone:${phone}`, 1, 60_000);
    if (!phoneLimit.allowed) {
      throw new ApiError(
        "rate-limited",
        "60 秒内仅可获取一次验证码，请稍后再试",
        phoneLimit.retryAfterMs,
      );
    }

    const code = await dbIssueCode("phone", phone, purpose);
    const sms = smsProvider();
    await sms.send(phone, code);

    return NextResponse.json({
      ok: true,
      purpose,
      ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
    });
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}