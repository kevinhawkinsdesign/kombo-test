import * as React from "react"
import { ChevronsUpDown, Search, Plus } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface ListOption {
  id: string
  name: string
  color: string
  count: number
}

/**
 * Filter a People/Companies table by list. Shows "All records" plus each list
 * with its count; selecting one narrows the table, "all" shows everything.
 */
export function ListSelector({
  value,
  onChange,
  lists,
  allLabel,
  allIcon: AllIcon,
  allCount,
  countNoun,
  onCreate,
  createLabel,
  searchPlaceholder,
}: {
  value: string
  onChange: (v: string) => void
  lists: ListOption[]
  allLabel: string
  allIcon: React.ComponentType<{ className?: string }>
  allCount: number
  countNoun: (n: number) => string
  onCreate: () => void
  createLabel: string
  searchPlaceholder: string
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")
  const active = lists.find((l) => l.id === value)
  const currentCount = active ? active.count : allCount
  const filtered = lists.filter((l) =>
    l.name.toLowerCase().includes(q.trim().toLowerCase())
  )

  function choose(v: string) {
    onChange(v)
    setOpen(false)
    setQ("")
  }

  return (
    <div className="flex items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/40 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            {active ? (
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: active.color }}
              />
            ) : (
              <AllIcon className="text-primary size-4" />
            )}
            <span className="max-w-[14rem] truncate">
              {active ? active.name : allLabel}
            </span>
            <ChevronsUpDown className="text-muted-foreground size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => choose("all")}
              className={cn(
                "hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                value === "all" && "bg-primary/5"
              )}
            >
              <AllIcon className="text-muted-foreground size-4" />
              <span className="flex-1 font-medium">{allLabel}</span>
              <span className="bg-muted rounded-full px-1.5 py-0.5 text-[11px] tabular-nums">
                {allCount}
              </span>
            </button>
            <div className="my-1 border-t" />
            {filtered.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => choose(l.id)}
                className={cn(
                  "hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                  value === l.id && "bg-primary/5"
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="min-w-0 flex-1 truncate">{l.name}</span>
                <span className="bg-muted rounded-full px-1.5 py-0.5 text-[11px] tabular-nums">
                  {l.count}
                </span>
              </button>
            ))}
            <div className="my-1 border-t" />
            <button
              type="button"
              onClick={() => {
                onCreate()
                setOpen(false)
              }}
              className="text-primary hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium"
            >
              <Plus className="size-4" />
              {createLabel}
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <span className="text-muted-foreground text-sm">
        {countNoun(currentCount)}
      </span>
    </div>
  )
}
