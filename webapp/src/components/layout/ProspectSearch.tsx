import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale"

const SEARCH_PATH = "/search"

/** Global ⌘K / Ctrl+K shortcut that opens the prospect search page. */
export function ProspectSearch() {
  const navigate = useNavigate()

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        navigate(SEARCH_PATH)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [navigate])

  return null
}

/** Sidebar entry point — opens the prospect search page. */
export function ProspectSearchTrigger({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const navigate = useNavigate()
  const { t } = useLocale()

  function open() {
    onNavigate?.()
    navigate(SEARCH_PATH)
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground mx-auto flex size-9"
            aria-label={`${t("search.navLabel")} (⌘K)`}
            onClick={open}
          >
            <Search className="size-5" strokeWidth={2.25} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{t("search.navLabel")} · ⌘K</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      type="button"
      onClick={open}
      className="border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent/60 flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm transition-colors"
    >
      <Search className="text-sidebar-foreground size-4 shrink-0" />
      <span className="text-sidebar-foreground/60 flex-1 text-left">{t("search.navLabel")}</span>
      <kbd className="border-sidebar-border bg-sidebar text-sidebar-foreground/50 hidden rounded border px-1.5 py-0.5 text-[10px] font-medium lg:inline-block">
        ⌘K
      </kbd>
    </button>
  )
}
