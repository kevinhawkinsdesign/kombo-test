import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

// A search-to-filter picker for choosing among option sets too large for a
// plain <Select> to list reasonably (campaigns, lists, prospects, companies
// at enterprise scale can run into the thousands). Filters client-side and
// caps the rendered list — same trade-off every other search surface in this
// app makes; a real backend would paginate/debounce server-side instead.
const MAX_SHOWN = 50

export function SearchCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  className,
  id,
}: {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  className?: string
  id?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  // Reset the search box each time the popover opens (render-time check, house
  // pattern — never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setQuery("")
  }

  const selected = options.find((o) => o.value === value)
  const q = query.trim().toLowerCase()
  const filtered = q
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.sublabel?.toLowerCase().includes(q)
      )
    : options
  const shown = filtered.slice(0, MAX_SHOWN)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
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
        <div className="max-h-64 overflow-y-auto p-1">
          {shown.length === 0 ? (
            <p className="text-muted-foreground px-2 py-4 text-center text-sm">
              {emptyText}
            </p>
          ) : (
            shown.map((o) => {
              const isActive = o.value === value
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {o.label}
                    {o.sublabel && (
                      <span className="text-muted-foreground ml-1.5 text-xs">
                        {o.sublabel}
                      </span>
                    )}
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
  )
}
