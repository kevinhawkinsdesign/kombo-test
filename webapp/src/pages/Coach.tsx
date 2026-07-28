import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Play,
  TrendingUp,
  TrendingDown,
  Clock,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  ThumbsUp,
  Target,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"

import { useLocale, type Locale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { DataTable } from "@/components/common/DataTable"
import { SelectionControls } from "@/components/common/SelectionControls"
import { usePagedSelection } from "@/lib/use-paged-selection"
import type { ColumnDef } from "@/lib/table-columns"
import {
  useTableSortFilter,
  type SortState,
  type ColumnFilterState,
} from "@/lib/table-sort-filter"
import { coachRecordings } from "@/lib/mock-data"
import { useCoachRecordings, coachRecordingStore } from "@/lib/store"
import { getScorecard } from "@/lib/mock-coaching"
import {
  coachLeaderboard,
  coachTeamAvg,
  type CoachSkill,
} from "@/lib/mock-coach-team"
import { deals } from "@/lib/mock-extra"
import { team, teams, teamMembers } from "@/lib/team"
import { formatDate } from "@/lib/format"
import { downloadCsv } from "@/lib/csv"
import { cn } from "@/lib/utils"
import type { CoachRecording, CoachVideoSource } from "@/lib/types"

// Fixed canonical order for the Source filter checklist — every value the
// widened videoSource union supports, regardless of whether a mock
// recording currently uses it (same convention as the Outcomes checklist in
// FilterConversationsDialog).
const COACH_VIDEO_SOURCES: CoachVideoSource[] = [
  "meet",
  "teams",
  "zoom",
  "gong",
  "phone",
  "whatsapp",
  "linkedin",
]

// Sentinel value for the Team select's "no team picked" state — mirrors the
// ALL-value pattern used by other single-select filters in the app.
const ALL_TEAMS = "all"

function toggled<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

const SENTIMENT = {
  positive: { icon: Smile, className: "text-chart-1" },
  neutral: { icon: Meh, className: "text-chart-4" },
  negative: { icon: Frown, className: "text-destructive" },
}

const PAGE_SIZE = 10

const COPY = {
  en: {
    title: "Call Coach",
    description: "AI analysis of your sales calls with actionable feedback.",
    introTitle: "Coach every call",
    introDescription:
      "AI-analyzed call recordings surface talk ratio, topics, and the next best step.",
    introPoints: [
      "Automatic call transcription",
      "Talk-ratio & sentiment analysis",
      "Coaching scorecards you can share",
    ],
    tabEfficiency: "Efficiency",
    tabPerformance: "Performance",
    tabTeam: "Team",
    avgScore: "Average call score",
    callsAnalyzed: "Calls analyzed",
    avgTalkRatio: "Avg. talk ratio",
    playRecording: "Play recording",
    talkRatioYou: "Talk ratio (you)",
    talkRatioHint: "Aim for 40–45% — let the prospect talk more.",
    highlights: "Highlights",
    recommendedNextSteps: "Recommended next steps",
    aiGenerated: "AI generated",
    viewFullAnalysis: "View full analysis",
    callScore: "Call score",
    perfStrengths: "Where you're strong",
    perfGaps: "Where to improve",
    perfRanked: "Calls by score",
    perfNoStrong: "Run more calls to surface consistent strengths.",
    perfNoWeak: "No recurring weak spots — nice work.",
    teamTitle: "Team performance",
    teamAvgScore: "Team avg score",
    teamCalls: "Calls analyzed",
    teamAvgTalk: "Avg talk ratio",
    colRep: "Rep",
    colAvgScore: "Avg score",
    colCalls: "Calls",
    colTalk: "Talk ratio",
    colTrend: "Trend",
    colStrength: "Strength",
    colGap: "Gap",
    sentiment: {
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
    },
    search: "Search calls…",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Calls exported to CSV",
    noResults: "No calls match your search.",
    sortRecent: "Most recent",
    sortScore: "Highest score",
    sortDuration: "Longest",
    colTitle: "Call",
    colContact: "Prospect",
    colDate: "Date",
    colDuration: "Duration",
    colSentiment: "Sentiment",
    colScore: "Score",
    filters: "Filters",
    filterDialogTitle: "Filter calls",
    filterDialogDescription:
      "Narrow the list by prospect, deal, rep, date range, or source.",
    dateFrom: "From",
    dateTo: "To",
    clearAll: "Clear all",
    clear: "Clear",
    cancel: "Cancel",
    apply: "Apply",
    filterProspectName: "Prospect name",
    filterProspectPosition: "Prospect position",
    filterProspectCompany: "Prospect company",
    filterDeal: "Deal",
    filterTeam: "Team",
    filterAllTeams: "All teams",
    filterSalesRep: "Sales rep",
    filterSource: "Source",
    source: {
      meet: "Meet",
      teams: "Teams",
      zoom: "Zoom",
      gong: "Gong",
      phone: "Phone",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
    } as Record<CoachVideoSource, string>,
    colAiStatus: "AI status",
    badgeSummary: "Summary",
    badgeAnalysis: "Analysis",
    selectedCount: (n: number) => `${n} selected`,
    bulkSummarize: (n: number) => `Summarize Recordings (${n})`,
    bulkAnalyze: (n: number) => `Analyze Recordings (${n})`,
    processRecordings: "Process Recordings",
    processToastBoth: (s: number, a: number) =>
      `${s} recordings summarized, ${a} analyzed`,
    processToastSummarizeOnly: (n: number) =>
      `${n} ${n === 1 ? "recording" : "recordings"} summarized`,
    processToastAnalyzeOnly: (n: number) =>
      `${n} ${n === 1 ? "recording" : "recordings"} analyzed`,
    skill: {
      rapport: "Rapport",
      discovery: "Discovery",
      nextSteps: "Next steps",
      talkRatio: "Talk ratio",
      objections: "Objection handling",
      qualification: "Qualification",
      valueFraming: "Value framing",
    } as Record<CoachSkill, string>,
  },
  es: {
    title: "Coach de llamadas",
    description:
      "Análisis con IA de tus llamadas de ventas con recomendaciones accionables.",
    introTitle: "Entrena cada llamada",
    introDescription:
      "Las grabaciones analizadas con IA revelan el ratio de conversación, los temas y el siguiente mejor paso.",
    introPoints: [
      "Transcripción automática de llamadas",
      "Análisis de ratio de conversación y sentimiento",
      "Informes de coaching que puedes compartir",
    ],
    tabEfficiency: "Eficiencia",
    tabPerformance: "Rendimiento",
    tabTeam: "Equipo",
    avgScore: "Puntuación media de llamada",
    callsAnalyzed: "Llamadas analizadas",
    avgTalkRatio: "Ratio de conversación medio",
    playRecording: "Reproducir grabación",
    talkRatioYou: "Ratio de conversación (tú)",
    talkRatioHint: "Apunta al 40–45 %: deja que el prospecto hable más.",
    highlights: "Aspectos destacados",
    recommendedNextSteps: "Próximos pasos recomendados",
    aiGenerated: "Generado por IA",
    viewFullAnalysis: "Ver análisis completo",
    callScore: "Puntuación",
    perfStrengths: "Dónde destacas",
    perfGaps: "Dónde mejorar",
    perfRanked: "Llamadas por puntuación",
    perfNoStrong: "Analiza más llamadas para revelar fortalezas constantes.",
    perfNoWeak: "Sin puntos débiles recurrentes — buen trabajo.",
    teamTitle: "Rendimiento del equipo",
    teamAvgScore: "Puntuación media del equipo",
    teamCalls: "Llamadas analizadas",
    teamAvgTalk: "Ratio de conversación medio",
    colRep: "Representante",
    colAvgScore: "Puntuación media",
    colCalls: "Llamadas",
    colTalk: "Ratio",
    colTrend: "Tendencia",
    colStrength: "Fortaleza",
    colGap: "Brecha",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
    },
    search: "Buscar llamadas…",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Llamadas exportadas a CSV",
    noResults: "Ninguna llamada coincide con tu búsqueda.",
    sortRecent: "Más recientes",
    sortScore: "Mayor puntuación",
    sortDuration: "Más largas",
    colTitle: "Llamada",
    colContact: "Prospecto",
    colDate: "Fecha",
    colDuration: "Duración",
    colSentiment: "Sentimiento",
    colScore: "Puntuación",
    filters: "Filtros",
    filterDialogTitle: "Filtrar llamadas",
    filterDialogDescription:
      "Reduce la lista por prospecto, negocio, representante, rango de fechas u origen.",
    dateFrom: "Desde",
    dateTo: "Hasta",
    clearAll: "Limpiar todo",
    clear: "Limpiar",
    cancel: "Cancelar",
    apply: "Aplicar",
    filterProspectName: "Nombre del prospecto",
    filterProspectPosition: "Cargo del prospecto",
    filterProspectCompany: "Empresa del prospecto",
    filterDeal: "Negocio",
    filterTeam: "Equipo",
    filterAllTeams: "Todos los equipos",
    filterSalesRep: "Representante de ventas",
    filterSource: "Origen",
    source: {
      meet: "Meet",
      teams: "Teams",
      zoom: "Zoom",
      gong: "Gong",
      phone: "Teléfono",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
    } as Record<CoachVideoSource, string>,
    colAiStatus: "Estado de IA",
    badgeSummary: "Resumen",
    badgeAnalysis: "Análisis",
    selectedCount: (n: number) => `${n} seleccionados`,
    bulkSummarize: (n: number) => `Resumir grabaciones (${n})`,
    bulkAnalyze: (n: number) => `Analizar grabaciones (${n})`,
    processRecordings: "Procesar grabaciones",
    processToastBoth: (s: number, a: number) =>
      `${s} grabaciones resumidas, ${a} analizadas`,
    processToastSummarizeOnly: (n: number) =>
      `${n} ${n === 1 ? "grabación resumida" : "grabaciones resumidas"}`,
    processToastAnalyzeOnly: (n: number) =>
      `${n} ${n === 1 ? "grabación analizada" : "grabaciones analizadas"}`,
    skill: {
      rapport: "Rapport",
      discovery: "Descubrimiento",
      nextSteps: "Próximos pasos",
      talkRatio: "Ratio de conversación",
      objections: "Manejo de objeciones",
      qualification: "Cualificación",
      valueFraming: "Propuesta de valor",
    } as Record<CoachSkill, string>,
  },
  it: {
    title: "Coach delle chiamate",
    description:
      "Analisi AI delle tue chiamate di vendita con feedback pratici.",
    introTitle: "Allena ogni chiamata",
    introDescription:
      "Le registrazioni analizzate dall'AI rivelano rapporto di conversazione, argomenti e il miglior passo successivo.",
    introPoints: [
      "Trascrizione automatica delle chiamate",
      "Analisi di rapporto di conversazione e sentiment",
      "Report di coaching da condividere",
    ],
    tabEfficiency: "Efficienza",
    tabPerformance: "Prestazioni",
    tabTeam: "Team",
    avgScore: "Punteggio medio delle chiamate",
    callsAnalyzed: "Chiamate analizzate",
    avgTalkRatio: "Rapporto di conversazione medio",
    playRecording: "Riproduci registrazione",
    talkRatioYou: "Rapporto di conversazione (tu)",
    talkRatioHint: "Punta al 40–45% — lascia parlare di più il prospect.",
    highlights: "Punti salienti",
    recommendedNextSteps: "Prossimi passi consigliati",
    aiGenerated: "Generato dall'AI",
    viewFullAnalysis: "Vedi analisi completa",
    callScore: "Punteggio",
    perfStrengths: "Dove sei forte",
    perfGaps: "Dove migliorare",
    perfRanked: "Chiamate per punteggio",
    perfNoStrong: "Analizza più chiamate per far emergere punti di forza costanti.",
    perfNoWeak: "Nessun punto debole ricorrente — ottimo lavoro.",
    teamTitle: "Prestazioni del team",
    teamAvgScore: "Punteggio medio del team",
    teamCalls: "Chiamate analizzate",
    teamAvgTalk: "Rapporto di conversazione medio",
    colRep: "Rappresentante",
    colAvgScore: "Punteggio medio",
    colCalls: "Chiamate",
    colTalk: "Rapporto",
    colTrend: "Tendenza",
    colStrength: "Punto di forza",
    colGap: "Lacuna",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
    search: "Cerca chiamate…",
    viewCards: "Schede",
    viewTable: "Tabella",
    exportLabel: "Esporta",
    exported: "Chiamate esportate in CSV",
    noResults: "Nessuna chiamata corrisponde alla tua ricerca.",
    sortRecent: "Più recenti",
    sortScore: "Punteggio più alto",
    sortDuration: "Più lunghe",
    colTitle: "Chiamata",
    colContact: "Prospect",
    colDate: "Data",
    colDuration: "Durata",
    colSentiment: "Sentiment",
    colScore: "Punteggio",
    filters: "Filtri",
    filterDialogTitle: "Filtra le chiamate",
    filterDialogDescription:
      "Restringi l'elenco per prospect, trattativa, rappresentante, intervallo di date o origine.",
    dateFrom: "Da",
    dateTo: "A",
    clearAll: "Cancella tutto",
    clear: "Cancella",
    cancel: "Annulla",
    apply: "Applica",
    filterProspectName: "Nome del prospect",
    filterProspectPosition: "Ruolo del prospect",
    filterProspectCompany: "Azienda del prospect",
    filterDeal: "Trattativa",
    filterTeam: "Team",
    filterAllTeams: "Tutti i team",
    filterSalesRep: "Rappresentante di vendita",
    filterSource: "Origine",
    source: {
      meet: "Meet",
      teams: "Teams",
      zoom: "Zoom",
      gong: "Gong",
      phone: "Telefono",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
    } as Record<CoachVideoSource, string>,
    colAiStatus: "Stato IA",
    badgeSummary: "Riepilogo",
    badgeAnalysis: "Analisi",
    selectedCount: (n: number) => `${n} selezionati`,
    bulkSummarize: (n: number) => `Riassumi registrazioni (${n})`,
    bulkAnalyze: (n: number) => `Analizza registrazioni (${n})`,
    processRecordings: "Elabora registrazioni",
    processToastBoth: (s: number, a: number) =>
      `${s} registrazioni riassunte, ${a} analizzate`,
    processToastSummarizeOnly: (n: number) =>
      `${n} ${n === 1 ? "registrazione riassunta" : "registrazioni riassunte"}`,
    processToastAnalyzeOnly: (n: number) =>
      `${n} ${n === 1 ? "registrazione analizzata" : "registrazioni analizzate"}`,
    skill: {
      rapport: "Rapport",
      discovery: "Discovery",
      nextSteps: "Prossimi passi",
      talkRatio: "Rapporto di conversazione",
      objections: "Gestione delle obiezioni",
      qualification: "Qualificazione",
      valueFraming: "Proposta di valore",
    } as Record<CoachSkill, string>,
  },
  fr: {
    title: "Coach d'appels",
    description:
      "Analyse IA de vos appels de vente avec des retours actionnables.",
    introTitle: "Coachez chaque appel",
    introDescription:
      "Les enregistrements analysés par l'IA révèlent le ratio de parole, les sujets et la meilleure prochaine étape.",
    introPoints: [
      "Transcription automatique des appels",
      "Analyse du ratio de parole et du sentiment",
      "Rapports de coaching à partager",
    ],
    tabEfficiency: "Efficacité",
    tabPerformance: "Performance",
    tabTeam: "Équipe",
    avgScore: "Score moyen des appels",
    callsAnalyzed: "Appels analysés",
    avgTalkRatio: "Ratio de parole moyen",
    playRecording: "Lire l'enregistrement",
    talkRatioYou: "Ratio de parole (vous)",
    talkRatioHint: "Visez 40–45 % — laissez le prospect parler davantage.",
    highlights: "Points marquants",
    recommendedNextSteps: "Prochaines étapes recommandées",
    aiGenerated: "Généré par IA",
    viewFullAnalysis: "Voir l'analyse complète",
    callScore: "Score",
    perfStrengths: "Vos points forts",
    perfGaps: "Axes d'amélioration",
    perfRanked: "Appels par score",
    perfNoStrong: "Analysez plus d'appels pour révéler des forces récurrentes.",
    perfNoWeak: "Aucun point faible récurrent — beau travail.",
    teamTitle: "Performance de l'équipe",
    teamAvgScore: "Score moyen de l'équipe",
    teamCalls: "Appels analysés",
    teamAvgTalk: "Ratio de parole moyen",
    colRep: "Commercial",
    colAvgScore: "Score moyen",
    colCalls: "Appels",
    colTalk: "Ratio",
    colTrend: "Tendance",
    colStrength: "Point fort",
    colGap: "Lacune",
    sentiment: {
      positive: "Positif",
      neutral: "Neutre",
      negative: "Négatif",
    },
    search: "Rechercher des appels…",
    viewCards: "Cartes",
    viewTable: "Tableau",
    exportLabel: "Exporter",
    exported: "Appels exportés en CSV",
    noResults: "Aucun appel ne correspond à votre recherche.",
    sortRecent: "Plus récents",
    sortScore: "Score le plus élevé",
    sortDuration: "Plus longs",
    colTitle: "Appel",
    colContact: "Prospect",
    colDate: "Date",
    colDuration: "Durée",
    colSentiment: "Sentiment",
    colScore: "Score",
    filters: "Filtres",
    filterDialogTitle: "Filtrer les appels",
    filterDialogDescription:
      "Affinez la liste par prospect, transaction, commercial, plage de dates ou source.",
    dateFrom: "Du",
    dateTo: "Au",
    clearAll: "Tout effacer",
    clear: "Effacer",
    cancel: "Annuler",
    apply: "Appliquer",
    filterProspectName: "Nom du prospect",
    filterProspectPosition: "Poste du prospect",
    filterProspectCompany: "Entreprise du prospect",
    filterDeal: "Transaction",
    filterTeam: "Équipe",
    filterAllTeams: "Toutes les équipes",
    filterSalesRep: "Commercial",
    filterSource: "Source",
    source: {
      meet: "Meet",
      teams: "Teams",
      zoom: "Zoom",
      gong: "Gong",
      phone: "Téléphone",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
    } as Record<CoachVideoSource, string>,
    colAiStatus: "État IA",
    badgeSummary: "Résumé",
    badgeAnalysis: "Analyse",
    selectedCount: (n: number) => `${n} sélectionné(s)`,
    bulkSummarize: (n: number) => `Résumer les enregistrements (${n})`,
    bulkAnalyze: (n: number) => `Analyser les enregistrements (${n})`,
    processRecordings: "Traiter les enregistrements",
    processToastBoth: (s: number, a: number) =>
      `${s} enregistrements résumés, ${a} analysés`,
    processToastSummarizeOnly: (n: number) =>
      `${n} ${n === 1 ? "enregistrement résumé" : "enregistrements résumés"}`,
    processToastAnalyzeOnly: (n: number) =>
      `${n} ${n === 1 ? "enregistrement analysé" : "enregistrements analysés"}`,
    skill: {
      rapport: "Relationnel",
      discovery: "Découverte",
      nextSteps: "Prochaines étapes",
      talkRatio: "Ratio de parole",
      objections: "Gestion des objections",
      qualification: "Qualification",
      valueFraming: "Proposition de valeur",
    } as Record<CoachSkill, string>,
  },
  de: {
    title: "Call Coach",
    description:
      "KI-Analyse deiner Sales Calls mit umsetzbarem Feedback.",
    introTitle: "Coache jeden Call",
    introDescription:
      "KI-analysierte Call-Aufzeichnungen zeigen Redeanteil, Themen und den besten nächsten Schritt.",
    introPoints: [
      "Automatische Transkription der Calls",
      "Analyse von Redeanteil und Stimmung",
      "Coaching-Scorecards zum Teilen",
    ],
    tabEfficiency: "Effizienz",
    tabPerformance: "Leistung",
    tabTeam: "Team",
    avgScore: "Durchschnittlicher Call-Score",
    callsAnalyzed: "Analysierte Calls",
    avgTalkRatio: "Durchschnittlicher Redeanteil",
    playRecording: "Aufzeichnung abspielen",
    talkRatioYou: "Redeanteil (du)",
    talkRatioHint: "Ziele auf 40–45 % — lass den Prospect mehr reden.",
    highlights: "Highlights",
    recommendedNextSteps: "Empfohlene nächste Schritte",
    aiGenerated: "KI-generiert",
    viewFullAnalysis: "Vollständige Analyse ansehen",
    callScore: "Call-Score",
    perfStrengths: "Deine Stärken",
    perfGaps: "Verbesserungspotenzial",
    perfRanked: "Calls nach Score",
    perfNoStrong: "Analysiere mehr Calls, um konstante Stärken sichtbar zu machen.",
    perfNoWeak: "Keine wiederkehrenden Schwächen — starke Arbeit.",
    teamTitle: "Team-Leistung",
    teamAvgScore: "Durchschnittlicher Team-Score",
    teamCalls: "Analysierte Calls",
    teamAvgTalk: "Durchschnittlicher Redeanteil",
    colRep: "Rep",
    colAvgScore: "Ø Score",
    colCalls: "Calls",
    colTalk: "Redeanteil",
    colTrend: "Trend",
    colStrength: "Stärke",
    colGap: "Schwäche",
    sentiment: {
      positive: "Positiv",
      neutral: "Neutral",
      negative: "Negativ",
    },
    search: "Calls durchsuchen…",
    viewCards: "Karten",
    viewTable: "Tabelle",
    exportLabel: "Exportieren",
    exported: "Calls als CSV exportiert",
    noResults: "Keine Calls entsprechen deiner Suche.",
    sortRecent: "Neueste zuerst",
    sortScore: "Höchster Score",
    sortDuration: "Längste zuerst",
    colTitle: "Call",
    colContact: "Prospect",
    colDate: "Datum",
    colDuration: "Dauer",
    colSentiment: "Stimmung",
    colScore: "Score",
    filters: "Filter",
    filterDialogTitle: "Calls filtern",
    filterDialogDescription:
      "Grenze die Liste nach Prospect, Deal, Vertriebsmitarbeiter, Zeitraum oder Quelle ein.",
    dateFrom: "Von",
    dateTo: "Bis",
    clearAll: "Alles zurücksetzen",
    clear: "Leeren",
    cancel: "Abbrechen",
    apply: "Anwenden",
    filterProspectName: "Name des Prospects",
    filterProspectPosition: "Position des Prospects",
    filterProspectCompany: "Unternehmen des Prospects",
    filterDeal: "Deal",
    filterTeam: "Team",
    filterAllTeams: "Alle Teams",
    filterSalesRep: "Vertriebsmitarbeiter",
    filterSource: "Quelle",
    source: {
      meet: "Meet",
      teams: "Teams",
      zoom: "Zoom",
      gong: "Gong",
      phone: "Telefon",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
    } as Record<CoachVideoSource, string>,
    colAiStatus: "KI-Status",
    badgeSummary: "Zusammenfassung",
    badgeAnalysis: "Analyse",
    selectedCount: (n: number) => `${n} ausgewählt`,
    bulkSummarize: (n: number) => `Aufzeichnungen zusammenfassen (${n})`,
    bulkAnalyze: (n: number) => `Aufzeichnungen analysieren (${n})`,
    processRecordings: "Aufzeichnungen verarbeiten",
    processToastBoth: (s: number, a: number) =>
      `${s} Aufzeichnungen zusammengefasst, ${a} analysiert`,
    processToastSummarizeOnly: (n: number) =>
      `${n} ${n === 1 ? "Aufzeichnung" : "Aufzeichnungen"} zusammengefasst`,
    processToastAnalyzeOnly: (n: number) =>
      `${n} ${n === 1 ? "Aufzeichnung" : "Aufzeichnungen"} analysiert`,
    skill: {
      rapport: "Rapport",
      discovery: "Discovery",
      nextSteps: "Nächste Schritte",
      talkRatio: "Redeanteil",
      objections: "Einwandbehandlung",
      qualification: "Qualifizierung",
      valueFraming: "Nutzenargumentation",
    } as Record<CoachSkill, string>,
  },
  pt: {
    title: "Coach de chamadas",
    description:
      "Análise com IA das suas chamadas de vendas com recomendações acionáveis.",
    introTitle: "Treine cada chamada",
    introDescription:
      "As gravações analisadas por IA revelam o rácio de conversa, os temas e o melhor passo seguinte.",
    introPoints: [
      "Transcrição automática de chamadas",
      "Análise de rácio de conversa e sentimento",
      "Relatórios de coaching para partilhar",
    ],
    tabEfficiency: "Eficiência",
    tabPerformance: "Desempenho",
    tabTeam: "Equipa",
    avgScore: "Pontuação média das chamadas",
    callsAnalyzed: "Chamadas analisadas",
    avgTalkRatio: "Rácio de conversa médio",
    playRecording: "Reproduzir gravação",
    talkRatioYou: "Rácio de conversa (você)",
    talkRatioHint: "Aponte para 40–45% — deixe o prospect falar mais.",
    highlights: "Destaques",
    recommendedNextSteps: "Próximos passos recomendados",
    aiGenerated: "Gerado por IA",
    viewFullAnalysis: "Ver análise completa",
    callScore: "Pontuação",
    perfStrengths: "Onde se destaca",
    perfGaps: "Onde melhorar",
    perfRanked: "Chamadas por pontuação",
    perfNoStrong: "Analise mais chamadas para revelar pontos fortes consistentes.",
    perfNoWeak: "Sem pontos fracos recorrentes — bom trabalho.",
    teamTitle: "Desempenho da equipa",
    teamAvgScore: "Pontuação média da equipa",
    teamCalls: "Chamadas analisadas",
    teamAvgTalk: "Rácio de conversa médio",
    colRep: "Comercial",
    colAvgScore: "Pontuação média",
    colCalls: "Chamadas",
    colTalk: "Rácio",
    colTrend: "Tendência",
    colStrength: "Ponto forte",
    colGap: "Lacuna",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
    search: "Pesquisar chamadas…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Chamadas exportadas para CSV",
    noResults: "Nenhuma chamada corresponde à sua pesquisa.",
    sortRecent: "Mais recentes",
    sortScore: "Maior pontuação",
    sortDuration: "Mais longas",
    colTitle: "Chamada",
    colContact: "Prospect",
    colDate: "Data",
    colDuration: "Duração",
    colSentiment: "Sentimento",
    colScore: "Pontuação",
    filters: "Filtros",
    filterDialogTitle: "Filtrar chamadas",
    filterDialogDescription:
      "Reduz a lista por prospect, negócio, representante, intervalo de datas ou origem.",
    dateFrom: "De",
    dateTo: "Até",
    clearAll: "Limpar tudo",
    clear: "Limpar",
    cancel: "Cancelar",
    apply: "Aplicar",
    filterProspectName: "Nome do prospect",
    filterProspectPosition: "Cargo do prospect",
    filterProspectCompany: "Empresa do prospect",
    filterDeal: "Negócio",
    filterTeam: "Equipa",
    filterAllTeams: "Todas as equipas",
    filterSalesRep: "Representante de vendas",
    filterSource: "Origem",
    source: {
      meet: "Meet",
      teams: "Teams",
      zoom: "Zoom",
      gong: "Gong",
      phone: "Telefone",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
    } as Record<CoachVideoSource, string>,
    colAiStatus: "Estado de IA",
    badgeSummary: "Resumo",
    badgeAnalysis: "Análise",
    selectedCount: (n: number) => `${n} selecionados`,
    bulkSummarize: (n: number) => `Resumir gravações (${n})`,
    bulkAnalyze: (n: number) => `Analisar gravações (${n})`,
    processRecordings: "Processar gravações",
    processToastBoth: (s: number, a: number) =>
      `${s} gravações resumidas, ${a} analisadas`,
    processToastSummarizeOnly: (n: number) =>
      `${n} ${n === 1 ? "gravação resumida" : "gravações resumidas"}`,
    processToastAnalyzeOnly: (n: number) =>
      `${n} ${n === 1 ? "gravação analisada" : "gravações analisadas"}`,
    skill: {
      rapport: "Rapport",
      discovery: "Descoberta",
      nextSteps: "Próximos passos",
      talkRatio: "Rácio de conversa",
      objections: "Gestão de objeções",
      qualification: "Qualificação",
      valueFraming: "Proposta de valor",
    } as Record<CoachSkill, string>,
  },
  pt_BR: {
    title: "Coach de ligações",
    description:
      "Análise com IA das suas ligações de vendas com recomendações acionáveis.",
    introTitle: "Treine cada ligação",
    introDescription:
      "As gravações analisadas por IA revelam a proporção de fala, os tópicos e o melhor próximo passo.",
    introPoints: [
      "Transcrição automática de ligações",
      "Análise de proporção de fala e sentimento",
      "Relatórios de coaching para compartilhar",
    ],
    tabEfficiency: "Eficiência",
    tabPerformance: "Desempenho",
    tabTeam: "Time",
    avgScore: "Pontuação média das ligações",
    callsAnalyzed: "Ligações analisadas",
    avgTalkRatio: "Proporção de fala média",
    playRecording: "Reproduzir gravação",
    talkRatioYou: "Proporção de fala (você)",
    talkRatioHint: "Mire em 40–45% — deixe o prospect falar mais.",
    highlights: "Destaques",
    recommendedNextSteps: "Próximos passos recomendados",
    aiGenerated: "Gerado por IA",
    viewFullAnalysis: "Ver análise completa",
    callScore: "Pontuação",
    perfStrengths: "Onde você se destaca",
    perfGaps: "Onde melhorar",
    perfRanked: "Ligações por pontuação",
    perfNoStrong: "Analise mais ligações para revelar pontos fortes consistentes.",
    perfNoWeak: "Sem pontos fracos recorrentes — bom trabalho.",
    teamTitle: "Desempenho do time",
    teamAvgScore: "Pontuação média do time",
    teamCalls: "Ligações analisadas",
    teamAvgTalk: "Proporção de fala média",
    colRep: "Representante",
    colAvgScore: "Pontuação média",
    colCalls: "Ligações",
    colTalk: "Proporção",
    colTrend: "Tendência",
    colStrength: "Ponto forte",
    colGap: "Lacuna",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
    search: "Buscar ligações…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Ligações exportadas para CSV",
    noResults: "Nenhuma ligação corresponde à sua busca.",
    sortRecent: "Mais recentes",
    sortScore: "Maior pontuação",
    sortDuration: "Mais longas",
    colTitle: "Ligação",
    colContact: "Prospect",
    colDate: "Data",
    colDuration: "Duração",
    colSentiment: "Sentimento",
    colScore: "Pontuação",
    filters: "Filtros",
    filterDialogTitle: "Filtrar ligações",
    filterDialogDescription:
      "Reduza a lista por prospect, negócio, representante, intervalo de datas ou origem.",
    dateFrom: "De",
    dateTo: "Até",
    clearAll: "Limpar tudo",
    clear: "Limpar",
    cancel: "Cancelar",
    apply: "Aplicar",
    filterProspectName: "Nome do prospect",
    filterProspectPosition: "Cargo do prospect",
    filterProspectCompany: "Empresa do prospect",
    filterDeal: "Negócio",
    filterTeam: "Time",
    filterAllTeams: "Todos os times",
    filterSalesRep: "Representante de vendas",
    filterSource: "Origem",
    source: {
      meet: "Meet",
      teams: "Teams",
      zoom: "Zoom",
      gong: "Gong",
      phone: "Telefone",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
    } as Record<CoachVideoSource, string>,
    colAiStatus: "Status de IA",
    badgeSummary: "Resumo",
    badgeAnalysis: "Análise",
    selectedCount: (n: number) => `${n} selecionados`,
    bulkSummarize: (n: number) => `Resumir gravações (${n})`,
    bulkAnalyze: (n: number) => `Analisar gravações (${n})`,
    processRecordings: "Processar gravações",
    processToastBoth: (s: number, a: number) =>
      `${s} gravações resumidas, ${a} analisadas`,
    processToastSummarizeOnly: (n: number) =>
      `${n} ${n === 1 ? "gravação resumida" : "gravações resumidas"}`,
    processToastAnalyzeOnly: (n: number) =>
      `${n} ${n === 1 ? "gravação analisada" : "gravações analisadas"}`,
    skill: {
      rapport: "Rapport",
      discovery: "Descoberta",
      nextSteps: "Próximos passos",
      talkRatio: "Proporção de fala",
      objections: "Contorno de objeções",
      qualification: "Qualificação",
      valueFraming: "Proposta de valor",
    } as Record<CoachSkill, string>,
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

const avgScore = Math.round(
  coachRecordings.reduce((s, r) => s + r.score, 0) / coachRecordings.length
)
const avgTalkRatio = Math.round(
  coachRecordings.reduce((s, r) => s + r.talkRatio, 0) / coachRecordings.length
)

// Cross-call strengths & gaps: the strong/weak graded sections across all calls.
const strongSections = coachRecordings
  .flatMap((r) =>
    getScorecard(r.id)
      .sections.filter((s) => s.grade === "strong")
      .map((s) => ({ id: r.id, call: r.title, label: s.label, score: s.score }))
  )
  .sort((a, b) => b.score - a.score)
const weakSections = coachRecordings
  .flatMap((r) =>
    getScorecard(r.id)
      .sections.filter((s) => s.grade === "weak")
      .map((s) => ({ id: r.id, call: r.title, label: s.label, score: s.score }))
  )
  .sort((a, b) => a.score - b.score)
const rankedCalls = [...coachRecordings].sort((a, b) => b.score - a.score)

// Header labels reuse the per-locale strings already defined in COPY above
// (colTitle, colContact, …) rather than duplicating translations.
function colLabel(
  key:
    | "colTitle"
    | "colContact"
    | "colDate"
    | "colDuration"
    | "colSentiment"
    | "colScore"
    | "colAiStatus"
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

// The Summary/Analysis per-recording status pair — filled + colored (chart-1,
// the app's existing "positive/strong" green) when the flag is true, muted
// and dashed when false. Sparkles is reused rather than a new icon: both
// actions are AI-powered, and Sparkles is the app-wide fixed icon for that.
function AiStatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
        active
          ? "border-chart-1/30 bg-chart-1/15 text-chart-1"
          : "border-dashed text-muted-foreground/70"
      )}
    >
      <Sparkles className={cn("size-3", !active && "opacity-50")} />
      {label}
    </span>
  )
}

const RECORDING_COLUMNS: ColumnDef<CoachRecording>[] = [
  {
    id: "title",
    label: colLabel("colTitle"),
    group: "coach",
    pinned: true,
    getValue: (r) => r.title,
    render: (r) => <span className="font-medium">{r.title}</span>,
  },
  {
    id: "contact",
    label: colLabel("colContact"),
    group: "coach",
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
    group: "coach",
    getValue: (r) => r.date,
    render: (r) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {formatDate(r.date)}
      </span>
    ),
  },
  {
    id: "duration",
    label: colLabel("colDuration"),
    group: "coach",
    align: "right",
    getValue: (r) => r.durationMin,
    render: (r) => <span className="tabular-nums">{r.durationMin} min</span>,
  },
  {
    id: "sentiment",
    label: colLabel("colSentiment"),
    group: "coach",
    // English label (not the raw key) so the filter checklist shows readable
    // values — same convention as EMAIL_STATUS in lib/table-columns.tsx.
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
  {
    id: "score",
    label: colLabel("colScore"),
    group: "coach",
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
    // No getValue — like the app's other multi-value chip columns, this
    // shows two independent statuses at once, so there's no single value
    // to sort or contains-filter by. minWidth keeps both badges from being
    // clipped by the header-label-driven auto column width (same reason
    // Tags/Signals in table-columns.tsx set one).
    id: "aiStatus",
    label: colLabel("colAiStatus"),
    group: "coach",
    minWidth: "190px",
    render: (r, locale) => {
      const cc = COPY[locale]
      return (
        <div className="flex items-center gap-1">
          <AiStatusBadge label={cc.badgeSummary} active={Boolean(r.summarized)} />
          <AiStatusBadge label={cc.badgeAnalysis} active={Boolean(r.analyzed)} />
        </div>
      )
    },
  },
]

export default function Coach() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const liveRecordings = useCoachRecordings()
  const [view, setView] = React.useState<CollectionView>("table")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("recent")
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [prospectNameFilter, setProspectNameFilter] = React.useState("")
  const [prospectPositionFilter, setProspectPositionFilter] = React.useState("")
  const [prospectCompanyFilter, setProspectCompanyFilter] = React.useState("")
  const [dealIds, setDealIds] = React.useState<Set<string>>(new Set())
  const [teamId, setTeamId] = React.useState<string>(ALL_TEAMS)
  const [salesRepIds, setSalesRepIds] = React.useState<Set<string>>(new Set())
  const [sources, setSources] = React.useState<Set<CoachVideoSource>>(new Set())
  const filtersActive = Boolean(
    dateFrom ||
      dateTo ||
      prospectNameFilter ||
      prospectPositionFilter ||
      prospectCompanyFilter ||
      dealIds.size ||
      teamId !== ALL_TEAMS ||
      salesRepIds.size ||
      sources.size
  )

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const nameQ = prospectNameFilter.trim().toLowerCase()
    const positionQ = prospectPositionFilter.trim().toLowerCase()
    const companyQ = prospectCompanyFilter.trim().toLowerCase()
    const teamMemberIds =
      teamId === ALL_TEAMS
        ? null
        : new Set(teamMembers(teamId).map((m) => m.id))
    const filtered = liveRecordings.filter((r) => {
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.prospectName.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q)
      const day = r.date.slice(0, 10)
      const matchesFrom = !dateFrom || day >= dateFrom
      const matchesTo = !dateTo || day <= dateTo
      const matchesName = !nameQ || r.prospectName.toLowerCase().includes(nameQ)
      const matchesPosition =
        !positionQ || (r.prospectPosition ?? "").toLowerCase().includes(positionQ)
      const matchesCompany = !companyQ || r.company.toLowerCase().includes(companyQ)
      const matchesDeal = dealIds.size === 0 || (r.dealId ? dealIds.has(r.dealId) : false)
      const matchesTeam =
        teamId === ALL_TEAMS ||
        (r.salesRepId ? (teamMemberIds?.has(r.salesRepId) ?? false) : false)
      const matchesRep =
        salesRepIds.size === 0 || (r.salesRepId ? salesRepIds.has(r.salesRepId) : false)
      const matchesSource =
        sources.size === 0 || (r.videoSource ? sources.has(r.videoSource) : false)
      return (
        matchesQuery &&
        matchesFrom &&
        matchesTo &&
        matchesName &&
        matchesPosition &&
        matchesCompany &&
        matchesDeal &&
        matchesTeam &&
        matchesRep &&
        matchesSource
      )
    })
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "score":
          return b.score - a.score
        case "duration":
          return b.durationMin - a.durationMin
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    return sorted
  }, [
    liveRecordings,
    query,
    sort,
    dateFrom,
    dateTo,
    prospectNameFilter,
    prospectPositionFilter,
    prospectCompanyFilter,
    dealIds,
    teamId,
    salesRepIds,
    sources,
  ])

  // Column-level sort/filter (from the table's header controls) layers on
  // top of the toolbar's search/sort/date-range filtering above.
  const tsf = useTableSortFilter(RECORDING_COLUMNS, visible)

  // Reset to the first page whenever the filtered/sorted result set changes.
  // Column filters are serialized by hand — JSON.stringify would collapse the
  // enum filters' Sets to "{}" and miss changes within an active filter.
  const filterSig = Object.entries(tsf.filters)
    .map(([id, f]) =>
      f.type === "enum"
        ? `${id}:${Array.from(f.excluded).sort().join(",")}`
        : `${id}:${f.query}`
    )
    .join("|")
  const resultSig = [
    query,
    sort,
    dateFrom,
    dateTo,
    prospectNameFilter,
    prospectPositionFilter,
    prospectCompanyFilter,
    Array.from(dealIds).sort().join(","),
    teamId,
    Array.from(salesRepIds).sort().join(","),
    Array.from(sources).sort().join(","),
    tsf.sort?.columnId,
    tsf.sort?.dir,
    filterSig,
  ].join("|")

  // Same "select page at a time, capped select-all" behavior Companies/People
  // use — pagination and selection share one hook so a page of checkboxes
  // always matches the page actually on screen.
  const sel = usePagedSelection(tsf.rows, (r) => r.id, resultSig, PAGE_SIZE)
  const selectedRecordings = liveRecordings.filter((r) => sel.selectedIds.has(r.id))
  const toSummarizeCount = selectedRecordings.filter((r) => !r.summarized).length
  const toAnalyzeCount = selectedRecordings.filter((r) => !r.analyzed).length

  function handleProcess(opts: { summarize: boolean; analyze: boolean }) {
    const ids = Array.from(sel.selectedIds)
    coachRecordingStore.process(ids, opts)
    if (opts.summarize && opts.analyze) {
      toast.success(c.processToastBoth(toSummarizeCount, toAnalyzeCount))
    } else if (opts.summarize) {
      toast.success(c.processToastSummarizeOnly(toSummarizeCount))
    } else {
      toast.success(c.processToastAnalyzeOnly(toAnalyzeCount))
    }
    sel.clear()
  }

  function exportCsv() {
    downloadCsv(
      "kombo-calls.csv",
      [c.colTitle, c.colContact, c.colDate, c.colDuration, c.colSentiment, c.colScore],
      tsf.rows.map((r) => [
        r.title,
        `${r.prospectName} (${r.company})`,
        formatDate(r.date),
        `${r.durationMin} min`,
        c.sentiment[r.sentiment],
        r.score,
      ])
    )
    toast.success(c.exported)
  }

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />

      <FeatureIntro
        featureKey="coach"
        icon={GraduationCap}
        title={c.introTitle}
        description={c.introDescription}
        points={c.introPoints}
        className="mb-6"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{c.avgScore}</CardDescription>
            <CardTitle className="text-2xl">{avgScore}/100</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.callsAnalyzed}</CardDescription>
            <CardTitle className="text-2xl">{coachRecordings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.avgTalkRatio}</CardDescription>
            <CardTitle className="text-2xl">{avgTalkRatio}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="efficiency">
        <TabsList className="mb-6">
          <TabsTrigger value="efficiency">{c.tabEfficiency}</TabsTrigger>
          <TabsTrigger value="performance">{c.tabPerformance}</TabsTrigger>
          <TabsTrigger value="team">{c.tabTeam}</TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency">
          <CollectionToolbar
            query={query}
            onQueryChange={setQuery}
            searchPlaceholder={c.search}
            sort={sort}
            onSortChange={setSort}
            sortOptions={[
              { value: "recent", label: c.sortRecent },
              { value: "score", label: c.sortScore },
              { value: "duration", label: c.sortDuration },
            ]}
            view={view}
            onViewChange={setView}
            cardsLabel={c.viewCards}
            tableLabel={c.viewTable}
            onExport={exportCsv}
            exportLabel={c.exportLabel}
          >
            <Button
              variant="outline"
              className={cn(
                "shrink-0",
                filtersActive && "border-primary bg-primary/10 text-primary"
              )}
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">{c.filters}</span>
            </Button>
          </CollectionToolbar>

          {visible.length === 0 ? (
            <Card className="text-muted-foreground p-8 text-center text-sm">
              {c.noResults}
            </Card>
          ) : (
            <>
              <SelectionControls
                allSelected={sel.allSelected}
                onTogglePage={sel.togglePage}
                selectedCount={sel.selectedIds.size}
                selectableCount={sel.selectableCount}
                onSelectAllCapped={sel.selectAllCapped}
                pageStart={sel.pageStart}
                pageEnd={sel.pageEnd}
                total={tsf.rows.length}
                page={sel.page}
                pageCount={sel.pageCount}
                onPrevPage={() => sel.setPage(Math.max(0, sel.page - 1))}
                onNextPage={() => sel.setPage(Math.min(sel.pageCount - 1, sel.page + 1))}
              />

              {view === "table" ? (
                // Rendered even when column filters exclude every row — the
                // header controls have to stay reachable to clear the filter
                // (the empty state shows inside the table body instead).
                <RecordingTable
                  rows={sel.pagedItems}
                  filterRows={visible}
                  locale={locale}
                  sort={tsf.sort}
                  onSortChange={tsf.setSort}
                  filters={tsf.filters}
                  onFilterChange={tsf.setFilter}
                  selection={{
                    isSelected: (r) => sel.selectedIds.has(r.id),
                    toggle: sel.toggleRow,
                    toggleAll: sel.togglePage,
                    allSelected: sel.allSelected,
                    someSelected: sel.someSelected,
                  }}
                />
              ) : sel.pagedItems.length === 0 ? (
                <Card className="text-muted-foreground p-8 text-center text-sm">
                  {c.noResults}
                </Card>
              ) : (
                <div className="space-y-4">
                  {sel.pagedItems.map((rec) => (
                    <RecordingCard
                      key={rec.id}
                      rec={rec}
                      selected={sel.selectedIds.has(rec.id)}
                      onToggleSelect={() => sel.toggleRow(rec)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab c={c} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab c={c} />
        </TabsContent>
      </Tabs>

      <CoachBulkActionsBar
        count={sel.selectedIds.size}
        toSummarizeCount={toSummarizeCount}
        toAnalyzeCount={toAnalyzeCount}
        onProcess={handleProcess}
        onClear={sel.clear}
      />

      <CoachFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        prospectName={prospectNameFilter}
        prospectPosition={prospectPositionFilter}
        prospectCompany={prospectCompanyFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        dealIds={dealIds}
        teamId={teamId}
        salesRepIds={salesRepIds}
        sources={sources}
        onApply={(next) => {
          setProspectNameFilter(next.prospectName)
          setProspectPositionFilter(next.prospectPosition)
          setProspectCompanyFilter(next.prospectCompany)
          setDateFrom(next.dateFrom)
          setDateTo(next.dateTo)
          setDealIds(next.dealIds)
          setTeamId(next.teamId)
          setSalesRepIds(next.salesRepIds)
          setSources(next.sources)
        }}
      />
    </Page>
  )
}

interface CoachFilterValues {
  prospectName: string
  prospectPosition: string
  prospectCompany: string
  dateFrom: string
  dateTo: string
  dealIds: Set<string>
  teamId: string
  salesRepIds: Set<string>
  sources: Set<CoachVideoSource>
}

function CoachFilterDialog({
  open,
  onOpenChange,
  prospectName,
  prospectPosition,
  prospectCompany,
  dateFrom,
  dateTo,
  dealIds,
  teamId,
  salesRepIds,
  sources,
  onApply,
}: CoachFilterValues & {
  open: boolean
  onOpenChange: (v: boolean) => void
  onApply: (next: CoachFilterValues) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const [name, setName] = React.useState(prospectName)
  const [position, setPosition] = React.useState(prospectPosition)
  const [company, setCompany] = React.useState(prospectCompany)
  const [from, setFrom] = React.useState(dateFrom)
  const [to, setTo] = React.useState(dateTo)
  const [deals_, setDeals_] = React.useState(dealIds)
  const [teamSel, setTeamSel] = React.useState(teamId)
  const [reps, setReps] = React.useState(salesRepIds)
  const [srcs, setSrcs] = React.useState(sources)

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(prospectName)
      setPosition(prospectPosition)
      setCompany(prospectCompany)
      setFrom(dateFrom)
      setTo(dateTo)
      setDeals_(new Set(dealIds))
      setTeamSel(teamId)
      setReps(new Set(salesRepIds))
      setSrcs(new Set(sources))
    }
  }

  // The Sales Rep checklist is narrowed to the selected team's members —
  // picking a team restricts, rather than filters on top of, the rep list.
  const repOptions = teamSel === ALL_TEAMS ? team : teamMembers(teamSel)

  function handleTeamChange(nextTeamId: string) {
    setTeamSel(nextTeamId)
    if (nextTeamId !== ALL_TEAMS) {
      const allowed = new Set(teamMembers(nextTeamId).map((m) => m.id))
      setReps((s) => new Set(Array.from(s).filter((id) => allowed.has(id))))
    }
  }

  const totalActive =
    (name.trim() ? 1 : 0) +
    (position.trim() ? 1 : 0) +
    (company.trim() ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0) +
    deals_.size +
    (teamSel !== ALL_TEAMS ? 1 : 0) +
    reps.size +
    srcs.size

  function handleApply() {
    onApply({
      prospectName: name,
      prospectPosition: position,
      prospectCompany: company,
      dateFrom: from,
      dateTo: to,
      dealIds: deals_,
      teamId: teamSel,
      salesRepIds: reps,
      sources: srcs,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <SlidersHorizontal className="size-4" />
            </span>
            {c.filterDialogTitle}
          </DialogTitle>
          <DialogDescription>{c.filterDialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="coach-filter-name">{c.filterProspectName}</Label>
              <Input
                id="coach-filter-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coach-filter-position">{c.filterProspectPosition}</Label>
              <Input
                id="coach-filter-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coach-filter-company">{c.filterProspectCompany}</Label>
              <Input
                id="coach-filter-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coach-filter-from">{c.dateFrom}</Label>
              <Input
                id="coach-filter-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coach-filter-to">{c.dateTo}</Label>
              <Input
                id="coach-filter-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground px-1 text-xs font-medium">{c.filterDeal}</p>
            {deals.map((d) => (
              <label
                key={d.id}
                className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm"
              >
                <Checkbox
                  checked={deals_.has(d.id)}
                  onCheckedChange={() => setDeals_((s) => toggled(s, d.id))}
                />
                <span className="truncate">{d.name}</span>
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coach-filter-team">{c.filterTeam}</Label>
            <Select value={teamSel} onValueChange={handleTeamChange}>
              <SelectTrigger id="coach-filter-team" className="w-full">
                <SelectValue placeholder={c.filterAllTeams} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TEAMS}>{c.filterAllTeams}</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground px-1 text-xs font-medium">
              {c.filterSalesRep}
            </p>
            {repOptions.map((m) => (
              <label
                key={m.id}
                className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm"
              >
                <Checkbox
                  checked={reps.has(m.id)}
                  onCheckedChange={() => setReps((s) => toggled(s, m.id))}
                />
                <span className="truncate">{m.name}</span>
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground px-1 text-xs font-medium">{c.filterSource}</p>
            {COACH_VIDEO_SOURCES.map((src) => (
              <label
                key={src}
                className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm"
              >
                <Checkbox
                  checked={srcs.has(src)}
                  onCheckedChange={() => setSrcs((s) => toggled(s, src))}
                />
                <span className="truncate">{c.source[src]}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            disabled={totalActive === 0}
            onClick={() => {
              setName("")
              setPosition("")
              setCompany("")
              setFrom("")
              setTo("")
              setDeals_(new Set())
              setTeamSel(ALL_TEAMS)
              setReps(new Set())
              setSrcs(new Set())
            }}
          >
            {c.clearAll}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={handleApply}>
              {c.apply}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// The bulk "Summarize"/"Analyze" panel: matches BulkActionsBar's visual
// shape (sticky bottom bar, "N selected", ghost Clear on the far right) but
// its interaction is different from that component's instant-fire buttons —
// each AI action is independently checkable, and a single "Process
// Recordings" button runs whichever are checked. That shape doesn't fit
// BulkActionsBar's props, so this is a page-local sibling rather than a
// widened shared component.
function CoachBulkActionsBar({
  count,
  toSummarizeCount,
  toAnalyzeCount,
  onProcess,
  onClear,
}: {
  count: number
  toSummarizeCount: number
  toAnalyzeCount: number
  onProcess: (opts: { summarize: boolean; analyze: boolean }) => void
  onClear: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const [armSummarize, setArmSummarize] = React.useState(true)
  const [armAnalyze, setArmAnalyze] = React.useState(true)
  // Re-arm both actions whenever a fresh selection begins, so a leftover
  // "off" toggle from a previous batch never silently carries over.
  const isEmpty = count === 0
  const [wasEmpty, setWasEmpty] = React.useState(isEmpty)
  if (isEmpty !== wasEmpty) {
    setWasEmpty(isEmpty)
    if (!isEmpty) {
      setArmSummarize(true)
      setArmAnalyze(true)
    }
  }

  if (count === 0) return null

  const canSummarize = toSummarizeCount > 0
  const canAnalyze = toAnalyzeCount > 0
  const willSummarize = armSummarize && canSummarize
  const willAnalyze = armAnalyze && canAnalyze

  return (
    <div className="bg-background sticky bottom-4 z-20 mt-3 flex flex-col gap-1.5 rounded-xl border p-2 shadow-lg">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="px-2 text-sm font-medium tabular-nums">
          {c.selectedCount(count)}
        </span>
        <span className="bg-border mx-1 h-5 w-px" />
        <button
          type="button"
          disabled={!canSummarize}
          onClick={() => setArmSummarize((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            willSummarize ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
          )}
        >
          <Checkbox checked={willSummarize} className="pointer-events-none" />
          <Sparkles className="size-4" />
          {c.bulkSummarize(toSummarizeCount)}
        </button>
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={() => setArmAnalyze((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            willAnalyze ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
          )}
        >
          <Checkbox checked={willAnalyze} className="pointer-events-none" />
          <Sparkles className="size-4" />
          {c.bulkAnalyze(toAnalyzeCount)}
        </button>
        <span className="bg-border mx-1 h-5 w-px" />
        <Button
          variant="volt"
          size="sm"
          disabled={!willSummarize && !willAnalyze}
          onClick={() => onProcess({ summarize: willSummarize, analyze: willAnalyze })}
        >
          {c.processRecordings}
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
          <X className="size-4" />
          {c.clear}
        </Button>
      </div>
    </div>
  )
}

function PerformanceTab({ c }: { c: Copy }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ThumbsUp className="text-chart-1 size-4" />
              {c.perfStrengths}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {strongSections.length === 0 ? (
              <p className="text-muted-foreground text-sm">{c.perfNoStrong}</p>
            ) : (
              strongSections.slice(0, 4).map((s) => (
                <Link
                  key={`${s.id}-${s.label}`}
                  to={`/coach/${s.id}`}
                  className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground"> · {s.call}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(s.score)
                    )}
                  >
                    {s.score}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="text-destructive size-4" />
              {c.perfGaps}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakSections.length === 0 ? (
              <p className="text-muted-foreground text-sm">{c.perfNoWeak}</p>
            ) : (
              weakSections.slice(0, 4).map((s) => (
                <Link
                  key={`${s.id}-${s.label}`}
                  to={`/coach/${s.id}`}
                  className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground"> · {s.call}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(s.score)
                    )}
                  >
                    {s.score}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.perfRanked}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rankedCalls.map((r) => (
            <Link
              key={r.id}
              to={`/coach/${r.id}`}
              className="hover:bg-muted/50 -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5"
            >
              <span
                className={cn(
                  "w-10 shrink-0 rounded-md px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums",
                  scorePillClass(r.score)
                )}
              >
                {r.score}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-sm font-medium">{r.title}</span>
                <span className="text-muted-foreground text-sm">
                  {" "}
                  · {r.prospectName}
                </span>
              </span>
              <Progress value={r.score} className="hidden w-40 sm:block" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function TeamTab({ c }: { c: Copy }) {
  const rows = coachLeaderboard()
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{c.teamAvgScore}</CardDescription>
            <CardTitle className="text-2xl">{coachTeamAvg.score}/100</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.teamCalls}</CardDescription>
            <CardTitle className="text-2xl">{coachTeamAvg.calls}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{c.teamAvgTalk}</CardDescription>
            <CardTitle className="text-2xl">{coachTeamAvg.talkRatio}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{c.colRep}</TableHead>
              <TableHead className="text-right">{c.colAvgScore}</TableHead>
              <TableHead className="text-right">{c.colCalls}</TableHead>
              <TableHead className="text-right">{c.colTalk}</TableHead>
              <TableHead className="text-right">{c.colTrend}</TableHead>
              <TableHead className="hidden md:table-cell">
                {c.colStrength}
              </TableHead>
              <TableHead className="hidden md:table-cell">{c.colGap}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.repId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: m.avatarColor }}
                    >
                      {m.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {m.role}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      scorePillClass(m.avgScore)
                    )}
                  >
                    {m.avgScore}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.callsAnalyzed}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.avgTalkRatio}%
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                      m.trend >= 0 ? "text-chart-1" : "text-destructive"
                    )}
                  >
                    {m.trend >= 0 ? (
                      <TrendingUp className="size-3.5" />
                    ) : (
                      <TrendingDown className="size-3.5" />
                    )}
                    {m.trend >= 0 ? "+" : ""}
                    {m.trend}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary" className="font-normal">
                    {c.skill[m.topStrength]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="font-normal">
                    {c.skill[m.topGap]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function RecordingTable({
  rows,
  filterRows,
  locale,
  sort,
  onSortChange,
  filters,
  onFilterChange,
  selection,
}: {
  rows: CoachRecording[]
  // Full pre-pagination result set — used to derive per-column filter
  // checklists so they don't shrink as the user pages through results.
  filterRows: CoachRecording[]
  locale: Locale
  sort: SortState
  onSortChange: (next: SortState) => void
  filters: Record<string, ColumnFilterState>
  onFilterChange: (columnId: string, next: ColumnFilterState | undefined) => void
  selection: {
    isSelected: (rec: CoachRecording) => boolean
    toggle: (rec: CoachRecording) => void
    toggleAll: () => void
    allSelected: boolean
    someSelected: boolean
  }
}) {
  const navigate = useNavigate()
  return (
    <DataTable
      columns={RECORDING_COLUMNS}
      visible={["contact", "date", "duration", "sentiment", "score", "aiStatus"]}
      rows={rows}
      rowKey={(rec) => rec.id}
      locale={locale}
      onRowClick={(rec) => navigate(`/coach/${rec.id}`)}
      sort={sort}
      onSortChange={onSortChange}
      filters={filters}
      onFilterChange={onFilterChange}
      filterRows={filterRows}
      empty={COPY[locale].noResults}
      selection={selection}
    />
  )
}

function RecordingCard({
  rec,
  selected,
  onToggleSelect,
}: {
  rec: CoachRecording
  selected: boolean
  onToggleSelect: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const sentiment = SENTIMENT[rec.sentiment]
  const SentimentIcon = sentiment.icon
  const scorecard = getScorecard(rec.id)
  const criticalNote =
    scorecard.headline ||
    scorecard.sections.find((s) => s.grade === "weak")?.critique
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex shrink-0 items-center pt-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              aria-label="Select recording"
            />
          </div>
          <Button
            size="icon"
            variant="outline"
            className="size-10 shrink-0 rounded-full"
            asChild
          >
            <Link to={`/coach/${rec.id}`} aria-label={c.playRecording}>
              <Play className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <CardTitle className="text-base">
              <Link to={`/coach/${rec.id}`} className="hover:text-primary">
                {rec.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {rec.prospectName} · {rec.company}
            </CardDescription>
            <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
              <span>{formatDate(rec.date)}</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {rec.durationMin} min
              </span>
              <span className={`flex items-center gap-1 ${sentiment.className}`}>
                <SentimentIcon className="size-3.5" />
                {c.sentiment[rec.sentiment]}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <AiStatusBadge label={c.badgeSummary} active={Boolean(rec.summarized)} />
              <AiStatusBadge label={c.badgeAnalysis} active={Boolean(rec.analyzed)} />
            </div>
            {criticalNote && (
              <p className="text-muted-foreground mt-2 text-sm">
                {criticalNote}
              </p>
            )}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
            scorePillClass(scorecard.overall)
          )}
          title={c.callScore}
        >
          <span className="bg-current size-1.5 rounded-full opacity-80" />
          {c.callScore} {scorecard.overall}
        </span>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              {c.talkRatioYou}
            </span>
            <span className="font-medium tabular-nums">{rec.talkRatio}%</span>
          </div>
          <Progress value={rec.talkRatio} />
          <p className="text-muted-foreground mt-1 text-xs">
            {c.talkRatioHint}
          </p>

          <p className="mt-4 mb-2 text-sm font-medium">{c.highlights}</p>
          <ul className="space-y-1.5">
            {rec.highlights.map((h) => (
              <li
                key={h}
                className="text-muted-foreground flex items-start gap-2 text-sm"
              >
                <span className="bg-muted-foreground/40 mt-1.5 size-1.5 shrink-0 rounded-full" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{c.recommendedNextSteps}</p>
          <div className="space-y-2">
            {rec.nextSteps.map((step) => (
              <div
                key={step}
                className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              >
                <CheckCircle2 className="text-primary size-4 shrink-0" />
                {step}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span
              className="text-primary inline-flex items-center"
              title={c.aiGenerated}
              aria-label={c.aiGenerated}
            >
              <Sparkles className="size-4" />
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/coach/${rec.id}`}>
                {c.viewFullAnalysis}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
