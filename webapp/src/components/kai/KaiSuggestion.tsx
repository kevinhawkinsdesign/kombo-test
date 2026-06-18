import { Sparkles } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

/**
 * An in-situ Kai suggestion / tip. Use it to surface the next-best action or
 * a helpful explanation right where the user is working.
 */
export function KaiSuggestion({
  title,
  children,
  action,
  className,
}: {
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  const { t } = useLocale()
  const heading = title ?? t("kai.suggests")
  return (
    <div
      className={cn(
        "border-primary/20 bg-primary/5 flex flex-wrap items-start gap-3 rounded-xl border p-4",
        className
      )}
    >
      <span className="bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{heading}</p>
        <div className="text-muted-foreground mt-0.5 text-sm">{children}</div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
