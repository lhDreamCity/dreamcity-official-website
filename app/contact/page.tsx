import { CONTACT, SITE } from "@/app/lib/site-config";

export const metadata = { title: "合作交流 - 梦之城AI赋能中心" };

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-20 text-white">
        <div className="container-page">
          <span className="section-tag !text-gold-bright">Contact</span>
          <h1 className="text-4xl font-bold">合作交流</h1>
          <p className="mt-3 text-lg text-white/70">期待与您建立联系，共同探索 AI 赋能的可能性。</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="card mx-auto max-w-[720px] p-10">
            <h3 className="mb-6 text-xl font-bold text-ink">联系我们</h3>
            <ul className="space-y-4 text-[15px] text-ink-soft">
              <li>
                <span className="mr-2 font-semibold text-ink">公司：</span>
                {SITE.company}
              </li>
              <li>
                <span className="mr-2 font-semibold text-ink">邮箱：</span>
                <a href={`mailto:${CONTACT.email}`} className="text-gold hover:underline">
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <span className="mr-2 font-semibold text-ink">电话：</span>
                <a href={`tel:${CONTACT.phone}`} className="text-gold hover:underline">
                  {CONTACT.phone}
                </a>
              </li>
            </ul>
            <div className="mt-8 rounded-xl border border-dashed border-gold/50 bg-gold-soft/40 p-6 text-[14px] text-ink-soft">
              {CONTACT.note}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}