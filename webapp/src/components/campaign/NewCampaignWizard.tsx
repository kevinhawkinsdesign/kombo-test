import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Rocket, PenLine, Copy } from "lucide-react"

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
import { SearchCombobox } from "@/components/common/SearchCombobox"
import { useLocale } from "@/lib/locale"
import { useCampaigns, campaignStore, flattenCampaignSteps } from "@/lib/store"
import { cloneSequenceSteps } from "@/lib/sequence-templates"
import { cn } from "@/lib/utils"

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
    modeCopy: "Copy a campaign",
    modeCopyDesc: "Duplicate another campaign's whole sequence.",
    copyFromLabel: "Copy from",
    copySearchPlaceholder: "Search campaigns…",
    copyEmpty: "No campaigns found.",
    copyPlaceholder: "Choose a campaign…",
    stepCount: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    nameLabel: "Campaign name",
    namePlaceholder: "e.g. Enterprise CRO Outbound",
    goalLabel: "Goal / intent",
    goalPlaceholder:
      "What outcome are you driving? Book demos, revive cold leads, expand into a new segment…",
    goalOptional: "Optional",
    copySuffix: "(copy)",
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
    modeCopy: "Copiar una campaña",
    modeCopyDesc: "Duplica la secuencia completa de otra campaña.",
    copyFromLabel: "Copiar de",
    copySearchPlaceholder: "Buscar campañas…",
    copyEmpty: "No se encontraron campañas.",
    copyPlaceholder: "Elige una campaña…",
    stepCount: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    nameLabel: "Nombre de la campaña",
    namePlaceholder: "p. ej. Outbound CRO Enterprise",
    goalLabel: "Objetivo / intención",
    goalPlaceholder:
      "¿Qué resultado buscas? Agendar demos, reactivar leads fríos, entrar en un nuevo segmento…",
    goalOptional: "Opcional",
    copySuffix: "(copia)",
    cancel: "Cancelar",
    create: "Crear campaña",
    created: (name: string) => `«${name}» creada`,
    nextStepsHint:
      "Siguiente: crea la secuencia y añade una audiencia desde la página de la campaña.",
  },
} as const

type Mode = "manual" | "copy"

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
  const campaigns = useCampaigns()

  const [mode, setMode] = React.useState<Mode>("manual")
  const [copySourceId, setCopySourceId] = React.useState("")
  const [name, setName] = React.useState("")
  const [nameTouched, setNameTouched] = React.useState(false)
  const [goal, setGoal] = React.useState("")

  // Reset on open (render-time check, house pattern — never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setMode("manual")
      setCopySourceId("")
      setName("")
      setNameTouched(false)
      setGoal("")
    }
  }

  const copySource = campaigns.find((cm) => cm.id === copySourceId)
  const copyOptions = campaigns.map((cm) => ({
    value: cm.id,
    label: cm.name,
    sublabel: c.stepCount(flattenCampaignSteps(cm.steps).length),
  }))

  function pickCopySource(id: string) {
    setCopySourceId(id)
    const source = campaigns.find((cm) => cm.id === id)
    if (source && !nameTouched) {
      setName(`${source.name} ${c.copySuffix}`)
      if (!goal.trim()) setGoal(source.goal ?? "")
    }
  }

  const trimmedName = name.trim()
  const canCreate =
    trimmedName.length > 0 && (mode === "manual" || Boolean(copySource))

  function create() {
    if (!canCreate) return
    const created = campaignStore.create({
      name: trimmedName,
      status: "draft",
      locale,
      goal: goal.trim() || undefined,
    })
    if (mode === "copy" && copySource) {
      campaignStore.update(created.id, {
        steps: cloneSequenceSteps(copySource.steps),
      })
    }
    toast.success(c.created(trimmedName))
    onOpenChange(false)
    navigate(`/campaigns/${created.id}`)
  }

  return (
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

        <div className="grid gap-2 sm:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="copy-source">{c.copyFromLabel}</Label>
            <SearchCombobox
              id="copy-source"
              value={copySourceId}
              onChange={pickCopySource}
              options={copyOptions}
              placeholder={c.copyPlaceholder}
              searchPlaceholder={c.copySearchPlaceholder}
              emptyText={c.copyEmpty}
              className="w-full"
            />
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
            <span className="text-muted-foreground text-xs">{c.goalOptional}</span>
          </div>
          <Textarea
            id="campaign-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={c.goalPlaceholder}
            className="min-h-16 resize-none"
          />
        </div>

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
  )
}
