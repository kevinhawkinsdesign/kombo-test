import * as React from "react"
import {
  Mail,
  MessageCircle,
  Phone,
  Bot,
  Hourglass,
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GitBranch,
  Zap,
  Reply,
  MailOpen,
  MousePointerClick,
  Radar,
  Hand,
  ArrowDown,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InfoHint } from "@/components/common/InfoHint"
import {
  SEQUENCE_CHANNELS,
  STEP_TRIGGERS,
  dayLabels,
  newStepId,
} from "@/lib/mock-sequence"
import type {
  BuilderStep,
  SequenceChannelType,
  StepTriggerType,
} from "@/lib/types"
import { cn } from "@/lib/utils"

/* ------------------------------ channel meta ------------------------------ */
interface ChannelMeta {
  label: string
  tint: string
  dot: string
  Icon: React.ComponentType<{ className?: string }>
}

const CHANNELS: Record<SequenceChannelType, ChannelMeta> = {
  email: { label: "Email", tint: "bg-primary/15 text-primary", dot: "bg-primary", Icon: Mail },
  linkedin: {
    label: "LinkedIn",
    tint: "bg-[#0a66c2]/15 text-[#0a66c2]",
    dot: "bg-[#0a66c2]",
    Icon: LinkedinIcon,
  },
  whatsapp: {
    label: "WhatsApp",
    tint: "bg-chart-1/15 text-chart-1",
    dot: "bg-chart-1",
    Icon: MessageCircle,
  },
  call: { label: "Call", tint: "bg-chart-4/15 text-chart-4", dot: "bg-chart-4", Icon: Phone },
  ai_call: {
    label: "AI Call",
    tint: "bg-chart-5/15 text-chart-5",
    dot: "bg-chart-5",
    Icon: Bot,
  },
  wait: {
    label: "Break",
    tint: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
    Icon: Hourglass,
  },
}

const TRIGGERS: Record<
  StepTriggerType,
  { label: string; short: string; needsDays: boolean; Icon: React.ComponentType<{ className?: string }> }
> = {
  delay: { label: "After a delay", short: "After delay", needsDays: true, Icon: Hourglass },
  on_no_reply: { label: "If no reply", short: "If no reply", needsDays: true, Icon: Reply },
  on_open: { label: "When opened", short: "On open", needsDays: false, Icon: MailOpen },
  on_click: { label: "When a link is clicked", short: "On click", needsDays: false, Icon: MousePointerClick },
  on_reply: { label: "When they reply", short: "On reply", needsDays: false, Icon: Reply },
  on_signal: { label: "On a data signal", short: "On signal", needsDays: false, Icon: Radar },
  manual: { label: "Manual — wait for me", short: "Manual", needsDays: false, Icon: Hand },
}

function ChannelGlyph({
  channel,
  className,
}: {
  channel: SequenceChannelType
  className?: string
}) {
  const { Icon } = CHANNELS[channel]
  return <Icon className={className} />
}

function triggerHint(step: BuilderStep): string {
  const t = TRIGGERS[step.trigger.type]
  if (step.trigger.type === "delay")
    return step.trigger.days && step.trigger.days > 0
      ? `${t.short} of ${step.trigger.days}d`
      : "Immediately"
  if (step.trigger.type === "on_no_reply")
    return `${t.short} in ${step.trigger.days ?? 0}d`
  return t.short
}

/* ------------------------------ the builder ------------------------------ */
export function SequenceBuilder({
  initialSteps,
  onChange,
  className,
}: {
  initialSteps: BuilderStep[]
  onChange?: (steps: BuilderStep[]) => void
  className?: string
}) {
  const [steps, setSteps] = React.useState<BuilderStep[]>(initialSteps)
  const [view, setView] = React.useState<"timeline" | "diagram">("diagram")
  const [autoPause, setAutoPause] = React.useState(true)
  const dragIndex = React.useRef<number | null>(null)
  const [overIndex, setOverIndex] = React.useState<number | null>(null)

  const days = dayLabels(steps)

  const update = React.useCallback(
    (next: BuilderStep[]) => {
      setSteps(next)
      onChange?.(next)
    },
    [onChange]
  )

  function patchStep(id: string, patch: Partial<BuilderStep>) {
    update(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function patchTrigger(id: string, patch: Partial<BuilderStep["trigger"]>) {
    update(
      steps.map((s) =>
        s.id === id ? { ...s, trigger: { ...s.trigger, ...patch } } : s
      )
    )
  }

  function addStep(channel: SequenceChannelType) {
    update([
      ...steps,
      {
        id: newStepId(),
        channel,
        title:
          channel === "wait" ? "Pause + review" : `New ${CHANNELS[channel].label} step`,
        subtitle: "",
        trigger: { type: "delay", days: 2 },
      },
    ])
  }

  function removeStep(id: string) {
    update(steps.filter((s) => s.id !== id))
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    ;[next[index], next[target]] = [next[target], next[index]]
    update(next)
  }

  function reorder(from: number, to: number) {
    if (from === to) return
    const next = [...steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    update(next)
  }

  const totalDays = days.length ? days[days.length - 1] : 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-[3px]">
          {(["diagram", "timeline"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "h-full rounded-md px-3 text-sm font-medium capitalize transition-colors",
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1 font-normal">
            <Hourglass className="size-3" />≈ {totalDays} days
          </Badge>
          <AddStepMenu onAdd={addStep} />
        </div>
      </div>

      {/* Automation (sequence-level) — shown above the steps. */}
      <div className="bg-muted/40 flex flex-wrap items-center gap-3 rounded-xl border p-3 sm:p-4">
        <span className="bg-chart-4/15 text-chart-4 flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Zap className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-medium">
            Runs automatically
            <InfoHint label="How automation works">
              Steps fire on their trigger — a delay, an opened email, a clicked
              link, or a data signal. The sequence pauses the instant a prospect
              replies so you never message someone who's already engaged.
            </InfoHint>
          </p>
          <p className="text-muted-foreground text-xs">
            {autoPause
              ? "Auto-pauses the moment a prospect replies."
              : "Continues regardless of replies."}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline">
            Auto-pause on reply
          </span>
          <Switch
            checked={autoPause}
            onCheckedChange={setAutoPause}
            aria-label="Auto-pause on reply"
          />
        </label>
      </div>

      {view === "timeline" ? (
        <ol className="space-y-2">
          {steps.map((step, index) => {
            const meta = CHANNELS[step.channel]
            const isLast = index === steps.length - 1
            return (
              <li
                key={step.id}
                draggable
                onDragStart={() => {
                  dragIndex.current = index
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (overIndex !== index) setOverIndex(index)
                }}
                onDragEnd={() => {
                  dragIndex.current = null
                  setOverIndex(null)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragIndex.current !== null)
                    reorder(dragIndex.current, index)
                  dragIndex.current = null
                  setOverIndex(null)
                }}
                className="relative"
              >
                {/* Connector to next step */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="bg-border absolute top-12 left-[27px] z-0 h-[calc(100%-1rem)] w-px"
                  />
                )}

                <div
                  className={cn(
                    "bg-card relative z-10 flex items-start gap-3 rounded-xl border p-3 transition-colors sm:p-4",
                    overIndex === index && "border-primary ring-primary/30 ring-2",
                    step.parallel && "ml-6"
                  )}
                >
                  {/* Drag handle */}
                  <button
                    type="button"
                    aria-label={`Drag to reorder step ${index + 1}`}
                    className="text-muted-foreground/50 hover:text-foreground mt-1 cursor-grab touch-none active:cursor-grabbing"
                  >
                    <GripVertical className="size-4" />
                  </button>

                  {/* Channel node */}
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      meta.tint
                    )}
                  >
                    <ChannelGlyph channel={step.channel} className="size-4.5" />
                  </span>

                  {/* Body */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                        {step.parallel ? "Parallel" : `Day ${days[index]}`}
                      </span>
                      <span className="text-muted-foreground/40 text-[11px]">·</span>
                      <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                        {meta.label}
                      </span>
                      {step.branch && (
                        <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px] font-normal">
                          <GitBranch className="size-2.5" />
                          {step.branch === "reply" ? "If replied" : "If no reply"}
                        </Badge>
                      )}
                    </div>

                    <Input
                      value={step.title}
                      onChange={(e) => patchStep(step.id, { title: e.target.value })}
                      aria-label={`Step ${index + 1} title`}
                      className="border-transparent bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
                    />

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={step.channel}
                        onValueChange={(v) =>
                          patchStep(step.id, { channel: v as SequenceChannelType })
                        }
                      >
                        <SelectTrigger size="sm" className="h-8 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEQUENCE_CHANNELS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {CHANNELS[c].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={step.trigger.type}
                        onValueChange={(v) =>
                          patchTrigger(step.id, { type: v as StepTriggerType })
                        }
                      >
                        <SelectTrigger size="sm" className="h-8 w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STEP_TRIGGERS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {TRIGGERS[t].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {TRIGGERS[step.trigger.type].needsDays && (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            value={step.trigger.days ?? 0}
                            onChange={(e) =>
                              patchTrigger(step.id, {
                                days: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            aria-label={`Step ${index + 1} delay in days`}
                            className="h-8 w-16"
                          />
                          <span className="text-muted-foreground text-xs">days</span>
                        </div>
                      )}

                      {index > 0 && (
                        <Button
                          type="button"
                          variant={step.parallel ? "secondary" : "ghost"}
                          size="sm"
                          className="h-8 gap-1"
                          aria-pressed={step.parallel ?? false}
                          onClick={() =>
                            patchStep(step.id, { parallel: !step.parallel })
                          }
                        >
                          <GitBranch className="size-3.5" />
                          Parallel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right-side actions */}
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`Move step ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`Move step ${index + 1} down`}
                      disabled={isLast}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive size-7"
                      aria-label={`Remove step ${index + 1}`}
                      onClick={() => removeStep(step.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}

          {steps.length === 0 && (
            <li className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
              No steps yet. Add your first touch to get started.
            </li>
          )}
        </ol>
      ) : (
        <SequenceDiagram steps={steps} days={days} autoPause={autoPause} />
      )}

    </div>
  )
}

function AddStepMenu({
  onAdd,
}: {
  onAdd: (channel: SequenceChannelType) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Add step
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SEQUENCE_CHANNELS.map((c) => {
          const meta = CHANNELS[c]
          return (
            <DropdownMenuItem key={c} onClick={() => onAdd(c)}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-md",
                  meta.tint
                )}
              >
                <ChannelGlyph channel={c} className="size-3.5" />
              </span>
              {meta.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ------------------------------ diagram view ------------------------------ */
function SequenceDiagram({
  steps,
  days,
  autoPause,
}: {
  steps: BuilderStep[]
  days: number[]
  autoPause: boolean
}) {
  // Group consecutive parallel steps so fan-outs render side by side.
  const groups: { lead: number; steps: { step: BuilderStep; index: number }[] }[] =
    []
  steps.forEach((step, index) => {
    if (step.parallel && groups.length > 0) {
      groups[groups.length - 1].steps.push({ step, index })
    } else {
      groups.push({ lead: index, steps: [{ step, index }] })
    }
  })

  return (
    <div className="bg-muted/20 overflow-x-auto rounded-xl border p-4 sm:p-6">
      <div className="mx-auto flex w-fit min-w-full flex-col items-center gap-1">
        <NodePill label="Enrolled" tone="start" />
        {groups.map((group, gi) => (
          <React.Fragment key={group.lead}>
            <Connector />
            <div className="flex items-stretch justify-center gap-3">
              {group.steps.map(({ step, index }) => {
                const meta = CHANNELS[step.channel]
                return (
                  <div
                    key={step.id}
                    className="bg-card flex w-44 flex-col gap-1 rounded-xl border p-3 text-center shadow-sm"
                  >
                    <span
                      className={cn(
                        "mx-auto flex size-8 items-center justify-center rounded-lg",
                        meta.tint
                      )}
                    >
                      <ChannelGlyph channel={step.channel} className="size-4" />
                    </span>
                    <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                      {step.parallel ? "Parallel" : `Day ${days[index]}`} · {meta.label}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {step.title}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {triggerHint(step)}
                    </span>
                  </div>
                )
              })}
            </div>
            {gi === 0 && autoPause && (
              <>
                <span className="text-chart-1 mt-1 flex items-center gap-1 text-[11px] font-medium">
                  <Reply className="size-3" /> on reply → stop &amp; notify rep
                </span>
              </>
            )}
          </React.Fragment>
        ))}
        <Connector />
        <NodePill label="Re-score & recommend" tone="end" />
      </div>
    </div>
  )
}

function Connector() {
  return <ArrowDown className="text-muted-foreground/50 size-4" aria-hidden="true" />
}

function NodePill({
  label,
  tone,
}: {
  label: string
  tone: "start" | "end"
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium",
        tone === "start"
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  )
}
