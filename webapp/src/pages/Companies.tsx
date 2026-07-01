import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  Building2,
  Pencil,
  Check,
  Columns3,
  ScanSearch,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { downloadCsv } from "@/lib/csv"
import { DiscoverFeed } from "@/pages/Discover"
import {
  COMPANY_COLUMNS,
  COMPANY_GROUPS,
  COMPANY_DEFAULT_IDS,
  AI_COLUMN_GROUP,
  aiColumnsToDefs,
  useColumnPrefs,
} from "@/lib/table-columns"
import { useAiColumns, aiColumnStore } from "@/lib/ai-columns"
import { AddAiColumnDialog } from "@/components/common/AddAiColumnDialog"
import { EmptyState } from "@/components/common/EmptyState"
import { useAccounts, accountStore, useLists } from "@/lib/store"
import { ListSelector } from "@/components/common/ListSelector"
import { useView } from "@/lib/view-context"
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
    tabCompanies: "Discovered",
    tabDiscover: "Lookalikes",
    addCompany: "Find companies",
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
    allCompanies: "All companies",
    searchLists: "Search lists…",
    createList: "Create list",
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
    tabCompanies: "Descubiertas",
    tabDiscover: "Similares",
    addCompany: "Buscar empresas",
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
    allCompanies: "Todas las empresas",
    searchLists: "Buscar listas…",
    createList: "Crear lista",
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

export default function Companies() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const { impersonatingId } = useView()
  const accounts = useAccounts()
  const [query, setQuery] = React.useState("")
  const [tier, setTier] = React.useState<string>(ALL)
  const [listFilter, setListFilter] = React.useState<string>("all")
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
  const [addOpen, setAddOpen] = React.useState(false)
  const [findContactsOpen, setFindContactsOpen] = React.useState(false)
  const [aiColOpen, setAiColOpen] = React.useState(false)
  const columnPrefs = useColumnPrefs("companies", COMPANY_DEFAULT_IDS)

  // User-defined AI columns merged into the table's column registry.
  const aiCols = useAiColumns("company")
  const allColumns = React.useMemo(
    () => [...COMPANY_COLUMNS, ...aiColumnsToDefs<Account>(aiCols)],
    [aiCols]
  )
  const allGroups = React.useMemo(
    () => (aiCols.length ? [...COMPANY_GROUPS, AI_COLUMN_GROUP] : COMPANY_GROUPS),
    [aiCols.length]
  )
  const aiColumnIds = React.useMemo(
    () => new Set(aiCols.map((co) => co.id)),
    [aiCols]
  )

  const source = impersonatingId
    ? accounts.filter((a) => a.ownerId === impersonatingId)
    : accounts

  // Company lists power the "filter by list" dropdown.
  const companyLists = useLists().filter((l) => l.kind === "company")
  const activeList = companyLists.find((l) => l.id === listFilter)

  const q = query.trim().toLowerCase()
  const results = source.filter((a) => {
    const matchesQuery =
      !q || `${a.name} ${a.industry} ${a.domain}`.toLowerCase().includes(q)
    const matchesTier = tier === ALL || a.tier === tier
    const matchesList = !activeList || (activeList.accountIds ?? []).includes(a.id)
    return matchesQuery && matchesTier && matchesList
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
          <Button variant="volt" onClick={() => setAddOpen(true)}>
            <SearchIcon className="size-4" />
            {c.addCompany}
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-1 border-b">
        {(
          [
            { key: "companies", label: c.tabCompanies, icon: Building2 },
            { key: "discover", label: c.tabDiscover, icon: ScanSearch },
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
        <ListSelector
          value={listFilter}
          onChange={setListFilter}
          lists={companyLists.map((l) => ({
            id: l.id,
            name: l.name,
            color: l.color,
            count: l.accountIds?.length ?? 0,
          }))}
          allLabel={c.allCompanies}
          allIcon={Building2}
          allCount={source.length}
          countNoun={(n) => `${n} ${n === 1 ? c.company : c.companies}`}
          onCreate={() => navigate("/lists")}
          createLabel={c.createList}
          searchPlaceholder={c.searchLists}
        />
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
      </div>

      {editing && (
        <p className="text-primary mb-3 flex items-center gap-1 text-xs">
          <Pencil className="size-3" />
          {c.editingHint}
        </p>
      )}

      {results.length === 0 ? (
        <EmptyState description={c.noMatch} />
      ) : (
        <DataTable
          columns={allColumns}
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
      )}

      <BulkActionsBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onExport={exportSelected}
        onEnrich={() => toast.success(c.enrichToast(selectedIds.size))}
        onAddToList={() => setBulkList(true)}
        onLookalikes={findLookalikes}
        onFindContacts={() => setFindContactsOpen(true)}
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
        columns={allColumns}
        groups={allGroups}
        prefs={columnPrefs}
        locale={locale}
        onAddAiColumn={() => setAiColOpen(true)}
        aiColumnIds={aiColumnIds}
        onDeleteColumn={(id) => aiColumnStore.remove(id)}
      />
      <AddAiColumnDialog
        open={aiColOpen}
        onOpenChange={setAiColOpen}
        entity="company"
        onCreated={(id) => {
          if (!columnPrefs.visible.includes(id))
            columnPrefs.setVisible([...columnPrefs.visible, id])
        }}
      />

      <AddRecordsDialog open={addOpen} onOpenChange={setAddOpen} kind="company" />
      <AddRecordsDialog
        open={findContactsOpen}
        onOpenChange={setFindContactsOpen}
        kind="contact"
        scopeCompanies={selectedAccounts.map((a) => a.name)}
      />
    </Page>
  )
}
