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
import { useAccounts } from "@/lib/store"
import { companyTabsStore, useOpenCompanyIds } from "@/lib/company-tabs"
import { cn } from "@/lib/utils"
import type { Account } from "@/lib/types"

const COPY = {
  en: {
    allCompanies: "All Companies",
    closeTab: (name: string) => `Close ${name}`,
    addTab: "Open another company",
    searchToOpen: "Search companies to open…",
    noOtherCompanies: "No other companies to open.",
  },
  es: {
    allCompanies: "Todas las empresas",
    closeTab: (name: string) => `Cerrar ${name}`,
    addTab: "Abrir otra empresa",
    searchToOpen: "Buscar empresas para abrir…",
    noOtherCompanies: "No hay más empresas para abrir.",
  },
  it: {
    allCompanies: "Tutte le aziende",
    closeTab: (name: string) => `Chiudi ${name}`,
    addTab: "Apri un'altra azienda",
    searchToOpen: "Cerca aziende da aprire…",
    noOtherCompanies: "Nessun'altra azienda da aprire.",
  },
  fr: {
    allCompanies: "Toutes les entreprises",
    closeTab: (name: string) => `Fermer ${name}`,
    addTab: "Ouvrir une autre entreprise",
    searchToOpen: "Rechercher des entreprises à ouvrir…",
    noOtherCompanies: "Aucune autre entreprise à ouvrir.",
  },
  de: {
    allCompanies: "Alle Unternehmen",
    closeTab: (name: string) => `${name} schließen`,
    addTab: "Weiteres Unternehmen öffnen",
    searchToOpen: "Unternehmen zum Öffnen suchen…",
    noOtherCompanies: "Keine weiteren Unternehmen zum Öffnen.",
  },
  pt: {
    allCompanies: "Todas as empresas",
    closeTab: (name: string) => `Fechar ${name}`,
    addTab: "Abrir outra empresa",
    searchToOpen: "Pesquisar empresas para abrir…",
    noOtherCompanies: "Não há mais empresas para abrir.",
  },
  pt_BR: {
    allCompanies: "Todas as empresas",
    closeTab: (name: string) => `Fechar ${name}`,
    addTab: "Abrir outra empresa",
    searchToOpen: "Buscar empresas para abrir…",
    noOtherCompanies: "Não há mais empresas para abrir.",
  },
} as const

// Chrome/Lemlist-style tab strip for companies the user has open at
// once — mirrors ListTabBar's shape and store pattern (lib/company-tabs.ts).
// "all" means the All Companies index page is active (no individual company
// selected). Unlike lists, there's no "create new company" affordance here —
// companies aren't created via a lightweight form the way lists are.
export function CompanyTabBar({ currentId }: { currentId: string | "all" }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const accounts = useAccounts()
  const openIds = useOpenCompanyIds(
    React.useMemo(() => accounts.map((a) => a.id), [accounts])
  )
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const activeTabRef = React.useRef<HTMLDivElement>(null)

  const tabs = openIds
    .map((id) => accounts.find((a) => a.id === id))
    .filter((a): a is Account => Boolean(a))

  // Keep the active tab visible — the strip clips it at the container's
  // right edge otherwise, both on first mount and when navigating between
  // already-open companies.
  React.useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [currentId])

  function closeTab(id: string) {
    const remaining = tabs.filter((t) => t.id !== id)
    companyTabsStore.close(id)
    if (id !== currentId) return
    if (remaining.length > 0) navigate(`/companies/${remaining[0].id}`)
    else navigate("/companies")
  }

  function openExisting(id: string) {
    companyTabsStore.open(id)
    setPickerOpen(false)
    setQuery("")
    navigate(`/companies/${id}`)
  }

  const q = query.trim().toLowerCase()
  const closedCompanies = accounts.filter((a) => !openIds.includes(a.id))
  const filteredClosed = q
    ? closedCompanies.filter((a) => a.name.toLowerCase().includes(q))
    : closedCompanies

  return (
    <div className="scrollbar-thin-x mb-4 flex items-end gap-0.5 border-b">
      {/* Permanent "All Companies" tab — always first, never dismissable */}
      <div
        className={cn(
          "relative -mb-px flex shrink-0 items-center rounded-t-lg border transition-colors",
          currentId === "all"
            ? "border-border border-b-background bg-background text-foreground px-4 py-2.5 text-base font-semibold"
            : "border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
        )}
      >
        <Link to="/companies">{c.allCompanies}</Link>
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
            <Link to={`/companies/${t.id}`} className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn("shrink-0 rounded-full", active ? "size-2.5" : "size-2")}
                style={{ backgroundColor: t.logoColor }}
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
                {c.noOtherCompanies}
              </p>
            ) : (
              filteredClosed.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openExisting(a.id)}
                  className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: a.logoColor }}
                  />
                  <span className="min-w-0 flex-1 truncate">{a.name}</span>
                  <span className="text-muted-foreground shrink-0 truncate text-xs">
                    {a.domain}
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
