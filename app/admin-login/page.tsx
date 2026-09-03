"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">加载中…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
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
    <section className="flex min-h-[70vh] items-center justify-center bg-bg px-4 py-24">
      <div className="card w-full max-w-[400px] p-10">
        <h1 className="mb-2 text-center text-2xl font-bold text-ink">管理后台登录</h1>
        <p className="mb-8 text-center text-[14px] text-muted">仅限授权管理员访问</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-[13px] text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[14px] font-medium text-ink">管理员账号</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
              placeholder="请输入管理员账号"
            />
          </div>
          <div>
            <label className="mb-1 block text-[14px] font-medium text-ink">密码</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
              placeholder="请输入密码"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full !py-3">
            登录
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted">
          返回
          <Link href="/" className="mx-1 font-semibold text-gold hover:underline">
            首页
          </Link>
        </p>
      </div>
    </section>
  );
}
