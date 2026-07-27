import * as React from "react"
import { Download } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { CONNECTED_CRM_PROVIDER } from "@/lib/mock-depth"
import { useLocale } from "@/lib/locale"

export type ExportFormat = "csv" | "excel" | "crm"

const COPY = {
  en: {
    title: (n: number) => `Export ${n}`,
    desc: "Choose a destination, and optionally send a copy to someone else.",
    formatLabel: "Destination",
    csvOption: "CSV (.csv)",
    excelOption: "Excel (.xlsx)",
    sendToLabel: "Send a copy to (optional)",
    sendToPlaceholder: "name@company.com",
    ownerLabel: "Record owner",
    noOwner: "Unassigned",
    cancel: "Cancel",
    exportAction: "Export",
  },
  es: {
    title: (n: number) => `Exportar ${n}`,
    desc: "Elige un destino y, si quieres, envía una copia a otra persona.",
    formatLabel: "Destino",
    csvOption: "CSV (.csv)",
    excelOption: "Excel (.xlsx)",
    sendToLabel: "Enviar una copia a (opcional)",
    sendToPlaceholder: "nombre@empresa.com",
    ownerLabel: "Responsable del registro",
    noOwner: "Sin asignar",
    cancel: "Cancelar",
    exportAction: "Exportar",
  },
  it: {
    title: (n: number) => `Esporta ${n}`,
    desc: "Scegli una destinazione e, se vuoi, invia una copia a qualcun altro.",
    formatLabel: "Destinazione",
    csvOption: "CSV (.csv)",
    excelOption: "Excel (.xlsx)",
    sendToLabel: "Invia una copia a (facoltativo)",
    sendToPlaceholder: "nome@azienda.com",
    ownerLabel: "Proprietario del record",
    noOwner: "Non assegnato",
    cancel: "Annulla",
    exportAction: "Esporta",
  },
  fr: {
    title: (n: number) => `Exporter ${n}`,
    desc: "Choisissez une destination et, si vous le souhaitez, envoyez une copie à quelqu'un d'autre.",
    formatLabel: "Destination",
    csvOption: "CSV (.csv)",
    excelOption: "Excel (.xlsx)",
    sendToLabel: "Envoyer une copie à (facultatif)",
    sendToPlaceholder: "nom@entreprise.com",
    ownerLabel: "Propriétaire de la fiche",
    noOwner: "Non attribué",
    cancel: "Annuler",
    exportAction: "Exporter",
  },
  de: {
    title: (n: number) => `${n} exportieren`,
    desc: "Wähle ein Ziel und sende optional eine Kopie an jemand anderen.",
    formatLabel: "Ziel",
    csvOption: "CSV (.csv)",
    excelOption: "Excel (.xlsx)",
    sendToLabel: "Kopie senden an (optional)",
    sendToPlaceholder: "name@firma.de",
    ownerLabel: "Owner des Datensatzes",
    noOwner: "Nicht zugewiesen",
    cancel: "Abbrechen",
    exportAction: "Exportieren",
  },
  pt: {
    title: (n: number) => `Exportar ${n}`,
    desc: "Escolha um destino e, se quiser, envie uma cópia a outra pessoa.",
    formatLabel: "Destino",
    csvOption: "CSV (.csv)",
    excelOption: "Excel (.xlsx)",
    sendToLabel: "Enviar uma cópia a (opcional)",
    sendToPlaceholder: "nome@empresa.com",
    ownerLabel: "Proprietário do registo",
    noOwner: "Não atribuído",
    cancel: "Cancelar",
    exportAction: "Exportar",
  },
  pt_BR: {
    title: (n: number) => `Exportar ${n}`,
    desc: "Escolha um destino e, se quiser, envie uma cópia para outra pessoa.",
    formatLabel: "Destino",
    csvOption: "CSV (.csv)",
    excelOption: "Excel (.xlsx)",
    sendToLabel: "Enviar uma cópia para (opcional)",
    sendToPlaceholder: "nome@empresa.com",
    ownerLabel: "Proprietário do registro",
    noOwner: "Não atribuído",
    cancel: "Cancelar",
    exportAction: "Exportar",
  },
} as const

/**
 * Confirms a destination — CSV, Excel, or a direct push to whichever CRM is
 * connected (this app only ever has one active connection, so there's no
 * CRM picker) — plus format-specific options, before an export runs. The
 * actual file generation/CRM sync stays with the caller (each page's
 * records/columns differ) — this dialog only collects intent.
 */
export function ExportDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  count: number
  onConfirm: (opts: { format: ExportFormat; sendTo?: string; ownerId?: string }) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [format, setFormat] = React.useState<ExportFormat>("csv")
  const [sendTo, setSendTo] = React.useState("")
  const [ownerId, setOwnerId] = React.useState<string | undefined>(undefined)

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setFormat("csv")
      setSendTo("")
      setOwnerId(undefined)
    }
  }

  const isCrm = format === "crm"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title(count)}</DialogTitle>
          <DialogDescription>{c.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{c.formatLabel}</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">{c.csvOption}</SelectItem>
              <SelectItem value="excel">{c.excelOption}</SelectItem>
              <SelectItem value="crm">
                <span className="flex items-center gap-1.5">
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded-sm text-[9px] font-semibold text-white"
                    style={{ backgroundColor: CONNECTED_CRM_PROVIDER.logoColor }}
                  >
                    {CONNECTED_CRM_PROVIDER.name.charAt(0)}
                  </span>
                  {CONNECTED_CRM_PROVIDER.name}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isCrm ? (
          <div className="space-y-2">
            <Label>{c.ownerLabel}</Label>
            <AssigneePicker
              value={ownerId}
              onChange={setOwnerId}
              unassignedLabel={c.noOwner}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="export-send-to">{c.sendToLabel}</Label>
            <Input
              id="export-send-to"
              type="email"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder={c.sendToPlaceholder}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button
            variant="volt"
            onClick={() => {
              onConfirm({
                format,
                sendTo: isCrm ? undefined : sendTo.trim() || undefined,
                ownerId: isCrm ? ownerId : undefined,
              })
              onOpenChange(false)
            }}
          >
            <Download className="size-4" />
            {c.exportAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
