import type { Metadata } from "next";
import { SiteHeader } from "@/components/crystal/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionPlaceholder } from "@/components/site/section-placeholder";
import "../../inner.css";

export const metadata: Metadata = {
  title: "现成作品选购 · UNIQorn",
  description: "UNIQorn 现成作品选购：正在准备中。",
};

export default function ShopPage() {
  return (
    <div className="atlas-shell">
      <SiteHeader />
      <SectionPlaceholder
        kicker="Shop · 现成作品选购"
        title="现成作品选购"
        lede="每一件上架的作品都会实拍，并标明珠径、材质与尺寸偏差。条件没达到的，我们宁可不放。"
        status="选购区还在准备中，暂时不提供下单。如果你已经知道自己想要什么，定制工坊现在就能用。"
        actions={[
          { label: "回到水晶矿石图鉴", href: "/crystals/wiki/" },
          { label: "去定制工坊", href: "/crystals/custom/" },
        ]}
      />
      <SiteFooter />
    </div>
  );
}
