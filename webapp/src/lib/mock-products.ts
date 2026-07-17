// Named products/services a rep sells, each with its own USP pitch — distinct
// from the company-wide USP list in Settings > Value Proposition. Mirrors the
// extension's "Products to sell" concept (name + one-liner pitch per product).

import * as React from "react"

export interface Product {
  id: string
  name: string
  usp: string
}

const SEED: Product[] = [
  {
    id: "product_core",
    name: "Kombo Platform",
    usp: "AI-enriched prospecting and outreach that replaces 4+ point tools with one workspace.",
  },
]

const KEY = "kombo_products_v1"

function load(): Product[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Product[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore malformed storage */
  }
  return SEED
}

let state: Product[] = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `product_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const productStore = {
  create(data: Omit<Product, "id">): Product {
    const product: Product = { ...data, id: uid() }
    state = [...state, product]
    emit()
    return product
  },
  update(id: string, patch: Partial<Omit<Product, "id">>): void {
    state = state.map((p) => (p.id === id ? { ...p, ...patch } : p))
    emit()
  },
  remove(id: string): void {
    state = state.filter((p) => p.id !== id)
    emit()
  },
}

export function useProducts(): Product[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
