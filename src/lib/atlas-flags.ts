// Build-time switches for the crystal atlas.

/**
 * Show unreviewed stone knowledge (intentions, sourced claims) for local
 * preview. Production leaves NEXT_PUBLIC_ATLAS_DRAFT unset, so only entries
 * the owner marked `reviewed: true` reach the page.
 */
export const SHOW_DRAFT_KNOWLEDGE = process.env.NEXT_PUBLIC_ATLAS_DRAFT === "1";
