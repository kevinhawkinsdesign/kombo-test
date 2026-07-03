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

export function callPrep(p: Prospect): CallPrep {
  return {
    talkingPoints: [
      `Open by referencing ${p.company}'s ${p.signals[0]?.toLowerCase() ?? "recent growth"}.`,
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

export function emailPrep(p: Prospect): EmailVariant[] {
  const signal = p.signals[0] ?? "your team's growth"
  return [
    {
      id: "ev_direct",
      tone: "Direct",
      subject: `${p.firstName}, scaling outbound at ${p.company}`,
      body: `Hi ${p.firstName},\n\nNoticed ${p.company} is ${signal.toLowerCase()}. We help ${p.department} leaders build qualified pipeline 3x faster with AI-assisted prospecting and clean CRM data.\n\nWorth a 15-min look this week?\n\nBest,\nKevin`,
    },
    {
      id: "ev_consultative",
      tone: "Consultative",
      subject: `A question about ${p.company}'s pipeline`,
      body: `Hi ${p.firstName},\n\nQuick question — as ${p.title}, how are you thinking about ramping new reps without sacrificing pipeline quality?\n\nThe reason I ask: teams in ${p.industry} like ${p.company} often hit an inconsistency wall as they scale outbound. Happy to share what's working for similar teams.\n\nOpen to a chat?\n\nKevin`,
    },
  ]
}
