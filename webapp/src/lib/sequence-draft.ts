// Local, session-only draft state for a campaign's Sequence tab. Every edit
// (structural or field-level) mutates this draft, not the real store —
// nothing reaches the campaign until `apply()` is called. Mirrors
// campaignStore's step/fork mutators 1:1, operating on local state via the
// same tree-editing helper the real store uses, so behavior can't drift.

import * as React from "react"

import { campaignStore, uid, updateStepTree, AI_VOICES, CONDITION_TRACK_KINDS } from "@/lib/store"
import { requiresLinkedInConnection, stepContainsConnect } from "@/lib/step-channels"
import type { CampaignStep, ConditionKind, StepChannel, StepTypeSelection } from "@/lib/types"

// The action-variant fields a freshly-created step can be seeded with —
// everything in StepTypeSelection except the channel itself, which every
// creation method below already takes as its own argument.
type StepExtra = Pick<StepTypeSelection, "linkedinAction" | "whatsappAction">

export interface SequenceDraftApi {
  steps: CampaignStep[]
  dirty: boolean
  addStep(channel: StepChannel, extra?: StepExtra): void
  insertStep(at: number, channel: StepChannel, extra?: StepExtra): void
  addStepFromTemplate(data: {
    channel: StepChannel
    subject?: string
    body: string
    aiPrompt?: string
  }): CampaignStep
  // Returns true when the patch retyped the step into a LinkedIn message/
  // voice message that needed (and got) an auto-inserted connect gate ahead
  // of it — callers use this to surface the same "connect step added" toast
  // the step-type picker shows for a fresh add via addConnectGatedStep.
  updateStep(stepId: string, patch: Partial<CampaignStep>): boolean
  removeStep(stepId: string): void
  // Inserts a copy of the step (and, recursively, its own fork tracks /
  // parallel siblings, each with fresh ids) directly after the original.
  duplicateStep(stepId: string): void
  moveStep(stepId: string, dir: -1 | 1): void
  addCondition(stepId: string, condition: ConditionKind): void
  removeFork(stepId: string): void
  // Only meaningful on a step whose fork.condition is "accept" — how long
  // to wait for the LinkedIn connection before treating it as not made.
  updateForkWithinDays(stepId: string, days: number): void
  addForkStep(stepId: string, trackId: string, channel: StepChannel, extra?: StepExtra): void
  addParallelStep(stepId: string, channel: StepChannel, extra?: StepExtra): void
  // Inserts a LinkedIn Connect step, forked into "accepted"/"not accepted"
  // tracks, with the originally-picked step placed on the accepted side —
  // the connection-requiring LinkedIn actions (message/voice message) can't
  // run before the prospect has accepted, so the step picker routes those
  // selections through here instead of a plain addStep/insertStep.
  addConnectGatedStep(selection: StepTypeSelection, afterStepId?: string): void
  replaceSteps(steps: CampaignStep[]): void
  apply(): void
  discard(): void
}

function newStep(channel: StepChannel, delayDays: number, extra?: StepExtra): CampaignStep {
  return {
    id: uid("s"),
    channel,
    delayDays,
    subject: "",
    body: "",
    ...(extra?.linkedinAction ? { linkedinAction: extra.linkedinAction } : {}),
    ...(extra?.whatsappAction ? { whatsappAction: extra.whatsappAction } : {}),
    ...(channel === "manual" ? { isManualTask: true } : {}),
    ...(channel === "ai_call" ? { aiVoice: AI_VOICES[0] } : {}),
  }
}

// Deep-clones a step with fresh ids throughout — including any nested fork
// tracks and parallel siblings — so a duplicate never collides with the
// original, matching the "fresh id per node" invariant newStep()/
// addCondition() already rely on.
function cloneStepWithNewIds(step: CampaignStep): CampaignStep {
  return {
    ...step,
    id: uid("s"),
    ...(step.parallelSteps
      ? { parallelSteps: step.parallelSteps.map(cloneStepWithNewIds) }
      : {}),
    ...(step.fork
      ? {
          fork: {
            ...step.fork,
            tracks: step.fork.tracks.map((t) => ({
              ...t,
              id: uid("trk"),
              steps: t.steps.map(cloneStepWithNewIds),
            })),
          },
        }
      : {}),
  }
}

export function useSequenceDraft(
  campaignId: string,
  appliedSteps: CampaignStep[],
  // Overrides how apply() persists the draft. Defaults to writing into the
  // real campaign store — the only behavior this hook had before a second
  // call site (the standalone sequence-library editor, which has no
  // campaign to write into) needed a different destination.
  onApply?: (steps: CampaignStep[]) => void
): SequenceDraftApi {
  const [state, setState] = React.useState(() => ({
    campaignId,
    baseline: appliedSteps,
    draft: appliedSteps,
  }))
  // Reset the draft whenever the campaign identity changes — the render-
  // time-check pattern this codebase already uses for dialog resets
  // (`wasOpen`), generalized to "reset when the identity key changes."
  if (state.campaignId !== campaignId) {
    setState({ campaignId, baseline: appliedSteps, draft: appliedSteps })
  }

  const setDraft = React.useCallback((next: CampaignStep[]) => {
    setState((s) => ({ ...s, draft: next }))
  }, [])

  return {
    steps: state.draft,
    dirty: state.draft !== state.baseline,
    addStep(channel, extra) {
      setDraft([...state.draft, newStep(channel, state.draft.length === 0 ? 0 : 3, extra)])
    },
    insertStep(at, channel, extra) {
      const next = [...state.draft]
      next.splice(at, 0, newStep(channel, at === 0 ? 0 : 3, extra))
      setDraft(next)
    },
    addStepFromTemplate(data) {
      const step: CampaignStep = {
        id: uid("s"),
        channel: data.channel,
        delayDays: state.draft.length === 0 ? 0 : 3,
        subject: data.subject ?? "",
        body: data.body,
        // Carried in here rather than via a follow-up updateStep — two
        // setDraft calls in one handler both close over the same stale
        // state.draft, so the second would silently clobber the first.
        ...(data.aiPrompt ? { aiPrompt: data.aiPrompt } : {}),
      }
      setDraft([...state.draft, step])
      return step
    },
    updateStep(stepId, patch) {
      // Retyping an existing top-level step into a LinkedIn message/voice
      // message needs the same connect-gating a fresh add gets (see
      // addConnectGatedStep below) — otherwise the picker's gate is easy to
      // route around by adding a plain step of some other type first, then
      // switching its type in the editor. Only a *transition* into that
      // state triggers it (editing body copy on an already-gated step
      // shouldn't re-wrap it), and — matching addConnectGatedStep's own
      // scope — only at the top level; a step inside a fork track or
      // parallel group is left to updateStepTree's plain patch below.
      const topIdx = state.draft.findIndex((s) => s.id === stepId)
      if (topIdx !== -1) {
        const current = state.draft[topIdx]
        const next = { ...current, ...patch }
        const needsGating =
          requiresLinkedInConnection(next.channel, next.linkedinAction) &&
          !requiresLinkedInConnection(current.channel, current.linkedinAction) &&
          !state.draft.slice(0, topIdx).some(stepContainsConnect)
        if (needsGating) {
          const connectStep = newStep("linkedin_message", topIdx === 0 ? 0 : 3, {
            linkedinAction: "connect",
          })
          const [metKind, notMetKind] = CONDITION_TRACK_KINDS.accept
          connectStep.fork = {
            condition: "accept",
            tracks: [
              // A displaced first step loses its "sends immediately" delay
              // to the new connect step ahead of it — matches
              // addConnectGatedStep's target, which is never delay 0 either.
              { id: uid("trk"), kind: metKind, steps: [{ ...next, delayDays: topIdx === 0 ? 3 : next.delayDays }] },
              { id: uid("trk"), kind: notMetKind, steps: [] },
            ],
            withinDays: 4,
          }
          const nextDraft = [...state.draft]
          nextDraft.splice(topIdx, 1, connectStep)
          setDraft(nextDraft)
          return true
        }
      }
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
        )
      )
      return false
    },
    removeStep(stepId) {
      setDraft(updateStepTree(state.draft, stepId, (list, i) => list.filter((_, idx) => idx !== i)))
    },
    duplicateStep(stepId) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) => {
          const next = [...list]
          next.splice(i + 1, 0, cloneStepWithNewIds(list[i]))
          return next
        })
      )
    },
    moveStep(stepId, dir) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) => {
          const target = i + dir
          if (target < 0 || target >= list.length) return list
          const next = [...list]
          const [moved] = next.splice(i, 1)
          next.splice(target, 0, moved)
          return next
        })
      )
    },
    addCondition(stepId, condition) {
      const [metKind, notMetKind] = CONDITION_TRACK_KINDS[condition]
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  fork: {
                    condition,
                    tracks: [
                      { id: uid("trk"), kind: metKind, steps: [] },
                      { id: uid("trk"), kind: notMetKind, steps: [] },
                    ],
                    ...(condition === "accept" ? { withinDays: 4 } : {}),
                  },
                }
              : s
          )
        )
      )
    },
    removeFork(stepId) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) => (idx === i ? { ...s, fork: undefined } : s))
        )
      )
    },
    updateForkWithinDays(stepId, days) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) =>
            idx === i && s.fork ? { ...s, fork: { ...s.fork, withinDays: days } } : s
          )
        )
      )
    },
    addForkStep(stepId, trackId, channel, extra) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) => {
            if (idx !== i || !s.fork) return s
            const step = newStep(channel, 3, extra)
            return {
              ...s,
              fork: {
                ...s.fork,
                tracks: s.fork.tracks.map((t) =>
                  t.id === trackId ? { ...t, steps: [...t.steps, step] } : t
                ),
              },
            }
          })
        )
      )
    },
    addParallelStep(stepId, channel, extra) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) =>
            idx === i
              ? { ...s, parallelSteps: [...(s.parallelSteps ?? []), newStep(channel, 0, extra)] }
              : s
          )
        )
      )
    },
    addConnectGatedStep(selection, afterStepId) {
      const isFirst = state.draft.length === 0 && !afterStepId
      const connectStep = newStep("linkedin_message", isFirst ? 0 : 3, { linkedinAction: "connect" })
      const target = newStep(selection.channel, 3, {
        linkedinAction: selection.linkedinAction,
        whatsappAction: selection.whatsappAction,
      })
      const [metKind, notMetKind] = CONDITION_TRACK_KINDS.accept
      connectStep.fork = {
        condition: "accept",
        tracks: [
          { id: uid("trk"), kind: metKind, steps: [target] },
          { id: uid("trk"), kind: notMetKind, steps: [] },
        ],
        withinDays: 4,
      }
      if (afterStepId) {
        const idx = state.draft.findIndex((s) => s.id === afterStepId)
        const next = [...state.draft]
        next.splice(idx + 1, 0, connectStep)
        setDraft(next)
      } else {
        setDraft([...state.draft, connectStep])
      }
    },
    replaceSteps(steps) {
      setDraft(steps)
    },
    apply() {
      if (onApply) onApply(state.draft)
      else campaignStore.update(campaignId, { steps: state.draft })
      setState((s) => ({ ...s, baseline: s.draft }))
    },
    discard() {
      setState((s) => ({ ...s, draft: s.baseline }))
    },
  }
}
