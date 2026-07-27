import { toast } from "sonner"
import { Layers, Check } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"
import { useCredits } from "@/lib/credits"
import { COMPANY_ENRICH_COST, isCompanyEnriched } from "@/lib/enrichment"
import { accountStore, listStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Account, EnrichmentMode, ProspectList } from "@/lib/types"

const COPY = {
  en: {
    title: "Enrich companies",
    modeLabel: "Enrichment mode",
    modeOnce: "Once on add",
    modeContinuous: "Continuously",
    description:
      "Pulls in everything available for each company — contact info, recent investment or hiring activity, and more.",
    toEnrich: "Companies to enrich",
    total: "Total",
    perCompany: (n: number) => `${n.toLocaleString()} credits`,
    credits: "credits",
    balanceAfter: "Balance after",
    allEnriched: "Every selected company already has this.",
    cancel: "Cancel",
    enrich: (count: number) =>
      `Enrich ${count.toLocaleString()} ${count === 1 ? "company" : "companies"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "company" : "companies"} enriched`,
    usageLabel: (count: number) => `Enrichment · Companies (${count})`,
  },
  es: {
    title: "Enriquecer empresas",
    modeLabel: "Modo de enriquecimiento",
    modeOnce: "Una vez al añadir",
    modeContinuous: "De forma continua",
    description:
      "Obtiene todo lo disponible por empresa — datos de contacto, inversión reciente o actividad de contratación, y más.",
    toEnrich: "Empresas por enriquecer",
    total: "Total",
    perCompany: (n: number) => `${n.toLocaleString()} créditos`,
    credits: "créditos",
    balanceAfter: "Saldo después",
    allEnriched: "Todas las empresas seleccionadas ya lo tienen.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "empresa" : "empresas"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "empresa enriquecida" : "empresas enriquecidas"}`,
    usageLabel: (count: number) => `Enriquecimiento · Empresas (${count})`,
  },
  it: {
    title: "Arricchisci aziende",
    modeLabel: "Modalità di arricchimento",
    modeOnce: "Una volta all'aggiunta",
    modeContinuous: "In continuo",
    description:
      "Recupera tutto ciò che è disponibile per ogni azienda — contatti, investimenti recenti o attività di assunzione, e altro.",
    toEnrich: "Aziende da arricchire",
    total: "Totale",
    perCompany: (n: number) => `${n.toLocaleString()} crediti`,
    credits: "crediti",
    balanceAfter: "Saldo dopo",
    allEnriched: "Tutte le aziende selezionate ce l'hanno già.",
    cancel: "Annulla",
    enrich: (count: number) =>
      `Arricchisci ${count.toLocaleString()} ${count === 1 ? "azienda" : "aziende"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "azienda arricchita" : "aziende arricchite"}`,
    usageLabel: (count: number) => `Arricchimento · Aziende (${count})`,
  },
  fr: {
    title: "Enrichir les entreprises",
    modeLabel: "Mode d'enrichissement",
    modeOnce: "Une fois à l'ajout",
    modeContinuous: "En continu",
    description:
      "Récupère tout ce qui est disponible par entreprise — coordonnées, investissement ou recrutement récent, et plus.",
    toEnrich: "Entreprises à enrichir",
    total: "Total",
    perCompany: (n: number) => `${n.toLocaleString()} crédits`,
    credits: "crédits",
    balanceAfter: "Solde après",
    allEnriched: "Toutes les entreprises sélectionnées l'ont déjà.",
    cancel: "Annuler",
    enrich: (count: number) =>
      `Enrichir ${count.toLocaleString()} ${count === 1 ? "entreprise" : "entreprises"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "entreprise enrichie" : "entreprises enrichies"}`,
    usageLabel: (count: number) => `Enrichissement · Entreprises (${count})`,
  },
  de: {
    title: "Unternehmen anreichern",
    modeLabel: "Anreicherungsmodus",
    modeOnce: "Einmalig beim Hinzufügen",
    modeContinuous: "Fortlaufend",
    description:
      "Holt alles Verfügbare pro Unternehmen — Kontaktdaten, aktuelle Investitionen oder Einstellungsaktivität und mehr.",
    toEnrich: "Zu bereichernde Unternehmen",
    total: "Gesamt",
    perCompany: (n: number) => `${n.toLocaleString()} Credits`,
    credits: "Credits",
    balanceAfter: "Guthaben danach",
    allEnriched: "Alle ausgewählten Unternehmen haben das bereits.",
    cancel: "Abbrechen",
    enrich: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "Unternehmen" : "Unternehmen"} anreichern`,
    done: (count: number) =>
      `${count.toLocaleString()} Unternehmen angereichert`,
    usageLabel: (count: number) => `Anreicherung · Unternehmen (${count})`,
  },
  pt: {
    title: "Enriquecer empresas",
    modeLabel: "Modo de enriquecimento",
    modeOnce: "Uma vez ao adicionar",
    modeContinuous: "Continuamente",
    description:
      "Obtém tudo o que está disponível por empresa — dados de contacto, investimento recente ou atividade de contratação, e mais.",
    toEnrich: "Empresas a enriquecer",
    total: "Total",
    perCompany: (n: number) => `${n.toLocaleString()} créditos`,
    credits: "créditos",
    balanceAfter: "Saldo depois",
    allEnriched: "Todas as empresas selecionadas já têm isto.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "empresa" : "empresas"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "empresa enriquecida" : "empresas enriquecidas"}`,
    usageLabel: (count: number) => `Enriquecimento · Empresas (${count})`,
  },
  pt_BR: {
    title: "Enriquecer empresas",
    modeLabel: "Modo de enriquecimento",
    modeOnce: "Uma vez ao adicionar",
    modeContinuous: "Continuamente",
    description:
      "Traz tudo o que está disponível por empresa — dados de contato, investimento recente ou atividade de contratação, e mais.",
    toEnrich: "Empresas a enriquecer",
    total: "Total",
    perCompany: (n: number) => `${n.toLocaleString()} créditos`,
    credits: "créditos",
    balanceAfter: "Saldo depois",
    allEnriched: "Todas as empresas selecionadas já têm isso.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "empresa" : "empresas"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "empresa enriquecida" : "empresas enriquecidas"}`,
    usageLabel: (count: number) => `Enriquecimento · Empresas (${count})`,
  },
} as const

export function CompanyEnrichDialog({
  open,
  onOpenChange,
  accounts,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  // When set, shows a mode toggle (once on add / continuously) that writes
  // straight to the list's own enrichment setting — used only when this
  // dialog is opened from a list's settings box.
  list?: ProspectList
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { balance, spend } = useCredits()

  const batch = accounts.filter((a) => !isCompanyEnriched(a))
  const cost = batch.length * COMPANY_ENRICH_COST
  const after = balance - cost
  const affordable = after >= 0

  function setMode(mode: EnrichmentMode) {
    if (list) listStore.update(list.id, { enrichment: mode })
  }

  function handleEnrich() {
    if (batch.length === 0) return
    const ok = spend(cost, c.usageLabel(batch.length))
    if (!ok) return
    accountStore.enrich(batch.map((a) => a.id))
    toast.success(c.done(batch.length))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Layers className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        {list && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {c.modeLabel}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "once" as const, label: c.modeOnce },
                  { value: "continuous" as const, label: c.modeContinuous },
                ] as const
              ).map((opt) => {
                const active = (list.enrichment ?? "once") === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-lg border p-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                        : "hover:bg-muted/60"
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {batch.length === 0 ? (
          <p className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
            <Check className="text-chart-1 size-4" />
            {c.allEnriched}
          </p>
        ) : (
          <div className="bg-muted/40 space-y-2 rounded-lg border p-3 text-sm">
            <Row
              label={`${c.toEnrich} · ${batch.length.toLocaleString()} × ${COMPANY_ENRICH_COST} ${c.credits}`}
              value={c.perCompany(cost)}
            />
            <div className="border-t pt-2">
              <Row label={c.total} value={c.perCompany(cost)} strong />
              <Row
                label={c.balanceAfter}
                value={c.perCompany(Math.max(0, after))}
                muted={!affordable}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          {batch.length > 0 && (
            <Button variant="volt" onClick={handleEnrich} disabled={!affordable}>
              <Layers className="size-4" />
              {c.enrich(batch.length)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string
  value: string
  strong?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          muted
            ? "text-destructive tabular-nums"
            : strong
              ? "font-semibold tabular-nums"
              : "tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  )
}
