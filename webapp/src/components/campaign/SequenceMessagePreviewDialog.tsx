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
    dayLabel: (n: number) => (n === 0 ? "Día 0" : `Día ${n}`),
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

  // Reset on open (render-time check, house pattern — never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setProspectId(prospects[0]?.id ?? "")
  }

  const prospect = prospects.find((p) => p.id === prospectId) ?? prospects[0]
  const options = prospects.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
    sublabel: `${p.title} @ ${p.company}`,
  }))
  const flatSteps = flattenCampaignSteps(steps)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
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
                className="w-full"
              />
            </div>

            {prospect && (
              <div className="min-w-0 max-h-[60vh] space-y-3 overflow-y-auto">
                {flatSteps.map((step) => {
                  const meta = channelMeta(step.channel)
                  const Icon = meta.Icon
                  const data = prospectMergeData(prospect)
                  return (
                    <div key={step.id} className="space-y-1.5 rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded",
                            meta.tint
                          )}
                        >
                          <Icon className="size-3" />
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {c.dayLabel(step.delayDays)}
                        </span>
                      </div>
                      {step.subject && (
                        <p className="text-sm font-medium">
                          {mergeVarsHighlighted(stripHtml(step.subject), data)}
                        </p>
                      )}
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {mergeVarsHighlighted(stripHtml(step.body), data)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
