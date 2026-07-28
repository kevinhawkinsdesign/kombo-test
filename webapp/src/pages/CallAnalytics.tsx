import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart3,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { EmptyState } from "@/components/common/EmptyState"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { DataTable } from "@/components/common/DataTable"
import { useTableSortFilter } from "@/lib/table-sort-filter"
import type { ColumnDef } from "@/lib/table-columns"
import { useCoachRecordings } from "@/lib/store"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CoachRecording } from "@/lib/types"

// A call "scores well" on a metric at or above this — the mocked equivalent
// of the real extension's per-question aggregation threshold.
const SCORE_THRESHOLD = 70
// Loading affordance for the mocked "Generate Summary" action — matches the
// ~600-900ms window CoachRecordingDetail's re-analyze flow already uses
// (see runReanalysis there), just on the shorter end since this only
// synthesizes text from data already in hand.
const SUMMARY_DELAY_MS = 750

const SENTIMENT = {
  positive: { icon: Smile, className: "text-chart-1" },
  neutral: { icon: Meh, className: "text-chart-4" },
  negative: { icon: Frown, className: "text-destructive" },
}

const COPY = {
  en: {
    title: "Call Analytics",
    description: "Team-wide performance across every analyzed call.",
    introTitle: "See the trends across every analyzed call",
    introDescription:
      "Coach Analytics aggregates score breakdowns across your analyzed calls so you can spot team-wide strengths and gaps, not just one call at a time.",
    introPoints: [
      "Average score and per-metric breakdown across calls",
      "See which skills the team consistently nails — or misses",
      "An AI-generated summary of what's working and what isn't",
    ],
    colTitle: "Call",
    colContact: "Prospect",
    colDate: "Date",
    colScore: "Score",
    colSentiment: "Sentiment",
    sentiment: {
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
    },
    emptyFiltered: "No calls match your filters.",
    emptyTitle: "No analyzed calls yet",
    emptyDescription: "Analyze a call from Call Coach to see it here.",
    viewCoachAnalytics: "View Coach Analytics",
    dialogTitle: "Coach Analytics",
    dialogDescription: (n: number) =>
      `Aggregate performance across ${n} analyzed ${n === 1 ? "call" : "calls"}.`,
    avgScoreLabel: "Average score",
    callsAnalyzedLabel: "Calls analyzed",
    scoreBreakdownTitle: "Score breakdown",
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
    close: "Close",
  },
  es: {
    title: "Análisis de llamadas",
    description: "Rendimiento del equipo en todas las llamadas analizadas.",
    introTitle: "Descubre las tendencias de todas las llamadas analizadas",
    introDescription:
      "Coach Analytics agrega el desglose de puntuación de tus llamadas analizadas para que detectes fortalezas y brechas de todo el equipo, no solo de una llamada.",
    introPoints: [
      "Puntuación media y desglose por métrica entre llamadas",
      "Descubre qué habilidades domina el equipo — o cuáles le cuestan",
      "Un resumen generado por IA de qué funciona y qué no",
    ],
    colTitle: "Llamada",
    colContact: "Prospecto",
    colDate: "Fecha",
    colScore: "Puntuación",
    colSentiment: "Sentimiento",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
    },
    emptyFiltered: "Ninguna llamada coincide con tus filtros.",
    emptyTitle: "Todavía no hay llamadas analizadas",
    emptyDescription: "Analiza una llamada desde Coach de llamadas para verla aquí.",
    viewCoachAnalytics: "Ver Coach Analytics",
    dialogTitle: "Coach Analytics",
    dialogDescription: (n: number) =>
      `Rendimiento agregado de ${n} ${n === 1 ? "llamada analizada" : "llamadas analizadas"}.`,
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
    close: "Cerrar",
  },
  it: {
    title: "Analisi chiamate",
    description: "Prestazioni del team su tutte le chiamate analizzate.",
    introTitle: "Scopri le tendenze di tutte le chiamate analizzate",
    introDescription:
      "Coach Analytics aggrega il dettaglio del punteggio delle chiamate analizzate per far emergere punti di forza e lacune di tutto il team, non solo di una chiamata.",
    introPoints: [
      "Punteggio medio e dettaglio per metrica tra le chiamate",
      "Scopri quali competenze il team padroneggia — o su cui inciampa",
      "Un riepilogo generato dall'AI di cosa funziona e cosa no",
    ],
    colTitle: "Chiamata",
    colContact: "Prospect",
    colDate: "Data",
    colScore: "Punteggio",
    colSentiment: "Sentiment",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
    emptyFiltered: "Nessuna chiamata corrisponde ai tuoi filtri.",
    emptyTitle: "Ancora nessuna chiamata analizzata",
    emptyDescription: "Analizza una chiamata da Coach chiamate per vederla qui.",
    viewCoachAnalytics: "Vedi Coach Analytics",
    dialogTitle: "Coach Analytics",
    dialogDescription: (n: number) =>
      `Prestazioni aggregate su ${n} ${n === 1 ? "chiamata analizzata" : "chiamate analizzate"}.`,
    avgScoreLabel: "Punteggio medio",
    callsAnalyzedLabel: "Chiamate analizzate",
    scoreBreakdownTitle: "Dettaglio del punteggio",
    scoreBreakdownEmpty:
      "Nessun dettaglio del punteggio disponibile per le chiamate analizzate.",
    perMetricTitle: "Dove il team ottiene risultati migliori",
    perMetricHint: (n: number) => `Quota di chiamate con punteggio ${n} o superiore`,
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
    close: "Chiudi",
  },
  fr: {
    title: "Analyse des appels",
    description: "Performance de l'équipe sur tous les appels analysés.",
    introTitle: "Repérez les tendances sur tous les appels analysés",
    introDescription:
      "Coach Analytics agrège le détail du score de vos appels analysés pour repérer les forces et les lacunes de toute l'équipe, pas seulement d'un appel.",
    introPoints: [
      "Score moyen et détail par métrique sur l'ensemble des appels",
      "Repérez les compétences que l'équipe maîtrise — ou pas",
      "Un résumé généré par IA de ce qui fonctionne et de ce qui doit s'améliorer",
    ],
    colTitle: "Appel",
    colContact: "Prospect",
    colDate: "Date",
    colScore: "Score",
    colSentiment: "Sentiment",
    sentiment: {
      positive: "Positif",
      neutral: "Neutre",
      negative: "Négatif",
    },
    emptyFiltered: "Aucun appel ne correspond à vos filtres.",
    emptyTitle: "Aucun appel analysé pour le moment",
    emptyDescription:
      "Analysez un appel depuis Coach d'appels pour le voir apparaître ici.",
    viewCoachAnalytics: "Voir Coach Analytics",
    dialogTitle: "Coach Analytics",
    dialogDescription: (n: number) =>
      `Performance agrégée sur ${n} ${n === 1 ? "appel analysé" : "appels analysés"}.`,
    avgScoreLabel: "Score moyen",
    callsAnalyzedLabel: "Appels analysés",
    scoreBreakdownTitle: "Détail du score",
    scoreBreakdownEmpty:
      "Aucun détail de score disponible pour les appels analysés pour le moment.",
    perMetricTitle: "Là où l'équipe excelle",
    perMetricHint: (n: number) => `Part des appels avec un score de ${n} ou plus`,
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
    aiFromCall: (title: string, text: string) => `Extrait de « ${title} » : ${text}`,
    aiImproveFallback: (steps: string) =>
      `Pas encore de notes de bilan — les prochaines étapes recommandées étaient : ${steps}.`,
    aiImproveGeneric:
      "Aucune note de bilan ni prochaine étape n'a encore été enregistrée pour cet appel.",
    close: "Fermer",
  },
  de: {
    title: "Call-Analytics",
    description: "Team-weite Leistung über alle analysierten Calls hinweg.",
    introTitle: "Trends über alle analysierten Calls hinweg erkennen",
    introDescription:
      "Coach Analytics aggregiert die Score-Aufschlüsselung deiner analysierten Calls, damit du team-weite Stärken und Lücken erkennst — nicht nur die eines einzelnen Calls.",
    introPoints: [
      "Durchschnittlicher Score und Aufschlüsselung nach Metrik über alle Calls",
      "Sieh, welche Skills das Team sicher beherrscht — oder welche nicht",
      "Eine KI-generierte Zusammenfassung, was funktioniert und was nicht",
    ],
    colTitle: "Call",
    colContact: "Prospect",
    colDate: "Datum",
    colScore: "Score",
    colSentiment: "Stimmung",
    sentiment: {
      positive: "Positiv",
      neutral: "Neutral",
      negative: "Negativ",
    },
    emptyFiltered: "Keine Calls entsprechen deinen Filtern.",
    emptyTitle: "Noch keine analysierten Calls",
    emptyDescription: "Analysiere einen Call im Call-Coach, um ihn hier zu sehen.",
    viewCoachAnalytics: "Coach Analytics ansehen",
    dialogTitle: "Coach Analytics",
    dialogDescription: (n: number) =>
      `Aggregierte Leistung über ${n} analysierte ${n === 1 ? "Call" : "Calls"}.`,
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
    close: "Schließen",
  },
  pt: {
    title: "Análise de chamadas",
    description: "Desempenho da equipa em todas as chamadas analisadas.",
    introTitle: "Veja as tendências em todas as chamadas analisadas",
    introDescription:
      "O Coach Analytics agrega o detalhe da pontuação das suas chamadas analisadas para identificar pontos fortes e lacunas de toda a equipa, não apenas de uma chamada.",
    introPoints: [
      "Pontuação média e detalhe por métrica entre chamadas",
      "Veja em que competências a equipa é consistente — ou não",
      "Um resumo gerado por IA do que está a funcionar e do que não está",
    ],
    colTitle: "Chamada",
    colContact: "Prospect",
    colDate: "Data",
    colScore: "Pontuação",
    colSentiment: "Sentimento",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
    emptyFiltered: "Nenhuma chamada corresponde aos seus filtros.",
    emptyTitle: "Ainda sem chamadas analisadas",
    emptyDescription:
      "Analise uma chamada a partir do Coach de chamadas para a ver aqui.",
    viewCoachAnalytics: "Ver Coach Analytics",
    dialogTitle: "Coach Analytics",
    dialogDescription: (n: number) =>
      `Desempenho agregado em ${n} ${n === 1 ? "chamada analisada" : "chamadas analisadas"}.`,
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
    close: "Fechar",
  },
  pt_BR: {
    title: "Análise de ligações",
    description: "Desempenho do time em todas as ligações analisadas.",
    introTitle: "Veja as tendências em todas as ligações analisadas",
    introDescription:
      "O Coach Analytics agrega o detalhamento da pontuação das suas ligações analisadas para identificar pontos fortes e lacunas de todo o time, não apenas de uma ligação.",
    introPoints: [
      "Pontuação média e detalhamento por métrica entre ligações",
      "Veja em quais habilidades o time é consistente — ou não",
      "Um resumo gerado por IA do que está funcionando e do que não está",
    ],
    colTitle: "Ligação",
    colContact: "Prospect",
    colDate: "Data",
    colScore: "Pontuação",
    colSentiment: "Sentimento",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
    emptyFiltered: "Nenhuma ligação corresponde aos seus filtros.",
    emptyTitle: "Ainda sem ligações analisadas",
    emptyDescription:
      "Analise uma ligação a partir do Coach de ligações para vê-la aqui.",
    viewCoachAnalytics: "Ver Coach Analytics",
    dialogTitle: "Coach Analytics",
    dialogDescription: (n: number) =>
      `Desempenho agregado em ${n} ${n === 1 ? "ligação analisada" : "ligações analisadas"}.`,
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
    close: "Fechar",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

// Header labels reuse the per-locale strings already defined in COPY above,
// same convention as Coach.tsx's colLabel().
function colLabel(
  key: "colTitle" | "colContact" | "colDate" | "colScore" | "colSentiment"
) {
  return {
    en: COPY.en[key],
    es: COPY.es[key],
    it: COPY.it[key],
    fr: COPY.fr[key],
    de: COPY.de[key],
    pt: COPY.pt[key],
    pt_BR: COPY.pt_BR[key],
  }
}

const CALL_COLUMNS: ColumnDef<CoachRecording>[] = [
  {
    id: "title",
    label: colLabel("colTitle"),
    group: "callAnalytics",
    pinned: true,
    getValue: (r) => r.title,
    render: (r) => <span className="font-medium">{r.title}</span>,
  },
  {
    id: "contact",
    label: colLabel("colContact"),
    group: "callAnalytics",
    getValue: (r) => `${r.prospectName} ${r.company}`,
    render: (r) => (
      <span className="text-muted-foreground text-sm">
        {r.prospectName} · {r.company}
      </span>
    ),
  },
  {
    id: "date",
    label: colLabel("colDate"),
    group: "callAnalytics",
    getValue: (r) => r.date,
    render: (r) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {formatDate(r.date)}
      </span>
    ),
  },
  {
    id: "score",
    label: colLabel("colScore"),
    group: "callAnalytics",
    align: "right",
    getValue: (r) => r.score,
    render: (r) => (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
          scorePillClass(r.score)
        )}
      >
        {r.score}
      </span>
    ),
  },
  {
    id: "sentiment",
    label: colLabel("colSentiment"),
    group: "callAnalytics",
    getValue: (r) => COPY.en.sentiment[r.sentiment],
    filterType: "enum",
    render: (r, locale) => {
      const cc = COPY[locale]
      const sentiment = SENTIMENT[r.sentiment]
      const SentimentIcon = sentiment.icon
      return (
        <span className={`flex items-center gap-1 text-sm ${sentiment.className}`}>
          <SentimentIcon className="size-3.5" />
          {cc.sentiment[r.sentiment]}
        </span>
      )
    },
  },
]

interface MetricAggregate {
  label: string
  avgScore: number
  wellCount: number
  total: number
}

// Averages every distinct scoreBreakdown metric label across whichever
// analyzed calls happen to carry that data — not every analyzed call has a
// scoreBreakdown (only calls actually run through Analysis do), so this
// silently skips calls that don't rather than treating a missing metric as 0.
function aggregateScoreBreakdown(calls: CoachRecording[]): MetricAggregate[] {
  const byLabel = new Map<string, { sum: number; wellCount: number; total: number }>()
  for (const call of calls) {
    for (const metric of call.scoreBreakdown ?? []) {
      const entry = byLabel.get(metric.label) ?? { sum: 0, wellCount: 0, total: 0 }
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
// highlights/nextSteps/review fields stand in for a real per-call analysis.
function buildAiSummary(calls: CoachRecording[], avgScore: number, c: Copy): AiSummary {
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

export default function CallAnalytics() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const liveRecordings = useCoachRecordings()
  const analyzedCalls = React.useMemo(
    () => liveRecordings.filter((r) => r.analyzed),
    [liveRecordings]
  )
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const tsf = useTableSortFilter(CALL_COLUMNS, analyzedCalls)

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button
            variant="volt"
            disabled={analyzedCalls.length === 0}
            onClick={() => setDialogOpen(true)}
          >
            <BarChart3 className="size-4" />
            {c.viewCoachAnalytics}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="analytics"
        icon={BarChart3}
        title={c.introTitle}
        description={c.introDescription}
        points={c.introPoints}
        className="mb-6"
      />

      {analyzedCalls.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="size-8" />}
          title={c.emptyTitle}
          description={c.emptyDescription}
        />
      ) : (
        <DataTable
          columns={CALL_COLUMNS}
          visible={["contact", "date", "score", "sentiment"]}
          rows={tsf.rows}
          rowKey={(r) => r.id}
          locale={locale}
          onRowClick={(r) => navigate(`/coach/${r.id}`)}
          sort={tsf.sort}
          onSortChange={tsf.setSort}
          filters={tsf.filters}
          onFilterChange={tsf.setFilter}
          filterRows={analyzedCalls}
          empty={c.emptyFiltered}
        />
      )}

      <CoachAnalyticsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        calls={analyzedCalls}
        c={c}
      />
    </Page>
  )
}

function CoachAnalyticsDialog({
  open,
  onOpenChange,
  calls,
  c,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  calls: CoachRecording[]
  c: Copy
}) {
  const [summaryStatus, setSummaryStatus] = React.useState<
    "idle" | "loading" | "done"
  >("idle")
  const [summary, setSummary] = React.useState<AiSummary | null>(null)

  // Reset on open, never on close — house pattern (render-time check).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSummaryStatus("idle")
      setSummary(null)
    }
  }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <BarChart3 className="size-4" />
            </span>
            {c.dialogTitle}
          </DialogTitle>
          <DialogDescription>{c.dialogDescription(calls.length)}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
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
                    <p className="mb-1 text-sm font-medium">
                      {c.aiSummaryOverall}
                    </p>
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

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
