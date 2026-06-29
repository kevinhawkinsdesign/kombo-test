import type { ProspectSource } from "@/lib/types"

export function initials(first: string, last?: string): string {
  const a = first?.[0] ?? ""
  const b = last?.[0] ?? ""
  return (a + b).toUpperCase()
}

const SOURCE_ORDER: ProspectSource[] = ["search", "list", "import", "extension"]

// How a prospect entered the workspace. Falls back to a stable per-id value so
// existing seed contacts show a believable, consistent source.
export function prospectSource(p: { id: string; source?: ProspectSource }): ProspectSource {
  if (p.source) return p.source
  let h = 0
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0
  return SOURCE_ORDER[h % SOURCE_ORDER.length]
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

export type DueBucket = "overdue" | "today" | "upcoming"

/** Bucket a due date relative to today, for cadence-style task grouping. */
export function dueBucket(iso: string): DueBucket {
  const due = new Date(iso).getTime()
  const now = new Date()
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  const startTomorrow = startToday + 24 * 60 * 60 * 1000
  if (due < startToday) return "overdue"
  if (due < startTomorrow) return "today"
  return "upcoming"
}

/** "Today at 08:00" / "Tomorrow at 08:00" / "Mon, Jun 30 · 08:00". */
export function formatDueAt(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  const dayStart = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).getTime()
  const dayDiff = Math.round((dayStart - startToday) / 86400000)
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
  if (dayDiff === 0) return `Today at ${time}`
  if (dayDiff === 1) return `Tomorrow at ${time}`
  if (dayDiff === -1) return `Yesterday at ${time}`
  const date = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  return `${date} · ${time}`
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
