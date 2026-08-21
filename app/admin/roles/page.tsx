import {
  ALL_ROLES,
  ALL_PERMISSIONS,
  ROLE_LABELS,
  PERMISSION_LABELS,
  ROLE_PERMISSIONS,
} from "@/app/lib/rbac";

export default function AdminRolesPage() {
  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">角色权限</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            RBAC 模型 · 由 <code className="rounded bg-bg px-1">app/lib/rbac.ts</code> 驱动
          </p>
        </div>
        <button className="btn btn-primary !py-2 text-[13px]">+ 新建角色</button>
      </header>

      {/* 权限矩阵 */}
      <div className="card mb-6 overflow-hidden p-5">
        <h2 className="mb-4 text-lg font-bold text-ink">权限矩阵</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-2 pr-4 font-semibold">权限</th>
                {ALL_ROLES.map((r) => (
                  <th key={r} className="px-3 py-2 text-center font-semibold">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map((p) => (
                <tr key={p} className="border-b border-line/60">
                  <td className="py-2 pr-4">
                    <span className="font-medium text-ink">{PERMISSION_LABELS[p]}</span>
                    <span className="ml-2 text-[11px] text-ink-soft">{p}</span>
                  </td>
                  {ALL_ROLES.map((r) => {
                    const granted = ROLE_PERMISSIONS[r].includes(p);
                    return (
                      <td key={r} className="px-3 py-2 text-center">
                        {granted ? (
                          <span className="text-gold">✓</span>
                        ) : (
                          <span className="text-ink/30">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 每个角色的权限明细 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ALL_ROLES.map((role) => {
          const perms = ROLE_PERMISSIONS[role];
          return (
            <div key={role} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-ink">{ROLE_LABELS[role]}</h3>
                <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] text-ink-soft">
                  {perms.length} 项权限
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_PERMISSIONS.map((p) => (
                  <span
                    key={p}
                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                      perms.includes(p)
                        ? "bg-gold-soft font-semibold text-gold"
                        : "bg-bg text-muted line-through"
                    }`}
                  >
                    {PERMISSION_LABELS[p]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
