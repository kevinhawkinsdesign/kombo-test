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
  it: {
    title: "Salva la sequenza come modello",
    description: (n: number) =>
      `Salva ${n === 1 ? "il passaggio attuale" : `i ${n} passaggi attuali`} — tempi e contenuto dei messaggi inclusi — così qualsiasi campagna può partire da lì.`,
    nameLabel: "Nome del modello",
    namePlaceholder: "es. Outbound enterprise — 5 tocchi",
    cancel: "Annulla",
    save: "Salva modello",
    created: "Modello di sequenza creato",
  },
  fr: {
    title: "Enregistrer la séquence comme modèle",
    description: (n: number) =>
      `Enregistre ${n === 1 ? "l'étape actuelle" : `les ${n} étapes actuelles`} — délais et contenu des messages inclus — pour que n'importe quelle campagne puisse en repartir.`,
    nameLabel: "Nom du modèle",
    namePlaceholder: "ex. Outbound enterprise — 5 touches",
    cancel: "Annuler",
    save: "Enregistrer le modèle",
    created: "Modèle de séquence créé",
  },
  de: {
    title: "Sequenz als Vorlage speichern",
    description: (n: number) =>
      `Speichert ${n === 1 ? "den aktuellen Schritt" : `die aktuellen ${n} Schritte`} — inklusive Wartezeiten und Nachrichteninhalt — damit jede Kampagne damit starten kann.`,
    nameLabel: "Name der Vorlage",
    namePlaceholder: "z. B. Enterprise-Outbound — 5 Touchpoints",
    cancel: "Abbrechen",
    save: "Vorlage speichern",
    created: "Sequenzvorlage erstellt",
  },
  pt: {
    title: "Guardar sequência como modelo",
    description: (n: number) =>
      `Guarda ${n === 1 ? "o passo atual" : `os ${n} passos atuais`} — com tempos e conteúdo das mensagens — para qualquer campanha poder começar a partir daí.`,
    nameLabel: "Nome do modelo",
    namePlaceholder: "ex. Outbound enterprise — 5 toques",
    cancel: "Cancelar",
    save: "Guardar modelo",
    created: "Modelo de sequência criado",
  },
  pt_BR: {
    title: "Salvar sequência como modelo",
    description: (n: number) =>
      `Salva ${n === 1 ? "a etapa atual" : `as ${n} etapas atuais`} — com tempos e conteúdo das mensagens — para que qualquer campanha possa começar a partir dela.`,
    nameLabel: "Nome do modelo",
    namePlaceholder: "ex.: Outbound enterprise — 5 toques",
    cancel: "Cancelar",
    save: "Salvar modelo",
    created: "Modelo de sequência criado",
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
