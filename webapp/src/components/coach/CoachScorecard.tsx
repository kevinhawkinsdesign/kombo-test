import type { ComponentType } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Octagon,
  PlayCircle,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CoachScorecard, SectionGrade } from "@/lib/types"

type GradeStyle = {
  label: string
  pill: string
  card: string
}

const GRADE_STYLES: Record<SectionGrade, GradeStyle> = {
  strong: {
    label: "Strong",
    pill: "bg-chart-1/15 text-chart-1",
    card: "border-l-chart-1 bg-chart-1/5",
  },
  okay: {
    label: "Okay",
    pill: "bg-chart-4/15 text-chart-4",
    card: "border-l-chart-4 bg-chart-4/5",
  },
  weak: {
    label: "Weak",
    pill: "bg-destructive/15 text-destructive",
    card: "border-l-destructive bg-destructive/5",
  },
}

function overallPillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

export function CallScorecard({
  scorecard,
  className,
}: {
  scorecard: CoachScorecard
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Coaching scorecard</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {scorecard.headline}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums",
              overallPillClass(scorecard.overall)
            )}
            title="Overall call score"
          >
            <span className="bg-current size-1.5 rounded-full opacity-80" />
            Call score {scorecard.overall}
          </span>
        </div>

        {/* Section grades */}
        <div className="space-y-3">
          {scorecard.sections.map((section) => {
            const style = GRADE_STYLES[section.grade]
            return (
              <div
                key={section.label}
                className={cn(
                  "rounded-md border border-l-4 px-3 py-2.5",
                  style.card
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 font-semibold">
                    {section.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                      style.pill
                    )}
                  >
                    {style.label} · {section.score}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm italic break-words">
                  &ldquo;{section.quote}&rdquo;
                </p>
                <p className="mt-1.5 text-sm break-words">
                  <span className="text-muted-foreground">→ </span>
                  {section.critique}
                </p>
              </div>
            )
          })}
        </div>

        {/* Start / Stop / Continue */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Start / Stop / Continue</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <CoachColumn
              icon={Octagon}
              title="Stop"
              tone="text-destructive"
              items={scorecard.startStopContinue.stop}
            />
            <CoachColumn
              icon={PlayCircle}
              title="Start"
              tone="text-primary"
              items={scorecard.startStopContinue.start}
            />
            <CoachColumn
              icon={CheckCircle2}
              title="Continue"
              tone="text-chart-1"
              items={scorecard.startStopContinue.continue}
            />
          </div>
        </div>

        {/* Biggest risks */}
        {scorecard.risks.length > 0 && (
          <div className="border-destructive/30 bg-destructive/5 rounded-md border p-3">
            <div className="text-destructive flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 shrink-0" />
              Biggest risks
            </div>
            <ul className="mt-2 space-y-1.5">
              {scorecard.risks.map((risk) => (
                <li
                  key={risk}
                  className="flex items-start gap-2 text-sm break-words"
                >
                  <span className="bg-destructive mt-1.5 size-1.5 shrink-0 rounded-full" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CoachColumn({
  icon: Icon,
  title,
  tone,
  items,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  tone: string
  items: string[]
}) {
  return (
    <div className="rounded-md border p-3">
      <div className={cn("flex items-center gap-1.5 text-sm font-semibold", tone)}>
        <Icon className="size-4 shrink-0" />
        {title}
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-muted-foreground flex items-start gap-2 text-sm break-words"
          >
            <span
              className={cn("mt-1.5 size-1.5 shrink-0 rounded-full bg-current", tone)}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
