import { Link } from "react-router-dom"
import {
  Play,
  TrendingUp,
  Clock,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
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
import { Progress } from "@/components/ui/progress"
import { coachRecordings } from "@/lib/mock-data"
import { getScorecard } from "@/lib/mock-coaching"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CoachRecording } from "@/lib/types"

const SENTIMENT = {
  positive: { icon: Smile, className: "text-chart-1" },
  neutral: { icon: Meh, className: "text-chart-4" },
  negative: { icon: Frown, className: "text-destructive" },
}

const COPY = {
  en: {
    title: "Call Coach",
    description: "AI analysis of your sales calls with actionable feedback.",
    introTitle: "Coach every call",
    introDescription:
      "AI-analyzed call recordings surface talk ratio, topics, and the next best step.",
    introPoints: [
      "Automatic call transcription",
      "Talk-ratio & sentiment analysis",
      "Coaching scorecards you can share",
    ],
    avgScore: "Average call score",
    callsAnalyzed: "Calls analyzed",
    avgTalkRatio: "Avg. talk ratio",
    playRecording: "Play recording",
    talkRatioYou: "Talk ratio (you)",
    talkRatioHint: "Aim for 40–45% — let the prospect talk more.",
    highlights: "Highlights",
    recommendedNextSteps: "Recommended next steps",
    aiGenerated: "AI generated",
    viewFullAnalysis: "View full analysis",
    callScore: "Call score",
    sentiment: {
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
    },
  },
  es: {
    title: "Coach de llamadas",
    description:
      "Análisis con IA de tus llamadas de ventas con recomendaciones accionables.",
    introTitle: "Entrena cada llamada",
    introDescription:
      "Las grabaciones analizadas con IA revelan el ratio de conversación, los temas y el siguiente mejor paso.",
    introPoints: [
      "Transcripción automática de llamadas",
      "Análisis de ratio de conversación y sentimiento",
      "Informes de coaching que puedes compartir",
    ],
    avgScore: "Puntuación media de llamada",
    callsAnalyzed: "Llamadas analizadas",
    avgTalkRatio: "Ratio de conversación medio",
    playRecording: "Reproducir grabación",
    talkRatioYou: "Ratio de conversación (tú)",
    talkRatioHint: "Apunta al 40–45 %: deja que el prospecto hable más.",
    highlights: "Aspectos destacados",
    recommendedNextSteps: "Próximos pasos recomendados",
    aiGenerated: "Generado por IA",
    viewFullAnalysis: "Ver análisis completo",
    callScore: "Puntuación",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
    },
  },
} as const

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

const avgScore = Math.round(
  coachRecordings.reduce((s, r) => s + r.score, 0) / coachRecordings.length
)

export default function Coach() {
  const { locale } = useLocale()
  const c = COPY[locale]
  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />

      <FeatureIntro
        featureKey="coach"
        icon={GraduationCap}
        title={c.introTitle}
        description={c.introDescription}
        points={c.introPoints}
        className="mb-6"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{c.avgScore}</CardDescription>
            <CardTitle className="text-2xl">{avgScore}/100</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.callsAnalyzed}</CardDescription>
            <CardTitle className="text-2xl">{coachRecordings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.avgTalkRatio}</CardDescription>
            <CardTitle className="text-2xl">
              {Math.round(
                coachRecordings.reduce((s, r) => s + r.talkRatio, 0) /
                  coachRecordings.length
              )}
              %
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        {coachRecordings.map((rec) => (
          <RecordingCard key={rec.id} rec={rec} />
        ))}
      </div>
    </Page>
  )
}

function RecordingCard({ rec }: { rec: CoachRecording }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const sentiment = SENTIMENT[rec.sentiment]
  const SentimentIcon = sentiment.icon
  const scorecard = getScorecard(rec.id)
  const criticalNote =
    scorecard.headline ||
    scorecard.sections.find((s) => s.grade === "weak")?.critique
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            size="icon"
            variant="outline"
            className="size-10 shrink-0 rounded-full"
            asChild
          >
            <Link to={`/coach/${rec.id}`} aria-label={c.playRecording}>
              <Play className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <CardTitle className="text-base">
              <Link to={`/coach/${rec.id}`} className="hover:text-primary">
                {rec.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {rec.prospectName} · {rec.company}
            </CardDescription>
            <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
              <span>{formatDate(rec.date)}</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {rec.durationMin} min
              </span>
              <span className={`flex items-center gap-1 ${sentiment.className}`}>
                <SentimentIcon className="size-3.5" />
                {c.sentiment[rec.sentiment]}
              </span>
            </div>
            {criticalNote && (
              <p className="text-muted-foreground mt-2 text-sm">
                {criticalNote}
              </p>
            )}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
            scorePillClass(scorecard.overall)
          )}
          title={c.callScore}
        >
          <span className="bg-current size-1.5 rounded-full opacity-80" />
          {c.callScore} {scorecard.overall}
        </span>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              {c.talkRatioYou}
            </span>
            <span className="font-medium tabular-nums">{rec.talkRatio}%</span>
          </div>
          <Progress value={rec.talkRatio} />
          <p className="text-muted-foreground mt-1 text-xs">
            {c.talkRatioHint}
          </p>

          <p className="mt-4 mb-2 text-sm font-medium">{c.highlights}</p>
          <ul className="space-y-1.5">
            {rec.highlights.map((h) => (
              <li
                key={h}
                className="text-muted-foreground flex items-start gap-2 text-sm"
              >
                <span className="bg-muted-foreground/40 mt-1.5 size-1.5 shrink-0 rounded-full" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{c.recommendedNextSteps}</p>
          <div className="space-y-2">
            {rec.nextSteps.map((step) => (
              <div
                key={step}
                className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              >
                <CheckCircle2 className="text-primary size-4 shrink-0" />
                {step}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="secondary" className="font-normal">
              {c.aiGenerated}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/coach/${rec.id}`}>
                {c.viewFullAnalysis}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
