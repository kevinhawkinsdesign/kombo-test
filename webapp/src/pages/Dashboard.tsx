import { Link } from "react-router-dom"
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trophy,
  Eye,
  Rocket,
  X,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { InfoHint } from "@/components/common/InfoHint"
import { DailyRecommendations } from "@/components/dashboard/DailyRecommendations"
import { TodayPanel } from "@/components/dashboard/TodayPanel"
import { KaiSuggestion } from "@/components/kai/KaiSuggestion"
import { copilotActions } from "@/lib/mock-copilot"
import { useView } from "@/lib/view-context"
import { useSetup } from "@/lib/setup"
import { getScopeData, leaderboard, type TeamMember } from "@/lib/team"
import { useAuth } from "@/lib/auth"
import { portraitFor } from "@/lib/avatars"
import { initials, formatMoney as money } from "@/lib/format"
import { cn } from "@/lib/utils"

const COPY = {
  en: {
    setupTitle: "Finish setting up your workspace",
    setupBody: (progress: number) =>
      `Connect your tools, invite your team, and set your goals — ${progress}% complete.`,
    continueSetup: "Continue setup",
    dismissSetup: "Dismiss setup banner",
    kpiPipeline: "Open pipeline",
    kpiPipelineHint:
      "The total value of open deals you're working toward closing.",
    kpiWon: "Closed won (QTD)",
    kpiWonHint:
      "Revenue from deals you've won this quarter (quarter-to-date).",
    kpiMeetings: "Meetings booked",
    kpiMeetingsHint: "Qualified sales meetings booked from your outreach.",
    kpiReplyRate: "Reply rate",
    kpiReplyRateHint:
      "The share of contacted prospects who reply to your outreach.",
    perfTitle: (name: string) => `${name}'s performance`,
    welcome: (name: string) => `Welcome back, ${name}`,
    perfDescription: (role: string, quota: string) =>
      `${role} · quota ${quota} this quarter`,
    teamDescription: (quota: string) =>
      `Team pipeline and forecast · quota ${quota} this quarter`,
    findProspects: "Find prospects",
    kaiTitle: (count: number) =>
      `Kai spotted ${count} signals worth acting on`,
    reviewInCopilot: "Review signals",
    kaiBody:
      "Replies, job changes, and intent signals across your accounts — each with a recommended next move.",
    whatIs: (label: string) => `What is ${label}?`,
    vsLastQuarter: "vs. last quarter",
    pipelineForecast: "Pipeline & forecast",
    pipelineForecastDesc:
      "Created pipeline vs. closed won over the last 6 months",
    conversionFunnel: "Conversion funnel",
    funnelDesc: "Prospect → closed won",
    replyRateTrend: "Reply rate trend",
    replyRateTrendDesc: "Across outbound channels, weekly",
    quotaAttainment: "Quota attainment",
    quotaAttainmentDesc: "Closed won vs. quota",
    won: "won",
    quota: "quota",
    viewingBefore: "You're viewing ",
    viewingAfter:
      "'s workspace. Search, lists, and inbox are scoped to their prospects.",
    openTheirProspects: "Open their prospects",
    teamLeaderboard: "Team leaderboard",
    leaderboardDesc: "Ranked by quota attainment · click a rep to view their workspace",
    pipeline: "pipeline",
    meetings: "meetings",
  },
  es: {
    setupTitle: "Termina de configurar tu espacio de trabajo",
    setupBody: (progress: number) =>
      `Conecta tus herramientas, invita a tu equipo y define tus objetivos — ${progress}% completado.`,
    continueSetup: "Continuar configuración",
    dismissSetup: "Descartar el aviso de configuración",
    kpiPipeline: "Pipeline abierto",
    kpiPipelineHint:
      "El valor total de los negocios abiertos que estás trabajando para cerrar.",
    kpiWon: "Cerrados ganados (THF)",
    kpiWonHint:
      "Ingresos de los negocios que has ganado este trimestre (trimestre hasta la fecha).",
    kpiMeetings: "Reuniones agendadas",
    kpiMeetingsHint:
      "Reuniones de venta cualificadas agendadas a partir de tu contacto.",
    kpiReplyRate: "Tasa de respuesta",
    kpiReplyRateHint:
      "La proporción de prospectos contactados que responden a tu contacto.",
    perfTitle: (name: string) => `Rendimiento de ${name}`,
    welcome: (name: string) => `Bienvenido de nuevo, ${name}`,
    perfDescription: (role: string, quota: string) =>
      `${role} · cuota ${quota} este trimestre`,
    teamDescription: (quota: string) =>
      `Pipeline y previsión del equipo · cuota ${quota} este trimestre`,
    findProspects: "Buscar prospectos",
    kaiTitle: (count: number) =>
      `Kai detectó ${count} señales que vale la pena atender`,
    reviewInCopilot: "Revisar señales",
    kaiBody:
      "Respuestas, cambios de empleo y señales de intención en tus cuentas — cada una con el siguiente paso recomendado.",
    whatIs: (label: string) => `¿Qué es ${label}?`,
    vsLastQuarter: "vs. trimestre anterior",
    pipelineForecast: "Pipeline y previsión",
    pipelineForecastDesc:
      "Pipeline creado vs. cerrados ganados en los últimos 6 meses",
    conversionFunnel: "Embudo de conversión",
    funnelDesc: "Prospecto → cerrado ganado",
    replyRateTrend: "Tendencia de la tasa de respuesta",
    replyRateTrendDesc: "Por canales de salida, semanal",
    quotaAttainment: "Cumplimiento de cuota",
    quotaAttainmentDesc: "Cerrados ganados vs. cuota",
    won: "ganados",
    quota: "cuota",
    viewingBefore: "Estás viendo el espacio de trabajo de ",
    viewingAfter:
      ". La búsqueda, las listas y la bandeja de entrada se limitan a sus prospectos.",
    openTheirProspects: "Abrir sus prospectos",
    teamLeaderboard: "Clasificación del equipo",
    leaderboardDesc:
      "Ordenado por cumplimiento de cuota · haz clic en un representante para ver su espacio de trabajo",
    pipeline: "pipeline",
    meetings: "reuniones",
  },
} as const

function Delta({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        positive ? "text-chart-1" : "text-destructive"
      )}
    >
      {positive ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {Math.abs(value)}%
    </span>
  )
}

function SetupBanner() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { progress, dismissed, dismiss } = useSetup()
  if (dismissed || progress >= 100) return null
  return (
    <Card className="border-primary/30 bg-primary/5 mb-6">
      <CardContent className="flex flex-wrap items-center gap-4">
        <span className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
          <Rocket className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{c.setupTitle}</p>
          <p className="text-muted-foreground text-sm">{c.setupBody(progress)}</p>
          <Progress value={progress} className="mt-2 max-w-xs" />
        </div>
        <Button asChild>
          <Link to="/get-started">{c.continueSetup}</Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label={c.dismissSetup}
        >
          <X className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { user } = useAuth()
  const { impersonating, viewTeam, scope, impersonate } = useView()
  const data = getScopeData(scope)

  const kpis = [
    {
      label: c.kpiPipeline,
      value: money(data.kpis.pipeline),
      delta: data.deltas.pipeline,
      hint: c.kpiPipelineHint,
    },
    {
      label: c.kpiWon,
      value: money(data.kpis.won),
      delta: data.deltas.won,
      hint: c.kpiWonHint,
    },
    {
      label: c.kpiMeetings,
      value: String(data.kpis.meetings),
      delta: data.deltas.meetings,
      hint: c.kpiMeetingsHint,
    },
    {
      label: c.kpiReplyRate,
      value: `${data.kpis.replyRate}%`,
      delta: data.deltas.replyRate,
      hint: c.kpiReplyRateHint,
    },
  ]

  const title = impersonating
    ? c.perfTitle(impersonating.name.split(" ")[0])
    : viewTeam
      ? viewTeam.name
      : c.welcome(user?.name.split(" ")[0] ?? "")
  const description =
    impersonating && data.scope === "rep"
      ? c.perfDescription(impersonating.role, money(data.quota))
      : c.teamDescription(money(data.quota))

  return (
    <Page>
      <PageHeading
        title={title}
        description={description}
        action={
          <Button variant="volt" asChild>
            <Link to="/search">
              <Sparkles className="size-4" />
              {c.findProspects}
            </Link>
          </Button>
        }
      />

      <SetupBanner />

      {!impersonating && copilotActions.length > 0 && (
        <KaiSuggestion
          className="mb-6"
          dismissKey="dashboard-copilot"
          title={c.kaiTitle(copilotActions.length)}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/copilot">{c.reviewInCopilot}</Link>
            </Button>
          }
        >
          {c.kaiBody}
        </KaiSuggestion>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                {stat.label}
                <InfoHint label={c.whatIs(stat.label)}>{stat.hint}</InfoHint>
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Delta value={stat.delta} />
                <span className="text-muted-foreground text-xs">
                  {c.vsLastQuarter}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TodayPanel className="mt-6" />

      {!impersonating && !viewTeam && <DailyRecommendations />}

      {/* Leaderboard (team view) or rep callout (impersonating) */}
      <div className="mt-6">
        {impersonating ? (
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Eye className="text-primary size-5" />
              <p className="text-sm">
                {c.viewingBefore}
                <span className="font-medium">{impersonating.name}</span>
                {c.viewingAfter}
              </p>
              <Button variant="outline" size="sm" asChild className="ml-auto">
                <Link to="/search">{c.openTheirProspects}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Leaderboard onImpersonate={impersonate} />
        )}
      </div>
    </Page>
  )
}

function Leaderboard({
  onImpersonate,
}: {
  onImpersonate: (id: string) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const reps = leaderboard()
  const topPipeline = Math.max(...reps.map((r) => r.metrics.pipeline))

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-chart-4 size-4" />
            {c.teamLeaderboard}
          </CardTitle>
          <CardDescription>{c.leaderboardDesc}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {reps.map((rep, i) => (
          <LeaderboardRow
            key={rep.id}
            rep={rep}
            rank={i + 1}
            topPipeline={topPipeline}
            onImpersonate={onImpersonate}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function LeaderboardRow({
  rep,
  rank,
  topPipeline,
  onImpersonate,
}: {
  rep: TeamMember
  rank: number
  topPipeline: number
  onImpersonate: (id: string) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const attainment = Math.round((rep.metrics.won / rep.quota) * 100)
  return (
    <button
      onClick={() => onImpersonate(rep.id)}
      className="hover:bg-muted/60 -mx-2 flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-left transition-colors"
    >
      <span className="text-muted-foreground w-4 text-sm font-medium tabular-nums">
        {rank}
      </span>
      <Avatar className="size-9">
        <AvatarImage src={portraitFor(rep.name)} alt="" />
        <AvatarFallback
          style={{ backgroundColor: rep.avatarColor, color: "white" }}
          className="text-xs"
        >
          {initials(rep.name.split(" ")[0], rep.name.split(" ")[1])}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-[1.2]">
        <p className="truncate text-sm font-medium">{rep.name}</p>
        <p className="text-muted-foreground truncate text-xs">{rep.role}</p>
      </div>
      <div className="hidden flex-1 sm:block">
        <div className="text-muted-foreground mb-1 flex justify-between text-xs">
          <span>{money(rep.metrics.pipeline)}</span>
          <span>{c.pipeline}</span>
        </div>
        <Progress value={(rep.metrics.pipeline / topPipeline) * 100} />
      </div>
      <div className="hidden w-16 text-right text-sm font-medium tabular-nums md:block">
        {rep.metrics.meetings}
        <span className="text-muted-foreground block text-xs font-normal">
          {c.meetings}
        </span>
      </div>
      <div className="w-16 text-right">
        <Badge
          variant={attainment >= 60 ? "success" : "secondary"}
          className="tabular-nums"
        >
          {attainment}%
        </Badge>
      </div>
    </button>
  )
}
