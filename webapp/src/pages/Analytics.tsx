import { Phone, Mail, TrendingUp } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
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
import { getViewData, leaderboard, MONTHS, WEEKS, team } from "@/lib/team"
import { initials, formatMoney as money } from "@/lib/format"
import { cn } from "@/lib/utils"

// Activity volume by channel (derived from team size for a believable mix).
const CHANNELS = [
  { label: "Email", icon: Mail, value: 1840, tone: "bg-chart-2" },
  { label: "LinkedIn", icon: LinkedinIcon, value: 1120, tone: "bg-chart-1" },
  { label: "Calls", icon: Phone, value: 430, tone: "bg-chart-4" },
]

export default function Analytics() {
  const { impersonating, impersonatingId } = useView()
  const data = getViewData(impersonatingId)
  const reps = leaderboard()

  const totalActivities = CHANNELS.reduce((a, c) => a + c.value, 0)
  const channelScale = impersonating ? 1 / team.length : 1

  const kpis = [
    {
      label: "Activities logged",
      value: Math.round(totalActivities * channelScale).toLocaleString(),
    },
    { label: "Meetings booked", value: String(data.kpis.meetings) },
    { label: "Reply rate", value: `${data.kpis.replyRate}%` },
    { label: "Pipeline created", value: money(data.kpis.pipeline) },
  ]

  return (
    <Page>
      <PageHeading
        title="Analytics"
        description={
          impersonating
            ? `Activity insights for ${impersonating.name} · this quarter`
            : "Activity insights across your team · this quarter"
        }
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
            <CardTitle>Pipeline &amp; forecast</CardTitle>
            <CardDescription>
              Created pipeline vs. closed won, last 6 months
            </CardDescription>
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
            <CardTitle>Conversion funnel</CardTitle>
            <CardDescription>Prospect → closed won</CardDescription>
          </CardHeader>
          <CardContent>
            <Funnel data={data.funnel} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reply rate trend</CardTitle>
            <CardDescription>Weekly, across outbound channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ReplyRateChart labels={WEEKS} values={data.weeklyReplyRate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity by channel</CardTitle>
            <CardDescription>Outreach volume mix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CHANNELS.map((c) => {
              const Icon = c.icon
              const value = Math.round(c.value * channelScale)
              const pct = Math.round((c.value / totalActivities) * 100)
              return (
                <div key={c.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="text-muted-foreground size-4" />
                      {c.label}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {value.toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <div className="bg-muted h-2.5 overflow-hidden rounded-full">
                    <div
                      className={cn("h-full rounded-full", c.tone)}
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
            <CardTitle>Rep performance</CardTitle>
            <CardDescription>Breakdown by team member</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6">Rep</TableHead>
                  <TableHead className="text-right">Prospects</TableHead>
                  <TableHead className="text-right">Reply rate</TableHead>
                  <TableHead className="text-right">Meetings</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                  <TableHead className="pr-6 text-right">Attainment</TableHead>
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
        Figures are illustrative prototype data.
      </p>
    </Page>
  )
}
