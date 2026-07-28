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
  Send,
  MessageSquare,
  UserPlus,
  ThumbsUp,
  Eye,
  Mic,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { integrations } from "@/lib/mock-data"
import type { Locale } from "@/lib/locale"
import type {
  ConditionKind,
  LinkedInAction,
  StepChannel,
  WhatsAppAction,
} from "@/lib/types"

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
// something for an email step, while "Connected on LinkedIn" only means
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

// Which integration a channel can't run without — an email step needs a
// connected sending provider, a LinkedIn step needs the LinkedIn account,
// etc. Channels absent from this map (calls, manual tasks) need nothing.
// Matched by `Integration.name`.
const REQUIRED_INTEGRATION: Partial<Record<StepChannel, string>> = {
  email: "Gmail",
  whatsapp: "WhatsApp",
  linkedin_message: "LinkedIn",
  linkedin_dm: "LinkedIn",
  linkedin_inmail: "LinkedIn",
}

// The name of the integration this step needs but doesn't have connected,
// or undefined when the step is good to run. Drives the "locked" badge on
// the sequence canvas: a step whose provider isn't connected can't send.
export function missingIntegrationFor(channel: string): string | undefined {
  const required = REQUIRED_INTEGRATION[normalizeChannel(channel)]
  if (!required) return undefined
  const match = integrations.find((i) => i.name === required)
  return match?.connected ? undefined : required
}

export type StepTypeKey =
  | "email"
  | "linkedin_message"
  | "linkedin_connect"
  | "linkedin_view_profile"
  | "linkedin_voice_message"
  | "linkedin_like_post"
  | "linkedin_inmail"
  | "whatsapp"
  | "whatsapp_voice_message"
  | "call"
  | "ai_call"
  | "manual"

// The single source of truth for "what step types exist" — every pickable
// type, flattened, no category grouping. Several entries share a
// StepChannel but differ by linkedinAction/whatsappAction (e.g. LinkedIn
// message vs. LinkedIn connect), which is why this list (keyed by
// StepTypeKey) is the unit of selection everywhere a user picks or edits a
// step's type — both the "Add a step" modal and CampaignDetail's step
// editor — rather than editing channel/linkedinAction/whatsappAction as
// separate, independently-editable fields.
export const STEP_TYPES: {
  key: StepTypeKey
  channel: StepChannel
  linkedinAction?: LinkedInAction
  whatsappAction?: WhatsAppAction
  // Only set for entries the action-icon map below can't cover (Sales
  // Navigator is its own channel, not a linkedinAction variant).
  icon?: React.ComponentType<{ className?: string }>
}[] = [
  { key: "email", channel: "email" },
  { key: "linkedin_message", channel: "linkedin_message", linkedinAction: "message" },
  { key: "linkedin_connect", channel: "linkedin_message", linkedinAction: "connect" },
  { key: "linkedin_view_profile", channel: "linkedin_message", linkedinAction: "view_profile" },
  { key: "linkedin_voice_message", channel: "linkedin_message", linkedinAction: "voice_message" },
  { key: "linkedin_like_post", channel: "linkedin_message", linkedinAction: "like_post" },
  { key: "linkedin_inmail", channel: "linkedin_inmail", icon: Send },
  { key: "whatsapp", channel: "whatsapp", whatsappAction: "message" },
  { key: "whatsapp_voice_message", channel: "whatsapp", whatsappAction: "voice_message" },
  { key: "call", channel: "call" },
  { key: "ai_call", channel: "ai_call" },
  { key: "manual", channel: "manual" },
]

// Reverse lookup — given a step's raw channel/linkedinAction/whatsappAction,
// which StepTypeKey does it represent? Drives the single step-type
// dropdown in CampaignDetail's step editor from a step's stored fields.
export function stepTypeKeyFor(
  channel: StepChannel,
  linkedinAction?: LinkedInAction,
  whatsappAction?: WhatsAppAction
): StepTypeKey {
  const match = STEP_TYPES.find(
    (t) =>
      t.channel === channel &&
      (t.linkedinAction ?? "message") === (linkedinAction ?? "message") &&
      (t.whatsappAction ?? "message") === (whatsappAction ?? "message")
  )
  return match?.key ?? "email"
}

// Distinguishes every LinkedIn/WhatsApp action-variant icon from the others
// so no two step types look identical.
export const ACTION_ICON: Partial<Record<LinkedInAction | WhatsAppAction, React.ComponentType<{ className?: string }>>> = {
  message: MessageSquare,
  connect: UserPlus,
  view_profile: Eye,
  voice_message: Mic,
  like_post: ThumbsUp,
}

const STEP_TYPE_LABELS: Record<Locale, Record<StepTypeKey, string>> = {
  en: {
    email: "Email",
    linkedin_message: "LinkedIn message",
    linkedin_connect: "LinkedIn connect",
    linkedin_view_profile: "LinkedIn view profile",
    linkedin_voice_message: "LinkedIn voice message",
    linkedin_like_post: "LinkedIn like post",
    linkedin_inmail: "LinkedIn Sales Navigator message",
    whatsapp: "WhatsApp",
    whatsapp_voice_message: "WhatsApp voice message",
    call: "Phone call",
    ai_call: "AI Voice Call",
    manual: "Manual task",
  },
  es: {
    email: "Correo",
    linkedin_message: "Mensaje de LinkedIn",
    linkedin_connect: "Conectar en LinkedIn",
    linkedin_view_profile: "Ver perfil de LinkedIn",
    linkedin_voice_message: "Mensaje de voz de LinkedIn",
    linkedin_like_post: "Dar me gusta en LinkedIn",
    linkedin_inmail: "Mensaje de Sales Navigator",
    whatsapp: "WhatsApp",
    whatsapp_voice_message: "Mensaje de voz de WhatsApp",
    call: "Llamada",
    ai_call: "Llamada de voz IA",
    manual: "Tarea manual",
  },
  it: {
    email: "Email",
    linkedin_message: "Messaggio LinkedIn",
    linkedin_connect: "Connessione LinkedIn",
    linkedin_view_profile: "Visualizza profilo LinkedIn",
    linkedin_voice_message: "Messaggio vocale LinkedIn",
    linkedin_like_post: "Metti mi piace su LinkedIn",
    linkedin_inmail: "Messaggio Sales Navigator",
    whatsapp: "WhatsApp",
    whatsapp_voice_message: "Messaggio vocale WhatsApp",
    call: "Chiamata",
    ai_call: "Chiamata vocale IA",
    manual: "Attività manuale",
  },
  fr: {
    email: "E-mail",
    linkedin_message: "Message LinkedIn",
    linkedin_connect: "Connexion LinkedIn",
    linkedin_view_profile: "Voir le profil LinkedIn",
    linkedin_voice_message: "Message vocal LinkedIn",
    linkedin_like_post: "Aimer une publication LinkedIn",
    linkedin_inmail: "Message Sales Navigator",
    whatsapp: "WhatsApp",
    whatsapp_voice_message: "Message vocal WhatsApp",
    call: "Appel téléphonique",
    ai_call: "Appel vocal IA",
    manual: "Tâche manuelle",
  },
  de: {
    email: "E-Mail",
    linkedin_message: "LinkedIn-Nachricht",
    linkedin_connect: "LinkedIn-Vernetzung",
    linkedin_view_profile: "LinkedIn-Profil ansehen",
    linkedin_voice_message: "LinkedIn-Sprachnachricht",
    linkedin_like_post: "LinkedIn-Beitrag liken",
    linkedin_inmail: "Sales Navigator-Nachricht",
    whatsapp: "WhatsApp",
    whatsapp_voice_message: "WhatsApp-Sprachnachricht",
    call: "Telefonanruf",
    ai_call: "KI-Sprachanruf",
    manual: "Manuelle Aufgabe",
  },
  pt: {
    email: "Email",
    linkedin_message: "Mensagem do LinkedIn",
    linkedin_connect: "Ligação no LinkedIn",
    linkedin_view_profile: "Ver perfil do LinkedIn",
    linkedin_voice_message: "Mensagem de voz do LinkedIn",
    linkedin_like_post: "Gostar de publicação no LinkedIn",
    linkedin_inmail: "Mensagem do Sales Navigator",
    whatsapp: "WhatsApp",
    whatsapp_voice_message: "Mensagem de voz do WhatsApp",
    call: "Chamada",
    ai_call: "Chamada de voz IA",
    manual: "Tarefa manual",
  },
  pt_BR: {
    email: "Email",
    linkedin_message: "Mensagem do LinkedIn",
    linkedin_connect: "Conexão no LinkedIn",
    linkedin_view_profile: "Ver perfil do LinkedIn",
    linkedin_voice_message: "Mensagem de voz do LinkedIn",
    linkedin_like_post: "Curtir publicação no LinkedIn",
    linkedin_inmail: "Mensagem do Sales Navigator",
    whatsapp: "WhatsApp",
    whatsapp_voice_message: "Mensagem de voz do WhatsApp",
    call: "Ligação",
    ai_call: "Ligação de voz IA",
    manual: "Tarefa manual",
  },
}

export function stepTypeLabel(locale: Locale, key: StepTypeKey): string {
  return STEP_TYPE_LABELS[locale][key]
}
