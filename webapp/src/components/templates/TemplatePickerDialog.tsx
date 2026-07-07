import * as React from "react"
import {
  Mail,
  Search as SearchIcon,
  MessageCircle,
  MessageSquare,
  Send,
  Camera,
  FileText,
  Check,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useTemplates } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Channel, EmailTemplate } from "@/lib/types"

const COPY = {
  en: {
    title: "Insert a template",
    description: "Pick a template — the preview fills in this recipient.",
    search: "Search templates…",
    allChannels: "All channels",
    noResults: "No templates match your search.",
    empty: "No templates yet.",
    emptyHint: "Create one on the Templates page to reuse it here.",
    pickPrompt: "Select a template to preview it here.",
    toLabel: "To",
    subjectLabel: "Subject",
    sentLabel: (count: string) => `${count} sent`,
    replyLabel: (rate: number) => `${rate}% reply`,
    previewNote: "Personalized for this recipient — variables are filled in.",
    cancel: "Cancel",
    insert: "Insert template",
  },
  es: {
    title: "Insertar una plantilla",
    description: "Elige una plantilla — la vista previa usa este destinatario.",
    search: "Buscar plantillas…",
    allChannels: "Todos los canales",
    noResults: "Ninguna plantilla coincide con tu búsqueda.",
    empty: "Aún no hay plantillas.",
    emptyHint: "Crea una en la página de Plantillas para reutilizarla aquí.",
    pickPrompt: "Selecciona una plantilla para verla aquí.",
    toLabel: "Para",
    subjectLabel: "Asunto",
    sentLabel: (count: string) => `${count} enviados`,
    replyLabel: (rate: number) => `${rate}% respuesta`,
    previewNote: "Personalizada para este destinatario — las variables se rellenan.",
    cancel: "Cancelar",
    insert: "Insertar plantilla",
  },
} as const

type Locale = "en" | "es"

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
    case "sms":
      return <MessageSquare className={className} />
    case "messenger":
      return <Send className={cn(className, "text-[#0084ff]")} />
    case "instagram":
      return <Camera className={cn(className, "text-[#e1306c]")} />
    default:
      return <Mail className={className} />
  }
}

// Substitute {{tag}} with the recipient's resolved value. Unknown tags are left
// literal so a typo'd variable is still visible in the preview.
function renderWithVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, tag: string) =>
    Object.prototype.hasOwnProperty.call(vars, tag) ? vars[tag] : whole
  )
}

interface TemplatePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the chosen template; the caller decides how to insert it. */
  onInsert: (template: EmailTemplate) => void
  /** Resolved recipient + sender values used to render the live preview. */
  vars: Record<string, string>
  /** Recipient name shown in the email-style preview header. */
  recipientName?: string
  /** When set, the list defaults to this channel (with a toggle to show all). */
  channel?: Channel
  locale: Locale
}

export function TemplatePickerDialog({
  open,
  onOpenChange,
  onInsert,
  vars,
  recipientName,
  channel,
  locale,
}: TemplatePickerDialogProps) {
  const c = COPY[locale]
  const templates = useTemplates()

  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // Default to the conversation's channel when one is provided.
  const [channelOnly, setChannelOnly] = React.useState(Boolean(channel))

  // Reset the picker each time it opens (render-phase pattern, no effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery("")
      setSelectedId(null)
      setChannelOnly(Boolean(channel))
    }
  }

  const q = query.trim().toLowerCase()
  const filtered = templates.filter((t) => {
    if (channelOnly && channel && t.channel !== channel) return false
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q) ||
      t.folder.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  })

  // Selected template falls back to the first match so a preview always shows.
  const selected =
    filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null

  function handleInsert() {
    if (!selected) return
    onInsert(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton fullScreen>
        <DialogHeader className="border-b p-5 text-left">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="text-primary size-5" />
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[340px_1fr]">
          {/* Left: searchable list */}
          <div className="flex flex-col overflow-hidden border-b md:border-r md:border-b-0">
            <div className="space-y-2 border-b p-3">
              <div className="relative">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={c.search}
                  className="pl-8"
                />
              </div>
              {channel && (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChannelOnly(true)}
                    aria-pressed={channelOnly}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      channelOnly
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <ChannelIcon channel={channel} className="size-3.5" />
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelOnly(false)}
                    aria-pressed={!channelOnly}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      !channelOnly
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {c.allChannels}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {templates.length === 0 ? (
                <div className="text-muted-foreground p-6 text-center text-sm">
                  <p className="font-medium">{c.empty}</p>
                  <p className="mt-1 text-xs">{c.emptyHint}</p>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-muted-foreground p-6 text-center text-sm">
                  {c.noResults}
                </p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((t) => {
                    const isActive = selected?.id === t.id
                    const line =
                      t.channel === "email" ? t.subject : t.body.split("\n")[0]
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedId(t.id)}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                          isActive
                            ? "border-primary/40 bg-primary/[0.06]"
                            : "border-transparent hover:bg-muted"
                        )}
                      >
                        <span className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md">
                          <ChannelIcon channel={t.channel} className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium">
                              {t.name}
                            </span>
                            {isActive && (
                              <Check className="text-primary size-3.5 shrink-0" />
                            )}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                            {line}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: sizeable preview */}
          <div className="bg-muted/30 flex flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b p-4">
                  <span className="bg-background text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md border">
                    <ChannelIcon channel={selected.channel} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{selected.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {selected.folder}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-normal">
                    {c.sentLabel(selected.sent.toLocaleString())}
                  </Badge>
                  <Badge
                    variant={selected.replyRate >= 20 ? "success" : "secondary"}
                    className="font-normal"
                  >
                    {c.replyLabel(selected.replyRate)}
                  </Badge>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  <div className="mx-auto max-w-2xl space-y-3">
                    {selected.channel === "email" ? (
                      <div className="bg-background overflow-hidden rounded-lg border shadow-sm">
                        <div className="space-y-1 border-b p-4 text-sm">
                          {recipientName && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-16 shrink-0">
                                {c.toLabel}
                              </span>
                              <span className="font-medium">{recipientName}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-16 shrink-0">
                              {c.subjectLabel}
                            </span>
                            <span className="font-medium">
                              {renderWithVars(selected.subject, vars) || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="text-foreground/90 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                          {renderWithVars(selected.body, vars)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                          {(recipientName ?? "?").slice(0, 1).toUpperCase()}
                        </span>
                        <div className="bg-background max-w-full rounded-2xl rounded-tl-sm border p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                          {renderWithVars(selected.body, vars)}
                        </div>
                      </div>
                    )}
                    <p className="text-muted-foreground text-[11px]">
                      {c.previewNote}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-center text-sm">
                {c.pickPrompt}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" disabled={!selected} onClick={handleInsert}>
            <FileText className="size-4" />
            {c.insert}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
