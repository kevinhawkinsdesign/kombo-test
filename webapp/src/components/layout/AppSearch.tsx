import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

import { APP_DESTINATIONS, DEFAULT_DESTINATIONS } from "@/lib/app-nav"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

/** Top-bar combobox that searches the app's pages and jumps to them. */
export function AppSearch() {
  const navigate = useNavigate()
  const { t } = useLocale()
  const [query, setQuery] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const q = query.trim().toLowerCase()
  const results = React.useMemo(() => {
    if (!q) return APP_DESTINATIONS.filter((d) => DEFAULT_DESTINATIONS.includes(d.to))
    return APP_DESTINATIONS.filter((d) => {
      const label = t(d.labelKey).toLowerCase()
      return label.includes(q) || d.keywords?.some((k) => k.includes(q))
    }).slice(0, 8)
  }, [q, t])

  const open = focused && results.length > 0
  const activeIndex = Math.min(active, Math.max(0, results.length - 1))

  function select(to: string) {
    setQuery("")
    setActive(0)
    setFocused(false)
    inputRef.current?.blur()
    navigate(to)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const r = results[activeIndex]
      if (r) select(r.to)
    } else if (e.key === "Escape") {
      inputRef.current?.blur()
    }
  }

  return (
    <div role="search" className="relative ml-auto hidden w-full max-w-xs md:block">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        placeholder={t("header.searchPlaceholder")}
        aria-label={t("header.searchPlaceholder")}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
      />

      {open && (
        <div className="bg-popover text-popover-foreground absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border p-1 shadow-md">
          {!q && (
            <p className="text-muted-foreground px-2 pt-1 pb-0.5 text-[11px] font-semibold tracking-wide uppercase">
              {t("header.jumpTo")}
            </p>
          )}
          {results.map((d, i) => {
            const Icon = d.icon
            return (
              <button
                key={d.to}
                type="button"
                // Keep focus on the input so onBlur doesn't close before the click.
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => setActive(i)}
                onClick={() => select(d.to)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                  i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
              >
                <Icon className="text-muted-foreground size-4 shrink-0" />
                <span className="flex-1 truncate">{t(d.labelKey)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
