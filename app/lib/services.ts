export type Service = {
  slug: string;
  title: string;
  description: string;
  banner: string;
  body: string;
  icon: string;
};

export const services: Service[] = [
  {
    slug: "opc",
    title: "OPC搭建",
    description: "构建 AI 内容生产体系",
    banner: "/img/banner-opc.png",
    icon: "🏗️",
    body: "OPC（One Person Company）通过 AI 工具矩阵将内容生产的每个环节自动化，帮助个人或小团队以极低成本建立可持续的内容引擎。我们提供从工具选型、流程搭建到落地陪跑的全流程服务。",
  },
  {
    slug: "personal-brand",
    title: "个人品牌搭建",
    description: "打造有辨识度的个人资产",
    banner: "/img/banner-personal-brand.png",
    icon: "✨",
    body: "围绕定位、视觉、内容与人设，帮助你建立有辨识度、可信任的个人品牌。包含品牌故事梳理、视觉识别系统、内容矩阵规划等完整服务。",
  },
  {
    slug: "social-media",
    title: "新媒体账号运营",
    description: "让每一次发布都更有价值",
    banner: "/img/banner-social-media.png",
    icon: "📣",
    body: "提供账号策略、内容日历、选题规划与数据复盘服务，帮助你在各大平台高效运营账号，实现影响力与业务的双重增长。",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
