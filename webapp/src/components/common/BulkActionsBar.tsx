import { Download, Sparkles, FolderPlus, Send, ScanSearch, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    selected: (n: number) => `${n} selected`,
    export: "Export",
    enrich: "Enrich",
    addToList: "Add to list",
    addToCampaign: "Add to campaign",
    lookalikes: "Find lookalikes",
    clear: "Clear",
  },
  es: {
    selected: (n: number) => `${n} seleccionados`,
    export: "Exportar",
    enrich: "Enriquecer",
    addToList: "Añadir a lista",
    addToCampaign: "Añadir a campaña",
    lookalikes: "Buscar similares",
    clear: "Limpiar",
  },
} as const

/**
 * Floating action bar for multi-selected rows. Appears once a selection
 * exists. `onAddToCampaign` is optional — companies don't enroll in campaigns.
 */
export function BulkActionsBar({
  count,
  onClear,
  onExport,
  onEnrich,
  onAddToList,
  onAddToCampaign,
  onLookalikes,
}: {
  count: number
  onClear: () => void
  onExport: () => void
  onEnrich: () => void
  onAddToList: () => void
  onAddToCampaign?: () => void
  onLookalikes: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  if (count === 0) return null

  return (
    <div className="bg-background sticky bottom-4 z-20 mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border p-2 shadow-lg">
      <span className="px-2 text-sm font-medium tabular-nums">
        {c.selected(count)}
      </span>
      <span className="bg-border mx-1 h-5 w-px" />
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="size-4" />
        {c.export}
      </Button>
      <Button variant="outline" size="sm" onClick={onEnrich}>
        <Sparkles className="size-4" />
        {c.enrich}
      </Button>
      <Button variant="outline" size="sm" onClick={onAddToList}>
        <FolderPlus className="size-4" />
        {c.addToList}
      </Button>
      {onAddToCampaign && (
        <Button variant="outline" size="sm" onClick={onAddToCampaign}>
          <Send className="size-4" />
          {c.addToCampaign}
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onLookalikes}>
        <ScanSearch className="size-4" />
        {c.lookalikes}
      </Button>
      <Button variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
        <X className="size-4" />
        {c.clear}
      </Button>
    </div>
  )
}
