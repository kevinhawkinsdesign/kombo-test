import * as React from "react"
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

const COPY = {
  en: {
    syncing: (crm: string) => `Syncing to ${crm}…`,
    mappingTitle: "Complete the sync",
    mappingDesc: (crm: string) =>
      `${crm} couldn't match every field automatically — fill in what's missing to finish syncing this record.`,
    accountSection: "Account",
    accountNameLabel: "Account name",
    linkedinUrlLabel: "LinkedIn URL",
    linkedinUrlPlaceholder: "Add LinkedIn URL",
    save: "Save & finish sync",
    successTitle: (name: string, crm: string) => `${name} synced to ${crm}`,
    successDesc: "The record and its account are now up to date in your CRM.",
    done: "Done",
  },
  es: {
    syncing: (crm: string) => `Sincronizando con ${crm}…`,
    mappingTitle: "Completa la sincronización",
    mappingDesc: (crm: string) =>
      `${crm} no pudo asignar todos los campos automáticamente — completa lo que falta para terminar de sincronizar este registro.`,
    accountSection: "Cuenta",
    accountNameLabel: "Nombre de la cuenta",
    linkedinUrlLabel: "URL de LinkedIn",
    linkedinUrlPlaceholder: "Añadir URL de LinkedIn",
    save: "Guardar y terminar",
    successTitle: (name: string, crm: string) => `${name} sincronizado con ${crm}`,
    successDesc: "El registro y su cuenta ya están al día en tu CRM.",
    done: "Listo",
  },
  it: {
    syncing: (crm: string) => `Sincronizzazione con ${crm}…`,
    mappingTitle: "Completa la sincronizzazione",
    mappingDesc: (crm: string) =>
      `${crm} non è riuscito ad abbinare automaticamente tutti i campi — completa quanto manca per finire di sincronizzare questo record.`,
    accountSection: "Account",
    accountNameLabel: "Nome account",
    linkedinUrlLabel: "URL LinkedIn",
    linkedinUrlPlaceholder: "Aggiungi URL LinkedIn",
    save: "Salva e completa la sincronizzazione",
    successTitle: (name: string, crm: string) => `${name} sincronizzato con ${crm}`,
    successDesc: "Il record e il suo account sono ora aggiornati nel tuo CRM.",
    done: "Fatto",
  },
  fr: {
    syncing: (crm: string) => `Synchronisation avec ${crm}…`,
    mappingTitle: "Terminer la synchronisation",
    mappingDesc: (crm: string) =>
      `${crm} n'a pas pu associer tous les champs automatiquement — complétez ce qu'il manque pour terminer la synchronisation de cet enregistrement.`,
    accountSection: "Compte",
    accountNameLabel: "Nom du compte",
    linkedinUrlLabel: "URL LinkedIn",
    linkedinUrlPlaceholder: "Ajouter l'URL LinkedIn",
    save: "Enregistrer et terminer la synchronisation",
    successTitle: (name: string, crm: string) => `${name} synchronisé avec ${crm}`,
    successDesc: "L'enregistrement et son compte sont désormais à jour dans votre CRM.",
    done: "Terminé",
  },
  de: {
    syncing: (crm: string) => `Synchronisierung mit ${crm}…`,
    mappingTitle: "Synchronisierung abschließen",
    mappingDesc: (crm: string) =>
      `${crm} konnte nicht alle Felder automatisch zuordnen — ergänze, was fehlt, um die Synchronisierung dieses Datensatzes abzuschließen.`,
    accountSection: "Account",
    accountNameLabel: "Account-Name",
    linkedinUrlLabel: "LinkedIn-URL",
    linkedinUrlPlaceholder: "LinkedIn-URL hinzufügen",
    save: "Speichern & Synchronisierung abschließen",
    successTitle: (name: string, crm: string) => `${name} mit ${crm} synchronisiert`,
    successDesc: "Der Datensatz und sein Account sind jetzt in deinem CRM aktuell.",
    done: "Fertig",
  },
  pt: {
    syncing: (crm: string) => `A sincronizar com ${crm}…`,
    mappingTitle: "Conclua a sincronização",
    mappingDesc: (crm: string) =>
      `${crm} não conseguiu associar todos os campos automaticamente — preencha o que falta para terminar de sincronizar este registo.`,
    accountSection: "Conta",
    accountNameLabel: "Nome da conta",
    linkedinUrlLabel: "URL do LinkedIn",
    linkedinUrlPlaceholder: "Adicionar URL do LinkedIn",
    save: "Guardar e terminar sincronização",
    successTitle: (name: string, crm: string) => `${name} sincronizado com ${crm}`,
    successDesc: "O registo e a sua conta já estão atualizados no seu CRM.",
    done: "Concluído",
  },
  pt_BR: {
    syncing: (crm: string) => `Sincronizando com ${crm}…`,
    mappingTitle: "Conclua a sincronização",
    mappingDesc: (crm: string) =>
      `${crm} não conseguiu associar todos os campos automaticamente — preencha o que está faltando para terminar de sincronizar este registro.`,
    accountSection: "Conta",
    accountNameLabel: "Nome da conta",
    linkedinUrlLabel: "URL do LinkedIn",
    linkedinUrlPlaceholder: "Adicionar URL do LinkedIn",
    save: "Salvar e concluir sincronização",
    successTitle: (name: string, crm: string) => `${name} sincronizado com ${crm}`,
    successDesc: "O registro e sua conta já estão atualizados no seu CRM.",
    done: "Concluído",
  },
} as const

type Stage = "syncing" | "mapping" | "success"

function Mark({
  label,
  color,
  className,
}: {
  label: string
  color: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

// Shown after a "Push to CRM" confirmation, in place of an instant toast: a
// brief simulated sync, then either a success summary or — for the one
// designated demo record that "doesn't sync properly" — a manual mapping
// step matching how a real CRM push handles an unresolved linked Account.
export function CrmSyncFlow({
  crmName,
  crmColor = "#0ea5e9",
  recordName,
  accountName,
  willFail,
  onDone,
}: {
  crmName: string
  crmColor?: string
  recordName: string
  accountName: string
  willFail: boolean
  onDone: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [stage, setStage] = React.useState<Stage>("syncing")
  const [linkedinUrl, setLinkedinUrl] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(
      () => setStage(willFail ? "mapping" : "success"),
      1100
    )
    return () => clearTimeout(timer)
  }, [willFail])

  if (stage === "syncing") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-sm font-medium">{c.syncing(crmName)}</p>
      </div>
    )
  }

  if (stage === "mapping") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 py-1">
          <Mark label="K" color="#7c3aed" />
          <span className="border-muted-foreground/40 h-px w-10 border-t-2 border-dashed" />
          <ArrowRight className="text-muted-foreground -mx-2 size-4 shrink-0" />
          <Mark label={crmName.charAt(0)} color={crmColor} />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-base font-medium">{c.mappingTitle}</p>
          <p className="text-muted-foreground text-sm">
            {c.mappingDesc(crmName)}
          </p>
        </div>
        <div className="space-y-3 rounded-lg border p-3">
          <p className="text-sm font-medium">{c.accountSection}</p>
          <div className="space-y-1.5">
            <Label className="text-xs">{c.accountNameLabel}</Label>
            <Input value={accountName} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crm-map-linkedin-url" className="text-xs">
              {c.linkedinUrlLabel}
            </Label>
            <Input
              id="crm-map-linkedin-url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder={c.linkedinUrlPlaceholder}
            />
          </div>
        </div>
        <Button
          variant="volt"
          className="w-full"
          disabled={!linkedinUrl.trim()}
          onClick={() => setStage("success")}
        >
          {c.save}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <CheckCircle2 className="text-chart-1 size-12" />
      <div className="space-y-1">
        <p className="text-base font-medium">
          {c.successTitle(recordName, crmName)}
        </p>
        <p className="text-muted-foreground text-sm">{c.successDesc}</p>
      </div>
      <Button variant="volt" onClick={onDone}>
        {c.done}
      </Button>
    </div>
  )
}
