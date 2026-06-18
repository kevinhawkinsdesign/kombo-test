import * as React from "react"
import { toast } from "sonner"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProspectAvatar,
  ScoreBadge,
} from "@/components/common/ProspectBits"
import { useProspects, campaignStore } from "@/lib/store"
import type { Campaign, Prospect } from "@/lib/types"

export function AddCampaignProspectsDialog({
  open,
  onOpenChange,
  campaign,
  enrolledIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign
  enrolledIds: Set<string>
}) {
  const prospects = useProspects()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [query, setQuery] = React.useState("")

  // Reset selection and search whenever the dialog opens (adjust state during
  // render — the React-recommended pattern).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSelected(new Set())
      setQuery("")
    }
  }

  const candidates = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return prospects.filter((p) => {
      if (enrolledIds.has(p.id)) return false
      if (!q) return true
      const haystack =
        `${p.firstName} ${p.lastName} ${p.title} ${p.company}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [prospects, enrolledIds, query])

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAdd() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    campaignStore.addProspects(campaign.id, ids)
    toast.success(
      `${ids.length} ${ids.length === 1 ? "prospect" : "prospects"} enrolled`
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add prospects</DialogTitle>
          <DialogDescription>
            Search and enroll prospects into “{campaign.name}”.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, title or company"
            className="pl-9"
            aria-label="Search prospects"
          />
        </div>

        {candidates.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {query.trim()
              ? "No prospects match your search."
              : "Every prospect is already enrolled."}
          </p>
        ) : (
          <div className="-mx-1 max-h-80 space-y-1 overflow-y-auto px-1">
            {candidates.map((p) => (
              <ProspectRow
                key={p.id}
                prospect={p}
                checked={selected.has(p.id)}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selected.size === 0}>
            Add selected
            {selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProspectRow({
  prospect,
  checked,
  onToggle,
}: {
  prospect: Prospect
  checked: boolean
  onToggle: () => void
}) {
  const checkboxId = `enroll-prospect-${prospect.id}`
  return (
    <label
      htmlFor={checkboxId}
      className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
    >
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={onToggle} />
      <ProspectAvatar prospect={prospect} className="size-8" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {prospect.firstName} {prospect.lastName}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {prospect.title} · {prospect.company}
        </p>
      </div>
      <ScoreBadge score={prospect.score} />
    </label>
  )
}
