import {
  Download,
  Sparkles,
  FolderPlus,
  Send,
  ScanSearch,
  UserSearch,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PerCompanyCap } from "@/components/common/PerCompanyCap"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    selected: (n: number) => `${n} selected`,
    export: "Export",
    enrich: "Enrich",
    addToList: "Add to list",
    addToCampaign: "Add to campaign",
    lookalikes: "Find lookalikes",
    findContacts: "Find contacts",
    clear: "Clear",
    capLabel: "Max / company",
    capNoLimit: "No limit",
  },
  es: {
    selected: (n: number) => `${n} seleccionados`,
    export: "Exportar",
    enrich: "Enriquecer",
    addToList: "Añadir a lista",
    addToCampaign: "Añadir a campaña",
    lookalikes: "Buscar similares",
    findContacts: "Buscar contactos",
    clear: "Limpiar",
    capLabel: "Máx / empresa",
    capNoLimit: "Sin límite",
  },
} as const

/**
 * Floating action bar for multi-selected rows. Appears once a selection
 * exists. `onAddToCampaign` is optional — companies don't enroll in campaigns.
 */
export function BulkActionsBar({
  count,
  capNote,
  perCompanyCap,
  onPerCompanyCapChange,
  onClear,
  onExport,
  onEnrich,
  onAddToList,
  onAddToCampaign,
  onLookalikes,
  onFindContacts,
}: {
  count: number
  // Shown above the buttons when the selection exceeds the add-to-list cap.
  capNote?: string
  // People only: cap how many of the selected contacts come from each company.
  perCompanyCap?: number | null
  onPerCompanyCapChange?: (v: number | null) => void
  onClear: () => void
  onExport: () => void
  onEnrich: () => void
  onAddToList: () => void
  onAddToCampaign?: () => void
  onLookalikes: () => void
  // Companies only: find people at the selected accounts.
  onFindContacts?: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  if (count === 0) return null

  return (
    <div className="bg-background sticky bottom-4 z-20 mt-3 flex flex-col gap-1.5 rounded-xl border p-2 shadow-lg">
      {capNote && (
        <p className="text-muted-foreground px-2 text-xs">{capNote}</p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
      <span className="px-2 text-sm font-medium tabular-nums">
        {c.selected(count)}
      </span>
      {onPerCompanyCapChange && (
        <>
          <span className="bg-border mx-1 h-5 w-px" />
          <PerCompanyCap
            value={perCompanyCap ?? null}
            onChange={onPerCompanyCapChange}
            label={c.capLabel}
            offLabel={c.capNoLimit}
            ariaLabel={c.capLabel}
          />
        </>
      )}
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
      {onFindContacts && (
        <Button variant="outline" size="sm" onClick={onFindContacts}>
          <UserSearch className="size-4" />
          {c.findContacts}
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
    </div>
  )
}
