import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Play,
  TrendingUp,
  TrendingDown,
  Clock,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  ThumbsUp,
  Target,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { coachRecordings } from "@/lib/mock-data"
import { getScorecard } from "@/lib/mock-coaching"
import {
  coachLeaderboard,
  coachTeamAvg,
  type CoachSkill,
} from "@/lib/mock-coach-team"
import { formatDate } from "@/lib/format"
import { downloadCsv } from "@/lib/csv"
import { cn } from "@/lib/utils"
import type { CoachRecording } from "@/lib/types"

const SENTIMENT = {
  positive: { icon: Smile, className: "text-chart-1" },
  neutral: { icon: Meh, className: "text-chart-4" },
  negative: { icon: Frown, className: "text-destructive" },
}

const PAGE_SIZE = 10

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
    tabEfficiency: "Efficiency",
    tabPerformance: "Performance",
    tabTeam: "Team",
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
    perfStrengths: "Where you're strong",
    perfGaps: "Where to improve",
    perfRanked: "Calls by score",
    perfNoStrong: "Run more calls to surface consistent strengths.",
    perfNoWeak: "No recurring weak spots — nice work.",
    teamTitle: "Team performance",
    teamAvgScore: "Team avg score",
    teamCalls: "Calls analyzed",
    teamAvgTalk: "Avg talk ratio",
    colRep: "Rep",
    colAvgScore: "Avg score",
    colCalls: "Calls",
    colTalk: "Talk ratio",
    colTrend: "Trend",
    colStrength: "Strength",
    colGap: "Gap",
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
    filters: "Filters",
    filterDialogTitle: "Filter calls",
    filterDialogDescription: "Narrow the list to calls in a specific date range.",
    dateFrom: "From",
    dateTo: "To",
    clearAll: "Clear all",
    cancel: "Cancel",
    apply: "Apply",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`,
    skill: {
      rapport: "Rapport",
      discovery: "Discovery",
      nextSteps: "Next steps",
      talkRatio: "Talk ratio",
      objections: "Objection handling",
      qualification: "Qualification",
      valueFraming: "Value framing",
    } as Record<CoachSkill, string>,
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
    tabEfficiency: "Eficiencia",
    tabPerformance: "Rendimiento",
    tabTeam: "Equipo",
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
    perfStrengths: "Dónde destacas",
    perfGaps: "Dónde mejorar",
    perfRanked: "Llamadas por puntuación",
    perfNoStrong: "Analiza más llamadas para revelar fortalezas constantes.",
    perfNoWeak: "Sin puntos débiles recurrentes — buen trabajo.",
    teamTitle: "Rendimiento del equipo",
    teamAvgScore: "Puntuación media del equipo",
    teamCalls: "Llamadas analizadas",
    teamAvgTalk: "Ratio de conversación medio",
    colRep: "Representante",
    colAvgScore: "Puntuación media",
    colCalls: "Llamadas",
    colTalk: "Ratio",
    colTrend: "Tendencia",
    colStrength: "Fortaleza",
    colGap: "Brecha",
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
    filters: "Filtros",
    filterDialogTitle: "Filtrar llamadas",
    filterDialogDescription: "Reduce la lista a llamadas en un rango de fechas específico.",
    dateFrom: "Desde",
    dateTo: "Hasta",
    clearAll: "Limpiar todo",
    cancel: "Cancelar",
    apply: "Aplicar",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} de ${total.toLocaleString()}`,
    skill: {
      rapport: "Rapport",
      discovery: "Descubrimiento",
      nextSteps: "Próximos pasos",
      talkRatio: "Ratio de conversación",
      objections: "Manejo de objeciones",
      qualification: "Cualificación",
      valueFraming: "Propuesta de valor",
    } as Record<CoachSkill, string>,
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
const avgTalkRatio = Math.round(
  coachRecordings.reduce((s, r) => s + r.talkRatio, 0) / coachRecordings.length
)

// Cross-call strengths & gaps: the strong/weak graded sections across all calls.
const strongSections = coachRecordings
  .flatMap((r) =>
    getScorecard(r.id)
      .sections.filter((s) => s.grade === "strong")
      .map((s) => ({ id: r.id, call: r.title, label: s.label, score: s.score }))
  )
  .sort((a, b) => b.score - a.score)
const weakSections = coachRecordings
  .flatMap((r) =>
    getScorecard(r.id)
      .sections.filter((s) => s.grade === "weak")
      .map((s) => ({ id: r.id, call: r.title, label: s.label, score: s.score }))
  )
  .sort((a, b) => a.score - b.score)
const rankedCalls = [...coachRecordings].sort((a, b) => b.score - a.score)

export default function Coach() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [view, setView] = React.useState<CollectionView>("table")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("recent")
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(0)
  const filtersActive = Boolean(dateFrom || dateTo)

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = coachRecordings.filter((r) => {
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.prospectName.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q)
      const day = r.date.slice(0, 10)
      const matchesFrom = !dateFrom || day >= dateFrom
      const matchesTo = !dateTo || day <= dateTo
      return matchesQuery && matchesFrom && matchesTo
    })
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
  }, [query, sort, dateFrom, dateTo])

  // Reset to the first page whenever the filtered/sorted result set changes.
  const resultSig = `${query}|${sort}|${dateFrom}|${dateTo}`
  const [pageSig, setPageSig] = React.useState(resultSig)
  if (resultSig !== pageSig) {
    setPageSig(resultSig)
    setPage(0)
  }
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * PAGE_SIZE
  const pageEnd = Math.min(pageStart + PAGE_SIZE, visible.length)
  const paged = visible.slice(pageStart, pageEnd)

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
            <CardTitle className="text-2xl">{avgTalkRatio}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="efficiency">
        <TabsList className="mb-6">
          <TabsTrigger value="efficiency">{c.tabEfficiency}</TabsTrigger>
          <TabsTrigger value="performance">{c.tabPerformance}</TabsTrigger>
          <TabsTrigger value="team">{c.tabTeam}</TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency">
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
          >
            <Button
              variant="outline"
              className={cn(
                "shrink-0",
                filtersActive && "border-primary bg-primary/10 text-primary"
              )}
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">{c.filters}</span>
            </Button>
          </CollectionToolbar>

          {visible.length === 0 ? (
            <Card className="text-muted-foreground p-8 text-center text-sm">
              {c.noResults}
            </Card>
          ) : (
            <>
              {view === "table" ? (
                <RecordingTable rows={paged} c={c} />
              ) : (
                <div className="space-y-4">
                  {paged.map((rec) => (
                    <RecordingCard key={rec.id} rec={rec} />
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center justify-end gap-1">
                <span className="text-muted-foreground px-1 text-xs tabular-nums">
                  {c.pageRange(pageStart + 1, pageEnd, visible.length)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={safePage === 0}
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab c={c} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab c={c} />
        </TabsContent>
      </Tabs>

      <CoachFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onApply={(next) => {
          setDateFrom(next.dateFrom)
          setDateTo(next.dateTo)
        }}
      />
    </Page>
  )
}

function CoachFilterDialog({
  open,
  onOpenChange,
  dateFrom,
  dateTo,
  onApply,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  dateFrom: string
  dateTo: string
  onApply: (next: { dateFrom: string; dateTo: string }) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const [from, setFrom] = React.useState(dateFrom)
  const [to, setTo] = React.useState(dateTo)

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setFrom(dateFrom)
      setTo(dateTo)
    }
  }

  function handleApply() {
    onApply({ dateFrom: from, dateTo: to })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <SlidersHorizontal className="size-4" />
            </span>
            {c.filterDialogTitle}
          </DialogTitle>
          <DialogDescription>{c.filterDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="coach-filter-from">{c.dateFrom}</Label>
            <Input
              id="coach-filter-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coach-filter-to">{c.dateTo}</Label>
            <Input
              id="coach-filter-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            disabled={!from && !to}
            onClick={() => {
              setFrom("")
              setTo("")
            }}
          >
            {c.clearAll}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={handleApply}>
              {c.apply}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PerformanceTab({ c }: { c: Copy }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ThumbsUp className="text-chart-1 size-4" />
              {c.perfStrengths}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {strongSections.length === 0 ? (
              <p className="text-muted-foreground text-sm">{c.perfNoStrong}</p>
            ) : (
              strongSections.slice(0, 4).map((s) => (
                <Link
                  key={`${s.id}-${s.label}`}
                  to={`/coach/${s.id}`}
                  className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground"> · {s.call}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(s.score)
                    )}
                  >
                    {s.score}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="text-destructive size-4" />
              {c.perfGaps}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakSections.length === 0 ? (
              <p className="text-muted-foreground text-sm">{c.perfNoWeak}</p>
            ) : (
              weakSections.slice(0, 4).map((s) => (
                <Link
                  key={`${s.id}-${s.label}`}
                  to={`/coach/${s.id}`}
                  className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground"> · {s.call}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(s.score)
                    )}
                  >
                    {s.score}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.perfRanked}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rankedCalls.map((r) => (
            <Link
              key={r.id}
              to={`/coach/${r.id}`}
              className="hover:bg-muted/50 -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5"
            >
              <span
                className={cn(
                  "w-10 shrink-0 rounded-md px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums",
                  scorePillClass(r.score)
                )}
              >
                {r.score}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-sm font-medium">{r.title}</span>
                <span className="text-muted-foreground text-sm">
                  {" "}
                  · {r.prospectName}
                </span>
              </span>
              <Progress value={r.score} className="hidden w-40 sm:block" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function TeamTab({ c }: { c: Copy }) {
  const rows = coachLeaderboard()
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{c.teamAvgScore}</CardDescription>
            <CardTitle className="text-2xl">{coachTeamAvg.score}/100</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.teamCalls}</CardDescription>
            <CardTitle className="text-2xl">{coachTeamAvg.calls}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.teamAvgTalk}</CardDescription>
            <CardTitle className="text-2xl">{coachTeamAvg.talkRatio}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{c.colRep}</TableHead>
              <TableHead className="text-right">{c.colAvgScore}</TableHead>
              <TableHead className="text-right">{c.colCalls}</TableHead>
              <TableHead className="text-right">{c.colTalk}</TableHead>
              <TableHead className="text-right">{c.colTrend}</TableHead>
              <TableHead className="hidden md:table-cell">
                {c.colStrength}
              </TableHead>
              <TableHead className="hidden md:table-cell">{c.colGap}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.repId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: m.avatarColor }}
                    >
                      {m.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {m.role}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(m.avgScore)
                    )}
                  >
                    {m.avgScore}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.callsAnalyzed}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.avgTalkRatio}%
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                      m.trend >= 0 ? "text-chart-1" : "text-destructive"
                    )}
                  >
                    {m.trend >= 0 ? (
                      <TrendingUp className="size-3.5" />
                    ) : (
                      <TrendingDown className="size-3.5" />
                    )}
                    {m.trend >= 0 ? "+" : ""}
                    {m.trend}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary" className="font-normal">
                    {c.skill[m.topStrength]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="font-normal">
                    {c.skill[m.topGap]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
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
            <span
              className="text-primary inline-flex items-center"
              title={c.aiGenerated}
              aria-label={c.aiGenerated}
            >
              <Sparkles className="size-4" />
            </span>
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
