import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Check, ArrowRight, ArrowLeft, Plug, Target, Users } from "lucide-react"

import { KomboLogo } from "@/components/KomboLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSetup } from "@/lib/setup"
import { cn } from "@/lib/utils"

const ROLES = [
  "RevOps",
  "Head of Sales / VP",
  "Account Executive",
  "SDR / BDR",
]

const CRMS = ["HubSpot", "Salesforce", "Pipedrive", "None yet"]

const STEPS = [
  { title: "Your role", icon: Users },
  { title: "Connect CRM", icon: Plug },
  { title: "Your ICP", icon: Target },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = React.useState(0)
  const [role, setRole] = React.useState(ROLES[1])
  const [crm, setCrm] = React.useState(CRMS[0])
  const [industry, setIndustry] = React.useState("B2B SaaS")
  const [titles, setTitles] = React.useState("VP Sales, CRO, Head of RevOps")

  const setup = useSetup()
  const isLast = step === STEPS.length - 1

  function next() {
    if (isLast) {
      setup.setProfile(role, `Focus: ${industry} · ${titles}`)
      if (crm !== "None yet") setup.complete("crm")
      toast.success("You're all set — welcome to Kombo!")
      navigate("/")
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="bg-muted/30 flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <KomboLogo />
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.title}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "bg-primary/15 text-primary ring-primary ring-2"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-sm sm:block",
                    i === step ? "font-medium" : "text-muted-foreground"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="bg-border h-px w-6" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          {step === 0 && (
            <Step
              title="What's your role?"
              subtitle="We'll tailor your workspace and dashboards."
            >
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <Option
                    key={r}
                    label={r}
                    active={role === r}
                    onClick={() => setRole(r)}
                  />
                ))}
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step
              title="Connect your CRM"
              subtitle="Sync prospects, activities, and deals two-way."
            >
              <div className="grid grid-cols-2 gap-3">
                {CRMS.map((c) => (
                  <Option
                    key={c}
                    label={c}
                    active={crm === c}
                    onClick={() => setCrm(c)}
                  />
                ))}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Define your ICP"
              subtitle="Kombo uses this to score and recommend prospects."
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Target industry</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titles">Target titles</Label>
                  <Input
                    id="titles"
                    value={titles}
                    onChange={(e) => setTitles(e.target.value)}
                  />
                </div>
              </div>
            </Step>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Skip
              </Button>
              <Button onClick={next}>
                {isLast ? "Finish" : "Continue"}
                {!isLast && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-1 mb-5 text-sm">{subtitle}</p>
      {children}
    </div>
  )
}

function Option({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
    >
      {label}
      {active && <Check className="text-primary size-4" />}
    </button>
  )
}
