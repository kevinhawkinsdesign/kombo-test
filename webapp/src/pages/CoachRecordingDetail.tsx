import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
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
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { InfoHint } from "@/components/common/InfoHint"
import { Page } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CallScorecard } from "@/components/coach/CoachScorecard"
import { coachRecordings } from "@/lib/mock-data"
import { getScorecard } from "@/lib/mock-coaching"
import { recordingDetails } from "@/lib/mock-depth"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { KeyMoment } from "@/lib/types"

const SENTIMENT = {
  positive: { icon: Smile, variant: "success" as const },
  neutral: { icon: Meh, variant: "secondary" as const },
  negative: { icon: Frown, variant: "destructive" as const },
}

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
    backToCoach: "Back to Coach",
    coach: "Coach",
    callScore: "Call score",
    reanalyzing: "Re-analyzing recording…",
    reanalyze: "Re-analyze",
    notesAdded: "Notes added to CRM",
    addNotesToCrm: "Add notes to CRM",
    pause: "Pause",
    play: "Play",
    transcript: "Transcript",
    keyMoments: "Key moments",
    participants: "Participants",
    noTranscript: "No transcript available for this recording.",
    noKeyMoments: "No key moments captured.",
    noParticipants: "No participant data.",
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
    actionItems: "Action items",
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
    backToCoach: "Volver al Coach",
    coach: "Coach",
    callScore: "Puntuación",
    reanalyzing: "Reanalizando la grabación…",
    reanalyze: "Reanalizar",
    notesAdded: "Notas añadidas al CRM",
    addNotesToCrm: "Añadir notas al CRM",
    pause: "Pausar",
    play: "Reproducir",
    transcript: "Transcripción",
    keyMoments: "Momentos clave",
    participants: "Participantes",
    noTranscript: "No hay transcripción disponible para esta grabación.",
    noKeyMoments: "No se capturaron momentos clave.",
    noParticipants: "Sin datos de participantes.",
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
    actionItems: "Tareas pendientes",
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

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

export default function CoachRecordingDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const rec = coachRecordings.find((r) => r.id === id)
  const analysis = id ? recordingDetails[id] : undefined

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [doneItems, setDoneItems] = React.useState<Record<number, boolean>>({})
  const [rating, setRating] = React.useState(0)
  const [helpful, setHelpful] = React.useState<boolean | null>(null)

  if (!rec) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.recordingNotFound}</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/coach">{c.backToCoach}</Link>
        </Button>
      </Page>
    )
  }

  const sentiment = SENTIMENT[rec.sentiment]
  const SentimentIcon = sentiment.icon
  const repRatio = rec.talkRatio
  const prospectRatio = 100 - rec.talkRatio

  const toggleDone = (index: number, label: string) => {
    setDoneItems((prev) => {
      const next = { ...prev, [index]: !prev[index] }
      if (next[index]) toast.success(c.completed(label))
      return next
    })
  }

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/coach">
          <ArrowLeft className="size-4" />
          {c.coach}
        </Link>
      </Button>

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
            <Button
              variant="outline"
              onClick={() => toast.info(c.reanalyzing)}
            >
              <RefreshCw className="size-4" />
              {c.reanalyze}
            </Button>
            <Button
              variant="volt"
              onClick={() => toast.success(c.notesAdded)}
            >
              <Building2 className="size-4" />
              {c.addNotesToCrm}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            className="size-10 shrink-0 rounded-full"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? c.pause : c.play}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
          <div className="flex flex-1 items-center gap-3">
            <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: "30%" }}
              />
            </div>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              12:45 / {rec.durationMin}:00
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CallScorecard scorecard={getScorecard(rec.id)} />

          <Card>
            <CardContent>
              <Tabs defaultValue="transcript">
                <TabsList className="mb-4 max-w-full overflow-x-auto">
                  <TabsTrigger value="transcript">{c.transcript}</TabsTrigger>
                  <TabsTrigger value="moments">{c.keyMoments}</TabsTrigger>
                  <TabsTrigger value="participants">
                    {c.participants}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transcript">
                  {analysis && analysis.transcript.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.transcript.map((turn) => (
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
                  ) : (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      {c.noTranscript}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="moments">
                  {analysis && analysis.keyMoments.length > 0 ? (
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
                  ) : (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      {c.noKeyMoments}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="participants">
                  {analysis?.participants && analysis.participants.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.participants.map((p) => (
                        <div key={p.name}>
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="text-muted-foreground size-4" />
                              <span className="text-sm font-medium">
                                {p.name}
                              </span>
                              <Badge
                                variant={
                                  p.role === "rep" ? "default" : "secondary"
                                }
                                className="capitalize"
                              >
                                {p.role === "rep" ? c.you : c.prospect}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground text-sm tabular-nums">
                              {p.talkPct}% {c.talkTime}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-1.5 text-xs">
                            {p.title}
                          </p>
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
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      {c.noParticipants}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
                    <InfoHint label={c.talkRatioHintLabel}>
                      {c.talkRatioHint}
                    </InfoHint>
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

          {analysis && analysis.topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{c.topicsDiscussed}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {analysis.topics.map((topic) => (
                  <div key={topic.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {topic.label}
                      </span>
                      <span className="font-medium tabular-nums">
                        {topic.pct}%
                      </span>
                    </div>
                    <div className="bg-muted h-2.5 overflow-hidden rounded-md">
                      <div
                        className="bg-primary h-full rounded-md transition-all"
                        style={{ width: `${topic.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
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
                  <Badge
                    key={objection}
                    variant="outline"
                    className="font-normal"
                  >
                    {objection}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis && analysis.actionItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{c.actionItems}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.actionItems.map((item, i) => {
                  const done = doneItems[i] ?? false
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

          {analysis?.personality && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="text-primary size-4" />
                  {c.personalityRead}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary">{analysis.personality.disc}</Badge>
                <p className="text-muted-foreground text-sm">
                  {analysis.personality.summary}
                </p>
                <Separator />
                <ul className="space-y-1.5">
                  {analysis.personality.tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                      {tip}
                    </li>
                  ))}
                </ul>
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
    </Page>
  )
}
