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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  TrendChart,
  ReplyRateChart,
  AttainmentDoughnut,
} from "@/components/charts/Charts"
import { Funnel } from "@/components/charts/Funnel"
import { InfoHint } from "@/components/common/InfoHint"
import { ImpactBand } from "@/components/common/ImpactBand"
import { KaiSuggestion } from "@/components/kai/KaiSuggestion"
import { copilotActions } from "@/lib/mock-copilot"
import { useView } from "@/lib/view-context"
import { useSetup } from "@/lib/setup"
import {
  getViewData,
  leaderboard,
  MONTHS,
  WEEKS,
  type TeamMember,
} from "@/lib/team"
import { useAuth } from "@/lib/auth"
import { initials, formatMoney as money } from "@/lib/format"
import { cn } from "@/lib/utils"

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
  const { progress, dismissed, dismiss } = useSetup()
  if (dismissed || progress >= 100) return null
  return (
    <Card className="border-primary/30 bg-primary/5 mb-6">
      <CardContent className="flex flex-wrap items-center gap-4 pt-6">
        <span className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
          <Rocket className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Finish setting up your workspace</p>
          <p className="text-muted-foreground text-sm">
            Connect your tools, invite your team, and set your goals —{" "}
            {progress}% complete.
          </p>
          <Progress value={progress} className="mt-2 max-w-xs" />
        </div>
        <Button asChild>
          <Link to="/get-started">Continue setup</Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label="Dismiss setup banner"
        >
          <X className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { impersonating, impersonatingId, impersonate } = useView()
  const data = getViewData(impersonatingId)

  const kpis = [
    {
      label: "Open pipeline",
      value: money(data.kpis.pipeline),
      delta: data.deltas.pipeline,
      hint: "The total value of open deals you're working toward closing.",
    },
    {
      label: "Closed won (QTD)",
      value: money(data.kpis.won),
      delta: data.deltas.won,
      hint: "Revenue from deals you've won this quarter (quarter-to-date).",
    },
    {
      label: "Meetings booked",
      value: String(data.kpis.meetings),
      delta: data.deltas.meetings,
      hint: "Qualified sales meetings booked from your outreach.",
    },
    {
      label: "Reply rate",
      value: `${data.kpis.replyRate}%`,
      delta: data.deltas.replyRate,
      hint: "The share of contacted prospects who reply to your outreach.",
    },
  ]

  const title = impersonating
    ? `${impersonating.name.split(" ")[0]}'s performance`
    : `Welcome back, ${user?.name.split(" ")[0]}`
  const description = impersonating
    ? `${impersonating.role} · quota ${money(data.quota)} this quarter`
    : `Team pipeline and forecast · quota ${money(data.quota)} this quarter`

  return (
    <Page>
      <PageHeading
        title={title}
        description={description}
        action={
          <Button asChild>
            <Link to="/search">
              <Sparkles className="size-4" />
              Find prospects
            </Link>
          </Button>
        }
      />

      <SetupBanner />

      {!impersonating && copilotActions.length > 0 && (
        <KaiSuggestion
          className="mb-6"
          title={`Kai spotted ${copilotActions.length} signals worth acting on`}
          action={
            <Button asChild size="sm">
              <Link to="/copilot">Review in Copilot</Link>
            </Button>
          }
        >
          Replies, job changes, and intent signals across your accounts — each
          with a recommended next move.
        </KaiSuggestion>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                {stat.label}
                <InfoHint label={`What is ${stat.label}?`}>
                  {stat.hint}
                </InfoHint>
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Delta value={stat.delta} />
                <span className="text-muted-foreground text-xs">
                  vs. last quarter
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!impersonating && <ImpactBand className="mt-6" />}

      {/* Trend + funnel */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline &amp; forecast</CardTitle>
            <CardDescription>
              Created pipeline vs. closed won over the last 6 months
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

      {/* Reply rate + attainment */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reply rate trend</CardTitle>
            <CardDescription>Across outbound channels, weekly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ReplyRateChart labels={WEEKS} values={data.weeklyReplyRate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quota attainment</CardTitle>
            <CardDescription>Closed won vs. quota</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <AttainmentDoughnut won={data.kpis.won} quota={data.quota} />
            </div>
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              <span>{money(data.kpis.won)} won</span>
              <span>{money(data.quota)} quota</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard (team view) or rep callout (impersonating) */}
      <div className="mt-6">
        {impersonating ? (
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 pt-6">
              <Eye className="text-primary size-5" />
              <p className="text-sm">
                You're viewing{" "}
                <span className="font-medium">{impersonating.name}</span>'s
                workspace. Search, lists, and inbox are scoped to their
                prospects.
              </p>
              <Button variant="outline" size="sm" asChild className="ml-auto">
                <Link to="/search">Open their prospects</Link>
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
  const reps = leaderboard()
  const topPipeline = Math.max(...reps.map((r) => r.metrics.pipeline))

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-chart-4 size-4" />
            Team leaderboard
          </CardTitle>
          <CardDescription>
            Ranked by quota attainment · click a rep to view their workspace
          </CardDescription>
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
          <span>pipeline</span>
        </div>
        <Progress value={(rep.metrics.pipeline / topPipeline) * 100} />
      </div>
      <div className="hidden w-16 text-right text-sm font-medium tabular-nums md:block">
        {rep.metrics.meetings}
        <span className="text-muted-foreground block text-xs font-normal">
          meetings
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
