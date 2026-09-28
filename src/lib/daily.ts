// Deterministic "Crystal of the Day" pick.
// Same calendar day (local time) always resolves to the same stone,
// and the pick jumps around the library day by day instead of walking it.

import { STONES, type Stone } from "./stones-data";

export function dailyStoneIndex(date: Date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // Mix the calendar date into a simple numeric hash so consecutive days
  // do not map to adjacent stones (which would look predictable).
  const seed = y * 373 + m * 97 + d * 7;
  return seed % STONES.length;
}

export function dailyStone(date: Date = new Date()): Stone {
  return STONES[dailyStoneIndex(date)];
}

export interface DayPick {
  date: Date;
  stone: Stone;
}

/**
 * Deterministic "Pair of the Day" from the editorial pairing graph:
 * the daily stone plus one of its curated partners (rotates day by day),
 * so the same two crystals always appear together on a given date.
 */
export function pairOfDay(date: Date = new Date()): { a: Stone; b: Stone } | null {
  const a = dailyStone(date);
  if (!a.pairs || a.pairs.length === 0) return null;
  const seed =
    date.getFullYear() * 373 + (date.getMonth() + 1) * 97 + date.getDate() * 7;
  const partnerSlug = a.pairs[seed % a.pairs.length];
  const b = STONES.find((s) => s.slug === partnerSlug);
  return b ? { a, b } : null;
}

/**
 * The featured crystal for each of the last `days` days (including today),
 * ordered oldest first. Powers the "This week in the atlas" review strip.
 */
export function weekStones(days = 7, today: Date = new Date()): DayPick[] {
  const out: DayPick[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    out.push({ date: d, stone: dailyStone(d) });
  }
  return out;
}

export interface DayPair {
  date: Date;
  a: Stone;
  b: Stone;
}

/**
 * The featured pairing for each of the last `days` days (including today),
 * ordered oldest first. Powers the "Week of Pairs" review in Atlas Notes.
 */
export function weekPairs(days = 7, today: Date = new Date()): DayPair[] {
  const out: DayPair[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    const pair = pairOfDay(d);
    if (pair) out.push({ date: d, a: pair.a, b: pair.b });
  }
  return out;
}

/** Local YYYY-MM-DD stamp for exports / aria descriptions. */
export function dateStamp(date: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
