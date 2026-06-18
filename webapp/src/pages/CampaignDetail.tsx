import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Mail,
  MessageSquare,
  MessageCircle,
  Camera,
  Pause,
  Play,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CampaignDailyChart } from "@/components/charts/Charts"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { AddCampaignProspectsDialog } from "@/components/campaigns/AddCampaignProspectsDialog"
import { getProspect } from "@/lib/mock-data"
import { useCampaigns, useLists, campaignStore } from "@/lib/store"
import { campaignDailyStats, campaignEnrollments } from "@/lib/mock-depth"
import { formatDate, relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type {
  CampaignStatus,
  StepChannel,
  EnrollmentStatus,
} from "@/lib/types"

const STATUS_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "outline" | "success"
> = {
  active: "success",
  paused: "secondary",
  draft: "outline",
  completed: "default",
}

const ENROLLMENT_VARIANT: Record<
  EnrollmentStatus,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  replied: "success",
  active: "default",
  completed: "secondary",
  paused: "outline",
  bounced: "destructive",
}

const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "active",
  "paused",
  "completed",
]

/* ------------------------------ channel meta ------------------------------ */
interface ChannelMeta {
  label: string
  tint: string
  Icon: React.ComponentType<{ className?: string }>
}

const CHANNELS: Record<StepChannel, ChannelMeta> = {
  email: { label: "Email", tint: "bg-primary/15 text-primary", Icon: Mail },
  sms: { label: "SMS", tint: "bg-chart-4/15 text-chart-4", Icon: MessageSquare },
  whatsapp: {
    label: "WhatsApp",
    tint: "bg-chart-1/15 text-chart-1",
    Icon: MessageCircle,
  },
  instagram: {
    label: "Instagram DM",
    tint: "bg-chart-5/15 text-chart-5",
    Icon: Camera,
  },
  linkedin_message: {
    label: "LinkedIn message",
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    Icon: LinkedinIcon,
  },
  linkedin_dm: {
    label: "LinkedIn DM",
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    Icon: LinkedinIcon,
  },
  linkedin_inmail: {
    label: "LinkedIn InMail",
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    Icon: LinkedinIcon,
  },
}

const CHANNEL_ORDER: StepChannel[] = [
  "email",
  "sms",
  "whatsapp",
  "instagram",
  "linkedin_message",
  "linkedin_dm",
  "linkedin_inmail",
]

// Tolerant lookup so previously-persisted localStorage data (e.g. the legacy
// "linkedin" channel, or any unknown value) still renders.
function channelMeta(channel: string): ChannelMeta {
  if (channel in CHANNELS) return CHANNELS[channel as StepChannel]
  if (channel === "linkedin") return CHANNELS.linkedin_message
  return CHANNELS.email
}

function normalizeChannel(channel: string): StepChannel {
  if (channel in CHANNELS) return channel as StepChannel
  if (channel === "linkedin") return "linkedin_message"
  return "email"
}

const POSITIVE_REPLIES = [
  "This is timely — we're actively evaluating tools in this space. Can you share availability this week?",
  "Interesting, the timing is good. Happy to take a quick look — send over a calendar link.",
  "Thanks for reaching out. We've felt this pain. Let's set up 20 minutes.",
  "Good note. We're scaling the team right now so this is relevant. What does onboarding look like?",
]

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export default function CampaignDetail() {
  const { id } = useParams()
  const campaigns = useCampaigns()
  const lists = useLists()
  const campaign = campaigns.find((c) => c.id === id)

  const [editOpen, setEditOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [attachListId, setAttachListId] = React.useState("")

  if (!campaign) {
    return (
      <Page>
        <p className="text-muted-foreground">Campaign not found.</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/campaigns">Back to campaigns</Link>
        </Button>
      </Page>
    )
  }

  const steps = campaign.steps
  const enrolledIds = campaign.enrolledIds ?? []

  const openRate = campaign.enrolled
    ? Math.round((campaign.opened / campaign.enrolled) * 100)
    : 0
  const replyRate = campaign.enrolled
    ? Math.round((campaign.replied / campaign.enrolled) * 100)
    : 0

  const daily = campaignDailyStats[campaign.id] ?? []
  const enrollments = campaignEnrollments[campaign.id] ?? []
  const replies = enrollments.filter((e) => e.status === "replied")

  const totals = daily.reduce(
    (acc, d) => ({
      sent: acc.sent + d.sent,
      opened: acc.opened + d.opened,
      replied: acc.replied + d.replied,
    }),
    { sent: 0, opened: 0, replied: 0 }
  )

  const attachedList = campaign.listId
    ? lists.find((l) => l.id === campaign.listId)
    : undefined

  // Manually-enrolled prospects, de-duped against the mock enrollments so a
  // prospect already shown in the enrollment table isn't listed twice.
  const enrollmentIds = new Set(enrollments.map((e) => e.prospectId))
  const manualProspects = enrolledIds
    .filter((pid) => !enrollmentIds.has(pid))
    .map(getProspect)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const hasProspects = enrollments.length > 0 || manualProspects.length > 0

  // Ids already enrolled (mock + manual) — excluded from the add dialog.
  const allEnrolledIds = new Set<string>([...enrollmentIds, ...enrolledIds])

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/campaigns">
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {campaign.name}
            </h1>
            <Badge
              variant={STATUS_VARIANT[campaign.status]}
              className="capitalize"
            >
              {campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Created {formatDate(campaign.createdAt)} · {steps.length} steps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              const nextStatus: CampaignStatus =
                campaign.status === "active" ? "paused" : "active"
              campaignStore.update(campaign.id, { status: nextStatus })
              toast.success(
                nextStatus === "paused"
                  ? `${campaign.name} paused`
                  : `${campaign.name} activated`
              )
            }}
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
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" />
            Add prospects
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Enrolled" value={campaign.enrolled} />
        <Kpi label="Open rate" value={`${openRate}%`} />
        <Kpi label="Reply rate" value={`${replyRate}%`} />
        <Kpi label="Meetings" value={campaign.meetings} />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sequence">Sequence</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily performance</CardTitle>
              <CardDescription>
                Sent, opened and replied per day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {daily.length > 0 ? (
                <div className="h-72">
                  <CampaignDailyChart
                    labels={daily.map((d) => shortDay(d.date))}
                    sent={daily.map((d) => d.sent)}
                    opened={daily.map((d) => d.opened)}
                    replied={daily.map((d) => d.replied)}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No daily data yet for this campaign.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Audience — 1-to-1 attached list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audience</CardTitle>
              <CardDescription>
                Attach a single prospect list to feed this campaign. The link is
                1-to-1; a dynamic list auto-enrolls new matching prospects as
                they're found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attachedList ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: attachedList.color }}
                    />
                    <div>
                      <Link
                        to={`/lists/${attachedList.id}`}
                        className="font-medium hover:underline"
                      >
                        {attachedList.name}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {attachedList.prospectIds.length} prospects
                        {attachedList.dynamic ? " · dynamic" : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      campaignStore.detachList(campaign.id)
                      toast.success(`Detached ${attachedList.name}`)
                    }}
                  >
                    <X className="size-4" />
                    Detach
                  </Button>
                </div>
              ) : lists.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={attachListId} onValueChange={setAttachListId}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Choose a list to attach" />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                          {l.campaignId && l.campaignId !== campaign.id
                            ? " (linked elsewhere)"
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!attachListId}
                    onClick={() => {
                      const target = lists.find((l) => l.id === attachListId)
                      campaignStore.attachList(campaign.id, attachListId)
                      setAttachListId("")
                      toast.success(
                        target ? `Attached ${target.name}` : "List attached"
                      )
                    }}
                  >
                    Attach
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No lists available to attach yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {totals.sent}
                  </p>
                  <p className="text-muted-foreground text-xs">Sent</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {totals.opened}
                  </p>
                  <p className="text-muted-foreground text-xs">Opened</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {totals.replied}
                  </p>
                  <p className="text-muted-foreground text-xs">Replied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sequence */}
        <TabsContent value="sequence" className="mt-4 space-y-4">
          {steps.length > 0 ? (
            <>
              <div className="space-y-3">
                {steps.map((step, i) => {
                  const meta = channelMeta(step.channel)
                  const isEmail = normalizeChannel(step.channel) === "email"
                  const sent = Math.max(
                    0,
                    campaign.enrolled - i * Math.round(campaign.enrolled * 0.12)
                  )
                  const opened = Math.round(sent * 0.62)
                  const replied = Math.round(opened * 0.24)
                  return (
                    <Card key={step.id}>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums">
                            {i + 1}
                          </span>
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg",
                              meta.tint
                            )}
                          >
                            <meta.Icon className="size-4" />
                          </span>
                          <Select
                            value={normalizeChannel(step.channel)}
                            onValueChange={(v) =>
                              campaignStore.updateStep(campaign.id, step.id, {
                                channel: v as StepChannel,
                              })
                            }
                          >
                            <SelectTrigger
                              size="sm"
                              className="w-[180px]"
                              aria-label={`Step ${i + 1} channel`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHANNEL_ORDER.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {CHANNELS[c].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Move step up"
                              disabled={i === 0}
                              onClick={() =>
                                campaignStore.moveStep(campaign.id, step.id, -1)
                              }
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Move step down"
                              disabled={i === steps.length - 1}
                              onClick={() =>
                                campaignStore.moveStep(campaign.id, step.id, 1)
                              }
                            >
                              <ArrowDown className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remove step"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                campaignStore.removeStep(campaign.id, step.id)
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            Wait
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={step.delayDays}
                            onChange={(e) =>
                              campaignStore.updateStep(campaign.id, step.id, {
                                delayDays: Math.max(
                                  0,
                                  Number(e.target.value) || 0
                                ),
                              })
                            }
                            className="h-8 w-16 tabular-nums"
                          />
                          <span className="text-muted-foreground text-sm">
                            days before sending
                          </span>
                        </div>

                        {isEmail && (
                          <Input
                            value={step.subject ?? ""}
                            placeholder="Subject line"
                            onChange={(e) =>
                              campaignStore.updateStep(campaign.id, step.id, {
                                subject: e.target.value,
                              })
                            }
                          />
                        )}

                        <Textarea
                          value={step.body}
                          placeholder="Message body"
                          onChange={(e) =>
                            campaignStore.updateStep(campaign.id, step.id, {
                              body: e.target.value,
                            })
                          }
                          className="min-h-20"
                        />

                        <Separator />

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                          <span className="text-muted-foreground">
                            Sent{" "}
                            <span className="text-foreground font-medium tabular-nums">
                              {sent}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            Opened{" "}
                            <span className="text-foreground font-medium tabular-nums">
                              {opened}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            Replied{" "}
                            <span className="text-foreground font-medium tabular-nums">
                              {replied}
                            </span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex items-center justify-between gap-2">
                <AddStepMenu
                  onAdd={(channel) =>
                    campaignStore.addStep(campaign.id, channel)
                  }
                />
                <Button onClick={() => toast.success("Sequence saved")}>
                  Save sequence
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  This sequence has no steps yet.
                </p>
                <AddStepMenu
                  onAdd={(channel) =>
                    campaignStore.addStep(campaign.id, channel)
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prospects */}
        <TabsContent value="prospects" className="mt-4">
          {hasProspects ? (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="pl-4">Prospect</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Title / Company
                      </TableHead>
                      <TableHead>Current step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Last touch
                      </TableHead>
                      <TableHead className="w-12 pr-4" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => {
                      const prospect = getProspect(e.prospectId)
                      return (
                        <TableRow key={e.prospectId}>
                          <TableCell className="pl-4">
                            {prospect ? (
                              <Link
                                to={`/prospects/${prospect.id}`}
                                className="flex items-center gap-3"
                              >
                                <ProspectAvatar prospect={prospect} />
                                <span className="truncate font-medium">
                                  {prospect.firstName} {prospect.lastName}
                                </span>
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">
                                Unknown prospect
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {prospect ? (
                              <>
                                <p className="text-muted-foreground text-sm">
                                  {prospect.title}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {prospect.company}
                                </p>
                              </>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            Step {e.currentStep} of {steps.length}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={ENROLLMENT_VARIANT[e.status]}
                              className="capitalize"
                            >
                              {e.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                            {relativeTime(e.lastTouch)}
                          </TableCell>
                          <TableCell className="pr-4" />
                        </TableRow>
                      )
                    })}
                    {manualProspects.map((prospect) => (
                      <TableRow key={prospect.id}>
                        <TableCell className="pl-4">
                          <Link
                            to={`/prospects/${prospect.id}`}
                            className="flex items-center gap-3"
                          >
                            <ProspectAvatar prospect={prospect} />
                            <span className="truncate font-medium">
                              {prospect.firstName} {prospect.lastName}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-muted-foreground text-sm">
                            {prospect.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {prospect.company}
                          </p>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          Step 1 of {steps.length}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ENROLLMENT_VARIANT.active}>
                            active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                          Just added
                        </TableCell>
                        <TableCell className="pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${prospect.firstName} ${prospect.lastName}`}
                            className="text-muted-foreground hover:text-destructive size-8"
                            onClick={() => {
                              campaignStore.removeProspect(
                                campaign.id,
                                prospect.id
                              )
                              toast.success("Removed from campaign")
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  No prospects enrolled yet.
                </p>
                <Button variant="outline" onClick={() => setAddOpen(true)}>
                  <UserPlus className="size-4" />
                  Add prospects
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Conversations */}
        <TabsContent value="conversations" className="mt-4 space-y-3">
          {replies.length > 0 ? (
            replies.map((e, i) => {
              const prospect = getProspect(e.prospectId)
              const reply = POSITIVE_REPLIES[i % POSITIVE_REPLIES.length]
              return (
                <Card key={e.prospectId}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      {prospect && (
                        <ProspectAvatar prospect={prospect} className="mt-0.5" />
                      )}
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium">
                          {prospect
                            ? `${prospect.firstName} ${prospect.lastName}`
                            : "Unknown prospect"}
                        </p>
                        <p className="text-muted-foreground text-sm">{reply}</p>
                        <p className="text-muted-foreground text-xs">
                          {relativeTime(e.lastTouch)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/inbox">View in inbox</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-sm">No replies yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <EditCampaignDialog
        key={campaign.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        campaignId={campaign.id}
        currentName={campaign.name}
        currentStatus={campaign.status}
      />

      <AddCampaignProspectsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        campaign={campaign}
        enrolledIds={allEnrolledIds}
      />
    </Page>
  )
}

/* ------------------------------ sub-components ----------------------------- */
function AddStepMenu({
  onAdd,
}: {
  onAdd: (channel: StepChannel) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Add step
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {CHANNEL_ORDER.map((c) => {
          const meta = CHANNELS[c]
          return (
            <DropdownMenuItem key={c} onClick={() => onAdd(c)}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-md",
                  meta.tint
                )}
              >
                <meta.Icon className="size-3.5" />
              </span>
              {meta.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EditCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  currentName,
  currentStatus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  currentName: string
  currentStatus: CampaignStatus
}) {
  const [name, setName] = React.useState(currentName)
  const [status, setStatus] = React.useState<CampaignStatus>(currentStatus)

  // Re-sync the form whenever the dialog opens.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(currentName)
      setStatus(currentStatus)
    }
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    campaignStore.update(campaignId, { name: trimmed, status })
    toast.success("Campaign updated")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit campaign</DialogTitle>
          <DialogDescription>
            Update the campaign name and status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="campaign-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Campaign name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="campaign-status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as CampaignStatus)}
            >
              <SelectTrigger id="campaign-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
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
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
