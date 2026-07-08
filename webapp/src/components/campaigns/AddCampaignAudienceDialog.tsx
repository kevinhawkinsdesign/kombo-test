import * as React from "react"
import { toast } from "sonner"
import { Search, Link2, Users, Building2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { SearchCombobox } from "@/components/common/SearchCombobox"
import { Segmented } from "@/components/common/Segmented"
import { useLists, listStore, campaignStore } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import type { Campaign } from "@/lib/types"

type Entity = "people" | "company"

const COPY = {
  en: {
    title: "Add prospects or companies",
    desc: (name: string) => `Add prospects or companies to "${name}".`,
    attachExisting: "Link an existing list",
    pickList: "Choose a list to link…",
    attach: "Link",
    or: "or",
    searchNew: "Search to build a new list",
    searchNewDesc:
      "Run a search or import — the results become a new list linked to this campaign.",
    linkedElsewhere: " (linked elsewhere)",
    companyList: " (companies)",
    attached: (name: string) => `Linked ${name}`,
    cancel: "Cancel",
    contact: "Prospects",
    company: "Companies",
  },
  es: {
    title: "Añadir prospectos o empresas",
    desc: (name: string) => `Añade prospectos o empresas a "${name}".`,
    attachExisting: "Vincular una lista existente",
    pickList: "Elige una lista para vincular…",
    attach: "Vincular",
    or: "o",
    searchNew: "Buscar para crear una lista nueva",
    searchNewDesc:
      "Lanza una búsqueda o importación — los resultados se convierten en una lista nueva vinculada a esta campaña.",
    linkedElsewhere: " (vinculada en otro lugar)",
    companyList: " (empresas)",
    attached: (name: string) => `${name} vinculada`,
    cancel: "Cancelar",
    contact: "Prospectos",
    company: "Empresas",
  },
} as const

// The campaign's own "Add prospects" entry point (header button + the
// Prospects-tab empty state). A campaign's prospects always come from its
// one attached list, so this either (a) sends new search results straight
// into the list already attached, or — when nothing's attached yet — first
// asks whether to attach one of the workspace's existing lists or build a
// fresh one via the full search/import experience.
export function AddCampaignAudienceDialog({
  open,
  onOpenChange,
  campaign,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const lists = useLists()

  const [chooserOpen, setChooserOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [targetListId, setTargetListId] = React.useState<string | null>(null)
  const [pickListId, setPickListId] = React.useState("")
  const [entity, setEntity] = React.useState<Entity>("people")

  const attachedList = lists.find((l) => l.id === campaign.listId)

  // Route on open (render-time check, house pattern) — skip straight to the
  // search when a list is already attached; otherwise ask how to get one.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPickListId("")
      setEntity(attachedList?.kind === "company" ? "company" : "people")
      if (attachedList) {
        setTargetListId(attachedList.id)
        setChooserOpen(false)
        setSearchOpen(true)
      } else {
        setTargetListId(null)
        setChooserOpen(true)
        setSearchOpen(false)
      }
    }
  }

  function attachExisting() {
    if (!pickListId) return
    const target = lists.find((l) => l.id === pickListId)
    campaignStore.attachList(campaign.id, pickListId)
    toast.success(target ? c.attached(target.name) : c.attach)
    onOpenChange(false)
  }

  function searchNewList() {
    const list = listStore.create({
      name: campaign.name,
      description: "",
      color: "#6366f1",
      kind: entity,
    })
    campaignStore.attachList(campaign.id, list.id)
    setTargetListId(list.id)
    setChooserOpen(false)
    setSearchOpen(true)
  }

  return (
    <>
      {/* Content unmounts while the full-screen search is open — two
          simultaneously-open Radix Dialog roots otherwise dismiss each
          other on outside interaction. */}
      <Dialog open={open && chooserOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="text-primary size-5" />
              {c.title}
            </DialogTitle>
            <DialogDescription>{c.desc(campaign.name)}</DialogDescription>
          </DialogHeader>

          {lists.length > 0 && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">{c.attachExisting}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <SearchCombobox
                    value={pickListId}
                    onChange={setPickListId}
                    options={lists.map((l) => ({
                      value: l.id,
                      label: l.name,
                      sublabel:
                        l.campaignId && l.campaignId !== campaign.id
                          ? c.linkedElsewhere
                          : l.kind === "company"
                            ? c.companyList
                            : undefined,
                    }))}
                    placeholder={c.pickList}
                    searchPlaceholder={c.pickList}
                    emptyText={c.pickList}
                    className="w-full sm:w-64"
                  />
                  <Button disabled={!pickListId} onClick={attachExisting}>
                    {c.attach}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs uppercase">
                  {c.or}
                </span>
                <Separator className="flex-1" />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Segmented
              options={[
                { v: "people" as Entity, label: c.contact, icon: Users },
                { v: "company" as Entity, label: c.company, icon: Building2 },
              ]}
              value={entity}
              onChange={setEntity}
            />
            <Button variant="outline" onClick={searchNewList}>
              <Search className="size-4" />
              {c.searchNew}
            </Button>
            <p className="text-muted-foreground text-xs">{c.searchNewDesc}</p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {c.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddRecordsDialog
        open={open && searchOpen}
        onOpenChange={(v) => {
          setSearchOpen(v)
          if (!v) onOpenChange(false)
        }}
        kind={entity === "company" ? "company" : "contact"}
        listId={targetListId ?? undefined}
      />
    </>
  )
}
