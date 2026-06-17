// Critical, actionable coaching scorecards for call recordings.
// These are UI-only mock data that mirror a manager-grade call review:
// per-section letter-style grades, verbatim quotes, blunt critiques,
// a Start / Stop / Continue plan, and the biggest deal risks.

import type { CoachScorecard } from "./types"

export const coachScorecards: Record<string, CoachScorecard> = {
  // Discovery — Criteo · Wei Zhang
  r_1: {
    overall: 72,
    headline:
      "Strong opening, but discovery stayed shallow and you walked away without a booked next step.",
    sections: [
      {
        label: "Opening & rapport",
        grade: "strong",
        score: 88,
        quote:
          "Saw you just expanded the Milan office — congrats, how's the rollout going?",
        critique: "Personalized hook, earned an early yes.",
      },
      {
        label: "Discovery",
        grade: "okay",
        score: 64,
        quote: "...we usually see ROI within 4 months for teams your size.",
        critique:
          "Good proof, but no question on their budget cycle or who signs off.",
      },
      {
        label: "Objection handling",
        grade: "okay",
        score: 67,
        quote: "Totally fair — most teams worry about ramp time at first.",
        critique:
          "You labeled the concern well, then changed the subject instead of resolving it.",
      },
      {
        label: "Next steps",
        grade: "weak",
        score: 41,
        quote: "Cool, I'll send some info over and we'll see.",
        critique: "No firm next meeting booked — biggest deal risk.",
      },
    ],
    startStopContinue: {
      stop: [
        "Ending calls on a vague 'I'll send info' instead of a calendar invite.",
        "Dropping objections after acknowledging them.",
      ],
      start: [
        "Asking who owns the budget and when their fiscal cycle closes.",
        "Proposing two concrete times before you hang up.",
      ],
      continue: [
        "Researched, personalized openers that reference a recent company event.",
        "Citing specific ROI timelines for their team size.",
      ],
    },
    risks: [
      "No next meeting on the calendar — momentum will decay within a week.",
      "Champion never confirmed budget authority, so the deal may stall at sign-off.",
    ],
  },

  // Demo — Softonic · Marcus Riley
  r_2: {
    overall: 68,
    headline:
      "Polished product walkthrough, but you talked over their reaction and tied nothing back to their RevOps pain.",
    sections: [
      {
        label: "Agenda & framing",
        grade: "okay",
        score: 66,
        quote: "I'll just run through the main features and we'll go from there.",
        critique:
          "Generic agenda — you never confirmed what Marcus needed to see to move forward.",
      },
      {
        label: "Demo relevance",
        grade: "weak",
        score: 44,
        quote:
          "...and here's reporting, dashboards, the integrations page, the admin panel...",
        critique:
          "Feature tour, not a story. None of it mapped to his forecasting-accuracy problem.",
      },
      {
        label: "Discovery in demo",
        grade: "okay",
        score: 61,
        quote: "Does that make sense? Yeah? Okay cool, moving on.",
        critique:
          "Answered your own question — let silence do the work and let him react.",
      },
      {
        label: "Trial close",
        grade: "strong",
        score: 81,
        quote:
          "If we got the HubSpot sync live, what would need to be true for you to bring this to your VP?",
        critique: "Sharp trial close that surfaced the real decision criteria.",
      },
    ],
    startStopContinue: {
      stop: [
        "Touring every feature regardless of what they care about.",
        "Filling silence by answering your own 'does that make sense?'.",
      ],
      start: [
        "Opening the demo by restating their #1 pain and demoing only to that.",
        "Pausing after each key screen to let them tell you what they think.",
      ],
      continue: [
        "Crisp trial-close questions that expose the decision process.",
        "Confident, fluent product knowledge.",
      ],
    },
    risks: [
      "Demo never connected to forecasting accuracy — Marcus may not see why this is worth a switch.",
      "Talk ratio ran high, so you missed signals about who else needs to be in the room.",
    ],
  },

  // Intro — Edicom · Diego Fernández
  r_3: {
    overall: 61,
    headline:
      "You pitched before you understood the problem and let a skeptical buyer disqualify himself.",
    sections: [
      {
        label: "Opening",
        grade: "okay",
        score: 60,
        quote: "Thanks for taking the call — I know you're busy, I'll be quick.",
        critique:
          "Polite, but you apologized for the call instead of framing why it's worth his time.",
      },
      {
        label: "Discovery",
        grade: "weak",
        score: 38,
        quote:
          "So we're basically the best AI prospecting tool out there, let me explain why.",
        critique:
          "Led with the pitch. Asked zero questions about his current process or numbers.",
      },
      {
        label: "Qualification",
        grade: "weak",
        score: 42,
        quote: "I'm not sure we have budget for this kind of thing right now.",
        critique:
          "Budget objection went unexplored — no question on timing, priority, or what 'right now' means.",
      },
      {
        label: "Value framing",
        grade: "okay",
        score: 63,
        quote: "A team your size usually claws back about 8 hours a rep per week.",
        critique:
          "Strong quantified value — but it landed after he'd already checked out.",
      },
    ],
    startStopContinue: {
      stop: [
        "Opening with the pitch before you've earned the right to make it.",
        "Accepting 'no budget' at face value without digging.",
      ],
      start: [
        "Asking three discovery questions about his current outbound before mentioning Kombo.",
        "Treating a budget objection as a question about priority, not a hard no.",
      ],
      continue: [
        "Quantified, team-size-specific value statements.",
        "Respecting his time and keeping energy high.",
      ],
    },
    risks: [
      "Skeptical buyer self-disqualified on budget — without re-framing, this deal is dead.",
      "No discovery means you have nothing to build a follow-up ROI case around.",
    ],
  },
}

const FALLBACK_SCORECARD: CoachScorecard = {
  overall: 66,
  headline:
    "Solid call with real gaps — tighten discovery and lock down a concrete next step.",
  sections: [
    {
      label: "Opening & rapport",
      grade: "okay",
      score: 64,
      quote: "Thanks for hopping on — how's your week going so far?",
      critique:
        "Friendly, but generic. Tie the opener to something specific about them.",
    },
    {
      label: "Discovery",
      grade: "okay",
      score: 62,
      quote: "So tell me a bit about what you're using today.",
      critique:
        "Good open question, but you never quantified the cost of their status quo.",
    },
    {
      label: "Next steps",
      grade: "weak",
      score: 43,
      quote: "I'll follow up by email and we'll figure out timing.",
      critique: "No specific next meeting agreed — the deal can drift from here.",
    },
  ],
  startStopContinue: {
    stop: [
      "Closing with 'I'll follow up' instead of a booked meeting.",
      "Leaving the cost of inaction unquantified.",
    ],
    start: [
      "Quantifying the pain in hours or dollars before pitching.",
      "Booking the next step live, on the call.",
    ],
    continue: [
      "Warm, easy rapport that keeps prospects talking.",
      "Open-ended discovery questions.",
    ],
  },
  risks: [
    "Without a booked next step, momentum stalls and the deal slips.",
  ],
}

export function getScorecard(id: string): CoachScorecard {
  return coachScorecards[id] ?? FALLBACK_SCORECARD
}
