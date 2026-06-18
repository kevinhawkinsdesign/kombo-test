import * as React from "react"
import { toast } from "sonner"
import { Plus, Mail, Trash2 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTemplates, templateStore } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import type { Channel, EmailTemplate } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  },
} as const

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

function groupByFolder(templates: EmailTemplate[]): [string, EmailTemplate[]][] {
  const groups = new Map<string, EmailTemplate[]>()
  for (const template of templates) {
    const bucket = groups.get(template.folder)
    if (bucket) {
      bucket.push(template)
    } else {
      groups.set(template.folder, [template])
    }
  }
  return Array.from(groups.entries())
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

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<EmailTemplate | null>(null)
  const [name, setName] = React.useState("")
  const [folder, setFolder] = React.useState("Cold outreach")
  const [channel, setChannel] = React.useState<Channel>("email")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [tags, setTags] = React.useState("")

  const [confirmTarget, setConfirmTarget] = React.useState<EmailTemplate | null>(
    null
  )

  function openEditor(template: EmailTemplate | null) {
    setEditing(template)
    setName(template?.name ?? "")
    setFolder(template?.folder ?? "Cold outreach")
    setChannel(template?.channel ?? "email")
    setSubject(template?.subject ?? "")
    setBody(template?.body ?? "")
    setTags(template?.tags.join(", ") ?? "")
    setOpen(true)
  }

  function handleSave() {
    const patch = {
      name,
      folder,
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

  const groups = groupByFolder(templates)

  return (
    <Page>
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
        action={
          <Button variant="volt" onClick={() => openEditor(null)}>
            <Plus className="size-4" />
            {c.newTemplate}
          </Button>
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

      <div className="space-y-8">
        {groups.map(([groupFolder, groupTemplates]) => (
          <section key={groupFolder} className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {groupFolder}{" "}
              <span className="tabular-nums">({groupTemplates.length})</span>
            </h3>
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
          </section>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? c.editTemplate : c.newTemplate}
            </DialogTitle>
            <DialogDescription>
              {channel === "email" ? c.emailDialogDesc : c.linkedinDialogDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                <Select
                  value={channel}
                  onValueChange={(value) => setChannel(value as Channel)}
                >
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
                <Input
                  id="template-folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder={c.folderPlaceholder}
                />
              </div>
            </div>

            {channel === "email" && (
              <div className="space-y-2">
                <Label htmlFor="template-subject">{c.subject}</Label>
                <Input
                  id="template-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={c.subjectPlaceholder}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="template-body">{c.body}</Label>
              <Textarea
                id="template-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={c.bodyPlaceholder}
                className="min-h-48"
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={handleSave}>
              {c.save}
            </Button>
          </DialogFooter>
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
