import * as React from "react"
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
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { useLocale } from "@/lib/locale"
import { prospectStore } from "@/lib/store"
import { integrations } from "@/lib/mock-data"
import {
  OBJECTS_FOR,
  OBJECT_LABEL,
  SKIP,
  komboFields,
  targetFields,
  defaultMapping,
  crmSyncNeedsManualMapping,
  type CrmObject,
  type RecordKind,
} from "@/lib/crm-mapping"
import { CrmSyncFlow } from "@/components/crm/CrmSyncFlow"
import { cn } from "@/lib/utils"
import type { Account, Prospect } from "@/lib/types"

const STEPS = 4

const COPY = {
  en: {
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
    assignTo: "Owner",
    assignToHint: "Who owns this record in your CRM.",
    crmDefaultOwner: "CRM default owner",
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
  },
  es: {
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
    assignTo: "Responsable",
    assignToHint: "Quién será el responsable de este registro en tu CRM.",
    crmDefaultOwner: "Responsable por defecto del CRM",
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
  },
  it: {
    titleDest: "Scegli la destinazione",
    titleMap: "Mappa i campi",
    titleRules: "Regole di sincronizzazione",
    titleReview: "Rivedi e conferma",
    descDest: "Dove deve andare questo record?",
    descMap: "Abbina i campi di Kombo a quelli del tuo CRM.",
    descRules: "Decidi come Kombo mantiene sincronizzato questo record.",
    descReview: "Ricontrolla prima di inviare al tuo CRM.",
    crm: "CRM",
    object: "Crea come",
    assignTo: "Proprietario",
    assignToHint: "Chi è il proprietario di questo record nel tuo CRM.",
    crmDefaultOwner: "Proprietario predefinito del CRM",
    notConnected: "Non connesso",
    creatingIn: (object: string, crm: string, kind: string) => (
      <>
        Creazione di un nuovo <strong>{object}</strong> in <strong>{crm}</strong> a partire da questa {kind}.
      </>
    ),
    skip: "— Salta —",
    overwrite: "Sovrascrivi i valori esistenti",
    overwriteDesc: "Sostituisce i valori del CRM con quelli di Kombo quando differiscono.",
    dedupe: "Salta se esiste già un record corrispondente",
    dedupeDesc: "Confronta per email o dominio per evitare duplicati.",
    logActivity: "Registra un'attività Kombo",
    logActivityDesc: "Aggiunge una nota alla timeline del CRM.",
    reviewMapped: (n: number) =>
      `${n} ${n === 1 ? "campo verrà scritto" : "campi verranno scritti"}`,
    back: "Indietro",
    cancel: "Annulla",
    continue: "Continua",
    confirm: "Aggiungi al CRM",
    person: "persona",
    company: "azienda",
  },
  fr: {
    titleDest: "Choisir la destination",
    titleMap: "Mapper les champs",
    titleRules: "Règles de synchronisation",
    titleReview: "Vérifier et confirmer",
    descDest: "Où cette fiche doit-elle aller ?",
    descMap: "Associez les champs Kombo aux champs de votre CRM.",
    descRules: "Décidez comment Kombo garde cette fiche synchronisée.",
    descReview: "Vérifiez avant l'envoi vers votre CRM.",
    crm: "CRM",
    object: "Créer comme",
    assignTo: "Propriétaire",
    assignToHint: "Qui est propriétaire de cette fiche dans votre CRM.",
    crmDefaultOwner: "Propriétaire par défaut du CRM",
    notConnected: "Non connecté",
    creatingIn: (object: string, crm: string, kind: string) => (
      <>
        Création d'un nouveau <strong>{object}</strong> dans <strong>{crm}</strong> à partir de cette {kind}.
      </>
    ),
    skip: "— Ignorer —",
    overwrite: "Écraser les valeurs existantes",
    overwriteDesc: "Remplace les valeurs du CRM par celles de Kombo quand elles diffèrent.",
    dedupe: "Ignorer si une fiche correspondante existe",
    dedupeDesc: "Correspondance par e-mail ou domaine pour éviter les doublons.",
    logActivity: "Consigner une activité Kombo",
    logActivityDesc: "Ajoute une note dans la chronologie du CRM.",
    reviewMapped: (n: number) =>
      `${n} ${n === 1 ? "champ sera écrit" : "champs seront écrits"}`,
    back: "Retour",
    cancel: "Annuler",
    continue: "Continuer",
    confirm: "Ajouter au CRM",
    person: "personne",
    company: "entreprise",
  },
  de: {
    titleDest: "Ziel wählen",
    titleMap: "Felder zuordnen",
    titleRules: "Sync-Regeln",
    titleReview: "Prüfen & bestätigen",
    descDest: "Wohin soll dieser Datensatz?",
    descMap: "Ordne Kombo-Felder den Feldern in deinem CRM zu.",
    descRules: "Lege fest, wie Kombo diesen Datensatz synchron hält.",
    descReview: "Prüfe alles, bevor es an dein CRM geht.",
    crm: "CRM",
    object: "Erstellen als",
    assignTo: "Owner",
    assignToHint: "Wem dieser Datensatz in deinem CRM gehört.",
    crmDefaultOwner: "Standard-Owner des CRM",
    notConnected: "Nicht verbunden",
    creatingIn: (object: string, crm: string, kind: string) => (
      <>
        Aus {kind} wird ein neuer <strong>{object}</strong> in <strong>{crm}</strong> erstellt.
      </>
    ),
    skip: "— Überspringen —",
    overwrite: "Bestehende Werte überschreiben",
    overwriteDesc: "Ersetzt CRM-Werte durch die von Kombo, wenn sie abweichen.",
    dedupe: "Überspringen, wenn ein passender Datensatz existiert",
    dedupeDesc: "Abgleich per E-Mail oder Domain, um Duplikate zu vermeiden.",
    logActivity: "Kombo-Aktivität protokollieren",
    logActivityDesc: "Fügt eine Notiz zur CRM-Timeline hinzu.",
    reviewMapped: (n: number) =>
      `${n} ${n === 1 ? "Feld wird" : "Felder werden"} geschrieben`,
    back: "Zurück",
    cancel: "Abbrechen",
    continue: "Weiter",
    confirm: "Zum CRM hinzufügen",
    person: "dieser Person",
    company: "diesem Unternehmen",
  },
  pt: {
    titleDest: "Escolha o destino",
    titleMap: "Mapear campos",
    titleRules: "Regras de sincronização",
    titleReview: "Rever e confirmar",
    descDest: "Para onde deve ir este registo?",
    descMap: "Associe os campos do Kombo aos campos do seu CRM.",
    descRules: "Decida como o Kombo mantém este registo sincronizado.",
    descReview: "Verifique antes de enviar para o seu CRM.",
    crm: "CRM",
    object: "Criar como",
    assignTo: "Proprietário",
    assignToHint: "Quem é o proprietário deste registo no seu CRM.",
    crmDefaultOwner: "Proprietário predefinido do CRM",
    notConnected: "Não ligado",
    creatingIn: (object: string, crm: string, kind: string) => (
      <>
        A criar um novo <strong>{object}</strong> no <strong>{crm}</strong> a partir desta {kind}.
      </>
    ),
    skip: "— Ignorar —",
    overwrite: "Substituir valores existentes",
    overwriteDesc: "Substitui os valores do CRM pelos do Kombo quando diferem.",
    dedupe: "Ignorar se já existir um registo correspondente",
    dedupeDesc: "Faz a correspondência por email ou domínio para evitar duplicados.",
    logActivity: "Registar uma atividade do Kombo",
    logActivityDesc: "Adiciona uma nota à cronologia do CRM.",
    reviewMapped: (n: number) =>
      n === 1 ? "Será escrito 1 campo" : `Serão escritos ${n} campos`,
    back: "Voltar",
    cancel: "Cancelar",
    continue: "Continuar",
    confirm: "Adicionar ao CRM",
    person: "pessoa",
    company: "empresa",
  },
  pt_BR: {
    titleDest: "Escolha o destino",
    titleMap: "Mapear campos",
    titleRules: "Regras de sincronização",
    titleReview: "Revisar e confirmar",
    descDest: "Para onde esse registro deve ir?",
    descMap: "Associe os campos do Kombo aos campos do seu CRM.",
    descRules: "Decida como o Kombo mantém esse registro sincronizado.",
    descReview: "Confira antes de enviar para o seu CRM.",
    crm: "CRM",
    object: "Criar como",
    assignTo: "Proprietário",
    assignToHint: "Quem é o proprietário desse registro no seu CRM.",
    crmDefaultOwner: "Proprietário padrão do CRM",
    notConnected: "Não conectado",
    creatingIn: (object: string, crm: string, kind: string) => (
      <>
        Criando um novo <strong>{object}</strong> no <strong>{crm}</strong> a partir desta {kind}.
      </>
    ),
    skip: "— Pular —",
    overwrite: "Sobrescrever valores existentes",
    overwriteDesc: "Substitui os valores do CRM pelos do Kombo quando forem diferentes.",
    dedupe: "Pular se já existir um registro correspondente",
    dedupeDesc: "Faz a correspondência por e-mail ou domínio para evitar duplicatas.",
    logActivity: "Registrar uma atividade do Kombo",
    logActivityDesc: "Adiciona uma nota à linha do tempo do CRM.",
    reviewMapped: (n: number) =>
      n === 1 ? "Será escrito 1 campo" : `Serão escritos ${n} campos`,
    back: "Voltar",
    cancel: "Cancelar",
    continue: "Continuar",
    confirm: "Adicionar ao CRM",
    person: "pessoa",
    company: "empresa",
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
  const [assigneeId, setAssigneeId] = React.useState<string | undefined>(
    undefined
  )

  const crmTargets = targetFields(crm, object)

  function reset() {
    setStep(0)
    setCrm(defaultCrm)
    const obj = OBJECTS_FOR[recordKind][0]
    setObject(obj)
    setMapping(defaultMapping(fields, targetFields(defaultCrm, obj)))
    setAssigneeId(undefined)
  }

  // Reset the form whenever the dialog transitions to open — the house
  // pattern every other dialog uses, rather than resetting on close.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) reset()
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
    // Mirror the CRM assignment onto the Kombo record when it has no owner
    // yet — the same never-overwrite rule lists use.
    if (
      assigneeId &&
      recordKind === "person" &&
      !(record as Prospect).ownerId
    ) {
      prospectStore.update(record.id, { ownerId: assigneeId })
    }
    setStep(4)
  }

  const kindWord = recordKind === "person" ? c.person : c.company
  const titles = [c.titleDest, c.titleMap, c.titleRules, c.titleReview]
  const descs = [c.descDest, c.descMap, c.descRules, c.descReview]
  const accountName =
    recordKind === "person" ? (record as Prospect).company : (record as Account).name
  const needsManualMapping = crmSyncNeedsManualMapping(recordKind, record.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {step < STEPS && (
          <DialogHeader>
            <DialogTitle>{titles[step]}</DialogTitle>
            <DialogDescription>{descs[step]}</DialogDescription>

            {/* Stepper */}
            <ol className="mt-3 flex items-center gap-1.5">
              {titles.map((label, i) => (
                <li key={label} className="flex flex-1 items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                      i < step && "bg-primary text-primary-foreground",
                      i === step && "border-primary text-primary border-2",
                      i > step && "bg-muted text-muted-foreground"
                    )}
                  >
                    {i < step ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-xs font-medium sm:inline",
                      i === step ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                  {i < titles.length - 1 && <span className="bg-border h-px flex-1" />}
                </li>
              ))}
            </ol>
          </DialogHeader>
        )}

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

            <div className="space-y-2">
              <p className="text-sm font-medium">{c.assignTo}</p>
              <AssigneePicker
                value={assigneeId}
                onChange={setAssigneeId}
                unassignedLabel={c.crmDefaultOwner}
              />
              <p className="text-muted-foreground text-xs">{c.assignToHint}</p>
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

        {/* Step 5 — simulated external sync, then success or manual mapping */}
        {step === 4 && (
          <CrmSyncFlow
            crmName={crm}
            recordName={recordName}
            accountName={accountName}
            willFail={needsManualMapping}
            onDone={() => onOpenChange(false)}
          />
        )}

        {step < STEPS && (
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
        )}
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
