import { Link } from "react-router-dom"
import {
  Phone,
  Mail,
  Clock,
  CheckSquare,
  Reply,
  CalendarCheck,
  Sparkles,
  UserPlus,
  MailOpen,
  ArrowUpRight,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useTasks, taskStore } from "@/lib/store"
import { recentActivity } from "@/lib/mock-data"
import { relativeTime } from "@/lib/format"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { TaskType, ActivityItem } from "@/lib/types"

const COPY = {
  en: {
    title: "Today",
    description: "What needs your attention right now.",
    tasks: "Your tasks",
    activity: "Recent activity",
    viewAll: "View all",
    allClear: "All clear — no open tasks 🎉",
    completed: (title: string) => `Completed "${title}"`,
  },
  es: {
    title: "Hoy",
    description: "Lo que necesita tu atención ahora.",
    tasks: "Tus tareas",
    activity: "Actividad reciente",
    viewAll: "Ver todo",
    allClear: "Todo en orden — sin tareas pendientes 🎉",
    completed: (title: string) => `"${title}" completada`,
  },
} as const

const TASK_ICON: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  linkedin: LinkedinIcon,
  manual: Clock,
  follow_up: Clock,
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-chart-4",
  low: "bg-muted-foreground/40",
}

const ACTIVITY_META: Record<
  ActivityItem["type"],
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  reply: { icon: Reply, tint: "bg-chart-1/15 text-chart-1" },
  meeting: { icon: CalendarCheck, tint: "bg-primary/15 text-primary" },
  enriched: { icon: Sparkles, tint: "bg-chart-5/15 text-chart-5" },
  added: { icon: UserPlus, tint: "bg-chart-3/15 text-chart-3" },
  opened: { icon: MailOpen, tint: "bg-chart-4/15 text-chart-4" },
}

export function TodayPanel({ className }: { className?: string }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const tasks = useTasks()
  const open = tasks
    .filter((t) => !t.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)
  const activity = recentActivity.slice(0, 5)

  return (
    <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
      {/* Tasks */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="text-primary size-4" />
              {c.tasks}
            </CardTitle>
            <CardDescription>{c.description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/tasks">
              {c.viewAll}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {open.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {c.allClear}
            </p>
          ) : (
            open.map((task) => {
              const Icon = TASK_ICON[task.type]
              return (
                <div
                  key={task.id}
                  className="hover:bg-muted/50 flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <Checkbox
                    checked={task.done}
                    onCheckedChange={() => taskStore.toggle(task.id)}
                    aria-label={task.title}
                  />
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      PRIORITY_DOT[task.priority]
                    )}
                  />
                  <Icon className="text-muted-foreground size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {task.title}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {relativeTime(task.dueDate)}
                  </span>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.activity}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {activity.map((item) => {
            const meta = ACTIVITY_META[item.type]
            const Icon = meta.icon
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    meta.tint
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">{item.prospectName}</span>{" "}
                    {item.detail}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {relativeTime(item.timestamp)}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
