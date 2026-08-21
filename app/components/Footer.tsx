import Link from "next/link";

const BUSINESS = [
  { label: "OPC搭建", href: "/services/opc" },
  { label: "个人品牌搭建", href: "/services/personal-brand" },
  { label: "新媒体账号运营", href: "/services/social-media" },
];

const NAV = [
  { label: "首页", href: "/" },
  { label: "业务中心", href: "/services" },
  { label: "课程", href: "/courses" },
  { label: "关于我们", href: "/about" },
  { label: "合作交流", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-3 text-lg font-bold">梦之城AI赋能中心</div>
            <p className="text-[14px] text-white/60">以 AI 之力，赋能每一位内容创业者。</p>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-semibold text-gold-bright">业务中心</h4>
            <ul className="space-y-2 text-[14px] text-white/70">
              {BUSINESS.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className="transition-colors hover:text-gold-bright">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-semibold text-gold-bright">网站导航</h4>
            <ul className="space-y-2 text-[14px] text-white/70">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="transition-colors hover:text-gold-bright">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-semibold text-gold-bright">联系我们</h4>
            <ul className="space-y-2 text-[14px] text-white/70">
              <li>邮箱：hello@dreamcity.ai</li>
              <li>电话：400-000-0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-[13px] text-white/50">
          © 2026 梦之城AI赋能中心 · 保留所有权利
        </div>
      </div>
    </footer>
  );
}
