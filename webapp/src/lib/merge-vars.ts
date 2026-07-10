// Shared {{merge_var}} substitution — resolves a template/prompt/sequence
// step's copy against a real Prospect's own data, so previews show what a
// specific recipient would actually receive instead of generic placeholders.

import { currentUser } from "@/lib/mock-data"
import type { Prospect } from "@/lib/types"

export function mergeVars(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, tag: string) => data[tag] ?? `{{${tag}}}`)
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
