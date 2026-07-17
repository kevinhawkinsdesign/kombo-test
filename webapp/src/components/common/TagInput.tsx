import * as React from "react"
import { Sparkles, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const TAG_PREVIEW_COUNT = 6

// Free-text chip input with a simulated AI pass: adding the first chip
// triggers a brief "finding similar X…" delay that appends a few related
// suggestions — mirrors the extension's onboarding behavior. Originally
// built inline for Onboarding.tsx's ICP-builder step; extracted here so
// Settings' ICP manager can reuse the exact same pattern instead of a
// second hand-rolled version.
export function TagInput({
  label,
  placeholder,
  values,
  onChange,
  suggestions,
  suggestingLabel,
  clearAllLabel,
  removeLabel,
  viewMoreLabel,
}: {
  label: string
  placeholder: string
  values: string[]
  onChange: (next: string[]) => void
  suggestions: string[]
  suggestingLabel: string
  clearAllLabel: (count: number) => string
  removeLabel: (value: string) => string
  viewMoreLabel: (count: number) => string
}) {
  const [text, setText] = React.useState("")
  const [suggesting, setSuggesting] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  function addValue(v: string) {
    const trimmed = v.trim()
    if (!trimmed || values.includes(trimmed)) return
    const wasEmpty = values.length === 0
    const next = [...values, trimmed]
    onChange(next)
    if (wasEmpty) {
      setSuggesting(true)
      window.setTimeout(() => {
        const have = new Set(next)
        const extra = suggestions.filter((s) => !have.has(s)).slice(0, 3)
        onChange([...next, ...extra])
        setSuggesting(false)
      }, 900)
    }
  }

  const shown = expanded ? values : values.slice(0, TAG_PREVIEW_COUNT)
  const hiddenCount = values.length - shown.length

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {values.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
          >
            <X className="size-3.5" />
            {clearAllLabel(values.length)}
          </button>
        )}
      </div>
      <div className="relative">
        <Sparkles className="text-primary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addValue(text)
              setText("")
            }
          }}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {suggesting && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Sparkles className="size-3.5 animate-pulse" />
          {suggestingLabel}
        </p>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {shown.map((v) => (
            <span
              key={v}
              className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-medium"
            >
              {v}
              <button
                type="button"
                aria-label={removeLabel(v)}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="rounded-full p-0.5 hover:bg-black/10"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-primary text-xs font-medium hover:underline"
            >
              {viewMoreLabel(hiddenCount)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
