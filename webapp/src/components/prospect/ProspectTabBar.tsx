import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocale } from "@/lib/locale"
import { useProspects } from "@/lib/store"
import { prospectTabsStore, useOpenProspectIds } from "@/lib/prospect-tabs"
import { cn } from "@/lib/utils"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    allProspects: "All Prospects",
    closeTab: (name: string) => `Close ${name}`,
    addTab: "Open another prospect",
    searchToOpen: "Search prospects to open…",
    noOtherProspects: "No other prospects to open.",
  },
  es: {
    allProspects: "Todos los prospectos",
    closeTab: (name: string) => `Cerrar ${name}`,
    addTab: "Abrir otro prospecto",
    searchToOpen: "Buscar prospectos para abrir…",
    noOtherProspects: "No hay más prospectos para abrir.",
  },
  it: {
    allProspects: "Tutti i prospect",
    closeTab: (name: string) => `Chiudi ${name}`,
    addTab: "Apri un altro prospect",
    searchToOpen: "Cerca prospect da aprire…",
    noOtherProspects: "Nessun altro prospect da aprire.",
  },
  fr: {
    allProspects: "Tous les prospects",
    closeTab: (name: string) => `Fermer ${name}`,
    addTab: "Ouvrir un autre prospect",
    searchToOpen: "Rechercher des prospects à ouvrir…",
    noOtherProspects: "Aucun autre prospect à ouvrir.",
  },
  de: {
    allProspects: "Alle Prospects",
    closeTab: (name: string) => `${name} schließen`,
    addTab: "Weiteren Prospect öffnen",
    searchToOpen: "Prospects zum Öffnen suchen…",
    noOtherProspects: "Keine weiteren Prospects zum Öffnen.",
  },
  pt: {
    allProspects: "Todos os prospects",
    closeTab: (name: string) => `Fechar ${name}`,
    addTab: "Abrir outro prospect",
    searchToOpen: "Pesquisar prospects para abrir…",
    noOtherProspects: "Não há mais prospects para abrir.",
  },
  pt_BR: {
    allProspects: "Todos os prospects",
    closeTab: (name: string) => `Fechar ${name}`,
    addTab: "Abrir outro prospect",
    searchToOpen: "Buscar prospects para abrir…",
    noOtherProspects: "Não há mais prospects para abrir.",
  },
} as const

function fullName(p: Prospect): string {
  return `${p.firstName} ${p.lastName}`
}

// Chrome/Lemlist-style tab strip for prospects the user has open at
// once — mirrors ListTabBar's shape and store pattern
// (lib/prospect-tabs.ts). "all" means the All Prospects index page
// (/people) is active (no individual prospect selected). Unlike lists,
// there's no "create new prospect" affordance here — prospects aren't
// created via a lightweight form the way lists are.
export function ProspectTabBar({ currentId }: { currentId: string | "all" }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const prospects = useProspects()
  const openIds = useOpenProspectIds(
    React.useMemo(() => prospects.map((p) => p.id), [prospects])
  )
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const activeTabRef = React.useRef<HTMLDivElement>(null)

  const tabs = openIds
    .map((id) => prospects.find((p) => p.id === id))
    .filter((p): p is Prospect => Boolean(p))

  // Keep the active tab visible — the strip clips it at the container's
  // right edge otherwise, both on first mount and when navigating between
  // already-open prospects.
  React.useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [currentId])

  function closeTab(id: string) {
    const remaining = tabs.filter((t) => t.id !== id)
    prospectTabsStore.close(id)
    if (id !== currentId) return
    if (remaining.length > 0) navigate(`/prospects/${remaining[0].id}`)
    else navigate("/people")
  }

  function openExisting(id: string) {
    prospectTabsStore.open(id)
    setPickerOpen(false)
    setQuery("")
    navigate(`/prospects/${id}`)
  }

  const q = query.trim().toLowerCase()
  const closedProspects = prospects.filter((p) => !openIds.includes(p.id))
  const filteredClosed = q
    ? closedProspects.filter((p) => fullName(p).toLowerCase().includes(q))
    : closedProspects

  return (
    <div className="scrollbar-thin-x mb-4 flex items-end gap-0.5 border-b">
      {/* Permanent "All Prospects" tab — always first, never dismissable */}
      <div
        className={cn(
          "relative -mb-px flex shrink-0 items-center rounded-t-lg border transition-colors",
          currentId === "all"
            ? "border-border border-b-background bg-background text-foreground px-4 py-2.5 text-base font-semibold"
            : "border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
        )}
      >
        <Link to="/people">{c.allProspects}</Link>
      </div>

      {tabs.map((t) => {
        const active = t.id === currentId
        return (
          <div
            key={t.id}
            ref={active ? activeTabRef : undefined}
            className={cn(
              "group relative -mb-px flex shrink-0 items-center gap-2 rounded-t-lg border transition-colors",
              active
                ? "border-border border-b-background bg-background text-foreground px-4 py-2.5 text-base font-semibold"
                : "border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
            )}
          >
            <Link to={`/prospects/${t.id}`} className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn("shrink-0 rounded-full", active ? "size-2.5" : "size-2")}
                style={{ backgroundColor: t.avatarColor }}
              />
              <span className={cn("truncate", active ? "max-w-64" : "max-w-40")}>
                {fullName(t)}
              </span>
            </Link>
            <button
              type="button"
              aria-label={c.closeTab(fullName(t))}
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
                {c.noOtherProspects}
              </p>
            ) : (
              filteredClosed.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openExisting(p.id)}
                  className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.avatarColor }}
                  />
                  <span className="min-w-0 flex-1 truncate">{fullName(p)}</span>
                  <span className="text-muted-foreground shrink-0 truncate text-xs">
                    {p.company}
                  </span>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
