// A curated library of starter content — sequences, templates, and search
// queries teams can clone into their workspace in one click. UI-only seed data.

import type { Channel, SequenceChannelType } from "./types"

export interface LibrarySequence {
  id: string
  name: string
  description: string
  steps: SequenceChannelType[]
  tags: string[]
}

export interface LibraryTemplate {
  id: string
  name: string
  description: string
  channel: Channel
  folder: string
  subject: string
  body: string
  tags: string[]
}

export interface LibraryQuery {
  id: string
  name: string
  description: string
  entity: "people" | "company"
  prompt: string
  tags: string[]
}

export const librarySequences: LibrarySequence[] = [
  {
    id: "lib_seq_1",
    name: "Enterprise multi-threading",
    description:
      "Reach a buying committee across email and LinkedIn over three weeks.",
    steps: ["email", "wait", "linkedin", "wait", "email", "wait", "call"],
    tags: ["Enterprise", "Multi-touch"],
  },
  {
    id: "lib_seq_2",
    name: "Inbound speed-to-lead",
    description: "Hit new inbound leads within minutes, then follow up fast.",
    steps: ["email", "call", "wait", "email"],
    tags: ["Inbound", "High-intent"],
  },
  {
    id: "lib_seq_3",
    name: "LinkedIn-first warm intro",
    description: "Connect and warm up on LinkedIn before layering in email.",
    steps: ["linkedin", "wait", "linkedin", "email"],
    tags: ["LinkedIn", "Warm"],
  },
  {
    id: "lib_seq_4",
    name: "Break-up & revive",
    description: "Win back stalled prospects with a break-up note and an AI call.",
    steps: ["email", "wait", "ai_call", "wait", "email"],
    tags: ["Re-engagement"],
  },
  {
    id: "lib_seq_5",
    name: "Event follow-up",
    description: "Convert booth and webinar conversations into booked meetings.",
    steps: ["email", "wait", "linkedin", "wait", "email"],
    tags: ["Events", "Follow-up"],
  },
  {
    id: "lib_seq_6",
    name: "Founder-to-founder",
    description: "Short, personal cadence for early-stage founder outreach.",
    steps: ["linkedin", "wait", "email", "wait", "email"],
    tags: ["Founders", "SMB"],
  },
]

export const libraryTemplates: LibraryTemplate[] = [
  {
    id: "lib_tpl_1",
    name: "Cold open — pain hook",
    description: "Lead with a specific pain the prospect's role feels daily.",
    channel: "email",
    folder: "Cold outreach",
    subject: "{{first_name}}, the {{company}} pipeline problem",
    body:
      "Hi {{first_name}},\n\nMost revenue leaders at companies like {{company}} lose hours every week to stale prospect data and manual research.\n\nKombo enriches and syncs it automatically so your reps sell instead of dig.\n\nWorth a quick look?\n\nBest,\n{{sender}}",
    tags: ["Cold", "Pain-led"],
  },
  {
    id: "lib_tpl_2",
    name: "Trigger event outreach",
    description: "Reference a recent signal — funding, hiring, or a launch.",
    channel: "email",
    folder: "Cold outreach",
    subject: "Congrats on the momentum at {{company}}",
    body:
      "Hi {{first_name}},\n\nSaw {{company}} is scaling the GTM team — exciting time. Teams in that phase use Kombo to keep new reps productive from day one with clean, enriched prospect data.\n\nOpen to a 15-minute look?\n\n{{sender}}",
    tags: ["Trigger", "Timely"],
  },
  {
    id: "lib_tpl_3",
    name: "LinkedIn connect note",
    description: "A short, no-pitch connection request that gets accepted.",
    channel: "linkedin",
    folder: "Cold outreach",
    subject: "",
    body:
      "Hi {{first_name}} — really like what {{company}} is building in the space. Always keen to connect with revenue leaders tackling pipeline at scale.",
    tags: ["LinkedIn", "Connect"],
  },
  {
    id: "lib_tpl_4",
    name: "Follow-up — case study",
    description: "Re-engage non-responders with a relevant proof point.",
    channel: "email",
    folder: "Follow-up",
    subject: "How a team like {{company}} 3x'd reply rates",
    body:
      "Hi {{first_name}},\n\nQuick one — a revenue team similar to {{company}} used Kombo to triple reply rates by enriching and personalizing at scale.\n\nHappy to share the 2-minute breakdown. Worth it?\n\n{{sender}}",
    tags: ["Follow-up", "Proof"],
  },
  {
    id: "lib_tpl_5",
    name: "Break-up email",
    description: "A polite last touch that often revives cold threads.",
    channel: "email",
    folder: "Re-engagement",
    subject: "Should I close the file, {{first_name}}?",
    body:
      "Hi {{first_name}},\n\nHaven't heard back, so I'll assume the timing isn't right. I'll stop reaching out — but if cleaner prospect data ever moves up the list at {{company}}, I'm one reply away.\n\nAll the best,\n{{sender}}",
    tags: ["Break-up", "Re-engagement"],
  },
  {
    id: "lib_tpl_6",
    name: "Meeting confirmation",
    description: "Confirm a booked call and set a crisp agenda.",
    channel: "email",
    folder: "Meeting booking",
    subject: "Confirmed: {{company}} x Kombo",
    body:
      "Hi {{first_name}},\n\nLooking forward to our chat. I'll come ready to show how teams like {{company}} cut research time and lift reply rates with Kombo.\n\nAnything specific you'd like to cover? Just reply here.\n\n{{sender}}",
    tags: ["Meeting", "Confirmation"],
  },
]

export const libraryQueries: LibraryQuery[] = [
  {
    id: "lib_q_1",
    name: "Funded scale-ups hiring sales",
    description: "Series A–C companies expanding their sales team right now.",
    entity: "company",
    prompt:
      "Series A to C software companies with 50-500 employees that recently raised funding and are hiring sales roles",
    tags: ["Funding", "Hiring"],
  },
  {
    id: "lib_q_2",
    name: "Enterprise revenue leaders",
    description: "VP+ revenue titles at 1,000+ employee companies in core verticals.",
    entity: "people",
    prompt:
      "VP of Sales, CRO, and Head of RevOps at companies with 1,000+ employees in SaaS, fintech, or marketplaces in the US and UK",
    tags: ["Enterprise", "Decision makers"],
  },
  {
    id: "lib_q_3",
    name: "Pricing-page intent",
    description: "Prospects showing buying intent from website activity.",
    entity: "people",
    prompt:
      "Directors and VPs at B2B companies showing website intent who visited a pricing page in the last 30 days",
    tags: ["Intent", "Inbound"],
  },
  {
    id: "lib_q_4",
    name: "Lookalikes of best customers",
    description: "Companies similar to a top account, slightly smaller.",
    entity: "company",
    prompt: "Companies similar to Vicio but smaller, in the same industry and region",
    tags: ["Lookalike", "ICP"],
  },
  {
    id: "lib_q_5",
    name: "RevOps champions",
    description: "Operations leaders who own the GTM tech stack.",
    entity: "people",
    prompt:
      "RevOps and Sales Operations managers and directors who own the CRM and GTM tooling at 200-2,000 employee companies",
    tags: ["RevOps", "Champions"],
  },
  {
    id: "lib_q_6",
    name: "New-in-role executives",
    description: "Leaders who started in the last 90 days and are re-tooling.",
    entity: "people",
    prompt:
      "C-level and VP executives in sales or revenue who started their role in the last 90 days at mid-market and enterprise companies",
    tags: ["New in role", "Timing"],
  },
]
