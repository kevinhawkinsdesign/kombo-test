// Converts the tree-shaped CampaignStep list into React Flow's flat
// nodes[]/edges[] shape. Positions are computed, not user-draggable: depth
// (position in a track) maps to Y, lane (which track) maps to X. Forking is
// one level deep everywhere EXCEPT under a LinkedIn-connect ("accept")
// fork, where a track's own trailing step can fork again (reassessing
// connection status after further touches) — recursively, to any depth.
// Each nesting level halves its lane spread so nested tracks never collide
// with a sibling branch's own tracks.
//
// Parallel siblings (CampaignStep.parallelSteps) are not a separate lane —
// they render inside the same node as their anchor step, since they're
// concurrent with it rather than a fork of the sequence.

import type { Edge, Node } from "@xyflow/react"

import type { CampaignStep, StepTrackKind } from "@/lib/types"
import { normalizeChannel } from "@/lib/step-channels"
import { STEP_CREDIT_COST } from "@/lib/store"

// Tall enough to clear a real step card at its tallest (gray timing header
// + icon/title/badges/avatar body, ~140px) with room to spare before the
// "+" ghost/track-label pill sitting halfway between two rows (see addNode
// calls at depth - 0.5) — half of ROW_HEIGHT must exceed the card's own
// height or a nested empty track's label pill renders on top of the card
// above it instead of below it. Also gives fork-branch connector lines
// (which jog through an elbow rather than a straight diagonal) enough
// vertical run to read as one clean turn instead of a cramped zigzag.
export const ROW_HEIGHT = 320
export const LANE_WIDTH = 320
// How far past the trailing "+" ghost the next real card starts, in the
// same row-unit scale as ROW_HEIGHT.
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

function layoutTrack(
  steps: CampaignStep[],
  startDepth: number,
  lane: number,
  spread: number,
  interactive: boolean,
  trackLabel: StepTrackKind,
  forkStepId: string,
  trackId: string
): { nodes: SequenceNode[]; edges: Edge[]; endDepth: number; rejoinSources: string[] } {
  const nodes: SequenceNode[] = []
  const edges: Edge[] = []
  let depth = startDepth
  let prevId: string | undefined
  steps.forEach((step) => {
    nodes.push(stepNode(step, depth, lane, { trackLabel }))
    const source = prevId ?? forkStepId
    // Only the edge straight off the fork anchor actually changes lanes
    // (anchor sits at the fork's own lane, this step at the track's offset
    // one) — give it an elbow instead of a diagonal. Every edge after that
    // is already same-lane, so it stays a plain straight line.
    edges.push({
      id: `${source}->${step.id}`,
      source,
      target: step.id,
      ...(prevId ? {} : { type: "smoothstep" }),
    })
    prevId = step.id
    depth += 1
  })

  const lastStep = steps[steps.length - 1]
  if (lastStep?.fork) {
    // The track's own last step forks again — only reachable for
    // LinkedIn-connect ("accept") forks, the one case the UI offers
    // nesting a condition this deep (reassessing connection status after
    // further touches). Recurse instead of adding a plain trailing "+",
    // halving the lane spread so the nested tracks never collide with a
    // sibling branch's own tracks.
    const nested = layoutFork(lastStep, depth - 1, lane, spread / 2, interactive)
    nodes.push(...nested.nodes)
    edges.push(...nested.edges)
    depth = nested.nextDepth
    if (interactive && nested.rejoinSources.length > 0) {
      const ghostId = `add-after-${lastStep.id}`
      const ghostDepth = depth - 0.5
      nodes.push(
        addNode(ghostId, ghostDepth, lane, { kind: "add", afterStepId: lastStep.id, trackLabel })
      )
      for (const src of nested.rejoinSources) {
        edges.push({ id: `${src}->${ghostId}`, source: src, target: ghostId, type: "smoothstep" })
      }
      depth = ghostDepth + GHOST_TRAILING_GAP
    }
    return { nodes, edges, endDepth: depth, rejoinSources: nested.rejoinSources }
  }

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
    // Only diagonal (lane-changing) when the track is still empty, so the
    // ghost hangs directly off the fork anchor rather than off a same-lane
    // step of its own.
    edges.push({
      id: `${source}->${ghostId}`,
      source,
      target: ghostId,
      ...(prevId ? {} : { type: "smoothstep" }),
    })
  }
  return { nodes, edges, endDepth: depth, rejoinSources: prevId ? [prevId] : [] }
}

interface StepLayout {
  nodes: SequenceNode[]
  edges: Edge[]
  nextDepth: number
  // Node ids that feed into whatever top-level step comes next (or the
  // trailing "add step" ghost, if this is the last one).
  rejoinSources: string[]
}

// Lays out a single step's own fork: two tracks, each starting at `lane -
// spread` / `lane + spread`. Shared by the top-level loop (spread = 1, the
// original ±1-lane-width behavior) and by `layoutTrack` recursing into a
// nested LinkedIn-connect fork (spread halved each level).
function layoutFork(
  step: CampaignStep,
  depth: number,
  lane: number,
  spread: number,
  interactive: boolean
): { nodes: SequenceNode[]; edges: Edge[]; nextDepth: number; rejoinSources: string[] } {
  const fork = step.fork!
  const nodes: SequenceNode[] = []
  const edges: Edge[] = []
  const lanes: [number, number] = [lane - spread, lane + spread]
  let maxRejoinDepth = depth + 1
  // An empty track (right after adding a condition, before either arm has a
  // step yet) contributes no rejoin source at all — falling back to the
  // fork step's own id here used to draw a third, redundant line straight
  // down from the fork step to the trailing "after both tracks" ghost, on
  // top of the two diagonal lines already going to each track's own empty-
  // track ghost. Once a track has a real step, that step becomes the
  // rejoin source as normal.
  const rejoinSources = new Set<string>()

  fork.tracks.forEach((track, i) => {
    const result = layoutTrack(
      track.steps,
      depth + 1,
      lanes[i],
      spread,
      interactive,
      track.kind,
      step.id,
      track.id
    )
    nodes.push(...result.nodes)
    edges.push(...result.edges)
    maxRejoinDepth = Math.max(maxRejoinDepth, result.endDepth)
    result.rejoinSources.forEach((id) => rejoinSources.add(id))
  })

  return {
    nodes,
    edges,
    nextDepth: maxRejoinDepth,
    rejoinSources: [...rejoinSources],
  }
}

function layoutStep(step: CampaignStep, depth: number, interactive: boolean): StepLayout {
  const nodes: SequenceNode[] = [stepNode(step, depth, 0)]

  if (!step.fork) {
    return { nodes, edges: [], nextDepth: depth + 1, rejoinSources: [step.id] }
  }

  const forkResult = layoutFork(step, depth, 0, 1, interactive)
  return {
    nodes: [...nodes, ...forkResult.nodes],
    edges: forkResult.edges,
    nextDepth: forkResult.nextDepth,
    rejoinSources: forkResult.rejoinSources,
  }
}

export function computeLayout(
  steps: CampaignStep[],
  opts: { interactive: boolean }
): { nodes: SequenceNode[]; edges: Edge[] } {
  const nodes: SequenceNode[] = []
  const edges: Edge[] = []

  // A brand-new sequence: nothing to lay out yet — just a single "+" ghost
  // to start the sequence, so the canvas itself is the empty state instead
  // of a separate card-with-buttons.
  if (steps.length === 0) {
    if (opts.interactive) {
      nodes.push(addNode("add-first-step", 0, 0, { kind: "add" }))
    }
    return { nodes, edges }
  }

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
      // A fork whose both tracks are still empty (just added the condition,
      // no step in either arm yet) has no rejoin source at all — the two
      // tracks' own empty-track ghosts are already the only "+" affordances
      // that make sense here. Adding a third ghost below the fork with
      // nothing feeding into it reads as an unattached, floating "+".
      if (step.fork && result.rejoinSources.length === 0) {
        pendingSources = []
        return
      }

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
      // An ordinary connector carries no label — auto-pausing on reply is
      // this app's default, implicit behavior for every step, not a
      // condition the user added, so it doesn't earn a badge of its own.
      // Only an actual fork's tracks (a real condition, whether user-added
      // or the auto-inserted LinkedIn-connect gate) get a label.
      nodes.push(
        addNode(ghostId, ghostDepth, 0, { kind: "add", afterStepId: step.id })
      )
      for (const src of result.rejoinSources) {
        edges.push({
          id: `${src}->${ghostId}`,
          source: src,
          target: ghostId,
          // Rejoin sources sit at offset lanes only when this step forked —
          // an unforked step's single rejoin source (itself) is already at
          // lane 0, same as the ghost, so it stays a plain straight line.
          ...(step.fork ? { type: "smoothstep" } : {}),
        })
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

// Worst-case totals for a prospect completing the whole sequence: total
// elapsed days and total credits spent. A fork's two tracks are mutually
// exclusive per-prospect, so each contributes its own total and only the
// larger one counts toward the worst case — same logic for both days and
// credits. Parallel siblings run alongside their anchor (no extra days) but
// still send their own message, so their credit cost is additive.
export function sequenceTotals(steps: CampaignStep[]): {
  days: number
  credits: number
} {
  let days = 0
  let credits = 0
  for (const step of steps) {
    days += step.delayDays
    credits += STEP_CREDIT_COST[normalizeChannel(step.channel)]
    for (const parallel of step.parallelSteps ?? []) {
      credits += STEP_CREDIT_COST[normalizeChannel(parallel.channel)]
    }
    if (step.fork) {
      const trackTotals = step.fork.tracks.map((t) => sequenceTotals(t.steps))
      days += Math.max(0, ...trackTotals.map((t) => t.days))
      credits += Math.max(0, ...trackTotals.map((t) => t.credits))
    }
  }
  return { days, credits }
}
