"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpRight,
  Heart,
  Link2,
  Check,
  Gem,
} from "lucide-react";
import { STONES, formatMmList, type Stone } from "@/lib/stones-data";
import { t, stoneZh, CHAKRA_ZH, MONTH_ZH, type Lang } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="atlas-spec-cell">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * Split a pairing note into [partner slug | rest] when the note starts with a
 * known stone name (EN displayName or 中文 name). Returns null when the note
 * does not reference a specific stone (e.g. "Nearly every MoonArq palette").
 */
function matchPartner(
  note: string,
  lang: Lang,
  selfSlug: string,
): { slug: string; name: string; rest: string } | null {
  const names = STONES.map((s) => ({
    slug: s.slug,
    en: s.displayName,
    zh: stoneZh(s.slug)?.name ?? "",
  })).sort((a, b) => b.en.length - a.en.length);
  for (const n of names) {
    if (n.slug === selfSlug) continue;
    if (lang === "en" && n.en && note.startsWith(n.en)) {
      return { slug: n.slug, name: n.en, rest: note.slice(n.en.length) };
    }
    if (lang === "zh" && n.zh && note.startsWith(n.zh)) {
      return { slug: n.slug, name: n.zh, rest: note.slice(n.zh.length) };
    }
  }
  return null;
}

export function AtlasDetail({
  stone,
  onClose,
  onPrev,
  onNext,
  isFavorite,
  onToggleFavorite,
  lang,
  onBuild,
  onPairBuild,
  onSelectStone,
}: {
  stone: Stone;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  lang: Lang;
  onBuild: (slug: string) => void;
  /** Open the Bracelet Studio seeded with this stone + its partner */
  onPairBuild: (partnerSlug: string) => void;
  onSelectStone: (slug: string) => void;
}) {
  const dict = t(lang);
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  const zh = stoneZh(stone.slug);
  const index = STONES.findIndex((s) => s.slug === stone.slug);
  const familyLabel = lang === "zh" && zh ? zh.family : stone.colorFamily;
  const materialLabel =
    lang === "zh" && zh ? zh.material : stone.materialType;
  const category = `${familyLabel} ${materialLabel}`;
  const label = lang === "zh" && zh ? zh.name : stone.displayName;
  const intro = lang === "zh" && zh ? zh.intro : stone.intro;
  const keywords = lang === "zh" && zh ? zh.keywords : stone.keywords;
  const properties = lang === "zh" && zh ? zh.properties : stone.properties;
  const pairingNotes = lang === "zh" && zh ? zh.pairing : stone.pairingNotes;
  const chakraLabel =
    lang === "zh" ? (CHAKRA_ZH[stone.chakra] ?? stone.chakra) : stone.chakra;
  const birthLabel =
    lang === "zh" && stone.birthstone
      ? (MONTH_ZH[stone.birthstone] ?? stone.birthstone)
      : (stone.birthstone ?? "—");

  const variantLabel =
    lang === "zh"
      ? dict.variantsLabel(stone.variantCount)
      : `${stone.variantCount} builder size and grade records preserved`;

  const parsedPairings = useMemo(
    () =>
      pairingNotes.map((note) => ({
        note,
        partner: matchPartner(note, lang, stone.slug),
      })),
    [pairingNotes, lang, stone.slug],
  );

  const shareStoneLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?stone=${stone.slug}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      /* clipboard unavailable */
    }
    if (ok) toast({ title: dict.toastCopy, className: "atlas-toast" });
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1600);
  };

  return (
    <div
      className="crystal-atlas-detail"
      role="dialog"
      aria-label={`${stone.displayName} details`}
    >
      {/* Top controls */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="atlas-round-btn"
            aria-label={dict.prevCrystal}
            onClick={onPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="atlas-round-btn"
            aria-label={dict.nextCrystal}
            onClick={onNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 text-[0.62rem] tracking-[0.28em] text-[rgba(239,233,221,0.5)] uppercase">
            {String(index + 1).padStart(2, "0")} / {STONES.length}
          </span>
        </div>
        <button
          type="button"
          className={`atlas-round-btn ${linkCopied ? "is-active" : ""}`}
          aria-label={dict.shareStone}
          title={dict.shareStone}
          onClick={shareStoneLink}
        >
          {linkCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          className={`atlas-round-btn atlas-fav-btn ${isFavorite ? "is-active" : ""}`}
          aria-label={dict.toggleFav(stone.displayName, !isFavorite)}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(stone.slug)}
        >
          <Heart
            className="h-4 w-4"
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
        <button
          type="button"
          className="atlas-round-btn"
          aria-label={dict.closeDetail}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="atlas-panel__scroll px-5 pb-6">
        {/* Hero image */}
        <div className="atlas-detail-hero mt-3">
          <img
            src={stone.imagePath}
            alt={`${stone.displayName} bead used in Build Your Own bracelets`}
            width={720}
            height={720}
          />
          <span className="absolute bottom-3 right-3 z-10 rounded-full border border-[rgba(246,238,226,0.25)] bg-black/45 px-2.5 py-1 text-[0.52rem] tracking-[0.22em] text-[rgba(246,238,226,0.75)] uppercase">
            {stone.representativeSku ?? stone.slug}
          </span>
        </div>

        {/* Title block */}
        <p className="atlas-detail-kicker mt-5">{category}</p>
        <h2 className="atlas-detail-title mt-1">{label}</h2>
        {lang === "zh" && (
          <p className="atlas-detail-sub-en">{stone.displayName}</p>
        )}
        <p className="atlas-detail-intro mt-3">{intro}</p>

        {/* Keywords */}
        <div className="mt-4 flex flex-wrap gap-2">
          {keywords.map((k) => (
            <span key={k} className="atlas-keyword-chip">
              {k}
            </span>
          ))}
        </div>

        {/* Specs */}
        <dl className="atlas-spec-grid mt-6">
          <SpecCell label={dict.buildSizes} value={`${formatMmList(stone.availableMm)} mm`} />
          <SpecCell
            label={dict.sourceSizes}
            value={`${formatMmList(stone.sourceSizesMm)} mm`}
          />
          <SpecCell label={dict.grades} value={stone.grades.join(", ")} />
          <SpecCell label={lang === "zh" ? "变体" : "Variants"} value={variantLabel} />
        </dl>

        {/* Size scale strip */}
        <section
          aria-label={dict.sizeScale}
          className="atlas-size-scale mt-6"
        >
          <h3 className="atlas-section-label">{dict.sizeScale}</h3>
          <div className="atlas-size-scale__row">
            {stone.availableMm.map((mm) => (
              <div key={mm} className="atlas-size-scale__item">
                <span
                  className="atlas-size-scale__dot"
                  style={{
                    width: `${(mm / 14) * 44 + 6}px`,
                    height: `${(mm / 14) * 44 + 6}px`,
                    background: `radial-gradient(circle at 35% 30%, ${stone.palette[0]}, ${stone.palette[1]} 58%, ${stone.palette[2]})`,
                  }}
                  aria-hidden="true"
                />
                <span className="atlas-size-scale__mm">{mm}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stone profile */}
        <section
          aria-label={`${stone.displayName} mineral profile`}
          className="mt-7"
        >
          <h3 className="atlas-section-label">{dict.stoneProfile}</h3>
          <dl className="atlas-spec-grid atlas-spec-grid--3">
            <SpecCell label={dict.mohs} value={stone.hardness} />
            <SpecCell label={dict.chakra} value={chakraLabel} />
            <SpecCell label={dict.birthstone} value={birthLabel} />
          </dl>
        </section>

        {/* Symbolic styling */}
        <section
          aria-label={`${stone.displayName} symbolic styling notes`}
          className="mt-7"
        >
          <h3 className="atlas-section-label">{dict.symbolicStyling}</h3>
          <div>
            {properties.map((p) => (
              <p key={p} className="atlas-note-row">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* Pairing ideas — partner names jump to their atlas node */}
        <section
          aria-label={`${stone.displayName} pairing ideas`}
          className="mt-6"
        >
          <h3 className="atlas-section-label">{dict.pairingIdeas}</h3>
          <div className="atlas-pair-list">
            {parsedPairings.map(({ note, partner }) =>
              partner ? (
                <p key={note} className="atlas-note-row atlas-note-row--pair">
                  <button
                    type="button"
                    className="atlas-pair-link"
                    onClick={() => onSelectStone(partner.slug)}
                    aria-label={
                      lang === "zh"
                        ? `跳转到 ${partner.name}`
                        : `Jump to ${partner.name}`
                    }
                  >
                    <span
                      className="atlas-pair-link__dot"
                      style={{
                        background: STONES.find((s) => s.slug === partner.slug)
                          ?.palette[1],
                      }}
                      aria-hidden="true"
                    />
                    {partner.name}
                  </button>
                  {partner.rest}
                  <button
                    type="button"
                    className="atlas-pair-build"
                    aria-label={dict.pairBuildAria(partner.name)}
                    title={dict.pairBuildAria(partner.name)}
                    onClick={() => onPairBuild(partner.slug)}
                  >
                    <Gem className="h-3 w-3" aria-hidden="true" />
                    <span aria-hidden="true">2</span>
                  </button>
                </p>
              ) : (
                <p key={note} className="atlas-note-row">
                  {note}
                </p>
              ),
            )}
          </div>
          <p className="atlas-pair-hint">{dict.pairHint}</p>
        </section>

        {/* CTA */}
        <div className="mt-7">
          <a
            href={stone.ctaHref}
            className="atlas-cta"
            onClick={(e) => {
              e.preventDefault();
              onBuild(stone.slug);
            }}
          >
            <span>{dict.buildCta(label)}</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <p className="mt-2 text-[0.62rem] tracking-[0.16em] text-[rgba(239,233,221,0.45)] uppercase">
            {dict.ctaHint}
          </p>
        </div>
      </div>
    </div>
  );
}
