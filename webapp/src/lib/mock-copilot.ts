// Kai Copilot: signal-driven recommended actions (à la Amplemarket Duo).
// Each action ties a prospect to a buying/timing signal and a recommended
// multi-step outreach sequence Kai has drafted.

export type SignalTone =
  | "job_change"
  | "engagement"
  | "closed_lost"
  | "competitor"
  | "intent"
  | "community"

export interface CopilotSignal {
  label: string
  tone: SignalTone
  detail: string
}

export type SequenceChannel = "video" | "email" | "linkedin" | "call"

export interface SequenceStep {
  id: string
  channel: SequenceChannel
  delayDays: number
  title: string
  body?: string
}

export interface CopilotAction {
  id: string
  prospectId: string
  group: "recent" | "due"
  signal: CopilotSignal
  steps: SequenceStep[]
}

export const SIGNAL_TONES: Record<
  SignalTone,
  { dot: string; pill: string; label: string }
> = {
  job_change: {
    dot: "bg-chart-4",
    pill: "bg-chart-4/15 text-chart-4",
    label: "Job change",
  },
  engagement: {
    dot: "bg-chart-1",
    pill: "bg-chart-1/15 text-chart-1",
    label: "Engagement",
  },
  closed_lost: {
    dot: "bg-chart-3",
    pill: "bg-chart-3/15 text-chart-3",
    label: "Reactivation",
  },
  competitor: {
    dot: "bg-destructive",
    pill: "bg-destructive/15 text-destructive",
    label: "Competitor",
  },
  intent: {
    dot: "bg-primary",
    pill: "bg-primary/15 text-primary",
    label: "Intent",
  },
  community: {
    dot: "bg-chart-2",
    pill: "bg-chart-2/15 text-chart-2",
    label: "Community",
  },
}

function emailStep(
  id: string,
  delayDays: number,
  title: string,
  body: string
): SequenceStep {
  return { id, channel: "email", delayDays, title, body }
}

export const copilotActions: CopilotAction[] = [
  {
    id: "ca_1",
    prospectId: "p_1",
    group: "recent",
    signal: {
      label: "Replied — asking for times",
      tone: "engagement",
      detail:
        "Sarah replied to your last email asking for meeting times this week. She's hiring 5 SDRs this quarter and owns the tooling decision — strike while it's hot.",
    },
    steps: [
      emailStep(
        "s1",
        0,
        "Reply with times",
        "Hi Sarah — great to hear it's timely. I've got Tue 2pm or Wed 10am for a quick 15-min walkthrough of how teams ramp new reps 3x faster. Which works?"
      ),
      { id: "s2", channel: "linkedin", delayDays: 1, title: "Connect on LinkedIn" },
      emailStep(
        "s3",
        3,
        "Share SDR ramp case study",
        "Sharing a 2-min case study from a team that cut new-rep ramp from 90 to 30 days."
      ),
    ],
  },
  {
    id: "ca_2",
    prospectId: "p_9",
    group: "recent",
    signal: {
      label: "Visited pricing page",
      tone: "intent",
      detail:
        "Wei visited your pricing page twice in the last 3 days and the security overview once. Procurement is already looped in — send the security one-pager to keep momentum.",
    },
    steps: [
      emailStep(
        "s1",
        0,
        "Send security one-pager + pricing",
        "Hi Wei — figured I'd get ahead of the security review. Attaching our SOC 2 report and a pricing summary for a team your size."
      ),
      { id: "s2", channel: "call", delayDays: 2, title: "Call to confirm next steps" },
    ],
  },
  {
    id: "ca_3",
    prospectId: "p_6",
    group: "recent",
    signal: {
      label: "Engaged with a post about AI prospecting",
      tone: "engagement",
      detail:
        "Tom liked and commented on your post about AI prospecting. Warm engagement from a hands-on founder — lead with a short value-first note.",
    },
    steps: [
      {
        id: "s1",
        channel: "linkedin",
        delayDays: 0,
        title: "Comment-to-DM on LinkedIn",
        body: "Loved your take on the post — most founders we work with hit the same wall scaling outbound. Mind if I share what's working?",
      },
      emailStep(
        "s2",
        2,
        "Founder-to-founder value email",
        "Hi Tom — short one. We help small teams get enterprise-grade prospecting without hiring an SDR. Worth a 10-min look?"
      ),
    ],
  },
  {
    id: "ca_4",
    prospectId: "p_4",
    group: "due",
    signal: {
      label: "Reviewed a competitor on G2",
      tone: "competitor",
      detail:
        "Diego left a review on a competitor's G2 page mentioning poor data accuracy — a clear opening to lead with Kombo's 30-point verified enrichment.",
    },
    steps: [
      emailStep(
        "s1",
        0,
        "Lead with data-accuracy angle",
        "Hi Diego — saw the data-accuracy pain is real. We verify every contact against 30 data points so reps stop emailing dead inboxes. Open to comparing notes?"
      ),
      { id: "s2", channel: "linkedin", delayDays: 2, title: "Connect referencing the review" },
      emailStep(
        "s3",
        5,
        "ROI break-up",
        "Last note — happy to run a side-by-side on data accuracy if it's useful. Otherwise I'll get out of your inbox."
      ),
    ],
  },
  {
    id: "ca_5",
    prospectId: "p_12",
    group: "due",
    signal: {
      label: "Past closed-lost — reactivation",
      tone: "closed_lost",
      detail:
        "Grace was a closed-lost opp 7 months ago over budget. Betterfly just announced a digital-transformation budget — perfect re-engagement trigger.",
    },
    steps: [
      emailStep(
        "s1",
        0,
        "Re-engage on new budget",
        "Hi Grace — congrats on the digital-transformation initiative. A lot has changed on our end since we last spoke; worth another look given the new budget?"
      ),
      { id: "s2", channel: "call", delayDays: 3, title: "Warm call" },
    ],
  },
  {
    id: "ca_6",
    prospectId: "p_2",
    group: "due",
    signal: {
      label: "Changed jobs recently",
      tone: "job_change",
      detail:
        "Marcus just moved into Head of RevOps at Softonic. New leaders re-evaluate their stack in the first 90 days — get in early.",
    },
    steps: [
      emailStep(
        "s1",
        0,
        "Congrats + new-role angle",
        "Hi Marcus — congrats on the RevOps role at Softonic. New leaders usually rethink tooling early; happy to share what high-growth RevOps teams standardize on."
      ),
      { id: "s2", channel: "linkedin", delayDays: 2, title: "Connect + congrats" },
    ],
  },
  {
    id: "ca_7",
    prospectId: "p_5",
    group: "due",
    signal: {
      label: "Engaged with a post from your company",
      tone: "engagement",
      detail:
        "Priya engaged with Kombo's post on pipeline attribution. Demand-gen leaders care about attribution — anchor the message there.",
    },
    steps: [
      emailStep(
        "s1",
        0,
        "Attribution-led intro",
        "Hi Priya — saw you engaged with our attribution post. We help demand-gen teams tie pipeline back to source cleanly. Worth a quick look?"
      ),
    ],
  },
]

export function actionsForGroup(group: CopilotAction["group"]): CopilotAction[] {
  return copilotActions.filter((a) => a.group === group)
}
