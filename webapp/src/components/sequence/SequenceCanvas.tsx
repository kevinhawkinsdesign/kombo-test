import * as React from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  useReactFlow,
  type Node,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { CampaignStep, StepTrackKind } from "@/lib/types"
import type { MoveTarget } from "@/lib/sequence-draft"

const COPY = {
  en: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Phone call",
      ai_call: "AI Voice Call",
      linkedin_message: "LinkedIn message",
      linkedin_dm: "LinkedIn DM",
      linkedin_inmail: "LinkedIn InMail",
      manual: "Manual task",
    } as Record<string, string>,
    sendImmediately: "Send immediately",
    waitDays: (n: number) => `Wait ${n} ${n === 1 ? "day" : "days"}`,
    manualTaskBadge: "Task",
    actionNeeded: "Action needed",
    trackLabel: {
      reply: "If they reply",
      no_reply: "If they don't reply",
      opened: "If opened",
      not_opened: "If not opened",
      clicked: "If clicked",
      not_clicked: "If not clicked",
      accepted: "If accepted",
      not_accepted: "If not accepted",
      read: "If read",
      not_read: "If not read",
    } as Record<StepTrackKind, string>,
    addStep: "Add step",
    addParallel: "Add parallel step",
    inParallel: "In parallel",
  },
  es: {
    channelLabel: {
      email: "Correo",
      whatsapp: "WhatsApp",
      call: "Llamada",
      ai_call: "Llamada de voz IA",
      linkedin_message: "Mensaje de LinkedIn",
      linkedin_dm: "Mensaje directo de LinkedIn",
      linkedin_inmail: "InMail de LinkedIn",
      manual: "Tarea manual",
    } as Record<string, string>,
    sendImmediately: "Enviar inmediatamente",
    waitDays: (n: number) => `Espera ${n} ${n === 1 ? "día" : "días"}`,
    manualTaskBadge: "Tarea",
    actionNeeded: "Requiere acción",
    trackLabel: {
      reply: "Si responden",
      no_reply: "Si no responden",
      opened: "Si se abre",
      not_opened: "Si no se abre",
      clicked: "Si se hace clic",
      not_clicked: "Si no se hace clic",
      accepted: "Si se acepta",
      not_accepted: "Si no se acepta",
      read: "Si se lee",
      not_read: "Si no se lee",
    } as Record<StepTrackKind, string>,
    addStep: "Añadir paso",
    addParallel: "Añadir paso paralelo",
    inParallel: "En paralelo",
  },
  it: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Chiamata",
      ai_call: "Chiamata vocale IA",
      linkedin_message: "Messaggio LinkedIn",
      linkedin_dm: "Messaggio diretto LinkedIn",
      linkedin_inmail: "InMail di LinkedIn",
      manual: "Attività manuale",
    } as Record<string, string>,
    sendImmediately: "Invia subito",
    waitDays: (n: number) => `Attendi ${n} ${n === 1 ? "giorno" : "giorni"}`,
    manualTaskBadge: "Attività",
    actionNeeded: "Azione richiesta",
    trackLabel: {
      reply: "Se rispondono",
      no_reply: "Se non rispondono",
      opened: "Se aperto",
      not_opened: "Se non aperto",
      clicked: "Se cliccato",
      not_clicked: "Se non cliccato",
      accepted: "Se accettato",
      not_accepted: "Se non accettato",
      read: "Se letto",
      not_read: "Se non letto",
    } as Record<StepTrackKind, string>,
    addStep: "Aggiungi passaggio",
    addParallel: "Aggiungi passaggio parallelo",
    inParallel: "In parallelo",
  },
  fr: {
    channelLabel: {
      email: "E-mail",
      whatsapp: "WhatsApp",
      call: "Appel téléphonique",
      ai_call: "Appel vocal IA",
      linkedin_message: "Message LinkedIn",
      linkedin_dm: "Message privé LinkedIn",
      linkedin_inmail: "InMail LinkedIn",
      manual: "Tâche manuelle",
    } as Record<string, string>,
    sendImmediately: "Envoyer immédiatement",
    waitDays: (n: number) => `Attendre ${n} ${n === 1 ? "jour" : "jours"}`,
    manualTaskBadge: "Tâche",
    actionNeeded: "Action requise",
    trackLabel: {
      reply: "S'ils répondent",
      no_reply: "S'ils ne répondent pas",
      opened: "Si ouvert",
      not_opened: "Si non ouvert",
      clicked: "Si cliqué",
      not_clicked: "Si non cliqué",
      accepted: "Si accepté",
      not_accepted: "Si non accepté",
      read: "Si lu",
      not_read: "Si non lu",
    } as Record<StepTrackKind, string>,
    addStep: "Ajouter une étape",
    addParallel: "Ajouter une étape parallèle",
    inParallel: "En parallèle",
  },
  de: {
    channelLabel: {
      email: "E-Mail",
      whatsapp: "WhatsApp",
      call: "Telefonanruf",
      ai_call: "KI-Sprachanruf",
      linkedin_message: "LinkedIn-Nachricht",
      linkedin_dm: "LinkedIn-Direktnachricht",
      linkedin_inmail: "LinkedIn InMail",
      manual: "Manuelle Aufgabe",
    } as Record<string, string>,
    sendImmediately: "Sofort senden",
    waitDays: (n: number) => `${n} ${n === 1 ? "Tag" : "Tage"} warten`,
    manualTaskBadge: "Aufgabe",
    actionNeeded: "Aktion erforderlich",
    trackLabel: {
      reply: "Wenn sie antworten",
      no_reply: "Wenn sie nicht antworten",
      opened: "Wenn geöffnet",
      not_opened: "Wenn nicht geöffnet",
      clicked: "Wenn geklickt",
      not_clicked: "Wenn nicht geklickt",
      accepted: "Wenn angenommen",
      not_accepted: "Wenn nicht angenommen",
      read: "Wenn gelesen",
      not_read: "Wenn nicht gelesen",
    } as Record<StepTrackKind, string>,
    addStep: "Schritt hinzufügen",
    addParallel: "Parallelen Schritt hinzufügen",
    inParallel: "Parallel",
  },
  pt: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Chamada",
      ai_call: "Chamada de voz IA",
      linkedin_message: "Mensagem do LinkedIn",
      linkedin_dm: "Mensagem direta do LinkedIn",
      linkedin_inmail: "InMail do LinkedIn",
      manual: "Tarefa manual",
    } as Record<string, string>,
    sendImmediately: "Enviar imediatamente",
    waitDays: (n: number) => `Esperar ${n} ${n === 1 ? "dia" : "dias"}`,
    manualTaskBadge: "Tarefa",
    actionNeeded: "Ação necessária",
    trackLabel: {
      reply: "Se responderem",
      no_reply: "Se não responderem",
      opened: "Se abrirem",
      not_opened: "Se não abrirem",
      clicked: "Se clicarem",
      not_clicked: "Se não clicarem",
      accepted: "Se aceitarem",
      not_accepted: "Se não aceitarem",
      read: "Se lerem",
      not_read: "Se não lerem",
    } as Record<StepTrackKind, string>,
    addStep: "Adicionar passo",
    addParallel: "Adicionar passo paralelo",
    inParallel: "Em paralelo",
  },
  pt_BR: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Ligação",
      ai_call: "Ligação de voz IA",
      linkedin_message: "Mensagem do LinkedIn",
      linkedin_dm: "Mensagem direta do LinkedIn",
      linkedin_inmail: "InMail do LinkedIn",
      manual: "Tarefa manual",
    } as Record<string, string>,
    sendImmediately: "Enviar imediatamente",
    waitDays: (n: number) => `Aguardar ${n} ${n === 1 ? "dia" : "dias"}`,
    manualTaskBadge: "Tarefa",
    actionNeeded: "Ação necessária",
    trackLabel: {
      reply: "Se responderem",
      no_reply: "Se não responderem",
      opened: "Se abrirem",
      not_opened: "Se não abrirem",
      clicked: "Se clicarem",
      not_clicked: "Se não clicarem",
      accepted: "Se aceitarem",
      not_accepted: "Se não aceitarem",
      read: "Se lerem",
      not_read: "Se não lerem",
    } as Record<StepTrackKind, string>,
    addStep: "Adicionar etapa",
    addParallel: "Adicionar etapa paralela",
    inParallel: "Em paralelo",
  },
} as const

interface StepNodeExtraData extends StepNodeData {
  selectedStepId?: string
  interactive: boolean
  onClick?: (step: CampaignStep) => void
  onAddParallel?: (step: CampaignStep) => void
  // True while a dragged step is currently hovering this node as a
  // candidate parallel-attach target.
  isDropTarget?: boolean
}

// Invisible anchor points — nodesConnectable is false everywhere this canvas
// is used, so these only exist to give edges somewhere to attach; without a
// Handle, React Flow can't compute a connection point and silently drops
// the edge (no line, no console error visible to the user).
const HANDLE_CLASS = "invisible !size-0 !min-w-0 !border-0"

function StepCard({
  step,
  selected,
  interactive,
  isDropTarget,
  onClick,
}: {
  step: CampaignStep
  selected: boolean
  interactive: boolean
  isDropTarget?: boolean
  onClick?: (step: CampaignStep) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const meta = channelMeta(step.channel)
  const needsAction = step.isManualTask
    ? stripHtml(step.subject ?? "").trim().length === 0
    : stripHtml(step.body).trim().length === 0

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onClick?.(step)}
      style={{ width: 240 }}
      className={cn(
        "bg-card flex shrink-0 items-center gap-2.5 rounded-xl border p-3 text-left shadow-sm transition-colors",
        isDropTarget
          ? "border-primary bg-primary/10 ring-primary/30 ring-2"
          : selected
            ? "border-primary bg-primary/[0.04]"
            : interactive && "hover:bg-muted/40"
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
  )
}

function StepNodeComponent({ data }: NodeProps & { data: StepNodeExtraData }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { step, selectedStepId, interactive, onClick, trackLabel, onAddParallel, isDropTarget } =
    data
  const parallelSteps = step.parallelSteps ?? []
  // A step is either a fork anchor or parallel-able, never both — keeps the
  // canvas geometry simple (no lane collisions between a wide parallel
  // cluster and fork-track lanes on the same row). Only top-level steps
  // qualify — a step inside a condition track already carries a
  // `trackLabel`, which doubles as that signal.
  const canAddParallel = interactive && !step.fork && !trackLabel
  const hasParallel = parallelSteps.length > 0
  // Every node in this diagram — plain steps, parallel groups, and the "+"
  // ghosts — shares the same lane x position (its wrapper's left edge), so
  // the spine only stays a straight vertical line if every node's handle
  // sits at the same fixed offset from that shared edge: 120, half of a
  // plain 240px card.
  const handleLeft = 120
  // A parallel group's card cluster is visually centered on that same 120
  // spine (not left-anchored at the lane edge like a plain card) — a
  // translateX shift, computed from the cluster's actual width, pulls the
  // dashed box left by however much it's wider than a single 240px card.
  // translateX is a paint-only transform, so it can't perturb the layout
  // math the shared handleLeft invariant above depends on.
  const CARD_WIDTH = 240
  const CARD_GAP = 8 // gap-2
  const GROUP_PAD = 12 // p-3
  const GROUP_BORDER = 2 // border-2
  const clusterCount = 1 + parallelSteps.length
  const clusterWidth = clusterCount * CARD_WIDTH + (clusterCount - 1) * CARD_GAP
  const groupWidth = clusterWidth + 2 * (GROUP_PAD + GROUP_BORDER)
  const groupShift = groupWidth / 2 - handleLeft

  const cards = (
    <>
      <StepCard
        step={step}
        selected={step.id === selectedStepId}
        interactive={interactive}
        isDropTarget={isDropTarget}
        onClick={onClick}
      />
      {parallelSteps.map((p) => (
        <StepCard
          key={p.id}
          step={p}
          selected={p.id === selectedStepId}
          interactive={interactive}
          isDropTarget={isDropTarget}
          onClick={onClick}
        />
      ))}
    </>
  )

  const addParallelButton = canAddParallel && (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onAddParallel?.(step)}
          aria-label={c.addParallel}
          className="border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 bg-background flex size-7 shrink-0 items-center justify-center self-center rounded-full border-2 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{c.addParallel}</TooltipContent>
    </Tooltip>
  )

  const row = (
    <div className="flex items-stretch gap-2">
      {cards}
      {addParallelButton}
    </div>
  )

  return (
    <div className="flex flex-col items-stretch gap-1">
      <Handle
        type="target"
        position={Position.Top}
        style={{ left: handleLeft }}
        className={HANDLE_CLASS}
      />
      {trackLabel && (
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          {c.trackLabel[trackLabel]}
        </span>
      )}
      {hasParallel ? (
        <div className="flex items-stretch gap-2">
          <div
            className="border-primary/30 bg-primary/[0.03] flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-3"
            style={{ transform: `translateX(-${groupShift}px)` }}
          >
            <span className="text-primary flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
              <Split className="size-3" />
              {c.inParallel}
            </span>
            <div className="flex items-stretch gap-2">{cards}</div>
          </div>
          {addParallelButton}
        </div>
      ) : (
        row
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: handleLeft }}
        className={HANDLE_CLASS}
      />
    </div>
  )
}

// A small "+" living on the connector line between two step cards, not a
// full-width pill with its own row — the wrapper matches the step card's
// width purely so the button centers on the line the edge actually draws.
function AddNodeComponent({
  data,
}: NodeProps & {
  data: AddNodeData & { onClick?: (ghost: AddNodeData) => void; isDropTarget?: boolean }
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <div className="flex flex-col items-center gap-1">
      {data.trackLabel && (
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          {c.trackLabel[data.trackLabel]}
        </span>
      )}
      <div style={{ width: 240 }} className="flex justify-center">
        <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
        <button
          type="button"
          onClick={() => data.onClick?.(data)}
          aria-label={c.addStep}
          className={cn(
            "flex size-7 items-center justify-center rounded-full border-2 transition-colors",
            data.isDropTarget
              ? "border-primary bg-primary/10 text-primary scale-125"
              : "border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 bg-background"
          )}
        >
          <Plus className="size-4" />
        </button>
        <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
      </div>
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
  onAddParallel?: (step: CampaignStep) => void
  onMoveStep?: (stepId: string, target: MoveTarget) => void
  className?: string
}

export function SequenceCanvas(props: SequenceCanvasProps) {
  // useReactFlow (for drag-and-drop hit-testing) only works inside a
  // ReactFlowProvider — the canvas owns its own here since nothing else on
  // the page needs the instance.
  return (
    <ReactFlowProvider>
      <SequenceCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

function SequenceCanvasInner({
  steps,
  mode,
  selectedStepId,
  onSelectStep,
  onAddRequest,
  onAddParallel,
  onMoveStep,
  className,
}: SequenceCanvasProps) {
  const interactive = mode === "interactive"
  const { getIntersectingNodes } = useReactFlow()
  const [dragTargetId, setDragTargetId] = React.useState<string | null>(null)

  const { nodes, edges } = React.useMemo(() => {
    const layout = computeLayout(steps, { interactive })
    const nodes = layout.nodes.map((node) => {
      if (node.type === "step") {
        const stepData = node.data as StepNodeData
        // Draggable only for "plain" steps — a fork's tracks or a
        // parallel anchor's siblings would need to travel with it, which
        // this drop-target model doesn't support; those still reorder via
        // the move up/down buttons in the detail panel instead.
        const draggable =
          interactive && !stepData.step.fork && !stepData.step.parallelSteps?.length
        return {
          ...node,
          draggable,
          data: {
            ...stepData,
            selectedStepId,
            interactive,
            onClick: (step: CampaignStep) => onSelectStep?.(step.id),
            onAddParallel,
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
  }, [steps, interactive, selectedStepId, onSelectStep, onAddRequest, onAddParallel])

  // A separate highlight pass so dragging doesn't force the layout memo
  // above (and the whole node/edge tree) to recompute on every pointer move.
  const displayNodes = React.useMemo(
    () => nodes.map((n) => ({ ...n, data: { ...n.data, isDropTarget: n.id === dragTargetId } })),
    [nodes, dragTargetId]
  )

  // Kanban-style "highlight the nearest valid slot": positions are always
  // computed from the step tree (never persisted), so a drop just mutates
  // the tree and the next render snaps every node — including the one just
  // dragged — back into its correct computed position.
  const dragCandidate = React.useCallback(
    (node: Node) => {
      if (node.type !== "step") return null
      return getIntersectingNodes(node, true).find((n) => n.id !== node.id) ?? null
    },
    [getIntersectingNodes]
  )

  const handleNodeDrag = React.useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      setDragTargetId(dragCandidate(node)?.id ?? null)
    },
    [dragCandidate]
  )

  const handleNodeDragStop = React.useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      const target = dragCandidate(node)
      setDragTargetId(null)
      if (!target || !onMoveStep) return
      const draggedStepId = (node.data as StepNodeData).step.id
      if (target.type === "add") {
        const addData = target.data as AddNodeData
        onMoveStep(draggedStepId, {
          kind: "sequence",
          trackId: addData.trackId,
          forkStepId: addData.forkStepId,
          afterStepId: addData.afterStepId,
        })
      } else if (target.type === "step") {
        const targetStep = target.data as StepNodeData
        // Only a top-level, non-forked step is a valid parallel anchor —
        // keeps a step either forked or parallel-able, never both.
        if (
          !targetStep.trackLabel &&
          !targetStep.step.fork &&
          targetStep.step.id !== draggedStepId
        ) {
          onMoveStep(draggedStepId, { kind: "parallel", anchorStepId: targetStep.step.id })
        }
      }
    },
    [dragCandidate, onMoveStep]
  )

  return (
    <div className={cn("bg-muted/20 h-[600px] w-full rounded-xl border", className)}>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        elementsSelectable={interactive}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        panOnScroll
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        defaultEdgeOptions={{
          // Straight, not smoothstep — a direct line is always the shortest
          // path between two nodes; smoothstep's right-angle routing added
          // unnecessary jogs even between same-lane nodes.
          type: "straight",
          style: { stroke: "var(--color-muted-foreground)", strokeWidth: 2 },
        }}
      >
        <Background gap={24} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
