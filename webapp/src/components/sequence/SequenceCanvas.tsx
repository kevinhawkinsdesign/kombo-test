import * as React from "react"
import {
  ReactFlow,
  Background,
  Controls,
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
    </div>
  )
}

function AddNodeComponent({
  data,
}: NodeProps & { data: AddNodeData & { onClick?: (ghost: AddNodeData) => void } }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const isParallel = data.kind === "addParallel"
  return (
    <button
      type="button"
      onClick={() => data.onClick?.(data)}
      className="border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-medium transition-colors"
      style={{ width: isParallel ? undefined : 220 }}
    >
      {isParallel ? <Split className="size-3.5" /> : <Plus className="size-3.5" />}
      {isParallel ? c.addParallel : c.addStep}
    </button>
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
      >
        <Background gap={24} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
