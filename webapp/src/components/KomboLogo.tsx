import lockupUrl from "@/assets/kombo-lockup-notag.png"
import iconUrl from "@/assets/kombo-icon.png"
import brandBlackUrl from "@/assets/kombo-brand-black.png"

import { cn } from "@/lib/utils"

/** Full brand lockup (icon + wordmark, no "Ai" tagline). Built for dark backgrounds. */
export function KomboLockup({ className }: { className?: string }) {
  return (
    <img
      src={lockupUrl}
      alt="Kombo"
      className={cn("h-7 w-auto select-none", className)}
      draggable={false}
    />
  )
}

/** Compact brand mark — the sidebar's collapsed-state icon. */
export function KomboMark({ className }: { className?: string }) {
  return (
    <img
      src={iconUrl}
      alt="Kombo"
      className={cn("size-8 select-none", className)}
      draggable={false}
    />
  )
}

export function KomboLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <KomboMark />
      <span className="text-lg font-semibold tracking-tight">
        Kombo
        <span className="text-primary"> 2.0</span>
      </span>
    </div>
  )
}

/** Full icon+wordmark brand lockup, black — for light backgrounds. */
export function KomboBrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={brandBlackUrl}
      alt="Kombo AI"
      className={cn("h-7 w-auto select-none", className)}
      draggable={false}
    />
  )
}
