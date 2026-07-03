import * as React from "react"
import { useNavigate } from "react-router-dom"

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
