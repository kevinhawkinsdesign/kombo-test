// Sequence templates — a whole campaign sequence (steps, delays, message
// content) saved under a name so it can be reused when creating the next
// campaign or copied into an existing one. Mirrors the localStorage-backed
// prompt-template store.

import * as React from "react"

import type { CampaignStep } from "@/lib/types"

export interface SequenceTemplate {
  id: string
  name: string
  // Step ids inside a template are placeholders — every insert re-clones the
  // steps with fresh ids via cloneSequenceSteps().
  steps: CampaignStep[]
  updatedAt: string
}

// Seeded templates with real message content so the pickers demo well.
const SEED: SequenceTemplate[] = [
  {
    id: "sq_cold_outbound",
    name: "Cold outbound — 4 touches",
    steps: [
      {
        id: "sq1_s1",
        channel: "email",
        delayDays: 0,
        subject: "{{first_name}}, quick question about {{company}}",
        body: "Hi {{first_name}},\n\nMost teams like {{company}}'s lose hours every week to manual prospect research. Kombo automates the digging so reps spend that time selling.\n\nWorth a quick look?\n\n{{sender}}",
      },
      {
        id: "sq1_s2",
        channel: "linkedin_message",
        delayDays: 3,
        body: "Hi {{first_name}} — floated an idea over email about how {{company}} could speed up pipeline generation. Happy to share the 2-minute version here if that's easier.",
      },
      {
        id: "sq1_s3",
        channel: "email",
        delayDays: 4,
        subject: "Re: quick question about {{company}}",
        body: "Hi {{first_name}},\n\nCircling back — a revenue team similar to {{company}} used Kombo to triple their qualified pipeline in a quarter.\n\nOpen to 15 minutes this week?\n\n{{sender}}",
      },
      {
        id: "sq1_s4",
        channel: "call",
        delayDays: 3,
        body: "Quick intro call — reference the two emails and the LinkedIn note.",
      },
    ],
    updatedAt: "2026-06-30T09:00:00Z",
  },
  {
    id: "sq_inbound_speed",
    name: "Inbound speed-to-lead",
    steps: [
      {
        id: "sq2_s1",
        channel: "email",
        delayDays: 0,
        subject: "Following up on your request, {{first_name}}",
        body: "Hi {{first_name}},\n\nThanks for reaching out — happy to show you how Kombo fits {{company}}. Does tomorrow morning or afternoon work better?\n\n{{sender}}",
      },
      {
        id: "sq2_s2",
        channel: "call",
        delayDays: 0,
        body: "Call while the request is hot — reference the form they submitted.",
      },
      {
        id: "sq2_s3",
        channel: "email",
        delayDays: 2,
        subject: "Still interested, {{first_name}}?",
        body: "Hi {{first_name}},\n\nTried to reach you by phone — still keen to walk {{company}} through Kombo whenever suits. Here's my calendar: {{calendar_link}}.\n\n{{sender}}",
      },
    ],
    updatedAt: "2026-06-26T14:00:00Z",
  },
  {
    id: "sq_event_followup",
    name: "Event follow-up",
    steps: [
      {
        id: "sq3_s1",
        channel: "email",
        delayDays: 0,
        subject: "Great meeting you, {{first_name}}",
        body: "Hi {{first_name}},\n\nGreat talking at the booth — as promised, here's how Kombo helps teams like {{company}} turn conversations into pipeline.\n\nShall we grab 15 minutes this week?\n\n{{sender}}",
      },
      {
        id: "sq3_s2",
        channel: "linkedin_message",
        delayDays: 2,
        body: "Hi {{first_name}} — good to meet at the event! Sent you a note by email; happy to continue here too.",
      },
      {
        id: "sq3_s3",
        channel: "email",
        delayDays: 4,
        subject: "The demo we talked about",
        body: "Hi {{first_name}},\n\nBefore the event buzz fades — want me to set up that walkthrough for {{company}}? Takes 15 minutes and I'll tailor it to what you told me.\n\n{{sender}}",
      },
    ],
    updatedAt: "2026-06-20T10:00:00Z",
  },
]

const KEY = "kombo_sequence_templates_v1"

function load(): SequenceTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as SequenceTemplate[]
  } catch {
    /* ignore */
  }
  return SEED
}

let state: SequenceTemplate[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function uid(): string {
  return `sq_${state.length + 1}_${state.reduce((n, t) => n + t.id.length, 0)}`
}

// Deep-copies a step list with fresh ids (branch tracks included), so a
// campaign, a template, and every insert of that template never share step
// identity.
let cloneCounter = 0
export function cloneSequenceSteps(steps: CampaignStep[]): CampaignStep[] {
  return steps.map((s) => {
    cloneCounter += 1
    return {
      ...s,
      id: `s_c${cloneCounter}_${Date.now().toString(36)}`,
      branch: s.branch
        ? {
            replySteps: cloneSequenceSteps(s.branch.replySteps),
            noReplySteps: cloneSequenceSteps(s.branch.noReplySteps),
          }
        : undefined,
    }
  })
}

export const sequenceTemplateStore = {
  create(name: string, steps: CampaignStep[]): SequenceTemplate {
    const record: SequenceTemplate = {
      id: uid(),
      name,
      steps: cloneSequenceSteps(steps),
      updatedAt: new Date().toISOString(),
    }
    state = [record, ...state]
    emit()
    return record
  },
  remove(id: string): void {
    state = state.filter((t) => t.id !== id)
    emit()
  },
}

export function useSequenceTemplates(): SequenceTemplate[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
