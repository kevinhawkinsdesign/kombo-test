import { toast } from "sonner"
import { Sparkles, Mail, Phone, Database, Check, TriangleAlert } from "lucide-react"

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
import {
  ENRICH_COST_PER_CONTACT,
  MAX_ENRICH_BATCH,
} from "@/lib/enrichment"
import { prospectStore } from "@/lib/store"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    title: "Enrich contacts",
    description:
      "Reveal verified emails and direct dials, plus 30+ data points per contact.",
    points: [
      "Verified work email",
      "Direct dial & mobile",
      "30+ firmographic data points",
    ],
    toEnrich: "Contacts to enrich",
    cappedNote: (max: number) =>
      `Enrichment runs ${max.toLocaleString()} contacts at a time. The rest stay queued.`,
    perContact: "per contact",
    totalCost: "Total cost",
    credits: "credits",
    balanceAfter: "Balance after",
    allEnriched: "Every contact in this list is already enriched.",
    cancel: "Cancel",
    enrich: (count: number) =>
      `Enrich ${count.toLocaleString()} ${count === 1 ? "contact" : "contacts"}`,
    notEnough: "Not enough credits — top up to continue.",
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "contact" : "contacts"} enriched`,
    queued: (count: number) => ` · ${count.toLocaleString()} queued for the next batch`,
    usageLabel: (count: number) => `List enrichment (${count})`,
  },
  es: {
    title: "Enriquecer contactos",
    description:
      "Revela correos verificados y teléfonos directos, además de más de 30 datos por contacto.",
    points: [
      "Correo de trabajo verificado",
      "Teléfono directo y móvil",
      "Más de 30 datos firmográficos",
    ],
    toEnrich: "Contactos por enriquecer",
    cappedNote: (max: number) =>
      `El enriquecimiento procesa ${max.toLocaleString()} contactos a la vez. El resto queda en cola.`,
    perContact: "por contacto",
    totalCost: "Costo total",
    credits: "créditos",
    balanceAfter: "Saldo después",
    allEnriched: "Todos los contactos de esta lista ya están enriquecidos.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "contacto" : "contactos"}`,
    notEnough: "No tienes créditos suficientes — recarga para continuar.",
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "contacto enriquecido" : "contactos enriquecidos"}`,
    queued: (count: number) => ` · ${count.toLocaleString()} en cola para el próximo lote`,
    usageLabel: (count: number) => `Enriquecimiento de lista (${count})`,
  },
} as const

interface EnrichListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The un-enriched members of the list (already filtered by the caller).
  pending: Prospect[]
}

export function EnrichListDialog({
  open,
  onOpenChange,
  pending,
}: EnrichListDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { balance, spend } = useCredits()

  const batch = pending.slice(0, MAX_ENRICH_BATCH)
  const queued = pending.length - batch.length
  const cost = batch.length * ENRICH_COST_PER_CONTACT
  const after = balance - cost
  const affordable = after >= 0

  function handleEnrich() {
    if (batch.length === 0) return
    const ok = spend(cost, c.usageLabel(batch.length))
    if (!ok) return
    prospectStore.enrich(batch.map((p) => p.id))
    toast.success(
      c.done(batch.length) + (queued > 0 ? c.queued(queued) : "")
    )
    onOpenChange(false)
  }

  const pointIcons = [Mail, Phone, Database]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        {batch.length === 0 ? (
          <p className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
            <Check className="text-chart-1 size-4" />
            {c.allEnriched}
          </p>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-1.5">
              {c.points.map((point, i) => {
                const Icon = pointIcons[i] ?? Database
                return (
                  <li key={point} className="flex items-center gap-2 text-sm">
                    <Icon className="text-muted-foreground size-3.5" />
                    {point}
                  </li>
                )
              })}
            </ul>

            <div className="bg-muted/40 space-y-2 rounded-lg border p-3 text-sm">
              <Row label={c.toEnrich} value={batch.length.toLocaleString()} />
              <Row
                label={`${ENRICH_COST_PER_CONTACT} ${c.credits} ${c.perContact}`}
                value={`${cost.toLocaleString()} ${c.credits}`}
                strong
              />
              <div className="border-t pt-2">
                <Row
                  label={c.balanceAfter}
                  value={`${Math.max(0, after).toLocaleString()} ${c.credits}`}
                  muted={!affordable}
                />
              </div>
            </div>

            {queued > 0 && (
              <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
                <TriangleAlert className="text-chart-4 mt-0.5 size-3.5 shrink-0" />
                {c.cappedNote(MAX_ENRICH_BATCH)}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          {batch.length > 0 && (
            <Button variant="volt" onClick={handleEnrich} disabled={!affordable}>
              <Sparkles className="size-4" />
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
