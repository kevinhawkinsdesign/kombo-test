import * as React from "react"
import { toast } from "sonner"
import { Stars, Mail, Phone, Database, Check, TriangleAlert } from "lucide-react"

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
import { prospectStore, listStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { EnrichmentMode, Prospect, ProspectList } from "@/lib/types"

const COPY = {
  en: {
    title: "Enrich prospects",
    modeLabel: "Enrichment mode",
    modeOff: "No automation",
    modeWarn: (n: number) => `Charges up to ${n} credits per prospect as new ones arrive.`,
    modeContinuous: "Continuously",
    description:
      "Choose which data to reveal — emails, phones, and profile data are enriched independently.",
    chooseScope: "What do you want to reveal? Pick any combination.",
    scopeEmail: "Verified email",
    scopePhone: "Phone number",
    scopeProfile: "Profile enrichment",
    scopeEmailDesc: "Verified work email",
    scopePhoneDesc: "Direct dial & mobile",
    scopeProfileDesc: "LinkedIn, scoring, seniority, function & 30+ data points",
    included: "Included",
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
    modeLabel: "Modo de enriquecimiento",
    modeOff: "Sin automatización",
    modeWarn: (n: number) => `Cobra hasta ${n} créditos por prospecto a medida que llegan nuevos.`,
    modeContinuous: "De forma continua",
    description:
      "Elige qué datos revelar — correos, teléfonos y perfil se enriquecen de forma independiente.",
    chooseScope: "¿Qué quieres revelar? Elige cualquier combinación.",
    scopeEmail: "Correo verificado",
    scopePhone: "Teléfono",
    scopeProfile: "Perfil enriquecido",
    scopeEmailDesc: "Correo de trabajo verificado",
    scopePhoneDesc: "Teléfono directo y móvil",
    scopeProfileDesc: "LinkedIn, puntuación, nivel de antigüedad, función y más de 30 datos",
    included: "Incluido",
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
  it: {
    title: "Arricchisci prospect",
    modeLabel: "Modalità di arricchimento",
    modeOff: "Nessuna automazione",
    modeWarn: (n: number) => `Addebita fino a ${n} crediti per prospect man mano che ne arrivano di nuovi.`,
    modeContinuous: "In continuo",
    description:
      "Scegli quali dati rivelare — email, telefono e profilo vengono arricchiti in modo indipendente.",
    chooseScope: "Cosa vuoi rivelare? Scegli qualsiasi combinazione.",
    scopeEmail: "Email verificata",
    scopePhone: "Numero di telefono",
    scopeProfile: "Arricchimento del profilo",
    scopeEmailDesc: "Email di lavoro verificata",
    scopePhoneDesc: "Numero diretto e cellulare",
    scopeProfileDesc: "LinkedIn, punteggio, seniority, funzione e più di 30 dati",
    included: "Incluso",
    toEnrich: "Prospect da arricchire",
    total: "Totale",
    pickOne: "Scegli almeno una cosa da rivelare.",
    cappedNote: (max: number) =>
      `L'arricchimento elabora ${max.toLocaleString()} prospect alla volta. Il resto resta in coda.`,
    perContact: "per prospect",
    credits: "crediti",
    balanceAfter: "Saldo dopo",
    allEnriched: "Tutti i prospect selezionati ce l'hanno già.",
    cancel: "Annulla",
    enrich: (count: number) =>
      `Arricchisci ${count.toLocaleString()} ${count === 1 ? "prospect" : "prospect"}`,
    done: (count: number) =>
      `${count.toLocaleString()} prospect ${count === 1 ? "arricchito" : "arricchiti"}`,
    queued: (count: number) => ` · ${count.toLocaleString()} in coda per il prossimo lotto`,
    usageLabel: (count: number, scope: string) => `Arricchimento · ${scope} (${count})`,
  },
  fr: {
    title: "Enrichir les prospects",
    modeLabel: "Mode d'enrichissement",
    modeOff: "Aucune automatisation",
    modeWarn: (n: number) => `Facture jusqu'à ${n} crédits par prospect à mesure que de nouveaux arrivent.`,
    modeContinuous: "En continu",
    description:
      "Choisissez les données à révéler — e-mail, téléphone et profil sont enrichis indépendamment.",
    chooseScope: "Que voulez-vous révéler ? Choisissez n'importe quelle combinaison.",
    scopeEmail: "E-mail vérifié",
    scopePhone: "Numéro de téléphone",
    scopeProfile: "Enrichissement du profil",
    scopeEmailDesc: "E-mail professionnel vérifié",
    scopePhoneDesc: "Ligne directe et mobile",
    scopeProfileDesc:
      "LinkedIn, scoring, séniorité, fonction et plus de 30 points de données",
    included: "Inclus",
    toEnrich: "Prospects à enrichir",
    total: "Total",
    pickOne: "Choisissez au moins un élément à révéler.",
    cappedNote: (max: number) =>
      `L'enrichissement traite ${max.toLocaleString()} prospects à la fois. Le reste reste en file d'attente.`,
    perContact: "par prospect",
    credits: "crédits",
    balanceAfter: "Solde après",
    allEnriched: "Tous les prospects sélectionnés l'ont déjà.",
    cancel: "Annuler",
    enrich: (count: number) =>
      `Enrichir ${count.toLocaleString()} ${count === 1 ? "prospect" : "prospects"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "prospect enrichi" : "prospects enrichis"}`,
    queued: (count: number) => ` · ${count.toLocaleString()} en attente pour le prochain lot`,
    usageLabel: (count: number, scope: string) => `Enrichissement · ${scope} (${count})`,
  },
  de: {
    title: "Prospects anreichern",
    modeLabel: "Anreicherungsmodus",
    modeOff: "Keine Automatisierung",
    modeWarn: (n: number) => `Berechnet bis zu ${n} Credits pro Prospect, sobald neue hinzukommen.`,
    modeContinuous: "Fortlaufend",
    description:
      "Wähle, welche Daten aufgedeckt werden — E-Mail, Telefon und Profil werden unabhängig angereichert.",
    chooseScope: "Was möchtest du aufdecken? Wähle eine beliebige Kombination.",
    scopeEmail: "Verifizierte E-Mail",
    scopePhone: "Telefonnummer",
    scopeProfile: "Profilanreicherung",
    scopeEmailDesc: "Verifizierte geschäftliche E-Mail",
    scopePhoneDesc: "Durchwahl & Mobilnummer",
    scopeProfileDesc: "LinkedIn, Scoring, Seniority, Funktion & über 30 Datenpunkte",
    included: "Inbegriffen",
    toEnrich: "Zu bereichernde Prospects",
    total: "Gesamt",
    pickOne: "Wähle mindestens eine Option zum Aufdecken.",
    cappedNote: (max: number) =>
      `Die Anreicherung verarbeitet jeweils ${max.toLocaleString()} Prospects. Der Rest bleibt in der Warteschlange.`,
    perContact: "pro Prospect",
    credits: "Credits",
    balanceAfter: "Guthaben danach",
    allEnriched: "Alle ausgewählten Prospects haben das bereits.",
    cancel: "Abbrechen",
    enrich: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "Prospect" : "Prospects"} anreichern`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "Prospect" : "Prospects"} angereichert`,
    queued: (count: number) =>
      ` · ${count.toLocaleString()} für den nächsten Batch in der Warteschlange`,
    usageLabel: (count: number, scope: string) => `Anreicherung · ${scope} (${count})`,
  },
  pt: {
    title: "Enriquecer prospects",
    modeLabel: "Modo de enriquecimento",
    modeOff: "Sem automação",
    modeWarn: (n: number) => `Cobra até ${n} créditos por prospect à medida que chegam novos.`,
    modeContinuous: "Continuamente",
    description:
      "Escolha os dados a revelar — email, telefone e perfil são enriquecidos de forma independente.",
    chooseScope: "O que quer revelar? Escolha qualquer combinação.",
    scopeEmail: "Email verificado",
    scopePhone: "Número de telefone",
    scopeProfile: "Enriquecimento do perfil",
    scopeEmailDesc: "Email profissional verificado",
    scopePhoneDesc: "Contacto direto e telemóvel",
    scopeProfileDesc:
      "LinkedIn, pontuação, senioridade, função e mais de 30 pontos de dados",
    included: "Incluído",
    toEnrich: "Prospects a enriquecer",
    total: "Total",
    pickOne: "Escolha pelo menos uma coisa para revelar.",
    cappedNote: (max: number) =>
      `O enriquecimento processa ${max.toLocaleString()} prospects de cada vez. O resto fica em fila de espera.`,
    perContact: "por prospect",
    credits: "créditos",
    balanceAfter: "Saldo depois",
    allEnriched: "Todos os prospects selecionados já têm isto.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "prospect" : "prospects"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "prospect enriquecido" : "prospects enriquecidos"}`,
    queued: (count: number) => ` · ${count.toLocaleString()} em fila para o próximo lote`,
    usageLabel: (count: number, scope: string) => `Enriquecimento · ${scope} (${count})`,
  },
  pt_BR: {
    title: "Enriquecer prospects",
    modeLabel: "Modo de enriquecimento",
    modeOff: "Sem automação",
    modeWarn: (n: number) => `Cobra até ${n} créditos por prospect à medida que chegam novos.`,
    modeContinuous: "Continuamente",
    description:
      "Escolha os dados a revelar — email, telefone e perfil são enriquecidos de forma independente.",
    chooseScope: "O que você quer revelar? Escolha qualquer combinação.",
    scopeEmail: "Email verificado",
    scopePhone: "Número de telefone",
    scopeProfile: "Enriquecimento do perfil",
    scopeEmailDesc: "Email profissional verificado",
    scopePhoneDesc: "Contato direto e celular",
    scopeProfileDesc:
      "LinkedIn, pontuação, senioridade, função e mais de 30 pontos de dados",
    included: "Incluído",
    toEnrich: "Prospects a enriquecer",
    total: "Total",
    pickOne: "Escolha pelo menos uma coisa para revelar.",
    cappedNote: (max: number) =>
      `O enriquecimento processa ${max.toLocaleString()} prospects por vez. O restante fica na fila.`,
    perContact: "por prospect",
    credits: "créditos",
    balanceAfter: "Saldo depois",
    allEnriched: "Todos os prospects selecionados já têm isso.",
    cancel: "Cancelar",
    enrich: (count: number) =>
      `Enriquecer ${count.toLocaleString()} ${count === 1 ? "prospect" : "prospects"}`,
    done: (count: number) =>
      `${count.toLocaleString()} ${count === 1 ? "prospect enriquecido" : "prospects enriquecidos"}`,
    queued: (count: number) => ` · ${count.toLocaleString()} na fila para o próximo lote`,
    usageLabel: (count: number, scope: string) => `Enriquecimento · ${scope} (${count})`,
  },
} as const

interface EnrichListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The contacts to consider for enrichment (a list's members or a selection).
  prospects: Prospect[]
  // When set, shows an automation toggle (off / continuously) that writes
  // straight to the list's own enrichment setting — used only when this
  // dialog is opened from a list's settings box, not from a bare selection.
  list?: ProspectList
}

const ALL_SCOPES: EnrichScope[] = ["email", "phone", "profile"]

export function EnrichListDialog({
  open,
  onOpenChange,
  prospects,
  list,
}: EnrichListDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { balance, spend } = useCredits()
  // All three scopes are independent and can be combined freely. Start with
  // everything selected so users understand all three are available.
  const [selected, setSelected] = React.useState<Set<EnrichScope>>(
    () => new Set(ALL_SCOPES)
  )

  function setMode(mode: EnrichmentMode) {
    if (list) listStore.update(list.id, { enrichment: mode })
  }

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

  const isScopeActive = (scope: EnrichScope) => selected.has(scope)

  function toggleScope(scope: EnrichScope) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) next.delete(scope)
      else next.add(scope)
      return next
    })
  }

  // All three scopes are independent — each one charges separately for the
  // contacts that still need it.
  const alaCarteScopes = ALL_SCOPES.filter((s) => selected.has(s))
  const anySelected = alaCarteScopes.length > 0

  const affected =
    alaCarteScopes.length === 0
      ? []
      : prospects.filter((p) => alaCarteScopes.some((s) => needsEnrichScope(p, s)))
  const batch = affected.slice(0, MAX_ENRICH_BATCH)
  const queued = affected.length - batch.length
  const perScope = alaCarteScopes
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
    const label = alaCarteScopes.map(scopeLabel).join(" + ")
    const ok = spend(cost, c.usageLabel(batch.length, label))
    if (!ok) return
    for (const s of alaCarteScopes) {
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
              <Stars className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {list && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                {c.modeLabel}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "off" as const, label: c.modeOff },
                    { value: "continuous" as const, label: c.modeContinuous },
                  ] as const
                ).map((opt) => {
                  const active =
                    (list.enrichment === "continuous" ? "continuous" : "off") ===
                    opt.value
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
              {list.enrichment === "continuous" && (
                <p className="text-muted-foreground flex items-start gap-1.5 text-[11px]">
                  <TriangleAlert className="text-chart-4 mt-0.5 size-3.5 shrink-0" />
                  {c.modeWarn(ENRICH_COST.profile)}
                </p>
              )}
            </div>
          )}

          {/* Scope selector — multi-select, any combination. */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {c.chooseScope}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {scopeOptions.map((o) => {
                const Icon = o.icon
                const isActive = isScopeActive(o.value)
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

          {!anySelected ? (
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
          {anySelected && batch.length > 0 && (
            <Button variant="volt" onClick={handleEnrich} disabled={!affordable}>
              <Stars className="size-4" />
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
