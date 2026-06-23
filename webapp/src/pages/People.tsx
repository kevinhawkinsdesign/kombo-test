import * as React from "react"
import { Link } from "react-router-dom"
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
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { ProspectAvatar, ScoreBadge, StatusBadge } from "@/components/common/ProspectBits"
import {
  PEOPLE_COLUMNS,
  PEOPLE_GROUPS,
  PEOPLE_DEFAULT_IDS,
  useColumnPrefs,
} from "@/lib/table-columns"
import { useProspects, prospectStore } from "@/lib/store"
import { STATUS_LABELS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Prospect, ProspectStatus } from "@/lib/types"

const ALL = "all"
const STATUSES = Object.keys(STATUS_LABELS) as ProspectStatus[]

const COPY = {
  en: {
    title: "People",
    description: "Every prospect in your book — searchable, filterable, exportable.",
    addPerson: "Add person",
    addPersonToast: "Add person — coming soon",
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
  },
  es: {
    title: "Personas",
    description: "Cada prospecto de tu cartera — buscable, filtrable y exportable.",
    addPerson: "Añadir persona",
    addPersonToast: "Añadir persona — próximamente",
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
  },
} as const

type ViewMode = "table" | "cards"

export default function People() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const prospects = useProspects()
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<string>(ALL)
  const [view, setView] = React.useState<ViewMode>("table")
  const [editing, setEditing] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
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

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => toast.info(c.addPersonToast)}>
            <Plus className="size-4" />
            {c.addPerson}
          </Button>
        }
      />

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
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProspectCard key={p.id} prospect={p} />
          ))}
        </div>
      )}

      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={PEOPLE_COLUMNS}
        groups={PEOPLE_GROUPS}
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

function ProspectCard({ prospect: p }: { prospect: Prospect }) {
  return (
    <Link
      to={`/prospects/${p.id}`}
      className="hover:border-primary/40 flex flex-col rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start gap-3">
        <ProspectAvatar prospect={p} className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {p.firstName} {p.lastName}
          </p>
          <p className="text-muted-foreground truncate text-sm">{p.title}</p>
        </div>
        <ScoreBadge score={p.score} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusBadge status={p.status} />
        <span className="text-muted-foreground truncate text-xs">{p.company}</span>
      </div>

      <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
        <MapPin className="size-3.5 shrink-0" />
        <span className="truncate">{p.location}</span>
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
    </Link>
  )
}
