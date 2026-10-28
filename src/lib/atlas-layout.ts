// UNIQorn Crystal Atlas — chakra sphere geometry.
//
// Pure functions only: no React, no DOM, no import of stones-data. The atlas
// passes in a minimal `{ slug, chakra, colorFamily }` shape so the geometry can
// be unit-tested on its own.
//
// Why this module exists
// ----------------------
// `Stone.orbit` in stones-data.ts is the MoonArq reference layout (three flat
// ellipses, angles lifted from the original site). It carries no UNIQorn
// meaning and it is what crowds the old flat orbit: 17 beads crammed onto three
// concentric rings with a 0.68 vertical squash, so the ring order dictated
// overlap instead of meaning.
//
// The sphere replaces it with two real dimensions of meaning:
//
//   latitude  = chakra, on the traditional bottom-to-top axis
//               Root → Sacral → Solar Plexus → Heart → Throat → Third Eye → Crown
//   longitude = colour family, so a colour family reads as a vertical column
//               and turning the sphere walks the spectrum of a band.
//
// Every value below is derived deterministically from the input array, so the
// server render and the client hydration produce identical coordinates.

// Reuse the single chakra definition from i18n so the layout module and the
// legend rail can never disagree about the axis order or the key type.
import { CHAKRA_ORDER as I18N_CHAKRA_ORDER, type ChakraKey } from "@/lib/i18n";

const CHAKRA_ORDER = I18N_CHAKRA_ORDER;
export { I18N_CHAKRA_ORDER as CHAKRA_ORDER };
export type AtlasChakra = ChakraKey;

/** Minimal stone shape this module needs. `stones-data` satisfies it. */
export interface AtlasLayoutStone {
  slug: string;
  chakra: string;
  colorFamily: string;
}

/* ------------------------------------------------------------------ *
 * Tunables — all layout constants live here.
 * ------------------------------------------------------------------ */

/** Latitude of the lowest band centre, in degrees (-90..90, up is +). */
const LAT_MIN = -66;
/** Latitude of the highest band centre. */
const LAT_MAX = 66;
/**
 * A band's half-height is capped at 46% of the gap between two band centres so
 * no two adjacent bands can overlap in latitude. Bands with more members get a
 * proportionally taller band, which is why a one-stone band (Sacral, Throat)
 * reads as a single deliberate point rather than a half-empty stripe.
 */
const BAND_HALF_RATIO = 0.46;
/**
 * Per-band radius ratio, 0.88 (Root) → 1.0 (Crown). Root sits deepest, Crown
 * rides the outer shell; the 45px spread on a ~370px radius is what stops the
 * seven bands from reading as one flat disc.
 */
const RADIUS_MIN = 0.88;
const RADIUS_MAX = 1.0;

/** Node base diameter (px) by how many stones share the chakra band. */
const SIZE_BY_BAND_COUNT: Record<number, number> = {
  1: 88,
  2: 82,
  3: 76,
  4: 72,
};
const SIZE_DEFAULT = 88;
/** Perspective only moves a bead's diameter inside this range, so a
 *  back-facing bead never disappears and a front-facing one never dominates. */
const SIZE_SCALE_MIN = 0.74;
const SIZE_SCALE_MAX = 1.3;

/** Focal length as a multiple of the sphere radius, then clamped to px. */
const FOCAL_RATIO = 3.0;
const FOCAL_PX_MIN = 900;
const FOCAL_PX_MAX = 1200;
/** Vertical compression. Higher than the old flat 0.68, low enough that the
 *  sphere still reads as a sphere instead of a plate. */
const SQUASH_BALL = 0.86;

/**
 * Fraction of its longitude sector a colour family actually spans when it has
 * more than one member. Solar Plexus carries all three Gold stones, so Gold has
 * to spend nearly its whole 63° arc to keep them apart instead of stacking
 * three beads on top of each other in one band.
 */
const FAMILY_LONGITUDE_SPREAD = 0.9;

/** Pitch clamp, radians (±62°). */
export const PITCH_LIMIT = (62 * Math.PI) / 180;

/** Mobile square-layout radii, as a fraction of the mobile zone side length. */
const MOBILE_R_MIN = 0.13;
const MOBILE_R_MAX = 0.4;

/**
 * Mobile beads are drawn smaller than their desktop size. At 390px wide the
 * map is a third of the desktop area, so a 72px desktop disc becomes a
 * thumbstop that swallows its neighbours. 0.68 lands the mobile set at 49-60px,
 * which is the weight the old flat orbit used.
 */
const MOBILE_SIZE_FACTOR = 0.68;

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

export interface AtlasPoint {
  slug: string;
  chakra: string;
  /** Index in CHAKRA_ORDER, or -1 when the chakra is not recognised. */
  chakraIndex: number;
  colorFamily: string;
  /** Degrees. -90 = south pole, +90 = north pole. */
  latitude: number;
  /** Degrees, 0..360. 0 faces the viewer at yaw 0. */
  longitude: number;
  /** 0.88..1.0 shell radius multiplier for this band. */
  radiusRatio: number;
  /** How many stones share this chakra band. */
  bandCount: number;
  /** How many stones share this chakra band *and* this colour family. */
  familyBandCount: number;
  /** Node base diameter in px, before perspective scaling. */
  baseSize: number;
  /** Rest position on the unit-ish sphere. */
  x: number;
  y: number;
  z: number;
}

/**
 * Locale-independent string order. `String.prototype.localeCompare` runs
 * through ICU, and Node (SSR) and the browser can disagree — that reorders the
 * band members between the two renders and React reports a hydration mismatch
 * on every node's x/y. Plain code-unit comparison is identical everywhere.
 */
function byCodeUnit(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Quantise to a fixed number of decimals.
 *
 * `Math.sin` / `Math.cos` are not guaranteed bit-identical between Node's V8
 * and the browser's, and a few ULP of drift survives the `* 100 / w` scaling
 * into the rendered coordinates. React then sees a different `style` string on
 * hydration than the one the server sent and reports a mismatch on every node.
 * Rounding well below one screen pixel makes the output environment-independent
 * without changing anything a person can see.
 */
function round(value: number, places = 4) {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function chakraIndexOf(chakra: string): number {
  const i = (CHAKRA_ORDER as readonly string[]).indexOf(chakra);
  return i;
}

/** Normalise a longitude into [0, 360). */
function wrap360(deg: number) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Derive the rest layout: which band each stone belongs to, which longitude
 * sector its colour family owns, and the resulting 3D rest coordinate.
 *
 * Deterministic by construction: bands come from CHAKRA_ORDER (not from input
 * order), family sectors are sorted by descending member count then by name,
 * and members inside a band are sorted by slug. Same input → same output, on
 * the server and on the client.
 */
export function buildAtlasLayout(stones: AtlasLayoutStone[]): AtlasPoint[] {
  const total = stones.length || 1;
  const bandCount = CHAKRA_ORDER.length;

  // 1. Band membership, in traditional order.
  const bands = new Map<string, AtlasLayoutStone[]>();
  for (const chakra of CHAKRA_ORDER) bands.set(chakra, []);
  const orphans: AtlasLayoutStone[] = [];
  for (const stone of stones) {
    const bucket = bands.get(stone.chakra);
    if (bucket) bucket.push(stone);
    else orphans.push(stone);
  }

  // 2. Band geometry: even latitude ladder + count-proportional band height.
  const step = (LAT_MAX - LAT_MIN) / bandCount;
  const maxBandCount = Math.max(
    1,
    ...CHAKRA_ORDER.map((c) => bands.get(c)?.length ?? 0),
  );

  // 3. Longitude sectors: every colour family owns a contiguous arc sized in
  //    proportion to how many stones carry it, so the ten families tile the
  //    full 360° with no wasted gap and no two families share a longitude.
  //    Ordering by size alone would park all four one-stone families inside the
  //    final 42° arc, so the size order is interleaved half-and-half: the
  //    biggest arc first, then the smallest, alternating inward. Same
  //    contiguity guarantee, far more even longitude coverage.
  const familyMembers = new Map<string, AtlasLayoutStone[]>();
  for (const s of stones) {
    const list = familyMembers.get(s.colorFamily) ?? [];
    list.push(s);
    familyMembers.set(s.colorFamily, list);
  }
  const bySize = [...familyMembers.keys()].sort((a, b) => {
    const d = familyMembers.get(b)!.length - familyMembers.get(a)!.length;
    return d !== 0 ? d : byCodeUnit(a, b);
  });
  const families: string[] = [];
  for (let i = 0; i < bySize.length / 2; i += 1) {
    const front = bySize[i];
    const back = bySize[bySize.length - 1 - i];
    if (front) families.push(front);
    if (back && back !== front) families.push(back);
  }
  const familyCenter = new Map<string, number>();
  let cursor = 0;
  for (const family of families) {
    const share = familyMembers.get(family)!.length / total;
    familyCenter.set(family, wrap360(cursor + share * 180));
    cursor += share * 360;
  }

  const points: AtlasPoint[] = [];
  const push = (
    stone: AtlasLayoutStone,
    chakra: string,
    index: number,
    latitude: number,
    longitude: number,
    bandCount_: number,
    familyBandCount: number,
  ) => {
    const radiusRatio =
      RADIUS_MIN +
      (RADIUS_MAX - RADIUS_MIN) * (bandCount > 1 ? index / (bandCount - 1) : 0.5);
    const lat = (latitude * Math.PI) / 180;
    const lon = (longitude * Math.PI) / 180;
    const cosLat = Math.cos(lat);
    points.push({
      slug: stone.slug,
      chakra,
      chakraIndex: index,
      colorFamily: stone.colorFamily,
      latitude,
      longitude: wrap360(longitude),
      radiusRatio,
      bandCount: bandCount_,
      familyBandCount,
      baseSize:
        SIZE_BY_BAND_COUNT[bandCount_] ??
        (bandCount_ > 4
          ? SIZE_DEFAULT - (bandCount_ - 4) * 4
          : SIZE_DEFAULT),
      x: radiusRatio * cosLat * Math.sin(lon),
      y: radiusRatio * Math.sin(lat),
      z: radiusRatio * cosLat * Math.cos(lon),
    });
  };

  for (let i = 0; i < CHAKRA_ORDER.length; i += 1) {
    const chakra = CHAKRA_ORDER[i];
    const members = [...(bands.get(chakra) ?? [])].sort((a, b) =>
      byCodeUnit(a.slug, b.slug),
    );
    if (!members.length) continue;
    const centreLat = LAT_MIN + (i + 0.5) * step;
    const half = step * BAND_HALF_RATIO * (members.length / maxBandCount);

    // Group this band by colour family, families in the global sector order so
    // a family's arc keeps the same place in every band it appears in.
    const byFamily = new Map<string, AtlasLayoutStone[]>();
    for (const m of members) {
      const list = byFamily.get(m.colorFamily) ?? [];
      list.push(m);
      byFamily.set(m.colorFamily, list);
    }
    for (const family of families) {
      const group = byFamily.get(family);
      if (!group?.length) continue;
      const n = group.length;
      // Arc width this family owns, from its share of the whole atlas.
      const share = familyMembers.get(family)!.length / total;
      const arcWidth = share * 360;
      const base = familyCenter.get(family) ?? 0;
      for (let k = 0; k < n; k += 1) {
        const t = n > 1 ? (k - (n - 1) / 2) * (2 * half / (n - 1)) : 0;
        const s =
          n > 1
            ? (k - (n - 1) / 2) *
              (arcWidth * FAMILY_LONGITUDE_SPREAD / (n - 1))
            : 0;
        push(
          group[k],
          chakra,
          i,
          centreLat + t,
          base + s,
          members.length,
          n,
        );
      }
    }
  }

  // Stones carrying an unrecognised chakra string still need a home. Put them
  // in the bottom band on their own longitude slot rather than dropping them
  // off the sphere, so a bad data edit degrades instead of vanishing.
  if (orphans.length) {
    orphans.sort((a, b) => byCodeUnit(a.slug, b.slug));
    const centreLat = LAT_MIN + 0.5 * step;
    const half = step * BAND_HALF_RATIO * (orphans.length / maxBandCount);
    orphans.forEach((stone, k) => {
      const t =
        orphans.length > 1
          ? (k - (orphans.length - 1) / 2) *
            (2 * half / (orphans.length - 1))
          : 0;
      push(stone, CHAKRA_ORDER[0], 0, centreLat + t, (k * 360) / orphans.length, orphans.length, 1);
    });
  }

  return points;
}

/* ------------------------------------------------------------------ *
 * Projection
 * ------------------------------------------------------------------ */

export interface AtlasFrame {
  /** Rotation about the vertical axis, radians. */
  yaw: number;
  /** Rotation about the horizontal axis, radians, clamped to ±PITCH_LIMIT. */
  pitch: number;
}

export interface ProjectedPoint {
  slug: string;
  /** Percentage of the map box, 0..100. */
  x: number;
  y: number;
  /** Node diameter in px after perspective. */
  size: number;
  /** Rotated depth. > 0 front, < 0 back. */
  z: number;
  /** Normalised 0 (far back) .. 1 (front) depth. */
  depth: number;
  /** Continuous stacking order derived from z. */
  zIndex: number;
  /** True when the bead is in the front hemisphere. */
  front: boolean;
  /** 1.0 in front, down to 0.30 at the back of the sphere. */
  opacity: number;
  /** px blur for the back hemisphere. */
  blur: number;
  /** Can this bead be clicked right now? */
  interactive: boolean;
  /** How far the rim clamp pulled this bead back from the projected edge, px. */
  rimShift: number;
}

export interface SphereOptions {
  /** Map box in px. */
  width: number;
  height: number;
  /** Sphere radius in px. Auto-derived from the box when omitted. */
  radius?: number;
  squash?: number;
}

/** Largest node base diameter, used to keep edge beads off the map border. */
const MAX_NODE_SIZE = 88;

/** Fraction of the map box the sphere is allowed to occupy. */
const SPHERE_FILL = 0.86;

/**
 * Radius that fills the map box. A large radius spreads the interior beads
 * further apart, and the interior is where the crowding lives, so the fill is
 * deliberately generous; the handful of beads that would poke past the border
 * are handled by the rim clamp in projectSphere instead of by shrinking the
 * whole sphere.
 */
export function sphereRadius(width: number, height: number, squash = SQUASH_BALL) {
  const byWidth = (width * SPHERE_FILL) / 2;
  const byHeight = (height * SPHERE_FILL) / (2 * squash);
  return Math.max(80, Math.min(byWidth, byHeight));
}

/**
 * Rotate every point by the frame, then project with a real perspective divide.
 *
 *   scale    = f / (f - z)
 *   screenX  = cx + x * R * scale
 *   screenY  = cy - y * R * scale * squash
 *
 * Depth is read only from brightness, scale and blur — no new colour, which is
 * the only honest way to do fore/background in a 留白水墨 system.
 */
export function projectSphere(
  points: AtlasPoint[],
  frame: AtlasFrame,
  options: SphereOptions,
): ProjectedPoint[] {
  const { width, height } = options;
  const squash = options.squash ?? SQUASH_BALL;
  const R = options.radius ?? sphereRadius(width, height, squash);
  const f = clamp(FOCAL_RATIO * R, FOCAL_PX_MIN, FOCAL_PX_MAX);
  const pitch = clamp(frame.pitch, -PITCH_LIMIT, PITCH_LIMIT);
  const cy = Math.cos(pitch);
  const sy = Math.sin(pitch);
  const cw = Math.cos(frame.yaw);
  const sw = Math.sin(frame.yaw);
  const cx = width / 2;
  const mid = height / 2;

  return points.map((p) => {
    // yaw about the vertical axis
    const x1 = p.x * cw + p.z * sw;
    const z1 = -p.x * sw + p.z * cw;
    // pitch about the horizontal axis
    const y2 = p.y * cy - z1 * sy;
    const z2 = p.y * sy + z1 * cy;

    const scale = f / (f - z2 * R);
    const front = z2 > 0;
    const persp = clamp(scale, SIZE_SCALE_MIN, SIZE_SCALE_MAX);
    const size = p.baseSize * persp;
    const half = size / 2;

    // Rim clamp: the silhouette of a full sphere plus a node disc can exceed the
    // map box by a few px at the poles. Pull those beads back inside instead of
    // clipping them, so a bead is never cut off by the viewport edge.
    const rawX = cx + x1 * R * scale;
    const rawY = mid - y2 * R * scale * squash;

    return {
      slug: p.slug,
      x: round(clamp(rawX, half, width - half), 3),
      y: round(clamp(rawY, half, height - half), 3),
      size: round(size, 2),
      z: round(z2, 5),
      depth: round((z2 + 1) / 2, 5),
      zIndex: Math.round((z2 + 1) * 50),
      front,
      opacity: round(front ? 1 : 0.4 + 0.1 * z2, 4),
      blur: front ? 0 : 0.6,
      interactive: front,
      /** How far the rim clamp had to pull this bead back, in px. */
      rimShift: round(
        Math.hypot(
          clamp(rawX, half, width - half) - rawX,
          clamp(rawY, half, height - half) - rawY,
        ),
        3,
      ),
    };
  });
}

/* ------------------------------------------------------------------ *
 * Links
 * ------------------------------------------------------------------ */

export interface AtlasLink {
  key: string;
  a: string;
  b: string;
  /** Order within the whole link set, for the draw delay. */
  index: number;
}

/**
 * Constellation links, chained *within* a chakra band and ordered by longitude
 * so each segment follows the band's arc. The old buildLines joined stones by
 * array index, which on a sphere became a knot with no meaning; this way a
 * rotation shows a whole energy layer lighting up as one shape.
 */
export function buildChakraLinks(points: AtlasPoint[]): AtlasLink[] {
  const byBand = new Map<string, AtlasPoint[]>();
  for (const p of points) {
    const list = byBand.get(p.chakra) ?? [];
    list.push(p);
    byBand.set(p.chakra, list);
  }
  const links: AtlasLink[] = [];
  for (const chakra of CHAKRA_ORDER) {
    const members = (byBand.get(chakra) ?? []).sort(
      (a, b) => a.longitude - b.longitude || byCodeUnit(a.slug, b.slug),
    );
    for (let i = 0; i < members.length - 1; i += 1) {
      const a = members[i];
      const b = members[i + 1];
      if (!a || !b) continue;
      links.push({
        key: `chakra-${a.slug}-${b.slug}`,
        a: a.slug,
        b: b.slug,
        index: links.length,
      });
    }
  }
  return links;
}

/* ------------------------------------------------------------------ *
 * Mobile — same organisation logic, flattened projection
 * ------------------------------------------------------------------ */

export interface MobilePoint {
  slug: string;
  /** Radius as a fraction of the square zone side length. */
  radius: number;
  /** Degrees. */
  angle: number;
  size: number;
  z: number;
  chakra: string;
}

/** Radius of each populated chakra band, for drawing the mobile guide rings. */
export function mobileBandRadii(points: AtlasPoint[]): number[] {
  const centres = new Map<number, number>();
  for (const p of points) {
    const band = mobileRadius(p.latitude);
    if (!centres.has(p.chakraIndex)) centres.set(p.chakraIndex, band);
  }
  return [...centres.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, r]) => r);
}

function mobileRadius(latitude: number) {
  const t = clamp((latitude - LAT_MIN) / (LAT_MAX - LAT_MIN), 0, 1);
  return MOBILE_R_MIN + t * (MOBILE_R_MAX - MOBILE_R_MIN);
}

/**
 * Mobile projection: chakra latitude becomes a concentric ring, longitude
 * becomes the angle on that ring. Same seven bands, same colour sectors — just
 * looked straight down instead of from the side. Collision relaxation stays in
 * the component, where it already lives.
 */
export function computeMobilePoints(points: AtlasPoint[]): MobilePoint[] {
  return points.map((p) => {
    const r = mobileRadius(p.latitude);
    const a = (p.longitude * Math.PI) / 180;
    return {
      slug: p.slug,
      radius: r,
      angle: p.longitude,
      size: p.baseSize * MOBILE_SIZE_FACTOR,
      z: p.z,
      chakra: p.chakra,
    };
  });
}
