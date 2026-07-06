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
  qualified: [
    (p) =>
      `Glad this landed, ${p.firstName} — sounds like a solid fit. I'll send our security overview and anything else procurement needs. Want me to set a short call with your reviewer to fast-track questions?`,
    (p) =>
      `Appreciate that, ${p.firstName}! Let's keep the momentum — happy to loop in whoever else at ${p.company} needs to weigh in before next steps.`,
  ],
  disqualified: [
    (p) =>
      `Thanks for the clarity, ${p.firstName} — sounds like this isn't the right fit for ${p.company} right now. I'll close this out on my end. Wishing you a strong quarter.`,
    (p) =>
      `Understood, ${p.firstName}, appreciate you saving us both the back-and-forth. Door's open if that ever changes.`,
  ],
  need_review: [
    (p) =>
      `Thanks for the intro, ${p.firstName} — really appreciate you pointing me in the right direction. I'll reach out directly and keep you posted. Anything I should know before I do?`,
    (p) =>
      `No problem at all, ${p.firstName}. I'll set a reminder to reconnect later. In the meantime I'll send one short resource on what teams like ${p.company} did to prep, no strings attached.`,
  ],
  won: [
    (p) =>
      `Thrilled to have ${p.company} on board, ${p.firstName}! I'll get onboarding scheduled and make sure your team has everything they need from day one.`,
    (p) =>
      `This is great news, ${p.firstName} — thank you for the trust. I'll send over next steps and introduce you to the onboarding team shortly.`,
  ],
  lost: [
    (p) =>
      `Appreciate you being straight with me, ${p.firstName} — I won't keep your inbox busy. If priorities shift at ${p.company}, I'm one reply away. Wishing you a strong quarter.`,
    (p) =>
      `Understood, ${p.firstName}, and thanks for the quick reply. I'll close the loop here. Door's open if the timing ever changes.`,
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
