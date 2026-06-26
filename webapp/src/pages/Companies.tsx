import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  Plus,
  Briefcase,
  Users,
  Building2,
  Pencil,
  Check,
  Table2,
  LayoutGrid,
  Columns3,
  Telescope,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/common/DataTable"
import { RecordActionsMenu } from "@/components/common/RecordActionsMenu"
import { ColumnManager } from "@/components/common/ColumnManager"
import { TableViews } from "@/components/common/TableViews"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { BulkAddDialog } from "@/components/common/BulkAddDialog"
import { downloadCsv } from "@/lib/csv"
import { DiscoverFeed } from "@/pages/Discover"
import {
  COMPANY_COLUMNS,
  COMPANY_GROUPS,
  COMPANY_DEFAULT_IDS,
  useColumnPrefs,
} from "@/lib/table-columns"
import { useAccounts, accountStore } from "@/lib/store"
import { getRep } from "@/lib/team"
import { useView } from "@/lib/view-context"
import { initials, formatMoney as money } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Account, AccountTier } from "@/lib/types"

const ALL = "all"
const TIERS: (AccountTier | typeof ALL)[] = [ALL, "Enterprise", "Mid-market", "SMB"]

const COPY = {
  en: {
    title: "Companies",
    description:
      "Every company you've found — across searches, imports & lists. Select to enrich, export, or add to a list.",
    exportedToast: (n: number) => `Exported ${n} to CSV`,
    enrichToast: (n: number) => `Enriching ${n} ${n === 1 ? "company" : "companies"}…`,
    lookalikeToast: (n: number) => `Finding lookalikes from ${n} selected…`,
    tabCompanies: "Companies",
    tabDiscover: "Discover",
    addCompany: "Add company",
    addCompanyToast: "Add company — coming soon",
    introTitle: "Target the accounts that fit",
    introDescription:
      "Track companies that match your ICP and get notified when something changes that's worth a call.",
    introPoints: [
      "See headcount, funding & tech stack",
      "Subscribe to hiring and growth signals",
      "Find the full buying committee",
      "Add a whole account to a list",
    ],
    searchPlaceholder: "Search by name, industry, or domain…",
    tier: "Tier",
    allTiers: "All tiers",
    company: "company",
    companies: "companies",
    noMatch: "No companies match your filters.",
    accountHealth: "Account health",
    openDeals: "Open deals",
    pipeline: "Pipeline",
    contacts: "Contacts",
    unassigned: "Unassigned",
    viewTable: "Table",
    viewCards: "Cards",
    columns: "Columns",
    edit: "Edit",
    done: "Done",
    editingHint: "Editing — changes save automatically",
    selectAll: "Select all",
    colCompany: "Company",
    colIndustry: "Industry",
    colTier: "Tier",
    colEmployees: "Employees",
    colHealth: "Health",
    colOwner: "Owner",
  },
  es: {
    title: "Empresas",
    description:
      "Todas las empresas que has encontrado — de búsquedas, importaciones y listas. Selecciona para enriquecer, exportar o añadir a una lista.",
    exportedToast: (n: number) => `Exportadas ${n} a CSV`,
    enrichToast: (n: number) => `Enriqueciendo ${n} ${n === 1 ? "empresa" : "empresas"}…`,
    lookalikeToast: (n: number) => `Buscando similares de ${n} seleccionadas…`,
    tabCompanies: "Empresas",
    tabDiscover: "Descubrir",
    addCompany: "Añadir empresa",
    addCompanyToast: "Añadir empresa — próximamente",
    introTitle: "Apunta a las cuentas que encajan",
    introDescription:
      "Sigue las empresas que coinciden con tu ICP y recibe avisos cuando cambie algo que merezca una llamada.",
    introPoints: [
      "Consulta plantilla, financiación y tecnología",
      "Suscríbete a señales de contratación y crecimiento",
      "Encuentra el comité de compra completo",
      "Añade una cuenta entera a una lista",
    ],
    searchPlaceholder: "Busca por nombre, sector o dominio…",
    tier: "Segmento",
    allTiers: "Todos los segmentos",
    company: "empresa",
    companies: "empresas",
    noMatch: "Ninguna empresa coincide con tus filtros.",
    accountHealth: "Salud de la cuenta",
    openDeals: "Negocios abiertos",
    pipeline: "Pipeline",
    contacts: "Contactos",
    unassigned: "Sin asignar",
    viewTable: "Tabla",
    viewCards: "Tarjetas",
    columns: "Columnas",
    edit: "Editar",
    done: "Listo",
    editingHint: "Editando — los cambios se guardan solos",
    selectAll: "Seleccionar todo",
    colCompany: "Empresa",
    colIndustry: "Sector",
    colTier: "Segmento",
    colEmployees: "Empleados",
    colHealth: "Salud",
    colOwner: "Responsable",
  },
} as const

function healthTone(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-muted text-muted-foreground"
}

type ViewMode = "table" | "cards"

export default function Companies() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const { impersonatingId } = useView()
  const accounts = useAccounts()
  const [query, setQuery] = React.useState("")
  const [tier, setTier] = React.useState<string>(ALL)
  const [view, setView] = React.useState<ViewMode>("table")
  const [editing, setEditing] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  // URL-addressable tabs: /companies?tab=discover deep-links the Discover tab.
  const [searchParams, setSearchParams] = useSearchParams()
  const mode: "companies" | "discover" =
    searchParams.get("tab") === "discover" ? "discover" : "companies"
  const setMode = (m: "companies" | "discover") =>
    setSearchParams(m === "discover" ? { tab: "discover" } : {}, {
      replace: true,
    })
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkList, setBulkList] = React.useState(false)
  const columnPrefs = useColumnPrefs("companies", COMPANY_DEFAULT_IDS)

  const source = impersonatingId
    ? accounts.filter((a) => a.ownerId === impersonatingId)
    : accounts

  const q = query.trim().toLowerCase()
  const results = source.filter((a) => {
    const matchesQuery =
      !q || `${a.name} ${a.industry} ${a.domain}`.toLowerCase().includes(q)
    const matchesTier = tier === ALL || a.tier === tier
    return matchesQuery && matchesTier
  })

  const allSelected = results.length > 0 && results.every((a) => selectedIds.has(a.id))
  const someSelected = results.some((a) => selectedIds.has(a.id))
  const selectedIdsArr = [...selectedIds]
  const selectedAccounts = accounts.filter((a) => selectedIds.has(a.id))

  function toggleRow(a: Account) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(a.id)) next.delete(a.id)
      else next.add(a.id)
      return next
    })
  }
  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (results.every((a) => prev.has(a.id))) results.forEach((a) => next.delete(a.id))
      else results.forEach((a) => next.add(a.id))
      return next
    })
  }
  function exportSelected() {
    downloadCsv(
      "companies.csv",
      ["Company", "Industry", "Domain", "Tier", "Health", "Pipeline"],
      selectedAccounts.map((a) => [
        a.name,
        a.industry,
        a.domain,
        a.tier,
        a.healthScore,
        a.pipeline,
      ])
    )
    toast.success(c.exportedToast(selectedAccounts.length))
  }
  // Lookalike is a kind of search — hand the seed to the Search page.
  function findLookalikes() {
    const a = selectedAccounts[0]
    if (!a) return
    navigate("/search", {
      state: {
        lookalikeSeed: {
          id: a.id,
          kind: "company",
          name: a.name,
          sub: a.industry,
          industry: a.industry,
          region: "",
          headcount: a.employees,
        },
      },
    })
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => toast.info(c.addCompanyToast)}>
            <Plus className="size-4" />
            {c.addCompany}
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-1 border-b">
        {(
          [
            { key: "companies", label: c.tabCompanies, icon: Building2 },
            { key: "discover", label: c.tabDiscover, icon: Telescope },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              mode === m.key
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <m.icon className="size-4" />
            {m.label}
          </button>
        ))}
      </div>

      {mode === "discover" ? (
        <DiscoverFeed />
      ) : (
        <>
      <FeatureIntro
        featureKey="companies"
        icon={Building2}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="min-w-[150px]">
            <SelectValue placeholder={c.tier} />
          </SelectTrigger>
          <SelectContent>
            {TIERS.map((t) => (
              <SelectItem key={t} value={t}>
                {t === ALL ? c.allTiers : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="bg-muted text-muted-foreground inline-flex h-9 shrink-0 items-center rounded-lg p-[3px]">
          <ViewToggleButton
            active={view === "table"}
            onClick={() => setView("table")}
            icon={Table2}
            label={c.viewTable}
          />
          <ViewToggleButton
            active={view === "cards"}
            onClick={() => setView("cards")}
            icon={LayoutGrid}
            label={c.viewCards}
          />
        </div>

        {view === "table" && (
          <>
            <TableViews tableKey="companies" prefs={columnPrefs} />
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => setColumnsOpen(true)}
            >
              <Columns3 className="size-4" />
              <span className="hidden sm:inline">{c.columns}</span>
            </Button>
            <Button
              variant={editing ? "secondary" : "outline"}
              className="shrink-0"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? (
                <>
                  <Check className="size-4" />
                  {c.done}
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  {c.edit}
                </>
              )}
            </Button>
          </>
        )}
      </div>

      <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
        <span>
          <span className="text-foreground font-medium tabular-nums">
            {results.length}
          </span>{" "}
          {results.length === 1 ? c.company : c.companies}
        </span>
        {view === "table" && editing && (
          <span className="text-primary flex items-center gap-1 text-xs">
            <Pencil className="size-3" />
            {c.editingHint}
          </span>
        )}
        {view === "cards" && results.length > 0 && (
          <label className="ml-1 flex cursor-pointer items-center gap-1.5">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={() => toggleAll()}
            />
            <span>{c.selectAll}</span>
          </label>
        )}
      </div>

      {results.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
          {c.noMatch}
        </div>
      ) : view === "table" ? (
        <DataTable
          columns={COMPANY_COLUMNS}
          visible={columnPrefs.visible}
          rows={results}
          rowKey={(a) => a.id}
          locale={locale}
          editing={editing}
          onUpdate={(a, patch) => accountStore.update(a.id, patch)}
          actions={(a) => <RecordActionsMenu kind="company" record={a} />}
          selection={{
            isSelected: (a) => selectedIds.has(a.id),
            toggle: toggleRow,
            toggleAll,
            allSelected,
            someSelected,
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <CompanyCard
              key={a.id}
              account={a}
              selected={selectedIds.has(a.id)}
              onToggle={() => toggleRow(a)}
            />
          ))}
        </div>
      )}

      <BulkActionsBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onExport={exportSelected}
        onEnrich={() => toast.success(c.enrichToast(selectedIds.size))}
        onAddToList={() => setBulkList(true)}
        onLookalikes={findLookalikes}
      />

      <BulkAddDialog
        open={bulkList}
        onOpenChange={setBulkList}
        mode="list"
        recordKind="company"
        ids={selectedIdsArr}
      />
        </>
      )}

      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={COMPANY_COLUMNS}
        groups={COMPANY_GROUPS}
        prefs={columnPrefs}
        locale={locale}
      />
    </Page>
  )
}

function ViewToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function CompanyCard({
  account: a,
  selected,
  onToggle,
}: {
  account: Account
  selected?: boolean
  onToggle?: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const owner = getRep(a.ownerId)

  return (
    <div
      className={cn(
        "hover:border-primary/40 relative flex flex-col rounded-xl border p-4 transition-colors",
        selected && "border-primary ring-primary/30 ring-1"
      )}
    >
      <div className="flex items-start gap-3">
        {onToggle && (
          <div
            className="relative z-10 pt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={onToggle}
              aria-label="Select"
            />
          </div>
        )}
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold text-white"
          style={{ backgroundColor: a.logoColor }}
        >
          {a.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          {/* Stretched link keeps the actions button out of the anchor. */}
          <Link to={`/companies/${a.id}`} className="after:absolute after:inset-0">
            <p className="truncate font-semibold">{a.name}</p>
          </Link>
          <p className="text-muted-foreground truncate text-sm">{a.domain}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            healthTone(a.healthScore)
          )}
          title={c.accountHealth}
        >
          <span className="bg-current size-1.5 rounded-full opacity-80" />
          {a.healthScore}
        </span>
        <RecordActionsMenu kind="company" record={a} className="relative z-10 -mt-1 -mr-1" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          {a.tier}
        </Badge>
        <span className="text-muted-foreground truncate text-xs">
          {a.industry}
        </span>
      </div>

      <div className="text-muted-foreground mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {a.openDeals}
          </p>
          <p>{c.openDeals}</p>
        </div>
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {money(a.pipeline)}
          </p>
          <p>{c.pipeline}</p>
        </div>
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {a.contacts}
          </p>
          <p>{c.contacts}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {a.signals.slice(0, 2).map((signal) => (
          <Badge key={signal} variant="secondary" className="font-normal">
            {signal}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        {owner ? (
          <>
            <Avatar className="size-6">
              <AvatarFallback
                style={{ backgroundColor: owner.avatarColor, color: "white" }}
                className="text-[10px] font-medium"
              >
                {initials(owner.name.split(" ")[0], owner.name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-xs">
              {owner.name.split(" ")[0]}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Users className="size-3.5" />
            {c.unassigned}
          </span>
        )}
        <Briefcase className="text-muted-foreground ml-auto size-3.5" />
      </div>
    </div>
  )
}
