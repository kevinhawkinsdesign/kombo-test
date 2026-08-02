import * as React from "react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import {
  Mail,
  Search as SearchIcon,
  FileText,
  Check,
  ArrowLeft,
  Plus,
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LinkedinIcon, WhatsappIcon } from "@/components/icons/BrandIcons"
import { useTemplates, templateStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { mergeVarsHighlighted, mergeVarsRaw } from "@/lib/merge-vars-highlight"
import type { Locale } from "@/lib/locale"
import type { Channel, EmailTemplate } from "@/lib/types"

// Folder new bare-bones templates land in — matches the "Uncategorized"
// bucket Templates.tsx already uses for templates without a folder pick.
const UNCATEGORIZED_FOLDER: Record<Locale, string> = {
  en: "Uncategorized",
  es: "Sin categoría",
  it: "Senza categoria",
  fr: "Sans catégorie",
  de: "Nicht kategorisiert",
  pt: "Sem categoria",
  pt_BR: "Sem categoria",
}

const QUICK_CREATE_CHANNELS: Channel[] = ["email", "linkedin", "whatsapp"]

const COPY = {
  en: {
    title: "Insert a template",
    description: "Pick a template — the preview fills in this recipient.",
    search: "Search templates…",
    allChannels: "All channels",
    noResults: "No templates match your search.",
    empty: "No templates yet.",
    emptyHint: "Create a quick one below, or build a full one on the Templates page.",
    pickPrompt: "Select a template to preview it here.",
    toLabel: "To",
    subjectLabel: "Subject",
    sentLabel: (count: string) => `${count} sent`,
    replyLabel: (rate: number) => `${rate}% reply`,
    previewNote: "Personalized for this recipient — variables are filled in.",
    cancel: "Cancel",
    back: "Back",
    insert: "Insert template",
    newTemplate: "New template",
    quickCreateBack: "Back to templates",
    nameLabel: "Name",
    namePlaceholder: "e.g. Quick follow-up",
    channelLabel: "Channel",
    bodyLabel: "Message",
    bodyPlaceholder: "Write your message…",
    channelEmail: "Email",
    channelLinkedin: "LinkedIn",
    channelWhatsapp: "WhatsApp",
    createInsert: "Create & insert",
    templateCreated: "Template created",
  },
  es: {
    title: "Insertar una plantilla",
    description: "Elige una plantilla — la vista previa usa este destinatario.",
    search: "Buscar plantillas…",
    allChannels: "Todos los canales",
    noResults: "Ninguna plantilla coincide con tu búsqueda.",
    empty: "Aún no hay plantillas.",
    emptyHint: "Crea una rápida aquí abajo, o una completa en la página de Plantillas.",
    pickPrompt: "Selecciona una plantilla para verla aquí.",
    toLabel: "Para",
    subjectLabel: "Asunto",
    sentLabel: (count: string) => `${count} enviados`,
    replyLabel: (rate: number) => `${rate}% respuesta`,
    previewNote: "Personalizada para este destinatario — las variables se rellenan.",
    cancel: "Cancelar",
    back: "Volver",
    insert: "Insertar plantilla",
    newTemplate: "Nueva plantilla",
    quickCreateBack: "Volver a las plantillas",
    nameLabel: "Nombre",
    namePlaceholder: "p. ej. Seguimiento rápido",
    channelLabel: "Canal",
    bodyLabel: "Mensaje",
    bodyPlaceholder: "Escribe tu mensaje…",
    channelEmail: "Email",
    channelLinkedin: "LinkedIn",
    channelWhatsapp: "WhatsApp",
    createInsert: "Crear e insertar",
    templateCreated: "Plantilla creada",
  },
  it: {
    title: "Inserisci un modello",
    description: "Scegli un modello — l'anteprima si adatta a questo destinatario.",
    search: "Cerca modelli…",
    allChannels: "Tutti i canali",
    noResults: "Nessun modello corrisponde alla tua ricerca.",
    empty: "Ancora nessun modello.",
    emptyHint: "Creane uno rapido qui sotto, o uno completo nella pagina Modelli.",
    pickPrompt: "Seleziona un modello per vederne l'anteprima qui.",
    toLabel: "A",
    subjectLabel: "Oggetto",
    sentLabel: (count: string) => `${count} inviate`,
    replyLabel: (rate: number) => `${rate}% risposte`,
    previewNote: "Personalizzato per questo destinatario — le variabili sono compilate.",
    cancel: "Annulla",
    back: "Indietro",
    insert: "Inserisci modello",
    newTemplate: "Nuovo modello",
    quickCreateBack: "Torna ai modelli",
    nameLabel: "Nome",
    namePlaceholder: "es. Follow-up rapido",
    channelLabel: "Canale",
    bodyLabel: "Messaggio",
    bodyPlaceholder: "Scrivi il tuo messaggio…",
    channelEmail: "Email",
    channelLinkedin: "LinkedIn",
    channelWhatsapp: "WhatsApp",
    createInsert: "Crea e inserisci",
    templateCreated: "Modello creato",
  },
  fr: {
    title: "Insérer un modèle",
    description: "Choisissez un modèle — l'aperçu s'adapte à ce destinataire.",
    search: "Rechercher des modèles…",
    allChannels: "Tous les canaux",
    noResults: "Aucun modèle ne correspond à votre recherche.",
    empty: "Aucun modèle pour le moment.",
    emptyHint: "Créez-en un rapide ci-dessous, ou un complet sur la page Modèles.",
    pickPrompt: "Sélectionnez un modèle pour le prévisualiser ici.",
    toLabel: "À",
    subjectLabel: "Objet",
    sentLabel: (count: string) => `${count} envoyés`,
    replyLabel: (rate: number) => `${rate}% de réponses`,
    previewNote: "Personnalisé pour ce destinataire — les variables sont renseignées.",
    cancel: "Annuler",
    back: "Retour",
    insert: "Insérer le modèle",
    newTemplate: "Nouveau modèle",
    quickCreateBack: "Retour aux modèles",
    nameLabel: "Nom",
    namePlaceholder: "ex. Relance rapide",
    channelLabel: "Canal",
    bodyLabel: "Message",
    bodyPlaceholder: "Rédigez votre message…",
    channelEmail: "Email",
    channelLinkedin: "LinkedIn",
    channelWhatsapp: "WhatsApp",
    createInsert: "Créer et insérer",
    templateCreated: "Modèle créé",
  },
  de: {
    title: "Vorlage einfügen",
    description: "Wähle eine Vorlage — die Vorschau übernimmt diesen Empfänger.",
    search: "Vorlagen durchsuchen…",
    allChannels: "Alle Kanäle",
    noResults: "Keine Vorlagen entsprechen deiner Suche.",
    empty: "Noch keine Vorlagen.",
    emptyHint: "Erstelle unten eine schnelle Vorlage, oder eine vollständige auf der Vorlagenseite.",
    pickPrompt: "Wähle eine Vorlage, um sie hier in der Vorschau zu sehen.",
    toLabel: "An",
    subjectLabel: "Betreff",
    sentLabel: (count: string) => `${count} gesendet`,
    replyLabel: (rate: number) => `${rate}% Antwortquote`,
    previewNote: "Personalisiert für diesen Empfänger — Variablen sind ausgefüllt.",
    cancel: "Abbrechen",
    back: "Zurück",
    insert: "Vorlage einfügen",
    newTemplate: "Neue Vorlage",
    quickCreateBack: "Zurück zu den Vorlagen",
    nameLabel: "Name",
    namePlaceholder: "z. B. Kurzes Follow-up",
    channelLabel: "Kanal",
    bodyLabel: "Nachricht",
    bodyPlaceholder: "Schreibe deine Nachricht…",
    channelEmail: "E-Mail",
    channelLinkedin: "LinkedIn",
    channelWhatsapp: "WhatsApp",
    createInsert: "Erstellen & einfügen",
    templateCreated: "Vorlage erstellt",
  },
  pt: {
    title: "Inserir um modelo",
    description: "Escolhe um modelo — a pré-visualização usa este destinatário.",
    search: "Pesquisar modelos…",
    allChannels: "Todos os canais",
    noResults: "Nenhum modelo corresponde à tua pesquisa.",
    empty: "Ainda não há modelos.",
    emptyHint: "Cria um rápido aqui em baixo, ou um completo na página de Modelos.",
    pickPrompt: "Seleciona um modelo para o pré-visualizar aqui.",
    toLabel: "Para",
    subjectLabel: "Assunto",
    sentLabel: (count: string) => `${count} enviados`,
    replyLabel: (rate: number) => `${rate}% de resposta`,
    previewNote: "Personalizado para este destinatário — as variáveis estão preenchidas.",
    cancel: "Cancelar",
    back: "Voltar",
    insert: "Inserir modelo",
    newTemplate: "Novo modelo",
    quickCreateBack: "Voltar aos modelos",
    nameLabel: "Nome",
    namePlaceholder: "ex.: Follow-up rápido",
    channelLabel: "Canal",
    bodyLabel: "Mensagem",
    bodyPlaceholder: "Escreve a tua mensagem…",
    channelEmail: "Email",
    channelLinkedin: "LinkedIn",
    channelWhatsapp: "WhatsApp",
    createInsert: "Criar e inserir",
    templateCreated: "Modelo criado",
  },
  pt_BR: {
    title: "Inserir um modelo",
    description: "Escolha um modelo — a pré-visualização usa este destinatário.",
    search: "Buscar modelos…",
    allChannels: "Todos os canais",
    noResults: "Nenhum modelo corresponde à sua busca.",
    empty: "Ainda não há modelos.",
    emptyHint: "Crie um rápido aqui embaixo, ou um completo na página de Modelos.",
    pickPrompt: "Selecione um modelo para pré-visualizá-lo aqui.",
    toLabel: "Para",
    subjectLabel: "Assunto",
    sentLabel: (count: string) => `${count} enviados`,
    replyLabel: (rate: number) => `${rate}% de resposta`,
    previewNote: "Personalizado para este destinatário — as variáveis estão preenchidas.",
    cancel: "Cancelar",
    back: "Voltar",
    insert: "Inserir modelo",
    newTemplate: "Novo modelo",
    quickCreateBack: "Voltar aos modelos",
    nameLabel: "Nome",
    namePlaceholder: "ex.: Follow-up rápido",
    channelLabel: "Canal",
    bodyLabel: "Mensagem",
    bodyPlaceholder: "Escreva sua mensagem…",
    channelEmail: "Email",
    channelLinkedin: "LinkedIn",
    channelWhatsapp: "WhatsApp",
    createInsert: "Criar e inserir",
    templateCreated: "Modelo criado",
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
      return <WhatsappIcon className={cn(className, "text-[#25D366]")} />
    default:
      return <Mail className={className} />
  }
}

// With a real recipient (Inbox/Compose) the preview substitutes their
// resolved values, highlighted; without one (sequence builder, Templates)
// it shows the raw {{tags}} in purple — inventing a sample person there
// would read as if a real message already exists.
function renderPreview(
  text: string,
  vars: Record<string, string> | undefined
): ReactNode[] {
  return vars ? mergeVarsHighlighted(text, vars) : mergeVarsRaw(text)
}

interface TemplatePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the chosen template; the caller decides how to insert it. */
  onInsert: (template: EmailTemplate) => void
  /** Resolved recipient + sender values for the live preview. Omit when
   * there's no real recipient — the preview then shows raw {{tags}}. */
  vars?: Record<string, string>
  /** Recipient name shown in the email-style preview header. */
  recipientName?: string
  /** When set, the list defaults to this channel (with a toggle to show all). */
  channel?: Channel
  locale: Locale
  /** When set, shows a Back button that returns to the step-type picker this
   * dialog was opened from — omitted when opened from the step editor's
   * toolbar, where there's no step type to go back to. */
  onBack?: () => void
}

export function TemplatePickerDialog({
  open,
  onOpenChange,
  onInsert,
  vars,
  recipientName,
  channel,
  locale,
  onBack,
}: TemplatePickerDialogProps) {
  const c = COPY[locale]
  const templates = useTemplates()

  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // Default to the conversation's channel when one is provided.
  const [channelOnly, setChannelOnly] = React.useState(Boolean(channel))

  // Inline "quick create" mini-form — a bare-bones name+channel+body
  // alternative to the full AI/tags/folder editor on the Templates page.
  // Expands in place rather than stacking a second Dialog.
  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false)
  const [quickName, setQuickName] = React.useState("")
  const [quickChannel, setQuickChannel] = React.useState<Channel>(channel ?? "email")
  const [quickBody, setQuickBody] = React.useState("")

  // Reset the picker each time it opens (render-phase pattern, no effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery("")
      setSelectedId(null)
      setChannelOnly(Boolean(channel))
      setQuickCreateOpen(false)
      setQuickName("")
      setQuickChannel(channel ?? "email")
      setQuickBody("")
    }
  }

  function openQuickCreate() {
    setQuickName("")
    setQuickChannel(channel ?? "email")
    setQuickBody("")
    setQuickCreateOpen(true)
  }

  function handleQuickCreate() {
    const name = quickName.trim()
    const body = quickBody.trim()
    if (!name || !body) return
    const created = templateStore.create({
      name,
      folder: UNCATEGORIZED_FOLDER[locale],
      channel: quickChannel,
      // No subject field in this mini-form — reuse the name for email so the
      // preview's subject line isn't left blank; non-email channels ignore it.
      subject: quickChannel === "email" ? name : "",
      body,
      tags: [],
    })
    toast.success(c.templateCreated)
    onInsert(created)
    onOpenChange(false)
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
          {/* Left: searchable list, or the quick-create mini-form in its place */}
          <div className="flex flex-col overflow-hidden border-b md:border-r md:border-b-0">
            {quickCreateOpen ? (
              <QuickCreateForm
                c={c}
                name={quickName}
                onNameChange={setQuickName}
                channel={quickChannel}
                onChannelChange={setQuickChannel}
                body={quickBody}
                onBodyChange={setQuickBody}
                onBack={() => setQuickCreateOpen(false)}
                onCreate={handleQuickCreate}
              />
            ) : (
              <>
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    {channel && (
                      <>
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
                      </>
                    )}
                    <button
                      type="button"
                      onClick={openQuickCreate}
                      className="text-primary hover:bg-primary/10 ml-auto inline-flex items-center gap-1 rounded-full border border-dashed border-current px-2.5 py-1 text-xs font-medium transition-colors"
                    >
                      <Plus className="size-3.5" />
                      {c.newTemplate}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
              {templates.length === 0 ? (
                <div className="text-muted-foreground p-6 text-center text-sm">
                  <p className="font-medium">{c.empty}</p>
                  <p className="mt-1 text-xs">{c.emptyHint}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={openQuickCreate}
                  >
                    <Plus className="size-4" />
                    {c.newTemplate}
                  </Button>
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
              </>
            )}
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
                              {renderPreview(selected.subject, vars)}
                            </span>
                          </div>
                        </div>
                        <div className="text-foreground/90 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                          {renderPreview(selected.body, vars)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                          {(recipientName ?? "?").slice(0, 1).toUpperCase()}
                        </span>
                        <div className="bg-background max-w-full rounded-2xl rounded-tl-sm border p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                          {renderPreview(selected.body, vars)}
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
          {!quickCreateOpen && onBack && (
            <Button variant="ghost" className="mr-auto" onClick={onBack}>
              <ArrowLeft className="size-4" />
              {c.back}
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          {quickCreateOpen ? (
            <Button
              variant="volt"
              disabled={!quickName.trim() || !quickBody.trim()}
              onClick={handleQuickCreate}
            >
              <Plus className="size-4" />
              {c.createInsert}
            </Button>
          ) : (
            <Button variant="volt" disabled={!selected} onClick={handleInsert}>
              <FileText className="size-4" />
              {c.insert}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Bare-bones name+channel+body form, expanded in place of the searchable
// list — the lightweight alternative to the full AI/tags/folder editor that
// stays on the Templates page. No its own footer: the dialog's shared
// footer (Cancel / Create & insert) drives it, so there's exactly one set
// of primary actions regardless of which mode is showing.
function QuickCreateForm({
  c,
  name,
  onNameChange,
  channel,
  onChannelChange,
  body,
  onBodyChange,
  onBack,
  onCreate,
}: {
  c: Copy
  name: string
  onNameChange: (v: string) => void
  channel: Channel
  onChannelChange: (v: Channel) => void
  body: string
  onBodyChange: (v: string) => void
  onBack: () => void
  onCreate: () => void
}) {
  const channelLabel: Record<Channel, string> = {
    email: c.channelEmail,
    linkedin: c.channelLinkedin,
    whatsapp: c.channelWhatsapp,
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground mb-3 inline-flex w-fit items-center gap-1.5 text-xs font-medium transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        {c.quickCreateBack}
      </button>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="quick-template-name">{c.nameLabel}</Label>
          <Input
            id="quick-template-name"
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={c.namePlaceholder}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{c.channelLabel}</Label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CREATE_CHANNELS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onChannelChange(ch)}
                aria-pressed={channel === ch}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  channel === ch
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <ChannelIcon channel={ch} className="size-3.5" />
                {channelLabel[ch]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quick-template-body">{c.bodyLabel}</Label>
          <Textarea
            id="quick-template-body"
            rows={10}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder={c.bodyPlaceholder}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onCreate()
            }}
          />
        </div>
      </div>
    </div>
  )
}
