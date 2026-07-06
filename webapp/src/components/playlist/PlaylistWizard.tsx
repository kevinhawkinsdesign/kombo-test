import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Check,
  Search,
  Upload,
  Sparkles,
  RefreshCw,
  Send,
  Zap,
  Workflow,
  ArrowRight,
  Users,
  Database,
  ListTodo,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Term } from "@/components/common/InfoHint"
import { useCampaigns, listStore } from "@/lib/store"
import type {
  EnrichmentMode,
  SendMode,
  ReviewMode,
  SavedSearchCriteria,
} from "@/lib/types"
import { cn } from "@/lib/utils"

type Audience = "dynamic" | "static"

const STEPS = ["Prospects", "Enrich", "Outreach", "Review"] as const

const FACETS: { key: keyof Omit<SavedSearchCriteria, "keywords">; label: string; options: string[] }[] = [
  { key: "titles", label: "Job titles", options: ["VP Sales", "CRO", "Head of Sales", "RevOps Lead", "Sales Director", "Account Executive"] },
  { key: "seniority", label: "Seniority", options: ["C-Level", "VP", "Director", "Manager"] },
  { key: "industries", label: "Industry", options: ["Software", "Fintech", "Marketplace", "E-commerce", "Media", "Travel"] },
  { key: "headcount", label: "Headcount", options: ["11-50", "51-200", "201-1,000", "1,001-5,000", "5,000+"] },
  { key: "locations", label: "Location", options: ["United States", "United Kingdom", "Spain", "Germany", "France"] },
  { key: "signals", label: "Buying signals", options: ["Recent funding", "Hiring sales roles", "Website intent", "Job change", "Uses a competitor"] },
]

const EMPTY_CRITERIA: SavedSearchCriteria = {
  titles: [],
  seniority: [],
  industries: [],
  headcount: [],
  locations: [],
  keywords: "",
  signals: [],
}

function OptionCard({
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  badge,
}: {
  selected: boolean
  onSelect: () => void
  icon: React.ComponentType<{ className?: string }>
  title: React.ReactNode
  description: React.ReactNode
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary ring-primary/30 bg-primary/5 ring-1"
          : "hover:border-primary/40 hover:bg-muted/40"
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="font-medium">{title}</span>
        {badge && (
          <Badge variant="secondary" className="ml-auto font-normal">
            {badge}
          </Badge>
        )}
        {selected && !badge && (
          <Check className="text-primary ml-auto size-4" />
        )}
      </span>
      <span className="text-muted-foreground text-sm">{description}</span>
    </button>
  )
}

export function PlaylistWizard({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const campaigns = useCampaigns()

  const [step, setStep] = React.useState(0)
  const [name, setName] = React.useState("")
  const [audience, setAudience] = React.useState<Audience>("dynamic")
  const [criteria, setCriteria] = React.useState<SavedSearchCriteria>(EMPTY_CRITERIA)
  const [enrichment, setEnrichment] = React.useState<EnrichmentMode>("continuous")
  const [outreachMode, setOutreachMode] = React.useState<ReviewMode>("auto_campaign")
  const [campaignId, setCampaignId] = React.useState<string>("")
  const [sendMode, setSendMode] = React.useState<SendMode>("continuous")

  // Reset whenever the dialog opens (render-time, per React guidance).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStep(0)
      setName("")
      setAudience("dynamic")
      setCriteria(EMPTY_CRITERIA)
      setEnrichment("continuous")
      setOutreachMode("auto_campaign")
      setCampaignId("")
      setSendMode("continuous")
    }
  }

  const facetCount = FACETS.reduce(
    (sum, f) => sum + (criteria[f.key] as string[]).length,
    0
  )
  // A believable estimate that narrows as more constraints are added.
  const estMatches = Math.max(
    40,
    Math.round(3200 * Math.pow(0.84, facetCount))
  )
  const estNewPerWeek = Math.max(3, Math.round(estMatches * 0.012))

  function toggleFacet(key: keyof SavedSearchCriteria, value: string) {
    setCriteria((prev) => {
      const arr = prev[key] as string[]
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value]
      return { ...prev, [key]: next }
    })
  }

  const selectedCampaign = campaigns.find((c) => c.id === campaignId)
  const canNext = step !== 0 || name.trim().length > 0

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1)
  }
  function back() {
    if (step > 0) setStep(step - 1)
  }

  function handleCreate() {
    const isDynamic = audience === "dynamic"
    const manualReview = isDynamic && outreachMode === "manual_review"
    const list = listStore.create({
      name: name.trim() || "Untitled playlist",
      description: isDynamic
        ? "Dynamic playlist — saved search keeps adding matching prospects."
        : "Static list.",
      color: "#7c3aed",
      source: isDynamic ? "search" : "csv",
      prospectIds: [],
      dynamic: isDynamic,
      criteria: isDynamic ? criteria : undefined,
      enrichment,
      newPerWeek: isDynamic ? estNewPerWeek : undefined,
      campaignId: manualReview ? undefined : campaignId || undefined,
      sendMode: !manualReview && campaignId ? sendMode : undefined,
      reviewMode: isDynamic ? outreachMode : undefined,
      lastSyncedAt: new Date().toISOString(),
    })
    onOpenChange(false)
    toast.success(
      isDynamic
        ? "Playlist created — Kai is finding matching prospects"
        : "List created"
    )
    navigate(`/lists/${list.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            Build a playlist
          </DialogTitle>
          <DialogDescription>
            The fastest way to start: a list that fills itself, enriches, and
            reaches out — on autopilot.
          </DialogDescription>

          {/* Stepper */}
          <ol className="mt-3 flex items-center gap-1.5">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                    i < step && "bg-primary text-primary-foreground",
                    i === step && "border-primary text-primary border-2",
                    i > step && "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    i === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="bg-border h-px flex-1" />
                )}
              </li>
            ))}
          </ol>
        </DialogHeader>

        <div className="max-h-[60svh] overflow-y-auto p-5">
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="playlist-name">Playlist name</Label>
                <Input
                  id="playlist-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Q3 Enterprise ICP"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>How should prospects get added?</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <OptionCard
                    selected={audience === "dynamic"}
                    onSelect={() => setAudience("dynamic")}
                    icon={Search}
                    title="From a saved search"
                    badge="Dynamic"
                    description="A saved search keeps dropping new matching prospects into the list as they appear."
                  />
                  <OptionCard
                    selected={audience === "static"}
                    onSelect={() => setAudience("static")}
                    icon={Upload}
                    title="Add them myself"
                    description="Start empty and add prospects from search or a CSV import."
                  />
                </div>
              </div>

              {audience === "dynamic" && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label>Search criteria</Label>
                    <span className="text-muted-foreground text-xs">
                      Pick the filters that define your{" "}
                      <Term name="ICP">ICP</Term>
                    </span>
                  </div>
                  {FACETS.map((facet) => (
                    <div key={facet.key} className="space-y-1.5">
                      <p className="text-muted-foreground text-xs font-medium">
                        {facet.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {facet.options.map((opt) => {
                          const active = (criteria[facet.key] as string[]).includes(opt)
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleFacet(facet.key, opt)}
                              aria-pressed={active}
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "hover:border-primary/40 hover:bg-muted"
                              )}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                    <span className="flex items-center gap-2 text-sm">
                      <Users className="text-primary size-4" />
                      <span className="font-medium tabular-nums">
                        ≈ {estMatches.toLocaleString()}
                      </span>
                      matching prospects today
                    </span>
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <RefreshCw className="size-3" />~{estNewPerWeek} new / week
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>
                  <Term name="enrichment">Enrich</Term> prospect data
                </Label>
                <p className="text-muted-foreground text-sm">
                  We append ~30 verified data points — direct dials, emails,
                  seniority, tech stack, and intent — to every prospect.
                </p>
              </div>
              <div className="grid gap-3">
                <OptionCard
                  selected={enrichment === "once"}
                  onSelect={() => setEnrichment("once")}
                  icon={Database}
                  title="Enrich once"
                  description="Enrich each prospect a single time when they're added. Cheapest on credits."
                />
                <OptionCard
                  selected={enrichment === "continuous"}
                  onSelect={() => setEnrichment("continuous")}
                  icon={RefreshCw}
                  title="Keep enriched continuously"
                  badge="Recommended"
                  description="Re-check on a schedule so job changes, new phone numbers, and fresh signals never go stale."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Outreach</Label>
                <p className="text-muted-foreground text-sm">
                  Attach a sequence and decide whether new prospects get
                  enrolled automatically.
                </p>
              </div>

              {audience === "dynamic" && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">
                    When a new prospect matches
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <OptionCard
                      selected={outreachMode === "auto_campaign"}
                      onSelect={() => setOutreachMode("auto_campaign")}
                      icon={Send}
                      title="Enroll in a campaign"
                      description="New matches flow straight into a sequence — the flywheel from the previous screen."
                    />
                    <OptionCard
                      selected={outreachMode === "manual_review"}
                      onSelect={() => setOutreachMode("manual_review")}
                      icon={ListTodo}
                      title="Review manually"
                      description="New matches create a task for you to review — nothing sends until you say so."
                    />
                  </div>
                </div>
              )}

              {(audience === "static" || outreachMode === "auto_campaign") && (
                <div className="space-y-2">
                  <Label htmlFor="wizard-campaign" className="text-muted-foreground text-xs">
                    Sequence
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={campaignId} onValueChange={setCampaignId}>
                      <SelectTrigger id="wizard-campaign" className="flex-1">
                        <SelectValue placeholder="Choose a campaign…" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onOpenChange(false)
                        navigate("/sequence-builder")
                      }}
                    >
                      <Workflow className="size-4" />
                      Build new
                    </Button>
                  </div>
                </div>
              )}

              {audience === "dynamic" && outreachMode === "manual_review" && (
                <div className="border-primary/30 bg-primary/5 text-primary flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm">
                  <ListTodo className="size-4 shrink-0" />
                  Each new match creates a task for you to review — nothing
                  gets enrolled or sent until you act on it.
                </div>
              )}

              {(audience === "static" || outreachMode === "auto_campaign") &&
                campaignId && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">
                      When should it send?
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <OptionCard
                        selected={sendMode === "once"}
                        onSelect={() => setSendMode("once")}
                        icon={Send}
                        title="Send once"
                        description="Enroll today's prospects and stop."
                      />
                      <OptionCard
                        selected={sendMode === "continuous"}
                        onSelect={() => setSendMode("continuous")}
                        icon={Zap}
                        title="Send continuously"
                        badge="Flywheel"
                        description="Auto-enroll every new prospect the saved search adds, forever."
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Here's the loop you're about to set live:
              </p>
              <div className="space-y-2">
                <FlywheelRow
                  icon={Search}
                  title={audience === "dynamic" ? "Saved search" : "Manual list"}
                  detail={
                    audience === "dynamic"
                      ? `≈ ${estMatches.toLocaleString()} matches · ~${estNewPerWeek} new/week`
                      : "You add prospects from search or CSV"
                  }
                />
                <FlywheelRow
                  icon={Database}
                  title="Enrich"
                  detail={
                    enrichment === "continuous"
                      ? "Continuously kept fresh"
                      : "Once, on add"
                  }
                />
                <FlywheelRow
                  icon={
                    audience === "dynamic" && outreachMode === "manual_review"
                      ? ListTodo
                      : Send
                  }
                  title="Outreach"
                  detail={
                    audience === "dynamic" && outreachMode === "manual_review"
                      ? "New matches create a task for you to review"
                      : selectedCampaign
                        ? `${selectedCampaign.name} · ${
                            sendMode === "continuous" ? "continuous enrollment" : "send once"
                          }`
                        : "No sequence attached yet"
                  }
                />
                {audience === "dynamic" &&
                  outreachMode === "auto_campaign" &&
                  sendMode === "continuous" &&
                  campaignId && (
                  <div className="border-primary/30 bg-primary/5 text-primary flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm font-medium">
                    <RefreshCw className="size-4" />
                    Self-sustaining: new prospects flow in, get enriched, and
                    enter outreach automatically.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t p-4">
          <Button
            variant="ghost"
            onClick={step === 0 ? () => onOpenChange(false) : back}
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!canNext}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              <Sparkles className="size-4" />
              Create playlist
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FlywheelRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  detail: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground truncate text-xs">{detail}</p>
      </div>
    </div>
  )
}
