import type { Prospect } from "./types"

// What to reveal when enriching. Email and phone can be bought on their own
// (FullEnrich-style waterfall pricing); "full" adds ~30 firmographic points.
export type EnrichScope = "email" | "phone" | "full"

// Credits charged per contact, per scope.
export const ENRICH_COST: Record<EnrichScope, number> = {
  email: 1,
  phone: 2,
  full: 3,
}

// Back-compat default (full enrichment).
export const ENRICH_COST_PER_CONTACT = ENRICH_COST.full

// Enrichment runs in batches — at most this many contacts at a time.
export const MAX_ENRICH_BATCH = 1000

// A contact is considered enriched unless it was explicitly flagged otherwise.
// Seed contacts (enriched === undefined) read as enriched so the demo stays clean;
// freshly sourced contacts are created with enriched === false.
export function isEnriched(prospect: Prospect): boolean {
  return prospect.enriched !== false
}

// Whether a contact still needs the given enrichment scope. Phone is gated on
// the field itself (some enriched contacts still lack a direct dial); email and
// full are gated on the master enrichment flag.
export function needsEnrichScope(prospect: Prospect, scope: EnrichScope): boolean {
  if (scope === "phone") return !prospect.phone
  return !isEnriched(prospect)
}
