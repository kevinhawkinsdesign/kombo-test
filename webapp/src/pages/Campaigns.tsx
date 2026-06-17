import { Link } from "react-router-dom"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { campaigns } from "@/lib/mock-data"
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

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const replyRate = campaign.enrolled
    ? Math.round((campaign.replied / campaign.enrolled) * 100)
    : 0
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
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(
                campaign.status === "active"
                  ? `${campaign.name} paused`
                  : `${campaign.name} activated`
              )
            }
          >
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
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/campaigns/${campaign.id}`}>Edit sequence</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Duplicated")}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => toast.info("Archived")}
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

export default function Campaigns() {
  return (
    <Page>
      <PageHeading
        title="Campaigns"
        description="Multi-channel sequences across email and LinkedIn."
        action={
          <Button onClick={() => toast.info("New campaign — coming soon")}>
            <Plus className="size-4" />
            New campaign
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
      </div>
    </Page>
  )
}
