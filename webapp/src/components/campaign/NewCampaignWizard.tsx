import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Send } from "lucide-react"

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
import { useLocale } from "@/lib/locale"
import { campaignStore } from "@/lib/store"

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
    desc: "Name it and set the goal — you'll attach a list and add prospects on the next screen.",
    nameLabel: "Campaign name",
    namePlaceholder: "e.g. Enterprise CRO Outbound",
    goalLabel: "Goal / intent",
    goalPlaceholder:
      "What outcome are you driving? Book demos, revive cold leads, expand into a new segment…",
    cancel: "Cancel",
    create: "Create campaign",
    created: (name: string) => `"${name}" created — set up its audience`,
  },
  es: {
    title: "Nueva campaña",
    desc: "Ponle nombre y define el objetivo — adjuntarás una lista y añadirás prospectos en la siguiente pantalla.",
    nameLabel: "Nombre de la campaña",
    namePlaceholder: "p. ej. Outbound CRO Enterprise",
    goalLabel: "Objetivo / intención",
    goalPlaceholder:
      "¿Qué resultado buscas? Agendar demos, reactivar leads fríos, entrar en un nuevo segmento…",
    cancel: "Cancelar",
    create: "Crear campaña",
    created: (name: string) => `«${name}» creada — configura su audiencia`,
  },
} as const

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

  const [name, setName] = React.useState("")
  const [goal, setGoal] = React.useState("")

  // Reset on open (render-time, per React guidance — no cascading effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName("")
      setGoal("")
    }
  }

  const canCreate = name.trim().length > 0

  function create() {
    if (!canCreate) return
    const campaign = campaignStore.create({
      name: name.trim(),
      goal: goal.trim() || undefined,
      status: "draft",
    })
    onOpenChange(false)
    toast.success(c.created(campaign.name))
    navigate(`/campaigns/${campaign.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">{c.nameLabel}</Label>
            <Input
              id="campaign-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") create()
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-goal">{c.goalLabel}</Label>
            <Textarea
              id="campaign-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={c.goalPlaceholder}
              className="min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={create} disabled={!canCreate}>
            <Send className="size-4" />
            {c.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
