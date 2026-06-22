// Data layer for the AI Search experience — a unified surface that merges
// classic prospect-database search with an "Ask Kai" style prompt. A natural
// language prompt is interpreted into a structured query; the query builds a
// custom table of people OR companies scored by fit. Results can be saved as a
// list and connected to a campaign. Saved searches keep the prompt + chat
// history so a search can be reopened and refined later.

import * as React from "react"

export type AiEntity = "people" | "companies"

export interface AiQuery {
  titles: string[]
  seniority: string[]
  regions: string[]
  headcount: string[]
  industries: string[]
  signals: string[]
  keywords: string
}

export const EMPTY_QUERY: AiQuery = {
  titles: [],
  seniority: [],
  regions: [],
  headcount: [],
  industries: [],
  signals: [],
  keywords: "",
}

export interface AiLead {
  id: string
  firstName: string
  lastName: string
  title: string
  company: string
  companyDomain: string
  location: string
  region: string
  seniority: string
  department: string
  industry: string
  headcount: string
  revenue: string
  avatarColor: string
  emailStatus: "verified" | "likely" | "missing"
  signals: string[]
  fit: number // 0-100, computed against the active query
}

export interface AiCompany {
  id: string
  name: string
  domain: string
  industry: string
  headcount: string
  revenue: string
  location: string
  region: string
  logoColor: string
  signals: string[]
  openRoles: number
  fit: number
}

/* ----------------------------- option vocab ----------------------------- */

export const SENIORITY_OPTIONS = [
  "C-Level",
  "VP",
  "Director",
  "Head",
  "Manager",
]
export const REGION_OPTIONS = [
  "EMEA",
  "North America",
  "LATAM",
  "APAC",
]
export const HEADCOUNT_OPTIONS = [
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
]
export const INDUSTRY_OPTIONS = [
  "SaaS",
  "Fintech",
  "E-commerce",
  "Logistics",
  "Healthtech",
  "Marketing",
  "Cybersecurity",
]
export const SIGNAL_OPTIONS = [
  "Recently funded",
  "Hiring sales",
  "New exec hire",
  "Expanding to EMEA",
  "Adopting AI",
  "High web intent",
]

/* -------------------------------- pools --------------------------------- */

const AVATAR_COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
]

interface CompanySeed {
  name: string
  domain: string
  industry: string
  region: string
  location: string
  headcount: string
  revenue: string
  logoColor: string
}

const COMPANIES: CompanySeed[] = [
  { name: "Fever", domain: "feverup.com", industry: "E-commerce", region: "EMEA", location: "Madrid, ES", headcount: "501-1000", revenue: "$100M-$250M", logoColor: "#E5006D" },
  { name: "Softonic", domain: "softonic.com", industry: "SaaS", region: "EMEA", location: "Barcelona, ES", headcount: "201-500", revenue: "$50M-$100M", logoColor: "#008BE6" },
  { name: "Clarity AI", domain: "clarity.ai", industry: "Fintech", region: "EMEA", location: "Madrid, ES", headcount: "201-500", revenue: "$50M-$100M", logoColor: "#1F6FEB" },
  { name: "Criteo", domain: "criteo.com", industry: "Marketing", region: "EMEA", location: "Paris, FR", headcount: "1000+", revenue: "$1B+", logoColor: "#F7901E" },
  { name: "Edicom", domain: "edicomgroup.com", industry: "SaaS", region: "EMEA", location: "Valencia, ES", headcount: "501-1000", revenue: "$100M-$250M", logoColor: "#E2001A" },
  { name: "Betterfly", domain: "betterfly.com", industry: "Healthtech", region: "LATAM", location: "Santiago, CL", headcount: "501-1000", revenue: "$100M-$250M", logoColor: "#00C4B3" },
  { name: "Factorial", domain: "factorialhr.com", industry: "SaaS", region: "EMEA", location: "Barcelona, ES", headcount: "501-1000", revenue: "$100M-$250M", logoColor: "#6D28D9" },
  { name: "TravelPerk", domain: "travelperk.com", industry: "SaaS", region: "EMEA", location: "Barcelona, ES", headcount: "1000+", revenue: "$250M-$500M", logoColor: "#FF5A5F" },
  { name: "Wallbox", domain: "wallbox.com", industry: "E-commerce", region: "EMEA", location: "Barcelona, ES", headcount: "1000+", revenue: "$250M-$500M", logoColor: "#16A34A" },
  { name: "Cabify", domain: "cabify.com", industry: "Logistics", region: "LATAM", location: "Madrid, ES", headcount: "1000+", revenue: "$250M-$500M", logoColor: "#7B2CBF" },
  { name: "Personio", domain: "personio.com", industry: "SaaS", region: "EMEA", location: "Munich, DE", headcount: "1000+", revenue: "$250M-$500M", logoColor: "#0B5FFF" },
  { name: "Mollie", domain: "mollie.com", industry: "Fintech", region: "EMEA", location: "Amsterdam, NL", headcount: "501-1000", revenue: "$100M-$250M", logoColor: "#0A0A0A" },
  { name: "Pleo", domain: "pleo.io", industry: "Fintech", region: "EMEA", location: "Copenhagen, DK", headcount: "501-1000", revenue: "$100M-$250M", logoColor: "#FF3D00" },
  { name: "Snyk", domain: "snyk.io", industry: "Cybersecurity", region: "EMEA", location: "London, UK", headcount: "1000+", revenue: "$250M-$500M", logoColor: "#4C4A73" },
  { name: "Gympass", domain: "gympass.com", industry: "Healthtech", region: "LATAM", location: "São Paulo, BR", headcount: "1000+", revenue: "$250M-$500M", logoColor: "#FF6B00" },
  { name: "Ramp", domain: "ramp.com", industry: "Fintech", region: "North America", location: "New York, US", headcount: "1000+", revenue: "$250M-$500M", logoColor: "#1A1A1A" },
  { name: "Vercel", domain: "vercel.com", industry: "SaaS", region: "North America", location: "San Francisco, US", headcount: "501-1000", revenue: "$100M-$250M", logoColor: "#000000" },
  { name: "Deel", domain: "deel.com", industry: "SaaS", region: "North America", location: "San Francisco, US", headcount: "1000+", revenue: "$500M-$1B", logoColor: "#4338CA" },
  { name: "Rappi", domain: "rappi.com", industry: "Logistics", region: "LATAM", location: "Bogotá, CO", headcount: "1000+", revenue: "$500M-$1B", logoColor: "#FF4F00" },
  { name: "Kavak", domain: "kavak.com", industry: "E-commerce", region: "LATAM", location: "Mexico City, MX", headcount: "1000+", revenue: "$500M-$1B", logoColor: "#2563EB" },
]

const NAMES: [string, string][] = [
  ["Sofia", "Rossi"], ["Lucas", "Müller"], ["Emma", "Dubois"], ["Mateo", "García"],
  ["Olivia", "Jensen"], ["Hugo", "Silva"], ["Marie", "Laurent"], ["Liam", "O'Brien"],
  ["Camila", "Fernández"], ["Noah", "Schmidt"], ["Valentina", "Costa"], ["Daniel", "Novak"],
  ["Júlia", "Santos"], ["Adam", "Kowalski"], ["Chloé", "Moreau"], ["Diego", "Ramírez"],
  ["Anna", "Bauer"], ["Thomas", "Andersen"], ["Isabella", "Conti"], ["Pablo", "Torres"],
  ["Léa", "Bernard"], ["Felix", "Wagner"], ["Martina", "Ricci"], ["Carlos", "Mendoza"],
  ["Nina", "Larsen"], ["Tomás", "Oliveira"], ["Elena", "Popov"], ["Gabriel", "Rossi"],
  ["Laura", "Nowak"], ["Andrés", "Castro"], ["Sophie", "Klein"], ["Marco", "Bianchi"],
  ["Ines", "Almeida"], ["Viktor", "Horvat"], ["Clara", "Lefebvre"], ["Joana", "Pereira"],
]

const TITLES: { title: string; seniority: string; department: string }[] = [
  { title: "Chief Revenue Officer", seniority: "C-Level", department: "Sales" },
  { title: "VP of Sales", seniority: "VP", department: "Sales" },
  { title: "VP of Revenue", seniority: "VP", department: "Sales" },
  { title: "Head of Sales", seniority: "Head", department: "Sales" },
  { title: "Director of Sales", seniority: "Director", department: "Sales" },
  { title: "Head of Sales Development", seniority: "Head", department: "Sales" },
  { title: "VP of Marketing", seniority: "VP", department: "Marketing" },
  { title: "Head of Growth", seniority: "Head", department: "Marketing" },
  { title: "Director of RevOps", seniority: "Director", department: "Operations" },
  { title: "Sales Manager", seniority: "Manager", department: "Sales" },
]

const LEAD_SIGNALS_POOL = SIGNAL_OPTIONS

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

// Deterministic pseudo-random in [0,1) from an integer seed.
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function baseLeads(): AiLead[] {
  return NAMES.map(([firstName, lastName], i) => {
    const co = pick(COMPANIES, i * 3 + 1)
    const role = pick(TITLES, i * 2)
    const signals = LEAD_SIGNALS_POOL.filter((_, s) => rand(i * 7 + s) > 0.62)
    const emailRoll = rand(i * 5 + 2)
    const emailStatus: AiLead["emailStatus"] =
      emailRoll > 0.6 ? "verified" : emailRoll > 0.25 ? "likely" : "missing"
    return {
      id: `ai_${i + 1}`,
      firstName,
      lastName,
      title: role.title,
      company: co.name,
      companyDomain: co.domain,
      location: co.location,
      region: co.region,
      seniority: role.seniority,
      department: role.department,
      industry: co.industry,
      headcount: co.headcount,
      revenue: co.revenue,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      emailStatus,
      signals: signals.length ? signals : [LEAD_SIGNALS_POOL[i % LEAD_SIGNALS_POOL.length]],
      fit: 0,
    }
  })
}

function baseCompanies(): AiCompany[] {
  return COMPANIES.map((co, i) => {
    const signals = SIGNAL_OPTIONS.filter((_, s) => rand(i * 9 + s) > 0.58)
    return {
      id: `aic_${i + 1}`,
      name: co.name,
      domain: co.domain,
      industry: co.industry,
      headcount: co.headcount,
      revenue: co.revenue,
      location: co.location,
      region: co.region,
      logoColor: co.logoColor,
      signals: signals.length ? signals : [SIGNAL_OPTIONS[i % SIGNAL_OPTIONS.length]],
      openRoles: Math.floor(rand(i * 11) * 14) + 1,
      fit: 0,
    }
  })
}

const LEAD_POOL = baseLeads()
const COMPANY_POOL = baseCompanies()

/* ---------------------------- prompt parsing ---------------------------- */

function matchVocab(text: string, vocab: string[]): string[] {
  const lower = text.toLowerCase()
  return vocab.filter((v) => lower.includes(v.toLowerCase()))
}

const TITLE_KEYWORDS: { match: string[]; titles: string[]; seniority: string[] }[] = [
  { match: ["cro", "chief revenue"], titles: ["Chief Revenue Officer"], seniority: ["C-Level"] },
  { match: ["vp of sales", "vp sales"], titles: ["VP of Sales"], seniority: ["VP"] },
  { match: ["head of sales"], titles: ["Head of Sales"], seniority: ["Head"] },
  { match: ["revops", "rev ops", "revenue operations"], titles: ["Director of RevOps"], seniority: ["Director"] },
  { match: ["marketing"], titles: ["VP of Marketing", "Head of Growth"], seniority: ["VP", "Head"] },
  { match: ["sdr", "sales development"], titles: ["Head of Sales Development"], seniority: ["Head"] },
  { match: ["growth"], titles: ["Head of Growth"], seniority: ["Head"] },
]

/**
 * Interpret a natural-language prompt into a structured query. Heuristic, but
 * deterministic — good enough to make the demo feel like the AI "understood".
 */
export function interpretPrompt(prompt: string): {
  query: AiQuery
  entity: AiEntity
  summary: string
} {
  const lower = prompt.toLowerCase()
  const entity: AiEntity =
    /\bcompan(y|ies)\b|\baccounts?\b/.test(lower) && !/\bpeople\b|\bleads?\b|\bcontacts?\b/.test(lower)
      ? "companies"
      : "people"

  const titles = new Set<string>()
  const seniority = new Set<string>()
  for (const rule of TITLE_KEYWORDS) {
    if (rule.match.some((m) => lower.includes(m))) {
      rule.titles.forEach((t) => titles.add(t))
      rule.seniority.forEach((s) => seniority.add(s))
    }
  }
  matchVocab(prompt, SENIORITY_OPTIONS).forEach((s) => seniority.add(s))

  const regions = matchVocab(prompt, REGION_OPTIONS)
  if (/\beurope|european|emea\b/.test(lower) && !regions.includes("EMEA")) regions.push("EMEA")
  if (/\blatam|latin america\b/.test(lower) && !regions.includes("LATAM")) regions.push("LATAM")
  if (/\bus\b|united states|north america\b/.test(lower) && !regions.includes("North America"))
    regions.push("North America")

  const industries = matchVocab(prompt, INDUSTRY_OPTIONS)
  if (/\bsaas\b|software/.test(lower) && !industries.includes("SaaS")) industries.push("SaaS")

  const signals = new Set<string>()
  matchVocab(prompt, SIGNAL_OPTIONS).forEach((s) => signals.add(s))
  if (/\b(raised|funding|funded|series [a-d]|seed)\b/.test(lower)) signals.add("Recently funded")
  if (/\bhiring|hire|headcount\b/.test(lower)) signals.add("Hiring sales")
  if (/\bai\b|artificial intelligence/.test(lower)) signals.add("Adopting AI")
  if (/\bintent|in-market|in market\b/.test(lower)) signals.add("High web intent")

  const headcount = matchVocab(prompt, HEADCOUNT_OPTIONS)

  const query: AiQuery = {
    titles: [...titles],
    seniority: [...seniority],
    regions,
    headcount,
    industries,
    signals: [...signals],
    keywords: "",
  }

  const parts: string[] = []
  if (query.titles.length) parts.push(query.titles.join(", "))
  else if (query.seniority.length) parts.push(`${query.seniority.join("/")} leaders`)
  else parts.push(entity === "companies" ? "companies" : "leads")
  if (query.industries.length) parts.push(`in ${query.industries.join(", ")}`)
  if (query.regions.length) parts.push(`across ${query.regions.join(", ")}`)
  if (query.signals.length) parts.push(`who are ${query.signals.map((s) => s.toLowerCase()).join(" and ")}`)

  const summary = `Built a ${entity === "companies" ? "company" : "people"} table for ${parts.join(" ")}.`

  return { query, entity, summary }
}

/** A short, human title for a query — used as the default saved-list name. */
export function queryTitle(query: AiQuery, entity: AiEntity): string {
  const head =
    query.titles[0] ??
    (query.seniority[0] ? `${query.seniority[0]} leaders` : entity === "companies" ? "Target accounts" : "Target leads")
  const region = query.regions[0] ? ` · ${query.regions[0]}` : ""
  const signal = query.signals[0] ? ` · ${query.signals[0]}` : ""
  return `${head}${region}${signal}`
}

export function isQueryEmpty(q: AiQuery): boolean {
  return (
    q.titles.length === 0 &&
    q.seniority.length === 0 &&
    q.regions.length === 0 &&
    q.headcount.length === 0 &&
    q.industries.length === 0 &&
    q.signals.length === 0 &&
    q.keywords.trim() === ""
  )
}

/* ------------------------------ scoring --------------------------------- */

function scoreLead(lead: AiLead, q: AiQuery): number {
  let score = 58
  let matched = 0
  let asked = 0
  const bump = (cond: boolean, weight: number) => {
    score += cond ? weight : 0
    if (cond) matched += 1
  }
  if (q.titles.length) {
    asked += 1
    bump(q.titles.includes(lead.title), 16)
  }
  if (q.seniority.length) {
    asked += 1
    bump(q.seniority.includes(lead.seniority), 12)
  }
  if (q.regions.length) {
    asked += 1
    bump(q.regions.includes(lead.region), 10)
  }
  if (q.industries.length) {
    asked += 1
    bump(q.industries.includes(lead.industry), 10)
  }
  if (q.headcount.length) {
    asked += 1
    bump(q.headcount.includes(lead.headcount), 8)
  }
  if (q.signals.length) {
    asked += 1
    const overlap = lead.signals.filter((s) => q.signals.includes(s)).length
    score += Math.min(overlap, 2) * 9
    if (overlap > 0) matched += 1
  }
  // Reward leads that match a higher share of what was asked.
  if (asked > 0) score += Math.round((matched / asked) * 8)
  return Math.max(45, Math.min(99, Math.round(score)))
}

function scoreCompany(co: AiCompany, q: AiQuery): number {
  let score = 60
  if (q.regions.length) score += q.regions.includes(co.region) ? 12 : -4
  if (q.industries.length) score += q.industries.includes(co.industry) ? 14 : -6
  if (q.headcount.length) score += q.headcount.includes(co.headcount) ? 10 : 0
  if (q.signals.length) {
    const overlap = co.signals.filter((s) => q.signals.includes(s)).length
    score += Math.min(overlap, 2) * 10
  }
  return Math.max(45, Math.min(99, Math.round(score)))
}

export function searchLeads(q: AiQuery): AiLead[] {
  const kw = q.keywords.trim().toLowerCase()
  return LEAD_POOL.map((l) => ({ ...l, fit: scoreLead(l, q) }))
    .filter((l) => {
      if (q.titles.length && !q.titles.includes(l.title)) return false
      if (q.seniority.length && !q.seniority.includes(l.seniority)) return false
      if (q.regions.length && !q.regions.includes(l.region)) return false
      if (q.industries.length && !q.industries.includes(l.industry)) return false
      if (q.headcount.length && !q.headcount.includes(l.headcount)) return false
      if (q.signals.length && !l.signals.some((s) => q.signals.includes(s))) return false
      if (kw) {
        const hay = `${l.firstName} ${l.lastName} ${l.title} ${l.company} ${l.industry}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => b.fit - a.fit)
}

export function searchCompanies(q: AiQuery): AiCompany[] {
  const kw = q.keywords.trim().toLowerCase()
  return COMPANY_POOL.map((c) => ({ ...c, fit: scoreCompany(c, q) }))
    .filter((c) => {
      if (q.regions.length && !q.regions.includes(c.region)) return false
      if (q.industries.length && !q.industries.includes(c.industry)) return false
      if (q.headcount.length && !q.headcount.includes(c.headcount)) return false
      if (q.signals.length && !c.signals.some((s) => q.signals.includes(s))) return false
      if (kw && !`${c.name} ${c.industry}`.toLowerCase().includes(kw)) return false
      return true
    })
    .sort((a, b) => b.fit - a.fit)
}

// The shown rows are a sample; "estimated total leads" extrapolates the pool to
// feel like a real database of millions.
export function estimatedTotal(shown: number, entity: AiEntity): number {
  if (shown === 0) return 0
  const factor = entity === "companies" ? 9 : 14
  return shown * factor + (shown % 7)
}

export const CREDITS_PER_LEAD = 1.7

export const EXAMPLE_PROMPTS_EN = [
  "VPs of Sales at European SaaS companies that recently raised funding",
  "Heads of Growth in fintech across EMEA hiring sales reps",
  "RevOps leaders at 500+ employee companies adopting AI",
  "E-commerce companies in LATAM expanding into new markets",
]

export const EXAMPLE_PROMPTS_ES = [
  "VPs de Ventas en empresas SaaS europeas que han levantado financiación",
  "Heads of Growth en fintech de EMEA que están contratando comerciales",
  "Líderes de RevOps en empresas de más de 500 empleados que adoptan IA",
  "Empresas de e-commerce en LATAM que se expanden a nuevos mercados",
]

/* --------------------------- saved searches ----------------------------- */

export interface AiChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export interface SavedAiSearch {
  id: string
  name: string
  entity: AiEntity
  query: AiQuery
  prompt: string
  messages: AiChatMessage[]
  resultCount: number
  createdAt: string
}

const SAVED_KEY = "kombo_ai_searches_v1"

function loadSaved(): SavedAiSearch[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (raw) return JSON.parse(raw) as SavedAiSearch[]
  } catch {
    /* ignore */
  }
  return []
}

let savedState: SavedAiSearch[] = loadSaved()
const savedListeners = new Set<() => void>()

function persistSaved(): void {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedState))
  } catch {
    /* ignore */
  }
}

function emitSaved(): void {
  persistSaved()
  savedListeners.forEach((l) => l())
}

export const savedSearchStore = {
  create(data: Omit<SavedAiSearch, "id" | "createdAt">): SavedAiSearch {
    const search: SavedAiSearch = {
      ...data,
      id: `ss_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    }
    savedState = [search, ...savedState]
    emitSaved()
    return search
  },
  remove(id: string): void {
    savedState = savedState.filter((s) => s.id !== id)
    emitSaved()
  },
}

export function useSavedSearches(): SavedAiSearch[] {
  return React.useSyncExternalStore(
    (listener) => {
      savedListeners.add(listener)
      return () => savedListeners.delete(listener)
    },
    () => savedState,
    () => savedState
  )
}
