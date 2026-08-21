import Link from "next/link";

export const metadata = { title: "没有权限 - 梦之城AI赋能中心" };

export default function ForbiddenPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-7xl font-black text-gold">403</p>
        <h1 className="mt-4 text-2xl font-bold text-ink">没有访问权限</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          你的账号角色无权访问此页面。如有疑问请联系管理员。
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            返回首页
          </Link>
          <Link
            href="/courses"
            className="rounded-lg border border-line px-6 py-2.5 text-sm font-semibold text-ink hover:bg-bg"
          >
            浏览课程
          </Link>
        </div>
      </div>
    </section>
  );
}
