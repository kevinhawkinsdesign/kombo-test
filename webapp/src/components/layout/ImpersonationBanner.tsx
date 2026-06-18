import { Eye, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useView } from "@/lib/view-context"
import { useLocale } from "@/lib/locale"

export function ImpersonationBanner() {
  const { impersonating, exitImpersonation } = useView()
  const { t } = useLocale()
  if (!impersonating) return null

  return (
    <div className="bg-primary text-primary-foreground flex items-center justify-center gap-3 px-4 py-2 text-sm">
      <Eye className="size-4" />
      <span>
        {t("banner.viewingAs")}{" "}
        <span className="font-semibold">{impersonating.name}</span> ·{" "}
        {impersonating.role}
      </span>
      <Button
        size="sm"
        variant="secondary"
        className="ml-2 h-7"
        onClick={exitImpersonation}
      >
        <X className="size-3.5" />
        {t("common.exit")}
      </Button>
    </div>
  )
}
