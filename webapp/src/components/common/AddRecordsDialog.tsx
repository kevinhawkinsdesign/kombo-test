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
  MapPin,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { prospectStore, accountStore } from "@/lib/store"
import {
  interpretPrompt,
  searchLeads,
  searchCompanies,
  EMPTY_QUERY,
  type AiQuery,
  type AiLead,
  type AiCompany,
  type AiEntity,
} from "@/lib/mock-ai-search"
import type { AccountTier } from "@/lib/types"

type Kind = "contact" | "company"
type Mode = "search" | "import"

const COPY = {
  en: {
    addPeople: "Add prospects",
    addCompanies: "Add companies",
    contact: "People",
    company: "Companies",
    search: "Search",
    import: "Import",
    searchPeoplePlaceholder:
      "Search the people database — e.g. VPs of Sales at SaaS companies in EMEA",
    searchCompanyPlaceholder:
      "Search the company database — e.g. Series B fintechs hiring sales reps",
    run: "Search",
    results: (n: number) => `${n.toLocaleString()} ${n === 1 ? "result" : "results"}`,
    selectAll: "Select all",
    selectedCount: (n: number) => `${n} selected`,
    addSelectedPeople: (n: number) =>
      n > 0 ? `Add ${n} ${n === 1 ? "prospect" : "prospects"}` : "Add prospects",
    addSelectedCompanies: (n: number) =>
      n > 0 ? `Add ${n} ${n === 1 ? "company" : "companies"}` : "Add companies",
    noResults: "No matches — try a broader search.",
    addedPeople: (n: number) =>
      `${n} ${n === 1 ? "prospect" : "prospects"} added`,
    addedCompanies: (n: number) =>
      `${n} ${n === 1 ? "company" : "companies"} added`,
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
    contact: "Personas",
    company: "Empresas",
    search: "Buscar",
    import: "Importar",
    searchPeoplePlaceholder:
      "Busca en la base de personas — p. ej. VPs de Ventas en empresas SaaS de EMEA",
    searchCompanyPlaceholder:
      "Busca en la base de empresas — p. ej. fintechs Serie B contratando ventas",
    run: "Buscar",
    results: (n: number) =>
      `${n.toLocaleString()} ${n === 1 ? "resultado" : "resultados"}`,
    selectAll: "Seleccionar todo",
    selectedCount: (n: number) => `${n} seleccionados`,
    addSelectedPeople: (n: number) =>
      n > 0 ? `Añadir ${n} ${n === 1 ? "prospecto" : "prospectos"}` : "Añadir prospectos",
    addSelectedCompanies: (n: number) =>
      n > 0 ? `Añadir ${n} ${n === 1 ? "empresa" : "empresas"}` : "Añadir empresas",
    noResults: "Sin coincidencias — prueba una búsqueda más amplia.",
    addedPeople: (n: number) =>
      `${n} ${n === 1 ? "prospecto añadido" : "prospectos añadidos"}`,
    addedCompanies: (n: number) =>
      `${n} ${n === 1 ? "empresa añadida" : "empresas añadidas"}`,
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
 * Full-screen "add records" modal. Adding prospects or companies is always a
 * search within a database, or an import from a file / external source — never
 * a manual form. The same modal serves both, with the People/Companies toggle
 * pre-set by whichever button opened it.
 */
export function AddRecordsDialog({
  open,
  onOpenChange,
  kind,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  kind: Kind
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()

  const [entity, setEntity] = React.useState<AiEntity>(entityFromKind(kind))
  const [mode, setMode] = React.useState<Mode>("search")
  const [input, setInput] = React.useState("")
  const [query, setQuery] = React.useState<AiQuery>({ ...EMPTY_QUERY })
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [wasOpen, setWasOpen] = React.useState(false)

  // Reset on every open so the modal always starts clean on the right entity.
  if (open && !wasOpen) {
    setWasOpen(true)
    setEntity(entityFromKind(kind))
    setMode("search")
    setInput("")
    setQuery({ ...EMPTY_QUERY })
    setSelected(new Set())
  }
  if (!open && wasOpen) setWasOpen(false)

  const leads = React.useMemo(() => searchLeads(query), [query])
  const companies = React.useMemo(() => searchCompanies(query), [query])
  const rowsCount = entity === "people" ? leads.length : companies.length

  function switchEntity(next: AiEntity) {
    setEntity(next)
    setSelected(new Set())
  }

  function runSearch() {
    setQuery(interpretPrompt(input).query)
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
    setSelected((prev) =>
      prev.size === ids.length ? new Set() : new Set(ids)
    )
  }

  function addSelected() {
    if (selected.size === 0) return
    if (entity === "people") {
      const chosen = leads.filter((l) => selected.has(l.id))
      chosen.forEach((l) => materializeLead(l))
      toast.success(c.addedPeople(chosen.length))
    } else {
      const chosen = companies.filter((co) => selected.has(co.id))
      chosen.forEach((co) => materializeCompany(co))
      toast.success(c.addedCompanies(chosen.length))
    }
    onOpenChange(false)
  }

  function leave(to: string) {
    onOpenChange(false)
    navigate(to)
  }

  const title = entity === "people" ? c.addPeople : c.addCompanies

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton fullScreen>
        {/* Header: title, entity toggle, mode tabs */}
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

        {mode === "search" ? (
          <>
            {/* Prompt bar */}
            <div className="border-b px-6 py-4">
              <div className="mx-auto flex max-w-3xl gap-2">
                <div className="relative flex-1">
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
                    className="h-11 pl-9"
                  />
                </div>
                <Button variant="volt" className="h-11" onClick={runSearch}>
                  <Search className="size-4" />
                  {c.run}
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-6 py-3">
                <div className="mb-2 flex items-center gap-3">
                  <Checkbox
                    checked={selected.size > 0 && selected.size === rowsCount}
                    onCheckedChange={toggleAll}
                    aria-label={c.selectAll}
                  />
                  <span className="text-muted-foreground text-sm">
                    {c.results(rowsCount)}
                  </span>
                </div>

                {rowsCount === 0 ? (
                  <p className="text-muted-foreground py-16 text-center text-sm">
                    {c.noResults}
                  </p>
                ) : entity === "people" ? (
                  <div className="divide-y rounded-lg border">
                    {leads.map((l) => (
                      <LeadRow
                        key={l.id}
                        lead={l}
                        checked={selected.has(l.id)}
                        onToggle={() => toggle(l.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y rounded-lg border">
                    {companies.map((co) => (
                      <CompanyRow
                        key={co.id}
                        company={co}
                        checked={selected.has(co.id)}
                        onToggle={() => toggle(co.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between border-t px-6 py-3">
              <span className="text-muted-foreground text-sm tabular-nums">
                {c.selectedCount(selected.size)}
              </span>
              <Button
                variant="volt"
                disabled={selected.size === 0}
                onClick={addSelected}
              >
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
    <label className="hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-3 py-2.5">
      <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={`${l.firstName} ${l.lastName}`} />
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: l.avatarColor }}
      >
        {initials(l.firstName, l.lastName)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {l.firstName} {l.lastName}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {l.title} · {l.company}
        </p>
      </div>
      <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
        <MapPin className="size-3.5" />
        {l.region}
      </span>
      <Badge variant="secondary" className="tabular-nums">
        {l.fit}
      </Badge>
    </label>
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
    <label className="hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-3 py-2.5">
      <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={co.name} />
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: co.logoColor }}
      >
        {co.name.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{co.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {co.industry} · {co.headcount}
        </p>
      </div>
      <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
        <MapPin className="size-3.5" />
        {co.region}
      </span>
      <Badge variant="secondary" className="tabular-nums">
        {co.fit}
      </Badge>
    </label>
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
    brand?: "hubspot" | "linkedin"
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

function materializeLead(l: AiLead): void {
  prospectStore.create({
    firstName: l.firstName,
    lastName: l.lastName,
    title: l.title,
    company: l.company,
    companyDomain: l.companyDomain,
    location: l.location,
    email: `${l.firstName}.${l.lastName}@${l.companyDomain}`
      .toLowerCase()
      .replace(/\s+/g, ""),
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
  })
}

function materializeCompany(co: AiCompany): void {
  const tier: AccountTier =
    co.headcountNum >= 1000
      ? "Enterprise"
      : co.headcountNum >= 200
        ? "Mid-market"
        : "SMB"
  accountStore.create({
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
  })
}
