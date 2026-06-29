import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Play,
  Plus,
  Search as SearchIcon,
  Send,
  Sparkles,
  ArrowRight,
  Mail,
  MessageCircle,
  Check,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { isEnriched } from "@/lib/enrichment"
import { useLists, useCampaigns, useProspects } from "@/lib/store"
import {
  useWorkspace,
  useWorkspaces,
  workspaceStore,
  ownerOf,
} from "@/lib/workspaces"
import type { Campaign, ProspectList, Prospect, StepChannel } from "@/lib/types"

type Step = "source" | "audience" | "outreach"

const COPY = {
  en: {
    back: "Workspaces",
    untitled: "Untitled workspace",
    namePlaceholder: "Name this workspace…",
    run: "Run workspace",
    running: "Running workspace — we'll refresh each step",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "list" : "lists"} · ${campaigns} live ${campaigns === 1 ? "campaign" : "campaigns"} · synced recently`,
    stepSource: "Source",
    stepAudience: "Audience",
    stepOutreach: "Outreach",
    catSource: "Source",
    catAudience: "Audience",
    catOutreach: "Outreach",
    titleSearch: "Search",
    titleLists: "Lists",
    titleCampaign: "Campaign",
    found: (n: number) => `${n.toLocaleString()} found`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "list" : "lists"} · ${p.toLocaleString()} people`,
    multichannel: "multichannel",
    stComplete: "complete",
    stEnriching: "enriching",
    stLive: "live",
    stReady: "ready",
    addFilter: "Add filter",
    matching: (p: number, co: number) =>
      `Matching ${p.toLocaleString()} people across ${co.toLocaleString()} companies — push results into a list to start enriching.`,
    noSource: "No source search yet.",
    runSearch: "Run a search",
    newList: "New list",
    enrichAll: "Enrich all",
    pushToCampaign: "Push to campaign →",
    enrichedToast: (name: string) => `Enriching ${name}…`,
    pushedToast: "Pushed to campaign",
    colName: "Name",
    colCompany: "Company",
    colLocation: "Location",
    colEmail: "Email",
    colStatus: "Status",
    stEnriched: "Enriched",
    stQueued: "Queued",
    stPending: "Pending",
    tableFoot: (n: number, e: number) =>
      `${n} people · ${e} enriched · auto-refreshing every 24h`,
    noLists: "No lists yet — push search results into a list.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `Pulling from ${lists === 1 ? "1 list" : `all ${lists} lists`} · ${enrolled.toLocaleString()} enrolled · ${reply}% reply rate`,
    pause: "Pause",
    paused: "Campaign paused",
    editSteps: "Edit steps",
    day: (n: number) => `Day ${n}`,
    noCampaign: "No campaign yet — add one to start outreach.",
    addCampaign: "Add campaign",
    notFound: "Workspace not found.",
    addLists: "Add lists",
    pickerEmpty: "Nothing to add yet.",
    inOther: (name: string) => `In "${name}"`,
    inOtherUntitled: "In another workspace",
    done: "Done",
  },
  es: {
    back: "Espacios de trabajo",
    untitled: "Espacio sin título",
    namePlaceholder: "Nombra este espacio…",
    run: "Ejecutar espacio",
    running: "Ejecutando el espacio — actualizaremos cada paso",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "lista" : "listas"} · ${campaigns} ${campaigns === 1 ? "campaña activa" : "campañas activas"} · sincronizado hace poco`,
    stepSource: "Fuente",
    stepAudience: "Audiencia",
    stepOutreach: "Difusión",
    catSource: "Fuente",
    catAudience: "Audiencia",
    catOutreach: "Difusión",
    titleSearch: "Búsqueda",
    titleLists: "Listas",
    titleCampaign: "Campaña",
    found: (n: number) => `${n.toLocaleString()} encontrados`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "lista" : "listas"} · ${p.toLocaleString()} personas`,
    multichannel: "multicanal",
    stComplete: "completo",
    stEnriching: "enriqueciendo",
    stLive: "activo",
    stReady: "listo",
    addFilter: "Añadir filtro",
    matching: (p: number, co: number) =>
      `${p.toLocaleString()} personas en ${co.toLocaleString()} empresas — envía resultados a una lista para enriquecer.`,
    noSource: "Aún no hay búsqueda de origen.",
    runSearch: "Ejecutar búsqueda",
    newList: "Nueva lista",
    enrichAll: "Enriquecer todo",
    pushToCampaign: "Enviar a campaña →",
    enrichedToast: (name: string) => `Enriqueciendo ${name}…`,
    pushedToast: "Enviado a la campaña",
    colName: "Nombre",
    colCompany: "Empresa",
    colLocation: "Ubicación",
    colEmail: "Email",
    colStatus: "Estado",
    stEnriched: "Enriquecido",
    stQueued: "En cola",
    stPending: "Pendiente",
    tableFoot: (n: number, e: number) =>
      `${n} personas · ${e} enriquecidos · actualización cada 24 h`,
    noLists: "Aún no hay listas — envía resultados a una lista.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `Desde ${lists === 1 ? "1 lista" : `${lists} listas`} · ${enrolled.toLocaleString()} inscritos · ${reply}% de respuesta`,
    pause: "Pausar",
    paused: "Campaña pausada",
    editSteps: "Editar pasos",
    day: (n: number) => `Día ${n}`,
    noCampaign: "Aún no hay campaña — añade una para empezar.",
    addCampaign: "Añadir campaña",
    notFound: "Espacio de trabajo no encontrado.",
    addLists: "Añadir listas",
    pickerEmpty: "Nada que añadir todavía.",
    inOther: (name: string) => `En «${name}»`,
    inOtherUntitled: "En otro espacio",
    done: "Listo",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function listCount(l: ProspectList): number {
  return l.kind === "company" ? (l.accountIds?.length ?? 0) : l.prospectIds.length
}

const STEP_ICON: Record<StepChannel, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageCircle,
  whatsapp: MessageCircle,
  instagram: MessageCircle,
  linkedin_message: LinkedinIcon,
  linkedin_dm: LinkedinIcon,
  linkedin_inmail: LinkedinIcon,
}
const STEP_LABEL: Record<StepChannel, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  linkedin_message: "LinkedIn",
  linkedin_dm: "LinkedIn DM",
  linkedin_inmail: "LinkedIn InMail",
}

export default function WorkspaceDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const workspace = useWorkspace(id)

  const allLists = useLists()
  const allCampaigns = useCampaigns()
  const prospects = useProspects()

  const [step, setStep] = React.useState<Step>("source")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [selectedListId, setSelectedListId] = React.useState<string | null>(null)

  if (!workspace) {
    return (
      <Page>
        <BackLink label={c.back} />
        <Card className="text-muted-foreground p-10 text-center text-sm">
          {c.notFound}
        </Card>
      </Page>
    )
  }

  const listById = new Map(allLists.map((l) => [l.id, l]))
  const campaignById = new Map(allCampaigns.map((cm) => [cm.id, cm]))
  const lists = workspace.listIds
    .map((lid) => listById.get(lid))
    .filter((l): l is ProspectList => Boolean(l))
  const campaigns = workspace.campaignIds
    .map((cid) => campaignById.get(cid))
    .filter((cm): cm is Campaign => Boolean(cm))
  const campaign = campaigns[0]
  const totalPeople =
    workspace.source?.people ?? lists.reduce((n, l) => n + listCount(l), 0)
  const selectedList = lists.find((l) => l.id === selectedListId) ?? lists[0]

  return (
    <Page>
      <BackLink label={c.back} pill={workspace.name || c.untitled} color={workspace.color} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Input
            value={workspace.name}
            onChange={(e) => workspaceStore.rename(workspace.id, e.target.value)}
            placeholder={c.namePlaceholder}
            aria-label={c.namePlaceholder}
            clearable={false}
            className="hover:border-input focus-visible:border-input h-auto border-transparent !text-2xl font-bold shadow-none"
          />
          <p className="text-muted-foreground mt-1 px-3 text-sm">
            {c.summary(lists.length, campaigns.length)}
          </p>
        </div>
        <Button variant="volt" onClick={() => toast.success(c.running)}>
          <Play className="size-4" />
          {c.run}
        </Button>
      </div>

      {/* Pipeline */}
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        <PipelineCard
          n={1}
          category={c.catSource}
          title={c.titleSearch}
          chip={workspace.source ? c.found(workspace.source.found) : c.runSearch}
          status={c.stComplete}
          tone="complete"
          active={step === "source"}
          onClick={() => setStep("source")}
        />
        <Arrow />
        <PipelineCard
          n={2}
          category={c.catAudience}
          title={c.titleLists}
          chip={c.listsPeople(lists.length, totalPeople)}
          status={c.stEnriching}
          tone="enriching"
          active={step === "audience"}
          onClick={() => setStep("audience")}
        />
        <Arrow />
        <PipelineCard
          n={3}
          category={c.catOutreach}
          title={c.titleCampaign}
          chip={c.multichannel}
          status={campaign ? c.stLive : c.stReady}
          tone={campaign ? "live" : "ready"}
          active={step === "outreach"}
          onClick={() => setStep("outreach")}
        />
      </div>

      {/* Detail panel */}
      <div className="mt-6">
        {step === "source" ? (
          <SourcePanel workspace={workspace} c={c} onSearch={() => navigate("/search")} />
        ) : step === "audience" ? (
          <AudiencePanel
            c={c}
            lists={lists}
            selectedList={selectedList}
            onSelectList={setSelectedListId}
            onNewList={() => setPickerOpen(true)}
            prospects={prospects}
            onPush={() => toast.success(c.pushedToast)}
            onEnrich={(name) => toast.success(c.enrichedToast(name))}
          />
        ) : (
          <OutreachPanel
            c={c}
            campaign={campaign}
            listCount={lists.length}
            onEdit={() => campaign && navigate(`/campaigns/${campaign.id}`)}
            onPause={() => toast.success(c.paused)}
          />
        )}
      </div>

      {pickerOpen && (
        <AddListsDialog
          workspaceId={workspace.id}
          allLists={allLists}
          c={c}
          onOpenChange={(o) => !o && setPickerOpen(false)}
        />
      )}
    </Page>
  )
}

function BackLink({ label, pill, color }: { label: string; pill?: string; color?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      <Link
        to="/workspaces"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="size-4" />
        {label}
      </Link>
      {pill && (
        <>
          <span className="text-muted-foreground/50">/</span>
          <span className="bg-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
            <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
            {pill}
          </span>
        </>
      )}
    </div>
  )
}

const TONE: Record<string, string> = {
  complete: "bg-chart-1",
  enriching: "bg-chart-4",
  live: "bg-primary",
  ready: "bg-muted-foreground",
}

function PipelineCard({
  n,
  category,
  title,
  chip,
  status,
  tone,
  active,
  onClick,
}: {
  n: number
  category: string
  title: string
  chip: string
  status: string
  tone: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl border p-4 text-left transition-colors",
        active ? "border-primary ring-primary/30 bg-primary/[0.03] ring-1" : "hover:bg-muted/40"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {n}
        </span>
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {category}
          </p>
          <p className="text-sm font-semibold">{title}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 font-mono text-xs">
          {chip}
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <span className={cn("size-1.5 rounded-full", TONE[tone])} />
          {status}
        </span>
      </div>
    </button>
  )
}

function Arrow() {
  return (
    <ArrowRight className="text-muted-foreground hidden size-5 shrink-0 lg:block" />
  )
}

function SourcePanel({
  workspace,
  c,
  onSearch,
}: {
  workspace: { source?: import("@/lib/workspaces").WorkspaceSource }
  c: Copy
  onSearch: () => void
}) {
  const src = workspace.source
  if (!src) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground text-sm">{c.noSource}</p>
        <Button variant="volt" onClick={onSearch}>
          <SearchIcon className="size-4" />
          {c.runSearch}
        </Button>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border p-4">
        <Sparkles className="text-primary size-5 shrink-0" />
        <p className="text-sm font-medium">{src.prompt}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {src.filters.map((f) => (
          <span
            key={f.label}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm"
          >
            <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              {f.label}
            </span>
            <span className="font-medium">{f.value}</span>
          </span>
        ))}
        <button
          type="button"
          onClick={onSearch}
          className="text-muted-foreground hover:text-foreground hover:border-input inline-flex items-center gap-1 rounded-lg border border-dashed px-3 py-1.5 text-sm"
        >
          <Plus className="size-3.5" />
          {c.addFilter}
        </button>
      </div>
      <p className="text-muted-foreground text-sm">{c.matching(src.people, src.companies)}</p>
    </div>
  )
}

type RowStatus = "enriched" | "queued" | "pending"
function rowStatus(p: Prospect): RowStatus {
  if (isEnriched(p)) return "enriched"
  return p.email ? "queued" : "pending"
}

function AudiencePanel({
  c,
  lists,
  selectedList,
  onSelectList,
  onNewList,
  prospects,
  onPush,
  onEnrich,
}: {
  c: Copy
  lists: ProspectList[]
  selectedList: ProspectList | undefined
  onSelectList: (id: string) => void
  onNewList: () => void
  prospects: Prospect[]
  onPush: () => void
  onEnrich: (name: string) => void
}) {
  if (lists.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground text-sm">{c.noLists}</p>
        <Button variant="outline" onClick={onNewList}>
          <Plus className="size-4" />
          {c.newList}
        </Button>
      </Card>
    )
  }
  const byId = new Map(prospects.map((p) => [p.id, p]))
  const members = selectedList
    ? selectedList.prospectIds
        .map((pid) => byId.get(pid))
        .filter((p): p is Prospect => Boolean(p))
    : []
  const enrichedCount = members.filter((p) => isEnriched(p)).length

  const STATUS_LABEL: Record<RowStatus, string> = {
    enriched: c.stEnriched,
    queued: c.stQueued,
    pending: c.stPending,
  }
  const STATUS_VARIANT: Record<RowStatus, "success" | "secondary" | "outline"> = {
    enriched: "success",
    queued: "secondary",
    pending: "outline",
  }

  return (
    <div>
      {/* List tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-1 border-b">
        {lists.map((l) => {
          const active = selectedList?.id === l.id
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectList(l.id)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.name}
              <span className="text-muted-foreground tabular-nums">{listCount(l)}</span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={onNewList}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-3 py-2 text-sm"
        >
          <Plus className="size-3.5" />
          {c.newList}
        </button>
      </div>

      {selectedList && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">{selectedList.name}</h2>
              {selectedList.description && (
                <p className="text-muted-foreground text-sm">{selectedList.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEnrich(selectedList.name)}
              >
                <Sparkles className="size-4" />
                {c.enrichAll}
              </Button>
              <Button variant="volt" size="sm" onClick={onPush}>
                {c.pushToCampaign}
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b text-xs">
                <tr>
                  <th className="w-10 px-3 py-2 text-left font-medium">#</th>
                  <th className="px-2 py-2 text-left font-medium">{c.colName}</th>
                  <th className="px-2 py-2 text-left font-medium">{c.colCompany}</th>
                  <th className="hidden px-2 py-2 text-left font-medium sm:table-cell">
                    {c.colLocation}
                  </th>
                  <th className="hidden px-2 py-2 text-left font-medium md:table-cell">
                    {c.colEmail}
                  </th>
                  <th className="px-2 py-2 text-right font-medium">{c.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((p, i) => {
                  const st = rowStatus(p)
                  return (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="text-muted-foreground px-3 py-2.5 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-2 py-2.5">
                        <Link
                          to={`/prospects/${p.id}`}
                          className="flex items-center gap-2.5 hover:opacity-80"
                        >
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                            style={{ backgroundColor: p.avatarColor }}
                          >
                            {initials(p.firstName, p.lastName)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {p.firstName} {p.lastName}
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {p.title}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-2 py-2.5">{p.company}</td>
                      <td className="text-muted-foreground hidden px-2 py-2.5 sm:table-cell">
                        {p.location}
                      </td>
                      <td className="text-muted-foreground hidden px-2 py-2.5 md:table-cell">
                        {p.email || "—"}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <Badge variant={STATUS_VARIANT[st]} className="font-normal">
                          {STATUS_LABEL[st]}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
          <p className="text-muted-foreground mt-2 text-xs">
            {c.tableFoot(members.length, enrichedCount)}
          </p>
        </>
      )}
    </div>
  )
}

function OutreachPanel({
  c,
  campaign,
  listCount: lists,
  onEdit,
  onPause,
}: {
  c: Copy
  campaign: Campaign | undefined
  listCount: number
  onEdit: () => void
  onPause: () => void
}) {
  const navigate = useNavigate()
  if (!campaign) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground text-sm">{c.noCampaign}</p>
        <Button variant="volt" onClick={() => navigate("/campaigns")}>
          <Send className="size-4" />
          {c.addCampaign}
        </Button>
      </Card>
    )
  }
  const replyRate = campaign.enrolled
    ? Math.round((campaign.replied / campaign.enrolled) * 100)
    : 0
  const steps = campaign.steps.map((s, i) => ({
    step: s,
    day: campaign.steps
      .slice(0, i + 1)
      .reduce((sum, x) => sum + x.delayDays, 0),
  }))
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
          <div>
            <h2 className="font-semibold">{campaign.name}</h2>
            <p className="text-muted-foreground text-sm">
              {c.pull(lists, campaign.enrolled, replyRate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPause}>
            {c.pause}
          </Button>
          <Button variant="volt" size="sm" onClick={onEdit}>
            {c.editSteps}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map(({ step: s, day }) => {
          const Icon = STEP_ICON[s.channel]
          return (
            <div key={s.id} className="flex gap-3">
              <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-4" />
              </span>
              <Card className="flex-1 gap-1 p-3">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  {c.day(day)} · {STEP_LABEL[s.channel]}
                </p>
                {s.subject && <p className="text-sm font-semibold">{s.subject}</p>}
                <p
                  className={cn(
                    "text-muted-foreground text-sm",
                    s.subject ? "line-clamp-2" : "line-clamp-3"
                  )}
                >
                  {s.body}
                </p>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Compact list-association picker reused for the Audience "+ New list" action.
function AddListsDialog({
  workspaceId,
  allLists,
  c,
  onOpenChange,
}: {
  workspaceId: string
  allLists: ProspectList[]
  c: Copy
  onOpenChange: (open: boolean) => void
}) {
  const workspaces = useWorkspaces()
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.addLists}</DialogTitle>
          <DialogDescription className="sr-only">{c.addLists}</DialogDescription>
        </DialogHeader>
        {allLists.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">{c.pickerEmpty}</p>
        ) : (
          <div className="-mx-2 max-h-[55vh] space-y-0.5 overflow-y-auto px-2">
            {allLists.map((l) => {
              const owner = ownerOf(workspaces, "list", l.id)
              const inThis = owner?.id === workspaceId
              const inOther = owner && !inThis
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    inThis
                      ? workspaceStore.dissociate(workspaceId, "list", l.id)
                      : workspaceStore.associate(workspaceId, "list", l.id)
                  }
                  className="hover:bg-muted/60 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border",
                      inThis ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    )}
                  >
                    {inThis && <Check className="size-3.5" />}
                  </span>
                  <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="min-w-0 flex-1 truncate text-sm">{l.name}</span>
                  {inOther && (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {owner.name ? c.inOther(owner.name) : c.inOtherUntitled}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {c.done}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
