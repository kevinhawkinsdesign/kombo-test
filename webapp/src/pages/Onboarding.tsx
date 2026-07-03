import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
  Users,
  Database,
  Blocks,
  Pencil,
  BadgeCheck,
  Building2,
  Target,
  X,
  Sparkles,
} from "lucide-react"

import { KomboLogo } from "@/components/KomboLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSetup } from "@/lib/setup"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/mock-data"
import { icpStore } from "@/lib/mock-icps"
import { INDUSTRY_OPTIONS } from "@/lib/mock-ai-search"

type StepId =
  | "identity"
  | "goal"
  | "team"
  | "company"
  | "icp"
  | "crm"
  | "tools"
  | "source"

const STEP_ORDER: StepId[] = [
  "identity",
  "goal",
  "team",
  "company",
  "icp",
  "crm",
  "tools",
  "source",
]

const GOALS = [
  "Find and enrich prospects",
  "Find and enrich accounts",
  "Enrich & score inbound leads",
  "AI outbound messaging",
  "Automate account research",
]

const TEAMS = ["RevOps", "Agency", "Marketing", "Sales", "Other"]

const NO_CRM = "I don't have a CRM / database"
const CRMS = [
  "Salesforce",
  "HubSpot",
  "Attio",
  "Snowflake",
  "Marketo",
  "Demandbase",
  "Dynamics 365",
  NO_CRM,
]

const TOOLS = [
  "Slack",
  "Notion",
  "Google Sheets",
  "Zapier",
  "Airtable",
  "Outreach",
  "Salesloft",
  "Apollo",
  "Instantly",
  "Smartlead",
  "Gong",
]

const SALES_ROLES = [
  "Sales Development Representative (SDR)",
  "Business Development Representative (BDR)",
  "Account Executive (AE)",
  "Sales Operations/Enablement",
  "Team Leader/Manager",
  "Head of/VP Sales",
  "Application Specialist",
  "Application Manager",
  "Other",
]

const PRODUCT_MODES = ["Company USP", "Custom"] as const
type ProductMode = (typeof PRODUCT_MODES)[number]

const DECISION_MAKER_SUGGESTIONS = [
  "VP of Sales",
  "Chief Revenue Officer",
  "Head of RevOps",
  "VP of Marketing",
  "Chief Product Officer",
  "Founder",
  "CEO",
]
const INFLUENCER_SUGGESTIONS = [
  "Product Manager",
  "Sales Manager",
  "Marketing Manager",
  "RevOps Manager",
  "Engineering Manager",
  "Customer Success Manager",
]
const COUNTRY_SUGGESTIONS = [
  "United States",
  "United Kingdom",
  "Spain",
  "Germany",
  "France",
  "Netherlands",
  "Australia",
  "Canada",
]

function slugify(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

const STEP_META: Record<
  StepId,
  {
    icon: React.ComponentType<{ className?: string }>
    tint: string
    title: string
    description: string
  }
> = {
  identity: {
    icon: BadgeCheck,
    tint: "bg-chart-3/15 text-chart-3",
    title: "Based on your email, is this you?",
    description:
      "Confirming your details helps us personalize recommendations and outreach.",
  },
  goal: {
    icon: Rocket,
    tint: "bg-primary/10 text-primary",
    title: "How would you like to get started?",
    description:
      "Pick what you want to do first. You can always explore everything else later.",
  },
  team: {
    icon: Users,
    tint: "bg-chart-3/15 text-chart-3",
    title: "What team are you on?",
    description:
      "This helps us personalize your workspace and show you relevant templates.",
  },
  company: {
    icon: Building2,
    tint: "bg-chart-2/15 text-chart-2",
    title: "Tell us about your company",
    description:
      "We drafted a quick description from your company — edit it, and add a specific product if you sell more than one thing.",
  },
  icp: {
    icon: Target,
    tint: "bg-chart-4/15 text-chart-4",
    title: "Who's your ideal customer?",
    description:
      "Add the titles, industries and countries you sell into — Kai uses this to score fit and suggest new prospects.",
  },
  crm: {
    icon: Database,
    tint: "bg-chart-5/15 text-chart-5",
    title: "What CRM or database do you use?",
    description:
      "We'll help you connect your data and set up integrations to streamline your workflow.",
  },
  tools: {
    icon: Blocks,
    tint: "bg-chart-1/15 text-chart-1",
    title: "What tools do you use?",
    description:
      "Tell us about your stack so we can recommend the best integrations for your workflow.",
  },
  source: {
    icon: Pencil,
    tint: "bg-chart-4/15 text-chart-4",
    title: "How did you hear about Kombo?",
    description: "Tell us how you got here!",
  },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const setup = useSetup()

  const [stepIndex, setStepIndex] = React.useState(0)
  const [finishing, setFinishing] = React.useState(false)

  // Identity
  const [name, setName] = React.useState(currentUser.name)
  const [linkedinUrl, setLinkedinUrl] = React.useState(
    `linkedin.com/in/${slugify(currentUser.name)}`
  )
  const [companyWebsite, setCompanyWebsite] = React.useState(
    `https://www.${slugify(currentUser.company)}.com`
  )
  const [salesRole, setSalesRole] = React.useState<string | null>(
    SALES_ROLES.includes(currentUser.role) ? currentUser.role : null
  )

  // Existing steps
  const [goal, setGoal] = React.useState<string | null>(null)
  const [team, setTeam] = React.useState<string | null>(null)
  const [crm, setCrm] = React.useState<string | null>(null)
  const [tools, setTools] = React.useState<Set<string>>(new Set())
  const [source, setSource] = React.useState("")

  // Company / USP
  const [companyUsp, setCompanyUsp] = React.useState(
    `${currentUser.company} helps sales teams find and engage the right prospects faster with AI-powered search, enrichment, and outreach — all in one place.`
  )
  const [productMode, setProductMode] = React.useState<ProductMode>("Company USP")
  const [productName, setProductName] = React.useState("")
  const [productUsp, setProductUsp] = React.useState("")

  // ICP builder
  const [decisionMakers, setDecisionMakers] = React.useState<string[]>([])
  const [influencers, setInfluencers] = React.useState<string[]>([])
  const [industries, setIndustries] = React.useState<string[]>([])
  const [countries, setCountries] = React.useState<string[]>([])

  const step = STEP_ORDER[stepIndex]
  const meta = STEP_META[step]
  const Icon = meta.icon
  const isLast = stepIndex === STEP_ORDER.length - 1

  // Required selections gate the Continue button; the rest is optional.
  const canContinue =
    step === "identity"
      ? name.trim() !== "" && salesRole !== null
      : step === "goal"
        ? goal !== null
        : step === "team"
          ? team !== null
          : step === "crm"
            ? crm !== null
            : true

  function toggleTool(tool: string) {
    setTools((prev) => {
      const next = new Set(prev)
      if (next.has(tool)) next.delete(tool)
      else next.add(tool)
      return next
    })
  }

  function finish() {
    // Persist what maps to the setup store; the rest tailors the experience.
    setup.setProfile(salesRole ?? team ?? "Sales", goal ? `Focus: ${goal}` : setup.goals)
    if (crm && crm !== NO_CRM) setup.complete("crm")

    const titles = [...decisionMakers, ...influencers]
    if (titles.length > 0 || industries.length > 0 || countries.length > 0) {
      const icp = icpStore.create({
        name: `${currentUser.company} ICP`,
        color: "#7c3aed",
        industries,
        headcount: "",
        titles,
        seniority: [],
        regions: countries,
        signals: [],
        primary: true,
      })
      // create() only wins primary if none already exists — this ICP should
      // become the active one regardless of the seeded demo ICPs.
      icpStore.setPrimary(icp.id)
    }

    setFinishing(true)
  }

  // Completion screen holds briefly (progress-ring beat) before redirecting.
  React.useEffect(() => {
    if (!finishing) return
    const t = window.setTimeout(() => {
      toast.success("You're all set — welcome to Kombo!")
      navigate("/get-started")
    }, 2200)
    return () => window.clearTimeout(t)
  }, [finishing, navigate])

  function next() {
    if (isLast) finish()
    else setStepIndex((s) => s + 1)
  }

  function back() {
    if (stepIndex === 0) navigate("/get-started")
    else setStepIndex((s) => s - 1)
  }

  if (finishing) {
    return <CompletionScreen name={name.split(" ")[0] || name} />
  }

  return (
    <div className="bg-muted/30 flex min-h-svh flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header: logo + progress */}
        <div className="flex items-center justify-between py-8">
          <KomboLogo />
          <span className="text-muted-foreground text-sm tabular-nums">
            {stepIndex + 1} / {STEP_ORDER.length}
          </span>
        </div>
        <div className="bg-border mb-10 h-1 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%`,
            }}
          />
        </div>

        {/* Step */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-2xl",
                meta.tint
              )}
            >
              <Icon className="size-6" />
            </span>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={back}
                aria-label="Back"
                className="text-muted-foreground hover:text-foreground hover:bg-muted mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {meta.title}
                </h1>
                <p className="text-muted-foreground">{meta.description}</p>
              </div>
            </div>
          </div>

          <div className="pl-11">
            {step === "identity" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="onb-name">Verify your name</Label>
                  <Input id="onb-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onb-linkedin">Verify your LinkedIn</Label>
                  <Input
                    id="onb-linkedin"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onb-website">Verify your company website</Label>
                  <Input
                    id="onb-website"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Your role</Label>
                  <ChipGroup
                    options={SALES_ROLES}
                    selected={(o) => salesRole === o}
                    onToggle={setSalesRole}
                  />
                </div>
              </div>
            )}

            {step === "goal" && (
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <RowOption
                    key={g}
                    label={g}
                    selected={goal === g}
                    onClick={() => setGoal(g)}
                  />
                ))}
              </div>
            )}

            {step === "team" && (
              <ChipGroup
                options={TEAMS}
                selected={(o) => team === o}
                onToggle={setTeam}
              />
            )}

            {step === "company" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="onb-usp">Company USP description</Label>
                  <Textarea
                    id="onb-usp"
                    value={companyUsp}
                    onChange={(e) => setCompanyUsp(e.target.value)}
                    className="min-h-28"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Add a specific product to sell — optional</Label>
                  <ChipGroup
                    options={[...PRODUCT_MODES]}
                    selected={(o) => productMode === o}
                    onToggle={(o) => setProductMode(o as ProductMode)}
                  />
                </div>
                {productMode === "Custom" && (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="onb-product-name">Product name</Label>
                      <Input
                        id="onb-product-name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Find Prospects"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="onb-product-usp">What is the product USP?</Label>
                      <Textarea
                        id="onb-product-usp"
                        value={productUsp}
                        onChange={(e) => setProductUsp(e.target.value)}
                        placeholder="What's the value of the product or what impact does it have. The why."
                        className="min-h-20"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === "icp" && (
              <div className="space-y-5">
                <TagInput
                  label="Decision makers"
                  placeholder="Add decision makers…"
                  values={decisionMakers}
                  onChange={setDecisionMakers}
                  suggestions={DECISION_MAKER_SUGGESTIONS}
                  suggestingLabel="Finding similar decision makers…"
                />
                <TagInput
                  label="Influencers"
                  placeholder="Add influencers…"
                  values={influencers}
                  onChange={setInfluencers}
                  suggestions={INFLUENCER_SUGGESTIONS}
                  suggestingLabel="Finding similar influencers…"
                />
                <TagInput
                  label="Industries"
                  placeholder="Add industries…"
                  values={industries}
                  onChange={setIndustries}
                  suggestions={INDUSTRY_OPTIONS}
                  suggestingLabel="Finding similar industries…"
                />
                <TagInput
                  label="Countries"
                  placeholder="Add countries…"
                  values={countries}
                  onChange={setCountries}
                  suggestions={COUNTRY_SUGGESTIONS}
                  suggestingLabel="Finding similar countries…"
                />
              </div>
            )}

            {step === "crm" && (
              <ChipGroup
                options={CRMS}
                selected={(o) => crm === o}
                onToggle={setCrm}
              />
            )}

            {step === "tools" && (
              <ChipGroup
                options={TOOLS}
                selected={(o) => tools.has(o)}
                onToggle={toggleTool}
              />
            )}

            {step === "source" && (
              <Textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. a colleague, a podcast, searching for prospecting tools…"
                className="min-h-28"
              />
            )}
          </div>

          <div className="flex items-center gap-3 pt-2 pl-11">
            <Button variant="volt" disabled={!canContinue} onClick={next}>
              {isLast ? "Start my first project" : "Continue"}
              {!isLast && <ArrowRight className="size-4" />}
            </Button>
            {!isLast && (
              <Button variant="ghost" onClick={() => navigate("/get-started")}>
                Skip for now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CompletionScreen({ name }: { name: string }) {
  return (
    <div className="bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="relative flex size-24 items-center justify-center">
        <div className="border-muted border-t-primary size-24 animate-spin rounded-full border-4" />
        <Rocket className="text-primary absolute size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          You're all done{name ? `, ${name}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          I'm setting up your initial prospect list now.
        </p>
      </div>
    </div>
  )
}

function RowOption({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
    >
      {label}
      {selected && <Check className="text-primary size-4 shrink-0" />}
    </button>
  )
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: (option: string) => boolean
  onToggle: (option: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary/5 text-primary"
                : "hover:bg-muted/50"
            )}
          >
            {active && <Check className="size-3.5 shrink-0" />}
            {option}
          </button>
        )
      })}
    </div>
  )
}

const TAG_PREVIEW_COUNT = 6

// Free-text chip input used by the ICP-builder step. Adding the first chip
// triggers a brief simulated AI pass that appends a few related suggestions —
// mirrors the extension's "finding similar X…" onboarding behavior.
function TagInput({
  label,
  placeholder,
  values,
  onChange,
  suggestions,
  suggestingLabel,
}: {
  label: string
  placeholder: string
  values: string[]
  onChange: (next: string[]) => void
  suggestions: string[]
  suggestingLabel: string
}) {
  const [text, setText] = React.useState("")
  const [suggesting, setSuggesting] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  function addValue(v: string) {
    const trimmed = v.trim()
    if (!trimmed || values.includes(trimmed)) return
    const wasEmpty = values.length === 0
    const next = [...values, trimmed]
    onChange(next)
    if (wasEmpty) {
      setSuggesting(true)
      window.setTimeout(() => {
        const have = new Set(next)
        const extra = suggestions.filter((s) => !have.has(s)).slice(0, 3)
        onChange([...next, ...extra])
        setSuggesting(false)
      }, 900)
    }
  }

  const shown = expanded ? values : values.slice(0, TAG_PREVIEW_COUNT)
  const hiddenCount = values.length - shown.length

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {values.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
          >
            <X className="size-3.5" />
            Clear all ({values.length})
          </button>
        )}
      </div>
      <div className="relative">
        <Sparkles className="text-primary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addValue(text)
              setText("")
            }
          }}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {suggesting && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Sparkles className="size-3.5 animate-pulse" />
          {suggestingLabel}
        </p>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {shown.map((v) => (
            <span
              key={v}
              className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-medium"
            >
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="rounded-full p-0.5 hover:bg-black/10"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-primary text-xs font-medium hover:underline"
            >
              View more ({hiddenCount})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
