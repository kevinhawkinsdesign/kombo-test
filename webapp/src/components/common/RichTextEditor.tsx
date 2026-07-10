import * as React from "react"
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface RichTextEditorHandle {
  // Insert plain text (e.g. a "{{variable}}") at the last caret position.
  insertText: (text: string) => void
  focus: () => void
}

// A lightweight WYSIWYG editor built on contentEditable. Stores HTML in `value`
// and emits HTML through `onChange`. Shared by every outbound message field
// (templates, inbox replies, campaign steps, compose) so formatting behaves the
// same everywhere. execCommand is deprecated but works in the Chromium target
// and keeps the editor dependency-free.
export const RichTextEditor = React.forwardRef<
  RichTextEditorHandle,
  {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
    onFocus?: () => void
    ariaLabel?: string
    // Extra controls right-aligned in the toolbar row (e.g. an AI-draft badge,
    // template/variable pickers) — optional, purely additive per call site.
    toolbarEnd?: React.ReactNode
  }
>(function RichTextEditor(
  {
    value,
    onChange,
    placeholder,
    className,
    minHeight = "min-h-48",
    onFocus,
    ariaLabel,
    toolbarEnd,
  },
  ref
) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  // Remember the caret so sidebar/variable inserts land where the user left off.
  const lastRangeRef = React.useRef<Range | null>(null)
  const [empty, setEmpty] = React.useState(!value)

  // Sync external value changes (open template, AI generate) into the DOM,
  // but never while the user is typing in it (avoids caret jumps).
  React.useEffect(() => {
    const el = editorRef.current
    if (el && el.innerHTML !== value && document.activeElement !== el) {
      el.innerHTML = value
      setEmpty(!el.textContent?.trim())
    }
  }, [value])

  function emit() {
    const el = editorRef.current
    if (!el) return
    setEmpty(!el.textContent?.trim())
    onChange(el.innerHTML)
  }

  function saveRange() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        lastRangeRef.current = range.cloneRange()
      }
    }
  }

  function exec(command: string, arg?: string) {
    const el = editorRef.current
    if (!el) return
    el.focus()
    document.execCommand(command, false, arg)
    emit()
  }

  React.useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
    insertText: (text: string) => {
      const el = editorRef.current
      if (!el) return
      el.focus()
      const sel = window.getSelection()
      // Restore the last known caret inside the editor.
      if (lastRangeRef.current) {
        sel?.removeAllRanges()
        sel?.addRange(lastRangeRef.current)
      }
      // A merge-var tag ("{{first_name}}") gets a colored span instead of a
      // plain text node, so it reads as a token distinct from the
      // surrounding message copy — same visual language as the resolved
      // preview (see mergeVarsHighlighted).
      const isMergeVar = /^\{\{\w+\}\}$/.test(text)
      const node: Node = isMergeVar
        ? (() => {
            const span = document.createElement("span")
            span.className = "text-primary bg-primary/10 rounded px-0.5 font-medium"
            span.textContent = text
            return span
          })()
        : document.createTextNode(text)
      const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null
      if (range && el.contains(range.commonAncestorContainer)) {
        range.deleteContents()
        range.insertNode(node)
        range.setStartAfter(node)
        range.collapse(true)
        sel?.removeAllRanges()
        sel?.addRange(range)
        lastRangeRef.current = range.cloneRange()
      } else {
        el.appendChild(node)
      }
      emit()
    },
  }))

  const tools: { icon: typeof Bold; command: string; label: string; arg?: () => string | undefined }[] = [
    { icon: Bold, command: "bold", label: "Bold" },
    { icon: Italic, command: "italic", label: "Italic" },
    { icon: Underline, command: "underline", label: "Underline" },
    { icon: List, command: "insertUnorderedList", label: "Bulleted list" },
    { icon: ListOrdered, command: "insertOrderedList", label: "Numbered list" },
    {
      icon: LinkIcon,
      command: "createLink",
      label: "Link",
      arg: () => window.prompt("Link URL") ?? undefined,
    },
  ]

  return (
    <div
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 overflow-hidden rounded-md border bg-transparent focus-within:ring-[3px]",
        className
      )}
    >
      <div className="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b px-1 py-1">
        {tools.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.command}
              type="button"
              aria-label={t.label}
              title={t.label}
              // Keep the editor selection when clicking a toolbar button.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const arg = t.arg?.()
                if (t.arg && !arg) return
                exec(t.command, arg)
              }}
              className="text-muted-foreground hover:bg-background hover:text-foreground flex size-7 items-center justify-center rounded"
            >
              <Icon className="size-3.5" />
            </button>
          )
        })}
        {toolbarEnd && (
          <div className="ml-auto flex items-center gap-1.5 pr-1">{toolbarEnd}</div>
        )}
      </div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          onInput={emit}
          onFocus={onFocus}
          onKeyUp={saveRange}
          onMouseUp={saveRange}
          onBlur={saveRange}
          className={cn(
            "prose-sm max-w-none px-3 py-2 text-sm leading-relaxed outline-none [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
            minHeight
          )}
        />
        {empty && placeholder && (
          <span className="text-muted-foreground pointer-events-none absolute top-2 left-3 text-sm">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  )
})
