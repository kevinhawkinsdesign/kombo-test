import * as React from "react"
import { toast } from "sonner"
import {
  Briefcase,
  CalendarDays,
  GitBranch,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { DealFormDialog } from "@/components/deals/DealFormDialog"
import {
  PipelineFunnel,
  usePipelineSummary,
} from "@/components/deals/PipelineFunnel"
import { useView } from "@/lib/view-context"
import {
  useDeals,
  dealStore,
  useConversations,
  useProspects,
} from "@/lib/store"
import { getAccount, DEAL_STAGES } from "@/lib/mock-extra"
import { getRep } from "@/lib/team"
import { initials, formatDate, formatMoney as money } from "@/lib/format"
import { downloadCsv } from "@/lib/csv"
import { cn } from "@/lib/utils"
import type { Deal } from "@/lib/types"

type PrimaryView = "pipeline" | "deals"

const COPY = {
  en: {
    title: "Deals",
    descriptionPipeline: "Top of funnel — where your prospects are.",
    descriptionDeals: "Your CRM pipeline by stage.",
    newDeal: "New deal",
    introTitle: "Manage your pipeline",
    introDescription:
      "Track every open deal through your stages and forecast with confidence.",
    introPoints: [
      "Drag deals across stages",
      "Weighted forecast by win probability",
      "Spot stalled deals before they slip",
    ],
    // Pipeline view
    totalProspects: "In pipeline",
    meetingsSet: "Meetings set",
    conversionRate: "Conversion rate",
    viewPipeline: "Pipeline",
    viewBoard: "Board",
    viewTable: "Table",
    // Deals view
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
    stages: {
      lead: "Lead",
      qualified: "Qualified",
      proposal: "Proposal",
      negotiation: "Negotiation",
      won: "Won",
      lost: "Lost",
    } as Record<Deal["stage"], string>,
    search: "Search deals…",
    exportLabel: "Export",
    exported: "Deals exported to CSV",
    noResults: "No deals match your search.",
    sortValue: "Highest value",
    sortClose: "Closing soonest",
    sortName: "Name (A–Z)",
    sortProbability: "Win probability",
    colName: "Deal",
    colAccount: "Account",
    colStage: "Stage",
    colValue: "Value",
    colProbability: "Win %",
    colClose: "Close date",
    colOwner: "Owner",
    noProspects: "No prospects",
  },
  es: {
    title: "Negocios",
    descriptionPipeline: "Top del funnel — dónde están tus prospectos.",
    descriptionDeals: "Tu pipeline de CRM por etapa.",
    newDeal: "Nuevo negocio",
    introTitle: "Gestiona tu pipeline",
    introDescription:
      "Haz seguimiento de cada negocio abierto a través de tus etapas y prevé con confianza.",
    introPoints: [
      "Arrastra negocios entre etapas",
      "Previsión ponderada por probabilidad de cierre",
      "Detecta negocios estancados antes de que se pierdan",
    ],
    // Pipeline view
    totalProspects: "En pipeline",
    meetingsSet: "Reuniones fijadas",
    conversionRate: "Tasa de conversión",
    viewPipeline: "Pipeline",
    viewBoard: "Tablero",
    viewTable: "Tabla",
    // Deals view
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
    stages: {
      lead: "Lead",
      qualified: "Cualificado",
      proposal: "Propuesta",
      negotiation: "Negociación",
      won: "Ganado",
      lost: "Perdido",
    } as Record<Deal["stage"], string>,
    search: "Buscar negocios…",
    exportLabel: "Exportar",
    exported: "Negocios exportados a CSV",
    noResults: "Ningún negocio coincide con tu búsqueda.",
    sortValue: "Mayor valor",
    sortClose: "Cierre más próximo",
    sortName: "Nombre (A–Z)",
    sortProbability: "Probabilidad de cierre",
    colName: "Negocio",
    colAccount: "Cuenta",
    colStage: "Etapa",
    colValue: "Valor",
    colProbability: "% cierre",
    colClose: "Fecha de cierre",
    colOwner: "Responsable",
    noProspects: "Sin prospectos",
  },
} as const

// Two-way toggle: Pipeline (top-of-funnel conversation view) vs Deals (CRM board)
function ViewSelector({
  view,
  onChange,
  labels,
}: {
  view: PrimaryView
  onChange: (v: PrimaryView) => void
  labels: { pipeline: string; deals: string }
}) {
  const options: { key: PrimaryView; icon: React.ElementType; label: string }[] =
    [
      { key: "pipeline", icon: GitBranch, label: labels.pipeline },
      { key: "deals", icon: LayoutGrid, label: labels.deals },
    ]
  return (
    <div className="bg-muted text-muted-foreground inline-flex h-9 shrink-0 items-center rounded-lg p-[3px]">
      {options.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={view === key}
          className={cn(
            "inline-flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
            view === key
              ? "bg-background text-foreground shadow-sm"
              : "hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

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
  onEdit,
  onDelete,
}: {
  deal: Deal
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const account = getAccount(deal.accountId)
  return (
    <div className="bg-card hover:border-primary/40 space-y-2 rounded-lg border p-3 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{deal.name}</p>
          {account && (
            <p className="text-muted-foreground text-xs">{account.name}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-1 size-7 shrink-0"
              aria-label={c.dealActions}
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

export default function Deals() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { impersonatingId } = useView()
  const deals = useDeals()
  const conversations = useConversations()
  const prospects = useProspects()

  const [primaryView, setPrimaryView] = React.useState<PrimaryView>("pipeline")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingDeal, setEditingDeal] = React.useState<Deal | undefined>(
    undefined
  )
  const [deletingDeal, setDeletingDeal] = React.useState<Deal | null>(null)
  const [dealsSubView, setDealsSubView] =
    React.useState<CollectionView>("cards")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("value")

  const scoped = impersonatingId
    ? deals.filter((d) => d.ownerId === impersonatingId)
    : deals

  const scopedConversations = impersonatingId
    ? conversations.filter((c) => {
        // conversations don't have an ownerId, filter by assigneeId instead
        return (c as { assigneeId?: string }).assigneeId === impersonatingId
      })
    : conversations

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
      [
        c.colName,
        c.colAccount,
        c.colStage,
        c.colValue,
        c.colProbability,
        c.colClose,
      ],
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

  const openDeals = scoped.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  )
  const openPipeline = openDeals.reduce((sum, d) => sum + d.value, 0)
  const weightedForecast = openDeals.reduce(
    (sum, d) => sum + (d.value * d.probability) / 100,
    0
  )

  const pipelineSummary = usePipelineSummary(scopedConversations, prospects)

  const summaryCards =
    primaryView === "pipeline"
      ? [
          { label: c.totalProspects, value: String(pipelineSummary.total) },
          { label: c.meetingsSet, value: String(pipelineSummary.meetingsSet) },
          {
            label: c.conversionRate,
            value: `${pipelineSummary.conversionPct}%`,
          },
        ]
      : [
          { label: c.openPipeline, value: money(openPipeline) },
          {
            label: c.weightedForecast,
            value: money(Math.round(weightedForecast)),
          },
          { label: c.openDeals, value: String(openDeals.length) },
        ]

  const isPipeline = primaryView === "pipeline"

  function openCreate() {
    setEditingDeal(undefined)
    setFormOpen(true)
  }

  function openEdit(deal: Deal) {
    setEditingDeal(deal)
    setFormOpen(true)
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={isPipeline ? c.descriptionPipeline : c.descriptionDeals}
        action={
          <Button variant="volt" onClick={openCreate}>
            <Plus className="size-4" />
            {c.newDeal}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="deals"
        icon={Briefcase}
        title={c.introTitle}
        description={c.introDescription}
        points={c.introPoints}
        className="mb-6"
      />

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((stat) => (
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

      {/* View selector — Pipeline (conversation funnel) vs Deals (CRM board) */}
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ViewSelector
            view={primaryView}
            onChange={setPrimaryView}
            labels={{ pipeline: c.viewPipeline, deals: c.viewBoard }}
          />

          {/* Board / Table get search + sort + export; Pipeline view doesn't */}
          {!isPipeline && (
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
              view={dealsSubView}
              onViewChange={setDealsSubView}
              cardsLabel={c.viewBoard}
              tableLabel={c.viewTable}
              onExport={exportCsv}
              exportLabel={c.exportLabel}
            />
          )}
        </div>
      </div>

      <div>
        {isPipeline && (
          <PipelineFunnel
            conversations={scopedConversations}
            prospects={prospects}
            noProspects={c.noProspects}
          />
        )}

        {!isPipeline &&
          (dealsSubView === "table" ? (
            tableDeals.length === 0 ? (
              <Card className="text-muted-foreground p-8 text-center text-sm">
                {c.noResults}
              </Card>
            ) : (
              <DealTable
                rows={tableDeals}
                c={c}
                onEdit={openEdit}
                onDelete={setDeletingDeal}
              />
            )
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {DEAL_STAGES.map((stage) => {
                const stageDeals = scoped.filter((d) => d.stage === stage.key)
                const stageValue = stageDeals.reduce(
                  (sum, d) => sum + d.value,
                  0
                )
                return (
                  <div
                    key={stage.key}
                    className="bg-muted/40 w-[280px] min-w-[280px] shrink-0 space-y-3 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2 px-1 pt-1">
                      <span className="font-medium">
                        {c.stages[stage.key]}
                      </span>
                      <Badge variant="secondary" className="tabular-nums">
                        {stageDeals.length}
                      </Badge>
                      <span className="text-muted-foreground ml-auto text-sm tabular-nums">
                        {money(stageValue)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {stageDeals.length > 0 ? (
                        stageDeals.map((deal) => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            onEdit={openEdit}
                            onDelete={setDeletingDeal}
                          />
                        ))
                      ) : (
                        <p className="text-muted-foreground px-1 py-6 text-center text-xs">
                          {c.noDeals}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
      </div>

      <DealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
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
    </Page>
  )
}

type Copy = (typeof COPY)[keyof typeof COPY]

const STAGE_VARIANT: Record<
  Deal["stage"],
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  lead: "outline",
  qualified: "secondary",
  proposal: "secondary",
  negotiation: "default",
  won: "success",
  lost: "destructive",
}

function DealTable({
  rows,
  c,
  onEdit,
  onDelete,
}: {
  rows: Deal[]
  c: Copy
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colAccount}</TableHead>
            <TableHead>{c.colStage}</TableHead>
            <TableHead className="text-right">{c.colValue}</TableHead>
            <TableHead className="text-right">{c.colProbability}</TableHead>
            <TableHead className="text-right">{c.colClose}</TableHead>
            <TableHead>{c.colOwner}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((deal) => (
            <TableRow
              key={deal.id}
              className="cursor-pointer"
              onClick={() => onEdit(deal)}
            >
              <TableCell>
                <p className="font-medium">{deal.name}</p>
                <p className="text-muted-foreground text-xs">
                  {deal.contactName}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {getAccount(deal.accountId)?.name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={STAGE_VARIANT[deal.stage]}
                  className="font-normal"
                >
                  {c.stages[deal.stage]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {money(deal.value)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {deal.probability}%
              </TableCell>
              <TableCell className="text-muted-foreground text-right text-xs whitespace-nowrap">
                {formatDate(deal.closeDate)}
              </TableCell>
              <TableCell>
                <OwnerAvatar ownerId={deal.ownerId} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(deal)}>
                      <Pencil className="size-4" />
                      {c.edit}
                    </DropdownMenuItem>
                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                      {c.moveTo}
                    </DropdownMenuLabel>
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
                      <Trash2 className="size-4" />
                      {c.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
