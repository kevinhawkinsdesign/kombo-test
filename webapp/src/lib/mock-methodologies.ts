// Custom sales methodologies a team defines beyond the built-in list —
// each is a named set of discovery sections (e.g. MEDDIC's "Metrics",
// "Economic buyer", …) with example questions Kai draws on during call prep.
// Mirrors the extension's custom-sales-methodology concept.

import * as React from "react"

export interface MethodologySection {
  title: string
  questions: string[]
}

export interface CustomMethodology {
  id: string
  name: string
  sections: MethodologySection[]
}

const KEY = "kombo_custom_methodologies_v1"

function load(): CustomMethodology[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CustomMethodology[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore malformed storage */
  }
  return []
}

let state: CustomMethodology[] = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `methodology_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const methodologyStore = {
  create(data: Omit<CustomMethodology, "id">): CustomMethodology {
    const methodology: CustomMethodology = { ...data, id: uid() }
    state = [...state, methodology]
    emit()
    return methodology
  },
  remove(id: string): void {
    state = state.filter((m) => m.id !== id)
    emit()
  },
}

export function useCustomMethodologies(): CustomMethodology[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
