import { UserCircle2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { assignableUsers, resolveUser, type Person } from "@/lib/task-people"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

const UNASSIGNED = "unassigned"

function nameInitials(name: string): string {
  const [first, ...rest] = name.split(" ")
  return initials(first, rest.at(-1))
}

function PersonRow({ person }: { person: Person }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar className="size-5 shrink-0">
        <AvatarFallback
          style={{ backgroundColor: person.avatarColor, color: "white" }}
          className="text-[10px] font-medium"
        >
          {nameInitials(person.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{person.name}</span>
    </span>
  )
}

interface AssigneePickerProps {
  /** The assigned user's id, or undefined when unassigned. */
  value: string | undefined
  onChange: (id: string | undefined) => void
  id?: string
  className?: string
  unassignedLabel?: string
}

// A shared "assign to a team member" Select — built on the same
// you-plus-team roster (`assignableUsers()`) that already backs Task
// assignment, with an avatar shown per option instead of name-only text.
export function AssigneePicker({
  value,
  onChange,
  id,
  className,
  unassignedLabel = "Unassigned",
}: AssigneePickerProps) {
  const users = assignableUsers()
  const selected = value ? resolveUser(value) : undefined

  return (
    <Select
      value={value ?? UNASSIGNED}
      onValueChange={(v) => onChange(v === UNASSIGNED ? undefined : v)}
    >
      <SelectTrigger id={id} className={cn("w-full", className)}>
        <SelectValue>
          {selected ? (
            <PersonRow person={selected} />
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <UserCircle2 className="size-4" />
              {unassignedLabel}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>
          <span className="text-muted-foreground flex items-center gap-2">
            <UserCircle2 className="size-4" />
            {unassignedLabel}
          </span>
        </SelectItem>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            <PersonRow person={u} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
