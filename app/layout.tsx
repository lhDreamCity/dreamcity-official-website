import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CatChatbot from "@/app/components/cat-chatbot";
import { getCurrentUser } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "梦之城AI赋能中心",
  description:
    "梦之城AI赋能中心：OPC搭建、个人品牌搭建、新媒体账号运营、AI课程一站式 AI 赋能服务。",
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
