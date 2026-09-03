import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MEMBER_COOKIE,
  ROLE_COOKIE,
  SESSION_COOKIE_OPTS,
  USER_COOKIE,
} from "@/app/lib/auth";
import { signValue } from "@/app/lib/session-secret";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";

/* 管理员登录：隐藏路由 + 账号密码。
   账号密码从环境变量 ADMIN_USERNAME / ADMIN_PASSWORD 读取。
   未配置时**不再回退到默认密码**（旧的 mengcheng@2026 默认值已删除），
   而是返回 503，避免"忘配环境变量 = 知道默认密码就能进后台"。 */

function adminCredentials(): { username: string; password: string } | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`admin-login:${ip}`, 5, 60_000);
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

  const cred = adminCredentials();
  if (!cred) {
    return NextResponse.json(
      {
        error:
          "管理员登录未配置。请在 .env.local 中设置 ADMIN_USERNAME 和 ADMIN_PASSWORD 后重启服务。",
      },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const { username, password } = body;

  if (username !== cred.username || password !== cred.password) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }

  const store = await cookies();
  const opts = SESSION_COOKIE_OPTS;
  store.set(USER_COOKIE, await signValue(String(username)), opts);
  store.set(MEMBER_COOKIE, await signValue("1"), opts);
  store.set(ROLE_COOKIE, await signValue("admin"), opts);

  return NextResponse.json({ ok: true, user: { username, role: "admin" } });
}