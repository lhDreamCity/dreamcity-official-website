import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CatChatbot from "@/app/components/cat-chatbot";
import { getCurrentUser } from "@/app/lib/auth";
import { SITE } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} - 用 AI 之力赋能内容创业`,
    template: `%s - ${SITE.name}`,
  },
  description:
    "梦之城AI赋能中心：OPC搭建、个人品牌搭建、新媒体账号运营、AI课程一站式 AI 赋能服务。",
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  keywords: ["AI", "OPC", "个人品牌", "新媒体运营", "AI课程", "内容创业"],
  authors: [{ name: SITE.name }],
  creator: SITE.company,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} - 用 AI 之力赋能内容创业`,
    description:
      "OPC搭建、个人品牌搭建、新媒体账号运营、AI课程一站式 AI 赋能服务。",
    images: [
      {
        url: "/img/banner-ecommerce.png",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CatChatbot />
      </body>
    </html>
  );
}