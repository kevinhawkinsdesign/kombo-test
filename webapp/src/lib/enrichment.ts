import type { Prospect } from "./types"

// Credits charged per contact when enriching (verified email + direct dial +
// ~30 data points). A contact is only ever charged once.
export const ENRICH_COST_PER_CONTACT = 2

// Enrichment runs in batches — at most this many contacts at a time.
export const MAX_ENRICH_BATCH = 1000

// A contact is considered enriched unless it was explicitly flagged otherwise.
// Seed contacts (enriched === undefined) read as enriched so the demo stays clean;
// freshly sourced contacts are created with enriched === false.
export function isEnriched(prospect: Prospect): boolean {
  return prospect.enriched !== false
}
