// Bilingual dictionary (EN / 简体中文) for the UNIQorn Interactive Crystal Atlas.
// Stone-level Chinese content is original editorial translation for UNIQorn Soul Wellness.

export type Lang = "en" | "zh";

export const LANG_KEY = "atlas-lang";

export interface StoneZh {
  name: string;
  material: string; // 晶体 / 石材
  family: string;
  chakra: string;
  birthstone: string | null;
  intro: string;
  keywords: string[];
  properties: string[];
  pairing: string[];
}

export const STONE_ZH: Record<string, StoneZh> = {
  aquamarine: {
    name: "海蓝宝",
    material: "晶体",
    family: "蓝色",
    chakra: "喉轮",
    birthstone: "三月",
    intro:
      "清透的海玻璃蓝，带着安静的光泽。海蓝宝为手链构图铺开干净的水平线与沉稳的建筑式冷光。",
    keywords: ["海玻璃", "清冽", "静谧专注"],
    properties: ["象征清明", "清爽蓝色调", "开阔轻盈的搭配感"],
    pairing: ["白水晶提亮", "绿柱石柔和矿感", "白冰块塑造冰感结构"],
  },
  beryl: {
    name: "绿柱石",
    material: "晶体",
    family: "绿色",
    chakra: "心轮",
    birthstone: null,
    intro:
      "绿柱石以淡雅的矿物绿落在星图之中，是水色蓝、净白与柔粉之间温柔的过渡桥梁。",
    keywords: ["矿物绿", "温柔过渡", "半透明叶片"],
    properties: ["象征新生", "柔和绿光", "清新色调衔接"],
    pairing: ["海蓝宝冷调弧线", "粉水晶增添柔和", "白水晶整体提亮"],
  },
  "blue-tigers-eye": {
    name: "蓝虎眼",
    material: "石材",
    family: "深色",
    chakra: "眉心轮",
    birthstone: null,
    intro:
      "蓝虎眼带有午夜般的丝绢光泽，为冷色系手链注入图形化的深度与一抹低调的流动光晕。",
    keywords: ["午夜纹带", "蓝色阴影", "抛光纵深"],
    properties: ["象征沉稳", "深蓝对比", "方向性纹带"],
    pairing: ["银耀石烟感", "海蓝宝反差", "白水晶点缀高光"],
  },
  "brazil-amethyst": {
    name: "巴西紫水晶",
    material: "晶体",
    family: "紫色",
    chakra: "顶轮",
    birthstone: "二月",
    intro:
      "巴西紫水晶带来柔和的紫罗兰深度，像暮色一样沉稳而不沉重，与净色或粉色系尤其相衬。",
    keywords: ["紫罗兰面纱", "暮色色调", "柔和对撞"],
    properties: ["象征内省", "薰衣草紫深度", "编辑感的紫色点缀"],
    pairing: ["白水晶提亮", "粉水晶回暖", "银耀石压暗层次"],
  },
  "citrine-crystal": {
    name: "黄塔晶",
    material: "晶体",
    family: "金色",
    chakra: "太阳轮",
    birthstone: "十一月",
    intro:
      "黄塔晶像一勺蜂蜜般温暖透亮，为星图添上金色的光线，却依然保持克制的矿物气质。",
    keywords: ["蜂蜜光", "金色提亮", "暖矿感"],
    properties: ["象征明朗", "金色暖意", "阳光点缀"],
    pairing: ["金虎眼同调暖色", "白水晶增加闪耀", "太阳石更暖的脉搏"],
  },
  "clear-quartz": {
    name: "白水晶",
    material: "晶体",
    family: "净色",
    chakra: "顶轮",
    birthstone: "四月",
    intro:
      "白水晶像一次光的停顿：透明、明亮，擅长以干净的光线为浓烈色彩之间留出呼吸。",
    keywords: ["干净光线", "透明的停顿", "光学澄澈"],
    properties: ["象征清明", "中性亮色", "调色盘连接者"],
    pairing: ["几乎百搭全部色盘", "紫水晶形成对比", "海蓝宝勾出冰感线条"],
  },
  "golden-shine-obsidian": {
    name: "金耀石",
    material: "石材",
    family: "深色",
    chakra: "海底轮",
    birthstone: null,
    intro:
      "金耀石初看是深沉的黑，转动间却闪出暖铜流光，为手链藏进一线金属般的暗金温度。",
    keywords: ["铜金闪光", "黑玻璃", "隐藏的暖意"],
    properties: ["象征扎根", "反射性暖光", "高对比抛光"],
    pairing: ["金虎眼琥珀呼应", "黄塔晶注入光感", "银耀石镜面对照"],
  },
  "golden-tigers-eye": {
    name: "金虎眼",
    material: "石材",
    family: "金色",
    chakra: "太阳轮",
    birthstone: null,
    intro:
      "金虎眼在琥珀与赭石色之间流动出天然条纹，是兼具暖意与结构感的图形节奏。",
    keywords: ["琥珀纹带", "大地抛光", "太阳律动"],
    properties: ["象征自信", "暖色条纹律动", "沉稳金调"],
    pairing: ["黄塔晶增亮", "蓝虎眼冷色对比", "耀石家族压出阴影"],
  },
  "gray-moonstone": {
    name: "灰月光",
    material: "晶体",
    family: "烟色",
    chakra: "眉心轮",
    birthstone: "六月",
    intro:
      "灰月光为星图铺上一层月雾：柔和、清冷、含蓄地反着光，却从不显得冷硬。",
    keywords: ["月雾", "柔和烟感", "静谧反光"],
    properties: ["象征直觉", "烟色半透", "低饱和月光调"],
    pairing: ["银耀石同造烟感", "白水晶提亮", "粉水晶柔化"],
  },
  kunzite: {
    name: "紫锂辉",
    material: "晶体",
    family: "藕粉",
    chakra: "心轮",
    birthstone: null,
    intro:
      "紫锂辉是淡雅的丁香粉，轻盈通透，为手链带来星光般的柔粉，而不是甜腻的粉。",
    keywords: ["丁香藕粉", "粉彩光", "柔光棱镜"],
    properties: ["象征温柔", "轻盈粉紫调", "细腻通透感"],
    pairing: ["粉水晶组成粉调家族", "白水晶增加澄澈", "巴西紫水晶加深紫色"],
  },
  "rose-quartz": {
    name: "粉水晶",
    material: "晶体",
    family: "粉色",
    chakra: "心轮",
    birthstone: null,
    intro:
      "粉水晶铺开一片温柔的腮红场域：柔和的粉、半透的质地，适合安静浪漫或礼物向的配色。",
    keywords: ["腮红场", "柔粉", "温和暖意"],
    properties: ["象征柔和", "粉调色彩叙事", "暖调半透质地"],
    pairing: ["紫锂辉丁香柔粉", "白水晶提亮", "绿柱石清新对比"],
  },
  "silver-shine-obsidian": {
    name: "银耀石",
    material: "石材",
    family: "烟色",
    chakra: "海底轮",
    birthstone: null,
    intro:
      "银耀石是一面抛光的烟色之镜，带来月亮般的对比与利落的金属感光泽，却不含一丝金属。",
    keywords: ["烟色之镜", "银色闪光", "月之黑"],
    properties: ["象征专注", "反射性阴影", "冷调利落对比"],
    pairing: ["灰月光共写月色", "蓝虎眼加深层次", "白冰块锐利补光"],
  },
  "strawberry-quartz": {
    name: "草莓晶",
    material: "晶体",
    family: "粉色",
    chakra: "心轮",
    birthstone: null,
    intro:
      "草莓晶带着更暖的莓果粉光，当手链需要色彩又想保留矿物肌理与柔和时，它正是答案。",
    keywords: ["莓果光", "暖粉", "肌理腮红"],
    properties: ["象征爱意", "莓粉暖意", "柔和内部肌理"],
    pairing: ["粉水晶同调叠色", "紫锂辉粉彩光", "白水晶提亮"],
  },
  sunstone: {
    name: "红太阳石",
    material: "晶体",
    family: "琥珀",
    chakra: "脐轮",
    birthstone: null,
    intro:
      "太阳石是星图里的火花：一颗紧凑的暖光珠子，凝聚了蜜桃、铜金与矿物的明亮。",
    keywords: ["暖火花", "铜色闪亮", "太阳珠"],
    properties: ["象征活力", "蜜桃铜金暖意", "小体量发光点"],
    pairing: ["黄塔晶金色呼应", "金虎眼纹带映衬", "粉水晶回暖"],
  },
  "uruguay-amethyst": {
    name: "乌拉圭紫晶",
    material: "晶体",
    family: "紫色",
    chakra: "顶轮",
    birthstone: "二月",
    intro:
      "乌拉圭紫晶是星图中最饱和的紫：浓郁的紫色结构，让安静的配色瞬间有了重心。",
    keywords: ["深紫", "饱和重点", "夜之绽放"],
    properties: ["象征沉思", "深紫色点缀", "浓郁暮色"],
    pairing: ["巴西紫水晶构成紫调层次", "白水晶提亮", "银耀石戏剧化阴影"],
  },
  "white-crystal-cube": {
    name: "白冰块",
    material: "晶体",
    family: "净色",
    chakra: "顶轮",
    birthstone: "四月",
    intro:
      "白冰块以切面立方改变节奏：在一串圆珠之间落下冰感的建筑式标点。",
    keywords: ["切面冰块", "建筑式停顿", "白色棱镜"],
    properties: ["象征精确", "棱角净白点缀", "结构化光线"],
    pairing: ["海蓝宝冰感同调", "银耀石强对比", "白水晶延续光感"],
  },
  "yellow-tigers-eye": {
    name: "黄虎眼",
    material: "石材",
    family: "金色",
    chakra: "太阳轮",
    birthstone: null,
    intro:
      "黄虎眼偏向金棕色调，纹带清晰可见，为自然律动型的手链添上一笔温暖的大地色。",
    keywords: ["赭金纹带", "暖大地", "条纹微光"],
    properties: ["象征稳定", "金棕律动", "大地暖意"],
    pairing: ["金虎眼组成同调系列", "黄塔晶提亮", "蓝虎眼冷色对比"],
  },
};

/** UI dictionary */
export interface UIStrings {
  kicker: string;
  title: string;
  stones: string;
  variants: string;
  searchPlaceholder: string;
  searchAria: string;
  all: string;
  clearSearch: string;
  filterByColor: string;
  matchCount: (n: number, total: number) => string;
  openFavorites: (n: number) => string;
  orbitView: string;
  gridView: string;
  braceletStudio: string;
  langToggle: string;
  notesToggle: string;
  openStone: (name: string, cat: string) => string;
  toggleFav: (name: string, add: boolean) => string;
  closeDetail: string;
  prevCrystal: string;
  nextCrystal: string;
  buildSizes: string;
  sourceSizes: string;
  grades: string;
  variantsLabel: (n: number) => string;
  stoneProfile: string;
  mohs: string;
  chakra: string;
  birthstone: string;
  none: string;
  symbolicStyling: string;
  pairingIdeas: string;
  buildCta: (name: string) => string;
  ctaHint: string;
  customMadeCta: (name: string) => string;
  customMadeHint: string;
  customMadePairCta: (partner: string) => string;
  customMadeDirect: string;
  customMadeTitle: string;
  backToSite: string;
  articlesLink: string;
  sizeScale: string;
  notesTitle: string;
  notesBody1: string;
  notesBody2: string;
  howToRead: string;
  howTo1: string;
  howTo2: string;
  howTo3: string;
  buildYourOwn: string;
  guidedDesign: string;
  favoritesKicker: string;
  favoritesTitle: (n: number) => string;
  favoritesEmpty: string;
  browseAtlas: string;
  locate: string;
  remove: string;
  shareLink: string;
  copied: string;
  noStonesFound: string;
  noStonesHint: string;
  viewDetails: (name: string) => string;
  locateOnMap: (name: string) => string;
  removeFav: (name: string) => string;
  mobileSummary: string;
  // Studio
  studioTitle: string;
  studioKicker: string;
  tray: string;
  beadSize: string;
  addBead: (name: string) => string;
  removeBead: string;
  undo: string;
  clearAll: string;
  emptyBracelet: string;
  wristSize: string;
  autoFit: string;
  fitSnug: string;
  fitClassic: string;
  fitRelaxed: string;
  fitSnugAdvice: string;
  fitClassicAdvice: string;
  fitRelaxedAdvice: string;
  fitAria: (fit: string) => string;
  accentTitle: string;
  accentHint: string;
  accentStone: string;
  accentNone: string;
  accentInterval: string;
  accentApply: string;
  accentApplied: (n: number) => string;
  accentAria: string;
  presets: string;
  presetNames: string[];
  rotate: string;
  spin: string;
  statsBeads: string;
  statsLength: string;
  saveDesign: string;
  designName: string;
  savedDesigns: string;
  load: string;
  share: string;
  closeStudio: string;
  studioHint: string;
  beadCount: (n: number) => string;
  estLength: string;
  // Daily crystal
  dailyKicker: string;
  dailyCta: string;
  dailyAria: (name: string) => string;
  dailyBadge: string;
  // Pairing
  pairHint: string;
  pairBuildAria: (partner: string) => string;
  // Weekly review
  weekTitle: string;
  weekHint: string;
  weekAria: (name: string) => string;
  today: string;
  weekExpand: string;
  weekCollapse: string;
  // Pair of the day
  pairDayKicker: string;
  pairDayCta: string;
  pairDayAria: (a: string, b: string) => string;
  pairDayVisit: (name: string) => string;
  // Share stone link
  shareStone: string;
  // Export
  exportPng: string;
  exported: string;
  exportHint: string;
  qrCaption: string;
  // Toasts
  toastFavAdd: (name: string) => string;
  toastFavRemove: (name: string) => string;
  toastCopy: string;
  toastExport: string;
  toastSave: (name: string) => string;
  // Theme
  themeLightName: string;
  themeDarkName: string;
  themeToLight: string;
  themeToDark: string;
  // Shortcuts
  shortcutsHelp: string;
  shortcutsTitle: string;
  shortcutsRotate: string;
  shortcutsNav: string;
  shortcutsClose: string;
  shortcutsSearch: string;
  // Codex (field-guide overlay)
  codexOpen: string;
  codexKicker: string;
  codexTitle: string;
  codexClose: string;
  codexTabArchive: string;
  codexTabChakras: string;
  codexTabBirthstones: string;
  codexSearchPlaceholder: string;
  codexSearchAria: string;
  codexSortName: string;
  codexSortHardness: string;
  codexSortAria: string;
  codexIntro: string;
  codexStats: (s: number, c: number, m: number) => string;
  codexArchiveHint: string;
  codexChakraHint: string;
  codexBirthHint: string;
  codexViewInAtlas: string;
  codexCompanions: string;
  codexNoMonth: string;
  codexUndated: string;
  codexEmpty: string;
  codexVisitAria: (name: string) => string;
  codexTabCompare: string;
  codexCompareHint: string;
  codexCompareHintChakra: string;
  codexCompareHintMonth: string;
  codexCompareScale: string;
  codexCompareHardest: string;
  codexCompareSofter: string;
  codexCompareRank: (n: number) => string;
  codexDimLabel: string;
  codexDimColor: string;
  codexDimChakra: string;
  codexDimMonth: string;
  // Week of pairs
  pairsWeekTitle: string;
  pairsWeekHint: string;
  pairsWeekAria: (a: string, b: string) => string;
  // Pairing almanac (Codex month calendar)
  codexTabAlmanac: string;
  codexAlmanacHint: string;
  almanacPrev: string;
  almanacNext: string;
  almanacToday: string;
  almanacBackToToday: string;
  almanacWeekdays: string[];
  almanacDayAria: (d: string, a: string, b: string) => string;
  almanacLegend: string;
  // Design backup (JSON export / import)
  bkExport: string;
  bkExportAria: string;
  bkImport: string;
  bkImportAria: string;
  bkImported: (n: number, skipped: number) => string;
  bkInvalid: string;
  bkExported: string;
  // Favorites pairing suggestions
  favSugTitle: string;
  favSugHint: string;
  favSugAria: (a: string, b: string) => string;
  // Server vault sync
  vaultSynced: string;
  vaultSyncing: string;
  vaultLocal: string;
  vaultStatusAria: string;
}

const en: UIStrings = {
  kicker: "Interactive Crystal Atlas",
  title: "UNIQorn Crystal Atlas",
  stones: "Stones",
  variants: "Variants",
  searchPlaceholder: "Search stones…",
  searchAria: "Search stones by name, color, or mood",
  all: "All",
  clearSearch: "Clear search",
  filterByColor: "Filter by color family",
  matchCount: (n, total) => `${n} / ${total}`,
  openFavorites: (n) => `Open favorites, ${n} saved`,
  orbitView: "Orbit view",
  gridView: "Grid gallery view",
  braceletStudio: "Bracelet Studio",
  langToggle: "Switch to Chinese",
  notesToggle: "Atlas Notes",
  openStone: (name, cat) => `Open ${name}, ${cat}`,
  toggleFav: (name, add) =>
    add ? `Add ${name} to favorites` : `Remove ${name} from favorites`,
  closeDetail: "Close crystal detail",
  prevCrystal: "Previous crystal",
  nextCrystal: "Next crystal",
  buildSizes: "Build Sizes",
  sourceSizes: "Source Sizes",
  grades: "Grades",
  variantsLabel: (n) => `${n} builder size and grade records preserved`,
  stoneProfile: "Stone Profile",
  mohs: "Mohs Hardness",
  chakra: "Chakra",
  birthstone: "Birthstone",
  none: "—",
  symbolicStyling: "Symbolic Styling",
  pairingIdeas: "Pairing Ideas",
  buildCta: (name) => `Build with ${name}`,
  ctaHint: "Opens the Bracelet Studio",
  customMadeCta: (name) => `✨ Custom Made with ${name}`,
  customMadeHint: "Enter UNIQorn Custom Workshop with this stone for your tailored wrist size",
  customMadePairCta: (partner) => `💎 Custom Made with ${partner}`,
  customMadeDirect: "Custom Made Workshop",
  customMadeTitle: "Custom Made Bracelet",
  backToSite: "Back to UNIQorn",
  articlesLink: "Articles & Journal",
  sizeScale: "Bead Size Scale",
  notesTitle: "Reference layer",
  notesBody1:
    "UNIQorn approaches crystals and minerals with Quiet Luxury and mindful resonance. Symbolic styling notes are natural references, not medical advice or guaranteed outcomes.",
  notesBody2:
    "The atlas uses one canonical node per builder stone while preserving every source SKU, grade, millimeter size, and image path behind the selected detail panel.",
  howToRead: "How to read the atlas",
  howTo1: "Rotate the orbit with wheel, trackpad, or drag",
  howTo2: "Select a node to open its reference panel",
  howTo3: "Use the arrows to walk the full library",
  buildYourOwn: "Build Your Own",
  guidedDesign: "Guided Bracelet Design",
  favoritesKicker: "Saved",
  favoritesTitle: (n) => (n > 0 ? `Your shortlist · ${n}` : "Your shortlist"),
  favoritesEmpty:
    "Nothing saved yet. Tap the heart on any node or card to keep a stone here while you design your bracelet.",
  browseAtlas: "Browse the atlas",
  locate: "Locate",
  remove: "Remove",
  shareLink: "Copy share link",
  copied: "Copied ✓",
  noStonesFound: "No stones found",
  noStonesHint:
    "Try a different search term or clear the color filter to explore the full library.",
  viewDetails: (name) => `View ${name} details`,
  locateOnMap: (name) => `Locate ${name} on the map`,
  removeFav: (name) => `Remove ${name} from favorites`,
  mobileSummary: "Crystal Library",
  studioTitle: "Bracelet Studio",
  studioKicker: "Build Your Own",
  tray: "Bead tray",
  beadSize: "Bead size",
  addBead: (name) => `Add one ${name} bead`,
  removeBead: "Remove bead",
  undo: "Undo last",
  clearAll: "Clear all",
  emptyBracelet: "Pick beads from the tray to string your bracelet",
  wristSize: "Wrist size",
  autoFit: "Auto-fit beads",
  fitSnug: "Snug",
  fitClassic: "Classic fit",
  fitRelaxed: "Relaxed",
  fitSnugAdvice: "Sits close to the wrist — add a bead for a looser feel.",
  fitClassicAdvice: "A classic stretch length for most wrists.",
  fitRelaxedAdvice: "A looser loop — drop a bead for a closer fit.",
  fitAria: (fit) => `Bracelet fit: ${fit}`,
  accentTitle: "Accent pattern",
  accentHint: "Repeat one stone along the strand",
  accentStone: "Accent stone",
  accentNone: "Pick a stone…",
  accentInterval: "Every few beads",
  accentApply: "Apply pattern",
  accentApplied: (n) => `Accent set to every ${n} beads`,
  accentAria: "Accent bead pattern builder",
  presets: "Presets",
  presetNames: [
    "Sea Horizon",
    "Golden Hour",
    "Violet Dusk",
    "Rose Mist",
    "Midnight Smoke",
  ],
  rotate: "Rotate",
  spin: "Spin",
  statsBeads: "Beads",
  statsLength: "Inner length",
  saveDesign: "Save design",
  designName: "Design name",
  savedDesigns: "Saved designs",
  load: "Load",
  share: "Share",
  closeStudio: "Close Bracelet Studio",
  studioHint: "Click a bead on the bracelet to remove it · drag the slider to rotate",
  beadCount: (n) => `${n} beads`,
  estLength: "Inner length",
  dailyKicker: "Crystal of the Day",
  dailyCta: "View this stone",
  dailyAria: (name) => `Open the crystal of the day: ${name}`,
  dailyBadge: "Crystal of the day",
  pairHint: "Linked names jump to their atlas node",
  pairBuildAria: (partner) =>
    `Open Bracelet Studio with this stone and ${partner}`,
  weekTitle: "This week in the atlas",
  weekHint: "The last seven featured crystals",
  weekAria: (name) => `Open ${name} details`,
  today: "Today",
  weekExpand: "Expand timeline",
  weekCollapse: "Collapse timeline",
  pairDayKicker: "Pair of the Day",
  pairDayCta: "Design this pair",
  pairDayAria: (a, b) => `Open Bracelet Studio with ${a} and ${b}`,
  pairDayVisit: (name) => `Open ${name} details`,
  shareStone: "Copy link to this crystal",
  exportPng: "Export PNG",
  exported: "Saved ✓",
  exportHint: "Downloads a card of your design",
  qrCaption: "Scan to open",
  toastFavAdd: (name) => `${name} added to favorites`,
  toastFavRemove: (name) => `${name} removed from favorites`,
  toastCopy: "Link copied to clipboard",
  toastExport: "Bracelet card saved to downloads",
  toastSave: (name) => `Design “${name}” saved`,
  themeLightName: "Daylight Atlas",
  themeDarkName: "Midnight Atlas",
  themeToLight: "Switch to the Daylight Atlas",
  themeToDark: "Switch to the Midnight Atlas",
  shortcutsHelp: "Keyboard shortcuts",
  shortcutsTitle: "Keyboard Shortcuts",
  shortcutsRotate: "Rotate the orbit",
  shortcutsNav: "Previous / next crystal",
  shortcutsClose: "Close panels",
  shortcutsSearch: "Focus search",
  codexOpen: "Open the Crystal Codex",
  codexKicker: "Field Guide",
  codexTitle: "Crystal Codex",
  codexClose: "Close the Crystal Codex",
  codexTabArchive: "Archive",
  codexTabChakras: "Chakras",
  codexTabBirthstones: "Birthstones",
  codexSearchPlaceholder: "Search the codex…",
  codexSearchAria: "Search the crystal codex",
  codexSortName: "A–Z",
  codexSortHardness: "Hardness",
  codexSortAria: "Sort the archive",
  codexIntro:
    "Every editorial note, mineral datum, and pairing relationship in the library, gathered into one reference volume.",
  codexStats: (s, c, m) => `${s} stones · ${c} chakras · ${m} months`,
  codexArchiveHint: "The complete reference volume",
  codexChakraHint: "Stones grouped along the spine, root to crown",
  codexBirthHint: "Twelve months of the crystal year",
  codexViewInAtlas: "View in Atlas",
  codexCompanions: "Companions",
  codexNoMonth: "No birthstone",
  codexUndated: "Undated stones",
  codexEmpty: "No entries match your search",
  codexVisitAria: (name) => `Open ${name} in the atlas`,
  codexTabCompare: "Compare",
  codexCompareHint: "All seventeen stones ranked on one Mohs scale",
  codexCompareHintChakra: "Bars glow in each stone's chakra color",
  codexCompareHintMonth: "Bars glow in each stone's birthstone color — undated stones stay neutral",
  codexCompareScale: "Mohs scale",
  codexCompareHardest: "Hardest",
  codexCompareSofter: "Softest",
  codexCompareRank: (n) => `Rank ${n}`,
  codexDimLabel: "Color rows by",
  codexDimColor: "Color",
  codexDimChakra: "Chakra",
  codexDimMonth: "Birthstone",
  pairsWeekTitle: "Week of Pairs",
  pairsWeekHint: "Seven days of featured duos from the pairing graph",
  pairsWeekAria: (a, b) => `Design with ${a} and ${b}`,
  codexTabAlmanac: "Almanac",
  codexAlmanacHint: "The month's featured pairings, laid out on one calendar",
  almanacPrev: "Previous month",
  almanacNext: "Next month",
  almanacToday: "Today",
  almanacBackToToday: "Back to today",
  almanacWeekdays: ["S", "M", "T", "W", "T", "F", "S"],
  almanacDayAria: (d, a, b) => `${d}: design the pairing of ${a} and ${b}`,
  almanacLegend: "Tap any day to open both crystals in the Bracelet Studio",
  bkExport: "Backup",
  bkExportAria: "Download all saved designs as a JSON backup",
  bkImport: "Import",
  bkImportAria: "Import designs from a JSON backup",
  bkImported: (n, skipped) =>
    `${n} design${n === 1 ? "" : "s"} imported${skipped > 0 ? `, ${skipped} skipped` : ""}`,
  bkInvalid: "That file doesn't look like a design backup",
  bkExported: "Backup downloaded",
  favSugTitle: "They pair well",
  favSugHint: "Editorial pairings among your favorites",
  favSugAria: (a, b) => `Design with ${a} and ${b}`,
  vaultSynced: "Vault synced",
  vaultSyncing: "Syncing vault…",
  vaultLocal: "Saved on this device",
  vaultStatusAria: "Favorites sync status",
};

const zh: UIStrings = {
  kicker: "交互式水晶星图 · 科普图鉴",
  title: "UNIQorn 水晶矿石图鉴",
  stones: "石",
  variants: "款",
  searchPlaceholder: "搜索水晶…",
  searchAria: "按名称、颜色或意象搜索水晶",
  all: "全部",
  clearSearch: "清空搜索",
  filterByColor: "按色系筛选",
  matchCount: (n, total) => `${n} / ${total}`,
  openFavorites: (n) => `打开收藏夹，已收藏 ${n} 颗`,
  orbitView: "轨道视图",
  gridView: "网格画廊视图",
  braceletStudio: "手链工作台",
  langToggle: "Switch to English",
  notesToggle: "星图笔记",
  openStone: (name, cat) => `打开 ${name}（${cat}）`,
  toggleFav: (name, add) => (add ? `收藏 ${name}` : `取消收藏 ${name}`),
  closeDetail: "关闭水晶详情",
  prevCrystal: "上一颗水晶",
  nextCrystal: "下一颗水晶",
  buildSizes: "制作尺寸",
  sourceSizes: "来源尺寸",
  grades: "等级",
  variantsLabel: (n) => `保留 ${n} 条尺寸与等级记录`,
  stoneProfile: "矿物档案",
  mohs: "莫氏硬度",
  chakra: "对应脉轮",
  birthstone: "诞生月",
  none: "—",
  symbolicStyling: "能量寓意",
  pairingIdeas: "搭配灵感",
  buildCta: (name) => `用 ${name} 试戴排列`,
  ctaHint: "在交互工坊中排布预览",
  customMadeCta: (name) => `✨ 挑选此石 · 开启个人高定`,
  customMadeHint: "带入当前晶石，前往 UNIQorn 手串定制工坊量身定制专属手围",
  customMadePairCta: (partner) => `💎 定制双晶手串（搭档 ${partner}）`,
  customMadeDirect: "个人手串定制工坊",
  customMadeTitle: "私人高定手串",
  backToSite: "返回 UNIQorn 官网",
  articlesLink: "水晶文章专栏",
  sizeScale: "珠径比例尺",
  notesTitle: "参考层",
  notesBody1:
    "UNIQorn 秉承自然静谧美学，以天然矿石晶系与个人心境感应来呈现水晶图鉴。每一颗原矿都是独一无二的大地记录，能量寓意作为灵性佩戴与风格搭配之参考。",
  notesBody2:
    "星图每种制作用水晶只保留一个规范节点，同时完整保存其全部来源 SKU、等级、毫米尺寸与图片路径。",
  howToRead: "如何阅读星图",
  howTo1: "用滚轮、触控板或拖拽旋转轨道",
  howTo2: "点击节点打开参考面板",
  howTo3: "使用箭头遍历整座图书馆",
  buildYourOwn: "定制手链",
  guidedDesign: "引导式手链设计",
  favoritesKicker: "已收藏",
  favoritesTitle: (n) => (n > 0 ? `我的清单 · ${n}` : "我的清单"),
  favoritesEmpty:
    "还没有收藏。点击任意节点或卡片上的爱心，把水晶留在这里，方便设计手链时取用。",
  browseAtlas: "回到星图",
  locate: "定位",
  remove: "移除",
  shareLink: "复制分享链接",
  copied: "已复制 ✓",
  noStonesFound: "没有找到水晶",
  noStonesHint: "换个关键词，或清除色系筛选来浏览整座图书馆。",
  viewDetails: (name) => `查看 ${name} 详情`,
  locateOnMap: (name) => `在星图上定位 ${name}`,
  removeFav: (name) => `从收藏中移除 ${name}`,
  mobileSummary: "水晶图书馆",
  studioTitle: "手链工作台",
  studioKicker: "定制手链",
  tray: "珠盘",
  beadSize: "珠径",
  addBead: (name) => `加入一颗 ${name}`,
  removeBead: "移除珠子",
  undo: "撤销上一颗",
  clearAll: "清空",
  emptyBracelet: "从珠盘挑选珠子，串起你的手链",
  wristSize: "手腕周长",
  autoFit: "自动补齐珠数",
  fitSnug: "贴手",
  fitClassic: "经典合围",
  fitRelaxed: "宽松",
  fitSnugAdvice: "紧贴手腕环绕——想宽松些可以加一两颗珠。",
  fitClassicAdvice: "适合大多数手腕的经典弹力长度。",
  fitRelaxedAdvice: "圈围较为宽松——想贴手可以减一两颗珠。",
  fitAria: (fit) => `手链贴合度：${fit}`,
  accentTitle: "点缀图案",
  accentHint: "让一颗石材沿手链规律重现",
  accentStone: "点缀石材",
  accentNone: "选择石材…",
  accentInterval: "重复间隔",
  accentApply: "应用图案",
  accentApplied: (n) => `已设为每 ${n} 颗一枚点缀`,
  accentAria: "点缀珠图案工具",
  presets: "灵感预设",
  presetNames: ["海平线", "黄金时刻", "紫暮", "玫瑰薄雾", "午夜烟霞"],
  rotate: "旋转",
  spin: "转动",
  statsBeads: "珠数",
  statsLength: "内圈长度",
  saveDesign: "保存设计",
  designName: "设计名称",
  savedDesigns: "已保存设计",
  load: "载入",
  share: "分享",
  closeStudio: "关闭手链工作台",
  studioHint: "点击手链上的珠子即可移除 · 拖动滑杆旋转",
  beadCount: (n) => `${n} 颗珠`,
  estLength: "内圈长度",
  dailyKicker: "今日水晶",
  dailyCta: "查看这颗水晶",
  dailyAria: (name) => `打开今日水晶：${name}`,
  dailyBadge: "今日水晶",
  pairHint: "点击相连的名字可跳转到对应节点",
  pairBuildAria: (partner) => `带上这颗水晶和${partner}，打开手链工作台`,
  weekTitle: "本周星图",
  weekHint: "过去 7 天的每日水晶",
  weekAria: (name) => `查看 ${name} 详情`,
  today: "今天",
  weekExpand: "展开时间线",
  weekCollapse: "收起时间线",
  pairDayKicker: "今日最佳搭档",
  pairDayCta: "设计这套搭档",
  pairDayAria: (a, b) => `带上${a}和${b}，打开手链工作台`,
  pairDayVisit: (name) => `查看 ${name} 详情`,
  shareStone: "复制这颗水晶的链接",
  exportPng: "导出图片",
  exported: "已保存 ✓",
  exportHint: "将当前设计保存为图片卡片",
  qrCaption: "扫码打开",
  toastFavAdd: (name) => `已收藏 ${name}`,
  toastFavRemove: (name) => `已取消收藏 ${name}`,
  toastCopy: "链接已复制到剪贴板",
  toastExport: "手链卡片已保存到下载",
  toastSave: (name) => `设计「${name}」已保存`,
  themeLightName: "晨光图鉴",
  themeDarkName: "星夜图鉴",
  themeToLight: "切换至晨光图鉴",
  themeToDark: "切换至星夜图鉴",
  shortcutsHelp: "键盘快捷键",
  shortcutsTitle: "键盘快捷键",
  shortcutsRotate: "旋转轨道",
  shortcutsNav: "上一颗 / 下一颗水晶",
  shortcutsClose: "关闭面板",
  shortcutsSearch: "聚焦搜索",
  codexOpen: "打开水晶百科",
  codexKicker: "图鉴手册",
  codexTitle: "水晶百科",
  codexClose: "关闭水晶百科",
  codexTabArchive: "档案",
  codexTabChakras: "脉轮",
  codexTabBirthstones: "诞生石",
  codexSearchPlaceholder: "搜索百科…",
  codexSearchAria: "搜索水晶百科",
  codexSortName: "名称",
  codexSortHardness: "硬度",
  codexSortAria: "档案排序方式",
  codexIntro: "图书馆里的全部编辑资料、矿物数据与搭配关系，汇成一册随身参考。",
  codexStats: (s, c, m) => `${s} 颗水晶 · ${c} 个脉轮 · ${m} 个月份`,
  codexArchiveHint: "完整的参考手册",
  codexChakraHint: "沿脊柱从海底轮到顶轮分组",
  codexBirthHint: "水晶之年的十二个月",
  codexViewInAtlas: "在星图中查看",
  codexCompanions: "搭档水晶",
  codexNoMonth: "无诞生月",
  codexUndated: "未对应月份的水晶",
  codexEmpty: "没有匹配的词条",
  codexVisitAria: (name) => `在星图中打开 ${name}`,
  codexTabCompare: "对比",
  codexCompareHint: "十七颗水晶同屏排列在同一把莫氏硬度尺上",
  codexCompareHintChakra: "条带以每颗水晶的脉轮色点亮",
  codexCompareHintMonth: "条带以诞生月色点亮 — 无诞生月的水晶保持中性色",
  codexCompareScale: "莫氏硬度尺",
  codexCompareHardest: "最硬",
  codexCompareSofter: "较软",
  codexCompareRank: (n) => `第 ${n} 位`,
  codexDimLabel: "条带着色维度",
  codexDimColor: "色彩",
  codexDimChakra: "脉轮",
  codexDimMonth: "诞生月",
  pairsWeekTitle: "本周搭档回顾",
  pairsWeekHint: "七天的编辑搭档，来自搭配图谱",
  pairsWeekAria: (a, b) => `带上${a}和${b}去设计手链`,
  codexTabAlmanac: "月历",
  codexAlmanacHint: "整月的每日搭档，铺在同一张月历上",
  almanacPrev: "上一个月",
  almanacNext: "下一个月",
  almanacToday: "今天",
  almanacBackToToday: "回到今天",
  almanacWeekdays: ["日", "一", "二", "三", "四", "五", "六"],
  almanacDayAria: (d, a, b) => `${d}：设计 ${a} 和 ${b} 的搭档`,
  almanacLegend: "点击任意日期，把两颗水晶一起带入手链工作台",
  bkExport: "备份",
  bkExportAria: "把全部已存设计下载为 JSON 备份",
  bkImport: "导入",
  bkImportAria: "从 JSON 备份导入设计",
  bkImported: (n, skipped) => `已导入 ${n} 条设计${skipped > 0 ? `，跳过 ${skipped} 条` : ""}`,
  bkInvalid: "这个文件看起来不是设计备份",
  bkExported: "备份已下载",
  favSugTitle: "它们很搭",
  favSugHint: "收藏中的编辑推荐搭档",
  favSugAria: (a, b) => `带上${a}和${b}去设计手链`,
  vaultSynced: "云端已同步",
  vaultSyncing: "云端同步中…",
  vaultLocal: "已保存在本机",
  vaultStatusAria: "收藏同步状态",
};

const DICT: Record<Lang, UIStrings> = { en, zh };

export function t(lang: Lang): UIStrings {
  return DICT[lang];
}

export function stoneName(lang: Lang, displayName: string): string {
  if (lang === "en") return displayName;
  return STONE_ZH[displayNameToSlug(displayName)]?.name ?? displayName;
}

import { STONES } from "./stones-data";

const byDisplayName = new Map(STONES.map((s) => [s.displayName, s.slug]));
function displayNameToSlug(displayName: string): string {
  return byDisplayName.get(displayName) ?? displayName;
}

export function stoneZh(slug: string): StoneZh | undefined {
  return STONE_ZH[slug];
}

/** Chakra stacking order along the spine (root → crown) */
export const CHAKRA_ORDER = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
] as const;

export type ChakraKey = (typeof CHAKRA_ORDER)[number];

/** Editorial color + EN label per chakra (original choices) */
export const CHAKRA_META: Record<ChakraKey, { color: string }> = {
  Root: { color: "#b3413a" },
  Sacral: { color: "#c96f2f" },
  "Solar Plexus": { color: "#c99a2e" },
  Heart: { color: "#5d8a5e" },
  Throat: { color: "#4a7f96" },
  "Third Eye": { color: "#5b5a9e" },
  Crown: { color: "#9a6fb8" },
};

/** Editorial color wheel per birthstone month (original choices) */
export const MONTH_META: Record<
  (typeof MONTH_ORDER)[number],
  { color: string }
> = {
  January: { color: "#b3413a" },
  February: { color: "#7d5a9e" },
  March: { color: "#5fa8b8" },
  April: { color: "#c9c4bb" },
  May: { color: "#5d8a5e" },
  June: { color: "#9aa7b8" },
  July: { color: "#c0392b" },
  August: { color: "#8aa64f" },
  September: { color: "#3f6fa8" },
  October: { color: "#c77ba8" },
  November: { color: "#c99a2e" },
  December: { color: "#4a8a96" },
};

export const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const CHAKRA_ZH: Record<string, string> = {
  Throat: "喉轮",
  Heart: "心轮",
  "Third Eye": "眉心轮",
  Crown: "顶轮",
  "Solar Plexus": "太阳轮",
  Root: "海底轮",
  Sacral: "脐轮",
};

export const MONTH_ZH: Record<string, string> = {
  January: "一月",
  February: "二月",
  March: "三月",
  April: "四月",
  May: "五月",
  June: "六月",
  July: "七月",
  August: "八月",
  September: "九月",
  October: "十月",
  November: "十一月",
  December: "十二月",
};
