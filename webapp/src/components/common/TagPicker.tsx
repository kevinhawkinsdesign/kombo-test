import * as React from "react"
import { Plus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const MAX_SUGGESTIONS = 8

// A free-text chip/multi-select tag picker: type to add a new (workspace-
// defined) tag, pick from suggestions already used elsewhere, and remove any
// selected tag as a chip. Unlike MultiSelectCombobox, the item set isn't
// fixed — any typed value becomes a tag, so there's no items/getKey pair,
// just plain strings.
export function TagPicker({
  value,
  onChange,
  suggestions = [],
  placeholder,
  suggestionsEmptyText,
  addLabel,
  className,
  id,
}: {
  value: string[]
  onChange: (next: string[]) => void
  /** Existing tags in use elsewhere, offered as autocomplete while typing. */
  suggestions?: string[]
  placeholder: string
  /** Shown in the dropdown when no suggestion matches the typed text. */
  suggestionsEmptyText?: string
  /** e.g. (text) => `Add "${text}"` — label for the "create new tag" row. */
  addLabel: (text: string) => string
  className?: string
  id?: string
}) {
  const [text, setText] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selected = new Set(value.map((t) => t.toLowerCase()))
  const q = text.trim().toLowerCase()
  const matches = q
    ? suggestions.filter(
        (s) => !selected.has(s.toLowerCase()) && s.toLowerCase().includes(q)
      )
    : suggestions.filter((s) => !selected.has(s.toLowerCase()))
  const shown = matches.slice(0, MAX_SUGGESTIONS)
  const exactMatch = q.length > 0 && suggestions.some((s) => s.toLowerCase() === q)

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag) return
    if (selected.has(tag.toLowerCase())) {
      setText("")
      return
    }
    onChange([...value, tag])
    setText("")
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Popover open={open && (shown.length > 0 || (q.length > 0 && !exactMatch))} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            id={id}
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                addTag(text)
              } else if (e.key === "Backspace" && text.length === 0 && value.length > 0) {
                removeTag(value[value.length - 1])
              } else if (e.key === "Escape") {
                setOpen(false)
              }
            }}
            placeholder={placeholder}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-1"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {shown.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                addTag(s)
                inputRef.current?.focus()
              }}
              className="hover:bg-muted flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors"
            >
              {s}
            </button>
          ))}
          {q.length > 0 && !exactMatch && (
            <button
              type="button"
              onClick={() => {
                addTag(text)
                inputRef.current?.focus()
              }}
              className="hover:bg-muted flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors"
            >
              <Plus className="size-3.5" />
              {addLabel(text.trim())}
            </button>
          )}
          {shown.length === 0 && q.length === 0 && suggestionsEmptyText && (
            <p className="text-muted-foreground px-2 py-1.5 text-center text-sm">
              {suggestionsEmptyText}
            </p>
          )}
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 py-1 pr-1 font-normal">
              {tag}
              <button
                type="button"
                aria-label={tag}
                onClick={() => removeTag(tag)}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
