// Plain-language explanations of sales jargon, surfaced via tooltips so
// non-expert users always have an explainer one hover/tap away.

export const GLOSSARY: Record<string, string> = {
  ICP: "Ideal Customer Profile — the kind of company most likely to buy from you (industry, size, and other traits you target).",
  RevOps:
    "Revenue Operations — the team that aligns sales, marketing, and success around one process and clean data.",
  SDR: "Sales Development Rep — focuses on prospecting and booking meetings for closers.",
  AE: "Account Executive — owns deals from a qualified meeting through to close.",
  CRO: "Chief Revenue Officer — the executive accountable for all revenue.",
  MEDDIC:
    "A B2B qualification framework: Metrics, Economic buyer, Decision criteria, Decision process, Identify pain, Champion.",
  BANT: "A quick qualification checklist: Budget, Authority, Need, Timeline.",
  "intent signal":
    "A behavior suggesting someone is in-market now — like visiting your pricing page or researching competitors.",
  "buying signal":
    "Evidence a prospect may be ready to buy — a funding round, a new hire, or a pricing-page visit.",
  "lead score":
    "An AI score (0–100) for how well a prospect fits your ICP and how likely they are to convert.",
  "talk ratio":
    "The share of a call you (the rep) spoke versus the prospect. Lower is usually better — let them talk.",
  warmup:
    "Gradually ramping a new mailbox's send volume so inbox providers trust it and your emails avoid spam.",
  deliverability:
    "How likely your emails are to land in the inbox rather than spam (or bounce).",
  "mailbox rotation":
    "Spreading sends across several mailboxes to stay under limits and protect deliverability.",
  enrichment:
    "Automatically filling in missing prospect data — verified email, phone, title, and company details.",
  sequence:
    "A pre-planned series of outreach steps (email, LinkedIn, calls) sent over days. Also called a cadence.",
  cadence: "The timed series of outreach touches — same idea as a sequence.",
  "reply rate":
    "The percentage of contacted prospects who reply to your outreach.",
  pipeline: "The total value of the open deals you're working toward closing.",
  "weighted forecast":
    "Pipeline value × each deal's win probability — a more realistic revenue estimate.",
  "quota attainment":
    "How much of your sales target you've closed, shown as a percentage.",
  MCP: "Model Context Protocol — a standard that lets Kai securely use tools like your CRM, calendar, and email.",
  impersonation:
    "Viewing the app exactly as one of your reps sees it — to coach or troubleshoot — without logging in as them.",
  "warm intro":
    "An introduction through a mutual connection. Warm intros reply far more often than cold outreach.",
  DISC: "A personality model (Dominance, Influence, Steadiness, Conscientiousness) used to adapt how you communicate.",
  "value proposition":
    "A short statement of the concrete value you deliver and why it matters to this buyer.",
  USP: "Unique Selling Point — what makes you clearly different from alternatives.",
  copilot:
    "An AI assistant that watches for signals and recommends the next best action for each prospect.",
  autopilot:
    "Lets Kai run routine steps for you automatically, within rules you set.",
}

export function define(term: string): string | undefined {
  return GLOSSARY[term]
}
