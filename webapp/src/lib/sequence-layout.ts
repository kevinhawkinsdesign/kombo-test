// Converts the (still fundamentally tree-shaped — one level of forking,
// never deeper) CampaignStep list into React Flow's flat nodes[]/edges[]
// shape. Positions are computed, not user-draggable: depth (position in a
// track) maps to Y, lane (which track) maps to X.
//
// Parallel siblings (CampaignStep.parallelSteps) are not a separate lane —
// they render inside the same node as their anchor step, since they're
// concurrent with it rather than a fork of the sequence.

import type { Edge, Node } from "@xyflow/react"

import type { CampaignStep, StepFork, StepTrackKind } from "@/lib/types"

// As tight as possible while still clearing a real step card at its
// tallest (title + subtitle + two badge chips, ~90px) with the "+" ghost
// sitting halfway between two rows (see addNode calls at depth - 0.5) —
// keeps consecutive step cards close together without the ghost overlapping
// either one.
export const ROW_HEIGHT = 200
export const LANE_WIDTH = 260
// How far past the trailing "+" ghost the next real card starts, in the
// same row-unit scale as ROW_HEIGHT — was effectively 1.5 rows (huge dead
// space below the ghost); this is ~80% smaller.
const GHOST_TRAILING_GAP = 0.2

export interface StepNodeData extends Record<string, unknown> {
  kind: "step"
  step: CampaignStep
  trackLabel?: StepTrackKind
}

export interface AddNodeData extends Record<string, unknown> {
  kind: "add"
  // Insert a sequential step (or a condition). If trackId is set, appends
  // to that fork track; otherwise appends to the top-level list.
  afterStepId?: string
  trackId?: string
  forkStepId?: string
  // Set when this ghost is a track's own trailing "+" (its track is still
  // empty) — otherwise there'd be no step node yet to carry the label, and
  // the ghost would read as unlabeled (which arm is which?).
  trackLabel?: StepTrackKind
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

// Lane offsets for a fork's two tracks (the condition's met/not-met pair),
// centered around the main line (lane 0).
function trackLanes(fork: StepFork): [number, number] {
  void fork
  return [-1, 1]
}

function layoutTrack(
  steps: CampaignStep[],
  startDepth: number,
  lane: number,
  interactive: boolean,
  trackLabel: StepTrackKind,
  forkStepId: string,
  trackId: string
): { nodes: SequenceNode[]; edges: Edge[]; endDepth: number; lastId: string | undefined } {
  const nodes: SequenceNode[] = []
  const edges: Edge[] = []
  let depth = startDepth
  let prevId: string | undefined
  steps.forEach((step) => {
    nodes.push(stepNode(step, depth, lane, { trackLabel }))
    const source = prevId ?? forkStepId
    edges.push({ id: `${source}->${step.id}`, source, target: step.id })
    prevId = step.id
    depth += 1
  })
  if (interactive) {
    const ghostId = `add-track-${trackId}`
    const source = prevId ?? forkStepId
    // Sit halfway below the last real step in the track, so the "+" reads
    // as living on the connector line rather than owning its own row.
    nodes.push(
      addNode(ghostId, depth - 0.5, lane, {
        kind: "add",
        trackId,
        forkStepId,
        afterStepId: prevId,
        trackLabel,
      })
    )
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
  // A Set, not an array — when two tracks are both still empty (e.g. right
  // after adding a condition), they'd otherwise both resolve to the same
  // anchor step id, producing a duplicate edge into the trailing ghost.
  const rejoinSources = new Set<string>()

  step.fork.tracks.forEach((track, i) => {
    const result = layoutTrack(
      track.steps,
      depth + 1,
      lanes[i],
      interactive,
      track.kind,
      step.id,
      track.id
    )
    nodes.push(...result.nodes)
    edges.push(...result.edges)
    maxRejoinDepth = Math.max(maxRejoinDepth, result.endDepth)
    rejoinSources.add(result.lastId ?? step.id)
  })

  return {
    nodes,
    edges,
    nextDepth: maxRejoinDepth,
    rejoinSources: [...rejoinSources],
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
    const result = layoutStep(step, depth, opts.interactive)
    nodes.push(...result.nodes)
    edges.push(...result.edges)

    for (const src of pendingSources) {
      edges.push({ id: `${src}->${step.id}`, source: src, target: step.id })
    }

    depth = result.nextDepth

    if (opts.interactive) {
      // "Add Step" ghost — sits right after this step (and its tracks),
      // doubling as the "insert here" affordance and, for the last step,
      // the trailing "append" button. Positioned halfway between this step
      // and the next so it reads as living on their connector line, not as
      // owning its own row. A parallel group renders inside a taller
      // grouping box (label + padding + border on top of the card itself),
      // so it gets pushed further down — there's plenty of unused space
      // before the next real row regardless.
      const ghostId = `add-after-${step.id}`
      const ghostOffset = step.parallelSteps?.length ? 0.1 : 0.5
      const ghostDepth = depth - ghostOffset
      nodes.push(addNode(ghostId, ghostDepth, 0, { kind: "add", afterStepId: step.id }))
      for (const src of result.rejoinSources) {
        edges.push({ id: `${src}->${ghostId}`, source: src, target: ghostId })
      }
      pendingSources = [ghostId]
      // Old behavior reserved a full extra row (depth += 1) past the ghost
      // before the next real card, leaving a lot of dead space on the
      // connector line. GHOST_TRAILING_GAP is ~80% smaller than that.
      depth = ghostDepth + GHOST_TRAILING_GAP
    } else {
      pendingSources = result.rejoinSources
    }
  })

  return { nodes, edges }
}
