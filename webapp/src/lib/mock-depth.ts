import type {
  CampaignDailyStat,
  CampaignEnrollment,
  CrmProvider,
  NewsItem,
  RecordingAnalysis,
} from "./types"

// --- Campaign daily breakdown ---
function buildDaily(
  seed: number[],
  start = "2026-06-04"
): CampaignDailyStat[] {
  const base = new Date(start).getTime()
  return seed.map((sent, i) => {
    const opened = Math.round(sent * (0.55 + (i % 3) * 0.05))
    const replied = Math.round(opened * (0.18 + (i % 2) * 0.04))
    const bounced = Math.round(sent * (0.02 + (i % 4) * 0.01))
    return {
      date: new Date(base + i * 86400000).toISOString(),
      sent,
      opened,
      replied,
      bounced,
    }
  })
}

export const campaignDailyStats: Record<string, CampaignDailyStat[]> = {
  cm_1: buildDaily([14, 18, 22, 16, 20, 24, 19, 21, 17, 23, 26, 22]),
  cm_2: buildDaily([8, 10, 12, 9, 11, 13, 10, 12, 9, 11]),
  cm_3: buildDaily([5, 6, 7, 4, 6, 5, 7]),
}

export const campaignEnrollments: Record<string, CampaignEnrollment[]> = {
  cm_1: [
    { prospectId: "p_1", currentStep: 3, status: "replied", lastTouch: "2026-06-16T14:20:00Z" },
    { prospectId: "p_3", currentStep: 2, status: "active", lastTouch: "2026-06-15T10:00:00Z" },
    { prospectId: "p_6", currentStep: 3, status: "active", lastTouch: "2026-06-16T09:00:00Z" },
    { prospectId: "p_9", currentStep: 1, status: "active", lastTouch: "2026-07-07T08:00:00Z" },
    { prospectId: "p_12", currentStep: 3, status: "completed", lastTouch: "2026-06-14T12:00:00Z" },
    { prospectId: "p_4", currentStep: 2, status: "bounced", lastTouch: "2026-06-13T16:00:00Z" },
  ],
  cm_2: [
    { prospectId: "p_2", currentStep: 2, status: "replied", lastTouch: "2026-06-15T18:05:00Z" },
    { prospectId: "p_7", currentStep: 1, status: "active", lastTouch: "2026-06-16T11:00:00Z" },
    { prospectId: "p_11", currentStep: 2, status: "active", lastTouch: "2026-06-16T13:00:00Z" },
    { prospectId: "p_5", currentStep: 2, status: "completed", lastTouch: "2026-06-12T09:00:00Z" },
  ],
  cm_3: [
    { prospectId: "p_8", currentStep: 1, status: "paused", lastTouch: "2026-06-10T09:00:00Z" },
    { prospectId: "p_10", currentStep: 1, status: "active", lastTouch: "2026-06-11T09:00:00Z" },
  ],
}

// --- Coaching recording details ---
export const recordingDetails: Record<string, RecordingAnalysis> = {
  r_1: {
    longestMonologueMin: 2.1,
    questionsAsked: 14,
    patience: 1.4,
    callType: "Discovery",
    participants: [
      { name: "Maya Patel", role: "rep", title: "Account Executive", talkPct: 42 },
      { name: "Wei Zhang", role: "prospect", title: "Head of Sales · Criteo", talkPct: 58 },
    ],
    personality: {
      disc: "Conscientious (C)",
      summary: "Analytical and detail-oriented — wants proof, security, and a clear plan before committing.",
      tips: [
        "Lead with data and references, not hype.",
        "Send written follow-ups (docs, timelines) — he evaluates carefully.",
        "Address risk (security, onboarding) proactively.",
      ],
    },
    topics: [
      { label: "Discovery", pct: 38 },
      { label: "Pricing", pct: 22 },
      { label: "Integrations", pct: 18 },
      { label: "Timeline", pct: 12 },
      { label: "Small talk", pct: 10 },
    ],
    objections: ["Concerned about onboarding time", "Needs security review"],
    keyMoments: [
      { time: "02:15", label: "Identified outbound pain", type: "positive" },
      { time: "11:40", label: "Asked about SOC 2 / security", type: "risk" },
      { time: "21:05", label: "Looped in procurement", type: "positive" },
      { time: "31:50", label: "Booked technical deep-dive", type: "action" },
    ],
    actionItems: [
      "Send SOC 2 report and security docs",
      "Schedule technical deep-dive with their RevOps lead",
      "Share onboarding timeline (2-week go-live)",
    ],
    coachingTips: [
      "Great discovery — 14 questions kept them talking (talk ratio 42%).",
      "When security came up, you deferred. Have the SOC 2 one-pager ready to share live.",
    ],
    transcript: [
      { id: "t1", speaker: "rep", name: "Maya", time: "00:04", text: "Thanks for making the time, Wei. I'd love to understand how your team is handling outbound today." },
      { id: "t2", speaker: "prospect", name: "Wei", time: "00:18", text: "Sure. Honestly it's pretty manual right now — reps build lists by hand and reply rates are all over the place." },
      { id: "t3", speaker: "rep", name: "Maya", time: "00:41", text: "That tracks with what we hear. When you say all over the place — what's a good week versus a bad week look like?" },
      { id: "t4", speaker: "prospect", name: "Wei", time: "02:15", text: "A good week we might book 4 meetings, a bad week zero. The inconsistency is the real problem as we scale the team." },
      { id: "t5", speaker: "prospect", name: "Wei", time: "11:40", text: "Before we go further — what does your security posture look like? We'd need a review." },
      { id: "t6", speaker: "rep", name: "Maya", time: "11:58", text: "Totally fair. We're SOC 2 Type II — I'll send the report right after this." },
    ],
  },
  r_2: {
    longestMonologueMin: 4.3,
    questionsAsked: 6,
    patience: 0.7,
    callType: "Demo",
    participants: [
      { name: "Jordan Lee", role: "rep", title: "Account Executive", talkPct: 58 },
      { name: "Marcus Riley", role: "prospect", title: "Head of RevOps · Softonic", talkPct: 42 },
    ],
    personality: {
      disc: "Influence (I)",
      summary: "Relationship-driven and big-picture — responds to vision and social proof, less to feature detail.",
      tips: [
        "Open with outcomes and peer stories, not a feature tour.",
        "Keep the energy high and the demo tight.",
        "Confirm next steps in writing — optimistic but can drift.",
      ],
    },
    topics: [
      { label: "Product demo", pct: 52 },
      { label: "Pricing", pct: 20 },
      { label: "Discovery", pct: 14 },
      { label: "Next steps", pct: 14 },
    ],
    objections: ["Unclear ROI vs. current tool", "Budget approval needed"],
    keyMoments: [
      { time: "03:20", label: "Long product monologue (4+ min)", type: "risk" },
      { time: "18:10", label: "Asked about pricing", type: "question" },
      { time: "37:30", label: "Soft commit to follow-up", type: "action" },
    ],
    actionItems: ["Send ROI breakdown", "Confirm Tuesday follow-up"],
    coachingTips: [
      "Talk ratio was 58% — try to keep it under 50%. The 4-minute monologue at 03:20 lost engagement.",
      "Only 6 questions asked. Lead with discovery before demoing features.",
    ],
    transcript: [
      { id: "t1", speaker: "rep", name: "Jordan", time: "00:06", text: "Let me walk you through the platform and then we can dig into questions." },
      { id: "t2", speaker: "prospect", name: "Marcus", time: "03:20", text: "Got it… this is a lot. How does this compare to what we already pay for?" },
      { id: "t3", speaker: "rep", name: "Jordan", time: "18:10", text: "Great question — pricing depends on seats. Let me send an ROI breakdown." },
    ],
  },
  r_3: {
    longestMonologueMin: 5.8,
    questionsAsked: 3,
    patience: 0.4,
    callType: "Intro",
    participants: [
      { name: "Ethan Wright", role: "rep", title: "Account Executive", talkPct: 67 },
      { name: "Diego Fernández", role: "prospect", title: "Sales Director · Edicom", talkPct: 33 },
    ],
    personality: {
      disc: "Dominance (D)",
      summary: "Direct, results-focused, and skeptical — wants ROI and to control the agenda.",
      tips: [
        "Get to the point fast and quantify impact.",
        "Ask sharp qualifying questions; don't pitch over him.",
        "Bring a concrete ROI case to re-engage.",
      ],
    },
    topics: [
      { label: "Pitch", pct: 60 },
      { label: "Pricing", pct: 25 },
      { label: "Discovery", pct: 15 },
    ],
    objections: ["Skeptical on ROI", "No clear budget", "Happy with status quo"],
    keyMoments: [
      { time: "01:30", label: "Jumped straight to pitch", type: "risk" },
      { time: "09:45", label: "Prospect disengaged", type: "risk" },
      { time: "15:20", label: "No next step secured", type: "risk" },
    ],
    actionItems: ["Build ROI case study", "Re-engage in 30 days"],
    coachingTips: [
      "Talk ratio 67% and only 3 questions — this was a pitch, not a discovery call.",
      "Budget was never qualified. Use a framework (MEDDIC) to qualify earlier.",
    ],
    transcript: [
      { id: "t1", speaker: "rep", name: "Ethan", time: "00:08", text: "I'll keep this quick — here's what we do and why it's a fit." },
      { id: "t2", speaker: "prospect", name: "Diego", time: "09:45", text: "Look, we're pretty happy with how things are. I'm not sure what problem this solves for us." },
    ],
  },
}

// --- Company news ---
export const companyNews: Record<string, NewsItem[]> = {
  acc_1: [
    { id: "nw_1", title: "Fever raises $40M Series C", source: "TechCrunch", date: "2026-06-10T00:00:00Z", sentiment: "positive" },
    { id: "nw_2", title: "Fever opens new West Coast distribution hub", source: "Supply Chain Dive", date: "2026-05-28T00:00:00Z", sentiment: "positive" },
    { id: "nw_3", title: "Fever names new VP of Sales", source: "LinkedIn", date: "2026-05-15T00:00:00Z", sentiment: "neutral" },
  ],
  acc_3: [
    { id: "nw_4", title: "Clarity AI appoints new Chief Revenue Officer", source: "Business Wire", date: "2026-06-12T00:00:00Z", sentiment: "positive" },
    { id: "nw_5", title: "Clarity AI expands GTM team by 30%", source: "LinkedIn", date: "2026-06-01T00:00:00Z", sentiment: "positive" },
  ],
  acc_6: [
    { id: "nw_6", title: "Betterfly announces digital transformation initiative", source: "American Banker", date: "2026-06-05T00:00:00Z", sentiment: "positive" },
    { id: "nw_7", title: "Betterfly Q2 earnings beat estimates", source: "Reuters", date: "2026-05-20T00:00:00Z", sentiment: "positive" },
  ],
}

export function getCompanyNews(accountId: string): NewsItem[] {
  return companyNews[accountId] ?? []
}

// --- CRM providers (for add-to-record flows) ---
export const CRM_PROVIDERS: CrmProvider[] = [
  { id: "hubspot", name: "HubSpot", logoColor: "#ff7a59", connected: true, objectName: "Contact" },
  { id: "salesforce", name: "Salesforce", logoColor: "#00a1e0", connected: false, objectName: "Lead" },
  { id: "pipedrive", name: "Pipedrive", logoColor: "#017737", connected: false, objectName: "Person" },
  { id: "zoho", name: "Zoho CRM", logoColor: "#e42527", connected: false, objectName: "Contact" },
  { id: "monday", name: "monday.com", logoColor: "#ff3d57", connected: false, objectName: "Item" },
  { id: "dynamics", name: "MS Dynamics", logoColor: "#002050", connected: false, objectName: "Contact" },
]

// --- Company growth metrics (headcount, departments, hiring) ---
export interface AccountMetrics {
  headcount: number[] // 12 monthly points
  growthYoY: number // %
  openRoles: number
  salesHires: number // open sales/GTM roles
  departments: { label: string; pct: number }[]
}

export const HEADCOUNT_MONTHS = [
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
]

function buildHeadcount(base: number, monthlyGrowth: number): number[] {
  const out: number[] = []
  let v = base
  for (let i = 0; i < 12; i++) {
    out.push(Math.round(v))
    v *= 1 + monthlyGrowth
  }
  return out
}

function metrics(
  base: number,
  monthlyGrowth: number,
  openRoles: number,
  salesHires: number,
  departments: { label: string; pct: number }[]
): AccountMetrics {
  const headcount = buildHeadcount(base, monthlyGrowth)
  const first = headcount[0]
  const last = headcount[headcount.length - 1]
  const growthYoY = Math.round(((last - first) / first) * 100)
  return { headcount, growthYoY, openRoles, salesHires, departments }
}

const DEFAULT_DEPTS = [
  { label: "Sales", pct: 28 },
  { label: "Engineering", pct: 34 },
  { label: "Marketing", pct: 14 },
  { label: "Operations", pct: 16 },
  { label: "Other", pct: 8 },
]

export const accountMetrics: Record<string, AccountMetrics> = {
  acc_1: metrics(620, 0.018, 18, 7, [
    { label: "Sales", pct: 32 },
    { label: "Operations", pct: 26 },
    { label: "Engineering", pct: 20 },
    { label: "Marketing", pct: 12 },
    { label: "Other", pct: 10 },
  ]),
  acc_2: metrics(300, 0.012, 9, 3, DEFAULT_DEPTS),
  acc_3: metrics(1200, 0.022, 26, 11, [
    { label: "Sales", pct: 24 },
    { label: "Clinical", pct: 30 },
    { label: "Engineering", pct: 22 },
    { label: "Marketing", pct: 12 },
    { label: "Other", pct: 12 },
  ]),
  acc_4: metrics(260, 0.02, 14, 6, DEFAULT_DEPTS),
  acc_5: metrics(2100, 0.004, 8, 2, [
    { label: "Manufacturing", pct: 44 },
    { label: "Sales", pct: 16 },
    { label: "Engineering", pct: 18 },
    { label: "Operations", pct: 14 },
    { label: "Other", pct: 8 },
  ]),
  acc_6: metrics(5200, 0.006, 31, 9, [
    { label: "Retail banking", pct: 38 },
    { label: "Technology", pct: 22 },
    { label: "Sales", pct: 16 },
    { label: "Operations", pct: 16 },
    { label: "Other", pct: 8 },
  ]),
  acc_7: metrics(120, 0.026, 11, 4, DEFAULT_DEPTS),
  acc_8: metrics(90, 0.03, 7, 3, DEFAULT_DEPTS),
}

export function getAccountMetrics(accountId: string): AccountMetrics | undefined {
  return accountMetrics[accountId]
}
