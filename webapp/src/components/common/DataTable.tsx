import * as React from "react"

import { Card } from "@/components/ui/card"
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
 * renderer become inline inputs when `editing` is on.
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
                </TableHead>
              )}
              {pinned && (
                <TableHead
                  className="bg-muted sticky z-20 pl-4"
                  style={{ left: pinnedLeft, width: PINNED_W, minWidth: PINNED_W }}
                >
                  {pinned.label[locale]}
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
                  {col.label[locale]}
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
