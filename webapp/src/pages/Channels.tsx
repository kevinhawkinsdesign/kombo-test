import * as React from "react"
import { toast } from "sonner"
import { Mail, Plus } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  sendingChannels,
  type ChannelStatus,
  type SendingChannel,
} from "@/lib/mock-network"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<ChannelStatus, string> = {
  active: "Active",
  warming: "Warming",
  paused: "Paused",
}

const STATUS_VARIANTS: Record<
  ChannelStatus,
  "success" | "secondary" | "outline"
> = {
  active: "success",
  warming: "secondary",
  paused: "outline",
}

function healthPill(health: number): string {
  if (health >= 90) return "bg-chart-1/15 text-chart-1"
  if (health >= 75) return "bg-chart-4/15 text-chart-4"
  return "bg-muted text-muted-foreground"
}

function ChannelCard({
  channel,
  onToggle,
}: {
  channel: SendingChannel
  onToggle: (id: string) => void
}) {
  const Icon = channel.type === "linkedin" ? LinkedinIcon : Mail
  const tint =
    channel.type === "linkedin"
      ? "bg-chart-1/15 text-chart-1"
      : "bg-chart-2/15 text-chart-2"
  const sendingPct =
    channel.dailyLimit > 0
      ? (channel.sentToday / channel.dailyLimit) * 100
      : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              tint
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate font-medium">
              {channel.label}
            </CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="secondary" className="font-normal">
                {channel.provider}
              </Badge>
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANTS[channel.status]}>
            {STATUS_LABELS[channel.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily sending</span>
            <span className="tabular-nums">
              {channel.sentToday} / {channel.dailyLimit}
            </span>
          </div>
          <Progress value={sendingPct} />
        </div>

        {channel.status === "warming" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Warmup</span>
              <span className="tabular-nums">{channel.warmupPct}%</span>
            </div>
            <Progress value={channel.warmupPct} />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Health</span>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
              healthPill(channel.health)
            )}
          >
            {channel.health}
          </span>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="justify-between">
        <span className="text-sm font-medium">Sending</span>
        <Switch
          checked={channel.status !== "paused"}
          onCheckedChange={() => onToggle(channel.id)}
          aria-label={`Toggle sending for ${channel.label}`}
        />
      </CardFooter>
    </Card>
  )
}

export default function Channels() {
  const [channels, setChannels] =
    React.useState<SendingChannel[]>(sendingChannels)

  const sentToday = channels.reduce((a, c) => a + c.sentToday, 0)
  const dailyCapacity = channels.reduce((a, c) => a + c.dailyLimit, 0)
  const activeCount = channels.filter((c) => c.status === "active").length
  const avgHealth = channels.length
    ? Math.round(
        channels.reduce((a, c) => a + c.health, 0) / channels.length
      )
    : 0

  const summary = [
    { label: "Sent today", value: String(sentToday) },
    { label: "Daily capacity", value: String(dailyCapacity) },
    { label: "Active channels", value: String(activeCount) },
    { label: "Avg. health", value: `${avgHealth}%` },
  ]

  function toggle(id: string) {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const status: ChannelStatus =
          c.status === "paused" ? "active" : "paused"
        toast(status === "paused" ? `${c.label} paused` : `${c.label} resumed`)
        return { ...c, status }
      })
    )
  }

  return (
    <Page>
      <PageHeading
        title="Sending Channels"
        description="Mailboxes and LinkedIn accounts your campaigns send from."
        action={
          <Button onClick={() => toast.info("Connect channel — coming soon")}>
            <Plus className="size-4" />
            Connect channel
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {summary.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Channels */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} onToggle={toggle} />
        ))}
      </div>
    </Page>
  )
}
