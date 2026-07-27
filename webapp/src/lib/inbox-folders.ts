// User-created Inbox folders — a manual label a conversation is added to or
// removed from by hand (no saved-filter/auto-match rule), same shape as the
// approvals queue in mock-approvals.ts: a localStorage-backed module store
// read through useSyncExternalStore.

import * as React from "react"

export interface CustomFolder {
  id: string
  name: string
  conversationIds: string[]
  createdAt: string
}

const KEY = "kombo_inbox_folders_v1"

function load(): CustomFolder[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as CustomFolder[]
  } catch {
    /* ignore malformed storage */
  }
  return []
}

let state: CustomFolder[] = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `cf_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const customFolderStore = {
  create(name: string): CustomFolder {
    const folder: CustomFolder = {
      id: uid(),
      name,
      conversationIds: [],
      createdAt: new Date().toISOString(),
    }
    state = [...state, folder]
    emit()
    return folder
  },
  remove(id: string): void {
    state = state.filter((f) => f.id !== id)
    emit()
  },
  addConversation(id: string, conversationId: string): void {
    state = state.map((f) =>
      f.id === id && !f.conversationIds.includes(conversationId)
        ? { ...f, conversationIds: [...f.conversationIds, conversationId] }
        : f
    )
    emit()
  },
  removeConversation(id: string, conversationId: string): void {
    state = state.map((f) =>
      f.id === id
        ? { ...f, conversationIds: f.conversationIds.filter((c) => c !== conversationId) }
        : f
    )
    emit()
  },
}

export function useCustomFolders(): CustomFolder[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
