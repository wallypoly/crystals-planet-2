import {
  Info,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * The four spaces that sit next to the atlas. Single source of
 * truth for the header cluster, the right rail and the mobile
 * trigger label, so the three can never drift apart.
 */
export type SpaceEntry = {
  key: string;
  name: string;
  en: string;
  href: string;
  icon: LucideIcon;
  /** Drawer wording, where there is room for the long form. */
  drawer: string;
};

export const SPACE_ENTRIES: SpaceEntry[] = [
  {
    key: "custom",
    name: "手串定制",
    en: "Custom Made",
    href: "/crystals/custom/",
    icon: Sparkles,
    drawer: "✨ 个人手串定制工坊 (Custom Made)",
  },
  {
    key: "articles",
    name: "文章专栏",
    en: "Articles",
    href: "/crystals/articles/",
    icon: Info,
    drawer: "矿物文章与养护法则 (Articles)",
  },
  {
    key: "shop",
    name: "现成选购",
    en: "Shop",
    href: "/crystals/shop/",
    icon: ShoppingBag,
    drawer: "现成品作品挑选 (Shop)",
  },
  {
    key: "contact",
    name: "联系咨询",
    en: "Contact",
    href: "/contact/",
    icon: MessageCircle,
    drawer: "联系方式 · 专属咨询",
  },
];
