// Team + RevOps analytics data for the executive dashboard.
// All values are mock/static. The "view" abstraction lets a sales leader
// see the whole team or impersonate a single rep.

export interface FunnelCounts {
  prospects: number
  contacted: number
  replied: number
  meetings: number
  won: number
}

export interface TeamMember {
  id: string
  name: string
  role: "Account Executive" | "SDR" | "Sales Manager"
  avatarColor: string
  email: string
  quota: number // quarterly $ quota
  metrics: {
    prospects: number
    meetings: number
    replyRate: number // %
    pipeline: number // open pipeline $
    won: number // closed-won $ this quarter
  }
  funnel: FunnelCounts
  monthlyPipeline: number[] // $K created, last 6 months
  weeklyReplyRate: number[] // %, last 8 weeks
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
export const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]

export const team: TeamMember[] = [
  {
    id: "rep_1",
    name: "Maya Patel",
    role: "Account Executive",
    avatarColor: "#7c3aed",
    email: "maya@getkombo.ai",
    quota: 250000,
    metrics: {
      prospects: 64,
      meetings: 11,
      replyRate: 22.4,
      pipeline: 184000,
      won: 142000,
    },
    funnel: { prospects: 64, contacted: 58, replied: 19, meetings: 11, won: 4 },
    monthlyPipeline: [22, 28, 31, 26, 38, 39],
    weeklyReplyRate: [18, 20, 19, 24, 21, 23, 25, 22],
  },
  {
    id: "rep_2",
    name: "Jordan Lee",
    role: "Account Executive",
    avatarColor: "#0ea5e9",
    email: "jordan@getkombo.ai",
    quota: 250000,
    metrics: {
      prospects: 52,
      meetings: 8,
      replyRate: 17.1,
      pipeline: 151000,
      won: 98000,
    },
    funnel: { prospects: 52, contacted: 47, replied: 13, meetings: 8, won: 3 },
    monthlyPipeline: [18, 21, 19, 27, 24, 30],
    weeklyReplyRate: [14, 16, 15, 18, 17, 16, 19, 17],
  },
  {
    id: "rep_3",
    name: "Sofia Garcia",
    role: "SDR",
    avatarColor: "#f59e0b",
    email: "sofia@getkombo.ai",
    quota: 120000,
    metrics: {
      prospects: 98,
      meetings: 14,
      replyRate: 19.8,
      pipeline: 96000,
      won: 41000,
    },
    funnel: { prospects: 98, contacted: 91, replied: 26, meetings: 14, won: 2 },
    monthlyPipeline: [9, 12, 14, 13, 17, 19],
    weeklyReplyRate: [16, 18, 20, 19, 22, 21, 20, 20],
  },
  {
    id: "rep_4",
    name: "Ethan Wright",
    role: "Account Executive",
    avatarColor: "#10b981",
    email: "ethan@getkombo.ai",
    quota: 250000,
    metrics: {
      prospects: 47,
      meetings: 6,
      replyRate: 14.2,
      pipeline: 128000,
      won: 76000,
    },
    funnel: { prospects: 47, contacted: 41, replied: 9, meetings: 6, won: 2 },
    monthlyPipeline: [15, 17, 16, 20, 22, 24],
    weeklyReplyRate: [11, 13, 12, 15, 14, 16, 15, 14],
  },
  {
    id: "rep_5",
    name: "Nina Kowalski",
    role: "SDR",
    avatarColor: "#ec4899",
    email: "nina@getkombo.ai",
    quota: 120000,
    metrics: {
      prospects: 86,
      meetings: 12,
      replyRate: 21.6,
      pipeline: 73000,
      won: 33000,
    },
    funnel: { prospects: 86, contacted: 80, replied: 24, meetings: 12, won: 1 },
    monthlyPipeline: [7, 10, 11, 12, 15, 18],
    weeklyReplyRate: [17, 19, 21, 20, 23, 22, 24, 22],
  },
]

export interface ViewData {
  scope: "team" | "rep"
  label: string
  subtitle: string
  quota: number
  kpis: {
    pipeline: number
    won: number
    meetings: number
    replyRate: number
    prospects: number
  }
  // deltas vs previous period (mock, %)
  deltas: { pipeline: number; won: number; meetings: number; replyRate: number }
  monthlyPipeline: number[] // $K created
  monthlyWon: number[] // $K closed (derived)
  weeklyReplyRate: number[]
  funnel: FunnelCounts
}

// Closed-won is derived from created pipeline with a stable conversion curve.
function derivedWon(pipeline: number[]): number[] {
  return pipeline.map((v, i) => Math.round(v * (0.32 + i * 0.015)))
}

// Aggregate a set of reps into the shared dashboard view shape.
function aggregate(
  members: TeamMember[],
  label: string,
  subtitle: string
): ViewData {
  const list = members.length ? members : team
  const sum = (fn: (m: TeamMember) => number) =>
    list.reduce((a, m) => a + fn(m), 0)
  const avg = (fn: (m: TeamMember) => number) => sum(fn) / list.length

  const monthlyPipeline = MONTHS.map((_, i) =>
    list.reduce((a, m) => a + m.monthlyPipeline[i], 0)
  )
  const weeklyReplyRate = WEEKS.map(
    (_, i) =>
      Math.round(
        (list.reduce((a, m) => a + m.weeklyReplyRate[i], 0) / list.length) * 10
      ) / 10
  )
  const funnel: FunnelCounts = {
    prospects: sum((m) => m.funnel.prospects),
    contacted: sum((m) => m.funnel.contacted),
    replied: sum((m) => m.funnel.replied),
    meetings: sum((m) => m.funnel.meetings),
    won: sum((m) => m.funnel.won),
  }

  return {
    scope: "team",
    label,
    subtitle,
    quota: sum((m) => m.quota),
    kpis: {
      pipeline: sum((m) => m.metrics.pipeline),
      won: sum((m) => m.metrics.won),
      meetings: sum((m) => m.metrics.meetings),
      replyRate: Math.round(avg((m) => m.metrics.replyRate) * 10) / 10,
      prospects: sum((m) => m.metrics.prospects),
    },
    deltas: { pipeline: 12.5, won: 8.2, meetings: 6.0, replyRate: 3.2 },
    monthlyPipeline,
    monthlyWon: derivedWon(monthlyPipeline),
    weeklyReplyRate,
    funnel,
  }
}

export function teamView(): ViewData {
  return aggregate(team, "Whole team", `${team.length} reps · this quarter`)
}

export function repView(rep: TeamMember): ViewData {
  return {
    scope: "rep",
    label: rep.name,
    subtitle: `${rep.role} · this quarter`,
    quota: rep.quota,
    kpis: {
      pipeline: rep.metrics.pipeline,
      won: rep.metrics.won,
      meetings: rep.metrics.meetings,
      replyRate: rep.metrics.replyRate,
      prospects: rep.metrics.prospects,
    },
    deltas: {
      pipeline: rep.metrics.won > rep.quota * 0.4 ? 9.4 : -3.1,
      won: 5.5,
      meetings: 4.0,
      replyRate: 2.1,
    },
    monthlyPipeline: rep.monthlyPipeline,
    monthlyWon: derivedWon(rep.monthlyPipeline),
    weeklyReplyRate: rep.weeklyReplyRate,
    funnel: rep.funnel,
  }
}

export function getViewData(repId: string | null): ViewData {
  if (!repId) return teamView()
  const rep = team.find((m) => m.id === repId)
  return rep ? repView(rep) : teamView()
}

export function getRep(repId: string): TeamMember | undefined {
  return team.find((m) => m.id === repId)
}

// --- Agency: multiple teams / client engagements ---
// An agency runs outbound for several clients; each client is a "team" of reps.
export interface SalesTeam {
  id: string
  name: string
  client?: string // client/brand this team sells for (client engagements)
  type: "internal" | "client"
  repIds: string[]
}

export const teams: SalesTeam[] = [
  {
    id: "tm_house",
    name: "House accounts",
    type: "internal",
    repIds: ["rep_1", "rep_2"],
  },
  {
    id: "tm_fever",
    name: "Fever",
    client: "Fever",
    type: "client",
    repIds: ["rep_3"],
  },
  {
    id: "tm_softonic",
    name: "Softonic",
    client: "Softonic",
    type: "client",
    repIds: ["rep_4", "rep_5"],
  },
]

export function getTeam(id: string): SalesTeam | undefined {
  return teams.find((t) => t.id === id)
}

export function teamMembers(teamId: string): TeamMember[] {
  const t = getTeam(teamId)
  if (!t) return []
  return t.repIds
    .map((id) => getRep(id))
    .filter((m): m is TeamMember => Boolean(m))
}

export function repTeam(repId: string): SalesTeam | undefined {
  return teams.find((t) => t.repIds.includes(repId))
}

export function teamViewData(t: SalesTeam): ViewData {
  const members = teamMembers(t.id)
  const suffix = t.type === "client" ? "client team" : "internal team"
  return aggregate(members, t.name, `${members.length} reps · ${suffix}`)
}

// The current dashboard scope: the whole org, a team/client, or a single rep.
export type ViewScope =
  | { kind: "org" }
  | { kind: "team"; id: string }
  | { kind: "rep"; id: string }

export function getScopeData(scope: ViewScope): ViewData {
  if (scope.kind === "rep") {
    const rep = getRep(scope.id)
    return rep ? repView(rep) : teamView()
  }
  if (scope.kind === "team") {
    const t = getTeam(scope.id)
    return t ? teamViewData(t) : teamView()
  }
  return teamView()
}

// Leaderboard sorted by closed-won attainment.
export function leaderboard(): TeamMember[] {
  return [...team].sort(
    (a, b) => b.metrics.won / b.quota - a.metrics.won / a.quota
  )
}

// Which rep owns each prospect (used to scope views when impersonating).
export const prospectOwners: Record<string, string> = {
  p_1: "rep_1",
  p_2: "rep_2",
  p_3: "rep_1",
  p_4: "rep_4",
  p_5: "rep_3",
  p_6: "rep_1",
  p_7: "rep_2",
  p_8: "rep_4",
  p_9: "rep_1",
  p_10: "rep_5",
  p_11: "rep_2",
  p_12: "rep_4",
}

export function ownerOf(prospectId: string): string | undefined {
  return prospectOwners[prospectId]
}
