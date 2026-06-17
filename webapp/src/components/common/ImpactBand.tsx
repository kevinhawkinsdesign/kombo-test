import { TrendingUp, Clock, Trophy, Zap } from "lucide-react"

import { cn } from "@/lib/utils"

interface ImpactStat {
  value: string
  label: string
  sublabel: string
  icon: React.ComponentType<{ className?: string }>
}

const STATS: ImpactStat[] = [
  {
    value: "3.4×",
    label: "Pipeline coverage",
    sublabel: "More qualified pipeline per rep",
    icon: TrendingUp,
  },
  {
    value: "62%",
    label: "More selling time",
    sublabel: "Less manual research & data entry",
    icon: Clock,
  },
  {
    value: "28%",
    label: "Higher win rate",
    sublabel: "Better targeting and timing",
    icon: Trophy,
  },
  {
    value: "4 min",
    label: "Time to first value",
    sublabel: "From signup to first prospect",
    icon: Zap,
  },
]

/**
 * A band of headline product outcomes — the proof points sales leaders care
 * about. Framed as benchmark results from teams already running Kombo.
 */
export function ImpactBand({ className }: { className?: string }) {
  return (
    <section
      aria-label="Outcomes teams see with Kombo"
      className={cn(
        "bg-card overflow-hidden rounded-xl border shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2.5 sm:px-5">
        <span className="bg-primary/10 text-primary flex size-5 items-center justify-center rounded-md">
          <TrendingUp className="size-3.5" />
        </span>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Teams on Kombo see
        </p>
      </div>
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col gap-1 p-4 sm:p-5",
                // hairline dividers between tiles, responsive to columns
                i % 2 === 1 && "border-l",
                i >= 2 && "border-t lg:border-t-0",
                i !== 0 && "lg:border-l"
              )}
            >
              <Icon className="text-muted-foreground/70 size-4" />
              <dd className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {stat.value}
              </dd>
              <dt className="text-sm font-medium">{stat.label}</dt>
              <p className="text-muted-foreground text-xs">{stat.sublabel}</p>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
