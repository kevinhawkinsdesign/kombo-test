import type { ConvStatus, ProspectStatus } from "@/lib/types"

// Availability is a single mutually-exclusive choice (mirrors the
// extension's SingleSelect: "only" out-of-office, "exclude" out-of-office,
// or no filter at all) rather than a multi-select set like the others.
export type AvailabilityFilter = "any" | "only" | "exclude"

// The filter dimensions the compact Inbox toolbar dropdown doesn't cover —
// which campaign a prospect is enrolled in, funnel Outcome, pipeline Status,
// out-of-office Availability, and assigned rep. Kept in a plain module (not
// the dialog's own .tsx file) so these helpers don't trip
// react-refresh/only-export-components.
export interface ConversationFilters {
  campaignIds: Set<string>
  outcomes: Set<ConvStatus>
  statuses: Set<ProspectStatus>
  availability: AvailabilityFilter
  assigneeIds: Set<string>
}

export function emptyConversationFilters(): ConversationFilters {
  return {
    campaignIds: new Set(),
    outcomes: new Set(),
    statuses: new Set(),
    availability: "any",
    assigneeIds: new Set(),
  }
}

export function countConversationFilters(filters: ConversationFilters): number {
  return (
    filters.campaignIds.size +
    filters.outcomes.size +
    filters.statuses.size +
    (filters.availability !== "any" ? 1 : 0) +
    filters.assigneeIds.size
  )
}
