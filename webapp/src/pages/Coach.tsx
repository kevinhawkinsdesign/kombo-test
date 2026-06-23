import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { coachRecordings } from "@/lib/mock-data"
import { getScorecard } from "@/lib/mock-coaching"
import { formatDate } from "@/lib/format"
import { downloadCsv } from "@/lib/csv"
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
    search: "Search calls…",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Calls exported to CSV",
    noResults: "No calls match your search.",
    sortRecent: "Most recent",
    sortScore: "Highest score",
    sortDuration: "Longest",
    colTitle: "Call",
    colContact: "Prospect",
    colDate: "Date",
    colDuration: "Duration",
    colSentiment: "Sentiment",
    colScore: "Score",
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
    search: "Buscar llamadas…",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Llamadas exportadas a CSV",
    noResults: "Ninguna llamada coincide con tu búsqueda.",
    sortRecent: "Más recientes",
    sortScore: "Mayor puntuación",
    sortDuration: "Más largas",
    colTitle: "Llamada",
    colContact: "Prospecto",
    colDate: "Fecha",
    colDuration: "Duración",
    colSentiment: "Sentimiento",
    colScore: "Puntuación",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

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
  const [view, setView] = React.useState<CollectionView>("cards")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("recent")

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? coachRecordings.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.prospectName.toLowerCase().includes(q) ||
            r.company.toLowerCase().includes(q)
        )
      : coachRecordings
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "score":
          return b.score - a.score
        case "duration":
          return b.durationMin - a.durationMin
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    return sorted
  }, [query, sort])

  function exportCsv() {
    downloadCsv(
      "kombo-calls.csv",
      [c.colTitle, c.colContact, c.colDate, c.colDuration, c.colSentiment, c.colScore],
      visible.map((r) => [
        r.title,
        `${r.prospectName} (${r.company})`,
        formatDate(r.date),
        `${r.durationMin} min`,
        c.sentiment[r.sentiment],
        r.score,
      ])
    )
    toast.success(c.exported)
  }

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

      <CollectionToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={c.search}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "recent", label: c.sortRecent },
          { value: "score", label: c.sortScore },
          { value: "duration", label: c.sortDuration },
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
      ) : view === "table" ? (
        <RecordingTable rows={visible} c={c} />
      ) : (
        <div className="space-y-4">
          {visible.map((rec) => (
            <RecordingCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </Page>
  )
}

function RecordingTable({
  rows,
  c,
}: {
  rows: CoachRecording[]
  c: Copy
}) {
  const navigate = useNavigate()
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colTitle}</TableHead>
            <TableHead>{c.colContact}</TableHead>
            <TableHead>{c.colDate}</TableHead>
            <TableHead className="text-right">{c.colDuration}</TableHead>
            <TableHead>{c.colSentiment}</TableHead>
            <TableHead className="text-right">{c.colScore}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((rec) => {
            const sentiment = SENTIMENT[rec.sentiment]
            const SentimentIcon = sentiment.icon
            return (
              <TableRow
                key={rec.id}
                className="cursor-pointer"
                onClick={() => navigate(`/coach/${rec.id}`)}
              >
                <TableCell className="font-medium">{rec.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {rec.prospectName} · {rec.company}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatDate(rec.date)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {rec.durationMin} min
                </TableCell>
                <TableCell>
                  <span
                    className={`flex items-center gap-1 text-sm ${sentiment.className}`}
                  >
                    <SentimentIcon className="size-3.5" />
                    {c.sentiment[rec.sentiment]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(rec.score)
                    )}
                  >
                    {rec.score}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
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
