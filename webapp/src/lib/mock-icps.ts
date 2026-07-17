// Ideal Customer Profiles as a first-class, CRUD-able list — teams sell into
// more than one segment, so the app supports multiple named ICPs with one
// marked primary (used by default for scoring, recommendations, and search).

import * as React from "react"

export interface Icp {
  id: string
  name: string
  color: string
  industries: string[]
  headcount: string
  titles: string[]
  // Who signs off on the deal vs. who shapes the decision without owning
  // budget — distinct from `titles` (the roles the search targets) and
  // scored separately since a champion isn't the same as a buyer.
  decisionMakers: string[]
  influencers: string[]
  seniority: string[]
  regions: string[]
  signals: string[]
  primary?: boolean
}

const SEED: Icp[] = [
  {
    id: "icp_enterprise",
    name: "Enterprise RevLeaders",
    color: "#7c3aed",
    industries: ["B2B SaaS", "Fintech", "Marketplace"],
    headcount: "1,001-5,000",
    titles: ["VP Sales", "CRO", "Head of RevOps"],
    decisionMakers: ["CRO", "VP Sales"],
    influencers: ["RevOps Manager", "Sales Enablement Lead"],
    seniority: ["VP", "C-Level"],
    regions: ["United States", "United Kingdom"],
    signals: ["Hiring sales roles", "Recent funding"],
    primary: true,
  },
  {
    id: "icp_midmarket",
    name: "Mid-market Founders",
    color: "#0ea5e9",
    industries: ["Software", "Professional Services"],
    headcount: "51-200",
    titles: ["Founder", "CEO", "Head of Growth"],
    decisionMakers: ["Founder", "CEO"],
    influencers: ["Head of Growth"],
    seniority: ["Founder", "C-Level"],
    regions: ["Spain", "United States"],
    signals: ["Website intent", "Expanding GTM team"],
  },
]

// Shared AI "get similar" suggestion pools for Decision Makers / Influencers
// tag inputs — used by both the onboarding ICP-builder step and the
// Settings > Value Proposition ICP manager, so a suggestion click behaves
// the same wherever the field appears.
export const DECISION_MAKER_SUGGESTIONS = [
  "VP of Sales",
  "Chief Revenue Officer",
  "Head of RevOps",
  "VP of Marketing",
  "Chief Product Officer",
  "Founder",
  "CEO",
]
export const INFLUENCER_SUGGESTIONS = [
  "Product Manager",
  "Sales Manager",
  "Marketing Manager",
  "RevOps Manager",
  "Engineering Manager",
  "Customer Success Manager",
]

const KEY = "kombo_icps_v1"

function load(): Icp[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Icp[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore malformed storage */
  }
  return SEED
}

let state: Icp[] = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `icp_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

// Guarantee exactly one primary survives any mutation.
function normalize(list: Icp[]): Icp[] {
  if (list.length === 0) return list
  if (list.some((i) => i.primary)) {
    let seen = false
    return list.map((i) => {
      if (i.primary && !seen) {
        seen = true
        return i
      }
      return i.primary ? { ...i, primary: false } : i
    })
  }
  // No primary set — promote the first.
  return list.map((i, idx) => (idx === 0 ? { ...i, primary: true } : i))
}

export const icpStore = {
  create(data: Omit<Icp, "id">): Icp {
    const icp: Icp = { ...data, id: uid() }
    state = normalize([...state, icp])
    emit()
    return icp
  },
  update(id: string, patch: Partial<Omit<Icp, "id">>): void {
    state = normalize(state.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    emit()
  },
  remove(id: string): void {
    state = normalize(state.filter((i) => i.id !== id))
    emit()
  },
  setPrimary(id: string): void {
    state = state.map((i) => ({ ...i, primary: i.id === id }))
    emit()
  },
}

// The active ICP — what scoring, recommendations, and AI writing default to.
export function getPrimaryIcp(): Icp | undefined {
  return state.find((i) => i.primary) ?? state[0]
}

export function useIcps(): Icp[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
