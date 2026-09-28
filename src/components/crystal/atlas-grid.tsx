"use client";

import { Heart } from "lucide-react";
import type { Stone } from "@/lib/stones-data";
import { t, STONE_ZH, MONTH_ZH, type Lang } from "@/lib/i18n";

export function AtlasGrid({
  stones,
  favorites,
  onToggleFavorite,
  onSelect,
  lang,
}: {
  stones: Stone[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
  onSelect: (slug: string) => void;
  lang: Lang;
}) {
  const dict = t(lang);

  if (stones.length === 0) {
    return (
      <div className="atlas-grid">
        <div className="atlas-grid__empty">
          <p className="atlas-detail-title">{dict.noStonesFound}</p>
          <p className="atlas-detail-intro">{dict.noStonesHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-grid" role="list" aria-label="Crystal gallery">
      <div className="atlas-grid__scroll">
        {stones.map((stone, i) => {
          const fav = favorites.includes(stone.slug);
          const zh = STONE_ZH[stone.slug];
          const name = lang === "zh" && zh ? zh.name : stone.displayName;
          const family = lang === "zh" && zh ? zh.family : stone.colorFamily;
          const material = lang === "zh" && zh ? zh.material : stone.materialType;
          const monthLabel =
            lang === "zh" && stone.birthstone
              ? (MONTH_ZH[stone.birthstone] ?? stone.birthstone)
              : stone.birthstone;
          return (
            <article
              key={stone.slug}
              role="listitem"
              className="atlas-card"
              style={{ ["--card-delay" as string]: `${(i * 0.04).toFixed(2)}s` }}
            >
              <button
                type="button"
                className="atlas-card__media"
                onClick={() => onSelect(stone.slug)}
                aria-label={dict.viewDetails(stone.displayName)}
              >

                <img
                  src={stone.imagePath}
                  alt={`${stone.displayName} bead`}
                  width={720}
                  height={720}
                  loading="lazy"
                  draggable={false}
                />
                <span
                  className="atlas-card__glow"
                  style={{ background: stone.palette[1] }}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className={`atlas-card__fav ${fav ? "is-active" : ""}`}
                aria-label={dict.toggleFav(stone.displayName, !fav)}
                aria-pressed={fav}
                onClick={() => onToggleFavorite(stone.slug)}
              >
                <Heart className="h-3.5 w-3.5" fill={fav ? "currentColor" : "none"} />
              </button>
              <div className="atlas-card__body">
                <p className="atlas-card__kicker">
                  {family} {material}
                </p>
                <h3 className="atlas-card__name">
                  <button type="button" onClick={() => onSelect(stone.slug)}>
                    {name}
                  </button>
                </h3>
                <p className="atlas-card__meta">
                  {stone.availableMm.join(", ")} mm
                  {monthLabel ? ` · ${monthLabel}` : ""}
                </p>
                <p className="atlas-card__hardness">
                  <span>Mohs</span> {stone.hardness}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
