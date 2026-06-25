// Mock "Sell by Chat" GPT agent for template generation. UI-only: turns a
// short prompt into a subject + body that always include merge variables.
import type { Channel } from "@/lib/types"

export interface GeneratedTemplate {
  subject: string
  body: string
}

export interface PromptPreset {
  id: string
  en: string
  es: string
  prompt: { en: string; es: string }
  channel?: Channel // restrict a preset to one channel
}

// Pre-populated prompts, mirroring the ones shipped in the Kombo extension.
export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: "cold_intro",
    en: "Cold intro — pain point",
    es: "Intro en frío — punto de dolor",
    prompt: {
      en: "Write a short cold email to {{first_name}}, a {{title}} at {{company}}, opening with a likely pain point for their team and ending with a soft ask for a quick call.",
      es: "Escribe un correo en frío breve a {{first_name}}, {{title}} en {{company}}, abriendo con un posible punto de dolor de su equipo y cerrando con una petición suave de una llamada.",
    },
  },
  {
    id: "follow_up_case_study",
    en: "Follow-up — case study",
    es: "Seguimiento — caso de éxito",
    prompt: {
      en: "Write a 2-line follow-up referencing a case study from a team similar to {{company}} that saw a 3x lift in reply rates.",
      es: "Escribe un seguimiento de 2 líneas mencionando un caso de éxito de un equipo similar a {{company}} que triplicó su tasa de respuesta.",
    },
  },
  {
    id: "re_engage",
    en: "Re-engage a quiet prospect",
    es: "Reactivar un prospecto inactivo",
    prompt: {
      en: "Write a casual bump to {{first_name}} who went quiet, no guilt-trip, with one new reason to talk.",
      es: "Escribe un recordatorio casual a {{first_name}} que dejó de responder, sin reproches, con un motivo nuevo para hablar.",
    },
  },
  {
    id: "meeting_request",
    en: "Meeting request",
    es: "Solicitud de reunión",
    prompt: {
      en: "Write a concise note asking {{first_name}} for 15 minutes this week, with my booking link {{calendar_link}}.",
      es: "Escribe una nota concisa pidiendo a {{first_name}} 15 minutos esta semana, con mi enlace {{calendar_link}}.",
    },
  },
  {
    id: "break_up",
    en: "Break-up / last touch",
    es: "Despedida / último contacto",
    prompt: {
      en: "Write a polite break-up email to {{first_name}} closing the loop, leaving the door open.",
      es: "Escribe un correo de despedida educado a {{first_name}} cerrando el ciclo, dejando la puerta abierta.",
    },
  },
  {
    id: "linkedin_connect",
    en: "LinkedIn connection note",
    es: "Nota de conexión de LinkedIn",
    channel: "linkedin",
    prompt: {
      en: "Write a 1-line LinkedIn connection note to {{first_name}} that references {{company}} and isn't salesy.",
      es: "Escribe una nota de conexión de LinkedIn de 1 línea para {{first_name}} que mencione {{company}} y no suene a venta.",
    },
  },
]

type Intent =
  | "cold"
  | "follow_up"
  | "re_engage"
  | "meeting"
  | "break_up"
  | "linkedin"

function detectIntent(prompt: string, channel: Channel): Intent {
  const p = prompt.toLowerCase()
  if (channel === "linkedin" || /linkedin|connection|connect note/.test(p)) return "linkedin"
  if (/break.?up|last (touch|email)|closing the loop|goodbye/.test(p)) return "break_up"
  if (/meeting|call|demo|15 min|book|calendar|time this week/.test(p)) return "meeting"
  if (/re-?engage|quiet|bump|went (quiet|dark)|circle back|follow.?up/.test(p)) {
    return /case study|case-study|reference|proof/.test(p) ? "follow_up" : "re_engage"
  }
  if (/case study|proof|reference|results/.test(p)) return "follow_up"
  return "cold"
}

// Two variants per intent so "Regenerate" produces fresh copy.
const EMAIL: Record<Exclude<Intent, "linkedin">, GeneratedTemplate[]> = {
  cold: [
    {
      subject: "{{company}} + faster pipeline?",
      body: "Hi {{first_name}},\n\nMost {{title}}s at companies like {{company}} tell me their reps lose hours a week to manual prospecting. We fix that — qualified pipeline 3x faster, with AI doing the busywork.\n\nWorth a quick 15 minutes to see if it fits {{company}}?\n\n{{sender}}\n{{sender_company}}",
    },
    {
      subject: "A thought for {{company}}",
      body: "Hi {{first_name}},\n\nSaw you lead as {{title}} at {{company}} — teams your size usually hit a wall scaling outbound without adding headcount. That's exactly what we help with.\n\nOpen to a short call? Here's my link: {{calendar_link}}\n\nBest,\n{{sender}}",
    },
  ],
  follow_up: [
    {
      subject: "Re: {{company}}",
      body: "Quick bump, {{first_name}} — sharing a 2-min case study from a team similar to {{company}} that saw a 3x lift in reply rates after switching.\n\nHappy to walk you through how it'd map to {{company}}. Grab a time: {{calendar_link}}\n\n{{sender}}",
    },
    {
      subject: "Proof, not just a pitch — {{company}}",
      body: "Hi {{first_name}},\n\nFollowing up with something concrete: a customer in your space cut prospecting time in half and doubled meetings booked in 6 weeks.\n\nWant the 1-pager, or easier to chat live?\n\n{{sender}}\n{{sender_company}}",
    },
  ],
  re_engage: [
    {
      subject: "Still on your radar, {{first_name}}?",
      body: "Hi {{first_name}},\n\nNo guilt-trip — just circling back. Since we last spoke, we shipped something that's a strong fit for how {{company}} runs outreach.\n\nWorth a fresh look? I'll keep it to 15 minutes.\n\n{{sender}}",
    },
    {
      subject: "One new reason to talk",
      body: "{{first_name}} — I know inboxes are brutal. Reaching out once more because teams like {{company}} are seeing real results with us right now.\n\nIf the timing's better, here's my link: {{calendar_link}}\n\n{{sender}}",
    },
  ],
  meeting: [
    {
      subject: "15 minutes this week, {{first_name}}?",
      body: "Hi {{first_name}},\n\nWould love to show you how {{company}} could cut manual prospecting from day one. Could you do 15 minutes this week?\n\nGrab whatever works: {{calendar_link}}\n\nThanks,\n{{sender}}\n{{sender_title}}, {{sender_company}}",
    },
    {
      subject: "Quick demo for {{company}}?",
      body: "Hi {{first_name}},\n\nHappy to run a tight, no-fluff demo tailored to {{company}}. Pick a slot and I'll come ready: {{calendar_link}}\n\nBest,\n{{sender}}",
    },
  ],
  break_up: [
    {
      subject: "Closing the loop, {{first_name}}",
      body: "Hi {{first_name}},\n\nI don't want to clutter your inbox, so I'll leave it here. If improving outbound at {{company}} moves up the list, I'm one reply away.\n\nWishing you and the team a strong quarter.\n\n{{sender}}",
    },
    {
      subject: "Last note from me",
      body: "{{first_name}} — sounds like now isn't the moment, and that's completely fair. I'll close this out. Door's open at {{company}} whenever the timing's right.\n\nAll the best,\n{{sender}}\n{{sender_company}}",
    },
  ],
}

const LINKEDIN: GeneratedTemplate[] = [
  {
    subject: "",
    body: "Hi {{first_name}} — really like what {{company}} is building. Would love to connect and trade notes on outbound.",
  },
  {
    subject: "",
    body: "{{first_name}}, came across {{company}} and your work as {{title}} — keen to connect, no pitch.",
  },
]

export function generateTemplate(
  prompt: string,
  channel: Channel,
  seed = 0
): GeneratedTemplate {
  const intent = detectIntent(prompt, channel)
  if (intent === "linkedin") {
    return LINKEDIN[seed % LINKEDIN.length]
  }
  const set = EMAIL[intent]
  return set[seed % set.length]
}
