import { X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useFeatureIntro, type FeatureKey } from "@/lib/feature-tour"
import { cn } from "@/lib/utils"

/**
 * A dismissible, first-visit intro for a feature. Explains what the page does
 * and why it's worth using, with an optional list of capabilities and a
 * primary call to action. Stays hidden once dismissed (persisted per feature).
 */
export function FeatureIntro({
  featureKey,
  icon: Icon,
  title,
  description,
  points,
  action,
  className,
}: {
  featureKey: FeatureKey
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  points?: string[]
  action?: React.ReactNode
  className?: string
}) {
  const { show, dismiss } = useFeatureIntro(featureKey)
  if (!show) return null

  return (
    <section
      aria-label={`About ${title}`}
      className={cn(
        "border-primary/20 from-primary/[0.06] to-card relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 sm:p-5",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={dismiss}
        aria-label="Dismiss introduction"
        className="text-muted-foreground absolute top-2 right-2 size-8"
      >
        <X className="size-4" />
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <span className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1 pr-6">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground mt-0.5 text-sm text-pretty">
            {description}
          </p>

          {points && points.length > 0 && (
            <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm"
                >
                  <Check className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {action}
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Got it
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
