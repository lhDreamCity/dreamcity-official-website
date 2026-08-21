import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE } from "@/app/lib/auth";

/* 注册（Supabase 占位）：仅作 demo。
   接入 Supabase Auth 后替换为 supabase.auth.signUp()。 */
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
  }

  const store = await cookies();
  store.set(USER_COOKIE, email, { path: "/", httpOnly: false });

  return NextResponse.json({ ok: true, user: { email } });
}
