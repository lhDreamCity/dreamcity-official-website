import Link from "next/link";
import { getCurrentUser } from "@/app/lib/auth";
import { MEMBERSHIP_PRICE } from "@/app/lib/data";
import MembershipActions from "@/app/components/MembershipActions";

export const metadata = { title: "开通会员 - 梦之城AI赋能中心" };

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const user = await getCurrentUser();
  const redirectTo = redirect || "/account";

  return (
    <section className="flex items-center justify-center bg-bg px-4 py-24">
      <div className="w-full max-w-[520px]">
        {/* 已是会员 */}
        {user?.isMember ? (
          <div className="card p-10 text-center">
            <span className="mb-4 inline-block text-5xl">🎉</span>
            <h1 className="mb-2 text-2xl font-bold text-ink">您已是会员</h1>
            <p className="mb-8 text-[15px] text-muted">
              您已开通永久全站会员，可畅学全部课程。
            </p>
            <Link href={redirectTo} className="btn btn-primary">
              继续学习
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            {/* 会员权益头部 */}
            <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft p-8 text-center text-white">
              <span className="section-tag !text-gold-bright">Membership</span>
              <h1 className="mb-2 text-3xl font-bold">永久全站会员</h1>
              <p className="text-[15px] text-white/70">一次开通，畅学全部 AI 实战课程</p>
              <div className="mt-6 flex items-end justify-center gap-2">
                <span className="text-4xl font-bold text-gold-bright">
                  ¥{MEMBERSHIP_PRICE.toLocaleString()}
                </span>
                <span className="mb-2 text-[14px] text-white/60">/ 永久</span>
              </div>
            </div>

            {/* 权益列表 */}
            <div className="p-8">
              <ul className="mb-8 space-y-3 text-[15px] text-ink-soft">
                {[
                  "解锁全部课程视频与图文教程",
                  "获取课程配套 SOP 与提示词资源包",
                  "支持多设备学习，进度云端同步",
                  "永久有效，不限次回看",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-gold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {user ? (
                <MembershipActions redirectTo={redirectTo} />
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-[14px] text-muted">开通会员前，请先登录账号</p>
                  <Link
                    href={`/login?redirect=${encodeURIComponent("/membership?redirect=" + encodeURIComponent(redirectTo))}`}
                    className="btn btn-gold w-full"
                  >
                    登录后开通
                  </Link>
                </div>
              )}

              <p className="mt-6 text-center text-[12px] text-muted">
                * 当前为 demo 占位，支付功能接入后即可在线开通。
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
