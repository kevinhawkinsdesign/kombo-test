import * as React from "react"

// Global open-state for the prospect quick-search command palette.
// Kept in a tiny module store so any trigger (sidebar rail, mobile sheet,
// ⌘K hotkey) can open the single palette mounted at the app shell.
let openState = false
const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((l) => l())
}

export function openProspectSearch(): void {
  if (!openState) {
    openState = true
    emit()
  }
}

export function setProspectSearchOpen(value: boolean): void {
  if (openState !== value) {
    openState = value
    emit()
  }
}

export function useProspectSearchOpen(): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => openState,
    () => openState
  )
}
