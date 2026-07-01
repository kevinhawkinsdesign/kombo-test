import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Shared empty / "no results" block. The default `dashed` variant is the
 * muted dashed-border card used across list and results pages; `plain` drops
 * the border for use inside cards that already provide a frame.
 */
export function EmptyState({
  icon,
  title,
  description,
  children,
  variant = "dashed",
  className,
}: {
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  variant?: "dashed" | "plain"
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col items-center justify-center gap-2 py-16 text-center text-sm",
        variant === "dashed" && "rounded-xl border border-dashed",
        className
      )}
    >
      {icon && <span className="text-muted-foreground/70">{icon}</span>}
      {title && <p className="text-foreground text-sm font-medium">{title}</p>}
      {description}
      {children}
    </div>
  )
}
