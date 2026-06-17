import { Link } from "react-router-dom"
import {
  ArrowUpRight,
  ArrowDownRight,
  MessageSquareReply,
  CalendarCheck,
  Sparkles,
  UserPlus,
  MailOpen,
  ChevronRight,
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
import { ProspectAvatar, ScoreBadge } from "@/components/common/ProspectBits"
import {
  dashboardStats,
  recentActivity,
  prospects,
  campaigns,
} from "@/lib/mock-data"
import { relativeTime } from "@/lib/format"
import type { ActivityItem } from "@/lib/types"
import { cn } from "@/lib/utils"

const ACTIVITY_ICON: Record<ActivityItem["type"], React.ComponentType<{ className?: string }>> =
  {
    reply: MessageSquareReply,
    meeting: CalendarCheck,
    enriched: Sparkles,
    added: UserPlus,
    opened: MailOpen,
  }

export default function Dashboard() {
  const topProspects = [...prospects].sort((a, b) => b.score - a.score).slice(0, 5)
  const activeCampaigns = campaigns.filter((c) => c.status === "active")

  return (
    <Page>
      <PageHeading
        title="Good morning, Kevin"
        description="Here's what's happening across your pipeline today."
        action={
          <Button asChild>
            <Link to="/search">
              <Sparkles className="size-4" />
              Find prospects
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const positive = stat.delta >= 0
          return (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-medium",
                      positive ? "text-chart-1" : "text-destructive"
                    )}
                  >
                    {positive ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownRight className="size-3.5" />
                    )}
                    {Math.abs(stat.delta)}%
                  </span>
                  <span className="text-muted-foreground">{stat.hint}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Top prospects to action</CardTitle>
              <CardDescription>
                Highest AI lead scores in your pipeline
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/search">
                View all <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {topProspects.map((p) => (
              <Link
                key={p.id}
                to={`/prospects/${p.id}`}
                className="hover:bg-muted/60 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors"
              >
                <ProspectAvatar prospect={p} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {p.title} · {p.company}
                  </p>
                </div>
                <ScoreBadge score={p.score} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Across your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item) => {
              const Icon = ACTIVITY_ICON[item.type]
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{item.prospectName}</span>{" "}
                      {item.detail}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {relativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Active campaigns</CardTitle>
            <CardDescription>Performance over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {activeCampaigns.map((c) => {
              const replyRate = Math.round((c.replied / c.enrolled) * 100)
              return (
                <Link
                  key={c.id}
                  to="/campaigns"
                  className="hover:border-primary/40 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{c.name}</p>
                    <span className="text-muted-foreground text-xs">
                      {c.enrolled} enrolled
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>Reply rate</span>
                      <span className="text-foreground font-medium tabular-nums">
                        {replyRate}%
                      </span>
                    </div>
                    <Progress value={replyRate} />
                  </div>
                  <div className="text-muted-foreground mt-3 flex gap-4 text-xs">
                    <span>{c.opened} opened</span>
                    <span>{c.replied} replied</span>
                    <span>{c.meetings} meetings</span>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
