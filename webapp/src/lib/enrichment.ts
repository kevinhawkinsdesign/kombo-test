import type { Account, Prospect } from "./types"


// What to reveal when enriching. "email" reveals only the verified email and
// "phone" only the direct dial — either can be bought a la carte. "profile"
// is a superset, not a third parallel option: it reveals the ~30
// firmographic/scoring data points AND already includes a verified email +
// direct dial at no extra charge. Picking "profile" in the enrich dialog
// therefore subsumes (and locks) the other two rather than stacking their
// charges on top of its own — see EnrichListDialog.tsx.
export type EnrichScope = "email" | "phone" | "profile"

// Credits charged per contact, per scope.
export const ENRICH_COST: Record<EnrichScope, number> = {
  email: 1,
  phone: 2,
  profile: 3,
}

// Back-compat default (profile enrichment — the richest single scope).
export const ENRICH_COST_PER_CONTACT = ENRICH_COST.profile

// Credits to save a record to a list. A saved search itself is free; saving
// prospects costs per contact, saving companies is free. Enrichment is charged
// separately, afterwards, by scope (ENRICH_COST above).
export const SAVE_COST = { prospect: 2, company: 0 } as const

// Enrichment runs in batches — at most this many contacts at a time.
export const MAX_ENRICH_BATCH = 1000

// A contact is considered enriched unless it was explicitly flagged otherwise.
// Seed contacts (enriched === undefined) read as enriched so the demo stays clean;
// freshly sourced contacts are created with enriched === false.
export function isEnriched(prospect: Prospect): boolean {
  return prospect.enriched !== false
}

// Whether a contact still needs *any* reveal. False means fully enriched —
// email, direct dial, and the ~30 data points are all present — so enrich
// actions for this contact are a no-op and should be disabled.
export function needsAnyEnrichScope(prospect: Prospect): boolean {
  const scopes: EnrichScope[] = ["email", "phone", "profile"]
  return scopes.some((s) => needsEnrichScope(prospect, s))
}

// Company enrichment is a single flat action, not a scope picker like
// prospects — it pulls whatever is available (contact info, recent
// investment/hiring activity, etc.) in one pass.
export const COMPANY_ENRICH_COST = 2

export function isCompanyEnriched(account: Account): boolean {
  return account.enriched !== false
}

// Whether a contact still needs the given enrichment scope. Email and phone are
// gated on the field itself (so buying one clears it), while "profile" is gated
// on the master enrichment flag that tracks the ~30 data points.
export function needsEnrichScope(prospect: Prospect, scope: EnrichScope): boolean {
  if (scope === "email") return !prospect.email
  if (scope === "phone") return !prospect.phone
  return !isEnriched(prospect)
}
