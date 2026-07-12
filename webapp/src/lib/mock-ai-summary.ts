// Mock "Kai" prospect summaries for Inbox's ProspectSummaryPanel. Deterministic
// template fill-in, varied by picking a random phrasing per call — UI-only, no
// network. Mirrors the pattern in mock-ai-reply.ts.
import type { Prospect } from "@/lib/types"

const SIGNAL_LEAD_INS = [
  "Recent signals worth acting on:",
  "Here's what's moving:",
  "Key signals right now:",
]

const NEXT_STEPS: Record<Prospect["status"], string[]> = {
  new: [
    "Worth a personalized first touch soon.",
    "A tailored intro referencing their signals should land well.",
  ],
  contacted: [
    "Follow up if there's no reply in a few days.",
    "A short nudge referencing a signal could re-engage them.",
  ],
  replied: [
    "Keep the momentum — propose a concrete next step.",
    "They're engaged; move toward a meeting.",
  ],
  meeting: [
    "Prep a tailored agenda before the call.",
    "Bring a teardown of their current setup to the meeting.",
  ],
  customer: [
    "Check in on adoption and watch for expansion signals.",
    "A good candidate for a case study or referral ask.",
  ],
  not_interested: [
    "Deprioritize for now; revisit if signals change.",
    "Low urgency — let this cool off before reaching out again.",
  ],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateProspectSummary(
  prospect: Prospect,
  instructions?: string
): string {
  const roleBit = [prospect.seniority, prospect.department]
    .filter(Boolean)
    .join(" · ")
  const signalsBit = prospect.signals.length
    ? `${pick(SIGNAL_LEAD_INS)} ${prospect.signals.slice(0, 3).join(", ")}.`
    : ""
  const nextStep = pick(NEXT_STEPS[prospect.status] ?? NEXT_STEPS.new)
  const focusBit = instructions?.trim()
    ? ` Focused on: ${instructions.trim()}.`
    : ""

  return (
    [
      `${prospect.firstName} ${prospect.lastName} is a ${roleBit} at ${prospect.company} (score ${prospect.score}/100).`,
      prospect.about,
      signalsBit,
      nextStep,
    ]
      .filter(Boolean)
      .join(" ") + focusBit
  )
}
