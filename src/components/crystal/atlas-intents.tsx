"use client";

import type { Lang } from "@/lib/i18n";
import { INTENTION_ZH, type Intention } from "@/lib/stone-knowledge";

/**
 * "Choose by what I want" entry: one chip per daily intention. Only
 * intentions that currently resolve to at least one public stone are passed
 * in, so the row disappears entirely until the owner reviews the knowledge
 * data. Chinese-only copy; EN mode renders nothing.
 */
export function AtlasIntents({
  intentions,
  active,
  onChange,
  lang,
}: {
  intentions: Intention[];
  active: Intention | null;
  onChange: (next: Intention | null) => void;
  lang: Lang;
}) {
  if (lang !== "zh" || intentions.length === 0) return null;
  return (
    <div className="atlas-intents" role="group" aria-label="按心意挑选水晶">
      <p className="atlas-intents__kicker">你现在想要</p>
      <div className="atlas-intents__row">
        {intentions.map((key) => {
          const on = active === key;
          return (
            <button
              key={key}
              type="button"
              className={`atlas-intents__chip${on ? " is-active" : ""}`}
              aria-pressed={on}
              onClick={() => onChange(on ? null : key)}
            >
              {INTENTION_ZH[key]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One line that names every active facet and how many stones remain, with a
 * single control that resets all of them (search, colour, chakra, intention).
 */
export function AtlasFilterStatus({
  parts,
  count,
  onClear,
  lang,
}: {
  parts: string[];
  count: number;
  onClear: () => void;
  lang: Lang;
}) {
  if (parts.length === 0) return null;
  const zh = lang === "zh";
  return (
    <p className="atlas-filter-status" role="status" aria-live="polite">
      <span className="atlas-filter-status__label">
        {zh ? "正在查看：" : "Showing: "}
      </span>
      <span className="atlas-filter-status__parts">{parts.join(" + ")}</span>
      <span className="atlas-filter-status__count">
        {zh ? ` · ${count} 颗` : ` · ${count}`}
      </span>
      <button
        type="button"
        className="atlas-filter-status__clear"
        onClick={onClear}
      >
        {zh ? "清除" : "Clear"}
      </button>
    </p>
  );
}
