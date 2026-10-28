"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { STONES, type Stone } from "@/lib/stones-data";
import { t, STONE_ZH, CHAKRA_ZH, type Lang } from "@/lib/i18n";
import { stoneKnowledge, publicClaims, INTENTION_ZH } from "@/lib/stone-knowledge";
import { stoneStyle, COLOR_TONE_ZH } from "@/lib/stone-style";
import { SHOW_DRAFT_KNOWLEDGE } from "@/lib/atlas-flags";
import {
  buildAtlasLayout,
  buildChakraLinks,
  computeMobilePoints,
  projectSphere,
  mobileBandRadii,
  PITCH_LIMIT,
  type AtlasPoint,
} from "@/lib/atlas-layout";

/* ------------------------------------------------------------------ *
 * Interaction constants. The horizontal feel is carried over unchanged
 * from the old flat orbit so the gesture still reads the same; pitch is
 * the new second axis.
 * ------------------------------------------------------------------ */
const DEFAULT_YAW = 0.5;
const DEFAULT_PITCH = 0.2;
const DRAG_YAW_PER_PX = 0.0042;
const DRAG_PITCH_PER_PX = 0.0032;
const WHEEL_YAW = 0.0024;
const WHEEL_PITCH = 0.0016;
const KEY_YAW = 0.14;
const KEY_PITCH = 0.09;
const INERTIA_DECAY = 0.94;
const INERTIA_FLOOR = 0.0004;
/** Pointer travel before a press counts as a drag rather than a tap. */
const TAP_SLOP_PX = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** See round() in atlas-layout — keeps the SSR and client style strings equal. */
function round4(value: number) {
  return Math.round(value * 1e4) / 1e4;
}

/** The rest layout is derived once from chakra + colour family, never from
 *  `Stone.orbit` (that is the MoonArq reference ellipse, kept in stones-data
 *  for reference only). Stable across SSR and hydration. */
const LAYOUT: AtlasPoint[] = buildAtlasLayout(STONES);
const LINKS = buildChakraLinks(LAYOUT);
const MOBILE_RADII = mobileBandRadii(LAYOUT);
const MOBILE_BY_SLUG = new Map(computeMobilePoints(LAYOUT).map((m) => [m.slug, m]));

/**
 * Iterative pairwise relaxation so mobile orbit nodes never overlap when
 * rotation brings two beads close together (concept borrowed from the
 * crystal-planet reference atlas): each pass walks every pair in pixel
 * space, and overlapping nodes push each other apart until a minimum
 * gap is restored. Bounded to 8 passes with an early exit.
 */
function resolveMobileCollisions(
  slots: ComputedSlot[],
  mapSize: { w: number; h: number },
): void {
  if (!mapSize.w || !mapSize.h) return;
  const W = mapSize.w;
  const H = mapSize.h;
  for (let pass = 0; pass < 8; pass += 1) {
    let moved = false;
    for (let i = 0; i < slots.length; i += 1) {
      for (let j = i + 1; j < slots.length; j += 1) {
        const a = slots[i];
        const b = slots[j];
        const dx = b.mobileX - a.mobileX;
        const dy = b.mobileY - a.mobileY;
        const dist = Math.hypot(dx, dy) || 1;
        const needed = (a.mobileSize + b.mobileSize) * 0.46 + 8;
        if (dist >= needed) continue;
        const push = (needed - dist) / 2 + 1.2;
        const ux = dx / dist;
        const uy = dy / dist;
        const aHalf = a.mobileSize / 2 + 4;
        const bHalf = b.mobileSize / 2 + 4;
        a.mobileX = clamp(a.mobileX - ux * push, aHalf, W - aHalf);
        a.mobileY = clamp(a.mobileY - uy * push, aHalf, H - aHalf);
        b.mobileX = clamp(b.mobileX + ux * push, bHalf, W - bHalf);
        b.mobileY = clamp(b.mobileY + uy * push, bHalf, H - bHalf);
        moved = true;
      }
    }
    if (!moved) break;
  }
  // Final unconditional bounds pass: the outer bands can exceed the map edges
  // at the extremes of the orbit (~390px screens are narrower than the
  // outermost band plus two node radii), and the pairwise loop above only
  // clamps nodes it actually pushes. Pull every node back inside so nothing is
  // clipped at the screen edge. The top edge gets an extra 8px for the ±7px
  // drift animation lift.
  for (const s of slots) {
    const half = s.mobileSize / 2 + 4;
    s.mobileX = clamp(s.mobileX, half, W - half);
    s.mobileY = clamp(s.mobileY, half + 8, H - half - 4);
  }
}

interface ComputedSlot {
  slug: string;
  /** Percentage of the map box. */
  x: number;
  y: number;
  size: number;
  z: number;
  depth: number;
  front: boolean;
  opacity: number;
  blur: number;
  mobileX: number;
  mobileY: number;
  mobileSize: number;
  mobileZ: number;
  mobileDepth: number;
}

function computeSlots(
  yaw: number,
  pitch: number,
  mapSize: { w: number; h: number },
): ComputedSlot[] {
  // Desktop: real perspective sphere. Until the map has been measured the box
  // falls back to a typical desktop size so the first paint is already in the
  // right place instead of collapsing to the centre.
  const w = mapSize.w || 1008;
  const h = mapSize.h || 800;
  const projected = projectSphere(LAYOUT, { yaw, pitch }, { width: w, height: h });

  // Mobile: the same seven chakra bands and colour sectors, read from directly
  // above. Chakra latitude becomes a concentric ring, longitude the angle on
  // that ring. Collision relaxation runs on top so nothing still overlaps.
  const S = Math.min(mapSize.w || 390, (mapSize.h || 480) * 0.96);

  const slots = projected.map((p) => {
    const mobile = MOBILE_BY_SLUG.get(p.slug)!;
    const a = (mobile.angle * Math.PI) / 180;
    const mDepth = (Math.sin(a) + 1) / 2;
    return {
      slug: p.slug,
      // Rounded so the server render and the client render serialise the same
      // style string; see round() in atlas-layout.
      x: round4((p.x / w) * 100),
      y: round4((p.y / h) * 100),
      size: p.size,
      z: p.zIndex,
      depth: p.depth,
      front: p.front,
      opacity: p.opacity,
      blur: p.blur,
      mobileX: mapSize.w ? mapSize.w / 2 + Math.cos(a) * mobile.radius * S : 50,
      mobileY: mapSize.h ? mapSize.h / 2 + Math.sin(a) * mobile.radius * S : 50,
      mobileSize: mobile.size * (0.9 + 0.18 * mDepth),
      mobileZ: 10 + Math.round(mDepth * 80),
      mobileDepth: mDepth,
    };
  });
  resolveMobileCollisions(slots, mapSize);
  return slots;
}

interface LineSeg {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colorA: string;
  colorB: string;
  delay: number;
  active: boolean;
  dimmed: boolean;
}

const STONE_BY_SLUG = new Map<string, Stone>(STONES.map((s) => [s.slug, s]));

/**
 * Constellation lines, chained inside a chakra band and ordered by longitude,
 * so a rotation lights up one energy layer as a single shape instead of the
 * index-order knot the old buildLines produced.
 */
function buildLines(
  slots: ComputedSlot[],
  selectedSlug: string | null,
  matchSlugs: Set<string> | null,
): LineSeg[] {
  return LINKS.map((link) => {
    const a = slots.find((s) => s.slug === link.a)!;
    const b = slots.find((s) => s.slug === link.b)!;
    const stoneA = STONE_BY_SLUG.get(link.a)!;
    const stoneB = STONE_BY_SLUG.get(link.b)!;
    return {
      key: link.key,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      colorA: stoneA.palette[1],
      colorB: stoneB.palette[1],
      delay: link.index * 0.08,
      active: selectedSlug === stoneA.slug || selectedSlug === stoneB.slug,
      dimmed:
        matchSlugs !== null &&
        !matchSlugs.has(stoneA.slug) &&
        !matchSlugs.has(stoneB.slug),
    };
  });
}

interface PairSeg {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colorA: string;
  colorB: string;
  delay: number;
}

/** Constellation links from the selected node to its pairing partners */
function buildPairLines(
  slots: ComputedSlot[],
  selectedSlug: string | null,
): PairSeg[] {
  if (!selectedSlug) return [];
  const stone = STONE_BY_SLUG.get(selectedSlug);
  const from = slots.find((s) => s.slug === selectedSlug);
  if (!stone || !from) return [];
  return stone.pairs.flatMap((slug, i) => {
    const to = slots.find((s) => s.slug === slug);
    const partner = STONE_BY_SLUG.get(slug);
    if (!to || !partner || partner.slug === stone.slug) return [];
    return [
      {
        key: `pair-${stone.slug}-${partner.slug}`,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        colorA: stone.palette[1],
        colorB: partner.palette[1],
        delay: i * 0.18,
      },
    ];
  });
}

export function AtlasMap({
  selectedSlug,
  onSelect,
  matchSlugs,
  lang,
  favorites,
  onToggleFavorite,
  dailySlug,
}: {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  /** When filtering, only stones in this set stay fully visible */
  matchSlugs: Set<string> | null;
  lang: Lang;
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
  /** Featured "crystal of the day" node */
  dailySlug: string;
}) {
  const dict = t(lang);
  const [frame, setFrame] = useState({ yaw: DEFAULT_YAW, pitch: DEFAULT_PITCH });
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });
  const mapRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef({ yaw: DEFAULT_YAW, pitch: DEFAULT_PITCH });
  const dragRef = useRef<{
    dragging: boolean;
    lastX: number;
    lastY: number;
    vYaw: number;
    vPitch: number;
    moved: boolean;
  }>({
    dragging: false,
    lastX: 0,
    lastY: 0,
    vYaw: 0,
    vPitch: 0,
    moved: false,
  });
  const inertiaRef = useRef<number | null>(null);
  const dragEndRef = useRef<{ time: number; moved: boolean }>({
    time: 0,
    moved: false,
  });
  const pointerIdRef = useRef<number | null>(null);
  const capturedRef = useRef(false);

  const setRot = useCallback((next: { yaw: number; pitch: number }) => {
    const clamped = {
      yaw: next.yaw,
      pitch: clamp(next.pitch, -PITCH_LIMIT, PITCH_LIMIT),
    };
    frameRef.current = clamped;
    setFrame(clamped);
  }, []);

  const nudge = useCallback(
    (dYaw: number, dPitch: number) => {
      const f = frameRef.current;
      setRot({ yaw: f.yaw + dYaw, pitch: f.pitch + dPitch });
    },
    [setRot],
  );

  /** Inertial spin after release, on both axes */
  const spinInertia = useCallback(() => {
    if (inertiaRef.current) cancelAnimationFrame(inertiaRef.current);
    const step = () => {
      const drag = dragRef.current;
      drag.vYaw *= INERTIA_DECAY;
      drag.vPitch *= INERTIA_DECAY;
      if (
        Math.abs(drag.vYaw) < INERTIA_FLOOR &&
        Math.abs(drag.vPitch) < INERTIA_FLOOR
      ) {
        drag.vYaw = 0;
        drag.vPitch = 0;
        inertiaRef.current = null;
        return;
      }
      const f = frameRef.current;
      setRot({ yaw: f.yaw + drag.vYaw, pitch: f.pitch + drag.vPitch });
      inertiaRef.current = requestAnimationFrame(step);
    };
    inertiaRef.current = requestAnimationFrame(step);
  }, [setRot]);

  useEffect(() => {
    return () => {
      if (inertiaRef.current) cancelAnimationFrame(inertiaRef.current);
    };
  }, []);

  /** Track map size for pixel-accurate mobile orbit layout */
  useEffect(() => {
    const el = mapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setMapSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRef.current) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    stopInertia();
    dragRef.current = {
      dragging: true,
      lastX: e.clientX,
      lastY: e.clientY,
      vYaw: 0,
      vPitch: 0,
      moved: false,
    };
    pointerIdRef.current = e.pointerId;
    capturedRef.current = false;
  }, [stopInertia]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.dragging) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      if (!capturedRef.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        // Capture only once real dragging starts, so plain taps still
        // deliver their click to the node button underneath.
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          capturedRef.current = true;
        } catch {
          /* ignore */
        }
      }
      if (Math.abs(dx) > TAP_SLOP_PX || Math.abs(dy) > TAP_SLOP_PX) {
        drag.moved = true;
      }
      drag.vYaw = dx * DRAG_YAW_PER_PX;
      drag.vPitch = dy * DRAG_PITCH_PER_PX;
      const f = frameRef.current;
      setRot({ yaw: f.yaw + drag.vYaw, pitch: f.pitch + drag.vPitch });
    },
    [setRot],
  );

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.dragging) return;
    drag.dragging = false;
    dragEndRef.current = { time: Date.now(), moved: drag.moved };
    drag.moved = false;
    if (capturedRef.current && pointerIdRef.current != null) {
      try {
        mapRef.current?.releasePointerCapture(pointerIdRef.current);
      } catch {
        /* ignore */
      }
      capturedRef.current = false;
    }
    spinInertia();
  }, [spinInertia]);

  /** A node click should only register when it was a true tap, not a drag */
  const handleNodeClick = useCallback(
    (slug: string) => {
      const end = dragEndRef.current;
      if (end.moved && Date.now() - end.time < 200) return;
      onSelect(slug);
    },
    [onSelect],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      stopInertia();
      // Plain wheel spins around the chakra axis; Shift tips the sphere so the
      // seven bands can be walked from the side.
      if (e.shiftKey) {
        nudge(0, e.deltaY * WHEEL_PITCH);
      } else {
        nudge(e.deltaY * WHEEL_YAW, 0);
      }
    },
    [nudge, stopInertia],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stopInertia();
        nudge(-KEY_YAW, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stopInertia();
        nudge(KEY_YAW, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        stopInertia();
        nudge(0, -KEY_PITCH);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stopInertia();
        nudge(0, KEY_PITCH);
      }
    },
    [nudge, stopInertia],
  );

  const slots = useMemo(
    () => computeSlots(frame.yaw, frame.pitch, mapSize),
    [frame.yaw, frame.pitch, mapSize],
  );
  const slotBySlug = useMemo(() => {
    const m = new Map<string, ComputedSlot>();
    slots.forEach((s) => m.set(s.slug, s));
    return m;
  }, [slots]);
  const lines = useMemo(
    () => buildLines(slots, selectedSlug, matchSlugs),
    [slots, selectedSlug, matchSlugs],
  );
  const pairLines = useMemo(
    () => buildPairLines(slots, selectedSlug),
    [slots, selectedSlug],
  );

  return (
    <div
      ref={mapRef}
      className="crystal-atlas-map"
      role="list"
      tabIndex={0}
      aria-label="Clickable crystal atlas nodes"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
    >
      <span className="crystal-atlas-map-glow" aria-hidden="true" />

      {/* Mobile orbit rings — one per chakra band, same data as the sphere */}
      <svg
        className="crystal-atlas-mobile-orbits"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={
          mapSize.w
            ? { width: Math.min(mapSize.w, mapSize.h * 0.96) }
            : undefined
        }
      >
        {MOBILE_RADII.map((r, i) => (
          <circle key={`${r}-${i}`} cx="50" cy="50" r={(r * 100).toFixed(2)} />
        ))}
      </svg>

      {/* Constellation lines */}
      <svg
        className="crystal-atlas-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {lines.map((l) => (
            <linearGradient
              key={l.key}
              id={`grad-${l.key}`}
              gradientUnits="userSpaceOnUse"
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
            >
              <stop offset="0%" stopColor={l.colorA} />
              <stop offset="100%" stopColor={l.colorB} />
            </linearGradient>
          ))}
        </defs>
        {lines.map((l) => (
          <line
            key={l.key}
            className="crystal-atlas-line"
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            pathLength={1}
            stroke={`url(#grad-${l.key})`}
            style={{
              ["--line-opacity" as string]: l.dimmed
                ? 0.04
                : l.active
                  ? 0.5
                  : matchSlugs
                    ? 0.3
                    : 0.16,
              animationDelay: `${l.delay}s`,
            }}
          />
        ))}
      </svg>

      {/* Pairing constellation: selected node ↔ its partners */}
      {pairLines.length > 0 && (
        <svg
          className="crystal-atlas-lines crystal-atlas-lines--pair"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {pairLines.map((l) => (
              <linearGradient
                key={l.key}
                id={`pairgrad-${l.key}`}
                gradientUnits="userSpaceOnUse"
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
              >
                <stop offset="0%" stopColor={l.colorA} />
                <stop offset="100%" stopColor={l.colorB} />
              </linearGradient>
            ))}
          </defs>
          {pairLines.map((l) => (
            <line
              key={l.key}
              className="crystal-atlas-pair-line"
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              pathLength={1}
              stroke={`url(#pairgrad-${l.key})`}
              style={{ animationDelay: `${0.35 + l.delay}s` }}
            />
          ))}
        </svg>
      )}

      {/* Nodes */}
      {STONES.map((stone, i) => {
        const slot = slotBySlug.get(stone.slug)!;
        const isSelected = selectedSlug === stone.slug;
        const matched = !matchSlugs || matchSlugs.has(stone.slug);
        const isFav = favorites.includes(stone.slug);
        const isDaily = stone.slug === dailySlug;
        const zh = STONE_ZH[stone.slug];
        const label = lang === "zh" && zh ? zh.name : stone.displayName;
        const familyLabel =
          lang === "zh" && zh ? zh.family : stone.colorFamily;
        // Caption line 2: "<chakra> · <hint>". The intention hint is used only
        // when it passes the same public-claims gate as the detail panel.
        const chakraLabel =
          lang === "zh" ? (CHAKRA_ZH[stone.chakra] ?? stone.chakra) : stone.chakra;
        const firstIntention = stoneKnowledge(stone.slug)?.intentions?.[0];
        const intentionPublic =
          firstIntention !== undefined &&
          publicClaims(stone.slug, { includeDraft: SHOW_DRAFT_KNOWLEDGE }).meaning !== undefined;
        const tone = stoneStyle(stone.slug)?.tone;
        const hint =
          lang === "zh"
            ? intentionPublic && firstIntention
              ? INTENTION_ZH[firstIntention]
              : tone
                ? COLOR_TONE_ZH[tone]
                : familyLabel
            : (stone.keywords[0] ?? stone.colorFamily);
        const caption = `${chakraLabel} · ${hint}`;
        // Depth reads through brightness, scale and blur only — no new colour.
        // A selected or matched back-hemisphere bead is pulled forward so the
        // panel can still be opened from the far side of the sphere.
        const lift = isSelected || !matched;
        const interactive = slot.front || lift;
        const brightness = (0.72 + 0.32 * slot.depth).toFixed(2);
        const filter = !matched
          ? "brightness(0.5) grayscale(0.85)"
          : slot.blur > 0
            ? `brightness(${brightness}) blur(${slot.blur}px)`
            : `brightness(${brightness})`;
        return (
          <div
            key={stone.slug}
            role="listitem"
            className={`crystal-atlas-node-slot ${
              slot.front ? "is-front" : "is-back"
            } ${matched ? "" : "is-dimmed"} ${isDaily ? "is-daily" : ""}`}
            data-chakra={stone.chakra}
            style={
              {
                ["--atlas-x" as string]: `${slot.x}%`,
                ["--atlas-y" as string]: `${slot.y}%`,
                ["--atlas-size" as string]: `${slot.size.toFixed(1)}px`,
                ["--atlas-z" as string]: slot.z,
                ["--atlas-delay" as string]: `${(i * 0.045).toFixed(3)}s`,
                ["--atlas-glow" as string]: stone.orbit.intensity,
                ["--atlas-depth" as string]: slot.depth.toFixed(3),
                ["--atlas-mobile-x" as string]: `${slot.mobileX.toFixed(1)}px`,
                ["--atlas-mobile-y" as string]: `${slot.mobileY.toFixed(1)}px`,
                ["--atlas-mobile-size" as string]: `${slot.mobileSize.toFixed(1)}px`,
                ["--atlas-mobile-z" as string]: slot.mobileZ,
                ["--node-a" as string]: stone.palette[0],
                ["--node-b" as string]: stone.palette[1],
                ["--node-c" as string]: stone.palette[2],
                filter,
                opacity: matched ? slot.opacity : 0.18,
                pointerEvents: interactive ? "auto" : "none",
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              className="crystal-atlas-node"
              aria-label={dict.openStone(
                label,
                caption,
              )}
              aria-expanded={isSelected}
              aria-pressed={isSelected}
              onClick={() => handleNodeClick(stone.slug)}
            >
              <span className="crystal-atlas-node-drift">
                <span className="crystal-atlas-node-core" aria-hidden="true" />
                <span className="crystal-atlas-node-image-shell">
                  {/* Step 3: 17 eager 720px PNGs pulled 5.5MB on first paint
                      while rendering at ~77px. Lazy lets the browser fetch
                      only what is near the viewport. */}
                  <img
                    className="crystal-atlas-node-image"
                    src={stone.imagePath}
                    alt=""
                    width={720}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </span>
                <span className="crystal-atlas-node-copy">
                  <strong>{label}</strong>
                  <small>{caption}</small>
                </span>
              </span>
            </button>
            {/* Quick favorite chip (appears on hover / always when active) */}
            <button
              type="button"
              className={`crystal-atlas-node-fav ${isFav ? "is-active" : ""}`}
              aria-label={dict.toggleFav(stone.displayName, !isFav)}
              aria-pressed={isFav}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(stone.slug);
              }}
            >
              <Heart
                className="h-3 w-3"
                fill={isFav ? "currentColor" : "none"}
                strokeWidth={2.2}
              />
            </button>
            {/* Crystal-of-the-day sparkle chip */}
            {isDaily && (
              <button
                type="button"
                className="crystal-atlas-node-daily"
                aria-label={dict.dailyAria(label)}
                title={dict.dailyBadge}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(stone.slug);
                }}
              >
                <Sparkles className="h-3 w-3" strokeWidth={2.2} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
