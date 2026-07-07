// Follow-up templates — reusable subject/body drafts for the post-call
// follow-up email on Coach recordings. Users can keep several and tweak them
// per call; {{variables}} are filled from the recording when applied.
// Same localStorage pattern as prompt/sequence templates.

import * as React from "react"

export interface FollowUpTemplate {
  id: string
  name: string
  subject: string
  body: string
  updatedAt: string
}

const SEED: FollowUpTemplate[] = [
  {
    id: "ft_thanks_next",
    name: "Thanks + next steps",
    subject: "Following up — {{company}}",
    body: "Hi {{first_name}},\n\nThanks for your time today — great to talk things through with {{company}}.\n\nNext steps:\n{{next_steps}}\n\nBest,\n{{sender}}",
    updatedAt: "2026-06-25T10:00:00Z",
  },
  {
    id: "ft_demo_recap",
    name: "Demo recap + resources",
    subject: "Recap and the resources I promised — {{company}}",
    body: "Hi {{first_name}},\n\nQuick recap of what we covered, plus the resources I promised.\n\n{{next_steps}}\n\nIf anything else would help before we regroup, just reply here.\n\nBest,\n{{sender}}",
    updatedAt: "2026-06-20T09:00:00Z",
  },
]

const KEY = "kombo_followup_templates_v1"

function load(): FollowUpTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as FollowUpTemplate[]
  } catch {
    /* ignore */
  }
  return SEED
}

let state: FollowUpTemplate[] = load()
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
  return `ft_${state.length + 1}_${state.reduce((n, t) => n + t.id.length, 0)}`
}

export const followUpTemplateStore = {
  create(data: Omit<FollowUpTemplate, "id" | "updatedAt">): FollowUpTemplate {
    const record: FollowUpTemplate = {
      ...data,
      id: uid(),
      updatedAt: new Date().toISOString(),
    }
    state = [record, ...state]
    emit()
    return record
  },
  update(id: string, patch: Partial<Omit<FollowUpTemplate, "id">>): void {
    state = state.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
    )
    emit()
  },
  remove(id: string): void {
    state = state.filter((t) => t.id !== id)
    emit()
  },
}

export function useFollowUpTemplates(): FollowUpTemplate[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
