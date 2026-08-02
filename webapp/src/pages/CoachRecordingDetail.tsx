import * as React from "react"
import { Link, useParams } from "react-router-dom"
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
  Phone,
  ChevronDown,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
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
import { LinkedinIcon, WhatsappIcon } from "@/components/icons/BrandIcons"
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
  usePromptTemplates,
  promptTemplateStore,
  generatePromptedMessage,
  COACH_FOLLOWUP_FOLDER,
} from "@/lib/prompt-templates"
import { mergeVars } from "@/lib/merge-vars"
import { coachRecordings, currentUser } from "@/lib/mock-data"
import { getScorecard } from "@/lib/mock-coaching"
import { recordingDetails, CONNECTED_CRM_PROVIDER } from "@/lib/mock-depth"
import { coachTeam, coachTeamAvg } from "@/lib/mock-coach-team"
import { CALL_TYPES, CALL_TYPE_META } from "@/lib/call-types"
import { plainToHtml, stripHtml } from "@/lib/rich-text"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CallScoreRadarChart } from "@/components/charts/Charts"
import type {
  CoachRecording,
  CallType,
  CoachSpeaker,
  CoachUtterance,
  CoachScoreMetric,
  CoachQuestion,
  CoachParticipant,
} from "@/lib/types"

function toggled<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

const SENTIMENT = {
  positive: { icon: Smile, variant: "success" as const },
  neutral: { icon: Meh, variant: "secondary" as const },
  negative: { icon: Frown, variant: "destructive" as const },
}

// No real per-item priority data exists yet — cycles a deterministic
// high/medium/low so the Next Steps list reads as prioritized. The rep can
// override any of them from the per-step Priority dropdown.
const ACTION_ITEM_PRIORITIES = ["high", "medium", "low"] as const
type ActionItemPriority = (typeof ACTION_ITEM_PRIORITIES)[number]

// Urgency, not quality — high priority is the alarming one. Reuses the same
// green/amber/red tokens the score pills use.
const PRIORITY_TONE: Record<ActionItemPriority, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-chart-4/15 text-chart-4",
  low: "bg-chart-1/15 text-chart-1",
}

const COPY = {
  en: {
    recordingNotFound: "Recording not found.",
    coach: "All Calls",
    callScore: "Call score",
    reanalyzing: "Re-analyzing recording…",
    reanalyze: "Re-analyze",
    callTypeAria: "Call type",
    aiAssigned: "AI-assigned",
    aiAssignedHint: "AI classified this call automatically from the transcript.",
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
    callScoreGraph: "Call score",
    whyThisResult: "Why this result?",
    whereInTranscript: "Where in the transcript?",
    howToImproveLabel: "How can I improve for next time?",
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
    crmDetails: (crm: string) => `${crm} details`,
    nextStepFieldLabel: (n: number) => `Next step ${n}`,
    selectNextStepAria: (step: string) => `Select for CRM: ${step}`,
    crmFirstName: "First name",
    crmLastName: "Last name",
    crmEmail: "Email",
    priorityLabel: (p: string) => `Priority: ${p}`,
    priorityAria: (s: string) => `Priority for "${s}"`,
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
      "Confirm your value proposition so AI can tailor this follow-up.",
    valuePropGateDefault: (company: string) =>
      `${company} helps sales teams find and engage the right prospects faster with AI-powered search, enrichment, and outreach — all in one place.`,
    valuePropGateConfirm: "Confirm & continue",
    followUpSubjectLabel: "Subject",
    followUpBodyLabel: "Message",
    aiDraft: "Draft with AI",
    aiPromptLabel: "What should the follow-up say?",
    aiPromptPlaceholder:
      "e.g. Thank {{first_name}} for their time, recap the next steps, and keep the tone warm but brief.",
    aiRegenerate: "Regenerate",
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
    aiAssignedHint: "La IA clasificó esta llamada automáticamente a partir de la transcripción.",
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
    callScoreGraph: "Puntuación de la llamada",
    whyThisResult: "¿Por qué este resultado?",
    whereInTranscript: "¿Dónde en la transcripción?",
    howToImproveLabel: "¿Cómo puedo mejorar la próxima vez?",
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
    crmDetails: (crm: string) => `Detalles en ${crm}`,
    nextStepFieldLabel: (n: number) => `Próximo paso ${n}`,
    selectNextStepAria: (step: string) => `Seleccionar para el CRM: ${step}`,
    crmFirstName: "Nombre",
    crmLastName: "Apellidos",
    crmEmail: "Correo",
    priorityLabel: (p: string) => `Prioridad: ${p}`,
    priorityAria: (s: string) => `Prioridad de «${s}»`,
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
      "Confirma tu propuesta de valor para que la IA pueda adaptar este seguimiento.",
    valuePropGateDefault: (company: string) =>
      `${company} ayuda a los equipos de ventas a encontrar y contactar a los prospectos adecuados más rápido con búsqueda, enriquecimiento y prospección impulsados por IA — todo en un mismo lugar.`,
    valuePropGateConfirm: "Confirmar y continuar",
    followUpSubjectLabel: "Asunto",
    followUpBodyLabel: "Mensaje",
    aiDraft: "Redactar con IA",
    aiPromptLabel: "¿Qué debe decir el seguimiento?",
    aiPromptPlaceholder:
      "p. ej. Agradece a {{first_name}} su tiempo, resume los próximos pasos y mantén un tono cercano pero breve.",
    aiRegenerate: "Regenerar",
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
    aiAssignedHint: "L'IA ha classificato questa chiamata automaticamente dalla trascrizione.",
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
    callScoreGraph: "Punteggio della chiamata",
    whyThisResult: "Perché questo risultato?",
    whereInTranscript: "Dove nella trascrizione?",
    howToImproveLabel: "Come posso migliorare la prossima volta?",
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
    crmDetails: (crm: string) => `Dettagli su ${crm}`,
    nextStepFieldLabel: (n: number) => `Prossimo passo ${n}`,
    selectNextStepAria: (step: string) => `Seleziona per il CRM: ${step}`,
    crmFirstName: "Nome",
    crmLastName: "Cognome",
    crmEmail: "Email",
    priorityLabel: (p: string) => `Priorità: ${p}`,
    priorityAria: (s: string) => `Priorità di «${s}»`,
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
      "Conferma la tua proposta di valore così l'IA può personalizzare questo follow-up.",
    valuePropGateDefault: (company: string) =>
      `${company} aiuta i team di vendita a trovare e coinvolgere i prospect giusti più velocemente con ricerca, arricchimento e prospecting basati sull'AI — tutto in un unico posto.`,
    valuePropGateConfirm: "Conferma e continua",
    followUpSubjectLabel: "Oggetto",
    followUpBodyLabel: "Messaggio",
    aiDraft: "Scrivi con l'AI",
    aiPromptLabel: "Cosa deve dire il follow-up?",
    aiPromptPlaceholder:
      "es. Ringrazia {{first_name}} per il tempo dedicato, riepiloga i prossimi passi e mantieni un tono caloroso ma breve.",
    aiRegenerate: "Rigenera",
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
    aiAssignedHint: "L'IA a classé cet appel automatiquement à partir de la transcription.",
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
    callScoreGraph: "Score de l'appel",
    whyThisResult: "Pourquoi ce résultat ?",
    whereInTranscript: "Où dans la transcription ?",
    howToImproveLabel: "Comment m'améliorer la prochaine fois ?",
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
    crmDetails: (crm: string) => `Détails dans ${crm}`,
    nextStepFieldLabel: (n: number) => `Étape suivante ${n}`,
    selectNextStepAria: (step: string) => `Sélectionner pour le CRM : ${step}`,
    crmFirstName: "Prénom",
    crmLastName: "Nom",
    crmEmail: "E-mail",
    priorityLabel: (p: string) => `Priorité : ${p}`,
    priorityAria: (s: string) => `Priorité de « ${s} »`,
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
      "Confirmez votre proposition de valeur pour que l'IA puisse adapter ce suivi.",
    valuePropGateDefault: (company: string) =>
      `${company} aide les équipes commerciales à trouver et engager les bons prospects plus rapidement grâce à la recherche, l'enrichissement et la prospection propulsés par l'IA — le tout au même endroit.`,
    valuePropGateConfirm: "Confirmer et continuer",
    followUpSubjectLabel: "Objet",
    followUpBodyLabel: "Message",
    aiDraft: "Rédiger avec l'IA",
    aiPromptLabel: "Que doit dire le message de suivi ?",
    aiPromptPlaceholder:
      "ex. Remerciez {{first_name}} pour son temps, récapitulez les prochaines étapes et gardez un ton chaleureux mais bref.",
    aiRegenerate: "Régénérer",
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
    aiAssignedHint: "Die KI hat diesen Call automatisch anhand des Transkripts klassifiziert.",
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
    callScoreGraph: "Anruf-Score",
    whyThisResult: "Warum dieses Ergebnis?",
    whereInTranscript: "Wo im Transkript?",
    howToImproveLabel: "Wie kann ich mich beim nächsten Mal verbessern?",
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
    crmDetails: (crm: string) => `Details in ${crm}`,
    nextStepFieldLabel: (n: number) => `Nächster Schritt ${n}`,
    selectNextStepAria: (step: string) => `Für CRM auswählen: ${step}`,
    crmFirstName: "Vorname",
    crmLastName: "Nachname",
    crmEmail: "E-Mail",
    priorityLabel: (p: string) => `Priorität: ${p}`,
    priorityAria: (s: string) => `Priorität von „${s}“`,
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
      "Bestätige deine Value Proposition, damit die KI dieses Follow-up darauf abstimmen kann.",
    valuePropGateDefault: (company: string) =>
      `${company} hilft Sales-Teams, die richtigen Prospects schneller zu finden und anzusprechen — mit KI-gestützter Suche, Anreicherung und Prospecting, alles an einem Ort.`,
    valuePropGateConfirm: "Bestätigen und fortfahren",
    followUpSubjectLabel: "Betreff",
    followUpBodyLabel: "Nachricht",
    aiDraft: "Mit KI entwerfen",
    aiPromptLabel: "Was soll die Follow-up-Nachricht sagen?",
    aiPromptPlaceholder:
      "z. B. Bedanke dich bei {{first_name}} für die Zeit, fasse die nächsten Schritte zusammen und halte den Ton warm, aber kurz.",
    aiRegenerate: "Neu generieren",
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
    aiAssignedHint: "A IA classificou esta chamada automaticamente a partir da transcrição.",
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
    callScoreGraph: "Pontuação da chamada",
    whyThisResult: "Porquê este resultado?",
    whereInTranscript: "Onde na transcrição?",
    howToImproveLabel: "Como posso melhorar da próxima vez?",
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
    crmDetails: (crm: string) => `Detalhes no ${crm}`,
    nextStepFieldLabel: (n: number) => `Próximo passo ${n}`,
    selectNextStepAria: (step: string) => `Selecionar para o CRM: ${step}`,
    crmFirstName: "Nome",
    crmLastName: "Apelido",
    crmEmail: "Email",
    priorityLabel: (p: string) => `Prioridade: ${p}`,
    priorityAria: (s: string) => `Prioridade de «${s}»`,
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
      "Confirme a sua proposta de valor para que a IA possa adaptar este seguimento.",
    valuePropGateDefault: (company: string) =>
      `${company} ajuda as equipas de vendas a encontrar e envolver os prospects certos mais depressa com pesquisa, enriquecimento e prospeção com IA — tudo num só lugar.`,
    valuePropGateConfirm: "Confirmar e continuar",
    followUpSubjectLabel: "Assunto",
    followUpBodyLabel: "Mensagem",
    aiDraft: "Redigir com IA",
    aiPromptLabel: "O que deve dizer o seguimento?",
    aiPromptPlaceholder:
      "p. ex. Agradeça a {{first_name}} pelo tempo, recapitule os próximos passos e mantenha um tom próximo mas breve.",
    aiRegenerate: "Regenerar",
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
    aiAssignedHint: "A IA classificou esta ligação automaticamente a partir da transcrição.",
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
    callScoreGraph: "Pontuação da chamada",
    whyThisResult: "Por que esse resultado?",
    whereInTranscript: "Onde na transcrição?",
    howToImproveLabel: "Como posso melhorar da próxima vez?",
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
    crmDetails: (crm: string) => `Detalhes no ${crm}`,
    nextStepFieldLabel: (n: number) => `Próximo passo ${n}`,
    selectNextStepAria: (step: string) => `Selecionar para o CRM: ${step}`,
    crmFirstName: "Nome",
    crmLastName: "Sobrenome",
    crmEmail: "E-mail",
    priorityLabel: (p: string) => `Prioridade: ${p}`,
    priorityAria: (s: string) => `Prioridade de "${s}"`,
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
      "Confirme sua proposta de valor para que a IA possa personalizar este follow-up.",
    valuePropGateDefault: (company: string) =>
      `${company} ajuda times de vendas a encontrar e engajar os prospects certos mais rápido com busca, enriquecimento e prospecção com IA — tudo em um só lugar.`,
    valuePropGateConfirm: "Confirmar e continuar",
    followUpSubjectLabel: "Assunto",
    followUpBodyLabel: "Mensagem",
    aiDraft: "Redigir com IA",
    aiPromptLabel: "O que o follow-up deve dizer?",
    aiPromptPlaceholder:
      "ex.: Agradeça a {{first_name}} pelo tempo, recapitule os próximos passos e mantenha um tom próximo, mas breve.",
    aiRegenerate: "Regenerar",
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
  whatsapp: { Icon: WhatsappIcon, className: "text-emerald-600" },
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

// The merge-var data a recording can offer generateTemplate()'s output —
// covers every {{tag}} its canned copy uses (first_name/company plus the
// sender fields), so nothing renders as a literal unresolved {{tag}}.
// CoachRecording has no prospect job title, so {{title}} is intentionally
// left out of this map (see buildDefaultFollowUpPrompt's note on why the
// "cold" intent — the only bucket using {{title}} — is never reached here).
function followUpMergeData(rec: CoachRecording): Record<string, string> {
  return {
    first_name: rec.prospectName.split(" ")[0],
    company: rec.company,
    next_steps: rec.nextSteps.map((s) => `• ${s}`).join("\n"),
    sender: currentUser.name,
    sender_company: currentUser.company,
    sender_title: currentUser.role,
    calendar_link: "kombo.ai/meet/kevin",
  }
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

// Seeds the composer's free-text prompt from what's known about the call —
// the call type and (when analyzed) the Key Fields "problem" and next steps —
// so "Draft with AI" has real call context to write from on the first click,
// same as opening any other prompt-driven generator with a blank field would
// feel broken. `generateTemplate()`'s intent detection (lib/mock-template-ai)
// only reads the prompt's own English text, so this is deliberately built in
// English regardless of UI locale — matching how every other prompt template
// in the app (lib/prompt-templates.ts's SEED, PROMPT_PRESETS) is authored.
// The prompt always mentions "results" so it lands in generateTemplate()'s
// case-study/results ("follow_up") bucket rather than falling through to its
// "cold" bucket, the only one whose copy needs a {{title}} this recording
// doesn't have (see followUpMergeData above).
function buildDefaultFollowUpPrompt(
  rec: CoachRecording,
  callType: CallType,
  problem?: string
): string {
  const callLabel = CALL_TYPE_META[callType].label.en.toLowerCase()
  const steps = rec.nextSteps
  const stepsPhrase = steps.length
    ? ` and these next steps: ${steps.join("; ")}`
    : ""
  const problemPhrase = problem ? ` — they mentioned: ${problem}` : ""
  return `Write a warm thank-you follow-up email to {{first_name}} at {{company}} recapping today's ${callLabel} conversation${stepsPhrase}${problemPhrase}. Reference the results so far and keep it concise.`
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
  // True until the user overrides the type AI picked from the transcript.
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
  // Per-next-step priority the rep can change. Seeded lazily from the
  // AI-assigned default (ACTION_ITEM_PRIORITIES, cycled) — an entry only
  // appears here once the rep has actually overridden that step.
  const [priorities, setPriorities] = React.useState<
    Record<number, ActionItemPriority>
  >({})
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
                    // Already on the CRM — the extension swaps the Add action
                    // for a read-only link out to the existing record rather
                    // than a bare "in CRM" label.
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/integrations">
                        <Building2 className="size-4" />
                        {c.crmDetails(CONNECTED_CRM_PROVIDER.name)}
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
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
          const priority =
            priorities[i] ??
            ACTION_ITEM_PRIORITIES[i % ACTION_ITEM_PRIORITIES.length]
          return (
            <div
              key={item}
              className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm"
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
              <Select
                value={priority}
                onValueChange={(v) =>
                  setPriorities((prev) => ({
                    ...prev,
                    [i]: v as ActionItemPriority,
                  }))
                }
              >
                <SelectTrigger
                  size="sm"
                  aria-label={c.priorityAria(item)}
                  className={cn(
                    "h-6 shrink-0 rounded-md border-0 px-2 text-xs font-medium",
                    PRIORITY_TONE[priority]
                  )}
                >
                  {c.priorityLabel(c.priority[priority])}
                </SelectTrigger>
                <SelectContent>
                  {ACTION_ITEM_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {c.priority[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <CardTitle className="text-base">{c.callScoreGraph}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <CallScoreRadarChart
                        labels={rec.scoreBreakdown.map((m) => m.label)}
                        callSeries={rec.scoreBreakdown.map((m) => m.metricScore)}
                        repAvgSeries={
                          rec.scoreBreakdown.every((m) => m.repAvgScore !== undefined)
                            ? rec.scoreBreakdown.map((m) => m.repAvgScore ?? 0)
                            : undefined
                        }
                        teamAvgSeries={
                          rec.scoreBreakdown.every((m) => m.teamAvgScore !== undefined)
                            ? rec.scoreBreakdown.map((m) => m.teamAvgScore ?? 0)
                            : undefined
                        }
                        callLabel={c.callScore}
                        repAvgLabel={c.yourAverage}
                        teamAvgLabel={c.teamAverage}
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

// A value/NA badge shared by sub-metric rows and rubric-question rows — an
// NA result is always the same neutral gray chip, never the (misleading)
// red/error styling a low score would otherwise get.
function ScoreValueBadge({
  isNa,
  na,
  children,
  className,
}: {
  isNa?: boolean
  na: string
  children: React.ReactNode
  className?: string
}) {
  if (isNa) {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground border-muted-foreground/30"
      >
        {na}
      </Badge>
    )
  }
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-xs font-medium tabular-nums",
        className
      )}
    >
      {children}
    </span>
  )
}

const BREAKDOWN_TONE: Record<CoachQuestion["breakdownType"], string> = {
  good: "bg-chart-1/15 text-chart-1",
  medium: "bg-chart-4/15 text-chart-4",
  bad: "bg-destructive/15 text-destructive",
}

// The leaf of the Call Score tree — a single rubric question, expandable to
// its Why/Quotes/How-to-improve explanation.
function QuestionRow({ question, c }: { question: CoachQuestion; c: Copy }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="rounded-md border pl-3 pr-2 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-xs">{question.text}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          <ScoreValueBadge
            isNa={question.isNa}
            na={c.na}
            className={BREAKDOWN_TONE[question.breakdownType]}
          >
            {question.value}
          </ScoreValueBadge>
          <ChevronDown
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-2 border-t pt-2 text-xs">
          <div>
            <p className="text-muted-foreground font-medium">{c.whyThisResult}</p>
            <p className="mt-0.5">{question.why}</p>
          </div>
          {question.quotes.length > 0 && (
            <div>
              <p className="text-muted-foreground font-medium">
                {c.whereInTranscript}
              </p>
              {question.quotes.map((q) => (
                <p key={q} className="mt-0.5 italic">
                  &ldquo;{q}&rdquo;
                </p>
              ))}
            </div>
          )}
          <div>
            <p className="text-muted-foreground font-medium">
              {c.howToImproveLabel}
            </p>
            <p className="mt-0.5">{question.howToImprove}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// One row of the Call Score Breakdown — a scored metric category, expandable
// to its sub-metrics, each of those expandable to its own rubric questions.
function ScoreBreakdownRow({
  metric,
  c,
}: {
  metric: CoachScoreMetric
  c: Copy
}) {
  const [open, setOpen] = React.useState(false)
  const [openSub, setOpenSub] = React.useState<Set<string>>(new Set())
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
          <ScoreValueBadge
            isNa={metric.isNa}
            na={c.na}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              scorePillClass(metric.metricScore)
            )}
          >
            {metric.metricScore}
          </ScoreValueBadge>
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
        <div className="mt-3 space-y-2 border-t pt-3">
          {subMetrics.map((sub) => {
            const questions = sub.questions ?? []
            const subOpen = openSub.has(sub.label)
            return (
              <div key={sub.label} className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSub((prev) => toggled(prev, sub.label))
                  }
                  className="flex w-full items-center justify-between text-sm"
                  disabled={questions.length === 0}
                >
                  <span className="text-muted-foreground">{sub.label}</span>
                  <span className="flex items-center gap-1.5">
                    <ScoreValueBadge isNa={sub.isNa} na={c.na}>
                      {sub.score}
                    </ScoreValueBadge>
                    {questions.length > 0 && (
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform",
                          subOpen && "rotate-180"
                        )}
                      />
                    )}
                  </span>
                </button>
                {questions.length > 0 && subOpen && (
                  <div className="space-y-1.5 pl-2">
                    {questions.map((q) => (
                      <QuestionRow key={q.text} question={q} c={c} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
  callType,
  problem,
  helpful,
  setHelpful,
  valuePropConfirmed,
  setValuePropConfirmed,
}: {
  rec: CoachRecording
  c: Copy
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
  const allPromptTemplates = usePromptTemplates()
  // Only the folder Coach's "Save as template" writes to — keeps the picker
  // scoped to call follow-ups instead of every outbound prompt in Templates.
  const templates = allPromptTemplates.filter(
    (t) => t.channel === "email" && t.folder === COACH_FOLLOWUP_FOLDER
  )
  // Nothing concrete to personalize the draft with yet — next steps carry
  // the "what to do", `problem` carries the "why it matters"; without either
  // the default prompt would be nothing but the call-type opener.
  const hasContext = rec.nextSteps.length > 0 || Boolean(problem)
  const mergeData = React.useMemo(() => followUpMergeData(rec), [rec])

  // Runs the shared prompt-driven generator (lib/mock-template-ai via
  // lib/prompt-templates' generatePromptedMessage) against whatever prompt
  // is currently loaded, merging this recording's data into the result.
  function runGenerate(promptText: string, seed: number) {
    const draft = generatePromptedMessage(promptText, "email", seed)
    setSubject(mergeVars(draft.subject, mergeData))
    setBody(plainToHtml(mergeVars(draft.body, mergeData)))
  }

  // Radix unmounts inactive TabsContent, so this mounts fresh each time the
  // Follow-Up tab is selected — a plain initializer is enough, no dialog-style
  // open/close reset needed. Subject and body both seed from the same first
  // generation so they're never out of sync on first render (previously the
  // subject fell back to a fixed default while only the body was generated).
  const initialPrompt = buildDefaultFollowUpPrompt(rec, callType, problem)
  const initialDraft = generatePromptedMessage(initialPrompt, "email", 0)

  const [aiPrompt, setAiPrompt] = React.useState(initialPrompt)
  const [aiSeed, setAiSeed] = React.useState(0)
  const [aiGenerated, setAiGenerated] = React.useState(false)
  const [subject, setSubject] = React.useState(() =>
    mergeVars(initialDraft.subject, mergeData)
  )
  const [body, setBody] = React.useState(() =>
    plainToHtml(mergeVars(initialDraft.body, mergeData))
  )
  const [generating, setGenerating] = React.useState(false)
  // "" = the AI draft; otherwise the id of the applied prompt template.
  const [templateId, setTemplateId] = React.useState("")
  const [saveAsOpen, setSaveAsOpen] = React.useState(false)
  const [saveName, setSaveName] = React.useState("")

  const AI_DRAFT = "__ai_draft__"

  // Apply a saved prompt template (or fall back to the call-aware default
  // prompt), then immediately regenerate from it so the picker always shows
  // a real draft, not just the raw instruction text.
  function applyTemplateChoice(v: string) {
    if (v === AI_DRAFT) {
      setTemplateId("")
      const prompt = buildDefaultFollowUpPrompt(rec, callType, problem)
      setAiPrompt(prompt)
      setAiSeed(0)
      setAiGenerated(false)
      runGenerate(prompt, 0)
      return
    }
    const tpl = templates.find((t) => t.id === v)
    if (!tpl) return
    setTemplateId(tpl.id)
    setAiPrompt(tpl.prompt)
    setAiSeed(0)
    setAiGenerated(false)
    runGenerate(tpl.prompt, 0)
  }

  function updateTemplate() {
    if (!templateId) return
    promptTemplateStore.update(templateId, { prompt: aiPrompt })
    toast.success(c.templateUpdated)
  }

  function deleteTemplate() {
    if (!templateId) return
    promptTemplateStore.remove(templateId)
    setTemplateId("")
    toast.success(c.templateDeleted)
  }

  function saveAsTemplate() {
    const name = saveName.trim()
    if (!name) return
    const created = promptTemplateStore.create({
      name,
      channel: "email",
      folder: COACH_FOLLOWUP_FOLDER,
      prompt: aiPrompt,
      tags: [],
    })
    setTemplateId(created.id)
    setSaveAsOpen(false)
    setSaveName("")
    toast.success(c.templateCreated)
  }

  function generate() {
    const prompt = aiPrompt.trim()
    if (!prompt || generating) return
    setGenerating(true)
    const seed = aiGenerated ? aiSeed + 1 : 0
    setTimeout(() => {
      runGenerate(prompt, seed)
      setAiSeed(seed)
      setAiGenerated(true)
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
                <div className="flex items-center justify-between">
                  <Label>{c.aiPromptLabel}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generate}
                    disabled={generating || aiPrompt.trim().length === 0}
                  >
                    {generating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : aiGenerated ? (
                      <RefreshCw className="size-4" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {aiGenerated ? c.aiRegenerate : c.aiDraft}
                  </Button>
                </div>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={c.aiPromptPlaceholder}
                  className="min-h-20"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{c.followUpSubjectLabel}</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{c.followUpBodyLabel}</Label>
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
