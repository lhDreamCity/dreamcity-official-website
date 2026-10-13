import { loadAdminUsers, loadAdminStats } from "@/app/lib/admin-data";

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "活跃", cls: "bg-gold-soft text-gold" },
  disabled: { label: "已停用", cls: "bg-bg text-muted" },
  deleted: { label: "已注销", cls: "bg-bg text-muted" },
};

export default async function AdminMembersPage() {
  const [users, stats] = await Promise.all([loadAdminUsers(), loadAdminStats()]);
  // 登录学员 = status === "active" 的用户（"会员" 在新模型下即"可登录可学习"）
  const members = users.filter((u) => u.status === "active");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">活跃用户</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          登录学员 · 可学习全部课程
        </p>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="活跃" value={stats.activeUsers} />
        <StatCard label="已停用" value={stats.disabledUsers} />
        <StatCard label="近 7 天新增" value={stats.weeklyNewUsers} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th className="py-3 pl-5 pr-4 font-semibold">用户</th>
              <th className="px-3 py-3 font-semibold">状态</th>
              <th className="px-3 py-3 font-semibold">加入时间</th>
              <th className="px-3 py-3 font-semibold">最近活跃</th>
              <th className="py-3 pl-3 pr-5 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((u) => (
              <tr key={u.id} className="border-b border-line/60 hover:bg-bg/40">
                <td className="py-3 pl-5 pr-4">
                  <p className="font-medium text-ink">{u.nickname}</p>
                  <p className="text-[12px] text-ink-soft">{u.primaryIdentifier}</p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[u.status]!.cls}`}
                  >
                    {STATUS[u.status]!.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-ink-soft">{u.joinDate}</td>
                <td className="px-3 py-3 text-ink-soft">{u.lastActive}</td>
                <td className="py-3 pl-3 pr-5 text-right">
                  <button className="text-[13px] font-semibold text-brand hover:underline">
                    管理
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-ink-soft">
                  暂无活跃用户
                </td>
              </tr>
            )}
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
