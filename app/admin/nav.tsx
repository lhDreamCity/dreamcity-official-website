"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "仪表盘", icon: "📊", exact: true },
  { href: "/admin/courses", label: "课程管理", icon: "📚" },
  { href: "/admin/users", label: "用户管理", icon: "👥" },
  { href: "/admin/roles", label: "角色权限", icon: "🔐" },
  { href: "/admin/members", label: "会员管理", icon: "👑" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="card h-fit p-4">
      <div className="mb-4 border-b border-line pb-4">
        <p className="text-sm font-bold text-ink">管理后台</p>
        <p className="mt-1 truncate text-[12px] text-ink-soft">{email}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                active ? "bg-brand text-white" : "text-ink hover:bg-bg"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
