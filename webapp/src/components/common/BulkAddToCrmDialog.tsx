import * as React from "react"
import { Building2 } from "lucide-react"

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
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { CONNECTED_CRM_PROVIDER } from "@/lib/mock-depth"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    title: (n: number) => `Add ${n} to ${CONNECTED_CRM_PROVIDER.name}`,
    desc: (crm: string) => `Push the selected records to ${crm} as new records.`,
    ownerLabel: "Owner",
    ownerHint: "Who owns these records in your CRM.",
    crmDefaultOwner: "CRM default owner",
    cancel: "Cancel",
    confirm: "Add to CRM",
  },
  es: {
    title: (n: number) => `Añadir ${n} a ${CONNECTED_CRM_PROVIDER.name}`,
    desc: (crm: string) => `Envía los registros seleccionados a ${crm} como registros nuevos.`,
    ownerLabel: "Responsable",
    ownerHint: "Quién será el responsable de estos registros en tu CRM.",
    crmDefaultOwner: "Responsable por defecto del CRM",
    cancel: "Cancelar",
    confirm: "Añadir al CRM",
  },
  it: {
    title: (n: number) => `Aggiungi ${n} a ${CONNECTED_CRM_PROVIDER.name}`,
    desc: (crm: string) => `Invia i record selezionati a ${crm} come nuovi record.`,
    ownerLabel: "Proprietario",
    ownerHint: "Chi sarà il proprietario di questi record nel tuo CRM.",
    crmDefaultOwner: "Proprietario predefinito del CRM",
    cancel: "Annulla",
    confirm: "Aggiungi al CRM",
  },
  fr: {
    title: (n: number) => `Ajouter ${n} à ${CONNECTED_CRM_PROVIDER.name}`,
    desc: (crm: string) => `Envoyer les fiches sélectionnées vers ${crm} comme nouvelles fiches.`,
    ownerLabel: "Propriétaire",
    ownerHint: "Qui sera propriétaire de ces fiches dans votre CRM.",
    crmDefaultOwner: "Propriétaire par défaut du CRM",
    cancel: "Annuler",
    confirm: "Ajouter au CRM",
  },
  de: {
    title: (n: number) => `${n} zu ${CONNECTED_CRM_PROVIDER.name} hinzufügen`,
    desc: (crm: string) => `Sendet die ausgewählten Datensätze als neue Datensätze an ${crm}.`,
    ownerLabel: "Owner",
    ownerHint: "Wem diese Datensätze in deinem CRM gehören.",
    crmDefaultOwner: "Standard-Owner des CRM",
    cancel: "Abbrechen",
    confirm: "Zum CRM hinzufügen",
  },
  pt: {
    title: (n: number) => `Adicionar ${n} ao ${CONNECTED_CRM_PROVIDER.name}`,
    desc: (crm: string) => `Envia os registos selecionados para o ${crm} como novos registos.`,
    ownerLabel: "Proprietário",
    ownerHint: "Quem é o proprietário destes registos no seu CRM.",
    crmDefaultOwner: "Proprietário predefinido do CRM",
    cancel: "Cancelar",
    confirm: "Adicionar ao CRM",
  },
  pt_BR: {
    title: (n: number) => `Adicionar ${n} ao ${CONNECTED_CRM_PROVIDER.name}`,
    desc: (crm: string) => `Envia os registros selecionados para o ${crm} como novos registros.`,
    ownerLabel: "Proprietário",
    ownerHint: "Quem é o proprietário desses registros no seu CRM.",
    crmDefaultOwner: "Proprietário padrão do CRM",
    cancel: "Cancelar",
    confirm: "Adicionar ao CRM",
  },
} as const

/**
 * Lightweight bulk counterpart to the per-row "Add to CRM" wizard
 * (CrmExportDialog): this app only ever has one connected CRM, so there's
 * nothing to map or pick per-record — just confirm an owner and push the
 * whole selection in one go, mirroring the "crm" destination already offered
 * inside ExportDialog but as its own first-class bulk-bar action.
 */
export function BulkAddToCrmDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  count: number
  onConfirm: (ownerId: string | undefined) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [ownerId, setOwnerId] = React.useState<string | undefined>(undefined)

  // Reset the form whenever the dialog transitions to open — the house
  // pattern every other dialog uses, rather than resetting on close.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setOwnerId(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title(count)}</DialogTitle>
          <DialogDescription>{c.desc(CONNECTED_CRM_PROVIDER.name)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{c.ownerLabel}</Label>
          <AssigneePicker
            value={ownerId}
            onChange={setOwnerId}
            unassignedLabel={c.crmDefaultOwner}
          />
          <p className="text-muted-foreground text-xs">{c.ownerHint}</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button
            variant="volt"
            onClick={() => {
              onConfirm(ownerId)
              onOpenChange(false)
            }}
          >
            <Building2 className="size-4" />
            {c.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
