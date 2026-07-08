import * as React from "react"

import {
  EMPTY_QUERY,
  type AiEntity,
  type AiQuery,
  type DataSource,
  type LookalikeSeed,
  type SortKey,
} from "@/lib/mock-ai-search"

// Which search sessions the user currently has open as tabs on the Search
// page — an ephemeral browsing session (like list-tabs.ts), not a permanent
// saved resource (that's what SavedAiSearch already is). Unlike a list, a
// search has no id/route of its own, so each tab carries its own full
// snapshot of "what this search is" rather than just an id.

export interface SearchTabSnapshot {
  entity: AiEntity
  query: AiQuery
  lastPrompt: string
  input: string
  seed: LookalikeSeed | null
  db: Exclude<DataSource, "lookalike">
  urlsMode: boolean
  urlPills: string[]
  selectedIds: string[]
  sortKey: SortKey
  filtersRequested: boolean
  hideInList: boolean
  hideInCrm: boolean
}

export interface SearchTab extends SearchTabSnapshot {
  id: string
  createdAt: string
}

const BLANK: SearchTabSnapshot = {
  entity: "people",
  query: { ...EMPTY_QUERY },
  lastPrompt: "",
  input: "",
  seed: null,
  db: "kombo",
  urlsMode: false,
  urlPills: [],
  selectedIds: [],
  sortKey: "fit",
  filtersRequested: false,
  hideInList: false,
  hideInCrm: false,
}

const KEY = "kombo_search_tabs_v1"

interface Persisted {
  tabs: SearchTab[]
  activeId: string | null
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Persisted
  } catch {
    /* ignore malformed storage */
  }
  return { tabs: [], activeId: null }
}

let state: Persisted = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `st_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const searchTabsStore = {
  open(seed?: Partial<SearchTabSnapshot>): SearchTab {
    const tab: SearchTab = {
      ...BLANK,
      ...seed,
      id: uid(),
      createdAt: new Date().toISOString(),
    }
    state = { tabs: [...state.tabs, tab], activeId: tab.id }
    emit()
    return tab
  },
  // Removes a tab; if it was active, activates a neighbor. Unlike lists,
  // there's no "/search index" to fall back to, so this never allows the
  // tab set to go empty — a fresh blank tab opens instead.
  close(id: string): string | null {
    const idx = state.tabs.findIndex((t) => t.id === id)
    if (idx === -1) return state.activeId
    const remaining = state.tabs.filter((t) => t.id !== id)
    if (remaining.length === 0) {
      const fresh: SearchTab = { ...BLANK, id: uid(), createdAt: new Date().toISOString() }
      state = { tabs: [fresh], activeId: fresh.id }
      emit()
      return fresh.id
    }
    let activeId = state.activeId
    if (activeId === id) {
      const neighbor = state.tabs[idx - 1] ?? state.tabs[idx + 1]
      activeId = neighbor.id
    }
    state = { tabs: remaining, activeId }
    emit()
    return activeId
  },
  update(id: string, patch: Partial<SearchTabSnapshot>): void {
    state = {
      ...state,
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }
    emit()
  },
  setActive(id: string): void {
    if (!state.tabs.some((t) => t.id === id)) return
    state = { ...state, activeId: id }
    emit()
  },
  // Plain synchronous reads for mount-time initializer use — not hooks.
  peekTabs(): SearchTab[] {
    return state.tabs
  },
  peekActive(): SearchTab | null {
    return state.tabs.find((t) => t.id === state.activeId) ?? null
  },
}

export function useSearchTabs(): { tabs: SearchTab[]; activeId: string | null } {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
