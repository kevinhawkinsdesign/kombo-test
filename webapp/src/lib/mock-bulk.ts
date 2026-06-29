import type { Account, Prospect, ProspectStatus } from "./types"

// Procedurally generated bulk data so the People and Companies pages feel like
// a real, populated workspace (1,000+ records each). Fully deterministic —
// derived from the record index, no Date/Math.random — so builds are stable.

const FIRST = [
  "Sarah", "Marcus", "Aisha", "James", "Elena", "David", "Priya", "Liam",
  "Nora", "Diego", "Hannah", "Omar", "Chloe", "Mateo", "Yuki", "Noah",
  "Amara", "Ethan", "Sofia", "Kai", "Isabella", "Leon", "Maya", "Hugo",
  "Zoe", "Ravi", "Clara", "Tariq", "Ingrid", "Pablo", "Lena", "Sven",
  "Anaïs", "Tomás", "Freya", "Idris", "Camila", "Jonas", "Aria", "Nikhil",
  "Greta", "Mateusz", "Lucia", "Bjorn", "Farah", "Oscar", "Nadia", "Theo",
]

const LAST = [
  "Chen", "Riley", "Khan", "O'Connor", "Vargas", "Park", "Sharma", "Walsh",
  "Bauer", "Costa", "Meyer", "Haddad", "Dubois", "Rossi", "Tanaka", "Novak",
  "Okafor", "Berg", "Silva", "Lindqvist", "Romano", "Schmidt", "Nair", "Moretti",
  "Andersen", "Kapoor", "Fischer", "Bensaïd", "Larsen", "Marín", "Kowalski", "Eriksson",
  "Laurent", "Mendez", "Johansson", "Diallo", "Reyes", "Weber", "Patel", "Sato",
  "Voss", "Nowak", "Castro", "Holm", "Aziz", "Lindgren", "Petrova", "Klein",
]

const PREFIX = [
  "Nimbus", "Vertex", "Quanta", "Lumen", "Apex", "Northwind", "Cobalt", "Helix",
  "Brightwave", "Strata", "Cinder", "Vela", "Orbit", "Pioneer", "Cascade", "Aurora",
  "Beacon", "Ember", "Forge", "Glide", "Harbor", "Ionic", "Junction", "Keystone",
  "Lattice", "Meridian", "Novel", "Oakline", "Pulse", "Quill", "Ridge", "Summit",
  "Tide", "Union", "Vantage", "Wren", "Zephyr", "Atlas", "Bolt", "Crest",
  "Drift", "Echo", "Flint", "Grove", "Haven", "Iris", "Juno", "Kite",
  "Loom", "Maple",
]

const SUFFIX = [
  "Labs", "AI", "Systems", "Cloud", "Works", "Technologies", "Data", "Logic",
  "Health", "Pay", "Commerce", "Security", "Analytics", "Robotics", "Networks",
  "Software", "Digital", "Group", "HQ", "Bio", "Energy", "Mobility",
]

const TLD = [".com", ".io", ".ai", ".co"]

const INDUSTRIES = [
  "B2B SaaS", "Fintech", "E-commerce", "Healthcare Technology", "Cybersecurity",
  "Marketing Technology", "Logistics & Supply Chain", "Artificial Intelligence",
  "Data & Analytics", "Developer Tools", "HR Technology", "Insurtech",
  "Sustainability & Climate", "EdTech",
]

const EMPLOYEES = ["11-50", "51-200", "201-500", "500-1000", "1000-5000", "5000+"]
const REVENUES = [
  "$1M-$10M", "$10M-$50M", "$50M-$100M", "$100M-$250M", "$250M-$500M", "$500M-$1B",
]

const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "Austin, TX", "Boston, MA", "Seattle, WA",
  "Denver, CO", "Chicago, IL", "Atlanta, GA", "London, UK", "Berlin, DE",
  "Paris, FR", "Amsterdam, NL", "Madrid, ES", "Dublin, IE", "Stockholm, SE",
  "Toronto, CA", "Singapore, SG", "Sydney, AU", "Lisbon, PT", "Munich, DE",
  "Barcelona, ES", "Tel Aviv, IL", "Bengaluru, IN", "São Paulo, BR",
]

const LOGO_COLORS = [
  "#7c3aed", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899",
  "#6366f1", "#14b8a6", "#E5006D", "#008BE6", "#1F6FEB", "#f97316",
]

const TITLES: { title: string; seniority: string; department: string }[] = [
  { title: "Chief Revenue Officer", seniority: "C-Level", department: "Executive" },
  { title: "Chief Executive Officer", seniority: "C-Level", department: "Executive" },
  { title: "Chief Marketing Officer", seniority: "C-Level", department: "Executive" },
  { title: "VP of Sales", seniority: "VP", department: "Sales" },
  { title: "VP of Revenue", seniority: "VP", department: "Sales" },
  { title: "VP of Marketing", seniority: "VP", department: "Marketing" },
  { title: "VP of Customer Success", seniority: "VP", department: "Customer Success" },
  { title: "Head of Sales", seniority: "Head", department: "Sales" },
  { title: "Head of Growth", seniority: "Head", department: "Marketing" },
  { title: "Head of Revenue Operations", seniority: "Head", department: "Operations" },
  { title: "Head of Sales Development", seniority: "Head", department: "Sales" },
  { title: "Director of Sales", seniority: "Director", department: "Sales" },
  { title: "Director of RevOps", seniority: "Director", department: "Operations" },
  { title: "Director of Demand Generation", seniority: "Director", department: "Marketing" },
  { title: "Sales Manager", seniority: "Manager", department: "Sales" },
  { title: "Account Executive", seniority: "Manager", department: "Sales" },
  { title: "Marketing Operations Manager", seniority: "Manager", department: "Marketing" },
  { title: "Growth Lead", seniority: "Manager", department: "Marketing" },
]

const STATUSES: ProspectStatus[] = [
  "new", "contacted", "replied", "meeting", "customer", "not_interested",
]

const TAGS = [
  "ICP", "Decision maker", "Champion", "C-level", "RevOps", "Warm",
  "High intent", "Inbound", "Event lead", "Referral", "Re-engage", "Tier 1",
]

const SIGNALS = [
  "Hiring SDRs", "Visited pricing page", "Series B funding", "Series C funding",
  "Attended webinar", "Posted about outbound", "Evaluating CRM add-ons",
  "Expanding to EMEA", "New exec hire", "Adopting AI", "High web intent",
  "Downloaded a guide", "Opened 3 emails", "Mentioned a competitor",
]

const TIERS = ["Enterprise", "Mid-market", "SMB"] as const

// Spread of dates across the demo window — picked by index, no Date math.
const DATES = [
  "2026-06-29T09:00:00Z", "2026-06-28T13:10:00Z", "2026-06-27T16:40:00Z",
  "2026-06-25T11:20:00Z", "2026-06-23T08:05:00Z", "2026-06-21T15:30:00Z",
  "2026-06-19T10:45:00Z", "2026-06-17T14:00:00Z", "2026-06-14T09:25:00Z",
  "2026-06-11T17:15:00Z", "2026-06-08T12:50:00Z", "2026-06-04T10:05:00Z",
  "2026-05-30T14:35:00Z", "2026-05-24T09:40:00Z", "2026-05-18T16:20:00Z",
  "2026-05-12T11:10:00Z", "2026-05-05T13:55:00Z", "2026-04-28T08:30:00Z",
  "2026-04-20T15:05:00Z", "2026-04-12T10:50:00Z", "2026-04-03T14:15:00Z",
  "2026-03-22T09:35:00Z", "2026-03-10T16:45:00Z", "2026-02-26T12:25:00Z",
]

function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length]
}

export interface BulkCompany {
  name: string
  domain: string
  industry: string
  employees: string
  revenue: string
  location: string
  logoColor: string
}

// Build a deterministic set of unique-ish companies used by both pages.
function buildCompanies(n: number): BulkCompany[] {
  const out: BulkCompany[] = []
  for (let i = 0; i < n; i++) {
    const prefix = pick(PREFIX, i)
    const suffix = pick(SUFFIX, Math.floor(i / PREFIX.length))
    const name = `${prefix} ${suffix}`
    const slug = `${prefix}${suffix}`.toLowerCase()
    out.push({
      name,
      domain: `${slug}${pick(TLD, i)}`,
      industry: pick(INDUSTRIES, i * 5 + 2),
      employees: pick(EMPLOYEES, i * 3 + 1),
      revenue: pick(REVENUES, i * 7 + 4),
      location: pick(LOCATIONS, i * 11 + 3),
      logoColor: pick(LOGO_COLORS, i),
    })
  }
  return out
}

export const BULK_COUNT = 1000
export const bulkCompanies: BulkCompany[] = buildCompanies(BULK_COUNT)

export function generateProspects(): Prospect[] {
  return bulkCompanies.map((co, i) => {
    const first = pick(FIRST, i * 7 + 3)
    const last = pick(LAST, i * 13 + 5)
    const t = pick(TITLES, i * 5 + 1)
    const score = 60 + ((i * 17) % 40) // 60–99
    return {
      id: `pb_${i + 1}`,
      firstName: first,
      lastName: last,
      title: t.title,
      company: co.name,
      companyDomain: co.domain,
      location: co.location,
      email: `${first}.${last}@${co.domain}`.toLowerCase().replace(/[^a-z0-9.@]/g, ""),
      phone: i % 3 === 0 ? `+1 415 555 ${String(1000 + (i % 8999)).padStart(4, "0")}` : undefined,
      linkedinUrl: `https://linkedin.com/in/${first}${last}`.toLowerCase().replace(/[^a-z0-9/:.]/g, ""),
      avatarColor: pick(LOGO_COLORS, i * 2),
      score,
      status: pick(STATUSES, i * 3 + 1),
      tags: [pick(TAGS, i), pick(TAGS, i * 3 + 5)],
      lastActivity: pick(DATES, i),
      addedAt: pick(DATES, i + 6),
      seniority: t.seniority,
      department: t.department,
      headcount: co.employees,
      industry: co.industry,
      revenue: co.revenue,
      about: `${t.title} at ${co.name}. ${pick(SIGNALS, i)}.`,
      signals: [pick(SIGNALS, i), pick(SIGNALS, i * 2 + 3)],
      // Half the bulk set is sourced-but-not-yet-enriched, to exercise the
      // enrichment UI at scale.
      enriched: i % 2 === 0 ? undefined : false,
    }
  })
}

export function generateAccounts(): Account[] {
  return bulkCompanies.map((co, i) => {
    const exec1 = `${pick(FIRST, i * 5)} ${pick(LAST, i * 9 + 2)}`
    const exec2 = `${pick(FIRST, i * 5 + 4)} ${pick(LAST, i * 9 + 7)}`
    const openDeals = i % 4 === 0 ? (i % 3) + 1 : 0
    return {
      id: `acb_${i + 1}`,
      name: co.name,
      domain: co.domain,
      industry: co.industry,
      employees: co.employees,
      revenue: co.revenue,
      location: co.location,
      logoColor: co.logoColor,
      tier: pick([...TIERS], i * 2 + 1),
      healthScore: 55 + ((i * 13) % 45), // 55–99
      openDeals,
      pipeline: openDeals > 0 ? (1 + (i % 9)) * 25000 : 0,
      contacts: 1 + (i % 8),
      ownerId: `rep_${(i % 5) + 1}`,
      lastActivity: pick(DATES, i + 2),
      about: `${co.name} — ${co.industry.toLowerCase()} company in ${co.location}. ${pick(SIGNALS, i)}.`,
      signals: [pick(SIGNALS, i + 1), pick(SIGNALS, i * 2 + 5)],
      keyExecutives: [
        { name: exec1, title: pick(TITLES, i).title },
        { name: exec2, title: pick(TITLES, i + 3).title },
      ],
    }
  })
}
