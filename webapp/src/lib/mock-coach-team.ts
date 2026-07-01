// Per-rep coaching roll-up for the Coach "Team" dashboard. Derived statically
// from the shared team roster so names/roles/colors stay in sync. All values
// are mock and deterministic (no Math.random / Date) so they render cleanly
// under the React compiler.

import { team } from "./team"

// Short, localizable skill codes — the Coach page maps these to EN/ES labels.
export type CoachSkill =
  | "rapport"
  | "discovery"
  | "nextSteps"
  | "talkRatio"
  | "objections"
  | "qualification"
  | "valueFraming"

export interface CoachRepSummary {
  repId: string
  name: string
  role: string
  avatarColor: string
  avgScore: number // 0–100
  avgTalkRatio: number // % the rep spoke
  callsAnalyzed: number
  trend: number // change in avg score vs last period (+/- points)
  topStrength: CoachSkill
  topGap: CoachSkill
}

const SEED: Record<
  string,
  Omit<CoachRepSummary, "repId" | "name" | "role" | "avatarColor">
> = {
  rep_1: { avgScore: 84, avgTalkRatio: 44, callsAnalyzed: 32, trend: 4, topStrength: "discovery", topGap: "nextSteps" },
  rep_2: { avgScore: 77, avgTalkRatio: 51, callsAnalyzed: 26, trend: 2, topStrength: "rapport", topGap: "talkRatio" },
  rep_3: { avgScore: 81, avgTalkRatio: 46, callsAnalyzed: 40, trend: 5, topStrength: "discovery", topGap: "objections" },
  rep_4: { avgScore: 72, avgTalkRatio: 58, callsAnalyzed: 22, trend: -3, topStrength: "valueFraming", topGap: "talkRatio" },
  rep_5: { avgScore: 83, avgTalkRatio: 45, callsAnalyzed: 37, trend: 6, topStrength: "rapport", topGap: "qualification" },
}

export const coachTeam: CoachRepSummary[] = team.map((m) => ({
  repId: m.id,
  name: m.name,
  role: m.role,
  avatarColor: m.avatarColor,
  ...(SEED[m.id] ?? {
    avgScore: 70,
    avgTalkRatio: 50,
    callsAnalyzed: 10,
    trend: 0,
    topStrength: "rapport" as CoachSkill,
    topGap: "nextSteps" as CoachSkill,
  }),
}))

export const coachTeamAvg = {
  score: Math.round(
    coachTeam.reduce((s, r) => s + r.avgScore, 0) / coachTeam.length
  ),
  talkRatio: Math.round(
    coachTeam.reduce((s, r) => s + r.avgTalkRatio, 0) / coachTeam.length
  ),
  calls: coachTeam.reduce((s, r) => s + r.callsAnalyzed, 0),
}

// Leaderboard: best average call score first.
export function coachLeaderboard(): CoachRepSummary[] {
  return [...coachTeam].sort((a, b) => b.avgScore - a.avgScore)
}
