"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">加载中…</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(data.error || "注册失败");
    }
  }

  return (
    <section className="flex items-center justify-center bg-bg px-4 py-24">
      <div className="card w-full max-w-[420px] p-10">
        <h1 className="mb-2 text-center text-2xl font-bold text-ink">注册</h1>
        <p className="mb-8 text-center text-[14px] text-muted">创建学员账号</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-[13px] text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[14px] font-medium text-ink">昵称</label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
              placeholder="你的昵称"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
              placeholder="至少 6 位"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full !py-3">
            注册
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-muted">
          已有账号？
          <Link href="/login" className="font-semibold text-gold hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </section>
  );
}
