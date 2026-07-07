import * as React from "react"
import { toast } from "sonner"
import { Search, Link2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { useLists, listStore, campaignStore } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import type { Campaign } from "@/lib/types"

const COPY = {
  en: {
    title: "Add prospects",
    desc: (name: string) => `Add prospects to "${name}".`,
    attachExisting: "Attach an existing list",
    pickList: "Choose a list to attach…",
    attach: "Attach",
    or: "or",
    searchNew: "Search to build a new list",
    searchNewDesc:
      "Run a search or import — the results become a new list linked to this campaign.",
    linkedElsewhere: " (linked elsewhere)",
    attached: (name: string) => `Attached ${name}`,
    cancel: "Cancel",
  },
  es: {
    title: "Añadir prospectos",
    desc: (name: string) => `Añade prospectos a "${name}".`,
    attachExisting: "Vincular una lista existente",
    pickList: "Elige una lista para vincular…",
    attach: "Vincular",
    or: "o",
    searchNew: "Buscar para crear una lista nueva",
    searchNewDesc:
      "Lanza una búsqueda o importación — los resultados se convierten en una lista nueva vinculada a esta campaña.",
    linkedElsewhere: " (vinculada en otro lugar)",
    attached: (name: string) => `${name} vinculada`,
    cancel: "Cancelar",
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

  const attachedList = lists.find((l) => l.id === campaign.listId)

  // Route on open (render-time check, house pattern) — skip straight to the
  // search when a list is already attached; otherwise ask how to get one.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPickListId("")
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
      kind: "people",
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
                  <Select value={pickListId} onValueChange={setPickListId}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder={c.pickList} />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                          {l.campaignId && l.campaignId !== campaign.id
                            ? c.linkedElsewhere
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

          <Button variant="outline" onClick={searchNewList}>
            <Search className="size-4" />
            {c.searchNew}
          </Button>
          <p className="text-muted-foreground text-xs">{c.searchNewDesc}</p>

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
        kind="contact"
        listId={targetListId ?? undefined}
      />
    </>
  )
}
