import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Phone,
  Mail,
  ClipboardList,
  CornerUpRight,
  Pencil,
  Trash2,
  Plus,
  Play,
  CalendarClock,
  MoreHorizontal,
  Ban,
  RotateCcw,
  Sparkles,
  Cpu,
  Send,
  Zap,
  Search as SearchIcon,
  X,
  Check,
  ChevronDown,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Page, PageHeading } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { useTasks, taskStore } from "@/lib/store"
import { getProspect, currentUser } from "@/lib/mock-data"
import { isEnriched, ENRICH_COST } from "@/lib/enrichment"
import { formatDueAt, initials, dueBucket } from "@/lib/format"
import { assignableUsers, resolveUser, resolveAssigner } from "@/lib/task-people"
import type { Person } from "@/lib/task-people"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale"
import type { Task, TaskType } from "@/lib/types"

type Tab = "due" | "upcoming" | "ignored" | "completed"
type SourceKind = "manual" | "ai" | "sequence"

const TYPE_ICON: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  linkedin: LinkedinIcon,
  manual: ClipboardList,
  follow_up: CornerUpRight,
}
// In-app tasks are messages we can send from the platform; offline tasks (a
// call to place, a manual to-do) are done by hand and logged.
const IN_APP: Set<TaskType> = new Set(["email", "linkedin"])

function sourceOf(task: Task): SourceKind {
  const a = resolveAssigner(task.assignedById)
  if (a.kind === "kai") return "ai"
  if (a.kind === "system") return "sequence"
  return "manual"
}

const COPY = {
  en: {
    pageTitle: "Tasks",
    pageDescription: "Your follow-ups and to-dos — in-app or offline.",
    newTask: "New task",
    startTasks: (n: number) => `Start ${n} ${n === 1 ? "task" : "tasks"}`,
    started: "Stepping through your tasks…",
    tabDue: "Due",
    tabUpcoming: "Upcoming",
    tabIgnored: "Ignored",
    tabCompleted: "Completed",
    searchTasks: "Search tasks",
    taskType: "Task type",
    allTypes: "All types",
    source: "Source",
    allSources: "All sources",
    srcManual: "Manual task",
    srcAi: "AI task",
    srcSequence: "Sequence",
    company: "Company",
    allCompanies: "All companies",
    assignedTo: "Assigned to",
    me: "Me",
    anyone: "Anyone",
    assignTo: "Assign to",
    assignToMe: "Assign to me",
    assignedToast: (name: string) => `Assigned to ${name}`,
    reassign: (name: string) => `Assigned to ${name} — reassign`,
    clearFilters: "Clear filters",
    sortDate: "Date",
    colTask: "Task",
    colSource: "Source",
    colContact: "Contact",
    colPhone: "Phone number",
    colAssigned: "Assigned to",
    colDue: "Due date",
    by: (company: string) => `By ${company}`,
    enrich: "Enrich",
    enrichingToast: (name: string) => `Enriching ${name}…`,
    noTasks: "Nothing here.",
    markDone: "Mark done",
    sendDone: "Send & mark done",
    completed: "Task completed",
    reopened: "Task reopened",
    reschedule: "Reschedule",
    rescheduleToday: "Today",
    rescheduleTomorrow: "Tomorrow",
    rescheduleNextWeek: "Next week",
    rescheduled: "Task rescheduled",
    ignore: "Ignore",
    restore: "Restore",
    ignored: "Task ignored",
    restored: "Task restored",
    edit: "Edit",
    delete: "Delete",
    deleted: "Task deleted",
    deleteTitle: "Delete task?",
    deleteDescription: (title: string) => `"${title}" will be permanently removed.`,
    actions: "Task actions",
    inApp: "In-app",
    offline: "Offline",
  },
  es: {
    pageTitle: "Tareas",
    pageDescription: "Tus seguimientos y pendientes — en la app o fuera de ella.",
    newTask: "Nueva tarea",
    startTasks: (n: number) => `Iniciar ${n} ${n === 1 ? "tarea" : "tareas"}`,
    started: "Recorriendo tus tareas…",
    tabDue: "Vencidas",
    tabUpcoming: "Próximas",
    tabIgnored: "Ignoradas",
    tabCompleted: "Completadas",
    searchTasks: "Buscar tareas",
    taskType: "Tipo",
    allTypes: "Todos los tipos",
    source: "Origen",
    allSources: "Todos los orígenes",
    srcManual: "Tarea manual",
    srcAi: "Tarea de IA",
    srcSequence: "Secuencia",
    company: "Empresa",
    allCompanies: "Todas las empresas",
    assignedTo: "Asignado a",
    me: "Yo",
    anyone: "Cualquiera",
    assignTo: "Asignar a",
    assignToMe: "Asignármela",
    assignedToast: (name: string) => `Asignado a ${name}`,
    reassign: (name: string) => `Asignado a ${name} — reasignar`,
    clearFilters: "Limpiar filtros",
    sortDate: "Fecha",
    colTask: "Tarea",
    colSource: "Origen",
    colContact: "Contacto",
    colPhone: "Teléfono",
    colAssigned: "Asignado a",
    colDue: "Vencimiento",
    by: (company: string) => `De ${company}`,
    enrich: "Enriquecer",
    enrichingToast: (name: string) => `Enriqueciendo ${name}…`,
    noTasks: "Nada por aquí.",
    markDone: "Completar",
    sendDone: "Enviar y completar",
    completed: "Tarea completada",
    reopened: "Tarea reabierta",
    reschedule: "Reprogramar",
    rescheduleToday: "Hoy",
    rescheduleTomorrow: "Mañana",
    rescheduleNextWeek: "Próxima semana",
    rescheduled: "Tarea reprogramada",
    ignore: "Ignorar",
    restore: "Restaurar",
    ignored: "Tarea ignorada",
    restored: "Tarea restaurada",
    edit: "Editar",
    delete: "Eliminar",
    deleted: "Tarea eliminada",
    deleteTitle: "¿Eliminar tarea?",
    deleteDescription: (title: string) => `«${title}» se eliminará de forma permanente.`,
    actions: "Acciones",
    inApp: "En la app",
    offline: "Fuera de línea",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export default function Tasks() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const tasks = useTasks()

  const [tab, setTab] = React.useState<Tab>("due")
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<TaskType | "all">("all")
  const [sourceFilter, setSourceFilter] = React.useState<SourceKind | "all">("all")
  const [companyFilter, setCompanyFilter] = React.useState<string>("all")
  const [assignee, setAssignee] = React.useState<string>("me") // me | anyone | userId
  const [sortAsc, setSortAsc] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null)

  const companies = React.useMemo(() => {
    const set = new Set<string>()
    for (const t of tasks) {
      const p = t.prospectId ? getProspect(t.prospectId) : undefined
      if (p?.company) set.add(p.company)
    }
    return [...set].sort()
  }, [tasks])

  const q = search.trim().toLowerCase()
  // Everything except the status tab — the tab counts reflect these filters.
  const scoped = React.useMemo(
    () =>
      tasks.filter((t) => {
        const p = t.prospectId ? getProspect(t.prospectId) : undefined
        if (assignee === "me" && t.ownerId !== currentUser.id) return false
        if (assignee !== "me" && assignee !== "anyone" && t.ownerId !== assignee)
          return false
        if (typeFilter !== "all" && t.type !== typeFilter) return false
        if (sourceFilter !== "all" && sourceOf(t) !== sourceFilter) return false
        if (companyFilter !== "all" && p?.company !== companyFilter) return false
        if (
          q &&
          !`${t.title} ${p ? `${p.firstName} ${p.lastName} ${p.company}` : ""}`
            .toLowerCase()
            .includes(q)
        )
          return false
        return true
      }),
    [tasks, assignee, typeFilter, sourceFilter, companyFilter, q]
  )

  const buckets = React.useMemo(() => {
    const due = scoped.filter(
      (t) => !t.done && !t.ignored && dueBucket(t.dueDate) !== "upcoming"
    )
    const upcoming = scoped.filter(
      (t) => !t.done && !t.ignored && dueBucket(t.dueDate) === "upcoming"
    )
    const ignored = scoped.filter((t) => t.ignored && !t.done)
    const completed = scoped.filter((t) => t.done)
    return { due, upcoming, ignored, completed }
  }, [scoped])

  const rows = React.useMemo(() => {
    const list = [...buckets[tab]]
    list.sort((a, b) => {
      const d = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      return sortAsc ? d : -d
    })
    return list
  }, [buckets, tab, sortAsc])

  const filtersActive =
    typeFilter !== "all" ||
    sourceFilter !== "all" ||
    companyFilter !== "all" ||
    assignee !== "me" ||
    q.length > 0

  function clearFilters() {
    setSearch("")
    setTypeFilter("all")
    setSourceFilter("all")
    setCompanyFilter("all")
    setAssignee("me")
  }

  function complete(task: Task) {
    taskStore.toggle(task.id)
    toast.success(task.done ? c.reopened : c.completed)
  }
  function reschedule(task: Task, days: number) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    d.setHours(days === 0 ? 17 : 8, 0, 0, 0)
    taskStore.update(task.id, { dueDate: d.toISOString() })
    toast.success(c.rescheduled)
  }
  function setIgnored(task: Task, ignored: boolean) {
    taskStore.update(task.id, { ignored })
    toast.success(ignored ? c.ignored : c.restored)
  }
  function reassign(task: Task, userId: string) {
    if (userId === task.ownerId) return
    taskStore.update(task.id, { ownerId: userId })
    toast.success(c.assignedToast(resolveUser(userId).name))
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "due", label: c.tabDue, count: buckets.due.length },
    { key: "ignored", label: c.tabIgnored, count: buckets.ignored.length },
    { key: "upcoming", label: c.tabUpcoming, count: buckets.upcoming.length },
    { key: "completed", label: c.tabCompleted, count: buckets.completed.length },
  ]

  const users = assignableUsers()

  return (
    <Page>
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success(c.started)}>
              <Play className="size-4" />
              {c.startTasks(buckets.due.length || rows.length)}
            </Button>
            <Button
              variant="volt"
              onClick={() => {
                setEditingTask(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              {c.newTask}
            </Button>
          </div>
        }
      />

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                tab === t.key ? "bg-primary/10 text-primary" : "bg-muted"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c.searchTasks}
            className="h-9 pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TaskType | "all")}>
          <SelectTrigger size="sm" className="h-9 w-[140px]">
            <SelectValue placeholder={c.taskType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{c.allTypes}</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="manual">{c.srcManual}</SelectItem>
            <SelectItem value="follow_up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceKind | "all")}>
          <SelectTrigger size="sm" className="h-9 w-[140px]">
            <SelectValue placeholder={c.source} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{c.allSources}</SelectItem>
            <SelectItem value="manual">{c.srcManual}</SelectItem>
            <SelectItem value="ai">{c.srcAi}</SelectItem>
            <SelectItem value="sequence">{c.srcSequence}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger size="sm" className="h-9 w-[150px]">
            <SelectValue placeholder={c.company} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{c.allCompanies}</SelectItem>
            {companies.map((co) => (
              <SelectItem key={co} value={co}>
                {co}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger size="sm" className="h-9 w-[150px]">
            <SelectValue placeholder={c.assignedTo} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="me">{`${c.assignedTo}: ${c.me}`}</SelectItem>
            <SelectItem value="anyone">{`${c.assignedTo}: ${c.anyone}`}</SelectItem>
            {users
              .filter((u) => u.id !== currentUser.id)
              .map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4" />
            {c.clearFilters}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => setSortAsc((v) => !v)}
        >
          <CalendarClock className="size-4" />
          {c.sortDate}
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <p className="text-muted-foreground px-4 py-12 text-center text-sm">
            {c.noTasks}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b text-xs">
              <tr>
                <th className="w-10 px-3 py-2" />
                <th className="px-2 py-2 text-left font-medium">{c.colTask}</th>
                <th className="hidden px-2 py-2 text-left font-medium md:table-cell">
                  {c.colSource}
                </th>
                <th className="px-2 py-2 text-left font-medium">{c.colContact}</th>
                <th className="hidden px-2 py-2 text-left font-medium lg:table-cell">
                  {c.colPhone}
                </th>
                <th className="hidden px-2 py-2 text-left font-medium sm:table-cell">
                  {c.colAssigned}
                </th>
                <th className="px-2 py-2 text-left font-medium">{c.colDue}</th>
                <th className="w-20 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  c={c}
                  users={users}
                  onComplete={() => complete(task)}
                  onReschedule={(d) => reschedule(task, d)}
                  onReassign={(userId) => reassign(task, userId)}
                  onIgnore={() => setIgnored(task, !task.ignored)}
                  onEdit={() => {
                    setEditingTask(task)
                    setFormOpen(true)
                  }}
                  onDelete={() => setDeletingTask(task)}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editingTask} />

      <ConfirmDialog
        open={deletingTask !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null)
        }}
        title={c.deleteTitle}
        description={deletingTask ? c.deleteDescription(deletingTask.title) : undefined}
        confirmLabel={c.delete}
        destructive
        onConfirm={() => {
          if (deletingTask) {
            taskStore.remove(deletingTask.id)
            toast.success(c.deleted)
          }
        }}
      />
    </Page>
  )
}

function UserChip({ name, color, size = "size-6" }: { name: string; color: string; size?: string }) {
  return (
    <Avatar className={size}>
      <AvatarFallback
        style={{ backgroundColor: color, color: "white" }}
        className="text-[10px] font-medium"
      >
        {initials(name.split(" ")[0], name.split(" ")[1])}
      </AvatarFallback>
    </Avatar>
  )
}

function SourceBadge({ task, c }: { task: Task; c: Copy }) {
  const kind = sourceOf(task)
  const map = {
    manual: { label: c.srcManual, icon: ClipboardList, cls: "" },
    ai: { label: c.srcAi, icon: Sparkles, cls: "text-primary" },
    sequence: { label: c.srcSequence, icon: Cpu, cls: "" },
  } as const
  const m = map[kind]
  const Icon = m.icon
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs">
      <Icon className={cn("size-3.5", m.cls)} />
      {m.label}
    </span>
  )
}

function TaskRow({
  task,
  c,
  users,
  onComplete,
  onReschedule,
  onReassign,
  onIgnore,
  onEdit,
  onDelete,
}: {
  task: Task
  c: Copy
  users: Person[]
  onComplete: () => void
  onReschedule: (days: number) => void
  onReassign: (userId: string) => void
  onIgnore: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const Icon = TYPE_ICON[task.type]
  const prospect = task.prospectId ? getProspect(task.prospectId) : undefined
  const owner = resolveUser(task.ownerId)
  const inApp = IN_APP.has(task.type)
  const needsEnrich = prospect ? !isEnriched(prospect) || !prospect.phone : false

  return (
    <tr className="hover:bg-muted/40 border-b last:border-b-0">
      <td className="px-3 py-2.5 align-middle">
        <Checkbox
          checked={task.done}
          onCheckedChange={onComplete}
          aria-label={inApp ? c.sendDone : c.markDone}
        />
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md",
              inApp ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
            title={inApp ? c.inApp : c.offline}
          >
            <Icon className="size-3.5" />
          </span>
          <span className={cn("font-medium", task.done && "text-muted-foreground line-through")}>
            {task.title}
          </span>
        </div>
      </td>
      <td className="hidden px-2 py-2.5 md:table-cell">
        <SourceBadge task={task} c={c} />
      </td>
      <td className="px-2 py-2.5">
        {prospect ? (
          <Link
            to={`/prospects/${prospect.id}`}
            className="flex items-center gap-2.5 hover:opacity-80"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: prospect.avatarColor }}
            >
              {initials(prospect.firstName, prospect.lastName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {prospect.firstName} {prospect.lastName}
              </span>
              <span className="text-muted-foreground block truncate text-xs">
                {c.by(prospect.company)}
              </span>
            </span>
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="hidden px-2 py-2.5 lg:table-cell">
        {!prospect ? (
          <span className="text-muted-foreground">—</span>
        ) : needsEnrich ? (
          <button
            type="button"
            onClick={() => toast.success(c.enrichingToast(prospect.firstName))}
            className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <Zap className="size-3.5" />
            {c.enrich}
            <span className="text-muted-foreground">· {ENRICH_COST.profile}</span>
          </button>
        ) : (
          <span className="text-muted-foreground">{prospect.phone}</span>
        )}
      </td>
      <td className="hidden px-2 py-2.5 sm:table-cell">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={c.reassign(owner.name)}
              className="hover:bg-muted -mx-1 flex items-center gap-2 rounded-md px-1 py-1 transition-colors"
            >
              <UserChip name={owner.name} color={owner.avatarColor} />
              <span className="text-muted-foreground truncate text-xs">
                {owner.name.split(" ")[0]}
              </span>
              <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {c.assignTo}
            </DropdownMenuLabel>
            {users.map((u) => (
              <DropdownMenuItem
                key={u.id}
                onClick={() => onReassign(u.id)}
                className="gap-2"
              >
                <UserChip name={u.name} color={u.avatarColor} size="size-5" />
                <span className="flex-1 truncate">
                  {u.id === currentUser.id ? `${u.name} (${c.me})` : u.name}
                </span>
                {u.id === task.ownerId && (
                  <Check className="text-primary size-4 shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
      <td className="text-muted-foreground px-2 py-2.5 text-xs whitespace-nowrap">
        {formatDueAt(task.dueDate)}
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center justify-end gap-0.5">
          {/* Reschedule */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={c.reschedule}
                title={c.reschedule}
              >
                <CalendarClock className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {c.reschedule}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onReschedule(0)}>
                {c.rescheduleToday}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReschedule(1)}>
                {c.rescheduleTomorrow}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReschedule(7)}>
                {c.rescheduleNextWeek}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* More */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label={c.actions}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onComplete}>
                {inApp ? <Send className="size-4" /> : <Pencil className="size-4" />}
                {inApp ? c.sendDone : c.markDone}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" />
                {c.edit}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onIgnore}>
                {task.ignored ? (
                  <>
                    <RotateCcw className="size-4" />
                    {c.restore}
                  </>
                ) : (
                  <>
                    <Ban className="size-4" />
                    {c.ignore}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                {c.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}
