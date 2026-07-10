import type * as React from "react"
import {
  Download,
  Layers,
  FolderPlus,
  FolderInput,
  ScanSearch,
  UserSearch,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PerCompanyCap } from "@/components/common/PerCompanyCap"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale"
import { CRM_PROVIDERS } from "@/lib/mock-depth"

// The button shows this CRM's logo — the one a bulk push actually lands in
// today. Falls back to the catalog's first entry if nothing is connected.
const crmLogoProvider =
  CRM_PROVIDERS.find((provider) => provider.connected) ?? CRM_PROVIDERS[0]

const COPY = {
  en: {
    selected: (n: number) => `${n} selected`,
    export: "Export",
    enrich: "Enrich",
    addToList: "Add to list",
    moveToList: "Move to list",
    addToCrm: "Add to CRM",
    lookalikes: "Find lookalikes",
    findContacts: "Find prospects",
    clear: "Clear",
    capLabel: "Max / company",
    capNoLimit: "No limit",
  },
  es: {
    selected: (n: number) => `${n} seleccionados`,
    export: "Exportar",
    enrich: "Enriquecer",
    addToList: "Añadir a lista",
    moveToList: "Mover a lista",
    addToCrm: "Añadir al CRM",
    lookalikes: "Buscar similares",
    findContacts: "Buscar prospectos",
    clear: "Limpiar",
    capLabel: "Máx / empresa",
    capNoLimit: "Sin límite",
  },
} as const

// A page-specific action (e.g. "Remove from list") appended after the shared
// ones. Icon is optional; destructive renders it in the destructive tone.
export interface BulkExtraAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
}

/**
 * Floating action bar for multi-selected rows. Appears once a selection
 * exists. Every action except Export/Clear is optional so each surface shows
 * only what applies there (e.g. companies don't enroll in campaigns; a list's
 * own members don't re-add to it).
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
  onMoveToList,
  onAddToCrm,
  onLookalikes,
  onFindContacts,
  extra,
}: {
  count: number
  // Shown above the buttons when the selection exceeds the add-to-list cap.
  capNote?: string
  // People only: cap how many of the selected contacts come from each company.
  perCompanyCap?: number | null
  onPerCompanyCapChange?: (v: number | null) => void
  onClear: () => void
  onExport: () => void
  onEnrich?: () => void
  onAddToList?: () => void
  // Moves the selection into another list, removing it from the current one.
  onMoveToList?: () => void
  onAddToCrm?: () => void
  onLookalikes?: () => void
  // Companies only: find people at the selected accounts.
  onFindContacts?: () => void
  extra?: BulkExtraAction
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
      {onEnrich && (
        <Button variant="outline" size="sm" onClick={onEnrich}>
          <Layers className="size-4" />
          {c.enrich}
        </Button>
      )}
      {onAddToList && (
        <Button variant="outline" size="sm" onClick={onAddToList}>
          <FolderPlus className="size-4" />
          {c.addToList}
        </Button>
      )}
      {onMoveToList && (
        <Button variant="outline" size="sm" onClick={onMoveToList}>
          <FolderInput className="size-4" />
          {c.moveToList}
        </Button>
      )}
      {onAddToCrm && crmLogoProvider && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddToCrm}
              aria-label={c.addToCrm}
            >
              <span
                className="flex size-5 items-center justify-center rounded-sm text-[11px] font-semibold text-white"
                style={{ backgroundColor: crmLogoProvider.logoColor }}
              >
                {crmLogoProvider.name.charAt(0)}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{c.addToCrm}</TooltipContent>
        </Tooltip>
      )}
      {onFindContacts && (
        <Button variant="outline" size="sm" onClick={onFindContacts}>
          <UserSearch className="size-4" />
          {c.findContacts}
        </Button>
      )}
      {onLookalikes && (
        <Button variant="outline" size="sm" onClick={onLookalikes}>
          <ScanSearch className="size-4" />
          {c.lookalikes}
        </Button>
      )}
      {extra && (
        <Button
          variant="outline"
          size="sm"
          className={extra.destructive ? "text-destructive" : undefined}
          onClick={extra.onClick}
        >
          {extra.icon}
          {extra.label}
        </Button>
      )}
      <Button variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
        <X className="size-4" />
        {c.clear}
      </Button>
      </div>
    </div>
  )
}
