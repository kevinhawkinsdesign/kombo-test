import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Rocket, PenLine, Copy, Sparkles, RefreshCw } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CopySequenceDialog } from "@/components/campaign/CopySequenceDialog"
import { useLocale } from "@/lib/locale"
import { campaignStore } from "@/lib/store"
import { cloneSequenceSteps } from "@/lib/sequence-templates"
import { generateSequenceFromPrompt } from "@/lib/prompt-templates"
import { channelMeta } from "@/lib/step-channels"
import { cn } from "@/lib/utils"
import type { CampaignStep } from "@/lib/types"

/* ----------------------------- context ---------------------------------- */

interface NewCampaignCtx {
  open: () => void
}

const Ctx = React.createContext<NewCampaignCtx | undefined>(undefined)

export function useNewCampaign(): NewCampaignCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useNewCampaign must be used within NewCampaignProvider")
  return ctx
}

export function NewCampaignProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(() => ({ open: () => setOpen(true) }), [])
  return (
    <Ctx.Provider value={value}>
      {children}
      <NewCampaignWizard open={open} onOpenChange={setOpen} />
    </Ctx.Provider>
  )
}

/* ------------------------------- copy ------------------------------------ */

const COPY = {
  en: {
    title: "New campaign",
    modeManual: "Create manually",
    modeManualDesc: "Just a name and a goal — build the sequence and audience after.",
    modeCopy: "Duplicate",
    modeCopyDesc: "Reuse another campaign's or a saved template's whole sequence.",
    modePrompt: "Generate with AI",
    modePromptDesc: "Describe the outcome — get a full sequence.",
    chooseSource: "Choose a campaign or template…",
    changeSource: "Change",
    sourceSteps: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    nameLabel: "Campaign name",
    namePlaceholder: "e.g. Enterprise CRO Outbound",
    goalLabel: "Goal / intent",
    goalPlaceholder:
      "What outcome are you driving? Book demos, revive cold leads, expand into a new segment…",
    goalPlaceholderPrompt:
      "Book demos with VPs of Sales at mid-market SaaS companies — 3-4 touches over two weeks, email + LinkedIn…",
    goalOptional: "Optional",
    copySuffix: "(copy)",
    generateSequence: "Generate sequence",
    regenerate: "Regenerate",
    dayLabel: (n: number) => (n === 0 ? "Day 0" : `Day ${n}`),
    cancel: "Cancel",
    create: "Create campaign",
    created: (name: string) => `"${name}" created`,
    nextStepsHint:
      "Next: build the sequence and attach an audience from the campaign page.",
  },
  es: {
    title: "Nueva campaña",
    modeManual: "Crear manualmente",
    modeManualDesc: "Solo un nombre y un objetivo — la secuencia y la audiencia se hacen después.",
    modeCopy: "Duplicar",
    modeCopyDesc: "Reutiliza la secuencia completa de otra campaña o de una plantilla guardada.",
    modePrompt: "Generar con IA",
    modePromptDesc: "Describe el resultado — obtén una secuencia completa.",
    chooseSource: "Elige una campaña o plantilla…",
    changeSource: "Cambiar",
    sourceSteps: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    nameLabel: "Nombre de la campaña",
    namePlaceholder: "p. ej. Outbound CRO Enterprise",
    goalLabel: "Objetivo / intención",
    goalPlaceholder:
      "¿Qué resultado buscas? Agendar demos, reactivar leads fríos, entrar en un nuevo segmento…",
    goalPlaceholderPrompt:
      "Agendar demos con VPs de Ventas en empresas SaaS medianas — 3-4 toques en dos semanas, email + LinkedIn…",
    goalOptional: "Opcional",
    copySuffix: "(copia)",
    generateSequence: "Generar secuencia",
    regenerate: "Regenerar",
    dayLabel: (n: number) => (n === 0 ? "Día 0" : `Día ${n}`),
    cancel: "Cancelar",
    create: "Crear campaña",
    created: (name: string) => `«${name}» creada`,
    nextStepsHint:
      "Siguiente: crea la secuencia y añade una audiencia desde la página de la campaña.",
  },
} as const

type Mode = "manual" | "copy" | "prompt"

/* ------------------------------ component -------------------------------- */

function NewCampaignWizard({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()

  const [mode, setMode] = React.useState<Mode>("manual")
  const [name, setName] = React.useState("")
  const [nameTouched, setNameTouched] = React.useState(false)
  const [goal, setGoal] = React.useState("")

  const [copySeqOpen, setCopySeqOpen] = React.useState(false)
  const [copiedSteps, setCopiedSteps] = React.useState<CampaignStep[] | null>(null)
  const [copiedSourceName, setCopiedSourceName] = React.useState("")

  const [generatedSteps, setGeneratedSteps] = React.useState<CampaignStep[] | null>(null)
  const [genSeed, setGenSeed] = React.useState(0)

  // Reset on open (render-time check, house pattern — never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setMode("manual")
      setName("")
      setNameTouched(false)
      setGoal("")
      setCopySeqOpen(false)
      setCopiedSteps(null)
      setCopiedSourceName("")
      setGeneratedSteps(null)
      setGenSeed(0)
    }
  }

  function handleCopied(steps: CampaignStep[], sourceName: string) {
    setCopiedSteps(steps)
    setCopiedSourceName(sourceName)
    if (!nameTouched) setName(`${sourceName} ${c.copySuffix}`)
  }

  function generate() {
    const nextSeed = generatedSteps ? genSeed + 1 : genSeed
    setGenSeed(nextSeed)
    setGeneratedSteps(generateSequenceFromPrompt(goal.trim(), nextSeed))
  }

  const trimmedName = name.trim()
  const canCreate =
    trimmedName.length > 0 &&
    (mode === "manual" ||
      (mode === "copy" && Boolean(copiedSteps?.length)) ||
      (mode === "prompt" && Boolean(generatedSteps?.length)))

  function create() {
    if (!canCreate) return
    const created = campaignStore.create({
      name: trimmedName,
      status: "draft",
      locale,
      goal: goal.trim() || undefined,
    })
    if (mode === "copy" && copiedSteps) {
      campaignStore.update(created.id, { steps: cloneSequenceSteps(copiedSteps) })
    } else if (mode === "prompt" && generatedSteps) {
      campaignStore.update(created.id, { steps: generatedSteps })
    }
    toast.success(c.created(trimmedName))
    onOpenChange(false)
    navigate(`/campaigns/${created.id}`)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Rocket className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription className="sr-only">{c.title}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setMode("manual")}
            aria-pressed={mode === "manual"}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
              mode === "manual"
                ? "border-primary ring-primary/30 bg-primary/5 ring-1"
                : "hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-md",
                mode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <PenLine className="size-3.5" />
            </span>
            <span className="text-sm font-medium">{c.modeManual}</span>
            <span className="text-muted-foreground text-xs">
              {c.modeManualDesc}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("prompt")}
            aria-pressed={mode === "prompt"}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
              mode === "prompt"
                ? "border-primary ring-primary/30 bg-primary/5 ring-1"
                : "hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-md",
                mode === "prompt"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-sm font-medium">{c.modePrompt}</span>
            <span className="text-muted-foreground text-xs">
              {c.modePromptDesc}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("copy")}
            aria-pressed={mode === "copy"}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
              mode === "copy"
                ? "border-primary ring-primary/30 bg-primary/5 ring-1"
                : "hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-md",
                mode === "copy"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Copy className="size-3.5" />
            </span>
            <span className="text-sm font-medium">{c.modeCopy}</span>
            <span className="text-muted-foreground text-xs">
              {c.modeCopyDesc}
            </span>
          </button>
        </div>

        {mode === "copy" && (
          <div className="min-w-0 space-y-2">
            {copiedSteps ? (
              <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {copiedSourceName}
                  </span>
                  <Badge variant="secondary" className="mt-0.5 font-normal">
                    {c.sourceSteps(copiedSteps.length)}
                  </Badge>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCopySeqOpen(true)}
                >
                  {c.changeSource}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setCopySeqOpen(true)}
              >
                <Copy className="size-4" />
                {c.chooseSource}
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="campaign-name">{c.nameLabel}</Label>
          <Input
            id="campaign-name"
            autoFocus={mode === "manual"}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNameTouched(true)
            }}
            placeholder={c.namePlaceholder}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="campaign-goal">{c.goalLabel}</Label>
            {mode !== "prompt" && (
              <span className="text-muted-foreground text-xs">{c.goalOptional}</span>
            )}
          </div>
          <Textarea
            id="campaign-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={mode === "prompt" ? c.goalPlaceholderPrompt : c.goalPlaceholder}
            className="min-h-16 resize-none"
          />
        </div>

        {mode === "prompt" && (
          <div className="min-w-0 space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generate}
              disabled={!goal.trim()}
            >
              {generatedSteps ? (
                <RefreshCw className="size-3.5" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {generatedSteps ? c.regenerate : c.generateSequence}
            </Button>
            {generatedSteps && (
              <div className="min-w-0 space-y-1 rounded-lg border p-2">
                {generatedSteps.map((step) => {
                  const meta = channelMeta(step.channel)
                  const Icon = meta.Icon
                  return (
                    <div key={step.id} className="flex min-w-0 items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded",
                          meta.tint
                        )}
                      >
                        <Icon className="size-3" />
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {c.dayLabel(step.delayDays)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {step.subject || step.body}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <p className="text-muted-foreground text-xs">{c.nextStepsHint}</p>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={create} disabled={!canCreate}>
            <Rocket className="size-4" />
            {c.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <CopySequenceDialog
      open={copySeqOpen}
      onOpenChange={setCopySeqOpen}
      currentCampaignId=""
      onCopy={handleCopied}
    />
    </>
  )
}
