import * as React from "react"

import { HOME_MODULES } from "@/components/home/home-modules"

/**
 * Home layout store: which modular cards show on the Home page and in what
 * order. Different users want different things below the permanent search box,
 * so the enabled set + order is customizable and persisted per browser.
 *
 * Backed by localStorage + a module-level store (same shape as
 * `release-mode.ts`) so the grid and the Customize dialog stay in sync without
 * prop drilling. State is the ordered list of *enabled* module ids; every known
 * id not in that list is considered off but still offered in Customize.
 */

const KEY = "kombo-home-layout"

/** All module ids the registry currently knows about, in registry order. */
function knownIds(): string[] {
  return HOME_MODULES.map((m) => m.id)
}

/** Default enabled ids = the `defaultOn` modules, in registry order. */
function defaultEnabled(): string[] {
  return HOME_MODULES.filter((m) => m.defaultOn).map((m) => m.id)
}

/**
 * Reconcile a saved id list against the live registry: drop ids that no longer
 * exist so removing a module can't break a saved layout. Newly-added modules
 * are surfaced through the full `order` (enabled ids first, then the rest), so
 * the registry can grow without users losing their customization.
 */
function pruneEnabled(ids: string[]): string[] {
  const known = new Set(knownIds())
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    if (known.has(id) && !seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        return pruneEnabled(parsed as string[])
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return defaultEnabled()
}

let enabledOrder: string[] = load()
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

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(enabledOrder))
  } catch {
    /* ignore quota errors */
  }
  emit()
}

function getSnapshot(): string[] {
  return enabledOrder
}

/**
 * The full ordered id list: enabled ids in their saved order first, then any
 * remaining known ids (disabled, in registry order). Memoized against the
 * enabled snapshot so `useSyncExternalStore` sees a stable reference.
 */
let orderCache: { key: string[]; value: string[] } | null = null
function getOrder(): string[] {
  if (orderCache && orderCache.key === enabledOrder) return orderCache.value
  const enabledSet = new Set(enabledOrder)
  const rest = knownIds().filter((id) => !enabledSet.has(id))
  const value = [...enabledOrder, ...rest]
  orderCache = { key: enabledOrder, value }
  return value
}

export interface HomeLayout {
  /** Full ordered id list (enabled first, then disabled). */
  order: string[]
  /** Which ids are currently on. */
  enabled: Set<string>
  /** Turn a module on/off. */
  toggle: (id: string) => void
  /** Move an enabled module up (-1) or down (+1) within the enabled order. */
  move: (id: string, dir: -1 | 1) => void
  /** Restore the registry default layout. */
  reset: () => void
}

function toggle(id: string): void {
  if (!knownIds().includes(id)) return
  if (enabledOrder.includes(id)) {
    enabledOrder = enabledOrder.filter((x) => x !== id)
  } else {
    enabledOrder = [...enabledOrder, id]
  }
  persist()
}

function move(id: string, dir: -1 | 1): void {
  const i = enabledOrder.indexOf(id)
  if (i === -1) return
  const j = i + dir
  if (j < 0 || j >= enabledOrder.length) return
  const next = [...enabledOrder]
  ;[next[i], next[j]] = [next[j], next[i]]
  enabledOrder = next
  persist()
}

function reset(): void {
  enabledOrder = defaultEnabled()
  persist()
}

/** Reactive read of the home layout + mutators. */
export function useHomeLayout(): HomeLayout {
  const enabledSnapshot = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  )
  const order = React.useMemo(() => {
    void enabledSnapshot
    return getOrder()
  }, [enabledSnapshot])
  const enabled = React.useMemo(
    () => new Set(enabledSnapshot),
    [enabledSnapshot]
  )
  return { order, enabled, toggle, move, reset }
}
