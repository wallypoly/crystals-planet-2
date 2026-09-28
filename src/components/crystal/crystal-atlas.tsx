"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { STONES, TOTAL_STONES, TOTAL_VARIANTS } from "@/lib/stones-data";
import { t, STONE_ZH, LANG_KEY, type Lang } from "@/lib/i18n";
import { decodeDesign, buildPreset, PRESETS, type Bead } from "@/lib/bracelet";
import { dailyStone } from "@/lib/daily";
import { useToast } from "@/hooks/use-toast";
import { AtlasMap } from "./atlas-map";
import { AtlasDetail } from "./atlas-detail";
import { AtlasNotes } from "./atlas-notes";
import { AtlasDock, type ViewMode, type ThemeMode } from "./atlas-dock";
import { AtlasGrid } from "./atlas-grid";
import { FavoritesDrawer } from "./favorites-drawer";
import { BraceletStudio, type StudioSeed } from "./bracelet-studio";
import { CodexOverlay } from "./codex-overlay";

const FAV_KEY = "atlas-favorites";
const THEME_KEY = "atlas-theme";

function parseSharedFavorites(): string[] | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("favs");
  if (!raw) return null;
  const valid = new Set(STONES.map((s) => s.slug));
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => valid.has(s));
  history.replaceState(null, "", window.location.pathname);
  return slugs;
}

/** Read ?stone=slug from the URL (shareable deep link to one crystal) */
function parseStoneParam(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("stone");
  return raw && STONES.some((s) => s.slug === raw) ? raw : null;
}

/** Map a stone's color family to the closest guided preset key */
const FAMILY_PRESET: Record<string, string> = {
  Blue: "sea-horizon",
  Green: "sea-horizon",
  Clear: "sea-horizon",
  Gold: "golden-hour",
  Amber: "golden-hour",
  Purple: "violet-dusk",
  Blush: "violet-dusk",
  Rose: "rose-mist",
  Dark: "midnight-smoke",
  Smoke: "midnight-smoke",
};

export function CrystalAtlas() {
  const { toast } = useToast();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [codexOpen, setCodexOpen] = useState(false);
  const [studioSeed, setStudioSeed] = useState<StudioSeed | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filter / view state
  const [query, setQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("orbit");

  // Favorites (localStorage cached, reconciled with the server vault)
  const [favorites, setFavorites] = useState<string[]>([]);
  const favLoadedRef = useRef(false);
  const favsRef = useRef<string[]>([]);
  const vaultReadyRef = useRef(false);
  const hydratedRef = useRef(false);
  const [vaultState, setVaultState] = useState<
    "local" | "syncing" | "synced"
  >("local");
  /** Baseline of the last toast-diffed favorite set (null until hydration) */
  const prevFavsRef = useRef<string[] | null>(null);

  /** Mirror of the latest favorites for fire-and-forget server ops */
  useEffect(() => {
    favsRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;
    // Defer the read to a microtask so we never call setState synchronously
    // inside the effect body, and never clobber saved data with the initial [].
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const savedLang = window.localStorage.getItem(LANG_KEY);
        if (savedLang === "zh" || savedLang === "en") setLang(savedLang);

        const savedTheme = window.localStorage.getItem(THEME_KEY);
        if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

        // Deep link: ?stone=slug opens that crystal's detail panel.
        const stoneParam = parseStoneParam();
        if (stoneParam) setSelectedSlug(stoneParam);

        // Deep link: ?codex=1 opens the Crystal Codex overlay.
        const params = new URLSearchParams(window.location.search);
        if (params.get("codex")) {
          setCodexOpen(true);
          params.delete("codex");
          const qs = params.toString();
          history.replaceState(
            null,
            "",
            qs ? `?${qs}` : window.location.pathname,
          );
        }

        const shared = parseSharedFavorites();
        const raw = window.localStorage.getItem(FAV_KEY);
        const stored = raw ? (JSON.parse(raw) as string[]) : null;
        // A shared ?favs= link wins on first visit, so the recipient sees the
        // shared shortlist; afterwards normal localStorage behavior resumes.
        if (shared !== null) {
          setFavorites(shared);
        } else if (stored) {
          setFavorites(stored);
        }

        // Cloud vault reconciliation: merge localStorage with the server
        // vault so favorites survive across browsers and devices.
        void (async () => {
          const valid = new Set(STONES.map((s) => s.slug));
          try {
            setVaultState("syncing");
            const res = await fetch("/api/favorites");
            if (!res.ok) throw new Error(String(res.status));
            const data = (await res.json()) as { slugs?: unknown };
            const serverSlugs = Array.isArray(data.slugs)
              ? data.slugs.filter(
                  (s): s is string => typeof s === "string" && valid.has(s),
                )
              : [];
            vaultReadyRef.current = true;
            // Union: server order first (durable order), then local-only picks.
            const merged = [...serverSlugs];
            for (const s of favsRef.current) {
              if (valid.has(s) && !merged.includes(s)) merged.push(s);
            }
            const changedLocal = merged.join(",") !== favsRef.current.join(",");
            const changedServer =
              merged.join(",") !== serverSlugs.join(",");
            prevFavsRef.current = merged;
            hydratedRef.current = true;
            if (changedLocal) setFavorites(merged);
            if (changedServer) {
              await fetch("/api/favorites", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slugs: merged }),
              });
            }
            setVaultState("synced");
          } catch {
            vaultReadyRef.current = true;
            prevFavsRef.current = [...favsRef.current];
            hydratedRef.current = true;
            setVaultState("local");
          }
        })();

        // Shared bracelet link (#bd=...) opens the studio pre-loaded.
        const hash = window.location.hash;
        if (hash.startsWith("#bd=")) {
          const design = decodeDesign(hash);
          if (design && design.beads.length > 0) {
            setStudioSeed({
              beads: design.beads,
              name: design.name || undefined,
              ts: Date.now(),
            });
            setStudioOpen(true);
          }
          history.replaceState(null, "", window.location.pathname);
        }
      } catch {
        /* ignore */
      }
      favLoadedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!favLoadedRef.current) return;
    try {
      window.localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  /** Localized display name for a slug */
  const nameOf = useCallback(
    (slug: string) =>
      lang === "zh"
        ? (STONE_ZH[slug]?.name ?? slug)
        : (STONES.find((s) => s.slug === slug)?.displayName ?? slug),
    [lang],
  );

  const toggleFavorite = useCallback((slug: string) => {
    const adding = !favsRef.current.includes(slug);
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    // Mirror the change into the server vault (fire-and-forget, offline-safe).
    if (vaultReadyRef.current) {
      const op =
        adding === true
          ? fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug }),
            })
          : fetch(`/api/favorites?slug=${encodeURIComponent(slug)}`, {
              method: "DELETE",
            });
      op.catch(() => {
        setVaultState("local");
      });
    }
  }, []);

  /** Toast feedback whenever the favorite set changes (skips hydration so
   *  restoring a saved list or vault merge never fires spurious toasts) */
  useEffect(() => {
    if (!hydratedRef.current) return;
    const prev = prevFavsRef.current;
    prevFavsRef.current = favorites;
    if (prev === null) return;
    const added = favorites.filter((s) => !prev.includes(s));
    const removed = prev.filter((s) => !favorites.includes(s));
    if (added.length === 0 && removed.length === 0) return;
    const isAdd = added.length > 0;
    const slug = isAdd ? added[added.length - 1] : removed[removed.length - 1];
    toast({
      title: isAdd ? t(lang).toastFavAdd(nameOf(slug)) : t(lang).toastFavRemove(nameOf(slug)),
      className: "atlas-toast",
    });
  }, [favorites, lang, nameOf, toast]);

  const switchLang = useCallback((next: Lang) => {
    setLang(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const switchTheme = useCallback((next: ThemeMode) => {
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const openStudio = useCallback((slug?: string) => {
    if (slug) {
      const stone = STONES.find((s) => s.slug === slug);
      const mm = stone
        ? stone.availableMm.includes(8)
          ? 8
          : stone.availableMm[0]
        : 10;
      const bead: Bead = { slug, mm, j: 3 };
      setStudioSeed({ beads: [bead], ts: Date.now() });
    }
    setStudioOpen(true);
  }, []);

  /** Today's featured crystal (deterministic per calendar day) */
  const daily = useMemo(() => dailyStone(), []);

  /** Guided design: open the studio preloaded with the daily stone's matching preset */
  const openGuided = useCallback(() => {
    const presetKey = FAMILY_PRESET[daily.colorFamily] ?? "sea-horizon";
    const preset = PRESETS.find((p) => p.key === presetKey);
    const beads = preset ? buildPreset(preset) : [];
    setStudioSeed({
      beads,
      name: lang === "zh" ? `今日灵感 · ${STONE_ZH[daily.slug]?.name ?? daily.slug}` : `Guided · ${daily.displayName}`,
      ts: Date.now(),
    });
    setStudioOpen(true);
  }, [daily, lang]);

  /** Open the studio with a two-stone "pair" bracelet (self + pairing partner) */
  const openPairStudio = useCallback(
    (selfSlug: string, partnerSlug: string) => {
      const mk = (slug: string): Bead => {
        const stone = STONES.find((s) => s.slug === slug);
        const mm = stone
          ? stone.availableMm.includes(8)
            ? 8
            : stone.availableMm[0]
          : 10;
        return { slug, mm, j: 3 };
      };
      const nameOf = (slug: string) =>
        lang === "zh"
          ? (STONE_ZH[slug]?.name ?? slug)
          : (STONES.find((s) => s.slug === slug)?.displayName ?? slug);
      setStudioSeed({
        beads: [mk(selfSlug), mk(partnerSlug)],
        name:
          lang === "zh"
            ? `搭档 · ${nameOf(selfSlug)} + ${nameOf(partnerSlug)}`
            : `Pair · ${nameOf(selfSlug)} + ${nameOf(partnerSlug)}`,
        ts: Date.now(),
      });
      setStudioOpen(true);
    },
    [lang],
  );

  const selectedIndex = useMemo(
    () => STONES.findIndex((s) => s.slug === selectedSlug),
    [selectedSlug],
  );
  const selected = selectedIndex >= 0 ? STONES[selectedIndex] : null;

  /** Filtered stones (search + color family). Search matches EN + 中文 names. */
  const matchSlugs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && colorFilter === null) return null;
    const set = new Set<string>();
    for (const s of STONES) {
      const inColor = colorFilter === null || s.colorFamily === colorFilter;
      if (!inColor) continue;
      const zh = STONE_ZH[s.slug];
      const haystack = [
        s.displayName,
        s.colorFamily,
        s.materialType,
        s.chakra,
        s.birthstone ?? "",
        ...s.keywords,
        ...s.sourceNames,
        zh ? zh.name : "",
        zh ? zh.family : "",
        zh ? zh.keywords.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();
      if (q && !haystack.includes(q)) continue;
      set.add(s.slug);
    }
    return set;
  }, [query, colorFilter]);

  const filteredStones = useMemo(
    () =>
      matchSlugs === null
        ? STONES
        : STONES.filter((s) => matchSlugs.has(s.slug)),
    [matchSlugs],
  );

  const favoriteStones = useMemo(
    () =>
      STONES.filter((s) => favorites.includes(s.slug)).sort(
        (a, b) =>
          favorites.indexOf(a.slug) - favorites.indexOf(b.slug),
      ),
    [favorites],
  );

  /** Keep ?stone= in the URL in sync with the selection (shareable, no history spam) */
  useEffect(() => {
    // Wait until the init microtask has consumed a possible ?stone= deep
    // link, otherwise this cleanup would run on mount and erase the param
    // before it was ever read.
    if (!favLoadedRef.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const current = params.get("stone");
    if (selectedSlug) {
      if (current !== selectedSlug) {
        params.set("stone", selectedSlug);
        history.replaceState(null, "", `?${params.toString()}`);
      }
    } else if (current) {
      params.delete("stone");
      const qs = params.toString();
      history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    }
  }, [selectedSlug]);

  const handleSelect = useCallback((slug: string) => {
    setSelectedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedSlug((prev) => {
      const idx = STONES.findIndex((s) => s.slug === prev);
      const next = (idx - 1 + STONES.length) % STONES.length;
      return STONES[next].slug;
    });
  }, []);

  const handleNext = useCallback(() => {
    setSelectedSlug((prev) => {
      const idx = STONES.findIndex((s) => s.slug === prev);
      const next = (idx + 1) % STONES.length;
      return STONES[next].slug;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setColorFilter(null);
  }, []);

  /** Apply the theme to <html data-theme> so ticker/header/footer follow too */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  /** "/" focuses the search input (unless typing in a field) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Escape closes panels — studio, then codex, take priority */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (studioOpen) {
          setStudioOpen(false);
          return;
        }
        if (codexOpen) {
          setCodexOpen(false);
          return;
        }
        setSelectedSlug(null);
        setNotesOpen(false);
        setFavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studioOpen, codexOpen]);

  /** Dynamic document title follows the selected stone + language */
  useEffect(() => {
    const dict = t(lang);
    document.title = selected
      ? `${selected.displayName} · ${dict.title}`
      : `${dict.kicker} | ${dict.title}`;
  }, [selected, lang]);

  /** Theme the page accents with the selected stone's palette */
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".crystal-universe");
    if (!root) return;
    if (selected) {
      root.style.setProperty("--focus-a", selected.palette[0]);
      root.style.setProperty("--focus-b", selected.palette[1]);
      root.style.setProperty("--focus-c", selected.palette[2]);
    } else {
      root.style.removeProperty("--focus-a");
      root.style.removeProperty("--focus-b");
      root.style.removeProperty("--focus-c");
    }
  }, [selected]);

  /** Subtle starfield parallax following the pointer (skipped for reduced motion) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>(".crystal-universe");
    if (!root) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty(
          "--par-x",
          (e.clientX / window.innerWidth - 0.5).toFixed(4),
        );
        root.style.setProperty(
          "--par-y",
          (e.clientY / window.innerHeight - 0.5).toFixed(4),
        );
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /** Lock body scroll while any modal layer is open */
  useEffect(() => {
    document.body.style.overflow =
      selected || notesOpen || favOpen || studioOpen || codexOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, notesOpen, favOpen, studioOpen, codexOpen]);

  return (
    <main
      className="crystal-universe"
      aria-labelledby="crystal-atlas-title"
    >
      <p id="crystal-atlas-instructions" className="crystal-atlas-sr-only">
        Use the mouse wheel, trackpad, or drag gesture to rotate the crystal
        orbit. Keyboard users can focus the map and use left or right arrow keys
        to rotate, or use the detail arrows to change the selected stone.
      </p>
      <span className="crystal-universe__vignette" aria-hidden="true" />
      <span className="crystal-universe__starfield" aria-hidden="true" />
      <span
        className="crystal-universe__orbitplane"
        aria-hidden="true"
      />
      <span
        className="crystal-universe__orbitplane crystal-universe__orbitplane--inner"
        aria-hidden="true"
      />

      {/* Intro copy */}
      <section
        className="crystal-universe__copy"
        aria-label="Crystal atlas introduction"
      >
        <p className="crystal-universe-mobile-summary">
          {t(lang).mobileSummary}
          <span>
            {TOTAL_STONES} {t(lang).stones} · {TOTAL_VARIANTS} {t(lang).variants}
          </span>
        </p>
        <p className="crystal-atlas-kicker">{t(lang).kicker}</p>
        <h1 id="crystal-atlas-title" className="crystal-universe-title">
          {t(lang).title}
        </h1>
        <dl
          className="crystal-universe-metrics"
          aria-label="Crystal atlas data summary"
        >
          <div>
            <dt>{TOTAL_STONES}</dt>
            <dd>{t(lang).stones}</dd>
          </div>
          <div>
            <dt>{TOTAL_VARIANTS}</dt>
            <dd>{t(lang).variants}</dd>
          </div>
        </dl>

        {/* Crystal of the Day */}
        <button
          type="button"
          className="atlas-daily"
          onClick={() => handleSelect(daily.slug)}
          aria-label={t(lang).dailyAria(
            lang === "zh"
              ? (STONE_ZH[daily.slug]?.name ?? daily.displayName)
              : daily.displayName,
          )}
        >
          <span
            className="atlas-daily__img"
            style={{ boxShadow: `0 0 18px ${daily.palette[1]}55` }}
            aria-hidden="true"
          >
            <img src={daily.imagePath} alt="" width={88} height={88} draggable={false} />
          </span>
          <span className="atlas-daily__body">
            <span className="atlas-daily__kicker">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {t(lang).dailyKicker}
            </span>
            <span className="atlas-daily__name">
              {lang === "zh"
                ? (STONE_ZH[daily.slug]?.name ?? daily.displayName)
                : daily.displayName}
            </span>
            <span className="atlas-daily__cta">{t(lang).dailyCta}</span>
          </span>
        </button>
      </section>

      {/* Notes toggle — orbit view only; in grid view it would cover cards */}
      {viewMode === "orbit" && (
        <button
          type="button"
          className="crystal-atlas-notes-toggle"
          aria-expanded={notesOpen}
          aria-controls="crystal-atlas-notes"
          onClick={() => setNotesOpen((v) => !v)}
        >
          {t(lang).notesToggle}
        </button>
      )}

      {/* Filter / view dock */}
      <AtlasDock
        query={query}
        onQuery={setQuery}
        colorFilter={colorFilter}
        onColorFilter={setColorFilter}
        viewMode={viewMode}
        onViewMode={(m) => {
          setViewMode(m);
          // The floating notes toggle disappears in grid view, so close the
          // notes panel with it to keep the UI consistent.
          if (m === "grid") setNotesOpen(false);
        }}
        favCount={favorites.length}
        onOpenFavorites={() => setFavOpen(true)}
        matchCount={filteredStones.length}
        onClear={clearFilters}
        lang={lang}
        onLang={switchLang}
        onOpenStudio={() => openStudio()}
        onOpenCodex={() => setCodexOpen(true)}
        theme={theme}
        onTheme={switchTheme}
        searchRef={searchInputRef}
      />

      {/* Map (orbit view) */}
      {viewMode === "orbit" ? (
        <AtlasMap
          selectedSlug={selectedSlug}
          onSelect={handleSelect}
          matchSlugs={matchSlugs}
          lang={lang}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          dailySlug={daily.slug}
        />
      ) : (
        <AtlasGrid
          stones={filteredStones}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelect={handleSelect}
          lang={lang}
        />
      )}

      {/* Panels */}
      {notesOpen && (
        <AtlasNotes
          lang={lang}
          onClose={() => setNotesOpen(false)}
          onBuildYourOwn={() => openStudio()}
          onGuided={openGuided}
          onPairStudio={(a, b) => openPairStudio(a, b)}
          onVisitStone={(slug) => {
            setNotesOpen(false);
            setSelectedSlug(slug);
          }}
        />
      )}
      {favOpen && (
        <FavoritesDrawer
          stones={favoriteStones}
          onRemove={toggleFavorite}
          onSelect={(slug) => {
            setSelectedSlug(slug);
            setFavOpen(false);
          }}
          onClose={() => setFavOpen(false)}
          onPairStudio={(a, b) => openPairStudio(a, b)}
          lang={lang}
          vaultState={vaultState}
        />
      )}
      {selected && (
        <AtlasDetail
          stone={selected}
          onClose={() => setSelectedSlug(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          isFavorite={favorites.includes(selected.slug)}
          onToggleFavorite={toggleFavorite}
          lang={lang}
          onBuild={openStudio}
          onPairBuild={(partner) => openPairStudio(selected.slug, partner)}
          onSelectStone={setSelectedSlug}
        />
      )}
      {studioOpen && (
        <BraceletStudio
          lang={lang}
          seed={studioSeed}
          onClose={() => setStudioOpen(false)}
        />
      )}
      {codexOpen && (
        <CodexOverlay
          lang={lang}
          onClose={() => setCodexOpen(false)}
          onVisitStone={(slug) => {
            setCodexOpen(false);
            setSelectedSlug(slug);
          }}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onPairStudio={(a, b) => openPairStudio(a, b)}
        />
      )}
    </main>
  );
}
