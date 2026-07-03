import * as React from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  Users,
  Pencil,
  Check,
  Columns3,
  Waypoints,
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
import { ColumnManager } from "@/components/common/ColumnManager"
import { TableViews } from "@/components/common/TableViews"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { BulkAddDialog } from "@/components/common/BulkAddDialog"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { downloadCsv } from "@/lib/csv"
import { prospectSource } from "@/lib/format"
import { RecordActionsMenu } from "@/components/common/RecordActionsMenu"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { WarmIntrosPanel } from "@/pages/WarmIntros"
import {
  PEOPLE_COLUMNS,
  PEOPLE_GROUPS,
  PEOPLE_DEFAULT_IDS,
  AI_COLUMN_GROUP,
  aiColumnsToDefs,
  useColumnPrefs,
} from "@/lib/table-columns"
import { useAiColumns, aiColumnStore } from "@/lib/ai-columns"
import { AddAiColumnDialog } from "@/components/common/AddAiColumnDialog"
import { EmptyState } from "@/components/common/EmptyState"
import { useProspects, prospectStore, useLists } from "@/lib/store"
import { ListSelector } from "@/components/common/ListSelector"
import { useReleaseMode } from "@/lib/release-mode"
import { STATUS_LABELS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Prospect, ProspectStatus } from "@/lib/types"

const ALL = "all"
const STATUSES = Object.keys(STATUS_LABELS) as ProspectStatus[]

const COPY = {
  en: {
    title: "Prospects",
    description:
      "Everyone you've found — across searches, imports, lists & campaigns. Select to enrich, export, or add to a list or campaign.",
    exportedToast: (n: number) => `Exported ${n} to CSV`,
    enrichToast: (n: number) => `Enriching ${n} ${n === 1 ? "prospect" : "prospects"}…`,
    lookalikeToast: (n: number) => `Finding lookalikes from ${n} selected…`,
    tabPeople: "Discovered",
    tabIntros: "Warm Intros",
    addPerson: "Find prospects",
    introTitle: "Work your prospects like a list",
    introDescription:
      "Browse everyone you're tracking, filter by status or fit, and jump straight into a profile or sequence.",
    introPoints: [
      "Sort and filter by score, status & seniority",
      "Switch between table and card views",
      "Add a prospect to a list or campaign",
      "Export the filtered set to CSV",
    ],
    searchPlaceholder: "Search by name, title, company, or email…",
    status: "Status",
    allStatuses: "All statuses",
    person: "prospect",
    people: "prospects",
    noMatch: "No prospects match your filters.",
    allProspects: "All prospects",
    searchLists: "Search lists…",
    createList: "Create list",
    viewTable: "Table",
    viewCards: "Cards",
    columns: "Columns",
    edit: "Edit",
    done: "Done",
    editingHint: "Editing — changes save automatically",
    selectAll: "Select all",
  },
  es: {
    title: "Prospectos",
    description:
      "Todos los prospectos que has encontrado — de búsquedas, importaciones, listas y campañas. Selecciona para enriquecer, exportar o añadir a una lista o campaña.",
    exportedToast: (n: number) => `Exportadas ${n} a CSV`,
    enrichToast: (n: number) => `Enriqueciendo ${n} ${n === 1 ? "prospecto" : "prospectos"}…`,
    lookalikeToast: (n: number) => `Buscando similares de ${n} seleccionados…`,
    tabPeople: "Descubiertos",
    tabIntros: "Intros cálidas",
    addPerson: "Buscar prospectos",
    introTitle: "Trabaja tus prospectos como una lista",
    introDescription:
      "Explora a todos los que sigues, filtra por estado o encaje, y entra directo a un perfil o secuencia.",
    introPoints: [
      "Ordena y filtra por puntuación, estado y seniority",
      "Cambia entre vista de tabla y tarjetas",
      "Añade un prospecto a una lista o campaña",
      "Exporta el conjunto filtrado a CSV",
    ],
    searchPlaceholder: "Busca por nombre, cargo, empresa o correo…",
    status: "Estado",
    allStatuses: "Todos los estados",
    person: "prospecto",
    people: "prospectos",
    noMatch: "Ningún prospecto coincide con tus filtros.",
    allProspects: "Todos los prospectos",
    searchLists: "Buscar listas…",
    createList: "Crear lista",
    viewTable: "Tabla",
    viewCards: "Tarjetas",
    columns: "Columnas",
    edit: "Editar",
    done: "Listo",
    editingHint: "Editando — los cambios se guardan solos",
    selectAll: "Seleccionar todo",
  },
} as const

export default function People() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isV1 } = useReleaseMode()
  const [searchParams] = useSearchParams()
  const tab: "people" | "intros" = pathname === "/intros" ? "intros" : "people"
  const prospects = useProspects()
  // Allow deep-linking a filter, e.g. account-based "/people?q=Acme".
  const [query, setQuery] = React.useState(() => searchParams.get("q") ?? "")
  const [status, setStatus] = React.useState<string>(ALL)
  const [listFilter, setListFilter] = React.useState<string>("all")
  const [editing, setEditing] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkList, setBulkList] = React.useState(false)
  const [bulkCampaign, setBulkCampaign] = React.useState(false)
  const [bulkEnrich, setBulkEnrich] = React.useState(false)
  const [aiColOpen, setAiColOpen] = React.useState(false)
  const columnPrefs = useColumnPrefs("people", PEOPLE_DEFAULT_IDS)

  // User-defined AI columns merged into the table's column registry.
  const aiCols = useAiColumns("people")
  const allColumns = React.useMemo(
    () => [...PEOPLE_COLUMNS, ...aiColumnsToDefs<Prospect>(aiCols)],
    [aiCols]
  )
  const allGroups = React.useMemo(
    () => (aiCols.length ? [...PEOPLE_GROUPS, AI_COLUMN_GROUP] : PEOPLE_GROUPS),
    [aiCols.length]
  )
  const aiColumnIds = React.useMemo(
    () => new Set(aiCols.map((c) => c.id)),
    [aiCols]
  )

  // People lists power the "filter by list" dropdown.
  const peopleLists = useLists().filter((l) => (l.kind ?? "people") === "people")
  const activeList = peopleLists.find((l) => l.id === listFilter)

  const q = query.trim().toLowerCase()
  const results = prospects.filter((p) => {
    const matchesQuery =
      !q ||
      `${p.firstName} ${p.lastName} ${p.title} ${p.company} ${p.email}`
        .toLowerCase()
        .includes(q)
    const matchesStatus = status === ALL || p.status === status
    const matchesList = !activeList || activeList.prospectIds.includes(p.id)
    return matchesQuery && matchesStatus && matchesList
  })

  const allSelected = results.length > 0 && results.every((p) => selectedIds.has(p.id))
  const someSelected = results.some((p) => selectedIds.has(p.id))
  const selectedIdsArr = [...selectedIds]
  const selectedProspects = prospects.filter((p) => selectedIds.has(p.id))

  function toggleRow(p: Prospect) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(p.id)) next.delete(p.id)
      else next.add(p.id)
      return next
    })
  }
  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (results.every((p) => prev.has(p.id))) results.forEach((p) => next.delete(p.id))
      else results.forEach((p) => next.add(p.id))
      return next
    })
  }
  function exportSelected() {
    downloadCsv(
      "people.csv",
      ["Name", "Title", "Company", "Email", "Status", "Location", "Source"],
      selectedProspects.map((p) => [
        `${p.firstName} ${p.lastName}`,
        p.title,
        p.company,
        p.email,
        STATUS_LABELS[p.status],
        p.location,
        prospectSource(p),
      ])
    )
    toast.success(c.exportedToast(selectedProspects.length))
  }
  // Lookalike is a kind of search — hand the seed to the Search page.
  function findLookalikes() {
    const p = selectedProspects[0]
    if (!p) return
    navigate("/search", {
      state: {
        lookalikeSeed: {
          id: p.id,
          kind: "person",
          name: `${p.firstName} ${p.lastName}`,
          sub: `${p.title} @ ${p.company}`,
          industry: p.industry,
          region: "",
          headcount: p.headcount,
        },
      },
    })
  }

  // Warm Intros is V2-only.
  const tabs = [
    { key: "people", to: "/people", label: c.tabPeople, icon: Users },
    ...(isV1
      ? []
      : [{ key: "intros", to: "/intros", label: c.tabIntros, icon: Waypoints }]),
  ]

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => setAddOpen(true)}>
            <SearchIcon className="size-4" />
            {c.addPerson}
          </Button>
        }
      />

      <AddRecordsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        kind="contact"
      />

      {/* Discovered · Lookalikes · Warm Intros (Warm Intros is V2-only). */}
      {tabs.length > 1 && (
      <div className="mb-6 flex items-center gap-1 border-b">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => navigate(tb.to)}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === tb.key
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <tb.icon className="size-4" />
            {tb.label}
          </button>
        ))}
      </div>
      )}

      {tab === "intros" ? (
        <WarmIntrosPanel />
      ) : (
        <>
      <FeatureIntro
        featureKey="people"
        icon={Users}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ListSelector
          value={listFilter}
          onChange={setListFilter}
          lists={peopleLists.map((l) => ({
            id: l.id,
            name: l.name,
            color: l.color,
            count: l.prospectIds.length,
          }))}
          allLabel={c.allProspects}
          allIcon={Users}
          allCount={prospects.length}
          countNoun={(n) => `${n} ${n === 1 ? c.person : c.people}`}
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
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="min-w-[160px]">
            <SelectValue placeholder={c.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{c.allStatuses}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TableViews tableKey="people" prefs={columnPrefs} />
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
          rowKey={(p) => p.id}
          locale={locale}
          editing={editing}
          onUpdate={(p, patch) => prospectStore.update(p.id, patch)}
          actions={(p) => <RecordActionsMenu kind="person" record={p} />}
          selection={{
            isSelected: (p) => selectedIds.has(p.id),
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
        onEnrich={() => setBulkEnrich(true)}
        onAddToList={() => setBulkList(true)}
        onAddToCampaign={() => setBulkCampaign(true)}
        onLookalikes={findLookalikes}
      />

      <BulkAddDialog
        open={bulkList}
        onOpenChange={setBulkList}
        mode="list"
        recordKind="person"
        ids={selectedIdsArr}
      />
      <BulkAddDialog
        open={bulkCampaign}
        onOpenChange={setBulkCampaign}
        mode="campaign"
        recordKind="person"
        ids={selectedIdsArr}
      />
      <EnrichListDialog
        open={bulkEnrich}
        onOpenChange={setBulkEnrich}
        prospects={selectedProspects}
      />

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
        entity="people"
        onCreated={(id) => {
          if (!columnPrefs.visible.includes(id))
            columnPrefs.setVisible([...columnPrefs.visible, id])
        }}
      />
        </>
      )}
    </Page>
  )
}
