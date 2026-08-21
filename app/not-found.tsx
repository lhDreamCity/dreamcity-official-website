import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "页面不存在 - 梦之城AI赋能中心",
};

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-8xl font-black leading-none text-gold/20">404</div>
      <h1 className="mb-3 text-3xl font-bold text-ink">页面走丢了</h1>
      <p className="mb-8 max-w-md text-muted">
        你访问的页面不存在或已被移除。别担心，让 AI 猫咪带你回到正轨。
      </p>
      <div className="flex flex-wrap gap-4">
        <Link href="/" className="btn btn-primary">
          回到首页
        </Link>
        <Link href="/courses" className="btn btn-gold">
          浏览课程
        </Link>
      </div>
    </section>
  );
}
