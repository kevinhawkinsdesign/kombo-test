import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Search as SearchIcon, Plus, Briefcase, Users, Building2 } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { accounts } from "@/lib/mock-extra"
import { getRep } from "@/lib/team"
import { useView } from "@/lib/view-context"
import { initials, formatMoney as money } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Account, AccountTier } from "@/lib/types"

const ALL = "all"
const TIERS: (AccountTier | typeof ALL)[] = [
  ALL,
  "Enterprise",
  "Mid-market",
  "SMB",
]

function healthTone(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-muted text-muted-foreground"
}

export default function Companies() {
  const { impersonatingId } = useView()
  const [query, setQuery] = React.useState("")
  const [tier, setTier] = React.useState<string>(ALL)

  const source = React.useMemo(
    () =>
      impersonatingId
        ? accounts.filter((a) => a.ownerId === impersonatingId)
        : accounts,
    [impersonatingId]
  )

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return source.filter((a) => {
      const matchesQuery =
        !q ||
        `${a.name} ${a.industry} ${a.domain}`.toLowerCase().includes(q)
      const matchesTier = tier === ALL || a.tier === tier
      return matchesQuery && matchesTier
    })
  }, [source, query, tier])

  return (
    <Page>
      <PageHeading
        title="Companies"
        description="Account intelligence across your book of business."
        action={
          <Button onClick={() => toast.info("Add company — coming soon")}>
            <Plus className="size-4" />
            Add company
          </Button>
        }
      />

      <FeatureIntro
        featureKey="companies"
        icon={Building2}
        title="Target the accounts that fit"
        description="Track companies that match your ICP and get notified when something changes that's worth a call."
        points={[
          "See headcount, funding & tech stack",
          "Subscribe to hiring and growth signals",
          "Find the full buying committee",
          "Add a whole account to a list",
        ]}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, industry, or domain…"
            className="pl-9"
          />
        </div>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="min-w-[150px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            {TIERS.map((t) => (
              <SelectItem key={t} value={t}>
                {t === ALL ? "All tiers" : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted-foreground mb-3 text-sm">
        <span className="text-foreground font-medium tabular-nums">
          {results.length}
        </span>{" "}
        {results.length === 1 ? "company" : "companies"}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((a) => (
          <CompanyCard key={a.id} account={a} />
        ))}
        {results.length === 0 && (
          <div className="text-muted-foreground col-span-full rounded-xl border border-dashed py-16 text-center text-sm">
            No companies match your filters.
          </div>
        )}
      </div>
    </Page>
  )
}

function CompanyCard({ account: a }: { account: Account }) {
  const owner = getRep(a.ownerId)

  return (
    <Link
      to={`/companies/${a.id}`}
      className="hover:border-primary/40 flex flex-col rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold text-white"
          style={{ backgroundColor: a.logoColor }}
        >
          {a.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{a.name}</p>
          <p className="text-muted-foreground truncate text-sm">{a.domain}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            healthTone(a.healthScore)
          )}
          title="Account health"
        >
          <span className="bg-current size-1.5 rounded-full opacity-80" />
          {a.healthScore}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          {a.tier}
        </Badge>
        <span className="text-muted-foreground truncate text-xs">
          {a.industry}
        </span>
      </div>

      <div className="text-muted-foreground mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {a.openDeals}
          </p>
          <p>Open deals</p>
        </div>
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {money(a.pipeline)}
          </p>
          <p>Pipeline</p>
        </div>
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {a.contacts}
          </p>
          <p>Contacts</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {a.signals.slice(0, 2).map((signal) => (
          <Badge key={signal} variant="secondary" className="font-normal">
            {signal}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        {owner ? (
          <>
            <Avatar className="size-6">
              <AvatarFallback
                style={{ backgroundColor: owner.avatarColor, color: "white" }}
                className="text-[10px] font-medium"
              >
                {initials(
                  owner.name.split(" ")[0],
                  owner.name.split(" ")[1]
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-xs">
              {owner.name.split(" ")[0]}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Users className="size-3.5" />
            Unassigned
          </span>
        )}
        <Briefcase className="text-muted-foreground ml-auto size-3.5" />
      </div>
    </Link>
  )
}
