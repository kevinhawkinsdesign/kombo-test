// Reusable outreach sequences — the saved cadences a campaign runs. Mirrors the
// Kombo extension's multi-step "Custom Campaign" builder: an ordered set of
// channel steps (email, LinkedIn, call, WhatsApp, AI call) with waits between.

import * as React from "react"

import type { SequenceChannelType } from "./types"

export interface SequenceItem {
  id: string
  name: string
  description: string
  steps: SequenceChannelType[] // ordered channels (includes "wait" markers)
  campaignsUsing: number
  replyRate: number // %
  updatedAt: string
}

const SEED: SequenceItem[] = [
  {
    id: "seq_1",
    name: "Enterprise CRO Outbound",
    description: "Multi-touch cadence for senior revenue leaders at enterprise accounts.",
    steps: ["email", "wait", "linkedin", "wait", "email"],
    campaignsUsing: 2,
    replyRate: 18,
    updatedAt: "2026-06-18T10:00:00Z",
  },
  {
    id: "seq_2",
    name: "Inbound speed-to-lead",
    description: "Fast follow-up for inbound demo requests — email then a quick call.",
    steps: ["email", "call", "wait", "email"],
    campaignsUsing: 1,
    replyRate: 31,
    updatedAt: "2026-06-15T09:30:00Z",
  },
  {
    id: "seq_3",
    name: "LinkedIn-led warm intro",
    description: "Connect first, then layer email — best for warm or referred prospects.",
    steps: ["linkedin", "wait", "linkedin", "email"],
    campaignsUsing: 3,
    replyRate: 24,
    updatedAt: "2026-06-12T14:10:00Z",
  },
  {
    id: "seq_4",
    name: "Re-engagement / revive",
    description: "Win back cold or stalled prospects with a break-up email and an AI call.",
    steps: ["email", "wait", "ai_call", "wait", "email"],
    campaignsUsing: 1,
    replyRate: 12,
    updatedAt: "2026-06-09T16:45:00Z",
  },
]

const KEY = "kombo_sequences_v1"

function load(): SequenceItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as SequenceItem[]
  } catch {
    /* ignore */
  }
  return SEED
}

let state: SequenceItem[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

let counter = Date.now()
function uid() {
  counter += 1
  return `seq_${counter.toString(36)}`
}

export const sequenceStore = {
  create(data: Pick<SequenceItem, "name" | "description"> & Partial<SequenceItem>): SequenceItem {
    const item: SequenceItem = {
      id: uid(),
      name: data.name,
      description: data.description,
      steps: data.steps ?? ["email"],
      campaignsUsing: data.campaignsUsing ?? 0,
      replyRate: data.replyRate ?? 0,
      updatedAt: new Date().toISOString(),
    }
    state = [item, ...state]
    emit()
    return item
  },
  duplicate(id: string): SequenceItem | undefined {
    const src = state.find((s) => s.id === id)
    if (!src) return undefined
    const copy: SequenceItem = {
      ...src,
      id: uid(),
      name: `${src.name} (copy)`,
      campaignsUsing: 0,
      updatedAt: new Date().toISOString(),
    }
    state = [copy, ...state]
    emit()
    return copy
  },
  update(id: string, patch: Partial<SequenceItem>): void {
    state = state.map((s) =>
      s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
    )
    emit()
  },
  remove(id: string): void {
    state = state.filter((s) => s.id !== id)
    emit()
  },
}

export function useSequences(): SequenceItem[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
