import * as React from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  RefreshCw,
  Building2,
  Play,
  Pause,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  MessageCircleQuestion,
  Clock,
  Timer,
  ListChecks,
  CheckCircle2,
  Circle,
  GraduationCap,
  Users,
  Brain,
  Star,
  ThumbsUp,
  ThumbsDown,
  Search,
  Send,
  Sparkles,
  Loader2,
  SkipBack,
  SkipForward,
  ExternalLink,
  Save,
  Trash2,
  Plus,
} from "lucide-react"

import { useLocale, type Locale } from "@/lib/locale"
import { InfoHint } from "@/components/common/InfoHint"
import { BackLink } from "@/components/common/BackLink"
import { Page } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/common/EmptyState"
import { RichTextEditor } from "@/components/common/RichTextEditor"
import { CallScorecard } from "@/components/coach/CoachScorecard"
import { CallQaPanel } from "@/components/coach/CallQaPanel"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useFollowUpTemplates,
  followUpTemplateStore,
} from "@/lib/followup-templates"
import { coachRecordings, currentUser } from "@/lib/mock-data"
import { getScorecard } from "@/lib/mock-coaching"
import { recordingDetails } from "@/lib/mock-depth"
import { plainToHtml, stripHtml } from "@/lib/rich-text"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { KeyMoment, CoachRecording } from "@/lib/types"

const SENTIMENT = {
  positive: { icon: Smile, variant: "success" as const },
  neutral: { icon: Meh, variant: "secondary" as const },
  negative: { icon: Frown, variant: "destructive" as const },
}

// No real per-item priority data exists yet — cycles a deterministic
// high/medium/low so the Next Steps list reads as prioritized.
const ACTION_ITEM_PRIORITIES = ["high", "medium", "low"] as const

const MOMENT_STYLES: Record<
  KeyMoment["type"],
  { dot: string; badge: string }
> = {
  positive: {
    dot: "bg-chart-1",
    badge: "bg-chart-1/15 text-chart-1",
  },
  risk: {
    dot: "bg-destructive",
    badge: "bg-destructive/15 text-destructive",
  },
  action: {
    dot: "bg-primary",
    badge: "bg-primary/15 text-primary",
  },
  question: {
    dot: "bg-chart-4",
    badge: "bg-chart-4/15 text-chart-4",
  },
}

const COPY = {
  en: {
    recordingNotFound: "Recording not found.",
    backToCoach: "Back to Call Coach",
    coach: "Call Coach",
    callScore: "Call score",
    reanalyzing: "Re-analyzing recording…",
    reanalyze: "Re-analyze",
    notesAdded: "Notes added to CRM",
    addNotesToCrm: "Add notes to CRM",
    pause: "Pause",
    play: "Play",
    tabAnalysis: "Analysis",
    tabSummary: "Summary",
    tabTranscript: "Transcript",
    tabParticipants: "Participants",
    tabKeyFields: "Key Fields",
    tabFollowUp: "Follow-Up",
    host: "Host",
    joined: "Joined",
    addToSalesforce: "Add to Salesforce",
    fieldProblem: "Problem",
    fieldProblemHint: "The main problem the customer is facing.",
    fieldImpact: "Impact",
    fieldImpactHint: "The business or personal cost of the problem.",
    fieldContext: "Context",
    fieldContextHint: "How the customer works today.",
    fieldPeople: "People",
    fieldPeopleHint: "Stakeholders involved in the decision.",
    noKeyFields: "No key fields captured for this call.",
    priorityLabel: (p: string) => `Priority: ${p}`,
    priority: {
      high: "High",
      medium: "Medium",
      low: "Low",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "Was the information above helpful?",
    summary: "Summary",
    followUpTitle: (name: string) => `Follow up with ${name}`,
    followUpSubjectLabel: "Subject",
    followUpBodyLabel: "Message",
    followUpDefaultSubject: (company: string) => `Following up — ${company}`,
    aiDraft: "Draft with AI",
    sendFollowUp: "Send email",
    followUpSent: "Follow-up email sent",
    templateLabel: "Template",
    aiDraftOption: "AI draft (from this call)",
    saveAsTemplate: "Save as template",
    templateNamePlaceholder: "e.g. Thanks + next steps",
    saveTemplateBtn: "Save",
    updateTemplate: "Update template",
    deleteTemplate: "Delete template",
    templateCreated: "Follow-up template created",
    templateUpdated: "Follow-up template updated",
    templateDeleted: "Follow-up template deleted",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Phone call",
    } as Record<string, string>,
    originalVideo: "Original video",
    openOnLinkedIn: "Watch the original video on LinkedIn",
    linkedinNoEmbed:
      "LinkedIn calls can't be played here — open the original on LinkedIn.",
    skipBack: "Back 10 seconds",
    skipForward: "Forward 10 seconds",
    playbackSpeed: (s: string) => `Playback speed ${s}`,
    seekAria: "Seek in recording",
    summaryHintLabel: "How this summary is generated",
    summaryHint:
      "This summary follows a custom prompt that can be configured per user or per company. For now the Kombo team sets it up for you — ask us to tune yours.",
    searchTranscript: "Search this transcript…",
    noTranscriptMatch: "No lines match your search.",
    notableQuotes: "Notable quotes",
    topicJumpHint: "Click a topic to find it in the transcript",
    transcript: "Transcript",
    keyMoments: "Key moments",
    participants: "Participants",
    noTranscript: "No transcript available for this recording.",
    noKeyMoments: "No key moments captured.",
    you: "You",
    prospect: "Prospect",
    talkTime: "talk time",
    callAnalysis: "Call analysis",
    talkRatio: "Talk ratio",
    talkRatioHintLabel: "What is talk ratio?",
    talkRatioHint:
      "The share of the call you (the rep) spoke versus the prospect. Lower is usually better — let them talk.",
    talkRatioSplit: (rep: number, prospect: number) =>
      `You ${rep}% / Prospect ${prospect}%`,
    talkRatioHigh: "Talk ratio is high — aim for under 50%.",
    questionsAsked: "Questions asked",
    longestMonologue: "Longest monologue",
    avgResponseTime: "Avg response time",
    topicsDiscussed: "Topics discussed",
    objections: "Objections",
    actionItems: "Next steps",
    markNotDone: "Mark as not done",
    markDone: "Mark as done",
    completed: (label: string) => `Completed: ${label}`,
    tasksCreated: "Tasks created",
    createTasks: "Create tasks",
    coachingTips: "Coaching tips",
    personalityRead: "Personality read",
    rateThisAnalysis: "Rate this analysis",
    rateStar: (n: number) => `Rate ${n} star${n > 1 ? "s" : ""}`,
    thanksFeedback: "Thanks for the feedback",
    wasHelpful: "Was this helpful?",
    helpful: "Helpful",
    notHelpful: "Not helpful",
    gladHelped: "Glad it helped",
    willImprove: "Thanks — we'll improve",
    min: "min",
    sentiment: {
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
    },
    moments: {
      positive: "Positive",
      risk: "Risk",
      action: "Action",
      question: "Question",
    } as Record<KeyMoment["type"], string>,
  },
  es: {
    recordingNotFound: "Grabación no encontrada.",
    backToCoach: "Volver al Coach de llamadas",
    coach: "Coach de llamadas",
    callScore: "Puntuación",
    reanalyzing: "Reanalizando la grabación…",
    reanalyze: "Reanalizar",
    notesAdded: "Notas añadidas al CRM",
    addNotesToCrm: "Añadir notas al CRM",
    pause: "Pausar",
    play: "Reproducir",
    tabAnalysis: "Análisis",
    tabSummary: "Resumen",
    tabTranscript: "Transcripción",
    tabParticipants: "Participantes",
    tabKeyFields: "Campos clave",
    tabFollowUp: "Seguimiento",
    host: "Anfitrión",
    joined: "Unido",
    addToSalesforce: "Añadir a Salesforce",
    fieldProblem: "Problema",
    fieldProblemHint: "El principal problema que enfrenta el cliente.",
    fieldImpact: "Impacto",
    fieldImpactHint: "El coste empresarial o personal del problema.",
    fieldContext: "Contexto",
    fieldContextHint: "Cómo trabaja el cliente hoy.",
    fieldPeople: "Personas",
    fieldPeopleHint: "Personas implicadas en la decisión.",
    noKeyFields: "No se capturaron campos clave para esta llamada.",
    priorityLabel: (p: string) => `Prioridad: ${p}`,
    priority: {
      high: "Alta",
      medium: "Media",
      low: "Baja",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "¿Te resultó útil la información anterior?",
    summary: "Resumen",
    followUpTitle: (name: string) => `Seguimiento con ${name}`,
    followUpSubjectLabel: "Asunto",
    followUpBodyLabel: "Mensaje",
    followUpDefaultSubject: (company: string) => `Seguimiento — ${company}`,
    aiDraft: "Redactar con IA",
    sendFollowUp: "Enviar correo",
    followUpSent: "Correo de seguimiento enviado",
    templateLabel: "Plantilla",
    aiDraftOption: "Borrador de IA (de esta llamada)",
    saveAsTemplate: "Guardar como plantilla",
    templateNamePlaceholder: "p. ej. Gracias + próximos pasos",
    saveTemplateBtn: "Guardar",
    updateTemplate: "Actualizar plantilla",
    deleteTemplate: "Eliminar plantilla",
    templateCreated: "Plantilla de seguimiento creada",
    templateUpdated: "Plantilla de seguimiento actualizada",
    templateDeleted: "Plantilla de seguimiento eliminada",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Llamada telefónica",
    } as Record<string, string>,
    originalVideo: "Vídeo original",
    openOnLinkedIn: "Ver el vídeo original en LinkedIn",
    linkedinNoEmbed:
      "Las llamadas de LinkedIn no se pueden reproducir aquí — abre el original en LinkedIn.",
    skipBack: "Retroceder 10 segundos",
    skipForward: "Avanzar 10 segundos",
    playbackSpeed: (s: string) => `Velocidad de reproducción ${s}`,
    seekAria: "Buscar en la grabación",
    summaryHintLabel: "Cómo se genera este resumen",
    summaryHint:
      "Este resumen sigue un prompt personalizado configurable por usuario o por empresa. Por ahora lo configura el equipo de Kombo — pídenos ajustar el tuyo.",
    searchTranscript: "Busca en la transcripción…",
    noTranscriptMatch: "Ninguna línea coincide con tu búsqueda.",
    notableQuotes: "Frases destacadas",
    topicJumpHint: "Toca un tema para encontrarlo en la transcripción",
    transcript: "Transcripción",
    keyMoments: "Momentos clave",
    participants: "Participantes",
    noTranscript: "No hay transcripción disponible para esta grabación.",
    noKeyMoments: "No se capturaron momentos clave.",
    you: "Tú",
    prospect: "Prospecto",
    talkTime: "tiempo hablando",
    callAnalysis: "Análisis de la llamada",
    talkRatio: "Ratio de conversación",
    talkRatioHintLabel: "¿Qué es el ratio de conversación?",
    talkRatioHint:
      "La proporción de la llamada en la que hablaste tú (el representante) frente al prospecto. Cuanto más bajo, mejor: deja que hablen.",
    talkRatioSplit: (rep: number, prospect: number) =>
      `Tú ${rep}% / Prospecto ${prospect}%`,
    talkRatioHigh: "El ratio de conversación es alto: apunta a menos del 50 %.",
    questionsAsked: "Preguntas realizadas",
    longestMonologue: "Monólogo más largo",
    avgResponseTime: "Tiempo medio de respuesta",
    topicsDiscussed: "Temas tratados",
    objections: "Objeciones",
    actionItems: "Próximos pasos",
    markNotDone: "Marcar como pendiente",
    markDone: "Marcar como completada",
    completed: (label: string) => `Completada: ${label}`,
    tasksCreated: "Tareas creadas",
    createTasks: "Crear tareas",
    coachingTips: "Consejos de coaching",
    personalityRead: "Análisis de personalidad",
    rateThisAnalysis: "Valora este análisis",
    rateStar: (n: number) => `Valorar con ${n} estrella${n > 1 ? "s" : ""}`,
    thanksFeedback: "Gracias por tu opinión",
    wasHelpful: "¿Te resultó útil?",
    helpful: "Útil",
    notHelpful: "No útil",
    gladHelped: "Nos alegra que te ayudara",
    willImprove: "Gracias: lo mejoraremos",
    min: "min",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
    },
    moments: {
      positive: "Positivo",
      risk: "Riesgo",
      action: "Acción",
      question: "Pregunta",
    } as Record<KeyMoment["type"], string>,
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = Math.floor(totalSec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

// Fill a follow-up template's {{variables}} from the recording.
function mergeFollowUpVars(text: string, rec: CoachRecording): string {
  const data: Record<string, string> = {
    first_name: rec.prospectName.split(" ")[0],
    company: rec.company,
    next_steps: rec.nextSteps.map((s) => `• ${s}`).join("\n"),
    sender: currentUser.name,
  }
  return text.replace(/\{\{(\w+)\}\}/g, (whole, tag: string) => data[tag] ?? whole)
}

const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2] as const

// A call-aware first draft that seeds the follow-up composer.
function buildFollowUpDraft(rec: CoachRecording, locale: Locale): string {
  const first = rec.prospectName.split(" ")[0]
  const steps = rec.nextSteps
  if (locale === "es") {
    const s = steps.length
      ? `\n\nPróximos pasos:\n${steps.map((x) => `• ${x}`).join("\n")}`
      : ""
    return `Hola ${first}:\n\nGracias por tu tiempo hoy — un gusto hablar sobre ${rec.company}.${s}\n\nUn saludo,\nKevin`
  }
  const s = steps.length
    ? `\n\nNext steps:\n${steps.map((x) => `• ${x}`).join("\n")}`
    : ""
  return `Hi ${first},\n\nThanks for your time today — great to talk things through with ${rec.company}.${s}\n\nBest,\nKevin`
}

export default function CoachRecordingDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const rec = coachRecordings.find((r) => r.id === id)
  const analysis = id ? recordingDetails[id] : undefined

  const [tab, setTab] = React.useState("analysis")
  const [transcriptQuery, setTranscriptQuery] = React.useState("")
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [positionSec, setPositionSec] = React.useState(0)
  const [speed, setSpeed] = React.useState<number>(1)
  const durationSec = (rec?.durationMin ?? 0) * 60
  // "Ended" is derived, not a state flip — the interval below simply stops
  // once the playhead reaches the end, and play from the end restarts.
  const atEnd = durationSec > 0 && positionSec >= durationSec
  const playing = isPlaying && !atEnd

  // Mock playback: advance the playhead while playing, scaled by speed.
  React.useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      setPositionSec((p) => Math.min(durationSec, p + speed))
    }, 1000)
    return () => window.clearInterval(t)
  }, [playing, speed, durationSec])

  function togglePlay() {
    if (atEnd) {
      setPositionSec(0)
      setIsPlaying(true)
      return
    }
    setIsPlaying((p) => !p)
  }
  const [doneItems, setDoneItems] = React.useState<Record<number, boolean>>({})
  const [rating, setRating] = React.useState(0)
  const [helpful, setHelpful] = React.useState<boolean | null>(null)
  const [followUpHelpful, setFollowUpHelpful] = React.useState<boolean | null>(null)

  if (!rec) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.recordingNotFound}</p>
        <BackLink to="/coach" label={c.backToCoach} variant="link" />
      </Page>
    )
  }

  const sentiment = SENTIMENT[rec.sentiment]
  const SentimentIcon = sentiment.icon
  const repRatio = rec.talkRatio
  const prospectRatio = 100 - rec.talkRatio
  const scorecard = getScorecard(rec.id)
  const quotes = scorecard.sections.filter((s) => s.quote)

  const transcriptTurns = analysis?.transcript ?? []
  const tq = transcriptQuery.trim().toLowerCase()
  const filteredTranscript = tq
    ? transcriptTurns.filter(
        (t) =>
          t.text.toLowerCase().includes(tq) ||
          t.name.toLowerCase().includes(tq)
      )
    : transcriptTurns

  const toggleDone = (index: number, label: string) => {
    setDoneItems((prev) => {
      const next = { ...prev, [index]: !prev[index] }
      if (next[index]) toast.success(c.completed(label))
      return next
    })
  }

  // "See parts of conversations on specific topics" — jump the transcript to a
  // topic keyword and switch to the tab where the transcript lives.
  const jumpToTopic = (label: string) => {
    setTranscriptQuery(label)
    setTab("transcript")
  }

  const participantsCard = analysis?.participants &&
    analysis.participants.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.participants}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.participants.map((p) => (
            <div key={p.name}>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground size-4" />
                  <span className="text-sm font-medium">{p.name}</span>
                  <Badge
                    variant={p.role === "rep" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {p.role === "rep" ? c.you : c.prospect}
                  </Badge>
                  {p.role === "rep" && (
                    <Badge variant="outline" className="font-normal">
                      {c.host}
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-normal">
                    {c.joined}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {p.talkPct}% {c.talkTime}
                  </span>
                  {p.role === "prospect" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success(c.notesAdded)}
                    >
                      <Building2 className="size-4" />
                      {c.addToSalesforce}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground mb-1.5 text-xs">{p.title}</p>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full",
                    p.role === "rep" ? "bg-primary" : "bg-chart-2"
                  )}
                  style={{ width: `${p.talkPct}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )

  const callMetricsCard = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.callAnalysis}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              {c.talkRatio}
              <InfoHint label={c.talkRatioHintLabel}>{c.talkRatioHint}</InfoHint>
            </span>
            <span className="font-medium tabular-nums">
              {c.talkRatioSplit(repRatio, prospectRatio)}
            </span>
          </div>
          <div className="bg-muted flex h-6 w-full overflow-hidden rounded-md">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${repRatio}%` }}
            />
            <div
              className="bg-muted h-full transition-all"
              style={{ width: `${prospectRatio}%` }}
            />
          </div>
          {repRatio > 55 && (
            <p className="text-muted-foreground mt-1 text-xs">
              {c.talkRatioHigh}
            </p>
          )}
        </div>

        {analysis && (
          <>
            <Separator />
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MessageCircleQuestion className="size-4" />
                  {c.questionsAsked}
                </span>
                <span className="font-medium tabular-nums">
                  {analysis.questionsAsked}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="size-4" />
                  {c.longestMonologue}
                </span>
                <span className="font-medium tabular-nums">
                  {analysis.longestMonologueMin} {c.min}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Timer className="size-4" />
                  {c.avgResponseTime}
                </span>
                <span className="font-medium tabular-nums">
                  {analysis.patience}s
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  const actionItemsCard = analysis && analysis.actionItems.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.actionItems}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {analysis.actionItems.map((item, i) => {
          const done = doneItems[i] ?? false
          const priority = ACTION_ITEM_PRIORITIES[i % ACTION_ITEM_PRIORITIES.length]
          return (
            <div
              key={item}
              className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
            >
              <Button
                size="icon"
                variant="ghost"
                className="size-6 shrink-0"
                onClick={() => toggleDone(i, item)}
                aria-label={done ? c.markNotDone : c.markDone}
              >
                {done ? (
                  <CheckCircle2 className="text-primary size-4" />
                ) : (
                  <Circle className="text-muted-foreground size-4" />
                )}
              </Button>
              <span
                className={cn(
                  "flex-1",
                  done && "text-muted-foreground line-through"
                )}
              >
                {item}
              </span>
              <Badge variant="outline" className="shrink-0 font-normal">
                {c.priorityLabel(c.priority[priority])}
              </Badge>
            </div>
          )
        })}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => toast.success(c.tasksCreated)}
        >
          <ListChecks className="size-4" />
          {c.createTasks}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Page>
      <BackLink to="/coach" label={c.coach} />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{rec.title}</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
                  scorePillClass(rec.score)
                )}
                title={c.callScore}
              >
                <span className="bg-current size-1.5 rounded-full opacity-80" />
                {rec.score}/100
              </span>
              <Badge variant={sentiment.variant}>
                <SentimentIcon className="size-3" />
                {c.sentiment[rec.sentiment]}
              </Badge>
              {analysis?.callType && (
                <Badge variant="secondary">{analysis.callType}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {rec.prospectName} · {rec.company} · {formatDate(rec.date)} ·{" "}
              {rec.durationMin} min
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.info(c.reanalyzing)}>
              <RefreshCw className="size-4" />
              {c.reanalyze}
            </Button>
            <Button variant="volt" onClick={() => toast.success(c.notesAdded)}>
              <Building2 className="size-4" />
              {c.addNotesToCrm}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full original video (1.6.0). LinkedIn can't embed its recordings, so
          those calls link out to the original instead of playing inline. */}
      {rec.videoSource === "linkedin" ? (
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="bg-[#0a66c2]/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
              <LinkedinIcon className="size-5 text-[#0a66c2]" />
            </span>
            <p className="text-muted-foreground min-w-0 flex-1 text-sm">
              {c.linkedinNoEmbed}
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://www.linkedin.com/messaging/"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-4" />
                {c.openOnLinkedIn}
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 gap-0 overflow-hidden p-0">
          <div className="relative flex aspect-video max-h-80 w-full items-center justify-center bg-zinc-900">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="bg-primary/25 text-primary-foreground flex size-20 items-center justify-center rounded-full text-2xl font-semibold">
                {rec.prospectName
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <p className="text-sm font-medium text-white">
                {rec.prospectName}
              </p>
              <p className="text-xs text-white/60">{rec.company}</p>
            </div>
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 font-normal"
            >
              {c.originalVideo} ·{" "}
              {c.videoSourceLabel[rec.videoSource ?? "meet"]}
            </Badge>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? c.pause : c.play}
              className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20"
            >
              {!playing && (
                <span className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full shadow-lg">
                  <Play className="ml-0.5 size-6" />
                </span>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t p-3">
            <Button
              size="icon"
              variant="outline"
              className="size-9 shrink-0 rounded-full"
              onClick={togglePlay}
              aria-label={playing ? c.pause : c.play}
            >
              {playing ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() => setPositionSec((p) => Math.max(0, p - 10))}
              aria-label={c.skipBack}
            >
              <SkipBack className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() =>
                setPositionSec((p) => Math.min(durationSec, p + 10))
              }
              aria-label={c.skipForward}
            >
              <SkipForward className="size-4" />
            </Button>
            <div
              className="bg-muted h-1.5 min-w-24 flex-1 cursor-pointer overflow-hidden rounded-full"
              role="progressbar"
              aria-label={c.seekAria}
              aria-valuemin={0}
              aria-valuemax={durationSec}
              aria-valuenow={Math.round(positionSec)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = (e.clientX - rect.left) / rect.width
                setPositionSec(
                  Math.max(0, Math.min(durationSec, Math.round(ratio * durationSec)))
                )
              }}
            >
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{
                  width: `${durationSec ? (positionSec / durationSec) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {formatClock(positionSec)} / {formatClock(durationSec)}
            </span>
            <div className="flex shrink-0 gap-1">
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-label={c.playbackSpeed(`${s}x`)}
                  aria-pressed={speed === s}
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums transition-colors",
                    speed === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="analysis">{c.tabAnalysis}</TabsTrigger>
          <TabsTrigger value="summary">{c.tabSummary}</TabsTrigger>
          <TabsTrigger value="transcript">{c.tabTranscript}</TabsTrigger>
          <TabsTrigger value="participants">{c.tabParticipants}</TabsTrigger>
          <TabsTrigger value="keyFields">{c.tabKeyFields}</TabsTrigger>
          <TabsTrigger value="followUp">{c.tabFollowUp}</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <CallScorecard scorecard={scorecard} />

              {/* Notable quotes — verbatim, tagged by section */}
              {quotes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{c.notableQuotes}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quotes.map((s) => (
                      <blockquote
                        key={s.label}
                        className="border-muted-foreground/30 border-l-2 pl-3"
                      >
                        <p className="text-sm italic">“{s.quote}”</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {s.label}
                        </p>
                      </blockquote>
                    ))}
                  </CardContent>
                </Card>
              )}

              {analysis && analysis.keyMoments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{c.keyMoments}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {analysis.keyMoments.map((moment, i) => {
                        const style = MOMENT_STYLES[moment.type]
                        return (
                          <li
                            key={`${moment.time}-${i}`}
                            className="flex items-start gap-3"
                          >
                            <span className="text-muted-foreground mt-0.5 w-12 shrink-0 font-mono text-xs tabular-nums">
                              {moment.time}
                            </span>
                            <span
                              className={cn(
                                "mt-1.5 size-2 shrink-0 rounded-full",
                                style.dot
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm">{moment.label}</p>
                              <span
                                className={cn(
                                  "mt-1 inline-flex rounded px-1.5 py-0.5 text-xs font-medium",
                                  style.badge
                                )}
                              >
                                {c.moments[moment.type]}
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Ask precise questions about this call */}
              <CallQaPanel recordingId={rec.id} />
            </div>

            <div className="space-y-6">
              {callMetricsCard}

              {/* Drill into specific topics — jumps the transcript */}
              {analysis && analysis.topics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {c.topicsDiscussed}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <p className="text-muted-foreground text-xs">
                      {c.topicJumpHint}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.topics.map((topic) => (
                        <button
                          key={topic.label}
                          type="button"
                          onClick={() => jumpToTopic(topic.label)}
                          className="hover:border-primary/40 hover:bg-muted/40 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                        >
                          {topic.label}
                          <span className="text-muted-foreground tabular-nums">
                            {topic.pct}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis && analysis.coachingTips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="text-primary size-4" />
                      {c.coachingTips}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.coachingTips.map((tip) => (
                      <div
                        key={tip}
                        className="bg-primary/10 text-primary rounded px-3 py-2 text-sm font-medium"
                      >
                        {tip}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{c.rateThisAnalysis}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setRating(n)
                          toast.success(c.thanksFeedback)
                        }}
                        aria-label={c.rateStar(n)}
                      >
                        <Star
                          className={cn(
                            "size-6 transition-colors",
                            n <= rating
                              ? "fill-chart-4 text-chart-4"
                              : "text-muted-foreground/40"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      {c.wasHelpful}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant={helpful === true ? "default" : "outline"}
                        size="icon"
                        className="size-8"
                        aria-label={c.helpful}
                        onClick={() => {
                          setHelpful(true)
                          toast.success(c.gladHelped)
                        }}
                      >
                        <ThumbsUp className="size-4" />
                      </Button>
                      <Button
                        variant={helpful === false ? "default" : "outline"}
                        size="icon"
                        className="size-8"
                        aria-label={c.notHelpful}
                        onClick={() => {
                          setHelpful(false)
                          toast.info(c.willImprove)
                        }}
                      >
                        <ThumbsDown className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    {c.summary}
                    <InfoHint label={c.summaryHintLabel}>{c.summaryHint}</InfoHint>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{scorecard.headline}</p>
                  {rec.highlights.length > 0 && (
                    <ul className="space-y-1.5">
                      {rec.highlights.map((h) => (
                        <li
                          key={h}
                          className="text-muted-foreground flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="text-chart-1 mt-0.5 size-4 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">{actionItemsCard}</div>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">{c.transcript}</CardTitle>
              <div className="relative w-52 max-w-[55%]">
                <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
                <Input
                  value={transcriptQuery}
                  onChange={(e) => setTranscriptQuery(e.target.value)}
                  placeholder={c.searchTranscript}
                  className="h-8 pl-7 text-sm"
                  aria-label={c.searchTranscript}
                />
              </div>
            </CardHeader>
            <CardContent>
              {transcriptTurns.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {c.noTranscript}
                </p>
              ) : filteredTranscript.length === 0 ? (
                <EmptyState variant="plain" description={c.noTranscriptMatch} />
              ) : (
                <div className="space-y-3">
                  {filteredTranscript.map((turn) => (
                    <div
                      key={turn.id}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm",
                        turn.speaker === "rep"
                          ? "bg-muted"
                          : "border-primary border-l-2 pl-3"
                      )}
                    >
                      <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium">{turn.name}</span>
                        <span className="tabular-nums">{turn.time}</span>
                      </div>
                      <p>{turn.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">{participantsCard}</div>
            <div className="space-y-6">
              {analysis?.personality && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="text-muted-foreground size-4" />
                      {c.personalityRead}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge variant="secondary">{analysis.personality.disc}</Badge>
                    <p className="text-muted-foreground text-sm">
                      {analysis.personality.summary}
                    </p>
                  </CardContent>
                </Card>
              )}
              {analysis && analysis.objections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{c.objections}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {analysis.objections.map((objection) => (
                      <Badge key={objection} variant="outline" className="font-normal">
                        {objection}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="keyFields">
          {analysis?.keyFields ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["problem", c.fieldProblem, c.fieldProblemHint],
                  ["impact", c.fieldImpact, c.fieldImpactHint],
                  ["context", c.fieldContext, c.fieldContextHint],
                  ["people", c.fieldPeople, c.fieldPeopleHint],
                ] as const
              ).map(([key, label, hint]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <p className="text-muted-foreground text-xs">{hint}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.keyFields![key]}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-muted-foreground p-8 text-center text-sm">
              {c.noKeyFields}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="followUp">
          <FollowUpTab
            rec={rec}
            c={c}
            locale={locale}
            helpful={followUpHelpful}
            setHelpful={setFollowUpHelpful}
          />
        </TabsContent>
      </Tabs>
    </Page>
  )
}

function FollowUpTab({
  rec,
  c,
  locale,
  helpful,
  setHelpful,
}: {
  rec: CoachRecording
  c: Copy
  locale: Locale
  helpful: boolean | null
  setHelpful: (v: boolean | null) => void
}) {
  const templates = useFollowUpTemplates()
  // Radix unmounts inactive TabsContent, so this mounts fresh each time the
  // Follow-Up tab is selected — a plain initializer is enough, no dialog-style
  // open/close reset needed.
  const [subject, setSubject] = React.useState(() =>
    c.followUpDefaultSubject(rec.company)
  )
  const [body, setBody] = React.useState(() =>
    plainToHtml(buildFollowUpDraft(rec, locale))
  )
  const [generating, setGenerating] = React.useState(false)
  // "" = the AI draft; otherwise the id of the applied follow-up template.
  const [templateId, setTemplateId] = React.useState("")
  const [saveAsOpen, setSaveAsOpen] = React.useState(false)
  const [saveName, setSaveName] = React.useState("")

  const AI_DRAFT = "__ai_draft__"

  // Apply a saved template (or fall back to the AI draft), with the
  // recording's details merged into its {{variables}}.
  function applyTemplateChoice(v: string) {
    if (v === AI_DRAFT) {
      setTemplateId("")
      setSubject(c.followUpDefaultSubject(rec.company))
      setBody(plainToHtml(buildFollowUpDraft(rec, locale)))
      return
    }
    const tpl = templates.find((t) => t.id === v)
    if (!tpl) return
    setTemplateId(tpl.id)
    setSubject(mergeFollowUpVars(tpl.subject, rec))
    setBody(plainToHtml(mergeFollowUpVars(tpl.body, rec)))
  }

  function updateTemplate() {
    if (!templateId) return
    followUpTemplateStore.update(templateId, {
      subject,
      body: stripHtml(body),
    })
    toast.success(c.templateUpdated)
  }

  function deleteTemplate() {
    if (!templateId) return
    followUpTemplateStore.remove(templateId)
    setTemplateId("")
    toast.success(c.templateDeleted)
  }

  function saveAsTemplate() {
    const name = saveName.trim()
    if (!name) return
    const created = followUpTemplateStore.create({
      name,
      subject,
      body: stripHtml(body),
    })
    setTemplateId(created.id)
    setSaveAsOpen(false)
    setSaveName("")
    toast.success(c.templateCreated)
  }

  function generate() {
    setGenerating(true)
    setTimeout(() => {
      setBody(plainToHtml(buildFollowUpDraft(rec, locale)))
      setGenerating(false)
    }, 600)
  }

  const hasText = stripHtml(body).trim().length > 0

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {c.followUpTitle(rec.prospectName)}
            </CardTitle>
            <p className="text-muted-foreground text-sm">{rec.company}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>{c.templateLabel}</Label>
              <div className="flex items-center gap-1.5">
                <Select
                  value={templateId || AI_DRAFT}
                  onValueChange={applyTemplateChoice}
                >
                  <SelectTrigger className="min-w-0 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AI_DRAFT}>{c.aiDraftOption}</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {templateId && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={updateTemplate}
                      aria-label={c.updateTemplate}
                      title={c.updateTemplate}
                    >
                      <Save className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                      onClick={deleteTemplate}
                      aria-label={c.deleteTemplate}
                      title={c.deleteTemplate}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setSaveAsOpen((v) => !v)}
                >
                  <Plus className="size-4" />
                  {c.saveAsTemplate}
                </Button>
              </div>
              {saveAsOpen && (
                <div className="flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder={c.templateNamePlaceholder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        saveAsTemplate()
                      }
                    }}
                    className="h-8 flex-1"
                  />
                  <Button
                    variant="volt"
                    size="sm"
                    onClick={saveAsTemplate}
                    disabled={saveName.trim().length === 0}
                  >
                    {c.saveTemplateBtn}
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{c.followUpSubjectLabel}</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>{c.followUpBodyLabel}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generate}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {c.aiDraft}
                </Button>
              </div>
              <RichTextEditor
                value={body}
                onChange={setBody}
                minHeight="min-h-44"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="volt"
              className="w-full"
              disabled={!hasText}
              onClick={() => toast.success(c.followUpSent)}
            >
              <Send className="size-4" />
              {c.sendFollowUp}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.wasFollowUpHelpful}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              <Button
                variant={helpful === true ? "default" : "outline"}
                size="icon"
                className="size-8"
                aria-label={c.helpful}
                onClick={() => {
                  setHelpful(true)
                  toast.success(c.gladHelped)
                }}
              >
                <ThumbsUp className="size-4" />
              </Button>
              <Button
                variant={helpful === false ? "default" : "outline"}
                size="icon"
                className="size-8"
                aria-label={c.notHelpful}
                onClick={() => {
                  setHelpful(false)
                  toast.info(c.willImprove)
                }}
              >
                <ThumbsDown className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
