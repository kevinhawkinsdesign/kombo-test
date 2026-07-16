import { Coins, Sparkles } from "lucide-react"

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
import { SAVE_COST } from "@/lib/enrichment"

type Entity = "people" | "companies"

const COPY = {
  en: {
    titlePeople: (n: number) => `Add ${n} ${n === 1 ? "prospect" : "prospects"}?`,
    titleCompanies: (n: number) => `Add ${n} ${n === 1 ? "company" : "companies"}?`,
    toTarget: (name: string) => `They'll be added to ${name}.`,
    estimatePeople: (n: number, credits: number) =>
      `${n.toLocaleString()} × ${SAVE_COST.prospect} credits = ≈ ${credits.toLocaleString()} credits`,
    estimateCompanies: "Free to save · 0 credits",
    note: "Credits are only spent when you save — enrichment is charged separately.",
    cancel: "Cancel",
    confirmPeople: (credits: number) => `≈ ${credits.toLocaleString()} credits`,
    confirmCompanies: (n: number) => `Add ${n.toLocaleString()}`,
  },
  es: {
    titlePeople: (n: number) => `¿Añadir ${n} ${n === 1 ? "prospecto" : "prospectos"}?`,
    titleCompanies: (n: number) => `¿Añadir ${n} ${n === 1 ? "empresa" : "empresas"}?`,
    toTarget: (name: string) => `Se añadirán a ${name}.`,
    estimatePeople: (n: number, credits: number) =>
      `${n.toLocaleString()} × ${SAVE_COST.prospect} créditos = ≈ ${credits.toLocaleString()} créditos`,
    estimateCompanies: "Guardar es gratis · 0 créditos",
    note: "Los créditos solo se gastan al guardar — el enriquecimiento se cobra aparte.",
    cancel: "Cancelar",
    confirmPeople: (credits: number) => `≈ ${credits.toLocaleString()} créditos`,
    confirmCompanies: (n: number) => `Añadir ${n.toLocaleString()}`,
  },
  it: {
    titlePeople: (n: number) => `Aggiungere ${n} prospect?`,
    titleCompanies: (n: number) => `Aggiungere ${n} ${n === 1 ? "azienda" : "aziende"}?`,
    toTarget: (name: string) => `Verranno aggiunti a ${name}.`,
    estimatePeople: (n: number, credits: number) =>
      `${n.toLocaleString()} × ${SAVE_COST.prospect} crediti = ≈ ${credits.toLocaleString()} crediti`,
    estimateCompanies: "Salvataggio gratuito · 0 crediti",
    note: "I crediti si spendono solo al salvataggio — l'arricchimento viene addebitato separatamente.",
    cancel: "Annulla",
    confirmPeople: (credits: number) => `≈ ${credits.toLocaleString()} crediti`,
    confirmCompanies: (n: number) => `Aggiungi ${n.toLocaleString()}`,
  },
  fr: {
    titlePeople: (n: number) => `Ajouter ${n} ${n === 1 ? "prospect" : "prospects"} ?`,
    titleCompanies: (n: number) => `Ajouter ${n} ${n === 1 ? "entreprise" : "entreprises"} ?`,
    toTarget: (name: string) => `Ils seront ajoutés à ${name}.`,
    estimatePeople: (n: number, credits: number) =>
      `${n.toLocaleString()} × ${SAVE_COST.prospect} crédits = ≈ ${credits.toLocaleString()} crédits`,
    estimateCompanies: "Gratuit à enregistrer · 0 crédit",
    note: "Les crédits ne sont dépensés qu'à l'enregistrement — l'enrichissement est facturé séparément.",
    cancel: "Annuler",
    confirmPeople: (credits: number) => `≈ ${credits.toLocaleString()} crédits`,
    confirmCompanies: (n: number) => `Ajouter ${n.toLocaleString()}`,
  },
  de: {
    titlePeople: (n: number) => `${n} ${n === 1 ? "Prospect" : "Prospects"} hinzufügen?`,
    titleCompanies: (n: number) => `${n} Unternehmen hinzufügen?`,
    toTarget: (name: string) => `Sie werden zu ${name} hinzugefügt.`,
    estimatePeople: (n: number, credits: number) =>
      `${n.toLocaleString()} × ${SAVE_COST.prospect} Credits = ≈ ${credits.toLocaleString()} Credits`,
    estimateCompanies: "Kostenlos zu speichern · 0 Credits",
    note: "Credits werden nur beim Speichern verbraucht — die Anreicherung wird separat berechnet.",
    cancel: "Abbrechen",
    confirmPeople: (credits: number) => `≈ ${credits.toLocaleString()} Credits`,
    confirmCompanies: (n: number) => `${n.toLocaleString()} hinzufügen`,
  },
  pt: {
    titlePeople: (n: number) => `Adicionar ${n} ${n === 1 ? "prospect" : "prospects"}?`,
    titleCompanies: (n: number) => `Adicionar ${n} ${n === 1 ? "empresa" : "empresas"}?`,
    toTarget: (name: string) => `Serão adicionados a ${name}.`,
    estimatePeople: (n: number, credits: number) =>
      `${n.toLocaleString()} × ${SAVE_COST.prospect} créditos = ≈ ${credits.toLocaleString()} créditos`,
    estimateCompanies: "Guardar é gratuito · 0 créditos",
    note: "Os créditos só são gastos ao guardar — o enriquecimento é cobrado à parte.",
    cancel: "Cancelar",
    confirmPeople: (credits: number) => `≈ ${credits.toLocaleString()} créditos`,
    confirmCompanies: (n: number) => `Adicionar ${n.toLocaleString()}`,
  },
  pt_BR: {
    titlePeople: (n: number) => `Adicionar ${n} ${n === 1 ? "prospect" : "prospects"}?`,
    titleCompanies: (n: number) => `Adicionar ${n} ${n === 1 ? "empresa" : "empresas"}?`,
    toTarget: (name: string) => `Serão adicionados a ${name}.`,
    estimatePeople: (n: number, credits: number) =>
      `${n.toLocaleString()} × ${SAVE_COST.prospect} créditos = ≈ ${credits.toLocaleString()} créditos`,
    estimateCompanies: "Salvar é grátis · 0 créditos",
    note: "Os créditos só são gastos ao salvar — o enriquecimento é cobrado separadamente.",
    cancel: "Cancelar",
    confirmPeople: (credits: number) => `≈ ${credits.toLocaleString()} créditos`,
    confirmCompanies: (n: number) => `Adicionar ${n.toLocaleString()}`,
  },
} as const

/**
 * Final confirmation shown right before a selection is committed to a list or
 * campaign, with the credit estimate. People cost {SAVE_COST.prospect} credits
 * each; companies are free to save. Self-contained so it can be nested inside
 * other (even full-screen) dialogs — Radix stacks dialogs cleanly.
 */
export function AddCostConfirm({
  open,
  onOpenChange,
  count,
  entity,
  targetName,
  actionLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  count: number
  entity: Entity
  targetName?: string
  actionLabel?: string
  onConfirm: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const isPeople = entity === "people"
  const credits = count * SAVE_COST.prospect
  const title = isPeople ? c.titlePeople(count) : c.titleCompanies(count)

  // Optional muted breadcrumb — the action and/or target it commits to.
  const context = [actionLabel, targetName].filter(Boolean).join(" · ")

  function handleConfirm() {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {targetName ? (
            <DialogDescription>{c.toTarget(targetName)}</DialogDescription>
          ) : context ? (
            <DialogDescription>{context}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
          <span
            className={
              isPeople
                ? "bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md"
                : "bg-chart-1/10 text-chart-1 flex size-9 shrink-0 items-center justify-center rounded-md"
            }
          >
            {isPeople ? <Coins className="size-4" /> : <Sparkles className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium tabular-nums">
              {isPeople ? c.estimatePeople(count, credits) : c.estimateCompanies}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">{c.note}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleConfirm}>
            {isPeople ? c.confirmPeople(credits) : c.confirmCompanies(count)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
