import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE, MEMBER_COOKIE } from "@/app/lib/auth";

/* 模拟开通会员（Demo 占位）：设置会员标记。
   接入真实支付后，此处应校验订单支付成功再开通会员。 */
export async function POST(req: Request) {
  const store = await cookies();
  const user = store.get(USER_COOKIE)?.value;
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  store.set(MEMBER_COOKIE, "1", { path: "/", httpOnly: false });
  return NextResponse.json({ ok: true });
}
