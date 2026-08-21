import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEMBER_COOKIE, ROLE_COOKIE, USER_COOKIE } from "@/app/lib/auth";
import type { RoleName } from "@/app/lib/types";
import { ALL_ROLES } from "@/app/lib/rbac";

/* 登录（Supabase 占位）：当前宽松验证，仅作 demo。
   接入 Supabase Auth 后替换为 supabase.auth.signInWithPassword()。

   开发期可选 role 字段用于模拟 RBAC 角色：
     POST { email, role?: "admin" | "teacher" | "editor" | "member" }
   admin/teacher/editor 角色默认视为会员（拥有 lesson:watch）。 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, role } = body;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
  }

  const parsedRole = (role as RoleName | undefined) ?? "member";
  const isSimulated = ALL_ROLES.includes(parsedRole);
  const isAdmin = parsedRole === "admin";

  const store = await cookies();
  store.set(USER_COOKIE, email, { path: "/", httpOnly: false });
  store.set(MEMBER_COOKIE, isAdmin ? "1" : "1", { path: "/", httpOnly: false });
  if (isSimulated) {
    store.set(ROLE_COOKIE, parsedRole, { path: "/", httpOnly: false });
  }

  return NextResponse.json({ ok: true, user: { email, role: parsedRole } });
}
