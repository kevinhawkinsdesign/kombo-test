import * as React from "react"

// Which lists the user currently has open as tabs on the list-detail page —
// an ephemeral browsing session, not a permanent grouping (that's what
// Workspaces are for). Visiting any /lists/:id registers it here, mirroring
// how browser tabs accumulate as you navigate.

const KEY = "kombo_list_tabs_v1"

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

export const listTabsStore = {
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

// Reactive read, pruned against the live list set so a tab for a
// since-deleted list quietly disappears instead of pointing nowhere.
export function useOpenListIds(existingIds: string[]): string[] {
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
