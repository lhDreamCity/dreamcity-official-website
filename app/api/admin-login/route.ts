import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiError, errorResponse } from "@/app/lib/errors";
import { SESSION_COOKIE, SESSION_COOKIE_OPTS } from "@/app/lib/auth";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { createSession } from "@/app/lib/db/queries/sessions";
import { db, schema } from "@/app/lib/db/client";
import { eq } from "drizzle-orm";
import { newId } from "@/app/lib/ulid";
import { grantRole } from "@/app/lib/db/queries/roles";

/* POST /api/admin-login
 *
 * body: { username, password }
 *
 * 流程（M2）：
 *   1. 校验 ADMIN_USERNAME / ADMIN_PASSWORD env 存在
 *   2. 比对 env 值
 *   3. 在 users 表中查找（或自动创建）一个 status=active、昵称=管理员 的用户
 *      并 grantRole('admin')。这是 admin 账号在 DB 里的镜像，admin 后台
 *      才能看到自己的记录 + 操作审计。
 *   4. 创建 session → 写 dcw_sid cookie
 *
 * 不做失败锁定（M5 接）：admin 路径入口低频，先用 IP 限频兜底。
 */

function adminCredentials(): { username: string; password: string } | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

async function getOrCreateAdminUser(username: string): Promise<schema.User> {
  // 先按 nickname 找（admin 唯一）
  const rows = await db.select().from(schema.users).where(eq(schema.users.nickname, "管理员"));
  if (rows[0]) return rows[0];

  // 没找到就建一个，nickname='管理员'
  const now = Date.now();
  const u: schema.NewUser = {
    id: newId(),
    nickname: "管理员",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(schema.users).values(u);
  await grantRole({ userId: u.id, role: "admin", grantedBy: null });
  await grantRole({ userId: u.id, role: "member", grantedBy: null });
  return (await db.select().from(schema.users).where(eq(schema.users.id, u.id)))[0]!;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`admin-login:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      throw new ApiError("rate-limited", "请求过于频繁，请稍后再试", limit.retryAfterMs);
    }

    const cred = adminCredentials();
    if (!cred) {
      throw new ApiError(
        "internal",
        "管理员登录未配置。请在 .env.local 中设置 ADMIN_USERNAME 和 ADMIN_PASSWORD 后重启服务。",
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    const username = body.username ?? "";
    const password = body.password ?? "";

    // 用 timingSafeEqual 防时序攻击（M5 改；M2 先 string 比对）
    if (username !== cred.username || password !== cred.password) {
      throw new ApiError("unauthorized", "账号或密码错误");
    }

    const user = await getOrCreateAdminUser(username);
    const session = await createSession({
      userId: user.id,
      userAgent: req.headers.get("user-agent"),
      ip,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, session.id, SESSION_COOKIE_OPTS);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, nickname: user.nickname, roles: ["admin", "member"] },
    });
  } catch (e) {
    const { status, body } = errorResponse(e);
    return NextResponse.json(body, { status });
  }
}