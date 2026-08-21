"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">加载中…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(data.error || "登录失败");
    }
  }

  return (
    <section className="flex items-center justify-center bg-bg px-4 py-24">
      <div className="card w-full max-w-[420px] p-10">
        <h1 className="mb-2 text-center text-2xl font-bold text-ink">登录</h1>
        <p className="mb-8 text-center text-[14px] text-muted">登录后即可进入会员中心</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-[13px] text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[14px] font-medium text-ink">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-[14px] font-medium text-ink">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
              placeholder="请输入密码"
            />
          </div>
          <div>
            <label className="mb-1 block text-[14px] font-medium text-ink">
              角色
              <span className="ml-2 text-[11px] text-muted">开发期模拟 · 上线后按账号分配</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
            >
              <option value="member">会员 / 学员</option>
              <option value="editor">运营 / 编辑</option>
              <option value="teacher">讲师</option>
              <option value="admin">超级管理员</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full !py-3">
            登录
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-muted">
          还没有账号？
          <Link href="/register" className="font-semibold text-gold hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </section>
  );
}
