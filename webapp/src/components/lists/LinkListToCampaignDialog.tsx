import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Link2, Plus } from "lucide-react"

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
import { SearchCombobox } from "@/components/common/SearchCombobox"
import { useCampaigns, campaignStore } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import type { ProspectList } from "@/lib/types"

const COPY = {
  en: {
    title: "Link to campaign",
    desc: (name: string) =>
      `Link "${name}" to a campaign — that's where the sequence and message templates live.`,
    pickExisting: "Link an existing campaign",
    pickCampaign: "Choose a campaign to link…",
    link: "Link",
    or: "or",
    createNew: "Create a new campaign",
    createNewDesc: (name: string) =>
      `Starts a new campaign named "${name}", already linked to this list.`,
    linkedElsewhere: " (linked to another list)",
    linked: (name: string) => `Linked to ${name}`,
    cancel: "Cancel",
  },
  es: {
    title: "Vincular a campaña",
    desc: (name: string) =>
      `Vincula "${name}" a una campaña — ahí viven la secuencia y las plantillas de mensajes.`,
    pickExisting: "Vincular una campaña existente",
    pickCampaign: "Elige una campaña para vincular…",
    link: "Vincular",
    or: "o",
    createNew: "Crear una nueva campaña",
    createNewDesc: (name: string) =>
      `Crea una nueva campaña llamada "${name}", ya vinculada a esta lista.`,
    linkedElsewhere: " (vinculada a otra lista)",
    linked: (name: string) => `Vinculada a ${name}`,
    cancel: "Cancelar",
  },
} as const

// The list's own entry point to a campaign — the mirror of
// AddCampaignAudienceDialog (which links a list from the campaign side). A
// list has no sequence/sending logic of its own; linking is how it gets one.
export function LinkListToCampaignDialog({
  open,
  onOpenChange,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: ProspectList
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const campaigns = useCampaigns()
  const [pickCampaignId, setPickCampaignId] = React.useState("")

  // Reset on open (render-time check, house pattern).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPickCampaignId("")
  }

  function linkExisting() {
    if (!pickCampaignId) return
    const target = campaigns.find((cm) => cm.id === pickCampaignId)
    campaignStore.attachList(pickCampaignId, list.id)
    toast.success(target ? c.linked(target.name) : c.link)
    onOpenChange(false)
    navigate(`/campaigns/${pickCampaignId}`)
  }

  function createAndLink() {
    const created = campaignStore.create({ name: list.name, locale })
    campaignStore.attachList(created.id, list.id)
    toast.success(c.linked(created.name))
    onOpenChange(false)
    navigate(`/campaigns/${created.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="text-primary size-5" />
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.desc(list.name)}</DialogDescription>
        </DialogHeader>

        {campaigns.length > 0 && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">{c.pickExisting}</p>
              <div className="flex flex-wrap items-center gap-2">
                <SearchCombobox
                  value={pickCampaignId}
                  onChange={setPickCampaignId}
                  options={campaigns.map((cm) => ({
                    value: cm.id,
                    label: cm.name,
                    sublabel:
                      cm.listId && cm.listId !== list.id
                        ? c.linkedElsewhere
                        : undefined,
                  }))}
                  placeholder={c.pickCampaign}
                  searchPlaceholder={c.pickCampaign}
                  emptyText={c.pickCampaign}
                  className="w-full sm:w-64"
                />
                <Button disabled={!pickCampaignId} onClick={linkExisting}>
                  {c.link}
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

        <Button variant="outline" onClick={createAndLink}>
          <Plus className="size-4" />
          {c.createNew}
        </Button>
        <p className="text-muted-foreground text-xs">
          {c.createNewDesc(list.name)}
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
