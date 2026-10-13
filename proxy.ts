import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/app/lib/auth";

/* ============================================================
   路由级守卫 + 站点安全头（Edge Proxy，Next 16）

   Edge runtime 不能查 libsql（native binding 不可用）。所以 proxy 仅做：
     - "是否已登录"判断：dcw_sid cookie 存在即视为登录。
     - 未登录访问受保护路径 → 重定向 /login。
     - 给所有响应打 4 个安全头（HSTS / nosniff / Referrer-Policy / X-Frame-Options）。
       CSP 暂不加（cat-chatbot streaming + Next dev mode inline 复杂，单开一个 PR）。

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

/* 4 个安全头常量化。HSTS max-age 1 年 + includeSubDomains；
   长期应加 preload（提交到 hstspreload.org），但先观察一段时间再决定。 */
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
};

function withSecurityHeaders(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sid = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = !!sid;

  if (AUTH_PROTECTED.some((p) => pathname.startsWith(p)) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return withSecurityHeaders(NextResponse.redirect(url));
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
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // 全站生效（含 /、/courses/...、/about、/contact、/api/*）。
  // 排除 _next 内部资源和 favicon，省 proxy 跑一次的开销。
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};