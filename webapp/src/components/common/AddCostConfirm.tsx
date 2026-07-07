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
