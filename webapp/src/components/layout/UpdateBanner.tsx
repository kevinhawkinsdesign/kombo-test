import * as React from "react"
import { RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"

// The main module script carries a content hash that changes on every deploy.
function loadedAssetName(): string | null {
  const el = document.querySelector(
    'script[type="module"][src*="/assets/index-"]'
  )
  return el?.getAttribute("src")?.split("/").pop() ?? null
}

async function deployedAssetName(): Promise<string | null> {
  try {
    const res = await fetch("./index.html", { cache: "no-store" })
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/assets\/(index-[^"']+\.js)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Non-intrusive "a new version is available" banner. Polls the deployed
 * index.html for a changed asset hash; when one ships, it invites the user to
 * refresh — but never forces it, so in-progress work isn't interrupted.
 * Two-phase interaction (default -> confirm) mirrors kombo-extension's
 * UpdateBar, reusing this app's own primary/secondary theme tokens instead of
 * the extension's hardcoded colors.
 */
export function UpdateBanner() {
  const { t } = useLocale()
  const [show, setShow] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)
  const [phase, setPhase] = React.useState<"default" | "confirm">("default")
  const loaded = React.useRef(loadedAssetName())

  React.useEffect(() => {
    if (!import.meta.env.PROD || !loaded.current) return
    let active = true
    const check = async () => {
      const deployed = await deployedAssetName()
      if (active && deployed && deployed !== loaded.current) setShow(true)
    }
    const timeout = setTimeout(check, 15000)
    const interval = setInterval(check, 60000)
    return () => {
      active = false
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  if (!show || dismissed) return null

  return (
    <div className="bg-primary text-primary-foreground flex items-center justify-center gap-3 px-4 py-2 text-sm">
      <RefreshCw className="size-4 shrink-0" />
      {phase === "default" ? (
        <>
          <span className="font-medium">{t("update.available")}</span>
          <span className="text-primary-foreground/70 hidden sm:inline">
            {t("update.subtitle")}
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="h-7"
            onClick={() => setPhase("confirm")}
          >
            {t("update.cta")}
          </Button>
        </>
      ) : (
        <>
          <span className="font-medium">{t("update.confirmTitle")}</span>
          <button
            type="button"
            onClick={() => setPhase("default")}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            {t("update.cancel")}
          </button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7"
            onClick={() => window.location.reload()}
          >
            {t("update.confirmCta")}
          </Button>
        </>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t("update.dismiss")}
        className="opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
