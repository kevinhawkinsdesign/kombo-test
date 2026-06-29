import type { BuilderStep, SequenceChannelType, StepTriggerType } from "./types"

export const SEQUENCE_CHANNELS: SequenceChannelType[] = [
  "email",
  "linkedin",
  "whatsapp",
  "call",
  "ai_call",
  "wait",
]

export const STEP_TRIGGERS: StepTriggerType[] = [
  "delay",
  "on_no_reply",
  "on_open",
  "on_click",
  "on_reply",
  "on_signal",
  "manual",
]

// Stable-ish ids for newly added steps (seeded once at module load).
let seq = Date.now()
export function newStepId(): string {
  seq += 1
  return `step_${seq.toString(36)}`
}

/** A realistic starter sequence — multi-channel with a trigger and a break. */
export function defaultSequence(): BuilderStep[] {
  return [
    {
      id: newStepId(),
      channel: "email",
      title: "Saw the new HQ post",
      subtitle: "Personalized on the company announcement",
      trigger: { type: "delay", days: 0 },
    },
    {
      id: newStepId(),
      channel: "whatsapp",
      title: "Quick intro message",
      subtitle: "References the new funding round",
      trigger: { type: "delay", days: 2 },
    },
    {
      id: newStepId(),
      channel: "linkedin",
      title: "Connect + note",
      subtitle: "Runs in parallel with the WhatsApp intro",
      trigger: { type: "delay", days: 0 },
      parallel: true,
    },
    {
      id: newStepId(),
      channel: "email",
      title: "Case study (live)",
      subtitle: "Social proof from a lookalike account",
      trigger: { type: "delay", days: 2 },
    },
    {
      id: newStepId(),
      channel: "ai_call",
      title: "30-second check-in",
      subtitle: "Only fires if they haven't replied",
      trigger: { type: "on_no_reply", days: 3 },
    },
    {
      id: newStepId(),
      channel: "wait",
      title: "Pause + review",
      subtitle: "Re-score & recommend the next move",
      trigger: { type: "delay", days: 6 },
    },
  ]
}

/**
 * Day label for each step: 1-based, accumulating delay days. Parallel steps
 * share the day of the step they fan out from (they run at the same time).
 */
export function dayLabels(steps: BuilderStep[]): number[] {
  let day = 1
  return steps.map((step, i) => {
    if (i === 0) {
      day = 1 + (step.trigger.days ?? 0)
      return day
    }
    if (step.parallel) return day
    day += step.trigger.days ?? 0
    return day
  })
}
