import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Mail,
  Trash2,
  GripVertical,
  Copy,
  Check,
  FolderPlus,
  Pencil,
  MoreHorizontal,
  Braces,
  Sparkles,
  Wand2,
  MessageCircle,
  Columns3,
} from "lucide-react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/common/RichTextEditor"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import {
  useColumnPrefs,
  type ColumnDef,
  type ColGroup,
} from "@/lib/table-columns"
import { Card } from "@/components/ui/card"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import { Segmented } from "@/components/common/Segmented"
import { PromptFormDialog } from "@/components/templates/PromptFormDialog"
import {
  usePromptTemplates,
  promptTemplateStore,
  type PromptTemplate,
} from "@/lib/prompt-templates"
import type { CollectionView } from "@/components/common/ViewToggle"
import { useTemplates, templateStore } from "@/lib/store"
import { folderStore, useTemplateFolders } from "@/lib/template-folders"
import { generateTemplate, PROMPT_PRESETS } from "@/lib/mock-template-ai"
import { TemplateRecommendations } from "@/components/common/Recommendations"
import { useLocale, type Locale } from "@/lib/locale"
import { downloadCsv } from "@/lib/csv"
import { formatDate } from "@/lib/format"
import {
  MERGE_VARIABLE_GROUPS,
  groupByMergeVarGroup,
  type MergeVarGroupKey,
} from "@/lib/merge-vars"
import type { Channel, EmailTemplate } from "@/lib/types"
import { cn } from "@/lib/utils"

const NEW_FOLDER = "__new_folder__"

interface VariableDef {
  tag: string
  label: Record<Locale, string>
  def: Record<Locale, string>
}

// Compact 7-locale record builder, mirroring lib/table-columns.tsx's L().
function V(
  en: string,
  es: string,
  it: string,
  fr: string,
  de: string,
  pt: string,
  pt_BR: string
): Record<Locale, string> {
  return { en, es, it, fr, de, pt, pt_BR }
}

const VARIABLES: VariableDef[] = [
  {
    tag: "first_name",
    label: V("First name", "Nombre", "Nome", "Prénom", "Vorname", "Primeiro nome", "Primeiro nome"),
    def: V(
      "Recipient's first name",
      "Nombre del destinatario",
      "Nome del destinatario",
      "Prénom du destinataire",
      "Vorname des Empfängers",
      "Primeiro nome do destinatário",
      "Primeiro nome do destinatário"
    ),
  },
  {
    tag: "last_name",
    label: V("Last name", "Apellido", "Cognome", "Nom de famille", "Nachname", "Apelido", "Sobrenome"),
    def: V(
      "Recipient's last name",
      "Apellido del destinatario",
      "Cognome del destinatario",
      "Nom de famille du destinataire",
      "Nachname des Empfängers",
      "Apelido do destinatário",
      "Sobrenome do destinatário"
    ),
  },
  {
    tag: "company",
    label: V("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa"),
    def: V(
      "Recipient's company",
      "Empresa del destinatario",
      "Azienda del destinatario",
      "Entreprise du destinataire",
      "Unternehmen des Empfängers",
      "Empresa do destinatário",
      "Empresa do destinatário"
    ),
  },
  {
    tag: "title",
    label: V("Job title", "Cargo", "Ruolo", "Poste", "Berufsbezeichnung", "Cargo", "Cargo"),
    def: V(
      "Recipient's job title",
      "Cargo del destinatario",
      "Ruolo del destinatario",
      "Poste du destinataire",
      "Berufsbezeichnung des Empfängers",
      "Cargo do destinatário",
      "Cargo do destinatário"
    ),
  },
  {
    tag: "industry",
    label: V("Industry", "Sector", "Settore", "Secteur", "Branche", "Setor", "Setor"),
    def: V(
      "Recipient's industry",
      "Sector del destinatario",
      "Settore del destinatario",
      "Secteur du destinataire",
      "Branche des Empfängers",
      "Setor do destinatário",
      "Setor do destinatário"
    ),
  },
  {
    tag: "city",
    label: V("City", "Ciudad", "Città", "Ville", "Stadt", "Cidade", "Cidade"),
    def: V(
      "Recipient's city",
      "Ciudad del destinatario",
      "Città del destinatario",
      "Ville du destinataire",
      "Stadt des Empfängers",
      "Cidade do destinatário",
      "Cidade do destinatário"
    ),
  },
  {
    tag: "sender",
    label: V("Sender", "Remitente", "Mittente", "Expéditeur", "Absender", "Remetente", "Remetente"),
    def: V("Your name", "Tu nombre", "Il tuo nome", "Votre nom", "Dein Name", "O seu nome", "Seu nome"),
  },
  {
    tag: "sender_company",
    label: V("Your company", "Tu empresa", "La tua azienda", "Votre entreprise", "Dein Unternehmen", "A sua empresa", "Sua empresa"),
    def: V(
      "Your company name",
      "El nombre de tu empresa",
      "Il nome della tua azienda",
      "Le nom de votre entreprise",
      "Der Name deines Unternehmens",
      "O nome da sua empresa",
      "O nome da sua empresa"
    ),
  },
  {
    tag: "sender_title",
    label: V("Your title", "Tu cargo", "Il tuo ruolo", "Votre poste", "Deine Position", "O seu cargo", "Seu cargo"),
    def: V("Your job title", "Tu cargo", "Il tuo ruolo", "Votre poste", "Deine Position", "O seu cargo", "Seu cargo"),
  },
  {
    tag: "calendar_link",
    label: V("Booking link", "Enlace de reserva", "Link di prenotazione", "Lien de réservation", "Buchungslink", "Link de marcação", "Link de agendamento"),
    def: V(
      "Your meeting booking link",
      "Tu enlace para agendar",
      "Il tuo link per prenotare un incontro",
      "Votre lien de réservation de rendez-vous",
      "Dein Buchungslink für Meetings",
      "O seu link de marcação de reuniões",
      "Seu link de agendamento de reuniões"
    ),
  },
]

// Dummy merge data used to render the live preview as a recipient would see it.
// Exported for reuse anywhere else that previews a template outside a single
// recipient's context (e.g. picking a template for a Campaign sequence step).
export const SAMPLE_DATA: Record<string, string> = {
  first_name: "Sarah",
  last_name: "Chen",
  company: "Acme Corp",
  title: "VP of Sales",
  industry: "SaaS",
  city: "San Francisco",
  sender: "Alex Rivera",
  sender_company: "Kombo",
  sender_title: "Account Executive",
  calendar_link: "cal.com/alex-rivera",
}

// Substitute {{tag}} with sample data; unknown tags are left literal so the
// author can still spot a typo'd variable in the preview.
function renderWithSample(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, tag: string) =>
    Object.prototype.hasOwnProperty.call(SAMPLE_DATA, tag)
      ? SAMPLE_DATA[tag]
      : whole
  )
}

// Bodies are stored as HTML (rich text). Plain-text snippet for list rows.
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Normalize a body into HTML for the rich-text editor. Existing plain-text
// bodies (seed templates, AI drafts) get their newlines turned into <br> so
// they render as written; anything already containing tags is left as-is.
function textToHtml(s: string): string {
  if (/<[a-z][\s\S]*>/i.test(s)) return s
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
}

const COPY = {
  en: {
    topPerformer: "Top performer",
    more: "Template actions",
    deleteAria: (name: string) => `Delete ${name}`,
    duplicateAria: (name: string) => `Duplicate ${name}`,
    copySuffix: "(copy)",
    duplicated: (name: string) => `"${name}" created`,
    sent: (count: string) => `${count} sent`,
    replySuffix: "reply",
    pageTitle: "Campaign Templates",
    pageDescription: "Reusable outreach templates with live performance.",
    newTemplate: "New template",
    sectionMessages: "Messages",
    sectionPrompts: "Prompts",
    newPrompt: "New prompt",
    promptDeleteTitle: "Delete prompt?",
    promptDeleteDescription: (name: string) =>
      `"${name}" will be permanently removed.`,
    promptDeleted: "Prompt deleted",
    noPrompts: "No prompts yet — create one to get started.",
    promptCardHint: "AI writes a unique message per recipient",
    methodDesc: "How do you want to create it?",
    methodManualTitle: "Write it myself",
    methodManualDesc:
      "Fixed copy with merge variables — the same message for everyone.",
    methodPromptTitle: "AI prompt",
    methodPromptDesc:
      "Describe the message once — the AI writes a unique version for every recipient using your product, ICP, and USPs.",
    introTitle: "Reusable message templates",
    introDescription:
      "Save your best-performing copy and personalize it at scale.",
    introPoints: [
      "Merge variables for personalization",
      "See reply rate per template",
      "Share winners with your team",
    ],
    editTemplate: "Edit template",
    emailDialogDesc: "Email template",
    linkedinDialogDesc: "LinkedIn template — no subject line",
    name: "Name",
    namePlaceholder: "Cold outreach — RevOps angle",
    channel: "Channel",
    email: "Email",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    allChannels: "All channels",
    folder: "Folder",
    folderPlaceholder: "Cold outreach",
    subject: "Subject",
    subjectPlaceholder: "Cleaner pipeline data at {{company}}",
    body: "Body",
    bodyPlaceholder: "Write your template…",
    variableHint: "Variables: {{first_name}}, {{company}}, {{sender}}",
    tags: "Tags",
    tagsPlaceholder: "revops, intro, short",
    tagsHint: "Separate tags with commas.",
    cancel: "Cancel",
    save: "Save",
    templateSaved: "Template saved",
    templateCreated: "Template created",
    templateDeleted: "Template deleted",
    deleteTitle: "Delete template?",
    deleteDescription: (name: string) => `"${name}" will be permanently removed.`,
    delete: "Delete",
    deleteSelectedTitle: (n: number) => `Delete ${n} ${n === 1 ? "template" : "templates"}?`,
    deleteSelectedDescription: "These templates will be permanently removed.",
    templatesDeleted: (n: number) => `${n} ${n === 1 ? "template" : "templates"} deleted`,
    variablesTitle: "Variables",
    variablesSubtitle: "Click to insert, drag into the body, or copy.",
    varGroups: { yourDetails: "Your Details", prospectInfo: "Prospect Info", prospectCompany: "Prospect Company", other: "Other" } as Record<MergeVarGroupKey | "other", string>,
    tabVariables: "Variables",
    tabPreview: "Preview",
    previewSampleNote: "Sample data — your real merge fields fill in at send.",
    previewEmptyState: "Start writing to see a live preview.",
    previewToLabel: "To",
    previewSubjectLabel: "Subject",
    copy: "Copy",
    copied: "Copied",
    aiGenerate: "Generate with AI",
    aiSubtitle: "Let our GPT agent draft the message — it'll include merge variables you can tweak.",
    aiPromptLabel: "What should it say?",
    aiPromptPlaceholder:
      "Describe the message you want, e.g. \"Casual follow-up sharing a case study, mention {{company}} and {{first_name}}.\"",
    aiPresets: "Starting points",
    aiRun: "Generate",
    aiRunning: "Writing…",
    aiRegenerate: "Regenerate",
    aiDone: "Draft ready — review and tweak.",
    aiCollapse: "Close",
    typeaheadHint: "Tip: type {{ in the body to autocomplete a variable.",
    newFolder: "New folder",
    folderNamePlaceholder: "Folder name",
    createNewFolder: "＋ Create new folder",
    renameFolder: "Rename folder",
    deleteFolder: "Delete folder",
    folderActions: "Folder actions",
    uncategorized: "Uncategorized",
    folderCreated: "Folder created",
    folderRenamed: "Folder renamed",
    folderDeleted: "Folder deleted",
    search: "Search templates…",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Templates exported to CSV",
    noResults: "No templates match your search.",
    sortRecent: "Recently updated",
    sortName: "Name (A–Z)",
    sortSent: "Most sent",
    sortReply: "Reply rate",
    colName: "Template",
    colFolder: "Folder",
    colChannel: "Channel",
    colSubject: "Subject",
    colSent: "Sent",
    colReply: "Reply rate",
    colUpdated: "Updated",
    columns: "Columns",
  },
  es: {
    topPerformer: "Mejor rendimiento",
    more: "Acciones de la plantilla",
    deleteAria: (name: string) => `Eliminar ${name}`,
    duplicateAria: (name: string) => `Duplicar ${name}`,
    copySuffix: "(copia)",
    duplicated: (name: string) => `«${name}» creada`,
    sent: (count: string) => `${count} enviados`,
    replySuffix: "respuesta",
    pageTitle: "Plantillas de campaña",
    pageDescription:
      "Plantillas de contacto reutilizables con rendimiento en vivo.",
    newTemplate: "Nueva plantilla",
    sectionMessages: "Mensajes",
    sectionPrompts: "Prompts",
    newPrompt: "Nuevo prompt",
    promptDeleteTitle: "¿Eliminar prompt?",
    promptDeleteDescription: (name: string) =>
      `"${name}" se eliminará de forma permanente.`,
    promptDeleted: "Prompt eliminado",
    noPrompts: "Aún no hay prompts — crea uno para empezar.",
    promptCardHint: "La IA escribe un mensaje único por destinatario",
    methodDesc: "¿Cómo quieres crearla?",
    methodManualTitle: "Escribirla yo mismo",
    methodManualDesc:
      "Texto fijo con variables — el mismo mensaje para todos.",
    methodPromptTitle: "Prompt de IA",
    methodPromptDesc:
      "Describe el mensaje una vez — la IA escribe una versión única para cada destinatario usando tu producto, ICP y propuestas de valor.",
    introTitle: "Plantillas de mensaje reutilizables",
    introDescription:
      "Guarda tus textos de mayor rendimiento y personalízalos a escala.",
    introPoints: [
      "Combina variables para personalizar",
      "Consulta la tasa de respuesta por plantilla",
      "Comparte las mejores con tu equipo",
    ],
    editTemplate: "Editar plantilla",
    emailDialogDesc: "Plantilla de correo",
    linkedinDialogDesc: "Plantilla de LinkedIn — sin asunto",
    name: "Nombre",
    namePlaceholder: "Contacto en frío — enfoque RevOps",
    channel: "Canal",
    email: "Correo",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    allChannels: "Todos los canales",
    folder: "Carpeta",
    folderPlaceholder: "Contacto en frío",
    subject: "Asunto",
    subjectPlaceholder: "Datos de pipeline más limpios en {{company}}",
    body: "Cuerpo",
    bodyPlaceholder: "Escribe tu plantilla…",
    variableHint: "Variables: {{first_name}}, {{company}}, {{sender}}",
    tags: "Etiquetas",
    tagsPlaceholder: "revops, intro, corto",
    tagsHint: "Separa las etiquetas con comas.",
    cancel: "Cancelar",
    save: "Guardar",
    templateSaved: "Plantilla guardada",
    templateCreated: "Plantilla creada",
    templateDeleted: "Plantilla eliminada",
    deleteTitle: "¿Eliminar plantilla?",
    deleteDescription: (name: string) =>
      `«${name}» se eliminará de forma permanente.`,
    delete: "Eliminar",
    deleteSelectedTitle: (n: number) =>
      `¿Eliminar ${n} ${n === 1 ? "plantilla" : "plantillas"}?`,
    deleteSelectedDescription: "Estas plantillas se eliminarán de forma permanente.",
    templatesDeleted: (n: number) =>
      `${n} ${n === 1 ? "plantilla eliminada" : "plantillas eliminadas"}`,
    variablesTitle: "Variables",
    variablesSubtitle: "Haz clic para insertar, arrastra al cuerpo o copia.",
    varGroups: { yourDetails: "Tus datos", prospectInfo: "Info del prospecto", prospectCompany: "Empresa del prospecto", other: "Otros" } as Record<MergeVarGroupKey | "other", string>,
    tabVariables: "Variables",
    tabPreview: "Vista previa",
    previewSampleNote: "Datos de ejemplo — tus campos reales se rellenan al enviar.",
    previewEmptyState: "Escribe para ver una vista previa.",
    previewToLabel: "Para",
    previewSubjectLabel: "Asunto",
    copy: "Copiar",
    copied: "Copiado",
    aiGenerate: "Generar con IA",
    aiSubtitle: "Deja que nuestro agente GPT redacte el mensaje — incluirá variables que podrás ajustar.",
    aiPromptLabel: "¿Qué debe decir?",
    aiPromptPlaceholder:
      "Describe el mensaje que quieres, p. ej. «Seguimiento casual con un caso de éxito, menciona {{company}} y {{first_name}}.»",
    aiPresets: "Puntos de partida",
    aiRun: "Generar",
    aiRunning: "Escribiendo…",
    aiRegenerate: "Regenerar",
    aiDone: "Borrador listo — revísalo y ajústalo.",
    aiCollapse: "Cerrar",
    typeaheadHint: "Consejo: escribe {{ en el cuerpo para autocompletar una variable.",
    newFolder: "Nueva carpeta",
    folderNamePlaceholder: "Nombre de la carpeta",
    createNewFolder: "＋ Crear nueva carpeta",
    renameFolder: "Renombrar carpeta",
    deleteFolder: "Eliminar carpeta",
    folderActions: "Acciones de carpeta",
    uncategorized: "Sin categoría",
    folderCreated: "Carpeta creada",
    folderRenamed: "Carpeta renombrada",
    folderDeleted: "Carpeta eliminada",
    search: "Buscar plantillas…",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Plantillas exportadas a CSV",
    noResults: "Ninguna plantilla coincide con tu búsqueda.",
    sortRecent: "Actualizadas recientemente",
    sortName: "Nombre (A–Z)",
    sortSent: "Más enviadas",
    sortReply: "Tasa de respuesta",
    colName: "Plantilla",
    colFolder: "Carpeta",
    colChannel: "Canal",
    colSubject: "Asunto",
    colSent: "Enviados",
    colReply: "Tasa de respuesta",
    colUpdated: "Actualizada",
    columns: "Columnas",
  },
  it: {
    topPerformer: "Miglior rendimento",
    more: "Azioni modello",
    deleteAria: (name: string) => `Elimina ${name}`,
    duplicateAria: (name: string) => `Duplica ${name}`,
    copySuffix: "(copia)",
    duplicated: (name: string) => `"${name}" creato`,
    sent: (count: string) => `${count} inviati`,
    replySuffix: "risposta",
    pageTitle: "Modelli di campagna",
    pageDescription:
      "Modelli di contatto riutilizzabili con prestazioni in tempo reale.",
    newTemplate: "Nuovo modello",
    sectionMessages: "Messaggi",
    sectionPrompts: "Prompt",
    newPrompt: "Nuovo prompt",
    promptDeleteTitle: "Eliminare il prompt?",
    promptDeleteDescription: (name: string) =>
      `"${name}" verrà eliminato definitivamente.`,
    promptDeleted: "Prompt eliminato",
    noPrompts: "Ancora nessun prompt — creane uno per iniziare.",
    promptCardHint: "L'IA scrive un messaggio unico per ogni destinatario",
    methodDesc: "Come vuoi crearlo?",
    methodManualTitle: "Scriverlo io",
    methodManualDesc:
      "Testo fisso con variabili — lo stesso messaggio per tutti.",
    methodPromptTitle: "Prompt IA",
    methodPromptDesc:
      "Descrivi il messaggio una volta sola — l'IA scrive una versione unica per ogni destinatario usando il tuo prodotto, l'ICP e le tue USP.",
    introTitle: "Modelli di messaggio riutilizzabili",
    introDescription:
      "Salva i testi con le migliori prestazioni e personalizzali su larga scala.",
    introPoints: [
      "Variabili di merge per la personalizzazione",
      "Consulta il tasso di risposta per modello",
      "Condividi i migliori con il tuo team",
    ],
    editTemplate: "Modifica modello",
    emailDialogDesc: "Modello email",
    linkedinDialogDesc: "Modello LinkedIn — senza oggetto",
    name: "Nome",
    namePlaceholder: "Contatto a freddo — angolo RevOps",
    channel: "Canale",
    email: "Email",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    allChannels: "Tutti i canali",
    folder: "Cartella",
    folderPlaceholder: "Contatto a freddo",
    subject: "Oggetto",
    subjectPlaceholder: "Dati di pipeline più puliti in {{company}}",
    body: "Corpo",
    bodyPlaceholder: "Scrivi il tuo modello…",
    variableHint: "Variabili: {{first_name}}, {{company}}, {{sender}}",
    tags: "Tag",
    tagsPlaceholder: "revops, intro, breve",
    tagsHint: "Separa i tag con le virgole.",
    cancel: "Annulla",
    save: "Salva",
    templateSaved: "Modello salvato",
    templateCreated: "Modello creato",
    templateDeleted: "Modello eliminato",
    deleteTitle: "Eliminare il modello?",
    deleteDescription: (name: string) => `"${name}" verrà eliminato definitivamente.`,
    delete: "Elimina",
    deleteSelectedTitle: (n: number) => `Eliminare ${n} ${n === 1 ? "modello" : "modelli"}?`,
    deleteSelectedDescription: "Questi modelli verranno eliminati definitivamente.",
    templatesDeleted: (n: number) => `${n} ${n === 1 ? "modello eliminato" : "modelli eliminati"}`,
    variablesTitle: "Variabili",
    variablesSubtitle: "Clicca per inserire, trascina nel corpo o copia.",
    varGroups: { yourDetails: "I tuoi dati", prospectInfo: "Info sul prospect", prospectCompany: "Azienda del prospect", other: "Altro" } as Record<MergeVarGroupKey | "other", string>,
    tabVariables: "Variabili",
    tabPreview: "Anteprima",
    previewSampleNote: "Dati di esempio — i tuoi campi reali verranno compilati all'invio.",
    previewEmptyState: "Inizia a scrivere per vedere un'anteprima dal vivo.",
    previewToLabel: "A",
    previewSubjectLabel: "Oggetto",
    copy: "Copia",
    copied: "Copiato",
    aiGenerate: "Genera con l'IA",
    aiSubtitle: "Lascia che il nostro agente GPT scriva una bozza del messaggio — includerà variabili che potrai modificare.",
    aiPromptLabel: "Cosa deve dire?",
    aiPromptPlaceholder:
      "Descrivi il messaggio che vuoi, ad es. «Follow-up informale con un caso di successo, menziona {{company}} e {{first_name}}.»",
    aiPresets: "Punti di partenza",
    aiRun: "Genera",
    aiRunning: "Scrittura…",
    aiRegenerate: "Rigenera",
    aiDone: "Bozza pronta — rivedila e modificala.",
    aiCollapse: "Chiudi",
    typeaheadHint: "Suggerimento: digita {{ nel corpo per completare automaticamente una variabile.",
    newFolder: "Nuova cartella",
    folderNamePlaceholder: "Nome cartella",
    createNewFolder: "＋ Crea nuova cartella",
    renameFolder: "Rinomina cartella",
    deleteFolder: "Elimina cartella",
    folderActions: "Azioni cartella",
    uncategorized: "Senza categoria",
    folderCreated: "Cartella creata",
    folderRenamed: "Cartella rinominata",
    folderDeleted: "Cartella eliminata",
    search: "Cerca modelli…",
    viewCards: "Schede",
    viewTable: "Tabella",
    exportLabel: "Esporta",
    exported: "Modelli esportati in CSV",
    noResults: "Nessun modello corrisponde alla tua ricerca.",
    sortRecent: "Aggiornati di recente",
    sortName: "Nome (A–Z)",
    sortSent: "Più inviati",
    sortReply: "Tasso di risposta",
    colName: "Modello",
    colFolder: "Cartella",
    colChannel: "Canale",
    colSubject: "Oggetto",
    colSent: "Inviati",
    colReply: "Tasso di risposta",
    colUpdated: "Aggiornato",
    columns: "Colonne",
  },
  fr: {
    topPerformer: "Meilleure performance",
    more: "Actions du modèle",
    deleteAria: (name: string) => `Supprimer ${name}`,
    duplicateAria: (name: string) => `Dupliquer ${name}`,
    copySuffix: "(copie)",
    duplicated: (name: string) => `« ${name} » créé`,
    sent: (count: string) => `${count} envoyés`,
    replySuffix: "réponse",
    pageTitle: "Modèles de campagne",
    pageDescription:
      "Modèles de prospection réutilisables avec des performances en direct.",
    newTemplate: "Nouveau modèle",
    sectionMessages: "Messages",
    sectionPrompts: "Prompts",
    newPrompt: "Nouveau prompt",
    promptDeleteTitle: "Supprimer le prompt ?",
    promptDeleteDescription: (name: string) =>
      `« ${name} » sera définitivement supprimé.`,
    promptDeleted: "Prompt supprimé",
    noPrompts: "Aucun prompt pour l'instant — créez-en un pour commencer.",
    promptCardHint: "L'IA rédige un message unique pour chaque destinataire",
    methodDesc: "Comment voulez-vous le créer ?",
    methodManualTitle: "L'écrire moi-même",
    methodManualDesc:
      "Texte fixe avec variables de fusion — le même message pour tout le monde.",
    methodPromptTitle: "Prompt IA",
    methodPromptDesc:
      "Décrivez le message une seule fois — l'IA rédige une version unique pour chaque destinataire à partir de votre produit, de votre ICP et de vos USP.",
    introTitle: "Modèles de messages réutilisables",
    introDescription:
      "Enregistrez vos meilleurs textes et personnalisez-les à grande échelle.",
    introPoints: [
      "Variables de fusion pour la personnalisation",
      "Consultez le taux de réponse par modèle",
      "Partagez les meilleurs avec votre équipe",
    ],
    editTemplate: "Modifier le modèle",
    emailDialogDesc: "Modèle d'e-mail",
    linkedinDialogDesc: "Modèle LinkedIn — sans objet",
    name: "Nom",
    namePlaceholder: "Prospection à froid — angle RevOps",
    channel: "Canal",
    email: "E-mail",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    allChannels: "Tous les canaux",
    folder: "Dossier",
    folderPlaceholder: "Prospection à froid",
    subject: "Objet",
    subjectPlaceholder: "Des données de pipeline plus propres chez {{company}}",
    body: "Corps du message",
    bodyPlaceholder: "Rédigez votre modèle…",
    variableHint: "Variables : {{first_name}}, {{company}}, {{sender}}",
    tags: "Tags",
    tagsPlaceholder: "revops, intro, court",
    tagsHint: "Séparez les tags par des virgules.",
    cancel: "Annuler",
    save: "Enregistrer",
    templateSaved: "Modèle enregistré",
    templateCreated: "Modèle créé",
    templateDeleted: "Modèle supprimé",
    deleteTitle: "Supprimer le modèle ?",
    deleteDescription: (name: string) => `« ${name} » sera définitivement supprimé.`,
    delete: "Supprimer",
    deleteSelectedTitle: (n: number) => `Supprimer ${n} ${n === 1 ? "modèle" : "modèles"} ?`,
    deleteSelectedDescription: "Ces modèles seront définitivement supprimés.",
    templatesDeleted: (n: number) => `${n} ${n === 1 ? "modèle supprimé" : "modèles supprimés"}`,
    variablesTitle: "Variables",
    variablesSubtitle: "Cliquez pour insérer, glissez dans le corps ou copiez.",
    varGroups: { yourDetails: "Vos informations", prospectInfo: "Infos du prospect", prospectCompany: "Entreprise du prospect", other: "Autre" } as Record<MergeVarGroupKey | "other", string>,
    tabVariables: "Variables",
    tabPreview: "Aperçu",
    previewSampleNote: "Données d'exemple — vos champs réels seront complétés à l'envoi.",
    previewEmptyState: "Commencez à écrire pour voir un aperçu en direct.",
    previewToLabel: "À",
    previewSubjectLabel: "Objet",
    copy: "Copier",
    copied: "Copié",
    aiGenerate: "Générer avec l'IA",
    aiSubtitle: "Laissez notre agent GPT rédiger le message — il inclura des variables de fusion que vous pourrez ajuster.",
    aiPromptLabel: "Que doit-il dire ?",
    aiPromptPlaceholder:
      "Décrivez le message que vous voulez, par ex. « Relance informelle partageant une étude de cas, mentionnez {{company}} et {{first_name}}. »",
    aiPresets: "Points de départ",
    aiRun: "Générer",
    aiRunning: "Rédaction…",
    aiRegenerate: "Régénérer",
    aiDone: "Brouillon prêt — relisez-le et ajustez-le.",
    aiCollapse: "Fermer",
    typeaheadHint: "Astuce : tapez {{ dans le corps pour compléter automatiquement une variable.",
    newFolder: "Nouveau dossier",
    folderNamePlaceholder: "Nom du dossier",
    createNewFolder: "＋ Créer un nouveau dossier",
    renameFolder: "Renommer le dossier",
    deleteFolder: "Supprimer le dossier",
    folderActions: "Actions du dossier",
    uncategorized: "Sans catégorie",
    folderCreated: "Dossier créé",
    folderRenamed: "Dossier renommé",
    folderDeleted: "Dossier supprimé",
    search: "Rechercher des modèles…",
    viewCards: "Cartes",
    viewTable: "Tableau",
    exportLabel: "Exporter",
    exported: "Modèles exportés en CSV",
    noResults: "Aucun modèle ne correspond à votre recherche.",
    sortRecent: "Mis à jour récemment",
    sortName: "Nom (A–Z)",
    sortSent: "Les plus envoyés",
    sortReply: "Taux de réponse",
    colName: "Modèle",
    colFolder: "Dossier",
    colChannel: "Canal",
    colSubject: "Objet",
    colSent: "Envoyés",
    colReply: "Taux de réponse",
    colUpdated: "Mis à jour",
    columns: "Colonnes",
  },
  de: {
    topPerformer: "Top-Performer",
    more: "Vorlagenaktionen",
    deleteAria: (name: string) => `${name} löschen`,
    duplicateAria: (name: string) => `${name} duplizieren`,
    copySuffix: "(Kopie)",
    duplicated: (name: string) => `„${name}“ erstellt`,
    sent: (count: string) => `${count} gesendet`,
    replySuffix: "Antwort",
    pageTitle: "Kampagnenvorlagen",
    pageDescription: "Wiederverwendbare Outreach-Vorlagen mit Live-Performance.",
    newTemplate: "Neue Vorlage",
    sectionMessages: "Nachrichten",
    sectionPrompts: "Prompts",
    newPrompt: "Neuer Prompt",
    promptDeleteTitle: "Prompt löschen?",
    promptDeleteDescription: (name: string) =>
      `„${name}“ wird endgültig gelöscht.`,
    promptDeleted: "Prompt gelöscht",
    noPrompts: "Noch keine Prompts — erstelle einen, um loszulegen.",
    promptCardHint: "Die KI schreibt für jeden Empfänger eine einzigartige Nachricht",
    methodDesc: "Wie möchtest du sie erstellen?",
    methodManualTitle: "Selbst schreiben",
    methodManualDesc:
      "Fester Text mit Platzhaltern — dieselbe Nachricht für alle.",
    methodPromptTitle: "KI-Prompt",
    methodPromptDesc:
      "Beschreibe die Nachricht einmal — die KI schreibt für jeden Empfänger eine einzigartige Version anhand deines Produkts, deines ICP und deiner USPs.",
    introTitle: "Wiederverwendbare Nachrichtenvorlagen",
    introDescription:
      "Speichere deine leistungsstärksten Texte und personalisiere sie im großen Maßstab.",
    introPoints: [
      "Platzhalter zur Personalisierung",
      "Antwortquote pro Vorlage einsehen",
      "Teile die besten mit deinem Team",
    ],
    editTemplate: "Vorlage bearbeiten",
    emailDialogDesc: "E-Mail-Vorlage",
    linkedinDialogDesc: "LinkedIn-Vorlage — ohne Betreff",
    name: "Name",
    namePlaceholder: "Kaltakquise — RevOps-Ansatz",
    channel: "Kanal",
    email: "E-Mail",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    allChannels: "Alle Kanäle",
    folder: "Ordner",
    folderPlaceholder: "Kaltakquise",
    subject: "Betreff",
    subjectPlaceholder: "Sauberere Pipeline-Daten bei {{company}}",
    body: "Nachrichtentext",
    bodyPlaceholder: "Schreib deine Vorlage…",
    variableHint: "Variablen: {{first_name}}, {{company}}, {{sender}}",
    tags: "Tags",
    tagsPlaceholder: "revops, intro, kurz",
    tagsHint: "Trenne die Tags mit Kommas.",
    cancel: "Abbrechen",
    save: "Speichern",
    templateSaved: "Vorlage gespeichert",
    templateCreated: "Vorlage erstellt",
    templateDeleted: "Vorlage gelöscht",
    deleteTitle: "Vorlage löschen?",
    deleteDescription: (name: string) => `„${name}“ wird endgültig gelöscht.`,
    delete: "Löschen",
    deleteSelectedTitle: (n: number) => `${n} ${n === 1 ? "Vorlage" : "Vorlagen"} löschen?`,
    deleteSelectedDescription: "Diese Vorlagen werden endgültig gelöscht.",
    templatesDeleted: (n: number) => `${n} ${n === 1 ? "Vorlage" : "Vorlagen"} gelöscht`,
    variablesTitle: "Variablen",
    variablesSubtitle: "Klicke zum Einfügen, ziehe es in den Text oder kopiere es.",
    varGroups: { yourDetails: "Deine Angaben", prospectInfo: "Prospect-Infos", prospectCompany: "Unternehmen des Prospects", other: "Sonstiges" } as Record<MergeVarGroupKey | "other", string>,
    tabVariables: "Variablen",
    tabPreview: "Vorschau",
    previewSampleNote: "Beispieldaten — deine echten Felder werden beim Senden ausgefüllt.",
    previewEmptyState: "Beginne zu schreiben, um eine Live-Vorschau zu sehen.",
    previewToLabel: "An",
    previewSubjectLabel: "Betreff",
    copy: "Kopieren",
    copied: "Kopiert",
    aiGenerate: "Mit KI generieren",
    aiSubtitle: "Lass unseren GPT-Agenten die Nachricht entwerfen — er fügt Platzhalter ein, die du anpassen kannst.",
    aiPromptLabel: "Was soll sie sagen?",
    aiPromptPlaceholder:
      "Beschreibe die gewünschte Nachricht, z. B. „Lockeres Follow-up mit einer Case Study, erwähne {{company}} und {{first_name}}.“",
    aiPresets: "Ausgangspunkte",
    aiRun: "Generieren",
    aiRunning: "Wird geschrieben…",
    aiRegenerate: "Neu generieren",
    aiDone: "Entwurf fertig — überprüfe und passe ihn an.",
    aiCollapse: "Schließen",
    typeaheadHint: "Tipp: Gib {{ im Text ein, um eine Variable automatisch zu vervollständigen.",
    newFolder: "Neuer Ordner",
    folderNamePlaceholder: "Ordnername",
    createNewFolder: "＋ Neuen Ordner erstellen",
    renameFolder: "Ordner umbenennen",
    deleteFolder: "Ordner löschen",
    folderActions: "Ordneraktionen",
    uncategorized: "Nicht kategorisiert",
    folderCreated: "Ordner erstellt",
    folderRenamed: "Ordner umbenannt",
    folderDeleted: "Ordner gelöscht",
    search: "Vorlagen durchsuchen…",
    viewCards: "Karten",
    viewTable: "Tabelle",
    exportLabel: "Exportieren",
    exported: "Vorlagen als CSV exportiert",
    noResults: "Keine Vorlagen entsprechen deiner Suche.",
    sortRecent: "Zuletzt aktualisiert",
    sortName: "Name (A–Z)",
    sortSent: "Am häufigsten gesendet",
    sortReply: "Antwortquote",
    colName: "Vorlage",
    colFolder: "Ordner",
    colChannel: "Kanal",
    colSubject: "Betreff",
    colSent: "Gesendet",
    colReply: "Antwortquote",
    colUpdated: "Aktualisiert",
    columns: "Spalten",
  },
  pt: {
    topPerformer: "Melhor desempenho",
    more: "Ações do modelo",
    deleteAria: (name: string) => `Eliminar ${name}`,
    duplicateAria: (name: string) => `Duplicar ${name}`,
    copySuffix: "(cópia)",
    duplicated: (name: string) => `"${name}" criado`,
    sent: (count: string) => `${count} enviados`,
    replySuffix: "resposta",
    pageTitle: "Modelos de campanha",
    pageDescription:
      "Modelos de contacto reutilizáveis com desempenho em tempo real.",
    newTemplate: "Novo modelo",
    sectionMessages: "Mensagens",
    sectionPrompts: "Prompts",
    newPrompt: "Novo prompt",
    promptDeleteTitle: "Eliminar prompt?",
    promptDeleteDescription: (name: string) =>
      `"${name}" será eliminado permanentemente.`,
    promptDeleted: "Prompt eliminado",
    noPrompts: "Ainda não há prompts — crie um para começar.",
    promptCardHint: "A IA escreve uma mensagem única por destinatário",
    methodDesc: "Como quer criá-lo?",
    methodManualTitle: "Escrevê-lo eu mesmo",
    methodManualDesc:
      "Texto fixo com variáveis — a mesma mensagem para todos.",
    methodPromptTitle: "Prompt de IA",
    methodPromptDesc:
      "Descreva a mensagem uma vez — a IA escreve uma versão única para cada destinatário usando o seu produto, ICP e propostas de valor.",
    introTitle: "Modelos de mensagem reutilizáveis",
    introDescription:
      "Guarde os seus textos com melhor desempenho e personalize-os em grande escala.",
    introPoints: [
      "Variáveis de combinação para personalização",
      "Veja a taxa de resposta por modelo",
      "Partilhe os melhores com a sua equipa",
    ],
    editTemplate: "Editar modelo",
    emailDialogDesc: "Modelo de email",
    linkedinDialogDesc: "Modelo do LinkedIn — sem assunto",
    name: "Nome",
    namePlaceholder: "Contacto a frio — ângulo RevOps",
    channel: "Canal",
    email: "Email",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    allChannels: "Todos os canais",
    folder: "Pasta",
    folderPlaceholder: "Contacto a frio",
    subject: "Assunto",
    subjectPlaceholder: "Dados de pipeline mais limpos na {{company}}",
    body: "Corpo",
    bodyPlaceholder: "Escreva o seu modelo…",
    variableHint: "Variáveis: {{first_name}}, {{company}}, {{sender}}",
    tags: "Etiquetas",
    tagsPlaceholder: "revops, intro, curto",
    tagsHint: "Separe as etiquetas com vírgulas.",
    cancel: "Cancelar",
    save: "Guardar",
    templateSaved: "Modelo guardado",
    templateCreated: "Modelo criado",
    templateDeleted: "Modelo eliminado",
    deleteTitle: "Eliminar modelo?",
    deleteDescription: (name: string) =>
      `"${name}" será eliminado permanentemente.`,
    delete: "Eliminar",
    deleteSelectedTitle: (n: number) =>
      `Eliminar ${n} ${n === 1 ? "modelo" : "modelos"}?`,
    deleteSelectedDescription: "Estes modelos serão eliminados permanentemente.",
    templatesDeleted: (n: number) =>
      `${n} ${n === 1 ? "modelo eliminado" : "modelos eliminados"}`,
    variablesTitle: "Variáveis",
    variablesSubtitle: "Clique para inserir, arraste para o corpo ou copie.",
    varGroups: { yourDetails: "Os seus dados", prospectInfo: "Informações do prospect", prospectCompany: "Empresa do prospect", other: "Outros" } as Record<MergeVarGroupKey | "other", string>,
    tabVariables: "Variáveis",
    tabPreview: "Pré-visualização",
    previewSampleNote: "Dados de exemplo — os seus campos reais são preenchidos no envio.",
    previewEmptyState: "Comece a escrever para ver uma pré-visualização em direto.",
    previewToLabel: "Para",
    previewSubjectLabel: "Assunto",
    copy: "Copiar",
    copied: "Copiado",
    aiGenerate: "Gerar com IA",
    aiSubtitle: "Deixe o nosso agente GPT redigir a mensagem — vai incluir variáveis que poderá ajustar.",
    aiPromptLabel: "O que deve dizer?",
    aiPromptPlaceholder:
      "Descreva a mensagem que quer, por ex. «Seguimento informal a partilhar um caso de sucesso, mencione {{company}} e {{first_name}}.»",
    aiPresets: "Pontos de partida",
    aiRun: "Gerar",
    aiRunning: "A escrever…",
    aiRegenerate: "Regenerar",
    aiDone: "Rascunho pronto — reveja-o e ajuste-o.",
    aiCollapse: "Fechar",
    typeaheadHint: "Dica: escreva {{ no corpo para completar automaticamente uma variável.",
    newFolder: "Nova pasta",
    folderNamePlaceholder: "Nome da pasta",
    createNewFolder: "＋ Criar nova pasta",
    renameFolder: "Renomear pasta",
    deleteFolder: "Eliminar pasta",
    folderActions: "Ações da pasta",
    uncategorized: "Sem categoria",
    folderCreated: "Pasta criada",
    folderRenamed: "Pasta renomeada",
    folderDeleted: "Pasta eliminada",
    search: "Pesquisar modelos…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Modelos exportados para CSV",
    noResults: "Nenhum modelo corresponde à sua pesquisa.",
    sortRecent: "Atualizados recentemente",
    sortName: "Nome (A–Z)",
    sortSent: "Mais enviados",
    sortReply: "Taxa de resposta",
    colName: "Modelo",
    colFolder: "Pasta",
    colChannel: "Canal",
    colSubject: "Assunto",
    colSent: "Enviados",
    colReply: "Taxa de resposta",
    colUpdated: "Atualizado",
    columns: "Colunas",
  },
  pt_BR: {
    topPerformer: "Melhor desempenho",
    more: "Ações do modelo",
    deleteAria: (name: string) => `Excluir ${name}`,
    duplicateAria: (name: string) => `Duplicar ${name}`,
    copySuffix: "(cópia)",
    duplicated: (name: string) => `"${name}" criado`,
    sent: (count: string) => `${count} enviados`,
    replySuffix: "resposta",
    pageTitle: "Modelos de campanha",
    pageDescription:
      "Modelos de contato reutilizáveis com desempenho em tempo real.",
    newTemplate: "Novo modelo",
    sectionMessages: "Mensagens",
    sectionPrompts: "Prompts",
    newPrompt: "Novo prompt",
    promptDeleteTitle: "Excluir prompt?",
    promptDeleteDescription: (name: string) =>
      `"${name}" será excluído permanentemente.`,
    promptDeleted: "Prompt excluído",
    noPrompts: "Ainda não há prompts — crie um para começar.",
    promptCardHint: "A IA escreve uma mensagem única por destinatário",
    methodDesc: "Como você quer criá-lo?",
    methodManualTitle: "Escrever eu mesmo",
    methodManualDesc:
      "Texto fixo com variáveis — a mesma mensagem para todos.",
    methodPromptTitle: "Prompt de IA",
    methodPromptDesc:
      "Descreva a mensagem uma vez — a IA escreve uma versão única para cada destinatário usando seu produto, ICP e propostas de valor.",
    introTitle: "Modelos de mensagem reutilizáveis",
    introDescription:
      "Salve seus textos com melhor desempenho e personalize-os em grande escala.",
    introPoints: [
      "Variáveis de mesclagem para personalização",
      "Veja a taxa de resposta por modelo",
      "Compartilhe os melhores com seu time",
    ],
    editTemplate: "Editar modelo",
    emailDialogDesc: "Modelo de e-mail",
    linkedinDialogDesc: "Modelo do LinkedIn — sem assunto",
    name: "Nome",
    namePlaceholder: "Contato a frio — ângulo RevOps",
    channel: "Canal",
    email: "E-mail",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    allChannels: "Todos os canais",
    folder: "Pasta",
    folderPlaceholder: "Contato a frio",
    subject: "Assunto",
    subjectPlaceholder: "Dados de pipeline mais limpos na {{company}}",
    body: "Corpo",
    bodyPlaceholder: "Escreva seu modelo…",
    variableHint: "Variáveis: {{first_name}}, {{company}}, {{sender}}",
    tags: "Tags",
    tagsPlaceholder: "revops, intro, curto",
    tagsHint: "Separe as tags com vírgulas.",
    cancel: "Cancelar",
    save: "Salvar",
    templateSaved: "Modelo salvo",
    templateCreated: "Modelo criado",
    templateDeleted: "Modelo excluído",
    deleteTitle: "Excluir modelo?",
    deleteDescription: (name: string) =>
      `"${name}" será excluído permanentemente.`,
    delete: "Excluir",
    deleteSelectedTitle: (n: number) =>
      `Excluir ${n} ${n === 1 ? "modelo" : "modelos"}?`,
    deleteSelectedDescription: "Estes modelos serão excluídos permanentemente.",
    templatesDeleted: (n: number) =>
      `${n} ${n === 1 ? "modelo excluído" : "modelos excluídos"}`,
    variablesTitle: "Variáveis",
    variablesSubtitle: "Clique para inserir, arraste para o corpo ou copie.",
    varGroups: { yourDetails: "Os seus dados", prospectInfo: "Informações do prospect", prospectCompany: "Empresa do prospect", other: "Outros" } as Record<MergeVarGroupKey | "other", string>,
    tabVariables: "Variáveis",
    tabPreview: "Pré-visualização",
    previewSampleNote: "Dados de exemplo — seus campos reais são preenchidos no envio.",
    previewEmptyState: "Comece a escrever para ver uma pré-visualização ao vivo.",
    previewToLabel: "Para",
    previewSubjectLabel: "Assunto",
    copy: "Copiar",
    copied: "Copiado",
    aiGenerate: "Gerar com IA",
    aiSubtitle: "Deixe nosso agente GPT redigir a mensagem — ele vai incluir variáveis que você poderá ajustar.",
    aiPromptLabel: "O que deve dizer?",
    aiPromptPlaceholder:
      "Descreva a mensagem que você quer, por ex. “Follow-up informal compartilhando um case de sucesso, mencione {{company}} e {{first_name}}.”",
    aiPresets: "Pontos de partida",
    aiRun: "Gerar",
    aiRunning: "Escrevendo…",
    aiRegenerate: "Regenerar",
    aiDone: "Rascunho pronto — revise e ajuste.",
    aiCollapse: "Fechar",
    typeaheadHint: "Dica: digite {{ no corpo para autocompletar uma variável.",
    newFolder: "Nova pasta",
    folderNamePlaceholder: "Nome da pasta",
    createNewFolder: "＋ Criar nova pasta",
    renameFolder: "Renomear pasta",
    deleteFolder: "Excluir pasta",
    folderActions: "Ações da pasta",
    uncategorized: "Sem categoria",
    folderCreated: "Pasta criada",
    folderRenamed: "Pasta renomeada",
    folderDeleted: "Pasta excluída",
    search: "Buscar modelos…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Modelos exportados para CSV",
    noResults: "Nenhum modelo corresponde à sua busca.",
    sortRecent: "Atualizados recentemente",
    sortName: "Nome (A–Z)",
    sortSent: "Mais enviados",
    sortReply: "Taxa de resposta",
    colName: "Modelo",
    colFolder: "Pasta",
    colChannel: "Canal",
    colSubject: "Assunto",
    colSent: "Enviados",
    colReply: "Taxa de resposta",
    colUpdated: "Atualizado",
    columns: "Colunas",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  switch (channel) {
    case "linkedin":
      return <LinkedinIcon className={className} />
    case "whatsapp":
      return <MessageCircle className={cn(className, "text-[#25D366]")} />
    default:
      return <Mail className={className} />
  }
}

// Channel display order + label key for filters and the editor select.
const CHANNELS: Channel[] = ["email", "linkedin", "whatsapp"]

function channelLabel(channel: Channel, c: Copy): string {
  return c[channel]
}

// Table-view columns — the same shared registry shape + ColumnManager +
// DataTable every prospect/company table uses (page-local defs, like
// CampaignDetail's prospect table).
const TEMPLATE_COL_GROUPS: ColGroup[] = [
  {
    id: "template",
    label: {
      en: "Template",
      es: "Plantilla",
      it: "Modello",
      fr: "Modèle",
      de: "Vorlage",
      pt: "Modelo",
      pt_BR: "Modelo",
    },
  },
]
const TEMPLATE_COL_DEFAULT_IDS = ["folder", "subject", "sent", "reply", "updated"]

const TEMPLATE_COLUMNS: ColumnDef<EmailTemplate>[] = [
  {
    id: "name",
    label: {
      en: COPY.en.colName,
      es: COPY.es.colName,
      it: COPY.it.colName,
      fr: COPY.fr.colName,
      de: COPY.de.colName,
      pt: COPY.pt.colName,
      pt_BR: COPY.pt_BR.colName,
    },
    group: "template",
    pinned: true,
    minWidth: "200px",
    render: (t) => (
      <div className="flex items-center gap-2">
        <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
          <ChannelIcon channel={t.channel} className="size-3.5" />
        </span>
        <span className="font-medium">{t.name}</span>
      </div>
    ),
  },
  {
    id: "folder",
    label: {
      en: COPY.en.colFolder,
      es: COPY.es.colFolder,
      it: COPY.it.colFolder,
      fr: COPY.fr.colFolder,
      de: COPY.de.colFolder,
      pt: COPY.pt.colFolder,
      pt_BR: COPY.pt_BR.colFolder,
    },
    group: "template",
    default: true,
    render: (t) => (
      <Badge variant="secondary" className="font-normal">
        {t.folder}
      </Badge>
    ),
  },
  {
    id: "subject",
    label: {
      en: COPY.en.colSubject,
      es: COPY.es.colSubject,
      it: COPY.it.colSubject,
      fr: COPY.fr.colSubject,
      de: COPY.de.colSubject,
      pt: COPY.pt.colSubject,
      pt_BR: COPY.pt_BR.colSubject,
    },
    group: "template",
    default: true,
    render: (t) => (
      <span className="text-muted-foreground block max-w-[260px] truncate text-sm">
        {t.channel === "email" ? t.subject : stripHtml(t.body)}
      </span>
    ),
  },
  {
    id: "sent",
    label: {
      en: COPY.en.colSent,
      es: COPY.es.colSent,
      it: COPY.it.colSent,
      fr: COPY.fr.colSent,
      de: COPY.de.colSent,
      pt: COPY.pt.colSent,
      pt_BR: COPY.pt_BR.colSent,
    },
    group: "template",
    default: true,
    align: "right",
    render: (t) => (
      <span className="tabular-nums">{t.sent.toLocaleString()}</span>
    ),
  },
  {
    id: "reply",
    label: {
      en: COPY.en.colReply,
      es: COPY.es.colReply,
      it: COPY.it.colReply,
      fr: COPY.fr.colReply,
      de: COPY.de.colReply,
      pt: COPY.pt.colReply,
      pt_BR: COPY.pt_BR.colReply,
    },
    group: "template",
    default: true,
    align: "right",
    render: (t) => (
      <span className="text-chart-1 font-medium tabular-nums">
        {t.replyRate}%
      </span>
    ),
  },
  {
    id: "updated",
    label: {
      en: COPY.en.colUpdated,
      es: COPY.es.colUpdated,
      it: COPY.it.colUpdated,
      fr: COPY.fr.colUpdated,
      de: COPY.de.colUpdated,
      pt: COPY.pt.colUpdated,
      pt_BR: COPY.pt_BR.colUpdated,
    },
    group: "template",
    default: true,
    align: "right",
    render: (t) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatDate(t.updatedAt)}
      </span>
    ),
  },
]

// The Prompts section of Campaign Templates — saved AI prompts grouped into
// folders, mirroring the extension's picker.
function PromptsSection({
  prompts,
  c,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  prompts: PromptTemplate[]
  c: Copy
  onCreate: () => void
  onEdit: (p: PromptTemplate) => void
  onDelete: (p: PromptTemplate) => void
  onDuplicate: (p: PromptTemplate) => void
}) {
  const grouped = new Map<string, PromptTemplate[]>()
  for (const p of prompts) {
    grouped.set(p.folder, [...(grouped.get(p.folder) ?? []), p])
  }

  if (prompts.length === 0) {
    return (
      <button
        type="button"
        onClick={onCreate}
        className="text-muted-foreground hover:border-primary/40 hover:text-foreground w-full rounded-xl border border-dashed py-12 text-center text-sm transition-colors"
      >
        <Plus className="mr-1 inline size-4" />
        {c.noPrompts}
      </button>
    )
  }

  return (
    <div className="space-y-8">
      {[...grouped.entries()].map(([folder, items]) => (
        <section key={folder} className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {folder} <span className="tabular-nums">({items.length})</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => onEdit(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onEdit(p)
                  }
                }}
                className="bg-card text-card-foreground hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-ring/50 relative flex h-full cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left shadow-sm transition-colors outline-none focus-visible:ring-[3px]"
              >
                <div className="flex items-start gap-3">
                  <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                      <ChannelIcon channel={p.channel} className="size-3.5" />
                      {c.promptCardHint}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.duplicateAria(p.name)}
                    className="text-muted-foreground -mt-1 size-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(p)
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.deleteAria(p.name)}
                    className="text-muted-foreground hover:text-destructive -mt-1 -mr-1 size-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(p)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {p.prompt}
                </p>
                <p className="text-muted-foreground mt-auto text-xs">
                  {formatDate(p.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function TemplateCard({
  template,
  onOpen,
  onDelete,
  onDuplicate,
}: {
  template: EmailTemplate
  onOpen: (template: EmailTemplate) => void
  onDelete: (template: EmailTemplate) => void
  onDuplicate: (template: EmailTemplate) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const isTopPerformer = template.replyRate > 25
  const strongReplyRate = template.replyRate >= 20
  const preview =
    template.channel === "email" ? template.subject : stripHtml(template.body)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(template)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen(template)
        }
      }}
      className="bg-card text-card-foreground hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-ring/50 relative flex h-full cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left shadow-sm transition-colors outline-none focus-visible:ring-[3px]"
    >
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <ChannelIcon channel={template.channel} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{template.name}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">
            {preview}
          </p>
        </div>
        {isTopPerformer && (
          <Badge variant="success" className="shrink-0">
            {c.topPerformer}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={c.duplicateAria(template.name)}
          className="text-muted-foreground -mt-1 size-8 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate(template)
          }}
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={c.deleteAria(template.name)}
          className="text-muted-foreground hover:text-destructive -mt-1 -mr-1 size-8 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(template)
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="text-muted-foreground mt-auto flex items-center justify-between pt-1 text-xs">
        <span className="tabular-nums">
          {c.sent(template.sent.toLocaleString())}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium tabular-nums",
            strongReplyRate
              ? "bg-chart-1/15 text-chart-1"
              : "bg-muted text-muted-foreground"
          )}
        >
          {template.replyRate}% {c.replySuffix}
        </span>
      </div>
    </div>
  )
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

export default function Templates() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const templates = useTemplates()
  const folders = useTemplateFolders()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<EmailTemplate | null>(null)
  const [name, setName] = React.useState("")
  const [folder, setFolder] = React.useState("Cold outreach")
  const [newFolderName, setNewFolderName] = React.useState("")
  const [channel, setChannel] = React.useState<Channel>("email")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [copiedTag, setCopiedTag] = React.useState<string | null>(null)

  // AI generator (method 2: prompt → draft).
  const [aiOpen, setAiOpen] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState("")
  const [aiBusy, setAiBusy] = React.useState(false)
  const [aiSeed, setAiSeed] = React.useState(0)
  const [aiGenerated, setAiGenerated] = React.useState(false)

  const bodyRef = React.useRef<RichTextEditorHandle>(null)
  const subjectRef = React.useRef<HTMLInputElement>(null)
  const activeFieldRef = React.useRef<"body" | "subject">("body")

  const [confirmTarget, setConfirmTarget] = React.useState<EmailTemplate | null>(
    null
  )
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  // All folders shown = managed folders ∪ any folder referenced by a template.
  const allFolders = React.useMemo(() => {
    const set = new Set<string>(folders)
    templates.forEach((t) => t.folder && set.add(t.folder))
    return [...set]
  }, [folders, templates])

  // Insert a {{variable}} into whichever field was last focused. The subject is
  // a plain input; the body is the rich-text editor (inserts at its caret).
  function insertVariable(tag: string) {
    const ins = `{{${tag}}}`
    if (activeFieldRef.current === "subject" && channel === "email") {
      const el = subjectRef.current
      const start = el?.selectionStart ?? subject.length
      const end = el?.selectionEnd ?? subject.length
      const next = subject.slice(0, start) + ins + subject.slice(end)
      setSubject(next)
      requestAnimationFrame(() => {
        el?.focus()
        el?.setSelectionRange(start + ins.length, start + ins.length)
      })
      return
    }
    bodyRef.current?.insertText(ins)
  }

  function copyVariable(tag: string) {
    const text = `{{${tag}}}`
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopiedTag(tag)
    window.setTimeout(() => setCopiedTag((cur) => (cur === tag ? null : cur)), 1200)
  }

  function openEditor(template: EmailTemplate | null, presetFolder?: string) {
    setEditing(template)
    setName(template?.name ?? "")
    setFolder(template?.folder ?? presetFolder ?? folders[0] ?? "Cold outreach")
    setNewFolderName("")
    setChannel(template?.channel ?? "email")
    setSubject(template?.subject ?? "")
    setBody(textToHtml(template?.body ?? ""))
    setTags(template?.tags.join(", ") ?? "")
    activeFieldRef.current = "body"
    setAiOpen(false)
    setAiPrompt("")
    setAiBusy(false)
    setAiSeed(0)
    setAiGenerated(false)
    setOpen(true)
  }

  // Method 2: hand the prompt to our GPT agent and drop the draft into the
  // subject/body. Filters the presets to the current channel.
  const aiPresets = PROMPT_PRESETS.filter((p) => !p.channel || p.channel === channel)

  function runAi() {
    const prompt = aiPrompt.trim()
    if (!prompt || aiBusy) return
    setAiBusy(true)
    const seed = aiGenerated ? aiSeed + 1 : 0
    window.setTimeout(() => {
      const draft = generateTemplate(prompt, channel, seed)
      if (channel === "email") setSubject(draft.subject)
      setBody(textToHtml(draft.body))
      setAiSeed(seed)
      setAiGenerated(true)
      setAiBusy(false)
      toast.success(c.aiDone)
    }, 900)
  }

  function handleSave() {
    // Resolve the folder, creating it if the user chose "New folder".
    let resolvedFolder = folder
    if (folder === NEW_FOLDER) {
      resolvedFolder = newFolderName.trim() || c.uncategorized
      folderStore.create(resolvedFolder)
    }
    const patch = {
      name,
      folder: resolvedFolder,
      channel,
      subject: channel === "email" ? subject : "",
      body,
      tags: parseTags(tags),
    }
    if (editing) {
      templateStore.update(editing.id, patch)
      toast.success(c.templateSaved)
    } else {
      templateStore.create(patch)
      toast.success(c.templateCreated)
    }
    setOpen(false)
  }

  function handleDelete() {
    if (!confirmTarget) return
    templateStore.remove(confirmTarget.id)
    toast.success(c.templateDeleted)
  }

  function duplicateTemplate(t: EmailTemplate) {
    const created = templateStore.create({
      name: `${t.name} ${c.copySuffix}`,
      folder: t.folder,
      channel: t.channel,
      subject: t.subject,
      body: t.body,
      tags: t.tags,
    })
    toast.success(c.duplicated(created.name))
  }

  const [view, setView] = React.useState<CollectionView>("table")
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  // Campaign Templates has two sections: fixed messages and AI prompts.
  const [section, setSection] = React.useState<"messages" | "prompts">(
    "messages"
  )
  const promptTemplates = usePromptTemplates()
  const [methodOpen, setMethodOpen] = React.useState(false)
  const [promptFormOpen, setPromptFormOpen] = React.useState(false)
  const [editingPrompt, setEditingPrompt] = React.useState<PromptTemplate | null>(
    null
  )
  const [deletingPrompt, setDeletingPrompt] = React.useState<PromptTemplate | null>(
    null
  )
  function openPromptForm(prompt: PromptTemplate | null) {
    setEditingPrompt(prompt)
    setPromptFormOpen(true)
  }
  function duplicatePrompt(p: PromptTemplate) {
    const created = promptTemplateStore.create({
      name: `${p.name} ${c.copySuffix}`,
      channel: p.channel,
      folder: p.folder,
      prompt: p.prompt,
    })
    toast.success(c.duplicated(created.name))
  }
  const templateColPrefs = useColumnPrefs("templates", TEMPLATE_COL_DEFAULT_IDS)
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("recent")
  const [channelFilter, setChannelFilter] = React.useState<Channel | "all">("all")

  const matches = React.useCallback(
    (t: EmailTemplate) => {
      if (channelFilter !== "all" && t.channel !== channelFilter) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.folder.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    },
    [query, channelFilter]
  )

  // One section per folder (including empty folders), filtered by the search.
  // When searching, hide folders with no matches to keep the view tidy.
  const grouped = allFolders
    .map((f) => [f, templates.filter((t) => t.folder === f && matches(t))] as const)
    .filter(([, items]) => query.trim() === "" || items.length > 0)

  // Flat, sorted list for the table view and export.
  const flat = React.useMemo(() => {
    const filtered = templates.filter(matches)
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "sent":
          return b.sent - a.sent
        case "reply":
          return b.replyRate - a.replyRate
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      }
    })
    return sorted
  }, [templates, matches, sort])

  function exportCsv() {
    downloadCsv(
      "kombo-templates.csv",
      [c.colName, c.colFolder, c.colChannel, c.colSubject, c.colSent, c.colReply, c.colUpdated],
      flat.map((t) => [
        t.name,
        t.folder,
        channelLabel(t.channel, c),
        t.subject,
        t.sent,
        `${t.replyRate}%`,
        formatDate(t.updatedAt),
      ])
    )
    toast.success(c.exported)
  }

  // Bulk selection — same DataTable selection pattern used elsewhere.
  const rowIds = flat.map((t) => t.id)
  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id))
  const someSelected = !allSelected && rowIds.some((id) => selectedIds.has(id))
  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAllRows() {
    setSelectedIds(allSelected ? new Set() : new Set(rowIds))
  }
  function exportSelectedCsv() {
    const selected = flat.filter((t) => selectedIds.has(t.id))
    downloadCsv(
      "kombo-templates.csv",
      [c.colName, c.colFolder, c.colChannel, c.colSubject, c.colSent, c.colReply, c.colUpdated],
      selected.map((t) => [
        t.name,
        t.folder,
        channelLabel(t.channel, c),
        t.subject,
        t.sent,
        `${t.replyRate}%`,
        formatDate(t.updatedAt),
      ])
    )
    toast.success(c.exported)
  }
  function deleteSelected() {
    selectedIds.forEach((id) => templateStore.remove(id))
    toast.success(c.templatesDeleted(selectedIds.size))
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
  }

  const [folderDialog, setFolderDialog] = React.useState<{
    mode: "create" | "rename"
    original?: string
  } | null>(null)
  const [folderInput, setFolderInput] = React.useState("")

  function openFolderDialog(mode: "create" | "rename", original?: string) {
    setFolderDialog({ mode, original })
    setFolderInput(original ?? "")
  }
  function saveFolderDialog() {
    const value = folderInput.trim()
    if (!value || !folderDialog) return
    if (folderDialog.mode === "create") {
      folderStore.create(value)
      toast.success(c.folderCreated)
    } else if (folderDialog.original && folderDialog.original !== value) {
      folderStore.rename(folderDialog.original, value)
      templates
        .filter((t) => t.folder === folderDialog.original)
        .forEach((t) => templateStore.update(t.id, { folder: value }))
      toast.success(c.folderRenamed)
    }
    setFolderDialog(null)
  }
  function deleteFolder(f: string) {
    templates
      .filter((t) => t.folder === f)
      .forEach((t) => templateStore.update(t.id, { folder: c.uncategorized }))
    folderStore.remove(f)
    toast.success(c.folderDeleted)
  }

  return (
    <Page>
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {section === "messages" && (
              <Button variant="outline" onClick={() => openFolderDialog("create")}>
                <FolderPlus className="size-4" />
                {c.newFolder}
              </Button>
            )}
            {section === "messages" ? (
              <Button variant="volt" onClick={() => setMethodOpen(true)}>
                <Plus className="size-4" />
                {c.newTemplate}
              </Button>
            ) : (
              <Button variant="volt" onClick={() => openPromptForm(null)}>
                <Plus className="size-4" />
                {c.newPrompt}
              </Button>
            )}
          </div>
        }
      />

      <FeatureIntro
        featureKey="templates"
        icon={Mail}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <TemplateRecommendations />

      {/* Campaign Templates come in two flavors: fixed messages with merge
          variables, and prompts the AI expands per recipient. */}
      <Segmented
        options={[
          { v: "messages" as const, label: c.sectionMessages, icon: Mail },
          { v: "prompts" as const, label: c.sectionPrompts, icon: Sparkles },
        ]}
        value={section}
        onChange={setSection}
        className="mb-4 w-fit"
      />

      {section === "prompts" && (
        <PromptsSection
          prompts={promptTemplates}
          c={c}
          onCreate={() => openPromptForm(null)}
          onEdit={(pt) => openPromptForm(pt)}
          onDelete={setDeletingPrompt}
          onDuplicate={duplicatePrompt}
        />
      )}

      {section === "messages" && (
      <>
      {/* Channel filter — templates exist per channel (email, LinkedIn,
          WhatsApp, SMS, Messenger, Instagram). */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setChannelFilter("all")}
          aria-pressed={channelFilter === "all"}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            channelFilter === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {c.allChannels}
        </button>
        {CHANNELS.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => setChannelFilter(ch)}
            aria-pressed={channelFilter === ch}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              channelFilter === ch
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <ChannelIcon channel={ch} className="size-3.5" />
            {channelLabel(ch, c)}
          </button>
        ))}
      </div>

      <CollectionToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={c.search}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "recent", label: c.sortRecent },
          { value: "name", label: c.sortName },
          { value: "sent", label: c.sortSent },
          { value: "reply", label: c.sortReply },
        ]}
        view={view}
        onViewChange={setView}
        cardsLabel={c.viewCards}
        tableLabel={c.viewTable}
        onExport={exportCsv}
        exportLabel={c.exportLabel}
      >
        {view === "table" && (
          <Button variant="outline" onClick={() => setColumnsOpen(true)}>
            <Columns3 className="size-4" />
            <span className="hidden sm:inline">{c.columns}</span>
          </Button>
        )}
      </CollectionToolbar>

      {view === "table" ? (
        flat.length === 0 ? (
          <Card className="text-muted-foreground p-8 text-center text-sm">
            {c.noResults}
          </Card>
        ) : (
          <>
            <DataTable
              columns={TEMPLATE_COLUMNS}
              visible={templateColPrefs.visible}
              rows={flat}
              rowKey={(t) => t.id}
              locale={locale}
              onRowClick={(t) => openEditor(t)}
              selection={{
                isSelected: (t) => selectedIds.has(t.id),
                toggle: (t) => toggleRow(t.id),
                toggleAll: toggleAllRows,
                allSelected,
                someSelected,
              }}
              actions={(t) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={c.more}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => duplicateTemplate(t)}>
                      <Copy className="size-4" />
                      {c.copy}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setConfirmTarget(t)}
                    >
                      <Trash2 className="size-4" />
                      {c.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
            <BulkActionsBar
              count={selectedIds.size}
              onClear={() => setSelectedIds(new Set())}
              onExport={exportSelectedCsv}
              extra={{
                label: c.delete,
                icon: <Trash2 className="size-4" />,
                destructive: true,
                onClick: () => setBulkDeleteOpen(true),
              }}
            />
          </>
        )
      ) : grouped.length === 0 ? (
        <Card className="text-muted-foreground p-8 text-center text-sm">
          {c.noResults}
        </Card>
      ) : (
      <div className="space-y-8">
        {grouped.map(([groupFolder, groupTemplates]) => (
          <section key={groupFolder} className="space-y-3">
            <div className="flex items-center gap-1">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {groupFolder}{" "}
                <span className="tabular-nums">({groupTemplates.length})</span>
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    aria-label={c.folderActions}
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => openEditor(null, groupFolder)}>
                    <Plus className="size-4" />
                    {c.newTemplate}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openFolderDialog("rename", groupFolder)}>
                    <Pencil className="size-4" />
                    {c.renameFolder}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteFolder(groupFolder)}
                  >
                    <Trash2 className="size-4" />
                    {c.deleteFolder}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {groupTemplates.length === 0 ? (
              <button
                type="button"
                onClick={() => openEditor(null, groupFolder)}
                className="text-muted-foreground hover:border-primary/40 hover:text-foreground w-full rounded-xl border border-dashed py-8 text-center text-sm transition-colors"
              >
                <Plus className="mr-1 inline size-4" />
                {c.newTemplate}
              </button>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onOpen={openEditor}
                    onDelete={setConfirmTarget}
                    onDuplicate={duplicateTemplate}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
      )}
      </>
      )}

      {/* Create / rename folder */}
      <Dialog open={folderDialog !== null} onOpenChange={(v) => !v && setFolderDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {folderDialog?.mode === "rename" ? c.renameFolder : c.newFolder}
            </DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveFolderDialog()}
            placeholder={c.folderNamePlaceholder}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFolderDialog(null)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={saveFolderDialog}>
              {c.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton fullScreen>
          <DialogHeader className="border-b p-5 text-left">
            <DialogTitle>{editing ? c.editTemplate : c.newTemplate}</DialogTitle>
            <DialogDescription>
              {channel === "email" ? c.emailDialogDesc : c.linkedinDialogDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_230px] lg:grid-cols-[minmax(0,1fr)_230px_minmax(340px,0.85fr)]">
            {/* Form */}
            <div className="space-y-4 overflow-y-auto p-5">
              {/* Method 2 — generate with our GPT agent */}
              <div className="rounded-lg bg-gradient-to-r from-[#ff7e1f] via-[#f54ea2] to-[#6a5bff] p-[1.5px]">
                <div className="bg-background rounded-[6.5px] p-3">
                  {!aiOpen ? (
                    <button
                      type="button"
                      onClick={() => setAiOpen(true)}
                      className="flex w-full items-center gap-2.5 text-left"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f54ea2] to-[#6a5bff] text-white">
                        <Wand2 className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{c.aiGenerate}</span>
                        <span className="text-muted-foreground block text-xs">{c.aiSubtitle}</span>
                      </span>
                      <Sparkles className="text-muted-foreground size-4 shrink-0" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f54ea2] to-[#6a5bff] text-white">
                          <Wand2 className="size-4" />
                        </span>
                        <span className="flex-1 text-sm font-semibold">{c.aiGenerate}</span>
                        <Button variant="ghost" size="sm" onClick={() => setAiOpen(false)}>
                          {c.aiCollapse}
                        </Button>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                          {c.aiPresets}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiPresets.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() =>
                                setAiPrompt(locale === "es" ? p.prompt.es : p.prompt.en)
                              }
                              className="bg-muted hover:bg-muted/70 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                            >
                              {locale === "es" ? p.es : p.en}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="ai-prompt" className="text-xs">
                          {c.aiPromptLabel}
                        </Label>
                        <Textarea
                          id="ai-prompt"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder={c.aiPromptPlaceholder}
                          className="min-h-20"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={runAi}
                          disabled={!aiPrompt.trim() || aiBusy}
                          className="bg-gradient-to-r from-[#f54ea2] to-[#6a5bff] text-white hover:opacity-90"
                        >
                          {aiBusy ? (
                            <>
                              <Sparkles className="size-4 animate-pulse" />
                              {c.aiRunning}
                            </>
                          ) : aiGenerated ? (
                            <>
                              <Wand2 className="size-4" />
                              {c.aiRegenerate}
                            </>
                          ) : (
                            <>
                              <Wand2 className="size-4" />
                              {c.aiRun}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-name">{c.name}</Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.namePlaceholder}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template-channel">{c.channel}</Label>
                  <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                    <SelectTrigger id="template-channel" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((ch) => (
                        <SelectItem key={ch} value={ch}>
                          {channelLabel(ch, c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-folder">{c.folder}</Label>
                  <Select value={folder} onValueChange={setFolder}>
                    <SelectTrigger id="template-folder" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allFolders.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                      <SelectItem value={NEW_FOLDER}>{c.createNewFolder}</SelectItem>
                    </SelectContent>
                  </Select>
                  {folder === NEW_FOLDER && (
                    <Input
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder={c.folderNamePlaceholder}
                    />
                  )}
                </div>
              </div>

              {channel === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="template-subject">{c.subject}</Label>
                  <Input
                    id="template-subject"
                    ref={subjectRef}
                    value={subject}
                    onFocus={() => (activeFieldRef.current = "subject")}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={c.subjectPlaceholder}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="template-body">{c.body}</Label>
                <RichTextEditor
                  ref={bodyRef}
                  value={body}
                  onChange={setBody}
                  onFocus={() => (activeFieldRef.current = "body")}
                  placeholder={c.bodyPlaceholder}
                  ariaLabel={c.body}
                  minHeight="min-h-48"
                />
                <p className="text-muted-foreground text-xs">{c.variableHint}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-tags">{c.tags}</Label>
                <Input
                  id="template-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={c.tagsPlaceholder}
                />
                <p className="text-muted-foreground text-xs">{c.tagsHint}</p>
              </div>
            </div>

            {/* Variables column — always visible on tablet+ */}
            <div className="bg-muted/30 hidden flex-col overflow-hidden border-l md:flex">
              <div className="border-b p-4">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <Braces className="text-primary size-4" />
                  {c.variablesTitle}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {c.variablesSubtitle}
                </p>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto p-2">
                {groupByMergeVarGroup(VARIABLES, MERGE_VARIABLE_GROUPS).map((group) => (
                  <div key={group.key}>
                    <p className="text-muted-foreground px-2 pt-2 pb-1 text-[11px] font-semibold uppercase">
                      {c.varGroups[group.key]}
                    </p>
                    {group.items.map((v) => (
                      <div
                        key={v.tag}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", `{{${v.tag}}}`)
                        }
                        className="group hover:border-primary/40 hover:bg-background flex cursor-grab items-center gap-2 rounded-md border border-transparent px-2 py-1.5 active:cursor-grabbing"
                      >
                        <GripVertical className="text-muted-foreground size-3.5 shrink-0" />
                        <button
                          type="button"
                          onClick={() => insertVariable(v.tag)}
                          className="min-w-0 flex-1 text-left"
                          title={v.def[locale]}
                        >
                          <span className="block truncate font-mono text-xs">{`{{${v.tag}}}`}</span>
                          <span className="text-muted-foreground block truncate text-[11px]">
                            {v.def[locale]}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyVariable(v.tag)}
                          aria-label={c.copy}
                          className="text-muted-foreground hover:text-foreground shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          {copiedTag === v.tag ? (
                            <Check className="text-chart-1 size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview column — larger, always visible on desktop */}
            <div className="bg-muted/30 hidden flex-col overflow-hidden border-l lg:flex">
              <div className="border-b p-4">
                <p className="text-sm font-semibold">{c.tabPreview}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {c.previewSampleNote}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {subject.trim() === "" && stripHtml(body) === "" ? (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-center text-sm">
                    {c.previewEmptyState}
                  </div>
                ) : channel === "email" ? (
                  <div className="bg-background overflow-hidden rounded-lg border shadow-sm">
                    <div className="space-y-1 border-b p-3 text-xs">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-12 shrink-0">
                          {c.previewToLabel}
                        </span>
                        <span className="font-medium">
                          {SAMPLE_DATA.first_name} {SAMPLE_DATA.last_name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-12 shrink-0">
                          {c.previewSubjectLabel}
                        </span>
                        <span className="font-medium">
                          {renderWithSample(subject) || "—"}
                        </span>
                      </div>
                    </div>
                    <div
                      className="text-foreground/90 p-4 text-sm whitespace-pre-wrap [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: renderWithSample(body) }}
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                      {SAMPLE_DATA.first_name[0]}
                      {SAMPLE_DATA.last_name[0]}
                    </span>
                    <div
                      className="bg-background max-w-full rounded-2xl rounded-tl-sm border p-3 text-sm whitespace-pre-wrap shadow-sm [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: renderWithSample(body) }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={handleSave}>
              {c.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmTarget(null)
        }}
        title={c.deleteTitle}
        description={
          confirmTarget ? c.deleteDescription(confirmTarget.name) : undefined
        }
        confirmLabel={c.delete}
        destructive
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={c.deleteSelectedTitle(selectedIds.size)}
        description={c.deleteSelectedDescription}
        confirmLabel={c.delete}
        destructive
        onConfirm={deleteSelected}
      />

      {/* New template — pick a creation method first. */}
      <Dialog open={methodOpen} onOpenChange={setMethodOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{c.newTemplate}</DialogTitle>
            <DialogDescription>{c.methodDesc}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => {
                setMethodOpen(false)
                openEditor(null)
              }}
              className="hover:border-primary/40 hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 text-left transition-colors"
            >
              <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Pencil className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {c.methodManualTitle}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {c.methodManualDesc}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethodOpen(false)
                openPromptForm(null)
              }}
              className="hover:border-primary/40 hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 text-left transition-colors"
            >
              <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Sparkles className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {c.methodPromptTitle}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {c.methodPromptDesc}
                </span>
              </span>
            </button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMethodOpen(false)}>
              {c.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PromptFormDialog
        open={promptFormOpen}
        onOpenChange={setPromptFormOpen}
        prompt={editingPrompt}
      />

      <ConfirmDialog
        open={deletingPrompt !== null}
        onOpenChange={(next) => {
          if (!next) setDeletingPrompt(null)
        }}
        title={c.promptDeleteTitle}
        description={
          deletingPrompt
            ? c.promptDeleteDescription(deletingPrompt.name)
            : undefined
        }
        confirmLabel={c.delete}
        destructive
        onConfirm={() => {
          if (!deletingPrompt) return
          promptTemplateStore.remove(deletingPrompt.id)
          toast.success(c.promptDeleted)
          setDeletingPrompt(null)
        }}
      />

      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={TEMPLATE_COLUMNS}
        groups={TEMPLATE_COL_GROUPS}
        prefs={templateColPrefs}
        locale={locale}
      />
    </Page>
  )
}
