// Local, session-only draft state for a campaign's Sequence tab. Every edit
// (structural or field-level) mutates this draft, not the real store —
// nothing reaches the campaign until `apply()` is called. Mirrors
// campaignStore's step/fork mutators 1:1, operating on local state via the
// same tree-editing helper the real store uses, so behavior can't drift.

import * as React from "react"

import { campaignStore, uid, updateStepTree, AI_VOICES, CONDITION_TRACK_KINDS } from "@/lib/store"
import type { CampaignStep, ConditionKind, StepChannel } from "@/lib/types"

export interface SequenceDraftApi {
  steps: CampaignStep[]
  dirty: boolean
  addStep(channel: StepChannel): void
  insertStep(at: number, channel: StepChannel): void
  addStepFromTemplate(data: { channel: StepChannel; subject?: string; body: string }): CampaignStep
  updateStep(stepId: string, patch: Partial<CampaignStep>): void
  removeStep(stepId: string): void
  moveStep(stepId: string, dir: -1 | 1): void
  addCondition(stepId: string, condition: ConditionKind): void
  removeFork(stepId: string): void
  addForkStep(stepId: string, trackId: string, channel: StepChannel): void
  addParallelStep(stepId: string, channel: StepChannel): void
  replaceSteps(steps: CampaignStep[]): void
  apply(): void
  discard(): void
}

function newStep(channel: StepChannel, delayDays: number): CampaignStep {
  return {
    id: uid("s"),
    channel,
    delayDays,
    subject: "",
    body: "",
    ...(channel === "manual" ? { isManualTask: true } : {}),
    ...(channel === "ai_call" ? { aiVoice: AI_VOICES[0] } : {}),
  }
}

export function useSequenceDraft(
  campaignId: string,
  appliedSteps: CampaignStep[]
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
    addStep(channel) {
      setDraft([...state.draft, newStep(channel, state.draft.length === 0 ? 0 : 3)])
    },
    insertStep(at, channel) {
      const next = [...state.draft]
      next.splice(at, 0, newStep(channel, at === 0 ? 0 : 3))
      setDraft(next)
    },
    addStepFromTemplate(data) {
      const step: CampaignStep = {
        id: uid("s"),
        channel: data.channel,
        delayDays: state.draft.length === 0 ? 0 : 3,
        subject: data.subject ?? "",
        body: data.body,
      }
      setDraft([...state.draft, step])
      return step
    },
    updateStep(stepId, patch) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
        )
      )
    },
    removeStep(stepId) {
      setDraft(updateStepTree(state.draft, stepId, (list, i) => list.filter((_, idx) => idx !== i)))
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
    addForkStep(stepId, trackId, channel) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) => {
            if (idx !== i || !s.fork) return s
            const step = newStep(channel, 3)
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
    addParallelStep(stepId, channel) {
      setDraft(
        updateStepTree(state.draft, stepId, (list, i) =>
          list.map((s, idx) =>
            idx === i
              ? { ...s, parallelSteps: [...(s.parallelSteps ?? []), newStep(channel, 0)] }
              : s
          )
        )
      )
    },
    replaceSteps(steps) {
      setDraft(steps)
    },
    apply() {
      campaignStore.update(campaignId, { steps: state.draft })
      setState((s) => ({ ...s, baseline: s.draft }))
    },
    discard() {
      setState((s) => ({ ...s, draft: s.baseline }))
    },
  }
}
