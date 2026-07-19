import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowUp,
  ArrowDown,
  Columns3,
  Mail,
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
  Layers,
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  Ban,
  GitFork,
  Copy,
  Bookmark,
  UserSearch,
  Building2,
  Eye,
  Braces,
  MessageSquare,
  ThumbsUp,
  Mic,
  ExternalLink,
  FileText,
} from "lucide-react"

import { channelMeta, normalizeChannel } from "@/lib/step-channels"
import { SequenceCanvas } from "@/components/sequence/SequenceCanvas"
import { StepTypePickerDialog } from "@/components/sequence/StepTypePickerDialog"
import type { AddNodeData } from "@/lib/sequence-layout"
import { TemplatePickerDialog } from "@/components/templates/TemplatePickerDialog"
import {
  PromptPickerDialog,
  type PromptStepSeed,
} from "@/components/templates/PromptPickerDialog"
import { CopySequenceDialog } from "@/components/campaign/CopySequenceDialog"
import { SequenceMessagePreviewDialog } from "@/components/campaign/SequenceMessagePreviewDialog"
import { SequencePreviewPane } from "@/components/campaign/SequencePreviewPane"
import {
  TEMPLATE_MERGE_VARIABLES,
  TEMPLATE_MERGE_VARIABLE_GROUPS,
  groupByMergeVarGroup,
  type MergeVarGroupKey,
} from "@/lib/merge-vars"
import { BackLink } from "@/components/common/BackLink"
import { SearchCombobox } from "@/components/common/SearchCombobox"
import { Segmented } from "@/components/common/Segmented"
import { SaveSequenceTemplateDialog } from "@/components/campaign/SaveSequenceTemplateDialog"
import { VoiceMessageRecorder } from "@/components/campaign/VoiceMessageRecorder"
import { cloneSequenceSteps } from "@/lib/sequence-templates"
import { useSequenceDraft } from "@/lib/sequence-draft"
import { registerUnsavedChangesBlocker } from "@/lib/unsaved-changes"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/common/RichTextEditor"
import { plainToHtml } from "@/lib/rich-text"
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
import { RecordActionsMenu } from "@/components/common/RecordActionsMenu"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { SelectionControls } from "@/components/common/SelectionControls"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { downloadCsv } from "@/lib/csv"
import { ColumnManager } from "@/components/common/ColumnManager"
import {
  useColumnPrefs,
  PEOPLE_COLUMNS,
  PEOPLE_GROUPS,
  type ColumnDef,
  type ColGroup,
} from "@/lib/table-columns"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { AddCampaignAudienceDialog } from "@/components/campaigns/AddCampaignAudienceDialog"
import { AutomationStatusBox } from "@/components/campaigns/AutomationStatusBox"
import { SequenceCostSummary } from "@/components/campaigns/SequenceCostSummary"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { CampaignTabBar } from "@/components/campaigns/CampaignTabBar"
import { campaignTabsStore } from "@/lib/campaign-tabs"
import { getProspect, currentUser } from "@/lib/mock-data"
import { team } from "@/lib/team"
import {
  useCampaigns,
  useLists,
  useAccounts,
  campaignStore,
  listStore,
  findCampaignStep,
  locateCampaignStep,
  flattenCampaignSteps,
  AI_VOICES,
  AI_CALL_AGENTS,
  AI_CALL_RETRY_DELAYS_MINUTES,
  TASK_START_TIME_OPTIONS,
  TASK_REMINDER_OPTIONS,
} from "@/lib/store"
import { useCredits } from "@/lib/credits"
import { campaignDailyStats, campaignEnrollments } from "@/lib/mock-depth"
import { formatDate, relativeTime, isCampaignScheduled } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useLocale, type Locale } from "@/lib/locale"
import { MAX_ENRICH_BATCH } from "@/lib/enrichment"
import type {
  CampaignStatus,
  Channel,
  StepChannel,
  ConditionKind,
  EnrollmentStatus,
  Prospect,
  EmailTemplate,
  CampaignStep,
  LinkedInAction,
  WhatsAppAction,
} from "@/lib/types"

const LINKEDIN_ACTIONS: LinkedInAction[] = [
  "message",
  "connect",
  "like_post",
  "view_profile",
  "voice_message",
]
const WHATSAPP_ACTIONS: WhatsAppAction[] = ["message", "voice_message"]
const LINKEDIN_ACTION_ICON: Record<LinkedInAction, typeof MessageSquare> = {
  message: MessageSquare,
  connect: UserPlus,
  like_post: ThumbsUp,
  view_profile: Eye,
  voice_message: Mic,
}

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
      whatsapp: "WhatsApp",
      call: "Phone call",
      ai_call: "AI Voice Call",
      linkedin_message: "LinkedIn message",
      linkedin_dm: "LinkedIn DM",
      linkedin_inmail: "LinkedIn InMail",
      manual: "Manual task",
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
    activateDisabledReason: (missingSequence: boolean, missingProspects: boolean) => {
      if (missingSequence && missingProspects)
        return "Add a sequence and prospects before activating."
      if (missingSequence) return "Add a sequence before activating."
      return "Add prospects before activating."
    },
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
    tabPreview: "Preview",
    tabProspects: "Prospects",
    tabConversations: "Conversations",
    tabSettings: "Settings",
    dailyPerformance: "Daily performance",
    dailyPerformanceDesc: "Sent, opened and replied per day.",
    noDailyData: "No daily data yet for this campaign.",
    audience: "Linked List",
    audienceDesc:
      "Link a single prospect list to feed this campaign. The link is 1-to-1; a dynamic list auto-enrolls new matching prospects as they're found.",
    prospectsCount: (count: number) => `${count} prospects`,
    companiesCount: (count: number) => `${count} companies`,
    findContacts: "Find prospects",
    dynamicSuffix: " · dynamic",
    detached: (name: string) => `Unlinked ${name}`,
    detach: "Unlink",
    chooseList: "Choose a list to link",
    createList: "Create a list",
    listCreatedAttached: (name: string) => `Created and linked "${name}"`,
    linkedElsewhere: " (linked elsewhere)",
    attached: (name: string) => `Linked ${name}`,
    listAttached: "List linked",
    attach: "Link",
    noListsToAttach: "No lists available to link yet.",
    summary: "Summary",
    statsInactiveNote:
      "Performance stats appear once this campaign is active.",
    sent: "Sent",
    opened: "Opened",
    replied: "Replied",
    bounced: "Bounced",
    moveStepUp: "Move step up",
    moveStepDown: "Move step down",
    removeStep: "Delete step",
    closePanel: "Close panel",
    insertStepAria: "Insert step here",
    stepChannelAria: (n: number) => `Step ${n} channel`,
    linkedinActionAria: (n: number) => `Step ${n} LinkedIn action`,
    linkedinActionLabel: {
      message: "Message",
      connect: "Connect",
      like_post: "Like post",
      view_profile: "View profile",
      voice_message: "Voice message",
    } as Record<LinkedInAction, string>,
    linkedinActionDescription: {
      message: "",
      connect: "Sends a LinkedIn connection request — no message.",
      like_post: "Likes the prospect's most recent post.",
      view_profile: "Visits the prospect's LinkedIn profile.",
      voice_message: "Sends a recorded voice message.",
    } as Record<LinkedInAction, string>,
    timeDelay: "Time Delay",
    sendImmediately: "Send immediately",
    delayByDays: "Delay by days",
    daysBeforeSending: "days before sending",
    clearDelay: "Reset to send immediately",
    actionNeeded: "Action needed",
    subjectLine: "Subject line",
    messageBody: "Message body",
    manualTaskBadge: "Manual",
    manualTaskAssignee: "Owner",
    taskTitlePlaceholder: "Task title, e.g. \"Call to follow up\"",
    taskNotesPlaceholder: "Notes for the rep (optional)",
    taskStartTimeLabel: "Start time",
    taskReminderLabel: "Reminder",
    manualTaskFooter: "This step creates a task for the assigned rep — it doesn't send automatically.",
    aiVoiceLabel: "Voice",
    aiCallAgentLabel: "Agent / goal",
    aiCallRetryLabel: "Retry unanswered calls",
    aiCallRetryCadenceLabel: (delays: string) => `Delays: ${delays}`,
    aiCallRetryFootnote: "Only for not-answered outcomes. Answered/voicemail keep normal behavior.",
    aiCallCadence: { rapid: "Rapid", relaxed: "Relaxed" },
    aiScriptPlaceholder: "Script / instructions for the AI agent",
    aiCallFooter: "This step places an agentic AI voice call using the script and voice above — it doesn't send automatically.",
    insertVariable: "+ Variables",
    personalizedVariable: "Personalized variable",
    personalizedVariablePlaceholder: "e.g. a friendly comment about their recent achievement",
    varsSearchPlaceholder: "Search variables…",
    varsEmpty: "No variables match your search.",
    varGroups: { yourDetails: "Your Details", prospectInfo: "Prospect Info", prospectCompany: "Prospect Company", other: "Other" } as Record<MergeVarGroupKey | "other", string>,
    variables: TEMPLATE_MERGE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
      acc[v.tag] = v.en
      return acc
    }, {}),
    conditionName: {
      reply: "Replied",
      open: "Opened",
      click: "Clicked a link",
      accept: "Accepted connection",
      read: "Read the message",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Forks on: ${name}`,
    removeCondition: "Remove condition",
    parallelStepNote: "Sends at the same time as the step next to it.",
    addParallelStepTitle: "Add a parallel step",
    applyChanges: "Apply changes",
    sequenceApplied: "Sequence updated",
    discardChanges: "Discard changes",
    copySequenceFrom: "Copy sequence from…",
    saveAsTemplate: "Save as template",
    previewMessages: "Preview messages",
    stepTemplates: "Templates",
    stepAiPrompt: "AI prompt",
    suggestedNext: (label: string) => `Suggested next: ${label}`,
    sequenceCopied: (n: number) =>
      n === 1
        ? "1 step copied into the sequence"
        : `${n} steps copied into the sequence`,
    groupEmail: "Email",
    groupMessaging: "Messaging",
    groupLinkedin: "LinkedIn",
    groupAiPowered: "AI-powered",
    groupOther: "Other",
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
    removeFromCampaignAction: "Remove from campaign",
    removedFromCampaign: "Removed from campaign",
    removedFromCampaignCount: (n: number) => `${n} removed from campaign`,
    exportedCsv: "Exported to CSV",
    capNote: (max: number) => `Only ${max.toLocaleString()} can be enriched at a time.`,
    noProspects: "No prospects or companies yet — add some to get started.",
    noReplies: "No replies yet.",
    viewInInbox: "View in inbox",
    of: "of",
    prevPage: "Previous",
    nextPage: "Next",
    editCampaign: "Edit campaign",
    editCampaignDesc: "Update the campaign name and status.",
    name: "Name",
    namePlaceholder: "Campaign name",
    goal: "Goal / intent",
    goalOptional: "Optional",
    goalPlaceholder:
      "What outcome are you driving? Book demos, revive cold leads, expand into a new segment…",
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
      whatsapp: "WhatsApp",
      call: "Llamada",
      ai_call: "Llamada de voz IA",
      linkedin_message: "Mensaje de LinkedIn",
      linkedin_dm: "Mensaje directo de LinkedIn",
      linkedin_inmail: "InMail de LinkedIn",
      manual: "Tarea manual",
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
    activateDisabledReason: (missingSequence: boolean, missingProspects: boolean) => {
      if (missingSequence && missingProspects)
        return "Agrega una secuencia y prospectos antes de activar."
      if (missingSequence) return "Agrega una secuencia antes de activar."
      return "Agrega prospectos antes de activar."
    },
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
    tabPreview: "Vista previa",
    tabProspects: "Prospectos",
    tabConversations: "Conversaciones",
    tabSettings: "Configuración",
    dailyPerformance: "Rendimiento diario",
    dailyPerformanceDesc: "Enviados, abiertos y respondidos por día.",
    noDailyData: "Aún no hay datos diarios para esta campaña.",
    audience: "Lista vinculada",
    audienceDesc:
      "Vincula una única lista de prospectos para alimentar esta campaña. La relación es de uno a uno; una lista dinámica inscribe automáticamente los nuevos prospectos que coincidan a medida que se encuentran.",
    prospectsCount: (count: number) => `${count} prospectos`,
    companiesCount: (count: number) => `${count} empresas`,
    findContacts: "Buscar prospectos",
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
    statsInactiveNote:
      "Las estadísticas de rendimiento aparecen cuando la campaña está activa.",
    sent: "Enviados",
    opened: "Aperturas",
    replied: "Respuestas",
    bounced: "Rebotes",
    moveStepUp: "Subir paso",
    moveStepDown: "Bajar paso",
    removeStep: "Eliminar paso",
    closePanel: "Cerrar panel",
    insertStepAria: "Insertar paso aquí",
    stepChannelAria: (n: number) => `Canal del paso ${n}`,
    linkedinActionAria: (n: number) => `Acción de LinkedIn del paso ${n}`,
    linkedinActionLabel: {
      message: "Mensaje",
      connect: "Conectar",
      like_post: "Dar me gusta",
      view_profile: "Ver perfil",
      voice_message: "Mensaje de voz",
    } as Record<LinkedInAction, string>,
    linkedinActionDescription: {
      message: "",
      connect: "Envía una solicitud de conexión de LinkedIn — sin mensaje.",
      like_post: "Da me gusta a la publicación más reciente del prospecto.",
      view_profile: "Visita el perfil de LinkedIn del prospecto.",
      voice_message: "Envía un mensaje de voz grabado.",
    } as Record<LinkedInAction, string>,
    timeDelay: "Retraso de tiempo",
    sendImmediately: "Enviar inmediatamente",
    delayByDays: "Retrasar por días",
    daysBeforeSending: "días antes de enviar",
    clearDelay: "Restablecer a envío inmediato",
    actionNeeded: "Necesita acción",
    subjectLine: "Asunto",
    messageBody: "Cuerpo del mensaje",
    manualTaskBadge: "Manual",
    manualTaskAssignee: "Responsable",
    taskTitlePlaceholder: "Título de la tarea, p. ej. «Llamar para dar seguimiento»",
    taskNotesPlaceholder: "Notas para el vendedor (opcional)",
    taskStartTimeLabel: "Hora de inicio",
    taskReminderLabel: "Recordatorio",
    manualTaskFooter: "Este paso crea una tarea para el vendedor asignado — no se envía automáticamente.",
    aiVoiceLabel: "Voz",
    aiCallAgentLabel: "Agente / objetivo",
    aiCallRetryLabel: "Reintentar llamadas sin respuesta",
    aiCallRetryCadenceLabel: (delays: string) => `Demoras: ${delays}`,
    aiCallRetryFootnote: "Solo para resultados sin respuesta. Contestadas/buzón de voz mantienen el comportamiento normal.",
    aiCallCadence: { rapid: "Rápido", relaxed: "Relajado" },
    aiScriptPlaceholder: "Guion / instrucciones para el agente de IA",
    aiCallFooter: "Este paso realiza una llamada de voz con IA agencial usando el guion y la voz de arriba — no se envía automáticamente.",
    insertVariable: "+ Variables",
    personalizedVariable: "Variable personalizada",
    personalizedVariablePlaceholder: "p. ej. un comentario amable sobre su logro reciente",
    varsSearchPlaceholder: "Buscar variables…",
    varsEmpty: "Ninguna variable coincide con tu búsqueda.",
    varGroups: { yourDetails: "Tus datos", prospectInfo: "Info del prospecto", prospectCompany: "Empresa del prospecto", other: "Otros" } as Record<MergeVarGroupKey | "other", string>,
    variables: TEMPLATE_MERGE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
      acc[v.tag] = v.es
      return acc
    }, {}),
    conditionName: {
      reply: "Respondió",
      open: "Abrió",
      click: "Hizo clic en un enlace",
      accept: "Aceptó la conexión",
      read: "Leyó el mensaje",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Bifurca en: ${name}`,
    removeCondition: "Quitar condición",
    parallelStepNote: "Se envía al mismo tiempo que el paso junto a él.",
    addParallelStepTitle: "Añadir un paso paralelo",
    applyChanges: "Aplicar cambios",
    sequenceApplied: "Secuencia actualizada",
    discardChanges: "Descartar cambios",
    copySequenceFrom: "Copiar secuencia de…",
    saveAsTemplate: "Guardar como plantilla",
    previewMessages: "Vista previa de mensajes",
    stepTemplates: "Plantillas",
    stepAiPrompt: "Prompt de IA",
    suggestedNext: (label: string) => `Sugerencia: ${label}`,
    sequenceCopied: (n: number) =>
      n === 1
        ? "1 paso copiado a la secuencia"
        : `${n} pasos copiados a la secuencia`,
    groupEmail: "Correo",
    groupMessaging: "Mensajería",
    groupLinkedin: "LinkedIn",
    groupAiPowered: "Con IA",
    groupOther: "Otro",
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
    removeFromCampaignAction: "Quitar de la campaña",
    removedFromCampaign: "Eliminado de la campaña",
    removedFromCampaignCount: (n: number) => `${n} eliminados de la campaña`,
    exportedCsv: "Exportado a CSV",
    capNote: (max: number) => `Solo se pueden enriquecer ${max.toLocaleString()} a la vez.`,
    noProspects:
      "Aún no hay prospectos ni empresas — añade algunos para empezar.",
    noReplies: "Aún no hay respuestas.",
    viewInInbox: "Ver en la bandeja",
    of: "de",
    prevPage: "Anterior",
    nextPage: "Siguiente",
    editCampaign: "Editar campaña",
    editCampaignDesc: "Actualiza el nombre y el estado de la campaña.",
    name: "Nombre",
    namePlaceholder: "Nombre de la campaña",
    goal: "Objetivo / intención",
    goalOptional: "Opcional",
    goalPlaceholder:
      "¿Qué resultado buscas? Agendar demos, reactivar leads fríos, entrar en un nuevo segmento…",
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
  it: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Telefonata",
      ai_call: "Chiamata vocale IA",
      linkedin_message: "Messaggio LinkedIn",
      linkedin_dm: "Messaggio diretto di LinkedIn",
      linkedin_inmail: "InMail di LinkedIn",
      manual: "Attività manuale",
    } as Record<StepChannel, string>,
    statusLabel: {
      active: "Attiva",
      paused: "Inattiva",
      draft: "Bozza",
      completed: "Conclusa",
    } as Record<CampaignStatus, string>,
    enrollmentLabel: {
      replied: "Ha risposto",
      active: "Attivo",
      completed: "Completato",
      paused: "In pausa",
      bounced: "Rimbalzato",
    } as Record<EnrollmentStatus, string>,
    campaignNotFound: "Campagna non trovata.",
    backToCampaigns: "Torna alle campagne",
    campaigns: "Campagne",
    createdSteps: (date: string, steps: number) =>
      `Creata il ${date} · ${steps} passaggi`,
    pause: "Disattiva",
    activate: "Attiva",
    activateDisabledReason: (missingSequence: boolean, missingProspects: boolean) => {
      if (missingSequence && missingProspects)
        return "Aggiungi una sequenza e dei prospect prima di attivare."
      if (missingSequence) return "Aggiungi una sequenza prima di attivare."
      return "Aggiungi dei prospect prima di attivare."
    },
    endCampaign: "Termina campagna",
    endConfirmTitle: "Terminare questa campagna?",
    endConfirmBody:
      "Terminandola si annulla la programmazione di tutte le sequenze incomplete (messaggi non ancora inviati). Non si può riprendere.",
    endConfirm: "Termina campagna",
    ended: (name: string) => `${name} terminata`,
    account: "Account",
    language: "Lingua",
    english: "English",
    spanish: "Español",
    sendingSettings: "Invio",
    sendingSettingsDesc:
      "Scegli da quale account viene inviata questa campagna e in quale lingua.",
    locksAfterActivation: "Si blocca dopo l'attivazione",
    senderSaved: "Impostazioni di invio aggiornate",
    alreadyMessagedSkipped: "I destinatari già contattati vengono saltati",
    edit: "Modifica",
    addProspects: "Aggiungi prospect",
    columns: "Colonne",
    paused: (name: string) => `${name} in pausa`,
    activated: (name: string) => `${name} attivata`,
    scheduleStart: "Programma inizio…",
    tomorrowMorning: "Domani, 8:00",
    mondayMorning: "Lunedì, 8:00",
    scheduleTitle: "Programma l'inizio della campagna",
    scheduleDesc: "Scegli quando questa campagna deve iniziare a inviare.",
    scheduleWhen: "Inizia a inviare il",
    scheduleConfirm: "Programma inizio",
    startsAt: (d: string) => `Inizia il ${d}`,
    startNow: "Inizia ora",
    cancelSchedule: "Annulla programmazione",
    scheduledToast: (d: string) => `Campagna programmata per iniziare il ${d}`,
    scheduleCancelledToast: "Programmazione di inizio annullata",
    enrolled: "Iscritti",
    openRate: "Tasso di apertura",
    replyRate: "Tasso di risposta",
    meetings: "Riunioni",
    tabOverview: "Panoramica",
    tabSequence: "Sequenza",
    tabPreview: "Anteprima",
    tabProspects: "Prospect",
    tabConversations: "Conversazioni",
    tabSettings: "Impostazioni",
    dailyPerformance: "Andamento giornaliero",
    dailyPerformanceDesc: "Inviati, aperti e risposti al giorno.",
    noDailyData: "Ancora nessun dato giornaliero per questa campagna.",
    audience: "Lista collegata",
    audienceDesc:
      "Collega un'unica lista di prospect per alimentare questa campagna. Il collegamento è uno a uno; una lista dinamica iscrive automaticamente i nuovi prospect corrispondenti man mano che vengono trovati.",
    prospectsCount: (count: number) => `${count} prospect`,
    companiesCount: (count: number) => `${count} aziende`,
    findContacts: "Trova prospect",
    dynamicSuffix: " · dinamica",
    detached: (name: string) => `${name} scollegata`,
    detach: "Scollega",
    chooseList: "Scegli una lista da collegare",
    createList: "Crea una lista",
    listCreatedAttached: (name: string) => `«${name}» creata e collegata`,
    linkedElsewhere: " (collegata altrove)",
    attached: (name: string) => `${name} collegata`,
    listAttached: "Lista collegata",
    attach: "Collega",
    noListsToAttach: "Ancora nessuna lista disponibile da collegare.",
    summary: "Riepilogo",
    statsInactiveNote:
      "Le statistiche di rendimento appaiono quando la campagna è attiva.",
    sent: "Inviati",
    opened: "Aperture",
    replied: "Risposte",
    bounced: "Rimbalzi",
    moveStepUp: "Sposta passaggio su",
    moveStepDown: "Sposta passaggio giù",
    removeStep: "Elimina passaggio",
    closePanel: "Chiudi pannello",
    insertStepAria: "Inserisci un passaggio qui",
    stepChannelAria: (n: number) => `Canale del passaggio ${n}`,
    linkedinActionAria: (n: number) => `Azione LinkedIn del passaggio ${n}`,
    linkedinActionLabel: {
      message: "Messaggio",
      connect: "Connetti",
      like_post: "Metti mi piace",
      view_profile: "Visualizza profilo",
      voice_message: "Messaggio vocale",
    } as Record<LinkedInAction, string>,
    linkedinActionDescription: {
      message: "",
      connect: "Invia una richiesta di connessione LinkedIn — senza messaggio.",
      like_post: "Mette mi piace all'ultimo post del prospect.",
      view_profile: "Visita il profilo LinkedIn del prospect.",
      voice_message: "Invia un messaggio vocale registrato.",
    } as Record<LinkedInAction, string>,
    timeDelay: "Ritardo di tempo",
    sendImmediately: "Invia subito",
    delayByDays: "Ritarda di giorni",
    daysBeforeSending: "giorni prima dell'invio",
    clearDelay: "Ripristina invio immediato",
    actionNeeded: "Azione richiesta",
    subjectLine: "Oggetto",
    messageBody: "Corpo del messaggio",
    manualTaskBadge: "Manuale",
    manualTaskAssignee: "Responsabile",
    taskTitlePlaceholder: "Titolo dell'attività, es. «Chiamare per un follow-up»",
    taskNotesPlaceholder: "Note per il rappresentante (facoltativo)",
    taskStartTimeLabel: "Orario di inizio",
    taskReminderLabel: "Promemoria",
    manualTaskFooter: "Questo passaggio crea un'attività per il rappresentante assegnato — non viene inviato automaticamente.",
    aiVoiceLabel: "Voce",
    aiCallAgentLabel: "Agente / obiettivo",
    aiCallRetryLabel: "Riprova le chiamate senza risposta",
    aiCallRetryCadenceLabel: (delays: string) => `Ritardi: ${delays}`,
    aiCallRetryFootnote: "Solo per gli esiti senza risposta. Risposte/segreteria mantengono il comportamento normale.",
    aiCallCadence: { rapid: "Rapido", relaxed: "Rilassato" },
    aiScriptPlaceholder: "Script / istruzioni per l'agente IA",
    aiCallFooter: "Questo passaggio effettua una chiamata vocale IA agentica usando lo script e la voce sopra — non viene inviato automaticamente.",
    insertVariable: "+ Variabili",
    personalizedVariable: "Variabile personalizzata",
    personalizedVariablePlaceholder: "es. un commento amichevole sul loro recente traguardo",
    varsSearchPlaceholder: "Cerca variabili…",
    varsEmpty: "Nessuna variabile corrisponde alla tua ricerca.",
    varGroups: { yourDetails: "I tuoi dati", prospectInfo: "Info sul prospect", prospectCompany: "Azienda del prospect", other: "Altro" } as Record<MergeVarGroupKey | "other", string>,
    variables: TEMPLATE_MERGE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
      acc[v.tag] = v.it
      return acc
    }, {}),
    conditionName: {
      reply: "Ha risposto",
      open: "Ha aperto",
      click: "Ha cliccato un link",
      accept: "Ha accettato la connessione",
      read: "Ha letto il messaggio",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Si dirama su: ${name}`,
    removeCondition: "Rimuovi condizione",
    parallelStepNote: "Viene inviato nello stesso momento del passaggio accanto.",
    addParallelStepTitle: "Aggiungi un passaggio parallelo",
    applyChanges: "Applica modifiche",
    sequenceApplied: "Sequenza aggiornata",
    discardChanges: "Annulla modifiche",
    copySequenceFrom: "Copia sequenza da…",
    saveAsTemplate: "Salva come modello",
    previewMessages: "Anteprima messaggi",
    stepTemplates: "Modelli",
    stepAiPrompt: "Prompt IA",
    suggestedNext: (label: string) => `Suggerito: ${label}`,
    sequenceCopied: (n: number) =>
      n === 1
        ? "1 passaggio copiato nella sequenza"
        : `${n} passaggi copiati nella sequenza`,
    groupEmail: "Email",
    groupMessaging: "Messaggistica",
    groupLinkedin: "LinkedIn",
    groupAiPowered: "Basato su IA",
    groupOther: "Altro",
    setupTitle: "Completa la configurazione di questa campagna",
    setupDesc: "Una campagna ha bisogno di una sequenza e di prospect prima di poter partire.",
    setupSequenceLabel: "Crea la tua sequenza",
    setupSequenceDesc: "Aggiungi le email e i passaggi che questa campagna invierà.",
    setupSequenceCta: "Crea sequenza",
    setupProspectsLabel: "Aggiungi prospect",
    setupProspectsDesc: "Collega una lista o iscrivi i prospect da contattare.",
    setupProspectsCta: "Aggiungi prospect",
    setupDone: "Fatto",
    thProspect: "Prospect",
    thTitleCompany: "Ruolo / Azienda",
    thCurrentStep: "Passaggio attuale",
    thStatus: "Stato",
    thLastTouch: "Ultimo contatto",
    unknownProspect: "Prospect sconosciuto",
    stepOf: (current: number, total: number) =>
      `Passaggio ${current} di ${total}`,
    justAdded: "Appena aggiunto",
    removeFromCampaignAction: "Rimuovi dalla campagna",
    removedFromCampaign: "Rimosso dalla campagna",
    removedFromCampaignCount: (n: number) => `${n} rimossi dalla campagna`,
    exportedCsv: "Esportato in CSV",
    capNote: (max: number) => `Si possono arricchire solo ${max.toLocaleString()} alla volta.`,
    noProspects: "Ancora nessun prospect o azienda — aggiungine alcuni per iniziare.",
    noReplies: "Ancora nessuna risposta.",
    viewInInbox: "Vedi nella posta in arrivo",
    of: "di",
    prevPage: "Precedente",
    nextPage: "Successiva",
    editCampaign: "Modifica campagna",
    editCampaignDesc: "Aggiorna il nome e lo stato della campagna.",
    name: "Nome",
    namePlaceholder: "Nome della campagna",
    goal: "Obiettivo / intento",
    goalOptional: "Facoltativo",
    goalPlaceholder:
      "Che risultato vuoi ottenere? Prenotare demo, riattivare lead freddi, entrare in un nuovo segmento…",
    status: "Stato",
    cancel: "Annulla",
    saveChanges: "Salva modifiche",
    campaignUpdated: "Campagna aggiornata",
    enrichGateTitle: "Arricchire le email prima di avviare?",
    enrichGateBody: (n: number, credits: number) =>
      `${n} prospect iscritti non hanno ancora un'email verificata. Arricchire ora usa ~${credits} crediti ed evita errori "email non disponibile" a campagna avviata.`,
    enrichAndActivate: "Arricchisci e attiva",
    activateAnyway: "Attiva senza arricchire",
    enrichingToast: (n: number) =>
      `Arricchimento di ${n} email… puoi continuare a lavorare, ti avviseremo.`,
    enrichedToast: (n: number) => `${n} email arricchite · campagna attivata`,
    enrichInsufficient: "Crediti insufficienti per arricchire",
    automations: "Automazioni",
    automationsDesc: "Lascia che Kai agisca sulle risposte per te.",
    alertInterested: "Avvisami quando una risposta viene marcata come Interessato",
    alertInterestedDesc:
      "Ricevi una notifica non appena Kai classifica una risposta come Interessato.",
    alsoEmail: "Avvisami anche via email",
    alertsOnToast: "Avvisi Interessato attivati",
    interested: "Interessato",
    alertSent: "Avviso inviato",
  },
  fr: {
    channelLabel: {
      email: "E-mail",
      whatsapp: "WhatsApp",
      call: "Appel téléphonique",
      ai_call: "Appel vocal IA",
      linkedin_message: "Message LinkedIn",
      linkedin_dm: "Message direct LinkedIn",
      linkedin_inmail: "InMail LinkedIn",
      manual: "Tâche manuelle",
    } as Record<StepChannel, string>,
    statusLabel: {
      active: "Active",
      paused: "Inactive",
      draft: "Brouillon",
      completed: "Terminée",
    } as Record<CampaignStatus, string>,
    enrollmentLabel: {
      replied: "A répondu",
      active: "Actif",
      completed: "Terminé",
      paused: "En pause",
      bounced: "Rejeté",
    } as Record<EnrollmentStatus, string>,
    campaignNotFound: "Campagne introuvable.",
    backToCampaigns: "Retour aux campagnes",
    campaigns: "Campagnes",
    createdSteps: (date: string, steps: number) =>
      `Créée le ${date} · ${steps} étapes`,
    pause: "Désactiver",
    activate: "Activer",
    activateDisabledReason: (missingSequence: boolean, missingProspects: boolean) => {
      if (missingSequence && missingProspects)
        return "Ajoutez une séquence et des prospects avant d'activer."
      if (missingSequence) return "Ajoutez une séquence avant d'activer."
      return "Ajoutez des prospects avant d'activer."
    },
    endCampaign: "Terminer la campagne",
    endConfirmTitle: "Terminer cette campagne ?",
    endConfirmBody:
      "Terminer la campagne déprogramme toutes les séquences incomplètes (messages pas encore envoyés). Cette action est irréversible.",
    endConfirm: "Terminer la campagne",
    ended: (name: string) => `${name} terminée`,
    account: "Compte",
    language: "Langue",
    english: "English",
    spanish: "Español",
    sendingSettings: "Envoi",
    sendingSettingsDesc:
      "Choisissez depuis quel compte cette campagne envoie et dans quelle langue.",
    locksAfterActivation: "Se verrouille après activation",
    senderSaved: "Paramètres d'envoi mis à jour",
    alreadyMessagedSkipped: "Les destinataires déjà contactés sont ignorés",
    edit: "Modifier",
    addProspects: "Ajouter des prospects",
    columns: "Colonnes",
    paused: (name: string) => `${name} mise en pause`,
    activated: (name: string) => `${name} activée`,
    scheduleStart: "Programmer le démarrage…",
    tomorrowMorning: "Demain, 8 h 00",
    mondayMorning: "Lundi, 8 h 00",
    scheduleTitle: "Programmer le démarrage de la campagne",
    scheduleDesc: "Choisissez quand cette campagne doit commencer à envoyer.",
    scheduleWhen: "Démarrer l'envoi le",
    scheduleConfirm: "Programmer le démarrage",
    startsAt: (d: string) => `Démarre le ${d}`,
    startNow: "Démarrer maintenant",
    cancelSchedule: "Annuler la programmation",
    scheduledToast: (d: string) => `Campagne programmée pour démarrer le ${d}`,
    scheduleCancelledToast: "Programmation de démarrage annulée",
    enrolled: "Inscrits",
    openRate: "Taux d'ouverture",
    replyRate: "Taux de réponse",
    meetings: "Rendez-vous",
    tabOverview: "Aperçu",
    tabSequence: "Séquence",
    tabPreview: "Aperçu",
    tabProspects: "Prospects",
    tabConversations: "Conversations",
    tabSettings: "Paramètres",
    dailyPerformance: "Performance quotidienne",
    dailyPerformanceDesc: "Envoyés, ouverts et répondus par jour.",
    noDailyData: "Pas encore de données quotidiennes pour cette campagne.",
    audience: "Liste liée",
    audienceDesc:
      "Liez une seule liste de prospects pour alimenter cette campagne. Le lien est univoque ; une liste dynamique inscrit automatiquement les nouveaux prospects correspondants au fur et à mesure qu'ils sont trouvés.",
    prospectsCount: (count: number) => `${count} prospects`,
    companiesCount: (count: number) => `${count} entreprises`,
    findContacts: "Trouver des prospects",
    dynamicSuffix: " · dynamique",
    detached: (name: string) => `${name} dissociée`,
    detach: "Dissocier",
    chooseList: "Choisissez une liste à lier",
    createList: "Créer une liste",
    listCreatedAttached: (name: string) => `« ${name} » créée et liée`,
    linkedElsewhere: " (liée ailleurs)",
    attached: (name: string) => `${name} liée`,
    listAttached: "Liste liée",
    attach: "Lier",
    noListsToAttach: "Aucune liste disponible à lier pour l'instant.",
    summary: "Résumé",
    statsInactiveNote:
      "Les statistiques de performance apparaissent une fois la campagne active.",
    sent: "Envoyés",
    opened: "Ouvertures",
    replied: "Réponses",
    bounced: "Rejets",
    moveStepUp: "Monter l'étape",
    moveStepDown: "Descendre l'étape",
    removeStep: "Supprimer l'étape",
    closePanel: "Fermer le panneau",
    insertStepAria: "Insérer une étape ici",
    stepChannelAria: (n: number) => `Canal de l'étape ${n}`,
    linkedinActionAria: (n: number) => `Action LinkedIn de l'étape ${n}`,
    linkedinActionLabel: {
      message: "Message",
      connect: "Se connecter",
      like_post: "Aimer la publication",
      view_profile: "Voir le profil",
      voice_message: "Message vocal",
    } as Record<LinkedInAction, string>,
    linkedinActionDescription: {
      message: "",
      connect: "Envoie une demande de connexion LinkedIn — sans message.",
      like_post: "Aime la publication la plus récente du prospect.",
      view_profile: "Visite le profil LinkedIn du prospect.",
      voice_message: "Envoie un message vocal enregistré.",
    } as Record<LinkedInAction, string>,
    timeDelay: "Délai",
    sendImmediately: "Envoyer immédiatement",
    delayByDays: "Différer de plusieurs jours",
    daysBeforeSending: "jours avant l'envoi",
    clearDelay: "Revenir à un envoi immédiat",
    actionNeeded: "Action requise",
    subjectLine: "Objet",
    messageBody: "Corps du message",
    manualTaskBadge: "Manuel",
    manualTaskAssignee: "Responsable",
    taskTitlePlaceholder: "Titre de la tâche, par ex. « Appeler pour relancer »",
    taskNotesPlaceholder: "Notes pour le commercial (facultatif)",
    taskStartTimeLabel: "Heure de début",
    taskReminderLabel: "Rappel",
    manualTaskFooter: "Cette étape crée une tâche pour le commercial assigné — elle n'est pas envoyée automatiquement.",
    aiVoiceLabel: "Voix",
    aiCallAgentLabel: "Agent / objectif",
    aiCallRetryLabel: "Relancer les appels sans réponse",
    aiCallRetryCadenceLabel: (delays: string) => `Délais : ${delays}`,
    aiCallRetryFootnote: "Uniquement pour les résultats sans réponse. Les appels décrochés ou messagerie vocale suivent le comportement normal.",
    aiCallCadence: { rapid: "Rapide", relaxed: "Détendu" },
    aiScriptPlaceholder: "Script / instructions pour l'agent IA",
    aiCallFooter: "Cette étape passe un appel vocal IA agentique en utilisant le script et la voix ci-dessus — il n'est pas envoyé automatiquement.",
    insertVariable: "+ Variables",
    personalizedVariable: "Variable personnalisée",
    personalizedVariablePlaceholder: "ex. un commentaire sympathique sur leur récente réussite",
    varsSearchPlaceholder: "Rechercher des variables…",
    varsEmpty: "Aucune variable ne correspond à votre recherche.",
    varGroups: { yourDetails: "Vos informations", prospectInfo: "Infos du prospect", prospectCompany: "Entreprise du prospect", other: "Autre" } as Record<MergeVarGroupKey | "other", string>,
    variables: TEMPLATE_MERGE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
      acc[v.tag] = v.fr
      return acc
    }, {}),
    conditionName: {
      reply: "A répondu",
      open: "A ouvert",
      click: "A cliqué sur un lien",
      accept: "A accepté la connexion",
      read: "A lu le message",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Se divise sur : ${name}`,
    removeCondition: "Supprimer la condition",
    parallelStepNote: "Envoyé en même temps que l'étape voisine.",
    addParallelStepTitle: "Ajouter une étape parallèle",
    applyChanges: "Appliquer les modifications",
    sequenceApplied: "Séquence mise à jour",
    discardChanges: "Annuler les modifications",
    copySequenceFrom: "Copier la séquence depuis…",
    saveAsTemplate: "Enregistrer comme modèle",
    previewMessages: "Aperçu des messages",
    stepTemplates: "Modèles",
    stepAiPrompt: "Prompt IA",
    suggestedNext: (label: string) => `Suggestion suivante : ${label}`,
    sequenceCopied: (n: number) =>
      n === 1
        ? "1 étape copiée dans la séquence"
        : `${n} étapes copiées dans la séquence`,
    groupEmail: "E-mail",
    groupMessaging: "Messagerie",
    groupLinkedin: "LinkedIn",
    groupAiPowered: "Propulsé par l'IA",
    groupOther: "Autre",
    setupTitle: "Terminez la configuration de cette campagne",
    setupDesc: "Une campagne a besoin d'une séquence et de prospects avant de pouvoir démarrer.",
    setupSequenceLabel: "Créez votre séquence",
    setupSequenceDesc: "Ajoutez les e-mails et étapes que cette campagne enverra.",
    setupSequenceCta: "Créer la séquence",
    setupProspectsLabel: "Ajoutez des prospects",
    setupProspectsDesc: "Liez une liste ou inscrivez les prospects à contacter.",
    setupProspectsCta: "Ajouter des prospects",
    setupDone: "Terminé",
    thProspect: "Prospect",
    thTitleCompany: "Poste / Entreprise",
    thCurrentStep: "Étape actuelle",
    thStatus: "Statut",
    thLastTouch: "Dernier contact",
    unknownProspect: "Prospect inconnu",
    stepOf: (current: number, total: number) =>
      `Étape ${current} sur ${total}`,
    justAdded: "Ajouté à l'instant",
    removeFromCampaignAction: "Retirer de la campagne",
    removedFromCampaign: "Retiré de la campagne",
    removedFromCampaignCount: (n: number) => `${n} retirés de la campagne`,
    exportedCsv: "Exporté en CSV",
    capNote: (max: number) => `Seuls ${max.toLocaleString()} peuvent être enrichis à la fois.`,
    noProspects:
      "Pas encore de prospects ni d'entreprises — ajoutez-en pour commencer.",
    noReplies: "Pas encore de réponses.",
    viewInInbox: "Voir dans la boîte de réception",
    of: "sur",
    prevPage: "Précédent",
    nextPage: "Suivant",
    editCampaign: "Modifier la campagne",
    editCampaignDesc: "Mettez à jour le nom et le statut de la campagne.",
    name: "Nom",
    namePlaceholder: "Nom de la campagne",
    goal: "Objectif / intention",
    goalOptional: "Facultatif",
    goalPlaceholder:
      "Quel résultat visez-vous ? Décrocher des démos, relancer des leads froids, aborder un nouveau segment…",
    status: "Statut",
    cancel: "Annuler",
    saveChanges: "Enregistrer les modifications",
    campaignUpdated: "Campagne mise à jour",
    enrichGateTitle: "Enrichir les e-mails avant le lancement ?",
    enrichGateBody: (n: number, credits: number) =>
      `${n} prospects inscrits n'ont pas encore d'e-mail vérifié. Enrichir maintenant utilise ~${credits} crédits et évite les erreurs "e-mail indisponible" une fois la campagne active.`,
    enrichAndActivate: "Enrichir et activer",
    activateAnyway: "Activer sans enrichir",
    enrichingToast: (n: number) =>
      `Enrichissement de ${n} e-mails… vous pouvez continuer à travailler, nous vous préviendrons.`,
    enrichedToast: (n: number) => `${n} e-mails enrichis · campagne activée`,
    enrichInsufficient: "Crédits insuffisants pour enrichir",
    automations: "Automatisations",
    automationsDesc: "Laissez Kai agir sur les réponses à votre place.",
    alertInterested: "M'alerter quand une réponse est marquée Intéressé",
    alertInterestedDesc:
      "Recevez une notification dès que Kai classe une réponse comme Intéressé.",
    alsoEmail: "M'alerter aussi par e-mail",
    alertsOnToast: "Alertes Intéressé activées",
    interested: "Intéressé",
    alertSent: "Alerte envoyée",
  },
  de: {
    channelLabel: {
      email: "E-Mail",
      whatsapp: "WhatsApp",
      call: "Anruf",
      ai_call: "KI-Sprachanruf",
      linkedin_message: "LinkedIn-Nachricht",
      linkedin_dm: "LinkedIn-Direktnachricht",
      linkedin_inmail: "LinkedIn InMail",
      manual: "Manuelle Aufgabe",
    } as Record<StepChannel, string>,
    statusLabel: {
      active: "Aktiv",
      paused: "Inaktiv",
      draft: "Entwurf",
      completed: "Beendet",
    } as Record<CampaignStatus, string>,
    enrollmentLabel: {
      replied: "Hat geantwortet",
      active: "Aktiv",
      completed: "Abgeschlossen",
      paused: "Pausiert",
      bounced: "Unzustellbar",
    } as Record<EnrollmentStatus, string>,
    campaignNotFound: "Kampagne nicht gefunden.",
    backToCampaigns: "Zurück zu den Kampagnen",
    campaigns: "Kampagnen",
    createdSteps: (date: string, steps: number) =>
      `Erstellt am ${date} · ${steps} Schritte`,
    pause: "Deaktivieren",
    activate: "Aktivieren",
    activateDisabledReason: (missingSequence: boolean, missingProspects: boolean) => {
      if (missingSequence && missingProspects)
        return "Füge eine Sequenz und Prospects hinzu, bevor du aktivierst."
      if (missingSequence) return "Füge eine Sequenz hinzu, bevor du aktivierst."
      return "Füge Prospects hinzu, bevor du aktivierst."
    },
    endCampaign: "Kampagne beenden",
    endConfirmTitle: "Diese Kampagne beenden?",
    endConfirmBody:
      "Beim Beenden werden alle unvollständigen Sequenzen (noch nicht gesendete Nachrichten) aus dem Zeitplan genommen. Das kann nicht fortgesetzt werden.",
    endConfirm: "Kampagne beenden",
    ended: (name: string) => `${name} beendet`,
    account: "Konto",
    language: "Sprache",
    english: "English",
    spanish: "Español",
    sendingSettings: "Versand",
    sendingSettingsDesc:
      "Wähle, von welchem Konto diese Kampagne sendet und in welcher Sprache.",
    locksAfterActivation: "Wird nach der Aktivierung gesperrt",
    senderSaved: "Versandeinstellungen aktualisiert",
    alreadyMessagedSkipped: "Bereits kontaktierte Empfänger werden übersprungen",
    edit: "Bearbeiten",
    addProspects: "Prospects hinzufügen",
    columns: "Spalten",
    paused: (name: string) => `${name} pausiert`,
    activated: (name: string) => `${name} aktiviert`,
    scheduleStart: "Start planen…",
    tomorrowMorning: "Morgen, 8:00 Uhr",
    mondayMorning: "Montag, 8:00 Uhr",
    scheduleTitle: "Kampagnenstart planen",
    scheduleDesc: "Wähle, wann diese Kampagne mit dem Versand beginnen soll.",
    scheduleWhen: "Versand beginnt am",
    scheduleConfirm: "Start planen",
    startsAt: (d: string) => `Startet am ${d}`,
    startNow: "Jetzt starten",
    cancelSchedule: "Zeitplan verwerfen",
    scheduledToast: (d: string) => `Kampagne für den Start am ${d} geplant`,
    scheduleCancelledToast: "Startzeitplan verworfen",
    enrolled: "Eingeschrieben",
    openRate: "Öffnungsrate",
    replyRate: "Antwortquote",
    meetings: "Meetings",
    tabOverview: "Übersicht",
    tabSequence: "Sequenz",
    tabPreview: "Vorschau",
    tabProspects: "Prospects",
    tabConversations: "Unterhaltungen",
    tabSettings: "Einstellungen",
    dailyPerformance: "Tägliche Leistung",
    dailyPerformanceDesc: "Gesendet, geöffnet und beantwortet pro Tag.",
    noDailyData: "Noch keine Tagesdaten für diese Kampagne.",
    audience: "Verknüpfte Liste",
    audienceDesc:
      "Verknüpfe eine einzelne Prospect-Liste, um diese Kampagne zu speisen. Die Verknüpfung ist 1-zu-1; eine dynamische Liste schreibt neue passende Prospects automatisch ein, sobald sie gefunden werden.",
    prospectsCount: (count: number) => `${count} Prospects`,
    companiesCount: (count: number) => `${count} Unternehmen`,
    findContacts: "Prospects finden",
    dynamicSuffix: " · dynamisch",
    detached: (name: string) => `${name} entkoppelt`,
    detach: "Entkoppeln",
    chooseList: "Wähle eine Liste zum Verknüpfen",
    createList: "Liste erstellen",
    listCreatedAttached: (name: string) => `„${name}“ erstellt und verknüpft`,
    linkedElsewhere: " (an anderer Stelle verknüpft)",
    attached: (name: string) => `${name} verknüpft`,
    listAttached: "Liste verknüpft",
    attach: "Verknüpfen",
    noListsToAttach: "Noch keine Listen zum Verknüpfen verfügbar.",
    summary: "Zusammenfassung",
    statsInactiveNote:
      "Leistungsstatistiken erscheinen, sobald diese Kampagne aktiv ist.",
    sent: "Gesendet",
    opened: "Geöffnet",
    replied: "Beantwortet",
    bounced: "Unzustellbar",
    moveStepUp: "Schritt nach oben verschieben",
    moveStepDown: "Schritt nach unten verschieben",
    removeStep: "Schritt löschen",
    closePanel: "Panel schließen",
    insertStepAria: "Schritt hier einfügen",
    stepChannelAria: (n: number) => `Kanal für Schritt ${n}`,
    linkedinActionAria: (n: number) => `LinkedIn-Aktion für Schritt ${n}`,
    linkedinActionLabel: {
      message: "Nachricht",
      connect: "Vernetzen",
      like_post: "Beitrag liken",
      view_profile: "Profil ansehen",
      voice_message: "Sprachnachricht",
    } as Record<LinkedInAction, string>,
    linkedinActionDescription: {
      message: "",
      connect: "Sendet eine LinkedIn-Vernetzungsanfrage — ohne Nachricht.",
      like_post: "Liked den neuesten Beitrag des Prospects.",
      view_profile: "Besucht das LinkedIn-Profil des Prospects.",
      voice_message: "Sendet eine aufgezeichnete Sprachnachricht.",
    } as Record<LinkedInAction, string>,
    timeDelay: "Zeitverzögerung",
    sendImmediately: "Sofort senden",
    delayByDays: "Tage verzögern",
    daysBeforeSending: "Tage vor dem Versand",
    clearDelay: "Auf sofortigen Versand zurücksetzen",
    actionNeeded: "Aktion erforderlich",
    subjectLine: "Betreff",
    messageBody: "Nachrichtentext",
    manualTaskBadge: "Manuell",
    manualTaskAssignee: "Verantwortlich",
    taskTitlePlaceholder: "Aufgabentitel, z. B. „Rückruf zur Nachverfolgung“",
    taskNotesPlaceholder: "Notizen für den Vertriebsmitarbeiter (optional)",
    taskStartTimeLabel: "Startzeit",
    taskReminderLabel: "Erinnerung",
    manualTaskFooter: "Dieser Schritt erstellt eine Aufgabe für den zugewiesenen Vertriebsmitarbeiter — er wird nicht automatisch gesendet.",
    aiVoiceLabel: "Stimme",
    aiCallAgentLabel: "Agent / Ziel",
    aiCallRetryLabel: "Unbeantwortete Anrufe wiederholen",
    aiCallRetryCadenceLabel: (delays: string) => `Verzögerungen: ${delays}`,
    aiCallRetryFootnote: "Nur für nicht angenommene Anrufe. Angenommene Anrufe/Mailbox behalten das normale Verhalten.",
    aiCallCadence: { rapid: "Schnell", relaxed: "Entspannt" },
    aiScriptPlaceholder: "Skript / Anweisungen für den KI-Agenten",
    aiCallFooter: "Dieser Schritt führt einen agentischen KI-Sprachanruf mit dem obigen Skript und der obigen Stimme durch — er wird nicht automatisch gesendet.",
    insertVariable: "+ Variablen",
    personalizedVariable: "Personalisierte Variable",
    personalizedVariablePlaceholder: "z. B. ein freundlicher Kommentar zu ihrem jüngsten Erfolg",
    varsSearchPlaceholder: "Variablen suchen…",
    varsEmpty: "Keine Variablen entsprechen deiner Suche.",
    varGroups: { yourDetails: "Deine Angaben", prospectInfo: "Prospect-Infos", prospectCompany: "Unternehmen des Prospects", other: "Sonstiges" } as Record<MergeVarGroupKey | "other", string>,
    variables: TEMPLATE_MERGE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
      acc[v.tag] = v.de
      return acc
    }, {}),
    conditionName: {
      reply: "Hat geantwortet",
      open: "Hat geöffnet",
      click: "Hat auf einen Link geklickt",
      accept: "Hat die Verbindung angenommen",
      read: "Hat die Nachricht gelesen",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Verzweigt bei: ${name}`,
    removeCondition: "Bedingung entfernen",
    parallelStepNote: "Wird gleichzeitig mit dem danebenliegenden Schritt gesendet.",
    addParallelStepTitle: "Parallelen Schritt hinzufügen",
    applyChanges: "Änderungen übernehmen",
    sequenceApplied: "Sequenz aktualisiert",
    discardChanges: "Änderungen verwerfen",
    copySequenceFrom: "Sequenz kopieren von…",
    saveAsTemplate: "Als Vorlage speichern",
    previewMessages: "Nachrichten in der Vorschau ansehen",
    stepTemplates: "Vorlagen",
    stepAiPrompt: "KI-Prompt",
    suggestedNext: (label: string) => `Vorschlag für Nächstes: ${label}`,
    sequenceCopied: (n: number) =>
      n === 1
        ? "1 Schritt in die Sequenz kopiert"
        : `${n} Schritte in die Sequenz kopiert`,
    groupEmail: "E-Mail",
    groupMessaging: "Messaging",
    groupLinkedin: "LinkedIn",
    groupAiPowered: "KI-gestützt",
    groupOther: "Sonstiges",
    setupTitle: "Schließe die Einrichtung dieser Kampagne ab",
    setupDesc: "Eine Kampagne braucht eine Sequenz und Prospects, bevor sie laufen kann.",
    setupSequenceLabel: "Erstelle deine Sequenz",
    setupSequenceDesc: "Füge die E-Mails und Schritte hinzu, die diese Kampagne senden wird.",
    setupSequenceCta: "Sequenz erstellen",
    setupProspectsLabel: "Prospects hinzufügen",
    setupProspectsDesc: "Verknüpfe eine Liste oder schreibe die zu kontaktierenden Prospects ein.",
    setupProspectsCta: "Prospects hinzufügen",
    setupDone: "Erledigt",
    thProspect: "Prospect",
    thTitleCompany: "Position / Unternehmen",
    thCurrentStep: "Aktueller Schritt",
    thStatus: "Status",
    thLastTouch: "Letzter Kontakt",
    unknownProspect: "Unbekannter Prospect",
    stepOf: (current: number, total: number) =>
      `Schritt ${current} von ${total}`,
    justAdded: "Gerade hinzugefügt",
    removeFromCampaignAction: "Aus Kampagne entfernen",
    removedFromCampaign: "Aus Kampagne entfernt",
    removedFromCampaignCount: (n: number) => `${n} aus der Kampagne entfernt`,
    exportedCsv: "Als CSV exportiert",
    capNote: (max: number) => `Es können jeweils nur ${max.toLocaleString()} angereichert werden.`,
    noProspects:
      "Noch keine Prospects oder Unternehmen — füge welche hinzu, um loszulegen.",
    noReplies: "Noch keine Antworten.",
    viewInInbox: "Im Posteingang ansehen",
    of: "von",
    prevPage: "Zurück",
    nextPage: "Weiter",
    editCampaign: "Kampagne bearbeiten",
    editCampaignDesc: "Aktualisiere den Namen und den Status der Kampagne.",
    name: "Name",
    namePlaceholder: "Kampagnenname",
    goal: "Ziel / Absicht",
    goalOptional: "Optional",
    goalPlaceholder:
      "Welches Ergebnis strebst du an? Demos buchen, kalte Leads reaktivieren, in ein neues Segment expandieren…",
    status: "Status",
    cancel: "Abbrechen",
    saveChanges: "Änderungen speichern",
    campaignUpdated: "Kampagne aktualisiert",
    enrichGateTitle: "E-Mails vor dem Start anreichern?",
    enrichGateBody: (n: number, credits: number) =>
      `${n} eingeschriebene Prospects haben noch keine verifizierte E-Mail. Jetzt anreichern verbraucht ~${credits} Credits und vermeidet "E-Mail nicht verfügbar"-Fehler, sobald die Kampagne live ist.`,
    enrichAndActivate: "Anreichern & aktivieren",
    activateAnyway: "Ohne Anreicherung aktivieren",
    enrichingToast: (n: number) =>
      `${n} E-Mails werden angereichert… du kannst weiterarbeiten, wir benachrichtigen dich.`,
    enrichedToast: (n: number) => `${n} E-Mails angereichert · Kampagne aktiviert`,
    enrichInsufficient: "Nicht genug Credits zum Anreichern",
    automations: "Automatisierungen",
    automationsDesc: "Lass Kai für dich auf Antworten reagieren.",
    alertInterested: "Benachrichtige mich, wenn eine Antwort als Interessiert markiert wird",
    alertInterestedDesc:
      "Erhalte eine Benachrichtigung, sobald Kai eine Antwort als Interessiert einstuft.",
    alsoEmail: "Mich auch per E-Mail benachrichtigen",
    alertsOnToast: "Interessiert-Benachrichtigungen aktiviert",
    interested: "Interessiert",
    alertSent: "Benachrichtigung gesendet",
  },
  pt: {
    channelLabel: {
      email: "E-mail",
      whatsapp: "WhatsApp",
      call: "Chamada telefónica",
      ai_call: "Chamada de voz IA",
      linkedin_message: "Mensagem do LinkedIn",
      linkedin_dm: "Mensagem direta do LinkedIn",
      linkedin_inmail: "InMail do LinkedIn",
      manual: "Tarefa manual",
    } as Record<StepChannel, string>,
    statusLabel: {
      active: "Ativa",
      paused: "Inativa",
      draft: "Rascunho",
      completed: "Terminada",
    } as Record<CampaignStatus, string>,
    enrollmentLabel: {
      replied: "Respondeu",
      active: "Ativo",
      completed: "Concluído",
      paused: "Em pausa",
      bounced: "Devolvido",
    } as Record<EnrollmentStatus, string>,
    campaignNotFound: "Campanha não encontrada.",
    backToCampaigns: "Voltar às campanhas",
    campaigns: "Campanhas",
    createdSteps: (date: string, steps: number) =>
      `Criada a ${date} · ${steps} passos`,
    pause: "Desativar",
    activate: "Ativar",
    activateDisabledReason: (missingSequence: boolean, missingProspects: boolean) => {
      if (missingSequence && missingProspects)
        return "Adicione uma sequência e prospects antes de ativar."
      if (missingSequence) return "Adicione uma sequência antes de ativar."
      return "Adicione prospects antes de ativar."
    },
    endCampaign: "Terminar campanha",
    endConfirmTitle: "Terminar esta campanha?",
    endConfirmBody:
      "Ao terminar, desprograma-se todas as sequências incompletas (mensagens ainda não enviadas). Não é possível retomar.",
    endConfirm: "Terminar campanha",
    ended: (name: string) => `${name} terminada`,
    account: "Conta",
    language: "Idioma",
    english: "English",
    spanish: "Español",
    sendingSettings: "Envio",
    sendingSettingsDesc:
      "Escolha a partir de que conta esta campanha envia e em que idioma.",
    locksAfterActivation: "Bloqueia após a ativação",
    senderSaved: "Definições de envio atualizadas",
    alreadyMessagedSkipped: "Os destinatários já contactados são ignorados",
    edit: "Editar",
    addProspects: "Adicionar prospects",
    columns: "Colunas",
    paused: (name: string) => `${name} em pausa`,
    activated: (name: string) => `${name} ativada`,
    scheduleStart: "Programar início…",
    tomorrowMorning: "Amanhã, 8:00",
    mondayMorning: "Segunda-feira, 8:00",
    scheduleTitle: "Programar o início da campanha",
    scheduleDesc: "Escolha quando esta campanha deve começar a enviar.",
    scheduleWhen: "Começar a enviar a",
    scheduleConfirm: "Programar início",
    startsAt: (d: string) => `Começa a ${d}`,
    startNow: "Iniciar agora",
    cancelSchedule: "Cancelar programação",
    scheduledToast: (d: string) => `Campanha programada para começar a ${d}`,
    scheduleCancelledToast: "Programação de início cancelada",
    enrolled: "Inscritos",
    openRate: "Taxa de abertura",
    replyRate: "Taxa de resposta",
    meetings: "Reuniões",
    tabOverview: "Visão geral",
    tabSequence: "Sequência",
    tabPreview: "Pré-visualização",
    tabProspects: "Prospects",
    tabConversations: "Conversas",
    tabSettings: "Definições",
    dailyPerformance: "Desempenho diário",
    dailyPerformanceDesc: "Enviados, abertos e respondidos por dia.",
    noDailyData: "Ainda não há dados diários para esta campanha.",
    audience: "Lista vinculada",
    audienceDesc:
      "Vincule uma única lista de prospects para alimentar esta campanha. A ligação é um-para-um; uma lista dinâmica inscreve automaticamente novos prospects correspondentes à medida que são encontrados.",
    prospectsCount: (count: number) => `${count} prospects`,
    companiesCount: (count: number) => `${count} empresas`,
    findContacts: "Encontrar prospects",
    dynamicSuffix: " · dinâmica",
    detached: (name: string) => `${name} desvinculada`,
    detach: "Desvincular",
    chooseList: "Escolha uma lista para vincular",
    createList: "Criar uma lista",
    listCreatedAttached: (name: string) => `«${name}» criada e vinculada`,
    linkedElsewhere: " (vinculada noutro sítio)",
    attached: (name: string) => `${name} vinculada`,
    listAttached: "Lista vinculada",
    attach: "Vincular",
    noListsToAttach: "Ainda não há listas disponíveis para vincular.",
    summary: "Resumo",
    statsInactiveNote:
      "As estatísticas de desempenho aparecem quando a campanha estiver ativa.",
    sent: "Enviados",
    opened: "Aberturas",
    replied: "Respostas",
    bounced: "Devolvidos",
    moveStepUp: "Mover passo para cima",
    moveStepDown: "Mover passo para baixo",
    removeStep: "Eliminar passo",
    closePanel: "Fechar painel",
    insertStepAria: "Inserir um passo aqui",
    stepChannelAria: (n: number) => `Canal do passo ${n}`,
    linkedinActionAria: (n: number) => `Ação do LinkedIn do passo ${n}`,
    linkedinActionLabel: {
      message: "Mensagem",
      connect: "Ligar",
      like_post: "Gostar da publicação",
      view_profile: "Ver perfil",
      voice_message: "Mensagem de voz",
    } as Record<LinkedInAction, string>,
    linkedinActionDescription: {
      message: "",
      connect: "Envia um pedido de ligação do LinkedIn — sem mensagem.",
      like_post: "Gosta da publicação mais recente do prospect.",
      view_profile: "Visita o perfil do LinkedIn do prospect.",
      voice_message: "Envia uma mensagem de voz gravada.",
    } as Record<LinkedInAction, string>,
    timeDelay: "Atraso de tempo",
    sendImmediately: "Enviar de imediato",
    delayByDays: "Atrasar por dias",
    daysBeforeSending: "dias antes do envio",
    clearDelay: "Repor envio imediato",
    actionNeeded: "Ação necessária",
    subjectLine: "Assunto",
    messageBody: "Corpo da mensagem",
    manualTaskBadge: "Manual",
    manualTaskAssignee: "Responsável",
    taskTitlePlaceholder: "Título da tarefa, p. ex. «Ligar para acompanhamento»",
    taskNotesPlaceholder: "Notas para o comercial (opcional)",
    taskStartTimeLabel: "Hora de início",
    taskReminderLabel: "Lembrete",
    manualTaskFooter: "Este passo cria uma tarefa para o comercial atribuído — não é enviado automaticamente.",
    aiVoiceLabel: "Voz",
    aiCallAgentLabel: "Agente / objetivo",
    aiCallRetryLabel: "Repetir chamadas sem resposta",
    aiCallRetryCadenceLabel: (delays: string) => `Atrasos: ${delays}`,
    aiCallRetryFootnote: "Apenas para resultados sem resposta. Chamadas atendidas/correio de voz mantêm o comportamento normal.",
    aiCallCadence: { rapid: "Rápido", relaxed: "Relaxado" },
    aiScriptPlaceholder: "Guião / instruções para o agente de IA",
    aiCallFooter: "Este passo faz uma chamada de voz com IA agencial usando o guião e a voz acima — não é enviada automaticamente.",
    insertVariable: "+ Variáveis",
    personalizedVariable: "Variável personalizada",
    personalizedVariablePlaceholder: "ex. um comentário simpático sobre a conquista recente deles",
    varsSearchPlaceholder: "Pesquisar variáveis…",
    varsEmpty: "Nenhuma variável corresponde à pesquisa.",
    varGroups: { yourDetails: "Os seus dados", prospectInfo: "Informações do prospect", prospectCompany: "Empresa do prospect", other: "Outros" } as Record<MergeVarGroupKey | "other", string>,
    variables: TEMPLATE_MERGE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
      acc[v.tag] = v.pt
      return acc
    }, {}),
    conditionName: {
      reply: "Respondeu",
      open: "Abriu",
      click: "Clicou numa ligação",
      accept: "Aceitou a ligação",
      read: "Leu a mensagem",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Bifurca em: ${name}`,
    removeCondition: "Remover condição",
    parallelStepNote: "É enviado ao mesmo tempo que o passo ao lado.",
    addParallelStepTitle: "Adicionar um passo paralelo",
    applyChanges: "Aplicar alterações",
    sequenceApplied: "Sequência atualizada",
    discardChanges: "Descartar alterações",
    copySequenceFrom: "Copiar sequência de…",
    saveAsTemplate: "Guardar como modelo",
    previewMessages: "Pré-visualizar mensagens",
    stepTemplates: "Modelos",
    stepAiPrompt: "Prompt de IA",
    suggestedNext: (label: string) => `Sugestão seguinte: ${label}`,
    sequenceCopied: (n: number) =>
      n === 1
        ? "1 passo copiado para a sequência"
        : `${n} passos copiados para a sequência`,
    groupEmail: "E-mail",
    groupMessaging: "Mensagens",
    groupLinkedin: "LinkedIn",
    groupAiPowered: "Com IA",
    groupOther: "Outro",
    setupTitle: "Termine de configurar esta campanha",
    setupDesc: "Uma campanha precisa de uma sequência e de prospects antes de poder ser executada.",
    setupSequenceLabel: "Crie a sua sequência",
    setupSequenceDesc: "Adicione os e-mails e passos que esta campanha vai enviar.",
    setupSequenceCta: "Criar sequência",
    setupProspectsLabel: "Adicione prospects",
    setupProspectsDesc: "Vincule uma lista ou inscreva os prospects a contactar.",
    setupProspectsCta: "Adicionar prospects",
    setupDone: "Concluído",
    thProspect: "Prospect",
    thTitleCompany: "Cargo / Empresa",
    thCurrentStep: "Passo atual",
    thStatus: "Estado",
    thLastTouch: "Último contacto",
    unknownProspect: "Prospect desconhecido",
    stepOf: (current: number, total: number) =>
      `Passo ${current} de ${total}`,
    justAdded: "Acabado de adicionar",
    removeFromCampaignAction: "Remover da campanha",
    removedFromCampaign: "Removido da campanha",
    removedFromCampaignCount: (n: number) => `${n} removidos da campanha`,
    exportedCsv: "Exportado para CSV",
    capNote: (max: number) => `Só é possível enriquecer ${max.toLocaleString()} de cada vez.`,
    noProspects:
      "Ainda não há prospects nem empresas — adicione alguns para começar.",
    noReplies: "Ainda não há respostas.",
    viewInInbox: "Ver na caixa de entrada",
    of: "de",
    prevPage: "Anterior",
    nextPage: "Seguinte",
    editCampaign: "Editar campanha",
    editCampaignDesc: "Atualize o nome e o estado da campanha.",
    name: "Nome",
    namePlaceholder: "Nome da campanha",
    goal: "Objetivo / intenção",
    goalOptional: "Opcional",
    goalPlaceholder:
      "Que resultado procura? Marcar demonstrações, reativar leads frios, entrar num novo segmento…",
    status: "Estado",
    cancel: "Cancelar",
    saveChanges: "Guardar alterações",
    campaignUpdated: "Campanha atualizada",
    enrichGateTitle: "Enriquecer e-mails antes de lançar?",
    enrichGateBody: (n: number, credits: number) =>
      `${n} prospects inscritos ainda não têm um e-mail verificado. Enriquecer agora usa ~${credits} créditos e evita erros de "e-mail indisponível" quando a campanha estiver em curso.`,
    enrichAndActivate: "Enriquecer e ativar",
    activateAnyway: "Ativar sem enriquecer",
    enrichingToast: (n: number) =>
      `A enriquecer ${n} e-mails… pode continuar a trabalhar, avisamo-lo quando terminar.`,
    enrichedToast: (n: number) => `${n} e-mails enriquecidos · campanha ativada`,
    enrichInsufficient: "Créditos insuficientes para enriquecer",
    automations: "Automatizações",
    automationsDesc: "Deixe que o Kai atue sobre as respostas por si.",
    alertInterested: "Avisar-me quando uma resposta for marcada como Interessado",
    alertInterestedDesc:
      "Receba uma notificação assim que o Kai classificar uma resposta como Interessado.",
    alsoEmail: "Avisar-me também por e-mail",
    alertsOnToast: "Alertas de Interessado ativados",
    interested: "Interessado",
    alertSent: "Alerta enviado",
  },
  pt_BR: {
    channelLabel: {
      email: "E-mail",
      whatsapp: "WhatsApp",
      call: "Ligação",
      ai_call: "Chamada de voz IA",
      linkedin_message: "Mensagem do LinkedIn",
      linkedin_dm: "Mensagem direta do LinkedIn",
      linkedin_inmail: "InMail do LinkedIn",
      manual: "Tarefa manual",
    } as Record<StepChannel, string>,
    statusLabel: {
      active: "Ativa",
      paused: "Inativa",
      draft: "Rascunho",
      completed: "Encerrada",
    } as Record<CampaignStatus, string>,
    enrollmentLabel: {
      replied: "Respondeu",
      active: "Ativo",
      completed: "Concluído",
      paused: "Em pausa",
      bounced: "Retornado",
    } as Record<EnrollmentStatus, string>,
    campaignNotFound: "Campanha não encontrada.",
    backToCampaigns: "Voltar para campanhas",
    campaigns: "Campanhas",
    createdSteps: (date: string, steps: number) =>
      `Criada em ${date} · ${steps} etapas`,
    pause: "Desativar",
    activate: "Ativar",
    activateDisabledReason: (missingSequence: boolean, missingProspects: boolean) => {
      if (missingSequence && missingProspects)
        return "Adicione uma sequência e prospects antes de ativar."
      if (missingSequence) return "Adicione uma sequência antes de ativar."
      return "Adicione prospects antes de ativar."
    },
    endCampaign: "Encerrar campanha",
    endConfirmTitle: "Encerrar esta campanha?",
    endConfirmBody:
      "Encerrar cancela o agendamento de todas as sequências incompletas (mensagens ainda não enviadas). Isso não pode ser retomado.",
    endConfirm: "Encerrar campanha",
    ended: (name: string) => `${name} encerrada`,
    account: "Conta",
    language: "Idioma",
    english: "English",
    spanish: "Español",
    sendingSettings: "Envio",
    sendingSettingsDesc:
      "Escolha de qual conta esta campanha envia e em qual idioma.",
    locksAfterActivation: "Trava após a ativação",
    senderSaved: "Configurações de envio atualizadas",
    alreadyMessagedSkipped: "Destinatários já contatados são ignorados",
    edit: "Editar",
    addProspects: "Adicionar prospects",
    columns: "Colunas",
    paused: (name: string) => `${name} pausada`,
    activated: (name: string) => `${name} ativada`,
    scheduleStart: "Agendar início…",
    tomorrowMorning: "Amanhã, 8h",
    mondayMorning: "Segunda-feira, 8h",
    scheduleTitle: "Agendar início da campanha",
    scheduleDesc: "Escolha quando esta campanha deve começar a enviar.",
    scheduleWhen: "Começar a enviar em",
    scheduleConfirm: "Agendar início",
    startsAt: (d: string) => `Começa em ${d}`,
    startNow: "Começar agora",
    cancelSchedule: "Cancelar agendamento",
    scheduledToast: (d: string) => `Campanha agendada para começar em ${d}`,
    scheduleCancelledToast: "Agendamento de início cancelado",
    enrolled: "Inscritos",
    openRate: "Taxa de abertura",
    replyRate: "Taxa de resposta",
    meetings: "Reuniões",
    tabOverview: "Visão geral",
    tabSequence: "Sequência",
    tabPreview: "Pré-visualização",
    tabProspects: "Prospects",
    tabConversations: "Conversas",
    tabSettings: "Configurações",
    dailyPerformance: "Desempenho diário",
    dailyPerformanceDesc: "Enviados, abertos e respondidos por dia.",
    noDailyData: "Ainda não há dados diários para esta campanha.",
    audience: "Lista vinculada",
    audienceDesc:
      "Vincule uma única lista de prospects para alimentar esta campanha. O vínculo é um-para-um; uma lista dinâmica inscreve automaticamente novos prospects correspondentes à medida que são encontrados.",
    prospectsCount: (count: number) => `${count} prospects`,
    companiesCount: (count: number) => `${count} empresas`,
    findContacts: "Encontrar prospects",
    dynamicSuffix: " · dinâmica",
    detached: (name: string) => `${name} desvinculada`,
    detach: "Desvincular",
    chooseList: "Escolha uma lista para vincular",
    createList: "Criar uma lista",
    listCreatedAttached: (name: string) => `"${name}" criada e vinculada`,
    linkedElsewhere: " (vinculada em outro lugar)",
    attached: (name: string) => `${name} vinculada`,
    listAttached: "Lista vinculada",
    attach: "Vincular",
    noListsToAttach: "Ainda não há listas disponíveis para vincular.",
    summary: "Resumo",
    statsInactiveNote:
      "As estatísticas de desempenho aparecem quando a campanha estiver ativa.",
    sent: "Enviados",
    opened: "Aberturas",
    replied: "Respostas",
    bounced: "Retornados",
    moveStepUp: "Mover etapa para cima",
    moveStepDown: "Mover etapa para baixo",
    removeStep: "Excluir etapa",
    closePanel: "Fechar painel",
    insertStepAria: "Inserir uma etapa aqui",
    stepChannelAria: (n: number) => `Canal da etapa ${n}`,
    linkedinActionAria: (n: number) => `Ação do LinkedIn da etapa ${n}`,
    linkedinActionLabel: {
      message: "Mensagem",
      connect: "Conectar",
      like_post: "Curtir publicação",
      view_profile: "Ver perfil",
      voice_message: "Mensagem de voz",
    } as Record<LinkedInAction, string>,
    linkedinActionDescription: {
      message: "",
      connect: "Envia uma solicitação de conexão do LinkedIn — sem mensagem.",
      like_post: "Curte a publicação mais recente do prospect.",
      view_profile: "Visita o perfil do LinkedIn do prospect.",
      voice_message: "Envia uma mensagem de voz gravada.",
    } as Record<LinkedInAction, string>,
    timeDelay: "Atraso de tempo",
    sendImmediately: "Enviar imediatamente",
    delayByDays: "Atrasar por dias",
    daysBeforeSending: "dias antes do envio",
    clearDelay: "Redefinir para envio imediato",
    actionNeeded: "Ação necessária",
    subjectLine: "Assunto",
    messageBody: "Corpo da mensagem",
    manualTaskBadge: "Manual",
    manualTaskAssignee: "Responsável",
    taskTitlePlaceholder: "Título da tarefa, por ex. «Ligar para fazer follow-up»",
    taskNotesPlaceholder: "Notas para o vendedor (opcional)",
    taskStartTimeLabel: "Horário de início",
    taskReminderLabel: "Lembrete",
    manualTaskFooter: "Esta etapa cria uma tarefa para o vendedor designado — ela não é enviada automaticamente.",
    aiVoiceLabel: "Voz",
    aiCallAgentLabel: "Agente / objetivo",
    aiCallRetryLabel: "Repetir ligações sem resposta",
    aiCallRetryCadenceLabel: (delays: string) => `Atrasos: ${delays}`,
    aiCallRetryFootnote: "Somente para resultados sem resposta. Ligações atendidas/caixa postal mantêm o comportamento normal.",
    aiCallCadence: { rapid: "Rápido", relaxed: "Relaxado" },
    aiScriptPlaceholder: "Roteiro / instruções para o agente de IA",
    aiCallFooter: "Esta etapa faz uma ligação de voz com IA agêntica usando o roteiro e a voz acima — ela não é enviada automaticamente.",
    insertVariable: "+ Variáveis",
    personalizedVariable: "Variável personalizada",
    personalizedVariablePlaceholder: "ex. um comentário simpático sobre a conquista recente deles",
    varsSearchPlaceholder: "Buscar variáveis…",
    varsEmpty: "Nenhuma variável corresponde à sua busca.",
    varGroups: { yourDetails: "Seus dados", prospectInfo: "Informações do prospect", prospectCompany: "Empresa do prospect", other: "Outros" } as Record<MergeVarGroupKey | "other", string>,
    variables: TEMPLATE_MERGE_VARIABLES.reduce<Record<string, string>>((acc, v) => {
      acc[v.tag] = v.pt_BR
      return acc
    }, {}),
    conditionName: {
      reply: "Respondeu",
      open: "Abriu",
      click: "Clicou em um link",
      accept: "Aceitou a conexão",
      read: "Leu a mensagem",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Bifurca em: ${name}`,
    removeCondition: "Remover condição",
    parallelStepNote: "É enviado ao mesmo tempo que a etapa ao lado.",
    addParallelStepTitle: "Adicionar uma etapa paralela",
    applyChanges: "Aplicar alterações",
    sequenceApplied: "Sequência atualizada",
    discardChanges: "Descartar alterações",
    copySequenceFrom: "Copiar sequência de…",
    saveAsTemplate: "Salvar como modelo",
    previewMessages: "Pré-visualizar mensagens",
    stepTemplates: "Modelos",
    stepAiPrompt: "Prompt de IA",
    suggestedNext: (label: string) => `Sugestão de próximo: ${label}`,
    sequenceCopied: (n: number) =>
      n === 1
        ? "1 etapa copiada para a sequência"
        : `${n} etapas copiadas para a sequência`,
    groupEmail: "E-mail",
    groupMessaging: "Mensagens",
    groupLinkedin: "LinkedIn",
    groupAiPowered: "Com IA",
    groupOther: "Outro",
    setupTitle: "Termine de configurar esta campanha",
    setupDesc: "Uma campanha precisa de uma sequência e prospects antes de poder rodar.",
    setupSequenceLabel: "Crie sua sequência",
    setupSequenceDesc: "Adicione os e-mails e etapas que esta campanha vai enviar.",
    setupSequenceCta: "Criar sequência",
    setupProspectsLabel: "Adicione prospects",
    setupProspectsDesc: "Vincule uma lista ou inscreva os prospects a contatar.",
    setupProspectsCta: "Adicionar prospects",
    setupDone: "Concluído",
    thProspect: "Prospect",
    thTitleCompany: "Cargo / Empresa",
    thCurrentStep: "Etapa atual",
    thStatus: "Status",
    thLastTouch: "Último contato",
    unknownProspect: "Prospect desconhecido",
    stepOf: (current: number, total: number) =>
      `Etapa ${current} de ${total}`,
    justAdded: "Recém-adicionado",
    removeFromCampaignAction: "Remover da campanha",
    removedFromCampaign: "Removido da campanha",
    removedFromCampaignCount: (n: number) => `${n} removidos da campanha`,
    exportedCsv: "Exportado para CSV",
    capNote: (max: number) => `Só é possível enriquecer ${max.toLocaleString()} por vez.`,
    noProspects:
      "Ainda não há prospects ou empresas — adicione alguns para começar.",
    noReplies: "Ainda não há respostas.",
    viewInInbox: "Ver na caixa de entrada",
    of: "de",
    prevPage: "Anterior",
    nextPage: "Próxima",
    editCampaign: "Editar campanha",
    editCampaignDesc: "Atualize o nome e o status da campanha.",
    name: "Nome",
    namePlaceholder: "Nome da campanha",
    goal: "Objetivo / intenção",
    goalOptional: "Opcional",
    goalPlaceholder:
      "Que resultado você busca? Agendar demos, reativar leads frios, entrar em um novo segmento…",
    status: "Status",
    cancel: "Cancelar",
    saveChanges: "Salvar alterações",
    campaignUpdated: "Campanha atualizada",
    enrichGateTitle: "Enriquecer e-mails antes de lançar?",
    enrichGateBody: (n: number, credits: number) =>
      `${n} prospects inscritos ainda não têm um e-mail verificado. Enriquecer agora usa ~${credits} créditos e evita erros de "e-mail não disponível" com a campanha em andamento.`,
    enrichAndActivate: "Enriquecer e ativar",
    activateAnyway: "Ativar sem enriquecer",
    enrichingToast: (n: number) =>
      `Enriquecendo ${n} e-mails… você pode continuar trabalhando, avisaremos você.`,
    enrichedToast: (n: number) => `${n} e-mails enriquecidos · campanha ativada`,
    enrichInsufficient: "Créditos insuficientes para enriquecer",
    automations: "Automações",
    automationsDesc: "Deixe o Kai agir sobre as respostas por você.",
    alertInterested: "Avise-me quando uma resposta for marcada como Interessado",
    alertInterestedDesc:
      "Receba uma notificação assim que o Kai classificar uma resposta como Interessado.",
    alsoEmail: "Avisar também por e-mail",
    alertsOnToast: "Alertas de Interessado ativados",
    interested: "Interessado",
    alertSent: "Alerta enviado",
  },
} as const

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
  active: "success",
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

const CONVERSATIONS_PAGE_SIZE = 50

const PROSPECT_COL_GROUPS: ColGroup[] = [
  {
    id: "prospect",
    label: {
      en: "Prospect",
      es: "Prospecto",
      it: "Prospect",
      fr: "Prospect",
      de: "Prospect",
      pt: "Prospect",
      pt_BR: "Prospect",
    },
  },
  {
    id: "progress",
    label: {
      en: "Progress",
      es: "Progreso",
      it: "Avanzamento",
      fr: "Progression",
      de: "Fortschritt",
      pt: "Progresso",
      pt_BR: "Progresso",
    },
  },
  ...PEOPLE_GROUPS,
]
const PROSPECT_COL_DEFAULT_IDS = [
  "p_title",
  "p_company",
  "currentStep",
  "status",
  "lastTouch",
]

// Reuses the same full prospect-detail field registry as the People page
// (Job title, Seniority, Department, … the full 44-column set) so a
// campaign's Prospects tab isn't limited to a hand-picked handful — pulled
// in via ColumnManager just like People/Lists already do. Prefixed with
// "p_" so ids never collide with this tab's own progress columns (e.g. its
// "status" means enrollment status, not the prospect's own status badge).
// The pinned "name" column is skipped — this tab already has its own
// pinned "prospect" column linking to the profile.
const PROSPECT_DETAIL_COLUMNS: ColumnDef<CampaignProspectRow>[] = PEOPLE_COLUMNS.filter(
  (col) => !col.pinned
).map((col) => ({
  id: `p_${col.id}`,
  label: col.label,
  group: col.group,
  align: col.align,
  minWidth: col.minWidth,
  render: (row, locale) =>
    row.prospect ? (
      col.render(row.prospect, locale)
    ) : (
      <span className="text-muted-foreground">—</span>
    ),
}))

const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "active",
  "paused",
  "completed",
]

const POSITIVE_REPLIES = [
  "This is timely — we're actively evaluating tools in this space. Can you share availability this week?",
  "Interesting, the timing is good. Happy to take a quick look — send over a calendar link.",
  "Thanks for reaching out. We've felt this pain. Let's set up 20 minutes.",
  "Good note. We're scaling the team right now so this is relevant. What does onboarding look like?",
]

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
  const linkableLists = lists.filter((l) => l.kind !== "company")
  const accounts = useAccounts()
  const campaign = campaigns.find((item) => item.id === id)

  const [editOpen, setEditOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [findContactsOpen, setFindContactsOpen] = React.useState(false)
  const [attachListId, setAttachListId] = React.useState("")
  const [tab, setTab] = React.useState("overview")
  const [enrichGateOpen, setEnrichGateOpen] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [scheduleValue, setScheduleValue] = React.useState("")
  const [endOpen, setEndOpen] = React.useState(false)
  const [alertInterested, setAlertInterested] = React.useState(true)
  const [alertEmail, setAlertEmail] = React.useState(false)
  const [selectedStepId, setSelectedStepId] = React.useState<string | undefined>(undefined)
  const [stepPickerOpen, setStepPickerOpen] = React.useState(false)
  const [pendingGhost, setPendingGhost] = React.useState<AddNodeData | null>(null)
  // Set instead of pendingGhost when the picker was opened from a step's
  // inline "Add parallel step" button rather than a canvas ghost.
  const [pendingParallelStep, setPendingParallelStep] =
    React.useState<CampaignStep | null>(null)
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false)
  const [promptPickerOpen, setPromptPickerOpen] = React.useState(false)
  // Same two pickers, but applying to the step being edited in the detail
  // panel rather than appending a new step to the sequence.
  const [stepTemplateOpen, setStepTemplateOpen] = React.useState(false)
  const [stepPromptOpen, setStepPromptOpen] = React.useState(false)
  const [copySeqOpen, setCopySeqOpen] = React.useState(false)
  const [saveSeqOpen, setSaveSeqOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  // Search box inside the step editor's variables popup — same
  // filter-as-you-type pattern as Inbox.tsx's composer, needed now that the
  // merge-var catalog is large enough that a plain list scrolls off-screen.
  const [stepVarSearch, setStepVarSearch] = React.useState("")
  // Free-text "personalized variable" — wraps whatever the author types in
  // {{ }} as a placeholder for themself to fill in later, same as the
  // extension's Add Variables modal. Not a real data field, so it's kept
  // separate from the fixed MERGE_VARIABLES catalog above.
  const [stepCustomVarText, setStepCustomVarText] = React.useState("")
  // Whichever of the step-detail panel's body fields is currently rendered
  // (RichTextEditor for email/LinkedIn/etc, a plain Textarea for the AI-call
  // script) — only one is ever mounted at a time, so a single pair of refs
  // covers "insert variable" for the selected step regardless of its type.
  const stepBodyRef = React.useRef<RichTextEditorHandle>(null)
  const aiScriptRef = React.useRef<HTMLTextAreaElement>(null)
  const { spend } = useCredits()

  // Prospects-tab table: shared DataTable + ColumnManager (like People/Lists).
  // Hooks must run before the not-found early return below.
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [conversationsPage, setConversationsPage] = React.useState(0)
  const prospectColPrefs = useColumnPrefs(
    "campaign-prospects",
    PROSPECT_COL_DEFAULT_IDS
  )
  const [bulkEnrichOpen, setBulkEnrichOpen] = React.useState(false)
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string>>(
    new Set()
  )
  const [prospectPage, setProspectPage] = React.useState(0)

  // Every edit in the Sequence tab is a local draft until Apply Changes —
  // nothing here writes to the real campaign. Everywhere else on this page
  // (header step count, guided setup, Prospects tab) keeps reading the
  // real, applied `campaign.steps` instead.
  const draft = useSequenceDraft(campaign?.id ?? "", campaign?.steps ?? [])
  React.useEffect(() => {
    registerUnsavedChangesBlocker({ isDirty: () => draft.dirty })
    return () => registerUnsavedChangesBlocker(null)
  }, [draft.dirty])

  // Visiting a campaign registers it as an open tab — same mental model as
  // the Lists tab bar (lib/list-tabs.ts).
  React.useEffect(() => {
    if (id) campaignTabsStore.open(id)
  }, [id])

  if (!campaign) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.campaignNotFound}</p>
        <BackLink to="/campaigns" label={c.backToCampaigns} variant="link" />
      </Page>
    )
  }

  const campaignId = campaign.id
  // Inserts at the caret of whichever body field is actually mounted for a
  // step type — the rich editor's own insertText for email/LinkedIn/etc, or
  // a manual selection-range splice for the AI-call script's plain textarea.
  function insertStepVariable(tag: string, step: CampaignStep, isAiCall: boolean) {
    const ins = `{{${tag}}}`
    if (isAiCall) {
      const start = aiScriptRef.current?.selectionStart ?? step.body.length
      const end = aiScriptRef.current?.selectionEnd ?? step.body.length
      const next = step.body.slice(0, start) + ins + step.body.slice(end)
      draft.updateStep(step.id, { body: next })
      requestAnimationFrame(() => {
        aiScriptRef.current?.focus()
        aiScriptRef.current?.setSelectionRange(start + ins.length, start + ins.length)
      })
    } else {
      stepBodyRef.current?.insertText(ins)
    }
  }
  // The real, applied campaign — used everywhere on this page EXCEPT the
  // Sequence tab, which reads/writes `draft.steps` instead (see the
  // useSequenceDraft call above the not-found guard).
  const steps = campaign.steps
  // undefined when the panel is dismissed (or nothing's been picked yet) —
  // searches tracks and parallel siblings too, since a selected step can
  // live in either.
  const selectedStep = selectedStepId
    ? findCampaignStep(draft.steps, selectedStepId)
    : undefined
  // The step-type modal's template/prompt/suggested-next shortcuts only
  // make sense when the ghost that opened it appends to the very end of
  // the top-level sequence — not a mid-sequence insert or track append,
  // both of which need a specific channel.
  const isTrailingAdd =
    pendingGhost != null &&
    (!pendingGhost.afterStepId ||
      pendingGhost.afterStepId === draft.steps[draft.steps.length - 1]?.id)
  // Conditions fork the sequence one level deep, so only offered when the
  // ghost inserts at the top level (not inside an existing track) and the
  // step it would anchor to isn't already forked or parallel-able.
  const conditionAnchorStep =
    pendingGhost && !pendingGhost.trackId && pendingGhost.afterStepId
      ? findCampaignStep(draft.steps, pendingGhost.afterStepId)
      : undefined
  const allowCondition = Boolean(
    conditionAnchorStep &&
      !conditionAnchorStep.fork &&
      !conditionAnchorStep.parallelSteps?.length
  )
  const enrolledIds = campaign.enrolledIds ?? []

  function insertStepFromTemplate(template: EmailTemplate) {
    const channel = normalizeChannel(template.channel)
    const created = draft.addStepFromTemplate({
      channel,
      subject: channel === "email" ? template.subject : undefined,
      body: template.body,
    })
    setSelectedStepId(created.id)
  }

  function insertStepFromPrompt(seed: PromptStepSeed) {
    const created = draft.addStepFromTemplate({
      channel: seed.channel,
      subject: seed.subject,
      body: seed.body,
    })
    setSelectedStepId(created.id)
  }

  // The template picker filters by the plain messaging Channel, so collapse
  // a step's finer-grained StepChannel (linkedin_message/_dm/_inmail…) down.
  function templateChannelOf(step: CampaignStep): Channel | undefined {
    const ch = normalizeChannel(step.channel)
    if (ch === "email" || ch === "whatsapp") return ch
    if (ch.startsWith("linkedin")) return "linkedin"
    return undefined
  }

  // Apply a picked template/prompt to the step open in the detail panel.
  // Deliberately keeps the step's channel — swapping content shouldn't
  // silently turn an email step into a LinkedIn one.
  function applyTemplateToStep(template: EmailTemplate) {
    if (!selectedStep) return
    draft.updateStep(selectedStep.id, {
      body: template.body,
      ...(normalizeChannel(selectedStep.channel) === "email"
        ? { subject: template.subject }
        : {}),
    })
  }

  function applyPromptToStep(seed: PromptStepSeed) {
    if (!selectedStep) return
    draft.updateStep(selectedStep.id, {
      body: seed.body,
      ...(normalizeChannel(selectedStep.channel) === "email" && seed.subject
        ? { subject: seed.subject }
        : {}),
    })
  }

  // Routes a channel picked in the step-type modal to whichever action
  // triggered it — a parallel add, a fork track, a top-level insert, or a
  // brand-new append. All draft-only until Apply Changes.
  function handleStepTypeSelect(channel: StepChannel) {
    if (pendingParallelStep) {
      draft.addParallelStep(pendingParallelStep.id, channel)
      setPendingParallelStep(null)
      setSelectedStepId(undefined)
      return
    }
    const ghost = pendingGhost
    if (!ghost) return
    if (ghost.trackId && ghost.forkStepId) {
      draft.addForkStep(ghost.forkStepId, ghost.trackId, channel)
    } else if (ghost.afterStepId) {
      const idx = draft.steps.findIndex((s) => s.id === ghost.afterStepId)
      draft.insertStep(idx + 1, channel)
    } else {
      draft.addStep(channel)
    }
    setSelectedStepId(undefined)
    setPendingGhost(null)
  }

  // A condition picked in the step-type modal always anchors to the step
  // preceding the ghost that opened it (see allowCondition above).
  function handleConditionSelect(condition: ConditionKind) {
    if (!pendingGhost?.afterStepId) return
    draft.addCondition(pendingGhost.afterStepId, condition)
    setPendingGhost(null)
  }

  // Appends a deep-cloned copy of another sequence's steps (fresh ids,
  // fork tracks and parallel siblings included) after the current ones.
  function copySequenceIn(source: CampaignStep[]) {
    const cloned = cloneSequenceSteps(source)
    draft.replaceSteps([...draft.steps, ...cloned])
    toast.success(c.sequenceCopied(flattenCampaignSteps(cloned).length))
    setSelectedStepId(cloned[0]?.id)
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
  const attachedCompanyNames =
    attachedList?.kind === "company"
      ? accounts
          .filter((a) => (attachedList.accountIds ?? []).includes(a.id))
          .map((a) => a.name)
      : []

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
  const hasPerformanceData =
    campaign.status === "active" || campaign.status === "completed"
  const setupComplete = hasSequence && hasFeed

  // Ids already enrolled (mock + manual) — excluded from the add dialog.

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

  // Real enrolled prospects, for previewing actual resolved message copy
  // (as opposed to the fixed sample recipients used elsewhere).
  const audienceProspects = prospectRows
    .map((r) => r.prospect)
    .filter((p): p is Prospect => Boolean(p))

  // Bulk selection spans the manually-added rows only; stale ids (already
  // removed) drop out at compute time. Paginated like every other
  // enrichment-capable table, but "select page"/"select all" only ever
  // touch the selectable (manual) rows within that scope — enrollment rows
  // never gain a checkbox. Plain (non-hook) pagination here, rather than
  // usePagedSelection, since prospectRows isn't computable until after this
  // component's not-found early return, and hooks can't follow it.
  const PROSPECTS_PER_PAGE = 50
  const prospectPageCount = Math.max(1, Math.ceil(prospectRows.length / PROSPECTS_PER_PAGE))
  const safeProspectPage = Math.min(prospectPage, prospectPageCount - 1)
  const prospectPageStart = safeProspectPage * PROSPECTS_PER_PAGE
  const prospectPageEnd = Math.min(prospectPageStart + PROSPECTS_PER_PAGE, prospectRows.length)
  const pagedProspectRows = prospectRows.slice(prospectPageStart, prospectPageEnd)

  const selectableRows = prospectRows.filter((r) => r.manual)
  const selectablePagedRows = pagedProspectRows.filter((r) => r.manual)
  const selectedRows = selectableRows.filter((r) => selectedRowIds.has(r.id))
  const allRowsSelected =
    selectablePagedRows.length > 0 &&
    selectablePagedRows.every((r) => selectedRowIds.has(r.id))
  const someRowsSelected =
    !allRowsSelected && selectablePagedRows.some((r) => selectedRowIds.has(r.id))
  const selectableCount = Math.min(selectableRows.length, MAX_ENRICH_BATCH)
  const overCap = selectedRowIds.size > MAX_ENRICH_BATCH
  function toggleProspectRow(id: string) {
    setSelectedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAllProspectRows() {
    setSelectedRowIds((prev) => {
      const next = new Set(prev)
      if (allRowsSelected) selectablePagedRows.forEach((r) => next.delete(r.id))
      else selectablePagedRows.forEach((r) => next.add(r.id))
      return next
    })
  }
  function selectAllRowsCapped() {
    setSelectedRowIds(new Set(selectableRows.slice(0, MAX_ENRICH_BATCH).map((r) => r.id)))
  }
  function removeSelectedProspects() {
    selectedRows.forEach((r) => campaignStore.removeProspect(campaignId, r.id))
    toast.success(c.removedFromCampaignCount(selectedRows.length))
    setSelectedRowIds(new Set())
  }
  function exportSelectedProspects() {
    downloadCsv(
      "campaign-prospects.csv",
      ["Name", "Title", "Company", "Step", "Status"],
      selectedRows.map((r) => [
        r.prospect ? `${r.prospect.firstName} ${r.prospect.lastName}` : r.id,
        r.prospect?.title ?? "",
        r.prospect?.company ?? "",
        String(r.currentStep),
        r.status,
      ])
    )
    toast.success(c.exportedCsv)
    setSelectedRowIds(new Set())
  }
  const selectedProspects = selectedRows.flatMap((r) => r.prospect ?? [])
  const prospectColumns: ColumnDef<CampaignProspectRow>[] = [
    {
      id: "prospect",
      label: {
        en: "Prospect",
        es: "Prospecto",
        it: "Prospect",
        fr: "Prospect",
        de: "Prospect",
        pt: "Prospect",
        pt_BR: "Prospect",
      },
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
      id: "currentStep",
      label: {
        en: "Current step",
        es: "Paso actual",
        it: "Passaggio attuale",
        fr: "Étape actuelle",
        de: "Aktueller Schritt",
        pt: "Passo atual",
        pt_BR: "Etapa atual",
      },
      group: "progress",
      render: (row) => (
        <span className="text-sm tabular-nums">
          {c.stepOf(row.currentStep, steps.length)}
        </span>
      ),
    },
    {
      id: "status",
      label: {
        en: "Status",
        es: "Estado",
        it: "Stato",
        fr: "Statut",
        de: "Status",
        pt: "Estado",
        pt_BR: "Status",
      },
      group: "progress",
      render: (row) => (
        <Badge variant={ENROLLMENT_VARIANT[row.status]}>
          {c.enrollmentLabel[row.status]}
        </Badge>
      ),
    },
    {
      id: "lastTouch",
      label: {
        en: "Last touch",
        es: "Último contacto",
        it: "Ultimo contatto",
        fr: "Dernier contact",
        de: "Letzter Kontakt",
        pt: "Último contacto",
        pt_BR: "Último contato",
      },
      group: "progress",
      render: (row) => (
        <span className="text-muted-foreground text-sm">
          {row.lastTouchLabel}
        </span>
      ),
    },
    ...PROSPECT_DETAIL_COLUMNS,
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

  // Sending, Linked List, and Automations — canonically the Settings tab,
  // but also surfaced in Overview while the campaign has no performance
  // data yet (not yet active/completed), so a brand-new campaign doesn't
  // hide its own setup behind an extra tab click.
  const campaignSettingsSection = (
    <>
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
                    {attachedList.kind === "company"
                      ? c.companiesCount((attachedList.accountIds ?? []).length)
                      : c.prospectsCount(attachedList.prospectIds.length)}
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
          ) : linkableLists.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <SearchCombobox
                value={attachListId}
                onChange={setAttachListId}
                options={linkableLists.map((l) => ({
                  value: l.id,
                  label: l.name,
                  sublabel:
                    l.campaignId && l.campaignId !== campaign.id
                      ? c.linkedElsewhere
                      : undefined,
                }))}
                placeholder={c.chooseList}
                searchPlaceholder={c.chooseList}
                emptyText={c.noListsToAttach}
                className="w-[240px]"
              />
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
    </>
  )

  return (
    <Page>
      <BackLink to="/campaigns" label={c.campaigns} />

      <CampaignTabBar currentId={campaign.id} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
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
          ) : setupComplete ? (
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
          ) : (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-flex">
                    <div className="flex items-center">
                      <Button variant="volt" className="rounded-r-none" disabled>
                        <Play className="size-4" />
                        {c.activate}
                      </Button>
                      <Button
                        variant="volt"
                        className="rounded-l-none border-l border-white/25 px-2"
                        aria-label={c.scheduleStart}
                        disabled
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                    </div>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {c.activateDisabledReason(!hasSequence, !hasFeed)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          {campaign.status === "active" && (
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

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">{c.tabOverview}</TabsTrigger>
          <TabsTrigger value="sequence">{c.tabSequence}</TabsTrigger>
          <TabsTrigger value="preview">{c.tabPreview}</TabsTrigger>
          <TabsTrigger value="prospects">{c.tabProspects}</TabsTrigger>
          <TabsTrigger value="conversations">{c.tabConversations}</TabsTrigger>
          <TabsTrigger value="settings">{c.tabSettings}</TabsTrigger>
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

          {/* Merged at-a-glance stats — enrollment/funnel KPIs and the daily
              sent/opened/replied/bounced totals used to live in two separate
              places (a strip above the tabs, and a "Summary" card down here);
              now it's one section. */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.summary}</CardTitle>
            </CardHeader>
            <CardContent>
              {hasPerformanceData ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-lg font-semibold tabular-nums">
                      {campaign.enrolled}
                    </p>
                    <p className="text-muted-foreground text-xs">{c.enrolled}</p>
                  </div>
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
                      {openRate}%
                    </p>
                    <p className="text-muted-foreground text-xs">{c.openRate}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums">
                      {totals.replied}
                    </p>
                    <p className="text-muted-foreground text-xs">{c.replied}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums">
                      {replyRate}%
                    </p>
                    <p className="text-muted-foreground text-xs">{c.replyRate}</p>
                  </div>
                  <div>
                    <p className="text-destructive text-lg font-semibold tabular-nums">
                      {totals.bounced}
                    </p>
                    <p className="text-muted-foreground text-xs">{c.bounced}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums">
                      {campaign.meetings}
                    </p>
                    <p className="text-muted-foreground text-xs">{c.meetings}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {c.statsInactiveNote}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.dailyPerformance}</CardTitle>
              <CardDescription>{c.dailyPerformanceDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasPerformanceData ? (
                <p className="text-muted-foreground text-sm">
                  {c.statsInactiveNote}
                </p>
              ) : daily.length > 0 ? (
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

          {!hasPerformanceData && campaignSettingsSection}
        </TabsContent>

        {/* Sequence */}
        <TabsContent value="sequence" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AutomationStatusBox
              autoPauseOnReply={camp.autoPauseOnReply ?? true}
              onToggle={(next) =>
                campaignStore.update(camp.id, { autoPauseOnReply: next })
              }
            />
            <SequenceCostSummary steps={draft.steps} />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="size-4" />
              {c.previewMessages}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCopySeqOpen(true)}
            >
              <Copy className="size-4" />
              {c.copySequenceFrom}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveSeqOpen(true)}
            >
              <Bookmark className="size-4" />
              {c.saveAsTemplate}
            </Button>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1 space-y-3">
              <SequenceCanvas
                steps={draft.steps}
                mode="interactive"
                selectedStepId={selectedStepId}
                onSelectStep={setSelectedStepId}
                onAddRequest={(ghost) => {
                  setPendingGhost(ghost)
                  setPendingParallelStep(null)
                  setStepPickerOpen(true)
                }}
                onAddParallel={(step) => {
                  setPendingParallelStep(step)
                  setPendingGhost(null)
                  setStepPickerOpen(true)
                }}
                onMoveStep={(id, target) => draft.moveStepToTarget(id, target)}
              />
            </div>

            {/* Detail panel — the selected step's full editor. Dismissible
                so the diagram can take the full width; clicking a step
                card reopens it via onSelectStep above. */}
            {selectedStep && (() => {
              const step = selectedStep
              // Position within whichever list the step actually lives in
              // (top-level, a condition track, or a step's parallel
              // siblings) — what "move up/down" and "is first/last"
              // need. A separate flattened index (which walks tracks and
              // parallel siblings inline) drives the cosmetic stats
              // below so they still degrade sensibly for nested steps.
              const { list: stepList, index: i } = locateCampaignStep(
                draft.steps,
                step.id
              )
              const isParallelStep = draft.steps.some((s) =>
                s.parallelSteps?.some((p) => p.id === step.id)
              )
              const flatIndex = flattenCampaignSteps(draft.steps).findIndex(
                (s) => s.id === step.id
              )
              const meta = channelMeta(step.channel)
              const isEmail = normalizeChannel(step.channel) === "email"
              const isAiCall = normalizeChannel(step.channel) === "ai_call"
              const isLinkedIn = ["linkedin_message", "linkedin_dm", "linkedin_inmail"].includes(
                normalizeChannel(step.channel)
              )
              const isWhatsApp = normalizeChannel(step.channel) === "whatsapp"
              const linkedinAction = step.linkedinAction ?? "message"
              const whatsappAction = step.whatsappAction ?? "message"
              const isVoiceMessage =
                (isLinkedIn && linkedinAction === "voice_message") ||
                (isWhatsApp && whatsappAction === "voice_message")
              // Connect/Like Post/View Profile carry no message content —
              // only "message" (the default) shows the subject/body editor.
              // Voice Message gets its own recorder UI, handled separately.
              const isLinkedInActionOnly =
                isLinkedIn && linkedinAction !== "message" && linkedinAction !== "voice_message"
              // Shared between the AI-call script's plain textarea (as a
              // standalone control) and the RichTextEditor's toolbarEnd —
              // same menu, same handler, different mount point. A search
              // box + capped scroll height keep this usable once the
              // merge-var catalog grows well past what fits on screen —
              // same fix already shipped on Inbox.tsx's composer.
              const stepVarQuery = stepVarSearch.trim().toLowerCase()
              const filteredStepVars = stepVarQuery
                ? TEMPLATE_MERGE_VARIABLES.filter(
                    (v) =>
                      c.variables[v.tag].toLowerCase().includes(stepVarQuery) ||
                      v.tag.toLowerCase().includes(stepVarQuery)
                  )
                : TEMPLATE_MERGE_VARIABLES
              const stepVarGroups = groupByMergeVarGroup(filteredStepVars, TEMPLATE_MERGE_VARIABLE_GROUPS)
              // A free-text placeholder (wrapped in {{ }} verbatim, not a
              // real data field) for the author to fill in by hand later —
              // matches the extension's "Personalized Variable" field.
              function insertCustomStepVar() {
                const text = stepCustomVarText.trim()
                if (!text) return
                // Same false positive as the onClick below — only reads the
                // ref from this handler, invoked via click/Enter, never render.
                // eslint-disable-next-line react-hooks/refs
                insertStepVariable(text, step, isAiCall)
                setStepCustomVarText("")
              }
              const variablesMenu = (
                <DropdownMenu
                  onOpenChange={(open) => {
                    if (!open) {
                      setStepVarSearch("")
                      setStepCustomVarText("")
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Braces className="size-4" />
                      {c.insertVariable}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>{c.insertVariable}</DropdownMenuLabel>
                    <div className="px-2 pb-1.5" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={stepVarSearch}
                        onChange={(e) => setStepVarSearch(e.target.value)}
                        placeholder={c.varsSearchPlaceholder}
                        className="h-8"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {stepVarGroups.map((group) => (
                        <div key={group.key}>
                          <DropdownMenuLabel className="text-muted-foreground text-[11px] font-semibold uppercase">
                            {c.varGroups[group.key]}
                          </DropdownMenuLabel>
                          {group.items.map((v) => (
                            <DropdownMenuItem
                              key={v.tag}
                              onClick={() => insertStepVariable(v.tag, step, isAiCall)}
                            >
                              <Braces className="text-primary size-3.5 shrink-0" />
                              <span className="min-w-0 flex-1 truncate">{c.variables[v.tag]}</span>
                              <span className="text-muted-foreground max-w-24 shrink-0 truncate font-mono text-[11px]">
                                {`{{${v.tag}}}`}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ))}
                      {filteredStepVars.length === 0 && (
                        <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                          {c.varsEmpty}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-muted-foreground text-[11px] font-semibold uppercase">
                      {c.personalizedVariable}
                    </DropdownMenuLabel>
                    <div
                      className="flex items-center gap-1.5 px-2 pt-0.5 pb-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={stepCustomVarText}
                        onChange={(e) => setStepCustomVarText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") insertCustomStepVar()
                        }}
                        placeholder={c.personalizedVariablePlaceholder}
                        className="h-8"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 shrink-0 px-2"
                        disabled={!stepCustomVarText.trim()}
                        onClick={insertCustomStepVar}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
              const sent = Math.max(
                0,
                campaign.enrolled -
                  flatIndex * Math.round(campaign.enrolled * 0.12)
              )
              const opened = Math.round(sent * 0.62)
              const replied = Math.round(opened * 0.24)
              return (
                <Card className="w-full lg:w-[30rem] lg:shrink-0">
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
                          draft.updateStep(step.id, {
                            channel: v as StepChannel,
                            isManualTask: v === "manual",
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
                      {isLinkedIn && (
                        <Select
                          value={step.linkedinAction ?? "message"}
                          onValueChange={(v) =>
                            draft.updateStep(step.id, {
                              linkedinAction: v as LinkedInAction,
                            })
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-[150px]"
                            aria-label={c.linkedinActionAria(i + 1)}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LINKEDIN_ACTIONS.map((action) => {
                              const ActionIcon = LINKEDIN_ACTION_ICON[action]
                              return (
                                <SelectItem key={action} value={action}>
                                  <span className="flex items-center gap-2">
                                    <ActionIcon className="size-3.5" />
                                    {c.linkedinActionLabel[action]}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      )}
                      {isWhatsApp && (
                        <Select
                          value={step.whatsappAction ?? "message"}
                          onValueChange={(v) =>
                            draft.updateStep(step.id, {
                              whatsappAction: v as WhatsAppAction,
                            })
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-[150px]"
                            aria-label={c.linkedinActionAria(i + 1)}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WHATSAPP_ACTIONS.map((action) => {
                              const ActionIcon = LINKEDIN_ACTION_ICON[action]
                              return (
                                <SelectItem key={action} value={action}>
                                  <span className="flex items-center gap-2">
                                    <ActionIcon className="size-3.5" />
                                    {c.linkedinActionLabel[action]}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={c.moveStepUp}
                          disabled={i === 0}
                          onClick={() => draft.moveStep(step.id, -1)}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={c.moveStepDown}
                          disabled={i === stepList.length - 1}
                          onClick={() => draft.moveStep(step.id, 1)}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={c.removeStep}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            draft.removeStep(step.id)
                            setSelectedStepId(undefined)
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={c.closePanel}
                          className="ml-1"
                          onClick={() => setSelectedStepId(undefined)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {isParallelStep ? (
                      <p className="text-muted-foreground text-sm">
                        {c.parallelStepNote}
                      </p>
                    ) : (
                      <TimeDelayField
                        key={step.id}
                        step={step}
                        onChange={(patch) => draft.updateStep(step.id, patch)}
                      />
                    )}

                    {step.isManualTask && (
                      <div className="bg-muted/40 flex items-center gap-2.5 rounded-lg border p-2.5">
                        <span className="text-muted-foreground min-w-0 flex-1 text-sm">
                          {c.manualTaskAssignee}
                        </span>
                        <AssigneePicker
                          className="w-56"
                          value={step.assigneeId}
                          onChange={(assigneeId) =>
                            draft.updateStep(step.id, {
                              assigneeId,
                            })
                          }
                        />
                      </div>
                    )}

                    {step.fork && (
                      <div className="bg-muted/40 flex items-center gap-2.5 rounded-lg border p-2.5">
                        <GitFork className="text-muted-foreground size-4 shrink-0" />
                        <p className="text-muted-foreground min-w-0 flex-1 text-sm">
                          {c.conditionActiveLabel(c.conditionName[step.fork.condition])}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => draft.removeFork(step.id)}
                        >
                          {c.removeCondition}
                        </Button>
                      </div>
                    )}

                    {isVoiceMessage ? (
                      <VoiceMessageRecorder
                        recordingUrl={step.voiceRecordingUrl}
                        durationSec={step.voiceDurationSec}
                        onRecorded={(url, durationSec) =>
                          draft.updateStep(step.id, {
                            voiceRecordingUrl: url,
                            voiceDurationSec: durationSec,
                          })
                        }
                        onDelete={() =>
                          draft.updateStep(step.id, {
                            voiceRecordingUrl: undefined,
                            voiceDurationSec: undefined,
                          })
                        }
                      />
                    ) : isLinkedInActionOnly ? (
                      <p className="text-muted-foreground text-sm">
                        {c.linkedinActionDescription[linkedinAction]}
                      </p>
                    ) : step.isManualTask ? (
                      <>
                        <Input
                          value={step.subject ?? ""}
                          placeholder={c.taskTitlePlaceholder}
                          onChange={(e) =>
                            draft.updateStep(step.id, {
                              subject: e.target.value,
                            })
                          }
                        />
                        <Textarea
                          value={step.body}
                          placeholder={c.taskNotesPlaceholder}
                          onChange={(e) =>
                            draft.updateStep(step.id, {
                              body: e.target.value,
                            })
                          }
                          className="min-h-20"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">{c.taskStartTimeLabel}</Label>
                            <Select
                              value={String(step.taskStartTime ?? TASK_START_TIME_OPTIONS[0].value)}
                              onValueChange={(v) =>
                                draft.updateStep(step.id, {
                                  taskStartTime: Number(v),
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TASK_START_TIME_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">{c.taskReminderLabel}</Label>
                            <Select
                              value={String(step.taskReminderMinutes ?? TASK_REMINDER_OPTIONS[0].value)}
                              onValueChange={(v) =>
                                draft.updateStep(step.id, {
                                  taskReminderMinutes: Number(v),
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TASK_REMINDER_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    ) : isAiCall ? (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{c.aiVoiceLabel}</Label>
                          <Select
                            value={step.aiVoice ?? AI_VOICES[0]}
                            onValueChange={(aiVoice) =>
                              draft.updateStep(step.id, {
                                aiVoice,
                              })
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AI_VOICES.map((voice) => (
                                <SelectItem key={voice} value={voice}>
                                  {voice}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{c.aiCallAgentLabel}</Label>
                          <Select
                            value={step.aiCallAgentId ?? AI_CALL_AGENTS[0].id}
                            onValueChange={(aiCallAgentId) =>
                              draft.updateStep(step.id, {
                                aiCallAgentId,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AI_CALL_AGENTS.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end">{variablesMenu}</div>
                        <Textarea
                          ref={aiScriptRef}
                          value={step.body}
                          placeholder={c.aiScriptPlaceholder}
                          onChange={(e) =>
                            draft.updateStep(step.id, {
                              body: e.target.value,
                            })
                          }
                          className="min-h-64"
                        />
                        <Separator />
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={step.aiCallRetryEnabled ?? false}
                            onCheckedChange={(checked) =>
                              draft.updateStep(step.id, {
                                aiCallRetryEnabled: checked === true,
                                aiCallRetryCadence:
                                  checked === true
                                    ? (step.aiCallRetryCadence ?? "rapid")
                                    : step.aiCallRetryCadence,
                              })
                            }
                          />
                          {c.aiCallRetryLabel}
                        </label>
                        {step.aiCallRetryEnabled && (
                          <div className="space-y-1.5">
                            <div className="flex gap-2">
                              {(["rapid", "relaxed"] as const).map((cadence) => (
                                <Button
                                  key={cadence}
                                  type="button"
                                  size="sm"
                                  variant={
                                    (step.aiCallRetryCadence ?? "rapid") === cadence
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    draft.updateStep(step.id, {
                                      aiCallRetryCadence: cadence,
                                    })
                                  }
                                >
                                  {c.aiCallCadence[cadence]}
                                </Button>
                              ))}
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {c.aiCallRetryCadenceLabel(
                                AI_CALL_RETRY_DELAYS_MINUTES[
                                  step.aiCallRetryCadence ?? "rapid"
                                ]
                                  .map((m) =>
                                    m < 60
                                      ? `${m}m`
                                      : m < 1440
                                        ? `${Math.round(m / 60)}h`
                                        : `${Math.round(m / 1440)}d`
                                  )
                                  .join(", ")
                              )}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {c.aiCallRetryFootnote}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {isEmail && (
                          <Input
                            value={step.subject ?? ""}
                            placeholder={c.subjectLine}
                            onChange={(e) =>
                              draft.updateStep(step.id, {
                                subject: e.target.value,
                              })
                            }
                          />
                        )}

                        <RichTextEditor
                          ref={stepBodyRef}
                          value={plainToHtml(step.body)}
                          placeholder={c.messageBody}
                          ariaLabel={c.messageBody}
                          onChange={(html) =>
                            draft.updateStep(step.id, {
                              body: html,
                            })
                          }
                          minHeight="min-h-64"
                          toolbarEnd={
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => setStepTemplateOpen(true)}
                              >
                                <FileText className="size-4" />
                                {c.stepTemplates}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => setStepPromptOpen(true)}
                              >
                                <Sparkles className="size-4" />
                                {c.stepAiPrompt}
                              </Button>
                              {variablesMenu}
                            </>
                          }
                        />
                      </>
                    )}

                    <Separator />

                    {step.isManualTask ? (
                      <p className="text-muted-foreground text-xs">
                        {c.manualTaskFooter}
                      </p>
                    ) : isAiCall ? (
                      <p className="text-muted-foreground text-xs">
                        {c.aiCallFooter}
                      </p>
                    ) : (
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
                    )}
                  </CardContent>
                </Card>
              )
            })()}
          </div>

          <div className="flex justify-end gap-2">
            {draft.dirty && (
              <Button variant="ghost" onClick={draft.discard}>
                {c.discardChanges}
              </Button>
            )}
            <Button
              disabled={!draft.dirty}
              onClick={() => {
                draft.apply()
                toast.success(c.sequenceApplied)
              }}
            >
              {c.applyChanges}
            </Button>
          </div>
        </TabsContent>

        {/* Preview — every step's actual text, personalized per lead. */}
        <TabsContent value="preview" className="mt-4">
          <SequencePreviewPane
            steps={steps}
            leads={prospectRows}
            onEditStep={(stepId) => {
              setTab("sequence")
              setSelectedStepId(stepId)
            }}
            onGoToSequence={() => setTab("sequence")}
            onGoToProspects={() => setTab("prospects")}
          />
        </TabsContent>

        {/* Prospects */}
        <TabsContent value="prospects" className="mt-4 space-y-3">
          {attachedList?.kind === "company" && (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <Building2 className="text-muted-foreground size-5 shrink-0" />
                  <div>
                    <Link
                      to={`/lists/${attachedList.id}`}
                      className="font-medium hover:underline"
                    >
                      {attachedList.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {c.companiesCount((attachedList.accountIds ?? []).length)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFindContactsOpen(true)}
                >
                  <UserSearch className="size-4" />
                  {c.findContacts}
                </Button>
              </CardContent>
            </Card>
          )}
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
              <SelectionControls
                allSelected={allRowsSelected}
                onTogglePage={toggleAllProspectRows}
                selectedCount={selectedRowIds.size}
                selectableCount={selectableCount}
                onSelectAllCapped={selectAllRowsCapped}
                pageStart={prospectPageStart}
                pageEnd={prospectPageEnd}
                total={prospectRows.length}
                page={safeProspectPage}
                pageCount={prospectPageCount}
                onPrevPage={() => setProspectPage(Math.max(0, safeProspectPage - 1))}
                onNextPage={() =>
                  setProspectPage(Math.min(prospectPageCount - 1, safeProspectPage + 1))
                }
              />

              <DataTable
                columns={prospectColumns}
                visible={prospectColPrefs.visible}
                rows={pagedProspectRows}
                rowKey={(r) => r.id}
                locale={locale}
                selection={{
                  isSelected: (r) => selectedRowIds.has(r.id),
                  toggle: (r) => toggleProspectRow(r.id),
                  toggleAll: toggleAllProspectRows,
                  allSelected: allRowsSelected,
                  someSelected: someRowsSelected,
                  isSelectable: (r) => r.manual,
                }}
                actions={(row) =>
                  row.prospect ? (
                    <RecordActionsMenu
                      kind="person"
                      record={row.prospect}
                      extra={
                        row.manual
                          ? {
                              label: c.removeFromCampaignAction,
                              icon: <X className="size-4" />,
                              destructive: true,
                              onClick: () => {
                                campaignStore.removeProspect(
                                  campaign.id,
                                  row.id
                                )
                                toast.success(c.removedFromCampaign)
                              },
                            }
                          : undefined
                      }
                    />
                  ) : null
                }
              />

              <BulkActionsBar
                count={selectedRows.length}
                capNote={overCap ? c.capNote(MAX_ENRICH_BATCH) : undefined}
                onClear={() => setSelectedRowIds(new Set())}
                onExport={exportSelectedProspects}
                onEnrich={() => setBulkEnrichOpen(true)}
                extra={{
                  label: c.removeFromCampaignAction,
                  icon: <X className="size-4" />,
                  destructive: true,
                  onClick: removeSelectedProspects,
                }}
              />

              <EnrichListDialog
                open={bulkEnrichOpen}
                onOpenChange={setBulkEnrichOpen}
                prospects={selectedProspects}
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

        {/* Conversations — a plain table (not cards) so it stays usable and
            paginates cleanly at enterprise scale (1000+ replies). */}
        <TabsContent value="conversations" className="mt-4 space-y-3">
          {replies.length > 0 ? (
            (() => {
              const rows = replies.map((e, i) => ({
                id: e.prospectId,
                prospect: getProspect(e.prospectId),
                reply: POSITIVE_REPLIES[i % POSITIVE_REPLIES.length],
                lastTouch: e.lastTouch,
              }))
              const conversationColumns: ColumnDef<(typeof rows)[number]>[] = [
                {
                  id: "prospect",
                  label: {
                    en: "Prospect",
                    es: "Prospecto",
                    it: "Prospect",
                    fr: "Prospect",
                    de: "Prospect",
                    pt: "Prospect",
                    pt_BR: "Prospect",
                  },
                  group: "conversation",
                  pinned: true,
                  render: (row) =>
                    row.prospect ? (
                      <div className="flex items-center gap-2.5">
                        <ProspectAvatar prospect={row.prospect} />
                        <span className="truncate font-medium">
                          {row.prospect.firstName} {row.prospect.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{c.unknownProspect}</span>
                    ),
                },
                {
                  id: "status",
                  label: {
                    en: "Status",
                    es: "Estado",
                    it: "Stato",
                    fr: "Statut",
                    de: "Status",
                    pt: "Estado",
                    pt_BR: "Status",
                  },
                  group: "conversation",
                  render: () => (
                    <div className="flex flex-wrap items-center gap-2">
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
                  ),
                },
                {
                  id: "reply",
                  label: {
                    en: "Last message",
                    es: "Último mensaje",
                    it: "Ultimo messaggio",
                    fr: "Dernier message",
                    de: "Letzte Nachricht",
                    pt: "Última mensagem",
                    pt_BR: "Última mensagem",
                  },
                  group: "conversation",
                  minWidth: "280px",
                  render: (row) => (
                    <span className="text-muted-foreground line-clamp-1 text-sm">
                      {row.reply}
                    </span>
                  ),
                },
                {
                  id: "lastTouch",
                  label: {
                    en: "Time",
                    es: "Hora",
                    it: "Ora",
                    fr: "Heure",
                    de: "Zeit",
                    pt: "Hora",
                    pt_BR: "Hora",
                  },
                  group: "conversation",
                  render: (row) => (
                    <span className="text-muted-foreground text-sm">
                      {relativeTime(row.lastTouch)}
                    </span>
                  ),
                },
              ]
              const pageCount = Math.max(
                1,
                Math.ceil(rows.length / CONVERSATIONS_PAGE_SIZE)
              )
              const safePage = Math.min(conversationsPage, pageCount - 1)
              const pageStart = safePage * CONVERSATIONS_PAGE_SIZE
              const pageRows = rows.slice(
                pageStart,
                pageStart + CONVERSATIONS_PAGE_SIZE
              )
              return (
                <>
                  <DataTable
                    columns={conversationColumns}
                    visible={["status", "reply", "lastTouch"]}
                    rows={pageRows}
                    rowKey={(row) => row.id}
                    locale={locale}
                    actions={() => (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={c.viewInInbox}
                            asChild
                          >
                            <Link to="/inbox">
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{c.viewInInbox}</TooltipContent>
                      </Tooltip>
                    )}
                  />
                  {rows.length > CONVERSATIONS_PAGE_SIZE && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {pageStart + 1}–{Math.min(pageStart + CONVERSATIONS_PAGE_SIZE, rows.length)} {c.of} {rows.length}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage === 0}
                          onClick={() => setConversationsPage((p) => p - 1)}
                        >
                          {c.prevPage}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage >= pageCount - 1}
                          onClick={() => setConversationsPage((p) => p + 1)}
                        >
                          {c.nextPage}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )
            })()
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-sm">{c.noReplies}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings — Sending, Linked List, Automations. Also surfaced in
            Overview until the campaign has performance data (see above). */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          {campaignSettingsSection}
        </TabsContent>
      </Tabs>

      <EditCampaignDialog
        key={campaign.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        campaignId={campaign.id}
        currentName={campaign.name}
        currentStatus={campaign.status}
        currentGoal={campaign.goal}
      />

      <AddCampaignAudienceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        campaign={campaign}
      />

      {attachedList?.kind === "company" && (
        <AddRecordsDialog
          open={findContactsOpen}
          onOpenChange={setFindContactsOpen}
          kind="contact"
          scopeCompanies={attachedCompanyNames}
        />
      )}

      <StepTypePickerDialog
        open={stepPickerOpen}
        onOpenChange={setStepPickerOpen}
        onSelect={handleStepTypeSelect}
        title={pendingParallelStep ? c.addParallelStepTitle : undefined}
        onSelectCondition={allowCondition ? handleConditionSelect : undefined}
        conditionChannel={
          conditionAnchorStep ? normalizeChannel(conditionAnchorStep.channel) : undefined
        }
        onUseTemplate={
          isTrailingAdd ? () => setTemplatePickerOpen(true) : undefined
        }
        onUsePrompt={isTrailingAdd ? () => setPromptPickerOpen(true) : undefined}
      />

      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onInsert={insertStepFromTemplate}
        vars={SAMPLE_DATA}
        locale={locale}
      />

      <PromptPickerDialog
        open={promptPickerOpen}
        onOpenChange={setPromptPickerOpen}
        onInsert={insertStepFromPrompt}
      />

      {/* Same pickers, opened from the step editor's toolbar — these swap
          the selected step's content instead of appending a new step. */}
      <TemplatePickerDialog
        open={stepTemplateOpen}
        onOpenChange={setStepTemplateOpen}
        onInsert={applyTemplateToStep}
        vars={SAMPLE_DATA}
        channel={selectedStep ? templateChannelOf(selectedStep) : undefined}
        locale={locale}
      />

      <PromptPickerDialog
        open={stepPromptOpen}
        onOpenChange={setStepPromptOpen}
        onInsert={applyPromptToStep}
      />

      <CopySequenceDialog
        open={copySeqOpen}
        onOpenChange={setCopySeqOpen}
        currentCampaignId={campaignId}
        onCopy={copySequenceIn}
      />

      <SaveSequenceTemplateDialog
        open={saveSeqOpen}
        onOpenChange={setSaveSeqOpen}
        steps={draft.steps}
      />

      <SequenceMessagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        steps={draft.steps}
        prospects={audienceProspects}
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
              <Layers className="size-4" />
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
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
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
            <Button variant="ghost" onClick={() => setEndOpen(false)}>
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
// A step's send timing: immediate, or delayed by N days. Keeps its own
// draft text for the day-count input (keyed by step.id at the call site) —
// a plain controlled number input snaps back to "0" mid-edit and fights
// the user trying to clear or retype it.
function TimeDelayField({
  step,
  onChange,
}: {
  step: CampaignStep
  onChange: (patch: Partial<CampaignStep>) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [text, setText] = React.useState(String(step.delayDays || ""))

  function commit(raw: string) {
    onChange({ delayDays: Math.max(1, Math.round(Number(raw)) || 1) })
  }

  return (
    <div className="space-y-2">
      <span className="text-muted-foreground text-sm">{c.timeDelay}</span>
      <Segmented
        options={[
          { v: "immediate", label: c.sendImmediately, icon: Zap },
          { v: "delay", label: c.delayByDays, icon: CalendarClock },
        ]}
        value={step.delayDays > 0 ? "delay" : "immediate"}
        onChange={(v) => {
          if (v === "immediate") {
            setText("")
            onChange({ delayDays: 0 })
          } else {
            const n = step.delayDays > 0 ? step.delayDays : 1
            setText(String(n))
            onChange({ delayDays: n })
          }
        }}
      />
      {step.delayDays > 0 && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (e.target.value !== "") commit(e.target.value)
            }}
            onBlur={() => commit(text)}
            // The field already has its own explicit clear button (below,
            // resets to "Send immediately") — the shared Input's built-in
            // clear (×) would render inside this narrow box and crowd out
            // the digits, which is why the value looked like it wasn't
            // showing.
            clearable={false}
            className="h-8 w-20 tabular-nums"
          />
          <span className="text-muted-foreground text-sm">
            {c.daysBeforeSending}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={c.clearDelay}
            onClick={() => {
              setText("")
              onChange({ delayDays: 0 })
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

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
const CHANNEL_GROUPS: {
  labelKey:
    | "groupEmail"
    | "groupMessaging"
    | "groupLinkedin"
    | "groupAiPowered"
    | "groupOther"
  channels: StepChannel[]
}[] = [
  { labelKey: "groupEmail", channels: ["email"] },
  { labelKey: "groupMessaging", channels: ["whatsapp", "call"] },
  {
    labelKey: "groupLinkedin",
    channels: ["linkedin_message"],
  },
  // Agentic, AI-driven steps — a distinct mechanism from a human `call`,
  // so it gets its own group rather than joining groupMessaging.
  { labelKey: "groupAiPowered", channels: ["ai_call"] },
  // Channel-less offline activities (calls, visits, handwritten notes) —
  // free-form title + notes.
  { labelKey: "groupOther", channels: ["manual"] },
]

function EditCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  currentName,
  currentStatus,
  currentGoal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  currentName: string
  currentStatus: CampaignStatus
  currentGoal?: string
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [name, setName] = React.useState(currentName)
  const [status, setStatus] = React.useState<CampaignStatus>(currentStatus)
  const [goal, setGoal] = React.useState(currentGoal ?? "")

  // Re-sync the form whenever the dialog opens.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(currentName)
      setStatus(currentStatus)
      setGoal(currentGoal ?? "")
    }
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    campaignStore.update(campaignId, { name: trimmed, status, goal: goal.trim() || undefined })
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
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="campaign-goal">{c.goal}</Label>
              <span className="text-muted-foreground text-xs">{c.goalOptional}</span>
            </div>
            <Textarea
              id="campaign-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={c.goalPlaceholder}
              className="min-h-16 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave} disabled={!name.trim()}>
            {c.saveChanges}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
