import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, USER_COOKIE } from "@/app/lib/auth";
import { verifyValue } from "@/app/lib/session-secret";

/* ============================================================
   路由级 RBAC 守卫（Edge Proxy，Next 16）
   在请求进入页面/接口前拦截，按角色决定放行或重定向。

   Cookie 值是 HMAC 签过的 payload.signature。Proxy 必须先
   verifyValue 才能信任 claim —— 否则用户可以自己改 cookie
   把 dcw_role 改成 "admin"。

   上线后这套签名机制替换为 Supabase session 即可，路径规则不变。
   ============================================================ */

const ROLE_PROTECTED: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/dashboard", roles: ["admin", "teacher", "editor"] },
];

const AUTH_PROTECTED: string[] = ["/account", "/member"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verify the user cookie signature before trusting "is logged in".
  const userRaw = request.cookies.get(USER_COOKIE)?.value;
  const user = await verifyValue(userRaw);
  const isAuthed = !!user;

  if (AUTH_PROTECTED.some((p) => pathname.startsWith(p)) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Verify the role cookie signature before trusting the role claim.
  const roleRaw = request.cookies.get(ROLE_COOKIE)?.value;
  const role = await verifyValue(roleRaw);

  for (const rule of ROLE_PROTECTED) {
    if (pathname.startsWith(rule.prefix)) {
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
  matcher: ["/admin/:path*", "/dashboard/:path*", "/account/:path*", "/member/:path*"],
};