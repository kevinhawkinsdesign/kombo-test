import * as React from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Send,
  Download,
  Pencil,
  Trash2,
  X,
  Plus,
  Sparkles,
  RefreshCw,
  Zap,
  Search,
  Database,
  Pause,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
} from "@/components/common/ProspectBits"
import { ListFormDialog } from "@/components/lists/ListFormDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { getProspect, getCampaign } from "@/lib/mock-data"
import { useLists, useProspects, listStore } from "@/lib/store"
import { formatDate } from "@/lib/format"
import type { Prospect, ProspectList } from "@/lib/types"

export default function ListDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lists = useLists()
  const list = id ? lists.find((l) => l.id === id) : undefined

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)

  if (!list) {
    return (
      <Page>
        <p className="text-muted-foreground">List not found.</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/lists">Back to lists</Link>
        </Button>
      </Page>
    )
  }

  const members = list.prospectIds
    .map(getProspect)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/lists">
          <ArrowLeft className="size-4" />
          Lists
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 size-3 rounded-full"
            style={{ backgroundColor: list.color }}
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{list.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {list.description}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {members.length} prospects
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete list
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Exported to CSV")}
          >
            <Download className="size-4" />
            Export
          </Button>
          <Button onClick={() => toast.success(`${members.length} enrolled`)}>
            <Send className="size-4" />
            Start campaign
          </Button>
        </div>
      </div>

      {list.dynamic && <DynamicPlaylistPanel list={list} />}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Prospects</h3>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add prospects
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Prospect</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-12 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => navigate(`/prospects/${p.id}`)}
              >
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <ProspectAvatar prospect={p} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.title}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="font-medium">{p.company}</p>
                  <p className="text-muted-foreground text-xs">{p.location}</p>
                </TableCell>
                <TableCell>
                  <ScoreBadge score={p.score} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${p.firstName} ${p.lastName} from list`}
                    className="text-muted-foreground hover:text-destructive size-8"
                    onClick={(event) => {
                      event.stopPropagation()
                      listStore.removeProspect(list.id, p.id)
                      toast.success("Removed from list")
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  No prospects yet. Add some to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      <ListFormDialog open={editOpen} onOpenChange={setEditOpen} list={list} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete list?"
        description={`"${list.name}" will be permanently removed. Prospects stay in your workspace.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          listStore.remove(list.id)
          toast.success("List deleted")
          navigate("/lists")
        }}
      />

      <AddProspectsDialog open={addOpen} onOpenChange={setAddOpen} list={list} />
    </Page>
  )
}

function DynamicPlaylistPanel({ list }: { list: ProspectList }) {
  const campaign = list.campaignId ? getCampaign(list.campaignId) : undefined
  const criteriaChips = list.criteria
    ? [
        ...list.criteria.titles,
        ...list.criteria.seniority,
        ...list.criteria.industries,
        ...list.criteria.headcount,
        ...list.criteria.locations,
        ...list.criteria.signals,
      ]
    : []
  const shown = criteriaChips.slice(0, 6)
  const extra = criteriaChips.length - shown.length

  return (
    <Card className="border-primary/20 from-primary/[0.04] to-card mb-6 gap-0 overflow-hidden bg-gradient-to-br p-0">
      <div className="flex flex-wrap items-center gap-2 border-b p-4">
        <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
          <Sparkles className="size-4" />
        </span>
        <span className="font-medium">Dynamic playlist</span>
        <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
          <span className="relative flex size-1.5">
            <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
            <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
          </span>
          Live
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => toast("Inflow paused — no new prospects will be added")}
        >
          <Pause className="size-4" />
          Pause inflow
        </Button>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Search className="size-3.5" />
            Audience
          </p>
          <div className="flex flex-wrap gap-1">
            {shown.map((c) => (
              <Badge key={c} variant="secondary" className="font-normal">
                {c}
              </Badge>
            ))}
            {extra > 0 && (
              <Badge variant="outline" className="font-normal">
                +{extra}
              </Badge>
            )}
            {shown.length === 0 && (
              <span className="text-muted-foreground text-sm">
                {list.criteria?.keywords || "All prospects"}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Database className="size-3.5" />
            Enrichment
          </p>
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <RefreshCw className="text-primary size-3.5" />
            {list.enrichment === "continuous"
              ? "Kept fresh continuously"
              : "Enriched once on add"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Send className="size-3.5" />
            Outreach
          </p>
          {campaign ? (
            <p className="text-sm">
              <Link
                to={`/campaigns/${campaign.id}`}
                className="font-medium hover:underline"
              >
                {campaign.name}
              </Link>
              <span className="text-muted-foreground block text-xs">
                {list.sendMode === "continuous"
                  ? "Auto-enrolls new prospects"
                  : "One-time send"}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">No sequence attached</p>
          )}
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 border-t px-4 py-2.5 text-xs">
        {typeof list.newPerWeek === "number" && (
          <span className="text-foreground flex items-center gap-1 font-medium">
            <Zap className="text-chart-4 size-3.5" />~{list.newPerWeek} new
            prospects / week
          </span>
        )}
        {list.lastSyncedAt && (
          <>
            <span>·</span>
            <span>Last synced {formatDate(list.lastSyncedAt)}</span>
          </>
        )}
      </div>
    </Card>
  )
}

function AddProspectsDialog({
  open,
  onOpenChange,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: ProspectList
}) {
  const prospects = useProspects()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  // Reset the selection whenever the dialog transitions to open (adjusting
  // state during render — the React-recommended pattern).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSelected(new Set())
  }

  const memberIds = React.useMemo(
    () => new Set(list.prospectIds),
    [list.prospectIds]
  )
  const candidates = React.useMemo(
    () => prospects.filter((p) => !memberIds.has(p.id)),
    [prospects, memberIds]
  )

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
    listStore.addProspects(list.id, ids)
    toast.success(
      `${ids.length} ${ids.length === 1 ? "prospect" : "prospects"} added`
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add prospects</DialogTitle>
          <DialogDescription>
            Select prospects to add to “{list.name}”.
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Every prospect is already in this list.
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
  const checkboxId = `add-prospect-${prospect.id}`
  return (
    <label
      htmlFor={checkboxId}
      className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
    >
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={onToggle}
      />
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
