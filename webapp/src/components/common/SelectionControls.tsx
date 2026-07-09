import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    selectPage: "Select page",
    deselectPage: "Deselect page",
    selectAllCapped: (n: number) => `Select all ${n.toLocaleString()}`,
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`,
  },
  es: {
    selectPage: "Seleccionar página",
    deselectPage: "Deseleccionar página",
    selectAllCapped: (n: number) => `Seleccionar los ${n.toLocaleString()}`,
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} de ${total.toLocaleString()}`,
  },
} as const

// The "select page at a time, plus a capped select-all" row every
// enrichment-capable table shows above its DataTable. Pairs with
// usePagedSelection — pass its returned fields straight through.
export function SelectionControls({
  allSelected,
  onTogglePage,
  selectedCount,
  selectableCount,
  onSelectAllCapped,
  pageStart,
  pageEnd,
  total,
  page,
  pageCount,
  onPrevPage,
  onNextPage,
}: {
  allSelected: boolean
  onTogglePage: () => void
  selectedCount: number
  selectableCount: number
  onSelectAllCapped: () => void
  pageStart: number
  pageEnd: number
  total: number
  page: number
  pageCount: number
  onPrevPage: () => void
  onNextPage: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-xs">
      <button
        type="button"
        onClick={onTogglePage}
        className="text-primary font-medium hover:underline"
      >
        {allSelected ? c.deselectPage : c.selectPage}
      </button>
      {selectedCount < selectableCount && (
        <button
          type="button"
          onClick={onSelectAllCapped}
          className="text-primary font-medium hover:underline"
        >
          {c.selectAllCapped(selectableCount)}
        </button>
      )}
      <div className="ml-auto flex items-center gap-1">
        <span className="text-muted-foreground px-1 tabular-nums">
          {c.pageRange(total === 0 ? 0 : pageStart + 1, pageEnd, total)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={page === 0}
          onClick={onPrevPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={page >= pageCount - 1}
          onClick={onNextPage}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
