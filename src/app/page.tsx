import type { Metadata } from "next";
import { AnnouncementTicker } from "@/components/crystal/ticker";
import { SiteHeader } from "@/components/crystal/site-header";
import { CrystalAtlas } from "@/components/crystal/crystal-atlas";
import { BrandMark } from "@/components/crystal/brand-mark";
import { STONES } from "@/lib/stones-data";
import { EmbedProvider, EmbedHidden } from "@/components/crystal/embed-provider";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Dynamic metadata: ?stone=slug deep links get a per-crystal title,
 * description, and OG image so shared links preview the actual stone.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const slug = typeof params.stone === "string" ? params.stone : undefined;
  const stone = slug ? STONES.find((s) => s.slug === slug) : undefined;

  if (!stone) return {};

  const title = `${stone.displayName} · UNIQorn 水晶矿石图鉴`;
  return {
    title,
    description: stone.intro,
    openGraph: {
      title,
      description: stone.intro,
      type: "website",
      images: [{ url: stone.imagePath, alt: stone.displayName }],
    },
    twitter: {
      card: "summary",
      title,
      description: stone.intro,
      images: [stone.imagePath],
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const initialEmbed = params?.embed === "1" || params?.embed === "true";

  return (
    <EmbedProvider initialEmbed={initialEmbed}>
      <div className="atlas-shell">
        <EmbedHidden>
          <AnnouncementTicker />
          <SiteHeader />
        </EmbedHidden>

        <CrystalAtlas />

        <EmbedHidden>
          <footer className="atlas-footer mt-auto">
            <div className="atlas-footer__inner flex flex-col items-center justify-between gap-3 px-5 py-4 text-[0.6rem] tracking-[0.22em] uppercase sm:flex-row sm:px-8">
              <div className="flex items-center gap-2.5">
                <BrandMark className="h-5 w-5 atlas-footer__brand" />
                <span>UNIQorn Soul Wellness · Crystal Atlas</span>
              </div>
              <nav aria-label="Footer navigation" className="atlas-footer__nav flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                <a href="/crystals/discover/" target="_top">水晶星图图鉴</a>
                <a href="/crystals/custom/" target="_top">个人手串定制</a>
                <a href="/crystals/articles/" target="_top">矿物文章专栏</a>
                <a href="/crystals/shop/" target="_top">现成作品选购</a>
                <a href="/contact/" target="_top">联系与咨询</a>
              </nav>
              <span>Kuala Lumpur · Malaysia</span>
            </div>
          </footer>
        </EmbedHidden>
      </div>
    </EmbedProvider>
  );
}
