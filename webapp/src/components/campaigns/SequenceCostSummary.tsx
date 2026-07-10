import { CalendarDays, Coins } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { InfoHint } from "@/components/common/InfoHint"
import type { CampaignStep } from "@/lib/types"
import { sequenceTotals } from "@/lib/sequence-layout"

const COPY = {
  en: {
    title: "Cost breakdown",
    hintLabel: "How this is calculated",
    hint: "Worst case for a single prospect completing the whole sequence — if a condition forks the sequence, only the longer/costlier of its two tracks counts, since a prospect only ever goes down one.",
    totalDays: (n: number) => (n === 1 ? "1 day total" : `${n} days total`),
    totalCredits: (n: number) => `${n} credits per prospect`,
  },
  es: {
    title: "Desglose de costos",
    hintLabel: "Cómo se calcula",
    hint: "El peor caso para un solo prospecto que completa toda la secuencia — si una condición bifurca la secuencia, solo cuenta la rama más larga o costosa de las dos, ya que un prospecto solo sigue una.",
    totalDays: (n: number) => (n === 1 ? "1 día en total" : `${n} días en total`),
    totalCredits: (n: number) => `${n} créditos por prospecto`,
  },
} as const

// Sequence-level cost estimate — shown above the steps alongside
// AutomationStatusBox, in both the editable Sequence tab and the read-only
// Workspace preview, so a rep can see the time/credit commitment before
// enrolling prospects.
export function SequenceCostSummary({ steps }: { steps: CampaignStep[] }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { days, credits } = sequenceTotals(steps)

  return (
    <div className="bg-muted/40 flex flex-wrap items-center gap-3 rounded-xl border p-3 sm:p-4">
      <span className="bg-chart-4/15 text-chart-4 flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Coins className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-medium">
          {c.title}
          <InfoHint label={c.hintLabel}>{c.hint}</InfoHint>
        </p>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {c.totalDays(days)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Coins className="size-3.5" />
            {c.totalCredits(credits)}
          </span>
        </div>
      </div>
    </div>
  )
}
