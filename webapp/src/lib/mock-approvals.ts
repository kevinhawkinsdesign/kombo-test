// Human-in-the-loop approvals. Before Kai takes an irreversible action on your
// behalf (send a sequence, enroll a list, sync to CRM), it queues an approval so
// you stay in charge. Automations in "ask" mode route their runs through here;
// "auto" automations skip it.

import * as React from "react"

export type ApprovalStatus = "pending" | "approved" | "denied"

export interface PendingApproval {
  id: string
  action: string // "Send email sequence"
  target: string // "142 contacts in \"Fintech Seed\" list"
  detail: string // why this surfaced / what Kai prepared
  trigger: string // the signal/automation that proposed it
  count: number // contacts/companies affected
  irreversible: boolean
  status: ApprovalStatus
  createdAt: string
  resolvedAt?: string
}

const KEY = "kombo_approvals_v1"

const SEED: PendingApproval[] = [
  {
    id: "ap_1",
    action: "Send email sequence",
    target: '142 contacts in "Fintech Seed" list',
    detail:
      "142 net-new contacts matched your Fintech Seed playlist and were enriched. Kai drafted a 3-step sequence and is ready to send.",
    trigger: "Playlist · Fintech Seed · net-new contacts",
    count: 142,
    irreversible: true,
    status: "pending",
    createdAt: "2026-06-23T08:10:00Z",
  },
  {
    id: "ap_2",
    action: "Enrich & sync to CRM",
    target: '38 companies from "Headcount growth 40%+"',
    detail:
      "38 fast-growing companies entered your saved search. Enriching uses ~76 credits, then syncs them to Salesforce as new accounts.",
    trigger: "Saved search · Headcount growth 40%+",
    count: 38,
    irreversible: false,
    status: "pending",
    createdAt: "2026-06-23T07:40:00Z",
  },
  {
    id: "ap_3",
    action: "Start re-engagement sequence",
    target: "Grace Liu · Betterfly",
    detail:
      "Closed-lost 7 months ago over budget. Betterfly just announced a transformation budget — Kai wants to re-open with a warm note.",
    trigger: "Signal · Budget approved",
    count: 1,
    irreversible: true,
    status: "pending",
    createdAt: "2026-06-22T18:25:00Z",
  },
]

function load(): PendingApproval[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as PendingApproval[]
  } catch {
    /* ignore malformed storage */
  }
  return SEED
}

let state: PendingApproval[] = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `ap_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const approvalStore = {
  create(
    data: Omit<PendingApproval, "id" | "status" | "createdAt">
  ): PendingApproval {
    const approval: PendingApproval = {
      ...data,
      id: uid(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    state = [approval, ...state]
    emit()
    return approval
  },
  approve(id: string): void {
    state = state.map((a) =>
      a.id === id
        ? { ...a, status: "approved", resolvedAt: new Date().toISOString() }
        : a
    )
    emit()
  },
  deny(id: string): void {
    state = state.map((a) =>
      a.id === id
        ? { ...a, status: "denied", resolvedAt: new Date().toISOString() }
        : a
    )
    emit()
  },
  remove(id: string): void {
    state = state.filter((a) => a.id !== id)
    emit()
  },
}

export function useApprovals(): PendingApproval[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}

export function pendingApprovalCount(): number {
  return state.filter((a) => a.status === "pending").length
}
