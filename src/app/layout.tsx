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
  title: "Interactive Crystal Atlas | Crystal Library",
  description:
    "Explore the bead library as an interactive crystal atlas with real stone images, color notes, symbolic styling, and builder-ready size variants.",
  keywords: [
    "crystal library",
    "crystal atlas",
    "gemstone bracelet",
    "beaded bracelet",
    "build your own bracelet",
  ],
  openGraph: {
    title: "Interactive Crystal Atlas | Crystal Library",
    description:
      "Explore the bead library as an interactive crystal atlas with real stone images, color notes, symbolic styling, and builder-ready size variants.",
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
