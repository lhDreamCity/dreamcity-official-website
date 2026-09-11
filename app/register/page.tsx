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
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  async function handleSendCode() {
    setError("");
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "register" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发送失败，请稍后重试");
        setSending(false);
        return;
      }
      if (data.devCode) {
        setCode(data.devCode);
      }
      setSending(false);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      setError("网络错误，请稍后重试");
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, nickname }),
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
            <label className="mb-1 block text-[14px] font-medium text-ink">手机号</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
              placeholder="请输入 11 位手机号"
            />
          </div>
          <div>
            <label className="mb-1 block text-[14px] font-medium text-ink">验证码</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] text-ink outline-none focus:border-gold"
                placeholder="请输入验证码"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending || countdown > 0}
                className="shrink-0 rounded-lg border border-gold px-3 py-2.5 text-[13px] font-semibold text-gold transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : sending ? "发送中…" : "获取验证码"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full !py-3">
            注册
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-muted">
          开发期验证码会由服务端自动填入，无需记忆。
        </p>

        <p className="mt-5 text-center text-[14px] text-muted">
          已有账号？
          <Link href="/login" className="font-semibold text-gold hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </section>
  );
}