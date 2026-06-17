import { Info } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { define } from "@/lib/glossary"
import { cn } from "@/lib/utils"

/** A small ⓘ icon that explains a feature or metric on hover/focus. */
export function InfoHint({
  children,
  label = "More information",
  className,
}: {
  children: React.ReactNode
  label?: string
  className?: string
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn(
              "text-muted-foreground/70 hover:text-foreground inline-flex size-4 shrink-0 items-center justify-center align-middle transition-colors",
              className
            )}
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-pretty">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Wraps a jargon term in a dotted underline with its glossary definition. */
export function Term({
  name,
  children,
}: {
  name: string
  children?: React.ReactNode
}) {
  const def = define(name)
  const label = children ?? name
  if (!def) return <>{label}</>
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="decoration-muted-foreground/50 cursor-help underline decoration-dotted underline-offset-2"
          >
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-pretty">{def}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
