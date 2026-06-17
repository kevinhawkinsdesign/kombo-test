import type { FunnelCounts } from "@/lib/team"
import { cn } from "@/lib/utils"

const STAGES: { key: keyof FunnelCounts; label: string; color: string }[] = [
  { key: "prospects", label: "Prospects", color: "bg-chart-2" },
  { key: "contacted", label: "Contacted", color: "bg-chart-2/80" },
  { key: "replied", label: "Replied", color: "bg-chart-2/60" },
  { key: "meetings", label: "Meetings", color: "bg-chart-1" },
  { key: "won", label: "Closed won", color: "bg-chart-1/80" },
]

export function Funnel({ data }: { data: FunnelCounts }) {
  const top = data.prospects || 1

  return (
    <div className="space-y-2.5">
      {STAGES.map((stage, i) => {
        const value = data[stage.key]
        const widthPct = Math.max(6, (value / top) * 100)
        const prev = i === 0 ? value : data[STAGES[i - 1].key]
        const conv = prev ? Math.round((value / prev) * 100) : 100
        return (
          <div key={stage.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{stage.label}</span>
              <span className="font-medium tabular-nums">
                {value.toLocaleString()}
                {i > 0 && (
                  <span className="text-muted-foreground ml-1.5 font-normal">
                    {conv}%
                  </span>
                )}
              </span>
            </div>
            <div className="bg-muted h-6 overflow-hidden rounded-md">
              <div
                className={cn("h-full rounded-md transition-all", stage.color)}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
