import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

// A page-level "back" affordance that always returns to the same fixed
// parent index page (e.g. a list detail page always goes back to all
// lists) — not browser history, which can land the user somewhere
// unrelated depending on how they navigated in.
export function BackLink({
  to,
  label,
  variant = "ghost",
}: {
  to: string
  label: string
  variant?: "ghost" | "link"
}) {
  if (variant === "link") {
    return (
      <Button variant="link" asChild className="px-0">
        <Link to={to}>{label}</Link>
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
      <Link to={to}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  )
}
