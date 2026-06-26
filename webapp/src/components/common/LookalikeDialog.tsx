import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ScanSearch, Users, Building2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/lib/locale"
import {
  lookalikeLeads,
  lookalikeCompanies,
  EMPTY_QUERY,
  type AiLead,
  type AiCompany,
  type LookalikeSeed,
} from "@/lib/mock-ai-search"
import {
  prospectStore,
  accountStore,
  listStore,
  useProspects,
  useAccounts,
} from "@/lib/store"
import type { AccountTier } from "@/lib/types"

export interface LookalikeSeedInput {
  id: string
  name: string
  industry: string
  region: string
  headcount: string
}

const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"]

const COPY = {
  en: {
    title: "Find lookalikes",
    desc: "Records similar to a specific person or company.",
    basedOn: "Similar to",
    excludeDup: "Hide records already in your workspace",
    excludeCrm: "Hide contacts already in your CRM",
    results: (n: number) => `${n} ${n === 1 ? "match" : "matches"}`,
    none: "No matches with these filters — turn a toggle off.",
    add: (n: number) => `Add ${n} to a new list`,
    cancel: "Cancel",
    created: (n: number, name: string) => `Added ${n} to "${name}"`,
  },
  es: {
    title: "Buscar similares",
    desc: "Registros parecidos a una persona o empresa concreta.",
    basedOn: "Similar a",
    excludeDup: "Ocultar registros que ya están en tu espacio",
    excludeCrm: "Ocultar contactos que ya están en tu CRM",
    results: (n: number) => `${n} ${n === 1 ? "coincidencia" : "coincidencias"}`,
    none: "Sin coincidencias con estos filtros — desactiva un interruptor.",
    add: (n: number) => `Añadir ${n} a una nueva lista`,
    cancel: "Cancelar",
    created: (n: number, name: string) => `Añadidos ${n} a "${name}"`,
  },
} as const

// Deterministic mock: ~1/3 of records read as "already in the CRM".
function inCrm(id: string): boolean {
  let h = 0
  for (const ch of id) h += ch.charCodeAt(0)
  return h % 3 === 0
}

/**
 * Find people/companies similar to one chosen seed record, with toggles to hide
 * records already in the workspace or the CRM. Selected matches are saved into
 * a fresh list and the user is taken to it.
 */
export function LookalikeDialog({
  open,
  onOpenChange,
  kind,
  seeds,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  kind: "person" | "company"
  seeds: LookalikeSeedInput[]
  onDone?: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const prospects = useProspects()
  const accounts = useAccounts()

  const [seedId, setSeedId] = React.useState("")
  const [excludeDup, setExcludeDup] = React.useState(true)
  const [excludeCrm, setExcludeCrm] = React.useState(false)
  const [deselected, setDeselected] = React.useState<Set<string>>(new Set())
  const [wasOpen, setWasOpen] = React.useState(false)

  // Reset each time the dialog opens.
  if (open && !wasOpen) {
    setWasOpen(true)
    setSeedId(seeds[0]?.id ?? "")
    setExcludeDup(true)
    setExcludeCrm(false)
    setDeselected(new Set())
  }
  if (!open && wasOpen) setWasOpen(false)

  const chosen = seeds.find((s) => s.id === seedId) ?? seeds[0] ?? null

  const raw = React.useMemo(() => {
    if (!chosen) return []
    const seed: LookalikeSeed = {
      id: chosen.id,
      kind,
      name: chosen.name,
      sub: "",
      industry: chosen.industry,
      region: chosen.region,
      headcount: chosen.headcount,
    }
    return kind === "person"
      ? lookalikeLeads(seed, EMPTY_QUERY)
      : lookalikeCompanies(seed, EMPTY_QUERY)
  }, [chosen, kind])

  function isDuplicate(r: AiLead | AiCompany): boolean {
    if (kind === "person") {
      const l = r as AiLead
      return prospects.some(
        (p) => p.firstName === l.firstName && p.lastName === l.lastName
      )
    }
    const co = r as AiCompany
    return accounts.some(
      (a) =>
        a.domain.toLowerCase() === co.domain.toLowerCase() ||
        a.name.toLowerCase() === co.name.toLowerCase()
    )
  }

  const filtered = raw
    .filter((r) => !(excludeDup && isDuplicate(r)))
    .filter((r) => !(excludeCrm && inCrm(r.id)))
    .slice(0, 24)
  const selected = filtered.filter((r) => !deselected.has(r.id))

  function toggle(id: string) {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function finish(listId: string, count: number, name: string) {
    toast.success(c.created(count, name))
    onOpenChange(false)
    onDone?.()
    navigate(`/lists/${listId}`)
  }

  function addToList() {
    if (!chosen || selected.length === 0) return
    const name = `${c.basedOn} ${chosen.name}`
    const color = COLORS[chosen.name.length % COLORS.length]
    if (kind === "person") {
      const ids = (selected as AiLead[]).map(
        (l) =>
          prospectStore.create({
            firstName: l.firstName,
            lastName: l.lastName,
            title: l.title,
            company: l.company,
            companyDomain: l.companyDomain,
            location: l.location,
            email: `${l.firstName}.${l.lastName}@${l.companyDomain}`
              .toLowerCase()
              .replace(/\s+/g, ""),
            linkedinUrl: "",
            avatarColor: l.avatarColor,
            score: l.fit,
            status: "new",
            tags: [],
            seniority: l.seniority,
            department: l.department,
            headcount: l.headcount,
            industry: l.industry,
            revenue: l.revenue,
            about: "",
            signals: l.signals,
            source: "search",
            enriched: false,
          }).id
      )
      const list = listStore.create({ name, description: "", color, kind: "people" })
      listStore.addProspects(list.id, ids)
      finish(list.id, ids.length, name)
    } else {
      const ids = (selected as AiCompany[]).map((co) => {
        const tier: AccountTier =
          co.headcountNum >= 1000
            ? "Enterprise"
            : co.headcountNum >= 200
              ? "Mid-market"
              : "SMB"
        return accountStore.create({
          name: co.name,
          domain: co.domain,
          industry: co.industry,
          employees: co.headcount,
          revenue: co.revenue,
          location: co.location,
          logoColor: co.logoColor,
          tier,
          healthScore: co.fit,
          openDeals: 0,
          pipeline: 0,
          contacts: 0,
          ownerId: "",
          about: "",
          signals: co.signals,
          keyExecutives: [],
        }).id
      })
      const list = listStore.create({ name, description: "", color, kind: "company" })
      listStore.addAccounts(list.id, ids)
      finish(list.id, ids.length, name)
    }
  }

  const Icon = kind === "person" ? Users : Building2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanSearch className="text-primary size-5" />
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Seed — pick which selected record to base the search on. */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground shrink-0 text-sm">
              {c.basedOn}
            </span>
            {seeds.length > 1 ? (
              <Select value={chosen?.id} onValueChange={setSeedId}>
                <SelectTrigger className="h-8 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seeds.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <Icon className="text-primary size-4" />
                {chosen?.name}
              </span>
            )}
          </div>

          {/* Dedupe toggles */}
          <div className="space-y-2.5 rounded-lg border p-3">
            {[
              { label: c.excludeDup, val: excludeDup, set: setExcludeDup },
              { label: c.excludeCrm, val: excludeCrm, set: setExcludeCrm },
            ].map((t) => (
              <label
                key={t.label}
                className="flex cursor-pointer items-center justify-between gap-3 text-sm"
              >
                <span>{t.label}</span>
                <Switch checked={t.val} onCheckedChange={(v) => t.set(v)} />
              </label>
            ))}
          </div>

          {/* Matches */}
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-medium">
              {c.results(filtered.length)}
            </p>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {c.none}
                </p>
              ) : (
                filtered.map((r) => {
                  const checked = !deselected.has(r.id)
                  const name =
                    kind === "person"
                      ? `${(r as AiLead).firstName} ${(r as AiLead).lastName}`
                      : (r as AiCompany).name
                  const sub =
                    kind === "person"
                      ? `${(r as AiLead).title} · ${(r as AiLead).company}`
                      : `${(r as AiCompany).industry} · ${(r as AiCompany).region}`
                  return (
                    <label
                      key={r.id}
                      className="hover:bg-muted/60 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(r.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {name}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {sub}
                        </span>
                      </span>
                      <span className="bg-chart-1/15 text-chart-1 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                        {r.fit}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={addToList} disabled={selected.length === 0}>
            <ScanSearch className="size-4" />
            {c.add(selected.length)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
