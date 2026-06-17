import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Mail,
  Pause,
  Play,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
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
import { CampaignDailyChart } from "@/components/charts/Charts"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { campaigns, getProspect } from "@/lib/mock-data"
import { campaignDailyStats, campaignEnrollments } from "@/lib/mock-depth"
import { formatDate, relativeTime } from "@/lib/format"
import type {
  CampaignStatus,
  CampaignStep,
  Channel,
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

function ChannelIcon({ channel }: { channel: Channel }) {
  return channel === "email" ? (
    <Mail className="text-muted-foreground size-4" />
  ) : (
    <LinkedinIcon className="text-muted-foreground size-4" />
  )
}

let stepCounter = 0
function newStepId(): string {
  stepCounter += 1
  return `s_new_${stepCounter}`
}

export default function CampaignDetail() {
  const { id } = useParams()
  const campaign = campaigns.find((c) => c.id === id)

  const [steps, setSteps] = React.useState<CampaignStep[]>(
    () => campaign?.steps.map((s) => ({ ...s })) ?? []
  )

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

  function updateStep(stepId: string, patch: Partial<CampaignStep>) {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s))
    )
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSteps((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next
    })
  }

  function removeStep(stepId: string) {
    setSteps((prev) => prev.filter((s) => s.id !== stepId))
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      {
        id: newStepId(),
        channel: "email",
        delayDays: prev.length === 0 ? 0 : 3,
        subject: "",
        body: "",
      },
    ])
  }

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
            <h2 className="text-2xl font-semibold tracking-tight">
              {campaign.name}
            </h2>
            <Badge
              variant={STATUS_VARIANT[campaign.status]}
              className="capitalize"
            >
              {campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Created {formatDate(campaign.createdAt)} · {campaign.steps.length}{" "}
            steps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
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
          <Button
            variant="outline"
            onClick={() => toast.info("Edit campaign — coming soon")}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Add prospects — coming soon")}
          >
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
                  const sent = Math.max(
                    0,
                    campaign.enrolled - i * Math.round(campaign.enrolled * 0.12)
                  )
                  const opened = Math.round(sent * 0.62)
                  const replied = Math.round(opened * 0.24)
                  return (
                    <Card key={step.id}>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums">
                            {i + 1}
                          </span>
                          <ChannelIcon channel={step.channel} />
                          <span className="text-muted-foreground text-sm capitalize">
                            {step.channel}
                          </span>
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Move step up"
                              disabled={i === 0}
                              onClick={() => moveStep(i, -1)}
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Move step down"
                              disabled={i === steps.length - 1}
                              onClick={() => moveStep(i, 1)}
                            >
                              <ArrowDown className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remove step"
                              onClick={() => removeStep(step.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            Wait
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={step.delayDays}
                            onChange={(e) =>
                              updateStep(step.id, {
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

                        {step.channel === "email" && (
                          <Input
                            value={step.subject ?? ""}
                            placeholder="Subject line"
                            onChange={(e) =>
                              updateStep(step.id, { subject: e.target.value })
                            }
                          />
                        )}

                        <Textarea
                          value={step.body}
                          placeholder="Message body"
                          onChange={(e) =>
                            updateStep(step.id, { body: e.target.value })
                          }
                          className="min-h-20"
                        />

                        <Separator />

                        <div className="flex gap-6 text-xs">
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
                <Button variant="outline" onClick={addStep}>
                  <Plus className="size-4" />
                  Add step
                </Button>
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
                <Button variant="outline" onClick={addStep}>
                  <Plus className="size-4" />
                  Add step
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prospects */}
        <TabsContent value="prospects" className="mt-4">
          {enrollments.length > 0 ? (
            <Card className="overflow-hidden p-0">
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
                          Step {e.currentStep} of {campaign.steps.length}
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
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  No prospects enrolled yet.
                </p>
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
                        <p className="text-muted-foreground text-sm">
                          {reply}
                        </p>
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
    </Page>
  )
}
