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
} from "lucide-react"

import { KomboLogo } from "@/components/KomboLogo"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSetup } from "@/lib/setup"
import { cn } from "@/lib/utils"

type StepId = "goal" | "team" | "crm" | "tools" | "source"

const STEP_ORDER: StepId[] = ["goal", "team", "crm", "tools", "source"]

const GOALS = [
  "Find and enrich people",
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

const STEP_META: Record<
  StepId,
  {
    icon: React.ComponentType<{ className?: string }>
    tint: string
    title: string
    description: string
  }
> = {
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
  const [goal, setGoal] = React.useState<string | null>(null)
  const [team, setTeam] = React.useState<string | null>(null)
  const [crm, setCrm] = React.useState<string | null>(null)
  const [tools, setTools] = React.useState<Set<string>>(new Set())
  const [source, setSource] = React.useState("")

  const step = STEP_ORDER[stepIndex]
  const meta = STEP_META[step]
  const Icon = meta.icon
  const isLast = stepIndex === STEP_ORDER.length - 1

  // Required selections gate the Continue button; tools and source are optional.
  const canContinue =
    step === "goal"
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
    setup.setProfile(team ?? "Sales", goal ? `Focus: ${goal}` : setup.goals)
    if (crm && crm !== NO_CRM) setup.complete("crm")
    toast.success("You're all set — welcome to Kombo!")
    navigate("/get-started")
  }

  function next() {
    if (isLast) finish()
    else setStepIndex((s) => s + 1)
  }

  function back() {
    if (stepIndex === 0) navigate("/get-started")
    else setStepIndex((s) => s - 1)
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
