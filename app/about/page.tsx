export const metadata = { title: "关于我们 - 梦之城AI赋能中心" };

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-20 text-white">
        <div className="container-page">
          <span className="section-tag !text-gold-bright">About</span>
          <h1 className="text-4xl font-bold">关于我们</h1>
          <p className="mt-3 text-lg text-white/70">技术平权时代，让 AI 成为你的增长杠杆。</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="card p-10">
              <h3 className="mb-4 text-xl font-bold text-ink">我们的使命</h3>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                梦之城AI赋能中心致力于用 AI 技术降低内容创业的门槛。我们相信技术平权，每个人都能借助 AI
                以更低的成本、更快的速度，构建属于自己的可持续内容引擎。
              </p>
            </div>
            <div className="card p-10">
              <h3 className="mb-4 text-xl font-bold text-ink">我们做什么</h3>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                我们提供 OPC 搭建、个人品牌搭建与新媒体账号运营三大服务体系，并开设体系化的 AI
                实战课程，帮助个人与团队从 0 到 1 跑通属于自己的第一单。
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
