import { useNavigate } from "react-router-dom"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NOTIFICATION_META } from "@/components/notifications/meta"
import { notifications } from "@/lib/mock-extra"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export function NotificationsBell() {
  const navigate = useNavigate()
  const unread = notifications.filter((n) => !n.read).length
  const recent = notifications.slice(0, 4)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
          Notifications
          {unread > 0 && (
            <span className="text-muted-foreground text-xs font-normal">
              {unread} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-80 overflow-y-auto">
          {recent.map((n) => {
            const meta = NOTIFICATION_META[n.type]
            const Icon = meta.icon
            return (
              <button
                key={n.id}
                onClick={() => navigate("/notifications")}
                className={cn(
                  "hover:bg-muted/60 flex w-full items-start gap-3 px-3 py-2.5 text-left",
                  !n.read && "bg-primary/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    meta.tint
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {n.body}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-[10px]">
                  {relativeTime(n.timestamp)}
                </span>
              </button>
            )
          })}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <button
          onClick={() => navigate("/notifications")}
          className="text-primary hover:bg-muted/60 w-full px-3 py-2.5 text-center text-sm font-medium"
        >
          View all notifications
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
