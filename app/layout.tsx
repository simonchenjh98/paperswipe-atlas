import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaperSwipe — 发现、筛选并真正读完论文",
  description: "AI 驱动的论文发现、滑动筛选、个人论文库、阅读计划与知识图谱。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
