import * as React from "react"
import { toast } from "sonner"
import { Mail, Plus, Radio } from "lucide-react"

import { FeatureIntro } from "@/components/common/FeatureIntro"
import { InfoHint } from "@/components/common/InfoHint"
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
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    statusLabel: {
      active: "Active",
      warming: "Warming",
      paused: "Paused",
    } as Record<ChannelStatus, string>,
    dailySending: "Daily sending",
    warmup: "Warmup",
    warmupHintLabel: "What is warmup?",
    warmupHint:
      "Gradually ramping a new mailbox's send volume so inbox providers trust it and your emails avoid spam.",
    health: "Health",
    healthHintLabel: "What is sender health?",
    healthHint:
      "A measure of deliverability — how likely this account's messages are to land in the inbox rather than spam or bounce.",
    sending: "Sending",
    toggleAria: (label: string) => `Toggle sending for ${label}`,
    channelPaused: (label: string) => `${label} paused`,
    channelResumed: (label: string) => `${label} resumed`,
    sentToday: "Sent today",
    dailyCapacity: "Daily capacity",
    activeChannels: "Active channels",
    avgHealth: "Avg. health",
    pageTitle: "Sending Channels",
    pageDescription:
      "Mailboxes and LinkedIn accounts your campaigns send from.",
    connectChannel: "Connect channel",
    connectSoon: "Connect channel — coming soon",
    introTitle: "Connect your sending channels",
    introDescription:
      "Add the mailboxes and LinkedIn accounts your campaigns send from — and keep them healthy.",
    introPoints: [
      "Warm up new mailboxes automatically",
      "Monitor deliverability & sender health",
      "Set per-channel daily limits",
    ],
  },
  es: {
    statusLabel: {
      active: "Activo",
      warming: "Calentando",
      paused: "En pausa",
    } as Record<ChannelStatus, string>,
    dailySending: "Envío diario",
    warmup: "Calentamiento",
    warmupHintLabel: "¿Qué es el calentamiento?",
    warmupHint:
      "Aumentar gradualmente el volumen de envío de un buzón nuevo para que los proveedores de correo confíen en él y tus mensajes no acaben en spam.",
    health: "Salud",
    healthHintLabel: "¿Qué es la salud del remitente?",
    healthHint:
      "Una medida de la entregabilidad: la probabilidad de que los mensajes de esta cuenta lleguen a la bandeja de entrada en lugar de a spam o rebotar.",
    sending: "Envío",
    toggleAria: (label: string) => `Activar o desactivar el envío de ${label}`,
    channelPaused: (label: string) => `${label} en pausa`,
    channelResumed: (label: string) => `${label} reanudado`,
    sentToday: "Enviados hoy",
    dailyCapacity: "Capacidad diaria",
    activeChannels: "Canales activos",
    avgHealth: "Salud media",
    pageTitle: "Canales de envío",
    pageDescription:
      "Buzones y cuentas de LinkedIn desde los que envían tus campañas.",
    connectChannel: "Conectar canal",
    connectSoon: "Conectar canal — próximamente",
    introTitle: "Conecta tus canales de envío",
    introDescription:
      "Añade los buzones y las cuentas de LinkedIn desde los que envían tus campañas y mantenlos en buen estado.",
    introPoints: [
      "Calienta buzones nuevos automáticamente",
      "Supervisa la entregabilidad y la salud del remitente",
      "Define límites diarios por canal",
    ],
  },
} as const

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
  const { locale } = useLocale()
  const c = COPY[locale]
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
            {c.statusLabel[channel.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{c.dailySending}</span>
            <span className="tabular-nums">
              {channel.sentToday} / {channel.dailyLimit}
            </span>
          </div>
          <Progress value={sendingPct} />
        </div>

        {channel.status === "warming" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                {c.warmup}
                <InfoHint label={c.warmupHintLabel}>{c.warmupHint}</InfoHint>
              </span>
              <span className="tabular-nums">{channel.warmupPct}%</span>
            </div>
            <Progress value={channel.warmupPct} />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            {c.health}
            <InfoHint label={c.healthHintLabel}>{c.healthHint}</InfoHint>
          </span>
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
        <span className="text-sm font-medium">{c.sending}</span>
        <Switch
          checked={channel.status !== "paused"}
          onCheckedChange={() => onToggle(channel.id)}
          aria-label={c.toggleAria(channel.label)}
        />
      </CardFooter>
    </Card>
  )
}

export default function Channels() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [channels, setChannels] =
    React.useState<SendingChannel[]>(sendingChannels)

  const sentToday = channels.reduce((a, ch) => a + ch.sentToday, 0)
  const dailyCapacity = channels.reduce((a, ch) => a + ch.dailyLimit, 0)
  const activeCount = channels.filter((ch) => ch.status === "active").length
  const avgHealth = channels.length
    ? Math.round(
        channels.reduce((a, ch) => a + ch.health, 0) / channels.length
      )
    : 0

  const summary = [
    { label: c.sentToday, value: String(sentToday) },
    { label: c.dailyCapacity, value: String(dailyCapacity) },
    { label: c.activeChannels, value: String(activeCount) },
    { label: c.avgHealth, value: `${avgHealth}%` },
  ]

  function toggle(id: string) {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== id) return ch
        const status: ChannelStatus =
          ch.status === "paused" ? "active" : "paused"
        toast(
          status === "paused"
            ? c.channelPaused(ch.label)
            : c.channelResumed(ch.label)
        )
        return { ...ch, status }
      })
    )
  }

  return (
    <Page>
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
        action={
          <Button variant="volt" onClick={() => toast.info(c.connectSoon)}>
            <Plus className="size-4" />
            {c.connectChannel}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="channels"
        icon={Radio}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
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
