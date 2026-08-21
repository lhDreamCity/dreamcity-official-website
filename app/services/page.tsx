import Link from "next/link";
import { services } from "@/app/lib/services";

export const metadata = { title: "业务中心 - 梦之城AI赋能中心" };

export default function ServicesPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-20 text-white">
        <div className="container-page">
          <span className="section-tag !text-gold-bright">Business</span>
          <h1 className="text-4xl font-bold">业务中心</h1>
          <p className="mt-3 text-lg text-white/70">
            围绕内容创业的核心环节，提供一站式 AI 赋能服务。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid-3">
            {services.map((s) => (
              <div key={s.slug} className="card p-8">
                <div className="card-icon">{s.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mb-1 text-[13px] text-muted">{s.description}</p>
                <p className="mb-4 mt-2 text-[14px] text-ink-soft">{s.body}</p>
                <Link href={`/services/${s.slug}`} className="text-[14px] font-semibold text-gold hover:underline">
                  了解详情 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
