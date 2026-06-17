import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Building2, Plus, Sparkles } from "lucide-react"

import { Page } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProspectAvatar, ScoreBadge } from "@/components/common/ProspectBits"
import { getAccount, deals } from "@/lib/mock-extra"
import { prospects } from "@/lib/mock-data"
import { getRep } from "@/lib/team"
import { initials, formatDate } from "@/lib/format"
import type { Account, DealStage } from "@/lib/types"

function nameInitials(name: string): string {
  const [first, ...rest] = name.split(" ")
  return initials(first, rest.at(-1))
}

function money(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}k`
  return `$${(n / 1000).toFixed(1)}K`
}

function healthTone(score: number): {
  label: string
  className: string
} {
  if (score >= 80)
    return { label: "Healthy", className: "bg-chart-1/15 text-chart-1" }
  if (score >= 65)
    return { label: "At watch", className: "bg-chart-4/15 text-chart-4" }
  return { label: "At risk", className: "bg-muted text-muted-foreground" }
}

const STAGE_VARIANT: Record<
  DealStage,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  lead: "outline",
  qualified: "secondary",
  proposal: "default",
  negotiation: "default",
  won: "success",
  lost: "destructive",
}

export default function CompanyDetail() {
  const { id } = useParams()
  const account: Account | undefined = id ? getAccount(id) : undefined

  if (!account) {
    return (
      <Page>
        <p className="text-muted-foreground">Company not found.</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/companies">Back to companies</Link>
        </Button>
      </Page>
    )
  }

  const health = healthTone(account.healthScore)
  const openDeals = deals.filter((d) => d.accountId === account.id)
  const contacts = prospects.filter(
    (p) => p.companyDomain === account.domain
  )
  const owner = getRep(account.ownerId)

  const firmographics = [
    { label: "Industry", value: account.industry },
    { label: "Employees", value: account.employees },
    { label: "Revenue", value: account.revenue },
    { label: "Location", value: account.location },
  ]

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/companies">
          <ArrowLeft className="size-4" />
          Companies
        </Link>
      </Button>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-xl text-2xl font-semibold text-white"
            style={{ backgroundColor: account.logoColor }}
          >
            {account.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold">{account.name}</h1>
            <a
              href={`https://${account.domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary text-sm"
            >
              {account.domain}
            </a>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="font-normal">
                {account.tier}
              </Badge>
              <Badge
                className={`border-transparent font-medium ${health.className}`}
              >
                {health.label} · {account.healthScore}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {account.industry}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Synced to HubSpot")}>
              <Building2 className="size-4" />
              Sync to CRM
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Add a contact to this company")}
            >
              <Plus className="size-4" />
              Add contact
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {account.about}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="text-primary size-4" />
                Buying signals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {account.signals.map((s) => (
                <div
                  key={s}
                  className="bg-chart-1/10 text-chart-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                >
                  <span className="bg-current size-1.5 rounded-full" />
                  {s}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open deals</CardTitle>
            </CardHeader>
            <CardContent>
              {openDeals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Deal name</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Close date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openDeals.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={STAGE_VARIANT[d.stage]}
                            className="capitalize"
                          >
                            {d.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {money(d.value)}
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {formatDate(d.closeDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm">No open deals</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {contacts.length > 0 ? (
                contacts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/prospects/${p.id}`}
                    className="hover:bg-muted/60 flex items-center gap-3 rounded-md px-2 py-2"
                  >
                    <ProspectAvatar prospect={p} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.title}
                      </p>
                    </div>
                    <ScoreBadge score={p.score} />
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No contacts</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key executives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {account.keyExecutives.map((exec) => (
                <div key={exec.name} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                      {nameInitials(exec.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{exec.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {exec.title}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Firmographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {firmographics.map((f) => (
                  <div key={f.label}>
                    <p className="text-muted-foreground text-xs">{f.label}</p>
                    <p className="text-sm font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account owner</CardTitle>
            </CardHeader>
            <CardContent>
              {owner ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback
                      style={{ backgroundColor: owner.avatarColor, color: "white" }}
                      className="text-xs font-medium"
                    >
                      {nameInitials(owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{owner.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {owner.role}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Unassigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  )
}
