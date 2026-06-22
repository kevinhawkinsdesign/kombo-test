import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Mail,
  Phone,
  Send,
  Sparkles,
  Video,
  X,
  ExternalLink,
  Repeat,
  Building2,
  MapPin,
  Users,
  CircleDollarSign,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { getProspect } from "@/lib/mock-data"
import {
  copilotActions,
  SIGNAL_TONES,
  type CopilotAction,
  type SequenceChannel,
  type SequenceStep,
} from "@/lib/mock-copilot"
import { cn } from "@/lib/utils"

const AUTOPILOT_COUNT = 8

const COPY = {
  en: {
    groupRecent: "Recently added",
    groupDue: "Due",
    channelVideo: "Video",
    channelEmail: "Email",
    channelLinkedin: "LinkedIn",
    channelCall: "Call",
    immediately: "Immediately",
    day1: "Day 1",
    afterDays: (days: number) => `After ${days} days`,
    title: "Signals",
    pendingActions: "Pending actions",
    onAutopilot: "On autopilot",
    autopilotBody: (count: number) =>
      `Kai is running ${count} low-risk steps automatically. Nothing needs your attention here.`,
    noPending: "No pending actions.",
    backToActions: "Back to actions",
    newLead: "New lead",
    viewProfile: "View profile",
    companyDetails: "Company details",
    industry: "Industry",
    location: "Location",
    headcount: "Headcount",
    revenue: "Revenue",
    signalDetails: "Signal details",
    recommendedSequence: "Recommended sequence",
    steps: "steps",
    mailboxRotation: "Mailbox rotation",
    dismiss: "Dismiss",
    sendSequence: "Send sequence",
    dismissed: "Dismissed",
    sequenceSent: (firstName: string) => `Sequence sent to ${firstName}`,
    allCaughtUp: "You're all caught up",
    kaiSurfaces: "Kai will surface new signals as they happen.",
  },
  es: {
    groupRecent: "Añadidos recientemente",
    groupDue: "Pendientes",
    channelVideo: "Vídeo",
    channelEmail: "Correo",
    channelLinkedin: "LinkedIn",
    channelCall: "Llamada",
    immediately: "Inmediatamente",
    day1: "Día 1",
    afterDays: (days: number) => `Tras ${days} días`,
    title: "Señales",
    pendingActions: "Acciones pendientes",
    onAutopilot: "En piloto automático",
    autopilotBody: (count: number) =>
      `Kai está ejecutando ${count} pasos de bajo riesgo automáticamente. No necesitas hacer nada aquí.`,
    noPending: "No hay acciones pendientes.",
    backToActions: "Volver a las acciones",
    newLead: "Nuevo lead",
    viewProfile: "Ver perfil",
    companyDetails: "Detalles de la empresa",
    industry: "Sector",
    location: "Ubicación",
    headcount: "Empleados",
    revenue: "Ingresos",
    signalDetails: "Detalles de la señal",
    recommendedSequence: "Secuencia recomendada",
    steps: "pasos",
    mailboxRotation: "Rotación de buzones",
    dismiss: "Descartar",
    sendSequence: "Enviar secuencia",
    dismissed: "Descartado",
    sequenceSent: (firstName: string) => `Secuencia enviada a ${firstName}`,
    allCaughtUp: "Estás al día",
    kaiSurfaces: "Kai mostrará nuevas señales a medida que ocurran.",
  },
} as const

const GROUP_ORDER: CopilotAction["group"][] = ["recent", "due"]

const CHANNEL_TINT: Record<SequenceChannel, string> = {
  video: "bg-chart-3/15 text-chart-3",
  email: "bg-primary/15 text-primary",
  linkedin: "bg-chart-2/15 text-chart-2",
  call: "bg-chart-1/15 text-chart-1",
}

function ChannelGlyph({
  channel,
  className,
}: {
  channel: SequenceChannel
  className?: string
}) {
  switch (channel) {
    case "video":
      return <Video className={className} />
    case "email":
      return <Mail className={className} />
    case "linkedin":
      return <LinkedinIcon className={className} />
    case "call":
      return <Phone className={className} />
  }
}

function delayLabel(
  delayDays: number,
  c: (typeof COPY)[keyof typeof COPY]
): string {
  if (delayDays <= 0) return c.immediately
  if (delayDays === 1) return c.day1
  return c.afterDays(delayDays)
}

/** Colored signal pill with a leading tone dot. */
function SignalPill({
  signal,
  className,
}: {
  signal: CopilotAction["signal"]
  className?: string
}) {
  const tone = SIGNAL_TONES[signal.tone]
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        tone.pill,
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", tone.dot)} />
      <span className="truncate">{signal.label}</span>
    </span>
  )
}

function CompanyChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-muted/40 flex items-start gap-2 rounded-lg border px-3 py-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function SequenceTimeline({ steps }: { steps: SequenceStep[] }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const channelLabel: Record<SequenceChannel, string> = {
    video: c.channelVideo,
    email: c.channelEmail,
    linkedin: c.channelLinkedin,
    call: c.channelCall,
  }
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <span
                aria-hidden="true"
                className="bg-border absolute top-9 left-[15px] h-[calc(100%-2rem)] w-px"
              />
            )}
            <span
              className={cn(
                "z-10 flex size-8 shrink-0 items-center justify-center rounded-md",
                CHANNEL_TINT[step.channel]
              )}
            >
              <ChannelGlyph channel={step.channel} className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {index + 1}. {step.title}
                </span>
                <Badge
                  variant="outline"
                  className="text-muted-foreground gap-1 font-normal"
                >
                  {channelLabel[step.channel]}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {delayLabel(step.delayDays, c)}
                </span>
              </div>
              {step.body && (
                <p className="bg-muted/50 text-muted-foreground mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed">
                  {step.body}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function Copilot() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const groupLabels: Record<CopilotAction["group"], string> = {
    recent: c.groupRecent,
    due: c.groupDue,
  }
  const [pending, setPending] = React.useState<CopilotAction[]>(copilotActions)
  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    copilotActions[0]?.id
  )
  const [tab, setTab] = React.useState<"pending" | "autopilot">("pending")
  // On mobile we show either the list or the detail (master-detail).
  const [showDetailMobile, setShowDetailMobile] = React.useState(false)

  const selected =
    pending.find((a) => a.id === selectedId) ?? pending[0] ?? undefined
  const prospect = selected ? getProspect(selected.prospectId) : undefined

  const grouped = React.useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        actions: pending.filter((a) => a.group === group),
      })).filter((g) => g.actions.length > 0),
    [pending]
  )

  /** Remove an action and select the most sensible next one. */
  const removeAction = React.useCallback((id: string) => {
    setPending((prev) => {
      const index = prev.findIndex((a) => a.id === id)
      const next = prev.filter((a) => a.id !== id)
      setSelectedId((current) => {
        if (current !== id) return current ?? next[0]?.id
        if (next.length === 0) return undefined
        const fallback = next[Math.min(index, next.length - 1)]
        return fallback?.id
      })
      return next
    })
    setShowDetailMobile(false)
  }, [])

  function selectAction(id: string) {
    setSelectedId(id)
    setShowDetailMobile(true)
  }

  function dismiss(action: CopilotAction) {
    removeAction(action.id)
    toast.info(c.dismissed)
  }

  function send(action: CopilotAction, firstName: string) {
    removeAction(action.id)
    toast.success(c.sequenceSent(firstName))
  }

  return (
    <div className="flex h-[calc(100svh-4rem)]">
      {/* List pane */}
      <div
        className={cn(
          "w-full flex-col border-r md:flex md:w-96 md:max-w-md md:shrink-0",
          showDetailMobile ? "hidden md:flex" : "flex"
        )}
      >
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            <h2 className="font-semibold">{c.title}</h2>
          </div>
          <div className="bg-muted text-muted-foreground inline-flex h-9 w-full items-center rounded-lg p-[3px]">
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={cn(
                "flex h-full flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium transition-colors",
                tab === "pending"
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:text-foreground"
              )}
            >
              {c.pendingActions}
              <Badge variant="secondary" className="px-1.5 font-normal">
                {pending.length}
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => setTab("autopilot")}
              className={cn(
                "flex h-full flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium transition-colors",
                tab === "autopilot"
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:text-foreground"
              )}
            >
              {c.onAutopilot}
              <Badge variant="secondary" className="px-1.5 font-normal">
                {AUTOPILOT_COUNT}
              </Badge>
            </button>
          </div>
        </div>

        {tab === "autopilot" ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-muted/40 text-muted-foreground flex items-start gap-3 rounded-lg border p-4 text-sm">
              <Sparkles className="text-primary mt-0.5 size-4 shrink-0" />
              <p>{c.autopilotBody(AUTOPILOT_COUNT)}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {grouped.length === 0 ? (
              <div className="text-muted-foreground p-6 text-center text-sm">
                {c.noPending}
              </div>
            ) : (
              grouped.map(({ group, actions }) => (
                <div key={group}>
                  <div className="text-muted-foreground flex items-center justify-between px-4 pt-4 pb-1 text-[11px] font-medium tracking-wide uppercase">
                    <span>{groupLabels[group]}</span>
                    <span>{actions.length}</span>
                  </div>
                  {actions.map((action) => {
                    const p = getProspect(action.prospectId)
                    if (!p) return null
                    const isActive = action.id === selected?.id
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => selectAction(action.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                          isActive ? "bg-muted/60" : "hover:bg-muted/40"
                        )}
                      >
                        <ProspectAvatar prospect={p} className="size-9" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {p.title} · {p.company}
                          </p>
                        </div>
                        <SignalPill
                          signal={action.signal}
                          className="max-w-[7.5rem] shrink-0"
                        />
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detail pane */}
      {selected && prospect ? (
        <div
          className={cn(
            "min-w-0 flex-1 flex-col",
            showDetailMobile ? "flex" : "hidden md:flex"
          )}
        >
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-5 py-4">
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 md:hidden"
                onClick={() => setShowDetailMobile(false)}
                aria-label={c.backToActions}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <ProspectAvatar prospect={prospect} className="size-10" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">
                    {prospect.firstName} {prospect.lastName}
                  </span>
                  <Badge variant="secondary" className="font-normal">
                    {c.newLead}
                  </Badge>
                </div>
                <p className="text-muted-foreground truncate text-sm">
                  {prospect.title} @ {prospect.company}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/prospects/${prospect.id}`}>
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">{c.viewProfile}</span>
                </Link>
              </Button>
            </div>

            <div className="mx-auto max-w-2xl space-y-6 p-5">
              {/* Company details */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{c.companyDetails}</h3>
                  <span className="text-muted-foreground text-sm">
                    {prospect.company}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <CompanyChip
                    icon={<Building2 className="size-4" />}
                    label={c.industry}
                    value={prospect.industry}
                  />
                  <CompanyChip
                    icon={<MapPin className="size-4" />}
                    label={c.location}
                    value={prospect.location}
                  />
                  <CompanyChip
                    icon={<Users className="size-4" />}
                    label={c.headcount}
                    value={prospect.headcount}
                  />
                  <CompanyChip
                    icon={<CircleDollarSign className="size-4" />}
                    label={c.revenue}
                    value={prospect.revenue}
                  />
                </div>
              </section>

              <Separator />

              {/* Signal details */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">{c.signalDetails}</h3>
                <SignalPill signal={selected.signal} />
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.signal.detail}
                </p>
              </section>

              <Separator />

              {/* Recommended sequence */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">
                    {c.recommendedSequence}
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {selected.steps.length} {c.steps}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-muted-foreground gap-1 font-normal"
                  >
                    <Repeat className="size-3" />
                    {c.mailboxRotation}
                  </Badge>
                </div>
                <SequenceTimeline steps={selected.steps} />
              </section>
            </div>
          </div>

          {/* Sticky action footer */}
          <div className="bg-background flex items-center justify-end gap-2 border-t p-4">
            <Button variant="outline" onClick={() => dismiss(selected)}>
              <X className="size-4" />
              {c.dismiss}
            </Button>
            <Button variant="volt" onClick={() => send(selected, prospect.firstName)}>
              <Send className="size-4" />
              {c.sendSequence}
            </Button>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center gap-3 px-6 text-center md:flex">
          <span className="bg-primary/15 text-primary flex size-12 items-center justify-center rounded-full">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="text-sm font-medium">{c.allCaughtUp}</p>
            <p className="text-muted-foreground text-sm">{c.kaiSurfaces}</p>
          </div>
        </div>
      )}
    </div>
  )
}
