import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Mail,
  Send,
  ArrowLeft,
  Inbox as InboxIcon,
  MailOpen,
  Clock,
  UserPlus,
  Archive,
  ArchiveRestore,
  Trash2,
  MoreHorizontal,
  Languages,
  FileText,
  Check,
  Sparkles,
  Wand2,
  CalendarClock,
  Search as SearchIcon,
  SlidersHorizontal,
  ThumbsUp,
  Eye,
  Braces,
  Plus,
  MousePointerClick,
  UserCheck,
  Tag,
  ChevronDown,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ListTodo,
  Reply,
  Phone,
  MessageCircle,
  Circle,
  AlarmClock,
  CheckCircle2,
  ClipboardList,
  CornerUpRight,
  Pencil,
  Mic,
  Play,
  Pause,
  Square,
  ListFilter,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/common/RichTextEditor"
import { MessageBody } from "@/components/common/MessageBody"
import { plainToHtml, stripHtml } from "@/lib/rich-text"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { ChannelIcon } from "@/components/common/ChannelIcon"
import { TruncatedText } from "@/components/common/TruncatedText"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { TemplatePickerDialog } from "@/components/templates/TemplatePickerDialog"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { FilterConversationsDialog } from "@/components/inbox/FilterConversationsDialog"
import {
  emptyConversationFilters,
  countConversationFilters,
  type ConversationFilters,
} from "@/lib/conversation-filters"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { resolveUser } from "@/lib/task-people"
import { getProspect, currentUser } from "@/lib/mock-data"
import { getRep, assigneeName } from "@/lib/team"
import { useConversations, conversationStore, useTasks, taskStore, useCampaigns } from "@/lib/store"
import { STATUS_META, STATUS_ORDER } from "@/lib/conv-status"
import { campaignEnrollments } from "@/lib/mock-depth"
import {
  draftReply,
  type ReplyTone,
  type ReplyLength,
  type DraftReplyOptions,
} from "@/lib/mock-ai-reply"
import {
  translate,
  detectLang,
  LANG_FLAG,
  LANG_LABEL,
} from "@/lib/mock-translate"
import { relativeTime, futureRelativeTime, formatDueAt, initials } from "@/lib/format"
import { groupByMergeVarGroup, MERGE_VARIABLES, MERGE_VARIABLE_GROUPS } from "@/lib/merge-vars"
import { cn } from "@/lib/utils"
import { useLocale, type Locale } from "@/lib/locale"
import { useSidebarCollapsed } from "@/lib/sidebar-collapse-state"
import { ProspectSummaryPanel } from "@/components/common/ProspectSummaryPanel"
import type {
  Channel,
  ChatLang,
  Conversation,
  ConvEvent,
  ConvEventKind,
  ConvStatus,
  Prospect,
  SequenceChannelType,
  StepChannel,
  Task,
  TaskEventState,
  TaskType,
} from "@/lib/types"

const COPY = {
  en: {
    inbox: "Inbox",
    drafts: "AI Drafts",
    unread: "Unread",
    needs_reply: "Need to Reply",
    myTasks: "My Tasks",
    scheduled: "Scheduled",
    sent: "Sent",
    archivedFolder: "Archived",
    expandFolders: "Expand folders",
    collapseFolders: "Collapse folders",
    tags: "Outcomes",
    search: "Search prospects, companies…",
    filters: "Filters",
    channel: "Channel",
    allChannels: "All channels",
    email: "Email",
    linkedin: "LinkedIn",
    unreadOnly: "Unread only",
    country: "Country",
    allCountries: "All countries",
    recency: "Last message",
    recencyAny: "Any time",
    recency24h: "Past 24 hours",
    recency7d: "Past 7 days",
    recency30d: "Past 30 days",
    moreFilters: "More filters…",
    clearFilters: "Clear filters",
    empty: "Nothing here",
    emptyHint: "New conversations will show up here.",
    backToInbox: "Back",
    createTask: "Create task",
    editTask: "Edit task",
    autoReply: "AI auto-reply",
    autoReplyEnabled: (name: string) => `AI auto-reply on for ${name}`,
    autoReplyDisabled: "AI auto-reply off",
    bulkSelected: (n: number) => `${n} selected`,
    clearSelection: "Clear",
    replyTo: (name: string) => `Reply to ${name}…`,
    via: "via",
    send: "Send",
    sendNow: "Send now",
    replySent: (name: string) => `Reply sent to ${name}`,
    selectConversation: "Select a conversation",
    selectConversationHint: "Choose a thread to read and reply.",
    markRead: "Mark as read",
    markUnread: "Mark as unread",
    assign: "Assign owner",
    assignedTo: (name: string) => `Owner: ${name}`,
    unassign: "Remove owner",
    archive: "Archive",
    unarchive: "Move to inbox",
    delete: "Delete",
    deleteTitle: "Delete conversation?",
    deleteDesc: "This permanently removes the thread. This can't be undone.",
    deleteConfirm: "Delete",
    deleted: "Conversation deleted",
    archived: "Conversation archived",
    assignedToast: (name: string) => `Owner set to ${name}`,
    templates: "Templates",
    noTemplates: "No templates yet",
    translate: "Translate",
    showOriginal: "Show original",
    translatedFrom: (lang: string) => `Translated from ${lang}`,
    writeIn: (flag: string, lang: string) => `Write in ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Draft translated to ${lang}`,
    more: "More",
    // new
    setStatus: "Set Outcome",
    clearStatus: "Clear outcome",
    statusToast: (label: string) => `Outcome set to ${label}`,
    statusClearedToast: "Outcome cleared",
    autoTaggedAs: "Outcome changed:",
    aiGenerated: "AI-Generated",
    newDivider: "New",
    replyAs: "Reply as",
    from: "from",
    kaiDraft: "Kai draft",
    generate: "Generate draft",
    regenerate: "Regenerate",
    tone: "Tone",
    toneFormal: "Formal",
    toneFriendly: "Friendly",
    toneProfessional: "Professional",
    toneConcise: "Concise",
    length: "Length",
    shorter: "Make shorter",
    longer: "Make longer",
    refined: (label: string) => `Rewrote — ${label.toLowerCase()}`,
    personalize: "+ Variables",
    regenTitle: "Regenerate with…",
    regenLengthNormal: "Normal",
    regenLanguage: "Language",
    regenInstructions: "Additional instructions (optional)",
    regenInstructionsPlaceholder: "e.g. mention our upcoming webinar…",
    regenCancel: "Cancel",
    regenerated: "Draft regenerated",
    varsSearchPlaceholder: "Search variables…",
    personalizedVariable: "Personalized variable",
    personalizedVariablePlaceholder: "e.g. a friendly comment about their recent achievement",
    varsEmpty: "No variables match your search.",
    varGroups: {
      yourDetails: "Your Details",
      prospectInfo: "Prospect Info",
      prospectCompany: "Prospect Company",
      activity: "Activity",
      other: "Other",
    } as Record<string, string>,
    sendVia: () => `Send`,
    collapseList: "Collapse list",
    expandList: "Show list",
    showProfile: "Show profile panel",
    hideProfile: "Hide profile panel",
    draftReady: "Kai drafted a reply — review and send.",
    scheduledFor: (d: string) => `Reply scheduled for ${d}`,
    cancelSchedule: "Cancel",
    recordVoice: "Voice message",
    recording: "Recording",
    stopAndSend: "Stop & send",
    sentScheduled: "Scheduled reply sent",
    scheduleCancelled: "Scheduled reply cancelled",
    sendLater: "Send later",
    scheduleSend: "Schedule send",
    inOneHour: "In 1 hour",
    tomorrowMorning: "Tomorrow, 8:00 AM",
    mondayMorning: "Monday, 8:00 AM",
    pickDateTime: "Pick date & time…",
    scheduleTitle: "Schedule this reply",
    scheduleWhen: "Send at",
    scheduleConfirm: "Schedule",
    scheduledToast: (d: string) => `Reply scheduled for ${d}`,
    bold: "Bold",
    italic: "Italic",
    draftReadyTag: "Draft ready",
  },
  es: {
    inbox: "Bandeja",
    drafts: "Borradores IA",
    unread: "Sin leer",
    needs_reply: "Por responder",
    myTasks: "Mis tareas",
    scheduled: "Programados",
    sent: "Enviados",
    archivedFolder: "Archivados",
    expandFolders: "Expandir carpetas",
    collapseFolders: "Contraer carpetas",
    tags: "Resultados",
    search: "Buscar prospectos, empresas…",
    filters: "Filtros",
    channel: "Canal",
    allChannels: "Todos los canales",
    email: "Correo",
    linkedin: "LinkedIn",
    unreadOnly: "Solo sin leer",
    country: "País",
    allCountries: "Todos los países",
    recency: "Último mensaje",
    recencyAny: "Cualquier momento",
    recency24h: "Últimas 24 horas",
    recency7d: "Últimos 7 días",
    recency30d: "Últimos 30 días",
    moreFilters: "Más filtros…",
    clearFilters: "Limpiar filtros",
    empty: "Nada por aquí",
    emptyHint: "Las nuevas conversaciones aparecerán aquí.",
    backToInbox: "Volver",
    createTask: "Crear tarea",
    editTask: "Editar tarea",
    autoReply: "Respuesta automática con IA",
    autoReplyEnabled: (name: string) => `Respuesta automática con IA activada para ${name}`,
    autoReplyDisabled: "Respuesta automática con IA desactivada",
    bulkSelected: (n: number) => `${n} seleccionados`,
    clearSelection: "Limpiar",
    replyTo: (name: string) => `Responder a ${name}…`,
    via: "por",
    send: "Enviar",
    sendNow: "Enviar ahora",
    replySent: (name: string) => `Respuesta enviada a ${name}`,
    selectConversation: "Selecciona una conversación",
    selectConversationHint: "Elige un hilo para leer y responder.",
    markRead: "Marcar como leído",
    markUnread: "Marcar como no leído",
    assign: "Asignar responsable",
    assignedTo: (name: string) => `Responsable: ${name}`,
    unassign: "Quitar responsable",
    archive: "Archivar",
    unarchive: "Mover a la bandeja",
    delete: "Eliminar",
    deleteTitle: "¿Eliminar conversación?",
    deleteDesc: "Esto elimina el hilo de forma permanente. No se puede deshacer.",
    deleteConfirm: "Eliminar",
    deleted: "Conversación eliminada",
    archived: "Conversación archivada",
    assignedToast: (name: string) => `Responsable definido: ${name}`,
    templates: "Plantillas",
    noTemplates: "Aún no hay plantillas",
    translate: "Traducir",
    showOriginal: "Ver original",
    translatedFrom: (lang: string) => `Traducido del ${lang}`,
    writeIn: (flag: string, lang: string) => `Escribir en ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Borrador traducido a ${lang}`,
    more: "Más",
    setStatus: "Definir resultado",
    clearStatus: "Quitar resultado",
    statusToast: (label: string) => `Resultado definido: ${label}`,
    statusClearedToast: "Resultado eliminado",
    autoTaggedAs: "Resultado cambiado:",
    aiGenerated: "Generado por IA",
    newDivider: "Nuevo",
    replyAs: "Responder como",
    from: "desde",
    kaiDraft: "Borrador de Kai",
    generate: "Generar borrador",
    regenerate: "Regenerar",
    tone: "Tono",
    toneFormal: "Formal",
    toneFriendly: "Cercano",
    toneProfessional: "Profesional",
    toneConcise: "Conciso",
    length: "Longitud",
    shorter: "Más corto",
    longer: "Más largo",
    refined: (label: string) => `Reescrito — ${label.toLowerCase()}`,
    personalize: "+ Variables",
    regenTitle: "Regenerar con…",
    regenLengthNormal: "Normal",
    regenLanguage: "Idioma",
    regenInstructions: "Instrucciones adicionales (opcional)",
    regenInstructionsPlaceholder: "p. ej. menciona nuestro próximo webinar…",
    regenCancel: "Cancelar",
    regenerated: "Borrador regenerado",
    varsSearchPlaceholder: "Buscar variables…",
    personalizedVariable: "Variable personalizada",
    personalizedVariablePlaceholder: "p. ej. un comentario amable sobre su logro reciente",
    varsEmpty: "Ninguna variable coincide con tu búsqueda.",
    varGroups: {
      yourDetails: "Tus datos",
      prospectInfo: "Info del prospecto",
      prospectCompany: "Empresa del prospecto",
      activity: "Actividad",
      other: "Otros",
    } as Record<string, string>,
    sendVia: () => `Enviar`,
    collapseList: "Ocultar lista",
    expandList: "Mostrar lista",
    showProfile: "Mostrar panel de perfil",
    hideProfile: "Ocultar panel de perfil",
    draftReady: "Kai redactó una respuesta — revísala y envía.",
    scheduledFor: (d: string) => `Respuesta programada para ${d}`,
    cancelSchedule: "Cancelar",
    recordVoice: "Mensaje de voz",
    recording: "Grabando",
    stopAndSend: "Detener y enviar",
    sentScheduled: "Respuesta programada enviada",
    scheduleCancelled: "Respuesta programada cancelada",
    sendLater: "Enviar más tarde",
    scheduleSend: "Programar envío",
    inOneHour: "En 1 hora",
    tomorrowMorning: "Mañana, 8:00",
    mondayMorning: "Lunes, 8:00",
    pickDateTime: "Elegir fecha y hora…",
    scheduleTitle: "Programar esta respuesta",
    scheduleWhen: "Enviar el",
    scheduleConfirm: "Programar",
    scheduledToast: (d: string) => `Respuesta programada para ${d}`,
    bold: "Negrita",
    italic: "Cursiva",
    draftReadyTag: "Borrador listo",
  },
  it: {
    inbox: "Posta in arrivo",
    drafts: "Bozze IA",
    unread: "Non lette",
    needs_reply: "Da rispondere",
    myTasks: "Le mie attività",
    scheduled: "Programmate",
    sent: "Inviate",
    archivedFolder: "Archiviate",
    expandFolders: "Espandi cartelle",
    collapseFolders: "Comprimi cartelle",
    tags: "Risultati",
    search: "Cerca prospect, aziende…",
    filters: "Filtri",
    channel: "Canale",
    allChannels: "Tutti i canali",
    email: "Email",
    linkedin: "LinkedIn",
    unreadOnly: "Solo non lette",
    country: "Paese",
    allCountries: "Tutti i paesi",
    recency: "Ultimo messaggio",
    recencyAny: "Qualsiasi momento",
    recency24h: "Ultime 24 ore",
    recency7d: "Ultimi 7 giorni",
    recency30d: "Ultimi 30 giorni",
    moreFilters: "Altri filtri…",
    clearFilters: "Azzera filtri",
    empty: "Qui non c'è nulla",
    emptyHint: "Le nuove conversazioni appariranno qui.",
    backToInbox: "Indietro",
    createTask: "Crea attività",
    editTask: "Modifica attività",
    autoReply: "Risposta automatica IA",
    autoReplyEnabled: (name: string) => `Risposta automatica IA attivata per ${name}`,
    autoReplyDisabled: "Risposta automatica IA disattivata",
    bulkSelected: (n: number) => `${n} selezionate`,
    clearSelection: "Deseleziona",
    replyTo: (name: string) => `Rispondi a ${name}…`,
    via: "via",
    send: "Invia",
    sendNow: "Invia ora",
    replySent: (name: string) => `Risposta inviata a ${name}`,
    selectConversation: "Seleziona una conversazione",
    selectConversationHint: "Scegli un thread per leggere e rispondere.",
    markRead: "Segna come letta",
    markUnread: "Segna come non letta",
    assign: "Assegna responsabile",
    assignedTo: (name: string) => `Responsabile: ${name}`,
    unassign: "Rimuovi responsabile",
    archive: "Archivia",
    unarchive: "Sposta nella posta in arrivo",
    delete: "Elimina",
    deleteTitle: "Eliminare la conversazione?",
    deleteDesc: "Questo elimina il thread in modo permanente. Non si può annullare.",
    deleteConfirm: "Elimina",
    deleted: "Conversazione eliminata",
    archived: "Conversazione archiviata",
    assignedToast: (name: string) => `Responsabile impostato: ${name}`,
    templates: "Modelli",
    noTemplates: "Ancora nessun modello",
    translate: "Traduci",
    showOriginal: "Mostra originale",
    translatedFrom: (lang: string) => `Tradotto da ${lang}`,
    writeIn: (flag: string, lang: string) => `Scrivi in ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Bozza tradotta in ${lang}`,
    more: "Altro",
    setStatus: "Imposta risultato",
    clearStatus: "Rimuovi risultato",
    statusToast: (label: string) => `Risultato impostato: ${label}`,
    statusClearedToast: "Risultato rimosso",
    autoTaggedAs: "Risultato modificato:",
    aiGenerated: "Generato dall'IA",
    newDivider: "Nuovo",
    replyAs: "Rispondi come",
    from: "da",
    kaiDraft: "Bozza di Kai",
    generate: "Genera bozza",
    regenerate: "Rigenera",
    tone: "Tono",
    toneFormal: "Formale",
    toneFriendly: "Amichevole",
    toneProfessional: "Professionale",
    toneConcise: "Conciso",
    length: "Lunghezza",
    shorter: "Più breve",
    longer: "Più lungo",
    refined: (label: string) => `Riscritto — ${label.toLowerCase()}`,
    personalize: "+ Variabili",
    regenTitle: "Rigenera con…",
    regenLengthNormal: "Normale",
    regenLanguage: "Lingua",
    regenInstructions: "Istruzioni aggiuntive (facoltativo)",
    regenInstructionsPlaceholder: "es. menziona il nostro prossimo webinar…",
    regenCancel: "Annulla",
    regenerated: "Bozza rigenerata",
    varsSearchPlaceholder: "Cerca variabili…",
    personalizedVariable: "Variabile personalizzata",
    personalizedVariablePlaceholder: "es. un commento amichevole sul loro recente traguardo",
    varsEmpty: "Nessuna variabile corrisponde alla tua ricerca.",
    varGroups: {
      yourDetails: "I tuoi dati",
      prospectInfo: "Info sul prospect",
      prospectCompany: "Azienda del prospect",
      activity: "Attività",
      other: "Altro",
    } as Record<string, string>,
    sendVia: () => `Invia`,
    collapseList: "Nascondi elenco",
    expandList: "Mostra elenco",
    showProfile: "Mostra pannello profilo",
    hideProfile: "Nascondi pannello profilo",
    draftReady: "Kai ha preparato una risposta — controllala e inviala.",
    scheduledFor: (d: string) => `Risposta programmata per ${d}`,
    cancelSchedule: "Annulla",
    recordVoice: "Messaggio vocale",
    recording: "Registrazione",
    stopAndSend: "Interrompi e invia",
    sentScheduled: "Risposta programmata inviata",
    scheduleCancelled: "Risposta programmata annullata",
    sendLater: "Invia più tardi",
    scheduleSend: "Programma invio",
    inOneHour: "Tra 1 ora",
    tomorrowMorning: "Domani, 8:00",
    mondayMorning: "Lunedì, 8:00",
    pickDateTime: "Scegli data e ora…",
    scheduleTitle: "Programma questa risposta",
    scheduleWhen: "Invia il",
    scheduleConfirm: "Programma",
    scheduledToast: (d: string) => `Risposta programmata per ${d}`,
    bold: "Grassetto",
    italic: "Corsivo",
    draftReadyTag: "Bozza pronta",
  },
  fr: {
    inbox: "Boîte de réception",
    drafts: "Brouillons IA",
    unread: "Non lues",
    needs_reply: "À répondre",
    myTasks: "Mes tâches",
    scheduled: "Programmées",
    sent: "Envoyées",
    archivedFolder: "Archivées",
    expandFolders: "Développer les dossiers",
    collapseFolders: "Réduire les dossiers",
    tags: "Résultats",
    search: "Rechercher des prospects, entreprises…",
    filters: "Filtres",
    channel: "Canal",
    allChannels: "Tous les canaux",
    email: "E-mail",
    linkedin: "LinkedIn",
    unreadOnly: "Non lues uniquement",
    country: "Pays",
    allCountries: "Tous les pays",
    recency: "Dernier message",
    recencyAny: "N'importe quand",
    recency24h: "Dernières 24 heures",
    recency7d: "7 derniers jours",
    recency30d: "30 derniers jours",
    moreFilters: "Plus de filtres…",
    clearFilters: "Effacer les filtres",
    empty: "Rien ici",
    emptyHint: "Les nouvelles conversations apparaîtront ici.",
    backToInbox: "Retour",
    createTask: "Créer une tâche",
    editTask: "Modifier la tâche",
    autoReply: "Réponse automatique IA",
    autoReplyEnabled: (name: string) => `Réponse automatique IA activée pour ${name}`,
    autoReplyDisabled: "Réponse automatique IA désactivée",
    bulkSelected: (n: number) => `${n} sélectionnées`,
    clearSelection: "Effacer",
    replyTo: (name: string) => `Répondre à ${name}…`,
    via: "via",
    send: "Envoyer",
    sendNow: "Envoyer maintenant",
    replySent: (name: string) => `Réponse envoyée à ${name}`,
    selectConversation: "Sélectionnez une conversation",
    selectConversationHint: "Choisissez une conversation pour la lire et y répondre.",
    markRead: "Marquer comme lue",
    markUnread: "Marquer comme non lue",
    assign: "Attribuer un responsable",
    assignedTo: (name: string) => `Responsable : ${name}`,
    unassign: "Retirer le responsable",
    archive: "Archiver",
    unarchive: "Déplacer vers la boîte de réception",
    delete: "Supprimer",
    deleteTitle: "Supprimer la conversation ?",
    deleteDesc: "Le fil sera définitivement supprimé. Cette action est irréversible.",
    deleteConfirm: "Supprimer",
    deleted: "Conversation supprimée",
    archived: "Conversation archivée",
    assignedToast: (name: string) => `Responsable défini : ${name}`,
    templates: "Modèles",
    noTemplates: "Aucun modèle pour l'instant",
    translate: "Traduire",
    showOriginal: "Afficher l'original",
    translatedFrom: (lang: string) => `Traduit depuis ${lang}`,
    writeIn: (flag: string, lang: string) => `Écrire en ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Brouillon traduit en ${lang}`,
    more: "Plus",
    setStatus: "Définir le résultat",
    clearStatus: "Effacer le résultat",
    statusToast: (label: string) => `Résultat défini : ${label}`,
    statusClearedToast: "Résultat effacé",
    autoTaggedAs: "Résultat modifié :",
    aiGenerated: "Généré par IA",
    newDivider: "Nouveau",
    replyAs: "Répondre en tant que",
    from: "via",
    kaiDraft: "Brouillon de Kai",
    generate: "Générer un brouillon",
    regenerate: "Régénérer",
    tone: "Ton",
    toneFormal: "Formel",
    toneFriendly: "Amical",
    toneProfessional: "Professionnel",
    toneConcise: "Concis",
    length: "Longueur",
    shorter: "Plus court",
    longer: "Plus long",
    refined: (label: string) => `Réécrit — ${label.toLowerCase()}`,
    personalize: "+ Variables",
    regenTitle: "Régénérer avec…",
    regenLengthNormal: "Normal",
    regenLanguage: "Langue",
    regenInstructions: "Instructions supplémentaires (facultatif)",
    regenInstructionsPlaceholder: "ex. mentionnez notre prochain webinaire…",
    regenCancel: "Annuler",
    regenerated: "Brouillon régénéré",
    varsSearchPlaceholder: "Rechercher des variables…",
    personalizedVariable: "Variable personnalisée",
    personalizedVariablePlaceholder: "ex. un commentaire sympathique sur leur récente réussite",
    varsEmpty: "Aucune variable ne correspond à votre recherche.",
    varGroups: {
      yourDetails: "Vos informations",
      prospectInfo: "Infos du prospect",
      prospectCompany: "Entreprise du prospect",
      activity: "Activité",
      other: "Autre",
    } as Record<string, string>,
    sendVia: () => `Envoyer`,
    collapseList: "Masquer la liste",
    expandList: "Afficher la liste",
    showProfile: "Afficher le panneau de profil",
    hideProfile: "Masquer le panneau de profil",
    draftReady: "Kai a rédigé une réponse — relisez-la et envoyez.",
    scheduledFor: (d: string) => `Réponse programmée pour ${d}`,
    cancelSchedule: "Annuler",
    recordVoice: "Message vocal",
    recording: "Enregistrement",
    stopAndSend: "Arrêter et envoyer",
    sentScheduled: "Réponse programmée envoyée",
    scheduleCancelled: "Réponse programmée annulée",
    sendLater: "Envoyer plus tard",
    scheduleSend: "Programmer l'envoi",
    inOneHour: "Dans 1 heure",
    tomorrowMorning: "Demain, 8h00",
    mondayMorning: "Lundi, 8h00",
    pickDateTime: "Choisir la date et l'heure…",
    scheduleTitle: "Programmer cette réponse",
    scheduleWhen: "Envoyer le",
    scheduleConfirm: "Programmer",
    scheduledToast: (d: string) => `Réponse programmée pour ${d}`,
    bold: "Gras",
    italic: "Italique",
    draftReadyTag: "Brouillon prêt",
  },
  de: {
    inbox: "Posteingang",
    drafts: "KI-Entwürfe",
    unread: "Ungelesen",
    needs_reply: "Zu beantworten",
    myTasks: "Meine Aufgaben",
    scheduled: "Geplant",
    sent: "Gesendet",
    archivedFolder: "Archiviert",
    expandFolders: "Ordner ausklappen",
    collapseFolders: "Ordner einklappen",
    tags: "Ergebnisse",
    search: "Prospects, Unternehmen suchen…",
    filters: "Filter",
    channel: "Kanal",
    allChannels: "Alle Kanäle",
    email: "E-Mail",
    linkedin: "LinkedIn",
    unreadOnly: "Nur ungelesene",
    country: "Land",
    allCountries: "Alle Länder",
    recency: "Letzte Nachricht",
    recencyAny: "Beliebig",
    recency24h: "Letzte 24 Stunden",
    recency7d: "Letzte 7 Tage",
    recency30d: "Letzte 30 Tage",
    moreFilters: "Weitere Filter…",
    clearFilters: "Filter zurücksetzen",
    empty: "Hier ist nichts",
    emptyHint: "Neue Unterhaltungen erscheinen hier.",
    backToInbox: "Zurück",
    createTask: "Aufgabe erstellen",
    editTask: "Aufgabe bearbeiten",
    autoReply: "Automatische KI-Antwort",
    autoReplyEnabled: (name: string) => `Automatische KI-Antwort für ${name} aktiviert`,
    autoReplyDisabled: "Automatische KI-Antwort deaktiviert",
    bulkSelected: (n: number) => `${n} ausgewählt`,
    clearSelection: "Aufheben",
    replyTo: (name: string) => `Antwort an ${name}…`,
    via: "über",
    send: "Senden",
    sendNow: "Jetzt senden",
    replySent: (name: string) => `Antwort an ${name} gesendet`,
    selectConversation: "Wähle eine Unterhaltung",
    selectConversationHint: "Wähle einen Thread zum Lesen und Antworten.",
    markRead: "Als gelesen markieren",
    markUnread: "Als ungelesen markieren",
    assign: "Verantwortlichen zuweisen",
    assignedTo: (name: string) => `Verantwortlich: ${name}`,
    unassign: "Verantwortlichen entfernen",
    archive: "Archivieren",
    unarchive: "In den Posteingang verschieben",
    delete: "Löschen",
    deleteTitle: "Unterhaltung löschen?",
    deleteDesc: "Der Thread wird dauerhaft gelöscht. Das lässt sich nicht rückgängig machen.",
    deleteConfirm: "Löschen",
    deleted: "Unterhaltung gelöscht",
    archived: "Unterhaltung archiviert",
    assignedToast: (name: string) => `Verantwortlich festgelegt: ${name}`,
    templates: "Vorlagen",
    noTemplates: "Noch keine Vorlagen",
    translate: "Übersetzen",
    showOriginal: "Original anzeigen",
    translatedFrom: (lang: string) => `Übersetzt aus ${lang}`,
    writeIn: (flag: string, lang: string) => `Auf ${flag} ${lang} schreiben`,
    draftTranslated: (lang: string) => `Entwurf in ${lang} übersetzt`,
    more: "Mehr",
    setStatus: "Ergebnis festlegen",
    clearStatus: "Ergebnis entfernen",
    statusToast: (label: string) => `Ergebnis festgelegt: ${label}`,
    statusClearedToast: "Ergebnis entfernt",
    autoTaggedAs: "Ergebnis geändert:",
    aiGenerated: "KI-generiert",
    newDivider: "Neu",
    replyAs: "Antworten als",
    from: "per",
    kaiDraft: "Kai-Entwurf",
    generate: "Entwurf generieren",
    regenerate: "Neu generieren",
    tone: "Ton",
    toneFormal: "Formell",
    toneFriendly: "Freundlich",
    toneProfessional: "Professionell",
    toneConcise: "Prägnant",
    length: "Länge",
    shorter: "Kürzer",
    longer: "Länger",
    refined: (label: string) => `Umgeschrieben — ${label.toLowerCase()}`,
    personalize: "+ Variablen",
    regenTitle: "Neu generieren mit…",
    regenLengthNormal: "Normal",
    regenLanguage: "Sprache",
    regenInstructions: "Zusätzliche Anweisungen (optional)",
    regenInstructionsPlaceholder: "z. B. erwähne unser kommendes Webinar…",
    regenCancel: "Abbrechen",
    regenerated: "Entwurf neu generiert",
    varsSearchPlaceholder: "Variablen suchen…",
    personalizedVariable: "Personalisierte Variable",
    personalizedVariablePlaceholder: "z. B. ein freundlicher Kommentar zu ihrem jüngsten Erfolg",
    varsEmpty: "Keine Variablen entsprechen deiner Suche.",
    varGroups: {
      yourDetails: "Deine Angaben",
      prospectInfo: "Prospect-Infos",
      prospectCompany: "Unternehmen des Prospects",
      activity: "Aktivität",
      other: "Sonstiges",
    } as Record<string, string>,
    sendVia: () => `Senden`,
    collapseList: "Liste ausblenden",
    expandList: "Liste anzeigen",
    showProfile: "Profilbereich anzeigen",
    hideProfile: "Profilbereich ausblenden",
    draftReady: "Kai hat eine Antwort entworfen — prüfen und senden.",
    scheduledFor: (d: string) => `Antwort geplant für ${d}`,
    cancelSchedule: "Abbrechen",
    recordVoice: "Sprachnachricht",
    recording: "Aufnahme",
    stopAndSend: "Stoppen & senden",
    sentScheduled: "Geplante Antwort gesendet",
    scheduleCancelled: "Geplante Antwort abgebrochen",
    sendLater: "Später senden",
    scheduleSend: "Senden planen",
    inOneHour: "In 1 Stunde",
    tomorrowMorning: "Morgen, 8:00 Uhr",
    mondayMorning: "Montag, 8:00 Uhr",
    pickDateTime: "Datum & Uhrzeit wählen…",
    scheduleTitle: "Diese Antwort planen",
    scheduleWhen: "Senden am",
    scheduleConfirm: "Planen",
    scheduledToast: (d: string) => `Antwort geplant für ${d}`,
    bold: "Fett",
    italic: "Kursiv",
    draftReadyTag: "Entwurf bereit",
  },
  pt: {
    inbox: "Caixa de entrada",
    drafts: "Rascunhos de IA",
    unread: "Por ler",
    needs_reply: "Por responder",
    myTasks: "As minhas tarefas",
    scheduled: "Agendadas",
    sent: "Enviadas",
    archivedFolder: "Arquivadas",
    expandFolders: "Expandir pastas",
    collapseFolders: "Recolher pastas",
    tags: "Resultados",
    search: "Pesquisar prospects, empresas…",
    filters: "Filtros",
    channel: "Canal",
    allChannels: "Todos os canais",
    email: "Email",
    linkedin: "LinkedIn",
    unreadOnly: "Apenas por ler",
    country: "País",
    allCountries: "Todos os países",
    recency: "Última mensagem",
    recencyAny: "Qualquer altura",
    recency24h: "Últimas 24 horas",
    recency7d: "Últimos 7 dias",
    recency30d: "Últimos 30 dias",
    moreFilters: "Mais filtros…",
    clearFilters: "Limpar filtros",
    empty: "Nada por aqui",
    emptyHint: "As novas conversas vão aparecer aqui.",
    backToInbox: "Voltar",
    createTask: "Criar tarefa",
    editTask: "Editar tarefa",
    autoReply: "Resposta automática com IA",
    autoReplyEnabled: (name: string) => `Resposta automática com IA ativada para ${name}`,
    autoReplyDisabled: "Resposta automática com IA desativada",
    bulkSelected: (n: number) => `${n} selecionadas`,
    clearSelection: "Limpar",
    replyTo: (name: string) => `Responder a ${name}…`,
    via: "por",
    send: "Enviar",
    sendNow: "Enviar agora",
    replySent: (name: string) => `Resposta enviada a ${name}`,
    selectConversation: "Selecione uma conversa",
    selectConversationHint: "Escolha uma conversa para ler e responder.",
    markRead: "Marcar como lida",
    markUnread: "Marcar como não lida",
    assign: "Atribuir responsável",
    assignedTo: (name: string) => `Responsável: ${name}`,
    unassign: "Remover responsável",
    archive: "Arquivar",
    unarchive: "Mover para a caixa de entrada",
    delete: "Eliminar",
    deleteTitle: "Eliminar conversa?",
    deleteDesc: "Isto elimina a conversa de forma permanente. Não é possível anular.",
    deleteConfirm: "Eliminar",
    deleted: "Conversa eliminada",
    archived: "Conversa arquivada",
    assignedToast: (name: string) => `Responsável definido: ${name}`,
    templates: "Modelos",
    noTemplates: "Ainda não há modelos",
    translate: "Traduzir",
    showOriginal: "Ver original",
    translatedFrom: (lang: string) => `Traduzido de ${lang}`,
    writeIn: (flag: string, lang: string) => `Escrever em ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Rascunho traduzido para ${lang}`,
    more: "Mais",
    setStatus: "Definir resultado",
    clearStatus: "Remover resultado",
    statusToast: (label: string) => `Resultado definido: ${label}`,
    statusClearedToast: "Resultado removido",
    autoTaggedAs: "Resultado alterado:",
    aiGenerated: "Gerado por IA",
    newDivider: "Novo",
    replyAs: "Responder como",
    from: "por",
    kaiDraft: "Rascunho do Kai",
    generate: "Gerar rascunho",
    regenerate: "Regenerar",
    tone: "Tom",
    toneFormal: "Formal",
    toneFriendly: "Amigável",
    toneProfessional: "Profissional",
    toneConcise: "Conciso",
    length: "Tamanho",
    shorter: "Mais curto",
    longer: "Mais longo",
    refined: (label: string) => `Reescrito — ${label.toLowerCase()}`,
    personalize: "+ Variáveis",
    regenTitle: "Regenerar com…",
    regenLengthNormal: "Normal",
    regenLanguage: "Idioma",
    regenInstructions: "Instruções adicionais (opcional)",
    regenInstructionsPlaceholder: "p. ex. mencione o nosso próximo webinar…",
    regenCancel: "Cancelar",
    regenerated: "Rascunho regenerado",
    varsSearchPlaceholder: "Pesquisar variáveis…",
    personalizedVariable: "Variável personalizada",
    personalizedVariablePlaceholder: "ex. um comentário simpático sobre a conquista recente deles",
    varsEmpty: "Nenhuma variável corresponde à pesquisa.",
    varGroups: {
      yourDetails: "Os seus dados",
      prospectInfo: "Informações do prospect",
      prospectCompany: "Empresa do prospect",
      activity: "Atividade",
      other: "Outros",
    } as Record<string, string>,
    sendVia: () => `Enviar`,
    collapseList: "Ocultar lista",
    expandList: "Mostrar lista",
    showProfile: "Mostrar painel de perfil",
    hideProfile: "Ocultar painel de perfil",
    draftReady: "O Kai redigiu uma resposta — reveja e envie.",
    scheduledFor: (d: string) => `Resposta agendada para ${d}`,
    cancelSchedule: "Cancelar",
    recordVoice: "Mensagem de voz",
    recording: "A gravar",
    stopAndSend: "Parar e enviar",
    sentScheduled: "Resposta agendada enviada",
    scheduleCancelled: "Resposta agendada cancelada",
    sendLater: "Enviar mais tarde",
    scheduleSend: "Agendar envio",
    inOneHour: "Daqui a 1 hora",
    tomorrowMorning: "Amanhã, 8:00",
    mondayMorning: "Segunda-feira, 8:00",
    pickDateTime: "Escolher data e hora…",
    scheduleTitle: "Agendar esta resposta",
    scheduleWhen: "Enviar em",
    scheduleConfirm: "Agendar",
    scheduledToast: (d: string) => `Resposta agendada para ${d}`,
    bold: "Negrito",
    italic: "Itálico",
    draftReadyTag: "Rascunho pronto",
  },
  pt_BR: {
    inbox: "Caixa de entrada",
    drafts: "Rascunhos de IA",
    unread: "Não lidas",
    needs_reply: "Para responder",
    myTasks: "Minhas tarefas",
    scheduled: "Agendadas",
    sent: "Enviadas",
    archivedFolder: "Arquivadas",
    expandFolders: "Expandir pastas",
    collapseFolders: "Recolher pastas",
    tags: "Resultados",
    search: "Buscar prospects, empresas…",
    filters: "Filtros",
    channel: "Canal",
    allChannels: "Todos os canais",
    email: "E-mail",
    linkedin: "LinkedIn",
    unreadOnly: "Apenas não lidas",
    country: "País",
    allCountries: "Todos os países",
    recency: "Última mensagem",
    recencyAny: "Qualquer momento",
    recency24h: "Últimas 24 horas",
    recency7d: "Últimos 7 dias",
    recency30d: "Últimos 30 dias",
    moreFilters: "Mais filtros…",
    clearFilters: "Limpar filtros",
    empty: "Nada por aqui",
    emptyHint: "Novas conversas vão aparecer aqui.",
    backToInbox: "Voltar",
    createTask: "Criar tarefa",
    editTask: "Editar tarefa",
    autoReply: "Resposta automática com IA",
    autoReplyEnabled: (name: string) => `Resposta automática com IA ativada para ${name}`,
    autoReplyDisabled: "Resposta automática com IA desativada",
    bulkSelected: (n: number) => `${n} selecionadas`,
    clearSelection: "Limpar",
    replyTo: (name: string) => `Responder para ${name}…`,
    via: "por",
    send: "Enviar",
    sendNow: "Enviar agora",
    replySent: (name: string) => `Resposta enviada para ${name}`,
    selectConversation: "Selecione uma conversa",
    selectConversationHint: "Escolha uma conversa para ler e responder.",
    markRead: "Marcar como lida",
    markUnread: "Marcar como não lida",
    assign: "Atribuir responsável",
    assignedTo: (name: string) => `Responsável: ${name}`,
    unassign: "Remover responsável",
    archive: "Arquivar",
    unarchive: "Mover para a caixa de entrada",
    delete: "Excluir",
    deleteTitle: "Excluir conversa?",
    deleteDesc: "Isso exclui a conversa permanentemente. Essa ação não pode ser desfeita.",
    deleteConfirm: "Excluir",
    deleted: "Conversa excluída",
    archived: "Conversa arquivada",
    assignedToast: (name: string) => `Responsável definido: ${name}`,
    templates: "Modelos",
    noTemplates: "Ainda não há modelos",
    translate: "Traduzir",
    showOriginal: "Ver original",
    translatedFrom: (lang: string) => `Traduzido de ${lang}`,
    writeIn: (flag: string, lang: string) => `Escrever em ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Rascunho traduzido para ${lang}`,
    more: "Mais",
    setStatus: "Definir resultado",
    clearStatus: "Remover resultado",
    statusToast: (label: string) => `Resultado definido: ${label}`,
    statusClearedToast: "Resultado removido",
    autoTaggedAs: "Resultado alterado:",
    aiGenerated: "Gerado por IA",
    newDivider: "Novo",
    replyAs: "Responder como",
    from: "por",
    kaiDraft: "Rascunho do Kai",
    generate: "Gerar rascunho",
    regenerate: "Gerar novamente",
    tone: "Tom",
    toneFormal: "Formal",
    toneFriendly: "Amigável",
    toneProfessional: "Profissional",
    toneConcise: "Conciso",
    length: "Tamanho",
    shorter: "Mais curto",
    longer: "Mais longo",
    refined: (label: string) => `Reescrito — ${label.toLowerCase()}`,
    personalize: "+ Variáveis",
    regenTitle: "Gerar novamente com…",
    regenLengthNormal: "Normal",
    regenLanguage: "Idioma",
    regenInstructions: "Instruções adicionais (opcional)",
    regenInstructionsPlaceholder: "ex.: mencione nosso próximo webinar…",
    regenCancel: "Cancelar",
    regenerated: "Rascunho gerado novamente",
    varsSearchPlaceholder: "Buscar variáveis…",
    personalizedVariable: "Variável personalizada",
    personalizedVariablePlaceholder: "ex. um comentário simpático sobre a conquista recente deles",
    varsEmpty: "Nenhuma variável corresponde à sua busca.",
    varGroups: {
      yourDetails: "Seus dados",
      prospectInfo: "Informações do prospect",
      prospectCompany: "Empresa do prospect",
      activity: "Atividade",
      other: "Outros",
    } as Record<string, string>,
    sendVia: () => `Enviar`,
    collapseList: "Ocultar lista",
    expandList: "Mostrar lista",
    showProfile: "Mostrar painel de perfil",
    hideProfile: "Ocultar painel de perfil",
    draftReady: "O Kai redigiu uma resposta — revise e envie.",
    scheduledFor: (d: string) => `Resposta agendada para ${d}`,
    cancelSchedule: "Cancelar",
    recordVoice: "Mensagem de voz",
    recording: "Gravando",
    stopAndSend: "Parar e enviar",
    sentScheduled: "Resposta agendada enviada",
    scheduleCancelled: "Resposta agendada cancelada",
    sendLater: "Enviar mais tarde",
    scheduleSend: "Agendar envio",
    inOneHour: "Em 1 hora",
    tomorrowMorning: "Amanhã, 8:00",
    mondayMorning: "Segunda-feira, 8:00",
    pickDateTime: "Escolher data e hora…",
    scheduleTitle: "Agendar esta resposta",
    scheduleWhen: "Enviar em",
    scheduleConfirm: "Agendar",
    scheduledToast: (d: string) => `Resposta agendada para ${d}`,
    bold: "Negrito",
    italic: "Itálico",
    draftReadyTag: "Rascunho pronto",
  },
} as const

type Copy = (typeof COPY)[Locale]

type Folder =
  | "inbox"
  | "drafts"
  | "unread"
  | "needs_reply"
  | "my_tasks"
  | "scheduled"
  | "sent"
  | "archived"

type FolderLabelKey =
  | "inbox"
  | "drafts"
  | "unread"
  | "needs_reply"
  | "myTasks"
  | "scheduled"
  | "sent"
  | "archivedFolder"


const FOLDERS: { id: Folder; key: FolderLabelKey; icon: typeof InboxIcon }[] = [
  { id: "inbox", key: "inbox", icon: InboxIcon },
  { id: "drafts", key: "drafts", icon: Wand2 },
  { id: "unread", key: "unread", icon: MailOpen },
  { id: "needs_reply", key: "needs_reply", icon: Reply },
  { id: "scheduled", key: "scheduled", icon: CalendarClock },
  { id: "sent", key: "sent", icon: Send },
  { id: "my_tasks", key: "myTasks", icon: ListTodo },
  { id: "archived", key: "archivedFolder", icon: Archive },
]

const EVENT_META: Record<
  ConvEventKind,
  { en: string; es: string; icon: typeof InboxIcon }
> = {
  connection: { en: "Connection accepted", es: "Conexión aceptada", icon: UserCheck },
  like: { en: "Liked their post", es: "Le gustó su publicación", icon: ThumbsUp },
  view: { en: "Viewed their profile", es: "Vio su perfil", icon: Eye },
  open: { en: "Opened your email", es: "Abrió tu correo", icon: MailOpen },
  click: { en: "Clicked your link", es: "Hizo clic en tu enlace", icon: MousePointerClick },
  tag: { en: "Auto-tagged as", es: "Etiquetado como", icon: Tag },
  step: { en: "Sequence step sent", es: "Paso de secuencia enviado", icon: Send },
  task: { en: "Task update", es: "Actualización de tarea", icon: ListTodo },
  scheduled_reply: { en: "Reply scheduled", es: "Respuesta programada", icon: CalendarClock },
  next_step: { en: "Next", es: "Siguiente", icon: Clock },
}

// Campaign sequence steps — same channel vocabulary as the sequence builder
// (email, LinkedIn, WhatsApp, human call, AI/agentic call), rendered here as
// quiet system rows in the conversation timeline.
const STEP_META: Record<
  SequenceChannelType,
  { en: string; es: string; icon: React.ComponentType<{ className?: string }> }
> = {
  email: { en: "Email step sent", es: "Paso de email enviado", icon: Mail },
  linkedin: { en: "LinkedIn message sent", es: "Mensaje de LinkedIn enviado", icon: LinkedinIcon },
  whatsapp: { en: "WhatsApp message sent", es: "Mensaje de WhatsApp enviado", icon: MessageCircle },
  call: { en: "Call logged", es: "Llamada registrada", icon: Phone },
  ai_call: { en: "AI call placed", es: "Llamada de IA realizada", icon: Sparkles },
  wait: { en: "Sequence step", es: "Paso de secuencia", icon: Clock },
}

// Labels the future "next sequence step" preview by the campaign step's own
// channel vocabulary (the Campaign model, not the sequence-builder prototype's).
const NEXT_STEP_CHANNEL_LABEL: Record<StepChannel, { en: string; es: string }> = {
  email: { en: "Email", es: "Correo" },
  whatsapp: { en: "WhatsApp", es: "WhatsApp" },
  call: { en: "Phone call", es: "Llamada" },
  ai_call: { en: "AI Voice Call", es: "Llamada de voz IA" },
  linkedin_message: { en: "LinkedIn message", es: "Mensaje de LinkedIn" },
  linkedin_dm: { en: "LinkedIn DM", es: "Mensaje directo de LinkedIn" },
  linkedin_inmail: { en: "LinkedIn InMail", es: "InMail de LinkedIn" },
  manual: { en: "Manual task", es: "Tarea manual" },
}

const TASK_STATE_META: Record<
  TaskEventState,
  { en: string; es: string; icon: typeof InboxIcon }
> = {
  todo: { en: "Task", es: "Tarea", icon: Circle },
  reminder: { en: "Task reminder", es: "Recordatorio de tarea", icon: AlarmClock },
  done: { en: "Task completed", es: "Tarea completada", icon: CheckCircle2 },
}

const TASK_TYPE_ICON: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  linkedin: LinkedinIcon,
  manual: ClipboardList,
  follow_up: CornerUpRight,
}

// Derive a coarse display state for a task in the conversation timeline —
// Task itself only tracks done/not-done, so "reminder" is anything due soon.
function taskEventState(t: Task): TaskEventState {
  if (t.done) return "done"
  const dueInMs = new Date(t.dueDate).getTime() - Date.now()
  return dueInMs < 2 * 24 * 3600 * 1000 ? "reminder" : "todo"
}

type View = { kind: "folder"; id: Folder } | { kind: "tag"; id: ConvStatus }

function lastMessage(conv: Conversation) {
  return conv.messages[conv.messages.length - 1]
}
function isScheduled(conv: Conversation): boolean {
  return Boolean(conv.scheduledAt && new Date(conv.scheduledAt).getTime() > Date.now())
}
function isFutureTimestamp(iso: string): boolean {
  return new Date(iso).getTime() > Date.now()
}
function awaitingReply(conv: Conversation): boolean {
  return lastMessage(conv)?.direction === "inbound"
}
function hasReadyDraft(conv: Conversation): boolean {
  return Boolean(conv.aiDraft) && awaitingReply(conv) && !isScheduled(conv) && !conv.archived
}
// Read, but the ball is still in our court — distinct from "Unread" (haven't
// looked yet) and from archiving (marks the thread as done/handled).
function needsReply(conv: Conversation): boolean {
  return awaitingReply(conv) && conv.unread === 0 && !isScheduled(conv)
}

// The inbox's offline EN<->ES demo translator (lib/mock-translate.ts) only
// speaks two languages — it's a toy word-substitution engine, not a real MT
// service, so it isn't worth extending to the other 5 UI locales. Any UI
// locale besides Spanish just falls back to English, same as every other
// DICTS[locale] ?? en[key] fallback in the app.
function uiToChatLang(locale: Locale): ChatLang {
  return locale === "es" ? "es" : "en"
}

const ES_LOCATIONS = ["madrid", "barcelona", "valencia", "spain", "es", "méxico", "mexico", "bogotá", "santiago", "são paulo", "lima", "buenos aires"]
function defaultLang(p: Prospect | undefined): ChatLang {
  if (!p) return "en"
  const loc = p.location.toLowerCase()
  return ES_LOCATIONS.some((x) => loc.includes(x)) ? "es" : "en"
}

// The mock location strings ("San Francisco, CA", "London, UK") end in either
// a US state code or a country code — treat that trailing token as "country"
// for filtering purposes; there's no real geo taxonomy in this prototype.
function countryOf(location: string): string {
  const parts = location.split(",")
  return parts[parts.length - 1]?.trim() ?? location
}

type RecencyFilter = "any" | "24h" | "7d" | "30d"
const RECENCY_MS: Record<Exclude<RecencyFilter, "any">, number> = {
  "24h": 24 * 3600 * 1000,
  "7d": 7 * 24 * 3600 * 1000,
  "30d": 30 * 24 * 3600 * 1000,
}
function withinRecency(iso: string, filter: RecencyFilter): boolean {
  if (filter === "any") return true
  return Date.now() - new Date(iso).getTime() <= RECENCY_MS[filter]
}

function avatarColorFor(id: string): string {
  if (id === currentUser.id) return currentUser.avatarColor
  return getRep(id)?.avatarColor ?? "#7c3aed"
}

function snoozeUntilISO(hours: number): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString()
}

// 8:00 AM local time, `daysAhead` days from today (used for send scheduling).
function morningISO(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(8, 0, 0, 0)
  return d.toISOString()
}

// 8:00 AM local time on the next Monday (always at least one day out).
function nextMondayMorningISO(): string {
  const d = new Date()
  const add = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + add)
  d.setHours(8, 0, 0, 0)
  return d.toISOString()
}

// Format a Date as a `datetime-local` input value (local time, no zone).
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function StatusBadge({ status, locale }: { status: ConvStatus; locale: Locale }) {
  const m = STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        m.badge
      )}
    >
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {locale === "es" ? m.es : m.en}
    </span>
  )
}

// Mock voice-note bubble — play/pause just toggles state (no real audio) and
// a static, message-seeded waveform stands in for a real recording.
function VoiceMessageBubble({ durationSec, outbound }: { durationSec: number; outbound: boolean }) {
  const [playing, setPlaying] = React.useState(false)
  React.useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setPlaying(false), durationSec * 1000)
    return () => clearTimeout(t)
  }, [playing, durationSec])
  const bars = React.useMemo(
    () => Array.from({ length: 22 }, (_, i) => 5 + ((i * 37 + durationSec * 13) % 15)),
    [durationSec]
  )
  return (
    <div className="flex min-w-[170px] items-center gap-2">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          outbound ? "bg-primary-foreground/20" : "bg-background"
        )}
      >
        {playing ? <Pause className="size-3.5" /> : <Play className="ml-0.5 size-3.5" />}
      </button>
      <div className="flex h-6 flex-1 items-center gap-0.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-0.5 rounded-full",
              outbound ? "bg-primary-foreground/50" : "bg-muted-foreground/40",
              playing && "animate-pulse"
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-[10px] tabular-nums",
          outbound ? "text-primary-foreground/70" : "text-muted-foreground"
        )}
      >
        0:{String(durationSec).padStart(2, "0")}
      </span>
    </div>
  )
}

export default function Inbox() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const conversations = useConversations()
  const tasks = useTasks()
  const campaigns = useCampaigns()

  const [view, setView] = React.useState<View>({ kind: "folder", id: "inbox" })
  const [activeId, setActiveId] = React.useState<string | undefined>()
  const [showThreadMobile, setShowThreadMobile] = React.useState(false)
  const [shownTranslations, setShownTranslations] = React.useState<Set<string>>(new Set())
  const [toDelete, setToDelete] = React.useState<string | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | undefined>()
  const [query, setQuery] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<Channel | "all">("all")
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const [countryFilter, setCountryFilter] = React.useState<string>("all")
  const [recencyFilter, setRecencyFilter] = React.useState<RecencyFilter>("any")
  const [advancedFilters, setAdvancedFilters] = React.useState<ConversationFilters>(
    emptyConversationFilters()
  )
  const [filterDialogOpen, setFilterDialogOpen] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  // Focus mode: collapse the folder rail + conversation list to give the open
  // thread full width when reading/replying deep in a conversation.
  const [focused, setFocused] = React.useState(false)
  const [outcomesOpen, setOutcomesOpen] = React.useState(true)
  const [inboxOpen, setInboxOpen] = React.useState(true)
  // Prospect/company summary panel: defaults open (unlike focus mode) since
  // a context panel's job is to be glanceable while triaging, not to hide
  // chrome for reading one thread.
  const [profileOpen, setProfileOpen] = React.useState(true)

  const visible = conversations.filter((conv) => !conv.archived)

  // Open tasks assigned to the current user — backs the "My Tasks" folder,
  // which renders these directly as task rows rather than filtering
  // conversations.
  const myTaskRows = React.useMemo(
    () =>
      tasks
        .filter((t) => t.ownerId === currentUser.id && !t.done && !t.ignored)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [tasks]
  )
  const filteredTaskRows = React.useMemo(() => {
    if (!query.trim()) return myTaskRows
    const q = query.trim().toLowerCase()
    return myTaskRows.filter((t) => {
      const p = t.prospectId ? getProspect(t.prospectId) : undefined
      const hay = [t.title, p?.firstName, p?.lastName, p?.company]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return hay.includes(q)
    })
  }, [myTaskRows, query])

  const folderCount = React.useCallback(
    (id: Folder): number => {
      switch (id) {
        case "inbox":
          return visible.filter((x) => !isScheduled(x)).length
        case "drafts":
          return visible.filter(hasReadyDraft).length
        case "unread":
          return visible.filter((x) => x.unread > 0).length
        case "needs_reply":
          return visible.filter(needsReply).length
        case "my_tasks":
          return myTaskRows.length
        case "scheduled":
          return visible.filter(isScheduled).length
        case "sent":
          return visible.filter((x) => lastMessage(x)?.direction === "outbound").length
        case "archived":
          return conversations.filter((x) => x.archived).length
      }
    },
    [visible, conversations, myTaskRows]
  )

  const tagCounts = React.useMemo(() => {
    const map = {} as Record<ConvStatus, number>
    STATUS_ORDER.forEach((s) => (map[s] = 0))
    visible.forEach((x) => {
      if (x.status) map[x.status] += 1
    })
    return map
  }, [visible])

  const matchesSearch = React.useCallback(
    (conv: Conversation): boolean => {
      if (!query.trim()) return true
      const p = getProspect(conv.prospectId)
      const hay = [
        p?.firstName,
        p?.lastName,
        p?.company,
        p?.title,
        conv.subject,
        lastMessage(conv)?.body,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return hay.includes(query.trim().toLowerCase())
    },
    [query]
  )

  // Which campaign(s) a prospect is enrolled in, at any status — Conversation
  // has no direct campaignId, so this is the same enrollment lookup already
  // used above for the "next sequence step" timeline preview.
  const prospectCampaignIds = React.useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const campaign of campaigns) {
      for (const enrollment of campaignEnrollments[campaign.id] ?? []) {
        const set = map.get(enrollment.prospectId) ?? new Set<string>()
        set.add(campaign.id)
        map.set(enrollment.prospectId, set)
      }
    }
    return map
  }, [campaigns])

  const list = React.useMemo(() => {
    // The Archived folder is the one view that reaches past `visible` (which
    // excludes archived threads everywhere else) to show exactly what's archived.
    const source =
      view.kind === "folder" && view.id === "archived"
        ? conversations.filter((x) => x.archived)
        : visible
    const inView = source.filter((conv) => {
      if (view.kind === "tag") return conv.status === view.id
      switch (view.id) {
        case "inbox":
          return !isScheduled(conv)
        case "drafts":
          return hasReadyDraft(conv)
        case "unread":
          return conv.unread > 0
        case "needs_reply":
          return needsReply(conv)
        case "my_tasks":
          // This folder renders task rows directly (see the list-column
          // render below) rather than filtering conversations.
          return false
        case "scheduled":
          return isScheduled(conv)
        case "sent":
          return lastMessage(conv)?.direction === "outbound"
        case "archived":
          return true
      }
    })
    const filtered = inView.filter((conv) => {
      if (channelFilter !== "all" && conv.channel !== channelFilter) return false
      if (unreadOnly && conv.unread === 0) return false
      if (countryFilter !== "all" && countryOf(getProspect(conv.prospectId)?.location ?? "") !== countryFilter)
        return false
      if (!withinRecency(conv.lastMessageAt, recencyFilter)) return false
      if (advancedFilters.campaignIds.size > 0) {
        const ids = prospectCampaignIds.get(conv.prospectId)
        if (!ids || ![...advancedFilters.campaignIds].some((id) => ids.has(id))) return false
      }
      if (
        advancedFilters.outcomes.size > 0 &&
        (!conv.status || !advancedFilters.outcomes.has(conv.status))
      )
        return false
      if (
        advancedFilters.assigneeIds.size > 0 &&
        (!conv.assigneeId || !advancedFilters.assigneeIds.has(conv.assigneeId))
      )
        return false
      return matchesSearch(conv)
    })
    return filtered.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  }, [
    visible,
    conversations,
    view,
    channelFilter,
    unreadOnly,
    countryFilter,
    recencyFilter,
    advancedFilters,
    prospectCampaignIds,
    matchesSearch,
  ])

  const countryOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const conv of conversations) {
      const p = getProspect(conv.prospectId)
      if (p) set.add(countryOf(p.location))
    }
    return Array.from(set).sort()
  }, [conversations])

  const isMyTasksView = view.kind === "folder" && view.id === "my_tasks"
  const active = conversations.find((conv) => conv.id === activeId)
  // "My Tasks" doesn't read `list` for rendering (it renders task rows
  // instead), so a task's linked conversation is "in view" if it matches one
  // of the current task rows rather than the (intentionally empty) `list`.
  const activeInList =
    active &&
    (isMyTasksView
      ? myTaskRows.some((t) => t.prospectId === active.prospectId)
      : list.some((x) => x.id === active.id))
  // No conversation is open until the user explicitly picks one — opening a
  // thread marks it read, so we never auto-select on load or list changes.
  const effectiveActive = activeInList ? active : undefined
  const activeProspect = effectiveActive ? getProspect(effectiveActive.prospectId) : undefined
  const recipientLang: ChatLang =
    effectiveActive?.recipientLang ?? defaultLang(activeProspect)

  // Auto-collapse the app nav sidebar while a thread is open, and restore
  // whatever state it was in before when the thread closes or this page
  // unmounts. This reaches into a sibling component's state (AppSidebar),
  // so it's an effect rather than a derived render value.
  const threadOpen = Boolean(effectiveActive)
  const { collapsed, setCollapsed } = useSidebarCollapsed()

  const collapsedRef = React.useRef(collapsed)
  React.useEffect(() => {
    collapsedRef.current = collapsed
  }, [collapsed])
  // Read inside the collapsed-watcher effect below so that effect only
  // depends on `collapsed` itself — keying it on `threadOpen` too would
  // re-run it in the same commit as the thread-open effect, while
  // `collapsed` still held its pre-update value, and misfire as a "manual
  // override" before the requested update had even landed.
  const threadOpenRef = React.useRef(threadOpen)
  React.useEffect(() => {
    threadOpenRef.current = threadOpen
  }, [threadOpen])

  // What to restore to when the thread closes/unmounts. null = nothing
  // pending (no thread open, or the user manually overrode — see below).
  const restoreToRef = React.useRef<boolean | null>(null)
  // Distinguishes our own setCollapsed calls from the user's manual toggle.
  const lastCommandedRef = React.useRef<boolean | null>(null)

  React.useEffect(() => {
    if (threadOpen) {
      if (restoreToRef.current === null) {
        restoreToRef.current = collapsedRef.current
        if (!collapsedRef.current) {
          lastCommandedRef.current = true
          setCollapsed(true)
        }
      }
      return
    }
    if (restoreToRef.current !== null) {
      lastCommandedRef.current = restoreToRef.current
      setCollapsed(restoreToRef.current)
      restoreToRef.current = null
    }
  }, [threadOpen, setCollapsed])

  // A collapsed-state change we didn't just command ourselves, while a
  // thread is open, means the user manually toggled it — let it stick.
  React.useEffect(() => {
    if (lastCommandedRef.current === collapsed) {
      lastCommandedRef.current = null
      return
    }
    if (threadOpenRef.current) restoreToRef.current = null
  }, [collapsed])

  // Restore on unmount (navigating away from Inbox with a thread still open).
  React.useEffect(() => {
    return () => {
      if (restoreToRef.current !== null) setCollapsed(restoreToRef.current)
    }
  }, [setCollapsed])

  const viewTitle =
    view.kind === "tag"
      ? STATUS_META[view.id][locale === "es" ? "es" : "en"]
      : c[FOLDERS.find((f) => f.id === view.id)!.key]
  const viewCount = isMyTasksView ? filteredTaskRows.length : list.length
  const filtersActive =
    channelFilter !== "all" ||
    unreadOnly ||
    countryFilter !== "all" ||
    recencyFilter !== "any" ||
    countConversationFilters(advancedFilters) > 0

  // Selection doesn't carry over when the user switches folders/outcomes.
  const viewSig = `${view.kind}:${view.id}`
  const [selSig, setSelSig] = React.useState(viewSig)
  if (viewSig !== selSig) {
    setSelSig(viewSig)
    if (selectedIds.size > 0) setSelectedIds(new Set())
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function bulkSetOutcome(status: ConvStatus | undefined) {
    selectedIds.forEach((id) => conversationStore.setStatus(id, status))
    toast.success(
      status ? c.statusToast(STATUS_META[status][locale === "es" ? "es" : "en"]) : c.statusClearedToast
    )
    setSelectedIds(new Set())
  }
  function bulkMarkRead(read: boolean) {
    selectedIds.forEach((id) => (read ? conversationStore.markRead(id) : conversationStore.markUnread(id)))
    setSelectedIds(new Set())
  }
  function bulkArchive() {
    selectedIds.forEach((id) => conversationStore.archive(id))
    toast.success(c.archived)
    setSelectedIds(new Set())
  }
  function bulkUnarchive() {
    selectedIds.forEach((id) => conversationStore.unarchive(id))
    setSelectedIds(new Set())
  }
  const viewingArchived = view.kind === "folder" && view.id === "archived"

  function openConversation(id: string) {
    setActiveId(id)
    setShowThreadMobile(true)
    conversationStore.markRead(id)
  }
  // Selecting a task in "My Tasks" opens its linked conversation, same as
  // clicking a conversation row anywhere else — no separate task-detail view.
  function openTaskConversation(task: Task) {
    const conv = conversations.find((c) => c.prospectId === task.prospectId)
    if (conv) openConversation(conv.id)
  }
  function toggleTranslation(id: string) {
    setShownTranslations((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  // First unread inbound message → marks the "New" divider.
  const firstUnreadId = effectiveActive
    ? effectiveActive.messages.find((m) => m.direction === "inbound" && !m.read)?.id
    : undefined

  // Interleave messages + activity events by timestamp.
  const timeline = React.useMemo(() => {
    if (!effectiveActive) return []
    // Tasks linked to this prospect show up as timeline rows too, so the
    // "Create task" flow (Inbox header) is visible right where it was created.
    const taskEvents: ConvEvent[] = tasks
      .filter((t) => t.prospectId === effectiveActive.prospectId)
      .map((t) => ({
        id: `task_${t.id}`,
        kind: "task",
        label: t.title,
        timestamp: t.dueDate,
        taskState: taskEventState(t),
      }))

    // Anything that hasn't happened yet — a queued reply, or this prospect's
    // next not-yet-fired sequence step — reads as a future row in the same
    // timeline instead of living only in a header banner or another page.
    const futureEvents: ConvEvent[] = []
    if (isScheduled(effectiveActive) && effectiveActive.scheduledAt) {
      futureEvents.push({
        id: `scheduled_${effectiveActive.id}`,
        kind: "scheduled_reply",
        label: "",
        timestamp: effectiveActive.scheduledAt,
      })
    }
    for (const campaign of campaigns) {
      const enrollment = (campaignEnrollments[campaign.id] ?? []).find(
        (e) => e.prospectId === effectiveActive.prospectId && e.status === "active"
      )
      if (!enrollment) continue
      const nextStep = campaign.steps[enrollment.currentStep]
      if (!nextStep) break
      const dueAt = new Date(enrollment.lastTouch)
      dueAt.setDate(dueAt.getDate() + nextStep.delayDays)
      if (isFutureTimestamp(dueAt.toISOString())) {
        const chLabel = NEXT_STEP_CHANNEL_LABEL[nextStep.channel]
        futureEvents.push({
          id: `nextstep_${campaign.id}_${nextStep.id}`,
          kind: "next_step",
          label: locale === "es" ? chLabel.es : chLabel.en,
          timestamp: dueAt.toISOString(),
        })
      }
      break // one active enrollment is enough for a preview
    }

    const items: (
      | { type: "msg"; at: number; msg: Conversation["messages"][number] }
      | { type: "event"; at: number; ev: ConvEvent }
    )[] = [
      ...effectiveActive.messages.map((msg) => ({
        type: "msg" as const,
        at: new Date(msg.timestamp).getTime(),
        msg,
      })),
      ...[...(effectiveActive.events ?? []), ...taskEvents, ...futureEvents].map((ev) => ({
        type: "event" as const,
        at: new Date(ev.timestamp).getTime(),
        ev,
      })),
    ]
    return items.sort((a, b) => a.at - b.at)
  }, [effectiveActive, tasks, campaigns, locale])

  return (
    <div className="flex h-[calc(100svh-4rem)]">
      {/* Rail: folders + tags */}
      <aside
        className={cn(
          "hidden w-60 shrink-0 flex-col overflow-y-auto border-r",
          focused && effectiveActive ? "lg:hidden" : "lg:flex"
        )}
      >
        <nav className="space-y-0.5 p-3">
          {(() => {
            const myTasksFolder = FOLDERS.find((f) => f.id === "my_tasks")!
            const inboxFolder = FOLDERS.find((f) => f.id === "inbox")!
            const childFolders = FOLDERS.filter(
              (f) => f.id !== "my_tasks" && f.id !== "inbox"
            )
            const folderButton = (f: (typeof FOLDERS)[number], fill: "w-full" | "flex-1") => {
              const Icon = f.icon
              const activeFolder = view.kind === "folder" && view.id === f.id
              const count = folderCount(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setView({ kind: "folder", id: f.id })}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    fill,
                    activeFolder
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", f.id === "drafts" && "text-primary")} />
                  <span className="flex-1 truncate text-left">{c[f.key]}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[11px] tabular-nums",
                        f.id === "unread"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            }
            return (
              <>
                <div className="flex items-center gap-0.5">
                  {folderButton(inboxFolder, "flex-1")}
                  <button
                    type="button"
                    onClick={() => setInboxOpen((v) => !v)}
                    aria-expanded={inboxOpen}
                    aria-label={inboxOpen ? c.collapseFolders : c.expandFolders}
                    title={inboxOpen ? c.collapseFolders : c.expandFolders}
                    className="text-muted-foreground hover:bg-muted/60 hover:text-foreground shrink-0 rounded-md p-1.5"
                  >
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform",
                        !inboxOpen && "-rotate-90"
                      )}
                    />
                  </button>
                </div>
                {inboxOpen && (
                  <div className="border-border ml-4 flex flex-col gap-0.5 border-l pl-2">
                    {childFolders.map((f) => folderButton(f, "w-full"))}
                  </div>
                )}
                <div className="bg-border my-1.5 h-px" />
                {folderButton(myTasksFolder, "w-full")}
              </>
            )
          })()}
        </nav>

        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={() => setOutcomesOpen((v) => !v)}
            aria-expanded={outcomesOpen}
            className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between gap-1 rounded-md px-2.5 pt-2 pb-1.5 text-left text-[11px] font-semibold tracking-wide uppercase transition-colors"
          >
            {c.tags}
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 transition-transform",
                !outcomesOpen && "-rotate-90"
              )}
            />
          </button>
          {outcomesOpen && (
            <div className="space-y-0.5">
              {STATUS_ORDER.map((s) => {
                const m = STATUS_META[s]
                const activeTag = view.kind === "tag" && view.id === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setView({ kind: "tag", id: s })}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      activeTag
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span className={cn("size-2 shrink-0 rounded-full", m.dot)} />
                    <span className="flex-1 truncate text-left">
                      {locale === "es" ? m.es : m.en}
                    </span>
                    {tagCounts[s] > 0 && (
                      <span className="text-muted-foreground text-[11px] tabular-nums">
                        {tagCounts[s]}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* List column */}
      <div
        className={cn(
          "w-full flex-col border-r md:w-80 md:shrink-0 lg:w-[380px]",
          focused && effectiveActive
            ? "hidden"
            : showThreadMobile
              ? "hidden md:flex"
              : "flex"
        )}
      >
        <div className="space-y-2.5 border-b px-3 pt-3 pb-2.5">
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="flex items-baseline gap-1.5 font-semibold">
              {viewTitle}
              <span className="text-muted-foreground text-sm font-normal tabular-nums">
                {viewCount}
              </span>
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-8", filtersActive && "text-primary")}
                  aria-label={c.filters}
                >
                  <SlidersHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{c.channel}</DropdownMenuLabel>
                {(["all", "email", "linkedin"] as const).map((ch) => (
                  <DropdownMenuItem key={ch} onClick={() => setChannelFilter(ch)}>
                    {ch === "email" ? (
                      <Mail className="size-4" />
                    ) : ch === "linkedin" ? (
                      <LinkedinIcon className="size-4" />
                    ) : (
                      <span className="size-4" />
                    )}
                    {ch === "all" ? c.allChannels : ch === "email" ? c.email : c.linkedin}
                    {channelFilter === ch && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setUnreadOnly((v) => !v)}>
                  <Checkbox checked={unreadOnly} className="pointer-events-none" />
                  {c.unreadOnly}
                </DropdownMenuItem>
                {countryOptions.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{c.country}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setCountryFilter("all")}>
                      <span className="size-4" />
                      {c.allCountries}
                      {countryFilter === "all" && <Check className="ml-auto size-4" />}
                    </DropdownMenuItem>
                    {countryOptions.map((country) => (
                      <DropdownMenuItem key={country} onClick={() => setCountryFilter(country)}>
                        <span className="size-4" />
                        {country}
                        {countryFilter === country && <Check className="ml-auto size-4" />}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{c.recency}</DropdownMenuLabel>
                {(["any", "24h", "7d", "30d"] as const).map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setRecencyFilter(r)}>
                    <span className="size-4" />
                    {r === "any"
                      ? c.recencyAny
                      : r === "24h"
                        ? c.recency24h
                        : r === "7d"
                          ? c.recency7d
                          : c.recency30d}
                    {recencyFilter === r && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterDialogOpen(true)}>
                  <ListFilter className="size-4" />
                  {c.moreFilters}
                  {countConversationFilters(advancedFilters) > 0 && (
                    <span className="text-muted-foreground ml-auto text-[11px] tabular-nums">
                      {countConversationFilters(advancedFilters)}
                    </span>
                  )}
                </DropdownMenuItem>
                {filtersActive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setChannelFilter("all")
                        setUnreadOnly(false)
                        setCountryFilter("all")
                        setRecencyFilter("any")
                        setAdvancedFilters(emptyConversationFilters())
                      }}
                    >
                      <X className="size-4" />
                      {c.clearFilters}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={c.search}
              className="h-9 pl-8"
            />
          </div>

          {/* Mobile folder/tag chips */}
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 lg:hidden">
            {FOLDERS.map((f) => {
              const activeFolder = view.kind === "folder" && view.id === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setView({ kind: "folder", id: f.id })}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    activeFolder
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground bg-muted/60"
                  )}
                >
                  {c[f.key]}
                </button>
              )
            })}
            {STATUS_ORDER.filter((s) => tagCounts[s] > 0).map((s) => {
              const m = STATUS_META[s]
              const activeTag = view.kind === "tag" && view.id === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setView({ kind: "tag", id: s })}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    activeTag ? "bg-muted text-foreground" : "text-muted-foreground bg-muted/60"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", m.dot)} />
                  {locale === "es" ? m.es : m.en}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isMyTasksView ? (
            filteredTaskRows.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center gap-2 p-10 text-center">
                <ListTodo className="size-6 opacity-50" />
                <p className="text-sm">{c.emptyHint}</p>
              </div>
            ) : (
              filteredTaskRows.map((task) => {
                const p = task.prospectId ? getProspect(task.prospectId) : undefined
                const Icon = TASK_TYPE_ICON[task.type]
                const isActive = Boolean(
                  effectiveActive && task.prospectId === effectiveActive.prospectId
                )
                return (
                  <div
                    key={task.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openTaskConversation(task)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openTaskConversation(task)
                    }}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center gap-3 border-b px-4 py-3 text-left transition-colors",
                      isActive ? "bg-muted/60" : "hover:bg-muted/40"
                    )}
                  >
                    {isActive && (
                      <span className="bg-primary absolute inset-y-0 left-0 w-0.5" />
                    )}
                    <div
                      className="flex shrink-0 items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={task.done}
                        onCheckedChange={() => taskStore.toggle(task.id)}
                        aria-label="Mark task done"
                      />
                    </div>
                    <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      {p && (
                        <p className="text-muted-foreground truncate text-xs">
                          {p.firstName} {p.lastName} · {p.company}
                        </p>
                      )}
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatDueAt(task.dueDate)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      aria-label={c.editTask}
                      title={c.editTask}
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingTask(task)
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                )
              })
            )
          ) : list.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 p-10 text-center">
              <InboxIcon className="size-6 opacity-50" />
              <p className="text-sm">{c.emptyHint}</p>
            </div>
          ) : (
            list.map((conv) => {
              const p = getProspect(conv.prospectId)
              if (!p) return null
              const last = lastMessage(conv)
              const assignee = assigneeName(conv.assigneeId)
              const draft = hasReadyDraft(conv)
              return (
                <div
                  key={conv.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openConversation(conv.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openConversation(conv.id)
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer gap-3 border-b px-4 py-3 text-left transition-colors",
                    conv.id === effectiveActive?.id
                      ? "bg-muted/60"
                      : "hover:bg-muted/40"
                  )}
                >
                  {conv.id === effectiveActive?.id && (
                    <span className="bg-primary absolute inset-y-0 left-0 w-0.5" />
                  )}
                  <div
                    className="flex shrink-0 items-center pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedIds.has(conv.id)}
                      onCheckedChange={() => toggleSelectRow(conv.id)}
                      aria-label="Select conversation"
                    />
                  </div>
                  <div className="relative shrink-0">
                    <ProspectAvatar prospect={p} className="size-9" />
                    <span className="bg-background absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full">
                      <ChannelIcon
                        channel={conv.channel}
                        className={cn(
                          "size-3",
                          conv.channel === "linkedin" ? "text-linkedin" : "text-muted-foreground"
                        )}
                      />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          conv.unread > 0 ? "font-semibold" : "font-medium"
                        )}
                      >
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {isScheduled(conv) && conv.scheduledAt
                          ? formatWhen(conv.scheduledAt)
                          : relativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {p.title} · {p.company}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 truncate text-xs",
                        conv.unread > 0 ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {last?.direction === "outbound" && (
                        <span className="text-muted-foreground">↩ </span>
                      )}
                      {stripHtml(last?.body ?? "")}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {conv.status && <StatusBadge status={conv.status} locale={locale} />}
                      {draft && (
                        <span className="text-primary bg-primary/10 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                          <Sparkles className="size-2.5" />
                          {c.draftReadyTag}
                        </span>
                      )}
                      {isScheduled(conv) && (
                        <span className="text-muted-foreground bg-muted inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                          <CalendarClock className="size-2.5" />
                          {c.scheduled}
                        </span>
                      )}
                      {assignee && (
                        <span className="text-muted-foreground ml-auto inline-flex items-center gap-1 text-[10px]">
                          <Avatar className="size-4">
                            <AvatarFallback
                              style={{ backgroundColor: avatarColorFor(conv.assigneeId!), color: "white" }}
                              className="text-[8px]"
                            >
                              {initials(assignee.split(" ")[0], assignee.split(" ")[1])}
                            </AvatarFallback>
                          </Avatar>
                        </span>
                      )}
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
                  )}
                </div>
              )
            })
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t p-2">
            <span className="px-2 text-sm font-medium tabular-nums">
              {c.bulkSelected(selectedIds.size)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Tag className="size-4" />
                  {c.setStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {STATUS_ORDER.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => bulkSetOutcome(s)}>
                    <span className={cn("size-2 rounded-full", STATUS_META[s].dot)} />
                    {STATUS_META[s][locale === "es" ? "es" : "en"]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => bulkSetOutcome(undefined)}>
                  <X className="size-4" />
                  {c.clearStatus}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => bulkMarkRead(true)}>
              <MailOpen className="size-4" />
              {c.markRead}
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkMarkRead(false)}>
              <Mail className="size-4" />
              {c.markUnread}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={viewingArchived ? bulkUnarchive : bulkArchive}
            >
              {viewingArchived ? (
                <ArchiveRestore className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
              {viewingArchived ? c.unarchive : c.archive}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="size-4" />
              {c.clearSelection}
            </Button>
          </div>
        )}
      </div>

      {/* Thread */}
      {effectiveActive && activeProspect ? (
        <div className={cn("min-w-0 flex-1 flex-col", showThreadMobile ? "flex" : "hidden md:flex")}>
          {/* Header — kept to a single row; lower-priority actions collapse
              into the "..." menu on narrow viewports instead of wrapping. */}
          <div className="flex min-h-14 items-center gap-1 overflow-hidden border-b px-4 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 md:hidden"
              onClick={() => setShowThreadMobile(false)}
              aria-label={c.backToInbox}
            >
              <ArrowLeft className="size-4" />
            </Button>

            {/* Focus mode: collapse the list/rail to read the thread full-width.
                Placed at the far left edge, next to the panel it collapses. */}
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 hidden md:inline-flex"
              onClick={() => setFocused((v) => !v)}
              aria-label={focused ? c.expandList : c.collapseList}
              title={focused ? c.expandList : c.collapseList}
            >
              {focused ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>

            <Link
              to={`/prospects/${activeProspect.id}`}
              className="flex min-w-0 flex-1 items-center gap-2 hover:opacity-80"
            >
              <ProspectAvatar prospect={activeProspect} className="size-9 shrink-0" />
              <div className="min-w-0 flex-1">
                <TruncatedText label={`${activeProspect.firstName} ${activeProspect.lastName}`}>
                  <p className="truncate text-sm font-semibold">
                    {activeProspect.firstName} {activeProspect.lastName}
                  </p>
                </TruncatedText>
                <TruncatedText label={`${activeProspect.title} · ${activeProspect.company}`}>
                  <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                    <ChannelIcon channel={effectiveActive.channel} className="size-3" />
                    {activeProspect.title} · {activeProspect.company}
                  </p>
                </TruncatedText>
              </div>
            </Link>

            {/* Status tag selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  {effectiveActive.status ? (
                    <>
                      <span className={cn("size-1.5 rounded-full", STATUS_META[effectiveActive.status].dot)} />
                      {STATUS_META[effectiveActive.status][locale === "es" ? "es" : "en"]}
                    </>
                  ) : (
                    <>
                      <Tag className="size-3.5" />
                      {c.setStatus}
                    </>
                  )}
                  <ChevronDown className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {STATUS_ORDER.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => {
                      conversationStore.setStatus(effectiveActive.id, s)
                      toast.success(c.statusToast(STATUS_META[s][locale === "es" ? "es" : "en"]))
                    }}
                  >
                    <span className={cn("size-2 rounded-full", STATUS_META[s].dot)} />
                    {STATUS_META[s][locale === "es" ? "es" : "en"]}
                    {effectiveActive.status === s && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
                {effectiveActive.status && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        conversationStore.setStatus(effectiveActive.id, undefined)
                        toast.success(c.statusClearedToast)
                      }}
                    >
                      <X className="size-4" />
                      {c.clearStatus}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AssigneePicker
              variant="icon"
              value={effectiveActive.assigneeId}
              onChange={(id) => {
                conversationStore.assign(effectiveActive.id, id)
                if (id) {
                  toast.success(
                    c.assignedToast(resolveUser(id).name.split(" ")[0])
                  )
                }
              }}
              triggerAriaLabel={c.assign}
              unassignLabel={c.unassign}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={c.more}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    effectiveActive.unread > 0
                      ? conversationStore.markRead(effectiveActive.id)
                      : conversationStore.markUnread(effectiveActive.id)
                  }
                >
                  {effectiveActive.unread > 0 ? (
                    <MailOpen className="size-4" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  {effectiveActive.unread > 0 ? c.markRead : c.markUnread}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTaskDialogOpen(true)}>
                  <ListTodo className="size-4" />
                  {c.createTask}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const next = !effectiveActive.autoReply
                    conversationStore.setAutoReply(effectiveActive.id, next)
                    // Mock "the agent already drafted one" the moment auto-reply
                    // turns on for a thread that's already awaiting a reply —
                    // there's no live inbound-message simulation to hang this
                    // off of, so this is the closest honest stand-in.
                    if (next && !effectiveActive.aiDraft && needsReply(effectiveActive) && activeProspect) {
                      conversationStore.setDraft(
                        effectiveActive.id,
                        draftReply(activeProspect, effectiveActive)
                      )
                    }
                    toast.success(
                      next ? c.autoReplyEnabled(activeProspect?.firstName ?? "") : c.autoReplyDisabled
                    )
                  }}
                >
                  <Checkbox checked={Boolean(effectiveActive.autoReply)} className="pointer-events-none" />
                  <Sparkles className="size-4" />
                  {c.autoReply}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {effectiveActive.archived ? (
                  <DropdownMenuItem onClick={() => conversationStore.unarchive(effectiveActive.id)}>
                    <ArchiveRestore className="size-4" />
                    {c.unarchive}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => { conversationStore.archive(effectiveActive.id); toast.success(c.archived) }}>
                    <Archive className="size-4" />
                    {c.archive}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onClick={() => setToDelete(effectiveActive.id)}>
                  <Trash2 className="size-4" />
                  {c.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Prospect/company summary panel toggle. Placed at the far
                right edge, next to the panel it collapses. */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label={profileOpen ? c.hideProfile : c.showProfile}
              title={profileOpen ? c.hideProfile : c.showProfile}
            >
              {profileOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </Button>
          </div>

          {/* Status bar */}
          {effectiveActive.assigneeId && (
            <div className="text-muted-foreground bg-muted/30 flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-1.5 text-xs">
              <span className="inline-flex items-center gap-1">
                <UserPlus className="size-3" />
                {c.assignedTo(assigneeName(effectiveActive.assigneeId) ?? "")}
              </span>
            </div>
          )}

          {/* Timeline */}
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {timeline.map((item) => {
              if (item.type === "event") {
                const ev = item.ev
                // "step" and "task" vary their icon/label by channel or task
                // state rather than a single fixed EVENT_META entry.
                const stepMeta = ev.kind === "step" && ev.stepChannel ? STEP_META[ev.stepChannel] : undefined
                const taskMeta = ev.kind === "task" && ev.taskState ? TASK_STATE_META[ev.taskState] : undefined
                const meta = stepMeta ?? taskMeta ?? EVENT_META[ev.kind]
                const Icon = meta.icon
                const label =
                  ev.kind === "tag"
                    ? c.autoTaggedAs
                    : ev.kind === "task" || ev.kind === "next_step"
                      ? locale === "es"
                        ? `${meta.es}: ${ev.label}`
                        : `${meta.en}: ${ev.label}`
                      : locale === "es"
                        ? meta.es
                        : meta.en
                // A row is "future" the instant its own timestamp hasn't
                // happened yet — an open task due later, a queued reply, or
                // an upcoming sequence step all read the same way here.
                const isFuture = isFutureTimestamp(ev.timestamp)
                return (
                  <div
                    key={ev.id}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      isFuture ? "text-muted-foreground/70 italic" : "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full",
                        isFuture ? "border border-dashed bg-transparent" : "bg-muted"
                      )}
                    >
                      <Icon className="size-3" />
                    </span>
                    <span>
                      {label}
                      {ev.kind === "tag" && ev.status && (
                        <span className="ml-1 align-middle">
                          <StatusBadge status={ev.status} locale={locale} />
                        </span>
                      )}
                      {ev.detail && <span className="text-foreground/70"> {ev.detail}</span>}
                    </span>
                    <span className="ml-auto shrink-0">
                      {isFuture ? futureRelativeTime(ev.timestamp) : relativeTime(ev.timestamp)}
                    </span>
                  </div>
                )
              }

              const m = item.msg
              const msgLang = m.lang ?? detectLang(m.body)
              const canTranslate = msgLang !== locale
              const showTr = shownTranslations.has(m.id)
              const outbound = m.direction === "outbound"
              const showNewDivider = m.id === firstUnreadId
              return (
                <React.Fragment key={m.id}>
                  {showNewDivider && (
                    <div className="flex items-center gap-3 py-1">
                      <span className="bg-border h-px flex-1" />
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                        {c.newDivider}
                      </span>
                      <span className="bg-border h-px flex-1" />
                    </div>
                  )}
                  <div className={cn("flex flex-col gap-1", outbound ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm",
                        outbound
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )}
                    >
                      {m.kind === "voice" ? (
                        <VoiceMessageBubble
                          durationSec={m.voiceDurationSec ?? 0}
                          outbound={outbound}
                        />
                      ) : (
                        <MessageBody
                          html={showTr ? translate(m.body, uiToChatLang(locale)) : m.body}
                        />
                      )}
                      {showTr && (
                        <p className={cn("mt-1 text-[10px] italic", outbound ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {c.translatedFrom(LANG_LABEL[msgLang])}
                        </p>
                      )}
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-1 text-[10px]", outbound ? "flex-row-reverse" : "")}>
                      <span className="text-muted-foreground">
                        {LANG_FLAG[msgLang]} {relativeTime(m.timestamp)}
                      </span>
                      {outbound && m.aiGenerated && (
                        <span
                          className="text-primary inline-flex items-center"
                          title={c.aiGenerated}
                          aria-label={c.aiGenerated}
                        >
                          <Sparkles className="size-2.5" />
                        </span>
                      )}
                      {canTranslate && (
                        <button
                          type="button"
                          onClick={() => toggleTranslation(m.id)}
                          className="text-primary inline-flex items-center gap-0.5 font-medium hover:underline"
                        >
                          <Languages className="size-2.5" />
                          {showTr ? c.showOriginal : c.translate}
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>

          {/* Scheduled banner */}
          {isScheduled(effectiveActive) && effectiveActive.scheduledAt && (
            <div className="bg-primary/5 text-primary flex flex-wrap items-center gap-2 border-t px-5 py-2 text-xs">
              <CalendarClock className="size-3.5" />
              <span className="font-medium">{c.scheduledFor(formatWhen(effectiveActive.scheduledAt))}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="volt"
                  className="h-7"
                  onClick={() => {
                    conversationStore.sendMessage(
                      effectiveActive.id,
                      effectiveActive.aiDraft ?? "",
                      detectLang(effectiveActive.aiDraft ?? ""),
                      true
                    )
                    toast.success(c.sentScheduled)
                  }}
                >
                  <Send className="size-3.5" />
                  {c.sendNow}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7"
                  onClick={() => {
                    conversationStore.unschedule(effectiveActive.id)
                    toast.success(c.scheduleCancelled)
                  }}
                >
                  {c.cancelSchedule}
                </Button>
              </div>
            </div>
          )}

          {/* Composer (keyed so it resets per conversation) */}
          {!isScheduled(effectiveActive) && (
            <Composer
              key={effectiveActive.id}
              conv={effectiveActive}
              prospect={activeProspect}
              recipientLang={recipientLang}
              c={c}
            />
          )}
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center gap-3 text-center md:flex">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <InboxIcon className="size-6" />
          </span>
          <div>
            <p className="text-sm font-medium">{c.selectConversation}</p>
            <p className="text-muted-foreground text-sm">{c.selectConversationHint}</p>
          </div>
        </div>
      )}

      {/* Prospect/company summary panel — every folder, not just Tasks */}
      {effectiveActive && activeProspect && (
        <div
          className={cn(
            "hidden w-72 shrink-0 flex-col overflow-y-auto border-l",
            profileOpen ? "lg:flex" : "lg:hidden"
          )}
        >
          <ProspectSummaryPanel prospect={activeProspect} locale={locale} />
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={c.deleteTitle}
        description={c.deleteDesc}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (toDelete) {
            conversationStore.remove(toDelete)
            toast.success(c.deleted)
          }
          setToDelete(null)
        }}
      />

      {effectiveActive && (
        <TaskFormDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          defaultProspectId={effectiveActive.prospectId}
        />
      )}

      <TaskFormDialog
        open={Boolean(editingTask)}
        onOpenChange={(v) => {
          if (!v) setEditingTask(undefined)
        }}
        task={editingTask}
      />

      <FilterConversationsDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        campaigns={campaigns}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
      />
    </div>
  )
}

function Composer({
  conv,
  prospect,
  recipientLang,
  c,
}: {
  conv: Conversation
  prospect: Prospect
  recipientLang: ChatLang
  c: Copy
}) {
  const { locale } = useLocale()
  const [reply, setReply] = React.useState(conv.aiDraft ?? "")
  const [aiUsed, setAiUsed] = React.useState(Boolean(conv.aiDraft))
  const [seed, setSeed] = React.useState(0)
  // Mock voice-message recording — no real mic access, just a timer UI that
  // replaces the composer while "recording," same shape LinkedIn/WhatsApp's
  // own voice-note affordance has.
  const [recording, setRecording] = React.useState(false)
  const [recordSec, setRecordSec] = React.useState(0)
  React.useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setRecordSec((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [recording])
  function sendVoice() {
    conversationStore.sendVoiceMessage(conv.id, Math.max(1, recordSec), recipientLang)
    setRecording(false)
    setRecordSec(0)
    toast.success(c.replySent(prospect.firstName))
  }
  function cancelVoice() {
    setRecording(false)
    setRecordSec(0)
  }
  const [templateOpen, setTemplateOpen] = React.useState(false)
  const [customOpen, setCustomOpen] = React.useState(false)
  const [customValue, setCustomValue] = React.useState("")
  const [regenOpen, setRegenOpen] = React.useState(false)
  const [regenTone, setRegenTone] = React.useState<ReplyTone>("professional")
  const [regenLength, setRegenLength] = React.useState<ReplyLength>("normal")
  const [regenLang, setRegenLang] = React.useState<ChatLang>(recipientLang)
  const [regenInstructions, setRegenInstructions] = React.useState("")
  const [varSearch, setVarSearch] = React.useState("")
  // Free-text "personalized variable" — wraps whatever's typed in {{ }} as a
  // placeholder to fill in by hand later, matching the extension's Add
  // Variables modal. Always inserted literally, never resolved like insertVar.
  const [customVarText, setCustomVarText] = React.useState("")
  const taRef = React.useRef<RichTextEditorHandle>(null)

  // wasOpen reset pattern — seed every field back to its default each time
  // the Regenerate dialog opens, so a prior selection never lingers.
  const [regenWasOpen, setRegenWasOpen] = React.useState(regenOpen)
  if (regenOpen !== regenWasOpen) {
    setRegenWasOpen(regenOpen)
    if (regenOpen) {
      setRegenTone("professional")
      setRegenLength("normal")
      setRegenLang(recipientLang)
      setRegenInstructions("")
    }
  }

  const CHANNEL_NAMES: Record<string, string> = {
    email: c.email,
    linkedin: c.linkedin,
    whatsapp: "WhatsApp",
    sms: "SMS",
    messenger: "Messenger",
    instagram: "Instagram",
  }
  const channelLabel = CHANNEL_NAMES[conv.channel] ?? c.email
  const firstName = currentUser.name.split(" ")[0]
  // The reply is rich HTML — check its text content for emptiness.
  const replyText = stripHtml(reply)
  const hasText = replyText.length > 0
  const showDraftChip = aiUsed && hasText

  // Personalization variables resolved against the recipient + sender.
  const vars: { tag: string; value: string }[] = [
    { tag: "first_name", value: prospect.firstName },
    { tag: "last_name", value: prospect.lastName },
    { tag: "full_name", value: `${prospect.firstName} ${prospect.lastName}` },
    { tag: "company", value: prospect.company },
    { tag: "company_domain", value: prospect.companyDomain },
    { tag: "title", value: prospect.title },
    { tag: "seniority", value: prospect.seniority },
    { tag: "department", value: prospect.department },
    { tag: "city", value: prospect.location },
    { tag: "email", value: prospect.email },
    { tag: "phone", value: prospect.phone ?? "" },
    { tag: "linkedin_url", value: prospect.linkedinUrl },
    { tag: "industry", value: prospect.industry },
    { tag: "headcount", value: prospect.headcount },
    { tag: "revenue", value: prospect.revenue },
    { tag: "about", value: prospect.about },
    { tag: "signal_1", value: prospect.signals[0] ?? "" },
    { tag: "signal_2", value: prospect.signals[1] ?? "" },
    { tag: "score", value: String(prospect.score) },
    { tag: "status", value: prospect.status },
    { tag: "tags", value: prospect.tags.join(", ") },
    { tag: "last_activity", value: relativeTime(prospect.lastActivity) },
    { tag: "added_at", value: relativeTime(prospect.addedAt) },
    { tag: "sender", value: currentUser.name },
    { tag: "sender_first_name", value: firstName },
    { tag: "sender_full_name", value: currentUser.name },
    { tag: "sender_email", value: currentUser.email },
    { tag: "sender_title", value: currentUser.role },
    { tag: "sender_company", value: currentUser.company },
  ]
  const renderedReply = vars.reduce(
    (text, v) => text.replaceAll(`{{${v.tag}}}`, v.value),
    reply
  )
  // Same variables as a tag→value map, for the template picker's live preview.
  const varsMap = Object.fromEntries(vars.map((v) => [v.tag, v.value]))
  const mergeVarLabel = (tag: string) => MERGE_VARIABLES.find((mv) => mv.tag === tag)?.[locale] ?? tag
  const varSearchQuery = varSearch.trim().toLowerCase()
  const filteredVars = varSearchQuery
    ? vars.filter(
        (v) =>
          mergeVarLabel(v.tag).toLowerCase().includes(varSearchQuery) ||
          v.tag.toLowerCase().includes(varSearchQuery)
      )
    : vars
  const varGroups = groupByMergeVarGroup(filteredVars, MERGE_VARIABLE_GROUPS)

  function runGenerate(options?: DraftReplyOptions) {
    const next = seed + 1
    setSeed(next)
    setReply(plainToHtml(draftReply(prospect, conv, next, options)))
    setAiUsed(true)
  }

  function generate() {
    runGenerate()
  }

  // Regenerate (composer already has text) opens a dialog for tone/length/
  // language/instructions first, instead of re-rolling with no input.
  function openRegenerate() {
    setRegenOpen(true)
  }

  function confirmRegenerate() {
    runGenerate({
      tone: regenTone,
      length: regenLength,
      lang: regenLang,
      instructions: regenInstructions.trim() || undefined,
    })
    setRegenOpen(false)
    toast.success(c.regenerated)
  }

  // Insert the prospect's resolved value at the caret — the composer writes to
  // one known recipient, so live data beats a {{tag}} placeholder here. Falls
  // back to the literal tag when this prospect has no value for the field.
  function insertVar(tag: string) {
    taRef.current?.insertText(varsMap[tag] || `{{${tag}}}`)
  }

  // Unlike insertVar, always inserts the raw typed text literally — it's a
  // placeholder note for the sender to fill in by hand, not a data field.
  function insertCustomVar() {
    const text = customVarText.trim()
    if (!text) return
    taRef.current?.insertText(`{{${text}}}`)
    setCustomVarText("")
  }

  // Insert the template body (merge variables intact) so the composer's
  // Personalize / Preview pipeline renders them against this recipient.
  function applyTemplate(body: string) {
    setReply((cur) => (stripHtml(cur) ? `${cur}<br><br>${body}` : body))
  }

  function send() {
    if (!hasText) return
    // Send with personalization variables filled in.
    const out = renderedReply.trim()
    conversationStore.sendMessage(conv.id, out, detectLang(out), aiUsed)
    setReply("")
    setAiUsed(false)
    toast.success(c.replySent(prospect.firstName))
  }

  // Queue the reply to go out at `iso`. The scheduled banner (which reads the
  // stored draft) takes over once the composer clears.
  function scheduleSend(iso: string) {
    if (!hasText) return
    const out = renderedReply.trim()
    conversationStore.schedule(conv.id, iso, out)
    setReply("")
    setAiUsed(false)
    setCustomOpen(false)
    toast.success(c.scheduledToast(formatWhen(iso)))
  }

  function openCustomSchedule() {
    // Default the picker to one hour out, in local time.
    setCustomValue(toLocalInputValue(new Date(Date.now() + 3600 * 1000)))
    setCustomOpen(true)
  }

  function confirmCustomSchedule() {
    if (!customValue) return
    scheduleSend(new Date(customValue).toISOString())
  }

  const showTranslate = hasText && detectLang(replyText) !== recipientLang

  // Regenerate-dialog option arrays — locale-dependent labels, so declared
  // inside the component rather than hoisted to module scope. Reuse the
  // existing Tone/Length copy keys rather than a second taxonomy.
  const TONE_OPTIONS: { value: ReplyTone; label: string }[] = [
    { value: "formal", label: c.toneFormal },
    { value: "friendly", label: c.toneFriendly },
    { value: "professional", label: c.toneProfessional },
    { value: "concise", label: c.toneConcise },
  ]
  const LENGTH_OPTIONS: { value: ReplyLength; label: string }[] = [
    { value: "shorter", label: c.shorter },
    { value: "normal", label: c.regenLengthNormal },
    { value: "longer", label: c.longer },
  ]
  const LANG_OPTIONS = Object.keys(LANG_LABEL) as ChatLang[]

  const toolbarEnd = (
    <>
      {showDraftChip && (
        <span
          className="text-primary inline-flex items-center gap-1 text-[11px] font-medium"
          title={c.draftReady}
        >
          <Sparkles className="size-3" />
          {c.kaiDraft}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setTemplateOpen(true)}
      >
        <FileText className="size-4" />
        {c.templates}
      </Button>
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) {
            setVarSearch("")
            setCustomVarText("")
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Braces className="size-4" />
            {c.personalize}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>{c.personalize}</DropdownMenuLabel>
          <div className="px-2 pb-1.5" onClick={(e) => e.stopPropagation()}>
            <Input
              value={varSearch}
              onChange={(e) => setVarSearch(e.target.value)}
              placeholder={c.varsSearchPlaceholder}
              className="h-8"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {varGroups.map((group) => (
              <div key={group.key}>
                <DropdownMenuLabel className="text-muted-foreground text-[11px] font-semibold uppercase">
                  {c.varGroups[group.key]}
                </DropdownMenuLabel>
                {group.items.map((v) => (
                  <DropdownMenuItem key={v.tag} onClick={() => insertVar(v.tag)}>
                    <Braces className="text-primary size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{mergeVarLabel(v.tag)}</span>
                    <span className="text-muted-foreground max-w-28 shrink-0 truncate text-[11px]">
                      {v.value || `{{${v.tag}}}`}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
            {filteredVars.length === 0 && (
              <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                {c.varsEmpty}
              </p>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground text-[11px] font-semibold uppercase">
            {c.personalizedVariable}
          </DropdownMenuLabel>
          <div className="flex items-center gap-1.5 px-2 pt-0.5 pb-1.5" onClick={(e) => e.stopPropagation()}>
            <Input
              value={customVarText}
              onChange={(e) => setCustomVarText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") insertCustomVar()
              }}
              placeholder={c.personalizedVariablePlaceholder}
              className="h-8"
            />
            <Button
              size="sm"
              variant="secondary"
              className="h-8 shrink-0 px-2"
              disabled={!customVarText.trim()}
              onClick={insertCustomVar}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  return (
    <div className="space-y-2 border-t p-4">
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5">
          {c.replyAs}
          <Avatar className="size-4">
            <AvatarFallback
              style={{ backgroundColor: currentUser.avatarColor, color: "white" }}
              className="text-[8px]"
            >
              {initials(currentUser.name.split(" ")[0], currentUser.name.split(" ")[1])}
            </AvatarFallback>
          </Avatar>
          <span className="text-foreground font-medium">{firstName}</span>
          <span className="opacity-50">·</span>
          {c.from}
          <ChannelIcon channel={conv.channel} className="size-3" />
          <span className="text-foreground font-medium">{channelLabel}</span>
        </span>
        <span className="hidden items-center gap-1 sm:inline-flex">
          {LANG_FLAG[recipientLang]} {LANG_LABEL[recipientLang]}
        </span>
      </div>

      {recording ? (
        <div className="border-destructive/30 bg-destructive/5 flex items-center gap-3 rounded-md border px-3 py-2.5">
          <span className="relative flex size-2.5 shrink-0">
            <span className="bg-destructive absolute inline-flex size-full animate-ping rounded-full opacity-60" />
            <span className="bg-destructive relative inline-flex size-2.5 rounded-full" />
          </span>
          <span className="text-sm font-medium tabular-nums">
            {c.recording} · 0:{String(recordSec).padStart(2, "0")}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={cancelVoice}>
              {c.cancelSchedule}
            </Button>
            <Button variant="volt" size="sm" onClick={sendVoice}>
              <Square className="size-3.5" />
              {c.stopAndSend}
            </Button>
          </div>
        </div>
      ) : (
        <RichTextEditor
          ref={taRef}
          value={reply}
          onChange={(html) => {
            setReply(html)
            if (stripHtml(html) === "") setAiUsed(false)
          }}
          placeholder={c.replyTo(prospect.firstName)}
          ariaLabel={c.replyTo(prospect.firstName)}
          minHeight="min-h-24"
          className={cn(showDraftChip && "border-primary/30 bg-primary/[0.03]")}
          toolbarEnd={toolbarEnd}
        />
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={recording}
          onClick={hasText ? openRegenerate : generate}
        >
          <Wand2 className="size-4" />
          {hasText ? c.regenerate : c.generate}
        </Button>

        {(conv.channel === "whatsapp" || conv.channel === "linkedin") && !recording && (
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setRecording(true)}
          >
            <Mic className="size-4" />
            {c.recordVoice}
          </Button>
        )}

        <div className="bg-border/60 mx-0.5 hidden h-5 w-px sm:block" />

        {showTranslate && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setReply((cur) => translate(cur, recipientLang))
              toast.success(c.draftTranslated(LANG_LABEL[recipientLang]))
            }}
          >
            <Languages className="size-4" />
            {c.writeIn(LANG_FLAG[recipientLang], LANG_LABEL[recipientLang])}
          </Button>
        )}

        <div className="ml-auto flex items-center">
          <Button
            size="sm"
            variant="volt"
            className="rounded-r-none"
            disabled={!hasText || recording}
            onClick={send}
          >
            <Send className="size-4" />
            {c.sendVia()}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="volt"
                className="rounded-l-none border-l border-white/25 px-2"
                disabled={!hasText || recording}
                aria-label={c.sendLater}
              >
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{c.scheduleSend}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => scheduleSend(snoozeUntilISO(1))}>
                <Clock className="size-4" />
                {c.inOneHour}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => scheduleSend(morningISO(1))}>
                <CalendarClock className="size-4" />
                {c.tomorrowMorning}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => scheduleSend(nextMondayMorningISO())}>
                <CalendarClock className="size-4" />
                {c.mondayMorning}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openCustomSchedule}>
                <CalendarClock className="size-4" />
                {c.pickDateTime}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Custom date/time scheduling */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{c.scheduleTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="schedule-when">{c.scheduleWhen}</Label>
            <Input
              id="schedule-when"
              type="datetime-local"
              value={customValue}
              min={toLocalInputValue(new Date())}
              onChange={(e) => setCustomValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              {c.cancelSchedule}
            </Button>
            <Button variant="volt" disabled={!customValue} onClick={confirmCustomSchedule}>
              <CalendarClock className="size-4" />
              {c.scheduleConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate options */}
      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{c.regenTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regen-tone">{c.tone}</Label>
              <Select value={regenTone} onValueChange={(v) => setRegenTone(v as ReplyTone)}>
                <SelectTrigger id="regen-tone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="regen-length">{c.length}</Label>
              <Select value={regenLength} onValueChange={(v) => setRegenLength(v as ReplyLength)}>
                <SelectTrigger id="regen-length" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="regen-lang">{c.regenLanguage}</Label>
              <Select value={regenLang} onValueChange={(v) => setRegenLang(v as ChatLang)}>
                <SelectTrigger id="regen-lang" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANG_OPTIONS.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {LANG_FLAG[lang]} {LANG_LABEL[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="regen-instructions">{c.regenInstructions}</Label>
              <Textarea
                id="regen-instructions"
                value={regenInstructions}
                onChange={(e) => setRegenInstructions(e.target.value)}
                placeholder={c.regenInstructionsPlaceholder}
                className="min-h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRegenOpen(false)}>
              {c.regenCancel}
            </Button>
            <Button variant="volt" onClick={confirmRegenerate}>
              <Wand2 className="size-4" />
              {c.regenerate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TemplatePickerDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onInsert={(t) => applyTemplate(t.body)}
        vars={varsMap}
        recipientName={`${prospect.firstName} ${prospect.lastName}`}
        channel={conv.channel}
        locale={locale}
      />
    </div>
  )
}
