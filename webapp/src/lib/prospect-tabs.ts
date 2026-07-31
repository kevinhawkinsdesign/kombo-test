import * as React from "react"

// Which prospects the user currently has open as tabs on the prospect
// profile page — an ephemeral browsing session, not a permanent grouping.
// Visiting any /prospects/:id (or wherever the profile route lives)
// registers it here, mirroring how browser tabs accumulate as you navigate
// (same pattern as lib/list-tabs.ts).

const KEY = "kombo_prospect_tabs_v1"

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

export const prospectTabsStore = {
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

// Reactive read, pruned against the live prospect set so a tab for a
// since-deleted prospect quietly disappears instead of pointing nowhere.
export function useOpenProspectIds(existingIds: string[]): string[] {
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
