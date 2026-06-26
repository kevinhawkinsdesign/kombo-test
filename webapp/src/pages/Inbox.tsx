import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Mail,
  Send,
  ExternalLink,
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
  MousePointerClick,
  UserCheck,
  Tag,
  Bold,
  Italic,
  ChevronDown,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { getProspect, currentUser } from "@/lib/mock-data"
import { team, getRep } from "@/lib/team"
import { useConversations, conversationStore, useTemplates } from "@/lib/store"
import { draftReply } from "@/lib/mock-ai-reply"
import {
  translate,
  detectLang,
  LANG_FLAG,
  LANG_LABEL,
} from "@/lib/mock-translate"
import { relativeTime, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import type {
  Channel,
  ChatLang,
  Conversation,
  ConvEvent,
  ConvEventKind,
  ConvStatus,
  Prospect,
} from "@/lib/types"

type Locale = "en" | "es"

const COPY = {
  en: {
    inbox: "Inbox",
    drafts: "AI Drafts",
    unread: "Unread",
    scheduled: "Scheduled",
    sent: "Sent",
    tags: "Tags",
    search: "Search people, companies…",
    filters: "Filters",
    channel: "Channel",
    allChannels: "All channels",
    email: "Email",
    linkedin: "LinkedIn",
    unreadOnly: "Unread only",
    clearFilters: "Clear filters",
    empty: "Nothing here",
    emptyHint: "Messages in this view will show up here.",
    backToInbox: "Back",
    viewProfile: "Profile",
    replyTo: (name: string) => `Reply to ${name}…`,
    via: "via",
    send: "Send",
    sendNow: "Send now",
    replySent: (name: string) => `Reply sent to ${name}`,
    selectConversation: "Select a conversation",
    selectConversationHint: "Choose a thread to read and reply.",
    markRead: "Mark as read",
    markUnread: "Mark as unread",
    snooze: "Snooze",
    laterToday: "Later today",
    tomorrow: "Tomorrow",
    nextWeek: "Next week",
    unsnooze: "Un-snooze",
    snoozed: "Snoozed",
    snoozedUntil: (d: string) => `Snoozed until ${d}`,
    assign: "Assign",
    assignedTo: (name: string) => `Assigned to ${name}`,
    unassign: "Unassign",
    me: "Me",
    archive: "Archive",
    unarchive: "Move to inbox",
    delete: "Delete",
    deleteTitle: "Delete conversation?",
    deleteDesc: "This permanently removes the thread. This can't be undone.",
    deleteConfirm: "Delete",
    deleted: "Conversation deleted",
    archived: "Conversation archived",
    assignedToast: (name: string) => `Assigned to ${name}`,
    snoozedToast: "Conversation snoozed",
    templates: "Templates",
    noTemplates: "No templates yet",
    translate: "Translate",
    showOriginal: "Show original",
    translatedFrom: (lang: string) => `Translated from ${lang}`,
    writeIn: (flag: string, lang: string) => `Write in ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Draft translated to ${lang}`,
    more: "More",
    // new
    setStatus: "Set tag",
    clearStatus: "Clear tag",
    statusToast: (label: string) => `Tagged as ${label}`,
    statusClearedToast: "Tag removed",
    autoTaggedAs: "Auto-tagged as",
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
    sendVia: (ch: string) => `Send via ${ch}`,
    collapseList: "Collapse list",
    expandList: "Show list",
    draftReady: "Kai drafted a reply — review and send.",
    scheduledFor: (d: string) => `Reply scheduled for ${d}`,
    cancelSchedule: "Cancel",
    sentScheduled: "Scheduled reply sent",
    scheduleCancelled: "Scheduled reply cancelled",
    bold: "Bold",
    italic: "Italic",
    draftReadyTag: "Draft ready",
  },
  es: {
    inbox: "Bandeja",
    drafts: "Borradores IA",
    unread: "Sin leer",
    scheduled: "Programados",
    sent: "Enviados",
    tags: "Etiquetas",
    search: "Buscar personas, empresas…",
    filters: "Filtros",
    channel: "Canal",
    allChannels: "Todos los canales",
    email: "Correo",
    linkedin: "LinkedIn",
    unreadOnly: "Solo sin leer",
    clearFilters: "Limpiar filtros",
    empty: "Nada por aquí",
    emptyHint: "Los mensajes de esta vista aparecerán aquí.",
    backToInbox: "Volver",
    viewProfile: "Perfil",
    replyTo: (name: string) => `Responder a ${name}…`,
    via: "por",
    send: "Enviar",
    sendNow: "Enviar ahora",
    replySent: (name: string) => `Respuesta enviada a ${name}`,
    selectConversation: "Selecciona una conversación",
    selectConversationHint: "Elige un hilo para leer y responder.",
    markRead: "Marcar como leído",
    markUnread: "Marcar como no leído",
    snooze: "Posponer",
    laterToday: "Más tarde hoy",
    tomorrow: "Mañana",
    nextWeek: "La próxima semana",
    unsnooze: "Reactivar",
    snoozed: "Pospuesto",
    snoozedUntil: (d: string) => `Pospuesto hasta ${d}`,
    assign: "Asignar",
    assignedTo: (name: string) => `Asignado a ${name}`,
    unassign: "Quitar asignación",
    me: "Yo",
    archive: "Archivar",
    unarchive: "Mover a la bandeja",
    delete: "Eliminar",
    deleteTitle: "¿Eliminar conversación?",
    deleteDesc: "Esto elimina el hilo de forma permanente. No se puede deshacer.",
    deleteConfirm: "Eliminar",
    deleted: "Conversación eliminada",
    archived: "Conversación archivada",
    assignedToast: (name: string) => `Asignado a ${name}`,
    snoozedToast: "Conversación pospuesta",
    templates: "Plantillas",
    noTemplates: "Aún no hay plantillas",
    translate: "Traducir",
    showOriginal: "Ver original",
    translatedFrom: (lang: string) => `Traducido del ${lang}`,
    writeIn: (flag: string, lang: string) => `Escribir en ${flag} ${lang}`,
    draftTranslated: (lang: string) => `Borrador traducido a ${lang}`,
    more: "Más",
    setStatus: "Etiquetar",
    clearStatus: "Quitar etiqueta",
    statusToast: (label: string) => `Etiquetado como ${label}`,
    statusClearedToast: "Etiqueta eliminada",
    autoTaggedAs: "Etiquetado como",
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
    sendVia: (ch: string) => `Enviar por ${ch}`,
    collapseList: "Ocultar lista",
    expandList: "Mostrar lista",
    draftReady: "Kai redactó una respuesta — revísala y envía.",
    scheduledFor: (d: string) => `Respuesta programada para ${d}`,
    cancelSchedule: "Cancelar",
    sentScheduled: "Respuesta programada enviada",
    scheduleCancelled: "Respuesta programada cancelada",
    bold: "Negrita",
    italic: "Cursiva",
    draftReadyTag: "Borrador listo",
  },
} as const

type Copy = (typeof COPY)[Locale]

type Folder = "inbox" | "drafts" | "unread" | "scheduled" | "sent"

const FOLDERS: { id: Folder; key: Folder; icon: typeof InboxIcon }[] = [
  { id: "inbox", key: "inbox", icon: InboxIcon },
  { id: "drafts", key: "drafts", icon: Wand2 },
  { id: "unread", key: "unread", icon: MailOpen },
  { id: "scheduled", key: "scheduled", icon: CalendarClock },
  { id: "sent", key: "sent", icon: Send },
]

// Sentiment palette encodes the funnel: open → won → handed-off → paused → closed.
const STATUS_META: Record<
  ConvStatus,
  { en: string; es: string; dot: string; badge: string }
> = {
  meeting_booked: {
    en: "Meeting booked",
    es: "Reunión",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  },
  interested: {
    en: "Interested",
    es: "Interesado",
    dot: "bg-sky-500",
    badge: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  },
  positive: {
    en: "Positive",
    es: "Positivo",
    dot: "bg-teal-500",
    badge: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
  },
  referred: {
    en: "Referred",
    es: "Derivado",
    dot: "bg-indigo-500",
    badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  },
  bad_timing: {
    en: "Bad timing",
    es: "Mal momento",
    dot: "bg-amber-500",
    badge: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  },
  not_interested: {
    en: "Not interested",
    es: "No interesado",
    dot: "bg-rose-500",
    badge: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  },
}

const STATUS_ORDER: ConvStatus[] = [
  "meeting_booked",
  "interested",
  "positive",
  "referred",
  "bad_timing",
  "not_interested",
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
}

type View = { kind: "folder"; id: Folder } | { kind: "tag"; id: ConvStatus }

const ChannelIcon = ({ channel, className }: { channel: Channel; className?: string }) =>
  channel === "email" ? (
    <Mail className={className ?? "size-3.5"} />
  ) : (
    <LinkedinIcon className={className ?? "size-3.5"} />
  )

function lastMessage(conv: Conversation) {
  return conv.messages[conv.messages.length - 1]
}
function isSnoozed(conv: Conversation): boolean {
  return Boolean(conv.snoozedUntil && new Date(conv.snoozedUntil).getTime() > Date.now())
}
function isScheduled(conv: Conversation): boolean {
  return Boolean(conv.scheduledAt && new Date(conv.scheduledAt).getTime() > Date.now())
}
function awaitingReply(conv: Conversation): boolean {
  return lastMessage(conv)?.direction === "inbound"
}
function hasReadyDraft(conv: Conversation): boolean {
  return Boolean(conv.aiDraft) && awaitingReply(conv) && !isScheduled(conv) && !conv.archived
}

const ES_LOCATIONS = ["madrid", "barcelona", "valencia", "spain", "es", "méxico", "mexico", "bogotá", "santiago", "são paulo", "lima", "buenos aires"]
function defaultLang(p: Prospect | undefined): ChatLang {
  if (!p) return "en"
  const loc = p.location.toLowerCase()
  return ES_LOCATIONS.some((x) => loc.includes(x)) ? "es" : "en"
}

function assigneeName(id: string | undefined): string | undefined {
  if (!id) return undefined
  if (id === currentUser.id) return currentUser.name
  return getRep(id)?.name
}
function avatarColorFor(id: string): string {
  if (id === currentUser.id) return currentUser.avatarColor
  return getRep(id)?.avatarColor ?? "#7c3aed"
}

function snoozeUntilISO(hours: number): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString()
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

export default function Inbox() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const conversations = useConversations()

  const [view, setView] = React.useState<View>({ kind: "folder", id: "inbox" })
  const [activeId, setActiveId] = React.useState<string | undefined>()
  const [showThreadMobile, setShowThreadMobile] = React.useState(false)
  const [shownTranslations, setShownTranslations] = React.useState<Set<string>>(new Set())
  const [toDelete, setToDelete] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<Channel | "all">("all")
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  // Focus mode: collapse the folder rail + conversation list to give the open
  // thread full width when reading/replying deep in a conversation.
  const [focused, setFocused] = React.useState(false)

  const visible = conversations.filter((conv) => !conv.archived)

  const folderCount = React.useCallback(
    (id: Folder): number => {
      switch (id) {
        case "inbox":
          return visible.filter((x) => !isSnoozed(x) && !isScheduled(x)).length
        case "drafts":
          return visible.filter(hasReadyDraft).length
        case "unread":
          return visible.filter((x) => x.unread > 0).length
        case "scheduled":
          return visible.filter(isScheduled).length
        case "sent":
          return visible.filter((x) => lastMessage(x)?.direction === "outbound").length
      }
    },
    [visible]
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

  const list = React.useMemo(() => {
    const inView = visible.filter((conv) => {
      if (view.kind === "tag") return conv.status === view.id
      switch (view.id) {
        case "inbox":
          return !isSnoozed(conv) && !isScheduled(conv)
        case "drafts":
          return hasReadyDraft(conv)
        case "unread":
          return conv.unread > 0
        case "scheduled":
          return isScheduled(conv)
        case "sent":
          return lastMessage(conv)?.direction === "outbound"
      }
    })
    const filtered = inView.filter((conv) => {
      if (channelFilter !== "all" && conv.channel !== channelFilter) return false
      if (unreadOnly && conv.unread === 0) return false
      return matchesSearch(conv)
    })
    return filtered.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  }, [visible, view, channelFilter, unreadOnly, matchesSearch])

  const active = conversations.find((conv) => conv.id === activeId)
  const activeInList = active && list.some((x) => x.id === active.id)
  // No conversation is open until the user explicitly picks one — opening a
  // thread marks it read, so we never auto-select on load or list changes.
  const effectiveActive = activeInList ? active : undefined
  const activeProspect = effectiveActive ? getProspect(effectiveActive.prospectId) : undefined
  const recipientLang: ChatLang =
    effectiveActive?.recipientLang ?? defaultLang(activeProspect)

  const viewTitle =
    view.kind === "tag"
      ? STATUS_META[view.id][locale === "es" ? "es" : "en"]
      : c[FOLDERS.find((f) => f.id === view.id)!.key]
  const viewCount = list.length
  const filtersActive = channelFilter !== "all" || unreadOnly

  function openConversation(id: string) {
    setActiveId(id)
    setShowThreadMobile(true)
    conversationStore.markRead(id)
  }
  function toggleTranslation(id: string) {
    setShownTranslations((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function snoozeBy(hours: number) {
    if (!effectiveActive) return
    conversationStore.snooze(effectiveActive.id, snoozeUntilISO(hours))
    toast.success(c.snoozedToast)
  }

  // First unread inbound message → marks the "New" divider.
  const firstUnreadId = effectiveActive
    ? effectiveActive.messages.find((m) => m.direction === "inbound" && !m.read)?.id
    : undefined

  // Interleave messages + activity events by timestamp.
  const timeline = React.useMemo(() => {
    if (!effectiveActive) return []
    const items: (
      | { type: "msg"; at: number; msg: Conversation["messages"][number] }
      | { type: "event"; at: number; ev: ConvEvent }
    )[] = [
      ...effectiveActive.messages.map((msg) => ({
        type: "msg" as const,
        at: new Date(msg.timestamp).getTime(),
        msg,
      })),
      ...(effectiveActive.events ?? []).map((ev) => ({
        type: "event" as const,
        at: new Date(ev.timestamp).getTime(),
        ev,
      })),
    ]
    return items.sort((a, b) => a.at - b.at)
  }, [effectiveActive])

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
          {FOLDERS.map((f) => {
            const Icon = f.icon
            const activeFolder = view.kind === "folder" && view.id === f.id
            const count = folderCount(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setView({ kind: "folder", id: f.id })}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
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
          })}
        </nav>

        <div className="px-3 pb-4">
          <p className="text-muted-foreground px-2.5 pt-2 pb-1.5 text-[11px] font-semibold tracking-wide uppercase">
            {c.tags}
          </p>
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
                {filtersActive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setChannelFilter("all")
                        setUnreadOnly(false)
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
          {list.length === 0 ? (
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
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={cn(
                    "relative flex w-full gap-3 border-b px-4 py-3 text-left transition-colors",
                    conv.id === effectiveActive?.id
                      ? "bg-muted/60"
                      : "hover:bg-muted/40"
                  )}
                >
                  {conv.id === effectiveActive?.id && (
                    <span className="bg-primary absolute inset-y-0 left-0 w-0.5" />
                  )}
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
                      {last?.body}
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
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Thread */}
      {effectiveActive && activeProspect ? (
        <div className={cn("min-w-0 flex-1 flex-col", showThreadMobile ? "flex" : "hidden md:flex")}>
          {/* Header */}
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 md:hidden"
              onClick={() => setShowThreadMobile(false)}
              aria-label={c.backToInbox}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <ProspectAvatar prospect={activeProspect} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {activeProspect.firstName} {activeProspect.lastName}
              </p>
              <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                <ChannelIcon channel={effectiveActive.channel} className="size-3" />
                {activeProspect.title} · {activeProspect.company}
              </p>
            </div>

            {/* Focus mode: collapse the list/rail to read the thread full-width */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
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

            <Button
              variant="ghost"
              size="icon"
              aria-label={effectiveActive.unread > 0 ? c.markRead : c.markUnread}
              title={effectiveActive.unread > 0 ? c.markRead : c.markUnread}
              onClick={() =>
                effectiveActive.unread > 0
                  ? conversationStore.markRead(effectiveActive.id)
                  : conversationStore.markUnread(effectiveActive.id)
              }
            >
              {effectiveActive.unread > 0 ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={c.snooze} title={c.snooze}>
                  <Clock className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => snoozeBy(3)}>{c.laterToday}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => snoozeBy(24)}>{c.tomorrow}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => snoozeBy(24 * 7)}>{c.nextWeek}</DropdownMenuItem>
                {isSnoozed(effectiveActive) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => conversationStore.unsnooze(effectiveActive.id)}>
                      {c.unsnooze}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={c.assign} title={c.assign}>
                  <UserPlus className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{c.assign}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => { conversationStore.assign(effectiveActive.id, currentUser.id); toast.success(c.assignedToast(c.me)) }}>
                  <Avatar className="size-5">
                    <AvatarFallback style={{ backgroundColor: currentUser.avatarColor, color: "white" }} className="text-[9px]">
                      {initials(currentUser.name.split(" ")[0], currentUser.name.split(" ")[1])}
                    </AvatarFallback>
                  </Avatar>
                  {c.me}
                  {effectiveActive.assigneeId === currentUser.id && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                {team.map((m) => (
                  <DropdownMenuItem key={m.id} onClick={() => { conversationStore.assign(effectiveActive.id, m.id); toast.success(c.assignedToast(m.name.split(" ")[0])) }}>
                    <Avatar className="size-5">
                      <AvatarFallback style={{ backgroundColor: m.avatarColor, color: "white" }} className="text-[9px]">
                        {initials(m.name.split(" ")[0], m.name.split(" ")[1])}
                      </AvatarFallback>
                    </Avatar>
                    {m.name}
                    {effectiveActive.assigneeId === m.id && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
                {effectiveActive.assigneeId && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => conversationStore.assign(effectiveActive.id, undefined)}>
                      {c.unassign}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link to={`/prospects/${activeProspect.id}`}>
                <ExternalLink className="size-4" />
                {c.viewProfile}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={c.more}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
          </div>

          {/* Status bar */}
          {(isSnoozed(effectiveActive) || effectiveActive.assigneeId) && (
            <div className="text-muted-foreground bg-muted/30 flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-1.5 text-xs">
              {effectiveActive.assigneeId && (
                <span className="inline-flex items-center gap-1">
                  <UserPlus className="size-3" />
                  {c.assignedTo(assigneeName(effectiveActive.assigneeId) ?? "")}
                </span>
              )}
              {isSnoozed(effectiveActive) && effectiveActive.snoozedUntil && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {c.snoozedUntil(relativeTime(effectiveActive.snoozedUntil))}
                </span>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {timeline.map((item) => {
              if (item.type === "event") {
                const ev = item.ev
                const meta = EVENT_META[ev.kind]
                const Icon = meta.icon
                const label = ev.kind === "tag" ? c.autoTaggedAs : locale === "es" ? meta.es : meta.en
                return (
                  <div
                    key={ev.id}
                    className="text-muted-foreground flex items-center gap-2 text-xs"
                  >
                    <span className="bg-muted flex size-5 shrink-0 items-center justify-center rounded-full">
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
                    <span className="ml-auto shrink-0">{relativeTime(ev.timestamp)}</span>
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
                      <p className="whitespace-pre-wrap">{showTr ? translate(m.body, locale) : m.body}</p>
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
                        <span className="text-primary inline-flex items-center gap-0.5 font-medium">
                          <Sparkles className="size-2.5" />
                          {c.aiGenerated}
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
  const templates = useTemplates()
  const [reply, setReply] = React.useState(conv.aiDraft ?? "")
  const [aiUsed, setAiUsed] = React.useState(Boolean(conv.aiDraft))
  const [seed, setSeed] = React.useState(0)
  const taRef = React.useRef<HTMLTextAreaElement>(null)

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
  const showDraftChip = aiUsed && reply.trim().length > 0

  function generate() {
    const next = seed + 1
    setSeed(next)
    setReply(draftReply(prospect, conv, next))
    setAiUsed(true)
  }

  // Tone rewrite — restyle the draft (stand-in: a fresh AI variant).
  function refineTone(label: string) {
    const next = seed + 1
    setSeed(next)
    setReply(draftReply(prospect, conv, next))
    setAiUsed(true)
    toast.success(c.refined(label))
  }
  function refineLength(kind: "shorter" | "longer", label: string) {
    setReply((cur) => {
      if (!cur.trim()) return cur
      if (kind === "shorter") {
        const parts = cur.split(/(?<=[.!?])\s+/)
        return parts.slice(0, Math.max(1, Math.ceil(parts.length / 2))).join(" ")
      }
      return `${cur}\n\nHappy to share more detail or hop on a quick call if it helps.`
    })
    toast.success(c.refined(label))
  }

  function wrap(marker: string) {
    const ta = taRef.current
    if (!ta) {
      setReply((r) => `${r}${marker}${marker}`)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = reply.slice(start, end)
    setReply(reply.slice(0, start) + marker + sel + marker + reply.slice(end))
    requestAnimationFrame(() => {
      ta.focus()
      const pos = sel ? end + marker.length * 2 : start + marker.length
      ta.setSelectionRange(pos, pos)
    })
  }

  function applyTemplate(body: string) {
    const filled = body
      .replaceAll("{{first_name}}", prospect.firstName)
      .replaceAll("{{company}}", prospect.company)
    setReply((cur) => (cur.trim() ? `${cur}\n\n${filled}` : filled))
  }

  function send() {
    if (!reply.trim()) return
    conversationStore.sendMessage(conv.id, reply.trim(), detectLang(reply), aiUsed)
    setReply("")
    setAiUsed(false)
    toast.success(c.replySent(prospect.firstName))
  }

  const showTranslate = reply.trim().length > 0 && detectLang(reply) !== recipientLang

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

      {showDraftChip && (
        <div className="text-primary flex items-center gap-1.5 text-[11px] font-medium">
          <Sparkles className="size-3" />
          {c.kaiDraft}
          <span className="text-muted-foreground font-normal">— {c.draftReady}</span>
        </div>
      )}

      <Textarea
        ref={taRef}
        value={reply}
        onChange={(e) => {
          setReply(e.target.value)
          if (e.target.value.trim() === "") setAiUsed(false)
        }}
        placeholder={c.replyTo(prospect.firstName)}
        className={cn(
          "min-h-24 resize-none",
          showDraftChip && "border-primary/30 bg-primary/[0.03]"
        )}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={generate}>
          <Wand2 className="size-4" />
          {reply.trim() ? c.regenerate : c.generate}
        </Button>

        <div className="bg-border/60 mx-0.5 hidden h-5 w-px sm:block" />

        <Button variant="ghost" size="icon" className="size-8" aria-label={c.bold} onClick={() => wrap("**")}>
          <Bold className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8" aria-label={c.italic} onClick={() => wrap("*")}>
          <Italic className="size-4" />
        </Button>

        {/* Tone rewrite */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={!reply.trim()}
            >
              <Sparkles className="size-4" />
              {c.tone}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {[c.toneFormal, c.toneFriendly, c.toneProfessional, c.toneConcise].map(
              (label) => (
                <DropdownMenuItem key={label} onClick={() => refineTone(label)}>
                  {label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Length */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={!reply.trim()}
            >
              <Languages className="size-4 rotate-90" />
              {c.length}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => refineLength("shorter", c.shorter)}>
              {c.shorter}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => refineLength("longer", c.longer)}>
              {c.longer}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label={c.templates}>
              <FileText className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 w-64 overflow-y-auto">
            <DropdownMenuLabel>{c.templates}</DropdownMenuLabel>
            {templates.length === 0 ? (
              <p className="text-muted-foreground px-2 py-1.5 text-xs">{c.noTemplates}</p>
            ) : (
              templates.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => applyTemplate(t.body)}>
                  <span className="truncate">{t.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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

        <Button size="sm" variant="volt" className="ml-auto" disabled={!reply.trim()} onClick={send}>
          <Send className="size-4" />
          {c.sendVia(channelLabel)}
        </Button>
      </div>
    </div>
  )
}
