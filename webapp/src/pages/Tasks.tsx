import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Phone, Mail, CornerUpRight } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page, PageHeading } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { tasks as initialTasks } from "@/lib/mock-extra"
import { getProspect } from "@/lib/mock-data"
import { useView } from "@/lib/view-context"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Task, TaskType } from "@/lib/types"

const TYPE_ICON: Record<TaskType, React.ComponentType<{ className?: string }>> =
  {
    call: Phone,
    email: Mail,
    linkedin: LinkedinIcon,
    follow_up: CornerUpRight,
  }

const PRIORITY_VARIANT: Record<
  Task["priority"],
  "destructive" | "secondary" | "outline"
> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

export default function Tasks() {
  const { impersonatingId } = useView()
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks)

  const visible = React.useMemo(
    () =>
      impersonatingId
        ? tasks.filter((t) => t.ownerId === impersonatingId)
        : tasks,
    [tasks, impersonatingId]
  )

  const sorted = React.useMemo(
    () =>
      [...visible].sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }),
    [visible]
  )

  const openCount = visible.filter((t) => !t.done).length
  const doneCount = visible.length - openCount

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const next = { ...t, done: !t.done }
        if (next.done) toast.success("Task completed")
        return next
      })
    )
  }

  return (
    <Page>
      <PageHeading
        title="Tasks"
        description="Your follow-ups and to-dos."
      />

      <p className="text-muted-foreground mb-4 text-sm tabular-nums">
        {openCount} open · {doneCount} done
      </p>

      <Card className="gap-0 overflow-hidden py-0">
        {sorted.length === 0 ? (
          <p className="text-muted-foreground px-4 py-10 text-center text-sm">
            No tasks.
          </p>
        ) : (
          sorted.map((task) => {
            const Icon = TYPE_ICON[task.type]
            const prospect = task.prospectId
              ? getProspect(task.prospectId)
              : undefined
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <Checkbox
                  checked={task.done}
                  onCheckedChange={() => toggle(task.id)}
                  aria-label={
                    task.done ? "Mark task as open" : "Mark task as done"
                  }
                />

                <span
                  className={cn(
                    "bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full",
                    task.done && "opacity-60"
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1">
                  <span
                    className={cn(
                      "font-medium",
                      task.done && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </span>
                  {prospect && (
                    <Link
                      to={`/prospects/${prospect.id}`}
                      className="text-muted-foreground text-sm hover:underline"
                    >
                      · {prospect.firstName} {prospect.lastName}
                    </Link>
                  )}
                </div>

                <Badge
                  variant={PRIORITY_VARIANT[task.priority]}
                  className={cn("shrink-0 capitalize", task.done && "opacity-60")}
                >
                  {task.priority}
                </Badge>

                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {relativeTime(task.dueDate)}
                </span>
              </div>
            )
          })
        )}
      </Card>
    </Page>
  )
}
