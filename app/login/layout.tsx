import { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - 梦之城AI赋能中心",
  description: "登录梦之城AI赋能中心，开启你的AI学习之旅。",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
