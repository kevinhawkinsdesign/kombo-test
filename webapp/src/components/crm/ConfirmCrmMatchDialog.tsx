import * as React from "react"
import { Check, UserCheck } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"
import { prospectStore } from "@/lib/store"
import { integrations } from "@/lib/mock-data"
import { crmMatchCandidates } from "@/lib/crm-match"
import { CrmExportDialog } from "@/components/common/CrmExportDialog"
import { cn } from "@/lib/utils"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    title: "Confirm CRM match",
    desc: (crm: string) => `Kombo found a likely match for this prospect in ${crm}. Confirm it's the same person, or add them as a new contact.`,
    matchedOnEmail: "Matched on email",
    matchedOnName: "Matched on name + company",
    addNew: "None of these — add as new contact",
    cancel: "Cancel",
    confirm: "Confirm match",
    confirmedToast: (name: string) => `Match confirmed — ${name} is linked to ${integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "your CRM"}`,
  },
  es: {
    title: "Confirmar coincidencia de CRM",
    desc: (crm: string) => `Kombo encontró una posible coincidencia para este prospecto en ${crm}. Confirma que es la misma persona o añádelo como contacto nuevo.`,
    matchedOnEmail: "Coincide por email",
    matchedOnName: "Coincide por nombre y empresa",
    addNew: "Ninguno de estos — añadir como contacto nuevo",
    cancel: "Cancelar",
    confirm: "Confirmar coincidencia",
    confirmedToast: (name: string) => `Coincidencia confirmada — ${name} está vinculado a ${integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "tu CRM"}`,
  },
  it: {
    title: "Conferma corrispondenza CRM",
    desc: (crm: string) => `Kombo ha trovato una probabile corrispondenza per questo prospect in ${crm}. Conferma che è la stessa persona oppure aggiungilo come nuovo contatto.`,
    matchedOnEmail: "Corrispondenza per email",
    matchedOnName: "Corrispondenza per nome e azienda",
    addNew: "Nessuno di questi — aggiungi come nuovo contatto",
    cancel: "Annulla",
    confirm: "Conferma corrispondenza",
    confirmedToast: (name: string) => `Corrispondenza confermata — ${name} è collegato a ${integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "il tuo CRM"}`,
  },
  fr: {
    title: "Confirmer la correspondance CRM",
    desc: (crm: string) => `Kombo a trouvé une correspondance probable pour ce prospect dans ${crm}. Confirmez qu'il s'agit de la même personne, ou ajoutez-le comme nouveau contact.`,
    matchedOnEmail: "Correspondance par e-mail",
    matchedOnName: "Correspondance par nom et entreprise",
    addNew: "Aucun de ceux-ci — ajouter comme nouveau contact",
    cancel: "Annuler",
    confirm: "Confirmer la correspondance",
    confirmedToast: (name: string) => `Correspondance confirmée — ${name} est lié à ${integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "votre CRM"}`,
  },
  de: {
    title: "CRM-Übereinstimmung bestätigen",
    desc: (crm: string) => `Kombo hat für diesen Prospect eine wahrscheinliche Übereinstimmung in ${crm} gefunden. Bestätige, dass es dieselbe Person ist, oder füge sie als neuen Kontakt hinzu.`,
    matchedOnEmail: "Übereinstimmung per E-Mail",
    matchedOnName: "Übereinstimmung nach Name & Unternehmen",
    addNew: "Keiner davon — als neuen Kontakt hinzufügen",
    cancel: "Abbrechen",
    confirm: "Übereinstimmung bestätigen",
    confirmedToast: (name: string) => `Übereinstimmung bestätigt — ${name} ist mit ${integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "deinem CRM"} verknüpft`,
  },
  pt: {
    title: "Confirmar correspondência no CRM",
    desc: (crm: string) => `O Kombo encontrou uma possível correspondência para este contacto no ${crm}. Confirme se é a mesma pessoa ou adicione-o como novo contacto.`,
    matchedOnEmail: "Correspondência por email",
    matchedOnName: "Correspondência por nome e empresa",
    addNew: "Nenhum destes — adicionar como novo contacto",
    cancel: "Cancelar",
    confirm: "Confirmar correspondência",
    confirmedToast: (name: string) => `Correspondência confirmada — ${name} está associado ao ${integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "seu CRM"}`,
  },
  pt_BR: {
    title: "Confirmar correspondência no CRM",
    desc: (crm: string) => `O Kombo encontrou uma possível correspondência para esse contato no ${crm}. Confirme se é a mesma pessoa ou adicione como novo contato.`,
    matchedOnEmail: "Correspondência por e-mail",
    matchedOnName: "Correspondência por nome e empresa",
    addNew: "Nenhum destes — adicionar como novo contato",
    cancel: "Cancelar",
    confirm: "Confirmar correspondência",
    confirmedToast: (name: string) => `Correspondência confirmada — ${name} está associado ao ${integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "seu CRM"}`,
  },
} as const

export function ConfirmCrmMatchDialog({
  open,
  onOpenChange,
  prospect,
  onConfirmed,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  prospect: Prospect
  onConfirmed?: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const crmName = integrations.find((i) => i.category === "crm" && i.connected)?.name ?? "HubSpot"

  const candidates = React.useMemo(() => crmMatchCandidates(prospect), [prospect])
  const [selectedId, setSelectedId] = React.useState(candidates[0]?.id)
  const [exportOpen, setExportOpen] = React.useState(false)

  // Reset on open, house pattern — never on close.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSelectedId(candidates[0]?.id)
  }

  function confirm() {
    prospectStore.update(prospect.id, { inCrm: true })
    toast.success(c.confirmedToast(`${prospect.firstName} ${prospect.lastName}`))
    onOpenChange(false)
    onConfirmed?.()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{c.title}</DialogTitle>
            <DialogDescription>{c.desc(crmName)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedId(candidate.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
                  selectedId === candidate.id
                    ? "border-primary ring-primary/30 ring-2"
                    : "hover:border-primary/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-full">
                    <UserCheck className="text-muted-foreground size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{candidate.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {candidate.title} · {candidate.company}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">{candidate.email}</p>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {candidate.matchedOn === "email" ? c.matchedOnEmail : c.matchedOnName}
                    </p>
                  </div>
                </div>
                {selectedId === candidate.id && (
                  <Check className="text-primary size-4 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-full justify-center"
            onClick={() => {
              onOpenChange(false)
              setExportOpen(true)
            }}
          >
            {c.addNew}
          </Button>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" disabled={!selectedId} onClick={confirm}>
              <Check className="size-4" />
              {c.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {exportOpen && (
        <CrmExportDialog
          open
          onOpenChange={(v) => !v && setExportOpen(false)}
          recordKind="person"
          record={prospect}
          recordName={`${prospect.firstName} ${prospect.lastName}`}
        />
      )}
    </>
  )
}
