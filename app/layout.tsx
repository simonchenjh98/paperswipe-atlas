import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paperswipe-atlas.weychouascorahap.chatgpt.site"),
  title: "PaperSwipe — 发现、筛选并真正读完论文",
  description: "AI 驱动的论文发现、滑动筛选、个人论文库、阅读计划与知识图谱。",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "PaperSwipe — 别再搜论文了，开始刷论文",
    description: "实时发现、滑动筛选、阅读计划与研究知识图谱。",
    images: [{ url: "/og.png", width: 1728, height: 910, alt: "PaperSwipe 论文发现产品" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
