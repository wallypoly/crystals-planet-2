import type { Metadata } from "next";
import { SiteHeader } from "@/components/crystal/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionPlaceholder } from "@/components/site/section-placeholder";
import "../../inner.css";

export const metadata: Metadata = {
  title: "矿物文章与养护法则 · UNIQorn",
  description: "UNIQorn 矿物文章专栏：正在准备中。",
};

export default function ArticlesPage() {
  return (
    <div className="atlas-shell">
      <SiteHeader />
      <SectionPlaceholder
        kicker="Articles · 矿物文章专栏"
        title="矿物文章与养护法则"
        lede="这里会写天然原矿的矿物学常识、日常养护，以及我们观察到的能量搭配笔记。写完、核对过资料，才会放上来。"
        status="这个专栏还在准备中，现在还没有可以发布的文章。等第一批真的写完了，再正式开放。"
        actions={[
          { label: "回到水晶矿石图鉴", href: "/crystals/wiki/" },
          { label: "先去定制工坊", href: "/crystals/custom/" },
        ]}
      />
      <SiteFooter />
    </div>
  );
}
