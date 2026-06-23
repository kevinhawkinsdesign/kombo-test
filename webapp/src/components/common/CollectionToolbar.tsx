import { Search, Download, ArrowDownUp } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ViewToggle, type CollectionView } from "@/components/common/ViewToggle"

export interface SortOption {
  value: string
  label: string
}

// Shared toolbar for collection pages: search filter, sort select, a Cards/Table
// view toggle, and an export button. Keeps the controls consistent everywhere.
export function CollectionToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  sort,
  onSortChange,
  sortOptions,
  view,
  onViewChange,
  cardsLabel,
  tableLabel,
  onExport,
  exportLabel,
  children,
}: {
  query: string
  onQueryChange: (value: string) => void
  searchPlaceholder: string
  sort: string
  onSortChange: (value: string) => void
  sortOptions: SortOption[]
  view: CollectionView
  onViewChange: (view: CollectionView) => void
  cardsLabel: string
  tableLabel: string
  onExport: () => void
  exportLabel: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {children}

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-auto gap-2 shrink-0">
          <ArrowDownUp className="size-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ViewToggle
        view={view}
        onChange={onViewChange}
        cardsLabel={cardsLabel}
        tableLabel={tableLabel}
      />

      <Button variant="outline" className="shrink-0" onClick={onExport}>
        <Download className="size-4" />
        <span className="hidden sm:inline">{exportLabel}</span>
      </Button>
    </div>
  )
}
