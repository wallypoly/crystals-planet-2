"use client";

import { useState } from "react";
import { X, Heart, Compass, Share2, Check, Cloud, CloudOff, Loader2, Link2 } from "lucide-react";
import type { Stone } from "@/lib/stones-data";
import { t, STONE_ZH, type Lang } from "@/lib/i18n";

export function FavoritesDrawer({
  stones,
  onRemove,
  onSelect,
  onClose,
  lang,
  vaultState = "synced",
  onPairStudio,
}: {
  stones: Stone[];
  onRemove: (slug: string) => void;
  onSelect: (slug: string) => void;
  onClose: () => void;
  lang: Lang;
  /** Server vault sync status for the header chip */
  vaultState?: "local" | "syncing" | "synced";
  /** Open the Bracelet Studio preloaded with an editorial pair */
  onPairStudio?: (a: string, b: string) => void;
}) {
  const dict = t(lang);
  const [copied, setCopied] = useState(false);

  /* Editorial pairings among the favorited stones (deduped by unordered key) */
  const suggestions = (() => {
    if (stones.length < 2) return [];
    const bySlug = new Map(stones.map((s) => [s.slug, s]));
    const seen = new Set<string>();
    const out: { a: Stone; b: Stone }[] = [];
    for (const s of stones) {
      for (const p of s.pairs ?? []) {
        const partner = bySlug.get(p);
        if (!partner) continue;
        const key = [s.slug, p].sort().join("+");
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a: s, b: partner });
      }
    }
    return out.slice(0, 4);
  })();

  const shareFavorites = async () => {
    if (stones.length === 0) return;
    const url = `${window.location.origin}${window.location.pathname}?favs=${stones
      .map((s) => s.slug)
      .join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="crystal-atlas-notes atlas-favorites"
      role="dialog"
      aria-label="Saved crystals"
    >
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <p className="atlas-panel-kicker">{dict.favoritesKicker}</p>
          <h2 className="atlas-detail-title mt-1">
            {dict.favoritesTitle(stones.length)}
          </h2>
          <span
            className={`atlas-vault is-${vaultState}`}
            role="status"
            aria-label={dict.vaultStatusAria}
          >
            {vaultState === "synced" && (
              <Cloud className="h-3 w-3" aria-hidden="true" />
            )}
            {vaultState === "syncing" && (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            )}
            {vaultState === "local" && (
              <CloudOff className="h-3 w-3" aria-hidden="true" />
            )}
            <span>
              {vaultState === "synced"
                ? dict.vaultSynced
                : vaultState === "syncing"
                  ? dict.vaultSyncing
                  : dict.vaultLocal}
            </span>
          </span>
        </div>
        <button
          type="button"
          className="atlas-round-btn"
          aria-label={lang === "zh" ? "关闭收藏夹" : "Close favorites"}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="atlas-panel__scroll px-6 pb-8">
        {stones.length === 0 ? (
          <div className="atlas-favorites__empty">
            <Heart className="h-6 w-6 opacity-40" />
            <p className="atlas-detail-intro mt-3">{dict.favoritesEmpty}</p>
            <button type="button" className="atlas-cta mt-5" onClick={onClose}>
              <Compass className="h-4 w-4" />
              <span>{dict.browseAtlas}</span>
            </button>
          </div>
        ) : (
          <>
            <ul className="atlas-favorites__list">
              {stones.map((stone) => {
                const zh = STONE_ZH[stone.slug];
                const name =
                  lang === "zh" && zh ? zh.name : stone.displayName;
                const family =
                  lang === "zh" && zh ? zh.family : stone.colorFamily;
                const material =
                  lang === "zh" && zh ? zh.material : stone.materialType;
                return (
                  <li key={stone.slug} className="atlas-favorites__item">

                    <img
                      src={stone.imagePath}
                      alt=""
                      width={96}
                      height={96}
                      loading="lazy"
                      className="atlas-favorites__thumb"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[0.56rem] uppercase tracking-[0.26em]"
                        style={{ color: stone.palette[1] }}
                      >
                        {family} {material}
                      </p>
                      <p className="truncate font-[var(--font-cormorant)] text-[1.15rem] text-[#14243b]">
                        {name}
                      </p>
                      <p className="text-[0.6rem] tracking-[0.14em] text-[rgba(30,58,95,0.42)]">
                        {stone.availableMm.join(", ")} mm · Mohs {stone.hardness}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        className="atlas-favorites__action"
                        aria-label={dict.locateOnMap(stone.displayName)}
                        onClick={() => onSelect(stone.slug)}
                      >
                        {dict.locate}
                      </button>
                      <button
                        type="button"
                        className="atlas-favorites__action atlas-favorites__action--ghost"
                        aria-label={dict.removeFav(stone.displayName)}
                        onClick={() => onRemove(stone.slug)}
                      >
                        {dict.remove}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {suggestions.length > 0 && (
              <section className="atlas-favsug" aria-label={dict.favSugTitle}>
                <header className="atlas-favsug__head">
                  <h3 className="atlas-favsug__title">{dict.favSugTitle}</h3>
                  <p className="atlas-favsug__hint">{dict.favSugHint}</p>
                </header>
                <div className="atlas-favsug__row">
                  {suggestions.map(({ a, b }) => {
                    const zhA = STONE_ZH[a.slug];
                    const zhB = STONE_ZH[b.slug];
                    const nameA = lang === "zh" && zhA ? zhA.name : a.displayName;
                    const nameB = lang === "zh" && zhB ? zhB.name : b.displayName;
                    return (
                      <button
                        key={`${a.slug}+${b.slug}`}
                        type="button"
                        className="atlas-favsug__chip"
                        onClick={() => onPairStudio?.(a.slug, b.slug)}
                        aria-label={dict.favSugAria(nameA, nameB)}
                        title={dict.favSugAria(nameA, nameB)}
                      >
                        <img
                          src={a.imagePath}
                          alt=""
                          width={26}
                          height={26}
                          loading="lazy"
                          draggable={false}
                          style={{ boxShadow: `0 0 8px ${a.palette[1]}` }}
                        />
                        <span className="atlas-favsug__name">{nameA}</span>
                        <Link2 className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
                        <img
                          src={b.imagePath}
                          alt=""
                          width={26}
                          height={26}
                          loading="lazy"
                          draggable={false}
                          style={{ boxShadow: `0 0 8px ${b.palette[1]}` }}
                        />
                        <span className="atlas-favsug__name">{nameB}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <button
              type="button"
              className="atlas-cta atlas-cta--ghost mt-5 w-full"
              onClick={shareFavorites}
              aria-label={dict.shareLink}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              <span>{copied ? dict.copied : dict.shareLink}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
