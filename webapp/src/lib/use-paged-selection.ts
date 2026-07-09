import * as React from "react"

import { MAX_ENRICH_BATCH } from "@/lib/enrichment"

// Shared "select page at a time, plus a capped select-all" behavior used by
// every table that can enrich a large result set (People, Companies, Search,
// ListDetail, CampaignDetail's Prospects tab). A single click never selects
// more than one page; "select all" is capped at MAX_ENRICH_BATCH so a click
// can never stage more than one enrichment batch, however large the result
// set is.
export function usePagedSelection<T>(
  items: T[],
  getId: (item: T) => string,
  // Any value that identifies the current filter/query state — the page
  // resets to 0 whenever this changes, even if item count stays the same.
  resetKey: unknown,
  pageSize = 50,
  cap = MAX_ENRICH_BATCH
) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(0)
  const [lastResetKey, setLastResetKey] = React.useState(resetKey)
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey)
    setPage(0)
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * pageSize
  const pageEnd = Math.min(pageStart + pageSize, items.length)
  const pagedItems = items.slice(pageStart, pageEnd)

  const allSelected =
    pagedItems.length > 0 && pagedItems.every((i) => selectedIds.has(getId(i)))
  const someSelected = pagedItems.some((i) => selectedIds.has(getId(i)))
  const overCap = selectedIds.size > cap
  const selectableCount = Math.min(items.length, cap)

  function toggleRow(item: T) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const id = getId(item)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Toggles the current page only, so a single click never selects more
  // than one page of results at a time.
  function togglePage() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (pagedItems.every((i) => prev.has(getId(i))))
        pagedItems.forEach((i) => next.delete(getId(i)))
      else pagedItems.forEach((i) => next.add(getId(i)))
      return next
    })
  }

  // Multi-page "select all", capped at one enrichment batch even if the
  // result set is larger.
  function selectAllCapped() {
    setSelectedIds(new Set(items.slice(0, cap).map(getId)))
  }

  function clear() {
    setSelectedIds(new Set())
  }

  return {
    selectedIds,
    setSelectedIds,
    page: safePage,
    setPage,
    pageCount,
    pageStart,
    pageEnd,
    pagedItems,
    allSelected,
    someSelected,
    overCap,
    selectableCount,
    toggleRow,
    togglePage,
    selectAllCapped,
    clear,
  }
}
