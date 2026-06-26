import * as React from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  Plus,
  Users,
  Pencil,
  Check,
  Table2,
  LayoutGrid,
  Columns3,
  MapPin,
  Waypoints,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { downloadCsv } from "@/lib/csv"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
  SourceBadge,
} from "@/components/common/ProspectBits"
import { prospectSource } from "@/lib/format"
import { RecordActionsMenu } from "@/components/common/RecordActionsMenu"
import { ProspectFormDialog } from "@/components/prospect/ProspectFormDialog"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { WarmIntrosPanel } from "@/pages/WarmIntros"
import {
  PEOPLE_COLUMNS,
  PEOPLE_GROUPS,
  PEOPLE_DEFAULT_IDS,
  useColumnPrefs,
} from "@/lib/table-columns"
import { useProspects, prospectStore } from "@/lib/store"
import { useReleaseMode } from "@/lib/release-mode"
import { STATUS_LABELS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Prospect, ProspectStatus } from "@/lib/types"

const ALL = "all"
const STATUSES = Object.keys(STATUS_LABELS) as ProspectStatus[]

const COPY = {
  en: {
    title: "People",
    description:
      "Everyone you've found — across searches, imports, lists & campaigns. Select to enrich, export, or add to a list or campaign.",
    exportedToast: (n: number) => `Exported ${n} to CSV`,
    enrichToast: (n: number) => `Enriching ${n} ${n === 1 ? "prospect" : "prospects"}…`,
    lookalikeToast: (n: number) => `Finding lookalikes from ${n} selected…`,
    tabPeople: "People",
    tabIntros: "Warm Intros",
    addPerson: "Add prospect",
    introTitle: "Work your prospects like a list",
    introDescription:
      "Browse everyone you're tracking, filter by status or fit, and jump straight into a profile or sequence.",
    introPoints: [
      "Sort and filter by score, status & seniority",
      "Switch between table and card views",
      "Add a person to a list or campaign",
      "Export the filtered set to CSV",
    ],
    searchPlaceholder: "Search by name, title, company, or email…",
    status: "Status",
    allStatuses: "All statuses",
    person: "person",
    people: "people",
    noMatch: "No people match your filters.",
    viewTable: "Table",
    viewCards: "Cards",
    columns: "Columns",
    edit: "Edit",
    done: "Done",
    editingHint: "Editing — changes save automatically",
    selectAll: "Select all",
  },
  es: {
    title: "Personas",
    description:
      "Todas las personas que has encontrado — de búsquedas, importaciones, listas y campañas. Selecciona para enriquecer, exportar o añadir a una lista o campaña.",
    exportedToast: (n: number) => `Exportadas ${n} a CSV`,
    enrichToast: (n: number) => `Enriqueciendo ${n} ${n === 1 ? "prospecto" : "prospectos"}…`,
    lookalikeToast: (n: number) => `Buscando similares de ${n} seleccionados…`,
    tabPeople: "Personas",
    tabIntros: "Intros cálidas",
    addPerson: "Añadir prospecto",
    introTitle: "Trabaja tus prospectos como una lista",
    introDescription:
      "Explora a todos los que sigues, filtra por estado o encaje, y entra directo a un perfil o secuencia.",
    introPoints: [
      "Ordena y filtra por puntuación, estado y seniority",
      "Cambia entre vista de tabla y tarjetas",
      "Añade una persona a una lista o campaña",
      "Exporta el conjunto filtrado a CSV",
    ],
    searchPlaceholder: "Busca por nombre, cargo, empresa o correo…",
    status: "Estado",
    allStatuses: "Todos los estados",
    person: "persona",
    people: "personas",
    noMatch: "Ninguna persona coincide con tus filtros.",
    viewTable: "Tabla",
    viewCards: "Tarjetas",
    columns: "Columnas",
    edit: "Editar",
    done: "Listo",
    editingHint: "Editando — los cambios se guardan solos",
    selectAll: "Seleccionar todo",
  },
} as const

type ViewMode = "table" | "cards"

export default function People() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isV1 } = useReleaseMode()
  const tab: "people" | "intros" = pathname === "/intros" ? "intros" : "people"
  const prospects = useProspects()
  const [searchParams] = useSearchParams()
  // Allow deep-linking a filter, e.g. account-based "/people?q=Acme".
  const [query, setQuery] = React.useState(() => searchParams.get("q") ?? "")
  const [status, setStatus] = React.useState<string>(ALL)
  const [view, setView] = React.useState<ViewMode>("table")
  const [editing, setEditing] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [manualOpen, setManualOpen] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkList, setBulkList] = React.useState(false)
  const [bulkCampaign, setBulkCampaign] = React.useState(false)
  const columnPrefs = useColumnPrefs("people", PEOPLE_DEFAULT_IDS)

  const q = query.trim().toLowerCase()
  const results = prospects.filter((p) => {
    const matchesQuery =
      !q ||
      `${p.firstName} ${p.lastName} ${p.title} ${p.company} ${p.email}`
        .toLowerCase()
        .includes(q)
    const matchesStatus = status === ALL || p.status === status
    return matchesQuery && matchesStatus
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

  // Warm Intros is V2-only, so V1 is left with just the People tab.
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
            <Plus className="size-4" />
            {c.addPerson}
          </Button>
        }
      />

      <AddRecordsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        kind="contact"
        onManual={() => setManualOpen(true)}
      />
      <ProspectFormDialog open={manualOpen} onOpenChange={setManualOpen} />

      {/* People ↔ Warm Intros tabs (Warm Intros is V2-only; hidden if alone). */}
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
          </>
        )}
      </div>

      <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
        <span>
          <span className="text-foreground font-medium tabular-nums">
            {results.length}
          </span>{" "}
          {results.length === 1 ? c.person : c.people}
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
          columns={PEOPLE_COLUMNS}
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProspectCard
              key={p.id}
              prospect={p}
              selected={selectedIds.has(p.id)}
              onToggle={() => toggleRow(p)}
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

      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={PEOPLE_COLUMNS}
        groups={PEOPLE_GROUPS}
        prefs={columnPrefs}
        locale={locale}
      />
        </>
      )}
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

function ProspectCard({
  prospect: p,
  selected,
  onToggle,
}: {
  prospect: Prospect
  selected?: boolean
  onToggle?: () => void
}) {
  const { locale } = useLocale()
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
        <ProspectAvatar prospect={p} className="size-10" />
        <div className="min-w-0 flex-1">
          {/* Stretched link makes the whole card clickable without nesting
              the actions button inside an anchor. */}
          <Link to={`/prospects/${p.id}`} className="after:absolute after:inset-0">
            <p className="truncate font-semibold">
              {p.firstName} {p.lastName}
            </p>
          </Link>
          <p className="text-muted-foreground truncate text-sm">{p.title}</p>
        </div>
        <ScoreBadge score={p.score} />
        <RecordActionsMenu kind="person" record={p} className="relative z-10 -mt-1 -mr-1" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusBadge status={p.status} />
        <span className="text-muted-foreground truncate text-xs">{p.company}</span>
      </div>

      <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{p.location}</span>
        </span>
        <span className="text-border">·</span>
        <SourceBadge source={prospectSource(p)} locale={locale} />
      </div>

      {p.signals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {p.signals.slice(0, 2).map((signal) => (
            <Badge key={signal} variant="secondary" className="font-normal">
              {signal}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
