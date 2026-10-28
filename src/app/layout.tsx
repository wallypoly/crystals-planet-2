import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Cinzel,
  Manrope,
  GFS_Didot,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const gfsDidot = GFS_Didot({
  variable: "--font-gfs-didot",
  subsets: ["greek"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "UNIQorn 水晶矿石图鉴 · 交互式能量星图 | UNIQorn Soul Wellness",
  description:
    "UNIQorn 交互式水晶矿石星图图鉴：探索天然原矿能量、对应脉轮、莫氏硬度与能量搭配灵感，支持挑选晶石量身开启私人手串高定 (Custom Made)。",
  keywords: [
    "UNIQorn 水晶",
    "水晶科普",
    "天然水晶手串",
    "手串定制",
    "Custom Made Bracelet",
    "脉轮水晶",
    "水晶能量图鉴",
  ],
  openGraph: {
    title: "UNIQorn 水晶矿石图鉴 · 交互式能量星图",
    description:
      "探索天然原矿能量、对应脉轮、莫氏硬度与能量搭配灵感，支持挑选晶石量身开启私人手串高定 (Custom Made)。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${cinzel.variable} ${manrope.variable} ${gfsDidot.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
