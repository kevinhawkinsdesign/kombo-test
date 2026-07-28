import * as React from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  RefreshCw,
  Building2,
  Play,
  Pause,
  Smile,
  Meh,
  Frown,
  ListChecks,
  CheckCircle2,
  Circle,
  Users,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Search,
  Send,
  Sparkles,
  Loader2,
  SkipBack,
  SkipForward,
  ExternalLink,
  Save,
  Trash2,
  Plus,
  AlertTriangle,
  Video,
  Mic,
  MessageCircle,
  Phone,
  ChevronDown,
} from "lucide-react"

import { useLocale, type Locale } from "@/lib/locale"
import { InfoHint } from "@/components/common/InfoHint"
import { BackLink } from "@/components/common/BackLink"
import { Page } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/common/EmptyState"
import { TabSkeleton } from "@/components/common/ContentSkeleton"
import { useSkeletonTransition } from "@/lib/use-skeleton-transition"
import { RichTextEditor } from "@/components/common/RichTextEditor"
import { SearchCombobox } from "@/components/common/SearchCombobox"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { AddToCrmDialog } from "@/components/crm/AddToCrmDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useFollowUpTemplates,
  followUpTemplateStore,
} from "@/lib/followup-templates"
import { coachRecordings, currentUser } from "@/lib/mock-data"
import { getScorecard } from "@/lib/mock-coaching"
import { recordingDetails } from "@/lib/mock-depth"
import { coachTeam, coachTeamAvg } from "@/lib/mock-coach-team"
import { CALL_TYPES, CALL_TYPE_META } from "@/lib/call-types"
import { plainToHtml, stripHtml } from "@/lib/rich-text"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type {
  CoachRecording,
  CallType,
  CoachSpeaker,
  CoachUtterance,
  CoachScoreMetric,
  CoachParticipant,
} from "@/lib/types"

const SENTIMENT = {
  positive: { icon: Smile, variant: "success" as const },
  neutral: { icon: Meh, variant: "secondary" as const },
  negative: { icon: Frown, variant: "destructive" as const },
}

// No real per-item priority data exists yet — cycles a deterministic
// high/medium/low so the Next Steps list reads as prioritized.
const ACTION_ITEM_PRIORITIES = ["high", "medium", "low"] as const

const COPY = {
  en: {
    recordingNotFound: "Recording not found.",
    coach: "All Calls",
    callScore: "Call score",
    reanalyzing: "Re-analyzing recording…",
    reanalyze: "Re-analyze",
    callTypeAria: "Call type",
    aiAssigned: "AI-assigned",
    aiAssignedHint: "Kai classified this call automatically from the transcript.",
    retypeTitle: "Re-analyze recording with the new type?",
    retypeDesc:
      "The summary, key fields, and insights for this recording were generated using the previous type. Re-analyzing will clear them and re-run the analysis against the new type's prompts and key-field definitions. The transcript itself is preserved either way.",
    justSave: "Just save",
    saveReanalyze: "Save and re-analyze",
    cancel: "Cancel",
    typeUpdated: "Call type updated",
    analysisUpdated: "Analysis updated",
    staleAnalysis: (t: string) =>
      `This analysis was generated with the “${t}” type — re-analyze to refresh it.`,
    callScoreBreakdown: "Call score breakdown",
    na: "NA",
    callReview: "Call review",
    yourAverage: "Your average",
    teamAverage: "Team average",
    whatWentWell: "What went well",
    whatCanImprove: "What can be improved",
    noAnalysisTitle: "No analysis yet",
    noAnalysisDesc:
      "Analyze this call to see its call score, a scored breakdown, and review feedback.",
    analyzeThisCall: "Analyze this call",
    expand: "Expand",
    collapse: "Collapse",
    notesAdded: "Notes added to CRM",
    addNotesToCrm: "Add notes to CRM",
    pause: "Pause",
    play: "Play",
    tabAnalysis: "Analysis",
    tabSummary: "Summary",
    tabTranscript: "Transcript",
    tabParticipants: "Participants",
    tabKeyFields: "Key Fields",
    tabFollowUp: "Follow-Up",
    host: "Host",
    joined: "Joined",
    noKeyFields: "No key fields were extracted for this call.",
    noShow: "No-show",
    addToCrm: "Add to CRM",
    inCrm: "In CRM",
    nextStepFieldLabel: (n: number) => `Next step ${n}`,
    selectNextStepAria: (step: string) => `Select for CRM: ${step}`,
    crmFirstName: "First name",
    crmLastName: "Last name",
    crmEmail: "Email",
    priorityLabel: (p: string) => `Priority: ${p}`,
    priority: {
      high: "High",
      medium: "Medium",
      low: "Low",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "Was the information above helpful?",
    overview: "Overview",
    overviewEmpty: "This call hasn't been summarized yet.",
    summary: "Summary",
    followUpTitle: (name: string) => `Follow up with ${name}`,
    valuePropGateTitle: "Confirm your value proposition",
    valuePropGateIntro:
      "Confirm your value proposition so Kai can tailor this follow-up.",
    valuePropGateDefault: (company: string) =>
      `${company} helps sales teams find and engage the right prospects faster with AI-powered search, enrichment, and outreach — all in one place.`,
    valuePropGateConfirm: "Confirm & continue",
    followUpSubjectLabel: "Subject",
    followUpBodyLabel: "Message",
    followUpDefaultSubject: (company: string) => `Following up — ${company}`,
    aiDraft: "Draft with AI",
    sendFollowUp: "Send email",
    followUpSent: "Follow-up email sent",
    templateLabel: "Template",
    aiDraftOption: "AI draft (from this call)",
    searchTemplatesPlaceholder: "Search templates...",
    noTemplatesFound: "No templates found.",
    saveAsTemplate: "Save as template",
    templateNamePlaceholder: "e.g. Thanks + next steps",
    saveTemplateBtn: "Save",
    updateTemplate: "Update template",
    deleteTemplate: "Delete template",
    templateCreated: "Follow-up template created",
    templateUpdated: "Follow-up template updated",
    templateDeleted: "Follow-up template deleted",
    followUpGreeting: (first: string) => `Hi ${first},`,
    followUpNextStepsLabel: "Next steps:",
    followUpRecapLabel: "Quick recap of what stood out:",
    followUpSignoff: "Best,",
    followUpNoContext:
      "This call doesn't have any next steps or key details logged yet — the draft below is a general recap. Add specifics before sending.",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Phone call",
      zoom: "Zoom",
      gong: "Gong",
      whatsapp: "WhatsApp",
    } as Record<string, string>,
    originalVideo: "Original video",
    originalAudio: "Original audio",
    audioOnly: "Audio only",
    openOnLinkedIn: "Watch the original video on LinkedIn",
    linkedinNoEmbed:
      "LinkedIn calls can't be played here — open the original on LinkedIn.",
    skipBack: "Back 10 seconds",
    skipForward: "Forward 10 seconds",
    playbackSpeed: (s: string) => `Playback speed ${s}`,
    seekAria: "Seek in recording",
    summaryHintLabel: "How this summary is generated",
    summaryHint:
      "This summary follows a custom prompt that can be configured per user or per company. For now the Kombo team sets it up for you — ask us to tune yours.",
    searchTranscript: "Search this transcript…",
    noTranscriptMatch: "No lines match your search.",
    transcriptSpeakingTime: "Speaking time",
    transcriptSeekAria: (speaker: string, time: string) =>
      `Jump to ${speaker} at ${time}`,
    transcript: "Transcript",
    participants: "Participants",
    noTranscript: "No transcript available for this recording.",
    noParticipants: "No participants identified for this recording.",
    objections: "Objections",
    actionItems: "Next steps",
    markNotDone: "Mark as not done",
    markDone: "Mark as done",
    completed: (label: string) => `Completed: ${label}`,
    tasksCreated: "Tasks created",
    createTasks: "Create tasks",
    personalityRead: "Personality read",
    helpful: "Helpful",
    notHelpful: "Not helpful",
    gladHelped: "Glad it helped",
    willImprove: "Thanks — we'll improve",
    min: "min",
    sentiment: {
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
    },
  },
  es: {
    recordingNotFound: "Grabación no encontrada.",
    coach: "Todas las llamadas",
    callScore: "Puntuación",
    reanalyzing: "Reanalizando la grabación…",
    reanalyze: "Reanalizar",
    callTypeAria: "Tipo de llamada",
    aiAssigned: "Asignado por IA",
    aiAssignedHint: "Kai clasificó esta llamada automáticamente a partir de la transcripción.",
    retypeTitle: "¿Reanalizar la grabación con el nuevo tipo?",
    retypeDesc:
      "El resumen, los campos clave y los insights de esta grabación se generaron con el tipo anterior. Al reanalizar se borrarán y se volverá a ejecutar el análisis con los prompts y campos clave del nuevo tipo. La transcripción se conserva en cualquier caso.",
    justSave: "Solo guardar",
    saveReanalyze: "Guardar y reanalizar",
    cancel: "Cancelar",
    typeUpdated: "Tipo de llamada actualizado",
    analysisUpdated: "Análisis actualizado",
    staleAnalysis: (t: string) =>
      `Este análisis se generó con el tipo «${t}» — reanaliza para actualizarlo.`,
    callScoreBreakdown: "Desglose de la puntuación",
    na: "NA",
    callReview: "Revisión de la llamada",
    yourAverage: "Tu media",
    teamAverage: "Media del equipo",
    whatWentWell: "Qué salió bien",
    whatCanImprove: "Qué se puede mejorar",
    noAnalysisTitle: "Sin análisis todavía",
    noAnalysisDesc:
      "Analiza esta llamada para ver su puntuación, un desglose detallado y comentarios de revisión.",
    analyzeThisCall: "Analizar esta llamada",
    expand: "Ampliar",
    collapse: "Contraer",
    notesAdded: "Notas añadidas al CRM",
    addNotesToCrm: "Añadir notas al CRM",
    pause: "Pausar",
    play: "Reproducir",
    tabAnalysis: "Análisis",
    tabSummary: "Resumen",
    tabTranscript: "Transcripción",
    tabParticipants: "Participantes",
    tabKeyFields: "Campos clave",
    tabFollowUp: "Seguimiento",
    host: "Anfitrión",
    joined: "Unido",
    noKeyFields: "No se extrajeron campos clave para esta llamada.",
    noShow: "No asistió",
    addToCrm: "Añadir al CRM",
    inCrm: "En CRM",
    nextStepFieldLabel: (n: number) => `Próximo paso ${n}`,
    selectNextStepAria: (step: string) => `Seleccionar para el CRM: ${step}`,
    crmFirstName: "Nombre",
    crmLastName: "Apellidos",
    crmEmail: "Correo",
    priorityLabel: (p: string) => `Prioridad: ${p}`,
    priority: {
      high: "Alta",
      medium: "Media",
      low: "Baja",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "¿Te resultó útil la información anterior?",
    overview: "Visión general",
    overviewEmpty: "Esta llamada aún no se ha resumido.",
    summary: "Resumen",
    followUpTitle: (name: string) => `Seguimiento con ${name}`,
    valuePropGateTitle: "Confirma tu propuesta de valor",
    valuePropGateIntro:
      "Confirma tu propuesta de valor para que Kai pueda adaptar este seguimiento.",
    valuePropGateDefault: (company: string) =>
      `${company} ayuda a los equipos de ventas a encontrar y contactar a los prospectos adecuados más rápido con búsqueda, enriquecimiento y prospección impulsados por IA — todo en un mismo lugar.`,
    valuePropGateConfirm: "Confirmar y continuar",
    followUpSubjectLabel: "Asunto",
    followUpBodyLabel: "Mensaje",
    followUpDefaultSubject: (company: string) => `Seguimiento — ${company}`,
    aiDraft: "Redactar con IA",
    sendFollowUp: "Enviar correo",
    followUpSent: "Correo de seguimiento enviado",
    templateLabel: "Plantilla",
    aiDraftOption: "Borrador de IA (de esta llamada)",
    searchTemplatesPlaceholder: "Buscar plantillas...",
    noTemplatesFound: "No se encontraron plantillas.",
    saveAsTemplate: "Guardar como plantilla",
    templateNamePlaceholder: "p. ej. Gracias + próximos pasos",
    saveTemplateBtn: "Guardar",
    updateTemplate: "Actualizar plantilla",
    deleteTemplate: "Eliminar plantilla",
    templateCreated: "Plantilla de seguimiento creada",
    templateUpdated: "Plantilla de seguimiento actualizada",
    templateDeleted: "Plantilla de seguimiento eliminada",
    followUpGreeting: (first: string) => `Hola ${first}:`,
    followUpNextStepsLabel: "Próximos pasos:",
    followUpRecapLabel: "Un resumen rápido de lo más destacado:",
    followUpSignoff: "Un saludo,",
    followUpNoContext:
      "Esta llamada aún no tiene próximos pasos ni detalles clave registrados — el borrador de abajo es un resumen general. Añade detalles concretos antes de enviarlo.",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Llamada telefónica",
      zoom: "Zoom",
      gong: "Gong",
      whatsapp: "WhatsApp",
    } as Record<string, string>,
    originalVideo: "Vídeo original",
    originalAudio: "Audio original",
    audioOnly: "Solo audio",
    openOnLinkedIn: "Ver el vídeo original en LinkedIn",
    linkedinNoEmbed:
      "Las llamadas de LinkedIn no se pueden reproducir aquí — abre el original en LinkedIn.",
    skipBack: "Retroceder 10 segundos",
    skipForward: "Avanzar 10 segundos",
    playbackSpeed: (s: string) => `Velocidad de reproducción ${s}`,
    seekAria: "Buscar en la grabación",
    summaryHintLabel: "Cómo se genera este resumen",
    summaryHint:
      "Este resumen sigue un prompt personalizado configurable por usuario o por empresa. Por ahora lo configura el equipo de Kombo — pídenos ajustar el tuyo.",
    searchTranscript: "Busca en la transcripción…",
    noTranscriptMatch: "Ninguna línea coincide con tu búsqueda.",
    transcriptSpeakingTime: "Tiempo de conversación",
    transcriptSeekAria: (speaker: string, time: string) =>
      `Saltar a ${speaker} en ${time}`,
    transcript: "Transcripción",
    participants: "Participantes",
    noTranscript: "No hay transcripción disponible para esta grabación.",
    noParticipants: "No se identificaron participantes para esta grabación.",
    objections: "Objeciones",
    actionItems: "Próximos pasos",
    markNotDone: "Marcar como pendiente",
    markDone: "Marcar como completada",
    completed: (label: string) => `Completada: ${label}`,
    tasksCreated: "Tareas creadas",
    createTasks: "Crear tareas",
    personalityRead: "Análisis de personalidad",
    helpful: "Útil",
    notHelpful: "No útil",
    gladHelped: "Nos alegra que te ayudara",
    willImprove: "Gracias: lo mejoraremos",
    min: "min",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
    },
  },
  it: {
    recordingNotFound: "Registrazione non trovata.",
    coach: "Tutte le chiamate",
    callScore: "Punteggio",
    reanalyzing: "Rianalisi della registrazione…",
    reanalyze: "Rianalizza",
    callTypeAria: "Tipo di chiamata",
    aiAssigned: "Assegnato dall'AI",
    aiAssignedHint: "Kai ha classificato questa chiamata automaticamente dalla trascrizione.",
    retypeTitle: "Rianalizzare la registrazione con il nuovo tipo?",
    retypeDesc:
      "Il riepilogo, i campi chiave e gli insight di questa registrazione sono stati generati con il tipo precedente. Rianalizzando verranno cancellati e l'analisi verrà rieseguita con i prompt e le definizioni dei campi chiave del nuovo tipo. La trascrizione viene comunque conservata.",
    justSave: "Salva soltanto",
    saveReanalyze: "Salva e rianalizza",
    cancel: "Annulla",
    typeUpdated: "Tipo di chiamata aggiornato",
    analysisUpdated: "Analisi aggiornata",
    staleAnalysis: (t: string) =>
      `Questa analisi è stata generata con il tipo «${t}» — rianalizza per aggiornarla.`,
    callScoreBreakdown: "Dettaglio del punteggio",
    na: "NA",
    callReview: "Revisione della chiamata",
    yourAverage: "La tua media",
    teamAverage: "Media del team",
    whatWentWell: "Cosa è andato bene",
    whatCanImprove: "Cosa si può migliorare",
    noAnalysisTitle: "Nessuna analisi ancora",
    noAnalysisDesc:
      "Analizza questa chiamata per vedere il punteggio, un dettaglio per categoria e un riepilogo di revisione.",
    analyzeThisCall: "Analizza questa chiamata",
    expand: "Espandi",
    collapse: "Comprimi",
    notesAdded: "Note aggiunte al CRM",
    addNotesToCrm: "Aggiungi note al CRM",
    pause: "Pausa",
    play: "Riproduci",
    tabAnalysis: "Analisi",
    tabSummary: "Riepilogo",
    tabTranscript: "Trascrizione",
    tabParticipants: "Partecipanti",
    tabKeyFields: "Campi chiave",
    tabFollowUp: "Follow-up",
    host: "Organizzatore",
    joined: "Presente",
    noKeyFields: "Nessun campo chiave estratto per questa chiamata.",
    noShow: "Assente",
    addToCrm: "Aggiungi al CRM",
    inCrm: "Nel CRM",
    nextStepFieldLabel: (n: number) => `Prossimo passo ${n}`,
    selectNextStepAria: (step: string) => `Seleziona per il CRM: ${step}`,
    crmFirstName: "Nome",
    crmLastName: "Cognome",
    crmEmail: "Email",
    priorityLabel: (p: string) => `Priorità: ${p}`,
    priority: {
      high: "Alta",
      medium: "Media",
      low: "Bassa",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "Le informazioni qui sopra ti sono state utili?",
    overview: "Panoramica",
    overviewEmpty: "Questa chiamata non è stata ancora riepilogata.",
    summary: "Riepilogo",
    followUpTitle: (name: string) => `Follow-up con ${name}`,
    valuePropGateTitle: "Conferma la tua proposta di valore",
    valuePropGateIntro:
      "Conferma la tua proposta di valore così Kai può personalizzare questo follow-up.",
    valuePropGateDefault: (company: string) =>
      `${company} aiuta i team di vendita a trovare e coinvolgere i prospect giusti più velocemente con ricerca, arricchimento e prospecting basati sull'AI — tutto in un unico posto.`,
    valuePropGateConfirm: "Conferma e continua",
    followUpSubjectLabel: "Oggetto",
    followUpBodyLabel: "Messaggio",
    followUpDefaultSubject: (company: string) => `Follow-up — ${company}`,
    aiDraft: "Scrivi con l'AI",
    sendFollowUp: "Invia email",
    followUpSent: "Email di follow-up inviata",
    templateLabel: "Modello",
    aiDraftOption: "Bozza AI (da questa chiamata)",
    searchTemplatesPlaceholder: "Cerca modelli...",
    noTemplatesFound: "Nessun modello trovato.",
    saveAsTemplate: "Salva come modello",
    templateNamePlaceholder: "es. Grazie + prossimi passi",
    saveTemplateBtn: "Salva",
    updateTemplate: "Aggiorna modello",
    deleteTemplate: "Elimina modello",
    templateCreated: "Modello di follow-up creato",
    templateUpdated: "Modello di follow-up aggiornato",
    templateDeleted: "Modello di follow-up eliminato",
    followUpGreeting: (first: string) => `Ciao ${first},`,
    followUpNextStepsLabel: "Prossimi passi:",
    followUpRecapLabel: "Un rapido riepilogo di ciò che è emerso:",
    followUpSignoff: "Un saluto,",
    followUpNoContext:
      "Questa chiamata non ha ancora prossimi passi o dettagli chiave registrati — la bozza qui sotto è un riepilogo generico. Aggiungi dettagli specifici prima di inviarla.",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Telefonata",
      zoom: "Zoom",
      gong: "Gong",
      whatsapp: "WhatsApp",
    } as Record<string, string>,
    originalVideo: "Video originale",
    originalAudio: "Audio originale",
    audioOnly: "Solo audio",
    openOnLinkedIn: "Guarda il video originale su LinkedIn",
    linkedinNoEmbed:
      "Le chiamate LinkedIn non si possono riprodurre qui — apri l'originale su LinkedIn.",
    skipBack: "Indietro di 10 secondi",
    skipForward: "Avanti di 10 secondi",
    playbackSpeed: (s: string) => `Velocità di riproduzione ${s}`,
    seekAria: "Scorri nella registrazione",
    summaryHintLabel: "Come viene generato questo riepilogo",
    summaryHint:
      "Questo riepilogo segue un prompt personalizzato configurabile per utente o per azienda. Per ora lo configura il team di Kombo — chiedici di regolare il tuo.",
    searchTranscript: "Cerca nella trascrizione…",
    noTranscriptMatch: "Nessuna riga corrisponde alla tua ricerca.",
    transcriptSpeakingTime: "Tempo di parola",
    transcriptSeekAria: (speaker: string, time: string) =>
      `Vai a ${speaker} a ${time}`,
    transcript: "Trascrizione",
    participants: "Partecipanti",
    noTranscript: "Nessuna trascrizione disponibile per questa registrazione.",
    noParticipants: "Nessun partecipante identificato per questa registrazione.",
    objections: "Obiezioni",
    actionItems: "Prossimi passi",
    markNotDone: "Segna come da fare",
    markDone: "Segna come fatto",
    completed: (label: string) => `Completato: ${label}`,
    tasksCreated: "Attività create",
    createTasks: "Crea attività",
    personalityRead: "Profilo di personalità",
    helpful: "Utile",
    notHelpful: "Non utile",
    gladHelped: "Felici che ti sia servito",
    willImprove: "Grazie — miglioreremo",
    min: "min",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
  },
  fr: {
    recordingNotFound: "Enregistrement introuvable.",
    coach: "Tous les appels",
    callScore: "Score",
    reanalyzing: "Nouvelle analyse de l'enregistrement…",
    reanalyze: "Relancer l'analyse",
    callTypeAria: "Type d'appel",
    aiAssigned: "Attribué par l'IA",
    aiAssignedHint: "Kai a classé cet appel automatiquement à partir de la transcription.",
    retypeTitle: "Relancer l'analyse avec le nouveau type ?",
    retypeDesc:
      "Le résumé, les champs clés et les insights de cet enregistrement ont été générés avec le type précédent. Relancer l'analyse les effacera et réexécutera l'analyse avec les prompts et les définitions de champs clés du nouveau type. La transcription est conservée dans tous les cas.",
    justSave: "Enregistrer seulement",
    saveReanalyze: "Enregistrer et relancer l'analyse",
    cancel: "Annuler",
    typeUpdated: "Type d'appel mis à jour",
    analysisUpdated: "Analyse mise à jour",
    staleAnalysis: (t: string) =>
      `Cette analyse a été générée avec le type « ${t} » — relancez l'analyse pour l'actualiser.`,
    callScoreBreakdown: "Détail du score",
    na: "NA",
    callReview: "Bilan de l'appel",
    yourAverage: "Votre moyenne",
    teamAverage: "Moyenne de l'équipe",
    whatWentWell: "Ce qui s'est bien passé",
    whatCanImprove: "Ce qui peut être amélioré",
    noAnalysisTitle: "Pas encore d'analyse",
    noAnalysisDesc:
      "Analysez cet appel pour obtenir son score, un détail par catégorie et un bilan.",
    analyzeThisCall: "Analyser cet appel",
    expand: "Développer",
    collapse: "Réduire",
    notesAdded: "Notes ajoutées au CRM",
    addNotesToCrm: "Ajouter les notes au CRM",
    pause: "Pause",
    play: "Lecture",
    tabAnalysis: "Analyse",
    tabSummary: "Résumé",
    tabTranscript: "Transcription",
    tabParticipants: "Participants",
    tabKeyFields: "Champs clés",
    tabFollowUp: "Suivi",
    host: "Hôte",
    joined: "Présent",
    noKeyFields: "Aucun champ clé extrait pour cet appel.",
    noShow: "Absent",
    addToCrm: "Ajouter au CRM",
    inCrm: "Dans le CRM",
    nextStepFieldLabel: (n: number) => `Étape suivante ${n}`,
    selectNextStepAria: (step: string) => `Sélectionner pour le CRM : ${step}`,
    crmFirstName: "Prénom",
    crmLastName: "Nom",
    crmEmail: "E-mail",
    priorityLabel: (p: string) => `Priorité : ${p}`,
    priority: {
      high: "Haute",
      medium: "Moyenne",
      low: "Basse",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "Les informations ci-dessus vous ont-elles été utiles ?",
    overview: "Aperçu",
    overviewEmpty: "Cet appel n'a pas encore été résumé.",
    summary: "Résumé",
    followUpTitle: (name: string) => `Suivi avec ${name}`,
    valuePropGateTitle: "Confirmez votre proposition de valeur",
    valuePropGateIntro:
      "Confirmez votre proposition de valeur pour que Kai puisse adapter ce suivi.",
    valuePropGateDefault: (company: string) =>
      `${company} aide les équipes commerciales à trouver et engager les bons prospects plus rapidement grâce à la recherche, l'enrichissement et la prospection propulsés par l'IA — le tout au même endroit.`,
    valuePropGateConfirm: "Confirmer et continuer",
    followUpSubjectLabel: "Objet",
    followUpBodyLabel: "Message",
    followUpDefaultSubject: (company: string) => `Suivi — ${company}`,
    aiDraft: "Rédiger avec l'IA",
    sendFollowUp: "Envoyer l'e-mail",
    followUpSent: "E-mail de suivi envoyé",
    templateLabel: "Modèle",
    aiDraftOption: "Brouillon IA (à partir de cet appel)",
    searchTemplatesPlaceholder: "Rechercher des modèles...",
    noTemplatesFound: "Aucun modèle trouvé.",
    saveAsTemplate: "Enregistrer comme modèle",
    templateNamePlaceholder: "ex. Merci + prochaines étapes",
    saveTemplateBtn: "Enregistrer",
    updateTemplate: "Mettre à jour le modèle",
    deleteTemplate: "Supprimer le modèle",
    templateCreated: "Modèle de suivi créé",
    templateUpdated: "Modèle de suivi mis à jour",
    templateDeleted: "Modèle de suivi supprimé",
    followUpGreeting: (first: string) => `Bonjour ${first},`,
    followUpNextStepsLabel: "Prochaines étapes :",
    followUpRecapLabel: "Un rapide résumé de ce qui est ressorti :",
    followUpSignoff: "Cordialement,",
    followUpNoContext:
      "Cet appel n'a pas encore d'étapes suivantes ni de détails clés enregistrés — le brouillon ci-dessous est un résumé général. Ajoutez des précisions avant de l'envoyer.",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Appel téléphonique",
      zoom: "Zoom",
      gong: "Gong",
      whatsapp: "WhatsApp",
    } as Record<string, string>,
    originalVideo: "Vidéo originale",
    originalAudio: "Audio original",
    audioOnly: "Audio uniquement",
    openOnLinkedIn: "Voir la vidéo originale sur LinkedIn",
    linkedinNoEmbed:
      "Les appels LinkedIn ne peuvent pas être lus ici — ouvrez l'original sur LinkedIn.",
    skipBack: "Reculer de 10 secondes",
    skipForward: "Avancer de 10 secondes",
    playbackSpeed: (s: string) => `Vitesse de lecture ${s}`,
    seekAria: "Se déplacer dans l'enregistrement",
    summaryHintLabel: "Comment ce résumé est généré",
    summaryHint:
      "Ce résumé suit un prompt personnalisé configurable par utilisateur ou par entreprise. Pour l'instant, l'équipe Kombo le configure pour vous — demandez-nous d'ajuster le vôtre.",
    searchTranscript: "Rechercher dans la transcription…",
    noTranscriptMatch: "Aucune ligne ne correspond à votre recherche.",
    transcriptSpeakingTime: "Temps de parole",
    transcriptSeekAria: (speaker: string, time: string) =>
      `Aller à ${speaker} à ${time}`,
    transcript: "Transcription",
    participants: "Participants",
    noTranscript: "Aucune transcription disponible pour cet enregistrement.",
    noParticipants: "Aucun participant identifié pour cet enregistrement.",
    objections: "Objections",
    actionItems: "Prochaines étapes",
    markNotDone: "Marquer comme à faire",
    markDone: "Marquer comme fait",
    completed: (label: string) => `Terminé : ${label}`,
    tasksCreated: "Tâches créées",
    createTasks: "Créer les tâches",
    personalityRead: "Profil de personnalité",
    helpful: "Utile",
    notHelpful: "Pas utile",
    gladHelped: "Ravi que cela vous ait aidé",
    willImprove: "Merci — nous allons nous améliorer",
    min: "min",
    sentiment: {
      positive: "Positif",
      neutral: "Neutre",
      negative: "Négatif",
    },
  },
  de: {
    recordingNotFound: "Aufzeichnung nicht gefunden.",
    coach: "Alle Anrufe",
    callScore: "Call-Score",
    reanalyzing: "Aufzeichnung wird neu analysiert…",
    reanalyze: "Neu analysieren",
    callTypeAria: "Call-Typ",
    aiAssigned: "Von KI zugewiesen",
    aiAssignedHint: "Kai hat diesen Call automatisch anhand des Transkripts klassifiziert.",
    retypeTitle: "Aufzeichnung mit dem neuen Typ neu analysieren?",
    retypeDesc:
      "Zusammenfassung, Schlüsselfelder und Insights dieser Aufzeichnung wurden mit dem vorherigen Typ erstellt. Beim Neu-Analysieren werden sie gelöscht und die Analyse läuft mit den Prompts und Schlüsselfeld-Definitionen des neuen Typs erneut. Das Transkript bleibt in jedem Fall erhalten.",
    justSave: "Nur speichern",
    saveReanalyze: "Speichern und neu analysieren",
    cancel: "Abbrechen",
    typeUpdated: "Call-Typ aktualisiert",
    analysisUpdated: "Analyse aktualisiert",
    staleAnalysis: (t: string) =>
      `Diese Analyse wurde mit dem Typ „${t}“ erstellt — analysiere neu, um sie zu aktualisieren.`,
    callScoreBreakdown: "Score-Aufschlüsselung",
    na: "NA",
    callReview: "Call-Review",
    yourAverage: "Dein Durchschnitt",
    teamAverage: "Team-Durchschnitt",
    whatWentWell: "Was gut lief",
    whatCanImprove: "Was verbessert werden kann",
    noAnalysisTitle: "Noch keine Analyse",
    noAnalysisDesc:
      "Analysiere diesen Call, um Score, Aufschlüsselung und Review-Feedback zu sehen.",
    analyzeThisCall: "Call analysieren",
    expand: "Erweitern",
    collapse: "Einklappen",
    notesAdded: "Notizen zum CRM hinzugefügt",
    addNotesToCrm: "Notizen zum CRM hinzufügen",
    pause: "Pause",
    play: "Abspielen",
    tabAnalysis: "Analyse",
    tabSummary: "Zusammenfassung",
    tabTranscript: "Transkript",
    tabParticipants: "Teilnehmer",
    tabKeyFields: "Schlüsselfelder",
    tabFollowUp: "Follow-up",
    host: "Host",
    joined: "Beigetreten",
    noKeyFields: "Für diesen Call wurden keine Schlüsselfelder extrahiert.",
    noShow: "Nicht erschienen",
    addToCrm: "Zum CRM hinzufügen",
    inCrm: "Im CRM",
    nextStepFieldLabel: (n: number) => `Nächster Schritt ${n}`,
    selectNextStepAria: (step: string) => `Für CRM auswählen: ${step}`,
    crmFirstName: "Vorname",
    crmLastName: "Nachname",
    crmEmail: "E-Mail",
    priorityLabel: (p: string) => `Priorität: ${p}`,
    priority: {
      high: "Hoch",
      medium: "Mittel",
      low: "Niedrig",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "Waren die Informationen oben hilfreich?",
    overview: "Überblick",
    overviewEmpty: "Dieser Anruf wurde noch nicht zusammengefasst.",
    summary: "Zusammenfassung",
    followUpTitle: (name: string) => `Follow-up mit ${name}`,
    valuePropGateTitle: "Bestätige deine Value Proposition",
    valuePropGateIntro:
      "Bestätige deine Value Proposition, damit Kai dieses Follow-up darauf abstimmen kann.",
    valuePropGateDefault: (company: string) =>
      `${company} hilft Sales-Teams, die richtigen Prospects schneller zu finden und anzusprechen — mit KI-gestützter Suche, Anreicherung und Prospecting, alles an einem Ort.`,
    valuePropGateConfirm: "Bestätigen und fortfahren",
    followUpSubjectLabel: "Betreff",
    followUpBodyLabel: "Nachricht",
    followUpDefaultSubject: (company: string) => `Follow-up — ${company}`,
    aiDraft: "Mit KI entwerfen",
    sendFollowUp: "E-Mail senden",
    followUpSent: "Follow-up-E-Mail gesendet",
    templateLabel: "Vorlage",
    aiDraftOption: "KI-Entwurf (aus diesem Call)",
    searchTemplatesPlaceholder: "Vorlagen durchsuchen...",
    noTemplatesFound: "Keine Vorlagen gefunden.",
    saveAsTemplate: "Als Vorlage speichern",
    templateNamePlaceholder: "z. B. Danke + nächste Schritte",
    saveTemplateBtn: "Speichern",
    updateTemplate: "Vorlage aktualisieren",
    deleteTemplate: "Vorlage löschen",
    templateCreated: "Follow-up-Vorlage erstellt",
    templateUpdated: "Follow-up-Vorlage aktualisiert",
    templateDeleted: "Follow-up-Vorlage gelöscht",
    followUpGreeting: (first: string) => `Hallo ${first},`,
    followUpNextStepsLabel: "Nächste Schritte:",
    followUpRecapLabel: "Kurz zusammengefasst, was aufgefallen ist:",
    followUpSignoff: "Viele Grüße,",
    followUpNoContext:
      "Für diesen Call sind noch keine nächsten Schritte oder Schlüsseldetails erfasst — der Entwurf unten ist eine allgemeine Zusammenfassung. Ergänze Details, bevor du sendest.",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Telefonanruf",
      zoom: "Zoom",
      gong: "Gong",
      whatsapp: "WhatsApp",
    } as Record<string, string>,
    originalVideo: "Originalvideo",
    originalAudio: "Original-Audio",
    audioOnly: "Nur Audio",
    openOnLinkedIn: "Das Originalvideo auf LinkedIn ansehen",
    linkedinNoEmbed:
      "LinkedIn-Calls können hier nicht abgespielt werden — öffne das Original auf LinkedIn.",
    skipBack: "10 Sekunden zurück",
    skipForward: "10 Sekunden vor",
    playbackSpeed: (s: string) => `Wiedergabegeschwindigkeit ${s}`,
    seekAria: "In der Aufzeichnung springen",
    summaryHintLabel: "Wie diese Zusammenfassung entsteht",
    summaryHint:
      "Diese Zusammenfassung folgt einem individuellen Prompt, der pro Nutzer oder pro Unternehmen konfiguriert werden kann. Aktuell richtet ihn das Kombo-Team für dich ein — sprich uns an, um deinen anzupassen.",
    searchTranscript: "Dieses Transkript durchsuchen…",
    noTranscriptMatch: "Keine Zeilen entsprechen deiner Suche.",
    transcriptSpeakingTime: "Redezeit",
    transcriptSeekAria: (speaker: string, time: string) =>
      `Zu ${speaker} bei ${time} springen`,
    transcript: "Transkript",
    participants: "Teilnehmer",
    noTranscript: "Für diese Aufzeichnung ist kein Transkript verfügbar.",
    noParticipants: "Für diese Aufzeichnung wurden keine Teilnehmer identifiziert.",
    objections: "Einwände",
    actionItems: "Nächste Schritte",
    markNotDone: "Als offen markieren",
    markDone: "Als erledigt markieren",
    completed: (label: string) => `Erledigt: ${label}`,
    tasksCreated: "Aufgaben erstellt",
    createTasks: "Aufgaben erstellen",
    personalityRead: "Persönlichkeitsprofil",
    helpful: "Hilfreich",
    notHelpful: "Nicht hilfreich",
    gladHelped: "Schön, dass es geholfen hat",
    willImprove: "Danke — wir verbessern uns",
    min: "Min.",
    sentiment: {
      positive: "Positiv",
      neutral: "Neutral",
      negative: "Negativ",
    },
  },
  pt: {
    recordingNotFound: "Gravação não encontrada.",
    coach: "Todas as chamadas",
    callScore: "Pontuação",
    reanalyzing: "A reanalisar a gravação…",
    reanalyze: "Reanalisar",
    callTypeAria: "Tipo de chamada",
    aiAssigned: "Atribuído por IA",
    aiAssignedHint: "O Kai classificou esta chamada automaticamente a partir da transcrição.",
    retypeTitle: "Reanalisar a gravação com o novo tipo?",
    retypeDesc:
      "O resumo, os campos-chave e os insights desta gravação foram gerados com o tipo anterior. Ao reanalisar, serão apagados e a análise voltará a ser executada com os prompts e as definições de campos-chave do novo tipo. A transcrição é preservada em qualquer caso.",
    justSave: "Apenas guardar",
    saveReanalyze: "Guardar e reanalisar",
    cancel: "Cancelar",
    typeUpdated: "Tipo de chamada atualizado",
    analysisUpdated: "Análise atualizada",
    staleAnalysis: (t: string) =>
      `Esta análise foi gerada com o tipo «${t}» — reanalise para a atualizar.`,
    callScoreBreakdown: "Detalhe da pontuação",
    na: "NA",
    callReview: "Revisão da chamada",
    yourAverage: "A sua média",
    teamAverage: "Média da equipa",
    whatWentWell: "O que correu bem",
    whatCanImprove: "O que pode ser melhorado",
    noAnalysisTitle: "Ainda sem análise",
    noAnalysisDesc:
      "Analise esta chamada para ver a pontuação, um detalhe por categoria e feedback de revisão.",
    analyzeThisCall: "Analisar esta chamada",
    expand: "Expandir",
    collapse: "Reduzir",
    notesAdded: "Notas adicionadas ao CRM",
    addNotesToCrm: "Adicionar notas ao CRM",
    pause: "Pausar",
    play: "Reproduzir",
    tabAnalysis: "Análise",
    tabSummary: "Resumo",
    tabTranscript: "Transcrição",
    tabParticipants: "Participantes",
    tabKeyFields: "Campos-chave",
    tabFollowUp: "Seguimento",
    host: "Anfitrião",
    joined: "Entrou",
    noKeyFields: "Não foram extraídos campos-chave para esta chamada.",
    noShow: "Não compareceu",
    addToCrm: "Adicionar ao CRM",
    inCrm: "No CRM",
    nextStepFieldLabel: (n: number) => `Próximo passo ${n}`,
    selectNextStepAria: (step: string) => `Selecionar para o CRM: ${step}`,
    crmFirstName: "Nome",
    crmLastName: "Apelido",
    crmEmail: "Email",
    priorityLabel: (p: string) => `Prioridade: ${p}`,
    priority: {
      high: "Alta",
      medium: "Média",
      low: "Baixa",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "A informação acima foi útil?",
    overview: "Visão geral",
    overviewEmpty: "Esta chamada ainda não foi resumida.",
    summary: "Resumo",
    followUpTitle: (name: string) => `Seguimento com ${name}`,
    valuePropGateTitle: "Confirme a sua proposta de valor",
    valuePropGateIntro:
      "Confirme a sua proposta de valor para que o Kai possa adaptar este seguimento.",
    valuePropGateDefault: (company: string) =>
      `${company} ajuda as equipas de vendas a encontrar e envolver os prospects certos mais depressa com pesquisa, enriquecimento e prospeção com IA — tudo num só lugar.`,
    valuePropGateConfirm: "Confirmar e continuar",
    followUpSubjectLabel: "Assunto",
    followUpBodyLabel: "Mensagem",
    followUpDefaultSubject: (company: string) => `Seguimento — ${company}`,
    aiDraft: "Redigir com IA",
    sendFollowUp: "Enviar email",
    followUpSent: "Email de seguimento enviado",
    templateLabel: "Modelo",
    aiDraftOption: "Rascunho de IA (desta chamada)",
    searchTemplatesPlaceholder: "Pesquisar modelos...",
    noTemplatesFound: "Nenhum modelo encontrado.",
    saveAsTemplate: "Guardar como modelo",
    templateNamePlaceholder: "p. ex. Obrigado + próximos passos",
    saveTemplateBtn: "Guardar",
    updateTemplate: "Atualizar modelo",
    deleteTemplate: "Eliminar modelo",
    templateCreated: "Modelo de seguimento criado",
    templateUpdated: "Modelo de seguimento atualizado",
    templateDeleted: "Modelo de seguimento eliminado",
    followUpGreeting: (first: string) => `Olá ${first},`,
    followUpNextStepsLabel: "Próximos passos:",
    followUpRecapLabel: "Um resumo rápido do que se destacou:",
    followUpSignoff: "Cumprimentos,",
    followUpNoContext:
      "Esta chamada ainda não tem próximos passos nem detalhes-chave registados — o rascunho abaixo é um resumo genérico. Acrescente detalhes antes de enviar.",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Chamada telefónica",
      zoom: "Zoom",
      gong: "Gong",
      whatsapp: "WhatsApp",
    } as Record<string, string>,
    originalVideo: "Vídeo original",
    originalAudio: "Áudio original",
    audioOnly: "Apenas áudio",
    openOnLinkedIn: "Ver o vídeo original no LinkedIn",
    linkedinNoEmbed:
      "As chamadas do LinkedIn não podem ser reproduzidas aqui — abra o original no LinkedIn.",
    skipBack: "Recuar 10 segundos",
    skipForward: "Avançar 10 segundos",
    playbackSpeed: (s: string) => `Velocidade de reprodução ${s}`,
    seekAria: "Percorrer a gravação",
    summaryHintLabel: "Como este resumo é gerado",
    summaryHint:
      "Este resumo segue um prompt personalizado configurável por utilizador ou por empresa. Por agora, é a equipa Kombo que o configura — peça-nos para ajustar o seu.",
    searchTranscript: "Pesquisar nesta transcrição…",
    noTranscriptMatch: "Nenhuma linha corresponde à sua pesquisa.",
    transcriptSpeakingTime: "Tempo de conversa",
    transcriptSeekAria: (speaker: string, time: string) =>
      `Saltar para ${speaker} em ${time}`,
    transcript: "Transcrição",
    participants: "Participantes",
    noTranscript: "Não há transcrição disponível para esta gravação.",
    noParticipants: "Não foram identificados participantes para esta gravação.",
    objections: "Objeções",
    actionItems: "Próximos passos",
    markNotDone: "Marcar como pendente",
    markDone: "Marcar como concluído",
    completed: (label: string) => `Concluído: ${label}`,
    tasksCreated: "Tarefas criadas",
    createTasks: "Criar tarefas",
    personalityRead: "Perfil de personalidade",
    helpful: "Útil",
    notHelpful: "Não útil",
    gladHelped: "Ainda bem que ajudou",
    willImprove: "Obrigado — vamos melhorar",
    min: "min",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
  },
  pt_BR: {
    recordingNotFound: "Gravação não encontrada.",
    coach: "Todas as ligações",
    callScore: "Pontuação",
    reanalyzing: "Reanalisando a gravação…",
    reanalyze: "Reanalisar",
    callTypeAria: "Tipo de ligação",
    aiAssigned: "Atribuído por IA",
    aiAssignedHint: "O Kai classificou esta ligação automaticamente a partir da transcrição.",
    retypeTitle: "Reanalisar a gravação com o novo tipo?",
    retypeDesc:
      "O resumo, os campos-chave e os insights desta gravação foram gerados com o tipo anterior. Ao reanalisar, eles serão apagados e a análise será executada de novo com os prompts e as definições de campos-chave do novo tipo. A transcrição é preservada de qualquer forma.",
    justSave: "Apenas salvar",
    saveReanalyze: "Salvar e reanalisar",
    cancel: "Cancelar",
    typeUpdated: "Tipo de ligação atualizado",
    analysisUpdated: "Análise atualizada",
    staleAnalysis: (t: string) =>
      `Esta análise foi gerada com o tipo “${t}” — reanalise para atualizá-la.`,
    callScoreBreakdown: "Detalhamento da pontuação",
    na: "NA",
    callReview: "Revisão da ligação",
    yourAverage: "Sua média",
    teamAverage: "Média do time",
    whatWentWell: "O que foi bem",
    whatCanImprove: "O que pode melhorar",
    noAnalysisTitle: "Ainda sem análise",
    noAnalysisDesc:
      "Analise esta ligação para ver a pontuação, um detalhamento por categoria e feedback de revisão.",
    analyzeThisCall: "Analisar esta ligação",
    expand: "Expandir",
    collapse: "Recolher",
    notesAdded: "Notas adicionadas ao CRM",
    addNotesToCrm: "Adicionar notas ao CRM",
    pause: "Pausar",
    play: "Reproduzir",
    tabAnalysis: "Análise",
    tabSummary: "Resumo",
    tabTranscript: "Transcrição",
    tabParticipants: "Participantes",
    tabKeyFields: "Campos-chave",
    tabFollowUp: "Follow-up",
    host: "Anfitrião",
    joined: "Entrou",
    noKeyFields: "Nenhum campo-chave extraído para esta ligação.",
    noShow: "Não compareceu",
    addToCrm: "Adicionar ao CRM",
    inCrm: "No CRM",
    nextStepFieldLabel: (n: number) => `Próximo passo ${n}`,
    selectNextStepAria: (step: string) => `Selecionar para o CRM: ${step}`,
    crmFirstName: "Nome",
    crmLastName: "Sobrenome",
    crmEmail: "E-mail",
    priorityLabel: (p: string) => `Prioridade: ${p}`,
    priority: {
      high: "Alta",
      medium: "Média",
      low: "Baixa",
    } as Record<"high" | "medium" | "low", string>,
    wasFollowUpHelpful: "As informações acima foram úteis?",
    overview: "Visão geral",
    overviewEmpty: "Esta ligação ainda não foi resumida.",
    summary: "Resumo",
    followUpTitle: (name: string) => `Follow-up com ${name}`,
    valuePropGateTitle: "Confirme sua proposta de valor",
    valuePropGateIntro:
      "Confirme sua proposta de valor para que o Kai possa personalizar este follow-up.",
    valuePropGateDefault: (company: string) =>
      `${company} ajuda times de vendas a encontrar e engajar os prospects certos mais rápido com busca, enriquecimento e prospecção com IA — tudo em um só lugar.`,
    valuePropGateConfirm: "Confirmar e continuar",
    followUpSubjectLabel: "Assunto",
    followUpBodyLabel: "Mensagem",
    followUpDefaultSubject: (company: string) => `Follow-up — ${company}`,
    aiDraft: "Redigir com IA",
    sendFollowUp: "Enviar e-mail",
    followUpSent: "E-mail de follow-up enviado",
    templateLabel: "Modelo",
    aiDraftOption: "Rascunho de IA (desta ligação)",
    searchTemplatesPlaceholder: "Pesquisar modelos...",
    noTemplatesFound: "Nenhum modelo encontrado.",
    saveAsTemplate: "Salvar como modelo",
    templateNamePlaceholder: "ex.: Obrigado + próximos passos",
    saveTemplateBtn: "Salvar",
    updateTemplate: "Atualizar modelo",
    deleteTemplate: "Excluir modelo",
    templateCreated: "Modelo de follow-up criado",
    templateUpdated: "Modelo de follow-up atualizado",
    templateDeleted: "Modelo de follow-up excluído",
    followUpGreeting: (first: string) => `Oi ${first},`,
    followUpNextStepsLabel: "Próximos passos:",
    followUpRecapLabel: "Um resumo rápido do que chamou atenção:",
    followUpSignoff: "Atenciosamente,",
    followUpNoContext:
      "Esta ligação ainda não tem próximos passos nem detalhes-chave registrados — o rascunho abaixo é um resumo genérico. Adicione detalhes antes de enviar.",
    videoSourceLabel: {
      meet: "Google Meet",
      teams: "Microsoft Teams",
      linkedin: "LinkedIn",
      phone: "Ligação telefônica",
      zoom: "Zoom",
      gong: "Gong",
      whatsapp: "WhatsApp",
    } as Record<string, string>,
    originalVideo: "Vídeo original",
    originalAudio: "Áudio original",
    audioOnly: "Somente áudio",
    openOnLinkedIn: "Assistir ao vídeo original no LinkedIn",
    linkedinNoEmbed:
      "Ligações do LinkedIn não podem ser reproduzidas aqui — abra o original no LinkedIn.",
    skipBack: "Voltar 10 segundos",
    skipForward: "Avançar 10 segundos",
    playbackSpeed: (s: string) => `Velocidade de reprodução ${s}`,
    seekAria: "Navegar pela gravação",
    summaryHintLabel: "Como este resumo é gerado",
    summaryHint:
      "Este resumo segue um prompt personalizado configurável por usuário ou por empresa. Por enquanto, o time da Kombo configura para você — fale com a gente para ajustar o seu.",
    searchTranscript: "Buscar nesta transcrição…",
    noTranscriptMatch: "Nenhuma linha corresponde à sua busca.",
    transcriptSpeakingTime: "Tempo de fala",
    transcriptSeekAria: (speaker: string, time: string) =>
      `Pular para ${speaker} em ${time}`,
    transcript: "Transcrição",
    participants: "Participantes",
    noTranscript: "Nenhuma transcrição disponível para esta gravação.",
    noParticipants: "Nenhum participante identificado para esta gravação.",
    objections: "Objeções",
    actionItems: "Próximos passos",
    markNotDone: "Marcar como pendente",
    markDone: "Marcar como concluído",
    completed: (label: string) => `Concluído: ${label}`,
    tasksCreated: "Tarefas criadas",
    createTasks: "Criar tarefas",
    personalityRead: "Perfil de personalidade",
    helpful: "Útil",
    notHelpful: "Não útil",
    gladHelped: "Que bom que ajudou",
    willImprove: "Obrigado — vamos melhorar",
    min: "min",
    sentiment: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    },
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function scorePillClass(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-destructive/15 text-destructive"
}

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = Math.floor(totalSec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

// Which icon (and brand tint) represents each call source in the player
// stage's badge. Meet/Teams/WhatsApp/Gong mirror the exact icon+tint pairing
// already used for these platforms in ConnectionsPanel's "Call sources"
// section, so a source reads the same way everywhere it appears. Zoom has no
// brand mark anywhere in this app — it gets the same generic Video treatment
// as Meet/Teams (tinted with Zoom's brand blue) rather than inventing a fake
// logo. `linkedin` is included for type completeness even though that source
// never reaches this map (it renders its own "watch on LinkedIn" branch).
const VIDEO_SOURCE_ICON: Record<
  NonNullable<CoachRecording["videoSource"]>,
  { Icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  meet: { Icon: Video, className: "text-[#00832d]" },
  teams: { Icon: Video, className: "text-[#4b53bc]" },
  zoom: { Icon: Video, className: "text-[#2d8cff]" },
  gong: { Icon: Mic, className: "text-[#7444d6]" },
  whatsapp: { Icon: MessageCircle, className: "text-emerald-600" },
  phone: { Icon: Phone, className: "text-muted-foreground" },
  linkedin: { Icon: LinkedinIcon, className: "text-[#0a66c2]" },
}

const WAVEFORM_BAR_COUNT = 56

// Deterministic pseudo-random bar heights (0–1) for the audio-only stage's
// waveform visualization — seeded by the recording id so the pattern is
// stable across re-renders instead of reshuffling on every paint. Not real
// audio analysis (there's no media file in this prototype), just a plausible
// static waveform preview, same idea as a real player's scrub-bar thumbnail.
function waveformBars(seed: string, count: number): number[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    h = (h * 1664525 + 1013904223) >>> 0
    bars.push(0.2 + ((h >>> 8) % 1000) / 1000 * 0.8)
  }
  return bars
}

// --- Transcript tab helpers ---

function findSpeaker(
  speakers: CoachSpeaker[] | undefined,
  speakerId: string
): CoachSpeaker | undefined {
  return speakers?.find((s) => s.speakerId === speakerId)
}

function transcriptSpeakerLabel(
  speakers: CoachSpeaker[] | undefined,
  speakerId: string
): string {
  return findSpeaker(speakers, speakerId)?.name ?? speakerId
}

// speaker-0 is the caller by convention, but prefer the modeled role once one
// exists — a call could seat multiple reps or hand off between speakers.
function isRepSpeaker(
  speakers: CoachSpeaker[] | undefined,
  speakerId: string
): boolean {
  const role = findSpeaker(speakers, speakerId)?.role
  if (role) return role.toLowerCase() === "rep"
  return speakerId === "speaker-0"
}

interface SpeakingSegment {
  speakerId: string
  startSec: number
  endSec: number
}

// Utterances only carry a start time, so each turn's implied duration runs
// until the next turn starts (or the recording ends, for the last one).
function buildSpeakingSegments(
  utterances: CoachUtterance[],
  durationSec: number
): SpeakingSegment[] {
  const sorted = [...utterances].sort((a, b) => a.atSec - b.atSec)
  return sorted.map((u, i) => {
    const startSec = Math.max(0, u.atSec)
    const next = i + 1 < sorted.length ? sorted[i + 1].atSec : durationSec
    return { speakerId: u.speakerId, startSec, endSec: Math.max(startSec, next) }
  })
}

// A single-row timeline: one colored segment per turn, positioned by when it
// happened and sized by how long it ran, plus each speaker's total share.
function TranscriptSpeakingTime({
  utterances,
  speakers,
  durationSec,
  onSeekTo,
  c,
}: {
  utterances: CoachUtterance[]
  speakers: CoachSpeaker[] | undefined
  durationSec: number
  onSeekTo: (sec: number) => void
  c: Copy
}) {
  if (utterances.length === 0 || durationSec <= 0) return null

  const segments = buildSpeakingSegments(utterances, durationSec)
  const totalsBySpeaker = new Map<string, number>()
  segments.forEach((seg) => {
    totalsBySpeaker.set(
      seg.speakerId,
      (totalsBySpeaker.get(seg.speakerId) ?? 0) + (seg.endSec - seg.startSec)
    )
  })
  const totalSpoken = [...totalsBySpeaker.values()].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium">
        {c.transcriptSpeakingTime}
      </p>
      <div className="bg-muted relative h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((seg, i) => {
          const isRep = isRepSpeaker(speakers, seg.speakerId)
          const label = transcriptSpeakerLabel(speakers, seg.speakerId)
          const left = (seg.startSec / durationSec) * 100
          const width = Math.max(
            0.6,
            ((seg.endSec - seg.startSec) / durationSec) * 100
          )
          return (
            <button
              key={`${seg.speakerId}-${seg.startSec}-${i}`}
              type="button"
              onClick={() => onSeekTo(seg.startSec)}
              aria-label={c.transcriptSeekAria(label, formatClock(seg.startSec))}
              title={`${label} · ${formatClock(seg.startSec)}`}
              className={cn(
                "absolute top-0 bottom-0 transition-opacity hover:opacity-80",
                isRep ? "bg-muted-foreground/70" : "bg-primary"
              )}
              style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {[...totalsBySpeaker.entries()].map(([speakerId, spokenSec]) => {
          const isRep = isRepSpeaker(speakers, speakerId)
          const label = transcriptSpeakerLabel(speakers, speakerId)
          const pct =
            totalSpoken > 0 ? Math.round((spokenSec / totalSpoken) * 100) : 0
          return (
            <span key={speakerId} className="flex items-center gap-1.5 text-xs">
              <span
                aria-hidden
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  isRep ? "bg-muted-foreground/70" : "bg-primary"
                )}
              />
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatClock(spokenSec)} · {pct}%
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// Fill a follow-up template's {{variables}} from the recording.
function mergeFollowUpVars(text: string, rec: CoachRecording): string {
  const data: Record<string, string> = {
    first_name: rec.prospectName.split(" ")[0],
    company: rec.company,
    next_steps: rec.nextSteps.map((s) => `• ${s}`).join("\n"),
    sender: currentUser.name,
  }
  return text.replace(/\{\{(\w+)\}\}/g, (whole, tag: string) => data[tag] ?? whole)
}

// Splits a participant's full name into first/last for the "Add to CRM"
// wizard's field-mapping preview — participants only carry a single `name`,
// not separate first/last fields like a full Prospect record.
function splitParticipantName(name: string): {
  firstName: string
  lastName: string
} {
  const [firstName, ...rest] = name.trim().split(/\s+/)
  return { firstName: firstName ?? "", lastName: rest.join(" ") }
}

const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2] as const

// A call-aware first draft that seeds the follow-up composer — opens with the
// line the recording's call type prescribes (a demo thanks differently than a
// negotiation), optionally bridges into the specific problem the Key Fields
// tab captured for this call, then the shared next-steps block. `problem` is
// the raw (English) Key Fields "problem" text — same non-localized-content
// convention as `nextSteps` below: the call's own substance isn't translated,
// only the surrounding template copy is.
function buildFollowUpDraft(
  rec: CoachRecording,
  locale: Locale,
  callType: CallType,
  problem?: string
): string {
  const t = COPY[locale]
  const first = rec.prospectName.split(" ")[0]
  const steps = rec.nextSteps
  const senderFirst = currentUser.name.split(" ")[0]
  const opener = CALL_TYPE_META[callType].followUpOpener[locale].replace(
    /\{\{company\}\}/g,
    rec.company
  )
  const recap = problem ? `\n\n${t.followUpRecapLabel} ${problem}` : ""
  const nextStepsBlock = steps.length
    ? `\n\n${t.followUpNextStepsLabel}\n${steps.map((x) => `• ${x}`).join("\n")}`
    : ""
  return `${t.followUpGreeting(first)}\n\n${opener}${recap}${nextStepsBlock}\n\n${t.followUpSignoff}\n${senderFirst}`
}

export default function CoachRecordingDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const rec = coachRecordings.find((r) => r.id === id)
  const analysis = id ? recordingDetails[id] : undefined

  const [tab, setTab] = React.useState("analysis")
  const tabTransitioning = useSkeletonTransition(tab)
  // The saved call type vs the type the visible analysis was generated with —
  // "Just save" updates only the label, so the two can drift until the user
  // re-analyzes (the stale-analysis banner nudges them to).
  const [callType, setCallType] = React.useState<CallType>(
    analysis?.callType ?? "Discovery"
  )
  const [analyzedType, setAnalyzedType] = React.useState<CallType>(
    analysis?.callType ?? "Discovery"
  )
  // True until the user overrides the type Kai picked from the transcript.
  const [aiAssigned, setAiAssigned] = React.useState(true)
  // Non-null = the change-type confirm dialog is open for this target type.
  const [pendingType, setPendingType] = React.useState<CallType | null>(null)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [transcriptQuery, setTranscriptQuery] = React.useState("")
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [positionSec, setPositionSec] = React.useState(0)
  const [speed, setSpeed] = React.useState<number>(1)
  const durationSec = (rec?.durationMin ?? 0) * 60
  // "Ended" is derived, not a state flip — the interval below simply stops
  // once the playhead reaches the end, and play from the end restarts.
  const atEnd = durationSec > 0 && positionSec >= durationSec
  const playing = isPlaying && !atEnd

  // Mock playback: advance the playhead while playing, scaled by speed.
  React.useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      setPositionSec((p) => Math.min(durationSec, p + speed))
    }, 1000)
    return () => window.clearInterval(t)
  }, [playing, speed, durationSec])

  function togglePlay() {
    if (atEnd) {
      setPositionSec(0)
      setIsPlaying(true)
      return
    }
    setIsPlaying((p) => !p)
  }
  const [doneItems, setDoneItems] = React.useState<Record<number, boolean>>({})
  const [followUpHelpful, setFollowUpHelpful] = React.useState<boolean | null>(null)
  // Lives on the page, not inside FollowUpTab — that component unmounts
  // whenever this TabsContent isn't the active tab (see its own comment),
  // so state kept there wouldn't survive switching away and back.
  const [valuePropConfirmed, setValuePropConfirmed] = React.useState(false)
  const [crmOpen, setCrmOpen] = React.useState(false)
  const [crmParticipant, setCrmParticipant] = React.useState<CoachParticipant | null>(
    null
  )
  // Summary tab's own "Add to CRM" entry points — separate from the
  // Participants tab's crmOpen/crmParticipant above, but wired to the same
  // shared AddToCrmDialog component (two more mounts of it below).
  const [overviewCrmOpen, setOverviewCrmOpen] = React.useState(false)
  const [selectedForCrm, setSelectedForCrm] = React.useState<Record<number, boolean>>(
    {}
  )
  const [nextStepsInCrm, setNextStepsInCrm] = React.useState<Record<number, boolean>>(
    {}
  )
  const [nextStepsCrmOpen, setNextStepsCrmOpen] = React.useState(false)
  const [nextStepsCrmIndices, setNextStepsCrmIndices] = React.useState<number[]>([])

  if (!rec) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.recordingNotFound}</p>
        <BackLink to="/coach" label={c.coach} variant="link" />
      </Page>
    )
  }

  const sentiment = SENTIMENT[rec.sentiment]
  const SentimentIcon = sentiment.icon
  const scorecard = getScorecard(rec.id)
  // The rep who took this call, for the Call Score hero's "your average"
  // comparison — this page treats the rep on the call as "you" throughout
  // (see the Participants tab), regardless of which teammate it actually was.
  const repAvgScore = coachTeam.find((r) => r.repId === rec.salesRepId)?.avgScore

  // The player stage: undefined mediaKind reads as "video" for back-compat
  // with any recording that predates this field.
  const isAudioOnly = rec.mediaKind === "audio"
  const sourceKey = rec.videoSource ?? "meet"
  const { Icon: SourceIcon, className: sourceIconClass } =
    VIDEO_SOURCE_ICON[sourceKey]
  const waveform = waveformBars(rec.id, WAVEFORM_BAR_COUNT)

  const transcriptTurns = [...(rec.transcript ?? [])].sort(
    (a, b) => a.atSec - b.atSec
  )
  const tq = transcriptQuery.trim().toLowerCase()
  const filteredTranscript = tq
    ? transcriptTurns.filter(
        (t) =>
          t.text.toLowerCase().includes(tq) ||
          transcriptSpeakerLabel(rec.speakers, t.speakerId)
            .toLowerCase()
            .includes(tq)
      )
    : transcriptTurns

  // Mock re-analysis: brief "working" state, then the analysis adopts the
  // target type (focus areas, summary lens, follow-up draft all re-derive).
  function runReanalysis(target: CallType) {
    setAnalyzing(true)
    window.setTimeout(() => {
      setAnalyzedType(target)
      setAnalyzing(false)
      toast.success(c.analysisUpdated)
    }, 1200)
  }

  function confirmJustSave() {
    if (!pendingType) return
    setCallType(pendingType)
    setAiAssigned(false)
    setPendingType(null)
    toast.success(c.typeUpdated)
  }

  function confirmSaveAndReanalyze() {
    if (!pendingType) return
    const target = pendingType
    setCallType(target)
    setAiAssigned(false)
    setPendingType(null)
    runReanalysis(target)
  }

  const toggleDone = (index: number, label: string) => {
    setDoneItems((prev) => {
      const next = { ...prev, [index]: !prev[index] }
      if (next[index]) toast.success(c.completed(label))
      return next
    })
  }

  // Opens the shared "Add to CRM" wizard for a single (non-host) participant,
  // seeded with whatever contact info the call captured — just name/email,
  // since participants here aren't full Prospect records.
  function openCrmDialog(participant: CoachParticipant) {
    setCrmParticipant(participant)
    setCrmOpen(true)
  }

  const { firstName: crmFirstName, lastName: crmLastName } = crmParticipant
    ? splitParticipantName(crmParticipant.name)
    : { firstName: "", lastName: "" }
  const crmParticipantFields = crmParticipant
    ? [
        { label: c.crmFirstName, value: crmFirstName },
        { label: c.crmLastName, value: crmLastName },
        { label: c.crmEmail, value: crmParticipant.email ?? "—" },
      ]
    : []

  // Opens the shared "Add to CRM" wizard for the AI-generated overview,
  // pushed as a single note against the prospect on the call. AddToCrmDialog
  // only reports open/closed (no separate "wizard actually finished" signal),
  // so — like the page-header "Add notes to CRM" button above, which fires
  // the same toast on click with no dialog at all — this treats opening the
  // picker as the commit point rather than waiting on an event the shared
  // dialog doesn't expose.
  function openOverviewCrmDialog() {
    setOverviewCrmOpen(true)
    toast.success(c.notesAdded)
  }
  const overviewCrmFields = [{ label: c.overview, value: rec.overview ?? "" }]

  function toggleSelectedForCrm(index: number) {
    setSelectedForCrm((prev) => ({ ...prev, [index]: !prev[index] }))
  }
  const selectedNextStepIndices = rec.nextSteps
    .map((_, i) => i)
    .filter((i) => selectedForCrm[i] && !nextStepsInCrm[i])

  // Opens the shared "Add to CRM" wizard for the checked next steps, pushed
  // as CRM notes against the prospect on the call. Same optimistic reasoning
  // as openOverviewCrmDialog above: marks the pushed rows "In CRM" and clears
  // their selection as soon as the picker opens, rather than the dialog
  // reporting back a completion event it doesn't have.
  function openNextStepsCrmDialog() {
    if (selectedNextStepIndices.length === 0) return
    const indices = selectedNextStepIndices
    setNextStepsCrmIndices(indices)
    setNextStepsCrmOpen(true)
    setNextStepsInCrm((prev) => {
      const next = { ...prev }
      indices.forEach((i) => {
        next[i] = true
      })
      return next
    })
    setSelectedForCrm((prev) => {
      const next = { ...prev }
      indices.forEach((i) => {
        delete next[i]
      })
      return next
    })
    toast.success(c.notesAdded)
  }
  // Snapshotted from nextStepsCrmIndices at click time (not recomputed from
  // selectedNextStepIndices, which clears immediately above) so the dialog's
  // field list stays stable for as long as it's open.
  const nextStepsCrmFields = nextStepsCrmIndices.map((i, idx) => ({
    label: c.nextStepFieldLabel(idx + 1),
    value: rec.nextSteps[i],
  }))

  const participantsCard =
    rec.participants && rec.participants.length > 0 ? (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="text-muted-foreground size-4" />
            {c.participants}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rec.participants.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                {p.email && (
                  <p className="text-muted-foreground truncate text-xs">
                    {p.email}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {p.isOwner && (
                  <Badge variant="outline" className="font-normal">
                    {c.host}
                  </Badge>
                )}
                {p.attended === true && (
                  <Badge variant="outline" className="font-normal">
                    {c.joined}
                  </Badge>
                )}
                {p.attended === false && (
                  <Badge
                    variant="outline"
                    className="border-chart-4/40 font-normal text-chart-4"
                  >
                    {c.noShow}
                  </Badge>
                )}
                {!p.isOwner &&
                  (p.inCrm ? (
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Building2 className="size-3.5" />
                      {c.inCrm}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCrmDialog(p)}
                    >
                      <Building2 className="size-4" />
                      {c.addToCrm}
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    ) : (
      <Card className="text-muted-foreground p-8 text-center text-sm">
        {c.noParticipants}
      </Card>
    )

  // Sourced from `rec.nextSteps` (a stable property of the recording) rather
  // than `analysis.actionItems` (which regenerates per re-analysis) — Next
  // Steps shouldn't disappear or reshuffle just because the call type changed.
  const nextStepsCard = rec.nextSteps.length > 0 && (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{c.actionItems}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedNextStepIndices.length === 0}
          onClick={openNextStepsCrmDialog}
        >
          <Building2 className="size-4" />
          {c.addToCrm}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {rec.nextSteps.map((item, i) => {
          const done = doneItems[i] ?? false
          const inCrm = nextStepsInCrm[i] ?? false
          const priority = ACTION_ITEM_PRIORITIES[i % ACTION_ITEM_PRIORITIES.length]
          return (
            <div
              key={item}
              className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
            >
              {inCrm ? (
                <span
                  aria-hidden
                  className="flex size-6 shrink-0 items-center justify-center"
                >
                  <Building2 className="text-muted-foreground size-4" />
                </span>
              ) : (
                <Checkbox
                  checked={selectedForCrm[i] ?? false}
                  onCheckedChange={() => toggleSelectedForCrm(i)}
                  aria-label={c.selectNextStepAria(item)}
                  className="shrink-0"
                />
              )}
              <Button
                size="icon"
                variant="ghost"
                className="size-6 shrink-0"
                onClick={() => toggleDone(i, item)}
                aria-label={done ? c.markNotDone : c.markDone}
              >
                {done ? (
                  <CheckCircle2 className="text-primary size-4" />
                ) : (
                  <Circle className="text-muted-foreground size-4" />
                )}
              </Button>
              <span
                className={cn(
                  "flex-1",
                  done && "text-muted-foreground line-through"
                )}
              >
                {item}
              </span>
              <Badge variant="outline" className="shrink-0 font-normal">
                {c.priorityLabel(c.priority[priority])}
              </Badge>
              {inCrm && (
                <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                  {c.inCrm}
                </span>
              )}
            </div>
          )
        })}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => toast.success(c.tasksCreated)}
        >
          <ListChecks className="size-4" />
          {c.createTasks}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Page>
      <BackLink to="/coach" label={c.coach} />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{rec.title}</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
                  scorePillClass(rec.score)
                )}
                title={c.callScore}
              >
                <span className="bg-current size-1.5 rounded-full opacity-80" />
                {rec.score}/100
              </span>
              <Badge variant={sentiment.variant}>
                <SentimentIcon className="size-3" />
                {c.sentiment[rec.sentiment]}
              </Badge>
              <Select
                value={callType}
                onValueChange={(v) => {
                  if (v !== callType) setPendingType(v as CallType)
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[160px]"
                  aria-label={c.callTypeAria}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CALL_TYPE_META[t].label[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {aiAssigned && (
                <span
                  className="text-primary inline-flex items-center"
                  title={c.aiAssignedHint}
                  aria-label={c.aiAssigned}
                >
                  <Sparkles className="size-4" />
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {rec.prospectName} · {rec.company} · {formatDate(rec.date)} ·{" "}
              {rec.durationMin} min
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => runReanalysis(callType)}
              disabled={analyzing}
            >
              {analyzing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {c.reanalyze}
            </Button>
            <Button variant="volt" onClick={() => toast.success(c.notesAdded)}>
              <Building2 className="size-4" />
              {c.addNotesToCrm}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* The label can drift from the analysis when the user picks "Just
          save" in the change-type dialog — surface that until re-analysis. */}
      {callType !== analyzedType && !analyzing && (
        <Card className="border-chart-4/40 bg-chart-4/5 mb-6">
          <CardContent className="flex flex-wrap items-center gap-3">
            <AlertTriangle className="text-chart-4 size-4 shrink-0" />
            <p className="min-w-0 flex-1 text-sm">
              {c.staleAnalysis(CALL_TYPE_META[analyzedType].label[locale])}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runReanalysis(callType)}
            >
              <RefreshCw className="size-4" />
              {c.reanalyze}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Full original video (1.6.0). LinkedIn can't embed its recordings, so
          those calls link out to the original instead of playing inline. */}
      {rec.videoSource === "linkedin" ? (
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="bg-[#0a66c2]/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
              <LinkedinIcon className="size-5 text-[#0a66c2]" />
            </span>
            <p className="text-muted-foreground min-w-0 flex-1 text-sm">
              {c.linkedinNoEmbed}
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://www.linkedin.com/messaging/"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-4" />
                {c.openOnLinkedIn}
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 gap-0 overflow-hidden p-0">
          <div
            className={cn(
              "relative flex aspect-video max-h-80 w-full items-center justify-center",
              isAudioOnly ? "bg-muted" : "bg-zinc-900"
            )}
          >
            {isAudioOnly ? (
              <div className="flex w-full flex-col items-center gap-3 px-6">
                <div className="flex h-16 w-full max-w-md items-end justify-center gap-[3px]">
                  {waveform.map((barHeight, i) => {
                    const played =
                      durationSec > 0 &&
                      (i / waveform.length) * durationSec <= positionSec
                    return (
                      <span
                        key={i}
                        className={cn(
                          "w-1 shrink-0 rounded-full transition-colors",
                          played ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                        style={{ height: `${Math.round(barHeight * 100)}%` }}
                      />
                    )
                  })}
                </div>
                <p className="text-foreground text-sm font-medium">
                  {rec.prospectName}
                </p>
                <p className="text-muted-foreground text-xs">{rec.company}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="bg-primary/25 text-primary-foreground flex size-20 items-center justify-center rounded-full text-2xl font-semibold">
                  {rec.prospectName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <p className="text-sm font-medium text-white">
                  {rec.prospectName}
                </p>
                <p className="text-xs text-white/60">{rec.company}</p>
              </div>
            )}
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 flex items-center gap-1.5 font-normal"
            >
              <SourceIcon className={cn("size-3.5", sourceIconClass)} />
              {isAudioOnly ? c.originalAudio : c.originalVideo} ·{" "}
              {c.videoSourceLabel[sourceKey]}
            </Badge>
            {isAudioOnly && (
              <Badge
                variant="outline"
                className="bg-background/80 absolute top-3 right-3 flex items-center gap-1.5 font-normal"
              >
                <Mic className="size-3.5" />
                {c.audioOnly}
              </Badge>
            )}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? c.pause : c.play}
              className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20"
            >
              {!playing && (
                <span className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full shadow-lg">
                  <Play className="ml-0.5 size-6" />
                </span>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t p-3">
            <Button
              size="icon"
              variant="outline"
              className="size-9 shrink-0 rounded-full"
              onClick={togglePlay}
              aria-label={playing ? c.pause : c.play}
            >
              {playing ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() => setPositionSec((p) => Math.max(0, p - 10))}
              aria-label={c.skipBack}
            >
              <SkipBack className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() =>
                setPositionSec((p) => Math.min(durationSec, p + 10))
              }
              aria-label={c.skipForward}
            >
              <SkipForward className="size-4" />
            </Button>
            <div
              className="bg-muted h-1.5 min-w-24 flex-1 cursor-pointer overflow-hidden rounded-full"
              role="progressbar"
              aria-label={c.seekAria}
              aria-valuemin={0}
              aria-valuemax={durationSec}
              aria-valuenow={Math.round(positionSec)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = (e.clientX - rect.left) / rect.width
                setPositionSec(
                  Math.max(0, Math.min(durationSec, Math.round(ratio * durationSec)))
                )
              }}
            >
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{
                  width: `${durationSec ? (positionSec / durationSec) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {formatClock(positionSec)} / {formatClock(durationSec)}
            </span>
            <div className="flex shrink-0 gap-1">
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-label={c.playbackSpeed(`${s}x`)}
                  aria-pressed={speed === s}
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums transition-colors",
                    speed === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="analysis">{c.tabAnalysis}</TabsTrigger>
          <TabsTrigger value="summary">{c.tabSummary}</TabsTrigger>
          <TabsTrigger value="transcript">{c.tabTranscript}</TabsTrigger>
          <TabsTrigger value="participants">{c.tabParticipants}</TabsTrigger>
          <TabsTrigger value="keyFields">{c.tabKeyFields}</TabsTrigger>
          <TabsTrigger value="followUp">{c.tabFollowUp}</TabsTrigger>
        </TabsList>

        {tabTransitioning ? (
          <TabSkeleton />
        ) : (
        <>
        <TabsContent value="analysis">
          {rec.analyzed && rec.scoreBreakdown && rec.scoreBreakdown.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{c.callScore}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <ScoreStat label={c.callScore} score={rec.score} />
                      {repAvgScore !== undefined && (
                        <ScoreStat label={c.yourAverage} score={repAvgScore} />
                      )}
                      <ScoreStat
                        label={c.teamAverage}
                        score={coachTeamAvg.score}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {c.callScoreBreakdown}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rec.scoreBreakdown.map((metric) => (
                      <ScoreBreakdownRow key={metric.label} metric={metric} c={c} />
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {rec.review && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{c.callReview}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ReviewCallout
                        icon={ThumbsUp}
                        label={c.whatWentWell}
                        text={rec.review.positiveFeedback}
                        tone="good"
                      />
                      <ReviewCallout
                        icon={ThumbsDown}
                        label={c.whatCanImprove}
                        text={rec.review.thingsToImprove}
                        tone="improve"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="size-8" />}
              title={c.noAnalysisTitle}
              description={c.noAnalysisDesc}
            >
              <Button
                variant="volt"
                onClick={() => runReanalysis(callType)}
                disabled={analyzing}
              >
                {analyzing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {c.analyzeThisCall}
              </Button>
            </EmptyState>
          )}
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-base">{c.overview}</CardTitle>
                  {rec.overview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openOverviewCrmDialog}
                    >
                      <Building2 className="size-4" />
                      {c.addToCrm}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {rec.overview ? (
                    <p className="text-sm">{rec.overview}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {c.overviewEmpty}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    {c.summary}
                    <InfoHint label={c.summaryHintLabel}>{c.summaryHint}</InfoHint>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-xs">
                    {CALL_TYPE_META[analyzedType].summaryLens[locale]}
                  </p>
                  <p className="text-sm">{scorecard.headline}</p>
                  {rec.highlights.length > 0 && (
                    <ul className="space-y-1.5">
                      {rec.highlights.map((h) => (
                        <li
                          key={h}
                          className="text-muted-foreground flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="text-chart-1 mt-0.5 size-4 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">{nextStepsCard}</div>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">{c.transcript}</CardTitle>
              <div className="relative w-52 max-w-[55%]">
                <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
                <Input
                  value={transcriptQuery}
                  onChange={(e) => setTranscriptQuery(e.target.value)}
                  placeholder={c.searchTranscript}
                  className="h-8 pl-7 text-sm"
                  aria-label={c.searchTranscript}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {transcriptTurns.length > 0 && (
                <TranscriptSpeakingTime
                  utterances={transcriptTurns}
                  speakers={rec.speakers}
                  durationSec={durationSec}
                  onSeekTo={setPositionSec}
                  c={c}
                />
              )}
              {transcriptTurns.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {c.noTranscript}
                </p>
              ) : filteredTranscript.length === 0 ? (
                <EmptyState variant="plain" description={c.noTranscriptMatch} />
              ) : (
                <div className="space-y-3">
                  {filteredTranscript.map((turn, i) => {
                    const isRep = isRepSpeaker(rec.speakers, turn.speakerId)
                    const label = transcriptSpeakerLabel(
                      rec.speakers,
                      turn.speakerId
                    )
                    const time = formatClock(turn.atSec)
                    return (
                      <div
                        key={`${turn.speakerId}-${turn.atSec}-${i}`}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm",
                          isRep ? "bg-muted" : "border-primary border-l-2 pl-3"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span
                            className={cn(
                              "font-medium",
                              isRep ? "text-foreground" : "text-primary"
                            )}
                          >
                            {label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPositionSec(turn.atSec)}
                            aria-label={c.transcriptSeekAria(label, time)}
                            className="text-muted-foreground hover:text-primary tabular-nums hover:underline"
                          >
                            {time}
                          </button>
                        </div>
                        <p>{turn.text}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">{participantsCard}</div>
            <div className="space-y-6">
              {analysis?.personality && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="text-muted-foreground size-4" />
                      {c.personalityRead}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge variant="secondary">{analysis.personality.disc}</Badge>
                    <p className="text-muted-foreground text-sm">
                      {analysis.personality.summary}
                    </p>
                  </CardContent>
                </Card>
              )}
              {analysis && analysis.objections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{c.objections}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {analysis.objections.map((objection) => (
                      <Badge key={objection} variant="outline" className="font-normal">
                        {objection}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="keyFields">
          {rec.keyFields && rec.keyFields.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {rec.keyFields.map((field) => (
                <Card key={field.label}>
                  <CardHeader>
                    <CardTitle className="text-base">{field.label}</CardTitle>
                    {field.description && (
                      <p className="text-muted-foreground text-xs">
                        {field.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{field.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-muted-foreground p-8 text-center text-sm">
              {c.noKeyFields}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="followUp">
          {/* Keyed on the analyzed type so a re-analysis rebuilds the draft
              even if this tab happens to be mounted at the time. */}
          <FollowUpTab
            key={analyzedType}
            rec={rec}
            c={c}
            locale={locale}
            callType={analyzedType}
            problem={analysis?.keyFields?.problem}
            helpful={followUpHelpful}
            setHelpful={setFollowUpHelpful}
            valuePropConfirmed={valuePropConfirmed}
            setValuePropConfirmed={setValuePropConfirmed}
          />
        </TabsContent>
        </>
        )}
      </Tabs>

      <Dialog
        open={pendingType !== null}
        onOpenChange={(v) => {
          if (!v) setPendingType(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{c.retypeTitle}</DialogTitle>
            <DialogDescription>{c.retypeDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingType(null)}>
              {c.cancel}
            </Button>
            <Button variant="outline" onClick={confirmJustSave}>
              {c.justSave}
            </Button>
            <Button variant="volt" onClick={confirmSaveAndReanalyze}>
              <RefreshCw className="size-4" />
              {c.saveReanalyze}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddToCrmDialog
        open={crmOpen}
        onOpenChange={setCrmOpen}
        kind="prospect"
        recordId={
          crmParticipant
            ? `${rec.id}-${crmParticipant.email ?? crmParticipant.name}`
            : ""
        }
        recordName={crmParticipant?.name ?? ""}
        accountName={rec.company}
        fields={crmParticipantFields}
      />

      <AddToCrmDialog
        open={overviewCrmOpen}
        onOpenChange={setOverviewCrmOpen}
        kind="prospect"
        recordId={`${rec.id}-overview`}
        recordName={rec.prospectName}
        accountName={rec.company}
        fields={overviewCrmFields}
      />

      <AddToCrmDialog
        open={nextStepsCrmOpen}
        onOpenChange={setNextStepsCrmOpen}
        kind="prospect"
        recordId={`${rec.id}-next-steps`}
        recordName={rec.prospectName}
        accountName={rec.company}
        fields={nextStepsCrmFields}
      />
    </Page>
  )
}

// A single score in the Call Score hero — the call's own score, or one of
// the comparison averages — using the same pill styling as the score badge
// in the page header.
function ScoreStat({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border py-3 text-center">
      <span
        className={cn(
          "rounded-full px-3 py-1 text-lg font-semibold tabular-nums",
          scorePillClass(score)
        )}
      >
        {score}
      </span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

// One row of the Call Score Breakdown — a scored metric category with an
// optional summary and, when present, expandable sub-metrics.
function ScoreBreakdownRow({
  metric,
  c,
}: {
  metric: CoachScoreMetric
  c: Copy
}) {
  const [open, setOpen] = React.useState(false)
  const subMetrics = metric.subMetrics ?? []

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{metric.label}</p>
          {metric.metricSummary && (
            <p className="text-muted-foreground mt-1 text-xs">
              {metric.metricSummary}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {metric.isNa ? (
            <Badge
              variant="outline"
              className="text-muted-foreground border-muted-foreground/30"
            >
              {c.na}
            </Badge>
          ) : (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                scorePillClass(metric.metricScore)
              )}
            >
              {metric.metricScore}
            </span>
          )}
          {subMetrics.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? c.collapse : c.expand}
            >
              <ChevronDown
                className={cn("size-4 transition-transform", open && "rotate-180")}
              />
            </Button>
          )}
        </div>
      </div>
      {subMetrics.length > 0 && open && (
        <div className="mt-3 space-y-1.5 border-t pt-3">
          {subMetrics.map((sub) => (
            <div
              key={sub.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{sub.label}</span>
              {sub.isNa ? (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-muted-foreground/30"
                >
                  {c.na}
                </Badge>
              ) : (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-medium tabular-nums",
                    scorePillClass(sub.score)
                  )}
                >
                  {sub.score}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// A "What went well" / "What can be improved" callout in Call Review.
function ReviewCallout({
  icon: Icon,
  label,
  text,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  text: string
  tone: "good" | "improve"
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "good"
          ? "border-chart-1/30 bg-chart-1/5"
          : "border-chart-4/30 bg-chart-4/5"
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        <Icon
          className={cn("size-4", tone === "good" ? "text-chart-1" : "text-chart-4")}
        />
        {label}
      </div>
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  )
}

function FollowUpTab({
  rec,
  c,
  locale,
  callType,
  problem,
  helpful,
  setHelpful,
  valuePropConfirmed,
  setValuePropConfirmed,
}: {
  rec: CoachRecording
  c: Copy
  locale: Locale
  callType: CallType
  // The Key Fields tab's "problem" extraction for this call, if analyzed —
  // the closest thing to a call-content overview available for the draft.
  problem?: string
  helpful: boolean | null
  setHelpful: (v: boolean | null) => void
  valuePropConfirmed: boolean
  setValuePropConfirmed: (v: boolean) => void
}) {
  const [valueProp, setValueProp] = React.useState(() =>
    c.valuePropGateDefault(currentUser.company)
  )
  const templates = useFollowUpTemplates()
  // Nothing concrete to personalize the draft with yet — next steps carry
  // the "what to do", `problem` carries the "why it matters"; without either
  // the draft would be nothing but the fixed call-type opener.
  const hasContext = rec.nextSteps.length > 0 || Boolean(problem)
  // Radix unmounts inactive TabsContent, so this mounts fresh each time the
  // Follow-Up tab is selected — a plain initializer is enough, no dialog-style
  // open/close reset needed.
  const [subject, setSubject] = React.useState(() =>
    c.followUpDefaultSubject(rec.company)
  )
  const [body, setBody] = React.useState(() =>
    plainToHtml(buildFollowUpDraft(rec, locale, callType, problem))
  )
  const [generating, setGenerating] = React.useState(false)
  // "" = the AI draft; otherwise the id of the applied follow-up template.
  const [templateId, setTemplateId] = React.useState("")
  const [saveAsOpen, setSaveAsOpen] = React.useState(false)
  const [saveName, setSaveName] = React.useState("")

  const AI_DRAFT = "__ai_draft__"

  // Apply a saved template (or fall back to the AI draft), with the
  // recording's details merged into its {{variables}}.
  function applyTemplateChoice(v: string) {
    if (v === AI_DRAFT) {
      setTemplateId("")
      setSubject(c.followUpDefaultSubject(rec.company))
      setBody(plainToHtml(buildFollowUpDraft(rec, locale, callType, problem)))
      return
    }
    const tpl = templates.find((t) => t.id === v)
    if (!tpl) return
    setTemplateId(tpl.id)
    setSubject(mergeFollowUpVars(tpl.subject, rec))
    setBody(plainToHtml(mergeFollowUpVars(tpl.body, rec)))
  }

  function updateTemplate() {
    if (!templateId) return
    followUpTemplateStore.update(templateId, {
      subject,
      body: stripHtml(body),
    })
    toast.success(c.templateUpdated)
  }

  function deleteTemplate() {
    if (!templateId) return
    followUpTemplateStore.remove(templateId)
    setTemplateId("")
    toast.success(c.templateDeleted)
  }

  function saveAsTemplate() {
    const name = saveName.trim()
    if (!name) return
    const created = followUpTemplateStore.create({
      name,
      subject,
      body: stripHtml(body),
    })
    setTemplateId(created.id)
    setSaveAsOpen(false)
    setSaveName("")
    toast.success(c.templateCreated)
  }

  function generate() {
    setGenerating(true)
    setTimeout(() => {
      setBody(plainToHtml(buildFollowUpDraft(rec, locale, callType, problem)))
      setGenerating(false)
    }, 600)
  }

  const hasText = stripHtml(body).trim().length > 0

  // Gate the composer behind a one-time-per-session value-prop confirmation,
  // mirroring the Chrome extension's FollowUpEmailPrep flow. `valuePropConfirmed`
  // lives on the page (see its declaration there) so it survives switching to
  // another tab and back — only remounting the page resets it.
  if (!valuePropConfirmed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.valuePropGateTitle}</CardTitle>
          <p className="text-muted-foreground text-sm">{c.valuePropGateIntro}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={valueProp}
            onChange={(e) => setValueProp(e.target.value)}
            className="min-h-28"
          />
          <Button variant="volt" onClick={() => setValuePropConfirmed(true)}>
            {c.valuePropGateConfirm}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Not a blocker — the composer below is always usable — just a heads
          up that the AI draft has nothing call-specific to work from yet. */}
      {!hasContext && (
        <Card className="border-chart-4/40 bg-chart-4/5 mb-6">
          <CardContent className="flex items-center gap-3">
            <AlertTriangle className="text-chart-4 size-4 shrink-0" />
            <p className="min-w-0 flex-1 text-sm">{c.followUpNoContext}</p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {c.followUpTitle(rec.prospectName)}
              </CardTitle>
              <p className="text-muted-foreground text-sm">{rec.company}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>{c.templateLabel}</Label>
                <div className="flex items-center gap-1.5">
                  <SearchCombobox
                    value={templateId || AI_DRAFT}
                    onChange={applyTemplateChoice}
                    options={[
                      { value: AI_DRAFT, label: c.aiDraftOption },
                      ...templates.map((t) => ({ value: t.id, label: t.name })),
                    ]}
                    placeholder={c.templateLabel}
                    searchPlaceholder={c.searchTemplatesPlaceholder}
                    emptyText={c.noTemplatesFound}
                    className="min-w-0 flex-1"
                  />
                  {templateId && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={updateTemplate}
                        aria-label={c.updateTemplate}
                        title={c.updateTemplate}
                      >
                        <Save className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                        onClick={deleteTemplate}
                        aria-label={c.deleteTemplate}
                        title={c.deleteTemplate}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setSaveAsOpen((v) => !v)}
                  >
                    <Plus className="size-4" />
                    {c.saveAsTemplate}
                  </Button>
                </div>
                {saveAsOpen && (
                  <div className="flex items-center gap-1.5">
                    <Input
                      autoFocus
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder={c.templateNamePlaceholder}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          saveAsTemplate()
                        }
                      }}
                      className="h-8 flex-1"
                    />
                    <Button
                      variant="volt"
                      size="sm"
                      onClick={saveAsTemplate}
                      disabled={saveName.trim().length === 0}
                    >
                      {c.saveTemplateBtn}
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>{c.followUpSubjectLabel}</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{c.followUpBodyLabel}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generate}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {c.aiDraft}
                  </Button>
                </div>
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  minHeight="min-h-44"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Button
                variant="volt"
                className="w-full"
                disabled={!hasText}
                onClick={() => toast.success(c.followUpSent)}
              >
                <Send className="size-4" />
                {c.sendFollowUp}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.wasFollowUpHelpful}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                <Button
                  variant={helpful === true ? "default" : "outline"}
                  size="icon"
                  className="size-8"
                  aria-label={c.helpful}
                  onClick={() => {
                    setHelpful(true)
                    toast.success(c.gladHelped)
                  }}
                >
                  <ThumbsUp className="size-4" />
                </Button>
                <Button
                  variant={helpful === false ? "default" : "outline"}
                  size="icon"
                  className="size-8"
                  aria-label={c.notHelpful}
                  onClick={() => {
                    setHelpful(false)
                    toast.info(c.willImprove)
                  }}
                >
                  <ThumbsDown className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
