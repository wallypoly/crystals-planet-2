// Sourced symbolic correspondences for atlas stones (meaning, chakras,
// element, zodiac, numbers, Five-Element colour proposal).
//
// Source: Drive sheet "UNIQorn 水晶资料核对与星图优化方案｜2026-10-28"
// (tabs: 30条研究主表, 现有星图17款映射, 现有款式5项补核). The whole sheet is a
// research draft, so every entry starts with `reviewed: false` and nothing
// here reaches the public UI until the owner flips it.
//
// Rules carried over from the sheet:
// - A blank field means "not yet verified", never "does not apply".
// - Family-level data (Beryl, Moonstone, Tiger's Eye for blue) is kept for
//   reference but never shown as the stone's own value.
// - Four elements follow one author system (Cunningham). Other systems are not
//   mixed in; Clear Quartz's "Storm" (Simmons) is not Air and stays blank.
// - Zodiac associations, birthstone months and planets are separate fields.
// - Numbers keep the source value; 11 is not reduced to 2 and is unrelated to
//   chakra order.
// - Five-Element colours are an editorial proposal awaiting brand approval.
// - Front-end copy uses traditional-meaning / daily-intention tone only.

import type { ChakraKey } from "./i18n";

/**
 * How far a claim can be trusted for this specific stone.
 * - explicit:    source states it directly for this material.
 * - qualified:   sourced, but with a stated limit (shown together with `note`).
 * - family-only: source covers the family or a related variety only.
 * - proposal:    editorial suggestion, not from a source (e.g. Five Elements).
 */
export type EvidenceStatus = "explicit" | "qualified" | "family-only" | "proposal";

export interface Claim<T> {
  value: T;
  status: EvidenceStatus;
  /** Research row IDs (CR###) and/or book IDs (BK:hall_cb1, BK:hall_101) */
  sources: string[];
  /** Chinese editorial note: limits, source differences, extra chakras, etc. */
  note?: string;
}

export type Element = "Fire" | "Water" | "Earth" | "Air";

export type Zodiac =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type WuXing = "metal" | "wood" | "water" | "fire" | "earth";

/**
 * Daily-intention entry points for the "choose by what I want" layer.
 * Editorial grouping of sourced meanings, not a source value itself: a stone
 * gets an intention only when its `meaning` is explicit or qualified.
 */
export type Intention = "calm" | "focus" | "confidence" | "expression" | "selfLove" | "boundaries";

/** Chip labels — owner to approve wording */
export const INTENTION_ZH: Record<Intention, string> = {
  calm: "静下心来",
  focus: "专注清晰",
  confidence: "自信行动",
  expression: "说出真心话",
  selfLove: "温柔爱自己",
  boundaries: "稳住界限",
};

export interface StoneKnowledge {
  /** Matches Stone.slug in stones-data.ts */
  slug: string;
  /** Row in 30条研究主表 (e.g. "CR011"); null when only the 补核 tab or nothing applies */
  researchId: string | null;
  /** Knowledge entity this commercial style maps to (知识实体候选) */
  entity: string;
  /** 核对结论 — identity / naming limits from the mapping tab */
  identityNote: string;
  /** Owner sign-off; false keeps every claim out of the public UI */
  reviewed: boolean;

  /** 寓意／日常意图 — short Chinese summary */
  meaning?: Claim<string>;
  /** Editorial intention tags derived from `meaning`; see Intention */
  intentions?: Intention[];
  /** Sourced chakras (may differ from Stone.chakra, which drives the filter) */
  chakras?: Claim<ChakraKey[]>;
  /** Four elements, Cunningham system only */
  element?: Claim<Element>;
  zodiac?: Claim<Zodiac[]>;
  numbers?: Claim<number[]>;
  /** Five-Element colour proposal; status is always "proposal" */
  wuxing?: Claim<WuXing>;
}

export const ELEMENT_ZH: Record<Element, string> = {
  Fire: "火",
  Water: "水",
  Earth: "土",
  Air: "风",
};

export const ZODIAC_ZH: Record<Zodiac, string> = {
  Aries: "白羊座",
  Taurus: "金牛座",
  Gemini: "双子座",
  Cancer: "巨蟹座",
  Leo: "狮子座",
  Virgo: "处女座",
  Libra: "天秤座",
  Scorpio: "天蝎座",
  Sagittarius: "射手座",
  Capricorn: "摩羯座",
  Aquarius: "水瓶座",
  Pisces: "双鱼座",
};

export const WUXING_ZH: Record<WuXing, string> = {
  metal: "金",
  wood: "木",
  water: "水",
  fire: "火",
  earth: "土",
};

export const STONE_KNOWLEDGE: Record<string, StoneKnowledge> = {
  aquamarine: {
    slug: "aquamarine",
    researchId: "CR011",
    entity: "海蓝宝／绿柱石族",
    identityNote: "名称对应；样品未鉴定",
    reviewed: false,
    meaning: { value: "平静沟通与真诚表达", status: "explicit", sources: ["CR011"] },
    intentions: ["calm", "expression"],
    chakras: { value: ["Throat"], status: "explicit", sources: ["CR011"] },
    zodiac: { value: ["Aquarius"], status: "qualified", sources: ["CR011"], note: "Hall表" },
  },
  beryl: {
    slug: "beryl",
    researchId: null,
    entity: "绿柱石母类",
    identityNote: "家族级资料，不能自动作为绿色品种专属；Morganite（粉色绿柱石）另列",
    reviewed: false,
  },
  "blue-tigers-eye": {
    slug: "blue-tigers-eye",
    researchId: "CR008",
    entity: "虎眼石主题",
    identityNote: "不可将金色虎眼寓意无条件推广蓝色",
    reviewed: false,
    meaning: { value: "勇气、判断与行动", status: "family-only", sources: ["CR008"] },
    chakras: { value: ["Root", "Sacral", "Solar Plexus"], status: "family-only", sources: ["CR008"] },
    zodiac: { value: ["Leo"], status: "family-only", sources: ["CR008"], note: "Hall另一表；虎眼石条目" },
  },
  "brazil-amethyst": {
    slug: "brazil-amethyst",
    researchId: "CR001",
    entity: "紫水晶",
    identityNote: "产地款保留；知识主题与乌拉圭款合并，产地未验",
    reviewed: false,
    meaning: { value: "静心、冥想与灵性探索", status: "explicit", sources: ["CR001"] },
    intentions: ["calm"],
    chakras: { value: ["Crown"], status: "qualified", sources: ["CR001"], note: "Hall另列眉心轮、喉轮" },
    element: { value: "Water", status: "explicit", sources: ["CR001"], note: "Cunningham" },
    zodiac: { value: ["Aquarius", "Pisces"], status: "explicit", sources: ["CR001"] },
    numbers: { value: [3], status: "qualified", sources: ["CR001"], note: "来源流派对应" },
  },
  "citrine-crystal": {
    slug: "citrine-crystal",
    researchId: null,
    entity: "黄水晶候选（名称冲突）",
    identityNote: "图号对应黄水晶，另有黄塔晶；需先核SKU身份，CR004仅作背景，不直接合并",
    reviewed: false,
  },
  // element: Simmons "Storm" is not Air — left blank
  "clear-quartz": {
    slug: "clear-quartz",
    researchId: "CR003",
    entity: "石英／白水晶",
    identityNote: "保留原slug；样品未鉴定",
    reviewed: false,
    meaning: { value: "聚焦意图与整理思绪", status: "explicit", sources: ["CR003"] },
    intentions: ["focus"],
    chakras: { value: ["Crown"], status: "qualified", sources: ["CR003"], note: "Hall泛石英资料：全脉轮／高顶轮" },
    numbers: { value: [4], status: "qualified", sources: ["CR003"], note: "来源流派对应" },
    wuxing: { value: "metal", status: "proposal", sources: ["CR003"], note: "白／无色款配色延伸，未获品牌批准" },
  },
  "golden-shine-obsidian": {
    slug: "golden-shine-obsidian",
    researchId: "CR006",
    entity: "黑曜石（商业品种）",
    identityNote: "天然火山玻璃；不将所有颜色款混成一款",
    reviewed: false,
    meaning: { value: "自我反思、界限与守护意图", status: "explicit", sources: ["CR006"], note: "黑曜石条目，知识主题共用" },
    intentions: ["boundaries"],
    chakras: { value: ["Root"], status: "explicit", sources: ["CR006"], note: "另列地星轮" },
    element: { value: "Fire", status: "explicit", sources: ["CR006"], note: "Cunningham" },
  },
  "golden-tigers-eye": {
    slug: "golden-tigers-eye",
    researchId: "CR008",
    entity: "虎眼石",
    identityNote: "图鉴资料不代表当前DIY有库存",
    reviewed: false,
    meaning: { value: "勇气、判断与行动", status: "explicit", sources: ["CR008"] },
    intentions: ["confidence"],
    chakras: { value: ["Root", "Sacral", "Solar Plexus"], status: "explicit", sources: ["CR008"] },
    zodiac: { value: ["Leo"], status: "qualified", sources: ["CR008"], note: "Hall另一表" },
  },
  "gray-moonstone": {
    slug: "gray-moonstone",
    researchId: "CR009",
    entity: "月光石颜色商名",
    identityNote: "仅家族背景；灰色品种身份与专属对应未核",
    reviewed: false,
    meaning: { value: "内在探索、变化与自我理解", status: "family-only", sources: ["CR009"] },
    chakras: { value: ["Crown"], status: "family-only", sources: ["CR009"], note: "不同资料有差异" },
    element: { value: "Water", status: "family-only", sources: ["CR009"], note: "Cunningham，月光石条目" },
    zodiac: { value: ["Cancer", "Libra", "Scorpio"], status: "family-only", sources: ["CR009"], note: "Hall另一表另列双鱼座" },
    numbers: { value: [4], status: "family-only", sources: ["CR009"] },
  },
  kunzite: {
    slug: "kunzite",
    researchId: null,
    entity: "锂辉石品种（粉紫色）",
    identityNote: "只把粉紫色锂辉石称作Kunzite；与锂云母明确区分",
    reviewed: false,
    meaning: { value: "爱、平和、创造与自我表达", status: "explicit", sources: ["BK:hall_cb1"] },
    intentions: ["selfLove", "expression"],
    chakras: { value: ["Heart", "Throat", "Third Eye"], status: "explicit", sources: ["BK:hall_101"], note: "Hall另列高心轮（胸腺）与心之种子" },
  },
  "rose-quartz": {
    slug: "rose-quartz",
    researchId: "CR002",
    entity: "粉晶／玫瑰石英",
    identityNote: "同主题别名；保留原slug",
    reviewed: false,
    meaning: { value: "爱、自我关怀与温柔相待", status: "explicit", sources: ["CR002"] },
    intentions: ["selfLove"],
    chakras: { value: ["Heart"], status: "qualified", sources: ["CR002"], note: "另列高心轮；其他来源另列海底轮" },
    zodiac: { value: ["Libra"], status: "qualified", sources: ["CR002"], note: "Hall表" },
  },
  "silver-shine-obsidian": {
    slug: "silver-shine-obsidian",
    researchId: "CR006",
    entity: "黑曜石（商业品种）",
    identityNote: "知识主题共用；商业品种说明分开",
    reviewed: false,
    meaning: { value: "自我反思、界限与守护意图", status: "explicit", sources: ["CR006"], note: "黑曜石条目，知识主题共用" },
    intentions: ["boundaries"],
    chakras: { value: ["Root"], status: "explicit", sources: ["CR006"], note: "另列地星轮" },
    element: { value: "Fire", status: "explicit", sources: ["CR006"], note: "Cunningham" },
  },
  "strawberry-quartz": {
    slug: "strawberry-quartz",
    researchId: null,
    entity: "商业名，样品身份待核",
    identityNote: "Hall指出可能人造；不由slug认定样品为石英",
    reviewed: false,
  },
  sunstone: {
    slug: "sunstone",
    researchId: null,
    entity: "太阳石候选",
    identityNote: "红色／阿鲁沙限定与具体矿物身份尚未核实",
    reviewed: false,
    meaning: { value: "喜悦、乐观、直觉与活力", status: "family-only", sources: ["BK:hall_cb1"], note: "Hall泛太阳石条目，不证明红色阿鲁沙品种" },
    chakras: { value: ["Root", "Sacral", "Solar Plexus"], status: "family-only", sources: ["BK:hall_101"] },
  },
  "uruguay-amethyst": {
    slug: "uruguay-amethyst",
    researchId: "CR001",
    entity: "紫水晶",
    identityNote: "与巴西款共用知识主题；原产地款保留",
    reviewed: false,
    meaning: { value: "静心、冥想与灵性探索", status: "explicit", sources: ["CR001"] },
    intentions: ["calm"],
    chakras: { value: ["Crown"], status: "qualified", sources: ["CR001"], note: "Hall另列眉心轮、喉轮" },
    element: { value: "Water", status: "explicit", sources: ["CR001"], note: "Cunningham" },
    zodiac: { value: ["Aquarius", "Pisces"], status: "explicit", sources: ["CR001"] },
    numbers: { value: [3], status: "qualified", sources: ["CR001"], note: "来源流派对应" },
  },
  "white-crystal-cube": {
    slug: "white-crystal-cube",
    researchId: null,
    entity: "切型／商名，材质待核",
    identityNote: "不能仅靠切型或名称证明样品为石英；CR003仅作背景",
    reviewed: false,
  },
  "yellow-tigers-eye": {
    slug: "yellow-tigers-eye",
    researchId: "CR008",
    entity: "虎眼石",
    identityNote: "与金虎眼是不同款（店主确认）；虎眼石资料仅作家族背景，不单独凑矿种数",
    reviewed: false,
    meaning: { value: "勇气、判断与行动", status: "family-only", sources: ["CR008"] },
    chakras: { value: ["Root", "Sacral", "Solar Plexus"], status: "family-only", sources: ["CR008"] },
    zodiac: { value: ["Leo"], status: "family-only", sources: ["CR008"], note: "Hall另一表" },
  },
};

export function stoneKnowledge(slug: string): StoneKnowledge | undefined {
  return STONE_KNOWLEDGE[slug];
}

/** Statuses that may be shown as the stone's own value */
const PUBLIC_STATUSES: ReadonlySet<EvidenceStatus> = new Set(["explicit", "qualified"]);

/**
 * Slugs offered under an intention chip. Same gate as publicClaims: the entry
 * must be reviewed (unless `includeDraft`) and its meaning must be public.
 */
export function stonesForIntention(
  intention: Intention,
  { includeDraft = false }: { includeDraft?: boolean } = {},
): string[] {
  return Object.values(STONE_KNOWLEDGE)
    .filter(
      (k) =>
        (k.reviewed || includeDraft) &&
        k.meaning !== undefined &&
        PUBLIC_STATUSES.has(k.meaning.status) &&
        k.intentions?.includes(intention),
    )
    .map((k) => k.slug);
}

type ClaimField ="meaning" | "chakras" | "element" | "zodiac" | "numbers" | "wuxing";

export type PublicClaims = Partial<Pick<StoneKnowledge, ClaimField>>;

/**
 * Claims safe to render for a stone. Returns nothing for unreviewed entries
 * unless `includeDraft` is set (local preview only). Family-only and proposal
 * claims are always dropped; qualified claims keep their `note` so the UI can
 * show the limit next to the value.
 */
export function publicClaims(
  slug: string,
  { includeDraft = false }: { includeDraft?: boolean } = {},
): PublicClaims {
  const k = STONE_KNOWLEDGE[slug];
  if (!k || (!k.reviewed && !includeDraft)) return {};
  const out: PublicClaims = {};
  const fields: ClaimField[] = ["meaning", "chakras", "element", "zodiac", "numbers", "wuxing"];
  for (const f of fields) {
    const claim = k[f];
    if (claim && PUBLIC_STATUSES.has(claim.status)) {
      (out as Record<ClaimField, unknown>)[f] = claim;
    }
  }
  return out;
}
