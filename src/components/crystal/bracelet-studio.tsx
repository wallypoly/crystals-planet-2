"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  X,
  Undo2,
  Trash2,
  Save,
  Share2,
  Play,
  Pause,
  Wand2,
  Copy,
  Check,
  FolderOpen,
  ImageDown,
  Cloud,
  CloudOff,
  Loader2,
  Download,
  Upload,
  Repeat,
} from "lucide-react";
import { STONES, type Stone } from "@/lib/stones-data";
import { t, stoneZh, type Lang } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import {
  type Bead,
  type BraceletDesign,
  WRIST_SIZES_CM,
  PRESETS,
  buildPreset,
  innerLengthCm,
  beadsForWrist,
  totalMm,
  wristFit,
  designToHash,
  loadSavedDesigns,
  persistSavedDesigns,
  compactBeads,
  designSignature,
  serializeDesignsBackup,
  parseDesignsBackup,
} from "@/lib/bracelet";

const MAX_BEADS = 48;
const IMAGE_FACTOR = 1.16; // bead photo circle ≈ 86% of image box

/* ------------------------ PNG export helpers ------------------------ */

const dataUrlCache = new Map<string, string>();

async function toDataUrl(url: string): Promise<string | null> {
  const cached = dataUrlCache.get(url);
  if (cached) return cached;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    dataUrlCache.set(url, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Rasterize the bracelet SVG into a shareable PNG card:
 * dark gradient backdrop + bracelet + title + stats + bead inventory strip
 * + QR share link, downloaded locally.
 */
async function exportBraceletPng(opts: {
  svg: SVGSVGElement | null;
  title: string;
  stats: string;
  subtitle: string;
  shareUrl: string;
  qrCaption: string;
  inventory: { src: string; count: number; color: string }[];
}): Promise<boolean> {
  const { svg, title, stats, subtitle, shareUrl, qrCaption, inventory } = opts;
  if (!svg) return false;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", "1120");
  clone.setAttribute("height", "1120");
  // Inline bead photos so the rasterized SVG carries no external references.
  const images = Array.from(clone.querySelectorAll("image"));
  const datas = await Promise.all(
    images.map((img) => toDataUrl(img.getAttribute("href") ?? "")),
  );
  images.forEach((img, i) => {
    const data = datas[i];
    if (!data) return;
    img.setAttribute("href", data);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", data);
  });
  const xml = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(
    new Blob([xml], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const picture = new Image();
    await new Promise<void>((resolve, reject) => {
      picture.onload = () => resolve();
      picture.onerror = () => reject(new Error("svg load failed"));
      picture.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1490;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // Backdrop
    const bg = ctx.createRadialGradient(600, 540, 90, 600, 560, 940);
    bg.addColorStop(0, "#ffffff");
    bg.addColorStop(0.6, "#fbfbfa");
    bg.addColorStop(1, "#f2f4f8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 1490);

    // Bracelet
    ctx.drawImage(picture, 40, 40, 1120, 1120);

    // Footer text block
    ctx.textAlign = "center";
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
      "6px";
    ctx.fillStyle = "#1e3a5f";
    ctx.font = "500 22px Manrope, sans-serif";
    ctx.fillText(subtitle.toUpperCase(), 600, 1224);
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
      "0px";
    ctx.fillStyle = "#14243b";
    ctx.font = "600 44px " + '"Cormorant Garamond", serif';
    ctx.fillText(title, 600, 1288);
    ctx.fillStyle = "rgba(30, 58, 95, 0.65)";
    ctx.font = "400 24px Manrope, sans-serif";
    ctx.fillText(stats, 600, 1340);

    // Thin navy divider above the footer block
    ctx.fillStyle = "rgba(30, 58, 95, 0.12)";
    ctx.fillRect(430, 1188, 340, 1);

    // QR code of the share link, bottom-right corner
    if (shareUrl) {
      try {
        const qrData = await QRCode.toDataURL(shareUrl, {
          margin: 0,
          width: 232,
          color: { dark: "#14243b", light: "#ffffff" },
        });
        const qr = new Image();
        await new Promise<void>((resolve, reject) => {
          qr.onload = () => resolve();
          qr.onerror = () => reject(new Error("qr load failed"));
          qr.src = qrData;
        });
        const qs = 116; // QR box size on the card
        const qx = 1200 - 56 - qs;
        const qy = 1246;
        // White rounded backing so the code scans cleanly
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(qx - 12, qy - 12, qs + 24, qs + 24, 16);
        } else {
          ctx.rect(qx - 12, qy - 12, qs + 24, qs + 24);
        }
        ctx.shadowColor = "rgba(30, 58, 95, 0.08)";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.restore();
        ctx.drawImage(qr, qx, qy, qs, qs);
        ctx.textAlign = "center";
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
          "3px";
        ctx.fillStyle = "rgba(30, 58, 95, 0.65)";
        ctx.font = "500 15px Manrope, sans-serif";
        ctx.fillText(qrCaption.toUpperCase(), qx + qs / 2, qy + qs + 38);
      } catch {
        /* QR is optional decoration — never block the export */
      }
    }

    // Bead inventory strip: one thumbnail per stone used, with count badge
    if (inventory.length > 0) {
      try {
        const size = 30;
        const gap = 40;
        const total = inventory.length * size + (inventory.length - 1) * (gap - size);
        let ix = 600 - total / 2 + size / 2;
        const iy = 1408;
        for (const item of inventory) {
          const data = await toDataUrl(item.src);
          if (!data) {
            ix += gap;
            continue;
          }
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = data;
          });
          // circular crop
          ctx.save();
          ctx.beginPath();
          ctx.arc(ix, iy, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, ix - size / 2, iy - size / 2, size, size);
          ctx.restore();
          // gold ring
          ctx.beginPath();
          ctx.arc(ix, iy, size / 2, 0, Math.PI * 2);
          ctx.strokeStyle = item.color;
          ctx.globalAlpha = 0.65;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
          // count badge
          ctx.beginPath();
          ctx.arc(ix + size / 2 - 2, iy - size / 2 + 2, 9, 0, Math.PI * 2);
          ctx.fillStyle = "#14243b";
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "600 12px Manrope, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(item.count), ix + size / 2 - 2, iy - size / 2 + 3);
          ctx.textBaseline = "alphabetic";
          ix += gap;
        }
      } catch {
        /* inventory strip is optional decoration */
      }
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moonarq-bracelet-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch {
    return false;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export interface StudioSeed {
  beads: Bead[];
  name?: string;
  ts: number;
}

/** Validate server-vault bead pairs against the stone data (client side).
 *  Accepts both compact [slug, mm] arrays and {slug, mm} objects — the API
 *  returns parsed Bead objects, but the wire form stays tolerant. */
function sanitizeServerBeads(raw: unknown): Bead[] {
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
    const stone = STONES.find((s) => s.slug === slug);
    if (!stone) continue;
    if (typeof mm !== "number" || !stone.availableMm.includes(mm)) continue;
    out.push({ slug, mm, j: 0 });
  }
  return out;
}

export function BraceletStudio({
  lang,
  seed,
  onClose,
}: {
  lang: Lang;
  seed: StudioSeed | null;
  onClose: () => void;
}) {
  const dict = t(lang);
  const { toast } = useToast();
  const [beads, setBeads] = useState<Bead[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wristCm, setWristCm] = useState(16);
  const [sizeChoice, setSizeChoice] = useState<Record<string, number>>({});
  const [designName, setDesignName] = useState("");
  const [saved, setSaved] = useState<BraceletDesign[]>([]);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [vault, setVault] = useState<"local" | "syncing" | "synced">("local");
  const [accentSlug, setAccentSlug] = useState("");
  const [accentInterval, setAccentInterval] = useState(4);
  const seededRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  /* Load saved designs once, then reconcile with the cloud vault */
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      const local = loadSavedDesigns();
      setSaved(local);
      void (async () => {
        try {
          setVault("syncing");
          const res = await fetch("/api/designs");
          if (!res.ok) throw new Error(String(res.status));
          const data = (await res.json()) as { designs?: unknown };
          const rows = Array.isArray(data.designs) ? data.designs : [];
          const server: BraceletDesign[] = [];
          for (const row of rows) {
            if (!row || typeof row !== "object") continue;
            const r = row as { id?: unknown; name?: unknown; beads?: unknown };
            if (typeof r.id !== "string") continue;
            const serverBeads = sanitizeServerBeads(r.beads);
            if (serverBeads.length === 0) continue;
            server.push({
              id: r.id,
              name:
                typeof r.name === "string" && r.name.trim()
                  ? r.name
                  : "Design",
              beads: serverBeads,
            });
          }
          // Union: local copies first (what the visitor last saw), then
          // server-only rows, de-duplicated by content signature.
          const seen = new Set<string>();
          const merged: BraceletDesign[] = [];
          for (const d of [...local, ...server]) {
            const sig = designSignature(d);
            if (seen.has(sig)) continue;
            seen.add(sig);
            merged.push(d);
          }
          if (cancelled) return;
          const localSigs = local.map(designSignature).join("||");
          const mergedSigs = merged.map(designSignature).join("||");
          if (mergedSigs !== localSigs) {
            setSaved(merged);
            persistSavedDesigns(merged);
          }
          // Push local-only designs into the vault (fire-and-forget).
          const localOnly = merged.filter((d) => d.id === undefined);
          for (const d of localOnly) {
            void fetch("/api/designs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: d.name, beads: compactBeads(d.beads) }),
            }).catch(() => setVault("local"));
          }
          setVault("synced");
        } catch {
          if (!cancelled) setVault("local");
        }
      })();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Seed beads (when opened from a stone CTA or shared link) */
  useEffect(() => {
    if (!seed || seededRef.current === seed.ts) return;
    seededRef.current = seed.ts;
    queueMicrotask(() => {
      setBeads(seed.beads);
      if (seed.name) setDesignName(seed.name);
    });
  }, [seed]);

  /* Persist saved designs */
  const persist = (next: BraceletDesign[]) => {
    setSaved(next);
    persistSavedDesigns(next);
  };

  /* --------------------------- size bookkeeping --------------------------- */

  const sizeFor = (stone: Stone) =>
    sizeChoice[stone.slug] ??
    (stone.availableMm.includes(8) ? 8 : stone.availableMm[0]);

  const countsBySlug = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of beads) m.set(b.slug, (m.get(b.slug) ?? 0) + 1);
    return m;
  }, [beads]);

  /* ------------------------------- geometry ------------------------------- */

  const sumMm = totalMm(beads);
  const scale = beads.length
    ? Math.max(1.5, Math.min(4.1, (2 * Math.PI * 218) / sumMm))
    : 4.1;
  const stringR = sumMm ? sumMm * scale / (2 * Math.PI) : 0;
  const maxBeadPx = beads.length
    ? Math.max(...beads.map((b) => b.mm * scale))
    : 0;

  const clipSizes = useMemo(
    () => Array.from(new Set(beads.map((b) => b.mm))),
    [beads],
  );

  const placed = useMemo(() => {
    const cx = 280;
    const cy = 280;
    return beads.map((b, i) => {
      const angle = (i / beads.length) * Math.PI * 2 - Math.PI / 2;
      const r = stringR + (b.j - 3) * 0.6;
      const px = b.mm * scale;
      return {
        bead: b,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        px,
        index: i,
      };
    });
  }, [beads, stringR, scale]);

  /* -------------------------------- actions ------------------------------- */

  const addBead = (slug: string, mm: number) => {
    setBeads((prev) =>
      prev.length >= MAX_BEADS
        ? prev
        : [...prev, { slug, mm, j: Math.floor(Math.random() * 7) }],
    );
  };

  const removeAt = (index: number) =>
    setBeads((prev) => prev.filter((_, i) => i !== index));

  const undo = () => setBeads((prev) => prev.slice(0, -1));

  const autoFit = () => {
    setBeads((prev) => {
      const target = beadsForWrist(8, wristCm) * 8; // wrist circumference in mm
      if (prev.length === 0) {
        // Fill with an alternating starter pair in 8 mm.
        const pair = ["clear-quartz", "rose-quartz"];
        const n = beadsForWrist(8, wristCm);
        return Array.from({ length: Math.min(n, MAX_BEADS) }, (_, i) => ({
          slug: pair[i % 2],
          mm: 8,
          j: Math.floor(Math.random() * 7),
        }));
      }
      // Repeat the most common bead until reaching the wrist length.
      const mode = prev.reduce((acc, b) => {
        const key = `${b.slug}|${b.mm}`;
        const cur = acc.get(key);
        if (cur) {
          cur.n += 1;
        } else {
          acc.set(key, { slug: b.slug, mm: b.mm, n: 1 });
        }
        return acc;
      }, new Map<string, { slug: string; mm: number; n: number }>());
      let best = { slug: prev[0].slug, mm: prev[0].mm, n: 0 };
      mode.forEach((v) => {
        if (v.n > best.n) best = v as typeof best;
      });
      const next = [...prev];
      let guard = 0;
      while (totalMm(next) < target && next.length < MAX_BEADS && guard < 80) {
        next.push({ slug: best.slug, mm: best.mm, j: Math.floor(Math.random() * 7) });
        guard++;
      }
      return next;
    });
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (preset) setBeads(buildPreset(preset));
  };

  /**
   * Mixed-strand accent pattern (idea borrowed from the crystal-planet
   * reference's mixed-stone bracelets): keep the current bead sizes, but
   * swap every Nth bead to the chosen accent stone so the strand picks up
   * a regular rhythm without manual per-bead edits.
   */
  const applyAccentPattern = () => {
    if (!accentSlug || beads.length === 0) return;
    const n = Math.max(2, accentInterval);
    setBeads((prev) =>
      prev.map((b, i) =>
        i % n === 0 ? { ...b, slug: accentSlug, j: Math.floor(Math.random() * 7) } : b,
      ),
    );
    toast({ title: dict.accentApplied(n), className: "atlas-toast" });
  };

  const saveDesign = () => {
    if (beads.length === 0) return;
    const name = designName.trim() || `Design ${saved.length + 1}`;
    const design: BraceletDesign = { name, beads };
    persist([design, ...saved].slice(0, 24));
    // Mirror into the cloud vault (fire-and-forget); adopt the server id.
    const sig = designSignature(design);
    void fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, beads: compactBeads(beads) }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { id?: string } | null) => {
        if (!data?.id) return;
        setSaved((prev) => {
          const next = prev.map((d) =>
            !d.id && designSignature(d) === sig ? { ...d, id: data.id } : d,
          );
          persistSavedDesigns(next);
          return next;
        });
      })
      .catch(() => setVault("local"));
    toast({ title: dict.toastSave(name), className: "atlas-toast" });
    setDesignName("");
  };

  /** Remove a saved design locally + from the cloud vault when synced */
  const removeDesign = (index: number) => {
    const target = saved[index];
    persist(saved.filter((_, di) => di !== index));
    if (target?.id) {
      void fetch(`/api/designs?id=${encodeURIComponent(target.id)}`, {
        method: "DELETE",
      }).catch(() => setVault("local"));
    }
  };

  /** Download every saved design as a portable JSON backup file */
  const exportBackup = () => {
    if (saved.length === 0) return;
    const blob = new Blob([serializeDesignsBackup(saved)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url;
    a.download = `moonarq-bracelet-designs-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast({ title: dict.bkExported, className: "atlas-toast" });
  };

  /** Merge an imported JSON backup into the saved list (signature de-dupe) */
  const importBackupFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const incoming = parseDesignsBackup(String(reader.result ?? ""));
      if (incoming.length === 0) {
        toast({ title: dict.bkInvalid, className: "atlas-toast" });
        return;
      }
      const seen = new Set(saved.map(designSignature));
      const fresh: BraceletDesign[] = [];
      let skipped = 0;
      for (const d of incoming) {
        const sig = designSignature(d);
        if (seen.has(sig)) {
          skipped += 1;
          continue;
        }
        seen.add(sig);
        fresh.push(d);
      }
      if (fresh.length > 0) {
        const room = 24 - saved.length;
        const admitted = fresh.slice(0, Math.max(0, room));
        persist([...admitted, ...saved].slice(0, 24));
        // Mirror the admitted designs into the cloud vault (fire-and-forget).
        for (const d of admitted) {
          void fetch("/api/designs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: d.name, beads: compactBeads(d.beads) }),
          }).catch(() => setVault("local"));
        }
        toast({
          title: dict.bkImported(admitted.length, skipped + fresh.length - admitted.length),
          className: "atlas-toast",
        });
      } else {
        toast({ title: dict.bkImported(0, skipped), className: "atlas-toast" });
      }
    };
    reader.readAsText(file);
  };

  const shareDesign = async (design?: BraceletDesign) => {
    const useBeads = design ? design.beads : beads;
    if (useBeads.length === 0) return;
    const url = `${window.location.origin}${window.location.pathname}${designToHash(useBeads, design?.name)}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      /* clipboard unavailable */
    }
    if (ok) toast({ title: dict.toastCopy, className: "atlas-toast" });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const lengthCm = innerLengthCm(beads);
  const fitPct = Math.min(100, Math.round((lengthCm / wristCm) * 100));
  const fit = wristFit(lengthCm, wristCm);
  const fitLabel =
    fit === "snug" ? dict.fitSnug : fit === "relaxed" ? dict.fitRelaxed : dict.fitClassic;
  const fitAdvice =
    fit === "snug"
      ? dict.fitSnugAdvice
      : fit === "relaxed"
        ? dict.fitRelaxedAdvice
        : dict.fitClassicAdvice;

  const handleExport = async () => {
    if (beads.length === 0 || exporting) return;
    setExporting(true);
    const shareUrl = `${window.location.origin}${window.location.pathname}${designToHash(beads, designName.trim() || undefined)}`;
    const inventory = Array.from(countsBySlug.entries()).map(([slug, count]) => {
      const stone = STONES.find((s) => s.slug === slug);
      return {
        src: stone?.imagePath ?? "",
        count,
        color: stone?.palette[1] ?? "#1e3a5f",
      };
    });
    const ok = await exportBraceletPng({
      svg: svgRef.current,
      title: designName.trim() || dict.studioTitle,
      stats: `${dict.beadCount(beads.length)} · ${dict.statsLength} ${lengthCm.toFixed(1)} cm · ${dict.wristSize} ${wristCm} cm`,
      subtitle: dict.studioKicker,
      shareUrl,
      qrCaption: dict.qrCaption,
      inventory,
    });
    setExporting(false);
    if (ok) {
      setExported(true);
      toast({ title: dict.toastExport, className: "atlas-toast" });
      window.setTimeout(() => setExported(false), 1800);
    }
  };

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="br-studio-overlay" role="presentation">
      <div
        className="br-studio"
        role="dialog"
        aria-modal="true"
        aria-label={dict.studioTitle}
      >
        {/* Header */}
        <header className="br-studio__header">
          <div>
            <p className="atlas-panel-kicker">{dict.studioKicker}</p>
            <h2 className="br-studio__title">{dict.studioTitle}</h2>
          </div>
          <button
            type="button"
            className="atlas-round-btn"
            aria-label={dict.closeStudio}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="br-studio__body">
          {/* Canvas */}
          <section className="br-studio__canvas-wrap" aria-label={dict.studioTitle}>
            <div className="br-studio__canvas">
              <svg ref={svgRef} viewBox="0 0 560 560" className="br-canvas-svg" aria-hidden="true">
                <defs>
                  {clipSizes.map((mm) => (
                    <clipPath id={`bc-${mm}`} key={mm}>
                      <circle cx="0" cy="0" r={(mm * scale) / 2} />
                    </clipPath>
                  ))}
                  <radialGradient id="br-shine" cx="0.36" cy="0.3" r="0.75">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
                  </radialGradient>
                </defs>

                {/* cord */}
                <circle
                  cx="280"
                  cy="280"
                  r={Math.max(stringR, 1)}
                  fill="none"
                  stroke="rgba(30,58,95,0.22)"
                  strokeWidth="2"
                  strokeDasharray="1 7"
                  strokeLinecap="round"
                />

                <g
                  className={`br-spin-group ${spinning ? "is-spinning" : ""}`}
                  style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "280px 280px" }}
                >
                  {placed.map(({ bead, x, y, px, index }) => {
                    const stone = STONES.find((s) => s.slug === bead.slug)!;
                    const img = px * IMAGE_FACTOR;
                    return (
                      <g
                        key={`${index}-${bead.slug}`}
                        transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}
                      >
                        <g
                          className="br-bead"
                          onClick={() => removeAt(index)}
                          data-mm={bead.mm}
                        >
                          <title>{`${stoneLabel(stone.slug, lang)} · ${bead.mm}mm`}</title>
                          <circle r={px / 2} fill="#f4f6fa" />
                          <image
                            href={stone.imagePath}
                            x={-img / 2}
                            y={-img / 2}
                            width={img}
                            height={img}
                            clipPath={`url(#bc-${bead.mm})`}
                            preserveAspectRatio="xMidYMid slice"
                          />
                          <circle r={px / 2} fill="url(#br-shine)" pointerEvents="none" />
                          <circle
                            r={px / 2}
                            fill="none"
                            stroke={stone.palette[1]}
                            strokeOpacity="0.4"
                            strokeWidth="1"
                            pointerEvents="none"
                          />
                        </g>
                      </g>
                    );
                  })}
                </g>

                {/* empty state ring */}
                {beads.length === 0 && (
                  <g className="br-empty-ring">
                    <circle cx="280" cy="280" r="120" fill="none" stroke="rgba(30,58,95,0.12)" strokeWidth="1" strokeDasharray="3 9" />
                    <circle cx="280" cy="280" r="120" fill="none" stroke="rgba(30,58,95,0.04)" strokeWidth="26" />
                  </g>
                )}
              </svg>

              {beads.length === 0 && (
                <p className="br-studio__empty-note">{dict.emptyBracelet}</p>
              )}

              <div className="br-studio__canvas-tools">
                <button
                  type="button"
                  className={`br-tool ${spinning ? "is-active" : ""}`}
                  aria-pressed={spinning}
                  aria-label={dict.spin}
                  onClick={() => setSpinning((v) => !v)}
                >
                  {spinning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{dict.spin}</span>
                </button>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={Math.round(rotation) % 360}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  aria-label={dict.rotate}
                  className="br-rotate"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="br-studio__stats">
              <div className="br-stat">
                <span className="br-stat__num">{beads.length}</span>
                <span className="br-stat__label">{dict.statsBeads}</span>
              </div>
              <div className="br-stat br-stat--wide">
                <span className="br-stat__num">
                  {lengthCm.toFixed(1)}
                  <small>cm</small>
                </span>
                <span className="br-stat__label">{dict.statsLength}</span>
                {beads.length > 0 && (
                  <span
                    className={`br-fit is-${fit}`}
                    role="status"
                    aria-label={dict.fitAria(fitLabel)}
                    title={fitAdvice}
                  >
                    {fitLabel}
                  </span>
                )}
                <span className="br-stat__bar" aria-hidden="true">
                  <span style={{ width: `${fitPct}%` }} />
                </span>
                <span className="br-stat__target">{wristCm} cm</span>
                {beads.length > 0 && (
                  <span className="br-stat__advice">{fitAdvice}</span>
                )}
              </div>
            </div>
          </section>

          {/* Right column */}
          <section className="br-studio__side">
            {/* Presets */}
            <div className="br-block">
              <h3 className="atlas-section-label">{dict.presets}</h3>
              <div className="br-presets">
                {PRESETS.map((p, i) => (
                  <button
                    key={p.key}
                    type="button"
                    className="br-preset"
                    onClick={() => applyPreset(p.key)}
                  >
                    <Wand2 className="h-3 w-3" />
                    {dict.presetNames[i] ?? p.key}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent pattern (mixed-stone strand builder) */}
            <div className="br-block" aria-label={dict.accentAria}>
              <h3 className="atlas-section-label">
                {dict.accentTitle}
                <span className="br-block__hint">{dict.accentHint}</span>
              </h3>
              <div className="br-accent">
                <select
                  className="br-accent__select"
                  value={accentSlug}
                  onChange={(e) => setAccentSlug(e.target.value)}
                  aria-label={dict.accentStone}
                >
                  <option value="">{dict.accentNone}</option>
                  {STONES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {stoneLabel(s.slug, lang)}
                    </option>
                  ))}
                </select>
                <div className="br-accent__steps" role="group" aria-label={dict.accentInterval}>
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`br-accent__step ${accentInterval === n ? "is-active" : ""}`}
                      aria-pressed={accentInterval === n}
                      onClick={() => setAccentInterval(n)}
                    >
                      ×{n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="br-tool"
                  onClick={applyAccentPattern}
                  disabled={!accentSlug || beads.length === 0}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  <span>{dict.accentApply}</span>
                </button>
              </div>
            </div>

            {/* Tray */}
            <div className="br-block">
              <h3 className="atlas-section-label">
                {dict.tray}
                <span className="br-block__hint">{dict.studioHint}</span>
              </h3>
              <div className="br-tray">
                {STONES.map((stone) => {
                  const count = countsBySlug.get(stone.slug) ?? 0;
                  const mm = sizeFor(stone);
                  return (
                    <div key={stone.slug} className="br-tray__item">
                      <button
                        type="button"
                        className="br-tray__chip"
                        onClick={() => addBead(stone.slug, mm)}
                        aria-label={dict.addBead(stoneLabel(stone.slug, lang))}
                      >
                        <span className="br-tray__img-wrap" style={{ boxShadow: `0 0 10px ${stone.palette[1]}44` }}>
                          <img src={stone.imagePath} alt="" width={72} height={72} loading="lazy" draggable={false} />
                          {count > 0 && <span className="br-tray__count">{count}</span>}
                        </span>
                        <span className="br-tray__name">{stoneLabel(stone.slug, lang)}</span>
                      </button>
                      <div className="br-tray__sizes" role="group" aria-label={dict.beadSize}>
                        {stone.availableMm.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`br-tray__mm ${s === mm ? "is-active" : ""}`}
                            aria-pressed={s === mm}
                            onClick={() =>
                              setSizeChoice((prev) => ({ ...prev, [stone.slug]: s }))
                            }
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wrist + actions */}
            <div className="br-block">
              <h3 className="atlas-section-label">{dict.wristSize}</h3>
              <div className="br-wrist-row">
                <div className="br-wrist-sizes" role="group" aria-label={dict.wristSize}>
                  {WRIST_SIZES_CM.map((cm) => (
                    <button
                      key={cm}
                      type="button"
                      className={`br-tray__mm ${cm === wristCm ? "is-active" : ""}`}
                      aria-pressed={cm === wristCm}
                      onClick={() => setWristCm(cm)}
                    >
                      {cm}
                    </button>
                  ))}
                </div>
                <button type="button" className="br-tool" onClick={autoFit}>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>{dict.autoFit}</span>
                </button>
              </div>

              <div className="br-actions">
                <button
                  type="button"
                  className="br-tool"
                  onClick={undo}
                  disabled={beads.length === 0}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  <span>{dict.undo}</span>
                </button>
                <button
                  type="button"
                  className="br-tool"
                  onClick={() => setBeads([])}
                  disabled={beads.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{dict.clearAll}</span>
                </button>
                <button
                  type="button"
                  className="br-tool"
                  onClick={() => shareDesign()}
                  disabled={beads.length === 0}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copied ? dict.copied : dict.share}</span>
                </button>
                <button
                  type="button"
                  className="br-tool"
                  onClick={handleExport}
                  disabled={beads.length === 0 || exporting}
                  title={dict.exportHint}
                >
                  {exported ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <ImageDown className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {exporting ? "…" : exported ? dict.exported : dict.exportPng}
                  </span>
                </button>
              </div>

              <div className="br-save-row">
                <input
                  type="text"
                  className="br-name-input"
                  value={designName}
                  maxLength={24}
                  placeholder={dict.designName}
                  aria-label={dict.designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveDesign();
                  }}
                />
                <button
                  type="button"
                  className="br-tool br-tool--accent"
                  onClick={saveDesign}
                  disabled={beads.length === 0}
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{dict.saveDesign}</span>
                </button>
              </div>
            </div>

            {/* Saved designs */}
            <div className="br-block">
              <h3 className="atlas-section-label">
                {dict.savedDesigns}
                <span
                  className={`atlas-vault atlas-vault--inline is-${vault}`}
                  role="status"
                  aria-label={dict.vaultStatusAria}
                >
                  {vault === "synced" && (
                    <Cloud className="h-3 w-3" aria-hidden="true" />
                  )}
                  {vault === "syncing" && (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  )}
                  {vault === "local" && (
                    <CloudOff className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>
                    {vault === "synced"
                      ? dict.vaultSynced
                      : vault === "syncing"
                        ? dict.vaultSyncing
                        : dict.vaultLocal}
                  </span>
                </span>
                <span className="br-backup" role="group" aria-label={`${dict.bkExport} / ${dict.bkImport}`}>
                  <button
                    type="button"
                    className="br-backup__btn"
                    onClick={exportBackup}
                    disabled={saved.length === 0}
                    aria-label={dict.bkExportAria}
                    title={dict.bkExportAria}
                  >
                    <Download className="h-3 w-3" aria-hidden="true" />
                    <span>{dict.bkExport}</span>
                  </button>
                  <button
                    type="button"
                    className="br-backup__btn"
                    onClick={() => importFileRef.current?.click()}
                    aria-label={dict.bkImportAria}
                    title={dict.bkImportAria}
                  >
                    <Upload className="h-3 w-3" aria-hidden="true" />
                    <span>{dict.bkImport}</span>
                  </button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) importBackupFile(f);
                      e.target.value = "";
                    }}
                  />
                </span>
              </h3>
              {saved.length === 0 ? (
                <p className="br-saved-empty">—</p>
              ) : (
                <ul className="br-saved">
                  {saved.map((d, i) => (
                    <li key={`${d.name}-${i}`} className="br-saved__item">
                      <span className="br-saved__preview" aria-hidden="true">
                        {d.beads.slice(0, 6).map((b, bi) => {
                          const s = STONES.find((x) => x.slug === b.slug);
                          return (
                            <span
                              key={bi}
                              style={{
                                background: s?.palette[1] ?? "#888",
                                width: 6 + (b.mm / 14) * 8,
                                height: 6 + (b.mm / 14) * 8,
                              }}
                            />
                          );
                        })}
                      </span>
                      <span className="br-saved__name">{d.name}</span>
                      <span className="br-saved__meta">{dict.beadCount(d.beads.length)}</span>
                      <span className="br-saved__actions">
                        <button
                          type="button"
                          className="br-saved__btn"
                          onClick={() => {
                            setBeads(d.beads.map((b) => ({ ...b })));
                            setDesignName(d.name);
                          }}
                          aria-label={`${dict.load} ${d.name}`}
                        >
                          <FolderOpen className="h-3 w-3" />
                          {dict.load}
                        </button>
                        <button
                          type="button"
                          className="br-saved__btn"
                          onClick={() => shareDesign(d)}
                          aria-label={`${dict.share} ${d.name}`}
                        >
                          <Copy className="h-3 w-3" />
                          {dict.share}
                        </button>
                        <button
                          type="button"
                          className="br-saved__btn br-saved__btn--danger"
                          onClick={() => removeDesign(i)}
                          aria-label={`${dict.remove} ${d.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* Localized stone label helper */
function stoneLabel(slug: string, lang: Lang): string {
  const en = STONES.find((s) => s.slug === slug)?.displayName ?? slug;
  if (lang !== "zh") return en;
  return stoneZh(slug)?.name ?? en;
}
