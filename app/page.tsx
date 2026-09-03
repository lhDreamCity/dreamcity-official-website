import Link from "next/link";
import { courses } from "@/app/lib/data";
import { getCurrentUser } from "@/app/lib/auth";

const SERVICES = [
  {
    icon: "🏗️",
    title: "OPC搭建",
    href: "/services/ecommerce",
    summary: "从零到一的 AI 内容生产体系搭建，助你构建可持续的内容引擎。",
  },
  {
    icon: "✨",
    title: "个人品牌搭建",
    href: "/services/opc",
    summary: "围绕个人定位、视觉与人设，打造有辨识度的个人品牌资产。",
  },
  {
    icon: "📣",
    title: "新媒体账号运营",
    href: "/services/social-media",
    summary: "账号策略、内容规划与数据复盘，让每一次发布都更有价值。",
  },
];

const WHY = [
  { icon: "⚡", title: "高效交付", summary: "AI 工具矩阵加持，大幅缩短从创意到落地的周期。" },
  { icon: "🧭", title: "专业陪跑", summary: "从规划到执行的全程陪伴，确保每一步都走在正确方向上。" },
  { icon: "🌱", title: "持续增长", summary: "以数据和复盘的视角，驱动内容与影响力的持续提升。" },
];

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <>
      {/* 英雄区 */}
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-24 text-white">
        <div className="container-page">
          <span className="mb-5 inline-block rounded-full border border-gold/40 px-4 py-1 text-[13px] font-semibold text-gold-bright">
            AI 赋能 · 内容创业
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            用 AI 之力，<br />
            赋能每一个<span className="grad-text">内容创业者</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            梦之城AI赋能中心专注于 OPC 搭建、个人品牌建设与新媒体运营，助你以更低的成本、更快的速度，构建可持续的内容引擎。
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/courses" className="btn btn-gold !text-[15px]">
              了解课程
            </Link>
            <Link
              href="/contact"
              className="btn btn-ghost !border-white/40 !text-white hover:!border-gold"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>

      {/* 业务中心 */}
      <section className="section">
        <div className="container-page">
          <div className="mb-10">
            <span className="section-tag">Business</span>
            <h2 className="section-title">业务中心</h2>
            <p className="section-desc">围绕内容创业的核心环节，提供一站式 AI 赋能服务。</p>
          </div>
          <div className="grid-3">
            {SERVICES.map((s) => (
              <div key={s.href} className="card p-8">
                <div className="card-icon">{s.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mb-4 text-[14px] text-muted">{s.summary}</p>
                <Link href={s.href} className="text-[14px] font-semibold text-gold hover:underline">
                  了解详情 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 课程预览 */}
      <section className="section bg-bg">
        <div className="container-page">
          <div className="mb-10">
            <span className="section-tag">Courses</span>
            <h2 className="section-title">AI 课程</h2>
            <p className="section-desc">
              登录账号即可学习全部 {courses.length} 套课程。
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {courses.map((course) => (
              <div key={course.slug} className="card overflow-hidden p-0">
                <div className="grid md:grid-cols-[1fr_1.2fr]">
                  <div className="flex items-center justify-center bg-brand-dark">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.cover}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8">
                    <span className="mb-3 inline-flex w-fit rounded-full bg-gold-soft px-3 py-1 text-[12px] font-bold text-gold">
                      {course.level} · {course.duration}
                    </span>
                    <h3 className="mb-1 text-xl font-bold text-ink">{course.title}</h3>
                    <p className="mb-3 text-[14px] text-muted">{course.subtitle}</p>
                    <p className="mb-5 text-[13px] leading-relaxed text-ink-soft">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/courses/${course.slug}`} className="btn btn-primary !py-2 text-[13px]">
                        查看课程目录
                      </Link>
                      {user ? (
                        <Link href={`/courses/${course.slug}`} className="btn btn-gold !py-2 text-[13px]">
                          立即学习
                        </Link>
                      ) : (
                        <Link href={`/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`} className="btn btn-gold !py-2 text-[13px]">
                          登录学习
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 为什么选择梦之城 */}
      <section className="section">
        <div className="container-page">
          <div className="mb-10 max-w-[620px]">
            <span className="section-tag">Why Us</span>
            <h2 className="section-title">为什么选择梦之城</h2>
            <p className="section-desc">技术平权时代，让 AI 成为你的增长杠杆。</p>
          </div>
          <div className="grid-3">
            {WHY.map((w) => (
              <div key={w.title} className="card p-8">
                <div className="card-icon">{w.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-ink">{w.title}</h3>
                <p className="text-[14px] text-muted">{w.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/about" className="btn btn-ghost">
              了解更多关于我们 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
