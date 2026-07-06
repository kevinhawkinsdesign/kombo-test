import { useNavigate } from "react-router-dom"

import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"

/**
 * Sidebar "AI Search" entry point: opens the Add-records modal on its usual
 * splash landing (Search vs Guide me), with the entity toggle visible since
 * — unlike every other entry point — this one has no scoped context to lock
 * it to.
 */
export default function AiSearch() {
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
