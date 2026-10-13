"use client";

import { useState } from "react";
import { X, Search, ArrowRight, ArrowUpDown, Library, Heart, Ruler, Palette, ChevronLeft, ChevronRight, CalendarDays, Undo2, Sparkles } from "lucide-react";
import { STONES, type Stone } from "@/lib/stones-data";
import { pairOfDay } from "@/lib/daily";
import {
  t,
  STONE_ZH,
  CHAKRA_ZH,
  CHAKRA_ORDER,
  CHAKRA_META,
  MONTH_ORDER,
  MONTH_META,
  MONTH_ZH,
  type Lang,
} from "@/lib/i18n";

type CodexTab = "archive" | "chakras" | "birthstones" | "compare" | "almanac";
type SortMode = "name" | "hardness";
type CompareDim = "color" | "chakra" | "month";

/** Parse "7.5 – 8" style hardness strings into a numeric range */
function parseHardness(raw: string): { min: number; max: number } | null {
  const nums = raw.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length === 0) return null;
  const min = parseFloat(nums[0]);
  const max = nums.length > 1 ? parseFloat(nums[1]) : min;
  return { min, max };
}

/** Visual Mohs scale: a 0–10 track with the stone's range filled */
function MohsBar({ value, accent }: { value: string; accent: string }) {
  const parsed = parseHardness(value);
  if (!parsed) return null;
  const left = Math.max(0, Math.min(10, parsed.min)) * 10;
  const width = Math.max(2, (Math.min(10, parsed.max) - Math.min(10, parsed.min)) * 10);
  return (
    <span className="codex-mohs" aria-hidden="true">
      <span className="codex-mohs__track">
        <span
          className="codex-mohs__fill"
          style={{ left: `${left}%`, width: `${width}%`, background: accent }}
        />
      </span>
      <span className="codex-mohs__val">{value}</span>
    </span>
  );
}

export function CodexOverlay({
  lang,
  onClose,
  onVisitStone,
  favorites,
  onToggleFavorite,
  onPairStudio,
}: {
  lang: Lang;
  onClose: () => void;
  onVisitStone: (slug: string) => void;
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
  onPairStudio: (a: string, b: string) => void;
}) {
  const dict = t(lang);
  const [tab, setTab] = useState<CodexTab>("archive");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("name");
  const [dim, setDim] = useState<CompareDim>("color");
  const [monthOffset, setMonthOffset] = useState(0);

  /* Localized names / helpers */
  const nameOf = (s: Stone) =>
    lang === "zh" ? (STONE_ZH[s.slug]?.name ?? s.displayName) : s.displayName;
  const subNameOf = (s: Stone) =>
    lang === "zh" ? s.displayName : (STONE_ZH[s.slug]?.name ?? "");
  const familyOf = (s: Stone) =>
    lang === "zh" ? (STONE_ZH[s.slug]?.family ?? s.colorFamily) : s.colorFamily;
  const introOf = (s: Stone) =>
    lang === "zh" ? (STONE_ZH[s.slug]?.intro ?? s.intro) : s.intro;
  const materialOf = (s: Stone) =>
    lang === "zh"
      ? (STONE_ZH[s.slug]?.material ?? s.materialType)
      : s.materialType === "crystal"
        ? "Crystal"
        : "Stone";
  const chakraOf = (key: string) =>
    lang === "zh" ? (CHAKRA_ZH[key] ?? key) : key;
  const monthOf = (key: string) =>
    lang === "zh" ? (MONTH_ZH[key] ?? key) : key;

  /* Search matches names, families, keywords, chakras, months (EN + 中文) */
  const haystackOf = (s: Stone) => {
    const zh = STONE_ZH[s.slug];
    return [
      s.displayName,
      s.colorFamily,
      s.materialType,
      s.chakra,
      s.birthstone ?? "",
      ...s.keywords,
      ...s.properties,
      zh ? zh.name : "",
      zh ? zh.family : "",
      zh ? zh.intro : "",
      zh ? zh.keywords.join(" ") : "",
    ]
      .join(" ")
      .toLowerCase();
  };

  const q = query.trim().toLowerCase();
  /* 17 stones — plain derivations, memoization would be noise */
  const matchedSet = q
    ? new Set(STONES.filter((s) => haystackOf(s).includes(q)).map((s) => s.slug))
    : null;
  const ok = (s: Stone) => !matchedSet || matchedSet.has(s.slug);

  /* Archive ordering */
  const archiveStones = (() => {
    const list = STONES.filter(ok);
    if (sort === "hardness") {
      return [...list].sort((a, b) => {
        const ha = parseHardness(a.hardness)?.max ?? -1;
        const hb = parseHardness(b.hardness)?.max ?? -1;
        return ha - hb;
      });
    }
    return [...list].sort((a, b) =>
      nameOf(a).localeCompare(nameOf(b), lang === "zh" ? "zh-Hans" : "en"),
    );
  })();

  /* Chakra groups, root → crown */
  const chakraGroups = CHAKRA_ORDER.map((key) => ({
    key,
    stones: STONES.filter((s) => s.chakra === key && ok(s)),
  }));

  /* Birthstone months + undated stones */
  const monthCells = MONTH_ORDER.map((month) => ({
    month,
    stones: STONES.filter((s) => s.birthstone === month && ok(s)),
  }));
  const undated = STONES.filter((s) => s.birthstone === null && ok(s));

  /* Compare view — all stones on one shared 0–10 Mohs ruler, hardest first */
  const compareStones = STONES.filter(ok)
    .map((s) => ({ stone: s, range: parseHardness(s.hardness) }))
    .filter((r): r is { stone: Stone; range: { min: number; max: number } } =>
      Boolean(r.range),
    )
    .sort((a, b) => b.range.max - a.range.max || b.range.min - a.range.min);

  const anyResults =
    archiveStones.length > 0 ||
    chakraGroups.some((g) => g.stones.length > 0) ||
    compareStones.length > 0 ||
    undated.length > 0 ||
    tab === "almanac";

  const chakraCount = new Set(STONES.map((s) => s.chakra)).size;
  const monthCount = new Set(STONES.map((s) => s.birthstone).filter(Boolean)).size;
  const stats = dict.codexStats(STONES.length, chakraCount, monthCount);

  const tabs: { key: CodexTab; label: string }[] = [
    { key: "archive", label: dict.codexTabArchive },
    { key: "chakras", label: dict.codexTabChakras },
    { key: "birthstones", label: dict.codexTabBirthstones },
    { key: "compare", label: dict.codexTabCompare },
    { key: "almanac", label: dict.codexTabAlmanac },
  ];

  const tabHint =
    tab === "archive"
      ? dict.codexArchiveHint
      : tab === "chakras"
        ? dict.codexChakraHint
        : tab === "birthstones"
          ? dict.codexBirthHint
          : tab === "almanac"
            ? dict.codexAlmanacHint
            : dim === "chakra"
              ? dict.codexCompareHintChakra
              : dim === "month"
                ? dict.codexCompareHintMonth
                : dict.codexCompareHint;

  /* Almanac — the month's featured pairings on one calendar grid */
  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const almYear = viewDate.getFullYear();
  const almMonth = viewDate.getMonth();
  const almDaysInMonth = new Date(almYear, almMonth + 1, 0).getDate();
  const almStartWeekday = new Date(almYear, almMonth, 1).getDay(); // 0 = Sunday
  const almMonthName =
    lang === "zh"
      ? (MONTH_ZH[MONTH_ORDER[almMonth]] ?? MONTH_ORDER[almMonth])
      : MONTH_ORDER[almMonth];
  const almDays = Array.from({ length: almDaysInMonth }, (_, i) => {
    const date = new Date(almYear, almMonth, i + 1);
    return { day: i + 1, date, pair: pairOfDay(date) };
  });
  const almIsToday = (d: number) => monthOffset === 0 && d === today.getDate();
  const almIsWeekend = (wd: number) => wd === 0 || wd === 6;
  const almJump = (delta: number) => setMonthOffset((m) => m + delta);

  return (
    <div className="codex-overlay" role="presentation">
      <section
        className="codex-panel"
        role="dialog"
        aria-modal="true"
        aria-label={dict.codexTitle}
      >
        {/* Header */}
        <header className="codex-head">
          <div className="codex-head__titles">
            <p className="codex-kicker">
              <Library className="h-3 w-3" aria-hidden="true" />
              {dict.codexKicker}
            </p>
            <h2 className="codex-title">{dict.codexTitle}</h2>
            <p className="codex-intro">{dict.codexIntro}</p>
            <p className="codex-stats">{stats}</p>
          </div>
          <button
            type="button"
            className="codex-close"
            onClick={onClose}
            aria-label={dict.codexClose}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Tabs + toolbar */}
        <div className="codex-toolbar">
          <div className="codex-tabs" role="tablist" aria-label={dict.codexTitle}>
            {tabs.map((tb) => (
              <button
                key={tb.key}
                type="button"
                role="tab"
                aria-selected={tab === tb.key}
                className={`codex-tab ${tab === tb.key ? "is-active" : ""}`}
                onClick={() => setTab(tb.key)}
              >
                {tb.label}
              </button>
            ))}
          </div>
          <div className="codex-toolbar__search">
            <Search className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.codexSearchPlaceholder}
              aria-label={dict.codexSearchAria}
              className="codex-search-input"
            />
            {query && (
              <button
                type="button"
                className="codex-search-clear"
                onClick={() => setQuery("")}
                aria-label={dict.clearSearch}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {tab === "archive" && (
            <div
              className="codex-sort"
              role="group"
              aria-label={dict.codexSortAria}
            >
              <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />
              <button
                type="button"
                className={`codex-sort__opt ${sort === "name" ? "is-active" : ""}`}
                aria-pressed={sort === "name"}
                onClick={() => setSort("name")}
              >
                {dict.codexSortName}
              </button>
              <button
                type="button"
                className={`codex-sort__opt ${sort === "hardness" ? "is-active" : ""}`}
                aria-pressed={sort === "hardness"}
                onClick={() => setSort("hardness")}
              >
                {dict.codexSortHardness}
              </button>
            </div>
          )}
          <p className="codex-toolbar__hint">{tabHint}</p>
        </div>

        {/* Body */}
        <div className="codex-body">
          {!anyResults && <p className="codex-empty">{dict.codexEmpty}</p>}

          {/* ── Archive tab ───────────────────────────────── */}
          {tab === "archive" && (
            <div className="codex-grid">
              {archiveStones.map((s, i) => (
                <article
                  key={s.slug}
                  className="codex-card"
                  style={
                    {
                      "--cd-i": i,
                      "--card-a": s.palette[0],
                      "--card-b": s.palette[1],
                      "--card-c": s.palette[2],
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className={`codex-fav ${favorites.includes(s.slug) ? "is-active" : ""}`}
                    onClick={() => onToggleFavorite(s.slug)}
                    aria-label={dict.toggleFav(nameOf(s), !favorites.includes(s.slug))}
                    aria-pressed={favorites.includes(s.slug)}
                    title={dict.toggleFav(nameOf(s), !favorites.includes(s.slug))}
                  >
                    <Heart
                      className="h-3.5 w-3.5"
                      strokeWidth={2}
                      fill={favorites.includes(s.slug) ? "currentColor" : "none"}
                    />
                  </button>
                  <div className="codex-card__media" aria-hidden="true">
                    <img src={s.imagePath} alt="" width={96} height={96} loading="lazy" draggable={false} />
                  </div>
                  <header className="codex-card__head">
                    <p className="codex-card__kicker">
                      {materialOf(s)} · {familyOf(s)}
                    </p>
                    <h3 className="codex-card__name">
                      {nameOf(s)}
                      {subNameOf(s) && <span className="codex-card__sub">{subNameOf(s)}</span>}
                    </h3>
                  </header>
                  <p className="codex-card__intro">{introOf(s)}</p>
                  <div className="codex-card__chips" aria-hidden="true">
                    {s.keywords.map((k) => (
                      <span key={k} className="codex-chip">
                        {k}
                      </span>
                    ))}
                  </div>
                  <dl className="codex-card__data">
                    <div className="codex-card__data-row codex-card__data-row--wide">
                      <dt>{dict.mohs}</dt>
                      <dd>
                        <MohsBar value={s.hardness} accent={s.palette[1]} />
                      </dd>
                    </div>
                    <div className="codex-card__data-row">
                      <dt>{dict.chakra}</dt>
                      <dd>
                        <span
                          className="codex-data-dot"
                          style={{
                            background: CHAKRA_META[s.chakra as keyof typeof CHAKRA_META]?.color,
                            boxShadow: `0 0 8px ${CHAKRA_META[s.chakra as keyof typeof CHAKRA_META]?.color ?? "transparent"}`,
                          }}
                          aria-hidden="true"
                        />
                        {chakraOf(s.chakra)}
                      </dd>
                    </div>
                    <div className="codex-card__data-row">
                      <dt>{dict.birthstone}</dt>
                      <dd>{s.birthstone ? monthOf(s.birthstone) : dict.none}</dd>
                    </div>
                    <div className="codex-card__data-row codex-card__data-row--wide">
                      <dt>{dict.buildSizes}</dt>
                      <dd>{s.availableMm.map((mm) => `${mm} mm`).join(" · ")}</dd>
                    </div>
                  </dl>
                  {s.pairs.length > 0 && (
                    <div className="codex-card__companions">
                      <span className="codex-card__companions-label">{dict.codexCompanions}</span>
                      <span className="codex-card__companions-row">
                        {s.pairs.map((p) => {
                          const partner = STONES.find((x) => x.slug === p);
                          if (!partner) return null;
                          return (
                            <button
                              key={p}
                              type="button"
                              className="codex-companion"
                              onClick={() => onVisitStone(p)}
                              aria-label={dict.codexVisitAria(nameOf(partner))}
                              title={dict.codexVisitAria(nameOf(partner))}
                            >
                              <img src={partner.imagePath} alt="" width={22} height={22} loading="lazy" />
                              {nameOf(partner)}
                            </button>
                          );
                        })}
                      </span>
                    </div>
                  )}
                  <div className="codex-card__actions mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="codex-card__cta flex-1"
                      onClick={() => onVisitStone(s.slug)}
                    >
                      {dict.codexViewInAtlas}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <a
                      href={`/crystals/custom/?stone=${s.slug}`}
                      target="_top"
                      className="codex-card__cta codex-card__cta--custom flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#14243b] hover:bg-[#1e3a5f] text-white text-[0.72rem] tracking-wider transition-all border border-[#14243b] shadow-[0_4px_16px_rgba(20,36,59,0.14)]"
                      title={dict.customMadeCta(nameOf(s))}
                    >
                      <Sparkles className="h-3 w-3 text-[#c58b8e]" />
                      <span>定制手串</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ── Chakras tab ───────────────────────────────── */}
          {tab === "chakras" && (
            <div className="codex-chakras">
              {chakraGroups.map(
                (g, gi) =>
                  g.stones.length > 0 && (
                    <section
                      key={g.key}
                      className="codex-chakra"
                      style={
                        {
                          "--cd-i": gi,
                          "--chakra-c": CHAKRA_META[g.key].color,
                        } as React.CSSProperties
                      }
                    >
                      <header className="codex-chakra__head">
                        <span className="codex-chakra__dot" aria-hidden="true" />
                        <h3 className="codex-chakra__name">{chakraOf(g.key)}</h3>
                        <span className="codex-chakra__line" aria-hidden="true" />
                        <span className="codex-chakra__count">{g.stones.length}</span>
                      </header>
                      <div className="codex-chakra__row">
                        {g.stones.map((s) => (
                          <button
                            key={s.slug}
                            type="button"
                            className="codex-mini"
                            onClick={() => onVisitStone(s.slug)}
                            aria-label={dict.codexVisitAria(nameOf(s))}
                            style={{ "--mini-c": s.palette[1] } as React.CSSProperties}
                          >
                            <img src={s.imagePath} alt="" width={56} height={56} loading="lazy" draggable={false} />
                            <span className="codex-mini__name">{nameOf(s)}</span>
                            <span className="codex-mini__meta">
                              {familyOf(s)} · Mohs {s.hardness}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ),
              )}
            </div>
          )}

          {/* ── Compare tab — one shared Mohs ruler ────────── */}
          {tab === "compare" && compareStones.length > 0 && (
            <div
              className="codex-compare"
              role="img"
              aria-label={`${dict.codexCompareScale}: ${compareStones
                .map((r) => `${nameOf(r.stone)} ${r.stone.hardness}`)
                .join(", ")}`}
            >
              {/* Dimension picker — color the rows by palette / chakra / month */}
              <div
                className="codex-compare__dims"
                role="group"
                aria-label={dict.codexDimLabel}
              >
                <span className="codex-compare__dims-label">
                  <Palette className="h-3 w-3" aria-hidden="true" />
                  {dict.codexDimLabel}
                </span>
                {(
                  [
                    { key: "color", label: dict.codexDimColor },
                    { key: "chakra", label: dict.codexDimChakra },
                    { key: "month", label: dict.codexDimMonth },
                  ] as { key: CompareDim; label: string }[]
                ).map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`codex-compare__dim ${dim === d.key ? "is-active" : ""}`}
                    aria-pressed={dim === d.key}
                    onClick={() => setDim(d.key)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Shared 0–10 ruler header */}
              <div className="codex-compare__ruler" aria-hidden="true">
                <span className="codex-compare__ruler-label">
                  <Ruler className="h-3 w-3" />
                  {dict.codexCompareScale}
                </span>
                <div className="codex-compare__ruler-track">
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className="codex-compare__ruler-tick">
                      <b>{i}</b>
                    </span>
                  ))}
                </div>
              </div>

              {/* One ranked row per stone */}
              <div className="codex-compare__rows">
                {compareStones.map((r, i) => {
                  const s = r.stone;
                  const left = Math.max(0, Math.min(10, r.range.min)) * 10;
                  const width = Math.max(
                    1.5,
                    (Math.min(10, r.range.max) - Math.max(0, r.range.min)) * 10,
                  );
                  const name = nameOf(s);
                  /* Second-dimension coloring: palette / chakra / birthstone */
                  const chakraColor =
                    CHAKRA_META[s.chakra as keyof typeof CHAKRA_META]?.color;
                  const monthColor = s.birthstone
                    ? MONTH_META[s.birthstone as keyof typeof MONTH_META]?.color
                    : undefined;
                  const c1 =
                    dim === "chakra"
                      ? (chakraColor ?? s.palette[1])
                      : dim === "month"
                        ? (monthColor ?? "rgba(30, 58, 95, 0.2)")
                        : s.palette[1];
                  const c2 =
                    dim === "color"
                      ? (s.palette[2] ?? s.palette[1])
                      : c1;
                  const sub =
                    dim === "chakra"
                      ? chakraOf(s.chakra)
                      : dim === "month"
                        ? s.birthstone
                          ? monthOf(s.birthstone)
                          : dict.codexNoMonth
                        : familyOf(s);
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      className="codex-compare__row"
                      onClick={() => onVisitStone(s.slug)}
                      aria-label={dict.codexVisitAria(name)}
                      style={
                        {
                          "--cmp-delay": `${i * 0.045}s`,
                          "--bar-l": `${left}%`,
                          "--bar-w": `${width}%`,
                          "--bar-c1": c1,
                          "--bar-c2": c2,
                        } as React.CSSProperties
                      }
                    >
                      <span className="codex-compare__rank" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="codex-compare__thumb" aria-hidden="true">
                        <img
                          src={s.imagePath}
                          alt=""
                          width={30}
                          height={30}
                          loading="lazy"
                          draggable={false}
                        />
                      </span>
                      <span className="codex-compare__name" aria-hidden="true">
                        {name}
                        <small>{sub}</small>
                      </span>
                      <span
                        className="codex-compare__chakra"
                        title={chakraOf(s.chakra)}
                        style={{
                          background: chakraColor,
                          boxShadow: `0 0 7px ${chakraColor ?? "transparent"}`,
                        }}
                        aria-hidden="true"
                      />
                      <span className="codex-compare__track" aria-hidden="true">
                        <span
                          className={`codex-compare__bar ${
                            dim === "month" && !monthColor ? "is-muted" : ""
                          }`}
                        />
                        <span className="codex-compare__val">{s.hardness}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {dim === "color" ? (
                <footer className="codex-compare__legend" aria-hidden="true">
                  <span>▲ {dict.codexCompareHardest}</span>
                  <span className="codex-compare__legend-line" />
                  <span>{dict.codexCompareSofter} ▼</span>
                </footer>
              ) : (
                <footer className="codex-compare__legend codex-compare__legend--swatches" aria-hidden="true">
                  {(dim === "chakra"
                    ? CHAKRA_ORDER.map((key) => ({
                        key: chakraOf(key),
                        color: CHAKRA_META[key].color,
                      }))
                    : MONTH_ORDER.filter((m) =>
                        STONES.some((s) => s.birthstone === m),
                      ).map((m) => ({
                        key: monthOf(m),
                        color: MONTH_META[m].color,
                      }))
                  ).map((sw) => (
                    <span key={sw.key} className="codex-compare__swatch">
                      <i style={{ background: sw.color, boxShadow: `0 0 6px ${sw.color}` }} />
                      {sw.key}
                    </span>
                  ))}
                </footer>
              )}
            </div>
          )}

          {/* ── Birthstones tab ───────────────────────────── */}
          {tab === "birthstones" && (
            <div className="codex-birth">
              <div className="codex-months">
                {monthCells.map(
                  (c, ci) =>
                    (c.stones.length > 0 || !q) && (
                      <div
                        key={c.month}
                        className={`codex-month ${c.stones.length === 0 ? "is-empty" : ""}`}
                        style={{ "--cd-i": ci } as React.CSSProperties}
                      >
                        <p className="codex-month__label">{monthOf(c.month)}</p>
                        {c.stones.length > 0 ? (
                          c.stones.map((s) => (
                            <button
                              key={s.slug}
                              type="button"
                              className="codex-month__stone"
                              onClick={() => onVisitStone(s.slug)}
                              aria-label={dict.codexVisitAria(nameOf(s))}
                            >
                              <img src={s.imagePath} alt="" width={40} height={40} loading="lazy" draggable={false} />
                              <span className="codex-month__name">{nameOf(s)}</span>
                            </button>
                          ))
                        ) : (
                          <span className="codex-month__empty">{dict.codexNoMonth}</span>
                        )}
                      </div>
                    ),
                )}
              </div>
              {undated.length > 0 && (
                <div className="codex-undated">
                  <p className="codex-undated__label">{dict.codexUndated}</p>
                  <div className="codex-undated__row">
                    {undated.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        className="codex-companion"
                        onClick={() => onVisitStone(s.slug)}
                        aria-label={dict.codexVisitAria(nameOf(s))}
                      >
                        <img src={s.imagePath} alt="" width={22} height={22} loading="lazy" />
                        {nameOf(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Almanac tab — featured pairing on a month calendar ── */}
          {tab === "almanac" && (
            <div className="codex-almanac">
              <header className="codex-almanac__nav">
                <span className="codex-almanac__nav-label" aria-hidden="true">
                  <CalendarDays className="h-3.5 w-3.5" />
                </span>
                <button
                  type="button"
                  className="codex-almanac__nav-btn"
                  onClick={() => almJump(-1)}
                  aria-label={dict.almanacPrev}
                  title={dict.almanacPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="codex-almanac__month">
                  {almMonthName} <span>{almYear}</span>
                  {monthOffset !== 0 && (
                    <button
                      type="button"
                      className="codex-almanac__back"
                      onClick={() => setMonthOffset(0)}
                      aria-label={dict.almanacBackToToday}
                      title={dict.almanacBackToToday}
                    >
                      <Undo2 className="h-3 w-3" />
                    </button>
                  )}
                </h3>
                <button
                  type="button"
                  className="codex-almanac__nav-btn"
                  onClick={() => almJump(1)}
                  aria-label={dict.almanacNext}
                  title={dict.almanacNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </header>

              <div className="codex-almanac__weekdays" aria-hidden="true">
                {dict.almanacWeekdays.map((w, wi) => (
                  <span key={wi} className={almIsWeekend(wi) ? "is-weekend" : ""}>
                    {w}
                  </span>
                ))}
              </div>

              <div className="codex-almanac__grid" role="list">
                {Array.from({ length: almStartWeekday }, (_, i) => (
                  <span key={`blank-${i}`} className="codex-almanac__blank" aria-hidden="true" />
                ))}
                {almDays.map(({ day, date, pair }) => {
                  const matches =
                    !matchedSet ||
                    (pair && (matchedSet.has(pair.a.slug) || matchedSet.has(pair.b.slug)));
                  const dateLabel = `${almMonthName} ${day}`;
                  return (
                    <button
                      key={day}
                      type="button"
                      role="listitem"
                      disabled={!pair}
                      className={`codex-almanac__day ${almIsToday(day) ? "is-today" : ""} ${
                        almIsWeekend(date.getDay()) ? "is-weekend" : ""
                      } ${matches ? "" : "is-dimmed"} ${pair ? "" : "is-empty"}`}
                      style={
                        pair
                          ? ({
                              "--am-i": day,
                              "--pa": pair.a.palette[1],
                              "--pb": pair.b.palette[1],
                            } as React.CSSProperties)
                          : undefined
                      }
                      onClick={() => pair && onPairStudio(pair.a.slug, pair.b.slug)}
                      aria-label={
                        pair
                          ? dict.almanacDayAria(dateLabel, nameOf(pair.a), nameOf(pair.b))
                          : undefined
                      }
                    >
                      <span className="codex-almanac__num" aria-hidden="true">
                        {day}
                      </span>
                      {pair && (
                        <span className="codex-almanac__pair" aria-hidden="true">
                          <img
                            src={pair.a.imagePath}
                            alt=""
                            width={30}
                            height={30}
                            loading="lazy"
                            draggable={false}
                          />
                          <i className="codex-almanac__link" />
                          <img
                            src={pair.b.imagePath}
                            alt=""
                            width={30}
                            height={30}
                            loading="lazy"
                            draggable={false}
                          />
                        </span>
                      )}
                      {almIsToday(day) && (
                        <span className="codex-almanac__today-chip">{dict.almanacToday}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <footer className="codex-almanac__foot" aria-hidden="true">
                <span>{dict.almanacLegend}</span>
              </footer>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
