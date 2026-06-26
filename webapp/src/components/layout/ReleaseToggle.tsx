import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale"
import { useReleaseMode, type ReleaseMode } from "@/lib/release-mode"
import { cn } from "@/lib/utils"

const OPTIONS: ReleaseMode[] = ["v1", "v2"]

/**
 * Segmented V1 / V2 switch. V1 = ship-first scope (Chrome-extension parity);
 * V2 = the full web-app vision. Switching hides or reveals every page that
 * doesn't yet exist in the extension.
 */
export function ReleaseToggle() {
  const { mode, setMode } = useReleaseMode()
  const { t } = useLocale()

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] text-center">
          {t("release.tooltip")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
