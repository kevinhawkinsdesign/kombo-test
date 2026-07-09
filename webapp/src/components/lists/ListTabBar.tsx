import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ListFormDialog } from "@/components/lists/ListFormDialog"
import { useLocale } from "@/lib/locale"
import { useLists } from "@/lib/store"
import { listTabsStore, useOpenListIds } from "@/lib/list-tabs"
import { cn } from "@/lib/utils"
import type { ProspectList } from "@/lib/types"

const COPY = {
  en: {
    closeTab: (name: string) => `Close ${name}`,
    addTab: "Open another list",
    searchToOpen: "Search lists to open…",
    noOtherLists: "No other lists to open.",
    createNewList: "Create new list",
  },
  es: {
    closeTab: (name: string) => `Cerrar ${name}`,
    addTab: "Abrir otra lista",
    searchToOpen: "Buscar listas para abrir…",
    noOtherLists: "No hay más listas para abrir.",
    createNewList: "Crear nueva lista",
  },
} as const

function memberCount(list: ProspectList): number {
  return (list.kind === "company" ? list.accountIds : list.prospectIds)
    ?.length ?? 0
}

// Chrome/Lemlist-style tab strip for lists the user has open at once —
// distinct from ListSwitcher (the H1 dropdown), which replaces the current
// tab's target rather than keeping several lists open side by side.
export function ListTabBar({ currentId }: { currentId: string }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const lists = useLists()
  const openIds = useOpenListIds(React.useMemo(() => lists.map((l) => l.id), [lists]))
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)

  const tabs = openIds
    .map((id) => lists.find((l) => l.id === id))
    .filter((l): l is ProspectList => Boolean(l))

  function closeTab(id: string) {
    const remaining = tabs.filter((t) => t.id !== id)
    listTabsStore.close(id)
    if (id !== currentId) return
    if (remaining.length > 0) navigate(`/lists/${remaining[0].id}`)
    else navigate("/lists")
  }

  function openExisting(id: string) {
    listTabsStore.open(id)
    setPickerOpen(false)
    setQuery("")
    navigate(`/lists/${id}`)
  }

  const q = query.trim().toLowerCase()
  const closedLists = lists.filter((l) => !openIds.includes(l.id))
  const filteredClosed = q
    ? closedLists.filter((l) => l.name.toLowerCase().includes(q))
    : closedLists

  return (
    <div className="mb-4 flex items-end gap-0.5 overflow-x-auto border-b">
      {tabs.map((t) => {
        const active = t.id === currentId
        return (
          <div
            key={t.id}
            className={cn(
              "group relative -mb-px flex shrink-0 items-center gap-2 rounded-t-lg border transition-colors",
              active
                ? "border-border border-b-background bg-background text-foreground px-4 py-2.5 text-base font-semibold"
                : "border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
            )}
          >
            <Link to={`/lists/${t.id}`} className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn("shrink-0 rounded-full", active ? "size-2.5" : "size-2")}
                style={{ backgroundColor: t.color }}
              />
              <span className={cn("truncate", active ? "max-w-64" : "max-w-40")}>
                {t.name}
              </span>
            </Link>
            <button
              type="button"
              aria-label={c.closeTab(t.name)}
              onClick={() => closeTab(t.id)}
              className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}

      <Popover
        open={pickerOpen}
        onOpenChange={(v) => {
          setPickerOpen(v)
          if (!v) setQuery("")
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={c.addTab}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground mb-1 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.searchToOpen}
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredClosed.length === 0 ? (
              <p className="text-muted-foreground px-2 py-4 text-center text-sm">
                {c.noOtherLists}
              </p>
            ) : (
              filteredClosed.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => openExisting(l.id)}
                  className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{l.name}</span>
                  <span className="bg-muted rounded-full px-1.5 py-0.5 text-[11px] tabular-nums">
                    {memberCount(l)}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="border-t p-1">
            <button
              type="button"
              onClick={() => {
                setPickerOpen(false)
                setQuery("")
                setFormOpen(true)
              }}
              className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium"
            >
              <Plus className="size-4" />
              {c.createNewList}
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <ListFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
