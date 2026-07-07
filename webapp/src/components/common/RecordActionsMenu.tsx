import * as React from "react"
import { Link } from "react-router-dom"
import { MoreHorizontal, ExternalLink, FolderPlus, Send, Building2, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddToCollectionDialog } from "@/components/common/AddToCollectionDialog"
import { CrmExportDialog } from "@/components/common/CrmExportDialog"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { RecordKind } from "@/lib/crm-mapping"
import type { Account, Prospect } from "@/lib/types"

const COPY = {
  en: {
    actions: "Actions",
    viewProfile: "View profile",
    enrich: "Enrich",
    addToList: "Add to list",
    addToCampaign: "Add to campaign",
    addToCrm: "Add to CRM",
  },
  es: {
    actions: "Acciones",
    viewProfile: "Ver perfil",
    enrich: "Enriquecer",
    addToList: "Añadir a lista",
    addToCampaign: "Añadir a campaña",
    addToCrm: "Añadir al CRM",
  },
} as const

type Dialog = "list" | "campaign" | "crm" | "enrich" | null

// A page-specific action appended after the shared ones (e.g. "Remove from
// list" on a list's members table). Destructive actions render in the
// destructive tone, separated from the shared actions.
export interface RecordExtraAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
}

export function RecordActionsMenu({
  kind,
  record,
  className,
  extra,
}: {
  kind: RecordKind
  record: Prospect | Account
  className?: string
  extra?: RecordExtraAction
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [dialog, setDialog] = React.useState<Dialog>(null)

  const name =
    kind === "person"
      ? `${(record as Prospect).firstName} ${(record as Prospect).lastName}`
      : (record as Account).name
  const profilePath = kind === "person" ? `/prospects/${record.id}` : `/companies/${record.id}`

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-8", className)}
            aria-label={c.actions}
            onClick={(e) => {
              // Don't trigger an enclosing card/row navigation.
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={profilePath}>
              <ExternalLink className="size-4" />
              {c.viewProfile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {kind === "person" && (
            <DropdownMenuItem onClick={() => setDialog("enrich")}>
              <Layers className="size-4" />
              {c.enrich}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setDialog("list")}>
            <FolderPlus className="size-4" />
            {c.addToList}
          </DropdownMenuItem>
          {kind === "person" && (
            <DropdownMenuItem onClick={() => setDialog("campaign")}>
              <Send className="size-4" />
              {c.addToCampaign}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setDialog("crm")}>
            <Building2 className="size-4" />
            {c.addToCrm}
          </DropdownMenuItem>
          {extra && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant={extra.destructive ? "destructive" : undefined}
                onClick={extra.onClick}
              >
                {extra.icon}
                {extra.label}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {(dialog === "list" || dialog === "campaign") && (
        <AddToCollectionDialog
          open
          onOpenChange={(v) => !v && setDialog(null)}
          mode={dialog}
          recordKind={kind}
          recordId={record.id}
          recordName={name}
        />
      )}
      {dialog === "crm" && (
        <CrmExportDialog
          open
          onOpenChange={(v) => !v && setDialog(null)}
          recordKind={kind}
          record={record}
          recordName={name}
        />
      )}
      {dialog === "enrich" && kind === "person" && (
        <EnrichListDialog
          open
          onOpenChange={(v) => !v && setDialog(null)}
          prospects={[record as Prospect]}
        />
      )}
    </>
  )
}
