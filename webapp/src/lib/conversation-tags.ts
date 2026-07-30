// Conversation tags — user-defined prompts the AI uses to auto-classify
// conversation replies (e.g. "Bad Timing", "Referred"). Distinct from
// Outcomes (lib/conv-status.ts), which is a fixed, non-customizable 8-value
// funnel enum wired into the Inbox "Outcomes" list and the Home "Deal Flow"
// board — these are workspace-defined and configured entirely from the
// Playbook page. Modeled after lib/prompt-templates.ts: localStorage-backed
// CRUD store + useSyncExternalStore hook.

import * as React from "react"

export type TagCategory = "positive" | "neutral" | "negative"

export interface ConversationTag {
  id: string
  /** User-entered — plain string, not a COPY key (same treatment as
   *  PromptTemplate.name / EmailTemplate.name: workspace content, not UI chrome). */
  name: string
  /** User-entered classification instruction. */
  prompt: string
  category: TagCategory
  active: boolean
  createdAt: string
  updatedAt: string
}

const SEED: ConversationTag[] = [
  {
    id: "ctag_interested",
    name: "Interested",
    prompt:
      "Classify replies where the prospect expresses genuine interest in learning more or seeing a demo.",
    category: "positive",
    active: true,
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "ctag_meeting_booked",
    name: "Meeting Booked",
    prompt:
      "Classify replies where the prospect confirms or schedules a call or meeting.",
    category: "positive",
    active: true,
    createdAt: "2026-06-02T09:00:00Z",
    updatedAt: "2026-06-02T09:00:00Z",
  },
  {
    id: "ctag_referred",
    name: "Referred",
    prompt:
      "Classify replies where the prospect refers you to a colleague or another contact instead of responding themselves.",
    category: "positive",
    active: true,
    createdAt: "2026-06-03T09:00:00Z",
    updatedAt: "2026-06-03T09:00:00Z",
  },
  {
    id: "ctag_bad_timing",
    name: "Bad Timing",
    prompt:
      "Classify replies where the prospect says now isn't a good time — busy, reorganizing, or asking to follow up later — without rejecting the offer outright.",
    category: "neutral",
    active: true,
    createdAt: "2026-06-04T09:00:00Z",
    updatedAt: "2026-06-04T09:00:00Z",
  },
  {
    id: "ctag_not_target_persona",
    name: "Not the Target Persona",
    prompt:
      "Classify replies where the respondent isn't the right person — wrong role, department, or seniority — and may point you toward someone else.",
    category: "neutral",
    active: true,
    createdAt: "2026-06-05T09:00:00Z",
    updatedAt: "2026-06-05T09:00:00Z",
  },
  {
    id: "ctag_out_of_office",
    name: "Out of Office",
    prompt: "Classify automatic out-of-office or away replies.",
    category: "neutral",
    active: true,
    createdAt: "2026-06-06T09:00:00Z",
    updatedAt: "2026-06-06T09:00:00Z",
  },
  {
    id: "ctag_not_interested",
    name: "Not Interested",
    prompt:
      "Classify replies where the prospect explicitly declines or says they're not interested.",
    category: "negative",
    active: true,
    createdAt: "2026-06-07T09:00:00Z",
    updatedAt: "2026-06-07T09:00:00Z",
  },
]

const KEY = "kombo_conversation_tags_v1"

function load(): ConversationTag[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ConversationTag[]
  } catch {
    /* ignore malformed storage */
  }
  return SEED
}

let state: ConversationTag[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

let counter = 0
function uid(): string {
  counter += 1
  return `ctag_new_${counter}_${Date.now().toString(36)}`
}

function create(
  data: Omit<ConversationTag, "id" | "createdAt" | "updatedAt">
): ConversationTag {
  const now = new Date().toISOString()
  const record: ConversationTag = {
    ...data,
    id: uid(),
    createdAt: now,
    updatedAt: now,
  }
  state = [record, ...state]
  emit()
  return record
}

function update(
  id: string,
  patch: Partial<Omit<ConversationTag, "id" | "createdAt">>
): void {
  state = state.map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
  )
  emit()
}

function remove(id: string): void {
  state = state.filter((t) => t.id !== id)
  emit()
}

/** Creates a copy of `id` under a new name (caller supplies the translated
 *  "(copy)" suffix). Returns null if the source no longer exists. */
function duplicate(id: string, name: string): ConversationTag | null {
  const source = state.find((t) => t.id === id)
  if (!source) return null
  return create({
    name,
    prompt: source.prompt,
    category: source.category,
    active: source.active,
  })
}

function toggleActive(id: string): void {
  const target = state.find((t) => t.id === id)
  if (!target) return
  update(id, { active: !target.active })
}

export const conversationTagStore = {
  create,
  update,
  remove,
  duplicate,
  toggleActive,
}

export function useConversationTags(): ConversationTag[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
