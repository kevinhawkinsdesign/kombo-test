import type { ConvStatus } from "@/lib/types"

// Outcomes are a fixed list (not user-customizable tags) encoding the funnel:
// working it → won → needs attention → lost. Shared by the Inbox "Outcomes"
// list and the Home "Deal Flow" board so both read the same source of truth.
export const STATUS_META: Record<
  ConvStatus,
  {
    en: string
    es: string
    it: string
    fr: string
    de: string
    pt: string
    pt_BR: string
    dot: string
    badge: string
  }
> = {
  interested: {
    en: "Interested",
    es: "Interesado",
    it: "Interessato",
    fr: "Intéressé",
    de: "Interessiert",
    pt: "Interessado",
    pt_BR: "Interessado",
    dot: "bg-sky-500",
    badge: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  },
  not_interested: {
    en: "Not interested",
    es: "No interesado",
    it: "Non interessato",
    fr: "Pas intéressé",
    de: "Nicht interessiert",
    pt: "Não interessado",
    pt_BR: "Não interessado",
    dot: "bg-rose-500",
    badge: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  },
  qualified: {
    en: "Qualified",
    es: "Calificado",
    it: "Qualificato",
    fr: "Qualifié",
    de: "Qualifiziert",
    pt: "Qualificado",
    pt_BR: "Qualificado",
    dot: "bg-indigo-500",
    badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  },
  disqualified: {
    en: "Disqualified",
    es: "Descalificado",
    it: "Squalificato",
    fr: "Disqualifié",
    de: "Disqualifiziert",
    pt: "Desqualificado",
    pt_BR: "Desqualificado",
    dot: "bg-red-600",
    badge: "bg-red-600/12 text-red-700 dark:text-red-300",
  },
  meeting_booked: {
    en: "Meeting booked",
    es: "Reunión",
    it: "Riunione",
    fr: "Rendez-vous",
    de: "Meeting",
    pt: "Reunião",
    pt_BR: "Reunião",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  },
  need_review: {
    en: "Need review",
    es: "Revisar",
    it: "Da rivedere",
    fr: "À revoir",
    de: "Zu prüfen",
    pt: "A rever",
    pt_BR: "Revisar",
    dot: "bg-amber-500",
    badge: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  },
  won: {
    en: "Won",
    es: "Ganado",
    it: "Vinto",
    fr: "Gagné",
    de: "Gewonnen",
    pt: "Ganho",
    pt_BR: "Ganho",
    dot: "bg-green-600",
    badge: "bg-green-600/12 text-green-700 dark:text-green-300",
  },
  lost: {
    en: "Lost",
    es: "Perdido",
    it: "Perso",
    fr: "Perdu",
    de: "Verloren",
    pt: "Perdido",
    pt_BR: "Perdido",
    dot: "bg-slate-500",
    badge: "bg-slate-500/12 text-slate-700 dark:text-slate-300",
  },
}

export const STATUS_ORDER: ConvStatus[] = [
  "interested",
  "not_interested",
  "qualified",
  "disqualified",
  "meeting_booked",
  "need_review",
  "won",
  "lost",
]
