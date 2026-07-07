import { UserCircle2, UserPlus, Check } from "lucide-react"

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
import { Button } from "@/components/ui/button"
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
  /**
   * "select" (default) renders the form combobox. "icon" renders a compact
   * icon-button + dropdown for toolbars (as the Inbox header uses), with an
   * inline Unassign item once someone is assigned.
   */
  variant?: "select" | "icon"
  /** Icon variant: accessible label/tooltip for the trigger + menu heading. */
  triggerAriaLabel?: string
  /** Icon variant: label for the inline Unassign item. */
  unassignLabel?: string
}

// A shared "assign to a team member" picker — built on the same
// you-plus-team roster (`assignableUsers()`) that already backs Task
// assignment, with an avatar shown per option instead of name-only text.
export function AssigneePicker({
  value,
  onChange,
  id,
  className,
  unassignedLabel = "Unassigned",
  variant = "select",
  triggerAriaLabel,
  unassignLabel,
}: AssigneePickerProps) {
  const users = assignableUsers()
  const selected = value ? resolveUser(value) : undefined

  if (variant === "icon") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label={triggerAriaLabel}
            title={triggerAriaLabel}
          >
            <UserPlus className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {triggerAriaLabel && (
            <DropdownMenuLabel>{triggerAriaLabel}</DropdownMenuLabel>
          )}
          {users.map((u) => (
            <DropdownMenuItem key={u.id} onClick={() => onChange(u.id)}>
              <PersonRow person={u} />
              {value === u.id && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
          ))}
          {value && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onChange(undefined)}>
                {unassignLabel ?? unassignedLabel}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

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
