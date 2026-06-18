import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Phone,
  Mail,
  CornerUpRight,
  Pencil,
  Trash2,
  Plus,
  CheckSquare,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { FeatureIntro } from "@/components/common/FeatureIntro"
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
import { useLocale } from "@/lib/locale"
import type { Task, TaskType } from "@/lib/types"

const COPY = {
  en: {
    priorityLabel: {
      high: "High",
      medium: "Medium",
      low: "Low",
    } as Record<Task["priority"], string>,
    pageTitle: "Tasks",
    pageDescription: "Your follow-ups and to-dos.",
    newTask: "New task",
    introTitle: "Stay on top of every follow-up",
    introDescription:
      "Your prioritized daily list of calls, emails, and LinkedIn touches.",
    introPoints: [
      "Tasks auto-created from your sequences",
      "A clean due-today view",
      "Complete touches without context-switching",
    ],
    openDone: (open: number, done: number) => `${open} open · ${done} done`,
    noTasks: "No tasks.",
    markOpen: "Mark task as open",
    markDone: "Mark task as done",
    editAria: (title: string) => `Edit task: ${title}`,
    deleteAria: (title: string) => `Delete task: ${title}`,
    taskCompleted: "Task completed",
    taskDeleted: "Task deleted",
    deleteTitle: "Delete task?",
    deleteDescription: (title: string) =>
      `"${title}" will be permanently removed.`,
    delete: "Delete",
  },
  es: {
    priorityLabel: {
      high: "Alta",
      medium: "Media",
      low: "Baja",
    } as Record<Task["priority"], string>,
    pageTitle: "Tareas",
    pageDescription: "Tus seguimientos y pendientes.",
    newTask: "Nueva tarea",
    introTitle: "Controla todos tus seguimientos",
    introDescription:
      "Tu lista diaria priorizada de llamadas, correos y contactos por LinkedIn.",
    introPoints: [
      "Tareas creadas automáticamente desde tus secuencias",
      "Una vista clara de lo que vence hoy",
      "Completa contactos sin cambiar de contexto",
    ],
    openDone: (open: number, done: number) =>
      `${open} abiertas · ${done} completadas`,
    noTasks: "No hay tareas.",
    markOpen: "Marcar tarea como abierta",
    markDone: "Marcar tarea como completada",
    editAria: (title: string) => `Editar tarea: ${title}`,
    deleteAria: (title: string) => `Eliminar tarea: ${title}`,
    taskCompleted: "Tarea completada",
    taskDeleted: "Tarea eliminada",
    deleteTitle: "¿Eliminar tarea?",
    deleteDescription: (title: string) =>
      `«${title}» se eliminará de forma permanente.`,
    delete: "Eliminar",
  },
} as const

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
  const { locale } = useLocale()
  const c = COPY[locale]
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
    if (!task.done) toast.success(c.taskCompleted)
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
    toast.success(c.taskDeleted)
  }

  return (
    <Page>
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
        action={
          <Button variant="volt" onClick={openCreate}>
            <Plus />
            {c.newTask}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="tasks"
        icon={CheckSquare}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <p className="text-muted-foreground mb-4 text-sm tabular-nums">
        {c.openDone(openCount, doneCount)}
      </p>

      <Card className="gap-0 overflow-hidden py-0">
        {sorted.length === 0 ? (
          <p className="text-muted-foreground px-4 py-10 text-center text-sm">
            {c.noTasks}
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
                  aria-label={task.done ? c.markOpen : c.markDone}
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
                  className={cn("shrink-0", task.done && "opacity-60")}
                >
                  {c.priorityLabel[task.priority]}
                </Badge>

                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {relativeTime(task.dueDate)}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={c.editAria(task.title)}
                    onClick={() => openEdit(task)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8"
                    aria-label={c.deleteAria(task.title)}
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
        title={c.deleteTitle}
        description={
          deletingTask ? c.deleteDescription(deletingTask.title) : undefined
        }
        confirmLabel={c.delete}
        destructive
        onConfirm={confirmDelete}
      />
    </Page>
  )
}
