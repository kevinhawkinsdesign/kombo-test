// Saved table views — named snapshots of which columns are visible (and their
// order) for a given table. Built on top of useColumnPrefs: applying a view
// just sets the visible column ids. Persisted per table key.

import * as React from "react"

export interface TableView {
  id: string
  tableKey: string
  name: string
  columns: string[]
}

const KEY = "kombo_table_views_v1"

// A few curated starter views for the tables that ship with the demo.
const SEED: TableView[] = [
  {
    id: "tv_co_prospecting",
    tableKey: "companies",
    name: "Prospecting",
    columns: ["industry", "employees", "fundingStage", "headcountGrowth", "intent", "techStack"],
  },
  {
    id: "tv_co_crm",
    tableKey: "companies",
    name: "CRM & pipeline",
    columns: ["tier", "owner", "health", "pipeline", "openDeals", "lastActivity"],
  },
  {
    id: "tv_lp_outreach",
    tableKey: "list-prospects",
    name: "Outreach",
    columns: ["company", "score", "status", "email", "emailStatus", "lastActivity"],
  },
  {
    id: "tv_lp_research",
    tableKey: "list-prospects",
    name: "Research",
    columns: ["title", "seniority", "department", "industry", "headcount", "signals"],
  },
]

function load(): TableView[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as TableView[]
  } catch {
    /* ignore malformed storage */
  }
  return SEED
}

let state: TableView[] = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `tv_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const viewStore = {
  create(tableKey: string, name: string, columns: string[]): TableView {
    const view: TableView = { id: uid(), tableKey, name: name.trim(), columns }
    state = [...state, view]
    emit()
    return view
  },
  rename(id: string, name: string): void {
    const n = name.trim()
    if (!n) return
    state = state.map((v) => (v.id === id ? { ...v, name: n } : v))
    emit()
  },
  remove(id: string): void {
    state = state.filter((v) => v.id !== id)
    emit()
  },
}

export function useTableViews(tableKey: string): TableView[] {
  const all = React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
  return React.useMemo(
    () => all.filter((v) => v.tableKey === tableKey),
    [all, tableKey]
  )
}
