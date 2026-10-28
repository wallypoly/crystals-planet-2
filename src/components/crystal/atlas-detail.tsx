"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpRight,
  Heart,
  Link2,
  Check,
  Gem,
  Sparkles,
} from "lucide-react";
import { STONES, formatMmList, type Stone } from "@/lib/stones-data";
import { t, stoneZh, CHAKRA_ZH, MONTH_ZH, type Lang } from "@/lib/i18n";
import {
  publicClaims,
  stoneKnowledge,
  INTENTION_ZH,
  ELEMENT_ZH,
  ZODIAC_ZH,
} from "@/lib/stone-knowledge";
import { stoneStyle, COLOR_TONE_ZH } from "@/lib/stone-style";
import { SHOW_DRAFT_KNOWLEDGE } from "@/lib/atlas-flags";
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
 * does not reference a specific stone (e.g. "Nearly every palette").
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Switching stones must start the panel at the top, otherwise the browser
  // keeps the previous stone's scroll offset and the reader lands mid-panel
  // (e.g. on the bead size ruler) instead of the stone name and hero image.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
  }, [stone.slug]);

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

  // Knowledge layer: only claims the owner has cleared (or draft preview).
  const claims = useMemo(
    () => publicClaims(stone.slug, { includeDraft: SHOW_DRAFT_KNOWLEDGE }),
    [stone.slug],
  );
  const meaningZh = lang === "zh" ? claims.meaning?.value : undefined;
  const intentions =
    meaningZh && claims.meaning
      ? (stoneKnowledge(stone.slug)?.intentions ?? [])
      : [];
  const chakraClaim = claims.chakras;
  const mainChakra =
    lang === "zh" && chakraClaim
      ? chakraClaim.value.map((c) => CHAKRA_ZH[c] ?? c).join("、")
      : chakraLabel;
  const chakraNote =
    lang === "zh" && chakraClaim ? chakraClaim.note : undefined;
  const style = lang === "zh" ? stoneStyle(stone.slug) : undefined;

  const correspondences: { key: string; label: string; value: string; note?: string }[] =
    [];
  if (lang === "zh") {
    if (claims.element) {
      correspondences.push({
        key: "element",
        label: "元素",
        value: ELEMENT_ZH[claims.element.value],
        note: claims.element.note,
      });
    }
    if (claims.zodiac) {
      correspondences.push({
        key: "zodiac",
        label: "星座",
        value: claims.zodiac.value.map((z) => ZODIAC_ZH[z]).join("、"),
        note: claims.zodiac.note,
      });
    }
    if (claims.numbers) {
      correspondences.push({
        key: "numbers",
        label: "数字",
        value: claims.numbers.value.join("、"),
        note: claims.numbers.note,
      });
    }
  }

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
          <span className="ml-2 text-[0.62rem] tracking-[0.28em] text-[rgba(30,58,95,0.42)] uppercase">
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

      <div ref={scrollRef} className="atlas-panel__scroll px-5 pb-6">
        {/* Hero image */}
        <div className="atlas-detail-hero mt-3">
          <img
            src={stone.imagePath}
            alt={`${stone.displayName} bead used in Build Your Own bracelets`}
            width={720}
            height={720}
          />
          <span className="absolute bottom-3 right-3 z-10 rounded-full border border-[rgba(30,58,95,0.12)] bg-white/85 backdrop-blur-sm px-2.5 py-1 text-[0.52rem] tracking-[0.22em] text-[rgba(30,58,95,0.65)] uppercase">
            {stone.representativeSku ?? stone.slug}
          </span>
        </div>

        {/* Title block */}
        <p className="atlas-detail-kicker mt-5">{category}</p>
        <h2 className="atlas-detail-title mt-1">{label}</h2>
        {lang === "zh" && (
          <p className="atlas-detail-sub-en">{stone.displayName}</p>
        )}
        <p className="atlas-detail-intro mt-3">{meaningZh ?? intro}</p>

        {/* Keywords — look words; replaced by intentions when those exist so
            the panel never stacks two chip rows */}
        {intentions.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span key={k} className="atlas-keyword-chip">
                {k}
              </span>
            ))}
          </div>
        )}

        {/* Intention chips (zh, only with a public meaning claim) */}
        {intentions.length > 0 && (
          <ul
            className="atlas-intent-list mt-3"
            aria-label="日常意图"
          >
            {intentions.map((i) => (
              <li key={i} className="atlas-intent-tag">
                {INTENTION_ZH[i]}
              </li>
            ))}
          </ul>
        )}

        {/* Main chakra */}
        <div className="atlas-chakra-line mt-5">
          <span className="atlas-chakra-line__label">{dict.chakra}</span>
          <span className="atlas-chakra-line__value">{mainChakra}</span>
          {chakraNote && (
            <span className="atlas-claim-note">{chakraNote}</span>
          )}
        </div>

        {/* How to wear (zh only) */}
        {style && (
          <section aria-label="穿戴建议" className="atlas-wear mt-6">
            <h3 className="atlas-section-label">穿戴建议</h3>
            <p className="atlas-wear__tone">
              <span className="atlas-wear__tone-label">色调</span>
              {COLOR_TONE_ZH[style.tone]}
            </p>
            <p className="atlas-note-row">{style.wearZh}</p>
            <p className="atlas-note-row">{style.styleZh}</p>
          </section>
        )}

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

        {/* Correspondences */}
        {correspondences.length > 0 && (
          <section aria-label="对应关系" className="mt-7">
            <h3 className="atlas-section-label">对应关系</h3>
            <dl className="atlas-corr-list">
              {correspondences.map((c) => (
                <div key={c.key} className="atlas-corr-row">
                  <dt>{c.label}</dt>
                  <dd>
                    {c.value}
                    {c.note && (
                      <span className="atlas-claim-note">{c.note}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Specs & care — collapsed by default */}
        <details className="atlas-more mt-7">
          <summary className="atlas-more__summary">
            {lang === "zh" ? "规格与养护" : "Specs & care"}
          </summary>
          <div className="atlas-more__body">
            {meaningZh && <p className="atlas-detail-intro">{intro}</p>}

        {/* Specs */}
        <dl className="atlas-spec-grid mt-4">
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

          </div>
        </details>

        {/* CTA — Dual-Tier Custom Made Funnel */}
        <div className="mt-7 flex flex-col gap-2.5">
          {/* Primary CTA: Custom Made */}
          <a
            href={`/crystals/custom/?stone=${stone.slug}`}
            className="atlas-cta atlas-cta--custom group flex items-center justify-between px-5 py-3.5 rounded-xl font-medium tracking-[0.08em] transition-all bg-[#14243b] text-white hover:bg-[#1e3a5f] shadow-[0_4px_16px_rgba(20,36,59,0.14)] hover:scale-[1.01]"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--rose)]" />
              <span>{dict.customMadeCta(label)}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-[var(--rose)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Secondary CTA: Bracelet Studio Tryout */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[rgba(30,58,95,0.12)] bg-[rgba(30,58,95,0.04)] text-[0.74rem] tracking-[0.14em] uppercase text-[#1e3a5f] hover:bg-[rgba(120,154,203,0.15)] hover:border-[rgba(30,58,95,0.2)] transition-all"
            onClick={() => onBuild(stone.slug)}
          >
            <Gem className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span>{dict.buildCta(label)}</span>
          </button>

          <p className="mt-1 text-center text-[0.62rem] leading-relaxed tracking-[0.1em] text-[rgba(30,58,95,0.42)]">
            {dict.customMadeHint}
          </p>
        </div>
      </div>
    </div>
  );
}
