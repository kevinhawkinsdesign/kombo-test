// Outreach playbook config: products (multi-product), value propositions,
// and template prioritization — mirrors the extension's MultiProductHandler /
// ValuePropConfirmator / TemplatePrioritization.

export interface PlaybookProduct {
  id: string
  name: string
  description: string
  active: boolean
}

export const playbookProducts: PlaybookProduct[] = [
  {
    id: "prod_1",
    name: "Kombo Prospecting",
    description: "AI prospect search, scoring, and 30-point enrichment.",
    active: true,
  },
  {
    id: "prod_2",
    name: "Kombo Sequences",
    description: "Multi-channel email + LinkedIn outreach campaigns.",
    active: true,
  },
  {
    id: "prod_3",
    name: "Kombo Coach",
    description: "Call recording analysis and rep coaching.",
    active: false,
  },
  {
    id: "prod_4",
    name: "Kombo CRM Sync",
    description: "Two-way sync of contacts, activities, and deals.",
    active: true,
  },
]

export interface ValueProp {
  id: string
  productId: string
  text: string
}

export const valueProps: ValueProp[] = [
  { id: "vp_1", productId: "prod_1", text: "Find best-fit prospects 3x faster with AI lead scoring." },
  { id: "vp_2", productId: "prod_1", text: "Auto-enrich every contact with 30 verified data points." },
  { id: "vp_3", productId: "prod_2", text: "Lift reply rates with personalized multi-channel sequences." },
  { id: "vp_4", productId: "prod_2", text: "One inbox for every email and LinkedIn reply." },
  { id: "vp_5", productId: "prod_4", text: "Keep your CRM clean with two-way, no-manual-entry sync." },
]

// Template prioritization: ordered template ids the AI prefers when drafting.
// (References emailTemplates in mock-extra.)
export const defaultTemplatePriority: string[] = [
  "tpl_5", // LinkedIn connection note (top performer)
  "tpl_1", // Cold outreach — RevOps angle
  "tpl_2", // Cold outreach — Scaling SDRs
  "tpl_3", // Follow-up — Case study
  "tpl_6", // Re-engagement
  "tpl_4", // Break-up email
]
