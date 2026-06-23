import * as React from "react"
import { toast } from "sonner"
import { ArrowRight, Check } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useLocale } from "@/lib/locale"
import { integrations } from "@/lib/mock-data"
import {
  OBJECTS_FOR,
  OBJECT_LABEL,
  SKIP,
  komboFields,
  targetFields,
  defaultMapping,
  type CrmObject,
  type RecordKind,
} from "@/lib/crm-mapping"
import { cn } from "@/lib/utils"
import type { Account, Prospect } from "@/lib/types"

const STEPS = 4

const COPY = {
  en: {
    step: (n: number) => `Step ${n} of ${STEPS}`,
    titleDest: "Choose destination",
    titleMap: "Map fields",
    titleRules: "Sync rules",
    titleReview: "Review & confirm",
    descDest: "Where should this record go?",
    descMap: "Match Kombo fields to fields in your CRM.",
    descRules: "Decide how Kombo keeps this record in sync.",
    descReview: "Double-check before pushing to your CRM.",
    crm: "CRM",
    object: "Create as",
    notConnected: "Not connected",
    creatingIn: (object: string, crm: string, kind: string) => (
      <>
        Creating a new <strong>{object}</strong> in <strong>{crm}</strong> from this {kind}.
      </>
    ),
    skip: "— Skip —",
    overwrite: "Overwrite existing values",
    overwriteDesc: "Replace CRM values with Kombo's when they differ.",
    dedupe: "Skip if a matching record exists",
    dedupeDesc: "Match on email or domain to avoid duplicates.",
    logActivity: "Log a Kombo activity",
    logActivityDesc: "Add a note on the CRM timeline.",
    reviewMapped: (n: number) => `${n} field${n === 1 ? "" : "s"} will be written`,
    back: "Back",
    cancel: "Cancel",
    continue: "Continue",
    confirm: "Add to CRM",
    person: "person",
    company: "company",
    pushed: (crm: string) => `Pushed to ${crm}`,
  },
  es: {
    step: (n: number) => `Paso ${n} de ${STEPS}`,
    titleDest: "Elige el destino",
    titleMap: "Asignar campos",
    titleRules: "Reglas de sincronización",
    titleReview: "Revisar y confirmar",
    descDest: "¿A dónde debe ir este registro?",
    descMap: "Asigna los campos de Kombo a los de tu CRM.",
    descRules: "Decide cómo mantiene Kombo este registro sincronizado.",
    descReview: "Revisa antes de enviar a tu CRM.",
    crm: "CRM",
    object: "Crear como",
    notConnected: "No conectado",
    creatingIn: (object: string, crm: string, kind: string) => (
      <>
        Creando un nuevo <strong>{object}</strong> en <strong>{crm}</strong> desde este {kind}.
      </>
    ),
    skip: "— Omitir —",
    overwrite: "Sobrescribir valores existentes",
    overwriteDesc: "Reemplaza los valores del CRM con los de Kombo si difieren.",
    dedupe: "Omitir si ya existe un registro",
    dedupeDesc: "Coincide por correo o dominio para evitar duplicados.",
    logActivity: "Registrar una actividad de Kombo",
    logActivityDesc: "Añade una nota en la línea de tiempo del CRM.",
    reviewMapped: (n: number) => `Se escribirán ${n} campo${n === 1 ? "" : "s"}`,
    back: "Atrás",
    cancel: "Cancelar",
    continue: "Continuar",
    confirm: "Añadir al CRM",
    person: "persona",
    company: "empresa",
    pushed: (crm: string) => `Enviado a ${crm}`,
  },
} as const

const CRMS = integrations.filter((i) => i.category === "crm")

export function CrmExportDialog({
  open,
  onOpenChange,
  recordKind,
  record,
  recordName,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  recordKind: RecordKind
  record: Prospect | Account
  recordName: string
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const defaultCrm = CRMS.find((i) => i.connected)?.name ?? CRMS[0]?.name ?? "HubSpot"
  const fields = React.useMemo(() => komboFields(recordKind, record), [recordKind, record])

  const [step, setStep] = React.useState(0)
  const [crm, setCrm] = React.useState(defaultCrm)
  const [object, setObject] = React.useState<CrmObject>(OBJECTS_FOR[recordKind][0])
  const [mapping, setMapping] = React.useState<Record<string, string>>(() =>
    defaultMapping(fields, targetFields(defaultCrm, OBJECTS_FOR[recordKind][0]))
  )
  const [overwrite, setOverwrite] = React.useState(false)
  const [dedupe, setDedupe] = React.useState(true)
  const [logActivity, setLogActivity] = React.useState(true)

  const crmTargets = targetFields(crm, object)

  function reset() {
    setStep(0)
    setCrm(defaultCrm)
    const obj = OBJECTS_FOR[recordKind][0]
    setObject(obj)
    setMapping(defaultMapping(fields, targetFields(defaultCrm, obj)))
  }

  function pickCrm(name: string) {
    setCrm(name)
    setMapping(defaultMapping(fields, targetFields(name, object)))
  }
  function pickObject(obj: CrmObject) {
    setObject(obj)
    setMapping(defaultMapping(fields, targetFields(crm, obj)))
  }

  const mappedCount = Object.values(mapping).filter((v) => v !== SKIP).length

  function confirm() {
    toast.success(c.pushed(crm))
    onOpenChange(false)
    reset()
  }

  const kindWord = recordKind === "person" ? c.person : c.company
  const titles = [c.titleDest, c.titleMap, c.titleRules, c.titleReview]
  const descs = [c.descDest, c.descMap, c.descRules, c.descReview]

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <p className="text-muted-foreground text-xs font-medium">{c.step(step + 1)}</p>
          <DialogTitle>{titles[step]}</DialogTitle>
          <DialogDescription>{descs[step]}</DialogDescription>
        </DialogHeader>

        {/* Step 1 — destination */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">{c.crm}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {CRMS.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    disabled={!i.connected}
                    onClick={() => pickCrm(i.name)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors disabled:opacity-50",
                      crm === i.name ? "border-primary ring-primary/30 ring-2" : "hover:border-primary/40"
                    )}
                  >
                    <span className="font-medium">{i.name}</span>
                    {i.connected ? (
                      crm === i.name && <Check className="text-primary size-4" />
                    ) : (
                      <span className="text-muted-foreground text-xs">{c.notConnected}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{c.object}</p>
              <div className="flex flex-wrap gap-2">
                {OBJECTS_FOR[recordKind].map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => pickObject(obj)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      object === obj
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {OBJECT_LABEL[obj]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — map fields */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm">
              {c.creatingIn(OBJECT_LABEL[object], crm, kindWord)}
            </p>
            <div className="-mx-1 max-h-[50vh] space-y-2.5 overflow-y-auto px-1">
              {fields.map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.label}</p>
                    <p className="text-muted-foreground truncate text-sm">{f.value}</p>
                  </div>
                  <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                  <Select
                    value={mapping[f.key]}
                    onValueChange={(v) => setMapping((m) => ({ ...m, [f.key]: v }))}
                  >
                    <SelectTrigger className="w-[44%] min-w-[160px] shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SKIP}>{c.skip}</SelectItem>
                      {crmTargets.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — sync rules */}
        {step === 2 && (
          <div className="space-y-1">
            <RuleRow
              title={c.dedupe}
              desc={c.dedupeDesc}
              checked={dedupe}
              onChange={setDedupe}
            />
            <RuleRow
              title={c.overwrite}
              desc={c.overwriteDesc}
              checked={overwrite}
              onChange={setOverwrite}
            />
            <RuleRow
              title={c.logActivity}
              desc={c.logActivityDesc}
              checked={logActivity}
              onChange={setLogActivity}
            />
          </div>
        )}

        {/* Step 4 — review */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-muted/40 rounded-lg border p-4 text-sm">
              <p>{c.creatingIn(OBJECT_LABEL[object], crm, kindWord)}</p>
              <p className="text-muted-foreground mt-1">{recordName}</p>
            </div>
            <ul className="text-muted-foreground space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="text-primary size-4" />
                {c.reviewMapped(mappedCount)}
              </li>
              <li className="flex items-center gap-2">
                <Check className="text-primary size-4" />
                {dedupe ? c.dedupe : c.overwrite}
              </li>
              {logActivity && (
                <li className="flex items-center gap-2">
                  <Check className="text-primary size-4" />
                  {c.logActivity}
                </li>
              )}
            </ul>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? onOpenChange(false) : setStep((s) => s - 1))}
          >
            {step === 0 ? c.cancel : c.back}
          </Button>
          {step < STEPS - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>{c.continue}</Button>
          ) : (
            <Button variant="volt" onClick={confirm}>
              <Check className="size-4" />
              {c.confirm}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RuleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-4 rounded-lg p-3">
      <span className="space-y-0.5">
        <span className="block text-sm font-medium">{title}</span>
        <span className="text-muted-foreground block text-xs">{desc}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}
