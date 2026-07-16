import * as React from "react"
import { useNavigate } from "react-router-dom"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { hasUnsavedChanges } from "@/lib/unsaved-changes"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    title: "Discard unsaved changes?",
    description:
      "You have sequence edits that haven't been applied yet. Leaving this page will lose them.",
    confirm: "Discard and leave",
    cancel: "Stay on this page",
  },
  es: {
    title: "¿Descartar los cambios sin aplicar?",
    description:
      "Tienes ediciones de la secuencia que aún no se han aplicado. Si sales de esta página se perderán.",
    confirm: "Descartar y salir",
    cancel: "Quedarme en esta página",
  },
  it: {
    title: "Scartare le modifiche non salvate?",
    description:
      "Hai modifiche alla sequenza non ancora applicate. Se esci da questa pagina andranno perse.",
    confirm: "Scarta ed esci",
    cancel: "Resta in questa pagina",
  },
  fr: {
    title: "Abandonner les modifications non enregistrées ?",
    description:
      "Vous avez des modifications de séquence qui n'ont pas encore été appliquées. Si vous quittez cette page, elles seront perdues.",
    confirm: "Abandonner et quitter",
    cancel: "Rester sur cette page",
  },
  de: {
    title: "Nicht gespeicherte Änderungen verwerfen?",
    description:
      "Du hast Sequenz-Änderungen, die noch nicht übernommen wurden. Wenn du diese Seite verlässt, gehen sie verloren.",
    confirm: "Verwerfen und verlassen",
    cancel: "Auf dieser Seite bleiben",
  },
  pt: {
    title: "Descartar as alterações não guardadas?",
    description:
      "Tem edições da sequência que ainda não foram aplicadas. Se sair desta página, elas serão perdidas.",
    confirm: "Descartar e sair",
    cancel: "Ficar nesta página",
  },
  pt_BR: {
    title: "Descartar as alterações não salvas?",
    description:
      "Você tem edições da sequência que ainda não foram aplicadas. Se você sair desta página, elas serão perdidas.",
    confirm: "Descartar e sair",
    cancel: "Ficar nesta página",
  },
} as const

// Mounted once in AppLayout — intercepts in-app link clicks (and warns on
// reload/close) while a Sequence-tab draft has unapplied changes. Only
// covers <Link>-rendered anchors and the native reload/close prompt; the
// browser's physical Back/Forward buttons aren't intercepted (reversing a
// history navigation after the fact is unreliable across browsers), so
// those still discard silently — an accepted v1 gap.
export function UnsavedChangesGuard() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const [pendingTo, setPendingTo] = React.useState<string | null>(null)

  React.useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!hasUnsavedChanges()) return
      e.preventDefault()
    }
    function handleClick(e: MouseEvent) {
      if (!hasUnsavedChanges()) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a")
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return
      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("http")) return
      // A hash-routed path (e.g. "#/campaigns/cm_2") vs a same-page anchor
      // like "#main-content" — only the former is real in-app navigation.
      if (href.startsWith("#") && !href.startsWith("#/")) return
      e.preventDefault()
      e.stopPropagation()
      setPendingTo(href.startsWith("#/") ? href.slice(1) : href)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("click", handleClick, true)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("click", handleClick, true)
    }
  }, [])

  return (
    <ConfirmDialog
      open={pendingTo !== null}
      onOpenChange={(open) => {
        if (!open) setPendingTo(null)
      }}
      title={c.title}
      description={c.description}
      confirmLabel={c.confirm}
      cancelLabel={c.cancel}
      destructive
      onConfirm={() => {
        if (pendingTo) navigate(pendingTo)
        setPendingTo(null)
      }}
    />
  )
}
