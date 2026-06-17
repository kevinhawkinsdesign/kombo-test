import * as React from "react"

/**
 * Persistent, per-feature onboarding state. The first time a user visits a
 * feature we surface a short intro (what it does + why it matters); once they
 * dismiss it, it stays hidden across sessions. Backed by localStorage and a
 * module-level store so any component can read/observe without prop drilling.
 */

export type FeatureKey =
  | "copilot"
  | "search"
  | "companies"
  | "intros"
  | "lists"
  | "inbox"
  | "campaigns"
  | "sequence"
  | "playlist"
  | "templates"
  | "playbook"
  | "channels"
  | "tasks"
  | "deals"
  | "analytics"
  | "coach"
  | "team"

const KEY = "kombo_feature_tours_v1"

function load(): Set<FeatureKey> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return new Set(JSON.parse(raw) as FeatureKey[])
  } catch {
    /* ignore malformed storage */
  }
  return new Set()
}

let dismissed: Set<FeatureKey> = load()
const listeners = new Set<() => void>()

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...dismissed]))
  } catch {
    /* ignore quota errors */
  }
}

function emit(): void {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function dismissFeature(key: FeatureKey): void {
  if (dismissed.has(key)) return
  dismissed = new Set(dismissed).add(key)
  persist()
  emit()
}

export function resetFeatureTours(): void {
  dismissed = new Set()
  persist()
  emit()
}

/** Returns whether the intro for a feature should still be shown. */
export function useFeatureIntro(key: FeatureKey): {
  show: boolean
  dismiss: () => void
} {
  const isDismissed = React.useSyncExternalStore(
    subscribe,
    () => dismissed.has(key),
    () => dismissed.has(key)
  )
  return {
    show: !isDismissed,
    dismiss: React.useCallback(() => dismissFeature(key), [key]),
  }
}
