import * as React from "react"
import { toast } from "sonner"
import { Mail, MessageCircle, RefreshCw, Sparkles } from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  promptTemplateStore,
  usePromptTemplates,
  generatePromptedMessage,
  promptFolderFor,
  type PromptTemplate,
} from "@/lib/prompt-templates"
import { prospects, currentUser } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { Channel } from "@/lib/types"

const COPY = {
  en: {
    titleNew: "New prompt template",
    titleEdit: "Edit prompt template",
    description:
      "Describe the message once — the AI writes a unique version for every recipient.",
    nameLabel: "Name",
    namePlaceholder: "e.g. Cold intro — pain point",
    channelLabel: "Channel",
    promptLabel: "Prompt",
    promptPlaceholder:
      "e.g. Write a short cold email opening with a likely pain point for {{first_name}}'s team at {{company}}…",
    promptHint:
      "The AI blends this with what Kombo knows about you — your product, USPs, ICP, and the countries you sell in — plus each recipient's data.",
    folderLabel: "Folder",
    newFolder: "New folder…",
    newFolderPlaceholder: "Folder name",
    previewTitle: "Preview",
    previewFor: (name: string, company: string) => `${name} @ ${company}`,
    previewEmpty: "Start typing a prompt to see example messages.",
    refresh: "New example",
    subject: "Subject",
    cancel: "Cancel",
    create: "Create prompt",
    save: "Save",
    created: "Prompt created",
    updated: "Prompt updated",
    channels: {
      email: "Email",
      linkedin: "LinkedIn",
      whatsapp: "WhatsApp",
    } as Partial<Record<Channel, string>>,
  },
  es: {
    titleNew: "Nuevo prompt",
    titleEdit: "Editar prompt",
    description:
      "Describe el mensaje una sola vez — la IA escribe una versión única para cada destinatario.",
    nameLabel: "Nombre",
    namePlaceholder: "p. ej. Intro en frío — punto de dolor",
    channelLabel: "Canal",
    promptLabel: "Prompt",
    promptPlaceholder:
      "p. ej. Escribe un correo en frío breve abriendo con un posible punto de dolor del equipo de {{first_name}} en {{company}}…",
    promptHint:
      "La IA lo combina con lo que Kombo sabe de ti — tu producto, propuestas de valor, ICP y los países donde vendes — más los datos de cada destinatario.",
    folderLabel: "Carpeta",
    newFolder: "Nueva carpeta…",
    newFolderPlaceholder: "Nombre de la carpeta",
    previewTitle: "Vista previa",
    previewFor: (name: string, company: string) => `${name} @ ${company}`,
    previewEmpty: "Empieza a escribir un prompt para ver mensajes de ejemplo.",
    refresh: "Otro ejemplo",
    subject: "Asunto",
    cancel: "Cancelar",
    create: "Crear prompt",
    save: "Guardar",
    created: "Prompt creado",
    updated: "Prompt actualizado",
    channels: {
      email: "Email",
      linkedin: "LinkedIn",
      whatsapp: "WhatsApp",
    } as Partial<Record<Channel, string>>,
  },
} as const

// Prompt templates cover the channels the extension picker groups by.
const PROMPT_CHANNELS: Channel[] = ["email", "linkedin", "whatsapp"]

function ChannelGlyph({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  if (channel === "linkedin") return <LinkedinIcon className={className} />
  if (channel === "whatsapp")
    return <MessageCircle className={cn(className, "text-[#25D366]")} />
  return <Mail className={className} />
}

// A rotating pool of real mock recipients so each example reads like a
// different person actually received it.
const SAMPLE_RECIPIENTS = prospects.slice(0, 5)

function mergeVars(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, tag: string) => data[tag] ?? `{{${tag}}}`)
}

export function PromptFormDialog({
  open,
  onOpenChange,
  prompt,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Present = edit mode; absent = create mode. */
  prompt?: PromptTemplate | null
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const all = usePromptTemplates()
  const [name, setName] = React.useState("")
  const [channel, setChannel] = React.useState<Channel>("email")
  const [folder, setFolder] = React.useState(promptFolderFor("email"))
  const [folderTouched, setFolderTouched] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")
  const [promptText, setPromptText] = React.useState("")
  // Advances on "New example": rotates both the generation seed and the
  // sample recipient, so every click shows a genuinely different message.
  const [example, setExample] = React.useState(0)

  // Reset on open (house pattern), seeding from `prompt` in edit mode.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(prompt?.name ?? "")
      setChannel(prompt?.channel ?? "email")
      setFolder(prompt?.folder ?? promptFolderFor(prompt?.channel ?? "email"))
      setFolderTouched(Boolean(prompt))
      setNewFolderName("")
      setPromptText(prompt?.prompt ?? "")
      setExample(0)
    }
  }

  const NEW_FOLDER = "__new_prompt_folder__"
  // Folder options: the per-channel defaults plus every folder in use.
  const folderOptions = [
    ...new Set([
      promptFolderFor("email"),
      promptFolderFor("linkedin"),
      promptFolderFor("whatsapp"),
      ...all.map((p) => p.folder),
      ...(folder && folder !== NEW_FOLDER ? [folder] : []),
    ]),
  ]

  function pickChannel(ch: Channel) {
    setChannel(ch)
    // Follow the channel's default folder until the user picks one.
    if (!folderTouched) setFolder(promptFolderFor(ch))
  }

  const resolvedFolder =
    folder === NEW_FOLDER
      ? newFolderName.trim() || promptFolderFor(channel)
      : folder

  const isEdit = Boolean(prompt)
  const canSave = name.trim().length > 0 && promptText.trim().length > 0

  const recipient = SAMPLE_RECIPIENTS[example % SAMPLE_RECIPIENTS.length]
  const hasPreview = promptText.trim().length > 0
  const generated = hasPreview
    ? generatePromptedMessage(promptText, channel, example)
    : null
  const mergeData: Record<string, string> = {
    first_name: recipient.firstName,
    last_name: recipient.lastName,
    company: recipient.company,
    title: recipient.title,
    industry: recipient.industry,
    city: recipient.location,
    sender: currentUser.name,
    sender_company: currentUser.company,
    sender_title: currentUser.role,
    calendar_link: "kombo.ai/meet/kevin",
  }

  function handleSave() {
    if (!canSave) return
    if (prompt) {
      promptTemplateStore.update(prompt.id, {
        name: name.trim(),
        channel,
        folder: resolvedFolder,
        prompt: promptText.trim(),
      })
      toast.success(c.updated)
    } else {
      promptTemplateStore.create({
        name: name.trim(),
        channel,
        folder: resolvedFolder,
        prompt: promptText.trim(),
      })
      toast.success(c.created)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            {isEdit ? c.titleEdit : c.titleNew}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Left — the prompt itself */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-name">{c.nameLabel}</Label>
              <Input
                id="prompt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>{c.channelLabel}</Label>
              <div className="flex gap-1.5">
                {PROMPT_CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => pickChannel(ch)}
                    aria-pressed={channel === ch}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      channel === ch
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <ChannelGlyph channel={ch} className="size-3.5" />
                    {c.channels[ch]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-folder">{c.folderLabel}</Label>
              <Select
                value={folder}
                onValueChange={(v) => {
                  setFolder(v)
                  setFolderTouched(true)
                }}
              >
                <SelectTrigger id="prompt-folder" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_FOLDER}>{c.newFolder}</SelectItem>
                </SelectContent>
              </Select>
              {folder === NEW_FOLDER && (
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={c.newFolderPlaceholder}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-text">{c.promptLabel}</Label>
              <Textarea
                id="prompt-text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={c.promptPlaceholder}
                className="min-h-32"
              />
              <p className="text-muted-foreground text-xs">{c.promptHint}</p>
            </div>
          </div>

          {/* Right — per-recipient preview with a refresh loop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                {c.previewTitle}
                {hasPreview && (
                  <span className="text-muted-foreground ml-1.5 font-normal">
                    ·{" "}
                    {c.previewFor(
                      `${recipient.firstName} ${recipient.lastName}`,
                      recipient.company
                    )}
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasPreview}
                onClick={() => setExample((n) => n + 1)}
              >
                <RefreshCw className="size-4" />
                {c.refresh}
              </Button>
            </div>
            <div className="bg-muted/40 min-h-56 space-y-2 rounded-lg border p-3">
              {generated ? (
                <>
                  {channel === "email" && generated.subject && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">{c.subject}: </span>
                      <span className="font-medium">
                        {mergeVars(generated.subject, mergeData)}
                      </span>
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">
                    {mergeVars(generated.body, mergeData)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {c.previewEmpty}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave} disabled={!canSave}>
            {isEdit ? c.save : c.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
