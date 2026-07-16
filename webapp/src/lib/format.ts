import type { CampaignStatus, ProspectSource } from "@/lib/types"
import type { Locale } from "@/lib/locale"

// The active UI locale for user-visible time words and Intl date output.
// LocaleProvider calls setFormatLocale() during render, so every helper here
// follows the app language without threading a locale param through the
// hundreds of existing call sites. (Type-only import above — no cycle.)
let activeLocale: Locale = "en"
let activeIntlTag = "en-US"
export function setFormatLocale(locale: Locale, intlTag: string) {
  activeLocale = locale
  activeIntlTag = intlTag
}

type RelUnit = "m" | "h" | "d" | "w"

const REL_UNITS: Record<Locale, Record<RelUnit, string>> = {
  en: { m: "m", h: "h", d: "d", w: "w" },
  es: { m: "min", h: "h", d: "d", w: "sem" },
  it: { m: "min", h: "h", d: "g", w: "sett." },
  fr: { m: "min", h: "h", d: "j", w: "sem." },
  de: { m: "Min.", h: "Std.", d: "T.", w: "Wo." },
  pt: { m: "min", h: "h", d: "d", w: "sem." },
  pt_BR: { m: "min", h: "h", d: "d", w: "sem." },
}

const TIME_WORDS: Record<
  Locale,
  {
    just: string
    soon: string
    past: (n: number, u: RelUnit) => string
    future: (n: number, u: RelUnit) => string
    today: (t: string) => string
    tomorrow: (t: string) => string
    yesterday: (t: string) => string
  }
> = {
  en: {
    just: "just now",
    soon: "any moment now",
    past: (n, u) => `${n}${REL_UNITS.en[u]} ago`,
    future: (n, u) => `in ${n}${REL_UNITS.en[u]}`,
    today: (t) => `Today at ${t}`,
    tomorrow: (t) => `Tomorrow at ${t}`,
    yesterday: (t) => `Yesterday at ${t}`,
  },
  es: {
    just: "ahora mismo",
    soon: "en cualquier momento",
    past: (n, u) => `hace ${n} ${REL_UNITS.es[u]}`,
    future: (n, u) => `en ${n} ${REL_UNITS.es[u]}`,
    today: (t) => `Hoy a las ${t}`,
    tomorrow: (t) => `Mañana a las ${t}`,
    yesterday: (t) => `Ayer a las ${t}`,
  },
  it: {
    just: "adesso",
    soon: "a momenti",
    past: (n, u) => `${n} ${REL_UNITS.it[u]} fa`,
    future: (n, u) => `tra ${n} ${REL_UNITS.it[u]}`,
    today: (t) => `Oggi alle ${t}`,
    tomorrow: (t) => `Domani alle ${t}`,
    yesterday: (t) => `Ieri alle ${t}`,
  },
  fr: {
    just: "à l'instant",
    soon: "d'un instant à l'autre",
    past: (n, u) => `il y a ${n} ${REL_UNITS.fr[u]}`,
    future: (n, u) => `dans ${n} ${REL_UNITS.fr[u]}`,
    today: (t) => `Aujourd'hui à ${t}`,
    tomorrow: (t) => `Demain à ${t}`,
    yesterday: (t) => `Hier à ${t}`,
  },
  de: {
    just: "gerade eben",
    soon: "jeden Moment",
    past: (n, u) => `vor ${n} ${REL_UNITS.de[u]}`,
    future: (n, u) => `in ${n} ${REL_UNITS.de[u]}`,
    today: (t) => `Heute um ${t}`,
    tomorrow: (t) => `Morgen um ${t}`,
    yesterday: (t) => `Gestern um ${t}`,
  },
  pt: {
    just: "agora mesmo",
    soon: "a qualquer momento",
    past: (n, u) => `há ${n} ${REL_UNITS.pt[u]}`,
    future: (n, u) => `em ${n} ${REL_UNITS.pt[u]}`,
    today: (t) => `Hoje às ${t}`,
    tomorrow: (t) => `Amanhã às ${t}`,
    yesterday: (t) => `Ontem às ${t}`,
  },
  pt_BR: {
    just: "agora mesmo",
    soon: "a qualquer momento",
    past: (n, u) => `há ${n} ${REL_UNITS.pt_BR[u]}`,
    future: (n, u) => `em ${n} ${REL_UNITS.pt_BR[u]}`,
    today: (t) => `Hoje às ${t}`,
    tomorrow: (t) => `Amanhã às ${t}`,
    yesterday: (t) => `Ontem às ${t}`,
  },
}

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
  const w = TIME_WORDS[activeLocale]
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return w.just
  if (mins < 60) return w.past(mins, "m")
  const hours = Math.floor(mins / 60)
  if (hours < 24) return w.past(hours, "h")
  const days = Math.floor(hours / 24)
  if (days < 7) return w.past(days, "d")
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return w.past(weeks, "w")
  return new Date(iso).toLocaleDateString(activeIntlTag, {
    month: "short",
    day: "numeric",
  })
}

// Same shape as relativeTime, but for timestamps that haven't happened yet
// (a task due later, a queued reply, an upcoming sequence step).
export function futureRelativeTime(iso: string): string {
  const w = TIME_WORDS[activeLocale]
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, then - now)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return w.soon
  if (mins < 60) return w.future(mins, "m")
  const hours = Math.floor(mins / 60)
  if (hours < 24) return w.future(hours, "h")
  const days = Math.floor(hours / 24)
  if (days < 7) return w.future(days, "d")
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return w.future(weeks, "w")
  return new Date(iso).toLocaleDateString(activeIntlTag, {
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
  const w = TIME_WORDS[activeLocale]
  const time = d.toLocaleTimeString(activeIntlTag, {
    hour: "2-digit",
    minute: "2-digit",
  })
  if (dayDiff === 0) return w.today(time)
  if (dayDiff === 1) return w.tomorrow(time)
  if (dayDiff === -1) return w.yesterday(time)
  const date = d.toLocaleDateString(activeIntlTag, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  return `${date} · ${time}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(activeIntlTag, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** A campaign is "scheduled" when it has a future start time and isn't yet live. */
export function isCampaignScheduled(c: {
  status: CampaignStatus
  scheduledAt?: string | null
}): boolean {
  return (
    c.status !== "active" &&
    c.status !== "completed" &&
    Boolean(c.scheduledAt && new Date(c.scheduledAt).getTime() > Date.now())
  )
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
