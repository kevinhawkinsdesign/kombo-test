import * as React from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProspects, taskStore } from "@/lib/store"
import type { Task, TaskType } from "@/lib/types"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
}

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "follow_up", label: "Follow-up" },
]

const PRIORITY_OPTIONS: { value: Task["priority"]; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const NONE_VALUE = "__none__"

const DEFAULT_OWNER_ID = "rep_1"

// Default a fresh task's due date to today, as a local YYYY-MM-DD value.
function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
}: TaskFormDialogProps) {
  const prospects = useProspects()

  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<TaskType>("call")
  const [priority, setPriority] = React.useState<Task["priority"]>("medium")
  const [dueDate, setDueDate] = React.useState(todayInputValue())
  const [prospectId, setProspectId] = React.useState<string>(NONE_VALUE)

  // Reset the form whenever it transitions to open, seeding from `task`.
  // Adjusting state during render (the React-recommended pattern) avoids a
  // cascading-render effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTitle(task?.title ?? "")
      setType(task?.type ?? "call")
      setPriority(task?.priority ?? "medium")
      setDueDate(task ? task.dueDate.slice(0, 10) : todayInputValue())
      setProspectId(task?.prospectId ?? NONE_VALUE)
    }
  }

  const trimmedTitle = title.trim()
  const canSave = trimmedTitle.length > 0

  function handleSave() {
    if (!canSave) return

    const payload: Omit<Task, "id"> = {
      title: trimmedTitle,
      type,
      priority,
      dueDate: new Date(dueDate).toISOString(),
      prospectId: prospectId === NONE_VALUE ? undefined : prospectId,
      ownerId: task?.ownerId ?? DEFAULT_OWNER_ID,
      done: task?.done ?? false,
    }

    if (task) {
      taskStore.update(task.id, payload)
      toast.success("Task updated")
    } else {
      taskStore.create(payload)
      toast.success("Task created")
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Follow up with…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as TaskType)}
              >
                <SelectTrigger id="task-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value as Task["priority"])
                }
              >
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-date">Due date</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-prospect">Prospect</Label>
            <Select value={prospectId} onValueChange={setProspectId}>
              <SelectTrigger id="task-prospect" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>— None —</SelectItem>
                {prospects.map((prospect) => (
                  <SelectItem key={prospect.id} value={prospect.id}>
                    {prospect.firstName} {prospect.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
