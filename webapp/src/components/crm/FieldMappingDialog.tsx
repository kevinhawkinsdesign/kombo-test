import * as React from "react"
import { ArrowRight, Check } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    title: (name: string) => `Map ${name} fields`,
    description: (name: string) =>
      `Match your ${name} columns to Kombo fields. This will be used for syncing contacts.`,
    sourceCol: "Source field",
    komboCol: "Kombo field",
    skip: "Skip for now",
    save: "Save mapping",
    saved: (name: string) => `${name} field mapping saved`,
    doNotMap: "— Don't map —",
    autoMapped: "Auto-mapped",
  },
  es: {
    title: (name: string) => `Mapear campos de ${name}`,
    description: (name: string) =>
      `Asocia las columnas de ${name} con los campos de Kombo. Se usará para sincronizar contactos.`,
    sourceCol: "Campo origen",
    komboCol: "Campo Kombo",
    skip: "Omitir por ahora",
    save: "Guardar mapeo",
    saved: (name: string) => `Mapeo de ${name} guardado`,
    doNotMap: "— No mapear —",
    autoMapped: "Auto-mapeado",
  },
} as const

// Kombo canonical contact fields a source can map to.
const KOMBO_FIELDS = [
  "First Name",
  "Last Name",
  "Company Name",
  "Job Title",
  "Email",
  "Phone",
  "LinkedIn URL",
  "Industry",
  "Location",
  "Website",
  "Revenue",
  "Headcount",
]

// Generic CRM source columns (shown when category === "crm").
const CRM_SOURCE_FIELDS = [
  "First Name",
  "Last Name",
  "Account Name",
  "Title",
  "Work Email",
  "Mobile Phone",
  "LinkedIn Profile URL",
  "Industry",
  "City",
  "Company Website",
  "Annual Revenue",
  "Number of Employees",
]

// Best-guess auto-mapping from source field name to Kombo field.
const AUTO_MAP: Record<string, string> = {
  "First Name": "First Name",
  "Last Name": "Last Name",
  "Account Name": "Company Name",
  "Title": "Job Title",
  "Work Email": "Email",
  "Mobile Phone": "Phone",
  "LinkedIn Profile URL": "LinkedIn URL",
  "Industry": "Industry",
  "City": "Location",
  "Company Website": "Website",
  "Annual Revenue": "Revenue",
  "Number of Employees": "Headcount",
}

function buildDefaultMapping(sourceFields: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const field of sourceFields) {
    map[field] = AUTO_MAP[field] ?? ""
  }
  return map
}

export interface FieldMappingDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  integrationName: string
  category?: string
}

export function FieldMappingDialog({
  open,
  onOpenChange,
  integrationName,
  category,
}: FieldMappingDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const sourceFields = CRM_SOURCE_FIELDS

  const [mapping, setMapping] = React.useState<Record<string, string>>(() =>
    buildDefaultMapping(sourceFields)
  )
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setMapping(buildDefaultMapping(sourceFields))
  }
  if (!open && wasOpen) setWasOpen(false)

  function setField(source: string, kombo: string) {
    setMapping((prev) => ({ ...prev, [source]: kombo }))
  }

  function save() {
    toast.success(c.saved(integrationName))
    onOpenChange(false)
  }

  const mappedCount = Object.values(mapping).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{c.title(integrationName)}</DialogTitle>
          <DialogDescription>{c.description(integrationName)}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[420px] overflow-y-auto -mx-1 px-1">
          {/* Column headers */}
          <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {c.sourceCol}
            </span>
            <span />
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {c.komboCol}
            </span>
          </div>

          <div className="space-y-1.5">
            {sourceFields.map((source) => {
              const isAutoMapped = AUTO_MAP[source] === mapping[source] && !!mapping[source]
              return (
                <div
                  key={source}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
                >
                  <div className="bg-muted/60 flex min-w-0 items-center gap-2 rounded-md px-2.5 py-1.5">
                    <span className="truncate text-sm font-medium">{source}</span>
                    {isAutoMapped && (
                      <Badge
                        variant="secondary"
                        className="ml-auto shrink-0 gap-1 text-[10px] font-normal"
                      >
                        <Check className="size-2.5" />
                        {c.autoMapped}
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="text-muted-foreground size-3.5 shrink-0" />
                  <Select
                    value={mapping[source] ?? ""}
                    onValueChange={(v) => setField(source, v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={c.doNotMap} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{c.doNotMap}</SelectItem>
                      {KOMBO_FIELDS.map((kf) => (
                        <SelectItem key={kf} value={kf}>
                          {kf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-muted-foreground text-xs">
          {mappedCount} of {sourceFields.length} fields mapped
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.skip}
          </Button>
          <Button onClick={save}>
            <Check className="size-4" />
            {c.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
