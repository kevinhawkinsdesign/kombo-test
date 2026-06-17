import * as React from "react"
import { CheckCheck } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NOTIFICATION_META } from "@/components/notifications/meta"
import { notifications as seed } from "@/lib/mock-extra"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function Notifications() {
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
        title="Notifications"
        description={
          unread ? `${unread} unread` : "You're all caught up."
        }
        action={
          <Button variant="outline" onClick={markAll} disabled={!unread}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        }
      />

      <Card className="divide-border divide-y p-0">
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
              <CheckCheck className="size-6" />
            </span>
            <p className="text-sm font-medium">You're all caught up</p>
            <p className="text-muted-foreground text-sm">
              New replies, meetings, and deal updates will show up here.
            </p>
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
