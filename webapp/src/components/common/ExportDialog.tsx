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
