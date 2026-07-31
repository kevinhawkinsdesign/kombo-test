// Prompt templates — the second half of "Campaign Templates". A message
// template is fixed copy with merge variables; a prompt template trusts the
// AI to write a unique message per recipient from a short instruction, using
// what the workspace already knows about the seller (product, USPs, ICP,
// sales countries) alongside the recipient's own data.

import * as React from "react"

import { generateTemplate, type GeneratedTemplate } from "@/lib/mock-template-ai"
import { getPrimaryIcp } from "@/lib/mock-icps"
import { currentUser } from "@/lib/mock-data"
import type { Channel, CampaignStep, StepChannel } from "@/lib/types"

export interface PromptTemplate {
  id: string
  name: string
  channel: Channel
  // Prompts organize into folders (like message templates), seeded with one
  // folder per channel to mirror the extension's picker.
  folder: string
  prompt: string
  tags: string[]
  updatedAt: string
}

// Seeded prompts, grouped by channel like the extension's picker
// (Email Prompts / LinkedIn Prompts / WhatsApp Prompts).
const SEED: PromptTemplate[] = [
  {
    id: "pt_inbound_demo",
    name: "Inbound demo reply",
    channel: "email",
    folder: "Email Prompts",
    prompt:
      "Write a warm reply to {{first_name}} at {{company}} who requested a demo — confirm interest, suggest two time slots, and include {{calendar_link}}.",
    tags: ["inbound", "demo"],
    updatedAt: "2026-06-28T09:00:00Z",
  },
  {
    id: "pt_trigger_email",
    name: "Trigger based email",
    channel: "email",
    folder: "Email Prompts",
    prompt:
      "Write a short email to {{first_name}} referencing a recent trigger at {{company}} (funding, hiring, or a product launch) and tie it to how we help.",
    tags: ["trigger-based"],
    updatedAt: "2026-06-25T15:30:00Z",
  },
  {
    id: "pt_structured_cold",
    name: "Structured cold email",
    channel: "email",
    folder: "Email Prompts",
    prompt:
      "Write a structured cold email to {{first_name}}, a {{title}} at {{company}}: pain point, one-line proof, soft ask for a quick call.",
    tags: ["cold-outbound"],
    updatedAt: "2026-06-20T11:00:00Z",
  },
  {
    id: "pt_li_warm_reply",
    name: "Reply to engagement (warm)",
    channel: "linkedin",
    folder: "LinkedIn Prompts",
    prompt:
      "Write a short, casual LinkedIn message to {{first_name}} who engaged with my post — thank them, add one insight about {{company}}'s space, then a light ask.",
    tags: ["warm", "engagement"],
    updatedAt: "2026-06-27T10:00:00Z",
  },
  {
    id: "pt_li_cold_opener",
    name: "Personalized cold opener",
    channel: "linkedin",
    folder: "LinkedIn Prompts",
    prompt:
      "Write a 1-line LinkedIn opener to {{first_name}} that references {{company}} and their role as {{title}} — no pitch.",
    tags: ["cold-outbound"],
    updatedAt: "2026-06-22T17:45:00Z",
  },
  {
    id: "pt_wa_short_opener",
    name: "Short personalized opener",
    channel: "whatsapp",
    folder: "WhatsApp Prompts",
    prompt:
      "Write a friendly, 2-sentence WhatsApp opener to {{first_name}} referencing {{company}}, ending with a light question.",
    tags: ["short"],
    updatedAt: "2026-06-18T08:20:00Z",
  },
]


// Default folder for a channel — where new prompts land unless the user
// picks (or creates) another folder.
export function promptFolderFor(channel: Channel): string {
  if (channel === "linkedin") return "LinkedIn Prompts"
  if (channel === "whatsapp") return "WhatsApp Prompts"
  return "Email Prompts"
}

// Coach's post-call follow-up composer saves into this folder instead of a
// channel default — it's still an ordinary email PromptTemplate, just grouped
// separately (via the same folder mechanism Templates.tsx already groups
// prompts by) so it doesn't get lost among general outbound prompts.
export const COACH_FOLLOWUP_FOLDER = "Coach Follow-ups"

const KEY = "kombo_prompt_templates_v1"

function load(): PromptTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    // Normalize `tags` on read — records saved before this field existed
    // have no `tags` array at all, which crashes every `.tags.forEach`/
    // `.tags.map` call site downstream.
    if (raw) {
      const parsed = JSON.parse(raw) as PromptTemplate[]
      return parsed.map((t) => ({ ...t, tags: t.tags ?? [] }))
    }
  } catch {
    /* ignore */
  }
  return SEED
}

let state: PromptTemplate[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function uid(): string {
  return `pt_${state.length + 1}_${state.reduce((n, p) => n + p.id.length, 0)}`
}

export const promptTemplateStore = {
  create(data: Omit<PromptTemplate, "id" | "updatedAt">): PromptTemplate {
    const record: PromptTemplate = {
      ...data,
      id: uid(),
      updatedAt: new Date().toISOString(),
    }
    state = [record, ...state]
    emit()
    return record
  },
  update(id: string, patch: Partial<Omit<PromptTemplate, "id">>): void {
    state = state.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
    )
    emit()
  },
  remove(id: string): void {
    state = state.filter((p) => p.id !== id)
    emit()
  },
}

export function usePromptTemplates(): PromptTemplate[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}

/* --------------------- context-aware mock generation --------------------- */

// The workspace knowledge the AI blends into every prompted message. USPs
// mirror the defaults on Settings > Value proposition; ICP and countries come
// from the primary ICP built during onboarding.
const DEFAULT_USPS = [
  "3x faster pipeline generation",
  "30-point AI enrichment on every contact",
  "two-way CRM sync with no manual entry",
]

interface SellerContext {
  company: string
  usps: string[]
  industries: string[]
  titles: string[]
  regions: string[]
}

function sellerContext(): SellerContext {
  const icp = getPrimaryIcp()
  return {
    company: currentUser.company,
    usps: DEFAULT_USPS,
    industries: icp?.industries ?? [],
    titles: icp?.titles ?? [],
    regions: icp?.regions ?? [],
  }
}

// One extra sentence of seller context, rotated by seed so each refresh
// reads differently. Kept short so it splices naturally into the body.
function contextLine(ctx: SellerContext, seed: number): string | null {
  const candidates = [
    ctx.usps.length > 0
      ? `Quick context on ${ctx.company}: ${ctx.usps[seed % ctx.usps.length]}.`
      : null,
    ctx.industries.length > 0
      ? `We work with ${ctx.industries[seed % ctx.industries.length]} teams like yours every day.`
      : null,
    ctx.titles.length > 0
      ? `${ctx.titles[seed % ctx.titles.length]}s are exactly who we build for.`
      : null,
    ctx.regions.length > 0
      ? `We already support teams across ${ctx.regions[seed % ctx.regions.length]}.`
      : null,
  ].filter((s): s is string => Boolean(s))
  if (candidates.length === 0) return null
  return candidates[seed % candidates.length]
}

// Generate one unique message for a prompt template. Builds on the base mock
// generator, then weaves in a seed-rotated line of seller context so every
// refresh (and every recipient) produces a different message.
export function generatePromptedMessage(
  prompt: string,
  channel: Channel,
  seed = 0
): GeneratedTemplate {
  const base = generateTemplate(prompt, channel, seed)
  const line = contextLine(sellerContext(), seed)
  if (!line) return base
  // LinkedIn/WhatsApp notes stay one short paragraph — append inline.
  if (channel !== "email") {
    return { ...base, body: `${base.body} ${line}` }
  }
  // Emails: splice the context line in as its own paragraph before the
  // sign-off (the last paragraph), falling back to appending.
  const parts = base.body.split("\n\n")
  if (parts.length >= 2) {
    const body = [
      ...parts.slice(0, parts.length - 1),
      line,
      parts[parts.length - 1],
    ].join("\n\n")
    return { ...base, body }
  }
  return { ...base, body: `${base.body}\n\n${line}` }
}

/* -------------------- campaign-level sequence generation ------------------ */

// A handful of plausible touch patterns for a freshly generated sequence —
// mirrors the channel/delay shapes of the seeded sequence templates
// (lib/sequence-templates.ts) so a generated sequence doesn't look out of
// place next to a hand-built one. Picked by seed, not by the prompt text
// itself — this is a mock generator, not a real planner.
const SEQUENCE_SKELETONS: { channel: Channel; delayDays: number }[][] = [
  [
    { channel: "email", delayDays: 0 },
    { channel: "linkedin", delayDays: 3 },
    { channel: "email", delayDays: 4 },
  ],
  [
    { channel: "email", delayDays: 0 },
    { channel: "email", delayDays: 3 },
    { channel: "linkedin", delayDays: 2 },
    { channel: "email", delayDays: 5 },
  ],
  [
    { channel: "linkedin", delayDays: 0 },
    { channel: "email", delayDays: 2 },
    { channel: "whatsapp", delayDays: 3 },
  ],
]

function stepChannelFor(channel: Channel): StepChannel {
  return channel === "linkedin" ? "linkedin_message" : channel
}

let genCounter = 0

// The campaign-level counterpart to generatePromptedMessage: turns a free-
// text goal ("book demos with VPs of Sales at mid-market SaaS companies…")
// into a full multi-step sequence. Each step's copy still comes from
// generatePromptedMessage, so the same seller-context weaving applies.
export function generateSequenceFromPrompt(prompt: string, seed = 0): CampaignStep[] {
  const skeleton = SEQUENCE_SKELETONS[seed % SEQUENCE_SKELETONS.length]
  return skeleton.map((step, i) => {
    const generated = generatePromptedMessage(prompt, step.channel, seed + i)
    genCounter += 1
    return {
      id: `s_gen${genCounter}_${Date.now().toString(36)}`,
      channel: stepChannelFor(step.channel),
      delayDays: step.delayDays,
      subject: step.channel === "email" ? generated.subject : undefined,
      body: generated.body,
    }
  })
}
