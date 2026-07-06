import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Columns3,
  Mail,
  MessageSquare,
  MessageCircle,
  Camera,
  Pause,
  Play,
  Pencil,
  Plus,
  Target,
  Trash2,
  UserPlus,
  X,
  Sparkles,
  CheckCircle2,
  Circle,
  Zap,
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  Ban,
  FileText,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { TemplatePickerDialog } from "@/components/templates/TemplatePickerDialog"
import { SAMPLE_DATA } from "@/pages/Templates"

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
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/common/RichTextEditor"
import { plainToHtml, stripHtml } from "@/lib/rich-text"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CampaignDailyChart } from "@/components/charts/Charts"
import { DataTable } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import {
  useColumnPrefs,
  type ColumnDef,
  type ColGroup,
} from "@/lib/table-columns"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { AddCampaignProspectsDialog } from "@/components/campaigns/AddCampaignProspectsDialog"
import { getProspect, currentUser } from "@/lib/mock-data"
import { team } from "@/lib/team"
import { useCampaigns, useLists, campaignStore, listStore } from "@/lib/store"
import { useCredits } from "@/lib/credits"
import { campaignDailyStats, campaignEnrollments } from "@/lib/mock-depth"
import { formatDate, relativeTime, isCampaignScheduled } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useLocale, type Locale } from "@/lib/locale"
import type {
  CampaignStatus,
  StepChannel,
  EnrollmentStatus,
  Prospect,
  EmailTemplate,
} from "@/lib/types"

// Sending accounts: the current user first, then teammates, deduped by id.
const ACCOUNT_OPTIONS = [
  { id: currentUser.id, name: currentUser.name },
  ...team
    .filter((m) => m.id !== currentUser.id)
    .map((m) => ({ id: m.id, name: m.name })),
]

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
      paused: "Inactive",
      draft: "Draft",
      completed: "Ended",
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
    pause: "Make inactive",
    activate: "Activate",
    endCampaign: "End campaign",
    endConfirmTitle: "End this campaign?",
    endConfirmBody:
      "Ending unschedules all incomplete sequences (messages not yet sent). This cannot be resumed.",
    endConfirm: "End campaign",
    ended: (name: string) => `${name} ended`,
    account: "Account",
    language: "Language",
    english: "English",
    spanish: "Español",
    sendingSettings: "Sending",
    sendingSettingsDesc:
      "Choose which account this campaign sends from and in what language.",
    locksAfterActivation: "Locks after activation",
    senderSaved: "Sending settings updated",
    alreadyMessagedSkipped: "Already-messaged recipients are skipped",
    edit: "Edit",
    addProspects: "Add prospects",
    columns: "Columns",
    paused: (name: string) => `${name} paused`,
    activated: (name: string) => `${name} activated`,
    scheduleStart: "Schedule start…",
    tomorrowMorning: "Tomorrow, 8:00 AM",
    mondayMorning: "Monday, 8:00 AM",
    scheduleTitle: "Schedule campaign start",
    scheduleDesc: "Choose when this campaign should begin sending.",
    scheduleWhen: "Start sending at",
    scheduleConfirm: "Schedule start",
    scheduledBadge: "Scheduled",
    startsAt: (d: string) => `Starts ${d}`,
    startNow: "Start now",
    cancelSchedule: "Cancel schedule",
    scheduledToast: (d: string) => `Campaign scheduled to start ${d}`,
    scheduleCancelledToast: "Start schedule cancelled",
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
    audience: "Prospects",
    audienceDesc:
      "Attach a single prospect list to feed this campaign. The link is 1-to-1; a dynamic list auto-enrolls new matching prospects as they're found.",
    prospectsCount: (count: number) => `${count} prospects`,
    dynamicSuffix: " · dynamic",
    detached: (name: string) => `Detached ${name}`,
    detach: "Detach",
    chooseList: "Choose a list to attach",
    createList: "Create a list",
    listCreatedAttached: (name: string) => `Created and attached "${name}"`,
    linkedElsewhere: " (linked elsewhere)",
    attached: (name: string) => `Attached ${name}`,
    listAttached: "List attached",
    attach: "Attach",
    noListsToAttach: "No lists available to attach yet.",
    summary: "Summary",
    sent: "Sent",
    opened: "Opened",
    replied: "Replied",
    bounced: "Bounced",
    moveStepUp: "Move step up",
    moveStepDown: "Move step down",
    removeStep: "Remove step",
    stepChannelAria: (n: number) => `Step ${n} channel`,
    wait: "Wait",
    daysBeforeSending: "days before sending",
    sendImmediately: "Send immediately",
    waitDays: (n: number) => `Wait ${n} ${n === 1 ? "day" : "days"}`,
    actionNeeded: "Action needed",
    subjectLine: "Subject line",
    messageBody: "Message body",
    saveSequence: "Save sequence",
    sequenceSaved: "Sequence saved",
    noSteps: "This sequence has no steps yet.",
    addStep: "Add step",
    useTemplate: "Use a template",
    groupEmail: "Email",
    groupMessaging: "Messaging",
    groupLinkedin: "LinkedIn",
    setupTitle: "Finish setting up this campaign",
    setupDesc: "A campaign needs a sequence and prospects before it can run.",
    setupSequenceLabel: "Build your sequence",
    setupSequenceDesc: "Add the emails and steps this campaign will send.",
    setupSequenceCta: "Build sequence",
    setupProspectsLabel: "Add prospects",
    setupProspectsDesc: "Attach a list or enroll the prospects to contact.",
    setupProspectsCta: "Add prospects",
    setupDone: "Done",
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
    enrichGateTitle: "Enrich emails before launching?",
    enrichGateBody: (n: number, credits: number) =>
      `${n} enrolled prospects don't have a verified email yet. Enriching now uses ~${credits} credits and avoids "email not available" errors once the campaign is live.`,
    enrichAndActivate: "Enrich & activate",
    activateAnyway: "Activate without enriching",
    enrichingToast: (n: number) =>
      `Enriching ${n} emails… you can keep working — we'll notify you.`,
    enrichedToast: (n: number) => `${n} emails enriched · campaign activated`,
    enrichInsufficient: "Not enough credits to enrich",
    automations: "Automations",
    automationsDesc: "Let Kai act on replies for you.",
    alertInterested: "Alert me when a reply is marked Interested",
    alertInterestedDesc:
      "Get a notification the moment Kai classifies a reply as Interested.",
    alsoEmail: "Also email me",
    alertsOnToast: "Interested alerts on",
    interested: "Interested",
    alertSent: "Alert sent",
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
      paused: "Inactiva",
      draft: "Borrador",
      completed: "Finalizada",
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
    pause: "Desactivar",
    activate: "Activar",
    endCampaign: "Finalizar campaña",
    endConfirmTitle: "¿Finalizar esta campaña?",
    endConfirmBody:
      "Al finalizar se desprograman todas las secuencias incompletas (mensajes aún no enviados). No se puede reanudar.",
    endConfirm: "Finalizar campaña",
    ended: (name: string) => `${name} finalizada`,
    account: "Cuenta",
    language: "Idioma",
    english: "English",
    spanish: "Español",
    sendingSettings: "Envío",
    sendingSettingsDesc:
      "Elige desde qué cuenta se envía esta campaña y en qué idioma.",
    locksAfterActivation: "Se bloquea al activar",
    senderSaved: "Ajustes de envío actualizados",
    alreadyMessagedSkipped: "Se omiten los destinatarios ya contactados",
    edit: "Editar",
    addProspects: "Añadir prospectos",
    columns: "Columnas",
    paused: (name: string) => `${name} en pausa`,
    activated: (name: string) => `${name} activada`,
    scheduleStart: "Programar inicio…",
    tomorrowMorning: "Mañana, 8:00",
    mondayMorning: "Lunes, 8:00",
    scheduleTitle: "Programar inicio de campaña",
    scheduleDesc: "Elige cuándo debe empezar a enviar esta campaña.",
    scheduleWhen: "Empezar a enviar el",
    scheduleConfirm: "Programar inicio",
    scheduledBadge: "Programada",
    startsAt: (d: string) => `Empieza el ${d}`,
    startNow: "Iniciar ahora",
    cancelSchedule: "Cancelar programación",
    scheduledToast: (d: string) => `Campaña programada para iniciar el ${d}`,
    scheduleCancelledToast: "Programación de inicio cancelada",
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
    audience: "Prospectos",
    audienceDesc:
      "Vincula una única lista de prospectos para alimentar esta campaña. La relación es de uno a uno; una lista dinámica inscribe automáticamente los nuevos prospectos que coincidan a medida que se encuentran.",
    prospectsCount: (count: number) => `${count} prospectos`,
    dynamicSuffix: " · dinámica",
    detached: (name: string) => `${name} desvinculada`,
    detach: "Desvincular",
    chooseList: "Elige una lista para vincular",
    createList: "Crear una lista",
    listCreatedAttached: (name: string) => `«${name}» creada y vinculada`,
    linkedElsewhere: " (vinculada en otro lugar)",
    attached: (name: string) => `${name} vinculada`,
    listAttached: "Lista vinculada",
    attach: "Vincular",
    noListsToAttach: "Aún no hay listas disponibles para vincular.",
    summary: "Resumen",
    sent: "Enviados",
    opened: "Aperturas",
    replied: "Respuestas",
    bounced: "Rebotes",
    moveStepUp: "Subir paso",
    moveStepDown: "Bajar paso",
    removeStep: "Eliminar paso",
    stepChannelAria: (n: number) => `Canal del paso ${n}`,
    wait: "Espera",
    daysBeforeSending: "días antes de enviar",
    sendImmediately: "Enviar inmediatamente",
    waitDays: (n: number) => `Esperar ${n} ${n === 1 ? "día" : "días"}`,
    actionNeeded: "Necesita acción",
    subjectLine: "Asunto",
    messageBody: "Cuerpo del mensaje",
    saveSequence: "Guardar secuencia",
    sequenceSaved: "Secuencia guardada",
    noSteps: "Esta secuencia aún no tiene pasos.",
    addStep: "Añadir paso",
    useTemplate: "Usar una plantilla",
    groupEmail: "Correo",
    groupMessaging: "Mensajería",
    groupLinkedin: "LinkedIn",
    setupTitle: "Termina de configurar esta campaña",
    setupDesc: "Una campaña necesita una secuencia y prospectos antes de ejecutarse.",
    setupSequenceLabel: "Crea tu secuencia",
    setupSequenceDesc: "Añade los correos y pasos que enviará esta campaña.",
    setupSequenceCta: "Crear secuencia",
    setupProspectsLabel: "Añade prospectos",
    setupProspectsDesc: "Vincula una lista o inscribe los prospectos a contactar.",
    setupProspectsCta: "Añadir prospectos",
    setupDone: "Listo",
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
    enrichGateTitle: "¿Enriquecer correos antes de lanzar?",
    enrichGateBody: (n: number, credits: number) =>
      `${n} prospectos inscritos aún no tienen un correo verificado. Enriquecer ahora usa ~${credits} créditos y evita errores de "correo no disponible" con la campaña en marcha.`,
    enrichAndActivate: "Enriquecer y activar",
    activateAnyway: "Activar sin enriquecer",
    enrichingToast: (n: number) =>
      `Enriqueciendo ${n} correos… puedes seguir trabajando, te avisaremos.`,
    enrichedToast: (n: number) => `${n} correos enriquecidos · campaña activada`,
    enrichInsufficient: "Créditos insuficientes para enriquecer",
    automations: "Automatizaciones",
    automationsDesc: "Deja que Kai actúe sobre las respuestas por ti.",
    alertInterested: "Avísame cuando una respuesta se marque como Interesado",
    alertInterestedDesc:
      "Recibe una notificación en cuanto Kai clasifique una respuesta como Interesado.",
    alsoEmail: "Avísame también por correo",
    alertsOnToast: "Alertas de Interesado activadas",
    interested: "Interesado",
    alertSent: "Alerta enviada",
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

// 8:00 AM local time, `daysAhead` days from today.
function morningISO(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(8, 0, 0, 0)
  return d.toISOString()
}

// 8:00 AM local time on the next Monday (always at least one day out).
function nextMondayMorningISO(): string {
  const d = new Date()
  const add = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + add)
  d.setHours(8, 0, 0, 0)
  return d.toISOString()
}

// Format a Date as a `datetime-local` input value (local time, no zone).
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
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

// One row of the Prospects tab — a normalized view over both mock enrollments
// and manually-added prospects so they share the customizable DataTable.
interface CampaignProspectRow {
  id: string
  prospect: Prospect | undefined
  currentStep: number
  status: EnrollmentStatus
  lastTouchLabel: string
  manual: boolean
}

const PROSPECT_COL_GROUPS: ColGroup[] = [
  { id: "prospect", label: { en: "Prospect", es: "Prospecto" } },
  { id: "progress", label: { en: "Progress", es: "Progreso" } },
]
const PROSPECT_COL_DEFAULT_IDS = [
  "titleCompany",
  "currentStep",
  "status",
  "lastTouch",
]

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

// Tolerant lookup so previously-persisted localStorage data (e.g. the legacy
// "linkedin" channel, or any unknown value) still renders.
function channelMeta(channel: string): ChannelMeta {
  if (channel in CHANNELS) return CHANNELS[channel as StepChannel]
  if (channel === "linkedin") return CHANNELS.linkedin_message
  return CHANNELS.email
}

export function normalizeChannel(channel: string): StepChannel {
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
  const [tab, setTab] = React.useState("overview")
  const [enrichGateOpen, setEnrichGateOpen] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [scheduleValue, setScheduleValue] = React.useState("")
  const [endOpen, setEndOpen] = React.useState(false)
  const [alertInterested, setAlertInterested] = React.useState(true)
  const [alertEmail, setAlertEmail] = React.useState(false)
  const [selectedStepId, setSelectedStepId] = React.useState<string | undefined>(undefined)
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false)
  const { spend } = useCredits()

  // Prospects-tab table: shared DataTable + ColumnManager (like People/Lists).
  // Hooks must run before the not-found early return below.
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const prospectColPrefs = useColumnPrefs(
    "campaign-prospects",
    PROSPECT_COL_DEFAULT_IDS
  )

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

  const campaignId = campaign.id
  const steps = campaign.steps
  // Falls back to the last step — so adding a new one selects it immediately,
  // and removing the selected step lands on a step that still exists.
  const selectedStep =
    steps.find((s) => s.id === selectedStepId) ?? steps[steps.length - 1]
  const enrolledIds = campaign.enrolledIds ?? []

  function insertStepFromTemplate(template: EmailTemplate) {
    const channel = normalizeChannel(template.channel)
    const created = campaignStore.addStepFromTemplate(campaignId, {
      channel,
      subject: channel === "email" ? template.subject : undefined,
      body: template.body,
    })
    setSelectedStepId(created?.id)
  }

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
      bounced: acc.bounced + d.bounced,
    }),
    { sent: 0, opened: 0, replied: 0, bounced: 0 }
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

  // Guided setup: a campaign is ready once it has a sequence and a prospect
  // source (an attached list or manually-enrolled prospects).
  const hasSequence = steps.length > 0
  const hasFeed = hasProspects || Boolean(attachedList)
  const setupComplete = hasSequence && hasFeed

  // Ids already enrolled (mock + manual) — excluded from the add dialog.
  const allEnrolledIds = new Set<string>([...enrollmentIds, ...enrolledIds])

  // Prospects-tab table rows: a normalized view over mock enrollments and
  // manually-added prospects so they share the customizable DataTable.
  const prospectRows: CampaignProspectRow[] = [
    ...enrollments.map((e) => ({
      id: e.prospectId,
      prospect: getProspect(e.prospectId),
      currentStep: e.currentStep,
      status: e.status,
      lastTouchLabel: relativeTime(e.lastTouch),
      manual: false,
    })),
    ...manualProspects.map((p) => ({
      id: p.id,
      prospect: p as Prospect | undefined,
      currentStep: 1,
      status: "active" as EnrollmentStatus,
      lastTouchLabel: c.justAdded,
      manual: true,
    })),
  ]
  const prospectColumns: ColumnDef<CampaignProspectRow>[] = [
    {
      id: "prospect",
      label: { en: "Prospect", es: "Prospecto" },
      group: "prospect",
      pinned: true,
      minWidth: "200px",
      render: (row) =>
        row.prospect ? (
          <Link
            to={`/prospects/${row.prospect.id}`}
            className="flex items-center gap-3"
          >
            <ProspectAvatar prospect={row.prospect} />
            <span className="truncate font-medium">
              {row.prospect.firstName} {row.prospect.lastName}
            </span>
          </Link>
        ) : (
          <span className="text-muted-foreground">{c.unknownProspect}</span>
        ),
    },
    {
      id: "titleCompany",
      label: { en: "Title / Company", es: "Cargo / Empresa" },
      group: "prospect",
      render: (row) =>
        row.prospect ? (
          <div>
            <p className="text-sm">{row.prospect.title}</p>
            <p className="text-muted-foreground text-xs">
              {row.prospect.company}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "currentStep",
      label: { en: "Current step", es: "Paso actual" },
      group: "progress",
      render: (row) => (
        <span className="text-sm tabular-nums">
          {c.stepOf(row.currentStep, steps.length)}
        </span>
      ),
    },
    {
      id: "status",
      label: { en: "Status", es: "Estado" },
      group: "progress",
      render: (row) => (
        <Badge variant={ENROLLMENT_VARIANT[row.status]}>
          {c.enrollmentLabel[row.status]}
        </Badge>
      ),
    },
    {
      id: "lastTouch",
      label: { en: "Last touch", es: "Último contacto" },
      group: "progress",
      render: (row) => (
        <span className="text-muted-foreground text-sm">
          {row.lastTouchLabel}
        </span>
      ),
    },
  ]

  // Enrichment gate: a campaign with an email step shouldn't launch while some
  // enrolled prospects still lack a verified email (a common mid-campaign error).
  const camp = campaign // narrowed, safe to use inside handlers
  const hasEmailStep = steps.some((s) => s.channel === "email")
  const missingEmails = hasEmailStep ? Math.round(camp.enrolled * 0.22) : 0
  const enrichCost = missingEmails * 2

  const scheduled = isCampaignScheduled(camp)

  // Sending settings are locked once the campaign goes live or is ended.
  const senderEditable =
    camp.status !== "active" && camp.status !== "completed"
  const accountId = camp.senderAccountId ?? currentUser.id
  const accountName = camp.senderAccount ?? currentUser.name
  const language: Locale = camp.language ?? "en"
  const langLabel = language === "es" ? c.spanish : c.english

  function saveSender(next: {
    senderAccountId: string
    senderAccount: string
    language: Locale
  }) {
    campaignStore.setSender(camp.id, next)
    toast.success(c.senderSaved)
  }

  function activate() {
    const reactivatingWithHistory =
      camp.status === "paused" && (camp.messagedIds?.length ?? 0) > 0
    campaignStore.activate(camp.id, {
      senderAccountId: accountId,
      senderAccount: accountName,
      language,
    })
    toast.success(c.activated(camp.name), {
      description: reactivatingWithHistory
        ? c.alreadyMessagedSkipped
        : undefined,
    })
  }

  function endCampaign() {
    campaignStore.end(camp.id)
    setEndOpen(false)
    toast.success(c.ended(camp.name))
  }

  // Queue the campaign to begin sending at `iso` instead of going live now.
  function scheduleStart(iso: string) {
    campaignStore.update(camp.id, { status: "draft", scheduledAt: iso })
    setScheduleOpen(false)
    toast.success(c.scheduledToast(formatWhen(iso)))
  }

  function openCustomSchedule() {
    setScheduleValue(toLocalInputValue(new Date(Date.now() + 24 * 3600 * 1000)))
    setScheduleOpen(true)
  }

  function confirmCustomSchedule() {
    if (!scheduleValue) return
    scheduleStart(new Date(scheduleValue).toISOString())
  }

  function cancelSchedule() {
    campaignStore.update(camp.id, { scheduledAt: null })
    toast.success(c.scheduleCancelledToast)
  }

  // Create a fresh people list and attach it to this campaign in one click.
  function createAndAttachList() {
    const list = listStore.create({
      name: camp.name,
      description: "",
      color: "#6366f1",
      kind: "people",
    })
    campaignStore.attachList(camp.id, list.id)
    setAttachListId("")
    toast.success(c.listCreatedAttached(list.name))
  }

  function handlePrimaryAction() {
    if (camp.status === "active") {
      campaignStore.deactivate(camp.id)
      toast.success(c.paused(camp.name))
      return
    }
    if (missingEmails > 0) {
      setEnrichGateOpen(true)
      return
    }
    activate()
  }

  function enrichAndActivate() {
    if (!spend(enrichCost, `Enrich ${missingEmails} emails — ${camp.name}`)) {
      toast.error(c.enrichInsufficient)
      return
    }
    setEnrichGateOpen(false)
    // System-status pattern: long action runs in the background and the user is
    // free to leave — we notify them when it's done.
    const toastId = toast.loading(c.enrichingToast(missingEmails))
    window.setTimeout(() => {
      campaignStore.activate(camp.id, {
        senderAccountId: accountId,
        senderAccount: accountName,
        language,
      })
      toast.success(c.enrichedToast(missingEmails), { id: toastId })
    }, 1800)
  }

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
            {scheduled ? (
              <Badge variant="secondary" className="gap-1">
                <CalendarClock className="size-3" />
                {c.scheduledBadge}
              </Badge>
            ) : (
              <Badge variant={STATUS_VARIANT[campaign.status]}>
                {c.statusLabel[campaign.status]}
              </Badge>
            )}
          </div>
          {scheduled && campaign.scheduledAt && (
            <p className="text-primary flex items-center gap-1.5 text-sm font-medium">
              <CalendarClock className="size-3.5" />
              {c.startsAt(formatWhen(campaign.scheduledAt))}
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            {c.createdSteps(formatDate(campaign.createdAt), steps.length)}
          </p>
          {campaign.goal && (
            <p className="text-muted-foreground mt-1 flex items-start gap-1.5 text-sm">
              <Target className="mt-0.5 size-3.5 shrink-0" />
              <span className="italic">{campaign.goal}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {campaign.status === "active" ? (
            <Button variant="volt" onClick={handlePrimaryAction}>
              <Pause className="size-4" />
              {c.pause}
            </Button>
          ) : scheduled ? (
            <>
              <Button variant="volt" onClick={activate}>
                <Play className="size-4" />
                {c.startNow}
              </Button>
              <Button variant="outline" onClick={cancelSchedule}>
                <X className="size-4" />
                {c.cancelSchedule}
              </Button>
            </>
          ) : (
            <div className="flex items-center">
              <Button
                variant="volt"
                className="rounded-r-none"
                onClick={handlePrimaryAction}
              >
                <Play className="size-4" />
                {c.activate}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="volt"
                    className="rounded-l-none border-l border-white/25 px-2"
                    aria-label={c.scheduleStart}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => scheduleStart(morningISO(1))}>
                    <CalendarClock className="size-4" />
                    {c.tomorrowMorning}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => scheduleStart(nextMondayMorningISO())}
                  >
                    <CalendarClock className="size-4" />
                    {c.mondayMorning}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openCustomSchedule}>
                    <CalendarClock className="size-4" />
                    {c.scheduleStart}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            {c.edit}
          </Button>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" />
            {c.addProspects}
          </Button>
          {/* End is the destructive, irreversible opposite of Activate — only
              offered once the campaign has been started (active or inactive). */}
          {(campaign.status === "active" || campaign.status === "paused") && (
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setEndOpen(true)}
            >
              <Ban className="size-4" />
              {c.endCampaign}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label={c.enrolled} value={campaign.enrolled} />
        <Kpi label={c.openRate} value={`${openRate}%`} />
        <Kpi label={c.replyRate} value={`${replyRate}%`} />
        <Kpi label={c.meetings} value={campaign.meetings} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">{c.tabOverview}</TabsTrigger>
          <TabsTrigger value="sequence">{c.tabSequence}</TabsTrigger>
          <TabsTrigger value="prospects">{c.tabProspects}</TabsTrigger>
          <TabsTrigger value="conversations">{c.tabConversations}</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {!setupComplete && (
            <Card className="border-primary/30 bg-primary/[0.03]">
              <CardHeader>
                <CardTitle className="text-base">{c.setupTitle}</CardTitle>
                <CardDescription>{c.setupDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <SetupStep
                  done={hasSequence}
                  label={c.setupSequenceLabel}
                  desc={c.setupSequenceDesc}
                  actionLabel={c.setupSequenceCta}
                  doneLabel={c.setupDone}
                  onAction={() => setTab("sequence")}
                />
                <SetupStep
                  done={hasFeed}
                  label={c.setupProspectsLabel}
                  desc={c.setupProspectsDesc}
                  actionLabel={c.setupProspectsCta}
                  doneLabel={c.setupDone}
                  onAction={() => setTab("prospects")}
                />
              </CardContent>
            </Card>
          )}

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
                    bounced={daily.map((d) => d.bounced)}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  {c.noDailyData}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sending — account + language, locked once active/ended */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.sendingSettings}</CardTitle>
              <CardDescription>{c.sendingSettingsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="campaign-account"
                    className="text-sm font-medium"
                  >
                    {c.account}
                  </label>
                  {senderEditable ? (
                    <Select
                      value={accountId}
                      onValueChange={(v) => {
                        const a =
                          ACCOUNT_OPTIONS.find((o) => o.id === v) ??
                          ACCOUNT_OPTIONS[0]
                        saveSender({
                          senderAccountId: a.id,
                          senderAccount: a.name,
                          language,
                        })
                      }}
                    >
                      <SelectTrigger id="campaign-account" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_OPTIONS.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="rounded-md border px-3 py-2 text-sm">
                      {accountName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="campaign-language"
                    className="text-sm font-medium"
                  >
                    {c.language}
                  </label>
                  {senderEditable ? (
                    <Select
                      value={language}
                      onValueChange={(v) =>
                        saveSender({
                          senderAccountId: accountId,
                          senderAccount: accountName,
                          language: v as Locale,
                        })
                      }
                    >
                      <SelectTrigger id="campaign-language" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{c.english}</SelectItem>
                        <SelectItem value="es">{c.spanish}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="rounded-md border px-3 py-2 text-sm">
                      {langLabel}
                    </p>
                  )}
                </div>
              </div>
              {!senderEditable && (
                <p className="text-muted-foreground text-xs">
                  {c.locksAfterActivation}
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
                  <Button variant="outline" onClick={createAndAttachList}>
                    <Plus className="size-4" />
                    {c.createList}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={createAndAttachList}>
                  <Plus className="size-4" />
                  {c.createList}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Automations — alert when a reply is classified Interested */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="text-primary size-4" />
                {c.automations}
              </CardTitle>
              <CardDescription>{c.automationsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.alertInterested}</p>
                  <p className="text-muted-foreground text-sm">
                    {c.alertInterestedDesc}
                  </p>
                </div>
                <Switch
                  checked={alertInterested}
                  onCheckedChange={(v) => {
                    setAlertInterested(v)
                    if (v) toast.success(c.alertsOnToast)
                  }}
                  aria-label={c.alertInterested}
                />
              </div>
              {alertInterested && (
                <div className="flex items-center justify-between gap-3 border-t pt-4">
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Mail className="size-4" />
                    {c.alsoEmail}
                  </p>
                  <Switch
                    checked={alertEmail}
                    onCheckedChange={setAlertEmail}
                    aria-label={c.alsoEmail}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.summary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
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
                <div>
                  <p className="text-destructive text-lg font-semibold tabular-nums">
                    {totals.bounced}
                  </p>
                  <p className="text-muted-foreground text-xs">{c.bounced}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sequence */}
        <TabsContent value="sequence" className="mt-4 space-y-4">
          {steps.length > 0 ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                {/* Step list — pick a step to edit it on the right. */}
                <div className="flex shrink-0 flex-col gap-2 lg:w-72">
                  {steps.map((step) => {
                    const meta = channelMeta(step.channel)
                    const selected = step.id === selectedStep.id
                    const needsAction = stripHtml(step.body).trim().length === 0
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setSelectedStepId(step.id)}
                        aria-current={selected}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-primary/[0.04]"
                            : "hover:bg-muted/40"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            meta.tint
                          )}
                        >
                          <meta.Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {c.channelLabel[normalizeChannel(step.channel)]}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {step.delayDays === 0
                              ? c.sendImmediately
                              : c.waitDays(step.delayDays)}
                          </p>
                        </div>
                        {needsAction && (
                          <Badge
                            variant="destructive"
                            className="shrink-0 gap-1 text-[10px] font-normal"
                          >
                            <AlertTriangle className="size-3" />
                            {c.actionNeeded}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                  <AddStepMenu
                    onAdd={(channel) => {
                      campaignStore.addStep(campaign.id, channel)
                      setSelectedStepId(undefined)
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setTemplatePickerOpen(true)}
                  >
                    <FileText className="size-4" />
                    {c.useTemplate}
                  </Button>
                </div>

                {/* Detail panel — the selected step's full editor. */}
                {(() => {
                  const step = selectedStep
                  const i = steps.findIndex((s) => s.id === step.id)
                  const meta = channelMeta(step.channel)
                  const isEmail = normalizeChannel(step.channel) === "email"
                  const sent = Math.max(
                    0,
                    campaign.enrolled - i * Math.round(campaign.enrolled * 0.12)
                  )
                  const opened = Math.round(sent * 0.62)
                  const replied = Math.round(opened * 0.24)
                  return (
                    <Card className="flex-1">
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
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
                              {CHANNEL_GROUPS.map((group) => (
                                <SelectGroup key={group.labelKey}>
                                  <SelectLabel>{c[group.labelKey]}</SelectLabel>
                                  {group.channels.map((channelKey) => (
                                    <SelectItem key={channelKey} value={channelKey}>
                                      {c.channelLabel[channelKey]}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
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
                              onClick={() => {
                                campaignStore.removeStep(campaign.id, step.id)
                                setSelectedStepId(undefined)
                              }}
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

                        <RichTextEditor
                          value={plainToHtml(step.body)}
                          placeholder={c.messageBody}
                          ariaLabel={c.messageBody}
                          onChange={(html) =>
                            campaignStore.updateStep(campaign.id, step.id, {
                              body: html,
                            })
                          }
                          minHeight="min-h-20"
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
                })()}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => toast.success(c.sequenceSaved)}>
                  {c.saveSequence}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-muted-foreground text-sm">{c.noSteps}</p>
                <div className="flex gap-2">
                  <AddStepMenu
                    onAdd={(channel) =>
                      campaignStore.addStep(campaign.id, channel)
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => setTemplatePickerOpen(true)}
                  >
                    <FileText className="size-4" />
                    {c.useTemplate}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prospects */}
        <TabsContent value="prospects" className="mt-4 space-y-3">
          {hasProspects ? (
            <>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setColumnsOpen(true)}
                >
                  <Columns3 className="size-4" />
                  {c.columns}
                </Button>
              </div>
              <DataTable
                columns={prospectColumns}
                visible={prospectColPrefs.visible}
                rows={prospectRows}
                rowKey={(r) => r.id}
                locale={locale}
                actions={(row) =>
                  row.manual ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.removeProspectAria(
                        row.prospect
                          ? `${row.prospect.firstName} ${row.prospect.lastName}`
                          : c.unknownProspect
                      )}
                      className="text-muted-foreground hover:text-destructive size-8"
                      onClick={() => {
                        campaignStore.removeProspect(campaign.id, row.id)
                        toast.success(c.removedFromCampaign)
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  ) : null
                }
              />
            </>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {prospect
                              ? `${prospect.firstName} ${prospect.lastName}`
                              : c.unknownProspect}
                          </p>
                          <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
                            <Sparkles className="size-3" />
                            {c.interested}
                          </Badge>
                          {alertInterested && (
                            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                              <Zap className="text-chart-4 size-3" />
                              {c.alertSent}
                              {alertEmail ? " · email" : ""}
                            </span>
                          )}
                        </div>
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

      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onInsert={insertStepFromTemplate}
        vars={SAMPLE_DATA}
        locale={locale}
      />

      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={prospectColumns}
        groups={PROSPECT_COL_GROUPS}
        prefs={prospectColPrefs}
        locale={locale}
      />

      <Dialog open={enrichGateOpen} onOpenChange={setEnrichGateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-chart-4/15 text-chart-4 flex size-7 items-center justify-center rounded-md">
                <AlertTriangle className="size-4" />
              </span>
              {c.enrichGateTitle}
            </DialogTitle>
            <DialogDescription>
              {c.enrichGateBody(missingEmails, enrichCost)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEnrichGateOpen(false)
                activate()
              }}
            >
              {c.activateAnyway}
            </Button>
            <Button variant="volt" onClick={enrichAndActivate}>
              <Zap className="size-4" />
              {c.enrichAndActivate} · {enrichCost}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="text-primary size-5" />
              {c.scheduleTitle}
            </DialogTitle>
            <DialogDescription>{c.scheduleDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="campaign-schedule" className="text-sm font-medium">
              {c.scheduleWhen}
            </label>
            <Input
              id="campaign-schedule"
              type="datetime-local"
              value={scheduleValue}
              min={toLocalInputValue(new Date())}
              onChange={(e) => setScheduleValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              {c.cancel}
            </Button>
            <Button
              variant="volt"
              disabled={!scheduleValue}
              onClick={confirmCustomSchedule}
            >
              <CalendarClock className="size-4" />
              {c.scheduleConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-destructive/15 text-destructive flex size-7 items-center justify-center rounded-md">
                <Ban className="size-4" />
              </span>
              {c.endConfirmTitle}
            </DialogTitle>
            <DialogDescription>{c.endConfirmBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="destructive" onClick={endCampaign}>
              <Ban className="size-4" />
              {c.endConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}

/* ------------------------------ sub-components ----------------------------- */
// One row of the guided-setup checklist on the campaign Overview.
function SetupStep({
  done,
  label,
  desc,
  actionLabel,
  doneLabel,
  onAction,
}: {
  done: boolean
  label: string
  desc: string
  actionLabel: string
  doneLabel: string
  onAction: () => void
}) {
  return (
    <div className="bg-background flex items-center gap-3 rounded-lg border px-3 py-2.5">
      {done ? (
        <CheckCircle2 className="text-chart-1 size-5 shrink-0" />
      ) : (
        <Circle className="text-muted-foreground size-5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            done && "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
      {done ? (
        <span className="text-chart-1 shrink-0 text-xs font-medium">
          {doneLabel}
        </span>
      ) : (
        <Button size="sm" onClick={onAction} className="shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// Grouped like Lemlist's step picker (Suggestions / LinkedIn actions / Phone
// & Messaging, adapted to the channels we actually support).
const CHANNEL_GROUPS: { labelKey: "groupEmail" | "groupMessaging" | "groupLinkedin"; channels: StepChannel[] }[] = [
  { labelKey: "groupEmail", channels: ["email"] },
  { labelKey: "groupMessaging", channels: ["sms", "whatsapp", "instagram"] },
  {
    labelKey: "groupLinkedin",
    channels: ["linkedin_message", "linkedin_dm", "linkedin_inmail"],
  },
]

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
        {CHANNEL_GROUPS.map((group, gi) => (
          <React.Fragment key={group.labelKey}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {c[group.labelKey]}
            </DropdownMenuLabel>
            {group.channels.map((channelKey) => {
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
          </React.Fragment>
        ))}
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
