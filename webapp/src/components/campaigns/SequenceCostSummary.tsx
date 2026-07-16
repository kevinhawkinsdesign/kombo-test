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
  it: {
    title: "Ripartizione dei costi",
    hintLabel: "Come viene calcolato",
    hint: "Il caso peggiore per un singolo prospect che completa l'intera sequenza — se una condizione biforca la sequenza, conta solo il ramo più lungo o costoso dei due, perché un prospect ne segue sempre uno solo.",
    totalDays: (n: number) => (n === 1 ? "1 giorno in totale" : `${n} giorni in totale`),
    totalCredits: (n: number) => `${n} crediti per prospect`,
  },
  fr: {
    title: "Détail des coûts",
    hintLabel: "Comment c'est calculé",
    hint: "Le pire cas pour un seul prospect qui parcourt toute la séquence — si une condition divise la séquence en deux, seule la branche la plus longue ou la plus coûteuse compte, car un prospect n'en suit jamais qu'une.",
    totalDays: (n: number) => (n === 1 ? "1 jour au total" : `${n} jours au total`),
    totalCredits: (n: number) => `${n} crédits par prospect`,
  },
  de: {
    title: "Kostenübersicht",
    hintLabel: "So wird das berechnet",
    hint: "Der ungünstigste Fall für einen einzelnen Prospect, der die gesamte Sequenz durchläuft — verzweigt eine Bedingung die Sequenz, zählt nur der längere bzw. teurere der beiden Pfade, da ein Prospect immer nur einem folgt.",
    totalDays: (n: number) => (n === 1 ? "1 Tag insgesamt" : `${n} Tage insgesamt`),
    totalCredits: (n: number) => `${n} Credits pro Prospect`,
  },
  pt: {
    title: "Detalhe de custos",
    hintLabel: "Como é calculado",
    hint: "O pior caso para um único prospect que completa toda a sequência — se uma condição dividir a sequência, conta apenas o ramo mais longo ou mais caro dos dois, já que um prospect segue sempre apenas um.",
    totalDays: (n: number) => (n === 1 ? "1 dia no total" : `${n} dias no total`),
    totalCredits: (n: number) => `${n} créditos por prospect`,
  },
  pt_BR: {
    title: "Detalhamento de custos",
    hintLabel: "Como isso é calculado",
    hint: "O pior caso para um único prospect que completa toda a sequência — se uma condição dividir a sequência, conta apenas o caminho mais longo ou mais caro dos dois, já que um prospect sempre segue apenas um.",
    totalDays: (n: number) => (n === 1 ? "1 dia no total" : `${n} dias no total`),
    totalCredits: (n: number) => `${n} créditos por prospect`,
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
