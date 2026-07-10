import * as React from "react"
import { toast } from "sonner"
import { Layers, Mail, Phone, Database, Check, TriangleAlert } from "lucide-react"

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
  ENRICH_COST,
  MAX_ENRICH_BATCH,
  needsEnrichScope,
  type EnrichScope,
} from "@/lib/enrichment"
import { prospectStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    title: "Enrich prospects",
    description:
      "Reveal verified emails and direct dials, plus 30+ data points per prospect.",
    chooseScope: "What do you want to reveal? Pick any combination.",
    scopeEmail: "Verified email",
    scopePhone: "Phone number",
    scopeProfile: "Profile enrichment",
    scopeEmailDesc: "Verified work email",
    scopePhoneDesc: "Direct dial & mobile",
    scopeProfileDesc: "Scoring + 30+ data points",
    toEnrich: "Prospects to enrich",
    total: "Total",
    pickOne: "Pick at least one thing to reveal.",
    cappedNote: (max: number) =>
      `Enrichment runs ${max.toLocaleString()} prospects at a time. The rest stay queued.`,
    perContact: "per prospect",
    credits: "credits",
    balanceAfter: "Balance after",
    allEnriched: "Every selected prospect already has this.",
    cancel: "Cancel",
    enrich: (count: number) =>
      `Enrich ${count.toLocaleString()} ${count === 1 ? "prospect" : "prospects"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "prospect" : "prospects"} enriched`,
    queued: (count: number) => ` · ${count.toLocaleString()} queued for the next batch`,
    usageLabel: (count: number, scope: string) => `Enrichment · ${scope} (${count})`,
  },
  es: {
    title: "Enriquecer prospectos",
    description:
      "Revela correos verificados y teléfonos directos, además de más de 30 datos por prospecto.",
    chooseScope: "¿Qué quieres revelar? Elige cualquier combinación.",
    scopeEmail: "Correo verificado",
    scopePhone: "Teléfono",
    scopeProfile: "Perfil enriquecido",
    scopeEmailDesc: "Correo de trabajo verificado",
    scopePhoneDesc: "Teléfono directo y móvil",
    scopeProfileDesc: "Puntuación + más de 30 datos",
    toEnrich: "Prospectos por enriquecer",
    total: "Total",
    pickOne: "Elige al menos una cosa para revelar.",
    cappedNote: (max: number) =>
      `El enriquecimiento procesa ${max.toLocaleString()} prospectos a la vez. El resto queda en cola.`,
    perContact: "por prospecto",
    credits: "créditos",
    balanceAfter: "Saldo después",
    allEnriched: "Todos los prospectos seleccionados ya lo tienen.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "prospecto" : "prospectos"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "prospecto enriquecido" : "prospectos enriquecidos"}`,
    queued: (count: number) => ` · ${count.toLocaleString()} en cola para el próximo lote`,
    usageLabel: (count: number, scope: string) => `Enriquecimiento · ${scope} (${count})`,
  },
} as const

interface EnrichListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The contacts to consider for enrichment (a list's members or a selection).
  prospects: Prospect[]
}

const ALL_SCOPES: EnrichScope[] = ["email", "phone", "profile"]

export function EnrichListDialog({
  open,
  onOpenChange,
  prospects,
}: EnrichListDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { balance, spend } = useCredits()
  // The three reveals are independent — start with all selected, deselect freely.
  const [selected, setSelected] = React.useState<Set<EnrichScope>>(
    () => new Set(ALL_SCOPES)
  )

  const scopeOptions: {
    value: EnrichScope
    label: string
    desc: string
    icon: typeof Mail
  }[] = [
    { value: "email", label: c.scopeEmail, desc: c.scopeEmailDesc, icon: Mail },
    { value: "phone", label: c.scopePhone, desc: c.scopePhoneDesc, icon: Phone },
    { value: "profile", label: c.scopeProfile, desc: c.scopeProfileDesc, icon: Database },
  ]

  function toggleScope(scope: EnrichScope) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) next.delete(scope)
      else next.add(scope)
      return next
    })
  }

  const scopes = ALL_SCOPES.filter((s) => selected.has(s))
  // Contacts needing at least one selected reveal, capped to one batch.
  const affected = prospects.filter((p) =>
    scopes.some((s) => needsEnrichScope(p, s))
  )
  const batch = affected.slice(0, MAX_ENRICH_BATCH)
  const queued = affected.length - batch.length
  // Per-scope breakdown so the credit math is transparent.
  const perScope = scopes
    .map((s) => {
      const count = batch.filter((p) => needsEnrichScope(p, s)).length
      return { scope: s, count, unit: ENRICH_COST[s], cost: count * ENRICH_COST[s] }
    })
    .filter((x) => x.count > 0)
  const cost = perScope.reduce((sum, x) => sum + x.cost, 0)
  const after = balance - cost
  const affordable = after >= 0
  const scopeLabel = (s: EnrichScope) =>
    scopeOptions.find((o) => o.value === s)?.label ?? s

  function handleEnrich() {
    if (batch.length === 0) return
    const label = scopes.map(scopeLabel).join(" + ")
    const ok = spend(cost, c.usageLabel(batch.length, label))
    if (!ok) return
    // Apply each selected reveal to the contacts that still need it.
    for (const s of scopes) {
      const ids = batch.filter((p) => needsEnrichScope(p, s)).map((p) => p.id)
      if (ids.length > 0) prospectStore.enrich(ids, s)
    }
    toast.success(c.done(batch.length) + (queued > 0 ? c.queued(queued) : ""))
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

        <div className="space-y-4">
          {/* Scope selector — multi-select, any combination. */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {c.chooseScope}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {scopeOptions.map((o) => {
                const Icon = o.icon
                const isActive = selected.has(o.value)
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleScope(o.value)}
                    aria-pressed={isActive}
                    className={cn(
                      "relative flex flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors",
                      isActive
                        ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                        : "hover:bg-muted/60"
                    )}
                  >
                    {isActive && (
                      <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full">
                        <Check className="size-3" />
                      </span>
                    )}
                    <Icon
                      className={cn(
                        "size-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-xs font-medium">{o.label}</span>
                    <span className="text-muted-foreground text-[11px] leading-tight">
                      {o.desc}
                    </span>
                    <span className="text-primary mt-0.5 text-[11px] font-semibold tabular-nums">
                      {ENRICH_COST[o.value]} {c.credits}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {scopes.length === 0 ? (
            <p className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
              <TriangleAlert className="text-chart-4 size-4" />
              {c.pickOne}
            </p>
          ) : batch.length === 0 ? (
            <p className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
              <Check className="text-chart-1 size-4" />
              {c.allEnriched}
            </p>
          ) : (
            <>
              <div className="bg-muted/40 space-y-2 rounded-lg border p-3 text-sm">
                <Row label={c.toEnrich} value={batch.length.toLocaleString()} />
                {perScope.map((x) => (
                  <Row
                    key={x.scope}
                    label={`${scopeLabel(x.scope)} · ${x.count.toLocaleString()} × ${x.unit}`}
                    value={`${x.cost.toLocaleString()} ${c.credits}`}
                  />
                ))}
                <div className="border-t pt-2">
                  <Row
                    label={c.total}
                    value={`${cost.toLocaleString()} ${c.credits}`}
                    strong
                  />
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
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          {scopes.length > 0 && batch.length > 0 && (
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
