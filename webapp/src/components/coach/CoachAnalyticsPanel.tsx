import * as React from "react"
import { Sparkles, Loader2, ThumbsUp, ThumbsDown } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CallScoreRadarChart } from "@/components/charts/Charts"
import { cn } from "@/lib/utils"
import type { CoachRecording } from "@/lib/types"

// A call "scores well" on a metric at or above this — the mocked equivalent
// of the real extension's per-question aggregation threshold.
export const SCORE_THRESHOLD = 70
// Loading affordance for the mocked "Generate Summary" action — matches the
// ~600-900ms window CoachRecordingDetail's re-analyze flow already uses,
// just on the shorter end since this only synthesizes text already in hand.
const SUMMARY_DELAY_MS = 750

const COPY = {
  en: {
    avgScoreLabel: "Average score",
    callsAnalyzedLabel: "Calls analyzed",
    scoreBreakdownTitle: "Coach score breakdown",
    scoreBreakdownEmpty:
      "No score breakdown data available for the analyzed calls yet.",
    perMetricTitle: "Where the team is scoring well",
    perMetricHint: (n: number) => `Share of calls scoring ${n} or above`,
    scoredWell: (well: number, total: number, label: string) =>
      `${well} of ${total} ${total === 1 ? "call" : "calls"} scored well on ${label}`,
    aiSectionTitle: "AI-generated summary",
    generateSummary: "Generate Summary",
    generatingSummary: "Generating summary…",
    aiSummaryOverall: "Overall summary",
    aiSummaryWell: "What went well",
    aiSummaryImprove: "What can be improved",
    aiOverallSingle: (title: string, score: number) =>
      `Based on the one analyzed call so far (“${title}”), the score is ${score}/100.`,
    aiOverallMulti: (
      n: number,
      avg: number,
      highTitle: string,
      highScore: number,
      lowTitle: string,
      lowScore: number
    ) =>
      `Across ${n} analyzed calls, the average score is ${avg}/100. “${highTitle}” scored highest at ${highScore}, while “${lowTitle}” scored lowest at ${lowScore}.`,
    aiFromCall: (title: string, text: string) => `From “${title}”: ${text}`,
    aiImproveFallback: (steps: string) =>
      `No review notes yet — the recommended next steps were: ${steps}.`,
    aiImproveGeneric:
      "No review notes or next steps were logged for this call yet.",
  },
  es: {
    avgScoreLabel: "Puntuación media",
    callsAnalyzedLabel: "Llamadas analizadas",
    scoreBreakdownTitle: "Desglose de la puntuación",
    scoreBreakdownEmpty:
      "Todavía no hay datos de desglose de puntuación para las llamadas analizadas.",
    perMetricTitle: "Dónde el equipo destaca",
    perMetricHint: (n: number) => `Proporción de llamadas con ${n} o más`,
    scoredWell: (well: number, total: number, label: string) =>
      `${well} de ${total} ${total === 1 ? "llamada" : "llamadas"} destacó en ${label}`,
    aiSectionTitle: "Resumen generado por IA",
    generateSummary: "Generar resumen",
    generatingSummary: "Generando resumen…",
    aiSummaryOverall: "Resumen general",
    aiSummaryWell: "Qué salió bien",
    aiSummaryImprove: "Qué se puede mejorar",
    aiOverallSingle: (title: string, score: number) =>
      `Con la única llamada analizada hasta ahora (“${title}”), la puntuación es ${score}/100.`,
    aiOverallMulti: (
      n: number,
      avg: number,
      highTitle: string,
      highScore: number,
      lowTitle: string,
      lowScore: number
    ) =>
      `En las ${n} llamadas analizadas, la puntuación media es ${avg}/100. “${highTitle}” obtuvo la más alta, con ${highScore}, mientras que “${lowTitle}” obtuvo la más baja, con ${lowScore}.`,
    aiFromCall: (title: string, text: string) => `De “${title}”: ${text}`,
    aiImproveFallback: (steps: string) =>
      `Todavía no hay notas de revisión — los próximos pasos recomendados fueron: ${steps}.`,
    aiImproveGeneric:
      "Todavía no se registraron notas de revisión ni próximos pasos para esta llamada.",
  },
  it: {
    avgScoreLabel: "Punteggio medio",
    callsAnalyzedLabel: "Chiamate analizzate",
    scoreBreakdownTitle: "Dettaglio del punteggio",
    scoreBreakdownEmpty:
      "Nessun dettaglio del punteggio disponibile per le chiamate analizzate.",
    perMetricTitle: "Dove il team ottiene risultati migliori",
    perMetricHint: (n: number) =>
      `Quota di chiamate con punteggio ${n} o superiore`,
    scoredWell: (well: number, total: number, label: string) =>
      `${well} chiamate su ${total} hanno ottenuto un buon punteggio su ${label}`,
    aiSectionTitle: "Riepilogo generato dall'AI",
    generateSummary: "Genera riepilogo",
    generatingSummary: "Generazione del riepilogo…",
    aiSummaryOverall: "Riepilogo generale",
    aiSummaryWell: "Cosa è andato bene",
    aiSummaryImprove: "Cosa si può migliorare",
    aiOverallSingle: (title: string, score: number) =>
      `In base all'unica chiamata analizzata finora (“${title}”), il punteggio è ${score}/100.`,
    aiOverallMulti: (
      n: number,
      avg: number,
      highTitle: string,
      highScore: number,
      lowTitle: string,
      lowScore: number
    ) =>
      `Nelle ${n} chiamate analizzate, il punteggio medio è ${avg}/100. “${highTitle}” ha ottenuto il punteggio più alto, ${highScore}, mentre “${lowTitle}” il più basso, ${lowScore}.`,
    aiFromCall: (title: string, text: string) => `Da “${title}”: ${text}`,
    aiImproveFallback: (steps: string) =>
      `Ancora nessuna nota di revisione — i prossimi passi consigliati erano: ${steps}.`,
    aiImproveGeneric:
      "Per questa chiamata non sono ancora state registrate note di revisione né prossimi passi.",
  },
  fr: {
    avgScoreLabel: "Score moyen",
    callsAnalyzedLabel: "Appels analysés",
    scoreBreakdownTitle: "Détail du score",
    scoreBreakdownEmpty:
      "Aucun détail de score disponible pour les appels analysés pour le moment.",
    perMetricTitle: "Là où l'équipe excelle",
    perMetricHint: (n: number) =>
      `Part des appels avec un score de ${n} ou plus`,
    scoredWell: (well: number, total: number, label: string) =>
      `${well} appel${well > 1 ? "s" : ""} sur ${total} ${total > 1 ? "ont" : "a"} obtenu un bon score sur ${label}`,
    aiSectionTitle: "Résumé généré par IA",
    generateSummary: "Générer le résumé",
    generatingSummary: "Génération du résumé…",
    aiSummaryOverall: "Résumé général",
    aiSummaryWell: "Ce qui s'est bien passé",
    aiSummaryImprove: "Ce qui peut être amélioré",
    aiOverallSingle: (title: string, score: number) =>
      `D'après le seul appel analysé pour l'instant (« ${title} »), le score est de ${score}/100.`,
    aiOverallMulti: (
      n: number,
      avg: number,
      highTitle: string,
      highScore: number,
      lowTitle: string,
      lowScore: number
    ) =>
      `Sur les ${n} appels analysés, le score moyen est de ${avg}/100. « ${highTitle} » a obtenu le score le plus élevé, ${highScore}, tandis que « ${lowTitle} » a obtenu le plus bas, ${lowScore}.`,
    aiFromCall: (title: string, text: string) =>
      `Extrait de « ${title} » : ${text}`,
    aiImproveFallback: (steps: string) =>
      `Pas encore de notes de bilan — les prochaines étapes recommandées étaient : ${steps}.`,
    aiImproveGeneric:
      "Aucune note de bilan ni prochaine étape n'a encore été enregistrée pour cet appel.",
  },
  de: {
    avgScoreLabel: "Durchschnittlicher Score",
    callsAnalyzedLabel: "Analysierte Calls",
    scoreBreakdownTitle: "Score-Aufschlüsselung",
    scoreBreakdownEmpty:
      "Für die analysierten Calls liegt noch keine Score-Aufschlüsselung vor.",
    perMetricTitle: "Wo das Team stark abschneidet",
    perMetricHint: (n: number) => `Anteil der Calls mit Score ${n} oder höher`,
    scoredWell: (well: number, total: number, label: string) =>
      `${well} von ${total} ${total === 1 ? "Call" : "Calls"} haben bei ${label} gut abgeschnitten`,
    aiSectionTitle: "KI-generierte Zusammenfassung",
    generateSummary: "Zusammenfassung generieren",
    generatingSummary: "Zusammenfassung wird generiert…",
    aiSummaryOverall: "Gesamtzusammenfassung",
    aiSummaryWell: "Was gut lief",
    aiSummaryImprove: "Was verbessert werden kann",
    aiOverallSingle: (title: string, score: number) =>
      `Basierend auf dem bisher einzigen analysierten Call („${title}“) liegt der Score bei ${score}/100.`,
    aiOverallMulti: (
      n: number,
      avg: number,
      highTitle: string,
      highScore: number,
      lowTitle: string,
      lowScore: number
    ) =>
      `Über ${n} analysierte Calls liegt der durchschnittliche Score bei ${avg}/100. „${highTitle}“ hatte mit ${highScore} den höchsten Score, „${lowTitle}“ mit ${lowScore} den niedrigsten.`,
    aiFromCall: (title: string, text: string) => `Aus „${title}“: ${text}`,
    aiImproveFallback: (steps: string) =>
      `Noch keine Review-Notizen — die empfohlenen nächsten Schritte waren: ${steps}.`,
    aiImproveGeneric:
      "Für diesen Call wurden noch keine Review-Notizen oder nächsten Schritte erfasst.",
  },
  pt: {
    avgScoreLabel: "Pontuação média",
    callsAnalyzedLabel: "Chamadas analisadas",
    scoreBreakdownTitle: "Detalhe da pontuação",
    scoreBreakdownEmpty:
      "Ainda não há dados de detalhe de pontuação para as chamadas analisadas.",
    perMetricTitle: "Onde a equipa se destaca",
    perMetricHint: (n: number) => `Proporção de chamadas com ${n} ou mais`,
    scoredWell: (well: number, total: number, label: string) =>
      `${well} de ${total} ${total === 1 ? "chamada" : "chamadas"} destacou-se em ${label}`,
    aiSectionTitle: "Resumo gerado por IA",
    generateSummary: "Gerar resumo",
    generatingSummary: "A gerar resumo…",
    aiSummaryOverall: "Resumo geral",
    aiSummaryWell: "O que correu bem",
    aiSummaryImprove: "O que pode ser melhorado",
    aiOverallSingle: (title: string, score: number) =>
      `Com base na única chamada analisada até agora (“${title}”), a pontuação é ${score}/100.`,
    aiOverallMulti: (
      n: number,
      avg: number,
      highTitle: string,
      highScore: number,
      lowTitle: string,
      lowScore: number
    ) =>
      `Nas ${n} chamadas analisadas, a pontuação média é ${avg}/100. “${highTitle}” obteve a pontuação mais alta, ${highScore}, enquanto “${lowTitle}” obteve a mais baixa, ${lowScore}.`,
    aiFromCall: (title: string, text: string) => `De “${title}”: ${text}`,
    aiImproveFallback: (steps: string) =>
      `Ainda sem notas de revisão — os próximos passos recomendados foram: ${steps}.`,
    aiImproveGeneric:
      "Ainda não foram registadas notas de revisão nem próximos passos para esta chamada.",
  },
  pt_BR: {
    avgScoreLabel: "Pontuação média",
    callsAnalyzedLabel: "Ligações analisadas",
    scoreBreakdownTitle: "Detalhamento da pontuação",
    scoreBreakdownEmpty:
      "Ainda não há dados de detalhamento de pontuação para as ligações analisadas.",
    perMetricTitle: "Onde o time se destaca",
    perMetricHint: (n: number) => `Proporção de ligações com ${n} ou mais`,
    scoredWell: (well: number, total: number, label: string) =>
      `${well} de ${total} ${total === 1 ? "ligação" : "ligações"} se destacou em ${label}`,
    aiSectionTitle: "Resumo gerado por IA",
    generateSummary: "Gerar resumo",
    generatingSummary: "Gerando resumo…",
    aiSummaryOverall: "Resumo geral",
    aiSummaryWell: "O que funcionou bem",
    aiSummaryImprove: "O que pode melhorar",
    aiOverallSingle: (title: string, score: number) =>
      `Com base na única ligação analisada até agora (“${title}”), a pontuação é ${score}/100.`,
    aiOverallMulti: (
      n: number,
      avg: number,
      highTitle: string,
      highScore: number,
      lowTitle: string,
      lowScore: number
    ) =>
      `Nas ${n} ligações analisadas, a pontuação média é ${avg}/100. “${highTitle}” teve a pontuação mais alta, ${highScore}, enquanto “${lowTitle}” teve a mais baixa, ${lowScore}.`,
    aiFromCall: (title: string, text: string) => `De “${title}”: ${text}`,
    aiImproveFallback: (steps: string) =>
      `Ainda sem notas de revisão — os próximos passos recomendados foram: ${steps}.`,
    aiImproveGeneric:
      "Ainda não foram registradas notas de revisão nem próximos passos para esta ligação.",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

interface MetricAggregate {
  label: string
  avgScore: number
  wellCount: number
  total: number
}

// Averages every distinct scoreBreakdown metric label across whichever
// analyzed calls happen to carry that data — not every analyzed call has a
// scoreBreakdown, so this silently skips calls that don't rather than
// treating a missing metric as 0.
function aggregateScoreBreakdown(calls: CoachRecording[]): MetricAggregate[] {
  const byLabel = new Map<
    string,
    { sum: number; wellCount: number; total: number }
  >()
  for (const call of calls) {
    for (const metric of call.scoreBreakdown ?? []) {
      const entry = byLabel.get(metric.label) ?? {
        sum: 0,
        wellCount: 0,
        total: 0,
      }
      entry.sum += metric.metricScore
      entry.total += 1
      if (metric.metricScore >= SCORE_THRESHOLD) entry.wellCount += 1
      byLabel.set(metric.label, entry)
    }
  }
  return Array.from(byLabel.entries()).map(([label, entry]) => ({
    label,
    avgScore: Math.round(entry.sum / entry.total),
    wellCount: entry.wellCount,
    total: entry.total,
  }))
}

interface AiSummary {
  overallSummary: string
  whatWentWell: string
  whatCanImprove: string
}

// Mocked "AI" synthesis: built entirely from data already in mock-data.ts
// (no network call) — the highest and lowest-scoring analyzed calls' own
// highlights/nextSteps/review fields stand in for a real analysis.
function buildAiSummary(
  calls: CoachRecording[],
  avgScore: number,
  c: Copy
): AiSummary {
  const sorted = [...calls].sort((a, b) => b.score - a.score)
  const highest = sorted[0]
  const lowest = sorted[sorted.length - 1]

  const wellText =
    highest.review?.positiveFeedback ??
    (highest.highlights.length
      ? highest.highlights.join("; ")
      : c.aiImproveGeneric)
  const improveText =
    lowest.review?.thingsToImprove ??
    (lowest.nextSteps.length
      ? c.aiImproveFallback(lowest.nextSteps.join("; "))
      : c.aiImproveGeneric)

  return {
    overallSummary:
      calls.length > 1
        ? c.aiOverallMulti(
            calls.length,
            avgScore,
            highest.title,
            highest.score,
            lowest.title,
            lowest.score
          )
        : c.aiOverallSingle(highest.title, highest.score),
    whatWentWell: c.aiFromCall(highest.title, wellText),
    whatCanImprove: c.aiFromCall(lowest.title, improveText),
  }
}

/**
 * The aggregated Coach Analytics view — average score, radar graph,
 * per-metric breakdown, pass rates and a generated summary across whichever
 * set of analyzed calls it's handed. Rendered both as a tab on Call Coach
 * (scoped by that page's Filters drawer) and inside Call Analytics' dialog.
 */
export function CoachAnalyticsPanel({ calls }: { calls: CoachRecording[] }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [summaryStatus, setSummaryStatus] = React.useState<
    "idle" | "loading" | "done"
  >("idle")
  const [summary, setSummary] = React.useState<AiSummary | null>(null)

  const avgScore =
    calls.length > 0
      ? Math.round(calls.reduce((sum, r) => sum + r.score, 0) / calls.length)
      : 0
  const metrics = aggregateScoreBreakdown(calls)

  function handleGenerate() {
    if (calls.length === 0 || summaryStatus === "loading") return
    setSummaryStatus("loading")
    window.setTimeout(() => {
      setSummary(buildAiSummary(calls, avgScore, c))
      setSummaryStatus("done")
    }, SUMMARY_DELAY_MS)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-1.5 rounded-lg border py-3 text-center">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-lg font-semibold tabular-nums",
              scorePillClass(avgScore)
            )}
          >
            {avgScore}
          </span>
          <span className="text-muted-foreground text-xs">
            {c.avgScoreLabel}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-lg border py-3 text-center">
          <span className="text-lg font-semibold tabular-nums">
            {calls.length}
          </span>
          <span className="text-muted-foreground text-xs">
            {c.callsAnalyzedLabel}
          </span>
        </div>
      </div>

      {metrics.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="h-56">
              <CallScoreRadarChart
                labels={metrics.map((m) => m.label)}
                callSeries={metrics.map((m) => m.avgScore)}
                callLabel={c.avgScoreLabel}
                repAvgLabel=""
                teamAvgLabel=""
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.scoreBreakdownTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {c.scoreBreakdownEmpty}
            </p>
          ) : (
            metrics.map((m) => (
              <div key={m.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{m.label}</span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(m.avgScore)
                    )}
                  >
                    {m.avgScore}
                  </span>
                </div>
                <Progress value={m.avgScore} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.perMetricTitle}</CardTitle>
            <p className="text-muted-foreground text-xs">
              {c.perMetricHint(SCORE_THRESHOLD)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.map((m) => {
              const wellPct = Math.round((m.wellCount / m.total) * 100)
              return (
                <div key={m.label} className="space-y-1.5">
                  <p className="text-sm">
                    {c.scoredWell(m.wellCount, m.total, m.label)}
                  </p>
                  <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-chart-1 absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${wellPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.aiSectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryStatus === "idle" && (
            <Button
              variant="volt"
              disabled={calls.length === 0}
              onClick={handleGenerate}
            >
              <Sparkles className="size-4" />
              {c.generateSummary}
            </Button>
          )}
          {summaryStatus === "loading" && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              {c.generatingSummary}
            </p>
          )}
          {summaryStatus === "done" && summary && (
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium">{c.aiSummaryOverall}</p>
                <p className="text-muted-foreground text-sm">
                  {summary.overallSummary}
                </p>
              </div>
              <div className="border-chart-1/30 bg-chart-1/5 rounded-lg border p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <ThumbsUp className="text-chart-1 size-4" />
                  {c.aiSummaryWell}
                </div>
                <p className="text-muted-foreground text-sm">
                  {summary.whatWentWell}
                </p>
              </div>
              <div className="border-chart-4/30 bg-chart-4/5 rounded-lg border p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <ThumbsDown className="text-chart-4 size-4" />
                  {c.aiSummaryImprove}
                </div>
                <p className="text-muted-foreground text-sm">
                  {summary.whatCanImprove}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
