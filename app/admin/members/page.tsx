import { adminUsers, adminStats } from "@/app/lib/admin-data";

const STATE: Record<string, { label: string; cls: string }> = {
  active: { label: "有效", cls: "bg-gold-soft text-gold" },
  expired: { label: "已过期", cls: "bg-bg text-muted" },
  none: { label: "非会员", cls: "bg-bg text-muted" },
};

const PLAN = ["年卡会员", "月卡会员", "终身会员", "—"];

export default function AdminMembersPage() {
  const members = adminUsers.filter((u) => u.membershipStatus !== "none");

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">会员管理</h1>
          <p className="mt-1 text-[13px] text-ink-soft">付费会员订阅管理</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gold">¥{adminStats.revenue.toLocaleString()}</p>
          <p className="text-[11px] text-ink-soft">累计营收（演示）</p>
        </div>
      </header>

      {/* 统计 */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="有效会员" value={adminStats.activeMembers} />
        <StatCard label="已过期" value={adminStats.expiredMembers} />
        <StatCard label="累计订单" value={adminStats.totalOrders} />
      </div>

      {/* 会员列表 */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th className="py-3 pl-5 pr-4 font-semibold">会员</th>
              <th className="px-3 py-3 font-semibold">套餐</th>
              <th className="px-3 py-3 font-semibold">状态</th>
              <th className="px-3 py-3 font-semibold">加入时间</th>
              <th className="py-3 pl-3 pr-5 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((u, i) => (
              <tr key={u.id} className="border-b border-line/60 hover:bg-bg/40">
                <td className="py-3 pl-5 pr-4">
                  <p className="font-medium text-ink">{u.nickname}</p>
                  <p className="text-[12px] text-ink-soft">{u.email}</p>
                </td>
                <td className="px-3 py-3">{PLAN[i % PLAN.length]}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATE[u.membershipStatus].cls}`}>
                    {STATE[u.membershipStatus].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-ink-soft">{u.joinDate}</td>
                <td className="py-3 pl-3 pr-5 text-right">
                  <button className="text-[13px] font-semibold text-brand hover:underline">
                    管理
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-1 text-[12px] text-ink-soft">{label}</p>
    </div>
  );
}
