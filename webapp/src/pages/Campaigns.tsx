import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Mail,
  Play,
  Pause,
  MoreHorizontal,
  Clock,
  Send,
  Sparkles,
  RefreshCw,
  CalendarClock,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useCampaigns, useLists, campaignStore } from "@/lib/store"
import { downloadCsv } from "@/lib/csv"
import { formatDate, isCampaignScheduled } from "@/lib/format"
import { useLocale } from "@/lib/locale"
import { useNewCampaign } from "@/components/campaign/NewCampaignWizard"
import type { Campaign, CampaignStatus } from "@/lib/types"

interface CampaignAudience {
  id: string
  name: string
  continuous: boolean
}

const COPY = {
  en: {
    statusLabel: {
      active: "Active",
      paused: "Paused",
      draft: "Draft",
      completed: "Completed",
    } as Record<CampaignStatus, string>,
    createdSteps: (date: string, steps: number) =>
      `Created ${date} · ${steps} steps`,
    fedBy: (name: string) => `Fed by ${name}`,
    continuous: "Continuous",
    pause: "Pause",
    activate: "Activate",
    campaignOptions: "Campaign options",
    editSequence: "Edit sequence",
    duplicate: "Duplicate",
    archive: "Archive",
    enrolled: "Enrolled",
    opened: "Opened",
    replied: "Replied",
    meetings: "Meetings",
    reachedOf: (n: number, m: number) => `${n}/${m} reached`,
    statusSending: "Sending",
    statusPaused: "Paused",
    statusDraft: "Not started",
    statusCompleted: "Completed",
    paused: (name: string) => `${name} paused`,
    activated: (name: string) => `${name} activated`,
    scheduled: "Scheduled",
    startsAt: (d: string) => `Starts ${d}`,
    newCampaign: "New campaign",
    campaignDuplicated: "Campaign duplicated",
    campaignDeleted: "Campaign deleted",
    pageTitle: "Campaigns",
    pageDescription: "Multi-channel sequences across email and LinkedIn.",
    buildSequence: "Build sequence",
    introTitle: "Run multi-step sequences",
    introDescription:
      "Reach prospects across email and LinkedIn with timing that earns replies.",
    introPoints: [
      "Multi-channel, multi-step sequences",
      "A/B test your messaging",
      "Auto-pause the moment someone replies",
      "Track opens, replies & meetings booked",
    ],
    deleteTitle: "Delete campaign?",
    deleteDescription: (name: string) =>
      `"${name}" and its sequence will be permanently removed.`,
    delete: "Delete",
    search: "Search campaigns…",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Campaigns exported to CSV",
    noResults: "No campaigns match your search.",
    sortRecent: "Newest",
    sortName: "Name (A–Z)",
    sortEnrolled: "Most enrolled",
    sortReply: "Reply rate",
    colName: "Campaign",
    colStatus: "Status",
    colReply: "Reply rate",
    colCreated: "Created",
    more: "Campaign options",
  },
  es: {
    statusLabel: {
      active: "Activa",
      paused: "En pausa",
      draft: "Borrador",
      completed: "Completada",
    } as Record<CampaignStatus, string>,
    createdSteps: (date: string, steps: number) =>
      `Creada el ${date} · ${steps} pasos`,
    fedBy: (name: string) => `Alimentada por ${name}`,
    continuous: "Continua",
    pause: "Pausar",
    activate: "Activar",
    campaignOptions: "Opciones de campaña",
    editSequence: "Editar secuencia",
    duplicate: "Duplicar",
    archive: "Archivar",
    enrolled: "Inscritos",
    opened: "Aperturas",
    replied: "Respuestas",
    meetings: "Reuniones",
    reachedOf: (n: number, m: number) => `${n}/${m} alcanzados`,
    statusSending: "Enviando",
    statusPaused: "En pausa",
    statusDraft: "Sin iniciar",
    statusCompleted: "Completada",
    paused: (name: string) => `${name} en pausa`,
    activated: (name: string) => `${name} activada`,
    scheduled: "Programada",
    startsAt: (d: string) => `Empieza el ${d}`,
    newCampaign: "Nueva campaña",
    campaignDuplicated: "Campaña duplicada",
    campaignDeleted: "Campaña eliminada",
    pageTitle: "Campañas",
    pageDescription: "Secuencias multicanal por correo y LinkedIn.",
    buildSequence: "Crear secuencia",
    introTitle: "Ejecuta secuencias de varios pasos",
    introDescription:
      "Llega a tus prospectos por correo y LinkedIn con un ritmo que consigue respuestas.",
    introPoints: [
      "Secuencias multicanal y de varios pasos",
      "Haz pruebas A/B de tus mensajes",
      "Pausa automática en cuanto alguien responde",
      "Mide aperturas, respuestas y reuniones agendadas",
    ],
    deleteTitle: "¿Eliminar campaña?",
    deleteDescription: (name: string) =>
      `«${name}» y su secuencia se eliminarán de forma permanente.`,
    delete: "Eliminar",
    search: "Buscar campañas…",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Campañas exportadas a CSV",
    noResults: "Ninguna campaña coincide con tu búsqueda.",
    sortRecent: "Más recientes",
    sortName: "Nombre (A–Z)",
    sortEnrolled: "Más inscritos",
    sortReply: "Tasa de respuesta",
    colName: "Campaña",
    colStatus: "Estado",
    colReply: "Tasa de respuesta",
    colCreated: "Creada",
    more: "Opciones de campaña",
  },
} as const

const STATUS_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "outline" | "success"
> = {
  active: "success",
  paused: "secondary",
  draft: "outline",
  completed: "default",
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  )
}

function CampaignCard({
  campaign,
  audience,
  onDuplicate,
  onDelete,
}: {
  campaign: Campaign
  audience?: CampaignAudience
  onDuplicate: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const replyRate = campaign.enrolled
    ? Math.round((campaign.replied / campaign.enrolled) * 100)
    : 0
  const scheduled = isCampaignScheduled(campaign)

  function toggleStatus() {
    const nextStatus: CampaignStatus =
      campaign.status === "active" ? "paused" : "active"
    campaignStore.update(campaign.id, { status: nextStatus })
    toast.success(
      nextStatus === "paused"
        ? c.paused(campaign.name)
        : c.activated(campaign.name)
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              <Link
                to={`/campaigns/${campaign.id}`}
                className="hover:text-primary"
              >
                {campaign.name}
              </Link>
            </CardTitle>
            {scheduled ? (
              <Badge variant="secondary" className="gap-1">
                <CalendarClock className="size-3" />
                {c.scheduled}
              </Badge>
            ) : (
              <Badge variant={STATUS_VARIANT[campaign.status]}>
                {c.statusLabel[campaign.status]}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {c.createdSteps(
              formatDate(campaign.createdAt),
              campaign.steps.length
            )}
          </p>
          {scheduled && campaign.scheduledAt && (
            <p className="text-primary flex items-center gap-1.5 text-xs font-medium">
              <CalendarClock className="size-3" />
              {c.startsAt(formatDate(campaign.scheduledAt))}
            </p>
          )}
          {audience && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <Link to={`/lists/${audience.id}`}>
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Sparkles className="size-3" />
                  {c.fedBy(audience.name)}
                </Badge>
              </Link>
              {audience.continuous && (
                <Badge
                  variant="secondary"
                  className="text-chart-1 gap-1 font-normal"
                >
                  <RefreshCw className="size-3" />
                  {c.continuous}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={toggleStatus}>
            {campaign.status === "active" ? (
              <>
                <Pause className="size-4" />
                {c.pause}
              </>
            ) : (
              <>
                <Play className="size-4" />
                {c.activate}
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={c.campaignOptions}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/campaigns/${campaign.id}`}>{c.editSequence}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(campaign)}>
                {c.duplicate}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(campaign)}
              >
                {c.archive}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          <Metric label={c.enrolled} value={campaign.enrolled} />
          <Metric label={c.opened} value={campaign.opened} />
          <Metric label={c.replied} value={`${replyRate}%`} />
          <Metric label={c.meetings} value={campaign.meetings} />
        </div>

        {/* Progress / status — transparency on how far the campaign has run */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              {campaign.status === "active" ? (
                <>
                  <span className="relative flex size-1.5">
                    <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                    <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
                  </span>
                  {c.statusSending}
                </>
              ) : campaign.status === "paused" ? (
                c.statusPaused
              ) : campaign.status === "completed" ? (
                c.statusCompleted
              ) : (
                c.statusDraft
              )}
            </span>
            <span className="tabular-nums">
              {c.reachedOf(campaign.opened, campaign.enrolled)}
            </span>
          </div>
          <Progress
            value={
              campaign.enrolled
                ? Math.round((campaign.opened / campaign.enrolled) * 100)
                : 0
            }
          />
        </div>

        {campaign.steps.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              {campaign.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 text-sm">
                  <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {i + 1}
                  </span>
                  {step.channel === "email" ? (
                    <Mail className="text-muted-foreground size-4" />
                  ) : (
                    <LinkedinIcon className="text-muted-foreground size-4" />
                  )}
                  <span className="truncate">
                    {step.subject ?? step.body}
                  </span>
                  {step.delayDays > 0 && (
                    <span className="text-muted-foreground ml-auto flex shrink-0 items-center gap-1 text-xs">
                      <Clock className="size-3" />+{step.delayDays}d
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CampaignTable({
  rows,
  c,
  replyRateOf,
  onDuplicate,
  onDelete,
}: {
  rows: Campaign[]
  c: (typeof COPY)[keyof typeof COPY]
  replyRateOf: (cm: Campaign) => number
  onDuplicate: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colStatus}</TableHead>
            <TableHead className="text-right">{c.enrolled}</TableHead>
            <TableHead className="text-right">{c.opened}</TableHead>
            <TableHead className="text-right">{c.colReply}</TableHead>
            <TableHead className="text-right">{c.meetings}</TableHead>
            <TableHead className="text-right">{c.colCreated}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cm) => (
            <TableRow key={cm.id}>
              <TableCell>
                <Link
                  to={`/campaigns/${cm.id}`}
                  className="font-medium hover:underline"
                >
                  {cm.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[cm.status]}>
                  {c.statusLabel[cm.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {cm.enrolled}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {cm.opened}
              </TableCell>
              <TableCell className="text-chart-1 text-right font-medium tabular-nums">
                {replyRateOf(cm)}%
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {cm.meetings}
              </TableCell>
              <TableCell className="text-muted-foreground text-right text-xs whitespace-nowrap">
                {formatDate(cm.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={c.more}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/campaigns/${cm.id}`}>{c.editSequence}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(cm)}>
                      {c.duplicate}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(cm)}
                    >
                      {c.archive}
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

export default function Campaigns() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const campaigns = useCampaigns()
  const lists = useLists()
  const { open: openNewCampaign } = useNewCampaign()
  const [pendingDelete, setPendingDelete] = React.useState<Campaign | null>(
    null
  )
  const [view, setView] = React.useState<CollectionView>("table")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("recent")

  const replyRateOf = (cm: Campaign) =>
    cm.enrolled ? Math.round((cm.replied / cm.enrolled) * 100) : 0

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? campaigns.filter((cm) => cm.name.toLowerCase().includes(q))
      : campaigns
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "enrolled":
          return b.enrolled - a.enrolled
        case "reply":
          return replyRateOf(b) - replyRateOf(a)
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })
    return sorted
  }, [campaigns, query, sort])

  function exportCsv() {
    downloadCsv(
      "kombo-campaigns.csv",
      [c.colName, c.colStatus, c.enrolled, c.opened, c.colReply, c.meetings, c.colCreated],
      visible.map((cm) => [
        cm.name,
        c.statusLabel[cm.status],
        cm.enrolled,
        cm.opened,
        `${replyRateOf(cm)}%`,
        cm.meetings,
        formatDate(cm.createdAt),
      ])
    )
    toast.success(c.exported)
  }

  // Map each campaign to the playlist that feeds it (if any).
  const audienceByCampaign = React.useMemo(() => {
    const map = new Map<string, CampaignAudience>()
    for (const list of lists) {
      if (list.campaignId && !map.has(list.campaignId)) {
        map.set(list.campaignId, {
          id: list.id,
          name: list.name,
          continuous: list.sendMode === "continuous",
        })
      }
    }
    return map
  }, [lists])

  function handleDuplicate(campaign: Campaign) {
    const copySuffix = locale === "es" ? "(copia)" : "(copy)"
    campaignStore.create({
      ...campaign,
      name: `${campaign.name} ${copySuffix}`,
    })
    toast.success(c.campaignDuplicated)
  }

  function handleDelete() {
    if (!pendingDelete) return
    campaignStore.remove(pendingDelete.id)
    toast.success(c.campaignDeleted)
  }

  return (
    <Page>
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
        action={
          <Button variant="volt" onClick={openNewCampaign}>
            <Plus className="size-4" />
            {c.newCampaign}
          </Button>
        }
      />
      <FeatureIntro
        featureKey="campaigns"
        icon={Send}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <CollectionToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={c.search}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "recent", label: c.sortRecent },
          { value: "name", label: c.sortName },
          { value: "enrolled", label: c.sortEnrolled },
          { value: "reply", label: c.sortReply },
        ]}
        view={view}
        onViewChange={setView}
        cardsLabel={c.viewCards}
        tableLabel={c.viewTable}
        onExport={exportCsv}
        exportLabel={c.exportLabel}
      />

      {visible.length === 0 ? (
        <Card className="text-muted-foreground p-8 text-center text-sm">
          {c.noResults}
        </Card>
      ) : view === "cards" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              audience={audienceByCampaign.get(campaign.id)}
              onDuplicate={handleDuplicate}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      ) : (
        <CampaignTable
          rows={visible}
          c={c}
          replyRateOf={replyRateOf}
          onDuplicate={handleDuplicate}
          onDelete={setPendingDelete}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title={c.deleteTitle}
        description={
          pendingDelete ? c.deleteDescription(pendingDelete.name) : undefined
        }
        confirmLabel={c.delete}
        destructive
        onConfirm={handleDelete}
      />
    </Page>
  )
}
