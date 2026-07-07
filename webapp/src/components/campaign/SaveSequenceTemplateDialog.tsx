import * as React from "react"
import { toast } from "sonner"
import { Bookmark } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sequenceTemplateStore } from "@/lib/sequence-templates"
import { flattenCampaignSteps } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import type { CampaignStep } from "@/lib/types"

const COPY = {
  en: {
    title: "Save sequence as template",
    description: (n: number) =>
      `Saves the current ${n} ${n === 1 ? "step" : "steps"} — delays and message content included — so any campaign can start from it.`,
    nameLabel: "Template name",
    namePlaceholder: "e.g. Enterprise outbound — 5 touches",
    cancel: "Cancel",
    save: "Save template",
    created: "Sequence template created",
  },
  es: {
    title: "Guardar secuencia como plantilla",
    description: (n: number) =>
      `Guarda ${n === 1 ? "el paso actual" : `los ${n} pasos actuales`} — con sus tiempos y contenido — para que cualquier campaña pueda empezar desde ahí.`,
    nameLabel: "Nombre de la plantilla",
    namePlaceholder: "p. ej. Outbound enterprise — 5 toques",
    cancel: "Cancelar",
    save: "Guardar plantilla",
    created: "Plantilla de secuencia creada",
  },
} as const

export function SaveSequenceTemplateDialog({
  open,
  onOpenChange,
  steps,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  steps: CampaignStep[]
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const [name, setName] = React.useState("")

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setName("")
  }

  const count = flattenCampaignSteps(steps).length
  const canSave = name.trim().length > 0 && count > 0

  function handleSave() {
    if (!canSave) return
    sequenceTemplateStore.create(name.trim(), steps)
    toast.success(c.created)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Bookmark className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description(count)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="sequence-template-name">{c.nameLabel}</Label>
          <Input
            id="sequence-template-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={c.namePlaceholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave} disabled={!canSave}>
            <Bookmark className="size-4" />
            {c.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
