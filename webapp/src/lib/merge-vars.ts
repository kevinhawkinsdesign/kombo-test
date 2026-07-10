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
}

// The tag set every merge-var picker in the app offers, kept in one place so
// "insert a variable" reads the same everywhere it appears.
export const MERGE_VARIABLES: MergeVariable[] = [
  { tag: "first_name", en: "First name", es: "Nombre" },
  { tag: "last_name", en: "Last name", es: "Apellido" },
  { tag: "company", en: "Company", es: "Empresa" },
  { tag: "title", en: "Job title", es: "Cargo" },
  { tag: "industry", en: "Industry", es: "Sector" },
  { tag: "city", en: "City", es: "Ciudad" },
  { tag: "sender", en: "Sender", es: "Remitente" },
  { tag: "sender_company", en: "Your company", es: "Tu empresa" },
  { tag: "sender_title", en: "Your title", es: "Tu cargo" },
  { tag: "calendar_link", en: "Booking link", es: "Enlace de reserva" },
]

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
