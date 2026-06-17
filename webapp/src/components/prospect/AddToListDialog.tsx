import * as React from "react"
import { Plus, Check } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prospectLists } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function AddToListDialog({
  open,
  onOpenChange,
  count,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  onAdded: (listName: string) => void
}) {
  const [creating, setCreating] = React.useState(false)
  const [newName, setNewName] = React.useState("")

  function handleAdd(name: string) {
    onAdded(name)
    onOpenChange(false)
    setCreating(false)
    setNewName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to list</DialogTitle>
          <DialogDescription>
            Add {count} {count === 1 ? "prospect" : "prospects"} to a list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          {prospectLists.map((list) => (
            <button
              key={list.id}
              onClick={() => handleAdd(list.name)}
              className="hover:bg-muted/60 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: list.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{list.name}</p>
                <p className="text-muted-foreground text-xs">
                  {list.prospectIds.length} prospects
                </p>
              </div>
              <Check className="text-muted-foreground size-4 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {creating ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New list name"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim())
                  handleAdd(newName.trim())
              }}
            />
            <Button
              disabled={!newName.trim()}
              onClick={() => handleAdd(newName.trim())}
            >
              Create
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className={cn("w-full justify-start")}
            onClick={() => setCreating(true)}
          >
            <Plus className="size-4" />
            Create new list
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
