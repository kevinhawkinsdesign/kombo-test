import * as React from "react"

/**
 * Release-stage toggle: "v1" ships first and only exposes surfaces that already
 * exist in today's Chrome extension; "v2" is the full web-app vision. Flipping
 * to v1 hides every page flagged `isNew` in the nav so we can preview the lean
 * first release. Backed by localStorage + a module-level store so the nav,
 * routes, and the toggle stay in sync without prop drilling.
 */

export type ReleaseMode = "v1" | "v2"

const KEY = "kombo-release-mode"

// Pages that don't exist in the Chrome extension yet — hidden in v1. Keep this
// in sync with the `isNew` flags on the nav config in AppSidebar.tsx.
export const V2_ONLY_PATHS = [
  "/", // manager dashboard
  "/copilot",
  "/intros",
  "/extension",
  "/sequences",
  "/sequence-builder",
  "/channels",
  "/deals",
] as const

// Where v1 lands when the user hits a hidden route (incl. the "/" dashboard).
// Prospect Search is the core "find prospects" job and the extension's home.
export const V1_HOME = "/search"

/** True when `pathname` belongs to a surface that only exists in v2. */
export function isV2OnlyPath(pathname: string): boolean {
  return V2_ONLY_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)
  )
}

function load(): ReleaseMode {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === "v1" || raw === "v2") return raw
  } catch {
    /* ignore malformed storage */
  }
  return "v2"
}

let mode: ReleaseMode = load()
const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getMode(): ReleaseMode {
  return mode
}

export function setReleaseMode(next: ReleaseMode): void {
  if (mode === next) return
  mode = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* ignore quota errors */
  }
  emit()
}

/** Reactive read of the current release mode + a setter. */
export function useReleaseMode(): {
  mode: ReleaseMode
  isV1: boolean
  setMode: (next: ReleaseMode) => void
} {
  const current = React.useSyncExternalStore(subscribe, getMode, getMode)
  return {
    mode: current,
    isV1: current === "v1",
    setMode: setReleaseMode,
  }
}
