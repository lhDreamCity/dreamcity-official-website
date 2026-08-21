"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MembershipActions({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  // demo 专用：模拟开通会员（真实支付接入前便于验证会员流程）
  async function handleDemoClaim() {
    setProcessing(true);
    await fetch("/api/membership/claim", { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => alert("支付功能即将上线，敬请期待。")}
        className="btn btn-gold w-full !py-3"
      >
        立即支付开通
      </button>
      <button
        type="button"
        disabled={processing}
        onClick={handleDemoClaim}
        className="btn btn-ghost w-full !py-2.5 text-[13px]"
      >
        {processing ? "开通中…" : "（Demo）模拟开通会员"}
      </button>
    </div>
  );
}
