import * as React from "react"

// Which campaigns the user currently has open as tabs on the campaign-detail
// page — an ephemeral browsing session, not a permanent grouping. Visiting
// any /campaigns/:id registers it here, mirroring how browser tabs
// accumulate as you navigate (same pattern as lib/list-tabs.ts).

const KEY = "kombo_campaign_tabs_v1"

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* ignore malformed storage */
  }
  return []
}

let state: string[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export const campaignTabsStore = {
  open(id: string): void {
    if (state.includes(id)) return
    state = [...state, id]
    emit()
  },
  close(id: string): void {
    if (!state.includes(id)) return
    state = state.filter((x) => x !== id)
    emit()
  },
}

// Reactive read, pruned against the live campaign set so a tab for a
// since-deleted campaign quietly disappears instead of pointing nowhere.
export function useOpenCampaignIds(existingIds: string[]): string[] {
  const raw = React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
  return React.useMemo(
    () => raw.filter((id) => existingIds.includes(id)),
    [raw, existingIds]
  )
}
