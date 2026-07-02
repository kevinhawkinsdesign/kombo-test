import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * "Max contacts per company" control, shared by the Search results page and
 * the add-records modal so both stay in parity. Off toggle + a free number
 * input (users type any cap, not just fixed presets). Presentational — the
 * caller owns what happens on change (e.g. re-selecting the capped set).
 */
export function PerCompanyCap({
  value,
  onChange,
  label,
  offLabel,
  ariaLabel,
  placeholder = "#",
  className,
}: {
  value: number | null
  onChange: (v: number | null) => void
  offLabel: string
  ariaLabel: string
  label?: string
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {label && (
        <span className="text-muted-foreground text-xs font-medium">{label}</span>
      )}
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value == null}
        className={cn(
          "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
          value == null
            ? "border-primary bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted/60"
        )}
      >
        {offLabel}
      </button>
      <Input
        type="number"
        min={1}
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value.trim()
          if (raw === "") {
            onChange(null)
            return
          }
          const n = parseInt(raw, 10)
          if (Number.isFinite(n) && n >= 1) onChange(n)
        }}
        placeholder={placeholder}
        clearable={false}
        aria-label={ariaLabel}
        className="h-7 w-16 px-2 text-xs"
      />
    </div>
  )
}
