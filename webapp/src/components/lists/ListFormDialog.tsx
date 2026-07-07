import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Check, Users, Building2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { useLocale } from "@/lib/locale"
import { listStore } from "@/lib/store"
import type { ProspectList } from "@/lib/types"
import { cn } from "@/lib/utils"

// Localized copy for the assignment field (the rest of this dialog predates
// the per-file COPY convention).
const ASSIGN_COPY = {
  en: {
    assignTo: "Assign to",
    assignToHint:
      "New prospects entering this list are assigned to this teammate.",
    unassigned: "Unassigned",
  },
  es: {
    assignTo: "Asignar a",
    assignToHint:
      "Los nuevos prospectos que entren en esta lista se asignan a este compañero.",
    unassigned: "Sin asignar",
  },
} as const

interface ListFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list?: ProspectList
}

const PRESET_COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
] as const

export function ListFormDialog({
  open,
  onOpenChange,
  list,
}: ListFormDialogProps) {
  const navigate = useNavigate()
  const { locale } = useLocale()
  const ac = ASSIGN_COPY[locale]
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [color, setColor] = React.useState<string>(PRESET_COLORS[0])
  const [kind, setKind] = React.useState<"people" | "company">("people")
  const [assigneeId, setAssigneeId] = React.useState<string | undefined>(
    undefined
  )

  // Reset fields whenever the dialog transitions to open, seeding from `list`
  // for edit mode. Adjusting state during render (the React-recommended
  // pattern) avoids a cascading-render effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(list?.name ?? "")
      setDescription(list?.description ?? "")
      setColor(list?.color ?? PRESET_COLORS[0])
      setKind(list?.kind ?? "people")
      setAssigneeId(list?.assigneeId)
    }
  }

  const isEdit = Boolean(list)
  const trimmedName = name.trim()
  const canSave = trimmedName.length > 0

  function handleSave() {
    if (!canSave) return
    if (list) {
      listStore.update(list.id, {
        name: trimmedName,
        description: description.trim(),
        color,
        assigneeId,
      })
      toast.success("List updated")
    } else {
      const created = listStore.create({
        name: trimmedName,
        description: description.trim(),
        color,
        kind,
        assigneeId,
      })
      toast.success("List created")
      onOpenChange(false)
      // Open the new list so the user lands on what they just made.
      navigate(`/lists/${created.id}`)
      return
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit list" : "New list"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label>List type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "people", label: "Prospects", icon: Users },
                    { value: "company", label: "Companies", icon: Building2 },
                  ] as const
                ).map((opt) => {
                  const selected = kind === opt.value
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setKind(opt.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary ring-primary bg-primary/[0.04] ring-1"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <Icon className="size-4" />
                      {opt.label}
                      {selected && (
                        <Check className="text-primary ml-auto size-4" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="list-name">Name</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Enterprise CTOs"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this list is for…"
            />
          </div>

          {kind === "people" && (
            <div className="space-y-2">
              <Label htmlFor="list-assignee">{ac.assignTo}</Label>
              <AssigneePicker
                id="list-assignee"
                value={assigneeId}
                onChange={setAssigneeId}
                unassignedLabel={ac.unassigned}
              />
              <p className="text-muted-foreground text-xs">{ac.assignToHint}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((preset) => {
                const selected = preset === color
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-label={`Pick color ${preset}`}
                    aria-pressed={selected}
                    onClick={() => setColor(preset)}
                    style={{ backgroundColor: preset }}
                    className={cn(
                      "ring-offset-background focus-visible:ring-ring flex size-8 items-center justify-center rounded-full transition-transform outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      selected && "ring-foreground ring-2 ring-offset-2"
                    )}
                  >
                    {selected && (
                      <Check className="size-4 text-white" strokeWidth={3} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="volt" onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
