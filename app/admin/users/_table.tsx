"use client";

import { useMemo, useState } from "react";
import type { AdminUserRow } from "@/app/lib/admin-data";
import { ROLE_LABELS } from "@/app/lib/rbac";

const STATUS: Record<AdminUserRow["status"], { label: string; cls: string }> = {
  active: { label: "活跃", cls: "bg-gold-soft text-gold" },
  disabled: { label: "已停用", cls: "bg-bg text-muted" },
  deleted: { label: "已注销", cls: "bg-bg text-muted" },
};

export default function UsersTable({ users }: { users: AdminUserRow[] }) {
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return users;
    return users.filter(
      (u) =>
        u.nickname.toLowerCase().includes(k) ||
        u.primaryIdentifier.toLowerCase().includes(k),
    );
  }, [users, keyword]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">用户管理</h1>
        <p className="mt-1 text-[13px] text-ink-soft">共 {users.length} 个用户</p>
      </header>

      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索昵称或手机号…"
          className="w-full max-w-sm rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th className="py-3 pl-5 pr-4 font-semibold">用户</th>
              <th className="px-3 py-3 font-semibold">角色</th>
              <th className="px-3 py-3 font-semibold">状态</th>
              <th className="px-3 py-3 font-semibold">加入时间</th>
              <th className="px-3 py-3 font-semibold">最近活跃</th>
              <th className="py-3 pl-3 pr-5 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-line/60 hover:bg-bg/40">
                <td className="py-3 pl-5 pr-4">
                  <p className="font-medium text-ink">{u.nickname}</p>
                  <p className="text-[12px] text-ink-soft">{u.primaryIdentifier}</p>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-white"
                      >
                        {ROLE_LABELS[r] ?? r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[u.status].cls}`}
                  >
                    {STATUS[u.status].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-ink-soft">{u.joinDate}</td>
                <td className="px-3 py-3 text-ink-soft">{u.lastActive}</td>
                <td className="py-3 pl-3 pr-5 text-right">
                  <button className="text-[13px] font-semibold text-brand hover:underline">
                    编辑
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-ink-soft">
                  未找到匹配的用户
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
