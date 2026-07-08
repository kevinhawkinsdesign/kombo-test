import { useLocale } from "@/lib/locale"
import { useReleaseMode, type ReleaseMode } from "@/lib/release-mode"
import { cn } from "@/lib/utils"

const OPTIONS: ReleaseMode[] = ["v1", "v2"]

/**
 * Segmented V1 / V2 switch. Switching hides or reveals every page gated by
 * `V2_ONLY_PATHS` in `lib/release-mode.ts`.
 */
export function ReleaseToggle() {
  const { mode, setMode } = useReleaseMode()
  const { t } = useLocale()

  return (
    <div
      role="group"
      aria-label={t("release.label")}
      className="hidden items-center gap-2 sm:flex"
    >
      <span className="text-muted-foreground hidden text-xs font-medium lg:inline">
        {t("release.label")}
      </span>
      <div className="bg-muted flex rounded-lg p-[3px]">
        {OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={mode === value}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-colors",
              mode === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
