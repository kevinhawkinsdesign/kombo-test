import {
  MessageSquareReply,
  CalendarCheck,
  Briefcase,
  AtSign,
  Bell,
} from "lucide-react"

import type { NotificationType } from "@/lib/types"

export const NOTIFICATION_META: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  reply: { icon: MessageSquareReply, tint: "bg-chart-1/15 text-chart-1" },
  meeting: { icon: CalendarCheck, tint: "bg-primary/15 text-primary" },
  deal: { icon: Briefcase, tint: "bg-chart-4/15 text-chart-4" },
  mention: { icon: AtSign, tint: "bg-chart-3/15 text-chart-3" },
  system: { icon: Bell, tint: "bg-muted text-muted-foreground" },
}
