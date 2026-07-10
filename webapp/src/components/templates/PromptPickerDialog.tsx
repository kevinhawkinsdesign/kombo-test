import * as React from "react"
import { Mail, MessageCircle, PenLine, RefreshCw, Sparkles } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  usePromptTemplates,
  generatePromptedMessage,
} from "@/lib/prompt-templates"
import { normalizeChannel } from "@/lib/step-channels"
import { prospects, currentUser } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale"
import { mergeVarsHighlighted } from "@/lib/merge-vars-highlight"
import { cn } from "@/lib/utils"
import type { Channel, StepChannel } from "@/lib/types"

const COPY = {
  en: {
    title: "Write with a prompt",
    description:
      "Pick a saved prompt or write your own — the AI writes a unique message for every recipient.",
    customOption: "Custom prompt",
    customCaption: "Write a one-off instruction",
    customPlaceholder:
      "e.g. Write a short cold email opening with a likely pain point for {{first_name}}'s team at {{company}}…",
    channelLabel: "Channel",
    savedLabel: "Saved prompts",
    empty: "No saved prompts yet — create them on the Templates page.",
    previewTitle: "Preview",
    previewFor: (name: string, company: string) => `${name} @ ${company}`,
    previewEmpty: "Pick a prompt (or write one) to see example messages.",
    previewNote: "Each recipient gets their own AI-written version.",
    refresh: "New example",
    subject: "Subject",
    cancel: "Cancel",
    insert: "Use this prompt",
    channels: {
      email: "Email",
      linkedin: "LinkedIn",
      whatsapp: "WhatsApp",
    } as Partial<Record<Channel, string>>,
  },
  es: {
    title: "Escribir con un prompt",
    description:
      "Elige un prompt guardado o escribe el tuyo — la IA redacta un mensaje único para cada destinatario.",
    customOption: "Prompt personalizado",
    customCaption: "Escribe una instrucción puntual",
    customPlaceholder:
      "p. ej. Escribe un correo en frío breve abriendo con un posible punto de dolor del equipo de {{first_name}} en {{company}}…",
    channelLabel: "Canal",
    savedLabel: "Prompts guardados",
    empty: "Aún no hay prompts guardados — créalos en la página de Plantillas.",
    previewTitle: "Vista previa",
    previewFor: (name: string, company: string) => `${name} @ ${company}`,
    previewEmpty: "Elige un prompt (o escribe uno) para ver mensajes de ejemplo.",
    previewNote: "Cada destinatario recibe su propia versión escrita por la IA.",
    refresh: "Otro ejemplo",
    subject: "Asunto",
    cancel: "Cancelar",
    insert: "Usar este prompt",
    channels: {
      email: "Email",
      linkedin: "LinkedIn",
      whatsapp: "WhatsApp",
    } as Partial<Record<Channel, string>>,
  },
} as const

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

const SAMPLE_RECIPIENTS = prospects.slice(0, 5)

/** What the caller inserts as a sequence step when a prompt is chosen. */
export interface PromptStepSeed {
  channel: StepChannel
  subject?: string
  body: string
  promptName: string
}

const CUSTOM = "__custom_prompt__"

export function PromptPickerDialog({
  open,
  onOpenChange,
  onInsert,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onInsert: (seed: PromptStepSeed) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const saved = usePromptTemplates()

  const [selectedId, setSelectedId] = React.useState<string>(CUSTOM)
  const [customText, setCustomText] = React.useState("")
  const [customChannel, setCustomChannel] = React.useState<Channel>("email")
  // Advances on "New example": rotates the generation seed and the sample
  // recipient together, so each click reads like a different send.
  const [example, setExample] = React.useState(0)

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSelectedId(saved[0]?.id ?? CUSTOM)
      setCustomText("")
      setCustomChannel("email")
      setExample(0)
    }
  }

  const selectedSaved = saved.find((p) => p.id === selectedId)
  const isCustom = selectedId === CUSTOM
  const promptText = isCustom ? customText.trim() : (selectedSaved?.prompt ?? "")
  const channel: Channel = isCustom ? customChannel : (selectedSaved?.channel ?? "email")
  const promptName = isCustom
    ? c.customOption
    : (selectedSaved?.name ?? c.customOption)

  // Group saved prompts by folder, mirroring the Templates page.
  const folders = [...new Set(saved.map((p) => p.folder))]

  const recipient = SAMPLE_RECIPIENTS[example % SAMPLE_RECIPIENTS.length]
  const hasPreview = promptText.length > 0
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

  function handleInsert() {
    if (!generated) return
    const stepChannel = normalizeChannel(channel)
    onInsert({
      channel: stepChannel,
      subject: stepChannel === "email" ? generated.subject : undefined,
      body: generated.body,
      promptName,
    })
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
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Left — saved prompts (by folder) plus the custom option */}
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setSelectedId(CUSTOM)}
              aria-pressed={isCustom}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                isCustom
                  ? "border-primary/40 bg-primary/[0.06]"
                  : "hover:bg-muted"
              )}
            >
              <span className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md">
                <PenLine className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{c.customOption}</span>
                <span className="text-muted-foreground block text-xs">
                  {c.customCaption}
                </span>
              </span>
            </button>

            {isCustom && (
              <div className="space-y-2 pl-1">
                <div className="flex gap-1.5">
                  {PROMPT_CHANNELS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setCustomChannel(ch)}
                      aria-pressed={customChannel === ch}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        customChannel === ch
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <ChannelGlyph channel={ch} className="size-3.5" />
                      {c.channels[ch]}
                    </button>
                  ))}
                </div>
                <Textarea
                  autoFocus
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={c.customPlaceholder}
                  className="min-h-24"
                />
              </div>
            )}

            {saved.length === 0 ? (
              <p className="text-muted-foreground px-1 text-xs">{c.empty}</p>
            ) : (
              folders.map((folder) => (
                <div key={folder} className="space-y-1">
                  <p className="text-muted-foreground px-1 text-xs font-medium">
                    {folder}
                  </p>
                  {saved
                    .filter((p) => p.folder === folder)
                    .map((p) => {
                      const isActive = selectedId === p.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedId(p.id)}
                          aria-pressed={isActive}
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                            isActive
                              ? "border-primary/40 bg-primary/[0.06]"
                              : "border-transparent hover:bg-muted"
                          )}
                        >
                          <span className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md">
                            <ChannelGlyph channel={p.channel} className="size-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {p.name}
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {p.prompt}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                </div>
              ))
            )}
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
                        {mergeVarsHighlighted(generated.subject, mergeData)}
                      </span>
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">
                    {mergeVarsHighlighted(generated.body, mergeData)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {c.previewEmpty}
                </p>
              )}
            </div>
            <p className="text-muted-foreground text-[11px]">{c.previewNote}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleInsert} disabled={!generated}>
            <Sparkles className="size-4" />
            {c.insert}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
