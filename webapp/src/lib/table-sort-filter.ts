// Column sort + per-column filter state for DataTable, extracted so it can be
// applied to a page's full row set BEFORE pagination slicing — DataTable
// itself only ever sees whatever page of rows the caller hands it, so
// filtering inside DataTable would silently only search the loaded page.

import * as React from "react"

import type { ColumnDef } from "@/lib/table-columns"
import type { Locale } from "@/lib/locale"

export type SortState = { columnId: string; dir: "asc" | "desc" } | null
export type ColumnFilterState =
  | { type: "enum"; excluded: Set<string> }
  | { type: "text"; query: string }

// A single removable "active filter" chip, for pages that render an
// ActiveFiltersBar above their DataTable — see filterChipsFor below.
export interface FilterChip {
  key: string
  label: string
  onClear: () => void
}

export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? 1 : -1
  return String(a).localeCompare(String(b))
}

export interface TableSortFilter<T> {
  sort: SortState
  setSort: (next: SortState) => void
  filters: Record<string, ColumnFilterState>
  setFilter: (columnId: string, next: ColumnFilterState | undefined) => void
  // Resets every active column filter at once — the "Clear all" action for an
  // ActiveFiltersBar. Leaves sort untouched (sort isn't a filter).
  clearFilters: () => void
  rows: T[]
}

export function useTableSortFilter<T>(
  columns: ColumnDef<T>[],
  rows: T[]
): TableSortFilter<T> {
  const [sort, setSort] = React.useState<SortState>(null)
  const [filters, setFilters] = React.useState<Record<string, ColumnFilterState>>({})

  const byId = React.useMemo(() => {
    const map = new Map<string, ColumnDef<T>>()
    for (const c of columns) map.set(c.id, c)
    return map
  }, [columns])

  const setFilter = React.useCallback(
    (columnId: string, next: ColumnFilterState | undefined) => {
      setFilters((prev) => {
        const copy = { ...prev }
        if (next) copy[columnId] = next
        else delete copy[columnId]
        return copy
      })
    },
    []
  )

  const result = React.useMemo(() => {
    let out = rows
    for (const [colId, f] of Object.entries(filters)) {
      const col = byId.get(colId)
      if (!col?.getValue) continue
      if (f.type === "enum" && f.excluded.size > 0) {
        out = out.filter((r) => !f.excluded.has(String(col.getValue!(r))))
      } else if (f.type === "text" && f.query.trim()) {
        const q = f.query.trim().toLowerCase()
        out = out.filter((r) => String(col.getValue!(r) ?? "").toLowerCase().includes(q))
      }
    }
    if (sort) {
      const col = byId.get(sort.columnId)
      if (col?.getValue) {
        const getValue = col.getValue
        out = [...out].sort((a, b) => {
          const cmp = compareValues(getValue(a), getValue(b))
          return sort.dir === "asc" ? cmp : -cmp
        })
      }
    }
    return out
  }, [rows, filters, sort, byId])

  const clearFilters = React.useCallback(() => setFilters({}), [])

  return { sort, setSort, filters, setFilter, clearFilters, rows: result }
}

// Turns the active per-column filters into a flat list of removable chips —
// one place to see and clear every column filter, instead of hunting through
// each column's own header popover. Pages can concat their own toolbar-level
// filter chips (e.g. a status/list facet) onto the result before handing it
// to ActiveFiltersBar. Enum chips show just the column label (the filter is
// exclusion-based, so there's no single clean "n selected" to print); text
// chips include the query so the active search term is visible at a glance.
export function filterChipsFor<T>(
  columns: ColumnDef<T>[],
  filters: Record<string, ColumnFilterState>,
  setFilter: (columnId: string, next: ColumnFilterState | undefined) => void,
  locale: Locale
): FilterChip[] {
  const byId = new Map(columns.map((col) => [col.id, col]))
  const chips: FilterChip[] = []
  for (const [columnId, f] of Object.entries(filters)) {
    const col = byId.get(columnId)
    if (!col) continue
    if (f.type === "text" && f.query.trim()) {
      chips.push({
        key: columnId,
        label: `${col.label[locale]}: "${f.query.trim()}"`,
        onClear: () => setFilter(columnId, undefined),
      })
    } else if (f.type === "enum" && f.excluded.size > 0) {
      chips.push({
        key: columnId,
        label: col.label[locale],
        onClear: () => setFilter(columnId, undefined),
      })
    }
  }
  return chips
}
