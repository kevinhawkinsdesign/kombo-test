// Shared step-channel identity — icon, tint, and normalization — used by
// every surface that renders a CampaignStep (the Sequence tab's row list,
// the canvas node, the step-type picker modal) so a channel always looks
// the same everywhere.

import * as React from "react"
import {
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  ListTodo,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import type { ConditionKind, StepChannel } from "@/lib/types"

export interface ChannelMeta {
  tint: string
  Icon: React.ComponentType<{ className?: string }>
}

export const CHANNELS: Record<StepChannel, ChannelMeta> = {
  email: { tint: "bg-primary/15 text-primary", Icon: Mail },
  whatsapp: { tint: "bg-chart-1/15 text-chart-1", Icon: MessageCircle },
  call: { tint: "bg-chart-4/15 text-chart-4", Icon: Phone },
  ai_call: { tint: "bg-chart-5/15 text-chart-5", Icon: Sparkles },
  linkedin_message: { tint: "bg-[#0a66c2]/15 text-[#0a66c2]", Icon: LinkedinIcon },
  linkedin_dm: { tint: "bg-[#0a66c2]/15 text-[#0a66c2]", Icon: LinkedinIcon },
  linkedin_inmail: { tint: "bg-[#0a66c2]/15 text-[#0a66c2]", Icon: LinkedinIcon },
  manual: { tint: "bg-muted text-muted-foreground", Icon: ListTodo },
}

// Tolerant lookup so previously-persisted localStorage data (e.g. the legacy
// "linkedin" channel, or any unknown value) still renders.
export function channelMeta(channel: string): ChannelMeta {
  if (channel in CHANNELS) return CHANNELS[channel as StepChannel]
  if (channel === "sms") return CHANNELS.whatsapp
  if (channel === "instagram") return CHANNELS.linkedin_message
  if (channel === "linkedin") return CHANNELS.linkedin_message
  return CHANNELS.email
}

export function normalizeChannel(channel: string): StepChannel {
  if (channel in CHANNELS) return channel as StepChannel
  if (channel === "linkedin") return "linkedin_message"
  if (channel === "sms") return "whatsapp"
  if (channel === "instagram") return "linkedin_message"
  return "email"
}

const LINKEDIN_CHANNELS: StepChannel[] = ["linkedin_message", "linkedin_dm", "linkedin_inmail"]

// Which channels a condition makes sense for — e.g. "Opened" only means
// something for an email step, while "Accepted connection" only means
// something for a LinkedIn step. `null` means unrestricted (the existing
// "Replied" condition predates this map and never had a channel fence).
const CONDITION_CHANNELS: Record<ConditionKind, StepChannel[] | null> = {
  reply: null,
  open: ["email"],
  click: ["email", "whatsapp", ...LINKEDIN_CHANNELS],
  accept: LINKEDIN_CHANNELS,
  read: ["email", "whatsapp", ...LINKEDIN_CHANNELS],
}

export function conditionAllowedForChannel(
  condition: ConditionKind,
  channel: StepChannel
): boolean {
  const allowed = CONDITION_CHANNELS[condition]
  return allowed === null || allowed.includes(channel)
}
