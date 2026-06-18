import { Phone, Mail, TrendingUp, BarChart3 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { TrendChart, ReplyRateChart } from "@/components/charts/Charts"
import { Funnel } from "@/components/charts/Funnel"
import { useView } from "@/lib/view-context"
import { getScopeData, leaderboard, MONTHS, WEEKS, team } from "@/lib/team"
import { initials, formatMoney as money } from "@/lib/format"
import { cn } from "@/lib/utils"

// Activity volume by channel (derived from team size for a believable mix).
const CHANNELS = [
  { key: "email" as const, label: "Email", icon: Mail, value: 1840, tone: "bg-chart-2" },
  { key: "linkedin" as const, label: "LinkedIn", icon: LinkedinIcon, value: 1120, tone: "bg-chart-1" },
  { key: "calls" as const, label: "Calls", icon: Phone, value: 430, tone: "bg-chart-4" },
]

const COPY = {
  en: {
    title: "Analytics",
    descriptionRep: (name: string) =>
      `Activity insights for ${name} · this quarter`,
    descriptionTeam: "Activity insights across your team · this quarter",
    introTitle: "Measure what's working",
    introDescription:
      "From first touch to closed revenue — see the funnel, conversion, and forecast in one place.",
    introPoints: [
      "Full-funnel conversion rates",
      "Channel & rep performance",
      "Weighted pipeline forecast",
    ],
    kpiActivities: "Activities logged",
    kpiMeetings: "Meetings booked",
    kpiReplyRate: "Reply rate",
    kpiPipeline: "Pipeline created",
    pipelineForecast: "Pipeline & forecast",
    pipelineForecastDesc: "Created pipeline vs. closed won, last 6 months",
    funnel: "Conversion funnel",
    funnelDesc: "Prospect → closed won",
    replyTrend: "Reply rate trend",
    replyTrendDesc: "Weekly, across outbound channels",
    activityByChannel: "Activity by channel",
    activityByChannelDesc: "Outreach volume mix",
    repPerformance: "Rep performance",
    repPerformanceDesc: "Breakdown by team member",
    rep: "Rep",
    prospects: "Prospects",
    replyRateCol: "Reply rate",
    meetings: "Meetings",
    pipeline: "Pipeline",
    attainment: "Attainment",
    illustrative: "Figures are illustrative prototype data.",
    channels: { email: "Email", linkedin: "LinkedIn", calls: "Calls" },
  },
  es: {
    title: "Analíticas",
    descriptionRep: (name: string) =>
      `Métricas de actividad de ${name} · este trimestre`,
    descriptionTeam:
      "Métricas de actividad de todo tu equipo · este trimestre",
    introTitle: "Mide lo que funciona",
    introDescription:
      "Desde el primer contacto hasta los ingresos cerrados: consulta el embudo, la conversión y la previsión en un solo lugar.",
    introPoints: [
      "Tasas de conversión de embudo completo",
      "Rendimiento por canal y por representante",
      "Previsión ponderada del pipeline",
    ],
    kpiActivities: "Actividades registradas",
    kpiMeetings: "Reuniones agendadas",
    kpiReplyRate: "Tasa de respuesta",
    kpiPipeline: "Pipeline generado",
    pipelineForecast: "Pipeline y previsión",
    pipelineForecastDesc:
      "Pipeline generado vs. negocios ganados, últimos 6 meses",
    funnel: "Embudo de conversión",
    funnelDesc: "Prospecto → ganado",
    replyTrend: "Tendencia de la tasa de respuesta",
    replyTrendDesc: "Semanal, en todos los canales de outbound",
    activityByChannel: "Actividad por canal",
    activityByChannelDesc: "Distribución del volumen de outreach",
    repPerformance: "Rendimiento por representante",
    repPerformanceDesc: "Desglose por miembro del equipo",
    rep: "Representante",
    prospects: "Prospectos",
    replyRateCol: "Tasa de respuesta",
    meetings: "Reuniones",
    pipeline: "Pipeline",
    attainment: "Cumplimiento",
    illustrative: "Las cifras son datos ilustrativos de prototipo.",
    channels: { email: "Email", linkedin: "LinkedIn", calls: "Llamadas" },
  },
} as const

export default function Analytics() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { impersonating, scope } = useView()
  const data = getScopeData(scope)
  const reps = leaderboard()

  const totalActivities = CHANNELS.reduce((a, c) => a + c.value, 0)
  const channelScale = impersonating ? 1 / team.length : 1

  const kpis = [
    {
      label: c.kpiActivities,
      value: Math.round(totalActivities * channelScale).toLocaleString(),
    },
    { label: c.kpiMeetings, value: String(data.kpis.meetings) },
    { label: c.kpiReplyRate, value: `${data.kpis.replyRate}%` },
    { label: c.kpiPipeline, value: money(data.kpis.pipeline) },
  ]

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={
          impersonating
            ? c.descriptionRep(impersonating.name)
            : c.descriptionTeam
        }
      />

      <FeatureIntro
        featureKey="analytics"
        icon={BarChart3}
        title={c.introTitle}
        description={c.introDescription}
        points={c.introPoints}
        className="mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader>
              <CardDescription>{k.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{k.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{c.pipelineForecast}</CardTitle>
            <CardDescription>{c.pipelineForecastDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <TrendChart
                labels={MONTHS}
                pipeline={data.monthlyPipeline}
                won={data.monthlyWon}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.funnel}</CardTitle>
            <CardDescription>{c.funnelDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Funnel data={data.funnel} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{c.replyTrend}</CardTitle>
            <CardDescription>{c.replyTrendDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ReplyRateChart labels={WEEKS} values={data.weeklyReplyRate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.activityByChannel}</CardTitle>
            <CardDescription>{c.activityByChannelDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon
              const value = Math.round(ch.value * channelScale)
              const pct = Math.round((ch.value / totalActivities) * 100)
              return (
                <div key={ch.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="text-muted-foreground size-4" />
                      {c.channels[ch.key]}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {value.toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <div className="bg-muted h-2.5 overflow-hidden rounded-full">
                    <div
                      className={cn("h-full rounded-full", ch.tone)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {!impersonating && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{c.repPerformance}</CardTitle>
            <CardDescription>{c.repPerformanceDesc}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6">{c.rep}</TableHead>
                  <TableHead className="text-right">{c.prospects}</TableHead>
                  <TableHead className="text-right">{c.replyRateCol}</TableHead>
                  <TableHead className="text-right">{c.meetings}</TableHead>
                  <TableHead className="text-right">{c.pipeline}</TableHead>
                  <TableHead className="pr-6 text-right">
                    {c.attainment}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reps.map((rep) => {
                  const attainment = Math.round(
                    (rep.metrics.won / rep.quota) * 100
                  )
                  return (
                    <TableRow key={rep.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback
                              style={{
                                backgroundColor: rep.avatarColor,
                                color: "white",
                              }}
                              className="text-xs"
                            >
                              {initials(
                                rep.name.split(" ")[0],
                                rep.name.split(" ")[1]
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{rep.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {rep.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rep.metrics.prospects}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rep.metrics.replyRate}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rep.metrics.meetings}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(rep.metrics.pipeline)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Badge
                          variant={attainment >= 60 ? "success" : "secondary"}
                          className="tabular-nums"
                        >
                          {attainment}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground mt-6 flex items-center gap-1.5 text-xs">
        <TrendingUp className="size-3.5" />
        {c.illustrative}
      </p>
    </Page>
  )
}
