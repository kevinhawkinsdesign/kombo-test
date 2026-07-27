import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CONNECTED_CRM_PROVIDER } from "@/lib/mock-depth"
import { listStore } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import { formatDate } from "@/lib/format"
import type { ProspectList } from "@/lib/types"

const COPY = {
  en: {
    title: "Sync to CRM",
    desc: (crm: string) =>
      `Keep this list synced with ${crm} — prospects/companies added later push automatically too, not just what's here today.`,
    synced: (crm: string, date: string) => `Synced with ${crm} since ${date}`,
    syncedDesc: "New records added to this list push to the CRM as they arrive.",
    cancel: "Cancel",
    link: "Link",
    unlink: "Unlink",
    linked: (crm: string) => `Linked to ${crm}`,
    unlinked: "No longer synced with the CRM",
  },
  es: {
    title: "Sincronizar con el CRM",
    desc: (crm: string) =>
      `Mantén esta lista sincronizada con ${crm} — los prospectos/empresas que se añadan después también se enviarán automáticamente, no solo los de ahora.`,
    synced: (crm: string, date: string) => `Sincronizada con ${crm} desde ${date}`,
    syncedDesc: "Los nuevos registros añadidos a esta lista se envían al CRM al llegar.",
    cancel: "Cancelar",
    link: "Vincular",
    unlink: "Desvincular",
    linked: (crm: string) => `Vinculada a ${crm}`,
    unlinked: "Ya no está sincronizada con el CRM",
  },
  it: {
    title: "Sincronizza con il CRM",
    desc: (crm: string) =>
      `Mantieni questa lista sincronizzata con ${crm} — anche i prospect/aziende aggiunti dopo verranno inviati automaticamente, non solo quelli di oggi.`,
    synced: (crm: string, date: string) => `Sincronizzata con ${crm} dal ${date}`,
    syncedDesc: "I nuovi record aggiunti a questa lista vengono inviati al CRM appena arrivano.",
    cancel: "Annulla",
    link: "Collega",
    unlink: "Scollega",
    linked: (crm: string) => `Collegata a ${crm}`,
    unlinked: "Non più sincronizzata con il CRM",
  },
  fr: {
    title: "Synchroniser avec le CRM",
    desc: (crm: string) =>
      `Gardez cette liste synchronisée avec ${crm} — les prospects/entreprises ajoutés plus tard seront aussi poussés automatiquement, pas seulement ceux d'aujourd'hui.`,
    synced: (crm: string, date: string) => `Synchronisée avec ${crm} depuis le ${date}`,
    syncedDesc: "Les nouvelles fiches ajoutées à cette liste sont poussées vers le CRM à leur arrivée.",
    cancel: "Annuler",
    link: "Lier",
    unlink: "Délier",
    linked: (crm: string) => `Liée à ${crm}`,
    unlinked: "N'est plus synchronisée avec le CRM",
  },
  de: {
    title: "Mit CRM synchronisieren",
    desc: (crm: string) =>
      `Halte diese Liste mit ${crm} synchron — auch später hinzugefügte Prospects/Unternehmen werden automatisch übertragen, nicht nur die von heute.`,
    synced: (crm: string, date: string) => `Seit ${date} mit ${crm} synchronisiert`,
    syncedDesc: "Neue Datensätze in dieser Liste werden bei Ankunft ins CRM übertragen.",
    cancel: "Abbrechen",
    link: "Verknüpfen",
    unlink: "Verknüpfung aufheben",
    linked: (crm: string) => `Mit ${crm} verknüpft`,
    unlinked: "Nicht mehr mit dem CRM synchronisiert",
  },
  pt: {
    title: "Sincronizar com o CRM",
    desc: (crm: string) =>
      `Mantenha esta lista sincronizada com ${crm} — os prospects/empresas adicionados mais tarde também são enviados automaticamente, não só os de hoje.`,
    synced: (crm: string, date: string) => `Sincronizada com ${crm} desde ${date}`,
    syncedDesc: "Os novos registos adicionados a esta lista são enviados ao CRM assim que chegam.",
    cancel: "Cancelar",
    link: "Associar",
    unlink: "Desassociar",
    linked: (crm: string) => `Associada a ${crm}`,
    unlinked: "Já não está sincronizada com o CRM",
  },
  pt_BR: {
    title: "Sincronizar com o CRM",
    desc: (crm: string) =>
      `Mantenha esta lista sincronizada com ${crm} — os prospects/empresas adicionados depois também são enviados automaticamente, não só os de hoje.`,
    synced: (crm: string, date: string) => `Sincronizada com ${crm} desde ${date}`,
    syncedDesc: "Os novos registros adicionados a esta lista são enviados ao CRM assim que chegam.",
    cancel: "Cancelar",
    link: "Vincular",
    unlink: "Desvincular",
    linked: (crm: string) => `Vinculada a ${crm}`,
    unlinked: "Não está mais sincronizada com o CRM",
  },
} as const

// Persistent CRM sync — distinct from the one-off "Export to CRM" bulk
// action. Once linked, records added to this list later push to the CRM
// too, not just whatever's here at link time.
export function LinkListToCrmDialog({
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
  const crm = CONNECTED_CRM_PROVIDER.name

  function link() {
    listStore.update(list.id, {
      crmSynced: true,
      crmSyncedAt: new Date().toISOString(),
    })
    toast.success(c.linked(crm))
    onOpenChange(false)
  }

  function unlink() {
    listStore.update(list.id, { crmSynced: false, crmSyncedAt: undefined })
    toast.success(c.unlinked)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-sm text-[10px] font-semibold text-white"
              style={{ backgroundColor: CONNECTED_CRM_PROVIDER.logoColor }}
            >
              {crm.charAt(0)}
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>
            {list.crmSynced && list.crmSyncedAt
              ? c.syncedDesc
              : c.desc(crm)}
          </DialogDescription>
        </DialogHeader>

        {list.crmSynced && list.crmSyncedAt && (
          <p className="bg-muted/40 rounded-lg border p-2.5 text-sm font-medium">
            {c.synced(crm, formatDate(list.crmSyncedAt))}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          {list.crmSynced ? (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={unlink}
            >
              {c.unlink}
            </Button>
          ) : (
            <Button variant="volt" onClick={link}>
              {c.link}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
