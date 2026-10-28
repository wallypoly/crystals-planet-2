import type { Metadata } from "next";
import { SiteHeader } from "@/components/crystal/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { STONES, type Stone } from "@/lib/stones-data";
import { stoneZh } from "@/lib/i18n";
import { buildPreset, PRESETS, type Bead } from "@/lib/bracelet";
import type { StudioSeed } from "@/components/crystal/bracelet-studio";
import { StudioHost } from "./studio-host";
import "../../inner.css";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

const find = (slug: string | undefined) =>
  slug ? STONES.find((s) => s.slug === slug) : undefined;

const nameOf = (stone: Stone) => stoneZh(stone.slug)?.name ?? stone.displayName;

/** Same bead sizing the atlas uses when it hands a stone to the studio. */
function beadFor(stone: Stone): Bead {
  const mm = stone.availableMm.includes(8) ? 8 : stone.availableMm[0];
  return { slug: stone.slug, mm, j: 3 };
}

/**
 * Colour-family → preset, mirroring FAMILY_PRESET in crystal-atlas.tsx.
 *
 * A lone bead is not a bracelet: two beads on a 16 cm wrist read as 1.6 cm of
 * inner length, so the studio's fit badge and advice are both wrong. Seeding
 * from the matching preset gives a strand that already fits, with the stone
 * the visitor chose weighted to the front of the run.
 */
const FAMILY_PRESET: Record<string, string> = {
  Blue: "sea-horizon",
  Green: "sea-horizon",
  Clear: "sea-horizon",
  Gold: "golden-hour",
  Amber: "golden-hour",
  Purple: "violet-dusk",
  Blush: "violet-dusk",
  Rose: "rose-mist",
  Dark: "midnight-smoke",
  Smoke: "midnight-smoke",
};

/** A ready-made strand in the stone's own colour family. */
function presetFor(stone: Stone): Bead[] {
  const key = FAMILY_PRESET[stone.colorFamily] ?? "sea-horizon";
  const preset = PRESETS.find((p) => p.key === key) ?? PRESETS[0];
  return buildPreset(preset);
}

/**
 * Lead with the stones the visitor actually picked, then fill out to a real
 * wrist circumference using the family preset. Repeats keep the picked stone
 * dominant without leaving the strand short.
 */
function strandFor(self: Stone | undefined, accent: Stone | undefined): Bead[] {
  const picked = [self, accent].filter((s): s is Stone => Boolean(s));
  if (picked.length === 0) return [];

  const lead = picked.flatMap((s) => [beadFor(s), beadFor(s)]);
  const filler = presetFor(self ?? (accent as Stone));
  return [...lead, ...filler].slice(0, 24);
}

/**
 * Stable stamp per parameter combination. The studio re-seeds whenever the
 * seed's ts changes, so this has to be deterministic across server and
 * client renders — a Date.now() here would wipe edits on re-render.
 */
function stamp(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) | 0;
  return h;
}

/**
 * ?stone=<slug>            → that crystal on the strand
 * ?stone=<slug>&accent=<slug> → the pairing the notes panel used to build
 */
function buildSeed(
  self: Stone | undefined,
  accent: Stone | undefined,
): { seed: StudioSeed | null; label: string | null } {
  if (!self && !accent) return { seed: null, label: null };

  const picked = [self, accent].filter((s): s is Stone => Boolean(s));
  const seed: StudioSeed = {
    beads: strandFor(self, accent),
    name:
      self && accent
        ? `搭档 · ${nameOf(self)} + ${nameOf(accent)}`
        : `定制 · ${nameOf(picked[0])}`,
    ts: stamp(picked.map((s) => s.slug).join("+")),
  };

  return { seed, label: picked.map(nameOf).join(" + ") };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const self = find(one(params.stone));
  const accent = find(one(params.accent));
  const base = "个人手串定制工坊 · UNIQorn";

  const stones = [self, accent].filter((s): s is Stone => Boolean(s));
  if (stones.length === 0) {
    return {
      title: base,
      description:
        "UNIQorn 个人手串定制工坊：选晶、调珠径与配色，保存设计、导出成图，或生成可分享的链接。",
    };
  }

  const title = `${stones.map(nameOf).join(" × ")} 手串 · UNIQorn 定制工坊`;
  const lead = self
    ? self.intro
    : `以 ${nameOf(accent as Stone)} 为起点，在定制工坊里调出属于你的手串。`;

  return {
    title,
    description: lead,
    openGraph: { title, description: lead, type: "website" },
    twitter: { card: "summary", title, description: lead },
  };
}

export default async function CustomStudioPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { seed, label } = buildSeed(find(one(params.stone)), find(one(params.accent)));

  return (
    <div className="atlas-shell">
      <SiteHeader />
      <main className="studio-page">
        <div className="studio-page__intro">
          <p className="atlas-panel-kicker">Custom Made · 个人手串定制</p>
          <h1 className="studio-page__title">把图鉴里的晶石，串成一条属于你的手串</h1>
          <p className="studio-page__lede">
            从星图图鉴里选中的晶石会自动带进来。调整珠径、间距与配色之后，可以保存设计、导出成图片，或生成一条可分享的链接。
          </p>
          {label ? <p className="studio-page__seeded">本次带入 · {label}</p> : null}
        </div>

        <div className="studio-page__stage">
          <StudioHost seed={seed} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
