import * as React from "react"
import { ArrowUp, ArrowDown, ChevronDown, Filter as FilterIcon, X } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/locale"
import type { ColumnDef } from "@/lib/table-columns"
import type { ColumnFilterState, SortState } from "@/lib/table-sort-filter"

const HEADER_COPY = {
  en: {
    sortAZ: "Sort A to Z",
    sortZA: "Sort Z to A",
    sortLowHigh: "Sort Low to High",
    sortHighLow: "Sort High to Low",
    clearSort: "Clear sort",
    filter: "Filter",
    filterPlaceholder: "Contains…",
    clearFilter: "Clear filter",
    noValues: "No values",
    columnOptions: "Column options",
  },
  es: {
    sortAZ: "Ordenar de A a Z",
    sortZA: "Ordenar de Z a A",
    sortLowHigh: "Ordenar de menor a mayor",
    sortHighLow: "Ordenar de mayor a menor",
    clearSort: "Quitar orden",
    filter: "Filtro",
    filterPlaceholder: "Contiene…",
    clearFilter: "Quitar filtro",
    noValues: "Sin valores",
    columnOptions: "Opciones de columna",
  },
  it: {
    sortAZ: "Ordina dalla A alla Z",
    sortZA: "Ordina dalla Z alla A",
    sortLowHigh: "Ordina dal più basso al più alto",
    sortHighLow: "Ordina dal più alto al più basso",
    clearSort: "Rimuovi ordinamento",
    filter: "Filtro",
    filterPlaceholder: "Contiene…",
    clearFilter: "Rimuovi filtro",
    noValues: "Nessun valore",
    columnOptions: "Opzioni colonna",
  },
  fr: {
    sortAZ: "Trier de A à Z",
    sortZA: "Trier de Z à A",
    sortLowHigh: "Trier du plus bas au plus haut",
    sortHighLow: "Trier du plus haut au plus bas",
    clearSort: "Effacer le tri",
    filter: "Filtre",
    filterPlaceholder: "Contient…",
    clearFilter: "Effacer le filtre",
    noValues: "Aucune valeur",
    columnOptions: "Options de colonne",
  },
  de: {
    sortAZ: "Von A bis Z sortieren",
    sortZA: "Von Z bis A sortieren",
    sortLowHigh: "Aufsteigend sortieren",
    sortHighLow: "Absteigend sortieren",
    clearSort: "Sortierung entfernen",
    filter: "Filter",
    filterPlaceholder: "Enthält…",
    clearFilter: "Filter entfernen",
    noValues: "Keine Werte",
    columnOptions: "Spaltenoptionen",
  },
  pt: {
    sortAZ: "Ordenar de A a Z",
    sortZA: "Ordenar de Z a A",
    sortLowHigh: "Ordenar do menor para o maior",
    sortHighLow: "Ordenar do maior para o menor",
    clearSort: "Remover ordenação",
    filter: "Filtro",
    filterPlaceholder: "Contém…",
    clearFilter: "Remover filtro",
    noValues: "Sem valores",
    columnOptions: "Opções de coluna",
  },
  pt_BR: {
    sortAZ: "Ordenar de A a Z",
    sortZA: "Ordenar de Z a A",
    sortLowHigh: "Ordenar do menor para o maior",
    sortHighLow: "Ordenar do maior para o menor",
    clearSort: "Remover ordenação",
    filter: "Filtro",
    filterPlaceholder: "Contém…",
    clearFilter: "Remover filtro",
    noValues: "Sem valores",
    columnOptions: "Opções de coluna",
  },
} as const

// Hover-revealed sort + filter control for a single column header. Only
// rendered for columns that declare `getValue` — columns without one (e.g.
// multi-value chip lists like Technologies/Signals/Tags) render as plain text.
function ColumnHeaderControl<T>({
  col,
  locale,
  rows,
  sort,
  onSortChange,
  filter,
  onFilterChange,
}: {
  col: ColumnDef<T>
  locale: Locale
  rows: T[]
  sort: SortState
  onSortChange: (next: SortState) => void
  filter: ColumnFilterState | undefined
  onFilterChange: (next: ColumnFilterState | undefined) => void
}) {
  const c = HEADER_COPY[locale]
  const [open, setOpen] = React.useState(false)
  const getValue = col.getValue!
  const isActive = sort?.columnId === col.id
  const dir = isActive ? sort.dir : null
  const isNumeric = typeof (rows.length > 0 ? getValue(rows[0]) : undefined) === "number"

  const distinctValues = React.useMemo(() => {
    if (col.filterType !== "enum") return []
    const set = new Set<string>()
    rows.forEach((r) => {
      const v = getValue(r)
      if (v !== null && v !== undefined && v !== "") set.add(String(v))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [rows, col, getValue])

  const filterActive =
    (filter?.type === "enum" && filter.excluded.size > 0) ||
    (filter?.type === "text" && filter.query.trim() !== "")

  return (
    <div className="group/th flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          if (!isActive) onSortChange({ columnId: col.id, dir: "asc" })
          else if (sort!.dir === "asc") onSortChange({ columnId: col.id, dir: "desc" })
          else onSortChange(null)
        }}
        className="flex items-center gap-1 font-medium hover:text-foreground"
      >
        <span>{col.label[locale]}</span>
        {dir === "asc" && <ArrowUp className="size-3.5" />}
        {dir === "desc" && <ArrowDown className="size-3.5" />}
        {filterActive && <FilterIcon className="text-primary size-3" />}
      </button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={c.columnOptions}
            className={cn(
              "hover:bg-muted rounded p-0.5 opacity-0 transition-opacity group-hover/th:opacity-100 focus:opacity-100",
              (isActive || filterActive || open) && "opacity-100"
            )}
          >
            <ChevronDown className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onSortChange({ columnId: col.id, dir: "asc" })}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm",
                dir === "asc" ? "bg-muted font-medium" : "hover:bg-muted"
              )}
            >
              <ArrowUp className="size-3.5" />
              {isNumeric ? c.sortLowHigh : c.sortAZ}
            </button>
            <button
              type="button"
              onClick={() => onSortChange({ columnId: col.id, dir: "desc" })}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm",
                dir === "desc" ? "bg-muted font-medium" : "hover:bg-muted"
              )}
            >
              <ArrowDown className="size-3.5" />
              {isNumeric ? c.sortHighLow : c.sortZA}
            </button>
            {isActive && (
              <button
                type="button"
                onClick={() => onSortChange(null)}
                className="text-muted-foreground hover:bg-muted flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
              >
                <X className="size-3.5" />
                {c.clearSort}
              </button>
            )}
          </div>
          <div className="bg-border my-2 h-px" />
          <p className="text-muted-foreground px-2 pb-1 text-xs font-medium">{c.filter}</p>
          {col.filterType === "enum" ? (
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {distinctValues.length === 0 ? (
                <p className="text-muted-foreground px-2 py-1 text-xs">{c.noValues}</p>
              ) : (
                distinctValues.map((v) => {
                  const excluded = filter?.type === "enum" && filter.excluded.has(v)
                  return (
                    <label
                      key={v}
                      className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm"
                    >
                      <Checkbox
                        checked={!excluded}
                        onCheckedChange={() => {
                          const current =
                            filter?.type === "enum" ? new Set(filter.excluded) : new Set<string>()
                          if (excluded) current.delete(v)
                          else current.add(v)
                          onFilterChange(
                            current.size > 0 ? { type: "enum", excluded: current } : undefined
                          )
                        }}
                      />
                      <span className="truncate">{v}</span>
                    </label>
                  )
                })
              )}
            </div>
          ) : (
            <Input
              value={filter?.type === "text" ? filter.query : ""}
              onChange={(e) =>
                onFilterChange(e.target.value ? { type: "text", query: e.target.value } : undefined)
              }
              placeholder={c.filterPlaceholder}
              className="h-8"
            />
          )}
          {filterActive && (
            <button
              type="button"
              onClick={() => onFilterChange(undefined)}
              className="text-muted-foreground hover:bg-muted mt-2 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
            >
              <X className="size-3.5" />
              {c.clearFilter}
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export interface TableSelection<T> {
  isSelected: (row: T) => boolean
  toggle: (row: T) => void
  toggleAll: () => void
  allSelected: boolean
  someSelected: boolean
  // Rows failing this predicate render no checkbox and can't be selected
  // (e.g. campaign prospects that were auto-enrolled rather than added
  // manually). Omitted = every row is selectable.
  isSelectable?: (row: T) => boolean
}

/**
 * A table whose columns are driven by a registry + an ordered list of visible
 * column ids. The pinned column always renders first. Columns with an `edit`
 * renderer become inline inputs when `editing` is on. Any column with
 * `getValue` gets a hover-revealed header control for sorting and per-column
 * filtering, applied here so every consumer gets it automatically.
 */
export function DataTable<T>({
  columns,
  visible,
  rows,
  rowKey,
  locale,
  editing = false,
  onUpdate,
  onRowClick,
  actions,
  empty,
  selection,
  sort = null,
  onSortChange = () => {},
  filters = {},
  onFilterChange = () => {},
  filterRows,
}: {
  columns: ColumnDef<T>[]
  visible: string[]
  rows: T[]
  rowKey: (row: T) => string
  locale: Locale
  editing?: boolean
  onUpdate?: (row: T, patch: Partial<T>) => void
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
  empty?: React.ReactNode
  selection?: TableSelection<T>
  // Sort/filter state is owned by the caller (via useTableSortFilter) so it
  // can be applied to the full row set before pagination — DataTable only
  // ever sees whatever page of rows it's handed, so filtering in here would
  // silently only search the loaded page. Omit all four on tables with no
  // sortable/filterable columns (nothing calls them if no column has
  // `getValue`).
  sort?: SortState
  onSortChange?: (next: SortState) => void
  filters?: Record<string, ColumnFilterState>
  onFilterChange?: (columnId: string, next: ColumnFilterState | undefined) => void
  // Rows to derive distinct filter values + numeric-type detection from —
  // pass the full pre-pagination set so a filter checklist doesn't shrink as
  // the user pages through results. Defaults to `rows` (fine for tables that
  // don't paginate).
  filterRows?: T[]
}) {
  const byId = React.useMemo(() => {
    const map = new Map<string, ColumnDef<T>>()
    for (const c of columns) map.set(c.id, c)
    return map
  }, [columns])

  const pinned = columns.find((c) => c.pinned)
  const shown = visible
    .map((id) => byId.get(id))
    .filter((c): c is ColumnDef<T> => Boolean(c))
  const sampleRows = filterRows ?? rows

  // When a row-level isSelectable gate excludes every row on the page (e.g.
  // list-sourced campaign prospects), skip the header checkbox too — an
  // active-looking "select all" control that toggles nothing is confusing.
  const anySelectableOnPage = Boolean(
    selection && rows.some((r) => selection.isSelectable?.(r) ?? true)
  )

  // Sticky-left columns, in order: select checkbox, the pinned identity
  // column, then row actions — kept as a fixed-width group so later columns
  // can scroll horizontally underneath them without misaligning.
  const CHECKBOX_W = 40
  const PINNED_W = 220
  const ACTIONS_W = 48
  const pinnedLeft = selection ? CHECKBOX_W : 0
  const actionsLeft = pinnedLeft + (pinned ? PINNED_W : 0)

  function cell(col: ColumnDef<T>, row: T) {
    if (editing && col.edit && onUpdate) {
      return col.edit(row, (patch) => onUpdate(row, patch), locale)
    }
    return col.render(row, locale)
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {selection && (
                <TableHead
                  className="bg-muted sticky left-0 z-20 w-10 pl-4"
                  style={{ width: CHECKBOX_W, minWidth: CHECKBOX_W, maxWidth: CHECKBOX_W }}
                >
                  {anySelectableOnPage && (
                  <Checkbox
                    checked={
                      selection.allSelected
                        ? true
                        : selection.someSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={() => selection.toggleAll()}
                    aria-label="Select all"
                  />
                  )}
                </TableHead>
              )}
              {pinned && (
                <TableHead
                  className="bg-muted sticky z-20 pl-4"
                  style={{ left: pinnedLeft, width: PINNED_W, minWidth: PINNED_W }}
                >
                  {pinned.getValue ? (
                    <ColumnHeaderControl
                      col={pinned}
                      locale={locale}
                      rows={sampleRows}
                      sort={sort}
                      onSortChange={onSortChange}
                      filter={filters[pinned.id]}
                      onFilterChange={(next) => onFilterChange(pinned.id, next)}
                    />
                  ) : (
                    pinned.label[locale]
                  )}
                </TableHead>
              )}
              {actions && (
                <TableHead
                  className="bg-muted sticky z-20 w-12 pr-4"
                  style={{
                    left: actionsLeft,
                    width: ACTIONS_W,
                    minWidth: ACTIONS_W,
                    maxWidth: ACTIONS_W,
                  }}
                />
              )}
              {shown.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn("whitespace-nowrap", col.align === "right" && "text-right")}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {col.getValue ? (
                    <ColumnHeaderControl
                      col={col}
                      locale={locale}
                      rows={sampleRows}
                      sort={sort}
                      onSortChange={onSortChange}
                      filter={filters[col.id]}
                      onFilterChange={(next) => onFilterChange(col.id, next)}
                    />
                  ) : (
                    col.label[locale]
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                data-selected={selection?.isSelected(row) || undefined}
                className={cn(
                  onRowClick && "cursor-pointer",
                  selection?.isSelected(row) && "bg-primary/[0.04]"
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {selection && (
                  <TableCell
                    className={cn(
                      "sticky z-10 pl-4",
                      selection.isSelected(row) ? "bg-primary/[0.04]" : "bg-background"
                    )}
                    style={{ left: 0, width: CHECKBOX_W, minWidth: CHECKBOX_W, maxWidth: CHECKBOX_W }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(selection.isSelectable?.(row) ?? true) && (
                      <Checkbox
                        checked={selection.isSelected(row)}
                        onCheckedChange={() => selection.toggle(row)}
                        aria-label="Select row"
                      />
                    )}
                  </TableCell>
                )}
                {pinned && (
                  <TableCell
                    className={cn(
                      "sticky z-10 pl-4",
                      selection?.isSelected(row) ? "bg-primary/[0.04]" : "bg-background"
                    )}
                    style={{ left: pinnedLeft, width: PINNED_W, minWidth: PINNED_W }}
                  >
                    {cell(pinned, row)}
                  </TableCell>
                )}
                {actions && (
                  <TableCell
                    className={cn(
                      "sticky z-10 pr-4 text-right",
                      selection?.isSelected(row) ? "bg-primary/[0.04]" : "bg-background"
                    )}
                    style={{
                      left: actionsLeft,
                      width: ACTIONS_W,
                      minWidth: ACTIONS_W,
                      maxWidth: ACTIONS_W,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actions(row)}
                  </TableCell>
                )}
                {shown.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn(col.align === "right" && "text-right")}
                  >
                    {cell(col, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && empty && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={
                    shown.length +
                    (pinned ? 1 : 0) +
                    (actions ? 1 : 0) +
                    (selection ? 1 : 0)
                  }
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
