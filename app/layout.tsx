import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://simonchenjh98.github.io/paperswipe-atlas/"),
  title: "PaperSwipe — Your daily edge in research",
  description: "Seven high-signal research breakthroughs, ranked for what you are building and explained in plain English.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "PaperSwipe — Know what matters before everyone else",
    description: "The 10-minute daily research briefing for people building the future.",
    images: [{ url: "/og.png", width: 1728, height: 910, alt: "PaperSwipe daily frontier briefing" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
