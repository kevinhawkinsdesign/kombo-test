import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Send,
  Mail,
  MessageSquare,
  MessageCircle,
  Camera,
  Users,
  ListChecks,
  Workflow,
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  FolderKanban,
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useLocale } from "@/lib/locale"
import { useLists, campaignStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { CampaignStep, StepChannel } from "@/lib/types"

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

/* ------------------------------ channel meta ----------------------------- */

const CHANNELS: Record<
  StepChannel,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  email: { icon: Mail, tint: "bg-primary/15 text-primary" },
  sms: { icon: MessageSquare, tint: "bg-chart-4/15 text-chart-4" },
  whatsapp: { icon: MessageCircle, tint: "bg-chart-1/15 text-chart-1" },
  instagram: { icon: Camera, tint: "bg-chart-5/15 text-chart-5" },
  linkedin_message: { icon: LinkedinIcon, tint: "bg-[#0a66c2]/15 text-[#0a66c2]" },
  linkedin_dm: { icon: LinkedinIcon, tint: "bg-[#0a66c2]/15 text-[#0a66c2]" },
  linkedin_inmail: { icon: LinkedinIcon, tint: "bg-[#0a66c2]/15 text-[#0a66c2]" },
}

const CHANNEL_ORDER: StepChannel[] = [
  "email",
  "linkedin_message",
  "linkedin_dm",
  "linkedin_inmail",
  "sms",
  "whatsapp",
  "instagram",
]

const COPY = {
  en: {
    title: "New campaign",
    desc: "Set up a multi-channel sequence in a few steps.",
    steps: ["Basics", "Audience", "Sequence", "Review"],
    next: "Continue",
    back: "Back",
    cancel: "Cancel",
    // step 1
    nameLabel: "Campaign name",
    namePlaceholder: "e.g. Enterprise CRO Outbound",
    goalLabel: "Goal (optional)",
    goalPlaceholder: "What outcome are you driving? Book demos, revive cold leads…",
    // step 2
    audienceTitle: "Who should this campaign reach?",
    audienceBody: "Attach a list now, or add prospects later.",
    later: "I'll add prospects later",
    laterDesc: "Start empty and enroll prospects when you're ready.",
    listProspects: (n: number) => `${n} ${n === 1 ? "prospect" : "prospects"}`,
    dynamic: "Dynamic",
    noLists: "No lists yet — you can add prospects after creating the campaign.",
    // step 3
    sequenceTitle: "Pick a starting sequence",
    sequenceBody: "Choose a proven cadence — you can fine-tune every step.",
    presets: {
      email: { name: "Email-first", desc: "Email → follow-up → LinkedIn touch" },
      multi: { name: "Multi-channel", desc: "Email → LinkedIn DM → email" },
      linkedin: { name: "LinkedIn-led", desc: "LinkedIn → email → InMail" },
      scratch: { name: "Start from scratch", desc: "Build your own steps" },
    },
    stepsHeading: "Steps",
    addStep: "Add step",
    day: "Day",
    immediately: "Immediately",
    waitDays: (d: number) => `Wait ${d} day${d === 1 ? "" : "s"}`,
    noSteps: "No steps yet — add one to build your sequence.",
    // step 4
    reviewTitle: "Review & create",
    reviewName: "Campaign",
    reviewAudience: "Audience",
    reviewSequence: "Sequence",
    stepsCount: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    createDraft: "Save as draft",
    launch: "Create & launch",
    createdDraft: (name: string) => `"${name}" created as a draft`,
    launched: (name: string) => `"${name}" is now active`,
    untitled: "Untitled campaign",
    channels: {
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      linkedin_message: "LinkedIn message",
      linkedin_dm: "LinkedIn DM",
      linkedin_inmail: "LinkedIn InMail",
    } as Record<StepChannel, string>,
  },
  es: {
    title: "Nueva campaña",
    desc: "Configura una secuencia multicanal en unos pasos.",
    steps: ["Básicos", "Audiencia", "Secuencia", "Revisar"],
    next: "Continuar",
    back: "Atrás",
    cancel: "Cancelar",
    nameLabel: "Nombre de la campaña",
    namePlaceholder: "p. ej. Outbound CRO Enterprise",
    goalLabel: "Objetivo (opcional)",
    goalPlaceholder: "¿Qué resultado buscas? Agendar demos, reactivar leads fríos…",
    audienceTitle: "¿A quién debe llegar esta campaña?",
    audienceBody: "Adjunta una lista ahora o añade prospectos más tarde.",
    later: "Añadiré prospectos más tarde",
    laterDesc: "Empieza vacía e inscribe prospectos cuando quieras.",
    listProspects: (n: number) => `${n} ${n === 1 ? "prospecto" : "prospectos"}`,
    dynamic: "Dinámica",
    noLists: "Aún no hay listas — puedes añadir prospectos tras crear la campaña.",
    sequenceTitle: "Elige una secuencia inicial",
    sequenceBody: "Elige una cadencia probada — podrás ajustar cada paso.",
    presets: {
      email: { name: "Email primero", desc: "Email → seguimiento → LinkedIn" },
      multi: { name: "Multicanal", desc: "Email → DM de LinkedIn → email" },
      linkedin: { name: "LinkedIn primero", desc: "LinkedIn → email → InMail" },
      scratch: { name: "Empezar de cero", desc: "Crea tus propios pasos" },
    },
    stepsHeading: "Pasos",
    addStep: "Añadir paso",
    day: "Día",
    immediately: "Inmediatamente",
    waitDays: (d: number) => `Esperar ${d} día${d === 1 ? "" : "s"}`,
    noSteps: "Aún no hay pasos — añade uno para construir tu secuencia.",
    reviewTitle: "Revisar y crear",
    reviewName: "Campaña",
    reviewAudience: "Audiencia",
    reviewSequence: "Secuencia",
    stepsCount: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    createDraft: "Guardar como borrador",
    launch: "Crear y lanzar",
    createdDraft: (name: string) => `"${name}" creada como borrador`,
    launched: (name: string) => `"${name}" ya está activa`,
    untitled: "Campaña sin título",
    channels: {
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      linkedin_message: "Mensaje de LinkedIn",
      linkedin_dm: "DM de LinkedIn",
      linkedin_inmail: "InMail de LinkedIn",
    } as Record<StepChannel, string>,
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]
type PresetId = "email" | "multi" | "linkedin" | "scratch"

const PRESET_STEPS: Record<PresetId, [StepChannel, number][]> = {
  email: [
    ["email", 0],
    ["email", 3],
    ["linkedin_message", 5],
  ],
  multi: [
    ["email", 0],
    ["linkedin_dm", 2],
    ["email", 4],
  ],
  linkedin: [
    ["linkedin_message", 0],
    ["email", 2],
    ["linkedin_inmail", 5],
  ],
  scratch: [],
}

let stepCounter = 0
function makeStep(channel: StepChannel, delayDays: number): CampaignStep {
  stepCounter += 1
  return { id: `ws_${Date.now()}_${stepCounter}`, channel, delayDays, subject: "", body: "" }
}

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
  const lists = useLists()

  const [step, setStep] = React.useState(0)
  const [name, setName] = React.useState("")
  const [goal, setGoal] = React.useState("")
  const [listId, setListId] = React.useState<string | null>(null)
  const [preset, setPreset] = React.useState<PresetId>("email")
  const [steps, setSteps] = React.useState<CampaignStep[]>([])

  // Reset whenever the wizard re-opens (render-time pattern).
  const [wasOpen, setWasOpen] = React.useState(false)
  if (open && !wasOpen) {
    setWasOpen(true)
    setStep(0)
    setName("")
    setGoal("")
    setListId(null)
    setPreset("email")
    setSteps(PRESET_STEPS.email.map(([ch, d]) => makeStep(ch, d)))
  }
  if (!open && wasOpen) setWasOpen(false)

  function choosePreset(id: PresetId) {
    setPreset(id)
    setSteps(PRESET_STEPS[id].map(([ch, d]) => makeStep(ch, d)))
  }

  function addStep() {
    setSteps((s) => [...s, makeStep("email", s.length === 0 ? 0 : 3)])
  }
  function updateStep(id: string, patch: Partial<CampaignStep>) {
    setSteps((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }
  function removeStep(id: string) {
    setSteps((s) => s.filter((x) => x.id !== id))
  }

  const canNext = step === 0 ? name.trim().length > 0 : true

  function finish(launch: boolean) {
    const finalName = name.trim() || c.untitled
    const campaign = campaignStore.create({
      name: finalName,
      status: launch ? "active" : "draft",
      steps,
    })
    if (listId) campaignStore.attachList(campaign.id, listId)
    toast.success(launch ? c.launched(finalName) : c.createdDraft(finalName))
    onOpenChange(false)
    navigate(`/campaigns/${campaign.id}`)
  }

  const selectedList = lists.find((l) => l.id === listId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-screen w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-[92vh] sm:max-w-3xl sm:rounded-xl"
      >
        <DialogHeader className="border-b p-5 text-left">
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-volt/15 text-volt flex size-7 items-center justify-center rounded-md">
              <Send className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.desc}</DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 border-b px-5 py-3">
          {c.steps.map((label, i) => {
            const Icon = [ListChecks, Users, Workflow, Rocket][i]
            const active = i === step
            const done = i < step
            return (
              <React.Fragment key={label}>
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    active
                      ? "text-foreground"
                      : done
                        ? "text-primary"
                        : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border text-xs",
                      active && "border-primary bg-primary text-primary-foreground",
                      done && "border-primary bg-primary/10 text-primary",
                      !active && !done && "border-border"
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < c.steps.length - 1 && (
                  <div className="bg-border h-px flex-1" />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {step === 0 && (
            <div className="mx-auto max-w-xl space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="wiz-name">{c.nameLabel}</Label>
                <Input
                  id="wiz-name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.namePlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wiz-goal">{c.goalLabel}</Label>
                <Textarea
                  id="wiz-goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={c.goalPlaceholder}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mx-auto max-w-xl space-y-4">
              <div>
                <h3 className="font-semibold">{c.audienceTitle}</h3>
                <p className="text-muted-foreground text-sm">{c.audienceBody}</p>
              </div>
              <button
                type="button"
                onClick={() => setListId(null)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  listId === null ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                )}
              >
                <span className="bg-muted flex size-9 items-center justify-center rounded-lg">
                  <Plus className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{c.later}</span>
                  <span className="text-muted-foreground block text-xs">{c.laterDesc}</span>
                </span>
                {listId === null && <Check className="text-primary size-4" />}
              </button>

              {lists.length === 0 ? (
                <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                  {c.noLists}
                </p>
              ) : (
                <div className="space-y-2">
                  {lists.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setListId(l.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        listId === l.id ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                      )}
                    >
                      <span
                        className="flex size-9 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: l.color }}
                      >
                        <FolderKanban className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{l.name}</span>
                        <span className="text-muted-foreground block text-xs">
                          {c.listProspects(l.prospectIds.length)}
                          {l.dynamic ? ` · ${c.dynamic}` : ""}
                        </span>
                      </span>
                      {listId === l.id && <Check className="text-primary size-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mx-auto max-w-xl space-y-5">
              <div>
                <h3 className="font-semibold">{c.sequenceTitle}</h3>
                <p className="text-muted-foreground text-sm">{c.sequenceBody}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PRESET_STEPS) as PresetId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choosePreset(id)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      preset === id ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                    )}
                  >
                    <p className="text-sm font-medium">{c.presets[id].name}</p>
                    <p className="text-muted-foreground text-xs">{c.presets[id].desc}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{c.stepsHeading}</p>
                  <Button variant="outline" size="sm" onClick={addStep}>
                    <Plus className="size-4" />
                    {c.addStep}
                  </Button>
                </div>
                {steps.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                    {c.noSteps}
                  </p>
                ) : (
                  steps.map((s, i) => (
                    <StepRow
                      key={s.id}
                      step={s}
                      index={i}
                      c={c}
                      onChannel={(ch) => updateStep(s.id, { channel: ch })}
                      onDelay={(d) => updateStep(s.id, { delayDays: d })}
                      onRemove={() => removeStep(s.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto max-w-xl space-y-4">
              <h3 className="font-semibold">{c.reviewTitle}</h3>
              <ReviewRow icon={Send} label={c.reviewName} value={name.trim() || c.untitled} />
              <ReviewRow
                icon={Users}
                label={c.reviewAudience}
                value={selectedList ? selectedList.name : c.later}
              />
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
                  <Workflow className="size-3.5" />
                  {c.reviewSequence} · {c.stepsCount(steps.length)}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {steps.map((s, i) => {
                    const meta = CHANNELS[s.channel]
                    const Icon = meta.icon
                    return (
                      <React.Fragment key={s.id}>
                        {i > 0 && <ChevronRight className="text-muted-foreground size-3.5" />}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium",
                            meta.tint
                          )}
                        >
                          <Icon className="size-3.5" />
                          {c.channels[s.channel]}
                        </span>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t p-4">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? onOpenChange(false) : setStep((s) => s - 1))}
          >
            {step === 0 ? (
              c.cancel
            ) : (
              <>
                <ChevronLeft className="size-4" />
                {c.back}
              </>
            )}
          </Button>

          {step < 3 ? (
            <Button variant="volt" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              {c.next}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => finish(false)}>
                {c.createDraft}
              </Button>
              <Button variant="volt" onClick={() => finish(true)}>
                <Rocket className="size-4" />
                {c.launch}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StepRow({
  step,
  index,
  c,
  onChannel,
  onDelay,
  onRemove,
}: {
  step: CampaignStep
  index: number
  c: Copy
  onChannel: (ch: StepChannel) => void
  onDelay: (d: number) => void
  onRemove: () => void
}) {
  const meta = CHANNELS[step.channel]
  const Icon = meta.icon
  return (
    <div className="flex items-center gap-2 rounded-lg border p-2.5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
          "bg-muted text-muted-foreground"
        )}
      >
        {index + 1}
      </span>
      <span className={cn("flex size-8 items-center justify-center rounded-md", meta.tint)}>
        <Icon className="size-4" />
      </span>
      <Select value={step.channel} onValueChange={(v) => onChannel(v as StepChannel)}>
        <SelectTrigger size="sm" className="w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CHANNEL_ORDER.map((ch) => (
            <SelectItem key={ch} value={ch}>
              {c.channels[ch]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="text-muted-foreground ml-auto flex items-center gap-1.5 text-xs">
        <Clock className="size-3.5" />
        {index === 0 ? (
          c.immediately
        ) : (
          <span className="inline-flex items-center gap-1">
            <Input
              type="number"
              min={0}
              value={step.delayDays}
              onChange={(e) => onDelay(Math.max(0, Number(e.target.value) || 0))}
              className="h-7 w-14 text-center"
              aria-label={c.day}
            />
            d
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-8"
        onClick={onRemove}
        aria-label="Remove step"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

function ReviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
