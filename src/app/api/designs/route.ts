import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { STONES } from "@/lib/stones-data";
import type { Bead } from "@/lib/bracelet";

const VALID_STONES = new Map(
  STONES.map((s) => [s.slug, new Set(s.availableMm)]),
);

const MAX_DESIGNS = 24;
const MAX_NAME_LEN = 24;

interface DesignRow {
  id: string;
  name: string;
  beads: Bead[];
}

/** Validate + normalize one bead pair. Invalid entries are dropped. */
function sanitizeBeads(raw: unknown): Bead[] {
  if (!Array.isArray(raw)) return [];
  const out: Bead[] = [];
  for (const item of raw) {
    let slug: unknown;
    let mm: unknown;
    if (Array.isArray(item) && item.length >= 2) {
      [slug, mm] = item;
    } else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      slug = o.slug;
      mm = o.mm;
    }
    if (typeof slug !== "string") continue;
    const allowed = VALID_STONES.get(slug);
    if (!allowed) continue;
    const size = typeof mm === "number" && allowed.has(mm) ? mm : undefined;
    if (size === undefined) continue;
    out.push({ slug, mm: size, j: 0 });
  }
  return out;
}

function sanitizeName(raw: unknown): string {
  if (typeof raw !== "string") return "Design";
  const trimmed = raw.trim().slice(0, MAX_NAME_LEN);
  return trimmed.length > 0 ? trimmed : "Design";
}

/** List the shared design vault, newest first. */
export async function GET() {
  try {
    const rows = await db.design.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, beadsJson: true },
    });
    const designs: DesignRow[] = [];
    for (const row of rows) {
      let beads: Bead[] = [];
      try {
        beads = sanitizeBeads(JSON.parse(row.beadsJson));
      } catch {
        continue;
      }
      if (beads.length === 0) continue;
      designs.push({ id: row.id, name: row.name, beads });
    }
    return NextResponse.json({ designs });
  } catch (err) {
    console.error("GET /api/designs failed", err);
    return NextResponse.json({ error: "vault unavailable" }, { status: 500 });
  }
}

/** Add one design to the vault (oldest rows are trimmed beyond MAX_DESIGNS). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const beads = sanitizeBeads(body?.beads);
    if (beads.length === 0) {
      return NextResponse.json({ error: "invalid beads" }, { status: 400 });
    }
    const name = sanitizeName(body?.name);
    const created = await db.design.create({
      data: {
        name,
        beadsJson: JSON.stringify(beads.map((b) => [b.slug, b.mm])),
      },
      select: { id: true },
    });
    // Keep the vault bounded — drop the oldest overflow rows.
    const overflow = await db.design.findMany({
      orderBy: { createdAt: "desc" },
      skip: MAX_DESIGNS,
      select: { id: true },
    });
    if (overflow.length > 0) {
      await db.design.deleteMany({
        where: { id: { in: overflow.map((r) => r.id) } },
      });
    }
    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("POST /api/designs failed", err);
    return NextResponse.json({ error: "vault unavailable" }, { status: 500 });
  }
}

/** Remove one design from the vault by id. */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }
    await db.design.deleteMany({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/designs failed", err);
    return NextResponse.json({ error: "vault unavailable" }, { status: 500 });
  }
}
