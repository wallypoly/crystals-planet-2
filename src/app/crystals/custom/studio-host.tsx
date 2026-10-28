"use client";

import { useRouter } from "next/navigation";
import { BraceletStudio, type StudioSeed } from "@/components/crystal/bracelet-studio";

/**
 * Mounts the existing BraceletStudio overlay as page content.
 *
 * The component itself is untouched: it has no scroll lock, no Escape
 * handler and no portal, so it renders correctly in normal flow once the
 * overlay shell is neutralised in app/inner.css. The only thing that has
 * to live on the client is onClose — a function prop cannot cross the
 * server/client boundary. On a routed page there is no scrim to dismiss,
 * so the control means "back to the atlas".
 */
export function StudioHost({ seed }: { seed: StudioSeed | null }) {
  const router = useRouter();

  return (
    <BraceletStudio
      lang="zh"
      seed={seed}
      onClose={() => router.push("/")}
    />
  );
}
