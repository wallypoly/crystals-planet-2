"use client";

import { useEffect, useRef, useState } from "react";
import "@/app/frame.css";

type CursorState = "idle" | "node" | "drag" | "grab";

/**
 * Opt-in contract for anything outside the atlas that wants a
 * custom cursor state. Purely additive — elements that carry none
 * of these attributes simply get the idle ring.
 *
 *   data-cursor="node"  + data-cursor-label="草莓晶"  -> node state
 *   data-cursor="drag"                                  -> drag state
 *
 * The atlas nodes and the atlas map already match through
 * .crystal-atlas-node / .crystal-atlas-map below, so nothing has
 * to change for them.
 */
function readState(target: EventTarget | null): {
  state: CursorState;
  label: string;
} {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== "function") {
    return { state: "idle", label: "" };
  }

  const explicit = el.closest<HTMLElement>("[data-cursor]");
  if (explicit) {
    const mode = explicit.getAttribute("data-cursor");
    if (mode === "node") {
      return {
        state: "node",
        label: explicit.getAttribute("data-cursor-label") ?? "",
      };
    }
    if (mode === "drag") {
      return { state: "drag", label: "" };
    }
  }

  // Crystal node: the label already lives in the node's own copy.
  const node = el.closest<HTMLElement>(".crystal-atlas-node");
  if (node) {
    const name =
      node.querySelector<HTMLElement>(".crystal-atlas-node-copy strong")
        ?.textContent ?? "";
    return { state: "node", label: name.trim() };
  }

  // Draggable globe: the map surface is the drag handle.
  if (el.closest(".crystal-atlas-map")) {
    return { state: "drag", label: "" };
  }

  return { state: "idle", label: "" };
}

/**
 * Custom pointer: a thin ring that opens over a crystal, becomes a
 * turning arc over the draggable globe, and collapses to a solid
 * dot while grabbing.
 *
 * Two deliberate constraints:
 *
 * 1. Fine pointers only. The component returns null unless
 *    matchMedia("(pointer: fine)") matches, so touch devices keep
 *    the system cursor and never get a ghost pointer. The CSS that
 *    hides the native cursor is scoped to the same media query and
 *    is additionally gated on [data-atlas-cursor="on"], which is
 *    only set while this layer is mounted.
 *
 * 2. No React state on pointermove. Position is written straight
 *    to the layer's transform inside a requestAnimationFrame tick,
 *    and state changes only flip a data-state attribute. A
 *    re-render per mousemove is what makes custom cursors stutter.
 */
export function AtlasCursor() {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const layer = layerRef.current;
    if (!layer) return;

    // Only now is it safe to suppress the native cursor.
    document.documentElement.setAttribute("data-atlas-cursor", "on");

    const labelEl = layer.querySelector<HTMLElement>(
      ".atlas-cursor__label",
    );

    let x = -100;
    let y = -100;
    let queued = false;
    let current: CursorState = "idle";
    let currentLabel = "";
    let pressed = false;

    const paint = () => {
      queued = false;
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }

      const next = readState(e.target);
      const state: CursorState = pressed
        ? "grab"
        : next.state === "node"
          ? "node"
          : next.state;

      if (state !== current) {
        current = state;
        layer.dataset.state = state;
      }
      if (next.label !== currentLabel) {
        currentLabel = next.label;
        if (labelEl) labelEl.textContent = next.label;
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const next = readState(e.target);
      if (next.state !== "drag") return;
      pressed = true;
      current = "grab";
      layer.dataset.state = "grab";
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !pressed) return;
      pressed = false;
      // Re-read: the pointer may now sit over a different target.
      onMove(e);
      if (current === "grab") {
        current = readState(e.target).state;
        layer.dataset.state = current;
      }
    };

    const onLeave = () => {
      pressed = false;
      current = "idle";
      layer.dataset.state = "idle";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeAttribute("data-atlas-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={layerRef} className="atlas-cursor" data-state="idle" aria-hidden="true">
      <span className="atlas-cursor__ring" />
      <span className="atlas-cursor__dot" />
      <span className="atlas-cursor__label" />
    </div>
  );
}
