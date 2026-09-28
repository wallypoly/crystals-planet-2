import type { Metadata } from "next";
import { AnnouncementTicker } from "@/components/crystal/ticker";
import { SiteHeader } from "@/components/crystal/site-header";
import { CrystalAtlas } from "@/components/crystal/crystal-atlas";
import { BrandMark } from "@/components/crystal/brand-mark";
import { STONES } from "@/lib/stones-data";

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

  const title = `${stone.displayName} · Crystal Library`;
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

export default function Home() {
  return (
    <div className="atlas-shell">
      <AnnouncementTicker />
      <SiteHeader />
      <CrystalAtlas />
      <footer className="atlas-footer mt-auto">
        <div className="atlas-footer__inner flex flex-col items-center justify-between gap-3 px-5 py-4 text-[0.6rem] tracking-[0.22em] uppercase sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-5 w-5 atlas-footer__brand" />
            <span>MoonArq Studio · Crystal Atlas</span>
          </div>
          <nav aria-label="Footer navigation" className="atlas-footer__nav flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            <a href="#">Crystal Library</a>
            <a href="#">Build Your Own</a>
            <a href="#">Size Guide</a>
            <a href="#">Contact</a>
          </nav>
          <span>Irvine, California</span>
        </div>
      </footer>
    </div>
  );
}
