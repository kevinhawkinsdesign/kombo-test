import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Plus, Mail, Play, Pause, MoreHorizontal, Clock } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useCampaigns, campaignStore } from "@/lib/store"
import { formatDate } from "@/lib/format"
import type { Campaign, CampaignStatus } from "@/lib/types"

const STATUS_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "outline" | "success"
> = {
  active: "success",
  paused: "secondary",
  draft: "outline",
  completed: "default",
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  )
}

function CampaignCard({
  campaign,
  onDuplicate,
  onDelete,
}: {
  campaign: Campaign
  onDuplicate: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}) {
  const replyRate = campaign.enrolled
    ? Math.round((campaign.replied / campaign.enrolled) * 100)
    : 0

  function toggleStatus() {
    const nextStatus: CampaignStatus =
      campaign.status === "active" ? "paused" : "active"
    campaignStore.update(campaign.id, { status: nextStatus })
    toast.success(
      nextStatus === "paused"
        ? `${campaign.name} paused`
        : `${campaign.name} activated`
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              <Link
                to={`/campaigns/${campaign.id}`}
                className="hover:text-primary"
              >
                {campaign.name}
              </Link>
            </CardTitle>
            <Badge
              variant={STATUS_VARIANT[campaign.status]}
              className="capitalize"
            >
              {campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Created {formatDate(campaign.createdAt)} · {campaign.steps.length}{" "}
            steps
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={toggleStatus}>
            {campaign.status === "active" ? (
              <>
                <Pause className="size-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-4" />
                Activate
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Campaign options">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/campaigns/${campaign.id}`}>Edit sequence</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(campaign)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(campaign)}
              >
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          <Metric label="Enrolled" value={campaign.enrolled} />
          <Metric label="Opened" value={campaign.opened} />
          <Metric label="Replied" value={`${replyRate}%`} />
          <Metric label="Meetings" value={campaign.meetings} />
        </div>

        {campaign.steps.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              {campaign.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 text-sm">
                  <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {i + 1}
                  </span>
                  {step.channel === "email" ? (
                    <Mail className="text-muted-foreground size-4" />
                  ) : (
                    <LinkedinIcon className="text-muted-foreground size-4" />
                  )}
                  <span className="truncate">
                    {step.subject ?? step.body}
                  </span>
                  {step.delayDays > 0 && (
                    <span className="text-muted-foreground ml-auto flex shrink-0 items-center gap-1 text-xs">
                      <Clock className="size-3" />+{step.delayDays}d
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CreateCampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const [name, setName] = React.useState("")

  // Reset the form whenever the dialog transitions to open. Adjusting state
  // during render is the React-recommended pattern over a cascading effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName("")
    }
  }

  const trimmedName = name.trim()

  function handleCreate() {
    if (!trimmedName) return
    const campaign = campaignStore.create({ name: trimmedName })
    toast.success("Campaign created")
    onOpenChange(false)
    navigate(`/campaigns/${campaign.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New campaign</DialogTitle>
          <DialogDescription>
            Give your campaign a name to get started.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleCreate()
          }}
          className="space-y-2"
        >
          <Label htmlFor="campaign-name">Campaign name</Label>
          <Input
            id="campaign-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Q3 outbound — VP Sales"
            autoFocus
          />
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmedName}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Campaigns() {
  const campaigns = useCampaigns()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState<Campaign | null>(
    null
  )

  function handleDuplicate(campaign: Campaign) {
    campaignStore.create({ ...campaign, name: `${campaign.name} (copy)` })
    toast.success("Campaign duplicated")
  }

  function handleDelete() {
    if (!pendingDelete) return
    campaignStore.remove(pendingDelete.id)
    toast.success("Campaign deleted")
  }

  return (
    <Page>
      <PageHeading
        title="Campaigns"
        description="Multi-channel sequences across email and LinkedIn."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New campaign
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {campaigns.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            onDuplicate={handleDuplicate}
            onDelete={setPendingDelete}
          />
        ))}
      </div>

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete campaign?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" and its sequence will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </Page>
  )
}
