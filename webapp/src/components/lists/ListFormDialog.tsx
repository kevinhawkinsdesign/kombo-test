import * as React from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"

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
import { listStore } from "@/lib/store"
import type { ProspectList } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [color, setColor] = React.useState<string>(PRESET_COLORS[0])

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
      })
      toast.success("List updated")
    } else {
      listStore.create({
        name: trimmedName,
        description: description.trim(),
        color,
      })
      toast.success("List created")
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
          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
