import * as React from "react"
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
    title: "Enrich contacts",
    description:
      "Reveal verified emails and direct dials, plus 30+ data points per contact.",
    chooseScope: "What do you want to reveal?",
    scopeEmail: "Verified email",
    scopePhone: "Phone number",
    scopeFull: "Full enrichment",
    scopeEmailDesc: "Verified work email",
    scopePhoneDesc: "Direct dial & mobile",
    scopeFullDesc: "Email, phone & 30+ data points",
    toEnrich: "Contacts to enrich",
    cappedNote: (max: number) =>
      `Enrichment runs ${max.toLocaleString()} contacts at a time. The rest stay queued.`,
    perContact: "per contact",
    credits: "credits",
    balanceAfter: "Balance after",
    allEnriched: "Every selected contact already has this.",
    cancel: "Cancel",
    enrich: (count: number) =>
      `Enrich ${count.toLocaleString()} ${count === 1 ? "contact" : "contacts"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "contact" : "contacts"} enriched`,
    queued: (count: number) => ` · ${count.toLocaleString()} queued for the next batch`,
    usageLabel: (count: number, scope: string) => `Enrichment · ${scope} (${count})`,
  },
  es: {
    title: "Enriquecer contactos",
    description:
      "Revela correos verificados y teléfonos directos, además de más de 30 datos por contacto.",
    chooseScope: "¿Qué quieres revelar?",
    scopeEmail: "Correo verificado",
    scopePhone: "Teléfono",
    scopeFull: "Enriquecimiento completo",
    scopeEmailDesc: "Correo de trabajo verificado",
    scopePhoneDesc: "Teléfono directo y móvil",
    scopeFullDesc: "Correo, teléfono y más de 30 datos",
    toEnrich: "Contactos por enriquecer",
    cappedNote: (max: number) =>
      `El enriquecimiento procesa ${max.toLocaleString()} contactos a la vez. El resto queda en cola.`,
    perContact: "por contacto",
    credits: "créditos",
    balanceAfter: "Saldo después",
    allEnriched: "Todos los contactos seleccionados ya lo tienen.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "contacto" : "contactos"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "contacto enriquecido" : "contactos enriquecidos"}`,
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

export function EnrichListDialog({
  open,
  onOpenChange,
  prospects,
}: EnrichListDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { balance, spend } = useCredits()
  const [scope, setScope] = React.useState<EnrichScope>("full")

  const scopeOptions: {
    value: EnrichScope
    label: string
    desc: string
    icon: typeof Mail
  }[] = [
    { value: "email", label: c.scopeEmail, desc: c.scopeEmailDesc, icon: Mail },
    { value: "phone", label: c.scopePhone, desc: c.scopePhoneDesc, icon: Phone },
    { value: "full", label: c.scopeFull, desc: c.scopeFullDesc, icon: Database },
  ]

  const pending = prospects.filter((p) => needsEnrichScope(p, scope))
  const batch = pending.slice(0, MAX_ENRICH_BATCH)
  const queued = pending.length - batch.length
  const unit = ENRICH_COST[scope]
  const cost = batch.length * unit
  const after = balance - cost
  const affordable = after >= 0

  function handleEnrich() {
    if (batch.length === 0) return
    const scopeLabel = scopeOptions.find((o) => o.value === scope)?.label ?? scope
    const ok = spend(cost, c.usageLabel(batch.length, scopeLabel))
    if (!ok) return
    prospectStore.enrich(
      batch.map((p) => p.id),
      scope
    )
    toast.success(c.done(batch.length) + (queued > 0 ? c.queued(queued) : ""))
    onOpenChange(false)
  }

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

        <div className="space-y-4">
          {/* Scope selector */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {c.chooseScope}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {scopeOptions.map((o) => {
                const Icon = o.icon
                const isActive = scope === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setScope(o.value)}
                    className={cn(
                      "flex flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors",
                      isActive
                        ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                        : "hover:bg-muted/60"
                    )}
                  >
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

          {batch.length === 0 ? (
            <p className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
              <Check className="text-chart-1 size-4" />
              {c.allEnriched}
            </p>
          ) : (
            <>
              <div className="bg-muted/40 space-y-2 rounded-lg border p-3 text-sm">
                <Row label={c.toEnrich} value={batch.length.toLocaleString()} />
                <Row
                  label={`${unit} ${c.credits} ${c.perContact}`}
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
            </>
          )}
        </div>

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
