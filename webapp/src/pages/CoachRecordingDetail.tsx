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
  positive: { icon: Smile, variant: "success" as const, label: "Positive" },
  neutral: { icon: Meh, variant: "secondary" as const, label: "Neutral" },
  negative: { icon: Frown, variant: "destructive" as const, label: "Negative" },
}

const MOMENT_STYLES: Record<
  KeyMoment["type"],
  { dot: string; badge: string; label: string }
> = {
  positive: {
    dot: "bg-chart-1",
    badge: "bg-chart-1/15 text-chart-1",
    label: "Positive",
  },
  risk: {
    dot: "bg-destructive",
    badge: "bg-destructive/15 text-destructive",
    label: "Risk",
  },
  action: {
    dot: "bg-primary",
    badge: "bg-primary/15 text-primary",
    label: "Action",
  },
  question: {
    dot: "bg-chart-4",
    badge: "bg-chart-4/15 text-chart-4",
    label: "Question",
  },
}

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

export default function CoachRecordingDetail() {
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
        <p className="text-muted-foreground">Recording not found.</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/coach">Back to Coach</Link>
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
      if (next[index]) toast.success(`Completed: ${label}`)
      return next
    })
  }

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/coach">
          <ArrowLeft className="size-4" />
          Coach
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
                title="Call score"
              >
                <span className="bg-current size-1.5 rounded-full opacity-80" />
                {rec.score}/100
              </span>
              <Badge variant={sentiment.variant}>
                <SentimentIcon className="size-3" />
                {sentiment.label}
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
              onClick={() => toast.info("Re-analyzing recording…")}
            >
              <RefreshCw className="size-4" />
              Re-analyze
            </Button>
            <Button onClick={() => toast.success("Notes added to CRM")}>
              <Building2 className="size-4" />
              Add notes to CRM
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
            aria-label={isPlaying ? "Pause" : "Play"}
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
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="moments">Key moments</TabsTrigger>
                  <TabsTrigger value="participants">Participants</TabsTrigger>
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
                      No transcript available for this recording.
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
                                {style.label}
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      No key moments captured.
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
                                {p.role === "rep" ? "You" : "Prospect"}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground text-sm tabular-nums">
                              {p.talkPct}% talk time
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
                      No participant data.
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
              <CardTitle className="text-base">Call analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="size-3.5" />
                    Talk ratio
                    <InfoHint label="What is talk ratio?">
                      The share of the call you (the rep) spoke versus the
                      prospect. Lower is usually better — let them talk.
                    </InfoHint>
                  </span>
                  <span className="font-medium tabular-nums">
                    You {repRatio}% / Prospect {prospectRatio}%
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
                    Talk ratio is high — aim for under 50%.
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
                        Questions asked
                      </span>
                      <span className="font-medium tabular-nums">
                        {analysis.questionsAsked}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="size-4" />
                        Longest monologue
                      </span>
                      <span className="font-medium tabular-nums">
                        {analysis.longestMonologueMin} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Timer className="size-4" />
                        Avg response time
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
                <CardTitle className="text-base">Topics discussed</CardTitle>
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
                <CardTitle className="text-base">Objections</CardTitle>
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
                <CardTitle className="text-base">Action items</CardTitle>
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
                        aria-label={done ? "Mark as not done" : "Mark as done"}
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
                  onClick={() => toast.success("Tasks created")}
                >
                  <ListChecks className="size-4" />
                  Create tasks
                </Button>
              </CardContent>
            </Card>
          )}

          {analysis && analysis.coachingTips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="text-primary size-4" />
                  Coaching tips
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
                  Personality read
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
              <CardTitle className="text-base">Rate this analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setRating(n)
                      toast.success("Thanks for the feedback")
                    }}
                    aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
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
                  Was this helpful?
                </span>
                <div className="flex gap-1">
                  <Button
                    variant={helpful === true ? "default" : "outline"}
                    size="icon"
                    className="size-8"
                    aria-label="Helpful"
                    onClick={() => {
                      setHelpful(true)
                      toast.success("Glad it helped")
                    }}
                  >
                    <ThumbsUp className="size-4" />
                  </Button>
                  <Button
                    variant={helpful === false ? "default" : "outline"}
                    size="icon"
                    className="size-8"
                    aria-label="Not helpful"
                    onClick={() => {
                      setHelpful(false)
                      toast.info("Thanks — we'll improve")
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
