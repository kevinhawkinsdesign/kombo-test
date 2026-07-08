import * as React from "react"
import { toast } from "sonner"
import { Plug } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { integrations } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    title: (n: number) => `Sync ${n} to CRM`,
    desc: "Choose a CRM and an owner — the same mapping applies to every selected record.",
    crmLabel: "CRM",
    ownerLabel: "Record owner",
    noOwner: "Unassigned",
    cancel: "Cancel",
    syncAction: "Sync",
    synced: (n: number, crm: string) => `${n} synced to ${crm}`,
  },
  es: {
    title: (n: number) => `Sincronizar ${n} con el CRM`,
    desc: "Elige un CRM y un propietario — la misma asignación se aplica a todos los registros seleccionados.",
    crmLabel: "CRM",
    ownerLabel: "Propietario del registro",
    noOwner: "Sin asignar",
    cancel: "Cancelar",
    syncAction: "Sincronizar",
    synced: (n: number, crm: string) => `${n} sincronizados con ${crm}`,
  },
} as const

const CRM_INTEGRATIONS = integrations.filter((i) => i.category === "crm")

/**
 * Lightweight bulk CRM push: pick a CRM + owner once, apply it to every
 * selected record. Unlike the single-record CrmExportDialog/AddToCrmDialog,
 * there's no per-record field mapping — mapping the same handful of fields
 * for N different records at once wouldn't mean anything.
 */
export function BulkCrmSyncDialog({
  open,
  onOpenChange,
  count,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  count: number
  onDone?: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [crmId, setCrmId] = React.useState(CRM_INTEGRATIONS[0]?.id ?? "")
  const [ownerId, setOwnerId] = React.useState<string | undefined>(undefined)

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCrmId(CRM_INTEGRATIONS[0]?.id ?? "")
      setOwnerId(undefined)
    }
  }

  const crm = CRM_INTEGRATIONS.find((i) => i.id === crmId)

  function sync() {
    toast.success(c.synced(count, crm?.name ?? ""))
    onOpenChange(false)
    onDone?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title(count)}</DialogTitle>
          <DialogDescription>{c.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{c.crmLabel}</Label>
          <Select value={crmId} onValueChange={setCrmId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRM_INTEGRATIONS.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{c.ownerLabel}</Label>
          <AssigneePicker
            value={ownerId}
            onChange={setOwnerId}
            unassignedLabel={c.noOwner}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={sync} disabled={!crmId}>
            <Plug className="size-4" />
            {c.syncAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
