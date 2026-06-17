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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScoreBadge } from "@/components/common/ProspectBits"
import { coachRecordings } from "@/lib/mock-data"
import { formatDate } from "@/lib/format"
import type { CoachRecording } from "@/lib/types"

const SENTIMENT = {
  positive: { icon: Smile, className: "text-chart-1", label: "Positive" },
  neutral: { icon: Meh, className: "text-chart-4", label: "Neutral" },
  negative: { icon: Frown, className: "text-destructive", label: "Negative" },
}

const avgScore = Math.round(
  coachRecordings.reduce((s, r) => s + r.score, 0) / coachRecordings.length
)

export default function Coach() {
  return (
    <Page>
      <PageHeading
        title="Call Coach"
        description="AI analysis of your sales calls with actionable feedback."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Average call score</CardDescription>
            <CardTitle className="text-2xl">{avgScore}/100</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Calls analyzed</CardDescription>
            <CardTitle className="text-2xl">{coachRecordings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg. talk ratio</CardDescription>
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
  const sentiment = SENTIMENT[rec.sentiment]
  const SentimentIcon = sentiment.icon
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex items-start gap-3">
          <Button
            size="icon"
            variant="outline"
            className="size-10 shrink-0 rounded-full"
            asChild
          >
            <Link to={`/coach/${rec.id}`} aria-label="Play recording">
              <Play className="size-4" />
            </Link>
          </Button>
          <div>
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
                {sentiment.label}
              </span>
            </div>
          </div>
        </div>
        <ScoreBadge score={rec.score} className="text-sm" />
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              Talk ratio (you)
            </span>
            <span className="font-medium tabular-nums">{rec.talkRatio}%</span>
          </div>
          <Progress value={rec.talkRatio} />
          <p className="text-muted-foreground mt-1 text-xs">
            Aim for 40–45% — let the prospect talk more.
          </p>

          <p className="mt-4 mb-2 text-sm font-medium">Highlights</p>
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
          <p className="mb-2 text-sm font-medium">Recommended next steps</p>
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
              AI generated
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/coach/${rec.id}`}>
                View full analysis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
