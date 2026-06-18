import * as React from "react"
import { Zap } from "lucide-react"

import { useLocale } from "@/lib/locale"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCredits } from "@/lib/credits"
import { TopUpDialog } from "@/components/credits/TopUpDialog"
import { relativeTime } from "@/lib/format"

const COPY = {
  en: {
    title: "Usage & credits",
    description: "Track your credit balance and consumption.",
    topUp: "Top up credits",
    availableBalance: "Available balance",
    credits: "credits",
    creditsUsed: (used: string, allowance: string) =>
      `${used} of ${allowance} monthly credits used`,
    resets: "Resets July 1, 2026",
    usedThisMonth: "Used this month",
    remaining: "Remaining",
    monthlyAllowance: "Monthly allowance",
    recentUsage: "Recent usage",
    recentUsageDesc: "Your latest credit-consuming activity",
    activity: "Activity",
    creditsCol: "Credits",
    when: "When",
    footnote:
      "Credits are consumed when revealing contact info, enriching, and exporting prospects.",
  },
  es: {
    title: "Uso y créditos",
    description: "Controla tu saldo de créditos y su consumo.",
    topUp: "Recargar créditos",
    availableBalance: "Saldo disponible",
    credits: "créditos",
    creditsUsed: (used: string, allowance: string) =>
      `${used} de ${allowance} créditos mensuales usados`,
    resets: "Se restablece el 1 de julio de 2026",
    usedThisMonth: "Usados este mes",
    remaining: "Restantes",
    monthlyAllowance: "Asignación mensual",
    recentUsage: "Uso reciente",
    recentUsageDesc: "Tu actividad más reciente que consume créditos",
    activity: "Actividad",
    creditsCol: "Créditos",
    when: "Cuándo",
    footnote:
      "Los créditos se consumen al revelar datos de contacto, enriquecer y exportar prospectos.",
  },
} as const

export default function Usage() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { balance, monthlyAllowance, usage } = useCredits()
  const [topUpOpen, setTopUpOpen] = React.useState(false)

  const used = monthlyAllowance - balance
  const usedPct = Math.min(100, Math.max(0, (used / monthlyAllowance) * 100))

  const stats = [
    { label: c.usedThisMonth, value: used },
    { label: c.remaining, value: balance },
    { label: c.monthlyAllowance, value: monthlyAllowance },
  ]

  return (
    <Page className="max-w-3xl">
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => setTopUpOpen(true)}>
            <Zap className="size-4" />
            {c.topUp}
          </Button>
        }
      />

      {/* Balance */}
      <Card>
        <CardHeader>
          <CardDescription>{c.availableBalance}</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {balance.toLocaleString()}{" "}
            <span className="text-muted-foreground text-base font-normal">
              {c.credits}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={usedPct} />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-muted-foreground text-sm tabular-nums">
              {c.creditsUsed(
                used.toLocaleString(),
                monthlyAllowance.toLocaleString()
              )}
            </p>
            <p className="text-muted-foreground text-xs">{c.resets}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stat row */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent usage */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{c.recentUsage}</CardTitle>
          <CardDescription>{c.recentUsageDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{c.activity}</TableHead>
                <TableHead className="text-right">{c.creditsCol}</TableHead>
                <TableHead className="text-right">{c.when}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.map((item) => {
                const added = item.amount < 0 // negative = credits added
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell
                      className={
                        added
                          ? "text-chart-1 text-right tabular-nums"
                          : "text-destructive/80 text-right tabular-nums"
                      }
                    >
                      {added ? "+" : "-"}
                      {Math.abs(item.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {relativeTime(item.timestamp)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-muted-foreground mt-6 text-xs">{c.footnote}</p>

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </Page>
  )
}
