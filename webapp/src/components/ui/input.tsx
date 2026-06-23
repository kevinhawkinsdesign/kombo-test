import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const BASE =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

// Types that don't get a clear button.
const NO_CLEAR_TYPES = new Set([
  "checkbox",
  "radio",
  "file",
  "range",
  "color",
  "hidden",
  "submit",
  "button",
  "reset",
])

interface InputProps extends React.ComponentProps<"input"> {
  // Opt out of the built-in clear (×) button for this field.
  clearable?: boolean
}

function Input({ className, type, clearable = true, onChange, ...props }: InputProps) {
  // Hooks run unconditionally (before any early return) to satisfy rules-of-hooks.
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const value = props.value
  const isControlled = value !== undefined && value !== null
  const [uncontrolledHasValue, setUncontrolledHasValue] = React.useState(
    props.defaultValue != null && String(props.defaultValue).length > 0
  )

  const allowClear = clearable && !NO_CLEAR_TYPES.has(type ?? "")

  // Plain input (no wrapper) preserves exact layout for opted-out fields.
  if (!allowClear) {
    return (
      <input
        type={type}
        data-slot="input"
        onChange={onChange}
        className={cn(BASE, className)}
        {...props}
      />
    )
  }

  // Controlled value is derived; uncontrolled tracks via local state.
  const hasValue = isControlled ? String(value).length > 0 : uncontrolledHasValue
  const showClear = hasValue && !props.disabled && !props.readOnly

  function clear() {
    const el = wrapperRef.current?.querySelector("input")
    if (!el) return
    // Native setter + input event so controlled inputs see the change.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set
    setter?.call(el, "")
    el.dispatchEvent(new Event("input", { bubbles: true }))
    el.focus()
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type={type}
        data-slot="input"
        onChange={(e) => {
          if (!isControlled) setUncontrolledHasValue(e.target.value.length > 0)
          onChange?.(e)
        }}
        className={cn(BASE, showClear && "pr-9", className)}
        {...props}
      />
      {showClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear"
          onClick={clear}
          className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export { Input }
