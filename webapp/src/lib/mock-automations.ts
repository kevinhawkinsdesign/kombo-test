// Automations / agents — the "playlist" concept: a trigger feeds a chain of
// steps (search → enrich → list → campaign → CRM), each switchable on/off, that
// runs on a cadence. Users can build from a library of templates, monitor what's
// running, and turn the whole thing — or individual steps — on and off.

import * as React from "react"

export type StepKind = "search" | "enrich" | "list" | "campaign" | "crm"
export type AutomationStatus = "running" | "paused" | "draft"
export type Cadence = "realtime" | "daily" | "weekly"
// "auto" runs without intervention; "ask" queues each irreversible run for
// approval before it executes (human-in-the-loop).
export type ApprovalMode = "auto" | "ask"

export interface AutomationStep {
  kind: StepKind
  enabled: boolean
}

export interface Automation {
  id: string
  name: string
  description: string
  status: AutomationStatus
  trigger: string
  cadence: Cadence
  steps: AutomationStep[]
  approvalMode: ApprovalMode
  processed: number // total contacts processed
  perWeek: number // throughput estimate
  lastRunAt: string // ISO
}

export interface AutomationTemplate {
  id: string
  name: string
  description: string
  tags: string[]
  trigger: string
  cadence: Cadence
  steps: StepKind[]
}

export const STEP_ORDER: StepKind[] = ["search", "enrich", "list", "campaign", "crm"]

const seedSteps = (kinds: StepKind[], off: StepKind[] = []): AutomationStep[] =>
  kinds.map((kind) => ({ kind, enabled: !off.includes(kind) }))

const SEED: Automation[] = [
  {
    id: "au_1",
    name: "EMEA VP Sales — daily feed",
    description: "Find new VPs of Sales in EMEA SaaS, enrich them, and enroll into the outbound campaign.",
    status: "running",
    trigger: "Saved search · VPs of Sales · EMEA SaaS",
    cadence: "daily",
    steps: seedSteps(["search", "enrich", "list", "campaign", "crm"]),
    approvalMode: "auto",
    processed: 412,
    perWeek: 35,
    lastRunAt: "2026-06-22T06:00:00Z",
  },
  {
    id: "au_2",
    name: "Lookalikes of best customers",
    description: "Every day, surface 10 companies that look like your best customers and add them to a list.",
    status: "running",
    trigger: "Lookalike · Top customers",
    cadence: "daily",
    steps: seedSteps(["search", "enrich", "list"], ["enrich"]),
    approvalMode: "auto",
    processed: 188,
    perWeek: 70,
    lastRunAt: "2026-06-22T06:00:00Z",
  },
  {
    id: "au_3",
    name: "Job-change re-engagement",
    description: "When a known contact changes jobs, enrich the new role and start a re-intro sequence.",
    status: "paused",
    trigger: "Signal · Contact changed jobs",
    cadence: "realtime",
    steps: seedSteps(["enrich", "campaign", "crm"]),
    approvalMode: "ask",
    processed: 64,
    perWeek: 12,
    lastRunAt: "2026-06-20T11:30:00Z",
  },
]

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: "tpl_icp",
    name: "Convert ideal customers with AI sequences",
    description: "When a contact matches your ICP, add them to a list and send an AI-drafted sequence.",
    tags: ["Generate pipeline", "AI"],
    trigger: "Saved search · Your ICP",
    cadence: "daily",
    steps: ["search", "enrich", "list", "campaign"],
  },
  {
    id: "tpl_visitors",
    name: "Engage website visitors",
    description: "Identify companies actively researching your category and reach out automatically.",
    tags: ["Multi-branch", "Intent"],
    trigger: "Signal · High web intent",
    cadence: "realtime",
    steps: ["search", "enrich", "list", "campaign"],
  },
  {
    id: "tpl_hires",
    name: "Target new hires in their first 90 days",
    description: "When a contact enters a new role, add them to a list and enroll an AI-drafted sequence.",
    tags: ["Generate pipeline", "AI"],
    trigger: "Signal · New role",
    cadence: "realtime",
    steps: ["enrich", "list", "campaign", "crm"],
  },
  {
    id: "tpl_growth",
    name: "Engage fast-growing companies",
    description: "Add companies with 40%+ headcount growth to a list, then engage via AI sequences.",
    tags: ["Generate pipeline", "Growth"],
    trigger: "Saved search · Headcount growth",
    cadence: "weekly",
    steps: ["search", "enrich", "list", "campaign"],
  },
  {
    id: "tpl_lookalike",
    name: "Daily lookalikes of your customers",
    description: "Every day, source 10 lookalikes of your best customers and testimonials.",
    tags: ["Lookalike", "Feed"],
    trigger: "Lookalike · Customers & testimonials",
    cadence: "daily",
    steps: ["search", "enrich", "list"],
  },
  {
    id: "tpl_enrich",
    name: "Keep a list enriched",
    description: "Continuously enrich new contacts added to a list and sync them to your CRM.",
    tags: ["Enrichment", "CRM"],
    trigger: "List · New contact added",
    cadence: "realtime",
    steps: ["enrich", "crm"],
  },
]

const KEY = "kombo_automations_v1"

function load(): Automation[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Automation[]
      // Backfill approvalMode for data saved before the field existed.
      return parsed.map((a) => ({ ...a, approvalMode: a.approvalMode ?? "auto" }))
    }
  } catch {
    /* ignore */
  }
  return SEED
}

let state: Automation[] = load()
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
  return `au_${counter.toString(36)}`
}

export const automationStore = {
  createFromTemplate(tpl: AutomationTemplate): Automation {
    const au: Automation = {
      id: uid(),
      name: tpl.name,
      description: tpl.description,
      status: "draft",
      trigger: tpl.trigger,
      cadence: tpl.cadence,
      steps: tpl.steps.map((kind) => ({ kind, enabled: true })),
      approvalMode: "auto",
      processed: 0,
      perWeek: 0,
      lastRunAt: new Date().toISOString(),
    }
    state = [au, ...state]
    emit()
    return au
  },
  create(
    data: Pick<Automation, "name" | "description" | "trigger" | "cadence"> & {
      steps: StepKind[]
      approvalMode?: ApprovalMode
      status?: AutomationStatus
    }
  ): Automation {
    const au: Automation = {
      id: uid(),
      name: data.name,
      description: data.description,
      status: data.status ?? "draft",
      trigger: data.trigger,
      cadence: data.cadence,
      steps: data.steps.map((kind) => ({ kind, enabled: true })),
      approvalMode: data.approvalMode ?? "auto",
      processed: 0,
      perWeek: 0,
      lastRunAt: new Date().toISOString(),
    }
    state = [au, ...state]
    emit()
    return au
  },
  setStatus(id: string, status: AutomationStatus): void {
    state = state.map((a) => (a.id === id ? { ...a, status } : a))
    emit()
  },
  setApprovalMode(id: string, approvalMode: ApprovalMode): void {
    state = state.map((a) => (a.id === id ? { ...a, approvalMode } : a))
    emit()
  },
  toggleStep(id: string, kind: StepKind): void {
    state = state.map((a) =>
      a.id === id
        ? { ...a, steps: a.steps.map((s) => (s.kind === kind ? { ...s, enabled: !s.enabled } : s)) }
        : a
    )
    emit()
  },
  remove(id: string): void {
    state = state.filter((a) => a.id !== id)
    emit()
  },
}

export function useAutomations(): Automation[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
