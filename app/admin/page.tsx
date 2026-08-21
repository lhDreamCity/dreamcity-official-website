import Link from "next/link";
import { courses } from "@/app/lib/data";
import { adminStats } from "@/app/lib/admin-data";

const STATS = [
  { label: "注册用户", value: adminStats.totalUsers, suffix: "人", icon: "👥", href: "/admin/users" },
  { label: "有效会员", value: adminStats.activeMembers, suffix: "人", icon: "👑", href: "/admin/members" },
  { label: "全部课程", value: courses.length, suffix: "门", icon: "📚", href: "/admin/courses" },
  { label: "课时总数", value: courses.reduce((n, c) => n + c.lessons.length, 0), suffix: "节", icon: "🎬", href: "/admin/courses" },
  { label: "累计订单", value: adminStats.totalOrders, suffix: "单", icon: "🧾", href: "/admin/members" },
  { label: "累计营收", value: "¥" + adminStats.revenue.toLocaleString(), suffix: "", icon: "💰", href: "/admin/members" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">仪表盘</h1>
        <p className="mt-1 text-[13px] text-ink-soft">梦之城 AI 赋能中心 · 运营总览</p>
      </header>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STATS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card group p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[11px] text-ink-soft group-hover:text-brand">查看 →</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-ink">
              {s.value}
              {s.suffix && <span className="ml-1 text-sm font-medium text-ink-soft">{s.suffix}</span>}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="card mt-6 p-5">
        <h2 className="mb-4 text-lg font-bold text-ink">快捷操作</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/admin/courses" title="管理课程" desc="增改课程与课时" />
          <QuickLink href="/admin/roles" title="配置角色" desc="分配角色权限" />
          <QuickLink href="/admin/users" title="管理用户" desc="查看与搜索用户" />
          <QuickLink href="/admin/members" title="会员管理" desc="查看会员状态" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-line bg-bg/50 p-4 transition-colors hover:border-gold"
    >
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[12px] text-ink-soft">{desc}</p>
    </Link>
  );
}
