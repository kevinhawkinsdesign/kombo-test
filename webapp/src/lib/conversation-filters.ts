import type { ConvStatus } from "@/lib/types"

// The three filter dimensions the compact Inbox toolbar dropdown doesn't
// cover — which campaign a prospect is enrolled in, funnel Outcome, and
// assigned rep. Kept in a plain module (not the dialog's own .tsx file) so
// these helpers don't trip react-refresh/only-export-components.
export interface ConversationFilters {
  campaignIds: Set<string>
  outcomes: Set<ConvStatus>
  assigneeIds: Set<string>
}

export function emptyConversationFilters(): ConversationFilters {
  return { campaignIds: new Set(), outcomes: new Set(), assigneeIds: new Set() }
}

export function countConversationFilters(filters: ConversationFilters): number {
  return filters.campaignIds.size + filters.outcomes.size + filters.assigneeIds.size
}
