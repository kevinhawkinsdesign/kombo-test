import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Mail,
  Phone,
  Plus,
  Pencil,
  Send,
  Sparkles,
  Building2,
  Lock,
  Copy,
  Target,
  Clock,
  MailCheck,
  MailOpen,
  Reply,
  CalendarCheck,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  UserPlus,
  StickyNote,
  PhoneCall,
  Waypoints,
  MapPin,
  User,
  Languages as LanguagesIcon,
  ChevronDown,
  Handshake,
  XCircle,
  AlertTriangle,
  Activity,
  ThumbsUp,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
} from "@/components/common/ProspectBits"
import { TrackButton } from "@/components/common/TrackButton"
import { BackLink } from "@/components/common/BackLink"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddToListDialog } from "@/components/prospect/AddToListDialog"
import { ProspectFormDialog } from "@/components/prospect/ProspectFormDialog"
import { ComposeDialog } from "@/components/prospect/ComposeDialog"
import { ProspectTabBar } from "@/components/prospect/ProspectTabBar"
import { prospectTabsStore } from "@/lib/prospect-tabs"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { AddToCrmDialog } from "@/components/crm/AddToCrmDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { InfoHint } from "@/components/common/InfoHint"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { conversations } from "@/lib/mock-data"
import { useProspects, prospectStore } from "@/lib/store"
import {
  callPrep,
  emailPrep,
  getHistory,
  getNotes,
  qualification,
  professionalSummaryBullets,
  engagementStrategy,
  challenges,
  linkedinActivity,
  activityInsights,
  SMART_TAGS,
  type HistoryType,
  type ProspectNote,
} from "@/lib/mock-prospect-depth"
import { getIntroPaths, type IntroStrength } from "@/lib/mock-network"
import { useCredits } from "@/lib/credits"
import { useAuth } from "@/lib/auth"
import { useProducts } from "@/lib/mock-products"
import { CONNECTED_CRM_PROVIDER } from "@/lib/mock-depth"
import { initials, relativeTime, linkedinHandle } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    prospectNotFound: "Prospect not found.",
    backToSearch: "All Prospects",
    message: "Message",
    addToList: "Add to list",
    edit: "Edit",
    prospectActions: "Prospect actions",
    deleteProspect: "Delete prospect",
    tabOverview: "Overview",
    tabPrep: "AI Prep",
    tabHistory: "History",
    tabNotes: "Notes",
    about: "About",
    buyingSignals: "Buying signals",
    conversation: "Conversation",
    openInInbox: "Open in inbox",
    you: "You",
    noConversation: "No conversation yet.",
    startOutreach: "Start outreach",
    addedToList: (firstName: string, name: string) =>
      `${firstName} added to "${name}"`,
    crmFirstName: "First name",
    crmLastName: "Last name",
    crmEmail: "Email",
    crmPhone: "Phone",
    crmCompany: "Company",
    crmJobTitle: "Job title",
    deleteTitle: "Delete prospect?",
    deleteDescription: (fullName: string) =>
      `This will permanently remove ${fullName} and remove them from any lists. This action cannot be undone.`,
    deleteConfirm: "Delete",
    prospectDeleted: "Prospect deleted",
    contact: "Contact",
    owner: "Owner",
    verified: "Verified",
    reveal: "Reveal",
    linkedinProfile: "LinkedIn profile",
    addToCrm: "Add to CRM",
    notAvailable: "Not available",
    revealEmailTitle: "Reveal email?",
    revealPhoneTitle: "Reveal phone?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `${cost} credit${cost > 1 ? "s" : ""} to reveal ${firstName}'s ${what}.`,
    phoneNumber: "phone number",
    emailAddress: "email address",
    cancel: "Cancel",
    useCredits: (cost: number) => `${cost} credit${cost > 1 ? "s" : ""}`,
    emailRevealed: "Email revealed",
    phoneRevealed: "Phone revealed",
    enrichment: "Enrichment",
    dataPoints: "30 data points",
    seniority: "Seniority",
    department: "Department",
    headcount: "Headcount",
    industry: "Industry",
    revenue: "Revenue",
    location: "Location",
    leadQualification: "Lead qualification",
    icpFit: "ICP fit",
    intent: "Intent",
    engagement: "Engagement",
    warmIntros: "Warm intros",
    all: "All",
    noWarmPaths: "No warm paths yet.",
    exploreNetwork: "Explore your network",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    ask: (name: string) => `Ask ${name}`,
    requestIntro: "Request intro",
    introRequested: (name: string) => `Intro requested via ${name}`,
    aiCallPrep: "AI call prep",
    talkingPoints: "Talking points",
    discoveryQuestions: "Discovery questions",
    likelyObjections: "Likely objections",
    aiEmailDrafts: "AI email drafts",
    copy: "Copy",
    copied: "Copied to clipboard",
    use: "Use",
    activityTimeline: "Activity timeline",
    addNote: "Add a note",
    notePlaceholder: "What did you learn? Add context for your team…",
    addNoteButton: "Add note",
    noteAdded: "Note added",
    noNotes: "No notes yet.",
    youAuthor: "You",
    basedIn: (loc: string) => `Based: ${loc}`,
    age: (range: string) => `Age: ${range}`,
    languagesLabel: "Languages",
    professionalSummaryInfo: (name: string) =>
      `A career overview of ${name}, highlighting the details most relevant to your outreach.`,
    engagementStrategyTitle: "Engagement strategy",
    engagementStrategyInfo: (name: string) =>
      `Recommended do's and don'ts for engaging ${name}, based on their role and profile.`,
    dos: "Do's",
    donts: "Don'ts",
    challengesTitle: "Challenges",
    challengesInfo: (name: string) =>
      `Potential pain points for ${name}, useful for tailoring your value proposition.`,
    genericTab: "Generic",
    specificTab: "Specific",
    valueProposition: "Value proposition",
    linkedinActivityTitle: "LinkedIn activity",
    noLinkedinActivity: "No recent LinkedIn activity.",
    reactions: (n: number) => `${n} reaction${n === 1 ? "" : "s"}`,
    commentsCount: (n: number) => `${n} comment${n === 1 ? "" : "s"}`,
    activityInsightsTitle: "Activity insights",
    activityInsightsInfo: (name: string) =>
      `A summary of ${name}'s CRM activity, plus suggested next steps.`,
    nextSteps: "Suggested next steps",
    product: "Product",
    expand: (l: string) => `Expand ${l}`,
    collapse: (l: string) => `Collapse ${l}`,
  },
  es: {
    prospectNotFound: "Prospecto no encontrado.",
    backToSearch: "Todos los prospectos",
    message: "Mensaje",
    addToList: "Añadir a lista",
    edit: "Editar",
    prospectActions: "Acciones del prospecto",
    deleteProspect: "Eliminar prospecto",
    tabOverview: "Resumen",
    tabPrep: "Preparación IA",
    tabHistory: "Historial",
    tabNotes: "Notas",
    about: "Acerca de",
    buyingSignals: "Señales de compra",
    conversation: "Conversación",
    openInInbox: "Abrir en la bandeja",
    you: "Tú",
    noConversation: "Aún no hay conversación.",
    startOutreach: "Iniciar contacto",
    addedToList: (firstName: string, name: string) =>
      `${firstName} añadido a "${name}"`,
    crmFirstName: "Nombre",
    crmLastName: "Apellidos",
    crmEmail: "Correo",
    crmPhone: "Teléfono",
    crmCompany: "Empresa",
    crmJobTitle: "Cargo",
    deleteTitle: "¿Eliminar prospecto?",
    deleteDescription: (fullName: string) =>
      `Esto eliminará de forma permanente a ${fullName} y lo quitará de cualquier lista. Esta acción no se puede deshacer.`,
    deleteConfirm: "Eliminar",
    prospectDeleted: "Prospecto eliminado",
    contact: "Contacto",
    owner: "Responsable",
    verified: "Verificado",
    reveal: "Revelar",
    linkedinProfile: "Perfil de LinkedIn",
    addToCrm: "Añadir al CRM",
    notAvailable: "No disponible",
    revealEmailTitle: "¿Revelar correo?",
    revealPhoneTitle: "¿Revelar teléfono?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `${cost} crédito${cost > 1 ? "s" : ""} para revelar ${what} de ${firstName}.`,
    phoneNumber: "el número de teléfono",
    emailAddress: "el correo electrónico",
    cancel: "Cancelar",
    useCredits: (cost: number) => `${cost} crédito${cost > 1 ? "s" : ""}`,
    emailRevealed: "Correo revelado",
    phoneRevealed: "Teléfono revelado",
    enrichment: "Enriquecimiento",
    dataPoints: "30 puntos de datos",
    seniority: "Antigüedad",
    department: "Departamento",
    headcount: "Empleados",
    industry: "Sector",
    revenue: "Ingresos",
    location: "Ubicación",
    leadQualification: "Cualificación del lead",
    icpFit: "Encaje con ICP",
    intent: "Intención",
    engagement: "Interacción",
    warmIntros: "Presentaciones",
    all: "Todas",
    noWarmPaths: "Aún no hay caminos cálidos.",
    exploreNetwork: "Explora tu red",
    strengthStrong: "Fuerte",
    strengthMedium: "Media",
    strengthWeak: "Débil",
    ask: (name: string) => `Pedir a ${name}`,
    requestIntro: "Solicitar presentación",
    introRequested: (name: string) =>
      `Presentación solicitada a través de ${name}`,
    aiCallPrep: "Preparación de llamada con IA",
    talkingPoints: "Puntos clave",
    discoveryQuestions: "Preguntas de descubrimiento",
    likelyObjections: "Objeciones probables",
    aiEmailDrafts: "Borradores de correo con IA",
    copy: "Copiar",
    copied: "Copiado al portapapeles",
    use: "Usar",
    activityTimeline: "Cronología de actividad",
    addNote: "Añadir una nota",
    notePlaceholder: "¿Qué has aprendido? Añade contexto para tu equipo…",
    addNoteButton: "Añadir nota",
    noteAdded: "Nota añadida",
    noNotes: "Aún no hay notas.",
    youAuthor: "Tú",
    basedIn: (loc: string) => `Ubicado en: ${loc}`,
    age: (range: string) => `Edad: ${range}`,
    languagesLabel: "Idiomas",
    professionalSummaryInfo: (name: string) =>
      `Un resumen de la trayectoria de ${name}, con los detalles más relevantes para tu contacto.`,
    engagementStrategyTitle: "Estrategia de contacto",
    engagementStrategyInfo: (name: string) =>
      `Qué hacer y qué evitar al contactar con ${name}, según su cargo y perfil.`,
    dos: "Qué hacer",
    donts: "Qué evitar",
    challengesTitle: "Retos",
    challengesInfo: (name: string) =>
      `Posibles puntos de dolor de ${name}, útiles para adaptar tu propuesta de valor.`,
    genericTab: "General",
    specificTab: "Específico",
    valueProposition: "Propuesta de valor",
    linkedinActivityTitle: "Actividad en LinkedIn",
    noLinkedinActivity: "Aún no hay actividad en LinkedIn.",
    reactions: (n: number) => `${n} reacci${n === 1 ? "ón" : "ones"}`,
    commentsCount: (n: number) => `${n} comentario${n === 1 ? "" : "s"}`,
    activityInsightsTitle: "Información de actividad",
    activityInsightsInfo: (name: string) =>
      `Un resumen de la actividad de ${name} en el CRM, con próximos pasos sugeridos.`,
    nextSteps: "Próximos pasos sugeridos",
    product: "Producto",
    expand: (l: string) => `Expandir ${l}`,
    collapse: (l: string) => `Contraer ${l}`,
  },
  it: {
    prospectNotFound: "Prospect non trovato.",
    backToSearch: "Tutti i prospect",
    message: "Messaggio",
    addToList: "Aggiungi a lista",
    edit: "Modifica",
    prospectActions: "Azioni prospect",
    deleteProspect: "Elimina prospect",
    tabOverview: "Panoramica",
    tabPrep: "Preparazione IA",
    tabHistory: "Cronologia",
    tabNotes: "Note",
    about: "Informazioni",
    buyingSignals: "Segnali d'acquisto",
    conversation: "Conversazione",
    openInInbox: "Apri nella posta in arrivo",
    you: "Tu",
    noConversation: "Ancora nessuna conversazione.",
    startOutreach: "Avvia il contatto",
    addedToList: (firstName: string, name: string) =>
      `${firstName} aggiunto a "${name}"`,
    crmFirstName: "Nome",
    crmLastName: "Cognome",
    crmEmail: "Email",
    crmPhone: "Telefono",
    crmCompany: "Azienda",
    crmJobTitle: "Ruolo",
    deleteTitle: "Eliminare il prospect?",
    deleteDescription: (fullName: string) =>
      `Questo eliminerà definitivamente ${fullName} e lo rimuoverà da tutte le liste. Questa azione non può essere annullata.`,
    deleteConfirm: "Elimina",
    prospectDeleted: "Prospect eliminato",
    contact: "Contatto",
    owner: "Proprietario",
    verified: "Verificata",
    reveal: "Rivela",
    linkedinProfile: "Profilo LinkedIn",
    addToCrm: "Aggiungi al CRM",
    notAvailable: "Non disponibile",
    revealEmailTitle: "Rivelare l'email?",
    revealPhoneTitle: "Rivelare il telefono?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `${cost} ${cost > 1 ? "crediti" : "credito"} per rivelare ${what} di ${firstName}.`,
    phoneNumber: "il numero di telefono",
    emailAddress: "l'indirizzo email",
    cancel: "Annulla",
    useCredits: (cost: number) => `${cost} ${cost > 1 ? "crediti" : "credito"}`,
    emailRevealed: "Email rivelata",
    phoneRevealed: "Telefono rivelato",
    enrichment: "Arricchimento",
    dataPoints: "30 punti dati",
    seniority: "Seniority",
    department: "Dipartimento",
    headcount: "Organico",
    industry: "Settore",
    revenue: "Fatturato",
    location: "Località",
    leadQualification: "Qualificazione del lead",
    icpFit: "Affinità con l'ICP",
    intent: "Intento",
    engagement: "Coinvolgimento",
    warmIntros: "Presentazioni",
    all: "Tutte",
    noWarmPaths: "Ancora nessun percorso caldo.",
    exploreNetwork: "Esplora la tua rete",
    strengthStrong: "Forte",
    strengthMedium: "Media",
    strengthWeak: "Debole",
    ask: (name: string) => `Chiedi a ${name}`,
    requestIntro: "Richiedi presentazione",
    introRequested: (name: string) =>
      `Presentazione richiesta tramite ${name}`,
    aiCallPrep: "Preparazione chiamata con IA",
    talkingPoints: "Punti chiave",
    discoveryQuestions: "Domande di discovery",
    likelyObjections: "Obiezioni probabili",
    aiEmailDrafts: "Bozze email con IA",
    copy: "Copia",
    copied: "Copiato negli appunti",
    use: "Usa",
    activityTimeline: "Cronologia attività",
    addNote: "Aggiungi una nota",
    notePlaceholder: "Cosa hai scoperto? Aggiungi contesto per il tuo team…",
    addNoteButton: "Aggiungi nota",
    noteAdded: "Nota aggiunta",
    noNotes: "Ancora nessuna nota.",
    youAuthor: "Tu",
    basedIn: (loc: string) => `Sede: ${loc}`,
    age: (range: string) => `Età: ${range}`,
    languagesLabel: "Lingue",
    professionalSummaryInfo: (name: string) =>
      `Una panoramica della carriera di ${name}, con i dettagli più rilevanti per il tuo approccio.`,
    engagementStrategyTitle: "Strategia di coinvolgimento",
    engagementStrategyInfo: (name: string) =>
      `Cosa fare e cosa evitare quando contatti ${name}, in base al suo ruolo e profilo.`,
    dos: "Cosa fare",
    donts: "Cosa evitare",
    challengesTitle: "Sfide",
    challengesInfo: (name: string) =>
      `Possibili criticità di ${name}, utili per adattare la tua proposta di valore.`,
    genericTab: "Generico",
    specificTab: "Specifico",
    valueProposition: "Proposta di valore",
    linkedinActivityTitle: "Attività su LinkedIn",
    noLinkedinActivity: "Ancora nessuna attività su LinkedIn.",
    reactions: (n: number) => `${n} reazion${n === 1 ? "e" : "i"}`,
    commentsCount: (n: number) => `${n} comment${n === 1 ? "o" : "i"}`,
    activityInsightsTitle: "Approfondimenti sull'attività",
    activityInsightsInfo: (name: string) =>
      `Un riepilogo dell'attività di ${name} nel CRM, con i prossimi passi consigliati.`,
    nextSteps: "Prossimi passi consigliati",
    product: "Prodotto",
    expand: (l: string) => `Espandi ${l}`,
    collapse: (l: string) => `Comprimi ${l}`,
  },
  fr: {
    prospectNotFound: "Prospect introuvable.",
    backToSearch: "Tous les prospects",
    message: "Message",
    addToList: "Ajouter à une liste",
    edit: "Modifier",
    prospectActions: "Actions du prospect",
    deleteProspect: "Supprimer le prospect",
    tabOverview: "Aperçu",
    tabPrep: "Prépa IA",
    tabHistory: "Historique",
    tabNotes: "Notes",
    about: "À propos",
    buyingSignals: "Signaux d'achat",
    conversation: "Conversation",
    openInInbox: "Ouvrir dans la boîte de réception",
    you: "Vous",
    noConversation: "Pas encore de conversation.",
    startOutreach: "Lancer la prise de contact",
    addedToList: (firstName: string, name: string) =>
      `${firstName} ajouté à "${name}"`,
    crmFirstName: "Prénom",
    crmLastName: "Nom",
    crmEmail: "E-mail",
    crmPhone: "Téléphone",
    crmCompany: "Entreprise",
    crmJobTitle: "Poste",
    deleteTitle: "Supprimer le prospect ?",
    deleteDescription: (fullName: string) =>
      `${fullName} sera définitivement supprimé, ainsi que de toutes les listes. Cette action est irréversible.`,
    deleteConfirm: "Supprimer",
    prospectDeleted: "Prospect supprimé",
    contact: "Contact",
    owner: "Propriétaire",
    verified: "Vérifié",
    reveal: "Révéler",
    linkedinProfile: "Profil LinkedIn",
    addToCrm: "Ajouter au CRM",
    notAvailable: "Non disponible",
    revealEmailTitle: "Révéler l'e-mail ?",
    revealPhoneTitle: "Révéler le téléphone ?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `${cost} crédit${cost > 1 ? "s" : ""} pour révéler ${what} de ${firstName}.`,
    phoneNumber: "le numéro de téléphone",
    emailAddress: "l'adresse e-mail",
    cancel: "Annuler",
    useCredits: (cost: number) => `${cost} crédit${cost > 1 ? "s" : ""}`,
    emailRevealed: "E-mail révélé",
    phoneRevealed: "Téléphone révélé",
    enrichment: "Enrichissement",
    dataPoints: "30 points de données",
    seniority: "Séniorité",
    department: "Service",
    headcount: "Effectif",
    industry: "Secteur",
    revenue: "Chiffre d'affaires",
    location: "Localisation",
    leadQualification: "Qualification du lead",
    icpFit: "Adéquation ICP",
    intent: "Intention",
    engagement: "Engagement",
    warmIntros: "Introductions",
    all: "Toutes",
    noWarmPaths: "Pas encore de mise en relation possible.",
    exploreNetwork: "Explorez votre réseau",
    strengthStrong: "Forte",
    strengthMedium: "Moyenne",
    strengthWeak: "Faible",
    ask: (name: string) => `Demander à ${name}`,
    requestIntro: "Demander une introduction",
    introRequested: (name: string) =>
      `Introduction demandée via ${name}`,
    aiCallPrep: "Préparation d'appel par IA",
    talkingPoints: "Points clés",
    discoveryQuestions: "Questions de découverte",
    likelyObjections: "Objections probables",
    aiEmailDrafts: "Brouillons d'e-mail par IA",
    copy: "Copier",
    copied: "Copié dans le presse-papiers",
    use: "Utiliser",
    activityTimeline: "Chronologie d'activité",
    addNote: "Ajouter une note",
    notePlaceholder: "Qu'avez-vous appris ? Ajoutez du contexte pour votre équipe…",
    addNoteButton: "Ajouter la note",
    noteAdded: "Note ajoutée",
    noNotes: "Pas encore de notes.",
    youAuthor: "Vous",
    basedIn: (loc: string) => `Basé à : ${loc}`,
    age: (range: string) => `Âge : ${range}`,
    languagesLabel: "Langues",
    professionalSummaryInfo: (name: string) =>
      `Un aperçu du parcours de ${name}, avec les informations les plus utiles pour votre approche.`,
    engagementStrategyTitle: "Stratégie d'approche",
    engagementStrategyInfo: (name: string) =>
      `Ce qu'il faut faire ou éviter pour approcher ${name}, selon son poste et son profil.`,
    dos: "À faire",
    donts: "À éviter",
    challengesTitle: "Défis",
    challengesInfo: (name: string) =>
      `Difficultés potentielles de ${name}, utiles pour adapter votre proposition de valeur.`,
    genericTab: "Générique",
    specificTab: "Spécifique",
    valueProposition: "Proposition de valeur",
    linkedinActivityTitle: "Activité LinkedIn",
    noLinkedinActivity: "Pas encore d'activité LinkedIn.",
    reactions: (n: number) => `${n} réaction${n > 1 ? "s" : ""}`,
    commentsCount: (n: number) => `${n} commentaire${n > 1 ? "s" : ""}`,
    activityInsightsTitle: "Aperçu de l'activité",
    activityInsightsInfo: (name: string) =>
      `Un résumé de l'activité CRM de ${name}, avec les prochaines étapes suggérées.`,
    nextSteps: "Prochaines étapes suggérées",
    product: "Produit",
    expand: (l: string) => `Développer ${l}`,
    collapse: (l: string) => `Réduire ${l}`,
  },
  de: {
    prospectNotFound: "Prospect nicht gefunden.",
    backToSearch: "Alle Prospects",
    message: "Nachricht",
    addToList: "Zu Liste hinzufügen",
    edit: "Bearbeiten",
    prospectActions: "Prospect-Aktionen",
    deleteProspect: "Prospect löschen",
    tabOverview: "Überblick",
    tabPrep: "KI-Prep",
    tabHistory: "Verlauf",
    tabNotes: "Notizen",
    about: "Über",
    buyingSignals: "Kaufsignale",
    conversation: "Unterhaltung",
    openInInbox: "Im Posteingang öffnen",
    you: "Du",
    noConversation: "Noch keine Unterhaltung.",
    startOutreach: "Outreach starten",
    addedToList: (firstName: string, name: string) =>
      `${firstName} zu "${name}" hinzugefügt`,
    crmFirstName: "Vorname",
    crmLastName: "Nachname",
    crmEmail: "E-Mail",
    crmPhone: "Telefon",
    crmCompany: "Unternehmen",
    crmJobTitle: "Jobtitel",
    deleteTitle: "Prospect löschen?",
    deleteDescription: (fullName: string) =>
      `Dies entfernt ${fullName} dauerhaft und aus allen Listen. Diese Aktion kann nicht rückgängig gemacht werden.`,
    deleteConfirm: "Löschen",
    prospectDeleted: "Prospect gelöscht",
    contact: "Kontakt",
    owner: "Owner",
    verified: "Verifiziert",
    reveal: "Aufdecken",
    linkedinProfile: "LinkedIn-Profil",
    addToCrm: "Zum CRM hinzufügen",
    notAvailable: "Nicht verfügbar",
    revealEmailTitle: "E-Mail aufdecken?",
    revealPhoneTitle: "Telefonnummer aufdecken?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `${cost} Credit${cost > 1 ? "s" : ""}, um die ${what} von ${firstName} aufzudecken.`,
    phoneNumber: "Telefonnummer",
    emailAddress: "E-Mail-Adresse",
    cancel: "Abbrechen",
    useCredits: (cost: number) => `${cost} Credit${cost > 1 ? "s" : ""}`,
    emailRevealed: "E-Mail aufgedeckt",
    phoneRevealed: "Telefonnummer aufgedeckt",
    enrichment: "Anreicherung",
    dataPoints: "30 Datenpunkte",
    seniority: "Seniorität",
    department: "Abteilung",
    headcount: "Mitarbeiterzahl",
    industry: "Branche",
    revenue: "Umsatz",
    location: "Standort",
    leadQualification: "Lead-Qualifizierung",
    icpFit: "ICP-Fit",
    intent: "Intent",
    engagement: "Engagement",
    warmIntros: "Warme Intros",
    all: "Alle",
    noWarmPaths: "Noch keine warmen Pfade.",
    exploreNetwork: "Erkunde dein Netzwerk",
    strengthStrong: "Stark",
    strengthMedium: "Mittel",
    strengthWeak: "Schwach",
    ask: (name: string) => `${name} fragen`,
    requestIntro: "Intro anfragen",
    introRequested: (name: string) =>
      `Intro über ${name} angefragt`,
    aiCallPrep: "KI-Anrufvorbereitung",
    talkingPoints: "Gesprächspunkte",
    discoveryQuestions: "Discovery-Fragen",
    likelyObjections: "Wahrscheinliche Einwände",
    aiEmailDrafts: "KI-E-Mail-Entwürfe",
    copy: "Kopieren",
    copied: "In die Zwischenablage kopiert",
    use: "Verwenden",
    activityTimeline: "Aktivitätsverlauf",
    addNote: "Eine Notiz hinzufügen",
    notePlaceholder: "Was hast du gelernt? Füge Kontext für dein Team hinzu…",
    addNoteButton: "Notiz hinzufügen",
    noteAdded: "Notiz hinzugefügt",
    noNotes: "Noch keine Notizen.",
    youAuthor: "Du",
    basedIn: (loc: string) => `Standort: ${loc}`,
    age: (range: string) => `Alter: ${range}`,
    languagesLabel: "Sprachen",
    professionalSummaryInfo: (name: string) =>
      `Ein Karriereüberblick zu ${name} mit den für deine Ansprache relevantesten Details.`,
    engagementStrategyTitle: "Engagement-Strategie",
    engagementStrategyInfo: (name: string) =>
      `Empfohlene Dos und Don'ts für die Ansprache von ${name}, basierend auf Rolle und Profil.`,
    dos: "Zu tun",
    donts: "Zu vermeiden",
    challengesTitle: "Herausforderungen",
    challengesInfo: (name: string) =>
      `Mögliche Herausforderungen von ${name}, hilfreich, um dein Nutzenversprechen anzupassen.`,
    genericTab: "Allgemein",
    specificTab: "Spezifisch",
    valueProposition: "Nutzenversprechen",
    linkedinActivityTitle: "LinkedIn-Aktivität",
    noLinkedinActivity: "Noch keine LinkedIn-Aktivität.",
    reactions: (n: number) => `${n} Reaktion${n === 1 ? "" : "en"}`,
    commentsCount: (n: number) => `${n} Kommentar${n === 1 ? "" : "e"}`,
    activityInsightsTitle: "Aktivitätseinblicke",
    activityInsightsInfo: (name: string) =>
      `Eine Zusammenfassung der CRM-Aktivität von ${name} mit vorgeschlagenen nächsten Schritten.`,
    nextSteps: "Vorgeschlagene nächste Schritte",
    product: "Produkt",
    expand: (l: string) => `${l} aufklappen`,
    collapse: (l: string) => `${l} zuklappen`,
  },
  pt: {
    prospectNotFound: "Prospect não encontrado.",
    backToSearch: "Todos os prospects",
    message: "Mensagem",
    addToList: "Adicionar a lista",
    edit: "Editar",
    prospectActions: "Ações do prospect",
    deleteProspect: "Eliminar prospect",
    tabOverview: "Resumo",
    tabPrep: "Preparação IA",
    tabHistory: "Histórico",
    tabNotes: "Notas",
    about: "Sobre",
    buyingSignals: "Sinais de compra",
    conversation: "Conversa",
    openInInbox: "Abrir na caixa de entrada",
    you: "Você",
    noConversation: "Ainda não há conversa.",
    startOutreach: "Iniciar contacto",
    addedToList: (firstName: string, name: string) =>
      `${firstName} adicionado a "${name}"`,
    crmFirstName: "Nome",
    crmLastName: "Apelido",
    crmEmail: "Email",
    crmPhone: "Telefone",
    crmCompany: "Empresa",
    crmJobTitle: "Cargo",
    deleteTitle: "Eliminar prospect?",
    deleteDescription: (fullName: string) =>
      `Isto removerá ${fullName} de forma permanente e de todas as listas. Esta ação não pode ser anulada.`,
    deleteConfirm: "Eliminar",
    prospectDeleted: "Prospect eliminado",
    contact: "Contacto",
    owner: "Proprietário",
    verified: "Verificado",
    reveal: "Revelar",
    linkedinProfile: "Perfil de LinkedIn",
    addToCrm: "Adicionar ao CRM",
    notAvailable: "Não disponível",
    revealEmailTitle: "Revelar email?",
    revealPhoneTitle: "Revelar telefone?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `${cost} crédito${cost > 1 ? "s" : ""} para revelar ${what} de ${firstName}.`,
    phoneNumber: "o número de telefone",
    emailAddress: "o endereço de email",
    cancel: "Cancelar",
    useCredits: (cost: number) => `${cost} crédito${cost > 1 ? "s" : ""}`,
    emailRevealed: "Email revelado",
    phoneRevealed: "Telefone revelado",
    enrichment: "Enriquecimento",
    dataPoints: "30 pontos de dados",
    seniority: "Senioridade",
    department: "Departamento",
    headcount: "Colaboradores",
    industry: "Setor",
    revenue: "Receita",
    location: "Localização",
    leadQualification: "Qualificação do lead",
    icpFit: "Encaixe com o ICP",
    intent: "Intenção",
    engagement: "Interação",
    warmIntros: "Apresentações",
    all: "Todas",
    noWarmPaths: "Ainda não há caminhos quentes.",
    exploreNetwork: "Explore a sua rede",
    strengthStrong: "Forte",
    strengthMedium: "Média",
    strengthWeak: "Fraca",
    ask: (name: string) => `Pedir a ${name}`,
    requestIntro: "Pedir apresentação",
    introRequested: (name: string) =>
      `Apresentação pedida através de ${name}`,
    aiCallPrep: "Preparação de chamada com IA",
    talkingPoints: "Pontos-chave",
    discoveryQuestions: "Perguntas de descoberta",
    likelyObjections: "Objeções prováveis",
    aiEmailDrafts: "Rascunhos de email com IA",
    copy: "Copiar",
    copied: "Copiado para a área de transferência",
    use: "Usar",
    activityTimeline: "Cronologia de atividade",
    addNote: "Adicionar uma nota",
    notePlaceholder: "O que aprendeu? Adicione contexto para a sua equipa…",
    addNoteButton: "Adicionar nota",
    noteAdded: "Nota adicionada",
    noNotes: "Ainda não há notas.",
    youAuthor: "Você",
    basedIn: (loc: string) => `Localização: ${loc}`,
    age: (range: string) => `Idade: ${range}`,
    languagesLabel: "Idiomas",
    professionalSummaryInfo: (name: string) =>
      `Uma visão geral da carreira de ${name}, com os detalhes mais relevantes para o seu contacto.`,
    engagementStrategyTitle: "Estratégia de envolvimento",
    engagementStrategyInfo: (name: string) =>
      `O que fazer e evitar ao contactar ${name}, com base na função e perfil.`,
    dos: "O que fazer",
    donts: "O que evitar",
    challengesTitle: "Desafios",
    challengesInfo: (name: string) =>
      `Possíveis pontos de dor de ${name}, úteis para adaptar a sua proposta de valor.`,
    genericTab: "Genérico",
    specificTab: "Específico",
    valueProposition: "Proposta de valor",
    linkedinActivityTitle: "Atividade no LinkedIn",
    noLinkedinActivity: "Ainda não há atividade no LinkedIn.",
    reactions: (n: number) => `${n} reaç${n === 1 ? "ão" : "ões"}`,
    commentsCount: (n: number) => `${n} comentário${n === 1 ? "" : "s"}`,
    activityInsightsTitle: "Informações de atividade",
    activityInsightsInfo: (name: string) =>
      `Um resumo da atividade de ${name} no CRM, com próximos passos sugeridos.`,
    nextSteps: "Próximos passos sugeridos",
    product: "Produto",
    expand: (l: string) => `Expandir ${l}`,
    collapse: (l: string) => `Recolher ${l}`,
  },
  pt_BR: {
    prospectNotFound: "Prospect não encontrado.",
    backToSearch: "Todos os prospects",
    message: "Mensagem",
    addToList: "Adicionar à lista",
    edit: "Editar",
    prospectActions: "Ações do prospect",
    deleteProspect: "Excluir prospect",
    tabOverview: "Resumo",
    tabPrep: "Preparação IA",
    tabHistory: "Histórico",
    tabNotes: "Notas",
    about: "Sobre",
    buyingSignals: "Sinais de compra",
    conversation: "Conversa",
    openInInbox: "Abrir na caixa de entrada",
    you: "Você",
    noConversation: "Ainda não há conversa.",
    startOutreach: "Iniciar contato",
    addedToList: (firstName: string, name: string) =>
      `${firstName} adicionado a "${name}"`,
    crmFirstName: "Nome",
    crmLastName: "Sobrenome",
    crmEmail: "E-mail",
    crmPhone: "Telefone",
    crmCompany: "Empresa",
    crmJobTitle: "Cargo",
    deleteTitle: "Excluir prospect?",
    deleteDescription: (fullName: string) =>
      `Isso removerá ${fullName} permanentemente e de todas as listas. Essa ação não pode ser desfeita.`,
    deleteConfirm: "Excluir",
    prospectDeleted: "Prospect excluído",
    contact: "Contato",
    owner: "Responsável",
    verified: "Verificado",
    reveal: "Revelar",
    linkedinProfile: "Perfil do LinkedIn",
    addToCrm: "Adicionar ao CRM",
    notAvailable: "Não disponível",
    revealEmailTitle: "Revelar e-mail?",
    revealPhoneTitle: "Revelar telefone?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `${cost} crédito${cost > 1 ? "s" : ""} para revelar ${what} de ${firstName}.`,
    phoneNumber: "o número de telefone",
    emailAddress: "o endereço de e-mail",
    cancel: "Cancelar",
    useCredits: (cost: number) => `${cost} crédito${cost > 1 ? "s" : ""}`,
    emailRevealed: "E-mail revelado",
    phoneRevealed: "Telefone revelado",
    enrichment: "Enriquecimento",
    dataPoints: "30 pontos de dados",
    seniority: "Senioridade",
    department: "Departamento",
    headcount: "Funcionários",
    industry: "Setor",
    revenue: "Receita",
    location: "Localização",
    leadQualification: "Qualificação do lead",
    icpFit: "Fit com o ICP",
    intent: "Intenção",
    engagement: "Engajamento",
    warmIntros: "Apresentações",
    all: "Todas",
    noWarmPaths: "Ainda não há caminhos quentes.",
    exploreNetwork: "Explore sua rede",
    strengthStrong: "Forte",
    strengthMedium: "Média",
    strengthWeak: "Fraca",
    ask: (name: string) => `Pedir para ${name}`,
    requestIntro: "Pedir apresentação",
    introRequested: (name: string) =>
      `Apresentação solicitada via ${name}`,
    aiCallPrep: "Preparação de ligação com IA",
    talkingPoints: "Pontos-chave",
    discoveryQuestions: "Perguntas de descoberta",
    likelyObjections: "Objeções prováveis",
    aiEmailDrafts: "Rascunhos de e-mail com IA",
    copy: "Copiar",
    copied: "Copiado para a área de transferência",
    use: "Usar",
    activityTimeline: "Linha do tempo de atividades",
    addNote: "Adicionar uma nota",
    notePlaceholder: "O que você aprendeu? Adicione contexto para seu time…",
    addNoteButton: "Adicionar nota",
    noteAdded: "Nota adicionada",
    noNotes: "Ainda não há notas.",
    youAuthor: "Você",
    basedIn: (loc: string) => `Localização: ${loc}`,
    age: (range: string) => `Idade: ${range}`,
    languagesLabel: "Idiomas",
    professionalSummaryInfo: (name: string) =>
      `Uma visão geral da carreira de ${name}, com os detalhes mais relevantes para o seu contato.`,
    engagementStrategyTitle: "Estratégia de engajamento",
    engagementStrategyInfo: (name: string) =>
      `O que fazer e evitar ao contatar ${name}, com base na função e perfil.`,
    dos: "O que fazer",
    donts: "O que evitar",
    challengesTitle: "Desafios",
    challengesInfo: (name: string) =>
      `Possíveis pontos de dor de ${name}, úteis para adaptar sua proposta de valor.`,
    genericTab: "Genérico",
    specificTab: "Específico",
    valueProposition: "Proposta de valor",
    linkedinActivityTitle: "Atividade no LinkedIn",
    noLinkedinActivity: "Ainda não há atividade no LinkedIn.",
    reactions: (n: number) => `${n} reaç${n === 1 ? "ão" : "ões"}`,
    commentsCount: (n: number) => `${n} comentário${n === 1 ? "" : "s"}`,
    activityInsightsTitle: "Insights de atividade",
    activityInsightsInfo: (name: string) =>
      `Um resumo da atividade de ${name} no CRM, com próximos passos sugeridos.`,
    nextSteps: "Próximos passos sugeridos",
    product: "Produto",
    expand: (l: string) => `Expandir ${l}`,
    collapse: (l: string) => `Recolher ${l}`,
  },
} as const

export default function ProspectProfile() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const navigate = useNavigate()
  const prospects = useProspects()
  const prospect = id ? prospects.find((p) => p.id === id) : undefined
  const [addOpen, setAddOpen] = React.useState(false)
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [crmOpen, setCrmOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  // Visiting a prospect registers it as an open tab — same mental model as a
  // browser tab appearing the moment you navigate somewhere.
  React.useEffect(() => {
    if (id) prospectTabsStore.open(id)
  }, [id])

  if (!prospect) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.prospectNotFound}</p>
        <BackLink to="/search" label={c.backToSearch} variant="link" />
      </Page>
    )
  }

  const conversation = conversations.find((c) => c.prospectId === prospect.id)

  return (
    <>
      {/* Same max-w-7xl container as the page body below, so the tab strip's
          edges line up with the content it sits above rather than running
          wider than it. */}
      <Page className="pb-0">
        <ProspectTabBar currentId={prospect.id} />
      </Page>

      <Page className="pt-0">
      <BackLink to="/search" label={c.backToSearch} />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <ProspectAvatar
            prospect={prospect}
            className="size-16 text-lg sm:size-20"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {prospect.firstName} {prospect.lastName}
              </h1>
              <ScoreBadge score={prospect.score} />
              <StatusBadge status={prospect.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {prospect.title} · {prospect.company}
            </p>
            <ProspectFactsRow prospect={prospect} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prospect.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="volt" onClick={() => setComposeOpen(true)}>
              <Send className="size-4" />
              {c.message}
            </Button>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              {c.addToList}
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              {c.edit}
            </Button>
            <TrackButton
              kind="prospect"
              id={prospect.id}
              name={prospect.firstName}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={c.prospectActions}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  {c.deleteProspect}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">{c.tabOverview}</TabsTrigger>
              <TabsTrigger value="prep">{c.tabPrep}</TabsTrigger>
              <TabsTrigger value="history">{c.tabHistory}</TabsTrigger>
              <TabsTrigger value="notes">{c.tabNotes}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {c.about}
                    <InfoHint label={c.about}>
                      {c.professionalSummaryInfo(
                        `${prospect.firstName} ${prospect.lastName}`
                      )}
                    </InfoHint>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {professionalSummaryBullets(prospect).map((bullet) => (
                      <li
                        key={bullet}
                        className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed"
                      >
                        <span className="bg-muted-foreground/40 mt-1.5 size-1 shrink-0 rounded-full" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="text-primary size-4" />
                    {c.buyingSignals}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {prospect.signals.map((s) => (
                    <div
                      key={s}
                      className="bg-chart-1/10 text-chart-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                    >
                      <span className="bg-current size-1.5 rounded-full" />
                      {s}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <EngagementStrategyCard prospect={prospect} />
              <ChallengesCard prospect={prospect} />
              <LinkedInActivityCard prospect={prospect} />
              <ActivityInsightsCard prospect={prospect} />

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">{c.conversation}</CardTitle>
                  {conversation && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/inbox">{c.openInInbox}</Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {conversation ? (
                    <div className="space-y-3">
                      {conversation.messages.map((m) => (
                        <div
                          key={m.id}
                          className={
                            m.direction === "outbound"
                              ? "ml-8 rounded-lg rounded-tr-sm bg-primary/10 px-3 py-2"
                              : "mr-8 rounded-lg rounded-tl-sm bg-muted px-3 py-2"
                          }
                        >
                          <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                            <span>
                              {m.direction === "outbound"
                                ? c.you
                                : prospect.firstName}{" "}
                              · {m.channel}
                            </span>
                            <span>{relativeTime(m.timestamp)}</span>
                          </div>
                          <p className="text-sm">{m.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        {c.noConversation}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => setComposeOpen(true)}
                      >
                        <Send className="size-4" />
                        {c.startOutreach}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prep">
              <PrepTab prospect={prospect} onUse={() => setComposeOpen(true)} />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab prospect={prospect} />
            </TabsContent>

            <TabsContent value="notes">
              <NotesTab prospect={prospect} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ContactCard prospect={prospect} onAddToCrm={() => setCrmOpen(true)} />
          <OwnerCard prospect={prospect} />
          <WarmIntroCard prospect={prospect} />
          <QualificationCard prospect={prospect} />
          <EnrichmentCard prospect={prospect} onAddToCrm={() => setCrmOpen(true)} />
        </div>
      </div>

      <AddToListDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        count={1}
        onAdded={(name) =>
          toast.success(c.addedToList(prospect.firstName, name))
        }
      />
      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        prospect={prospect}
      />
      <AddToCrmDialog
        open={crmOpen}
        onOpenChange={setCrmOpen}
        kind="prospect"
        recordId={prospect.id}
        recordName={`${prospect.firstName} ${prospect.lastName}`}
        accountName={prospect.company}
        fields={[
          { label: c.crmFirstName, value: prospect.firstName },
          { label: c.crmLastName, value: prospect.lastName },
          { label: c.crmEmail, value: prospect.email },
          { label: c.crmPhone, value: prospect.phone ?? "—" },
          { label: c.crmCompany, value: prospect.company },
          { label: c.crmJobTitle, value: prospect.title },
        ]}
      />
      <ProspectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        prospect={prospect}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={c.deleteTitle}
        description={c.deleteDescription(
          `${prospect.firstName} ${prospect.lastName}`
        )}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          prospectStore.remove(prospect.id)
          toast.success(c.prospectDeleted)
          navigate("/search")
        }}
      />
      </Page>
    </>
  )
}

/* ----------------------------- Quick facts pills ----------------------------- */

// Header-level "at a glance" pills — mirrors the extension's ContactCard
// badge row (location, age, languages, LinkedIn handle). Email/phone reveal
// stays exclusively in the sidebar Contact card below to avoid two divergent
// reveal affordances for the same credit-gated action on one page.
function ProspectFactsRow({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {prospect.ageRange && (
        <Badge variant="outline" className="font-normal">
          <User className="size-3" />
          {c.age(prospect.ageRange)}
        </Badge>
      )}
      <Badge variant="outline" className="font-normal">
        <MapPin className="size-3" />
        {c.basedIn(prospect.location)}
      </Badge>
      {prospect.languages && prospect.languages.length > 0 && (
        <Badge
          variant="outline"
          className="font-normal"
          title={prospect.languages.map((l) => l.name).join(", ")}
        >
          <LanguagesIcon className="size-3" />
          {c.languagesLabel}: {prospect.languages.map((l) => l.flag).join(" ")}
        </Badge>
      )}
      <Badge variant="outline" className="font-normal" asChild>
        <a
          href={prospect.linkedinUrl}
          target="_blank"
          rel="noreferrer"
          className="hover:bg-accent"
        >
          <LinkedinIcon className="size-3" />
          {linkedinHandle(prospect.linkedinUrl)}
        </a>
      </Badge>
    </div>
  )
}

/* ----------------------------- Collapsible section card ----------------------------- */

// Page-local collapsible card matching the extension's accordion-per-section
// pattern for the Overview tab's AI-derived content blocks.
function CollapsibleCard({
  icon: Icon,
  title,
  infoText,
  defaultOpen = true,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  infoText?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <Card>
      <CardHeader
        className="flex-row items-center justify-between cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="text-primary size-4" />
          {title}
          {infoText && <InfoHint label={title}>{infoText}</InfoHint>}
        </CardTitle>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? c.collapse(title) : c.expand(title)}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((o) => !o)
          }}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </CardHeader>
      {open && <CardContent className="space-y-4">{children}</CardContent>}
    </Card>
  )
}

/* ----------------------------- Engagement strategy ----------------------------- */

function EngagementStrategyCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const strategy = engagementStrategy(prospect)
  return (
    <CollapsibleCard
      icon={Handshake}
      title={c.engagementStrategyTitle}
      infoText={c.engagementStrategyInfo(
        `${prospect.firstName} ${prospect.lastName}`
      )}
    >
      <div>
        <p className="mb-2 text-sm font-medium">{c.dos}</p>
        <ul className="space-y-1.5">
          {strategy.dos.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <ThumbsUp className="text-chart-1 mt-0.5 size-3.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Separator />
      <div>
        <p className="mb-2 text-sm font-medium">{c.donts}</p>
        <ul className="space-y-1.5">
          {strategy.donts.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <XCircle className="text-destructive mt-0.5 size-3.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </CollapsibleCard>
  )
}

/* ----------------------------- Challenges ----------------------------- */

function ChallengesCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const ch = challenges(prospect)
  return (
    <CollapsibleCard
      icon={AlertTriangle}
      title={c.challengesTitle}
      infoText={c.challengesInfo(`${prospect.firstName} ${prospect.lastName}`)}
    >
      <Tabs defaultValue="generic">
        <TabsList>
          <TabsTrigger value="generic">{c.genericTab}</TabsTrigger>
          <TabsTrigger value="specific">{c.specificTab}</TabsTrigger>
        </TabsList>
        <TabsContent value="generic" className="space-y-2 pt-3">
          {ch.generic.map((item) => (
            <div key={item} className="bg-muted/50 rounded-md p-3 text-sm">
              {item}
            </div>
          ))}
        </TabsContent>
        <TabsContent value="specific" className="space-y-3 pt-3">
          <div className="space-y-2">
            {ch.specific.map((item) => (
              <div key={item} className="bg-muted/50 rounded-md p-3 text-sm">
                {item}
              </div>
            ))}
          </div>
          <div className="bg-primary/5 rounded-md p-3">
            <p className="text-primary mb-1 text-xs font-semibold">
              {c.valueProposition}
            </p>
            <p className="text-sm">{ch.valueProp}</p>
          </div>
        </TabsContent>
      </Tabs>
    </CollapsibleCard>
  )
}

/* ----------------------------- LinkedIn activity ----------------------------- */

function LinkedInActivityCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const posts = linkedinActivity(prospect)
  return (
    <CollapsibleCard
      icon={LinkedinIcon}
      title={c.linkedinActivityTitle}
      defaultOpen={false}
    >
      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">{c.noLinkedinActivity}</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-lg border p-3">
              <p className="text-sm">{post.summary}</p>
              <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                <span>
                  {c.reactions(post.reactions)} · {c.commentsCount(post.comments)}
                </span>
                <span>{relativeTime(post.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  )
}

/* ----------------------------- Activity insights ----------------------------- */

function ActivityInsightsCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const insights = activityInsights(prospect, CONNECTED_CRM_PROVIDER.name)
  return (
    <CollapsibleCard
      icon={Activity}
      title={c.activityInsightsTitle}
      infoText={c.activityInsightsInfo(
        `${prospect.firstName} ${prospect.lastName}`
      )}
      defaultOpen={false}
    >
      <p className="text-muted-foreground text-sm leading-relaxed">
        {insights.summary}
      </p>
      <div>
        <p className="mb-2 text-sm font-medium">{c.nextSteps}</p>
        <ul className="space-y-1.5">
          {insights.nextSteps.map((step) => (
            <li key={step} className="flex items-start gap-2 text-sm">
              <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
              {step}
            </li>
          ))}
        </ul>
      </div>
    </CollapsibleCard>
  )
}

/* ----------------------------- Owner ----------------------------- */

function OwnerCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.owner}</CardTitle>
      </CardHeader>
      <CardContent>
        <AssigneePicker
          value={prospect.ownerId}
          onChange={(ownerId) =>
            prospectStore.update(prospect.id, { ownerId })
          }
        />
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Contact (credit-gated reveal) ----------------------------- */

function ContactCard({
  prospect,
  onAddToCrm,
}: {
  prospect: Prospect
  onAddToCrm: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { spend } = useCredits()
  const [emailShown, setEmailShown] = React.useState(false)
  const [phoneShown, setPhoneShown] = React.useState(false)
  const [confirm, setConfirm] = React.useState<null | "email" | "phone">(null)

  const maskedEmail = `••••••@${prospect.companyDomain}`
  const maskedPhone = "+1 (•••) •••-••••"
  const cost = confirm === "phone" ? 2 : 1

  function doReveal() {
    if (!confirm) return
    const label = `${confirm === "email" ? "Email" : "Phone"} reveal · ${prospect.firstName} ${prospect.lastName}`
    if (spend(cost, label)) {
      if (confirm === "email") setEmailShown(true)
      else setPhoneShown(true)
      toast.success(confirm === "email" ? c.emailRevealed : c.phoneRevealed)
    }
    setConfirm(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.contact}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground size-4 shrink-0" />
            {emailShown ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <a
                  href={`mailto:${prospect.email}`}
                  className="hover:text-primary truncate"
                >
                  {prospect.email}
                </a>
                <span className="text-chart-1 flex shrink-0 items-center gap-1 text-xs font-medium">
                  <CheckCircle2 className="size-3.5" />
                  {c.verified}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setConfirm("email")}
                className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-between gap-2"
              >
                <span className="truncate">{maskedEmail}</span>
                <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-medium">
                  <Lock className="size-3" />
                  {c.reveal} · 1
                </span>
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="text-muted-foreground size-4 shrink-0" />
            {phoneShown ? (
              <span>{prospect.phone ?? c.notAvailable}</span>
            ) : (
              <button
                onClick={() => setConfirm("phone")}
                className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-between gap-2"
              >
                <span className="truncate">{maskedPhone}</span>
                <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-medium">
                  <Lock className="size-3" />
                  {c.reveal} · 2
                </span>
              </button>
            )}
          </div>

          <a
            href={prospect.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary flex items-center gap-3"
          >
            <LinkedinIcon className="text-muted-foreground size-4" />
            <span className="truncate">{c.linkedinProfile}</span>
          </a>

          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddToCrm}
          >
            <Building2 className="size-4" />
            {c.addToCrm}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirm === "phone" ? c.revealPhoneTitle : c.revealEmailTitle}
            </DialogTitle>
            <DialogDescription>
              {c.revealDesc(
                cost,
                prospect.firstName,
                confirm === "phone" ? c.phoneNumber : c.emailAddress
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              {c.cancel}
            </Button>
            <Button onClick={doReveal}>
              <Lock className="size-4" />
              {c.useCredits(cost)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ----------------------------- Enrichment ----------------------------- */

function EnrichmentCard({
  prospect,
  onAddToCrm,
}: {
  prospect: Prospect
  onAddToCrm: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const enrichment = [
    { label: c.seniority, value: prospect.seniority },
    { label: c.department, value: prospect.department },
    { label: c.headcount, value: prospect.headcount },
    { label: c.industry, value: prospect.industry },
    { label: c.revenue, value: prospect.revenue },
    { label: c.location, value: prospect.location },
  ]
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{c.enrichment}</CardTitle>
        <Badge variant="secondary" className="font-normal">
          {c.dataPoints}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {enrichment.map((e) => (
            <div key={e.label}>
              <p className="text-muted-foreground text-xs">{e.label}</p>
              <p className="text-sm font-medium">{e.value}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onAddToCrm}
        >
          <Building2 className="size-4" />
          {c.addToCrm}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Lead qualification ----------------------------- */

function QualificationCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const q = qualification(prospect)
  const rows = [
    { label: c.icpFit, value: q.fit },
    { label: c.intent, value: q.intent },
    { label: c.engagement, value: q.engagement },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="text-primary size-4" />
          {c.leadQualification}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium tabular-nums">{r.value}</span>
            </div>
            <Progress value={r.value} />
          </div>
        ))}
        <Separator />
        <ul className="space-y-1.5">
          {q.reasons.map((reason) => (
            <li
              key={reason}
              className="text-muted-foreground flex items-start gap-2 text-xs"
            >
              <span className="bg-muted-foreground/40 mt-1.5 size-1 shrink-0 rounded-full" />
              {reason}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Warm intros ----------------------------- */

const INTRO_VARIANT: Record<
  IntroStrength,
  "success" | "secondary" | "outline"
> = {
  strong: "success",
  medium: "secondary",
  weak: "outline",
}

function WarmIntroCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const strengthLabels: Record<IntroStrength, string> = {
    strong: c.strengthStrong,
    medium: c.strengthMedium,
    weak: c.strengthWeak,
  }
  const paths = getIntroPaths(prospect.id)
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Waypoints className="text-primary size-4" />
          {c.warmIntros}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/intros">{c.all}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {paths.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {c.noWarmPaths}{" "}
            <Link to="/intros" className="text-primary">
              {c.exploreNetwork}
            </Link>
          </p>
        ) : (
          paths.slice(0, 2).map((path) => (
            <div key={path.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarFallback
                    style={{ backgroundColor: path.connectorAvatarColor, color: "white" }}
                    className="text-[10px]"
                  >
                    {initials(
                      path.connectorName.split(" ")[0],
                      path.connectorName.split(" ")[1]
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {path.connectorName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {path.connectorTitle}
                  </p>
                </div>
                <Badge variant={INTRO_VARIANT[path.strength]}>
                  {strengthLabels[path.strength]}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">{path.via}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toast.success(c.introRequested(path.connectorName))}
              >
                {path.connectorIsTeam
                  ? c.ask(path.connectorName.split(" ")[0])
                  : c.requestIntro}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

/* ----------------------------- AI Prep ----------------------------- */

function PrepTab({
  prospect,
  onUse,
}: {
  prospect: Prospect
  onUse: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const products = useProducts()
  const [productId, setProductId] = React.useState(products[0]?.id)
  const selectedProduct =
    products.find((pr) => pr.id === productId) ?? products[0]
  const prep = callPrep(prospect, selectedProduct)
  const emails = emailPrep(prospect, selectedProduct)

  return (
    <div className="space-y-6">
      {products.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{c.product}</span>
          <Select value={selectedProduct?.id} onValueChange={setProductId}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((pr) => (
                <SelectItem key={pr.id} value={pr.id}>
                  {pr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PhoneCall className="text-primary size-4" />
            {c.aiCallPrep}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PrepSection title={c.talkingPoints} items={prep.talkingPoints} />
          <PrepSection
            title={c.discoveryQuestions}
            items={prep.discoveryQuestions}
          />
          <div>
            <p className="mb-2 text-sm font-medium">{c.likelyObjections}</p>
            <div className="space-y-2">
              {prep.objections.map((o) => (
                <div key={o.objection} className="bg-muted/50 rounded-md p-3">
                  <p className="text-sm font-medium">“{o.objection}”</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    → {o.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-primary size-4" />
            {c.aiEmailDrafts}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emails.map((e) => (
            <div key={e.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary" className="font-normal">
                  {e.tone}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${e.subject}\n\n${e.body}`)
                      toast.success(c.copied)
                    }}
                  >
                    <Copy className="size-3.5" />
                    {c.copy}
                  </Button>
                  <Button variant="outline" size="sm" onClick={onUse}>
                    <Send className="size-3.5" />
                    {c.use}
                  </Button>
                </div>
              </div>
              <p className="text-sm font-medium">{e.subject}</p>
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                {e.body}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function PrepSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------- History ----------------------------- */

const HISTORY_META: Record<
  HistoryType,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  added: { icon: UserPlus, tint: "bg-muted text-muted-foreground" },
  enriched: { icon: Sparkles, tint: "bg-primary/15 text-primary" },
  email_sent: { icon: MailCheck, tint: "bg-chart-2/15 text-chart-2" },
  email_opened: { icon: MailOpen, tint: "bg-chart-2/15 text-chart-2" },
  replied: { icon: Reply, tint: "bg-chart-1/15 text-chart-1" },
  call: { icon: PhoneCall, tint: "bg-chart-4/15 text-chart-4" },
  meeting: { icon: CalendarCheck, tint: "bg-chart-1/15 text-chart-1" },
  note: { icon: StickyNote, tint: "bg-chart-4/15 text-chart-4" },
  status: { icon: Clock, tint: "bg-muted text-muted-foreground" },
}

function HistoryTab({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const events = getHistory(prospect)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.activityTimeline}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l pl-6">
          {events.map((e) => {
            const meta = HISTORY_META[e.type]
            const Icon = meta.icon
            return (
              <li key={e.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[2.05rem] flex size-6 items-center justify-center rounded-full ring-4 ring-background",
                    meta.tint
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{e.label}</p>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {relativeTime(e.timestamp)}
                  </span>
                </div>
                {e.detail && (
                  <p className="text-muted-foreground text-xs">{e.detail}</p>
                )}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Notes ----------------------------- */

function NotesTab({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { user } = useAuth()
  const [notes, setNotes] = React.useState<ProspectNote[]>(() =>
    getNotes(prospect.id)
  )
  const [body, setBody] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const idRef = React.useRef(0)

  function toggleTag(tag: string) {
    setTags((t) =>
      t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]
    )
  }

  function addNote() {
    if (!body.trim()) return
    idRef.current += 1
    setNotes((n) => [
      {
        id: `note_new_${idRef.current}`,
        author: user?.name ?? c.youAuthor,
        body: body.trim(),
        tags,
        createdAt: new Date().toISOString(),
      },
      ...n,
    ])
    setBody("")
    setTags([])
    toast.success(c.noteAdded)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.addNote}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={c.notePlaceholder}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-24"
          />
          <div className="flex flex-wrap gap-1.5">
            {SMART_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  tags.includes(tag)
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={addNote} disabled={!body.trim()}>
              <Plus className="size-4" />
              {c.addNoteButton}
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">{c.noNotes}</p>
      ) : (
        notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{note.author}</p>
                <span className="text-muted-foreground text-xs">
                  {relativeTime(note.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              {note.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {note.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
