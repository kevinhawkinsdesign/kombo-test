import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Locale } from "@/lib/locale"
import type { FilterChip } from "@/lib/table-sort-filter"

const COPY = {
  en: { clearAll: "Clear all" },
  es: { clearAll: "Limpiar todo" },
  it: { clearAll: "Cancella tutto" },
  fr: { clearAll: "Tout effacer" },
  de: { clearAll: "Alles löschen" },
  pt: { clearAll: "Limpar tudo" },
  pt_BR: { clearAll: "Limpar tudo" },
} as const

/**
 * Summarizes every active filter on a page — per-column DataTable filters
 * (see `filterChipsFor` in lib/table-sort-filter.ts) plus any toolbar-level
 * facets the page chooses to include — as one row of removable chips, with a
 * single "Clear all" to reset everything at once. Renders nothing when there
 * are no active filters. Purely additive: callers assemble the chip list
 * themselves, this only renders + clears it, so it doesn't require touching
 * DataTable's contract or any of its other call sites.
 */
export function ActiveFiltersBar({
  chips,
  onClearAll,
  locale,
}: {
  chips: FilterChip[]
  onClearAll: () => void
  locale: Locale
}) {
  if (chips.length === 0) return null
  const c = COPY[locale]

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 py-1 pr-1 font-normal">
          {chip.label}
          <button
            type="button"
            aria-label={chip.label}
            onClick={chip.onClear}
            className="hover:bg-muted-foreground/20 rounded-full p-0.5"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
      >
        {c.clearAll}
      </button>
    </div>
  )
}
