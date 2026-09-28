// Bracelet Studio domain model: bead strings, presets, encode/decode, storage.

import { STONES } from "./stones-data";

export interface Bead {
  slug: string;
  mm: number;
  /** deterministic per-position jitter seed */
  j: number;
}

export interface BraceletDesign {
  name: string;
  beads: Bead[];
  /** Server vault row id (present once the design has been synced) */
  id?: string;
}

export const WRIST_SIZES_CM = [15, 16, 17, 18, 19];

const BRACELET_KEY = "atlas-bracelets";

/* ---------------------------------- presets --------------------------------- */

function mk(slug: string, mm: number, count: number): Bead[] {
  const stone = STONES.find((s) => s.slug === slug);
  const allowed = stone?.availableMm ?? [10];
  const size = allowed.includes(mm) ? mm : (allowed[Math.floor(allowed.length / 2)] ?? 10);
  return Array.from({ length: count }, () => ({ slug, mm: size, j: Math.floor(Math.random() * 7) }));
}

export interface Preset {
  key: string;
  parts: { slug: string; mm: number; count: number }[];
}

export const PRESETS: Preset[] = [
  {
    key: "sea-horizon",
    parts: [
      { slug: "aquamarine", mm: 8, count: 9 },
      { slug: "clear-quartz", mm: 8, count: 6 },
      { slug: "white-crystal-cube", mm: 10, count: 2 },
      { slug: "beryl", mm: 6, count: 5 },
    ],
  },
  {
    key: "golden-hour",
    parts: [
      { slug: "citrine-crystal", mm: 8, count: 8 },
      { slug: "golden-tigers-eye", mm: 8, count: 8 },
      { slug: "sunstone", mm: 8, count: 4 },
      { slug: "yellow-tigers-eye", mm: 6, count: 4 },
    ],
  },
  {
    key: "violet-dusk",
    parts: [
      { slug: "brazil-amethyst", mm: 8, count: 8 },
      { slug: "uruguay-amethyst", mm: 8, count: 6 },
      { slug: "clear-quartz", mm: 6, count: 6 },
      { slug: "silver-shine-obsidian", mm: 6, count: 4 },
    ],
  },
  {
    key: "rose-mist",
    parts: [
      { slug: "rose-quartz", mm: 8, count: 8 },
      { slug: "kunzite", mm: 8, count: 6 },
      { slug: "strawberry-quartz", mm: 6, count: 6 },
      { slug: "beryl", mm: 6, count: 4 },
    ],
  },
  {
    key: "midnight-smoke",
    parts: [
      { slug: "blue-tigers-eye", mm: 8, count: 8 },
      { slug: "silver-shine-obsidian", mm: 8, count: 6 },
      { slug: "golden-shine-obsidian", mm: 8, count: 5 },
      { slug: "gray-moonstone", mm: 6, count: 5 },
    ],
  },
];

export function buildPreset(p: Preset): Bead[] {
  // Interleave stone groups so colors alternate around the wrist.
  const groups = p.parts.map((part) => mk(part.slug, part.mm, part.count));
  const beads: Bead[] = [];
  let i = 0;
  while (beads.length < groups.reduce((n, g) => n + g.length, 0)) {
    for (const g of groups) {
      if (i < g.length) beads.push(g[i]);
    }
    i++;
  }
  return beads;
}

/* ------------------------------- measurements ------------------------------- */

export function totalMm(beads: Bead[]): number {
  return beads.reduce((sum, b) => sum + b.mm, 0);
}

/** Inner circumference of the strung beads, in cm. */
export function innerLengthCm(beads: Bead[]): number {
  return Math.round((totalMm(beads) / 10) * 10) / 10;
}

/** Number of beads of `mm` needed to fill a wrist circumference. */
export function beadsForWrist(mm: number, wristCm: number): number {
  return Math.max(4, Math.round((wristCm * 10) / mm));
}

/** How the strand sits on the wrist, judged by inner length vs circumference. */
export type WristFit = "snug" | "classic" | "relaxed";

/**
 * Fit classification relative to the wearer's wrist: stretch cords pull the
 * inner circle slightly smaller than the bead stack suggests, so a strand
 * within ±6% of the wrist reads as a classic fit; below that it sits snug
 * and above it drapes loose (thresholds adapted from the crystal-planet
 * reference's wristSpan idea, reworked to a wrist-relative ratio).
 */
export function wristFit(lengthCm: number, wristCm: number): WristFit {
  if (wristCm <= 0) return "classic";
  const ratio = lengthCm / wristCm;
  if (ratio < 0.97) return "snug";
  if (ratio > 1.06) return "relaxed";
  return "classic";
}

/* ------------------------------ url share codec ----------------------------- */

function toB64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeDesign(beads: Bead[], name?: string): string {
  const compact = beads.map((b) => [b.slug, b.mm] as [string, number]);
  return toB64Url(JSON.stringify(name ? { n: name, b: compact } : { b: compact }));
}

export function decodeDesign(hash: string): BraceletDesign | null {
  try {
    const raw = hash.startsWith("#bd=") ? hash.slice(4) : hash;
    const data = JSON.parse(fromB64Url(raw)) as {
      n?: string;
      b: [string, number][];
    };
    if (!Array.isArray(data.b)) return null;
    const beads: Bead[] = [];
    for (const [slug, mm] of data.b) {
      const stone = STONES.find((s) => s.slug === slug);
      if (!stone) continue;
      const allowed = stone.availableMm;
      const size = allowed.includes(mm) ? mm : allowed[0];
      beads.push({ slug, mm: size, j: 0 });
    }
    return { name: data.n ?? "", beads };
  } catch {
    return null;
  }
}

export function designToHash(beads: Bead[], name?: string): string {
  return `#bd=${encodeDesign(beads, name)}`;
}

/* --------------------------- cloud vault helpers ---------------------------- */

/** Compact wire form of a design: name + [slug, mm] pairs (jitter dropped). */
export function compactBeads(beads: Bead[]): [string, number][] {
  return beads.map((b) => [b.slug, b.mm]);
}

/** Stable content signature used to de-dupe local vs server copies. */
export function designSignature(d: BraceletDesign): string {
  return `${d.name}|${d.beads.map((b) => `${b.slug}:${b.mm}`).join(",")}`;
}

/* --------------------------------- storage ---------------------------------- */

export function loadSavedDesigns(): BraceletDesign[] {
  try {
    const raw = window.localStorage.getItem(BRACELET_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as BraceletDesign[];
    return Array.isArray(arr) ? arr.slice(0, 24) : [];
  } catch {
    return [];
  }
}

export function persistSavedDesigns(designs: BraceletDesign[]): void {
  try {
    window.localStorage.setItem(BRACELET_KEY, JSON.stringify(designs.slice(0, 24)));
  } catch {
    /* ignore */
  }
}

/* ------------------------------ JSON backup --------------------------------- */

const BACKUP_STONES = new Map(
  STONES.map((s) => [s.slug, new Set(s.availableMm)]),
);

/**
 * Serialize designs into a portable JSON backup string (downloadable file).
 * Beads are stored in the compact [slug, mm] wire form so the file stays
 * small and is resilient to future Bead shape changes.
 */
export function serializeDesignsBackup(designs: BraceletDesign[]): string {
  return JSON.stringify(
    {
      app: "moonarq-crystal-atlas",
      kind: "bracelet-designs",
      version: 1,
      exportedAt: new Date().toISOString(),
      designs: designs.map((d) => ({ name: d.name, beads: compactBeads(d.beads) })),
    },
    null,
    2,
  );
}

/**
 * Parse a design backup string. Beads are validated against the stone
 * catalog (slug + available mm). Returns the valid designs; entries with
 * no surviving beads are dropped.
 */
export function parseDesignsBackup(raw: string): BraceletDesign[] {
  try {
    const data = JSON.parse(raw) as {
      designs?: { name?: unknown; beads?: unknown }[];
    };
    if (!data || !Array.isArray(data.designs)) return [];
    const out: BraceletDesign[] = [];
    for (const entry of data.designs.slice(0, 96)) {
      const name =
        typeof entry?.name === "string" && entry.name.trim().length > 0
          ? entry.name.trim().slice(0, 24)
          : "Design";
      if (!Array.isArray(entry?.beads)) continue;
      const beads: Bead[] = [];
      for (const item of entry.beads.slice(0, 64)) {
        let slug: unknown;
        let mm: unknown;
        if (Array.isArray(item) && item.length >= 2) {
          [slug, mm] = item;
        } else if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          slug = o.slug;
          mm = o.mm;
        }
        const allowed = typeof slug === "string" ? BACKUP_STONES.get(slug) : undefined;
        if (!allowed) continue;
        if (typeof mm !== "number" || !allowed.has(mm)) continue;
        beads.push({ slug, mm, j: 0 });
      }
      if (beads.length > 0) out.push({ name, beads });
    }
    return out;
  } catch {
    return [];
  }
}
