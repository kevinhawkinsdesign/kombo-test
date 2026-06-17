import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { HandHeart, Users, GraduationCap, Briefcase, Waypoints } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProspectAvatar, ScoreBadge } from "@/components/common/ProspectBits"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  introPaths,
  getIntroPaths,
  type IntroPath,
  type IntroStrength,
} from "@/lib/mock-network"
import { getProspect } from "@/lib/mock-data"
import { initials } from "@/lib/format"
import type { Prospect } from "@/lib/types"

const STRENGTH_ORDER: Record<IntroStrength, number> = {
  strong: 0,
  medium: 1,
  weak: 2,
}

const STRENGTH_VARIANT: Record<
  IntroStrength,
  "success" | "secondary" | "outline"
> = {
  strong: "success",
  medium: "secondary",
  weak: "outline",
}

const SOURCE_META: Record<
  IntroPath["source"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  team: { label: "Teammate", icon: Users },
  linkedin: { label: "LinkedIn", icon: LinkedinIcon },
  alumni: { label: "Alumni", icon: GraduationCap },
  investor: { label: "Investor", icon: Briefcase },
}

function howItWorks() {
  toast.info(
    "We scan your team's relationships, LinkedIn, alumni, and investor networks to surface the warmest path to each prospect."
  )
}

export default function WarmIntros() {
  const strongPaths = React.useMemo(
    () => introPaths.filter((p) => p.strength === "strong").length,
    []
  )

  const reachableProspects = React.useMemo(
    () => new Set(introPaths.map((p) => p.prospectId)).size,
    []
  )

  const prospects = React.useMemo(() => {
    const ids = Array.from(new Set(introPaths.map((p) => p.prospectId)))
    const resolved = ids
      .map(getProspect)
      .filter((p): p is Prospect => Boolean(p))

    const bestStrength = (id: string): number => {
      const paths = getIntroPaths(id)
      return paths.length
        ? Math.min(...paths.map((path) => STRENGTH_ORDER[path.strength]))
        : STRENGTH_ORDER.weak + 1
    }

    return resolved.sort((a, b) => bestStrength(a.id) - bestStrength(b.id))
  }, [])

  return (
    <Page>
      <PageHeading
        title="Warm Intros"
        description="The warmest path to your top prospects."
        action={
          <Button variant="outline" onClick={howItWorks}>
            <HandHeart className="size-4" />
            How it works
          </Button>
        }
      />

      <FeatureIntro
        featureKey="intros"
        icon={Waypoints}
        title="Get introduced — don't cold-call"
        description="Find the warmest path into an account through your team's combined network."
        points={[
          "See who on your team already knows a prospect",
          "Paths ranked by relationship strength",
          "Request an intro in one click",
        ]}
        className="mb-6"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Intro paths" value={introPaths.length} />
        <SummaryCard label="Strong paths" value={strongPaths} />
        <SummaryCard label="Prospects reachable" value={reachableProspects} />
      </div>

      {prospects.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
          No warm intro paths yet. Connect your team and networks to find one.
        </div>
      ) : (
        <div className="space-y-4">
          {prospects.map((p) => (
            <ProspectIntroCard key={p.id} prospect={p} />
          ))}
        </div>
      )}
    </Page>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="gap-1 py-5">
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}

function ProspectIntroCard({ prospect: p }: { prospect: Prospect }) {
  const paths = getIntroPaths(p.id)

  return (
    <Card className="gap-4">
      <CardHeader>
        <Link
          to={`/prospects/${p.id}`}
          className="group flex items-center gap-3"
        >
          <ProspectAvatar prospect={p} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold group-hover:underline">
              {p.firstName} {p.lastName}
            </p>
            <p className="text-muted-foreground truncate text-sm">
              {p.title} · {p.company}
            </p>
          </div>
          <ScoreBadge score={p.score} />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {paths.map((path) => (
          <IntroPathRow key={path.id} path={path} />
        ))}
      </CardContent>
    </Card>
  )
}

function IntroPathRow({ path }: { path: IntroPath }) {
  const source = SOURCE_META[path.source]
  const SourceIcon = source.icon
  const firstName = path.connectorName.split(" ")[0]
  const cta = path.connectorIsTeam ? `Ask ${firstName}` : "Request intro"

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <Avatar className="size-9 shrink-0">
        <AvatarFallback
          style={{ backgroundColor: path.connectorAvatarColor, color: "white" }}
          className="text-xs font-medium"
        >
          {initials(firstName, path.connectorName.split(" ")[1])}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{path.connectorName}</span>
          <span className="text-muted-foreground text-xs">
            {path.connectorTitle}
          </span>
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm">{path.via}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={STRENGTH_VARIANT[path.strength]} className="capitalize">
            {path.strength}
          </Badge>
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <SourceIcon className="size-3.5" />
            {source.label}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant={path.connectorIsTeam ? "default" : "outline"}
        className="shrink-0 sm:self-center"
        onClick={() =>
          toast.success(`Intro requested via ${path.connectorName}`)
        }
      >
        {cta}
      </Button>
    </div>
  )
}
