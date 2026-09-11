import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, OLD_USER_COOKIE, OLD_MEMBER_COOKIE, OLD_ROLE_COOKIE } from "@/app/lib/auth";
import { revokeSession } from "@/app/lib/db/queries/sessions";

/* GET /api/logout
 * - 撤销服务端 session（写 revoked_at，session_id 失效）
 * - 清 dcw_sid cookie
 * - 同时清旧的 dcw_user / dcw_member / dcw_role（M3 起彻底删）
 * - 302 重定向到首页
 */

export async function GET() {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (sid) {
    await revokeSession(sid);
  }
  store.delete(SESSION_COOKIE);
  store.delete(OLD_USER_COOKIE);
  store.delete(OLD_MEMBER_COOKIE);
  store.delete(OLD_ROLE_COOKIE);
  const base = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/", new URL(base)));
}