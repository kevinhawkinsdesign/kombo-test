// Converts the (still fundamentally tree-shaped — one level of forking,
// never deeper) CampaignStep list into React Flow's flat nodes[]/edges[]
// shape. Positions are computed, not user-draggable: depth (position in a
// track) maps to Y, lane (which track) maps to X.

import type { Edge, Node } from "@xyflow/react"

import type { CampaignStep, StepFork } from "@/lib/types"

export const ROW_HEIGHT = 132
export const LANE_WIDTH = 260

export interface StepNodeData extends Record<string, unknown> {
  kind: "step"
  step: CampaignStep
  trackLabel?: "reply" | "no_reply"
  deadEnd?: boolean
}

export interface AddNodeData extends Record<string, unknown> {
  kind: "add" | "addParallel"
  // "add": insert a sequential step. If trackId is set, appends to that
  // fork track; otherwise appends to the top-level list.
  afterStepId?: string
  trackId?: string
  forkStepId?: string
  // "addParallel": starts (or extends) a parallel fork on this step.
  anchorStepId?: string
}

export type SequenceNode = Node<StepNodeData | AddNodeData>

function stepNode(
  step: CampaignStep,
  depth: number,
  lane: number,
  extra?: Partial<StepNodeData>
): SequenceNode {
  return {
    id: step.id,
    type: "step",
    position: { x: lane * LANE_WIDTH, y: depth * ROW_HEIGHT },
    data: { kind: "step", step, ...extra },
    draggable: false,
  }
}

function addNode(id: string, depth: number, lane: number, data: AddNodeData): SequenceNode {
  return {
    id,
    type: "add",
    position: { x: lane * LANE_WIDTH, y: depth * ROW_HEIGHT },
    data,
    draggable: false,
  }
}

// Lane offsets for a fork's tracks, centered around the main line (lane 0).
function trackLanes(fork: StepFork): number[] {
  const n = fork.tracks.length
  if (fork.type === "branch" && n === 2) return [-1, 1]
  // Parallel tracks fan out to the right, per the "Add Parallel Step"
  // affordance sitting to the right of a card.
  return fork.tracks.map((_, i) => i + 1)
}

function layoutTrack(
  steps: CampaignStep[],
  startDepth: number,
  lane: number,
  interactive: boolean,
  trackLabel: "reply" | "no_reply" | undefined,
  forkStepId: string,
  trackId: string,
  rejoins: boolean
): { nodes: SequenceNode[]; edges: Edge[]; endDepth: number; lastId: string | undefined } {
  const nodes: SequenceNode[] = []
  const edges: Edge[] = []
  let depth = startDepth
  let prevId: string | undefined
  steps.forEach((step, i) => {
    const isLast = i === steps.length - 1
    nodes.push(stepNode(step, depth, lane, { trackLabel, deadEnd: isLast && !rejoins }))
    const source = prevId ?? forkStepId
    edges.push({ id: `${source}->${step.id}`, source, target: step.id })
    prevId = step.id
    depth += 1
  })
  if (interactive) {
    const ghostId = `add-track-${trackId}`
    const source = prevId ?? forkStepId
    nodes.push(addNode(ghostId, depth, lane, { kind: "add", trackId, forkStepId, afterStepId: prevId }))
    edges.push({ id: `${source}->${ghostId}`, source, target: ghostId })
  }
  return { nodes, edges, endDepth: depth, lastId: prevId }
}

interface StepLayout {
  nodes: SequenceNode[]
  edges: Edge[]
  nextDepth: number
  // Node ids that feed into whatever top-level step comes next (or the
  // trailing "add step" ghost, if this is the last one).
  rejoinSources: string[]
}

function layoutStep(step: CampaignStep, depth: number, interactive: boolean): StepLayout {
  const nodes: SequenceNode[] = [stepNode(step, depth, 0)]
  const edges: Edge[] = []

  if (!step.fork) {
    return { nodes, edges, nextDepth: depth + 1, rejoinSources: [step.id] }
  }

  const lanes = trackLanes(step.fork)
  let maxRejoinDepth = depth + 1
  const rejoinSources: string[] = step.fork.type === "parallel" ? [step.id] : []

  step.fork.tracks.forEach((track, i) => {
    const label = track.kind === "reply" || track.kind === "no_reply" ? track.kind : undefined
    const result = layoutTrack(
      track.steps,
      depth + 1,
      lanes[i],
      interactive,
      label,
      step.id,
      track.id,
      track.rejoins
    )
    nodes.push(...result.nodes)
    edges.push(...result.edges)
    if (track.rejoins) {
      maxRejoinDepth = Math.max(maxRejoinDepth, result.endDepth)
      rejoinSources.push(result.lastId ?? step.id)
    }
  })

  return {
    nodes,
    edges,
    nextDepth: rejoinSources.length ? maxRejoinDepth : depth + 1,
    // Defensive fallback (shouldn't happen — branch tracks always rejoin):
    // never orphan the rest of the top-level sequence.
    rejoinSources: rejoinSources.length ? rejoinSources : [step.id],
  }
}

export function computeLayout(
  steps: CampaignStep[],
  opts: { interactive: boolean }
): { nodes: SequenceNode[]; edges: Edge[] } {
  const nodes: SequenceNode[] = []
  const edges: Edge[] = []
  let depth = 0
  let pendingSources: string[] = []

  steps.forEach((step) => {
    const stepStartDepth = depth
    const result = layoutStep(step, depth, opts.interactive)
    nodes.push(...result.nodes)
    edges.push(...result.edges)

    for (const src of pendingSources) {
      edges.push({ id: `${src}->${step.id}`, source: src, target: step.id })
    }

    depth = result.nextDepth

    if (opts.interactive) {
      // "Add Parallel Step" ghost — sits beside the step, at the same depth
      // it starts at. Not offered on a step that already has a reply/no-
      // reply branch (a step can't be both branched and parallel-forked).
      if (step.fork?.type !== "branch") {
        const lane = step.fork?.type === "parallel" ? step.fork.tracks.length + 1 : 1
        nodes.push(
          addNode(`add-parallel-${step.id}`, stepStartDepth, lane, {
            kind: "addParallel",
            anchorStepId: step.id,
          })
        )
      }

      // "Add Step" ghost — sits right after this step (and its tracks),
      // doubling as the "insert here" affordance and, for the last step,
      // the trailing "append" button.
      const ghostId = `add-after-${step.id}`
      nodes.push(addNode(ghostId, depth, 0, { kind: "add", afterStepId: step.id }))
      for (const src of result.rejoinSources) {
        edges.push({ id: `${src}->${ghostId}`, source: src, target: ghostId })
      }
      pendingSources = [ghostId]
      depth += 1
    } else {
      pendingSources = result.rejoinSources
    }
  })

  return { nodes, edges }
}
