// Data layer for the AI Search experience — a unified surface that merges
// classic prospect-database search with an "Ask Kai" style prompt. A natural
// language prompt is interpreted into a structured query; the query builds a
// custom table of people OR companies scored by fit. Results can be saved as a
// list and connected to a campaign. Saved searches keep the prompt + chat
// history so a search can be reopened and refined later.

import * as React from "react"

import { matchAny, matchValue, splitSelection } from "@/lib/filter-polarity"

export type AiEntity = "people" | "companies"

export interface AiQuery {
  titles: string[]
  seniority: string[]
  regions: string[]
  headcount: string[]
  industries: string[]
  departments: string[]
  technologies: string[]
  revenue: string[]
  intent: string[]
  signals: string[]
  founded: string[] // company founded-year bands
  growth: string[] // company headcount growth bands
  linkedin: string[] // LinkedIn-only filters (active only when LinkedIn is on)
  // LinkedIn-only facets mirroring Sales Navigator / search filters.
  connections: string[] // 1st / 2nd / 3rd+ degree
  profileLanguages: string[] // people: profile language
  serviceCategories: string[] // people: services offered
  schools: string[] // people: school attended
  currentCompanies: string[] // people: current employer
  pastCompanies: string[] // people: past employer
  connectionsOf: string[] // people: shared connection
  followersOf: string[] // people: creator they follow
  jobListings: string[] // company: has open job listings
  keywords: string
  // Extensible facet bucket: the large per-database filter catalogs (LinkedIn
  // Sales Navigator, Kombo / FullEnrich) write here keyed by facet id, so we
  // don't need a typed field per filter.
  facets: Record<string, string[]>
  // People search only: cap how many contacts are returned per company
  // (e.g. "max 3 per company"). null = no limit.
  perCompanyCap: number | null
}

export const EMPTY_QUERY: AiQuery = {
  titles: [],
  seniority: [],
  regions: [],
  headcount: [],
  industries: [],
  departments: [],
  technologies: [],
  revenue: [],
  intent: [],
  signals: [],
  founded: [],
  growth: [],
  linkedin: [],
  connections: [],
  profileLanguages: [],
  serviceCategories: [],
  schools: [],
  currentCompanies: [],
  pastCompanies: [],
  connectionsOf: [],
  followersOf: [],
  jobListings: [],
  keywords: "",
  facets: {},
  perCompanyCap: null,
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
  technologies: string[]
  intent: string[]
  linkedin: string[]
  avatarColor: string
  emailStatus: "verified" | "likely" | "missing"
  phoneStatus: "mobile" | "direct" | "none"
  signals: string[]
  lastActiveDays: number // days since last LinkedIn/web activity (for sorting)
  fit: number // 0-100, computed against the active query
  inCrm: boolean // already synced to a connected CRM
}

export interface AiCompany {
  id: string
  name: string
  domain: string
  industry: string
  headcount: string
  headcountNum: number
  revenue: string
  location: string
  region: string
  technologies: string[]
  foundedYear: number
  growth: string
  logoColor: string
  signals: string[]
  openRoles: number
  fit: number
  inCrm: boolean // already synced to a connected CRM
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
export const DEPARTMENT_OPTIONS = [
  "Sales",
  "Marketing",
  "RevOps",
  "Operations",
  "Finance",
  "Engineering",
  "Product",
  "IT",
  "HR",
  "Customer Success",
]
export const TECH_OPTIONS = [
  "Salesforce",
  "HubSpot",
  "Outreach",
  "Salesloft",
  "Gong",
  "Marketo",
  "Segment",
  "Snowflake",
  "AWS",
  "Google Cloud",
  "Stripe",
  "Zendesk",
]
export const REVENUE_OPTIONS = [
  "$10M-$50M",
  "$50M-$100M",
  "$100M-$250M",
  "$250M-$500M",
  "$500M-$1B",
  "$1B+",
]
export const INTENT_OPTIONS = [
  "Sales engagement",
  "Lead enrichment",
  "Outbound automation",
  "Conversation intelligence",
  "Data enrichment",
  "CRM migration",
]
export const FOUNDED_OPTIONS = [
  "Founded 2020+",
  "Founded 2015-2019",
  "Founded 2010-2014",
  "Founded before 2010",
]
export const GROWTH_OPTIONS = [
  "Hypergrowth (>40%)",
  "Fast (20-40%)",
  "Steady (5-20%)",
  "Flat (<5%)",
]
// LinkedIn-only filters: network/profile signals you can only target when the
// LinkedIn data source is switched on.
export const LINKEDIN_OPTIONS = [
  "Changed jobs (90d)",
  "Posted recently",
  "Mentioned in news",
  "Open to work",
  "Open to volunteering",
  "Actively hiring",
  "2nd-degree connection",
  "Shared group",
  "Following your company",
  "Viewed your profile",
  "5+ years in role",
]

// LinkedIn-only facet vocabularies (mirrors People & Company search filters).
export const CONNECTION_OPTIONS = ["1st", "2nd", "3rd+"]
export const PROFILE_LANGUAGE_OPTIONS = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Italian",
  "Dutch",
]
export const SERVICE_CATEGORY_OPTIONS = [
  "Consulting",
  "Operations",
  "Coaching & Mentoring",
  "Marketing",
  "Project Management",
  "Finance",
  "Human Resources",
  "IT Services",
]
export const SCHOOL_OPTIONS = [
  "Stanford University",
  "Harvard University",
  "INSEAD",
  "London Business School",
  "IE Business School",
  "ESADE",
  "MIT",
  "Université catholique de Louvain",
]
export const COMPANY_NAME_OPTIONS = [
  "Salesforce",
  "HubSpot",
  "Oracle",
  "SAP",
  "Amazon",
  "Google",
  "Stripe",
  "Microsoft",
  "Vertiv",
]
export const PERSON_NAME_OPTIONS = [
  "Sarah Chen",
  "Marcus Riley",
  "Aisha Khan",
  "Diego Fernández",
  "Grace Liu",
]
export const JOB_LISTING_OPTIONS = ["Has open job listings on LinkedIn"]

// Common titles offered as type-ahead suggestions (users can also type any
// custom value of their own).
export const TITLE_OPTIONS = [
  "Chief Revenue Officer",
  "Chief Executive Officer",
  "Chief Operating Officer",
  "VP of Sales",
  "VP of Revenue",
  "VP of Marketing",
  "Head of Sales",
  "Head of Sales Development",
  "Head of Growth",
  "Head of Partnerships",
  "Director of Sales",
  "Director of RevOps",
  "Sales Manager",
  "Founder",
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

// Hand-picked, recognizable companies — kept first so their ids (aic_1..aic_20)
// and names stay stable for anything referencing them by position/name.
const HAND_COMPANIES: CompanySeed[] = [
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

// Hand-picked, recognizable people — kept first so their ids (ai_1..ai_36) and
// names stay stable for anything referencing them by position/name.
const HAND_NAMES: [string, string][] = [
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
  { title: "Chief Financial Officer", seniority: "C-Level", department: "Finance" },
  { title: "VP of Sales", seniority: "VP", department: "Sales" },
  { title: "VP of Revenue", seniority: "VP", department: "Sales" },
  { title: "VP of Marketing", seniority: "VP", department: "Marketing" },
  { title: "VP of Customer Success", seniority: "VP", department: "Customer Success" },
  { title: "VP of Engineering", seniority: "VP", department: "Engineering" },
  { title: "Head of Sales", seniority: "Head", department: "Sales" },
  { title: "Head of Sales Development", seniority: "Head", department: "Sales" },
  { title: "Head of Growth", seniority: "Head", department: "Marketing" },
  { title: "Head of Product", seniority: "Head", department: "Product" },
  { title: "Director of Sales", seniority: "Director", department: "Sales" },
  { title: "Director of RevOps", seniority: "Director", department: "RevOps" },
  { title: "Director of Engineering", seniority: "Director", department: "Engineering" },
  { title: "Sales Manager", seniority: "Manager", department: "Sales" },
  { title: "RevOps Manager", seniority: "Manager", department: "RevOps" },
  { title: "IT Manager", seniority: "Manager", department: "IT" },
  { title: "HR Business Partner", seniority: "Manager", department: "HR" },
]

// Procedurally-generated companies/people so filtered searches — and the
// Search page's carousels/tables — reliably fill up with results instead of
// running thin after 2-3 filters. Deterministic (index-seeded, no Date/Math.random)
// so builds stay stable; spans every region/headcount band so facets like
// "APAC" or "11-50 employees" (previously unrepresented) actually match.
const GEN_COMPANY_PREFIX = [
  "Nimbus", "Vertex", "Quanta", "Lumen", "Apex", "Northwind", "Cobalt", "Helix",
  "Brightwave", "Strata", "Cinder", "Vela", "Orbit", "Pioneer", "Cascade", "Aurora",
  "Beacon", "Ember", "Forge", "Glide", "Harbor", "Ionic", "Junction", "Keystone",
  "Lattice", "Meridian", "Novel", "Oakline", "Pulse", "Quill", "Ridge", "Summit",
  "Tide", "Union", "Vantage", "Wren", "Zephyr", "Atlas", "Bolt", "Crest",
]
const GEN_COMPANY_SUFFIX = [
  "Labs", "AI", "Systems", "Cloud", "Works", "Technologies", "Data", "Logic",
  "Health", "Pay", "Commerce", "Security", "Analytics", "Robotics", "Networks",
  "Software", "Digital", "Group", "Bio", "Energy",
]
const GEN_COMPANY_TLD = [".com", ".io", ".ai", ".co"]
const LOCATIONS_BY_REGION: Record<string, string[]> = {
  EMEA: ["Madrid, ES", "Barcelona, ES", "Paris, FR", "Berlin, DE", "Munich, DE", "Amsterdam, NL", "London, UK", "Dublin, IE", "Stockholm, SE", "Copenhagen, DK", "Milan, IT", "Lisbon, PT"],
  "North America": ["New York, US", "San Francisco, US", "Austin, TX", "Toronto, CA", "Chicago, IL", "Seattle, WA", "Boston, MA", "Denver, CO"],
  LATAM: ["Santiago, CL", "São Paulo, BR", "Bogotá, CO", "Mexico City, MX", "Buenos Aires, AR", "Lima, PE"],
  APAC: ["Singapore, SG", "Sydney, AU", "Tokyo, JP", "Bengaluru, IN", "Seoul, KR", "Auckland, NZ"],
}

function generatedCompanies(n: number): CompanySeed[] {
  const out: CompanySeed[] = []
  for (let i = 0; i < n; i++) {
    const prefix = pick(GEN_COMPANY_PREFIX, i)
    const suffix = pick(GEN_COMPANY_SUFFIX, Math.floor(i / GEN_COMPANY_PREFIX.length) + i * 3)
    const name = `${prefix} ${suffix}`
    const slug = `${prefix}${suffix}`.toLowerCase()
    const region = pick(REGION_OPTIONS, i * 5 + 2)
    out.push({
      name,
      domain: `${slug}${pick(GEN_COMPANY_TLD, i)}`,
      industry: pick(INDUSTRY_OPTIONS, i * 7 + 3),
      region,
      location: pick(LOCATIONS_BY_REGION[region], i * 11 + 1),
      headcount: pick(HEADCOUNT_OPTIONS, i * 3 + 1),
      revenue: pick(REVENUE_OPTIONS, i * 9 + 4),
      logoColor: pick(AVATAR_COLORS, i),
    })
  }
  return out
}

const GEN_FIRST = [
  "Sarah", "Marcus", "Aisha", "James", "Priya", "Ethan", "Amara", "Ravi", "Nadia", "Theo",
  "Freya", "Idris", "Aria", "Nikhil", "Greta", "Bjorn", "Farah", "Oscar", "Yuki", "Kai",
  "Zoe", "Tariq", "Ingrid", "Lena", "Sven", "Anaïs", "Jonas", "Leon", "Maya", "Omar",
  "Hannah", "David", "Mateusz", "Lucia", "Idil", "Sione", "Wei", "Noor", "Bianca", "Rafael",
]
const GEN_LAST = [
  "Chen", "Riley", "Khan", "Vargas", "Park", "Sharma", "Walsh", "Meyer", "Haddad", "Tanaka",
  "Okafor", "Berg", "Lindqvist", "Romano", "Nair", "Moretti", "Kapoor", "Fischer", "Bensaïd", "Marín",
  "Johansson", "Diallo", "Reyes", "Weber", "Patel", "Sato", "Voss", "Holm", "Aziz", "Petrova",
  "O'Connor", "Costa", "Haddad", "Nowak", "Silveira", "Kim", "Osei", "Lindgren", "Ferreira", "Blomqvist",
]

function generatedNames(n: number): [string, string][] {
  const out: [string, string][] = []
  for (let i = 0; i < n; i++) {
    out.push([pick(GEN_FIRST, i * 7 + 3), pick(GEN_LAST, i * 13 + 5)])
  }
  return out
}

const COMPANIES: CompanySeed[] = [...HAND_COMPANIES, ...generatedCompanies(90)]
const NAMES: [string, string][] = [...HAND_NAMES, ...generatedNames(230)]

const LEAD_SIGNALS_POOL = SIGNAL_OPTIONS

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

// Deterministic pseudo-random in [0,1) from an integer seed.
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const HEADCOUNT_NUM: Record<string, number> = {
  "11-50": 30,
  "51-200": 120,
  "201-500": 350,
  "501-1000": 750,
  "1000+": 2500,
}

// Deterministically pick a subset of a pool for a given seed.
function subset<T>(pool: T[], seed: number, threshold: number): T[] {
  return pool.filter((_, s) => rand(seed * 13 + s * 7) > threshold)
}

// Deterministic mock email/phone derived from the lead itself, so the same
// lead always "reveals" the same values across renders (mirrors the
// materialized-Prospect reveal in lib/store.ts, but for unmaterialized
// search-result rows).
export function mockLeadEmail(l: AiLead): string {
  return `${l.firstName}.${l.lastName}@${l.companyDomain}`.toLowerCase().replace(/\s+/g, "")
}

export function mockLeadPhone(l: AiLead): string {
  let h = 0
  for (let i = 0; i < l.id.length; i++) h = (h * 31 + l.id.charCodeAt(i)) >>> 0
  const area = 200 + (h % 800)
  const mid = 100 + ((h >> 4) % 900)
  const last = 1000 + ((h >> 8) % 9000)
  return `+1 (${area}) ${mid}-${last}`
}

function baseLeads(): AiLead[] {
  return NAMES.map(([firstName, lastName], i) => {
    const co = pick(COMPANIES, i * 3 + 1)
    const role = pick(TITLES, i * 2)
    const signals = LEAD_SIGNALS_POOL.filter((_, s) => rand(i * 7 + s) > 0.62)
    const emailRoll = rand(i * 5 + 2)
    const emailStatus: AiLead["emailStatus"] =
      emailRoll > 0.6 ? "verified" : emailRoll > 0.25 ? "likely" : "missing"
    const phoneRoll = rand(i * 6 + 4)
    const phoneStatus: AiLead["phoneStatus"] =
      phoneRoll > 0.62 ? "mobile" : phoneRoll > 0.32 ? "direct" : "none"
    const tech = subset(TECH_OPTIONS, i + 1, 0.7)
    const intent = subset(INTENT_OPTIONS, i + 5, 0.74)
    const linkedin = subset(LINKEDIN_OPTIONS, i + 9, 0.66)
    const inCrm = rand(i * 4 + 8) > 0.7
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
      technologies: tech.length ? tech : [TECH_OPTIONS[i % TECH_OPTIONS.length]],
      intent,
      linkedin,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      emailStatus,
      phoneStatus,
      signals: signals.length ? signals : [LEAD_SIGNALS_POOL[i % LEAD_SIGNALS_POOL.length]],
      lastActiveDays: Math.floor(rand(i * 8 + 3) * 60),
      fit: 0,
      inCrm,
    }
  })
}

export function foundedBand(year: number): string {
  if (year >= 2020) return "Founded 2020+"
  if (year >= 2015) return "Founded 2015-2019"
  if (year >= 2010) return "Founded 2010-2014"
  return "Founded before 2010"
}

function baseCompanies(): AiCompany[] {
  return COMPANIES.map((co, i) => {
    const signals = SIGNAL_OPTIONS.filter((_, s) => rand(i * 9 + s) > 0.58)
    const tech = subset(TECH_OPTIONS, i + 2, 0.68)
    return {
      id: `aic_${i + 1}`,
      name: co.name,
      domain: co.domain,
      industry: co.industry,
      headcount: co.headcount,
      headcountNum: HEADCOUNT_NUM[co.headcount] ?? 100,
      revenue: co.revenue,
      location: co.location,
      region: co.region,
      technologies: tech.length ? tech : [TECH_OPTIONS[i % TECH_OPTIONS.length]],
      foundedYear: 1999 + (Math.floor(rand(i * 17 + 3) * 24)),
      growth: pick(GROWTH_OPTIONS, Math.floor(rand(i * 19 + 1) * 4)),
      logoColor: co.logoColor,
      signals: signals.length ? signals : [SIGNAL_OPTIONS[i % SIGNAL_OPTIONS.length]],
      openRoles: Math.floor(rand(i * 11) * 14) + 1,
      fit: 0,
      inCrm: rand(i * 21 + 6) > 0.65,
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
  seed?: LookalikeSeed
} {
  const lower = prompt.toLowerCase()

  // Lookalike intent: "similar to X", "like X", "lookalikes of X".
  if (/\b(similar to|look ?alike|lookalikes?|just like|companies like|people like)\b/.test(lower)) {
    const seed = LOOKALIKE_SEEDS.find((s) => lower.includes(s.name.toLowerCase()))
    if (seed) {
      const q: AiQuery = { ...EMPTY_QUERY }
      if (/\bsmaller\b/.test(lower)) q.headcount = smallerThan(seed.headcount)
      if (/\blarger|bigger\b/.test(lower)) q.headcount = largerThan(seed.headcount)
      matchVocab(prompt, REGION_OPTIONS).forEach((r) => q.regions.push(r))
      const e: AiEntity = seed.kind === "company" ? "companies" : "people"
      const size = q.headcount.length
        ? /\bsmaller\b/.test(lower)
          ? " (smaller)"
          : " (larger)"
        : ""
      return {
        query: q,
        entity: e,
        seed,
        summary: `Found ${e === "companies" ? "companies" : "people"} similar to ${seed.name}${size}.`,
      }
    }
  }

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
  const departments = matchVocab(prompt, DEPARTMENT_OPTIONS)
  const technologies = matchVocab(prompt, TECH_OPTIONS)
  const intent = matchVocab(prompt, INTENT_OPTIONS)

  const query: AiQuery = {
    ...EMPTY_QUERY,
    titles: [...titles],
    seniority: [...seniority],
    regions,
    headcount,
    industries,
    departments,
    technologies,
    intent,
    signals: [...signals],
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
    q.departments.length === 0 &&
    q.technologies.length === 0 &&
    q.revenue.length === 0 &&
    q.intent.length === 0 &&
    q.signals.length === 0 &&
    q.founded.length === 0 &&
    q.growth.length === 0 &&
    q.linkedin.length === 0 &&
    q.keywords.trim() === "" &&
    Object.values(q.facets).every((v) => v.length === 0)
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
  // Score only against the INCLUDE side of each selection — exclusions filter
  // records out but never boost fit.
  if (q.titles.length) {
    asked += 1
    bump(splitSelection(q.titles).include.includes(lead.title), 16)
  }
  if (q.seniority.length) {
    asked += 1
    bump(splitSelection(q.seniority).include.includes(lead.seniority), 12)
  }
  if (q.regions.length) {
    asked += 1
    bump(splitSelection(q.regions).include.includes(lead.region), 10)
  }
  if (q.industries.length) {
    asked += 1
    bump(splitSelection(q.industries).include.includes(lead.industry), 10)
  }
  if (q.headcount.length) {
    asked += 1
    bump(splitSelection(q.headcount).include.includes(lead.headcount), 8)
  }
  if (q.signals.length) {
    asked += 1
    const inc = splitSelection(q.signals).include
    const overlap = lead.signals.filter((s) => inc.includes(s)).length
    score += Math.min(overlap, 2) * 9
    if (overlap > 0) matched += 1
  }
  if (q.departments.length) {
    asked += 1
    bump(splitSelection(q.departments).include.includes(lead.department), 8)
  }
  if (q.technologies.length) {
    asked += 1
    const inc = splitSelection(q.technologies).include
    const overlap = lead.technologies.filter((t) => inc.includes(t)).length
    score += Math.min(overlap, 2) * 7
    if (overlap > 0) matched += 1
  }
  if (q.revenue.length) {
    asked += 1
    bump(splitSelection(q.revenue).include.includes(lead.revenue), 7)
  }
  if (q.intent.length) {
    asked += 1
    const inc = splitSelection(q.intent).include
    const overlap = lead.intent.filter((t) => inc.includes(t)).length
    score += Math.min(overlap, 2) * 10
    if (overlap > 0) matched += 1
  }
  if (q.linkedin.length) {
    asked += 1
    const inc = splitSelection(q.linkedin).include
    const overlap = lead.linkedin.filter((t) => inc.includes(t)).length
    score += Math.min(overlap, 2) * 9
    if (overlap > 0) matched += 1
  }
  // Reward leads that match a higher share of what was asked.
  if (asked > 0) score += Math.round((matched / asked) * 8)
  return Math.max(45, Math.min(99, Math.round(score)))
}

function scoreCompany(co: AiCompany, q: AiQuery): number {
  let score = 60
  // Score only against the INCLUDE side — exclusions never boost fit.
  if (q.regions.length)
    score += splitSelection(q.regions).include.includes(co.region) ? 12 : -4
  if (q.industries.length)
    score += splitSelection(q.industries).include.includes(co.industry) ? 14 : -6
  if (q.headcount.length)
    score += splitSelection(q.headcount).include.includes(co.headcount) ? 10 : 0
  if (q.revenue.length)
    score += splitSelection(q.revenue).include.includes(co.revenue) ? 8 : 0
  if (q.founded.length)
    score += splitSelection(q.founded).include.includes(foundedBand(co.foundedYear)) ? 8 : 0
  if (q.growth.length)
    score += splitSelection(q.growth).include.includes(co.growth) ? 9 : 0
  if (q.technologies.length) {
    const inc = splitSelection(q.technologies).include
    const overlap = co.technologies.filter((t) => inc.includes(t)).length
    score += Math.min(overlap, 2) * 8
  }
  if (q.signals.length) {
    const inc = splitSelection(q.signals).include
    const overlap = co.signals.filter((s) => inc.includes(s)).length
    score += Math.min(overlap, 2) * 10
  }
  return Math.max(45, Math.min(99, Math.round(score)))
}

export function searchLeads(q: AiQuery): AiLead[] {
  const kw = q.keywords.trim().toLowerCase()
  return LEAD_POOL.map((l) => ({ ...l, fit: scoreLead(l, q) }))
    .filter((l) => {
      if (q.titles.length && !matchValue(q.titles, l.title)) return false
      if (q.seniority.length && !matchValue(q.seniority, l.seniority)) return false
      if (q.regions.length && !matchValue(q.regions, l.region)) return false
      if (q.industries.length && !matchValue(q.industries, l.industry)) return false
      if (q.headcount.length && !matchValue(q.headcount, l.headcount)) return false
      if (q.departments.length && !matchValue(q.departments, l.department)) return false
      if (q.revenue.length && !matchValue(q.revenue, l.revenue)) return false
      if (q.technologies.length && !matchAny(q.technologies, l.technologies)) return false
      if (q.intent.length && !matchAny(q.intent, l.intent)) return false
      if (q.signals.length && !matchAny(q.signals, l.signals)) return false
      if (q.linkedin.length && !matchAny(q.linkedin, l.linkedin)) return false
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
      if (q.regions.length && !matchValue(q.regions, c.region)) return false
      if (q.industries.length && !matchValue(q.industries, c.industry)) return false
      if (q.headcount.length && !matchValue(q.headcount, c.headcount)) return false
      if (q.revenue.length && !matchValue(q.revenue, c.revenue)) return false
      if (q.founded.length && !matchValue(q.founded, foundedBand(c.foundedYear))) return false
      if (q.growth.length && !matchValue(q.growth, c.growth)) return false
      if (q.technologies.length && !matchAny(q.technologies, c.technologies)) return false
      if (q.signals.length && !matchAny(q.signals, c.signals)) return false
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

/* ----------------------------- lookalikes ------------------------------- */
// AI lookalike search always starts from a seed — a person/customer or a
// company — then returns similar records, optionally narrowed by modifiers
// (e.g. "companies similar to Vicio but smaller").

export interface LookalikeSeed {
  id: string
  kind: "person" | "company"
  name: string
  sub: string // "Title @ Company" for people, industry line for companies
  industry: string
  region: string
  headcount: string
}

export const LOOKALIKE_SEEDS: LookalikeSeed[] = [
  { id: "seed_vicio", kind: "company", name: "Vicio", sub: "E-commerce · EMEA", industry: "E-commerce", region: "EMEA", headcount: "201-500" },
  { id: "seed_fever", kind: "company", name: "Fever", sub: "E-commerce · EMEA", industry: "E-commerce", region: "EMEA", headcount: "501-1000" },
  { id: "seed_factorial", kind: "company", name: "Factorial", sub: "SaaS · EMEA", industry: "SaaS", region: "EMEA", headcount: "501-1000" },
  { id: "seed_ramp", kind: "company", name: "Ramp", sub: "Fintech · North America", industry: "Fintech", region: "North America", headcount: "1000+" },
  { id: "seed_gympass", kind: "company", name: "Gympass", sub: "Healthtech · LATAM", industry: "Healthtech", region: "LATAM", headcount: "1000+" },
  { id: "seed_sarah", kind: "person", name: "Sarah Chen", sub: "VP of Sales @ Fever", industry: "E-commerce", region: "EMEA", headcount: "501-1000" },
  { id: "seed_aisha", kind: "person", name: "Aisha Khan", sub: "CRO @ Clarity AI", industry: "Fintech", region: "EMEA", headcount: "201-500" },
  { id: "seed_grace", kind: "person", name: "Grace Liu", sub: "COO @ Betterfly", industry: "Healthtech", region: "LATAM", headcount: "501-1000" },
]

function headcountIndex(h: string): number {
  const i = HEADCOUNT_OPTIONS.indexOf(h)
  return i === -1 ? 2 : i
}

export function smallerThan(headcount: string): string[] {
  const i = headcountIndex(headcount)
  return HEADCOUNT_OPTIONS.filter((_, idx) => idx < i)
}

export function largerThan(headcount: string): string[] {
  const i = headcountIndex(headcount)
  return HEADCOUNT_OPTIONS.filter((_, idx) => idx > i)
}

interface Similar {
  industry: string
  region: string
  headcount: string
}

function similarity(rec: Similar, seed: LookalikeSeed): number {
  let s = 42
  if (rec.industry === seed.industry) s += 30
  if (rec.region === seed.region) s += 18
  const d = Math.abs(headcountIndex(rec.headcount) - headcountIndex(seed.headcount))
  s += d === 0 ? 10 : d === 1 ? 5 : 0
  return s
}

function passesQuery(rec: { region: string; industry: string; headcount: string; signals: string[] }, q: AiQuery): boolean {
  if (q.regions.length && !q.regions.includes(rec.region)) return false
  if (q.industries.length && !q.industries.includes(rec.industry)) return false
  if (q.headcount.length && !q.headcount.includes(rec.headcount)) return false
  if (q.signals.length && !rec.signals.some((s) => q.signals.includes(s))) return false
  return true
}

export function lookalikeLeads(seed: LookalikeSeed, q: AiQuery): AiLead[] {
  return LEAD_POOL.map((l) => ({ ...l, fit: Math.min(99, similarity(l, seed)) }))
    .filter((l) => l.company !== seed.name)
    .filter((l) => passesQuery(l, q))
    .filter((l) => (q.titles.length ? q.titles.includes(l.title) : true))
    .filter((l) => (q.seniority.length ? q.seniority.includes(l.seniority) : true))
    .sort((a, b) => b.fit - a.fit)
}

export function lookalikeCompanies(seed: LookalikeSeed, q: AiQuery): AiCompany[] {
  return COMPANY_POOL.map((c) => ({ ...c, fit: Math.min(99, similarity(c, seed)) }))
    .filter((c) => c.name !== seed.name)
    .filter((c) => passesQuery(c, q))
    .sort((a, b) => b.fit - a.fit)
}

/* --------------------------- match reasons ------------------------------ */
// Like LinkedIn's AI search, surface *why* a record matched the query.

export function matchReasons(lead: AiLead, q: AiQuery): string[] {
  const r: string[] = []
  if (q.titles.includes(lead.title)) r.push(lead.title)
  if (q.seniority.includes(lead.seniority)) r.push(lead.seniority)
  if (q.departments.includes(lead.department)) r.push(lead.department)
  if (q.regions.includes(lead.region)) r.push(lead.region)
  if (q.industries.includes(lead.industry)) r.push(lead.industry)
  if (q.headcount.includes(lead.headcount)) r.push(lead.headcount)
  if (q.revenue.includes(lead.revenue)) r.push(lead.revenue)
  lead.technologies.forEach((t) => q.technologies.includes(t) && r.push(t))
  lead.intent.forEach((t) => q.intent.includes(t) && r.push(t))
  lead.signals.forEach((t) => q.signals.includes(t) && r.push(t))
  lead.linkedin.forEach((t) => q.linkedin.includes(t) && r.push(t))
  return [...new Set(r)]
}

export function companyMatchReasons(co: AiCompany, q: AiQuery): string[] {
  const r: string[] = []
  if (q.regions.includes(co.region)) r.push(co.region)
  if (q.industries.includes(co.industry)) r.push(co.industry)
  if (q.headcount.includes(co.headcount)) r.push(co.headcount)
  if (q.revenue.includes(co.revenue)) r.push(co.revenue)
  if (q.founded.includes(foundedBand(co.foundedYear))) r.push(foundedBand(co.foundedYear))
  if (q.growth.includes(co.growth)) r.push(co.growth)
  co.technologies.forEach((t) => q.technologies.includes(t) && r.push(t))
  co.signals.forEach((t) => q.signals.includes(t) && r.push(t))
  return [...new Set(r)]
}

/* ------------------------------ sorting --------------------------------- */

export type SortKey = "fit" | "name" | "company" | "headcount" | "recent"

export const SORT_KEYS: SortKey[] = ["fit", "name", "company", "headcount", "recent"]

export function sortLeads(leads: AiLead[], key: SortKey): AiLead[] {
  const out = [...leads]
  switch (key) {
    case "name":
      return out.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      )
    case "company":
      return out.sort((a, b) => a.company.localeCompare(b.company))
    case "headcount":
      return out.sort(
        (a, b) => (HEADCOUNT_NUM[b.headcount] ?? 0) - (HEADCOUNT_NUM[a.headcount] ?? 0)
      )
    case "recent":
      return out.sort((a, b) => a.lastActiveDays - b.lastActiveDays)
    default:
      return out.sort((a, b) => b.fit - a.fit)
  }
}

export function sortCompanies(companies: AiCompany[], key: SortKey): AiCompany[] {
  const out = [...companies]
  switch (key) {
    case "name":
    case "company":
      return out.sort((a, b) => a.name.localeCompare(b.name))
    case "headcount":
      return out.sort((a, b) => b.headcountNum - a.headcountNum)
    default:
      return out.sort((a, b) => b.fit - a.fit)
  }
}

export const CREDITS_PER_LEAD = 1.7

// Suggested searches on the home screen — separate people vs company sets so the
// list adapts to the selected search type.
export const EXAMPLE_PROMPTS_EN = [
  "VPs of Sales at European SaaS companies that recently raised funding",
  "Heads of Growth in fintech across EMEA hiring sales reps",
  "RevOps leaders at 500+ employee companies adopting AI",
  "CTOs at Series B startups in the US expanding their teams",
]

export const EXAMPLE_PROMPTS_ES = [
  "VPs de Ventas en empresas SaaS europeas que han levantado financiación",
  "Heads of Growth en fintech de EMEA que están contratando comerciales",
  "Líderes de RevOps en empresas de más de 500 empleados que adoptan IA",
  "CTOs en startups Series B de EE. UU. que amplían sus equipos",
]

export const EXAMPLE_PROMPTS_COMPANIES_EN = [
  "European SaaS companies that recently raised a Series B",
  "Fintech companies across EMEA hiring sales reps",
  "500+ employee companies adopting AI",
  "E-commerce companies in LATAM expanding into new markets",
]

export const EXAMPLE_PROMPTS_COMPANIES_ES = [
  "Empresas SaaS europeas que han levantado una Serie B",
  "Empresas fintech de EMEA que están contratando comerciales",
  "Empresas de más de 500 empleados que adoptan IA",
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

// Seeded so the "Saved searches" picker (and the workspace source step) land
// populated for demos. Queries are left empty — only name/prompt/entity/count
// matter for the picker and association UI.
const SAVED_SEED: SavedAiSearch[] = [
  {
    id: "ss_1",
    name: "VPs of Sales · EMEA SaaS",
    entity: "people",
    query: {
      ...EMPTY_QUERY,
      titles: ["VP of Sales"],
      regions: ["EMEA"],
      industries: ["SaaS"],
      signals: ["Recently funded"],
    },
    prompt: "VPs of Sales at European SaaS companies that recently raised funding",
    messages: [],
    resultCount: 184,
    createdAt: "2026-06-20T00:00:00Z",
  },
  {
    id: "ss_2",
    name: "Heads of Growth · Fintech",
    entity: "people",
    query: {
      ...EMPTY_QUERY,
      titles: ["Head of Growth"],
      regions: ["EMEA"],
      industries: ["Fintech"],
      signals: ["Hiring sales"],
    },
    prompt: "Heads of Growth in fintech across EMEA hiring SDRs",
    messages: [],
    resultCount: 96,
    createdAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "ss_3",
    name: "RevOps leaders · 500+",
    entity: "people",
    query: {
      ...EMPTY_QUERY,
      titles: ["Director of RevOps"],
      seniority: ["VP", "Director"],
      headcount: ["501-1000", "1000+"],
    },
    prompt: "RevOps leaders at 500+ employee companies",
    messages: [],
    resultCount: 212,
    createdAt: "2026-06-24T00:00:00Z",
  },
  {
    id: "ss_4",
    name: "Recently funded B2B SaaS",
    entity: "companies",
    query: {
      ...EMPTY_QUERY,
      industries: ["SaaS"],
      headcount: ["51-200", "201-500"],
      signals: ["Recently funded"],
    },
    prompt: "B2B SaaS companies that raised a round in the last 6 months",
    messages: [],
    resultCount: 340,
    createdAt: "2026-06-25T00:00:00Z",
  },
]

function loadSaved(): SavedAiSearch[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (raw) return JSON.parse(raw) as SavedAiSearch[]
  } catch {
    /* ignore */
  }
  return SAVED_SEED
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
