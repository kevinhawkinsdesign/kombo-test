// Template folders as a first-class, CRUD-able list — so folders can be
// created, renamed, and deleted independently of the templates inside them
// (before, during, and after creating templates).

import * as React from "react"

// Folders map to the outcomes used across the Chrome extension, plus a couple
// of generic outreach folders.
const SEED = [
  "Interested",
  "Not Interested",
  "Qualified",
  "Disqualified",
  "Meeting Booked",
  "Need Review",
  "Won",
  "Cold outreach",
  "Follow-up",
  "Re-engagement",
]

const KEY = "kombo_template_folders_v2"

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* ignore */
  }
  return SEED
}

let state: string[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export const folderStore = {
  create(name: string): void {
    const n = name.trim()
    if (!n || state.includes(n)) return
    state = [...state, n]
    emit()
  },
  rename(oldName: string, newName: string): void {
    const n = newName.trim()
    if (!n) return
    state = state.map((f) => (f === oldName ? n : f))
    state = [...new Set(state)]
    emit()
  },
  remove(name: string): void {
    state = state.filter((f) => f !== name)
    emit()
  },
}

export function useTemplateFolders(): string[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
