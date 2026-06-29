import * as React from "react"
import { Sparkles, Type, Gauge, ToggleLeft } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import {
  aiColumnStore,
  type AiColumnEntity,
  type AiColumnOutput,
} from "@/lib/ai-columns"

const COPY = {
  en: {
    title: "New AI column",
    description:
      "Describe what you want the AI to find for each row. It runs per record and fills the column.",
    name: "Column name",
    namePlaceholder: "e.g. Last funding round",
    prompt: "AI prompt",
    output: "Output",
    outText: "Text",
    outScore: "Score",
    outYesNo: "Yes / No",
    cancel: "Cancel",
    create: "Create column",
    presetsPeople: [
      "Summarize their seniority and likely buying power",
      "Are they likely a decision maker? Yes or no",
      "Score how good a fit this person is, 0–100",
    ],
    presetsCompany: [
      "Summarize their most recent funding round",
      "Are they hiring sales roles right now? Yes or no",
      "Score this account's buying intent, 0–100",
    ],
    presetsLabel: "Try one:",
  },
  es: {
    title: "Nueva columna IA",
    description:
      "Describe qué quieres que la IA encuentre para cada fila. Se ejecuta por registro y rellena la columna.",
    name: "Nombre de columna",
    namePlaceholder: "p. ej. Última ronda de financiación",
    prompt: "Prompt de IA",
    output: "Salida",
    outText: "Texto",
    outScore: "Puntuación",
    outYesNo: "Sí / No",
    cancel: "Cancelar",
    create: "Crear columna",
    presetsPeople: [
      "Resume su antigüedad y poder de compra probable",
      "¿Es probablemente quien decide? Sí o no",
      "Puntúa qué tan buen encaje es esta persona, 0–100",
    ],
    presetsCompany: [
      "Resume su ronda de financiación más reciente",
      "¿Están contratando ventas ahora mismo? Sí o no",
      "Puntúa la intención de compra de esta cuenta, 0–100",
    ],
    presetsLabel: "Prueba una:",
  },
} as const

export function AddAiColumnDialog({
  open,
  onOpenChange,
  entity,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  entity: AiColumnEntity
  onCreated?: (id: string) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [name, setName] = React.useState("")
  const [prompt, setPrompt] = React.useState("")
  const [output, setOutput] = React.useState<AiColumnOutput>("text")
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setName("")
    setPrompt("")
    setOutput("text")
  }
  if (!open && wasOpen) setWasOpen(false)

  const presets = entity === "company" ? c.presetsCompany : c.presetsPeople
  const outputs: { value: AiColumnOutput; label: string; icon: typeof Type }[] = [
    { value: "text", label: c.outText, icon: Type },
    { value: "score", label: c.outScore, icon: Gauge },
    { value: "yesno", label: c.outYesNo, icon: ToggleLeft },
  ]

  const canCreate = name.trim().length > 0 && prompt.trim().length > 0

  function create() {
    if (!canCreate) return
    const col = aiColumnStore.add({
      entity,
      label: name.trim(),
      prompt: prompt.trim(),
      output,
    })
    onCreated?.(col.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-col-name">{c.name}</Label>
            <Input
              id="ai-col-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-col-prompt">{c.prompt}</Label>
            <Textarea
              id="ai-col-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-20"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-xs">{c.presetsLabel}</span>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="bg-muted hover:bg-muted/70 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  {p.length > 32 ? `${p.slice(0, 32)}…` : p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{c.output}</Label>
            <div className="grid grid-cols-3 gap-2">
              {outputs.map((o) => {
                const Icon = o.icon
                const isActive = output === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setOutput(o.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-colors",
                      isActive
                        ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={create} disabled={!canCreate}>
            <Sparkles className="size-4" />
            {c.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
