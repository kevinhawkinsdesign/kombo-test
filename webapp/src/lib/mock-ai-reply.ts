// Mock "Kai" reply drafting. Produces a context-aware suggested reply for a
// conversation, varying tone by the auto-tagged intent. UI-only — no network.
import type { ConvStatus, Conversation, Prospect } from "@/lib/types"

const MEET_LINK = "https://meet.google.com/kombo-demo"

// Several phrasings per intent so "Generate" yields a fresh draft each time.
const TEMPLATES: Record<ConvStatus | "default", ((p: Prospect) => string)[]> = {
  meeting_booked: [
    (p) =>
      `Perfect, ${p.firstName} — locking that in now. I'll send a calendar invite with a Google Meet link: ${MEET_LINK}. I'll keep it to 20 minutes and come ready with a teardown of ${p.company}'s current outbound.`,
    (p) =>
      `Great, that time works on my end. Invite is on its way. Beforehand, anything specific about ${p.company}'s pipeline you'd like me to dig into so we don't waste a minute?`,
  ],
  interested: [
    (p) =>
      `Love it, ${p.firstName}. The quickest way to show value is a 15-min walkthrough on your real data — I can show how ${p.company} would cut manual prospecting from day one. Does Thursday or Friday suit you better?`,
    (p) =>
      `Glad this landed, ${p.firstName}. Happy to share a short Loom first if that's easier, then a live session. Which do you prefer? Either way I'll tailor it to ${p.company}.`,
  ],
  positive: [
    (p) =>
      `Appreciate that, ${p.firstName}! Sounds like the fit is there. Want me to set up a quick session to map this to ${p.company}'s workflow? I'll keep it tight.`,
    (p) =>
      `Thanks ${p.firstName} — that's exactly the reaction we hope for. I'll send a couple of times that could work; grab whichever is easiest.`,
  ],
  referred: [
    (p) =>
      `Thanks for the intro, ${p.firstName} — really appreciate you pointing me in the right direction. I'll reach out to them directly and keep you posted. Anything I should know before I do?`,
    (p) =>
      `That's super helpful, ${p.firstName}. I'll loop them in this week. If it's easier, feel free to forward my note — happy to draft something short you can pass along.`,
  ],
  bad_timing: [
    (p) =>
      `Totally understand, ${p.firstName} — timing is everything. I'll check back in a quarter. In the meantime I'll send one short resource on what teams like ${p.company} did to prep, no strings attached.`,
    (p) =>
      `No problem at all, ${p.firstName}. I'll set a reminder to reconnect later this year. If anything changes sooner, you know where to find me.`,
  ],
  not_interested: [
    (p) =>
      `Appreciate you being straight with me, ${p.firstName} — I won't keep your inbox busy. If priorities shift at ${p.company}, I'm one reply away. Wishing you a strong quarter.`,
    (p) =>
      `Understood, ${p.firstName}, and thanks for the quick reply. I'll close the loop here. Door's open if the timing ever changes.`,
  ],
  default: [
    (p) =>
      `Thanks for getting back to me, ${p.firstName}. Would a quick 15-minute call make sense to see if there's a fit for ${p.company}? Here's my link: ${MEET_LINK}.`,
    (p) =>
      `Appreciate the reply, ${p.firstName}. Happy to share more — want me to send a short overview tailored to ${p.company}, or jump on a quick call?`,
  ],
}

/**
 * Draft a reply for a conversation. `seed` lets the caller rotate variants so
 * pressing "Generate" repeatedly cycles phrasings instead of repeating one.
 */
export function draftReply(
  prospect: Prospect,
  conv: Pick<Conversation, "status">,
  seed = 0
): string {
  const set = TEMPLATES[conv.status ?? "default"] ?? TEMPLATES.default
  return set[seed % set.length](prospect)
}
