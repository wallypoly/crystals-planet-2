"use client";

import { useMemo } from "react";
import {
  CHAKRA_META,
  CHAKRA_ORDER,
  CHAKRA_ZH,
  type ChakraKey,
} from "@/lib/i18n";
import { STONES } from "@/lib/stones-data";
import "@/app/frame.css";

export type { ChakraKey };

/**
 * Top → bottom order on screen is Crown → Root, i.e. the reverse of
 * the traditional spine order. Reading down the rail you go from
 * "highest" to "lowest", which matches the fact that it sits
 * beside a page that is scrolled to the top.
 */
const RAIL_ORDER: ChakraKey[] = [...CHAKRA_ORDER].reverse();

export type ChakraLegendProps = {
  /** Currently active chakra filter. null / undefined = no filter. */
  activeChakra?: ChakraKey | null;
  /**
   * Called with the chakra that was clicked. The owner decides
   * whether this is a toggle-off (clicking the active one) and how
   * it folds into its own filter state.
   */
  onChakraChange?: (chakra: ChakraKey | null) => void;
  /** Hides the per-chakra stone count when the owner already shows one. */
  showCount?: boolean;
};

/**
 * Left rail: a 7-stop chakra legend that doubles as the chakra
 * filter control.
 *
 * This component is deliberately presentational. It owns no filter
 * state — crystal-atlas.tsx holds that — so it only needs the two
 * props above wired up to be fully functional.
 */
export function ChakraLegend({
  activeChakra = null,
  onChakraChange,
  showCount = true,
}: ChakraLegendProps) {
  // Counts come from the real dataset, so the legend can never
  // claim a number the data does not support.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const stone of STONES) {
      const key = stone.chakra as string;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, []);

  return (
    <aside className="frame-rail frame-rail--left" aria-label="脉轮图例">
      <p className="frame-rail__kicker">脉轮 · Chakra</p>
      <ul className="frame-legend__list frame-legend">
        {RAIL_ORDER.map((chakra) => {
          const count = counts.get(chakra) ?? 0;
          const active = activeChakra === chakra;
          const label = CHAKRA_ZH[chakra] ?? chakra;
          return (
            <li key={chakra}>
              <button
                type="button"
                className={`frame-legend__item${active ? " is-active" : ""}`}
                style={
                  { "--dot": CHAKRA_META[chakra]?.color } as React.CSSProperties
                }
                aria-pressed={active}
                aria-label={`${label} · ${count} 颗水晶`}
                title={`${label} · ${count} 颗水晶`}
                onClick={() =>
                  onChakraChange?.(active ? null : chakra)
                }
              >
                <span className="frame-legend__dot" aria-hidden="true" />
                <span className="frame-legend__name">{label}</span>
                {showCount && (
                  <span className="frame-legend__count" aria-hidden="true">
                    {count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {onChakraChange && (
        <button
          type="button"
          className="frame-legend__clear"
          hidden={!activeChakra}
          onClick={() => onChakraChange(null)}
        >
          清除
        </button>
      )}
    </aside>
  );
}
