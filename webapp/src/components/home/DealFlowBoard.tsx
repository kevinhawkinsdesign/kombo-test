import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ExternalLink, Inbox as InboxIcon, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { ChannelIcon } from "@/components/common/ChannelIcon"
import { useConversations, conversationStore } from "@/lib/store"
import { getProspect } from "@/lib/mock-data"
import { STATUS_META, STATUS_ORDER } from "@/lib/conv-status"
import { assigneeName } from "@/lib/team"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/types"

const COPY = {
  en: {
    cardActions: "Card actions",
    moveTo: "Move to",
    viewProfile: "View profile",
    openInInbox: "Open in inbox",
    movedTo: (label: string) => `Moved to ${label}`,
    noneInStage: "No prospects here yet.",
  },
  es: {
    cardActions: "Acciones",
    moveTo: "Mover a",
    viewProfile: "Ver perfil",
    openInInbox: "Abrir en la bandeja",
    movedTo: (label: string) => `Movido a ${label}`,
    noneInStage: "Aún no hay prospectos aquí.",
  },
} as const

function DealFlowCard({ conv }: { conv: Conversation }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const prospect = getProspect(conv.prospectId)
  if (!prospect) return null
  const assignee = assigneeName(conv.assigneeId)

  return (
    <div className="bg-card hover:border-primary/40 space-y-2 rounded-lg border p-3 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/prospects/${prospect.id}`}
          className="flex min-w-0 items-start gap-2"
        >
          <ProspectAvatar prospect={prospect} className="size-8 shrink-0" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {prospect.firstName} {prospect.lastName}
            </span>
            <span className="text-muted-foreground block truncate text-xs">
              {prospect.title} · {prospect.company}
            </span>
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-1 size-7 shrink-0"
              aria-label={c.cardActions}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to={`/prospects/${prospect.id}`}>{c.viewProfile}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/inbox">
                <ExternalLink />
                {c.openInInbox}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{c.moveTo}</DropdownMenuLabel>
            {STATUS_ORDER.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === conv.status}
                onSelect={() => {
                  conversationStore.setStatus(conv.id, status)
                  toast.success(c.movedTo(STATUS_META[status][locale]))
                }}
              >
                <span className={cn("size-2 rounded-full", STATUS_META[status].dot)} />
                {STATUS_META[status][locale]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <ChannelIcon channel={conv.channel} className="size-3.5" />
        {assignee && <span className="truncate">{assignee}</span>}
      </div>
    </div>
  )
}

/**
 * Kanban board of prospects grouped by their conversation Outcome — the same
 * fixed stage list (STATUS_ORDER/STATUS_META) the Inbox's "Outcomes" section
 * uses, so both views always agree on where a prospect sits.
 */
export function DealFlowBoard() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const conversations = useConversations()

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status]
        const inStage = conversations.filter((conv) => conv.status === status)
        return (
          <div
            key={status}
            className="bg-muted/40 w-[280px] min-w-[280px] shrink-0 space-y-3 rounded-lg p-2"
          >
            <div className="flex items-center gap-2 px-1 pt-1">
              <span className={cn("size-2 rounded-full", meta.dot)} />
              <span className="font-medium">{meta[locale]}</span>
              <Badge variant="secondary" className="tabular-nums">
                {inStage.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {inStage.length > 0 ? (
                inStage.map((conv) => <DealFlowCard key={conv.id} conv={conv} />)
              ) : (
                <p className="text-muted-foreground flex flex-col items-center gap-2 px-1 py-6 text-center text-xs">
                  <InboxIcon className="size-4 opacity-50" />
                  {c.noneInStage}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
