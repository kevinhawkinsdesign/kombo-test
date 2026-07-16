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
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    title: (n: number) => `Export ${n}`,
    desc: "Choose a file type, and optionally send a copy to someone else.",
    formatLabel: "File type",
    csvOption: "CSV (.csv)",
    sendToLabel: "Send a copy to (optional)",
    sendToPlaceholder: "name@company.com",
    cancel: "Cancel",
    exportAction: "Export",
  },
  es: {
    title: (n: number) => `Exportar ${n}`,
    desc: "Elige un tipo de archivo y, si quieres, envía una copia a otra persona.",
    formatLabel: "Tipo de archivo",
    csvOption: "CSV (.csv)",
    sendToLabel: "Enviar una copia a (opcional)",
    sendToPlaceholder: "nombre@empresa.com",
    cancel: "Cancelar",
    exportAction: "Exportar",
  },
  it: {
    title: (n: number) => `Esporta ${n}`,
    desc: "Scegli un tipo di file e, se vuoi, invia una copia a qualcun altro.",
    formatLabel: "Tipo di file",
    csvOption: "CSV (.csv)",
    sendToLabel: "Invia una copia a (facoltativo)",
    sendToPlaceholder: "nome@azienda.com",
    cancel: "Annulla",
    exportAction: "Esporta",
  },
  fr: {
    title: (n: number) => `Exporter ${n}`,
    desc: "Choisissez un type de fichier et, si vous le souhaitez, envoyez une copie à quelqu'un d'autre.",
    formatLabel: "Type de fichier",
    csvOption: "CSV (.csv)",
    sendToLabel: "Envoyer une copie à (facultatif)",
    sendToPlaceholder: "nom@entreprise.com",
    cancel: "Annuler",
    exportAction: "Exporter",
  },
  de: {
    title: (n: number) => `${n} exportieren`,
    desc: "Wähle einen Dateityp und sende optional eine Kopie an jemand anderen.",
    formatLabel: "Dateityp",
    csvOption: "CSV (.csv)",
    sendToLabel: "Kopie senden an (optional)",
    sendToPlaceholder: "name@firma.de",
    cancel: "Abbrechen",
    exportAction: "Exportieren",
  },
  pt: {
    title: (n: number) => `Exportar ${n}`,
    desc: "Escolha um tipo de ficheiro e, se quiser, envie uma cópia a outra pessoa.",
    formatLabel: "Tipo de ficheiro",
    csvOption: "CSV (.csv)",
    sendToLabel: "Enviar uma cópia a (opcional)",
    sendToPlaceholder: "nome@empresa.com",
    cancel: "Cancelar",
    exportAction: "Exportar",
  },
  pt_BR: {
    title: (n: number) => `Exportar ${n}`,
    desc: "Escolha um tipo de arquivo e, se quiser, envie uma cópia para outra pessoa.",
    formatLabel: "Tipo de arquivo",
    csvOption: "CSV (.csv)",
    sendToLabel: "Enviar uma cópia para (opcional)",
    sendToPlaceholder: "nome@empresa.com",
    cancel: "Cancelar",
    exportAction: "Exportar",
  },
} as const

/**
 * Confirms file type + an optional "send a copy to" recipient before an
 * export runs. The actual file generation/download stays with the caller
 * (each page's records/columns differ) — this dialog only collects intent.
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
  onConfirm: (opts: { sendTo?: string }) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [sendTo, setSendTo] = React.useState("")

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSendTo("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title(count)}</DialogTitle>
          <DialogDescription>{c.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{c.formatLabel}</Label>
          <Select value="csv">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">{c.csvOption}</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button
            variant="volt"
            onClick={() => {
              onConfirm({ sendTo: sendTo.trim() || undefined })
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
