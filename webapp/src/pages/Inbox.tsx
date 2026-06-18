import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Mail, Send, ExternalLink, ArrowLeft, Inbox as InboxIcon } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { conversations, getProspect } from "@/lib/mock-data"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import type { Channel } from "@/lib/types"

const COPY = {
  en: {
    inbox: "Inbox",
    unread: "unread",
    backToInbox: "Back to inbox",
    viewProfile: "View profile",
    replyTo: (name: string) => `Reply to ${name}…`,
    via: "via",
    send: "Send",
    replySent: (name: string) => `Reply sent to ${name}`,
    selectConversation: "Select a conversation",
    selectConversationHint: "Choose a thread from the list to read and reply.",
  },
  es: {
    inbox: "Bandeja de entrada",
    unread: "sin leer",
    backToInbox: "Volver a la bandeja",
    viewProfile: "Ver perfil",
    replyTo: (name: string) => `Responder a ${name}…`,
    via: "por",
    send: "Enviar",
    replySent: (name: string) => `Respuesta enviada a ${name}`,
    selectConversation: "Selecciona una conversación",
    selectConversationHint:
      "Elige un hilo de la lista para leer y responder.",
  },
} as const

const ChannelIcon = ({ channel }: { channel: Channel }) =>
  channel === "email" ? (
    <Mail className="size-3.5" />
  ) : (
    <LinkedinIcon className="size-3.5" />
  )

export default function Inbox() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const sorted = React.useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      ),
    []
  )
  const [activeId, setActiveId] = React.useState(sorted[0]?.id)
  const [reply, setReply] = React.useState("")
  // On mobile we show either the list or the thread (master-detail).
  const [showThreadMobile, setShowThreadMobile] = React.useState(false)

  const active = sorted.find((conv) => conv.id === activeId)
  const activeProspect = active ? getProspect(active.prospectId) : undefined

  return (
    <div className="flex h-[calc(100svh-4rem)]">
      {/* Conversation list */}
      <div
        className={cn(
          "w-full flex-col border-r md:flex md:w-80 md:max-w-sm md:shrink-0",
          showThreadMobile ? "hidden md:flex" : "flex"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <h2 className="font-semibold">{c.inbox}</h2>
          <Badge variant="secondary" className="font-normal">
            {conversations.reduce((s, conv) => s + conv.unread, 0)} {c.unread}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sorted.map((conv) => {
            const p = getProspect(conv.prospectId)
            if (!p) return null
            const last = conv.messages[conv.messages.length - 1]
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveId(conv.id)
                  setShowThreadMobile(true)
                }}
                className={cn(
                  "flex w-full gap-3 border-b px-4 py-3 text-left transition-colors",
                  conv.id === activeId ? "bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <ProspectAvatar prospect={p} className="size-9" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
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
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {last?.body}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Thread */}
      {active && activeProspect ? (
        <div
          className={cn(
            "min-w-0 flex-1 flex-col",
            showThreadMobile ? "flex" : "hidden md:flex"
          )}
        >
          <div className="flex h-14 items-center gap-3 border-b px-5">
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
            <Button variant="outline" size="sm" asChild>
              <Link to={`/prospects/${activeProspect.id}`}>
                <ExternalLink className="size-4" />
                {c.viewProfile}
              </Link>
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {active.messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm",
                  m.direction === "outbound"
                    ? "bg-primary text-primary-foreground ml-auto rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p
                  className={cn(
                    "mt-1 text-right text-[10px]",
                    m.direction === "outbound"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {relativeTime(m.timestamp)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={c.replyTo(activeProspect.firstName)}
              className="min-h-20 resize-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <ChannelIcon channel={active.channel} />
                {c.via} {active.channel}
              </span>
              <Button
                size="sm"
                variant="volt"
                disabled={!reply.trim()}
                onClick={() => {
                  setReply("")
                  toast.success(c.replySent(activeProspect.firstName))
                }}
              >
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
            <p className="text-sm font-medium">{c.selectConversation}</p>
            <p className="text-muted-foreground text-sm">
              {c.selectConversationHint}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
