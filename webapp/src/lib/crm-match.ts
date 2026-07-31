// Mocked "we found a likely match in your CRM" candidates for the
// Confirm Match flow — distinct from CrmExportDialog's "create a new
// record" wizard. A prospect who isn't yet `inCrm` gets one deterministic
// high-confidence candidate built from their own real data (simulating a
// record Kombo's dedupe already found by email/domain), plus — for about
// half of prospects, chosen deterministically so it's stable across
// renders — a second, lower-confidence "possible" candidate from a
// different person at the same company, so the picker isn't always a
// rubber stamp.

import type { Prospect } from "./types"

export interface CrmMatchCandidate {
  id: string
  name: string
  title: string
  company: string
  email: string
  matchedOn: "email" | "name"
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const OTHER_FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley"]
const OTHER_TITLES = ["Marketing Manager", "Sales Director", "Operations Lead", "Account Executive"]

export function crmMatchCandidates(prospect: Prospect): CrmMatchCandidate[] {
  const primary: CrmMatchCandidate = {
    id: `crmmatch_${prospect.id}_primary`,
    name: `${prospect.firstName} ${prospect.lastName}`,
    title: prospect.title,
    company: prospect.company,
    email: prospect.email,
    matchedOn: "email",
  }

  const includeSecondary = hash(prospect.id + "crmmatch2") % 2 === 0
  if (!includeSecondary) return [primary]

  const otherFirst = OTHER_FIRST_NAMES[hash(prospect.id + "of") % OTHER_FIRST_NAMES.length]
  const otherTitle = OTHER_TITLES[hash(prospect.id + "ot") % OTHER_TITLES.length]
  const secondary: CrmMatchCandidate = {
    id: `crmmatch_${prospect.id}_secondary`,
    name: `${otherFirst} ${prospect.lastName}`,
    title: otherTitle,
    company: prospect.company,
    email: `${otherFirst.toLowerCase()}.${prospect.lastName.toLowerCase()}@${prospect.companyDomain}`,
    matchedOn: "name",
  }
  return [primary, secondary]
}
