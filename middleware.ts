import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, USER_COOKIE } from "@/app/lib/auth";

/* ============================================================
   路由级 RBAC 守卫（Edge 中间件）
   在请求进入页面/接口前拦截，按角色决定放行或重定向。

   当前是开发期 cookie 模拟：
     - dcw_user  登录邮箱
     - dcw_role  角色（admin/teacher/editor/member）
   上线后替换为校验 Supabase session 即可，路径规则不变。
   ============================================================ */

/** 需要指定角色的路由前缀 → 允许的角色 */
const ROLE_PROTECTED: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/dashboard", roles: ["admin", "teacher", "editor"] },
];

/** 需要登录的路由前缀 */
const AUTH_PROTECTED: string[] = ["/account", "/member"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 先查登录态
  const email = request.cookies.get(USER_COOKIE)?.value;
  const isAuthed = !!email;

  // 需要登录的路由
  if (AUTH_PROTECTED.some((p) => pathname.startsWith(p)) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // 需要角色的路由
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  for (const rule of ROLE_PROTECTED) {
    if (pathname.startsWith(rule.prefix)) {
      // 未登录或角色不符 → 403
      if (!role || !rule.roles.includes(role)) {
        const url = request.nextUrl.clone();
        url.pathname = "/forbidden";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // 只对需要保护的路径执行，提高性能
  matcher: ["/admin/:path*", "/dashboard/:path*", "/account/:path*", "/member/:path*"],
};
