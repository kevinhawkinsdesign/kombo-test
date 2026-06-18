import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Mail,
  MessageSquare,
  MessageCircle,
  Camera,
  Pause,
  Play,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CampaignDailyChart } from "@/components/charts/Charts"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { AddCampaignProspectsDialog } from "@/components/campaigns/AddCampaignProspectsDialog"
import { getProspect } from "@/lib/mock-data"
import { useCampaigns, useLists, campaignStore } from "@/lib/store"
import { campaignDailyStats, campaignEnrollments } from "@/lib/mock-depth"
import { formatDate, relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import type {
  CampaignStatus,
  StepChannel,
  EnrollmentStatus,
} from "@/lib/types"

const COPY = {
  en: {
    channelLabel: {
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
      instagram: "Instagram DM",
      linkedin_message: "LinkedIn message",
      linkedin_dm: "LinkedIn DM",
      linkedin_inmail: "LinkedIn InMail",
    } as Record<StepChannel, string>,
    statusLabel: {
      active: "Active",
      paused: "Paused",
      draft: "Draft",
      completed: "Completed",
    } as Record<CampaignStatus, string>,
    enrollmentLabel: {
      replied: "Replied",
      active: "Active",
      completed: "Completed",
      paused: "Paused",
      bounced: "Bounced",
    } as Record<EnrollmentStatus, string>,
    campaignNotFound: "Campaign not found.",
    backToCampaigns: "Back to campaigns",
    campaigns: "Campaigns",
    createdSteps: (date: string, steps: number) =>
      `Created ${date} · ${steps} steps`,
    pause: "Pause",
    activate: "Activate",
    edit: "Edit",
    addProspects: "Add prospects",
    paused: (name: string) => `${name} paused`,
    activated: (name: string) => `${name} activated`,
    enrolled: "Enrolled",
    openRate: "Open rate",
    replyRate: "Reply rate",
    meetings: "Meetings",
    tabOverview: "Overview",
    tabSequence: "Sequence",
    tabProspects: "Prospects",
    tabConversations: "Conversations",
    dailyPerformance: "Daily performance",
    dailyPerformanceDesc: "Sent, opened and replied per day.",
    noDailyData: "No daily data yet for this campaign.",
    audience: "Audience",
    audienceDesc:
      "Attach a single prospect list to feed this campaign. The link is 1-to-1; a dynamic list auto-enrolls new matching prospects as they're found.",
    prospectsCount: (count: number) => `${count} prospects`,
    dynamicSuffix: " · dynamic",
    detached: (name: string) => `Detached ${name}`,
    detach: "Detach",
    chooseList: "Choose a list to attach",
    linkedElsewhere: " (linked elsewhere)",
    attached: (name: string) => `Attached ${name}`,
    listAttached: "List attached",
    attach: "Attach",
    noListsToAttach: "No lists available to attach yet.",
    summary: "Summary",
    sent: "Sent",
    opened: "Opened",
    replied: "Replied",
    moveStepUp: "Move step up",
    moveStepDown: "Move step down",
    removeStep: "Remove step",
    stepChannelAria: (n: number) => `Step ${n} channel`,
    wait: "Wait",
    daysBeforeSending: "days before sending",
    subjectLine: "Subject line",
    messageBody: "Message body",
    saveSequence: "Save sequence",
    sequenceSaved: "Sequence saved",
    noSteps: "This sequence has no steps yet.",
    addStep: "Add step",
    thProspect: "Prospect",
    thTitleCompany: "Title / Company",
    thCurrentStep: "Current step",
    thStatus: "Status",
    thLastTouch: "Last touch",
    unknownProspect: "Unknown prospect",
    stepOf: (current: number, total: number) =>
      `Step ${current} of ${total}`,
    justAdded: "Just added",
    removeProspectAria: (name: string) => `Remove ${name}`,
    removedFromCampaign: "Removed from campaign",
    noProspects: "No prospects enrolled yet.",
    noReplies: "No replies yet.",
    viewInInbox: "View in inbox",
    editCampaign: "Edit campaign",
    editCampaignDesc: "Update the campaign name and status.",
    name: "Name",
    namePlaceholder: "Campaign name",
    status: "Status",
    cancel: "Cancel",
    saveChanges: "Save changes",
    campaignUpdated: "Campaign updated",
  },
  es: {
    channelLabel: {
      email: "Correo",
      sms: "SMS",
      whatsapp: "WhatsApp",
      instagram: "Mensaje de Instagram",
      linkedin_message: "Mensaje de LinkedIn",
      linkedin_dm: "Mensaje directo de LinkedIn",
      linkedin_inmail: "InMail de LinkedIn",
    } as Record<StepChannel, string>,
    statusLabel: {
      active: "Activa",
      paused: "En pausa",
      draft: "Borrador",
      completed: "Completada",
    } as Record<CampaignStatus, string>,
    enrollmentLabel: {
      replied: "Respondió",
      active: "Activo",
      completed: "Completado",
      paused: "En pausa",
      bounced: "Rebotado",
    } as Record<EnrollmentStatus, string>,
    campaignNotFound: "Campaña no encontrada.",
    backToCampaigns: "Volver a campañas",
    campaigns: "Campañas",
    createdSteps: (date: string, steps: number) =>
      `Creada el ${date} · ${steps} pasos`,
    pause: "Pausar",
    activate: "Activar",
    edit: "Editar",
    addProspects: "Añadir prospectos",
    paused: (name: string) => `${name} en pausa`,
    activated: (name: string) => `${name} activada`,
    enrolled: "Inscritos",
    openRate: "Tasa de apertura",
    replyRate: "Tasa de respuesta",
    meetings: "Reuniones",
    tabOverview: "Resumen",
    tabSequence: "Secuencia",
    tabProspects: "Prospectos",
    tabConversations: "Conversaciones",
    dailyPerformance: "Rendimiento diario",
    dailyPerformanceDesc: "Enviados, abiertos y respondidos por día.",
    noDailyData: "Aún no hay datos diarios para esta campaña.",
    audience: "Audiencia",
    audienceDesc:
      "Vincula una única lista de prospectos para alimentar esta campaña. La relación es de uno a uno; una lista dinámica inscribe automáticamente los nuevos prospectos que coincidan a medida que se encuentran.",
    prospectsCount: (count: number) => `${count} prospectos`,
    dynamicSuffix: " · dinámica",
    detached: (name: string) => `${name} desvinculada`,
    detach: "Desvincular",
    chooseList: "Elige una lista para vincular",
    linkedElsewhere: " (vinculada en otro lugar)",
    attached: (name: string) => `${name} vinculada`,
    listAttached: "Lista vinculada",
    attach: "Vincular",
    noListsToAttach: "Aún no hay listas disponibles para vincular.",
    summary: "Resumen",
    sent: "Enviados",
    opened: "Aperturas",
    replied: "Respuestas",
    moveStepUp: "Subir paso",
    moveStepDown: "Bajar paso",
    removeStep: "Eliminar paso",
    stepChannelAria: (n: number) => `Canal del paso ${n}`,
    wait: "Espera",
    daysBeforeSending: "días antes de enviar",
    subjectLine: "Asunto",
    messageBody: "Cuerpo del mensaje",
    saveSequence: "Guardar secuencia",
    sequenceSaved: "Secuencia guardada",
    noSteps: "Esta secuencia aún no tiene pasos.",
    addStep: "Añadir paso",
    thProspect: "Prospecto",
    thTitleCompany: "Cargo / Empresa",
    thCurrentStep: "Paso actual",
    thStatus: "Estado",
    thLastTouch: "Último contacto",
    unknownProspect: "Prospecto desconocido",
    stepOf: (current: number, total: number) =>
      `Paso ${current} de ${total}`,
    justAdded: "Recién añadido",
    removeProspectAria: (name: string) => `Eliminar a ${name}`,
    removedFromCampaign: "Eliminado de la campaña",
    noProspects: "Aún no hay prospectos inscritos.",
    noReplies: "Aún no hay respuestas.",
    viewInInbox: "Ver en la bandeja",
    editCampaign: "Editar campaña",
    editCampaignDesc: "Actualiza el nombre y el estado de la campaña.",
    name: "Nombre",
    namePlaceholder: "Nombre de la campaña",
    status: "Estado",
    cancel: "Cancelar",
    saveChanges: "Guardar cambios",
    campaignUpdated: "Campaña actualizada",
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

const ENROLLMENT_VARIANT: Record<
  EnrollmentStatus,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  replied: "success",
  active: "default",
  completed: "secondary",
  paused: "outline",
  bounced: "destructive",
}

const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "active",
  "paused",
  "completed",
]

/* ------------------------------ channel meta ------------------------------ */
interface ChannelMeta {
  tint: string
  Icon: React.ComponentType<{ className?: string }>
}

const CHANNELS: Record<StepChannel, ChannelMeta> = {
  email: { tint: "bg-primary/15 text-primary", Icon: Mail },
  sms: { tint: "bg-chart-4/15 text-chart-4", Icon: MessageSquare },
  whatsapp: {
    tint: "bg-chart-1/15 text-chart-1",
    Icon: MessageCircle,
  },
  instagram: {
    tint: "bg-chart-5/15 text-chart-5",
    Icon: Camera,
  },
  linkedin_message: {
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    Icon: LinkedinIcon,
  },
  linkedin_dm: {
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    Icon: LinkedinIcon,
  },
  linkedin_inmail: {
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    Icon: LinkedinIcon,
  },
}

const CHANNEL_ORDER: StepChannel[] = [
  "email",
  "sms",
  "whatsapp",
  "instagram",
  "linkedin_message",
  "linkedin_dm",
  "linkedin_inmail",
]

// Tolerant lookup so previously-persisted localStorage data (e.g. the legacy
// "linkedin" channel, or any unknown value) still renders.
function channelMeta(channel: string): ChannelMeta {
  if (channel in CHANNELS) return CHANNELS[channel as StepChannel]
  if (channel === "linkedin") return CHANNELS.linkedin_message
  return CHANNELS.email
}

function normalizeChannel(channel: string): StepChannel {
  if (channel in CHANNELS) return channel as StepChannel
  if (channel === "linkedin") return "linkedin_message"
  return "email"
}

const POSITIVE_REPLIES = [
  "This is timely — we're actively evaluating tools in this space. Can you share availability this week?",
  "Interesting, the timing is good. Happy to take a quick look — send over a calendar link.",
  "Thanks for reaching out. We've felt this pain. Let's set up 20 minutes.",
  "Good note. We're scaling the team right now so this is relevant. What does onboarding look like?",
]

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export default function CampaignDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const campaigns = useCampaigns()
  const lists = useLists()
  const campaign = campaigns.find((item) => item.id === id)

  const [editOpen, setEditOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [attachListId, setAttachListId] = React.useState("")

  if (!campaign) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.campaignNotFound}</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/campaigns">{c.backToCampaigns}</Link>
        </Button>
      </Page>
    )
  }

  const steps = campaign.steps
  const enrolledIds = campaign.enrolledIds ?? []

  const openRate = campaign.enrolled
    ? Math.round((campaign.opened / campaign.enrolled) * 100)
    : 0
  const replyRate = campaign.enrolled
    ? Math.round((campaign.replied / campaign.enrolled) * 100)
    : 0

  const daily = campaignDailyStats[campaign.id] ?? []
  const enrollments = campaignEnrollments[campaign.id] ?? []
  const replies = enrollments.filter((e) => e.status === "replied")

  const totals = daily.reduce(
    (acc, d) => ({
      sent: acc.sent + d.sent,
      opened: acc.opened + d.opened,
      replied: acc.replied + d.replied,
    }),
    { sent: 0, opened: 0, replied: 0 }
  )

  const attachedList = campaign.listId
    ? lists.find((l) => l.id === campaign.listId)
    : undefined

  // Manually-enrolled prospects, de-duped against the mock enrollments so a
  // prospect already shown in the enrollment table isn't listed twice.
  const enrollmentIds = new Set(enrollments.map((e) => e.prospectId))
  const manualProspects = enrolledIds
    .filter((pid) => !enrollmentIds.has(pid))
    .map(getProspect)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const hasProspects = enrollments.length > 0 || manualProspects.length > 0

  // Ids already enrolled (mock + manual) — excluded from the add dialog.
  const allEnrolledIds = new Set<string>([...enrollmentIds, ...enrolledIds])

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/campaigns">
          <ArrowLeft className="size-4" />
          {c.campaigns}
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {campaign.name}
            </h1>
            <Badge variant={STATUS_VARIANT[campaign.status]}>
              {c.statusLabel[campaign.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {c.createdSteps(formatDate(campaign.createdAt), steps.length)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              const nextStatus: CampaignStatus =
                campaign.status === "active" ? "paused" : "active"
              campaignStore.update(campaign.id, { status: nextStatus })
              toast.success(
                nextStatus === "paused"
                  ? c.paused(campaign.name)
                  : c.activated(campaign.name)
              )
            }}
          >
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
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            {c.edit}
          </Button>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" />
            {c.addProspects}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label={c.enrolled} value={campaign.enrolled} />
        <Kpi label={c.openRate} value={`${openRate}%`} />
        <Kpi label={c.replyRate} value={`${replyRate}%`} />
        <Kpi label={c.meetings} value={campaign.meetings} />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">{c.tabOverview}</TabsTrigger>
          <TabsTrigger value="sequence">{c.tabSequence}</TabsTrigger>
          <TabsTrigger value="prospects">{c.tabProspects}</TabsTrigger>
          <TabsTrigger value="conversations">{c.tabConversations}</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.dailyPerformance}</CardTitle>
              <CardDescription>{c.dailyPerformanceDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {daily.length > 0 ? (
                <div className="h-72">
                  <CampaignDailyChart
                    labels={daily.map((d) => shortDay(d.date))}
                    sent={daily.map((d) => d.sent)}
                    opened={daily.map((d) => d.opened)}
                    replied={daily.map((d) => d.replied)}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  {c.noDailyData}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Audience — 1-to-1 attached list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.audience}</CardTitle>
              <CardDescription>{c.audienceDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {attachedList ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: attachedList.color }}
                    />
                    <div>
                      <Link
                        to={`/lists/${attachedList.id}`}
                        className="font-medium hover:underline"
                      >
                        {attachedList.name}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {c.prospectsCount(attachedList.prospectIds.length)}
                        {attachedList.dynamic ? c.dynamicSuffix : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      campaignStore.detachList(campaign.id)
                      toast.success(c.detached(attachedList.name))
                    }}
                  >
                    <X className="size-4" />
                    {c.detach}
                  </Button>
                </div>
              ) : lists.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={attachListId} onValueChange={setAttachListId}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder={c.chooseList} />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                          {l.campaignId && l.campaignId !== campaign.id
                            ? c.linkedElsewhere
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!attachListId}
                    onClick={() => {
                      const target = lists.find((l) => l.id === attachListId)
                      campaignStore.attachList(campaign.id, attachListId)
                      setAttachListId("")
                      toast.success(
                        target ? c.attached(target.name) : c.listAttached
                      )
                    }}
                  >
                    {c.attach}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {c.noListsToAttach}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.summary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {totals.sent}
                  </p>
                  <p className="text-muted-foreground text-xs">{c.sent}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {totals.opened}
                  </p>
                  <p className="text-muted-foreground text-xs">{c.opened}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {totals.replied}
                  </p>
                  <p className="text-muted-foreground text-xs">{c.replied}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sequence */}
        <TabsContent value="sequence" className="mt-4 space-y-4">
          {steps.length > 0 ? (
            <>
              <div className="space-y-3">
                {steps.map((step, i) => {
                  const meta = channelMeta(step.channel)
                  const isEmail = normalizeChannel(step.channel) === "email"
                  const sent = Math.max(
                    0,
                    campaign.enrolled - i * Math.round(campaign.enrolled * 0.12)
                  )
                  const opened = Math.round(sent * 0.62)
                  const replied = Math.round(opened * 0.24)
                  return (
                    <Card key={step.id}>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums">
                            {i + 1}
                          </span>
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg",
                              meta.tint
                            )}
                          >
                            <meta.Icon className="size-4" />
                          </span>
                          <Select
                            value={normalizeChannel(step.channel)}
                            onValueChange={(v) =>
                              campaignStore.updateStep(campaign.id, step.id, {
                                channel: v as StepChannel,
                              })
                            }
                          >
                            <SelectTrigger
                              size="sm"
                              className="w-[180px]"
                              aria-label={c.stepChannelAria(i + 1)}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHANNEL_ORDER.map((channelKey) => (
                                <SelectItem key={channelKey} value={channelKey}>
                                  {c.channelLabel[channelKey]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={c.moveStepUp}
                              disabled={i === 0}
                              onClick={() =>
                                campaignStore.moveStep(campaign.id, step.id, -1)
                              }
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={c.moveStepDown}
                              disabled={i === steps.length - 1}
                              onClick={() =>
                                campaignStore.moveStep(campaign.id, step.id, 1)
                              }
                            >
                              <ArrowDown className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={c.removeStep}
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                campaignStore.removeStep(campaign.id, step.id)
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            {c.wait}
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={step.delayDays}
                            onChange={(e) =>
                              campaignStore.updateStep(campaign.id, step.id, {
                                delayDays: Math.max(
                                  0,
                                  Number(e.target.value) || 0
                                ),
                              })
                            }
                            className="h-8 w-16 tabular-nums"
                          />
                          <span className="text-muted-foreground text-sm">
                            {c.daysBeforeSending}
                          </span>
                        </div>

                        {isEmail && (
                          <Input
                            value={step.subject ?? ""}
                            placeholder={c.subjectLine}
                            onChange={(e) =>
                              campaignStore.updateStep(campaign.id, step.id, {
                                subject: e.target.value,
                              })
                            }
                          />
                        )}

                        <Textarea
                          value={step.body}
                          placeholder={c.messageBody}
                          onChange={(e) =>
                            campaignStore.updateStep(campaign.id, step.id, {
                              body: e.target.value,
                            })
                          }
                          className="min-h-20"
                        />

                        <Separator />

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                          <span className="text-muted-foreground">
                            {c.sent}{" "}
                            <span className="text-foreground font-medium tabular-nums">
                              {sent}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            {c.opened}{" "}
                            <span className="text-foreground font-medium tabular-nums">
                              {opened}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            {c.replied}{" "}
                            <span className="text-foreground font-medium tabular-nums">
                              {replied}
                            </span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex items-center justify-between gap-2">
                <AddStepMenu
                  onAdd={(channel) =>
                    campaignStore.addStep(campaign.id, channel)
                  }
                />
                <Button onClick={() => toast.success(c.sequenceSaved)}>
                  {c.saveSequence}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-muted-foreground text-sm">{c.noSteps}</p>
                <AddStepMenu
                  onAdd={(channel) =>
                    campaignStore.addStep(campaign.id, channel)
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prospects */}
        <TabsContent value="prospects" className="mt-4">
          {hasProspects ? (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="pl-4">{c.thProspect}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {c.thTitleCompany}
                      </TableHead>
                      <TableHead>{c.thCurrentStep}</TableHead>
                      <TableHead>{c.thStatus}</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        {c.thLastTouch}
                      </TableHead>
                      <TableHead className="w-12 pr-4" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => {
                      const prospect = getProspect(e.prospectId)
                      return (
                        <TableRow key={e.prospectId}>
                          <TableCell className="pl-4">
                            {prospect ? (
                              <Link
                                to={`/prospects/${prospect.id}`}
                                className="flex items-center gap-3"
                              >
                                <ProspectAvatar prospect={prospect} />
                                <span className="truncate font-medium">
                                  {prospect.firstName} {prospect.lastName}
                                </span>
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">
                                {c.unknownProspect}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {prospect ? (
                              <>
                                <p className="text-muted-foreground text-sm">
                                  {prospect.title}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {prospect.company}
                                </p>
                              </>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.stepOf(e.currentStep, steps.length)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={ENROLLMENT_VARIANT[e.status]}>
                              {c.enrollmentLabel[e.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                            {relativeTime(e.lastTouch)}
                          </TableCell>
                          <TableCell className="pr-4" />
                        </TableRow>
                      )
                    })}
                    {manualProspects.map((prospect) => (
                      <TableRow key={prospect.id}>
                        <TableCell className="pl-4">
                          <Link
                            to={`/prospects/${prospect.id}`}
                            className="flex items-center gap-3"
                          >
                            <ProspectAvatar prospect={prospect} />
                            <span className="truncate font-medium">
                              {prospect.firstName} {prospect.lastName}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-muted-foreground text-sm">
                            {prospect.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {prospect.company}
                          </p>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {c.stepOf(1, steps.length)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ENROLLMENT_VARIANT.active}>
                            {c.enrollmentLabel.active}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                          {c.justAdded}
                        </TableCell>
                        <TableCell className="pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={c.removeProspectAria(
                              `${prospect.firstName} ${prospect.lastName}`
                            )}
                            className="text-muted-foreground hover:text-destructive size-8"
                            onClick={() => {
                              campaignStore.removeProspect(
                                campaign.id,
                                prospect.id
                              )
                              toast.success(c.removedFromCampaign)
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  {c.noProspects}
                </p>
                <Button variant="outline" onClick={() => setAddOpen(true)}>
                  <UserPlus className="size-4" />
                  {c.addProspects}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Conversations */}
        <TabsContent value="conversations" className="mt-4 space-y-3">
          {replies.length > 0 ? (
            replies.map((e, i) => {
              const prospect = getProspect(e.prospectId)
              const reply = POSITIVE_REPLIES[i % POSITIVE_REPLIES.length]
              return (
                <Card key={e.prospectId}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      {prospect && (
                        <ProspectAvatar prospect={prospect} className="mt-0.5" />
                      )}
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium">
                          {prospect
                            ? `${prospect.firstName} ${prospect.lastName}`
                            : c.unknownProspect}
                        </p>
                        <p className="text-muted-foreground text-sm">{reply}</p>
                        <p className="text-muted-foreground text-xs">
                          {relativeTime(e.lastTouch)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/inbox">{c.viewInInbox}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-sm">{c.noReplies}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <EditCampaignDialog
        key={campaign.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        campaignId={campaign.id}
        currentName={campaign.name}
        currentStatus={campaign.status}
      />

      <AddCampaignProspectsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        campaign={campaign}
        enrolledIds={allEnrolledIds}
      />
    </Page>
  )
}

/* ------------------------------ sub-components ----------------------------- */
function AddStepMenu({
  onAdd,
}: {
  onAdd: (channel: StepChannel) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          {c.addStep}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {CHANNEL_ORDER.map((channelKey) => {
          const meta = CHANNELS[channelKey]
          return (
            <DropdownMenuItem
              key={channelKey}
              onClick={() => onAdd(channelKey)}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-md",
                  meta.tint
                )}
              >
                <meta.Icon className="size-3.5" />
              </span>
              {c.channelLabel[channelKey]}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EditCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  currentName,
  currentStatus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  currentName: string
  currentStatus: CampaignStatus
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [name, setName] = React.useState(currentName)
  const [status, setStatus] = React.useState<CampaignStatus>(currentStatus)

  // Re-sync the form whenever the dialog opens.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(currentName)
      setStatus(currentStatus)
    }
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    campaignStore.update(campaignId, { name: trimmed, status })
    toast.success(c.campaignUpdated)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.editCampaign}</DialogTitle>
          <DialogDescription>{c.editCampaignDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="campaign-name" className="text-sm font-medium">
              {c.name}
            </label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="campaign-status" className="text-sm font-medium">
              {c.status}
            </label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as CampaignStatus)}
            >
              <SelectTrigger id="campaign-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {c.statusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {c.saveChanges}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
