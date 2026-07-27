// Column sort + per-column filter state for DataTable, extracted so it can be
// applied to a page's full row set BEFORE pagination slicing — DataTable
// itself only ever sees whatever page of rows the caller hands it, so
// filtering inside DataTable would silently only search the loaded page.

import * as React from "react"

import type { ColumnDef } from "@/lib/table-columns"

export type SortState = { columnId: string; dir: "asc" | "desc" } | null
export type ColumnFilterState =
  | { type: "enum"; excluded: Set<string> }
  | { type: "text"; query: string }

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

  return { sort, setSort, filters, setFilter, rows: result }
}
