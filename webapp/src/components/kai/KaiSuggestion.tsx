import * as React from "react"
import { Sparkles, X } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

// Persisted dismissals so a dismissed Kai banner stays gone across reloads.
const KEY = "kombo_kai_dismissed_v1"
const subs = new Set<() => void>()

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {
    /* ignore */
  }
  return new Set()
}
let dismissed = loadDismissed()

function dismissKaiSuggestion(key: string): void {
  dismissed = new Set(dismissed)
  dismissed.add(key)
  try {
    localStorage.setItem(KEY, JSON.stringify([...dismissed]))
  } catch {
    /* ignore */
  }
  subs.forEach((s) => s())
}

function useDismissed(key?: string): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => (key ? dismissed.has(key) : false),
    () => (key ? dismissed.has(key) : false)
  )
}

/**
 * An in-situ Kai suggestion / tip. Use it to surface the next-best action or
 * a helpful explanation right where the user is working. Always dismissable;
 * pass `dismissKey` to remember the dismissal across reloads.
 */
export function KaiSuggestion({
  title,
  children,
  action,
  className,
  dismissKey,
}: {
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  dismissKey?: string
}) {
  const { t } = useLocale()
  const heading = title ?? t("kai.suggests")
  const persisted = useDismissed(dismissKey)
  const [sessionDismissed, setSessionDismissed] = React.useState(false)

  if (persisted || sessionDismissed) return null

  function handleDismiss() {
    if (dismissKey) dismissKaiSuggestion(dismissKey)
    else setSessionDismissed(true)
  }

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
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("common.dismiss")}
        title={t("common.dismiss")}
        className="text-muted-foreground hover:bg-muted hover:text-foreground -mt-1 -mr-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
