import * as React from "react"

import type { ColumnFilterState } from "@/lib/table-sort-filter"

// Saved, named bundles of a page's CURRENT FILTER STATE (toolbar facets +
// per-column DataTable filters) — not columns, not sort. Lets a user save
// "VP+ at Enterprise accounts, Tier = Enterprise" as a tab they can jump
// back to, on the unfiltered Companies/People pages. Distinct from
// lib/list-tabs.ts (which tracks *which already-open list records* are
// pinned as tabs on the list-detail page) and mock-ai-search's
// savedSearchStore (which snapshots an AI-search query, not table filters) —
// same localStorage + useSyncExternalStore shape as both, applied to a third
// kind of thing.

export type ViewPageScope = "companies" | "prospects"

// JSON-safe mirror of ColumnFilterState — a native Set isn't serializable,
// so the "enum" variant's excluded values are stored as an array and
// converted back to a Set on restore.
export type SerializedColumnFilterState =
  | { type: "enum"; excluded: string[] }
  | { type: "text"; query: string }

export function serializeColumnFilters(
  filters: Record<string, ColumnFilterState>
): Record<string, SerializedColumnFilterState> {
  const out: Record<string, SerializedColumnFilterState> = {}
  for (const [columnId, f] of Object.entries(filters)) {
    out[columnId] =
      f.type === "enum"
        ? { type: "enum", excluded: [...f.excluded] }
        : { type: "text", query: f.query }
  }
  return out
}

export function deserializeColumnFilters(
  filters: Record<string, SerializedColumnFilterState>
): Record<string, ColumnFilterState> {
  const out: Record<string, ColumnFilterState> = {}
  for (const [columnId, f] of Object.entries(filters)) {
    out[columnId] =
      f.type === "enum"
        ? { type: "enum", excluded: new Set(f.excluded) }
        : { type: "text", query: f.query }
  }
  return out
}

// The Companies page's toolbar facets (Tier + List) plus its per-column
// filters — see pages/Companies.tsx.
export interface CompaniesSavedFilters {
  query: string
  tier: string
  listFilter: string
  columnFilters: Record<string, SerializedColumnFilterState>
}

// The People page's toolbar facets (Status + List) plus its per-column
// filters — see pages/People.tsx.
export interface ProspectsSavedFilters {
  query: string
  status: string
  listFilter: string
  columnFilters: Record<string, SerializedColumnFilterState>
}

export type FiltersForPage<P extends ViewPageScope> = P extends "companies"
  ? CompaniesSavedFilters
  : ProspectsSavedFilters

export interface SavedView<P extends ViewPageScope = ViewPageScope> {
  id: string
  name: string
  page: P
  filters: FiltersForPage<P>
  createdAt: string
}

const KEY = "kombo_saved_views_v1"

function load(): SavedView[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as SavedView[]
  } catch {
    /* ignore malformed storage */
  }
  return []
}

let state: SavedView[] = load()
const listeners = new Set<() => void>()

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function emit(): void {
  persist()
  listeners.forEach((l) => l())
}

export const savedViewsStore = {
  create<P extends ViewPageScope>(data: {
    name: string
    page: P
    filters: FiltersForPage<P>
  }): SavedView<P> {
    const view: SavedView<P> = {
      ...data,
      id: `sv_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    }
    state = [...state, view]
    emit()
    return view
  },
  remove(id: string): void {
    state = state.filter((v) => v.id !== id)
    emit()
  },
}

export function useSavedViews<P extends ViewPageScope>(page: P): SavedView<P>[] {
  const all = React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
  return React.useMemo(
    () => all.filter((v): v is SavedView<P> => v.page === page),
    [all, page]
  )
}
