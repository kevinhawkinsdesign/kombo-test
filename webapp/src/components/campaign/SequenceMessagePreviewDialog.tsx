import * as React from "react"
import { Eye } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { SearchCombobox } from "@/components/common/SearchCombobox"
import { useLocale } from "@/lib/locale"
import { flattenCampaignSteps } from "@/lib/store"
import { channelMeta } from "@/lib/step-channels"
import { prospectMergeData } from "@/lib/merge-vars"
import { mergeVarsHighlighted } from "@/lib/merge-vars-highlight"
import { stripHtml } from "@/lib/rich-text"
import { cn } from "@/lib/utils"
import type { CampaignStep, Prospect } from "@/lib/types"

const COPY = {
  en: {
    title: "Preview messages",
    description: "See exactly what a specific prospect would receive.",
    pickLabel: "Preview as",
    pickPlaceholder: "Choose a prospect…",
    searchPlaceholder: "Search prospects…",
    empty: "No prospects found.",
    noAudience: "No prospects in this campaign yet — add some to preview real messages.",
    noSubject: "(no subject)",
    dayLabel: (n: number) => (n === 0 ? "Day 0" : `Day ${n}`),
  },
  es: {
    title: "Vista previa de mensajes",
    description: "Mira exactamente qué recibiría un prospecto en concreto.",
    pickLabel: "Ver como",
    pickPlaceholder: "Elige un prospecto…",
    searchPlaceholder: "Buscar prospectos…",
    empty: "No se encontraron prospectos.",
    noAudience:
      "Aún no hay prospectos en esta campaña — añade algunos para ver mensajes reales.",
    noSubject: "(sin asunto)",
    dayLabel: (n: number) => (n === 0 ? "Día 0" : `Día ${n}`),
  },
  it: {
    title: "Anteprima dei messaggi",
    description: "Guarda esattamente cosa riceverebbe un prospect specifico.",
    pickLabel: "Anteprima come",
    pickPlaceholder: "Scegli un prospect…",
    searchPlaceholder: "Cerca prospect…",
    empty: "Nessun prospect trovato.",
    noAudience:
      "Ancora nessun prospect in questa campagna — aggiungine qualcuno per vedere messaggi reali.",
    noSubject: "(nessun oggetto)",
    dayLabel: (n: number) => (n === 0 ? "Giorno 0" : `Giorno ${n}`),
  },
  fr: {
    title: "Aperçu des messages",
    description: "Voyez exactement ce qu'un prospect précis recevrait.",
    pickLabel: "Aperçu en tant que",
    pickPlaceholder: "Choisissez un prospect…",
    searchPlaceholder: "Rechercher des prospects…",
    empty: "Aucun prospect trouvé.",
    noAudience:
      "Pas encore de prospects dans cette campagne — ajoutez-en pour voir de vrais messages.",
    noSubject: "(aucun objet)",
    dayLabel: (n: number) => (n === 0 ? "Jour 0" : `Jour ${n}`),
  },
  de: {
    title: "Nachrichtenvorschau",
    description: "Sieh genau, was ein bestimmter Prospect erhalten würde.",
    pickLabel: "Vorschau als",
    pickPlaceholder: "Prospect auswählen…",
    searchPlaceholder: "Prospects suchen…",
    empty: "Keine Prospects gefunden.",
    noAudience:
      "Noch keine Prospects in dieser Kampagne — füge welche hinzu, um echte Nachrichten zu sehen.",
    noSubject: "(kein Betreff)",
    dayLabel: (n: number) => (n === 0 ? "Tag 0" : `Tag ${n}`),
  },
  pt: {
    title: "Pré-visualizar mensagens",
    description: "Veja exatamente o que um prospect específico receberia.",
    pickLabel: "Pré-visualizar como",
    pickPlaceholder: "Escolha um prospect…",
    searchPlaceholder: "Pesquisar prospects…",
    empty: "Nenhum prospect encontrado.",
    noAudience:
      "Ainda não há prospects nesta campanha — adicione alguns para ver mensagens reais.",
    noSubject: "(sem assunto)",
    dayLabel: (n: number) => (n === 0 ? "Dia 0" : `Dia ${n}`),
  },
  pt_BR: {
    title: "Pré-visualizar mensagens",
    description: "Veja exatamente o que um prospect específico receberia.",
    pickLabel: "Visualizar como",
    pickPlaceholder: "Escolha um prospect…",
    searchPlaceholder: "Buscar prospects…",
    empty: "Nenhum prospect encontrado.",
    noAudience:
      "Ainda não há prospects nesta campanha — adicione alguns para ver mensagens reais.",
    noSubject: "(sem assunto)",
    dayLabel: (n: number) => (n === 0 ? "Dia 0" : `Dia ${n}`),
  },
} as const

export function SequenceMessagePreviewDialog({
  open,
  onOpenChange,
  steps,
  prospects,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  steps: CampaignStep[]
  prospects: Prospect[]
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const [prospectId, setProspectId] = React.useState("")
  const [activeStepId, setActiveStepId] = React.useState("")

  const flatSteps = flattenCampaignSteps(steps)

  // Reset on open (render-time check, house pattern — never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setProspectId(prospects[0]?.id ?? "")
      setActiveStepId(flatSteps[0]?.id ?? "")
    }
  }

  const prospect = prospects.find((p) => p.id === prospectId) ?? prospects[0]
  const options = prospects.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
    sublabel: `${p.title} @ ${p.company}`,
  }))
  const activeStep = flatSteps.find((s) => s.id === activeStepId) ?? flatSteps[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Eye className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        {prospects.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {c.noAudience}
          </p>
        ) : (
          <>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="preview-prospect">{c.pickLabel}</Label>
              <SearchCombobox
                id="preview-prospect"
                value={prospect?.id ?? ""}
                onChange={setProspectId}
                options={options}
                placeholder={c.pickPlaceholder}
                searchPlaceholder={c.searchPlaceholder}
                emptyText={c.empty}
                className="w-full sm:w-80"
              />
            </div>

            {prospect && activeStep && (
              <div className="grid min-h-0 flex-1 grid-cols-[13rem_1fr] gap-4 overflow-hidden rounded-lg border">
                {/* Step list — click a day to load it in the reading pane. */}
                <div className="bg-muted/30 min-h-0 space-y-1 overflow-y-auto border-r p-2">
                  {flatSteps.map((step) => {
                    const meta = channelMeta(step.channel)
                    const Icon = meta.Icon
                    const isActive = step.id === activeStep.id
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveStepId(step.id)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-background"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded",
                            meta.tint
                          )}
                        >
                          <Icon className="size-3" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">
                            {c.dayLabel(step.delayDays)}
                          </span>
                          <span className="text-muted-foreground block truncate">
                            {stripHtml(step.subject || step.body) || c.noSubject}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Reading pane — the selected message at full, comfortable size
                    (no truncation), styled like an actual received message
                    rather than a cramped summary card. */}
                <div className="min-h-0 space-y-3 overflow-y-auto p-5">
                  {(() => {
                    const meta = channelMeta(activeStep.channel)
                    const Icon = meta.Icon
                    const data = prospectMergeData(prospect)
                    return (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-md",
                              meta.tint
                            )}
                          >
                            <Icon className="size-3.5" />
                          </span>
                          <span className="text-muted-foreground font-medium">
                            {c.dayLabel(activeStep.delayDays)}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {prospect.firstName} {prospect.lastName} — {prospect.company}
                          </span>
                        </div>
                        {activeStep.subject && (
                          <p className="text-base font-semibold">
                            {mergeVarsHighlighted(stripHtml(activeStep.subject), data)}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {mergeVarsHighlighted(stripHtml(activeStep.body), data)}
                        </p>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
