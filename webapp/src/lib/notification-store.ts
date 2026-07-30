// Reactive wrapper around the notifications seed data — same shape as
// inbox-folders.ts: a module-level store + useSyncExternalStore, so the
// top-bar bell dropdown and the full Notifications page share one read/read
// state instead of each keeping (and diverging on) their own local copy.

import * as React from "react"

import { notifications as seed } from "./mock-extra"
import type { NotificationItem } from "./types"

const KEY = "kombo_notifications_read_v1"

// Only read/unread ever changes here, so localStorage just needs the set of
// ids marked read — replaying that onto the seed data on load is cheaper
// than persisting the whole list.
function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {
    /* ignore malformed storage */
  }
  return new Set()
}

const readIds = loadReadIds()
let state: NotificationItem[] = seed.map((n) => ({
  ...n,
  read: n.read || readIds.has(n.id),
}))

const listeners = new Set<() => void>()

function emit(): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(state.filter((n) => n.read).map((n) => n.id))
    )
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const notificationStore = {
  markRead(id: string): void {
    state = state.map((n) => (n.id === id ? { ...n, read: true } : n))
    emit()
  },
  markAllRead(): void {
    state = state.map((n) => (n.read ? n : { ...n, read: true }))
    emit()
  },
}

export function useNotifications(): NotificationItem[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
