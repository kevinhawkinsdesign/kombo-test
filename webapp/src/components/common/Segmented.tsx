import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A compact pill/segmented control for switching between a small set of
 * mutually exclusive options (entity, mode, view…). Shared so every segmented
 * toggle in the app looks and behaves the same.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { v: T; label: string; icon: React.ComponentType<{ className?: string }> }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn("bg-muted flex rounded-lg p-[3px]", className)}>
      {options.map((o) => {
        const Icon = o.icon
        const active = value === o.v
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
