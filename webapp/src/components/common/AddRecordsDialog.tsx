import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Search,
  Upload,
  Plug,
  Users,
  Building2,
  ArrowRight,
  ArrowDownUp,
  SlidersHorizontal,
  ChevronDown,
  Database,
  X,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { prospectStore, accountStore, listStore } from "@/lib/store"
import { facetsForDb } from "@/lib/search-facets"
import {
  interpretPrompt,
  searchLeads,
  searchCompanies,
  sortLeads,
  sortCompanies,
  EMPTY_QUERY,
  SENIORITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  INDUSTRY_OPTIONS,
  REGION_OPTIONS,
  HEADCOUNT_OPTIONS,
  REVENUE_OPTIONS,
  FOUNDED_OPTIONS,
  GROWTH_OPTIONS,
  TECH_OPTIONS,
  INTENT_OPTIONS,
  SIGNAL_OPTIONS,
  type AiQuery,
  type AiLead,
  type AiCompany,
  type AiEntity,
  type SortKey,
} from "@/lib/mock-ai-search"
import type { AccountTier } from "@/lib/types"

type Kind = "contact" | "company"
type Mode = "search" | "import"

// Typed filter groups — the same core catalog as the Prospect Search page,
// writing into the AiQuery fields the mock search honors. The per-database
// facet catalog (LinkedIn Sales Navigator / Kombo FullEnrich) is layered on
// top via facetsForDb, exactly like the search page.
const FILTER_GROUPS: {
  key: keyof AiQuery
  en: string
  es: string
  options: string[]
  scope?: AiEntity
}[] = [
  { key: "seniority", en: "Seniority", es: "Antigüedad", options: SENIORITY_OPTIONS, scope: "people" },
  { key: "departments", en: "Department", es: "Departamento", options: DEPARTMENT_OPTIONS, scope: "people" },
  { key: "regions", en: "Region", es: "Región", options: REGION_OPTIONS },
  { key: "industries", en: "Industry", es: "Sector", options: INDUSTRY_OPTIONS },
  { key: "headcount", en: "Company size", es: "Tamaño de empresa", options: HEADCOUNT_OPTIONS },
  { key: "revenue", en: "Revenue", es: "Ingresos", options: REVENUE_OPTIONS },
  { key: "founded", en: "Founded", es: "Fundación", options: FOUNDED_OPTIONS, scope: "companies" },
  { key: "growth", en: "Growth", es: "Crecimiento", options: GROWTH_OPTIONS, scope: "companies" },
  { key: "technologies", en: "Technology", es: "Tecnología", options: TECH_OPTIONS },
  { key: "intent", en: "Buyer intent", es: "Intención", options: INTENT_OPTIONS, scope: "people" },
  { key: "signals", en: "Signals", es: "Señales", options: SIGNAL_OPTIONS },
]

const COPY = {
  en: {
    addPeople: "Add prospects",
    addCompanies: "Add companies",
    scopeBanner: (names: string) => `Finding people at ${names}`,
    contact: "People",
    company: "Companies",
    search: "Search",
    import: "Import",
    searchPeoplePlaceholder: "Search people — e.g. VPs of Sales at SaaS companies",
    searchCompanyPlaceholder: "Search companies — e.g. Series B fintechs hiring sales",
    run: "Search",
    filters: "Filters",
    clearAll: "Clear all",
    findValue: "Search values…",
    noValueMatch: "No matching values",
    jobTitle: "Job title",
    addTitle: "Add a job title…",
    results: (n: number) => `${n.toLocaleString()} ${n === 1 ? "result" : "results"}`,
    selectAll: "Select all",
    selectedCount: (n: number) => `${n} selected`,
    sortFit: "Best match",
    sortName: "Name (A–Z)",
    sortCompany: "Company",
    sortSize: "Company size",
    sortRecent: "Most recent",
    colName: "Name",
    colCompany: "Company",
    colIndustry: "Industry",
    colSize: "Size",
    colRegion: "Region",
    colFit: "Fit",
    addSelectedPeople: (n: number) =>
      n > 0 ? `Add ${n} ${n === 1 ? "prospect" : "prospects"}` : "Add prospects",
    addSelectedCompanies: (n: number) =>
      n > 0 ? `Add ${n} ${n === 1 ? "company" : "companies"}` : "Add companies",
    noResults: "No matches — broaden your search or filters.",
    addedPeople: (n: number) => `${n} ${n === 1 ? "prospect" : "prospects"} added`,
    addedCompanies: (n: number) => `${n} ${n === 1 ? "company" : "companies"} added`,
    importTitle: "Import from a file or source",
    importSubtitle:
      "Include either First Name, Last Name & Company, or a LinkedIn profile URL.",
    dropHere: "Drag and drop your file here or ",
    browse: "browse",
    fileTypes: "Supports CSV and Excel files (.csv, .xlsx, .xls)",
    orConnect: "Or import from a connected source",
    hubspot: "Import from HubSpot",
    hubspotList: "Import from a HubSpot List",
    liConnections: "Import your LinkedIn connections",
    liFollowers: "Import your LinkedIn followers",
    importingFile: "Importing — we'll add matches shortly",
    syncing: "Syncing — this can take a moment",
  },
  es: {
    addPeople: "Añadir prospectos",
    addCompanies: "Añadir empresas",
    scopeBanner: (names: string) => `Buscando personas en ${names}`,
    contact: "Personas",
    company: "Empresas",
    search: "Buscar",
    import: "Importar",
    searchPeoplePlaceholder: "Busca personas — p. ej. VPs de Ventas en empresas SaaS",
    searchCompanyPlaceholder: "Busca empresas — p. ej. fintechs Serie B contratando ventas",
    run: "Buscar",
    filters: "Filtros",
    clearAll: "Limpiar todo",
    findValue: "Buscar valores…",
    noValueMatch: "Sin valores coincidentes",
    jobTitle: "Cargo",
    addTitle: "Añadir un cargo…",
    results: (n: number) => `${n.toLocaleString()} ${n === 1 ? "resultado" : "resultados"}`,
    selectAll: "Seleccionar todo",
    selectedCount: (n: number) => `${n} seleccionados`,
    sortFit: "Mejor coincidencia",
    sortName: "Nombre (A–Z)",
    sortCompany: "Empresa",
    sortSize: "Tamaño de empresa",
    sortRecent: "Más reciente",
    colName: "Nombre",
    colCompany: "Empresa",
    colIndustry: "Sector",
    colSize: "Tamaño",
    colRegion: "Región",
    colFit: "Encaje",
    addSelectedPeople: (n: number) =>
      n > 0 ? `Añadir ${n} ${n === 1 ? "prospecto" : "prospectos"}` : "Añadir prospectos",
    addSelectedCompanies: (n: number) =>
      n > 0 ? `Añadir ${n} ${n === 1 ? "empresa" : "empresas"}` : "Añadir empresas",
    noResults: "Sin coincidencias — amplía tu búsqueda o filtros.",
    addedPeople: (n: number) => `${n} ${n === 1 ? "prospecto añadido" : "prospectos añadidos"}`,
    addedCompanies: (n: number) => `${n} ${n === 1 ? "empresa añadida" : "empresas añadidas"}`,
    importTitle: "Importar desde un archivo o fuente",
    importSubtitle:
      "Incluye Nombre, Apellido y Empresa, o una URL de perfil de LinkedIn.",
    dropHere: "Arrastra tu archivo aquí o ",
    browse: "explora",
    fileTypes: "Admite archivos CSV y Excel (.csv, .xlsx, .xls)",
    orConnect: "O importa desde una fuente conectada",
    hubspot: "Importar desde HubSpot",
    hubspotList: "Importar de una lista de HubSpot",
    liConnections: "Importar tus conexiones de LinkedIn",
    liFollowers: "Importar tus seguidores de LinkedIn",
    importingFile: "Importando — añadiremos las coincidencias en breve",
    syncing: "Sincronizando — puede tardar un momento",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function entityFromKind(kind: Kind): AiEntity {
  return kind === "company" ? "companies" : "people"
}

/**
 * Full-screen, full-featured "add records" search. Adding prospects or
 * companies is always a search within a database (with filters, sorting, a
 * results table and multi-select) or an import from a file / source — never a
 * manual form. The same modal serves both, with the entity toggle pre-set.
 */
export function AddRecordsDialog({
  open,
  onOpenChange,
  kind,
  listId,
  scopeCompanies,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  kind: Kind
  // When set, materialized records are also added to this list (used from a
  // list detail page so the full-screen search/import flow is reused there).
  listId?: string
  // When set, the people search is scoped to these company names (account-based
  // flow: pick companies → find their contacts).
  scopeCompanies?: string[]
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()

  const [entity, setEntity] = React.useState<AiEntity>(entityFromKind(kind))
  const [mode, setMode] = React.useState<Mode>("search")
  const [input, setInput] = React.useState("")
  const [query, setQuery] = React.useState<AiQuery>({ ...EMPTY_QUERY })
  const [sortKey, setSortKey] = React.useState<SortKey>("fit")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [linkedinOn, setLinkedinOn] = React.useState(false)
  const [wasOpen, setWasOpen] = React.useState(false)

  const scoped = (scopeCompanies?.length ?? 0) > 0

  if (open && !wasOpen) {
    setWasOpen(true)
    // Scoping to companies means we're finding their people.
    setEntity(scoped ? "people" : entityFromKind(kind))
    setMode("search")
    setInput("")
    setQuery({ ...EMPTY_QUERY })
    setSortKey("fit")
    setSelected(new Set())
    setLinkedinOn(false)
  }
  if (!open && wasOpen) setWasOpen(false)

  const scopeSet = React.useMemo(
    () => new Set((scopeCompanies ?? []).map((s) => s.toLowerCase())),
    [scopeCompanies]
  )
  const leads = React.useMemo(() => {
    const base = sortLeads(searchLeads(query), sortKey)
    if (!scopeSet.size) return base
    const filtered = base.filter((l) => scopeSet.has(l.company.toLowerCase()))
    // Mock fallback: the demo lead catalog may not overlap the selected
    // accounts, so still surface people rather than an empty table.
    return filtered.length ? filtered : base
  }, [query, sortKey, scopeSet])
  const companies = React.useMemo(
    () => sortCompanies(searchCompanies(query), sortKey),
    [query, sortKey]
  )
  const rowsCount = entity === "people" ? leads.length : companies.length

  function switchEntity(next: AiEntity) {
    setEntity(next)
    setSelected(new Set())
  }
  function runSearch() {
    setQuery((prev) => ({ ...interpretPrompt(input).query, facets: prev.facets }))
    setSelected(new Set())
  }
  function toggleFilter(key: keyof AiQuery, value: string) {
    setSelected(new Set())
    setQuery((prev) => {
      const arr = prev[key] as string[]
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value]
      return { ...prev, [key]: next }
    })
  }
  function toggleFacet(facetId: string, value: string) {
    setSelected(new Set())
    setQuery((prev) => {
      const cur = prev.facets[facetId] ?? []
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value]
      return { ...prev, facets: { ...prev.facets, [facetId]: next } }
    })
  }
  function clearFilters() {
    setQuery((prev) => ({ ...EMPTY_QUERY, keywords: prev.keywords }))
    setSelected(new Set())
  }
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAll() {
    const ids = entity === "people" ? leads.map((l) => l.id) : companies.map((co) => co.id)
    setSelected((prev) => (prev.size === ids.length ? new Set() : new Set(ids)))
  }
  function addSelected() {
    if (selected.size === 0) return
    if (entity === "people") {
      const chosen = leads.filter((l) => selected.has(l.id))
      const newIds = chosen.map(materializeLead)
      if (listId) listStore.addProspects(listId, newIds)
      toast.success(c.addedPeople(chosen.length))
    } else {
      const chosen = companies.filter((co) => selected.has(co.id))
      const newIds = chosen.map(materializeCompany)
      if (listId) listStore.addAccounts(listId, newIds)
      toast.success(c.addedCompanies(chosen.length))
    }
    onOpenChange(false)
  }
  function leave(to: string) {
    onOpenChange(false)
    navigate(to)
  }

  const groups = FILTER_GROUPS.filter((g) => !g.scope || g.scope === entity)
  const facetDefs = facetsForDb(linkedinOn ? "linkedin" : "kombo", entity)
  const activeFilterCount =
    groups.reduce((n, g) => n + (query[g.key] as string[]).length, 0) +
    facetDefs.reduce((n, f) => n + (query.facets[f.id]?.length ?? 0), 0)
  const sortOptions: { key: SortKey; label: string }[] =
    entity === "people"
      ? [
          { key: "fit", label: c.sortFit },
          { key: "name", label: c.sortName },
          { key: "company", label: c.sortCompany },
          { key: "recent", label: c.sortRecent },
        ]
      : [
          { key: "fit", label: c.sortFit },
          { key: "name", label: c.sortName },
          { key: "headcount", label: c.sortSize },
          { key: "recent", label: c.sortRecent },
        ]
  const sortLabel = sortOptions.find((o) => o.key === sortKey)?.label ?? c.sortFit
  const title = entity === "people" ? c.addPeople : c.addCompanies

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton fullScreen>
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-6 py-3 pr-14">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <Segmented
            options={[
              { v: "people" as AiEntity, label: c.contact, icon: Users },
              { v: "companies" as AiEntity, label: c.company, icon: Building2 },
            ]}
            value={entity}
            onChange={switchEntity}
          />
          <Segmented
            className="ml-auto"
            options={[
              { v: "search" as Mode, label: c.search, icon: Search },
              { v: "import" as Mode, label: c.import, icon: Upload },
            ]}
            value={mode}
            onChange={setMode}
          />
        </header>

        {scoped && (
          <div className="text-muted-foreground bg-primary/[0.04] flex items-center gap-2 border-b px-6 py-2 text-sm">
            <Building2 className="text-primary size-4 shrink-0" />
            <span className="truncate">
              {c.scopeBanner((scopeCompanies ?? []).join(", "))}
            </span>
          </div>
        )}

        {mode === "search" ? (
          <>
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Filters rail — exposed by default */}
              <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r md:flex">
                <div className="flex items-center justify-between border-b px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <SlidersHorizontal className="size-4" />
                    {c.filters}
                    {activeFilterCount > 0 && (
                      <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      {c.clearAll}
                    </button>
                  )}
                </div>
                {/* Database — switches the per-database facet catalog. */}
                <div className="border-b p-2">
                  <Segmented
                    options={[
                      { v: "kombo", label: "Kombo", icon: Database },
                      { v: "linkedin", label: "Sales Nav", icon: LinkedinIcon },
                    ]}
                    value={linkedinOn ? "linkedin" : "kombo"}
                    onChange={(v) => setLinkedinOn(v === "linkedin")}
                  />
                </div>
                <div className="p-1">
                  <TitleFilter
                    c={c}
                    values={query.titles}
                    onAdd={(v) => toggleFilter("titles", v)}
                    onRemove={(v) => toggleFilter("titles", v)}
                  />
                  {groups.map((g) => (
                    <FilterGroup
                      key={g.key as string}
                      label={locale === "es" ? g.es : g.en}
                      options={g.options}
                      selected={query[g.key] as string[]}
                      onToggle={(v) => toggleFilter(g.key, v)}
                      searchPlaceholder={c.findValue}
                      noMatchLabel={c.noValueMatch}
                    />
                  ))}
                  {facetDefs.map((f) => (
                    <FilterGroup
                      key={f.id}
                      label={f.label[locale]}
                      options={f.options}
                      selected={query.facets[f.id] ?? []}
                      onToggle={(v) => toggleFacet(f.id, v)}
                      searchPlaceholder={c.findValue}
                      noMatchLabel={c.noValueMatch}
                    />
                  ))}
                </div>
              </aside>

              {/* Main: prompt + sort, then results table */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2 border-b px-6 py-3">
                  <div className="relative min-w-[16rem] flex-1">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runSearch()}
                      placeholder={
                        entity === "people"
                          ? c.searchPeoplePlaceholder
                          : c.searchCompanyPlaceholder
                      }
                      clearable={false}
                      className="h-10 pl-9"
                    />
                  </div>
                  <Button variant="volt" className="h-10" onClick={runSearch}>
                    <Search className="size-4" />
                    {c.run}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10">
                        <ArrowDownUp className="size-4" />
                        <span className="hidden sm:inline">{sortLabel}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sortOptions.map((o) => (
                        <DropdownMenuItem key={o.key} onClick={() => setSortKey(o.key)}>
                          {o.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-muted-foreground border-b px-6 py-1.5 text-xs">
                  {c.results(rowsCount)}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {rowsCount === 0 ? (
                    <p className="text-muted-foreground py-16 text-center text-sm">
                      {c.noResults}
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-muted-foreground sticky top-0 text-xs">
                        <tr>
                          <th className="w-10 px-3 py-2">
                            <Checkbox
                              checked={selected.size > 0 && selected.size === rowsCount}
                              onCheckedChange={toggleAll}
                              aria-label={c.selectAll}
                            />
                          </th>
                          <th className="px-2 py-2 text-left font-medium">{c.colName}</th>
                          <th className="px-2 py-2 text-left font-medium">
                            {entity === "people" ? c.colCompany : c.colIndustry}
                          </th>
                          <th className="hidden px-2 py-2 text-left font-medium sm:table-cell">
                            {entity === "people" ? c.colRegion : c.colSize}
                          </th>
                          <th className="px-2 py-2 text-right font-medium">{c.colFit}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entity === "people"
                          ? leads.map((l) => (
                              <LeadRow
                                key={l.id}
                                lead={l}
                                checked={selected.has(l.id)}
                                onToggle={() => toggle(l.id)}
                              />
                            ))
                          : companies.map((co) => (
                              <CompanyRow
                                key={co.id}
                                company={co}
                                checked={selected.has(co.id)}
                                onToggle={() => toggle(co.id)}
                              />
                            ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Action bar */}
            <footer className="flex items-center justify-between border-t px-6 py-3">
              <span className="text-muted-foreground text-sm tabular-nums">
                {c.selectedCount(selected.size)}
              </span>
              <Button variant="volt" disabled={selected.size === 0} onClick={addSelected}>
                {entity === "people"
                  ? c.addSelectedPeople(selected.size)
                  : c.addSelectedCompanies(selected.size)}
              </Button>
            </footer>
          </>
        ) : (
          <ImportPane
            entity={entity}
            c={c}
            onFile={() => {
              toast.success(c.importingFile)
              onOpenChange(false)
            }}
            onConnect={() => leave("/integrations")}
            onSync={() => {
              toast.success(c.syncing)
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { v: T; label: string; icon: React.ComponentType<{ className?: string }> }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn("bg-muted flex rounded-lg p-[3px]", className)}>
      {options.map((o) => {
        const Icon = o.icon
        const active = value === o.v
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function TitleFilter({
  c,
  values,
  onAdd,
  onRemove,
}: {
  c: Copy
  values: string[]
  onAdd: (v: string) => void
  onRemove: (v: string) => void
}) {
  const [text, setText] = React.useState("")
  return (
    <div className="border-border/70 border-b px-2 py-2">
      <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wide uppercase">
        {c.jobTitle}
      </p>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            e.preventDefault()
            onAdd(text.trim())
            setText("")
          }
        }}
        placeholder={c.addTitle}
        clearable={false}
        className="h-8 text-sm"
      />
      {values.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {values.map((v) => (
            <span
              key={v}
              className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2 text-xs font-medium"
            >
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onRemove(v)}
                className="rounded-full p-0.5 hover:bg-black/10"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
  searchPlaceholder,
  noMatchLabel,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
  searchPlaceholder: string
  noMatchLabel: string
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  // Long option lists get a free-text search so a value can be found by typing.
  const showSearch = options.length > 6
  const q = search.trim().toLowerCase()
  const shown = q ? options.filter((v) => v.toLowerCase().includes(q)) : options
  return (
    <div className="border-border/70 border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hover:bg-muted/40 flex w-full items-center gap-1.5 px-2 py-2 text-left"
      >
        <ChevronDown
          className={cn(
            "text-muted-foreground size-3.5 shrink-0 transition-transform",
            !open && "-rotate-90"
          )}
        />
        <span className="text-muted-foreground flex-1 text-[11px] font-medium tracking-wide uppercase">
          {label}
        </span>
        {selected.length > 0 && (
          <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div className="pb-2">
          {showSearch && (
            <div className="relative px-2 pt-0.5 pb-1.5">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                clearable={false}
                className="h-7 pl-7 text-xs"
              />
            </div>
          )}
          {shown.map((value) => (
            <label
              key={value}
              className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox
                checked={selected.includes(value)}
                onCheckedChange={() => onToggle(value)}
              />
              <span className="flex-1 truncate">{value}</span>
            </label>
          ))}
          {shown.length === 0 && (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">
              {noMatchLabel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function LeadRow({
  lead: l,
  checked,
  onToggle,
}: {
  lead: AiLead
  checked: boolean
  onToggle: () => void
}) {
  return (
    <tr className="hover:bg-muted/40 border-b last:border-b-0">
      <td className="px-3 py-2.5 align-middle">
        <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={`${l.firstName} ${l.lastName}`} />
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: l.avatarColor }}
          >
            {initials(l.firstName, l.lastName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {l.firstName} {l.lastName}
            </p>
            <p className="text-muted-foreground truncate text-xs">{l.title}</p>
          </div>
        </div>
      </td>
      <td className="text-muted-foreground px-2 py-2.5">{l.company}</td>
      <td className="text-muted-foreground hidden px-2 py-2.5 sm:table-cell">{l.region}</td>
      <td className="px-2 py-2.5 text-right">
        <Badge variant="secondary" className="tabular-nums">
          {l.fit}
        </Badge>
      </td>
    </tr>
  )
}

function CompanyRow({
  company: co,
  checked,
  onToggle,
}: {
  company: AiCompany
  checked: boolean
  onToggle: () => void
}) {
  return (
    <tr className="hover:bg-muted/40 border-b last:border-b-0">
      <td className="px-3 py-2.5 align-middle">
        <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={co.name} />
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: co.logoColor }}
          >
            {co.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{co.name}</p>
            <p className="text-muted-foreground truncate text-xs">{co.domain}</p>
          </div>
        </div>
      </td>
      <td className="text-muted-foreground px-2 py-2.5">{co.industry}</td>
      <td className="text-muted-foreground hidden px-2 py-2.5 sm:table-cell">{co.headcount}</td>
      <td className="px-2 py-2.5 text-right">
        <Badge variant="secondary" className="tabular-nums">
          {co.fit}
        </Badge>
      </td>
    </tr>
  )
}

function ImportPane({
  entity,
  c,
  onFile,
  onConnect,
  onSync,
}: {
  entity: AiEntity
  c: Copy
  onFile: () => void
  onConnect: () => void
  onSync: () => void
}) {
  const sources: {
    key: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    brand: "hubspot" | "linkedin"
    onClick: () => void
  }[] = [
    { key: "hubspot", label: c.hubspot, icon: Plug, brand: "hubspot", onClick: onConnect },
    { key: "hubspot-list", label: c.hubspotList, icon: Plug, brand: "hubspot", onClick: onConnect },
    ...(entity === "people"
      ? [
          { key: "li-connections", label: c.liConnections, icon: LinkedinIcon, brand: "linkedin" as const, onClick: onSync },
          { key: "li-followers", label: c.liFollowers, icon: LinkedinIcon, brand: "linkedin" as const, onClick: onSync },
        ]
      : []),
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="text-lg font-semibold">{c.importTitle}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{c.importSubtitle}</p>

        <button
          type="button"
          onClick={onFile}
          className="hover:border-primary/50 hover:bg-muted/40 mt-5 flex w-full flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center transition-colors"
        >
          <span className="bg-muted flex size-12 items-center justify-center rounded-full">
            <Upload className="text-muted-foreground size-5" />
          </span>
          <span className="mt-3 text-sm font-medium">
            {c.dropHere}
            <span className="text-primary underline">{c.browse}</span>
          </span>
          <span className="text-muted-foreground mt-1 text-xs">{c.fileTypes}</span>
        </button>

        <p className="text-muted-foreground mt-6 mb-2 text-xs font-medium tracking-wide uppercase">
          {c.orConnect}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {sources.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.key}
                type="button"
                onClick={s.onClick}
                className="hover:border-primary/40 hover:bg-muted/40 flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    s.brand === "hubspot"
                      ? "bg-[#ff7a59]/15 text-[#ff7a59]"
                      : "bg-[#0a66c2]/10 text-[#0a66c2]"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <ArrowRight className="text-muted-foreground size-4 shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- materializers ----------------------------- */

function materializeLead(l: AiLead): string {
  return prospectStore.create({
    firstName: l.firstName,
    lastName: l.lastName,
    title: l.title,
    company: l.company,
    companyDomain: l.companyDomain,
    location: l.location,
    // Freshly sourced contacts arrive with only basic data — email is revealed
    // later via enrichment.
    email: "",
    linkedinUrl: "",
    avatarColor: l.avatarColor,
    score: l.fit,
    status: "new",
    tags: [],
    seniority: l.seniority,
    department: l.department,
    headcount: l.headcount,
    industry: l.industry,
    revenue: l.revenue,
    about: "",
    signals: l.signals,
    source: "search",
    enriched: false,
  }).id
}

function materializeCompany(co: AiCompany): string {
  const tier: AccountTier =
    co.headcountNum >= 1000
      ? "Enterprise"
      : co.headcountNum >= 200
        ? "Mid-market"
        : "SMB"
  return accountStore.create({
    name: co.name,
    domain: co.domain,
    industry: co.industry,
    employees: co.headcount,
    revenue: co.revenue,
    location: co.location,
    logoColor: co.logoColor,
    tier,
    healthScore: co.fit,
    openDeals: 0,
    pipeline: 0,
    contacts: 0,
    ownerId: "",
    about: "",
    signals: co.signals,
    keyExecutives: [],
  }).id
}
