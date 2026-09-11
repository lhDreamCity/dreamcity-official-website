import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/app/lib/auth";

/* ============================================================
   路由级守卫（Edge Proxy，Next 16）

   Edge runtime 不能查 libsql（native binding 不可用）。所以 proxy 仅做：
     - "是否已登录"判断：dcw_sid cookie 存在即视为登录。
     - 未登录访问受保护路径 → 重定向 /login。

   真正的角色 / 权限判定放在 page / route handler 里 await getCurrentUser()。
   这里的 Edge 守卫主要是省一次 SSR round-trip：未登录直接 redirect。

   注：cookie 名常量从 app/lib/auth.ts 引入（auth.ts 本身 import 了 DB client，
   但 SESSION_COOKIE 是纯字符串常量，bundle 时会被 tree-shake 到这里 OK）。
   ============================================================ */

const ROLE_PROTECTED: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/dashboard", roles: ["admin", "teacher", "editor"] },
];

const AUTH_PROTECTED: string[] = ["/account", "/member"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sid = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = !!sid;

  if (AUTH_PROTECTED.some((p) => pathname.startsWith(p)) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Role-protected: 仅 admin / teacher / editor 才能进 /admin 等。
  // Edge 不能查 DB，所以这里只做"是否登录"的二次检查：已登录才放行，
  // 登录后再由 page 内 getCurrentUser 判定角色，不匹配则 page 渲染 403。
  // 这是有意为之的取舍：避免 Edge runtime 引入 DB；具体权限由 page 兜底。
  for (const rule of ROLE_PROTECTED) {
    if (pathname.startsWith(rule.prefix) && !isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-login";
      url.search = `?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/account/:path*", "/member/:path*"],
};