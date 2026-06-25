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

/** Sidebar primary CTA — opens the prospect search page. */
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
            variant="volt"
            size="icon"
            className="mx-auto flex"
            aria-label={t("nav.search")}
            onClick={open}
          >
            <Search className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{t("nav.search")}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button variant="volt" size="sm" className="w-full justify-start gap-2" onClick={open}>
      <Search className="size-4" />
      {t("nav.search")}
    </Button>
  )
}
