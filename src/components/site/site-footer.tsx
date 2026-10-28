import { BrandMark } from "@/components/crystal/brand-mark";

/**
 * Footer shared by the inner pages (/crystals/*, /contact).
 * Same structure as the atlas footer on the home page, so every
 * page in the site closes the same way.
 */
export function SiteFooter() {
  return (
    <footer className="atlas-footer mt-auto">
      <div className="atlas-footer__inner flex flex-col items-center justify-between gap-3 px-5 py-4 text-[0.6rem] tracking-[0.22em] uppercase sm:flex-row sm:px-8">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-5 w-5 atlas-footer__brand" />
          <span>UNIQorn Soul Wellness · Crystal Atlas</span>
        </div>
        <nav
          aria-label="Footer navigation"
          className="atlas-footer__nav flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5"
        >
          <a href="/crystals/wiki/">水晶矿石图鉴</a>
          <a href="/crystals/custom/">个人手串定制</a>
          <a href="/crystals/articles/">矿物文章专栏</a>
          <a href="/crystals/shop/">现成作品选购</a>
          <a href="/contact/">联系与咨询</a>
        </nav>
        <span>Kuala Lumpur · Malaysia</span>
      </div>
    </footer>
  );
}
