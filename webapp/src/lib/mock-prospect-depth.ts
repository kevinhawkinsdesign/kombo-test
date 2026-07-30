import type { Prospect } from "./types"

// --- Notes ---
export interface ProspectNote {
  id: string
  author: string
  body: string
  tags: string[]
  createdAt: string
}

export const SMART_TAGS = [
  "Champion",
  "Decision maker",
  "Budget holder",
  "Technical buyer",
  "Blocker",
  "Competitor user",
  "Timing: this quarter",
  "Referral",
]

export const prospectNotes: Record<string, ProspectNote[]> = {
  p_1: [
    {
      id: "note_1",
      author: "Maya Patel",
      body: "Sarah confirmed they're hiring 5 SDRs this quarter. She owns the tooling decision and wants to move before end of Q3.",
      tags: ["Champion", "Decision maker", "Timing: this quarter"],
      createdAt: "2026-06-16T14:30:00Z",
    },
    {
      id: "note_2",
      author: "Maya Patel",
      body: "Mentioned they evaluated a competitor last year but churned over poor CRM sync. Lead with HubSpot two-way sync.",
      tags: ["Competitor user"],
      createdAt: "2026-06-10T09:15:00Z",
    },
  ],
  p_9: [
    {
      id: "note_3",
      author: "Maya Patel",
      body: "Wei needs a security review before signing. SOC 2 report sent. Procurement is looped in.",
      tags: ["Technical buyer", "Blocker"],
      createdAt: "2026-06-16T09:30:00Z",
    },
  ],
}

export function getNotes(prospectId: string): ProspectNote[] {
  return prospectNotes[prospectId] ?? []
}

// --- History timeline ---
export type HistoryType =
  | "added"
  | "enriched"
  | "email_sent"
  | "email_opened"
  | "replied"
  | "call"
  | "meeting"
  | "note"
  | "status"

export interface HistoryEvent {
  id: string
  type: HistoryType
  label: string
  detail?: string
  timestamp: string
}

// Build a believable timeline from the prospect's own data.
export function getHistory(p: Prospect): HistoryEvent[] {
  const added = new Date(p.addedAt).getTime()
  const day = 86400000
  const events: HistoryEvent[] = [
    { id: `${p.id}_h1`, type: "added", label: "Added to Kombo", detail: "from Find Prospects", timestamp: new Date(added).toISOString() },
    { id: `${p.id}_h2`, type: "enriched", label: "Enriched", detail: "30 data points appended", timestamp: new Date(added + day * 0.1).toISOString() },
  ]
  if (["contacted", "replied", "meeting", "customer"].includes(p.status)) {
    events.push(
      { id: `${p.id}_h3`, type: "email_sent", label: "Email sent", detail: "Step 1 — cold outreach", timestamp: new Date(added + day).toISOString() },
      { id: `${p.id}_h4`, type: "email_opened", label: "Email opened", detail: "2 times", timestamp: new Date(added + day * 1.2).toISOString() }
    )
  }
  if (["replied", "meeting", "customer"].includes(p.status)) {
    events.push({ id: `${p.id}_h5`, type: "replied", label: "Replied", detail: "Positive sentiment", timestamp: new Date(added + day * 2).toISOString() })
  }
  if (["meeting", "customer"].includes(p.status)) {
    events.push({ id: `${p.id}_h6`, type: "meeting", label: "Meeting booked", detail: "Discovery call", timestamp: new Date(added + day * 3).toISOString() })
  }
  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

// --- Lead qualification ---
export interface Qualification {
  fit: number
  intent: number
  engagement: number
  reasons: string[]
}

export function qualification(p: Prospect): Qualification {
  const fit = Math.min(100, Math.round(p.score * 0.6 + 40))
  const intent = Math.min(100, 30 + p.signals.length * 18)
  const engagementByStatus: Record<string, number> = {
    new: 15,
    contacted: 45,
    replied: 80,
    meeting: 92,
    customer: 100,
    not_interested: 20,
  }
  const engagement = engagementByStatus[p.status] ?? 30
  const reasons: string[] = [
    `${p.seniority} seniority in ${p.department}`,
    `${p.headcount} employees · ${p.industry}`,
    ...p.signals.slice(0, 2).map((s) => `Buying signal: ${s}`),
  ]
  return { fit, intent, engagement, reasons }
}

// --- AI call prep ---
export interface CallPrep {
  talkingPoints: string[]
  discoveryQuestions: string[]
  objections: { objection: string; response: string }[]
}

// `product` is which of the rep's sellable products (lib/mock-products.ts) to
// frame the prep around — only meaningful when the rep sells more than one;
// omitted it falls back to the generic company-signal opener.
export function callPrep(
  p: Prospect,
  product?: { name: string; usp: string }
): CallPrep {
  return {
    talkingPoints: [
      product
        ? `Open by connecting ${p.company}'s ${p.signals[0]?.toLowerCase() ?? "recent growth"} to ${product.name}: ${product.usp}`
        : `Open by referencing ${p.company}'s ${p.signals[0]?.toLowerCase() ?? "recent growth"}.`,
      `Tie value to ${p.department} priorities at a ${p.headcount}-person ${p.industry} company.`,
      `${p.firstName} is ${p.seniority}-level — speak to outcomes (pipeline, ramp time), not features.`,
    ],
    discoveryQuestions: [
      `How is your team handling outbound prospecting today?`,
      `What does a good week vs. a bad week look like for booked meetings?`,
      `Who else would be involved in evaluating a tool like this?`,
      `What's driving the timing on solving this now?`,
    ],
    objections: [
      {
        objection: "We already have a tool for this.",
        response: `Totally fair — most teams we work with did too. The difference is the two-way ${"CRM"} sync and AI scoring. What's working and not working with your current setup?`,
      },
      {
        objection: "Not the right time / no budget.",
        response: `Understood. Many leaders start with a small pilot to prove ROI before committing budget. Would a 2-week pilot on one segment be worth exploring?`,
      },
    ],
  }
}

// --- AI email prep ---
export interface EmailVariant {
  id: string
  tone: string
  subject: string
  body: string
}

// --- Professional summary (bulleted career overview) ---
// Deterministic bullets derived from the prospect's own fields — same
// template-fill approach as generateProspectSummary() in mock-ai-summary.ts,
// just split into a bullet list instead of a paragraph.
export function professionalSummaryBullets(p: Prospect): string[] {
  const bullets = [
    `${p.seniority}-level ${p.title} at ${p.company}, a ${p.headcount}-employee company in ${p.industry}.`,
    p.about,
  ]
  // Skip when the about text already names the signal (generated prospects'
  // about copy is itself signal-derived) to avoid a redundant third bullet.
  if (p.signals[0] && !p.about.includes(p.signals[0])) {
    bullets.push(`Recent signal: ${p.signals[0]}.`)
  }
  return bullets
}

// --- Engagement strategy (do's / don'ts) ---
export interface EngagementStrategy {
  dos: string[]
  donts: string[]
}

export function engagementStrategy(p: Prospect): EngagementStrategy {
  const signal = p.signals[0]
  return {
    dos: [
      `Lead with outcomes that matter to ${p.department} — ${p.seniority.toLowerCase()}-level buyers want the summary first, details second.`,
      signal
        ? `Reference their recent signal: "${signal}."`
        : `Reference something specific about ${p.company} — a generic opener won't land.`,
      `Keep the first touch short; earn a longer conversation before going deep.`,
    ],
    donts: [
      `Don't open with a feature list — tie everything back to ${p.department} priorities.`,
      `Don't skip discovery, even if the fit looks obvious from ${p.company}'s profile.`,
      `Don't over-promise on timeline before you understand their evaluation process.`,
    ],
  }
}

// --- Challenges (generic + specific pain points, value proposition) ---
export interface ProspectChallenges {
  generic: string[]
  specific: string[]
  valueProp: string
}

export function challenges(p: Prospect): ProspectChallenges {
  const generic = [
    "Manual prospecting eats into time reps could spend selling.",
    "Inconsistent CRM data makes forecasting unreliable.",
    "Outbound reply rates have been trending down industry-wide.",
  ]
  const specific = [
    `As a ${p.headcount}-employee ${p.industry} company, ${p.company} likely juggles a fragmented tech stack across ${p.department}.`,
    p.signals[0]
      ? `"${p.signals[0]}" suggests this is an active priority right now, not a someday project.`
      : `No strong urgency signal detected yet — worth probing on timing directly.`,
  ]
  const valueProp = `Kombo replaces manual research and point tools with one AI-enriched workspace, so ${p.firstName}'s team spends more time in conversations and less time on data entry.`
  return { generic, specific, valueProp }
}

// --- LinkedIn activity feed ---
export interface LinkedInPost {
  id: string
  summary: string
  timestamp: string
  reactions: number
  comments: number
}

export function linkedinActivity(p: Prospect): LinkedInPost[] {
  const added = new Date(p.addedAt).getTime()
  const day = 86400000
  // Deterministic pseudo-counts from the prospect id, so numbers stay stable
  // across re-renders without being identical for every prospect.
  let seed = 0
  for (let i = 0; i < p.id.length; i++) seed = (seed * 31 + p.id.charCodeAt(i)) >>> 0
  const base = 20 + (seed % 180)
  return [
    {
      id: `${p.id}_li1`,
      summary: `Shared a post about ${(p.signals[0] ?? "growing the team").toLowerCase()} at ${p.company}.`,
      timestamp: new Date(added - day * 3).toISOString(),
      reactions: base,
      comments: Math.round(base / 8),
    },
    {
      id: `${p.id}_li2`,
      summary: `Commented on an industry post about ${p.industry}.`,
      timestamp: new Date(added - day * 9).toISOString(),
      reactions: Math.round(base * 0.6),
      comments: Math.round(base / 12),
    },
  ]
}

// --- Activity insights (CRM-derived summary + suggested next steps) ---
export interface ActivityInsightsSummary {
  summary: string
  nextSteps: string[]
}

const ACTIVITY_NEXT_STEPS: Record<Prospect["status"], string[]> = {
  new: ["Log a first touch so the CRM timeline isn't empty when you follow up."],
  contacted: ["Follow up if there's no reply within a few business days."],
  replied: ["Move the conversation toward a concrete next step while it's warm."],
  meeting: ["Confirm the agenda and attendees 24 hours ahead of the call."],
  customer: ["Check in on adoption; flag as a candidate for expansion or referral."],
  not_interested: ["Deprioritize for now — revisit if a new signal fires."],
}

export function activityInsights(
  p: Prospect,
  crmName: string
): ActivityInsightsSummary {
  const activityWord =
    p.status === "new"
      ? "no logged touches yet"
      : p.status === "replied"
        ? "been actively replying to outreach"
        : `been marked "${p.status.replace("_", " ")}" after recent touches`
  return {
    summary: `Based on your ${crmName} activity, ${p.firstName} has ${activityWord}.`,
    nextSteps: ACTIVITY_NEXT_STEPS[p.status] ?? ACTIVITY_NEXT_STEPS.new,
  }
}

export function emailPrep(
  p: Prospect,
  product?: { name: string; usp: string }
): EmailVariant[] {
  const signal = p.signals[0] ?? "your team's growth"
  const pitch = product
    ? `${product.name} — ${product.usp}`
    : `We help ${p.department} leaders build qualified pipeline 3x faster with AI-assisted prospecting and clean CRM data.`
  return [
    {
      id: "ev_direct",
      tone: "Direct",
      subject: `${p.firstName}, scaling outbound at ${p.company}`,
      body: `Hi ${p.firstName},\n\nNoticed ${p.company} is ${signal.toLowerCase()}. ${pitch}\n\nWorth a 15-min look this week?\n\nBest,\nKevin`,
    },
    {
      id: "ev_consultative",
      tone: "Consultative",
      subject: `A question about ${p.company}'s pipeline`,
      body: `Hi ${p.firstName},\n\nQuick question — as ${p.title}, how are you thinking about ramping new reps without sacrificing pipeline quality?\n\nThe reason I ask: teams in ${p.industry} like ${p.company} often hit an inconsistency wall as they scale outbound. Happy to share what's working for similar teams.\n\nOpen to a chat?\n\nKevin`,
    },
  ]
}
