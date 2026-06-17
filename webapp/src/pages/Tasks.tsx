import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Phone, Mail, CornerUpRight, Pencil, Trash2, Plus } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page, PageHeading } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { useTasks, taskStore } from "@/lib/store"
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
  const tasks = useTasks()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | undefined>(
    undefined
  )
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null)

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

  function toggle(task: Task) {
    taskStore.toggle(task.id)
    if (!task.done) toast.success("Task completed")
  }

  function openCreate() {
    setEditingTask(undefined)
    setFormOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  function confirmDelete() {
    if (!deletingTask) return
    taskStore.remove(deletingTask.id)
    toast.success("Task deleted")
  }

  return (
    <Page>
      <PageHeading
        title="Tasks"
        description="Your follow-ups and to-dos."
        action={
          <Button onClick={openCreate}>
            <Plus />
            New task
          </Button>
        }
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
                  onCheckedChange={() => toggle(task)}
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

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Edit task: ${task.title}`}
                    onClick={() => openEdit(task)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8"
                    aria-label={`Delete task: ${task.title}`}
                    onClick={() => setDeletingTask(task)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </Card>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
      />

      <ConfirmDialog
        open={deletingTask !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null)
        }}
        title="Delete task?"
        description={
          deletingTask
            ? `"${deletingTask.title}" will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </Page>
  )
}
