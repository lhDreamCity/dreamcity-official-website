import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";

/* GET /api/me
 *
 * 返回当前登录用户；未登录返 401。
 * layout / page 用来判断登录态、显示昵称/角色，无需再读 cookie。
 */

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      nickname: user.nickname,
      roles: user.roles,
      permissions: user.permissions,
    },
  });
}