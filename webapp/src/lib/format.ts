export function initials(first: string, last?: string): string {
  const a = first?.[0] ?? ""
  const b = last?.[0] ?? ""
  return (a + b).toUpperCase()
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 85) return "high"
  if (score >= 70) return "mid"
  return "low"
}

/** Canonical compact currency formatter, e.g. $184K, $1.5K, $2.0M, $940. */
export function formatMoney(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1000) {
    const k = n / 1000
    const value = k >= 100 ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "")
    return `$${value}K`
  }
  return `$${n}`
}
