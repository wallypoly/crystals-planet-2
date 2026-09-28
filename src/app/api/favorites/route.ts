import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { STONES } from "@/lib/stones-data";

const VALID_SLUGS = new Set(STONES.map((s) => s.slug));

function sanitize(slugs: unknown): string[] {
  if (!Array.isArray(slugs)) return [];
  const seen = new Set<string>();
  for (const raw of slugs) {
    if (typeof raw === "string" && VALID_SLUGS.has(raw)) seen.add(raw);
  }
  return [...seen];
}

/** List every slug in the shared favorites vault (oldest first). */
export async function GET() {
  try {
    const rows = await db.favorite.findMany({
      orderBy: { createdAt: "asc" },
      select: { slug: true },
    });
    return NextResponse.json({ slugs: rows.map((r) => r.slug) });
  } catch (err) {
    console.error("GET /api/favorites failed", err);
    return NextResponse.json({ error: "vault unavailable" }, { status: 500 });
  }
}

/** Add one slug to the vault (idempotent). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const slug = body?.slug;
    if (typeof slug !== "string" || !VALID_SLUGS.has(slug)) {
      return NextResponse.json({ error: "invalid slug" }, { status: 400 });
    }
    await db.favorite.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("POST /api/favorites failed", err);
    return NextResponse.json({ error: "vault unavailable" }, { status: 500 });
  }
}

/** Remove one slug from the vault. */
export async function DELETE(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug || !VALID_SLUGS.has(slug)) {
      return NextResponse.json({ error: "invalid slug" }, { status: 400 });
    }
    await db.favorite.deleteMany({ where: { slug } });
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("DELETE /api/favorites failed", err);
    return NextResponse.json({ error: "vault unavailable" }, { status: 500 });
  }
}

/**
 * Bulk-replace the whole vault (first-load reconciliation: merges the local
 * cache into the server so nothing the visitor saved offline is lost).
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const slugs = sanitize(body?.slugs);
    await db.$transaction([
      db.favorite.deleteMany({
        where: { slug: { notIn: slugs } },
      }),
      ...slugs.map((slug) =>
        db.favorite.upsert({ where: { slug }, update: {}, create: { slug } }),
      ),
    ]);
    return NextResponse.json({ ok: true, slugs });
  } catch (err) {
    console.error("PUT /api/favorites failed", err);
    return NextResponse.json({ error: "vault unavailable" }, { status: 500 });
  }
}
