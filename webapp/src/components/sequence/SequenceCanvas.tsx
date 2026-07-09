import * as React from "react"
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { AlertTriangle, ListTodo, Plus, Split } from "lucide-react"

import { channelMeta, normalizeChannel } from "@/lib/step-channels"
import {
  computeLayout,
  type AddNodeData,
  type StepNodeData,
} from "@/lib/sequence-layout"
import { stripHtml } from "@/lib/rich-text"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { CampaignStep } from "@/lib/types"

const COPY = {
  en: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Phone call",
      ai_call: "AI Voice Call — ElevenLabs",
      linkedin_message: "LinkedIn message",
      linkedin_dm: "LinkedIn DM",
      linkedin_inmail: "LinkedIn InMail",
      manual: "Manual task",
    } as Record<string, string>,
    sendImmediately: "Send immediately",
    waitDays: (n: number) => `Wait ${n} ${n === 1 ? "day" : "days"}`,
    manualTaskBadge: "Task",
    actionNeeded: "Action needed",
    reply: "If they reply",
    noReply: "If they don't reply",
    deadEnd: "Ends here",
    addStep: "Add step",
    addParallel: "Add parallel step",
  },
  es: {
    channelLabel: {
      email: "Correo",
      whatsapp: "WhatsApp",
      call: "Llamada",
      ai_call: "Llamada de voz IA — ElevenLabs",
      linkedin_message: "Mensaje de LinkedIn",
      linkedin_dm: "Mensaje directo de LinkedIn",
      linkedin_inmail: "InMail de LinkedIn",
      manual: "Tarea manual",
    } as Record<string, string>,
    sendImmediately: "Enviar inmediatamente",
    waitDays: (n: number) => `Espera ${n} ${n === 1 ? "día" : "días"}`,
    manualTaskBadge: "Tarea",
    actionNeeded: "Requiere acción",
    reply: "Si responden",
    noReply: "Si no responden",
    deadEnd: "Termina aquí",
    addStep: "Añadir paso",
    addParallel: "Añadir paso paralelo",
  },
} as const

interface StepNodeExtraData extends StepNodeData {
  selected: boolean
  interactive: boolean
  onClick?: (step: CampaignStep) => void
}

// Invisible anchor points — nodesConnectable is false everywhere this canvas
// is used, so these only exist to give edges somewhere to attach; without a
// Handle, React Flow can't compute a connection point and silently drops
// the edge (no line, no console error visible to the user).
const HANDLE_CLASS = "invisible !size-0 !min-w-0 !border-0"

function StepNodeComponent({ data }: NodeProps & { data: StepNodeExtraData }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { step, selected, interactive, onClick, trackLabel, deadEnd } = data
  const meta = channelMeta(step.channel)
  const needsAction = step.isManualTask
    ? stripHtml(step.subject ?? "").trim().length === 0
    : stripHtml(step.body).trim().length === 0

  return (
    <div className="flex flex-col items-stretch gap-1" style={{ width: 240 }}>
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      {trackLabel && (
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          {trackLabel === "reply" ? c.reply : c.noReply}
        </span>
      )}
      <button
        type="button"
        disabled={!interactive}
        onClick={() => onClick?.(step)}
        className={cn(
          "bg-card flex items-center gap-2.5 rounded-xl border p-3 text-left shadow-sm transition-colors",
          selected ? "border-primary bg-primary/[0.04]" : interactive && "hover:bg-muted/40"
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            meta.tint
          )}
        >
          <meta.Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">
            {c.channelLabel[normalizeChannel(step.channel)]}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {step.delayDays === 0 ? c.sendImmediately : c.waitDays(step.delayDays)}
          </p>
          {(step.isManualTask || needsAction) && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {step.isManualTask && (
                <span className="bg-secondary text-secondary-foreground flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]">
                  <ListTodo className="size-3" />
                  {c.manualTaskBadge}
                </span>
              )}
              {needsAction && (
                <span className="bg-destructive/15 text-destructive flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]">
                  <AlertTriangle className="size-3" />
                  {c.actionNeeded}
                </span>
              )}
            </div>
          )}
        </div>
      </button>
      {deadEnd && (
        <span className="text-muted-foreground pl-1 text-[11px]">{c.deadEnd}</span>
      )}
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </div>
  )
}

function AddNodeComponent({
  data,
}: NodeProps & { data: AddNodeData & { onClick?: (ghost: AddNodeData) => void } }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const isParallel = data.kind === "addParallel"

  if (isParallel) {
    return (
      <button
        type="button"
        onClick={() => data.onClick?.(data)}
        className="border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-medium transition-colors"
      >
        <Split className="size-3.5" />
        {c.addParallel}
      </button>
    )
  }

  // A small "+" living on the connector line between two step cards, not a
  // full-width pill with its own row — the wrapper matches the step card's
  // width purely so the button centers on the line the edge actually draws.
  return (
    <div style={{ width: 240 }} className="flex justify-center">
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
      <button
        type="button"
        onClick={() => data.onClick?.(data)}
        aria-label={c.addStep}
        className="border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 bg-background flex size-7 items-center justify-center rounded-full border-2 transition-colors"
      >
        <Plus className="size-4" />
      </button>
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  step: StepNodeComponent as unknown as NodeTypes[string],
  add: AddNodeComponent as unknown as NodeTypes[string],
}

interface SequenceCanvasProps {
  steps: CampaignStep[]
  mode: "interactive" | "readonly"
  selectedStepId?: string
  onSelectStep?: (stepId: string) => void
  onAddRequest?: (ghost: AddNodeData) => void
  className?: string
}

export function SequenceCanvas({
  steps,
  mode,
  selectedStepId,
  onSelectStep,
  onAddRequest,
  className,
}: SequenceCanvasProps) {
  const interactive = mode === "interactive"

  const { nodes, edges } = React.useMemo(() => {
    const layout = computeLayout(steps, { interactive })
    const nodes = layout.nodes.map((node) => {
      if (node.type === "step") {
        const stepData = node.data as StepNodeData
        return {
          ...node,
          data: {
            ...stepData,
            selected: stepData.step.id === selectedStepId,
            interactive,
            onClick: (step: CampaignStep) => onSelectStep?.(step.id),
          } satisfies StepNodeExtraData,
        }
      }
      return {
        ...node,
        data: {
          ...(node.data as AddNodeData),
          onClick: (ghost: AddNodeData) => onAddRequest?.(ghost),
        },
      }
    })
    return { nodes, edges: layout.edges }
  }, [steps, interactive, selectedStepId, onSelectStep, onAddRequest])

  return (
    <div className={cn("bg-muted/20 h-[600px] w-full rounded-xl border", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={interactive}
        panOnScroll
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "var(--color-border)", strokeWidth: 2 },
        }}
      >
        <Background gap={24} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
