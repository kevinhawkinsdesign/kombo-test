// Renders mergeVars() substitution as React nodes with the resolved,
// personalized values visually distinct from the surrounding copy — so a
// preview reads at a glance which words are real prospect data vs. the
// sender's own template text. Companion to the plain-string mergeVars() in
// lib/merge-vars.ts; use this one anywhere the result is actually displayed
// (a preview, not a `value` prop that needs a plain string).

import type { ReactNode } from "react"

const MERGE_VAR_RE = /\{\{(\w+)\}\}/g

export function mergeVarsHighlighted(
  text: string,
  data: Record<string, string>
): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null
  MERGE_VAR_RE.lastIndex = 0
  while ((match = MERGE_VAR_RE.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const tag = match[1]
    const value = data[tag]
    if (value !== undefined) {
      parts.push(
        <mark
          key={key++}
          className="bg-primary/10 text-primary rounded px-0.5 font-medium"
        >
          {value}
        </mark>
      )
    } else {
      parts.push(`{{${tag}}}`)
    }
    lastIndex = MERGE_VAR_RE.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}
