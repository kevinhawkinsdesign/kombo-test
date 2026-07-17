// Shared {{merge_var}} substitution — resolves a template/prompt/sequence
// step's copy against a real Prospect's own data, so previews show what a
// specific recipient would actually receive instead of generic placeholders.

import { currentUser } from "@/lib/mock-data"
import type { Prospect } from "@/lib/types"

export function mergeVars(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, tag: string) => data[tag] ?? `{{${tag}}}`)
}

export interface MergeVariable {
  tag: string
  en: string
  es: string
  it: string
  fr: string
  de: string
  pt: string
  pt_BR: string
}

// The tag set every merge-var picker in the app offers, kept in one place so
// "insert a variable" reads the same everywhere it appears.
export const MERGE_VARIABLES: MergeVariable[] = [
  { tag: "first_name", en: "First name", es: "Nombre", it: "Nome", fr: "Prénom", de: "Vorname", pt: "Nome", pt_BR: "Nome" },
  { tag: "last_name", en: "Last name", es: "Apellido", it: "Cognome", fr: "Nom", de: "Nachname", pt: "Apelido", pt_BR: "Sobrenome" },
  { tag: "company", en: "Company", es: "Empresa", it: "Azienda", fr: "Entreprise", de: "Unternehmen", pt: "Empresa", pt_BR: "Empresa" },
  { tag: "title", en: "Job title", es: "Cargo", it: "Posizione", fr: "Intitulé de poste", de: "Jobtitel", pt: "Cargo", pt_BR: "Cargo" },
  { tag: "industry", en: "Industry", es: "Sector", it: "Settore", fr: "Secteur", de: "Branche", pt: "Setor", pt_BR: "Setor" },
  { tag: "city", en: "City", es: "Ciudad", it: "Città", fr: "Ville", de: "Stadt", pt: "Cidade", pt_BR: "Cidade" },
  { tag: "sender", en: "Sender", es: "Remitente", it: "Mittente", fr: "Expéditeur", de: "Absender", pt: "Remetente", pt_BR: "Remetente" },
  { tag: "sender_company", en: "Your company", es: "Tu empresa", it: "La tua azienda", fr: "Votre entreprise", de: "Dein Unternehmen", pt: "A sua empresa", pt_BR: "Sua empresa" },
  { tag: "sender_title", en: "Your title", es: "Tu cargo", it: "La tua posizione", fr: "Votre poste", de: "Dein Jobtitel", pt: "O seu cargo", pt_BR: "Seu cargo" },
  { tag: "calendar_link", en: "Booking link", es: "Enlace de reserva", it: "Link di prenotazione", fr: "Lien de réservation", de: "Buchungslink", pt: "Link de marcação", pt_BR: "Link de agendamento" },
]

// The three groupings the Chrome extension already uses when listing merge
// variables ("Your Details" / "Prospect Info" / "Prospect Company") — every
// variable picker in the app should group tags the same way instead of
// showing one long flat list.
export type MergeVarGroupKey = "yourDetails" | "prospectInfo" | "prospectCompany"

export const MERGE_VARIABLE_GROUPS: { key: MergeVarGroupKey; tags: string[] }[] = [
  { key: "yourDetails", tags: ["sender", "sender_company", "sender_title", "calendar_link"] },
  { key: "prospectInfo", tags: ["first_name", "last_name", "title", "city"] },
  { key: "prospectCompany", tags: ["company", "industry"] },
]

// Buckets any tagged list (MergeVariable, or a page's own local variable
// type) into the given groups, in group order, dropping empty groups — e.g.
// after a search filter has removed every tag from a group. Any tag not
// covered by the supplied groups (a page with a richer catalog than the
// three shared ones) lands in a trailing "other" bucket instead of silently
// disappearing.
export function groupByMergeVarGroup<T extends { tag: string }, K extends string>(
  items: T[],
  groups: { key: K; tags: string[] }[]
): { key: K | "other"; items: T[] }[] {
  const matched = new Set<string>()
  const grouped = groups
    .map((g) => {
      const groupItems = items.filter((i) => g.tags.includes(i.tag))
      groupItems.forEach((i) => matched.add(i.tag))
      return { key: g.key as K | "other", items: groupItems }
    })
    .filter((g) => g.items.length > 0)
  const leftover = items.filter((i) => !matched.has(i.tag))
  if (leftover.length > 0) grouped.push({ key: "other", items: leftover })
  return grouped
}

export function prospectMergeData(p: Prospect): Record<string, string> {
  return {
    first_name: p.firstName,
    last_name: p.lastName,
    company: p.company,
    title: p.title,
    industry: p.industry,
    city: p.location,
    sender: currentUser.name,
    sender_company: currentUser.company,
    sender_title: currentUser.role,
    calendar_link: "kombo.ai/meet/kevin",
  }
}
