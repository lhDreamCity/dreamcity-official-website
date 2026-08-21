"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/app/lib/types";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  {
    label: "业务中心",
    href: "/services",
    children: [
      { label: "OPC搭建", href: "/services/opc" },
      { label: "个人品牌搭建", href: "/services/personal-brand" },
      { label: "新媒体账号运营", href: "/services/social-media" },
    ],
  },
  { label: "课程", href: "/courses" },
  { label: "关于我们", href: "/about" },
  { label: "合作交流", href: "/contact" },
];

export default function Header({ user }: { user: User | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="site-header">
      <div className="container-page flex h-[68px] items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-[19px] text-ink">
          <Image
            src="/avator.png"
            alt="梦之城AI赋能中心"
            width={40}
            height={40}
            className="logo-img"
            priority
          />
          <span className="hidden sm:inline">梦之城AI赋能中心</span>
        </Link>

        {/* 桌面主导航 */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <li key={item.label} className="group relative">
                  <span className="cursor-pointer text-[15px] text-ink transition-colors hover:text-gold">
                    {item.label} ▾
                  </span>
                  <ul className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-2 rounded-xl border border-line bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block whitespace-nowrap rounded-lg px-4 py-2 text-[14px] text-ink transition-colors hover:bg-bg hover:text-gold"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`text-[15px] transition-colors hover:text-gold ${
                      isActive(item.href) ? "font-semibold text-gold" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        {/* 桌面账号区 */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.isMember && (
                <span className="rounded-full bg-gold-soft px-3 py-1 text-[12px] font-bold text-gold">
                  会员
                </span>
              )}
              <Link href="/account" className="text-[14px] text-ink-soft hover:text-gold">
                {user.nickname || user.email}
              </Link>
              <a href="/api/logout" className="btn btn-ghost !py-1.5 text-[13px]">
                退出
              </a>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !py-1.5 text-[13px]">
                登录
              </Link>
              <Link href="/register" className="btn btn-primary !py-1.5 text-[13px]">
                注册
              </Link>
            </>
          )}
        </div>

        {/* 移动端汉堡按钮 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-line md:hidden"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-ink transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-ink transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* 移动端菜单 */}
      {menuOpen && (
        <div className="border-t border-line bg-white md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="px-3 py-2 text-[14px] font-semibold text-muted">
                    {item.label}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMenuOpen(false)}
                      className={`rounded-lg px-5 py-2 text-[14px] transition-colors ${
                        isActive(child.href)
                          ? "bg-gold-soft font-semibold text-gold"
                          : "text-ink hover:bg-bg hover:text-gold"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-[15px] transition-colors ${
                    isActive(item.href)
                      ? "bg-gold-soft font-semibold text-gold"
                      : "text-ink hover:bg-bg hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}

            {/* 移动端账号区 */}
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] text-ink hover:bg-bg hover:text-gold"
                  >
                    {user.nickname || user.email}
                  </Link>
                  <a
                    href="/api/logout"
                    className="btn btn-ghost !justify-start px-3 text-[14px]"
                  >
                    退出登录
                  </a>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-ghost text-[14px]"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary text-[14px]"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
