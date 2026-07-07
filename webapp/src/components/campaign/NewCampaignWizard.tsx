import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Check,
  ArrowRight,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  X,
  Search,
  Users,
  Clock,
  Send,
  CalendarClock,
  Rocket,
  Copy,
  PenLine,
  Bookmark,
  Sparkles,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TemplatePickerDialog } from "@/components/templates/TemplatePickerDialog"
import {
  PromptPickerDialog,
  type PromptStepSeed,
} from "@/components/templates/PromptPickerDialog"
import { SAMPLE_DATA } from "@/pages/Templates"
import { normalizeChannel } from "@/pages/CampaignDetail"
import { AddCampaignProspectsDialog } from "@/components/campaigns/AddCampaignProspectsDialog"
import { useLocale, type Locale } from "@/lib/locale"
import {
  useCampaigns,
  useLists,
  campaignStore,
  flattenCampaignSteps,
} from "@/lib/store"
import {
  useSequenceTemplates,
  cloneSequenceSteps,
} from "@/lib/sequence-templates"
import { currentUser } from "@/lib/mock-data"
import { team } from "@/lib/team"
import { cn } from "@/lib/utils"
import type { StepChannel, EmailTemplate } from "@/lib/types"

// Sending accounts: the current user first, then teammates, deduped by id.
const ACCOUNT_OPTIONS = [
  { id: currentUser.id, name: currentUser.name },
  ...team
    .filter((m) => m.id !== currentUser.id)
    .map((m) => ({ id: m.id, name: m.name })),
]

/* ----------------------------- context ---------------------------------- */

interface NewCampaignCtx {
  open: () => void
}

const Ctx = React.createContext<NewCampaignCtx | undefined>(undefined)

export function useNewCampaign(): NewCampaignCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useNewCampaign must be used within NewCampaignProvider")
  return ctx
}

export function NewCampaignProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(() => ({ open: () => setOpen(true) }), [])
  return (
    <Ctx.Provider value={value}>
      {children}
      <NewCampaignWizard open={open} onOpenChange={setOpen} />
    </Ctx.Provider>
  )
}

/* ------------------------------- copy ------------------------------------ */

const STEPS_EN = ["Sequence", "Lead list", "Launch"] as const
const STEPS_ES = ["Secuencia", "Lista de leads", "Lanzamiento"] as const

const COPY = {
  en: {
    steps: STEPS_EN,
    title: "New campaign",
    groupEmail: "Email",
    groupMessaging: "Phone & messaging",
    groupLinkedin: "LinkedIn actions",
    nameLabel: "Campaign name",
    namePlaceholder: "e.g. Enterprise CRO Outbound",
    goalLabel: "Goal / intent",
    goalPlaceholder:
      "What outcome are you driving? Book demos, revive cold leads, expand into a new segment…",
    sequenceLabel: "Pick your first steps",
    sequenceDesc: "Choose one or more touches — you'll write the content next, on the campaign's Sequence tab.",
    startFromTemplate: "Start from a template",
    templatePicked: (name: string) => `Starting from "${name}"`,
    clearTemplate: "Remove template",
    startHow: "How do you want to start?",
    startScratch: "Start from scratch",
    startScratchDesc: "Pick channels and write the messages yourself.",
    startCopy: "Copy a campaign",
    startCopyDesc: "Reuse another campaign's whole sequence.",
    startTemplateOpt: "Sequence template",
    startTemplateDesc: "Start from a saved, ready-made sequence.",
    pickCampaign: "Choose a campaign…",
    pickSeqTemplate: "Choose a sequence template…",
    stepCountLabel: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    sequencePreview: "Sequence preview",
    copySuffix: "(copy)",
    firstMessageLabel: "First message",
    firstMessageDesc:
      "Write it yourself, reuse a template, or let the AI write it from a prompt.",
    sourceManual: "Write it myself",
    sourceTemplate: "Use a template",
    sourcePrompt: "Use a prompt",
    promptPicked: (name: string) => `AI prompt: ${name}`,
    clearPrompt: "Remove prompt",
    yourSequence: "Your sequence so far",
    stepAdded: (n: number) => `Step ${n}`,
    noStepsYet: "No steps yet — add one below, or add them later from the Sequence tab.",
    leadListTitle: "Who should this reach?",
    leadListDesc: "Attach a list, add prospects yourself, or decide later.",
    attachTitle: "Attach an existing list",
    attachDesc: "New prospects added to the list flow straight into this campaign.",
    manualTitle: "Add prospects myself",
    manualDesc: "Pick people from your database, AI search, or lookalikes.",
    laterTitle: "I'll do this later",
    laterDesc: "Launch without an audience yet — add one from the campaign page.",
    pickList: "Choose a list…",
    prospectsCount: (n: number) => `${n} ${n === 1 ? "prospect" : "prospects"}`,
    chooseProspects: "Choose prospects",
    changeProspects: "Add more",
    enrolledCount: (n: number) => `${n} ${n === 1 ? "prospect" : "prospects"} enrolled`,
    launchTitle: "Sending & timing",
    account: "Account",
    language: "Language",
    english: "English",
    spanish: "Español",
    sendNow: "Send right now",
    sendNowDesc: "Sequence goes live and messages start as soon as you launch.",
    sendLater: "Schedule for later",
    sendLaterDesc: "Queue the first send for a specific date and time.",
    tomorrowMorning: "Tomorrow, 8:00 AM",
    mondayMorning: "Monday, 8:00 AM",
    customTime: "Custom time",
    reviewTitle: "Ready to go",
    reviewSteps: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    reviewNoSteps: "No steps yet",
    reviewAudience: (label: string) => `Audience: ${label}`,
    reviewNoAudience: "Audience: none yet",
    reviewSender: (name: string, lang: string) => `Sending as ${name} · ${lang}`,
    reviewNow: "Starts sending immediately",
    reviewScheduled: (when: string) => `Starts ${when}`,
    cancel: "Cancel",
    back: "Back",
    continue: "Continue",
    launch: "Launch campaign",
    schedule: "Schedule campaign",
    created: (name: string) => `"${name}" is live`,
    scheduled: (name: string, when: string) => `"${name}" scheduled for ${when}`,
  },
  es: {
    steps: STEPS_ES,
    title: "Nueva campaña",
    groupEmail: "Correo",
    groupMessaging: "Teléfono y mensajería",
    groupLinkedin: "Acciones de LinkedIn",
    nameLabel: "Nombre de la campaña",
    namePlaceholder: "p. ej. Outbound CRO Enterprise",
    goalLabel: "Objetivo / intención",
    goalPlaceholder:
      "¿Qué resultado buscas? Agendar demos, reactivar leads fríos, entrar en un nuevo segmento…",
    sequenceLabel: "Elige tus primeros pasos",
    sequenceDesc: "Elige uno o más contactos — el contenido se redacta después, en la pestaña Secuencia de la campaña.",
    startFromTemplate: "Empezar con una plantilla",
    templatePicked: (name: string) => `Empezando con «${name}»`,
    clearTemplate: "Quitar plantilla",
    startHow: "¿Cómo quieres empezar?",
    startScratch: "Empezar de cero",
    startScratchDesc: "Elige canales y escribe los mensajes tú mismo.",
    startCopy: "Copiar una campaña",
    startCopyDesc: "Reutiliza la secuencia completa de otra campaña.",
    startTemplateOpt: "Plantilla de secuencia",
    startTemplateDesc: "Empieza desde una secuencia guardada y lista.",
    pickCampaign: "Elige una campaña…",
    pickSeqTemplate: "Elige una plantilla de secuencia…",
    stepCountLabel: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    sequencePreview: "Vista previa de la secuencia",
    copySuffix: "(copia)",
    firstMessageLabel: "Primer mensaje",
    firstMessageDesc:
      "Escríbelo tú, reutiliza una plantilla o deja que la IA lo redacte desde un prompt.",
    sourceManual: "Escribirlo yo",
    sourceTemplate: "Usar una plantilla",
    sourcePrompt: "Usar un prompt",
    promptPicked: (name: string) => `Prompt de IA: ${name}`,
    clearPrompt: "Quitar prompt",
    yourSequence: "Tu secuencia hasta ahora",
    stepAdded: (n: number) => `Paso ${n}`,
    noStepsYet: "Aún no hay pasos — añade uno abajo, o hazlo después desde la pestaña Secuencia.",
    leadListTitle: "¿A quién debe llegar?",
    leadListDesc: "Adjunta una lista, añade prospectos tú mismo, o decídelo más tarde.",
    attachTitle: "Adjuntar una lista existente",
    attachDesc: "Los nuevos prospectos que entren en la lista pasan directo a esta campaña.",
    manualTitle: "Añadir prospectos yo mismo",
    manualDesc: "Elige personas de tu base de datos, búsqueda con IA o similares.",
    laterTitle: "Lo haré más tarde",
    laterDesc: "Lanza sin audiencia todavía — añádela después desde la página de la campaña.",
    pickList: "Elige una lista…",
    prospectsCount: (n: number) => `${n} ${n === 1 ? "prospecto" : "prospectos"}`,
    chooseProspects: "Elegir prospectos",
    changeProspects: "Añadir más",
    enrolledCount: (n: number) => `${n} ${n === 1 ? "prospecto inscrito" : "prospectos inscritos"}`,
    launchTitle: "Envío y momento",
    account: "Cuenta",
    language: "Idioma",
    english: "English",
    spanish: "Español",
    sendNow: "Enviar ahora mismo",
    sendNowDesc: "La secuencia se activa y los mensajes empiezan al lanzar.",
    sendLater: "Programar para más tarde",
    sendLaterDesc: "Encola el primer envío para una fecha y hora concretas.",
    tomorrowMorning: "Mañana, 8:00",
    mondayMorning: "Lunes, 8:00",
    customTime: "Hora personalizada",
    reviewTitle: "Todo listo",
    reviewSteps: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    reviewNoSteps: "Aún sin pasos",
    reviewAudience: (label: string) => `Audiencia: ${label}`,
    reviewNoAudience: "Audiencia: ninguna todavía",
    reviewSender: (name: string, lang: string) => `Enviando como ${name} · ${lang}`,
    reviewNow: "Empieza a enviar de inmediato",
    reviewScheduled: (when: string) => `Empieza ${when}`,
    cancel: "Cancelar",
    back: "Atrás",
    continue: "Continuar",
    launch: "Lanzar campaña",
    schedule: "Programar campaña",
    created: (name: string) => `«${name}» está en marcha`,
    scheduled: (name: string, when: string) => `«${name}» programada para ${when}`,
  },
} as const

/* --------------------------- channel metadata ----------------------------- */

interface ChannelMeta {
  Icon: React.ComponentType<{ className?: string }>
  tint: string
  group: "groupEmail" | "groupMessaging" | "groupLinkedin"
  label: { en: string; es: string }
  caption: { en: string; es: string }
}

const CHANNEL_META: Record<StepChannel, ChannelMeta> = {
  email: {
    Icon: Mail,
    tint: "bg-primary/15 text-primary",
    group: "groupEmail",
    label: { en: "Email", es: "Correo" },
    caption: { en: "Send an automated email", es: "Enviar un correo automático" },
  },
  whatsapp: {
    Icon: MessageCircle,
    tint: "bg-chart-1/15 text-chart-1",
    group: "groupMessaging",
    label: { en: "WhatsApp", es: "WhatsApp" },
    caption: { en: "Send a WhatsApp message", es: "Enviar un mensaje de WhatsApp" },
  },
  call: {
    Icon: Phone,
    tint: "bg-chart-4/15 text-chart-4",
    group: "groupMessaging",
    label: { en: "Phone call", es: "Llamada" },
    caption: { en: "Creates a call task for the rep", es: "Crea una tarea de llamada para el vendedor" },
  },
  linkedin_message: {
    Icon: LinkedinIcon,
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    group: "groupLinkedin",
    label: { en: "LinkedIn message", es: "Mensaje de LinkedIn" },
    caption: { en: "Message an existing connection", es: "Mensaje a una conexión existente" },
  },
  linkedin_dm: {
    Icon: LinkedinIcon,
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    group: "groupLinkedin",
    label: { en: "LinkedIn DM", es: "DM de LinkedIn" },
    caption: { en: "Direct message, no connection needed", es: "Mensaje directo, sin necesidad de conexión" },
  },
  linkedin_inmail: {
    Icon: LinkedinIcon,
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    group: "groupLinkedin",
    label: { en: "LinkedIn InMail", es: "InMail de LinkedIn" },
    caption: { en: "Reach 2nd/3rd-degree contacts", es: "Llega a contactos de 2º/3er grado" },
  },
}

const CHANNEL_GROUPS: { key: ChannelMeta["group"]; channels: StepChannel[] }[] = [
  { key: "groupEmail", channels: ["email"] },
  { key: "groupMessaging", channels: ["whatsapp", "call"] },
  {
    key: "groupLinkedin",
    channels: ["linkedin_message", "linkedin_dm", "linkedin_inmail"],
  },
]

/* -------------------------------- helpers --------------------------------- */

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

type Audience = "attach" | "manual" | "later"
type Timing = "now" | "schedule"
type StartMode = "scratch" | "copy" | "template"

function OptionCard({
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean
  onSelect: () => void
  icon: React.ComponentType<{ className?: string }>
  title: React.ReactNode
  description: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary ring-primary/30 bg-primary/5 ring-1"
          : "hover:border-primary/40 hover:bg-muted/40"
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="font-medium">{title}</span>
        {selected && <Check className="text-primary ml-auto size-4" />}
      </span>
      <span className="text-muted-foreground text-sm">{description}</span>
    </button>
  )
}

/* ------------------------------ component -------------------------------- */

function NewCampaignWizard({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const campaigns = useCampaigns()
  const lists = useLists()
  const sequenceTemplates = useSequenceTemplates()

  const [step, setStep] = React.useState(0)
  const [campaignId, setCampaignId] = React.useState<string | null>(null)

  // Step 0 — Sequence
  const [startMode, setStartMode] = React.useState<StartMode>("scratch")
  const [copySourceId, setCopySourceId] = React.useState("")
  const [seqTemplateId, setSeqTemplateId] = React.useState("")
  const [name, setName] = React.useState("")
  const [nameTouched, setNameTouched] = React.useState(false)
  const [goal, setGoal] = React.useState("")
  const [template, setTemplate] = React.useState<EmailTemplate | null>(null)
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false)
  const [promptSeed, setPromptSeed] = React.useState<PromptStepSeed | null>(null)
  const [promptPickerOpen, setPromptPickerOpen] = React.useState(false)
  const [plannedSteps, setPlannedSteps] = React.useState<StepChannel[]>([])

  // Step 1 — Lead list
  const [audience, setAudience] = React.useState<Audience>("later")
  const [listId, setListId] = React.useState("")
  const [addProspectsOpen, setAddProspectsOpen] = React.useState(false)

  // Step 2 — Launch
  const [accountId, setAccountId] = React.useState(currentUser.id)
  const [language, setLanguage] = React.useState<Locale>(locale)
  const [timing, setTiming] = React.useState<Timing>("now")
  const [scheduledIso, setScheduledIso] = React.useState("")
  const [customValue, setCustomValue] = React.useState("")

  // Reset on open (render-time, per React guidance — no cascading effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStep(0)
      setCampaignId(null)
      setStartMode("scratch")
      setCopySourceId("")
      setSeqTemplateId("")
      setName("")
      setNameTouched(false)
      setGoal("")
      setTemplate(null)
      setPromptSeed(null)
      setPlannedSteps([])
      setAudience("later")
      setListId("")
      setAccountId(currentUser.id)
      setLanguage(locale)
      setTiming("now")
      setScheduledIso("")
      setCustomValue("")
    }
  }

  const liveCampaign = campaignId
    ? campaigns.find((cm) => cm.id === campaignId)
    : undefined
  const selectedList = lists.find((l) => l.id === listId)

  // Copy/template sources. The wizard's own draft campaign is excluded from
  // the copy list — it's the one being built.
  const copySources = campaigns.filter((cm) => cm.id !== campaignId)
  const copySource = copySources.find((cm) => cm.id === copySourceId)
  const seqTemplate = sequenceTemplates.find((t) => t.id === seqTemplateId)
  const previewSteps =
    startMode === "copy" && copySource
      ? flattenCampaignSteps(copySource.steps)
      : startMode === "template" && seqTemplate
        ? flattenCampaignSteps(seqTemplate.steps)
        : []

  // Which way the first message gets written (scratch mode) — derived, so a
  // cancelled picker leaves the previous choice untouched.
  const firstMsgSource = template ? "template" : promptSeed ? "prompt" : "manual"

  const trimmedName = name.trim()
  const canLeaveSequence =
    trimmedName.length > 0 &&
    (startMode === "copy"
      ? Boolean(copySource)
      : startMode === "template"
        ? Boolean(seqTemplate)
        : true)
  const canLeaveAudience = audience !== "attach" || Boolean(listId)

  // Prefill name (and an empty goal) from the picked source, unless the user
  // already typed their own.
  function seedFromSource(sourceName: string, sourceGoal?: string, suffix = "") {
    if (!nameTouched || name.trim() === "") {
      setName(suffix ? `${sourceName} ${suffix}` : sourceName)
      setNameTouched(false)
    }
    if (goal.trim() === "" && sourceGoal) setGoal(sourceGoal)
  }

  function toggleChannel(channel: StepChannel) {
    setPlannedSteps((prev) =>
      prev.includes(channel) ? prev.filter((ch) => ch !== channel) : [...prev, channel]
    )
  }

  // Create the campaign (once) when leaving step 0, then keep its name/goal
  // and draft steps in sync with the wizard's state on every re-visit.
  function commitSequence(): string {
    const id =
      campaignId ??
      campaignStore.create({ name: trimmedName, status: "draft", locale }).id
    if (!campaignId) setCampaignId(id)
    campaignStore.update(id, { name: trimmedName, goal: goal.trim() || undefined })
    if (startMode === "copy" && copySource) {
      campaignStore.update(id, { steps: cloneSequenceSteps(copySource.steps) })
    } else if (startMode === "template" && seqTemplate) {
      campaignStore.update(id, { steps: cloneSequenceSteps(seqTemplate.steps) })
    } else {
      campaignStore.update(id, { steps: [] })
      if (template) {
        campaignStore.addStepFromTemplate(id, {
          channel: normalizeChannel(template.channel),
          subject: template.subject,
          body: template.body,
        })
      } else if (promptSeed) {
        campaignStore.addStepFromTemplate(id, {
          channel: promptSeed.channel,
          subject: promptSeed.subject,
          body: promptSeed.body,
        })
      }
      plannedSteps.forEach((channel) => campaignStore.addStep(id, channel))
    }
    return id
  }

  function goToLeadList() {
    if (!canLeaveSequence) return
    commitSequence()
    setStep(1)
  }

  function goToLaunch() {
    if (!campaignId) return
    if (audience === "attach" && listId) {
      campaignStore.attachList(campaignId, listId)
    }
    setStep(2)
  }

  function pickPreset(iso: string) {
    setScheduledIso(iso)
    setCustomValue(toLocalInputValue(new Date(iso)))
  }

  function launch() {
    if (!campaignId) return
    if (timing === "schedule" && !scheduledIso) return
    const account = ACCOUNT_OPTIONS.find((a) => a.id === accountId) ?? ACCOUNT_OPTIONS[0]
    if (timing === "now") {
      campaignStore.activate(campaignId, {
        senderAccountId: account.id,
        senderAccount: account.name,
        language,
      })
      toast.success(c.created(trimmedName))
    } else {
      campaignStore.update(campaignId, {
        status: "draft",
        scheduledAt: scheduledIso,
        senderAccountId: account.id,
        senderAccount: account.name,
        language,
      })
      toast.success(c.scheduled(trimmedName, formatWhen(scheduledIso)))
    }
    onOpenChange(false)
    navigate(`/campaigns/${campaignId}`)
  }

  const audienceLabel =
    audience === "attach" && selectedList
      ? `${selectedList.name} · ${c.prospectsCount(selectedList.prospectIds.length)}`
      : audience === "manual"
        ? c.enrolledCount(liveCampaign?.enrolledIds?.length ?? 0)
        : null

  return (
    <>
      {/* Content unmounts while a nested full-screen dialog is open — two
          simultaneously-open Radix Dialog roots otherwise dismiss each
          other on outside interaction. */}
      <Dialog
        open={open && !templatePickerOpen && !addProspectsOpen && !promptPickerOpen}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="max-h-[90svh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b p-5">
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
                <Rocket className="size-4" />
              </span>
              {c.title}
            </DialogTitle>
            <DialogDescription className="sr-only">{c.title}</DialogDescription>

            {/* Stepper */}
            <ol className="mt-3 flex items-center gap-1.5">
              {c.steps.map((label, i) => (
                <li key={label} className="flex flex-1 items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                      i < step && "bg-primary text-primary-foreground",
                      i === step && "border-primary text-primary border-2",
                      i > step && "bg-muted text-muted-foreground"
                    )}
                  >
                    {i < step ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-xs font-medium sm:inline",
                      i === step ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                  {i < c.steps.length - 1 && <span className="bg-border h-px flex-1" />}
                </li>
              ))}
            </ol>
          </DialogHeader>

          <div className="max-h-[60svh] overflow-y-auto p-5">
            {step === 0 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>{c.startHow}</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(
                      [
                        {
                          key: "scratch",
                          Icon: PenLine,
                          title: c.startScratch,
                          caption: c.startScratchDesc,
                        },
                        {
                          key: "copy",
                          Icon: Copy,
                          title: c.startCopy,
                          caption: c.startCopyDesc,
                        },
                        {
                          key: "template",
                          Icon: Bookmark,
                          title: c.startTemplateOpt,
                          caption: c.startTemplateDesc,
                        },
                      ] as const
                    ).map((mode) => {
                      const selected = startMode === mode.key
                      return (
                        <button
                          key={mode.key}
                          type="button"
                          onClick={() => setStartMode(mode.key)}
                          aria-pressed={selected}
                          className={cn(
                            "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
                            selected
                              ? "border-primary ring-primary/30 bg-primary/5 ring-1"
                              : "hover:border-primary/40 hover:bg-muted/40"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-7 items-center justify-center rounded-md",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <mode.Icon className="size-3.5" />
                          </span>
                          <span className="text-sm font-medium">{mode.title}</span>
                          <span className="text-muted-foreground text-xs">
                            {mode.caption}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-name">{c.nameLabel}</Label>
                  <Input
                    id="campaign-name"
                    autoFocus
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setNameTouched(true)
                    }}
                    placeholder={c.namePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-goal">{c.goalLabel}</Label>
                  <Textarea
                    id="campaign-goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder={c.goalPlaceholder}
                    className="min-h-16 resize-none"
                  />
                </div>

                <Separator />

                {startMode === "copy" && (
                  <div className="space-y-2">
                    <Label htmlFor="copy-source-campaign">{c.startCopy}</Label>
                    <Select
                      value={copySourceId}
                      onValueChange={(v) => {
                        setCopySourceId(v)
                        const src = copySources.find((cm) => cm.id === v)
                        if (src) seedFromSource(src.name, src.goal, c.copySuffix)
                      }}
                    >
                      <SelectTrigger id="copy-source-campaign" className="w-full">
                        <SelectValue placeholder={c.pickCampaign} />
                      </SelectTrigger>
                      <SelectContent>
                        {copySources.map((cm) => (
                          <SelectItem key={cm.id} value={cm.id}>
                            {cm.name} ·{" "}
                            {c.stepCountLabel(flattenCampaignSteps(cm.steps).length)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {startMode === "template" && (
                  <div className="space-y-2">
                    <Label htmlFor="copy-source-template">
                      {c.startTemplateOpt}
                    </Label>
                    <Select
                      value={seqTemplateId}
                      onValueChange={(v) => {
                        setSeqTemplateId(v)
                        const tpl = sequenceTemplates.find((t) => t.id === v)
                        if (tpl) seedFromSource(tpl.name)
                      }}
                    >
                      <SelectTrigger id="copy-source-template" className="w-full">
                        <SelectValue placeholder={c.pickSeqTemplate} />
                      </SelectTrigger>
                      <SelectContent>
                        {sequenceTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} ·{" "}
                            {c.stepCountLabel(flattenCampaignSteps(t.steps).length)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {previewSteps.length > 0 && (
                  <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
                    <p className="text-xs font-medium">{c.sequencePreview}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {previewSteps.map((s, i) => {
                        const meta = CHANNEL_META[normalizeChannel(s.channel)]
                        return (
                          <Badge
                            key={s.id}
                            variant="secondary"
                            className="gap-1.5 font-normal"
                          >
                            <meta.Icon className="size-3" />
                            {i + 1}. {meta.label[locale]}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {startMode === "scratch" && (
                  <>
                    <div className="space-y-1">
                      <Label>{c.firstMessageLabel}</Label>
                      <p className="text-muted-foreground text-sm">
                        {c.firstMessageDesc}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setTemplate(null)
                          setPromptSeed(null)
                        }}
                        aria-pressed={firstMsgSource === "manual"}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                          firstMsgSource === "manual"
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <PenLine className="size-3.5" />
                        {c.sourceManual}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplatePickerOpen(true)}
                        aria-pressed={firstMsgSource === "template"}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                          firstMsgSource === "template"
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <FileText className="size-3.5" />
                        {c.sourceTemplate}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPromptPickerOpen(true)}
                        aria-pressed={firstMsgSource === "prompt"}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                          firstMsgSource === "prompt"
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Sparkles className="size-3.5" />
                        {c.sourcePrompt}
                      </button>
                    </div>

                    {template && (
                      <div className="border-primary/30 bg-primary/[0.03] flex items-center gap-2 rounded-lg border p-2.5 text-sm">
                        <FileText className="text-primary size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">
                          {c.templatePicked(template.name)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          aria-label={c.clearTemplate}
                          onClick={() => setTemplate(null)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    )}
                    {promptSeed && (
                      <div className="border-primary/30 bg-primary/[0.03] flex items-center gap-2 rounded-lg border p-2.5 text-sm">
                        <Sparkles className="text-primary size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">
                          {c.promptPicked(promptSeed.promptName)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          aria-label={c.clearPrompt}
                          onClick={() => setPromptSeed(null)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label>{c.sequenceLabel}</Label>
                      <p className="text-muted-foreground text-sm">
                        {c.sequenceDesc}
                      </p>
                    </div>

                    {CHANNEL_GROUPS.map((group) => (
                      <div key={group.key} className="space-y-2">
                        <p className="text-muted-foreground text-xs font-medium">
                          {c[group.key]}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {group.channels.map((channel) => {
                            const meta = CHANNEL_META[channel]
                            const selected = plannedSteps.includes(channel)
                            return (
                              <button
                                key={channel}
                                type="button"
                                onClick={() => toggleChannel(channel)}
                                aria-pressed={selected}
                                className={cn(
                                  "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
                                  selected
                                    ? "border-primary ring-primary/30 bg-primary/5 ring-1"
                                    : "hover:border-primary/40 hover:bg-muted/40"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex size-7 items-center justify-center rounded-md",
                                    meta.tint
                                  )}
                                >
                                  <meta.Icon className="size-3.5" />
                                </span>
                                <span className="text-sm font-medium">
                                  {meta.label[locale]}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {meta.caption[locale]}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    {plannedSteps.length > 0 && (
                      <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
                        <p className="text-xs font-medium">{c.yourSequence}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {plannedSteps.map((channel, i) => {
                            const meta = CHANNEL_META[channel]
                            return (
                              <Badge
                                key={`${channel}-${i}`}
                                variant="secondary"
                                className="gap-1.5 font-normal"
                              >
                                <meta.Icon className="size-3" />
                                {c.stepAdded(i + 1)}: {meta.label[locale]}
                                <button
                                  type="button"
                                  aria-label={c.clearTemplate}
                                  onClick={() =>
                                    setPlannedSteps((prev) =>
                                      prev.filter((_, idx) => idx !== i)
                                    )
                                  }
                                  className="hover:text-foreground ml-0.5"
                                >
                                  <X className="size-3" />
                                </button>
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {plannedSteps.length === 0 && !template && !promptSeed && (
                      <p className="text-muted-foreground text-xs">
                        {c.noStepsYet}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>{c.leadListTitle}</Label>
                  <p className="text-muted-foreground text-sm">{c.leadListDesc}</p>
                </div>

                <div className="grid gap-3">
                  <OptionCard
                    selected={audience === "attach"}
                    onSelect={() => setAudience("attach")}
                    icon={Search}
                    title={c.attachTitle}
                    description={c.attachDesc}
                  />
                  {audience === "attach" && (
                    <div className="pl-11">
                      <Select value={listId} onValueChange={setListId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={c.pickList} />
                        </SelectTrigger>
                        <SelectContent>
                          {lists.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name} · {c.prospectsCount(l.prospectIds.length)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <OptionCard
                    selected={audience === "manual"}
                    onSelect={() => setAudience("manual")}
                    icon={Users}
                    title={c.manualTitle}
                    description={c.manualDesc}
                  />
                  {audience === "manual" && (
                    <div className="flex items-center gap-2 pl-11">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (!campaignId) return
                          setAddProspectsOpen(true)
                        }}
                      >
                        <Users className="size-4" />
                        {(liveCampaign?.enrolledIds?.length ?? 0) > 0
                          ? c.changeProspects
                          : c.chooseProspects}
                      </Button>
                      {(liveCampaign?.enrolledIds?.length ?? 0) > 0 && (
                        <span className="text-muted-foreground text-sm">
                          {c.enrolledCount(liveCampaign?.enrolledIds?.length ?? 0)}
                        </span>
                      )}
                    </div>
                  )}

                  <OptionCard
                    selected={audience === "later"}
                    onSelect={() => setAudience("later")}
                    icon={Clock}
                    title={c.laterTitle}
                    description={c.laterDesc}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <Label>{c.launchTitle}</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-account" className="text-muted-foreground text-xs">
                      {c.account}
                    </Label>
                    <Select value={accountId} onValueChange={setAccountId}>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-language" className="text-muted-foreground text-xs">
                      {c.language}
                    </Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as Locale)}>
                      <SelectTrigger id="campaign-language" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{c.english}</SelectItem>
                        <SelectItem value="es">{c.spanish}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-2">
                  <OptionCard
                    selected={timing === "now"}
                    onSelect={() => setTiming("now")}
                    icon={Send}
                    title={c.sendNow}
                    description={c.sendNowDesc}
                  />
                  <OptionCard
                    selected={timing === "schedule"}
                    onSelect={() => setTiming("schedule")}
                    icon={CalendarClock}
                    title={c.sendLater}
                    description={c.sendLaterDesc}
                  />
                </div>

                {timing === "schedule" && (
                  <div className="space-y-2 pl-1">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={
                          scheduledIso === morningISO(1) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => pickPreset(morningISO(1))}
                      >
                        {c.tomorrowMorning}
                      </Button>
                      <Button
                        type="button"
                        variant={
                          scheduledIso === nextMondayMorningISO() ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => pickPreset(nextMondayMorningISO())}
                      >
                        {c.mondayMorning}
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="campaign-custom-time" className="text-muted-foreground text-xs">
                        {c.customTime}
                      </Label>
                      <Input
                        id="campaign-custom-time"
                        type="datetime-local"
                        value={customValue}
                        onChange={(e) => {
                          setCustomValue(e.target.value)
                          setScheduledIso(
                            e.target.value ? new Date(e.target.value).toISOString() : ""
                          )
                        }}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="bg-muted/40 space-y-1.5 rounded-lg border p-3 text-sm">
                  <p className="font-medium">{c.reviewTitle}</p>
                  <p className="text-muted-foreground">
                    {liveCampaign && liveCampaign.steps.length > 0
                      ? c.reviewSteps(liveCampaign.steps.length)
                      : c.reviewNoSteps}
                  </p>
                  <p className="text-muted-foreground">
                    {audienceLabel ? c.reviewAudience(audienceLabel) : c.reviewNoAudience}
                  </p>
                  <p className="text-muted-foreground">
                    {c.reviewSender(
                      ACCOUNT_OPTIONS.find((a) => a.id === accountId)?.name ?? "",
                      language === "es" ? c.spanish : c.english
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {timing === "now"
                      ? c.reviewNow
                      : scheduledIso
                        ? c.reviewScheduled(formatWhen(scheduledIso))
                        : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t p-4">
            <Button
              variant="ghost"
              onClick={
                step === 0
                  ? () => onOpenChange(false)
                  : () => setStep((s) => s - 1)
              }
            >
              {step === 0 ? c.cancel : c.back}
            </Button>
            {step === 0 && (
              <Button onClick={goToLeadList} disabled={!canLeaveSequence}>
                {c.continue}
                <ArrowRight className="size-4" />
              </Button>
            )}
            {step === 1 && (
              <Button onClick={goToLaunch} disabled={!canLeaveAudience}>
                {c.continue}
                <ArrowRight className="size-4" />
              </Button>
            )}
            {step === 2 && (
              <Button
                onClick={launch}
                disabled={timing === "schedule" && !scheduledIso}
              >
                {timing === "now" ? (
                  <Send className="size-4" />
                ) : (
                  <CalendarClock className="size-4" />
                )}
                {timing === "now" ? c.launch : c.schedule}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onInsert={(t) => {
          setTemplate(t)
          setPromptSeed(null)
        }}
        vars={SAMPLE_DATA}
        locale={locale}
      />

      <PromptPickerDialog
        open={promptPickerOpen}
        onOpenChange={setPromptPickerOpen}
        onInsert={(seed) => {
          setPromptSeed(seed)
          setTemplate(null)
        }}
      />

      {liveCampaign && (
        <AddCampaignProspectsDialog
          open={addProspectsOpen}
          onOpenChange={setAddProspectsOpen}
          campaign={liveCampaign}
          enrolledIds={new Set(liveCampaign.enrolledIds ?? [])}
        />
      )}
    </>
  )
}
