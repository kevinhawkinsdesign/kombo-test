import * as React from "react"

// A workspace is a lightweight parent object that groups everything about one
// topic/initiative: saved searches, lists, and campaigns. A workspace may be
// named or left untitled. Membership is exclusive — associating an item moves
// it out of any other workspace it was in.

export type WorkspaceItemKind = "search" | "list" | "campaign"

// A lightweight summary of the workspace's source search — drives the SOURCE
// step in the pipeline view (the prompt, its filter chips, and match counts).
export interface WorkspaceSource {
  prompt: string
  filters: { label: string; value: string }[]
  found: number
  people: number
  companies: number
}

export interface Workspace {
  id: string
  name: string // "" when the user hasn't named it
  color: string
  searchIds: string[]
  listIds: string[]
  campaignIds: string[]
  source?: WorkspaceSource
  createdAt: string
}

const KEY = "kombo_workspaces_v1"
const COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#6366f1"]

const FIELD: Record<WorkspaceItemKind, "searchIds" | "listIds" | "campaignIds"> =
  {
    search: "searchIds",
    list: "listIds",
    campaign: "campaignIds",
  }

// Seeded so the page lands populated for demos. Ids reference seed lists
// (l_*) and campaigns (cm_*); one workspace is intentionally left unnamed.
const SEED: Workspace[] = [
  {
    id: "ws_1",
    name: "Q3 EMEA Outbound",
    color: COLORS[0],
    searchIds: ["ss_1", "ss_3"],
    listIds: ["l_1", "l_2", "l_3"],
    campaignIds: ["cm_1"],
    source: {
      prompt:
        "Heads of Revenue Operations at B2B SaaS companies, 50–500 employees, in EMEA",
      filters: [
        { label: "Title", value: "Head of RevOps" },
        { label: "Industry", value: "B2B SaaS" },
        { label: "Headcount", value: "50–500" },
        { label: "Region", value: "EMEA" },
      ],
      found: 2184,
      people: 2184,
      companies: 1120,
    },
    createdAt: "2026-06-18T00:00:00Z",
  },
  {
    id: "ws_2",
    name: "",
    color: COLORS[1],
    searchIds: [],
    listIds: ["l_3"],
    campaignIds: ["cm_2"],
    createdAt: "2026-06-24T00:00:00Z",
  },
]

function load(): Workspace[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Workspace[]
  } catch {
    /* ignore */
  }
  return SEED
}

let state: Workspace[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

// Monotonic id derived from existing ids — deterministic, no Date/random.
function newId(): string {
  const max = state.reduce((m, w) => {
    const n = Number(w.id.replace(/\D/g, ""))
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `ws_${max + 1}`
}

export const workspaceStore = {
  create(name: string): Workspace {
    const ws: Workspace = {
      id: newId(),
      name: name.trim(),
      color: COLORS[state.length % COLORS.length],
      searchIds: [],
      listIds: [],
      campaignIds: [],
      createdAt: new Date().toISOString(),
    }
    state = [ws, ...state]
    emit()
    return ws
  },
  rename(id: string, name: string): void {
    state = state.map((w) => (w.id === id ? { ...w, name } : w))
    emit()
  },
  remove(id: string): void {
    state = state.filter((w) => w.id !== id)
    emit()
  },
  // Add an item to a workspace, removing it from any other workspace first.
  associate(id: string, kind: WorkspaceItemKind, entityId: string): void {
    const field = FIELD[kind]
    state = state.map((w) => {
      const arr = w[field].filter((x) => x !== entityId)
      if (w.id === id) arr.unshift(entityId)
      return { ...w, [field]: arr }
    })
    emit()
  },
  dissociate(id: string, kind: WorkspaceItemKind, entityId: string): void {
    const field = FIELD[kind]
    state = state.map((w) =>
      w.id === id ? { ...w, [field]: w[field].filter((x) => x !== entityId) } : w
    )
    emit()
  },
}

// The workspace that currently owns a given item, if any.
export function ownerOf(
  workspaces: Workspace[],
  kind: WorkspaceItemKind,
  entityId: string
): Workspace | undefined {
  const field = FIELD[kind]
  return workspaces.find((w) => w[field].includes(entityId))
}

export function useWorkspaces(): Workspace[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}

export function useWorkspace(id: string | undefined): Workspace | undefined {
  const all = useWorkspaces()
  return React.useMemo(() => all.find((w) => w.id === id), [all, id])
}
