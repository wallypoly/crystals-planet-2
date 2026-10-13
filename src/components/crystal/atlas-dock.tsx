"use client";

import {
  Search,
  X,
  LayoutGrid,
  Orbit,
  Heart,
  Languages,
  Gem,
  Sun,
  Moon,
  Keyboard,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { STONES } from "@/lib/stones-data";
import { t, STONE_ZH, type Lang } from "@/lib/i18n";

export type ViewMode = "orbit" | "grid";
export type ThemeMode = "dark" | "light";

const FAMILY_ORDER = [
  "Blue",
  "Green",
  "Dark",
  "Purple",
  "Gold",
  "Clear",
  "Smoke",
  "Blush",
  "Rose",
  "Amber",
];

const FAMILY_ZH: Record<string, string> = {
  Blue: "蓝色",
  Green: "绿色",
  Dark: "深色",
  Purple: "紫色",
  Gold: "金色",
  Clear: "净色",
  Smoke: "烟色",
  Blush: "藕粉",
  Rose: "粉色",
  Amber: "琥珀",
};

export function AtlasDock({
  query,
  onQuery,
  colorFilter,
  onColorFilter,
  viewMode,
  onViewMode,
  favCount,
  onOpenFavorites,
  matchCount,
  onClear,
  lang,
  onLang,
  onOpenStudio,
  onOpenCodex,
  theme,
  onTheme,
  searchRef,
}: {
  query: string;
  onQuery: (v: string) => void;
  colorFilter: string | null;
  onColorFilter: (v: string | null) => void;
  viewMode: ViewMode;
  onViewMode: (v: ViewMode) => void;
  favCount: number;
  onOpenFavorites: () => void;
  matchCount: number;
  onClear: () => void;
  lang: Lang;
  onLang: (l: Lang) => void;
  onOpenStudio: () => void;
  onOpenCodex: () => void;
  theme: ThemeMode;
  onTheme: (t: ThemeMode) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const dict = t(lang);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement | null>(null);

  /* Escape closes the shortcuts popover */
  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen]);

  /* Click outside closes the shortcuts popover */
  useEffect(() => {
    if (!helpOpen) return;
    const onDown = (e: PointerEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [helpOpen]);

  const families = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of STONES) {
      if (!map.has(s.colorFamily)) map.set(s.colorFamily, s.palette[1]);
    }
    return FAMILY_ORDER.filter((f) => map.has(f)).map((f) => ({
      name: f,
      color: map.get(f)!,
    }));
  }, []);

  const hasFilter = query.trim().length > 0 || colorFilter !== null;

  return (
    <div className="atlas-dock" role="search" aria-label="Filter crystal library">
      {/* Search */}
      <div className="atlas-dock__search">
        <Search className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={dict.searchPlaceholder}
          aria-label={dict.searchAria}
          className="atlas-dock__input"
        />
        {query && (
          <button
            type="button"
            aria-label={dict.clearSearch}
            className="atlas-dock__clear"
            onClick={() => onQuery("")}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Color family chips */}
      <div className="atlas-dock__chips" aria-label={dict.filterByColor}>
        <button
          type="button"
          className={`atlas-dock__chip ${colorFilter === null ? "is-active" : ""}`}
          onClick={() => onColorFilter(null)}
        >
          {dict.all}
        </button>
        {families.map((f) => (
          <button
            key={f.name}
            type="button"
            className={`atlas-dock__chip ${colorFilter === f.name ? "is-active" : ""}`}
            onClick={() => onColorFilter(colorFilter === f.name ? null : f.name)}
            aria-pressed={colorFilter === f.name}
          >
            <span
              className="atlas-dock__dot"
              style={{ background: f.color, boxShadow: `0 0 8px ${f.color}` }}
              aria-hidden="true"
            />
            {lang === "zh" ? (FAMILY_ZH[f.name] ?? f.name) : f.name}
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="atlas-dock__tools">
        {hasFilter && (
          <span className="atlas-dock__count" aria-live="polite">
            {dict.matchCount(matchCount, STONES.length)}
          </span>
        )}
        <button
          type="button"
          className="atlas-dock__tool atlas-dock__tool--lang"
          onClick={() => onLang(lang === "en" ? "zh" : "en")}
          aria-label={dict.langToggle}
          title={dict.langToggle}
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="atlas-dock__lang-label">{lang === "en" ? "中" : "EN"}</span>
        </button>
        <button
          type="button"
          className="atlas-dock__tool"
          onClick={() => onTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? dict.themeToLight : dict.themeToDark}
          title={theme === "dark" ? dict.themeToLight : dict.themeToDark}
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>
        <div className="atlas-dock__help-wrap" ref={helpRef}>
          <button
            type="button"
            className={`atlas-dock__tool ${helpOpen ? "is-active" : ""}`}
            onClick={() => setHelpOpen((v) => !v)}
            aria-label={dict.shortcutsHelp}
            title={dict.shortcutsHelp}
            aria-expanded={helpOpen}
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
          {helpOpen && (
            <div className="atlas-shortcuts" role="dialog" aria-label={dict.shortcutsTitle}>
              <p className="atlas-shortcuts__title">{dict.shortcutsTitle}</p>
              <ul className="atlas-shortcuts__list">
                <li>
                  <span>←  →</span>
                  <em>{dict.shortcutsRotate}</em>
                </li>
                <li>
                  <span>↑  ↓</span>
                  <em>{dict.shortcutsNav}</em>
                </li>
                <li>
                  <span>Esc</span>
                  <em>{dict.shortcutsClose}</em>
                </li>
                <li>
                  <span>/</span>
                  <em>{dict.shortcutsSearch}</em>
                </li>
              </ul>
            </div>
          )}
        </div>
        <button
          type="button"
          className="atlas-dock__tool"
          onClick={onOpenCodex}
          aria-label={dict.codexOpen}
          title={dict.codexOpen}
        >
          <BookOpen className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="atlas-dock__tool atlas-dock__tool--studio"
          onClick={onOpenStudio}
          aria-label={dict.braceletStudio}
          title={dict.braceletStudio}
        >
          <Gem className="h-3.5 w-3.5" />
        </button>
        <a
          href="/crystals/custom/"
          className="atlas-dock__tool atlas-dock__tool--custom text-[#c58b8e] hover:text-[#14243b]"
          aria-label={dict.customMadeDirect}
          title={dict.customMadeDirect}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          className="atlas-dock__tool"
          onClick={onOpenFavorites}
          aria-label={dict.openFavorites(favCount)}
        >
          <Heart
            className="h-3.5 w-3.5"
            strokeWidth={2}
            fill={favCount > 0 ? "currentColor" : "none"}
          />
          <span className="atlas-dock__badge">{favCount}</span>
        </button>
        <div className="atlas-dock__views" role="group" aria-label="View mode">
          <button
            type="button"
            className={`atlas-dock__tool ${viewMode === "orbit" ? "is-active" : ""}`}
            aria-pressed={viewMode === "orbit"}
            aria-label={dict.orbitView}
            title={dict.orbitView}
            onClick={() => onViewMode("orbit")}
          >
            <Orbit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`atlas-dock__tool ${viewMode === "grid" ? "is-active" : ""}`}
            aria-pressed={viewMode === "grid"}
            aria-label={dict.gridView}
            title={dict.gridView}
            onClick={() => onViewMode("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
