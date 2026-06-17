import { TrendingUp, Users, Briefcase, UserPlus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HeadcountChart } from "@/components/charts/Charts"
import { getAccountMetrics, HEADCOUNT_MONTHS } from "@/lib/mock-depth"
import { cn } from "@/lib/utils"

const DEPT_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

export function CompanyMetrics({ accountId }: { accountId: string }) {
  const m = getAccountMetrics(accountId)
  if (!m) return null

  const current = m.headcount[m.headcount.length - 1]

  const stats = [
    { label: "Headcount", value: current.toLocaleString(), icon: Users },
    {
      label: "Growth (YoY)",
      value: `${m.growthYoY > 0 ? "+" : ""}${m.growthYoY}%`,
      icon: TrendingUp,
      positive: m.growthYoY > 0,
    },
    { label: "Open roles", value: String(m.openRoles), icon: Briefcase },
    { label: "Sales hires", value: String(m.salesHires), icon: UserPlus },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Growth &amp; metrics</CardTitle>
        <CardDescription>Headcount and hiring signals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label}>
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Icon className="size-3.5" />
                  {s.label}
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-lg font-semibold tabular-nums",
                    s.positive && "text-chart-1"
                  )}
                >
                  {s.value}
                </p>
              </div>
            )
          })}
        </div>

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            Headcount · last 12 months
          </p>
          <div className="h-44">
            <HeadcountChart labels={HEADCOUNT_MONTHS} values={m.headcount} />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            Department mix
          </p>
          <div className="space-y-2">
            {m.departments.map((d, i) => (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{d.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {d.pct}%
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      DEPT_COLORS[i % DEPT_COLORS.length]
                    )}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
