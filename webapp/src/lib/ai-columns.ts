import * as React from "react"

// A user-defined "AI enrichment" column: a natural-language prompt that
// produces a value per row. `output` controls how the value is rendered.
// Definitions persist per workspace (localStorage) and are reactive so every
// table re-renders when a column is added or removed.

export type AiColumnOutput = "text" | "score" | "yesno"
export type AiColumnEntity = "people" | "company"

export interface AiColumnDef {
  id: string
  entity: AiColumnEntity
  label: string
  prompt: string
  output: AiColumnOutput
}

const KEY = "kombo_ai_columns_v1"

function load(): AiColumnDef[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AiColumnDef[]
  } catch {
    /* ignore */
  }
  return []
}

let columns: AiColumnDef[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(columns))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

// Monotonic id derived from existing ids — deterministic, no Date/random.
function newId(): string {
  const max = columns.reduce((m, c) => {
    const n = Number(c.id.replace(/\D/g, ""))
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `ai_${max + 1}`
}

export const aiColumnStore = {
  add(def: Omit<AiColumnDef, "id">): AiColumnDef {
    const col: AiColumnDef = { ...def, id: newId() }
    columns = [...columns, col]
    emit()
    return col
  },
  remove(id: string): void {
    columns = columns.filter((c) => c.id !== id)
    emit()
  },
}

export function useAiColumns(entity: AiColumnEntity): AiColumnDef[] {
  const all = React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => columns,
    () => columns
  )
  return React.useMemo(() => all.filter((c) => c.entity === entity), [all, entity])
}
