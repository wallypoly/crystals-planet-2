// Look-and-wear layer for atlas stones: colour tone, how to wear, outfit/occasion.
//
// Editorial copy only — derived from each stone's palette, colour family and
// available bead sizes in stones-data.ts. It makes no claim about meaning,
// energy or effect (that lives in stone-knowledge.ts with source status), so it
// can also cover stones whose identity or symbolism is still unverified.
// Drafted 2026-10-29; every entry stays `reviewed: false` until the owner
// approves the wording.

/** Coarse colour mood used for the "choose by look" filter; pink gets its own tone */
export type ColorTone = "cool" | "warm" | "soft" | "clear" | "deep";

export const COLOR_TONE_ZH: Record<ColorTone, string> = {
  cool: "清冷",
  warm: "暖调",
  soft: "柔粉",
  clear: "通透",
  deep: "深邃",
};

export interface StoneStyle {
  /** Matches Stone.slug in stones-data.ts */
  slug: string;
  tone: ColorTone;
  /** How to wear by bead size, e.g. "8mm 日常通勤精致，12mm 单戴有存在感" */
  wearZh: string;
  /** Outfit / occasion pairing, e.g. "配白衬衫、牛仔蓝，适合通勤" */
  styleZh: string;
  reviewed: boolean;
}

export const STONE_STYLE: Record<string, StoneStyle> = {
  aquamarine: { slug: "aquamarine", tone: "cool", wearZh: "6mm 轻巧精致，12mm 单戴更有存在感", styleZh: "配白衬衫、浅灰西装，适合通勤", reviewed: false },
  beryl: { slug: "beryl", tone: "cool", wearZh: "8mm 日常耐看，14mm 单戴更显分量", styleZh: "配米白针织、薄荷绿连衣裙，适合春日约会", reviewed: false },
  "blue-tigers-eye": { slug: "blue-tigers-eye", tone: "deep", wearZh: "8mm 日常百搭，14mm 单戴更有分量", styleZh: "配深蓝针织、黑色大衣，适合秋冬通勤", reviewed: false },
  "brazil-amethyst": { slug: "brazil-amethyst", tone: "cool", wearZh: "8mm 轻盈显色，14mm 单戴紫色更饱满", styleZh: "配浅灰羊绒、珍珠白，适合晚间约会", reviewed: false },
  "citrine-crystal": { slug: "citrine-crystal", tone: "warm", wearZh: "8mm 日常明亮，12mm 单戴金调更醒目", styleZh: "配米色风衣、焦糖色毛衣，适合秋季通勤", reviewed: false },
  "clear-quartz": { slug: "clear-quartz", tone: "clear", wearZh: "6mm 叠戴不抢色，14mm 单戴透亮清爽", styleZh: "配黑色西装、白T恤，适合职场与日常", reviewed: false },
  "golden-shine-obsidian": { slug: "golden-shine-obsidian", tone: "deep", wearZh: "8mm 细节有光泽，14mm 单戴黑金对比强", styleZh: "配黑色高领、驼色大衣，适合夜晚聚会", reviewed: false },
  "golden-tigers-eye": { slug: "golden-tigers-eye", tone: "warm", wearZh: "8mm 层次温润，16mm 单戴很有分量", styleZh: "配卡其外套、牛仔裤，适合周末出游", reviewed: false },
  "gray-moonstone": { slug: "gray-moonstone", tone: "cool", wearZh: "8mm 柔和雾感，14mm 单戴更有质感", styleZh: "配灰色针织、米白西裤，适合通勤", reviewed: false },
  kunzite: { slug: "kunzite", tone: "soft", wearZh: "6mm 淡雅轻盈，14mm 单戴粉紫更柔和", styleZh: "配浅粉衬衫、奶油白半裙，适合下午茶", reviewed: false },
  "rose-quartz": { slug: "rose-quartz", tone: "soft", wearZh: "8mm 日常温柔，12mm 单戴显气色", styleZh: "配奶茶色大衣、珍珠耳饰，适合约会", reviewed: false },
  "silver-shine-obsidian": { slug: "silver-shine-obsidian", tone: "deep", wearZh: "8mm 利落耐看，14mm 单戴冷感更突出", styleZh: "配黑色西装、银色耳环，适合商务晚宴", reviewed: false },
  "strawberry-quartz": { slug: "strawberry-quartz", tone: "soft", wearZh: "6mm 细腻叠色，12mm 单戴草莓粉明显", styleZh: "配白色亚麻衬衫、浅牛仔裤，适合周末逛街", reviewed: false },
  sunstone: { slug: "sunstone", tone: "warm", wearZh: "仅提供8mm，适合作单颗小亮点", styleZh: "配米白针织、橘色围巾，适合秋日出游", reviewed: false },
  "uruguay-amethyst": { slug: "uruguay-amethyst", tone: "deep", wearZh: "8mm 深紫耐看，12mm 单戴更有浓度", styleZh: "配黑色连衣裙、深灰大衣，适合夜间约会", reviewed: false },
  "white-crystal-cube": { slug: "white-crystal-cube", tone: "clear", wearZh: "10mm 简洁通透，14mm 单戴更显棱角", styleZh: "配白色西装、灰色西裤，适合会议场合", reviewed: false },
  "yellow-tigers-eye": { slug: "yellow-tigers-eye", tone: "warm", wearZh: "8mm 细纹生动，12mm 单戴更有木质感", styleZh: "配燕麦色针织、牛仔外套，适合轻松休闲", reviewed: false },
};

export function stoneStyle(slug: string): StoneStyle | undefined {
  return STONE_STYLE[slug];
}
