import * as React from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// A search-to-filter, multi-select picker that renders its current
// selections as removable chips below the trigger — the multi-select
// counterpart to SearchCombobox (which is single-select, no chips). Generic
// over the item type so callers can render rich rows (avatar, colored dot,
// icon) via `renderOption`/`renderChip` instead of a plain label.
const MAX_SHOWN = 50

export function MultiSelectCombobox<T, K extends string = string>({
  items,
  values,
  onChange,
  getKey,
  getLabel,
  renderOption,
  renderChip,
  placeholder,
  searchPlaceholder,
  emptyText,
  noMatchText,
  clearAllLabel,
  className,
  id,
}: {
  items: T[]
  values: Set<K>
  onChange: (next: Set<K>) => void
  getKey: (item: T) => K
  getLabel: (item: T) => string
  renderOption?: (item: T) => React.ReactNode
  renderChip?: (item: T) => React.ReactNode
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  noMatchText: string
  clearAllLabel: (count: number) => string
  className?: string
  id?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  // Reset the search box each time the popover opens (render-time check,
  // house pattern — never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setQuery("")
  }

  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter((item) => getLabel(item).toLowerCase().includes(q)) : items
  const shown = filtered.slice(0, MAX_SHOWN)
  const selectedItems = items.filter((item) => values.has(getKey(item)))

  function toggle(key: K) {
    const next = new Set(values)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between font-normal", className)}
          >
            <span className={cn("truncate", values.size === 0 && "text-muted-foreground")}>
              {values.size > 0
                ? selectedItems.map((item) => getLabel(item)).join(", ")
                : placeholder}
            </span>
            <ChevronDown className="text-muted-foreground size-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          {items.length > 8 && (
            <div className="relative border-b p-2">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4.5 size-3.5 -translate-y-1/2" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-7 text-sm"
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto p-1">
            {items.length === 0 ? (
              <p className="text-muted-foreground px-2 py-4 text-center text-sm">{emptyText}</p>
            ) : shown.length === 0 ? (
              <p className="text-muted-foreground px-2 py-4 text-center text-sm">{noMatchText}</p>
            ) : (
              shown.map((item) => {
                const key = getKey(item)
                const isActive = values.has(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
                      {renderOption ? renderOption(item) : getLabel(item)}
                    </span>
                    {isActive && <Check className="size-4 shrink-0" />}
                  </button>
                )
              })
            )}
            {filtered.length > MAX_SHOWN && (
              <p className="text-muted-foreground px-2 py-1.5 text-xs">
                +{filtered.length - MAX_SHOWN}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedItems.map((item) => {
            const key = getKey(item)
            return (
              <Badge key={key} variant="secondary" className="gap-1 py-1 pr-1 font-normal">
                {renderChip ? renderChip(item) : getLabel(item)}
                <button
                  type="button"
                  aria-label={getLabel(item)}
                  onClick={() => toggle(key)}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )
          })}
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
          >
            {clearAllLabel(selectedItems.length)}
          </button>
        </div>
      )}
    </div>
  )
}
