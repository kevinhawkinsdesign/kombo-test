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
} from "lucide-react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  MarkerType,
  Panel,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

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
  const [view, setView] = React.useState<"timeline" | "diagram">("timeline")
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
          {(["timeline", "diagram"] as const).map((v) => (
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

      {/* Footer: automation */}
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

/* ─────────────────────── React Flow diagram view ──────────────────────── */

interface StepNodeData extends Record<string, unknown> {
  step: BuilderStep
  dayLabel: string
  meta: ChannelMeta
}

interface StartEndNodeData extends Record<string, unknown> {
  label: string
  isEnd?: boolean
}

const INVISIBLE_HANDLE: React.CSSProperties = {
  background: "transparent",
  border: "none",
  width: 1,
  height: 1,
}

function StepFlowNode({ data }: NodeProps) {
  const { step, dayLabel, meta } = data as StepNodeData
  return (
    <>
      <Handle type="target" position={Position.Top} style={INVISIBLE_HANDLE} />
      <div className="bg-card flex w-[192px] flex-col gap-2 rounded-xl border p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              meta.tint
            )}
          >
            <meta.Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="text-muted-foreground mb-0.5 text-[10px] font-medium tracking-wide uppercase leading-none">
              {dayLabel} · {meta.label}
            </div>
            <div className="truncate text-sm font-semibold leading-tight">
              {step.title}
            </div>
          </div>
        </div>
        <div className="text-muted-foreground text-[11px] leading-tight">
          {triggerHint(step)}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={INVISIBLE_HANDLE} />
    </>
  )
}

function StartEndFlowNode({ data }: NodeProps) {
  const { label, isEnd } = data as StartEndNodeData
  return (
    <>
      {isEnd && (
        <Handle type="target" position={Position.Top} style={INVISIBLE_HANDLE} />
      )}
      <span
        className={cn(
          "block rounded-full border px-4 py-1.5 text-xs font-medium whitespace-nowrap",
          isEnd
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary border-primary/20"
        )}
      >
        {label}
      </span>
      {!isEnd && (
        <Handle type="source" position={Position.Bottom} style={INVISIBLE_HANDLE} />
      )}
    </>
  )
}

const FLOW_NODE_TYPES = {
  step: StepFlowNode,
  startEnd: StartEndFlowNode,
}

const NODE_W = 192
const NODE_H = 110
const NODE_GAP_H = 24
const GROUP_GAP_V = 80
const PILL_H = 32

function buildFlowGraph(
  steps: BuilderStep[],
  days: number[],
  autoPause: boolean
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Group consecutive parallel steps into rows
  const groups: { steps: { step: BuilderStep; index: number }[] }[] = []
  steps.forEach((step, index) => {
    if (step.parallel && groups.length > 0) {
      groups[groups.length - 1].steps.push({ step, index })
    } else {
      groups.push({ steps: [{ step, index }] })
    }
  })

  const edgeBase: Omit<Edge, "id" | "source" | "target"> = {
    type: "smoothstep",
    style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--border))" },
  }

  // Start node (pill, centered at x=0)
  const PILL_W = 120
  nodes.push({
    id: "__start",
    type: "startEnd",
    position: { x: -PILL_W / 2, y: 0 },
    data: { label: "Enrolled" },
    draggable: true,
  })

  let y = PILL_H + 28
  let prevIds = ["__start"]

  groups.forEach((group, gi) => {
    const n = group.steps.length
    const totalW = n * NODE_W + (n - 1) * NODE_GAP_H
    const startX = -totalW / 2

    const groupIds: string[] = []

    group.steps.forEach(({ step, index }, i) => {
      const dayLabel = step.parallel ? "Parallel" : `Day ${days[index]}`
      nodes.push({
        id: step.id,
        type: "step",
        position: { x: startX + i * (NODE_W + NODE_GAP_H), y },
        data: { step, dayLabel, meta: CHANNELS[step.channel] },
        draggable: true,
      })
      groupIds.push(step.id)
    })

    // Edges from previous group to this group
    for (const prevId of prevIds) {
      for (const nodeId of groupIds) {
        edges.push({
          id: `${prevId}->${nodeId}`,
          source: prevId,
          target: nodeId,
          ...edgeBase,
          // Annotate the first edge with auto-pause hint
          label:
            gi === 0 && autoPause && prevId === "__start"
              ? "↩ on reply → pause & notify"
              : undefined,
          labelStyle: {
            fontSize: 10,
            fontWeight: 500,
            fill: "hsl(var(--chart-1))",
          },
          labelBgStyle: {
            fill: "hsl(var(--background))",
            fillOpacity: 0.85,
          },
          labelBgPadding: [4, 6] as [number, number],
          labelBgBorderRadius: 4,
        })
      }
    }

    prevIds = groupIds
    y += NODE_H + GROUP_GAP_V
  })

  // End node (pill, centered)
  const END_PILL_W = 168
  nodes.push({
    id: "__end",
    type: "startEnd",
    position: { x: -END_PILL_W / 2, y },
    data: { label: "Re-score & recommend", isEnd: true },
    draggable: true,
  })

  for (const prevId of prevIds) {
    edges.push({
      id: `${prevId}->__end`,
      source: prevId,
      target: "__end",
      ...edgeBase,
    })
  }

  return { nodes, edges }
}

function SequenceDiagram({
  steps,
  days,
  autoPause,
}: {
  steps: BuilderStep[]
  days: number[]
  autoPause: boolean
}) {
  const stepKey = steps.map((s) => s.id).join(",")
  const daysKey = days.join(",")
  const { nodes, edges } = React.useMemo(
    () => buildFlowGraph(steps, days, autoPause),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepKey, daysKey, autoPause]
  )

  return (
    <div className="overflow-hidden rounded-xl border" style={{ height: 540 }}>
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={FLOW_NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        colorMode="system"
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        deleteKeyCode={null}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <Panel position="top-right">
          <span className="bg-background/80 text-muted-foreground rounded-md border px-2 py-1 text-[11px]">
            Drag to rearrange · scroll to zoom
          </span>
        </Panel>
      </ReactFlow>
    </div>
  )
}
