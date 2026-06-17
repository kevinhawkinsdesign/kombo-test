import * as React from "react"
import { Zap } from "lucide-react"

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

export default function Usage() {
  const { balance, monthlyAllowance, usage } = useCredits()
  const [topUpOpen, setTopUpOpen] = React.useState(false)

  const used = monthlyAllowance - balance
  const usedPct = Math.min(100, Math.max(0, (used / monthlyAllowance) * 100))

  const stats = [
    { label: "Used this month", value: used },
    { label: "Remaining", value: balance },
    { label: "Monthly allowance", value: monthlyAllowance },
  ]

  return (
    <Page className="max-w-3xl">
      <PageHeading
        title="Usage & credits"
        description="Track your credit balance and consumption."
        action={
          <Button onClick={() => setTopUpOpen(true)}>
            <Zap className="size-4" />
            Top up credits
          </Button>
        }
      />

      {/* Balance */}
      <Card>
        <CardHeader>
          <CardDescription>Available balance</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {balance.toLocaleString()}{" "}
            <span className="text-muted-foreground text-base font-normal">
              credits
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={usedPct} />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-muted-foreground text-sm tabular-nums">
              {used.toLocaleString()} of {monthlyAllowance.toLocaleString()}{" "}
              monthly credits used
            </p>
            <p className="text-muted-foreground text-xs">Resets July 1, 2026</p>
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
          <CardTitle>Recent usage</CardTitle>
          <CardDescription>Your latest credit-consuming activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">When</TableHead>
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

      <p className="text-muted-foreground mt-6 text-xs">
        Credits are consumed when revealing contact info, enriching, and
        exporting prospects.
      </p>

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </Page>
  )
}
