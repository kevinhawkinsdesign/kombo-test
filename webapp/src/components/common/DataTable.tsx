import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  pageSize,
  selectable,
  selectedIds,
  onSelectionChange,
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
  pageSize?: number
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
}) {
  const [page, setPage] = React.useState(0)
  React.useEffect(() => { setPage(0) }, [rows.length])

  const totalPages = pageSize ? Math.ceil(rows.length / pageSize) : 1
  const displayRows = pageSize ? rows.slice(page * pageSize, (page + 1) * pageSize) : rows
  const byId = React.useMemo(() => {
    const map = new Map<string, ColumnDef<T>>()
    for (const c of columns) map.set(c.id, c)
    return map
  }, [columns])

  const pinned = columns.find((c) => c.pinned)
  const shown = visible
    .map((id) => byId.get(id))
    .filter((c): c is ColumnDef<T> => Boolean(c))

  function cell(col: ColumnDef<T>, row: T) {
    if (editing && col.edit && onUpdate) {
      return col.edit(row, (patch) => onUpdate(row, patch), locale)
    }
    return col.render(row, locale)
  }

  const allPageSelected =
    selectable &&
    displayRows.length > 0 &&
    displayRows.every((r) => selectedIds?.has(rowKey(r)))

  function togglePageAll(checked: boolean) {
    if (!onSelectionChange || !selectedIds) return
    const next = new Set(selectedIds)
    displayRows.forEach((r) => {
      if (checked) next.add(rowKey(r))
      else next.delete(rowKey(r))
    })
    onSelectionChange(next)
  }

  function toggleOne(row: T) {
    if (!onSelectionChange || !selectedIds) return
    const id = rowKey(row)
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {selectable && (
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={!!allPageSelected}
                    onCheckedChange={(v) => togglePageAll(!!v)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {pinned && (
                <TableHead
                  className="bg-muted/40 sticky left-0 z-10 pl-4"
                  style={pinned.minWidth ? { minWidth: pinned.minWidth } : undefined}
                >
                  {pinned.label[locale]}
                </TableHead>
              )}
              {shown.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn("whitespace-nowrap", col.align === "right" && "text-right")}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {col.label[locale]}
                </TableHead>
              ))}
              {actions && <TableHead className="w-12 pr-4" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row) => (
              <TableRow
                key={rowKey(row)}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {selectable && (
                  <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds?.has(rowKey(row)) ?? false}
                      onCheckedChange={() => toggleOne(row)}
                    />
                  </TableCell>
                )}
                {pinned && (
                  <TableCell className="bg-background sticky left-0 z-10 pl-4">
                    {cell(pinned, row)}
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
                {actions && (
                  <TableCell
                    className="pr-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && empty && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={shown.length + (pinned ? 1 : 0) + (actions ? 1 : 0) + (selectable ? 1 : 0)}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pageSize && totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-2">
          <p className="text-muted-foreground text-xs tabular-nums">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)} of {rows.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>
            <span className="text-muted-foreground px-1 text-xs tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
