"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLockup, BrandMark } from "./brand-mark";
import {
  ChevronRight,
  ShoppingBag,
  Sparkles,
  User,
  LayoutGrid,
  Info,
} from "lucide-react";

const MENU_SECTIONS: {
  label: string;
  items: { name: string; href?: string; note?: string }[];
}[] = [
  {
    label: "03 水晶矿石 · 空间",
    items: [
      { name: "✨ 个人手串定制工坊 (Custom Made)", href: "/crystals/custom/" },
      { name: "现成品作品挑选 (Shop)", href: "/crystals/shop/" },
      { name: "水晶科普星图 (Atlas)", note: "当前浏览", href: "/crystals/discover/" },
      { name: "矿物文章与养护法则 (Articles)", href: "/crystals/articles/" },
    ],
  },
  {
    label: "探索其他业务空间",
    items: [
      { name: "01 塔罗 & 阿卡西记录", href: "/tarot-akashic/" },
      { name: "02 课程 & 工作坊", href: "/workshops/" },
    ],
  },
  {
    label: "品牌与支持",
    items: [
      { name: "关于 UNIQorn", href: "/about/" },
      { name: "联系方式 · 专属咨询", href: "/contact/" },
      { name: "返回官网首页", href: "/" },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="atlas-header relative z-40">
      <div className="flex items-center justify-between px-3 py-3 sm:px-5">
        {/* Left: menu + brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Toggle menu"
              className="atlas-burger group flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-xl transition-colors"
            >
              <span className="atlas-burger-line h-px w-4 transition-all group-hover:w-5" />
              <span className="atlas-burger-line h-px w-5" />
              <span className="atlas-burger-line h-px w-4 transition-all group-hover:w-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="atlas-drawer w-[320px] p-0"
            >
              <SheetHeader className="border-b border-[rgba(30,58,95,0.08)] px-5 py-4">
                <SheetTitle className="sr-only">Site menu</SheetTitle>
                <div className="flex items-center justify-between pr-8">
                  <BrandLockup />
                  <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#1e3a5f]">
                    Menu
                  </span>
                </div>
              </SheetHeader>
              <nav
                aria-label="Primary navigation"
                className="flex h-[calc(100%-73px)] flex-col overflow-y-auto px-5 py-3"
              >
                {MENU_SECTIONS.map((section) => (
                  <div key={section.label} className="mb-4">
                    <p className="atlas-panel-kicker mb-1 pt-2">{section.label}</p>
                    {section.items.map((item) => (
                      <a
                        key={`${section.label}-${item.name}`}
                        href={item.href || "#"}
                        onClick={(e) => {
                          if (!item.href || item.href.startsWith("#")) {
                            e.preventDefault();
                          }
                          setOpen(false);
                        }}
                        className="atlas-drawer-link"
                      >
                        <span className="flex items-center gap-2">
                          {item.name}
                          {item.note && (
                            <span className="rounded-full border border-[#c58b8e]/50 px-2 py-[1px] text-[0.52rem] tracking-[0.16em] text-[#c58b8e]">
                              {item.note}
                            </span>
                          )}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      </a>
                    ))}
                  </div>
                ))}
                <div className="mt-auto pb-6 pt-4 text-[0.6rem] leading-relaxed tracking-[0.14em] text-[rgba(30,58,95,0.42)] uppercase">
                  Kuala Lumpur · UNIQorn Soul Wellness Enterprise
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="atlas-header-lockup flex flex-col items-start gap-0.5">
            <a href="/" aria-label="Go to UNIQorn home" className="block">
              <BrandLockup />
            </a>
            <span className="atlas-header-subbrand hidden text-[0.5rem] uppercase tracking-[0.32em] text-[rgba(30,58,95,0.42)] lg:block">
              UNIQorn Space
            </span>
          </div>
        </div>

        {/* Center brand */}
        <a
          href="/crystals/discover/"
          aria-label="Go to UNIQorn Crystal Atlas"
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        >
          <BrandMark className="atlas-header-center-mark mb-1 h-9 w-9" />
          <span
            className="atlas-header-brand-word text-[0.60rem] tracking-[0.38em] sm:text-[0.70rem]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            UNIQORN ATLAS
          </span>
        </a>

        {/* Right cluster */}
        <nav aria-label="Page navigation" className="flex items-center gap-2 sm:gap-3">
          <a
            href="/crystals/articles/"
            className="atlas-chip hidden md:inline-flex text-[0.7rem]"
            aria-label="Crystal Articles and Care"
          >
            <Info className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>文章专栏</span>
          </a>
          <a
            href="/crystals/custom/"
            className="atlas-chip atlas-chip--primary max-sm:px-3 text-[0.72rem] font-medium border-[#14243b] bg-[#14243b] text-white hover:bg-[#1e3a5f] transition-all shadow-[0_4px_16px_rgba(20,36,59,0.14)]"
            aria-label="Custom Made Bracelet Workshop"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#c58b8e]" strokeWidth={1.8} />
            <span className="max-sm:hidden">手串定制</span>
            <span className="sm:hidden">定制</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function FooterIconRow() {
  return (
    <div className="flex items-center gap-3 text-[rgba(30,58,95,0.42)]">
      <Sparkles className="h-3.5 w-3.5" />
      <Info className="h-3.5 w-3.5" />
    </div>
  );
}
