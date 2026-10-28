"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLockup } from "./brand-mark";
import { ChevronRight, Compass, Info, Sparkles } from "lucide-react";
import { SPACE_ENTRIES } from "@/components/frame/spaces";
import "@/app/frame.css";

const MENU_SECTIONS: {
  label: string;
  items: { name: string; href?: string; note?: string }[];
}[] = [
  {
    label: "03 水晶矿石 · 空间",
    items: [
      { name: "✨ 个人手串定制工坊 (Custom Made)", href: "/crystals/custom/" },
      { name: "现成品作品挑选 (Shop)", href: "/crystals/shop/" },
      { name: "水晶科普星图 (Atlas)", note: "当前浏览", href: "/crystals/wiki/" },
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

/**
 * Header is two zones, not a logo between two buttons.
 *
 * Left  — identity + orientation: menu, UNIQorn lockup, and a
 *         "you are here" marker for the current space.
 * Right — the exits: the four sibling spaces, split into two
 *         groups by a hairline (create/buy vs. read/reach). The
 *         描边 chip tone is unchanged from the previous build.
 *
 * The centred UNIQORN ATLAS roundel was removed: the left lockup
 * already carries the brand, and a second mark at the optical
 * centre competed with the atlas itself.
 */
export function SiteHeader({
  currentSpace = "水晶矿石图鉴",
}: {
  currentSpace?: string;
}) {
  const [open, setOpen] = useState(false);

  // Group 1 = making & buying, group 2 = reading & reaching.
  const [makeBuy, readReach] = [
    SPACE_ENTRIES.filter((s) => s.key === "custom" || s.key === "shop"),
    SPACE_ENTRIES.filter((s) => s.key === "articles" || s.key === "contact"),
  ];

  return (
    <header className="atlas-header relative z-40">
      <div className="flex items-center justify-between gap-4 px-3 py-3 sm:px-5">
        {/* ---------- Left zone: identity + where you are ---------- */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
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
                    <p className="atlas-panel-kicker mb-1 pt-2">
                      {section.label}
                    </p>
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
                            <span className="rounded-full border border-[var(--rose)]/50 px-2 py-[1px] text-[0.52rem] tracking-[0.16em] text-[var(--rose)]">
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

          {/* "You are here" — a marker, not a button. The rose dot
              is the same one the drawer uses for 当前浏览. */}
          <p className="frame-here">
            <span className="frame-here-dot" aria-hidden="true" />
            <span className="frame-here-name">{currentSpace}</span>
            <span className="frame-here-tag">你在这里</span>
          </p>
        </div>

        {/* ---------- Right zone: exits into the other spaces ---------- */}
        <nav
          aria-label="Other spaces"
          className="frame-header-spaces hidden md:flex"
        >
          {[makeBuy, readReach].map((group, gi) => (
            <div key={gi} className="frame-header-group contents">
              {gi > 0 && (
                <span className="frame-header-sep" aria-hidden="true" />
              )}
              {group.map((space) => {
                const Icon = space.icon;
                return (
                  <a
                    key={space.key}
                    href={space.href}
                    className="atlas-chip frame-space-chip text-[0.72rem] font-medium text-[var(--navy)]"
                    aria-label={`${space.name} · ${space.en}`}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      strokeWidth={1.7}
                      style={{
                        color:
                          space.key === "custom" ? "var(--rose)" : undefined,
                      }}
                    />
                    <span>{space.name}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Mobile: the four spaces fold back into the drawer, so the
            header keeps a single trigger instead of a squeezed row.
            The drawer above already lists all four. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="atlas-chip frame-space-trigger max-sm:px-3"
          aria-label="进入其他空间"
        >
          <Compass className="h-3.5 w-3.5 text-[var(--rose)]" strokeWidth={1.8} />
          <span>空间</span>
        </button>
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
