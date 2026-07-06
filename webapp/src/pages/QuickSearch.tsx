import { useNavigate } from "react-router-dom"

import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"

/**
 * Sidebar "Search" entry point: opens the Add-records modal on its usual
 * splash landing (Search vs Guide me), with the entity toggle visible since
 * this is an unscoped entry point (not tied to a specific list/account).
 * Kept distinct from "Signals" (the AI-suggestion feed at /search).
 */
export default function QuickSearch() {
  const navigate = useNavigate()

  return (
    <AddRecordsDialog
      open
      onOpenChange={(v) => {
        if (!v) navigate(-1)
      }}
      kind="contact"
      allowEntityToggle
    />
  )
}
