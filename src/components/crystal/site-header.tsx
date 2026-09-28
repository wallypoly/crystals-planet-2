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
  items: { name: string; note?: string }[];
}[] = [
  {
    label: "Shop Bracelets",
    items: [
      { name: "Studio Drop", note: "Limited" },
      { name: "Core Collection" },
    ],
  },
  {
    label: "Build Your Bracelet",
    items: [
      { name: "Build Your Own" },
      { name: "Custom Bracelets" },
      { name: "Size Guide" },
      { name: "Saved Designs" },
    ],
  },
  {
    label: "My Bracelets",
    items: [{ name: "My Orders" }, { name: "Saved Designs" }],
  },
  {
    label: "About",
    items: [
      { name: "Brand Facts" },
      { name: "MoonArq Services" },
      { name: "Shipping & Returns" },
      { name: "FAQ" },
      { name: "Contact" },
      { name: "Crystal Library", note: "You are here" },
      { name: "Gifts" },
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
              <SheetHeader className="border-b border-[rgba(246,238,226,0.1)] px-5 py-4">
                <SheetTitle className="sr-only">Site menu</SheetTitle>
                <div className="flex items-center justify-between pr-8">
                  <BrandLockup />
                  <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#a99068]">
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
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                        }}
                        className="atlas-drawer-link"
                      >
                        <span className="flex items-center gap-2">
                          {item.name}
                          {item.note && (
                            <span className="rounded-full border border-[#a99068]/50 px-2 py-[1px] text-[0.52rem] tracking-[0.16em] text-[#cbb98c]">
                              {item.note}
                            </span>
                          )}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      </a>
                    ))}
                  </div>
                ))}
                <div className="mt-auto pb-6 pt-4 text-[0.6rem] leading-relaxed tracking-[0.14em] text-[rgba(239,233,221,0.4)] uppercase">
                  Irvine, California · support@moonarq.studio
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="atlas-header-lockup flex flex-col items-start gap-0.5">
            <a href="#" aria-label="Go to home" className="block">
              <BrandLockup />
            </a>
            <span className="atlas-header-subbrand hidden text-[0.5rem] uppercase tracking-[0.32em] text-[rgba(239,233,221,0.4)] lg:block">
              MoonArq Studio
            </span>
          </div>
        </div>

        {/* Center brand */}
        <a
          href="#"
          aria-label="Go to Crystal Atlas home"
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        >
          <BrandMark className="atlas-header-center-mark mb-1 h-10 w-10" />
          <span
            className="atlas-header-brand-word text-[0.62rem] tracking-[0.42em] sm:text-[0.72rem]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            CRYSTAL ATLAS
          </span>
        </a>

        {/* Right cluster */}
        <nav aria-label="Page navigation" className="flex items-center gap-2 sm:gap-3">
          <a href="#" className="atlas-chip max-sm:px-3" aria-label="0 items in cart">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
            <span className="max-sm:hidden">0</span>
            <span className="max-sm:hidden">Cart</span>
          </a>
          <a href="#" className="atlas-chip max-sm:hidden" aria-label="Account">
            <User className="h-4 w-4" strokeWidth={1.6} />
            Account
          </a>
          <a href="#" className="atlas-chip hidden md:inline-flex" aria-label="Build your own bracelet">
            <LayoutGrid className="h-4 w-4" strokeWidth={1.6} />
            Build
          </a>
        </nav>
      </div>
    </header>
  );
}

export function FooterIconRow() {
  return (
    <div className="flex items-center gap-3 text-[rgba(239,233,221,0.5)]">
      <Sparkles className="h-3.5 w-3.5" />
      <Info className="h-3.5 w-3.5" />
    </div>
  );
}
