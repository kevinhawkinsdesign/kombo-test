import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Briefcase,
  Building2,
  CalendarDays,
  Columns3,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  TrendingUp,
  Trash2,
  Users,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { DataTable } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { Segmented } from "@/components/common/Segmented"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { TrendChart, ReplyRateChart } from "@/components/charts/Charts"
import { Funnel } from "@/components/charts/Funnel"
import {
  useColumnPrefs,
  type ColumnDef,
  type ColGroup,
} from "@/lib/table-columns"
import { DealFormDialog } from "@/components/deals/DealFormDialog"
import { DealDetailSheet } from "@/components/deals/DealDetailSheet"
import { useView } from "@/lib/view-context"
import { useDeals, dealStore } from "@/lib/store"
import { getAccount, DEAL_STAGES } from "@/lib/mock-extra"
import { getRep, getScopeData, leaderboard, MONTHS, WEEKS, team } from "@/lib/team"
import { initials, formatDate, formatMoney as money } from "@/lib/format"
import { downloadCsv } from "@/lib/csv"
import { cn } from "@/lib/utils"
import type { Deal } from "@/lib/types"

// Activity volume by channel (derived from team size for a believable mix).
const CHANNELS = [
  { key: "email" as const, label: "Email", icon: Mail, value: 1840, tone: "bg-chart-2" },
  { key: "linkedin" as const, label: "LinkedIn", icon: LinkedinIcon, value: 1120, tone: "bg-chart-1" },
  { key: "calls" as const, label: "Calls", icon: Phone, value: 430, tone: "bg-chart-4" },
]

const COPY = {
  en: {
    title: "Deals",
    description: "Your pipeline by outcome.",
    introTitle: "Manage your pipeline by outcome",
    introDescription:
      "Track every prospect through outcome stages — interested, meeting booked, qualified — and forecast with confidence.",
    introPoints: [
      "Move records across outcome stages",
      "Weighted forecast by win probability",
      "Spot stalled deals before they slip",
    ],
    tabPipeline: "Pipeline",
    tabAnalytics: "Analytics",
    descriptionRep: (name: string) => `Activity insights for ${name} · this quarter`,
    descriptionTeam: "Activity insights across your team · this quarter",
    kpiActivities: "Activities logged",
    kpiMeetings: "Meetings booked",
    kpiReplyRate: "Reply rate",
    kpiPipeline: "Pipeline created",
    pipelineForecast: "Pipeline & forecast",
    pipelineForecastDesc: "Created pipeline vs. closed won, last 6 months",
    funnel: "Conversion funnel",
    funnelDesc: "Prospect → closed won",
    replyTrend: "Reply rate trend",
    replyTrendDesc: "Weekly, across outbound channels",
    activityByChannel: "Activity by channel",
    activityByChannelDesc: "Outreach volume mix",
    repPerformance: "Rep performance",
    repPerformanceDesc: "Breakdown by team member",
    rep: "Rep",
    prospects: "Prospects",
    replyRateCol: "Reply rate",
    meetings: "Meetings",
    pipeline: "Pipeline",
    attainment: "Attainment",
    illustrative: "Figures are illustrative prototype data.",
    channels: { email: "Email", linkedin: "LinkedIn", calls: "Calls" },
    openPipeline: "Open pipeline",
    weightedForecast: "Weighted forecast",
    openDeals: "Open deals",
    noDeals: "No deals",
    dealActions: "Deal actions",
    edit: "Edit",
    moveTo: "Move to",
    delete: "Delete",
    movedTo: (label: string) => `Moved to ${label}`,
    deleteTitle: "Delete deal?",
    deleteDescription: (name: string) =>
      `"${name}" will be permanently removed.`,
    deleteConfirm: "Delete",
    dealDeleted: "Deal deleted",
    deleteSelectedTitle: (n: number) => `Delete ${n} ${n === 1 ? "deal" : "deals"}?`,
    deleteSelectedDescription: "These deals will be permanently removed.",
    dealsDeleted: (n: number) => `${n} ${n === 1 ? "deal" : "deals"} deleted`,
    columns: "Columns",
    stages: {
      interested: "Interested",
      meeting_booked: "Meeting booked",
      needs_review: "Needs review",
      qualified: "Qualified",
      won: "Won",
      not_interested: "Not interested",
      disqualified: "Disqualified",
      lost: "Lost",
    } as Record<Deal["stage"], string>,
    search: "Search deals…",
    viewBoard: "Board",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Deals exported to CSV",
    noResults: "No deals match your search.",
    sortValue: "Highest value",
    sortClose: "Closing soonest",
    sortName: "Name (A–Z)",
    sortProbability: "Win probability",
    entityProspects: "Prospects",
    entityCompanies: "Companies",
    colName: "Deal",
    colAccount: "Account",
    colStage: "Stage",
    colValue: "Value",
    colProbability: "Win %",
    colClose: "Close date",
    colOwner: "Owner",
  },
  es: {
    title: "Negocios",
    description: "Tu pipeline por resultado.",
    introTitle: "Gestiona tu pipeline por resultado",
    introDescription:
      "Haz seguimiento de cada prospecto a través de etapas de resultado — interesado, reunión agendada, cualificado — y prevé con confianza.",
    introPoints: [
      "Mueve registros entre etapas de resultado",
      "Previsión ponderada por probabilidad de cierre",
      "Detecta negocios estancados antes de que se pierdan",
    ],
    tabPipeline: "Pipeline",
    tabAnalytics: "Analíticas",
    descriptionRep: (name: string) => `Métricas de actividad de ${name} · este trimestre`,
    descriptionTeam: "Métricas de actividad de todo tu equipo · este trimestre",
    kpiActivities: "Actividades registradas",
    kpiMeetings: "Reuniones agendadas",
    kpiReplyRate: "Tasa de respuesta",
    kpiPipeline: "Pipeline generado",
    pipelineForecast: "Pipeline y previsión",
    pipelineForecastDesc: "Pipeline generado vs. negocios ganados, últimos 6 meses",
    funnel: "Embudo de conversión",
    funnelDesc: "Prospecto → ganado",
    replyTrend: "Tendencia de la tasa de respuesta",
    replyTrendDesc: "Semanal, en todos los canales de outbound",
    activityByChannel: "Actividad por canal",
    activityByChannelDesc: "Distribución del volumen de outreach",
    repPerformance: "Rendimiento por representante",
    repPerformanceDesc: "Desglose por miembro del equipo",
    rep: "Representante",
    prospects: "Prospectos",
    replyRateCol: "Tasa de respuesta",
    meetings: "Reuniones",
    pipeline: "Pipeline",
    attainment: "Cumplimiento",
    illustrative: "Las cifras son datos ilustrativos de prototipo.",
    channels: { email: "Email", linkedin: "LinkedIn", calls: "Llamadas" },
    openPipeline: "Pipeline abierto",
    weightedForecast: "Previsión ponderada",
    openDeals: "Negocios abiertos",
    noDeals: "Sin negocios",
    dealActions: "Acciones del negocio",
    edit: "Editar",
    moveTo: "Mover a",
    delete: "Eliminar",
    movedTo: (label: string) => `Movido a ${label}`,
    deleteTitle: "¿Eliminar negocio?",
    deleteDescription: (name: string) =>
      `"${name}" se eliminará de forma permanente.`,
    deleteConfirm: "Eliminar",
    dealDeleted: "Negocio eliminado",
    deleteSelectedTitle: (n: number) =>
      `¿Eliminar ${n} ${n === 1 ? "negocio" : "negocios"}?`,
    deleteSelectedDescription: "Estos negocios se eliminarán de forma permanente.",
    dealsDeleted: (n: number) =>
      `${n} ${n === 1 ? "negocio eliminado" : "negocios eliminados"}`,
    columns: "Columnas",
    stages: {
      interested: "Interesado",
      meeting_booked: "Reunión agendada",
      needs_review: "Por revisar",
      qualified: "Cualificado",
      won: "Ganado",
      not_interested: "No interesado",
      disqualified: "Descalificado",
      lost: "Perdido",
    } as Record<Deal["stage"], string>,
    search: "Buscar negocios…",
    viewBoard: "Tablero",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Negocios exportados a CSV",
    noResults: "Ningún negocio coincide con tu búsqueda.",
    sortValue: "Mayor valor",
    sortClose: "Cierre más próximo",
    sortName: "Nombre (A–Z)",
    sortProbability: "Probabilidad de cierre",
    entityProspects: "Prospectos",
    entityCompanies: "Empresas",
    colName: "Negocio",
    colAccount: "Cuenta",
    colStage: "Etapa",
    colValue: "Valor",
    colProbability: "% cierre",
    colClose: "Fecha de cierre",
    colOwner: "Responsable",
  },
} as const

function OwnerAvatar({ ownerId }: { ownerId: string }) {
  const rep = getRep(ownerId)
  if (!rep) return null
  const [first, last] = rep.name.split(" ")
  return (
    <Avatar className="size-6">
      <AvatarFallback
        style={{ backgroundColor: rep.avatarColor, color: "white" }}
        className="text-[10px]"
      >
        {initials(first, last)}
      </AvatarFallback>
    </Avatar>
  )
}

function DealCard({
  deal,
  onOpen,
  onEdit,
  onDelete,
}: {
  deal: Deal
  onOpen: (deal: Deal) => void
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const account = getAccount(deal.accountId)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(deal)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(deal)
      }}
      className="bg-card hover:border-primary/40 space-y-2 rounded-lg border p-3 text-left transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{deal.contactName}</p>
          {account && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Building2 className="size-3" />
              {account.name}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-1 size-7 shrink-0"
              aria-label={c.dealActions}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => onEdit(deal)}>
              <Pencil />
              {c.edit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{c.moveTo}</DropdownMenuLabel>
            {DEAL_STAGES.map((stage) => (
              <DropdownMenuItem
                key={stage.key}
                disabled={stage.key === deal.stage}
                onSelect={() => {
                  dealStore.move(deal.id, stage.key)
                  toast.success(c.movedTo(c.stages[stage.key]))
                }}
              >
                {c.stages[stage.key]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(deal)}
            >
              <Trash2 />
              {c.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="font-semibold tabular-nums">{money(deal.value)}</p>

      <div className="space-y-1">
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${deal.probability}%` }}
          />
        </div>
        <p className="text-muted-foreground text-xs tabular-nums">
          {deal.probability}%
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <CalendarDays className="size-3.5" />
          {formatDate(deal.closeDate)}
        </span>
        <OwnerAvatar ownerId={deal.ownerId} />
      </div>
    </div>
  )
}

// Company-grain board card: one card per account within a stage, its related
// prospects listed inside (each row opens that prospect's deal detail).
function CompanyDealCard({
  accountId,
  deals,
  onOpen,
}: {
  accountId: string
  deals: Deal[]
  onOpen: (deal: Deal) => void
}) {
  const account = getAccount(accountId)
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const avgProbability = Math.round(
    deals.reduce((sum, d) => sum + d.probability, 0) / deals.length
  )
  const nearestClose = deals.reduce(
    (min, d) => (d.closeDate < min ? d.closeDate : min),
    deals[0].closeDate
  )
  return (
    <div className="bg-card space-y-2 rounded-lg border p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Building2 className="text-muted-foreground size-3.5 shrink-0" />
        {account?.name ?? deals[0].contactName}
      </p>

      <p className="font-semibold tabular-nums">{money(totalValue)}</p>

      <div className="space-y-1">
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${avgProbability}%` }}
          />
        </div>
        <p className="text-muted-foreground text-xs tabular-nums">
          {avgProbability}%
        </p>
      </div>

      <div className="space-y-0.5">
        {deals.map((deal) => (
          <button
            key={deal.id}
            type="button"
            onClick={() => onOpen(deal)}
            className="hover:bg-muted/60 flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs"
          >
            <Users className="text-muted-foreground size-3 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{deal.contactName}</span>
            <span className="text-muted-foreground tabular-nums">
              {money(deal.value)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <CalendarDays className="size-3.5" />
          {formatDate(nearestClose)}
        </span>
        <div className="flex -space-x-1.5">
          {[...new Set(deals.map((d) => d.ownerId))].slice(0, 3).map((ownerId) => (
            <OwnerAvatar key={ownerId} ownerId={ownerId} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Deals() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { impersonatingId, impersonating, scope } = useView()
  const deals = useDeals()

  // URL-addressable tabs: /deals?tab=analytics deep-links the Analytics tab.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") ?? "pipeline"

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingDeal, setEditingDeal] = React.useState<Deal | undefined>(
    undefined
  )
  const [deletingDeal, setDeletingDeal] = React.useState<Deal | null>(null)
  const [detailDeal, setDetailDeal] = React.useState<Deal | null>(null)
  const [view, setView] = React.useState<CollectionView>("cards")
  // Board grain: one card per prospect (deal contact) or one card per company
  // with its related prospects listed inside.
  const [boardEntity, setBoardEntity] = React.useState<"prospects" | "companies">(
    "prospects"
  )
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("value")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)
  const dealColPrefs = useColumnPrefs("deals", DEAL_COL_DEFAULT_IDS)

  const scoped = impersonatingId
    ? deals.filter((d) => d.ownerId === impersonatingId)
    : deals

  const tableDeals = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? scoped.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.contactName.toLowerCase().includes(q) ||
            (getAccount(d.accountId)?.name.toLowerCase().includes(q) ?? false)
        )
      : scoped
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "close":
          return (
            new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime()
          )
        case "probability":
          return b.probability - a.probability
        default:
          return b.value - a.value
      }
    })
    return sorted
  }, [scoped, query, sort])

  function exportCsv() {
    downloadCsv(
      "kombo-deals.csv",
      [c.colName, c.colAccount, c.colStage, c.colValue, c.colProbability, c.colClose],
      tableDeals.map((d) => [
        d.name,
        getAccount(d.accountId)?.name ?? "",
        c.stages[d.stage],
        d.value,
        `${d.probability}%`,
        formatDate(d.closeDate),
      ])
    )
    toast.success(c.exported)
  }

  const rowIds = React.useMemo(() => tableDeals.map((d) => d.id), [tableDeals])
  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id))
  const someSelected = rowIds.some((id) => selectedIds.has(id))

  function toggleRow(deal: Deal) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(deal.id)) next.delete(deal.id)
      else next.add(deal.id)
      return next
    })
  }

  function toggleAllRows() {
    setSelectedIds((prev) =>
      prev.size === rowIds.length ? new Set() : new Set(rowIds)
    )
  }

  function exportSelectedCsv() {
    const rows = tableDeals.filter((d) => selectedIds.has(d.id))
    downloadCsv(
      "kombo-deals.csv",
      [c.colName, c.colAccount, c.colStage, c.colValue, c.colProbability, c.colClose],
      rows.map((d) => [
        d.name,
        getAccount(d.accountId)?.name ?? "",
        c.stages[d.stage],
        d.value,
        `${d.probability}%`,
        formatDate(d.closeDate),
      ])
    )
    toast.success(c.exported)
  }

  function deleteSelected() {
    const n = selectedIds.size
    for (const id of selectedIds) dealStore.remove(id)
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
    toast.success(c.dealsDeleted(n))
  }

  // Open pipeline = anything not in a terminal outcome.
  const CLOSED_STAGES: Deal["stage"][] = [
    "won",
    "not_interested",
    "disqualified",
    "lost",
  ]
  const openDeals = scoped.filter((d) => !CLOSED_STAGES.includes(d.stage))
  const openPipeline = openDeals.reduce((sum, d) => sum + d.value, 0)
  const weightedForecast = openDeals.reduce(
    (sum, d) => sum + (d.value * d.probability) / 100,
    0
  )

  const summary = [
    { label: c.openPipeline, value: money(openPipeline) },
    { label: c.weightedForecast, value: money(Math.round(weightedForecast)) },
    { label: c.openDeals, value: String(openDeals.length) },
  ]

  // Analytics tab data (ported from the standalone Analytics page).
  const analyticsData = getScopeData(scope)
  const reps = leaderboard()
  const totalActivities = CHANNELS.reduce((a, ch) => a + ch.value, 0)
  const channelScale = impersonating ? 1 / team.length : 1
  const kpis = [
    {
      label: c.kpiActivities,
      value: Math.round(totalActivities * channelScale).toLocaleString(),
    },
    { label: c.kpiMeetings, value: String(analyticsData.kpis.meetings) },
    { label: c.kpiReplyRate, value: `${analyticsData.kpis.replyRate}%` },
    { label: c.kpiPipeline, value: money(analyticsData.kpis.pipeline) },
  ]

  function openEdit(deal: Deal) {
    setEditingDeal(deal)
    setFormOpen(true)
  }

  function openDetail(deal: Deal) {
    setDetailDeal(deal)
  }

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />

      <FeatureIntro
        featureKey="deals"
        icon={Briefcase}
        title={c.introTitle}
        description={c.introDescription}
        points={c.introPoints}
        className="mb-6"
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="pipeline">{c.tabPipeline}</TabsTrigger>
          <TabsTrigger value="analytics">{c.tabAnalytics}</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <CollectionToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={c.search}
          sort={sort}
          onSortChange={setSort}
          sortOptions={[
            { value: "value", label: c.sortValue },
            { value: "close", label: c.sortClose },
            { value: "probability", label: c.sortProbability },
            { value: "name", label: c.sortName },
          ]}
          view={view}
          onViewChange={setView}
          cardsLabel={c.viewBoard}
          tableLabel={c.viewTable}
          onExport={exportCsv}
          exportLabel={c.exportLabel}
        >
          {view === "table" && (
            <Button variant="outline" onClick={() => setColumnsOpen(true)}>
              <Columns3 className="size-4" />
              <span className="hidden sm:inline">{c.columns}</span>
            </Button>
          )}
        </CollectionToolbar>
      </div>

      {view === "table" ? (
        tableDeals.length === 0 ? (
          <Card className="text-muted-foreground p-8 text-center text-sm">
            {c.noResults}
          </Card>
        ) : (
          <>
            <DataTable
              columns={DEAL_COLUMNS}
              visible={dealColPrefs.visible}
              rows={tableDeals}
              rowKey={(deal) => deal.id}
              locale={locale}
              onRowClick={openDetail}
              selection={{
                isSelected: (deal) => selectedIds.has(deal.id),
                toggle: toggleRow,
                toggleAll: toggleAllRows,
                allSelected,
                someSelected,
              }}
              actions={(deal) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={c.dealActions}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onSelect={() => openEdit(deal)}>
                      <Pencil />
                      {c.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{c.moveTo}</DropdownMenuLabel>
                    {DEAL_STAGES.map((stage) => (
                      <DropdownMenuItem
                        key={stage.key}
                        disabled={stage.key === deal.stage}
                        onSelect={() => {
                          dealStore.move(deal.id, stage.key)
                          toast.success(c.movedTo(c.stages[stage.key]))
                        }}
                      >
                        {c.stages[stage.key]}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeletingDeal(deal)}
                    >
                      <Trash2 />
                      {c.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
            <BulkActionsBar
              count={selectedIds.size}
              onClear={() => setSelectedIds(new Set())}
              onExport={exportSelectedCsv}
              extra={{
                label: c.delete,
                icon: <Trash2 className="size-4" />,
                destructive: true,
                onClick: () => setBulkDeleteOpen(true),
              }}
            />
          </>
        )
      ) : (
        <div className="space-y-3">
          <Segmented
            options={[
              { v: "prospects", label: c.entityProspects, icon: Users },
              { v: "companies", label: c.entityCompanies, icon: Building2 },
            ]}
            value={boardEntity}
            onChange={setBoardEntity}
            className="w-fit"
          />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = scoped.filter((d) => d.stage === stage.key)
              const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
              // Company grain: group the stage's deals by account, preserving
              // deal order so cards don't jump when toggling.
              const byAccount = new Map<string, Deal[]>()
              for (const d of stageDeals) {
                const group = byAccount.get(d.accountId)
                if (group) group.push(d)
                else byAccount.set(d.accountId, [d])
              }
              const cardCount =
                boardEntity === "companies" ? byAccount.size : stageDeals.length
              return (
                <div
                  key={stage.key}
                  className="bg-muted/40 w-[280px] min-w-[280px] shrink-0 space-y-3 rounded-lg p-2"
                >
                  <div className="flex items-center gap-2 px-1 pt-1">
                    <span className="font-medium">{c.stages[stage.key]}</span>
                    <Badge variant="secondary" className="tabular-nums">
                      {cardCount}
                    </Badge>
                    <span className="text-muted-foreground ml-auto text-sm tabular-nums">
                      {money(stageValue)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stageDeals.length === 0 ? (
                      <p className="text-muted-foreground px-1 py-6 text-center text-xs">
                        {c.noDeals}
                      </p>
                    ) : boardEntity === "companies" ? (
                      [...byAccount.entries()].map(([accountId, group]) => (
                        <CompanyDealCard
                          key={accountId}
                          accountId={accountId}
                          deals={group}
                          onOpen={openDetail}
                        />
                      ))
                    ) : (
                      stageDeals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onOpen={openDetail}
                          onEdit={openEdit}
                          onDelete={setDeletingDeal}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="analytics">
          <p className="text-muted-foreground -mt-2 mb-4 text-sm">
            {impersonating ? c.descriptionRep(impersonating.name) : c.descriptionTeam}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Card key={k.label}>
                <CardHeader>
                  <CardDescription>{k.label}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">{k.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{c.pipelineForecast}</CardTitle>
                <CardDescription>{c.pipelineForecastDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <TrendChart
                    labels={MONTHS}
                    pipeline={analyticsData.monthlyPipeline}
                    won={analyticsData.monthlyWon}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{c.funnel}</CardTitle>
                <CardDescription>{c.funnelDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Funnel data={analyticsData.funnel} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{c.replyTrend}</CardTitle>
                <CardDescription>{c.replyTrendDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ReplyRateChart labels={WEEKS} values={analyticsData.weeklyReplyRate} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{c.activityByChannel}</CardTitle>
                <CardDescription>{c.activityByChannelDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon
                  const value = Math.round(ch.value * channelScale)
                  const pct = Math.round((ch.value / totalActivities) * 100)
                  return (
                    <div key={ch.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Icon className="text-muted-foreground size-4" />
                          {c.channels[ch.key]}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {value.toLocaleString()} · {pct}%
                        </span>
                      </div>
                      <div className="bg-muted h-2.5 overflow-hidden rounded-full">
                        <div
                          className={cn("h-full rounded-full", ch.tone)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {!impersonating && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{c.repPerformance}</CardTitle>
                <CardDescription>{c.repPerformanceDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="pl-6">{c.rep}</TableHead>
                      <TableHead className="text-right">{c.prospects}</TableHead>
                      <TableHead className="text-right">{c.replyRateCol}</TableHead>
                      <TableHead className="text-right">{c.meetings}</TableHead>
                      <TableHead className="text-right">{c.pipeline}</TableHead>
                      <TableHead className="pr-6 text-right">
                        {c.attainment}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reps.map((rep) => {
                      const attainment = Math.round(
                        (rep.metrics.won / rep.quota) * 100
                      )
                      return (
                        <TableRow key={rep.id}>
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback
                                  style={{
                                    backgroundColor: rep.avatarColor,
                                    color: "white",
                                  }}
                                  className="text-xs"
                                >
                                  {initials(
                                    rep.name.split(" ")[0],
                                    rep.name.split(" ")[1]
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{rep.name}</p>
                                <p className="text-muted-foreground text-xs">
                                  {rep.role}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {rep.metrics.prospects}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {rep.metrics.replyRate}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {rep.metrics.meetings}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(rep.metrics.pipeline)}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Badge
                              variant={attainment >= 60 ? "success" : "secondary"}
                              className="tabular-nums"
                            >
                              {attainment}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <p className="text-muted-foreground mt-6 flex items-center gap-1.5 text-xs">
            <TrendingUp className="size-3.5" />
            {c.illustrative}
          </p>
        </TabsContent>
      </Tabs>

      <DealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
      />

      <DealDetailSheet
        deal={detailDeal}
        open={detailDeal !== null}
        onOpenChange={(open) => {
          if (!open) setDetailDeal(null)
        }}
        onEdit={(deal) => {
          setDetailDeal(null)
          openEdit(deal)
        }}
        stageLabel={c.stages}
      />

      <ConfirmDialog
        open={deletingDeal !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingDeal(null)
        }}
        title={c.deleteTitle}
        description={
          deletingDeal ? c.deleteDescription(deletingDeal.name) : undefined
        }
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (deletingDeal) {
            dealStore.remove(deletingDeal.id)
            toast.success(c.dealDeleted)
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={c.deleteSelectedTitle(selectedIds.size)}
        description={c.deleteSelectedDescription}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={deleteSelected}
      />

      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={DEAL_COLUMNS}
        groups={DEAL_COL_GROUPS}
        prefs={dealColPrefs}
        locale={locale}
      />
    </Page>
  )
}

const STAGE_VARIANT: Record<
  Deal["stage"],
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  interested: "outline",
  meeting_booked: "secondary",
  needs_review: "secondary",
  qualified: "default",
  won: "success",
  not_interested: "destructive",
  disqualified: "destructive",
  lost: "destructive",
}

// Table-view columns — the same shared registry shape + ColumnManager +
// DataTable every prospect/company table uses (page-local defs, like
// Templates.tsx and Campaigns.tsx).
const DEAL_COL_GROUPS: ColGroup[] = [
  { id: "deal", label: { en: "Deal", es: "Negocio" } },
]
const DEAL_COL_DEFAULT_IDS = [
  "account",
  "stage",
  "value",
  "probability",
  "close",
  "owner",
]

const DEAL_COLUMNS: ColumnDef<Deal>[] = [
  {
    id: "name",
    label: { en: COPY.en.colName, es: COPY.es.colName },
    group: "deal",
    pinned: true,
    minWidth: "200px",
    render: (deal) => (
      <div>
        <p className="font-medium">{deal.name}</p>
        <p className="text-muted-foreground text-xs">{deal.contactName}</p>
      </div>
    ),
  },
  {
    id: "account",
    label: { en: COPY.en.colAccount, es: COPY.es.colAccount },
    group: "deal",
    default: true,
    render: (deal) => (
      <span className="text-muted-foreground text-sm">
        {getAccount(deal.accountId)?.name ?? "—"}
      </span>
    ),
  },
  {
    id: "stage",
    label: { en: COPY.en.colStage, es: COPY.es.colStage },
    group: "deal",
    default: true,
    render: (deal, locale) => (
      <Badge variant={STAGE_VARIANT[deal.stage]} className="font-normal">
        {COPY[locale].stages[deal.stage]}
      </Badge>
    ),
  },
  {
    id: "value",
    label: { en: COPY.en.colValue, es: COPY.es.colValue },
    group: "deal",
    default: true,
    align: "right",
    render: (deal) => (
      <span className="font-medium tabular-nums">{money(deal.value)}</span>
    ),
  },
  {
    id: "probability",
    label: { en: COPY.en.colProbability, es: COPY.es.colProbability },
    group: "deal",
    default: true,
    align: "right",
    render: (deal) => (
      <span className="tabular-nums">{deal.probability}%</span>
    ),
  },
  {
    id: "close",
    label: { en: COPY.en.colClose, es: COPY.es.colClose },
    group: "deal",
    default: true,
    align: "right",
    render: (deal) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatDate(deal.closeDate)}
      </span>
    ),
  },
  {
    id: "owner",
    label: { en: COPY.en.colOwner, es: COPY.es.colOwner },
    group: "deal",
    default: true,
    render: (deal) => <OwnerAvatar ownerId={deal.ownerId} />,
  },
]
