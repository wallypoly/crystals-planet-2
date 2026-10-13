"use client";

import { useState } from "react";
import {
  X,
  ArrowUpRight,
  LayoutGrid,
  Wand2,
  Link2,
  ChevronDown,
  Gem,
  Sparkles,
} from "lucide-react";
import { TOTAL_STONES, TOTAL_VARIANTS } from "@/lib/stones-data";
import { t, STONE_ZH, type Lang } from "@/lib/i18n";
import { weekStones, pairOfDay, weekPairs } from "@/lib/daily";

export function AtlasNotes({
  onClose,
  lang,
  onBuildYourOwn,
  onGuided,
  onVisitStone,
  onPairStudio,
}: {
  onClose: () => void;
  lang: Lang;
  /** Open the Bracelet Studio with an empty bracelet */
  onBuildYourOwn: () => void;
  /** Open the Bracelet Studio preloaded with the guided preset */
  onGuided: () => void;
  /** Jump from the weekly strip to a stone's detail panel */
  onVisitStone: (slug: string) => void;
  /** Open the Bracelet Studio with the pair-of-the-day beads */
  onPairStudio: (aSlug: string, bSlug: string) => void;
}) {
  const dict = t(lang);
  const [weekOpen, setWeekOpen] = useState(false);
  const [pairsOpen, setPairsOpen] = useState(false);
  const week = weekStones(7);
  const pairs = weekPairs(7);
  const pair = pairOfDay();
  const weekdayFmt = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
  });
  const dayFmt = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  });
  const stoneName = (slug: string, fallback: string) =>
    lang === "zh" ? (STONE_ZH[slug]?.name ?? fallback) : fallback;
  const stoneMeta = (slug: string, family: string, keywords: string[]) =>
    lang === "zh"
      ? [STONE_ZH[slug]?.family ?? family, ...(STONE_ZH[slug]?.keywords ?? keywords).slice(0, 2)]
          .filter(Boolean)
          .join(" · ")
      : [family, ...keywords.slice(0, 2)].filter(Boolean).join(" · ");

  return (
    <div className="crystal-atlas-notes" role="dialog" aria-label="Atlas notes">
      <div className="flex items-start justify-between px-6 pt-6">
        <p className="atlas-panel-kicker">{dict.notesToggle}</p>
        <button
          type="button"
          className="atlas-round-btn"
          aria-label={lang === "zh" ? "关闭星图笔记" : "Close atlas notes"}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="atlas-panel__scroll px-6 pb-8">
        <h2 className="atlas-detail-title mt-1">{dict.notesTitle}</h2>

        <p className="atlas-detail-intro mt-4">{dict.notesBody1}</p>
        <p className="atlas-detail-intro mt-4">{dict.notesBody2}</p>

        <dl className="crystal-universe-metrics mt-6">
          <div>
            <dt>{TOTAL_STONES}</dt>
            <dd>{dict.stones}</dd>
          </div>
          <div>
            <dt>{TOTAL_VARIANTS}</dt>
            <dd>{dict.variants}</dd>
          </div>
        </dl>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href="#"
            className="atlas-cta"
            onClick={(e) => {
              e.preventDefault();
              onBuildYourOwn();
            }}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>{dict.buildYourOwn}</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="atlas-cta atlas-cta--ghost"
            onClick={(e) => {
              e.preventDefault();
              onGuided();
            }}
          >
            <Wand2 className="h-4 w-4" />
            <span>{dict.guidedDesign}</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Pair of the Day — editorial pairing graph, deterministic per date */}
        {pair && (
          <div className="atlas-pairday mt-8">
            <div className="atlas-pairday__head">
              <h3 className="atlas-section-label">
                <Gem className="h-3.5 w-3.5" aria-hidden="true" />
                {dict.pairDayKicker}
              </h3>
            </div>
            <div className="atlas-pairday__row">
              <button
                type="button"
                className="atlas-pairday__stone"
                aria-label={dict.pairDayVisit(stoneName(pair.a.slug, pair.a.displayName))}
                onClick={() => onVisitStone(pair.a.slug)}
              >
                <span
                  className="atlas-pairday__img"
                  style={{ boxShadow: `0 0 16px ${pair.a.palette[1]}55` }}
                  aria-hidden="true"
                >
                  <img
                    src={pair.a.imagePath}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    draggable={false}
                  />
                </span>
                <span className="atlas-pairday__name">
                  {stoneName(pair.a.slug, pair.a.displayName)}
                </span>
                <span className="atlas-pairday__meta">
                  {stoneMeta(pair.a.slug, pair.a.colorFamily, pair.a.keywords)}
                </span>
              </button>
              <span className="atlas-pairday__chain" aria-hidden="true">
                <Link2 className="h-4 w-4" />
              </span>
              <button
                type="button"
                className="atlas-pairday__stone"
                aria-label={dict.pairDayVisit(stoneName(pair.b.slug, pair.b.displayName))}
                onClick={() => onVisitStone(pair.b.slug)}
              >
                <span
                  className="atlas-pairday__img"
                  style={{ boxShadow: `0 0 16px ${pair.b.palette[1]}55` }}
                  aria-hidden="true"
                >
                  <img
                    src={pair.b.imagePath}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    draggable={false}
                  />
                </span>
                <span className="atlas-pairday__name">
                  {stoneName(pair.b.slug, pair.b.displayName)}
                </span>
                <span className="atlas-pairday__meta">
                  {stoneMeta(pair.b.slug, pair.b.colorFamily, pair.b.keywords)}
                </span>
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <a
                href={`/crystals/custom/?stone=${pair.a.slug}&accent=${pair.b.slug}`}
                className="atlas-cta atlas-pairday__cta group flex items-center justify-between px-4 py-3 rounded-xl bg-[#14243b] text-white font-medium hover:bg-[#1e3a5f] shadow-[0_4px_16px_rgba(20,36,59,0.14)] hover:scale-[1.01] transition-all"
                aria-label={dict.customMadePairCta(stoneName(pair.b.slug, pair.b.displayName))}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#c58b8e]" />
                  <span>{dict.customMadePairCta(stoneName(pair.b.slug, pair.b.displayName))}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#c58b8e] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href="#"
                className="atlas-cta atlas-cta--ghost atlas-pairday__cta text-center justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  onPairStudio(pair.a.slug, pair.b.slug);
                }}
                aria-label={dict.pairDayAria(
                  stoneName(pair.a.slug, pair.a.displayName),
                  stoneName(pair.b.slug, pair.b.displayName),
                )}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>{dict.pairDayCta}</span>
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-[rgba(30,58,95,0.08)] pt-5">
          <h3 className="atlas-section-label">{dict.howToRead}</h3>
          <p className="atlas-note-row">{dict.howTo1}</p>
          <p className="atlas-note-row">{dict.howTo2}</p>
          <p className="atlas-note-row">{dict.howTo3}</p>
        </div>

        {/* Weekly review — the last seven featured crystals */}
        <div className="mt-8 border-t border-[rgba(30,58,95,0.08)] pt-5">
          <div className="atlas-week__head">
            <h3 className="atlas-section-label">{dict.weekTitle}</h3>
            <button
              type="button"
              className={`atlas-week__toggle ${weekOpen ? "is-open" : ""}`}
              aria-expanded={weekOpen}
              onClick={() => setWeekOpen((v) => !v)}
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{weekOpen ? dict.weekCollapse : dict.weekExpand}</span>
            </button>
          </div>
          <p className="atlas-week-hint">{dict.weekHint}</p>

          {weekOpen ? (
            /* Expanded timeline — one detailed row per day */
            <div className="atlas-week-tl" role="list">
              {week.map(({ date, stone }, i) => {
                const isToday = i === week.length - 1;
                const name = stoneName(stone.slug, stone.displayName);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    role="listitem"
                    className={`atlas-week-tl__row ${isToday ? "is-today" : ""}`}
                    aria-label={dict.weekAria(name)}
                    onClick={() => onVisitStone(stone.slug)}
                    style={{ ["--tl-delay" as string]: `${i * 0.055}s` }}
                  >
                    <span className="atlas-week-tl__date" aria-hidden="true">
                      <b>{isToday ? dict.today : weekdayFmt.format(date)}</b>
                      <small>{dayFmt.format(date)}</small>
                    </span>
                    <span className="atlas-week-tl__dot" aria-hidden="true" />
                    <span
                      className="atlas-week-tl__thumb"
                      style={{ boxShadow: `0 0 12px ${stone.palette[1]}44` }}
                      aria-hidden="true"
                    >
                      <img
                        src={stone.imagePath}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                        draggable={false}
                      />
                    </span>
                    <span className="atlas-week-tl__body" aria-hidden="true">
                      <span className="atlas-week-tl__name">{name}</span>
                      <span className="atlas-week-tl__meta">
                        {stoneMeta(stone.slug, stone.colorFamily, stone.keywords)}
                      </span>
                    </span>
                    <ArrowUpRight className="atlas-week-tl__go h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ) : (
            /* Compact strip */
            <div className="atlas-week" role="list">
              {week.map(({ date, stone }, i) => {
                const isToday = i === week.length - 1;
                const name = stoneName(stone.slug, stone.displayName);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    role="listitem"
                    className={`atlas-week__day ${isToday ? "is-today" : ""}`}
                    aria-label={dict.weekAria(name)}
                    title={`${name} · ${dayFmt.format(date)}`}
                    onClick={() => onVisitStone(stone.slug)}
                    style={{ ["--w-delay" as string]: `${i * 0.05}s` }}
                  >
                    <span
                      className="atlas-week__thumb"
                      style={{ boxShadow: `0 0 12px ${stone.palette[1]}44` }}
                      aria-hidden="true"
                    >
                      <img
                        src={stone.imagePath}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                        draggable={false}
                      />
                    </span>
                    <span className="atlas-week__label" aria-hidden="true">
                      {isToday ? dict.today : weekdayFmt.format(date)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {/* Week of Pairs — seven days of featured duos */}
        {pairs.length > 0 && (
          <div className="mt-8 border-t border-[rgba(30,58,95,0.08)] pt-5">
            <div className="atlas-week__head">
              <h3 className="atlas-section-label">
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                {dict.pairsWeekTitle}
              </h3>
              <button
                type="button"
                className={`atlas-week__toggle ${pairsOpen ? "is-open" : ""}`}
                aria-expanded={pairsOpen}
                onClick={() => setPairsOpen((v) => !v)}
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{pairsOpen ? dict.weekCollapse : dict.weekExpand}</span>
              </button>
            </div>
            <p className="atlas-week-hint">{dict.pairsWeekHint}</p>

            {pairsOpen && (
              <div className="atlas-weekpairs" role="list">
                {pairs.map(({ date, a, b }, i) => {
                  const isToday = i === pairs.length - 1;
                  const nameA = stoneName(a.slug, a.displayName);
                  const nameB = stoneName(b.slug, b.displayName);
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      role="listitem"
                      className={`atlas-weekpairs__row ${isToday ? "is-today" : ""}`}
                      aria-label={dict.pairsWeekAria(nameA, nameB)}
                      onClick={() => onPairStudio(a.slug, b.slug)}
                      style={{ ["--wp-delay" as string]: `${i * 0.05}s` }}
                    >
                      <span className="atlas-weekpairs__date" aria-hidden="true">
                        <b>{isToday ? dict.today : weekdayFmt.format(date)}</b>
                        <small>{dayFmt.format(date)}</small>
                      </span>
                      <span
                        className="atlas-weekpairs__thumb"
                        style={{ boxShadow: `0 0 10px ${a.palette[1]}44` }}
                        aria-hidden="true"
                      >
                        <img src={a.imagePath} alt="" width={34} height={34} loading="lazy" draggable={false} />
                      </span>
                      <span className="atlas-weekpairs__names" aria-hidden="true">
                        <span>{nameA}</span>
                        <span className="atlas-weekpairs__plus">+</span>
                        <span>{nameB}</span>
                      </span>
                      <span
                        className="atlas-weekpairs__thumb"
                        style={{ boxShadow: `0 0 10px ${b.palette[1]}44` }}
                        aria-hidden="true"
                      >
                        <img src={b.imagePath} alt="" width={34} height={34} loading="lazy" draggable={false} />
                      </span>
                      <Wand2 className="atlas-weekpairs__go h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
