import { ArrowLeft } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"

// A page-level "back" affordance that returns to wherever the user actually
// came from (browser history) instead of a hardcoded destination — a user
// arriving at a detail page from a campaign, a list, an inbox thread, etc.
// should land back there, not on some fixed index page. Falls back to
// `to`/`label` only when there's no in-app history to go back to (the page
// was opened directly from a bookmark or shared link), since there's nowhere
// to send a browser-history back in that case.
export function BackLink({
  to,
  label,
  variant = "ghost",
}: {
  to: string
  label: string
  variant?: "ghost" | "link"
}) {
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const hasHistory = location.key !== "default"

  if (variant === "link") {
    return hasHistory ? (
      <Button variant="link" className="px-0" onClick={() => navigate(-1)}>
        {t("common.back")}
      </Button>
    ) : (
      <Button variant="link" asChild className="px-0">
        <Link to={to}>{label}</Link>
      </Button>
    )
  }

  return hasHistory ? (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4 -ml-2"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="size-4" />
      {t("common.back")}
    </Button>
  ) : (
    <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
      <Link to={to}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  )
}
