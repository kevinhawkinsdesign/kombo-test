import lockupUrl from "@/assets/kombo-lockup.svg"

import { cn } from "@/lib/utils"

/** Full brand lockup (icon + wordmark). Built for dark backgrounds. */
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

export function KomboMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        aria-hidden="true"
      >
        <path
          d="M6 4v16M6 12l7-8M6 12l7 8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="6" r="2.2" fill="currentColor" />
      </svg>
    </div>
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
