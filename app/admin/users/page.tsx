"use client";

import { useMemo, useState } from "react";
import { adminUsers } from "@/app/lib/admin-data";
import { ROLE_LABELS } from "@/app/lib/rbac";

const MEMBER_STATE: Record<string, { label: string; cls: string }> = {
  active: { label: "有效会员", cls: "bg-gold-soft text-gold" },
  expired: { label: "已过期", cls: "bg-bg text-muted" },
  none: { label: "非会员", cls: "bg-bg text-muted" },
};

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return adminUsers;
    return adminUsers.filter(
      (u) => u.email.toLowerCase().includes(k) || u.nickname.toLowerCase().includes(k),
    );
  }, [keyword]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">用户管理</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          共 {adminUsers.length} 个用户（演示数据，接入 Supabase 后为真实数据）
        </p>
      </header>

      {/* 搜索 */}
      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索邮箱或昵称…"
          className="w-full max-w-sm rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th className="py-3 pl-5 pr-4 font-semibold">用户</th>
              <th className="px-3 py-3 font-semibold">角色</th>
              <th className="px-3 py-3 font-semibold">会员状态</th>
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
                  <p className="text-[12px] text-ink-soft">{u.email}</p>
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
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${MEMBER_STATE[u.membershipStatus].cls}`}>
                    {MEMBER_STATE[u.membershipStatus].label}
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
