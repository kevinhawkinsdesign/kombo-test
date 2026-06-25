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
} from "lucide-react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { useTemplates, templateStore } from "@/lib/store"
import { folderStore, useTemplateFolders } from "@/lib/template-folders"
import { generateTemplate, PROMPT_PRESETS } from "@/lib/mock-template-ai"
import { TemplateRecommendations } from "@/components/common/Recommendations"
import { useLocale } from "@/lib/locale"
import { downloadCsv } from "@/lib/csv"
import { formatDate } from "@/lib/format"
import type { Channel, EmailTemplate } from "@/lib/types"
import { cn } from "@/lib/utils"

const NEW_FOLDER = "__new_folder__"

interface VariableDef {
  tag: string
  en: string
  es: string
  defEn: string
  defEs: string
}

const VARIABLES: VariableDef[] = [
  { tag: "first_name", en: "First name", es: "Nombre", defEn: "Recipient's first name", defEs: "Nombre del destinatario" },
  { tag: "last_name", en: "Last name", es: "Apellido", defEn: "Recipient's last name", defEs: "Apellido del destinatario" },
  { tag: "company", en: "Company", es: "Empresa", defEn: "Recipient's company", defEs: "Empresa del destinatario" },
  { tag: "title", en: "Job title", es: "Cargo", defEn: "Recipient's job title", defEs: "Cargo del destinatario" },
  { tag: "industry", en: "Industry", es: "Sector", defEn: "Recipient's industry", defEs: "Sector del destinatario" },
  { tag: "city", en: "City", es: "Ciudad", defEn: "Recipient's city", defEs: "Ciudad del destinatario" },
  { tag: "sender", en: "Sender", es: "Remitente", defEn: "Your name", defEs: "Tu nombre" },
  { tag: "sender_company", en: "Your company", es: "Tu empresa", defEn: "Your company name", defEs: "El nombre de tu empresa" },
  { tag: "sender_title", en: "Your title", es: "Tu cargo", defEn: "Your job title", defEs: "Tu cargo" },
  { tag: "calendar_link", en: "Booking link", es: "Enlace de reserva", defEn: "Your meeting booking link", defEs: "Tu enlace para agendar" },
]

const COPY = {
  en: {
    topPerformer: "Top performer",
    deleteAria: (name: string) => `Delete ${name}`,
    sent: (count: string) => `${count} sent`,
    replySuffix: "reply",
    pageTitle: "Email Templates",
    pageDescription: "Reusable outreach templates with live performance.",
    newTemplate: "New template",
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
    variablesTitle: "Variables",
    variablesSubtitle: "Click to insert, drag into the body, or copy.",
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
  },
  es: {
    topPerformer: "Mejor rendimiento",
    deleteAria: (name: string) => `Eliminar ${name}`,
    sent: (count: string) => `${count} enviados`,
    replySuffix: "respuesta",
    pageTitle: "Plantillas de correo",
    pageDescription:
      "Plantillas de contacto reutilizables con rendimiento en vivo.",
    newTemplate: "Nueva plantilla",
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
    variablesTitle: "Variables",
    variablesSubtitle: "Haz clic para insertar, arrastra al cuerpo o copia.",
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
  return channel === "linkedin" ? (
    <LinkedinIcon className={className} />
  ) : (
    <Mail className={className} />
  )
}

function TemplateTable({
  rows,
  c,
  onOpen,
  onDelete,
}: {
  rows: EmailTemplate[]
  c: Copy
  onOpen: (template: EmailTemplate) => void
  onDelete: (template: EmailTemplate) => void
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colFolder}</TableHead>
            <TableHead>{c.colSubject}</TableHead>
            <TableHead className="text-right">{c.colSent}</TableHead>
            <TableHead className="text-right">{c.colReply}</TableHead>
            <TableHead className="text-right">{c.colUpdated}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => {
            const preview =
              t.channel === "email" ? t.subject : t.body.split("\n")[0]
            return (
              <TableRow
                key={t.id}
                className="cursor-pointer"
                onClick={() => onOpen(t)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
                      <ChannelIcon channel={t.channel} className="size-3.5" />
                    </span>
                    <span className="font-medium">{t.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {t.folder}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[260px] truncate text-sm">
                  {preview}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {t.sent.toLocaleString()}
                </TableCell>
                <TableCell className="text-chart-1 text-right font-medium tabular-nums">
                  {t.replyRate}%
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-xs whitespace-nowrap">
                  {formatDate(t.updatedAt)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.deleteAria(t.name)}
                    className="text-muted-foreground hover:text-destructive size-8"
                    onClick={() => onDelete(t)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

function TemplateCard({
  template,
  onOpen,
  onDelete,
}: {
  template: EmailTemplate
  onOpen: (template: EmailTemplate) => void
  onDelete: (template: EmailTemplate) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const isTopPerformer = template.replyRate > 25
  const strongReplyRate = template.replyRate >= 20
  const preview =
    template.channel === "email"
      ? template.subject
      : template.body.split("\n")[0]

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
          aria-label={c.deleteAria(template.name)}
          className="text-muted-foreground hover:text-destructive size-8 shrink-0"
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
  const [varQuery, setVarQuery] = React.useState<string | null>(null)

  // AI generator (method 2: prompt → draft).
  const [aiOpen, setAiOpen] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState("")
  const [aiBusy, setAiBusy] = React.useState(false)
  const [aiSeed, setAiSeed] = React.useState(0)
  const [aiGenerated, setAiGenerated] = React.useState(false)

  const bodyRef = React.useRef<HTMLTextAreaElement>(null)
  const subjectRef = React.useRef<HTMLInputElement>(null)
  const activeFieldRef = React.useRef<"body" | "subject">("body")

  const [confirmTarget, setConfirmTarget] = React.useState<EmailTemplate | null>(
    null
  )

  // All folders shown = managed folders ∪ any folder referenced by a template.
  const allFolders = React.useMemo(() => {
    const set = new Set<string>(folders)
    templates.forEach((t) => t.folder && set.add(t.folder))
    return [...set]
  }, [folders, templates])

  // Insert a {{variable}} into whichever field was last focused.
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
    const el = bodyRef.current
    const start = el?.selectionStart ?? body.length
    const end = el?.selectionEnd ?? body.length
    const next = body.slice(0, start) + ins + body.slice(end)
    setBody(next)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + ins.length, start + ins.length)
    })
  }

  // Type-ahead: typing "{{" in the body opens a variable autocomplete.
  function onBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setBody(val)
    const caret = e.target.selectionStart ?? val.length
    const m = /\{\{(\w*)$/.exec(val.slice(0, caret))
    setVarQuery(m ? m[1] : null)
  }

  function pickTypeahead(tag: string) {
    const el = bodyRef.current
    if (!el) return
    const caret = el.selectionStart ?? body.length
    const m = /\{\{(\w*)$/.exec(body.slice(0, caret))
    if (!m) return
    const startIdx = caret - m[0].length
    const ins = `{{${tag}}}`
    const next = body.slice(0, startIdx) + ins + body.slice(caret)
    setBody(next)
    setVarQuery(null)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(startIdx + ins.length, startIdx + ins.length)
    })
  }

  function copyVariable(tag: string) {
    const text = `{{${tag}}}`
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopiedTag(tag)
    window.setTimeout(() => setCopiedTag((cur) => (cur === tag ? null : cur)), 1200)
  }

  const typeaheadMatches =
    varQuery !== null
      ? VARIABLES.filter((v) => v.tag.includes(varQuery.toLowerCase())).slice(0, 6)
      : []

  function openEditor(template: EmailTemplate | null, presetFolder?: string) {
    setEditing(template)
    setName(template?.name ?? "")
    setFolder(template?.folder ?? presetFolder ?? folders[0] ?? "Cold outreach")
    setNewFolderName("")
    setChannel(template?.channel ?? "email")
    setSubject(template?.subject ?? "")
    setBody(template?.body ?? "")
    setTags(template?.tags.join(", ") ?? "")
    setVarQuery(null)
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
      setBody(draft.body)
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

  const [view, setView] = React.useState<CollectionView>("cards")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("recent")

  const matches = React.useCallback(
    (t: EmailTemplate) => {
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
    [query]
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
        t.channel === "linkedin" ? c.linkedin : c.email,
        t.subject,
        t.sent,
        `${t.replyRate}%`,
        formatDate(t.updatedAt),
      ])
    )
    toast.success(c.exported)
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
            <Button variant="outline" onClick={() => openFolderDialog("create")}>
              <FolderPlus className="size-4" />
              {c.newFolder}
            </Button>
            <Button variant="volt" onClick={() => openEditor(null)}>
              <Plus className="size-4" />
              {c.newTemplate}
            </Button>
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
      />

      {view === "table" ? (
        flat.length === 0 ? (
          <Card className="text-muted-foreground p-8 text-center text-sm">
            {c.noResults}
          </Card>
        ) : (
          <TemplateTable
            rows={flat}
            c={c}
            onOpen={openEditor}
            onDelete={setConfirmTarget}
          />
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
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
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
        <DialogContent
          showCloseButton
          className="flex h-screen w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-[92vh] sm:max-w-5xl sm:rounded-xl"
        >
          <DialogHeader className="border-b p-5 text-left">
            <DialogTitle>{editing ? c.editTemplate : c.newTemplate}</DialogTitle>
            <DialogDescription>
              {channel === "email" ? c.emailDialogDesc : c.linkedinDialogDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[1fr_280px]">
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
                      <SelectItem value="email">{c.email}</SelectItem>
                      <SelectItem value="linkedin">{c.linkedin}</SelectItem>
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
                <div className="relative">
                  <Textarea
                    id="template-body"
                    ref={bodyRef}
                    value={body}
                    onFocus={() => (activeFieldRef.current = "body")}
                    onChange={onBodyChange}
                    onBlur={() => window.setTimeout(() => setVarQuery(null), 150)}
                    placeholder={c.bodyPlaceholder}
                    className="min-h-48"
                  />
                  {typeaheadMatches.length > 0 && (
                    <div className="bg-popover absolute right-2 bottom-2 z-10 w-56 overflow-hidden rounded-md border shadow-md">
                      {typeaheadMatches.map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            pickTypeahead(v.tag)
                          }}
                          className="hover:bg-muted flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm"
                        >
                          <Braces className="text-primary size-3.5 shrink-0" />
                          <span className="font-mono text-xs">{`{{${v.tag}}}`}</span>
                          <span className="text-muted-foreground ml-auto truncate text-[11px]">
                            {locale === "es" ? v.es : v.en}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">{c.typeaheadHint}</p>
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

            {/* Variables sidebar */}
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
                {VARIABLES.map((v) => (
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
                      title={locale === "es" ? v.defEs : v.defEn}
                    >
                      <span className="block truncate font-mono text-xs">{`{{${v.tag}}}`}</span>
                      <span className="text-muted-foreground block truncate text-[11px]">
                        {locale === "es" ? v.defEs : v.defEn}
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
    </Page>
  )
}
