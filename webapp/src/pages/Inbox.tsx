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
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  translate,
  detectLang,
  LANG_FLAG,
  LANG_LABEL,
} from "@/lib/mock-translate"
import { relativeTime, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import type { Channel, ChatLang, Conversation, Prospect } from "@/lib/types"

const COPY = {
  en: {
    inbox: "Inbox",
    unreadFolder: "Unread",
    snoozedFolder: "Snoozed",
    mineFolder: "Assigned to me",
    doneFolder: "Done",
    empty: "Nothing here",
    emptyHint: "Messages in this folder will show up here.",
    backToInbox: "Back to inbox",
    viewProfile: "View profile",
    replyTo: (name: string) => `Reply to ${name}…`,
    via: "via",
    send: "Send",
    replySent: (name: string) => `Reply sent to ${name}`,
    selectConversation: "Select a conversation",
    selectConversationHint: "Choose a thread from the list to read and reply.",
    markRead: "Mark as read",
    markUnread: "Mark as unread",
    snooze: "Snooze",
    laterToday: "Later today",
    tomorrow: "Tomorrow",
    nextWeek: "Next week",
    unsnooze: "Un-snooze",
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
    translateDraft: "Translate draft",
    draftTranslated: (lang: string) => `Draft translated to ${lang}`,
    speaks: "Speaks",
    more: "More",
  },
  es: {
    inbox: "Bandeja de entrada",
    unreadFolder: "Sin leer",
    snoozedFolder: "Pospuestos",
    mineFolder: "Asignados a mí",
    doneFolder: "Hechos",
    empty: "Nada por aquí",
    emptyHint: "Los mensajes de esta carpeta aparecerán aquí.",
    backToInbox: "Volver a la bandeja",
    viewProfile: "Ver perfil",
    replyTo: (name: string) => `Responder a ${name}…`,
    via: "por",
    send: "Enviar",
    replySent: (name: string) => `Respuesta enviada a ${name}`,
    selectConversation: "Selecciona una conversación",
    selectConversationHint: "Elige un hilo de la lista para leer y responder.",
    markRead: "Marcar como leído",
    markUnread: "Marcar como no leído",
    snooze: "Posponer",
    laterToday: "Más tarde hoy",
    tomorrow: "Mañana",
    nextWeek: "La próxima semana",
    unsnooze: "Reactivar",
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
    translateDraft: "Traducir borrador",
    draftTranslated: (lang: string) => `Borrador traducido a ${lang}`,
    speaks: "Habla",
    more: "Más",
  },
} as const

type Folder = "inbox" | "unread" | "snoozed" | "mine" | "done"

const ChannelIcon = ({ channel }: { channel: Channel }) =>
  channel === "email" ? <Mail className="size-3.5" /> : <LinkedinIcon className="size-3.5" />

function isSnoozed(conv: Conversation): boolean {
  return Boolean(conv.snoozedUntil && new Date(conv.snoozedUntil).getTime() > Date.now())
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

export default function Inbox() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const conversations = useConversations()
  const templates = useTemplates()

  const [folder, setFolder] = React.useState<Folder>("inbox")
  const [activeId, setActiveId] = React.useState<string | undefined>()
  const [reply, setReply] = React.useState("")
  const [showThreadMobile, setShowThreadMobile] = React.useState(false)
  const [shownTranslations, setShownTranslations] = React.useState<Set<string>>(new Set())
  const [toDelete, setToDelete] = React.useState<string | null>(null)

  const folders: { id: Folder; label: string; count?: number }[] = [
    { id: "inbox", label: c.inbox },
    {
      id: "unread",
      label: c.unreadFolder,
      count: conversations.filter((x) => !x.archived && x.unread > 0).length,
    },
    { id: "snoozed", label: c.snoozedFolder },
    { id: "mine", label: c.mineFolder },
    { id: "done", label: c.doneFolder },
  ]

  const list = React.useMemo(() => {
    const filtered = conversations.filter((conv) => {
      switch (folder) {
        case "inbox":
          return !conv.archived && !isSnoozed(conv)
        case "unread":
          return !conv.archived && conv.unread > 0
        case "snoozed":
          return !conv.archived && isSnoozed(conv)
        case "mine":
          return !conv.archived && conv.assigneeId === currentUser.id
        case "done":
          return Boolean(conv.archived)
      }
    })
    return filtered.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  }, [conversations, folder])

  // Keep a valid active selection as the list changes.
  const active = conversations.find((conv) => conv.id === activeId)
  const activeInList = active && list.some((x) => x.id === active.id)
  const effectiveActive = activeInList ? active : list[0]
  const activeProspect = effectiveActive ? getProspect(effectiveActive.prospectId) : undefined
  const recipientLang: ChatLang =
    effectiveActive?.recipientLang ?? defaultLang(activeProspect)

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
    const until = new Date(Date.now() + hours * 3600 * 1000).toISOString()
    conversationStore.snooze(effectiveActive.id, until)
    toast.success(c.snoozedToast)
  }

  function applyTemplate(body: string) {
    const p = activeProspect
    const filled = body
      .replaceAll("{{first_name}}", p?.firstName ?? "")
      .replaceAll("{{company}}", p?.company ?? "")
    setReply((cur) => (cur.trim() ? `${cur}\n\n${filled}` : filled))
  }

  function sendReply() {
    if (!effectiveActive || !reply.trim()) return
    conversationStore.sendMessage(effectiveActive.id, reply.trim(), detectLang(reply))
    setReply("")
    toast.success(c.replySent(activeProspect?.firstName ?? ""))
  }

  return (
    <div className="flex h-[calc(100svh-4rem)]">
      {/* List column */}
      <div
        className={cn(
          "w-full flex-col border-r md:flex md:w-80 md:max-w-sm md:shrink-0",
          showThreadMobile ? "hidden md:flex" : "flex"
        )}
      >
        <div className="border-b px-3 pt-3">
          <h2 className="px-1 pb-2 font-semibold">{c.inbox}</h2>
          <div className="flex flex-wrap gap-1 pb-2">
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFolder(f.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  folder === f.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f.label}
                {f.count ? (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-[10px]">
                    {f.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">{c.emptyHint}</p>
          ) : (
            list.map((conv) => {
              const p = getProspect(conv.prospectId)
              if (!p) return null
              const last = conv.messages[conv.messages.length - 1]
              const assignee = assigneeName(conv.assigneeId)
              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={cn(
                    "flex w-full gap-3 border-b px-4 py-3 text-left transition-colors",
                    conv.id === effectiveActive?.id ? "bg-muted/60" : "hover:bg-muted/40"
                  )}
                >
                  <ProspectAvatar prospect={p} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("truncate text-sm", conv.unread > 0 ? "font-semibold" : "font-medium")}>
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {relativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <ChannelIcon channel={conv.channel} />
                      <span className="truncate">{conv.subject}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">{last?.body}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {isSnoozed(conv) && (
                        <Badge variant="outline" className="gap-1 py-0 text-[10px] font-normal">
                          <Clock className="size-2.5" />
                          {c.snoozedFolder}
                        </Badge>
                      )}
                      {assignee && (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                          <Avatar className="size-4">
                            <AvatarFallback
                              style={{ backgroundColor: avatarColorFor(conv.assigneeId!), color: "white" }}
                              className="text-[8px]"
                            >
                              {initials(assignee.split(" ")[0], assignee.split(" ")[1])}
                            </AvatarFallback>
                          </Avatar>
                          {assignee.split(" ")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  {conv.unread > 0 && <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Thread */}
      {effectiveActive && activeProspect ? (
        <div className={cn("min-w-0 flex-1 flex-col", showThreadMobile ? "flex" : "hidden md:flex")}>
          {/* Header + actions */}
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
            <ProspectAvatar prospect={activeProspect} className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {activeProspect.firstName} {activeProspect.lastName}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {activeProspect.title} · {activeProspect.company}
              </p>
            </div>

            {/* Mark read/unread */}
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

            {/* Snooze */}
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

            {/* Assign */}
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

            {/* More */}
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
          {(isSnoozed(effectiveActive) || effectiveActive.assigneeId || effectiveActive.archived) && (
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
              {effectiveActive.archived && (
                <span className="inline-flex items-center gap-1">
                  <Archive className="size-3" />
                  {c.doneFolder}
                </span>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {effectiveActive.messages.map((m) => {
              const msgLang = m.lang ?? detectLang(m.body)
              const canTranslate = msgLang !== locale
              const showTr = shownTranslations.has(m.id)
              const outbound = m.direction === "outbound"
              return (
                <div key={m.id} className={cn("flex flex-col gap-1", outbound ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[78%] rounded-lg px-3.5 py-2.5 text-sm",
                      outbound ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{showTr ? translate(m.body, locale) : m.body}</p>
                    {showTr && (
                      <p className={cn("mt-1 text-[10px] italic", outbound ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {c.translatedFrom(LANG_LABEL[msgLang])}
                      </p>
                    )}
                    <p className={cn("mt-1 text-right text-[10px]", outbound ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {LANG_FLAG[msgLang]} {relativeTime(m.timestamp)}
                    </p>
                  </div>
                  {canTranslate && (
                    <button
                      type="button"
                      onClick={() => toggleTranslation(m.id)}
                      className="text-primary inline-flex items-center gap-1 px-1 text-[11px] font-medium hover:underline"
                    >
                      <Languages className="size-3" />
                      {showTr ? c.showOriginal : c.translate}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Composer */}
          <div className="border-t p-4">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={c.replyTo(activeProspect.firstName)}
              className="min-h-20 resize-none"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <ChannelIcon channel={effectiveActive.channel} />
                {c.via} {effectiveActive.channel}
              </span>

              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                · {c.speaks} {LANG_FLAG[recipientLang]} {LANG_LABEL[recipientLang]}
              </span>

              {/* Templates */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="size-4" />
                    {c.templates}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-72 w-64 overflow-y-auto">
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

              {/* Translate draft to recipient language */}
              {reply.trim() && detectLang(reply) !== recipientLang && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReply((cur) => translate(cur, recipientLang))
                    toast.success(c.draftTranslated(LANG_LABEL[recipientLang]))
                  }}
                >
                  <Languages className="size-4" />
                  {c.writeIn(LANG_FLAG[recipientLang], LANG_LABEL[recipientLang])}
                </Button>
              )}

              <Button size="sm" variant="volt" className="ml-auto" disabled={!reply.trim()} onClick={sendReply}>
                <Send className="size-4" />
                {c.send}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center gap-3 text-center md:flex">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <InboxIcon className="size-6" />
          </span>
          <div>
            <p className="text-sm font-medium">{c.empty}</p>
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
