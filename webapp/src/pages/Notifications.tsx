import * as React from "react"
import { CheckCheck } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NOTIFICATION_META } from "@/components/notifications/meta"
import { notifications as seed } from "@/lib/mock-extra"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const COPY = {
  en: {
    title: "Notifications",
    unread: (count: number) => `${count} unread`,
    caughtUp: "You're all caught up.",
    markAllRead: "Mark all read",
    caughtUpTitle: "You're all caught up",
    caughtUpDesc: "New replies, meetings, and deal updates will show up here.",
  },
  es: {
    title: "Notificaciones",
    unread: (count: number) => `${count} sin leer`,
    caughtUp: "Estás al día.",
    markAllRead: "Marcar todo como leído",
    caughtUpTitle: "Estás al día",
    caughtUpDesc:
      "Las nuevas respuestas, reuniones y actualizaciones de negocios aparecerán aquí.",
  },
  it: {
    title: "Notifiche",
    unread: (count: number) => `${count} da leggere`,
    caughtUp: "Sei in pari.",
    markAllRead: "Segna tutto come letto",
    caughtUpTitle: "Sei in pari",
    caughtUpDesc:
      "Le nuove risposte, riunioni e aggiornamenti delle trattative appariranno qui.",
  },
  fr: {
    title: "Notifications",
    unread: (count: number) => `${count} non lue${count > 1 ? "s" : ""}`,
    caughtUp: "Vous êtes à jour.",
    markAllRead: "Tout marquer comme lu",
    caughtUpTitle: "Vous êtes à jour",
    caughtUpDesc:
      "Les nouvelles réponses, rendez-vous et mises à jour de transactions apparaîtront ici.",
  },
  de: {
    title: "Benachrichtigungen",
    unread: (count: number) => `${count} ungelesen`,
    caughtUp: "Du bist auf dem Laufenden.",
    markAllRead: "Alle als gelesen markieren",
    caughtUpTitle: "Du bist auf dem Laufenden",
    caughtUpDesc:
      "Neue Antworten, Meetings und Deal-Updates erscheinen hier.",
  },
  pt: {
    title: "Notificações",
    unread: (count: number) => `${count} por ler`,
    caughtUp: "Está em dia.",
    markAllRead: "Marcar tudo como lido",
    caughtUpTitle: "Está em dia",
    caughtUpDesc:
      "As novas respostas, reuniões e atualizações de negócios vão aparecer aqui.",
  },
  pt_BR: {
    title: "Notificações",
    unread: (count: number) => `${count} não lida${count > 1 ? "s" : ""}`,
    caughtUp: "Você está em dia.",
    markAllRead: "Marcar tudo como lido",
    caughtUpTitle: "Você está em dia",
    caughtUpDesc:
      "Novas respostas, reuniões e atualizações de negócios vão aparecer aqui.",
  },
} as const

export default function Notifications() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [items, setItems] = React.useState(seed)
  const unread = items.filter((n) => !n.read).length

  function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <Page className="max-w-3xl">
      <PageHeading
        title={c.title}
        description={unread ? c.unread(unread) : c.caughtUp}
        action={
          <Button variant="volt" onClick={markAll} disabled={!unread}>
            <CheckCheck className="size-4" />
            {c.markAllRead}
          </Button>
        }
      />

      <Card className="divide-border gap-0 divide-y p-0">
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
              <CheckCheck className="size-6" />
            </span>
            <p className="text-sm font-medium">{c.caughtUpTitle}</p>
            <p className="text-muted-foreground text-sm">{c.caughtUpDesc}</p>
          </div>
        )}
        {items.map((n) => {
          const meta = NOTIFICATION_META[n.type]
          const Icon = meta.icon
          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
                n.read ? "hover:bg-muted/40" : "bg-primary/[0.04] hover:bg-primary/[0.07]"
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  meta.tint
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && (
                    <span className="bg-primary size-2 shrink-0 rounded-full" />
                  )}
                </div>
                <p className="text-muted-foreground truncate text-sm">
                  {n.body}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {relativeTime(n.timestamp)}
              </span>
            </button>
          )
        })}
      </Card>
    </Page>
  )
}
