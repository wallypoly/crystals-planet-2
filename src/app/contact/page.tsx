import type { Metadata } from "next";
import { SiteHeader } from "@/components/crystal/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionPlaceholder } from "@/components/site/section-placeholder";
import "../inner.css";

export const metadata: Metadata = {
  title: "联系与咨询 · UNIQorn",
  description: "UNIQorn 联系与咨询：正在整理中。",
};

export default function ContactPage() {
  return (
    <div className="atlas-shell">
      <SiteHeader />
      <SectionPlaceholder
        kicker="Contact · 联系与咨询"
        title="联系与咨询"
        lede="咨询方式、回应时间，以及常被问到的几个问题，都会在确认之后整理到这里。"
        status="这个页面正在整理中，现在还没有对外的联络入口。急事请先走我们常用的私人渠道。"
        actions={[
          { label: "回到水晶矿石图鉴", href: "/crystals/wiki/" },
          { label: "去定制工坊", href: "/crystals/custom/" },
        ]}
      />
      <SiteFooter />
    </div>
  );
}
