import * as React from "react"
import { toast } from "sonner"
import {
  Search,
  Sparkles,
  ScanSearch,
  Database,
  Send,
  Loader2,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProspectAvatar, ScoreBadge } from "@/components/common/ProspectBits"
import { AddCostConfirm } from "@/components/common/AddCostConfirm"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  useProspects,
  campaignStore,
  prospectStore,
  blacklistedKeySet,
} from "@/lib/store"
import { useLocale } from "@/lib/locale"
import { initials } from "@/lib/format"
import { portraitFor } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import {
  interpretPrompt,
  searchLeads,
  lookalikeLeads,
  LOOKALIKE_SEEDS,
  EMPTY_QUERY,
  SENIORITY_OPTIONS,
  type AiQuery,
  type AiLead,
} from "@/lib/mock-ai-search"
import type { Campaign, Prospect } from "@/lib/types"

type Mode = "db" | "ai" | "lookalike"

const COPY = {
  en: {
    title: "Add prospects",
    desc: (name: string) => `Find and enroll prospects into "${name}".`,
    modeDb: "Your database",
    modeAi: "AI search",
    modeLookalike: "Lookalikes",
    dbPlaceholder: "Search by name, title or company…",
    aiPlaceholder: "Describe who you're looking for — e.g. VPs of Sales at EMEA SaaS…",
    aiRun: "Search",
    thinking: "Kai is searching…",
    seedLabel: "Find prospects similar to",
    pickSeed: "Pick a prospect or company",
    allIndustries: "All industries",
    allSeniority: "All seniority",
    allRegions: "All regions",
    noDb: "No prospects match — try AI search to source new leads.",
    noAi: "Run a prompt to generate a custom list of leads.",
    aiNote: "AI-sourced leads are added to your workspace when enrolled.",
    cancel: "Cancel",
    add: (n: number) => (n > 0 ? `Enroll ${n}` : "Enroll"),
    enrolled: (n: number) => `${n} ${n === 1 ? "prospect" : "prospects"} enrolled`,
    selected: (n: number) => `${n} selected`,
    clear: "Clear",
    blacklistedSkipped: (n: number) =>
      `${n} ${n === 1 ? "prospect" : "prospects"} skipped — company is blacklisted`,
  },
  es: {
    title: "Añadir prospectos",
    desc: (name: string) => `Encuentra e inscribe prospectos en "${name}".`,
    modeDb: "Tu base de datos",
    modeAi: "Búsqueda con IA",
    modeLookalike: "Similares",
    dbPlaceholder: "Busca por nombre, cargo o empresa…",
    aiPlaceholder: "Describe a quién buscas — p. ej. VPs de Ventas en SaaS de EMEA…",
    aiRun: "Buscar",
    thinking: "Kai está buscando…",
    seedLabel: "Buscar prospectos similares a",
    pickSeed: "Elige un prospecto o empresa",
    allIndustries: "Todos los sectores",
    allSeniority: "Toda la antigüedad",
    allRegions: "Todas las regiones",
    noDb: "Ningún prospecto coincide — prueba la búsqueda con IA para conseguir nuevos leads.",
    noAi: "Lanza un prompt para generar una lista de leads a medida.",
    aiNote: "Los leads encontrados por IA se añaden a tu espacio al inscribirlos.",
    cancel: "Cancelar",
    add: (n: number) => (n > 0 ? `Inscribir ${n}` : "Inscribir"),
    enrolled: (n: number) => `${n} ${n === 1 ? "prospecto inscrito" : "prospectos inscritos"}`,
    selected: (n: number) => `${n} seleccionados`,
    clear: "Limpiar",
    blacklistedSkipped: (n: number) =>
      `${n} ${n === 1 ? "prospecto omitido" : "prospectos omitidos"} — empresa en lista negra`,
  },
} as const

const ALL = "all"

function leadToProspectInput(l: AiLead) {
  const email =
    l.emailStatus === "missing"
      ? ""
      : `${l.firstName}.${l.lastName}@${l.companyDomain}`.toLowerCase()
  return {
    firstName: l.firstName,
    lastName: l.lastName,
    title: l.title,
    company: l.company,
    companyDomain: l.companyDomain,
    location: l.location,
    email,
    linkedinUrl: `https://linkedin.com/in/${l.firstName}${l.lastName}`.toLowerCase(),
    avatarColor: l.avatarColor,
    score: l.fit,
    status: "new" as const,
    tags: ["AI search", l.region],
    seniority: l.seniority,
    department: l.department,
    headcount: l.headcount,
    industry: l.industry,
    revenue: l.revenue,
    about: `${l.title} at ${l.company}.`,
    signals: l.signals,
  }
}

export function AddCampaignProspectsDialog({
  open,
  onOpenChange,
  campaign,
  enrolledIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign
  enrolledIds: Set<string>
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const prospects = useProspects()

  const [mode, setMode] = React.useState<Mode>("db")
  const [selectedProspects, setSelectedProspects] = React.useState<Set<string>>(new Set())
  const [selectedLeads, setSelectedLeads] = React.useState<Map<string, AiLead>>(new Map())

  // DB filters
  const [dbQuery, setDbQuery] = React.useState("")
  const [industry, setIndustry] = React.useState(ALL)
  const [seniority, setSeniority] = React.useState(ALL)

  // AI search
  const [prompt, setPrompt] = React.useState("")
  const [aiQuery, setAiQuery] = React.useState<AiQuery | null>(null)
  const [thinking, setThinking] = React.useState(false)

  // Lookalike
  const [seedId, setSeedId] = React.useState<string>("")

  // Credit-cost confirmation shown as the last step before enrolling.
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  // Reset when the dialog opens.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setMode("db")
      setSelectedProspects(new Set())
      setSelectedLeads(new Map())
      setDbQuery("")
      setIndustry(ALL)
      setSeniority(ALL)
      setPrompt("")
      setAiQuery(null)
      setThinking(false)
      setSeedId("")
      setConfirmOpen(false)
    }
  }

  const industries = React.useMemo(
    () => [ALL, ...new Set(prospects.map((p) => p.industry))],
    [prospects]
  )

  const dbResults = React.useMemo(() => {
    const q = dbQuery.trim().toLowerCase()
    return prospects.filter((p) => {
      if (enrolledIds.has(p.id)) return false
      if (industry !== ALL && p.industry !== industry) return false
      if (seniority !== ALL && p.seniority !== seniority) return false
      if (!q) return true
      return `${p.firstName} ${p.lastName} ${p.title} ${p.company}`
        .toLowerCase()
        .includes(q)
    })
  }, [prospects, enrolledIds, dbQuery, industry, seniority])

  const aiResults = React.useMemo(
    () => (aiQuery ? searchLeads(aiQuery) : []),
    [aiQuery]
  )

  const seed = LOOKALIKE_SEEDS.find((s) => s.id === seedId) ?? null
  // A lookalike must start from a specific selected person or company.
  const lookalikeResults = React.useMemo(
    () => (seed ? lookalikeLeads(seed, { ...EMPTY_QUERY }) : []),
    [seed]
  )

  function runPrompt() {
    const text = prompt.trim()
    if (!text) return
    setThinking(true)
    window.setTimeout(() => {
      setAiQuery(interpretPrompt(text).query)
      setThinking(false)
    }, 1200)
  }

  function toggleProspect(id: string) {
    setSelectedProspects((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleLead(lead: AiLead) {
    setSelectedLeads((prev) => {
      const next = new Map(prev)
      if (next.has(lead.id)) next.delete(lead.id)
      else next.set(lead.id, lead)
      return next
    })
  }
  const totalSelected = selectedProspects.size + selectedLeads.size

  // The footer button opens the credit-cost confirmation; enrollment only runs
  // once the user confirms (see commitAdd).
  function handleAdd() {
    if (totalSelected === 0) return
    setConfirmOpen(true)
  }

  function commitAdd() {
    // Skip anyone whose company is on the blacklist — those companies must
    // never be enrolled into a campaign.
    const blocked = blacklistedKeySet()
    const isBlocked = (company: string, domain: string) =>
      blocked.size > 0 &&
      (blocked.has(company.trim().toLowerCase()) ||
        blocked.has(domain.trim().toLowerCase()))

    const ids: string[] = []
    let skipped = 0
    selectedProspects.forEach((id) => {
      const p = prospects.find((x) => x.id === id)
      if (p && isBlocked(p.company, p.companyDomain)) {
        skipped += 1
        return
      }
      ids.push(id)
    })
    selectedLeads.forEach((lead) => {
      if (isBlocked(lead.company, lead.companyDomain)) {
        skipped += 1
        return
      }
      const created = prospectStore.create(leadToProspectInput(lead))
      ids.push(created.id)
    })
    if (skipped > 0) toast.info(c.blacklistedSkipped(skipped))
    if (ids.length === 0) {
      onOpenChange(false)
      return
    }
    campaignStore.addProspects(campaign.id, ids)
    toast.success(c.enrolled(ids.length))
    onOpenChange(false)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton fullScreen>
        <DialogHeader className="border-b p-5 text-left">
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.desc(campaign.name)}</DialogDescription>
        </DialogHeader>

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2 border-b px-5 py-3">
          <ModeTab active={mode === "db"} onClick={() => setMode("db")} icon={Database} label={c.modeDb} />
          <ModeTab active={mode === "ai"} onClick={() => setMode("ai")} icon={Sparkles} label={c.modeAi} />
          <ModeTab active={mode === "lookalike"} onClick={() => setMode("lookalike")} icon={ScanSearch} label={c.modeLookalike} />
        </div>

        {/* Controls */}
        <div className="space-y-3 border-b px-5 py-3">
          {mode === "db" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={dbQuery}
                  onChange={(e) => setDbQuery(e.target.value)}
                  placeholder={c.dbPlaceholder}
                  className="pl-9"
                />
              </div>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger size="sm" className="sm:w-44">
                  <SelectValue placeholder={c.allIndustries} />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i === ALL ? c.allIndustries : i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={seniority} onValueChange={setSeniority}>
                <SelectTrigger size="sm" className="sm:w-40">
                  <SelectValue placeholder={c.allSeniority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{c.allSeniority}</SelectItem>
                  {SENIORITY_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "ai" && (
            <div className="flex items-end gap-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    runPrompt()
                  }
                }}
                placeholder={c.aiPlaceholder}
                rows={2}
                className="min-h-0 resize-none"
              />
              <Button variant="volt" onClick={runPrompt} disabled={!prompt.trim() || thinking}>
                <Send className="size-4" />
                {c.aiRun}
              </Button>
            </div>
          )}

          {mode === "lookalike" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-muted-foreground text-sm">{c.seedLabel}</span>
              <Select value={seedId} onValueChange={setSeedId}>
                <SelectTrigger size="sm" className="sm:w-64">
                  <SelectValue placeholder={c.pickSeed} />
                </SelectTrigger>
                <SelectContent>
                  {LOOKALIKE_SEEDS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {(mode === "ai" || mode === "lookalike") && (
            <p className="text-muted-foreground text-xs">{c.aiNote}</p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {mode === "db" &&
            (dbResults.length === 0 ? (
              <Empty text={c.noDb} />
            ) : (
              dbResults.map((p) => (
                <ProspectRow
                  key={p.id}
                  prospect={p}
                  checked={selectedProspects.has(p.id)}
                  onToggle={() => toggleProspect(p.id)}
                />
              ))
            ))}

          {mode === "ai" &&
            (thinking ? (
              <Thinking text={c.thinking} />
            ) : aiResults.length === 0 ? (
              <Empty text={c.noAi} />
            ) : (
              aiResults.map((l) => (
                <LeadRow
                  key={l.id}
                  lead={l}
                  checked={selectedLeads.has(l.id)}
                  onToggle={() => toggleLead(l)}
                />
              ))
            ))}

          {mode === "lookalike" &&
            (!seed ? (
              <Empty text={c.pickSeed} />
            ) : (
              lookalikeResults.map((l) => (
                <LeadRow
                  key={l.id}
                  lead={l}
                  checked={selectedLeads.has(l.id)}
                  onToggle={() => toggleLead(l)}
                />
              ))
            ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t p-4">
          <p className="text-muted-foreground text-sm">
            {totalSelected > 0 ? c.selected(totalSelected) : ""}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={handleAdd} disabled={totalSelected === 0}>
              <Plus className="size-4" />
              {c.add(totalSelected)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AddCostConfirm
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      count={totalSelected}
      entity="people"
      targetName={campaign.name}
      onConfirm={commitAdd}
    />
    </>
  )
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function ProspectRow({
  prospect,
  checked,
  onToggle,
}: {
  prospect: Prospect
  checked: boolean
  onToggle: () => void
}) {
  const id = `enroll-${prospect.id}`
  return (
    <label
      htmlFor={id}
      className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <ProspectAvatar prospect={prospect} className="size-8" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {prospect.firstName} {prospect.lastName}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {prospect.title} · {prospect.company}
        </p>
      </div>
      <ScoreBadge score={prospect.score} />
    </label>
  )
}

function LeadRow({
  lead,
  checked,
  onToggle,
}: {
  lead: AiLead
  checked: boolean
  onToggle: () => void
}) {
  const id = `lead-${lead.id}`
  return (
    <label
      htmlFor={id}
      className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <Avatar className="size-8">
        <AvatarImage src={portraitFor(`${lead.firstName} ${lead.lastName}`)} alt="" />
        <AvatarFallback style={{ backgroundColor: lead.avatarColor, color: "white" }} className="text-xs">
          {initials(lead.firstName, lead.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {lead.firstName} {lead.lastName}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {lead.title} · {lead.company}
        </p>
      </div>
      <Badge variant="secondary" className="gap-1 font-normal">
        <span className="bg-chart-1 size-1.5 rounded-full" />
        {lead.fit}
      </Badge>
    </label>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-muted-foreground py-12 text-center text-sm">{text}</p>
}

function Thinking({ text }: { text: string }) {
  return (
    <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-sm">
      <Loader2 className="text-primary size-5 animate-spin" />
      {text}
    </div>
  )
}
