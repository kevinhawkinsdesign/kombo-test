import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  MoreHorizontal,
  ExternalLink,
  FolderPlus,
  Building2,
  Layers,
  UserSearch,
  ScanSearch,
  Ban,
} from "lucide-react"

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
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { blacklistStore } from "@/lib/store"
import type { RecordKind } from "@/lib/crm-mapping"
import type { Account, Prospect } from "@/lib/types"

const COPY = {
  en: {
    actions: "Actions",
    viewProfile: "View profile",
    enrich: "Enrich",
    addToList: "Add to list",
    addToCrm: "Add to CRM",
    findProspects: "Find prospects",
    addToBlacklist: "Add to blacklist",
    blacklistedToast: (name: string) => `${name} added to blacklist`,
    findLookalikes: "Find lookalikes",
  },
  es: {
    actions: "Acciones",
    viewProfile: "Ver perfil",
    enrich: "Enriquecer",
    addToList: "Añadir a lista",
    addToCrm: "Añadir al CRM",
    findProspects: "Buscar prospectos",
    addToBlacklist: "Añadir a lista negra",
    blacklistedToast: (name: string) => `${name} añadido a la lista negra`,
    findLookalikes: "Buscar similares",
  },
} as const

type Dialog = "list" | "crm" | "enrich" | "findProspects" | null

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
  const navigate = useNavigate()
  const [dialog, setDialog] = React.useState<Dialog>(null)

  const name =
    kind === "person"
      ? `${(record as Prospect).firstName} ${(record as Prospect).lastName}`
      : (record as Account).name
  const profilePath = kind === "person" ? `/prospects/${record.id}` : `/companies/${record.id}`

  // Lookalike is a kind of search — hand the seed to the Search page.
  function findLookalikes() {
    if (kind === "person") {
      const p = record as Prospect
      navigate("/search", {
        state: {
          lookalikeSeed: {
            id: p.id,
            kind: "person",
            name: `${p.firstName} ${p.lastName}`,
            sub: `${p.title} @ ${p.company}`,
            industry: p.industry,
            region: "",
            headcount: p.headcount,
          },
        },
      })
    }
  }

  function addToBlacklist() {
    const a = record as Account
    blacklistStore.add({ name: a.name, domain: a.domain, reason: "Manual" })
    toast.success(c.blacklistedToast(a.name))
  }

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
          {kind === "person" && (
            <DropdownMenuItem onClick={findLookalikes}>
              <ScanSearch className="size-4" />
              {c.findLookalikes}
            </DropdownMenuItem>
          )}
          {kind === "company" && (
            <DropdownMenuItem onClick={() => setDialog("findProspects")}>
              <UserSearch className="size-4" />
              {c.findProspects}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setDialog("list")}>
            <FolderPlus className="size-4" />
            {c.addToList}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("crm")}>
            <Building2 className="size-4" />
            {c.addToCrm}
          </DropdownMenuItem>
          {kind === "company" && (
            <DropdownMenuItem onClick={addToBlacklist}>
              <Ban className="size-4" />
              {c.addToBlacklist}
            </DropdownMenuItem>
          )}
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

      {dialog === "list" && (
        <AddToCollectionDialog
          open
          onOpenChange={(v) => !v && setDialog(null)}
          mode="list"
          recordKind={kind}
          recordId={record.id}
          recordName={name}
        />
      )}
      {dialog === "findProspects" && kind === "company" && (
        <AddRecordsDialog
          open
          onOpenChange={(v) => !v && setDialog(null)}
          kind="contact"
          scopeCompanies={[(record as Account).name]}
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
