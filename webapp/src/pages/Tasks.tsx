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
  Sparkles,
  Cpu,
  Check,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Page, PageHeading } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { useTasks, taskStore } from "@/lib/store"
import { getProspect } from "@/lib/mock-data"
import { useView } from "@/lib/view-context"
import { relativeTime, initials, dueBucket } from "@/lib/format"
import {
  assignableUsers,
  resolveUser,
  resolveAssigner,
  type Assigner,
} from "@/lib/task-people"
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
    groupOverdue: "Overdue",
    groupToday: "Today",
    groupUpcoming: "Upcoming",
    groupCompleted: "Completed",
    filterAll: "All",
    filterCall: "Calls",
    filterEmail: "Emails",
    filterLinkedin: "LinkedIn",
    filterFollowUp: "Follow-ups",
    noTasks: "No tasks.",
    noTasksFiltered: "No tasks match this filter.",
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
    assignTo: "Assign to",
    assignedTo: (name: string) => `Assigned to ${name}`,
    assignedBy: "Assigned by",
    by: "by",
    you: "you",
    kai: "Kai",
    system: "System",
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
    groupOverdue: "Vencidas",
    groupToday: "Hoy",
    groupUpcoming: "Próximas",
    groupCompleted: "Completadas",
    filterAll: "Todas",
    filterCall: "Llamadas",
    filterEmail: "Correos",
    filterLinkedin: "LinkedIn",
    filterFollowUp: "Seguimientos",
    noTasks: "No hay tareas.",
    noTasksFiltered: "Ninguna tarea coincide con este filtro.",
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
    assignTo: "Asignar a",
    assignedTo: (name: string) => `Asignada a ${name}`,
    assignedBy: "Asignada por",
    by: "por",
    you: "ti",
    kai: "Kai",
    system: "Sistema",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

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
  const [typeFilter, setTypeFilter] = React.useState<TaskType | "all">("all")

  const visible = React.useMemo(
    () =>
      impersonatingId
        ? tasks.filter((t) => t.ownerId === impersonatingId)
        : tasks,
    [tasks, impersonatingId]
  )

  const filtered = React.useMemo(
    () =>
      typeFilter === "all"
        ? visible
        : visible.filter((t) => t.type === typeFilter),
    [visible, typeFilter]
  )

  const byDue = (a: Task, b: Task) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()

  // Cadence groups: open tasks bucketed by due date, plus a completed section.
  const groups = React.useMemo(() => {
    const open = filtered.filter((t) => !t.done)
    return {
      overdue: open.filter((t) => dueBucket(t.dueDate) === "overdue").sort(byDue),
      today: open.filter((t) => dueBucket(t.dueDate) === "today").sort(byDue),
      upcoming: open.filter((t) => dueBucket(t.dueDate) === "upcoming").sort(byDue),
      completed: filtered.filter((t) => t.done).sort(byDue),
    }
  }, [filtered])

  const openCount = visible.filter((t) => !t.done).length
  const doneCount = visible.length - openCount

  const typeFilters: { value: TaskType | "all"; label: string }[] = [
    { value: "all", label: c.filterAll },
    { value: "call", label: c.filterCall },
    { value: "email", label: c.filterEmail },
    { value: "linkedin", label: c.filterLinkedin },
    { value: "follow_up", label: c.filterFollowUp },
  ]

  const cadenceSections: { key: keyof typeof groups; label: string; tone: string }[] = [
    { key: "overdue", label: c.groupOverdue, tone: "bg-destructive" },
    { key: "today", label: c.groupToday, tone: "bg-volt" },
    { key: "upcoming", label: c.groupUpcoming, tone: "bg-primary" },
    { key: "completed", label: c.groupCompleted, tone: "bg-muted-foreground" },
  ]
  const hasAny = cadenceSections.some((s) => groups[s.key].length > 0)

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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                typeFilter === f.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-sm tabular-nums">
          {c.openDone(openCount, doneCount)}
        </p>
      </div>

      {!hasAny ? (
        <Card className="py-0">
          <p className="text-muted-foreground px-4 py-10 text-center text-sm">
            {typeFilter === "all" ? c.noTasks : c.noTasksFiltered}
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {cadenceSections.map((section) => {
            const items = groups[section.key]
            if (items.length === 0) return null
            return (
              <div key={section.key}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", section.tone)} />
                  <h2 className="text-sm font-semibold">{section.label}</h2>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {items.length}
                  </span>
                </div>
                <Card className="gap-0 overflow-hidden py-0">
                  {items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      c={c}
                      onToggle={() => toggle(task)}
                      onEdit={() => openEdit(task)}
                      onDelete={() => setDeletingTask(task)}
                    />
                  ))}
                </Card>
              </div>
            )
          })}
        </div>
      )}

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

function TaskRow({
  task,
  c,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task
  c: Copy
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const Icon = TYPE_ICON[task.type]
  const prospect = task.prospectId ? getProspect(task.prospectId) : undefined
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <Checkbox
        checked={task.done}
        onCheckedChange={onToggle}
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
        <AssignedByChip assigner={resolveAssigner(task.assignedById)} c={c} />
      </div>

      <AssigneePicker task={task} c={c} />

      <Badge
        variant={PRIORITY_VARIANT[task.priority]}
        className={cn("shrink-0 max-sm:hidden", task.done && "opacity-60")}
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
          onClick={onEdit}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-8"
          aria-label={c.deleteAria(task.title)}
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}

function UserAvatar({
  name,
  color,
  className,
}: {
  name: string
  color: string
  className?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarFallback
        style={{ backgroundColor: color, color: "white" }}
        className="text-[9px] font-medium"
      >
        {initials(name.split(" ")[0], name.split(" ")[1])}
      </AvatarFallback>
    </Avatar>
  )
}

// Quiet "assigned by Kai / System / a teammate" indicator.
function AssignedByChip({ assigner, c }: { assigner: Assigner; c: Copy }) {
  if (assigner.kind === "kai") {
    return (
      <span
        className="text-primary inline-flex items-center gap-1 text-xs font-medium"
        title={`${c.assignedBy} ${c.kai}`}
      >
        <Sparkles className="size-3" />
        {c.kai}
      </span>
    )
  }
  if (assigner.kind === "system") {
    return (
      <span
        className="text-muted-foreground inline-flex items-center gap-1 text-xs"
        title={`${c.assignedBy} ${c.system}`}
      >
        <Cpu className="size-3" />
        {c.system}
      </span>
    )
  }
  const label = assigner.isSelf ? c.you : assigner.person.name.split(" ")[0]
  return (
    <span
      className="text-muted-foreground inline-flex items-center gap-1 text-xs"
      title={`${c.assignedBy} ${assigner.person.name}`}
    >
      <UserAvatar name={assigner.person.name} color={assigner.person.avatarColor} className="size-4" />
      {c.by} {label}
    </span>
  )
}

// Assignee avatar with a dropdown to reassign the task.
function AssigneePicker({ task, c }: { task: Task; c: Copy }) {
  const owner = resolveUser(task.ownerId)
  const users = assignableUsers()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:ring-ring/40 shrink-0 rounded-full transition-shadow hover:ring-2"
          aria-label={c.assignedTo(owner.name)}
          title={c.assignedTo(owner.name)}
        >
          <UserAvatar name={owner.name} color={owner.avatarColor} className="size-7" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{c.assignTo}</DropdownMenuLabel>
        {users.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onClick={() => taskStore.update(task.id, { ownerId: u.id })}
          >
            <UserAvatar name={u.name} color={u.avatarColor} className="size-5" />
            <span className="flex-1 truncate">{u.name}</span>
            {task.ownerId === u.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
