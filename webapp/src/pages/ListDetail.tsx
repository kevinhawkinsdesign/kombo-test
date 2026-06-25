import * as React from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Send,
  Download,
  Pencil,
  Trash2,
  X,
  Plus,
  Sparkles,
  RefreshCw,
  Zap,
  Search,
  Database,
  Pause,
  Columns3,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProspectAvatar,
  ScoreBadge,
} from "@/components/common/ProspectBits"
import { DataTable } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import { TableViews } from "@/components/common/TableViews"
import {
  PEOPLE_COLUMNS,
  PEOPLE_GROUPS,
  PEOPLE_DEFAULT_IDS,
  COMPANY_COLUMNS,
  COMPANY_GROUPS,
  COMPANY_DEFAULT_IDS,
  useColumnPrefs,
} from "@/lib/table-columns"
import { ListFormDialog } from "@/components/lists/ListFormDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { getProspect, getCampaign } from "@/lib/mock-data"
import { getAccount } from "@/lib/mock-extra"
import { useLists, useProspects, useAccounts, listStore } from "@/lib/store"
import { isEnriched } from "@/lib/enrichment"
import { formatDate } from "@/lib/format"
import type { Account, Prospect, ProspectList } from "@/lib/types"

const COPY = {
  en: {
    listNotFound: "List not found.",
    backToLists: "Back to lists",
    lists: "Lists",
    prospects: "prospects",
    edit: "Edit",
    deleteList: "Delete list",
    export: "Export",
    exported: "Exported to CSV",
    startCampaign: "Start campaign",
    enrolled: (count: number) => `${count} enrolled`,
    prospectsHeading: "Prospects",
    addProspects: "Add prospects",
    columns: "Columns",
    colProspect: "Prospect",
    colCompany: "Company",
    colScore: "Score",
    colStatus: "Status",
    removeFromList: (name: string) => `Remove ${name} from list`,
    removed: "Removed from list",
    emptyState: "No prospects yet. Add some to get started.",
    deleteTitle: "Delete list?",
    deleteDescription: (name: string) =>
      `"${name}" will be permanently removed. Prospects stay in your workspace.`,
    deleteConfirm: "Delete",
    listDeleted: "List deleted",
    dynamicPlaylist: "Dynamic playlist",
    live: "Live",
    pauseInflow: "Pause inflow",
    inflowPaused: "Inflow paused — no new prospects will be added",
    audience: "Audience",
    allProspects: "All prospects",
    enrichment: "Enrichment",
    keptFresh: "Kept fresh continuously",
    enrichedOnAdd: "Enriched once on add",
    outreach: "Outreach",
    autoEnrolls: "Auto-enrolls new prospects",
    oneTimeSend: "One-time send",
    noSequence: "No sequence attached",
    newPerWeek: (count: number) => `~${count} new prospects / week`,
    lastSynced: (date: string) => `Last synced ${date}`,
    addProspectsTitle: "Add prospects",
    addProspectsDescription: (name: string) =>
      `Select prospects to add to "${name}".`,
    allAlready: "Every prospect is already in this list.",
    cancel: "Cancel",
    addSelected: "Add selected",
    added: (count: number) =>
      `${count} ${count === 1 ? "prospect" : "prospects"} added`,
    // Enrichment
    dataEnrichment: "Data enrichment",
    allEnriched: "All contacts enriched",
    allEnrichedDesc: "Verified emails, direct dials, and full data points are ready.",
    needEnrichment: (count: number) =>
      `${count} ${count === 1 ? "contact needs" : "contacts need"} enrichment`,
    needEnrichmentDesc:
      "Enrich before launching a campaign for better deliverability and reply rates.",
    enriched: (done: number, total: number) => `${done}/${total} enriched`,
    enrichContacts: (count: number) => `Enrich ${count}`,
    // Warn before campaign
    warnTitle: "Some contacts aren't enriched",
    warnDescription: (count: number) =>
      `${count} ${count === 1 ? "contact" : "contacts"} in this list ${count === 1 ? "hasn't" : "haven't"} been enriched. Campaigns reach more people and bounce less when contacts have verified data. Enrich now, or start anyway?`,
    enrichFirst: "Enrich first",
    startAnyway: "Start anyway",
    // Company lists
    companies: "companies",
    companiesHeading: "Companies",
    addCompanies: "Add companies",
    removeCompany: (name: string) => `Remove ${name} from list`,
    emptyStateCo: "No companies yet. Add some to get started.",
    addCompaniesTitle: "Add companies",
    addCompaniesDescription: (name: string) =>
      `Select companies to add to "${name}".`,
    allAlreadyCo: "Every company is already in this list.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "company" : "companies"} added`,
  },
  es: {
    listNotFound: "Lista no encontrada.",
    backToLists: "Volver a las listas",
    lists: "Listas",
    prospects: "prospectos",
    edit: "Editar",
    deleteList: "Eliminar lista",
    export: "Exportar",
    exported: "Exportado a CSV",
    startCampaign: "Iniciar campaña",
    enrolled: (count: number) => `${count} inscritos`,
    prospectsHeading: "Prospectos",
    addProspects: "Añadir prospectos",
    columns: "Columnas",
    colProspect: "Prospecto",
    colCompany: "Empresa",
    colScore: "Puntuación",
    colStatus: "Estado",
    removeFromList: (name: string) => `Quitar a ${name} de la lista`,
    removed: "Quitado de la lista",
    emptyState: "Aún no hay prospectos. Añade algunos para empezar.",
    deleteTitle: "¿Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" se eliminará de forma permanente. Los prospectos permanecen en tu espacio de trabajo.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    dynamicPlaylist: "Playlist dinámica",
    live: "En vivo",
    pauseInflow: "Pausar entrada",
    inflowPaused: "Entrada pausada — no se añadirán nuevos prospectos",
    audience: "Audiencia",
    allProspects: "Todos los prospectos",
    enrichment: "Enriquecimiento",
    keptFresh: "Actualizada de forma continua",
    enrichedOnAdd: "Enriquecida una vez al añadir",
    outreach: "Contacto",
    autoEnrolls: "Inscribe automáticamente a los nuevos prospectos",
    oneTimeSend: "Envío único",
    noSequence: "Sin secuencia asignada",
    newPerWeek: (count: number) => `~${count} nuevos prospectos / semana`,
    lastSynced: (date: string) => `Última sincronización ${date}`,
    addProspectsTitle: "Añadir prospectos",
    addProspectsDescription: (name: string) =>
      `Selecciona prospectos para añadir a "${name}".`,
    allAlready: "Todos los prospectos ya están en esta lista.",
    cancel: "Cancelar",
    addSelected: "Añadir seleccionados",
    added: (count: number) =>
      `${count} ${count === 1 ? "prospecto añadido" : "prospectos añadidos"}`,
    // Enrichment
    dataEnrichment: "Enriquecimiento de datos",
    allEnriched: "Todos los contactos enriquecidos",
    allEnrichedDesc:
      "Correos verificados, teléfonos directos y datos completos listos.",
    needEnrichment: (count: number) =>
      `${count} ${count === 1 ? "contacto necesita" : "contactos necesitan"} enriquecimiento`,
    needEnrichmentDesc:
      "Enriquece antes de lanzar una campaña para mejorar la entregabilidad y las respuestas.",
    enriched: (done: number, total: number) => `${done}/${total} enriquecidos`,
    enrichContacts: (count: number) => `Enriquecer ${count}`,
    // Warn before campaign
    warnTitle: "Algunos contactos no están enriquecidos",
    warnDescription: (count: number) =>
      `${count} ${count === 1 ? "contacto" : "contactos"} de esta lista no ${count === 1 ? "ha sido enriquecido" : "han sido enriquecidos"}. Las campañas llegan a más personas y rebotan menos cuando los contactos tienen datos verificados. ¿Enriquecer ahora o iniciar de todos modos?`,
    enrichFirst: "Enriquecer primero",
    startAnyway: "Iniciar de todos modos",
    // Company lists
    companies: "empresas",
    companiesHeading: "Empresas",
    addCompanies: "Añadir empresas",
    removeCompany: (name: string) => `Quitar a ${name} de la lista`,
    emptyStateCo: "Aún no hay empresas. Añade algunas para empezar.",
    addCompaniesTitle: "Añadir empresas",
    addCompaniesDescription: (name: string) =>
      `Selecciona empresas para añadir a "${name}".`,
    allAlreadyCo: "Todas las empresas ya están en esta lista.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "empresa añadida" : "empresas añadidas"}`,
  },
} as const

export default function ListDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const navigate = useNavigate()
  const lists = useLists()
  const list = id ? lists.find((l) => l.id === id) : undefined

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [enrichOpen, setEnrichOpen] = React.useState(false)
  const [campaignWarnOpen, setCampaignWarnOpen] = React.useState(false)
  const columnPrefs = useColumnPrefs("list-prospects", PEOPLE_DEFAULT_IDS)
  const accountColumnPrefs = useColumnPrefs("list-accounts", COMPANY_DEFAULT_IDS)

  if (!list) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.listNotFound}</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/lists">{c.backToLists}</Link>
        </Button>
      </Page>
    )
  }

  const isCompany = list.kind === "company"

  const members = list.prospectIds
    .map(getProspect)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const accountMembers = (list.accountIds ?? [])
    .map(getAccount)
    .filter((a): a is NonNullable<typeof a> => Boolean(a))

  const memberCount = isCompany ? accountMembers.length : members.length
  const pending = members.filter((p) => !isEnriched(p))
  const enrichedCount = members.length - pending.length

  function launchCampaign() {
    toast.success(c.enrolled(memberCount))
  }

  function handleStartCampaign() {
    if (!isCompany && pending.length > 0) {
      setCampaignWarnOpen(true)
      return
    }
    launchCampaign()
  }

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/lists">
          <ArrowLeft className="size-4" />
          {c.lists}
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 size-3 rounded-full"
            style={{ backgroundColor: list.color }}
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{list.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {list.description}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {memberCount} {isCompany ? c.companies : c.prospects}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            {c.edit}
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {c.deleteList}
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success(c.exported)}
          >
            <Download className="size-4" />
            {c.export}
          </Button>
          <Button variant="volt" onClick={handleStartCampaign}>
            <Send className="size-4" />
            {c.startCampaign}
          </Button>
        </div>
      </div>

      {list.dynamic && <DynamicPlaylistPanel list={list} />}

      {!isCompany && members.length > 0 && (
        <Card
          className={`mb-6 flex flex-row flex-wrap items-center gap-3 p-4 ${
            pending.length > 0 ? "border-chart-4/40 bg-chart-4/[0.05]" : ""
          }`}
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
              pending.length > 0
                ? "bg-chart-4/15 text-chart-4"
                : "bg-chart-1/15 text-chart-1"
            }`}
          >
            {pending.length > 0 ? (
              <TriangleAlert className="size-4" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
              {pending.length > 0 ? c.needEnrichment(pending.length) : c.allEnriched}
              <Badge variant="secondary" className="font-normal tabular-nums">
                {c.enriched(enrichedCount, members.length)}
              </Badge>
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {pending.length > 0 ? c.needEnrichmentDesc : c.allEnrichedDesc}
            </p>
          </div>
          {pending.length > 0 && (
            <Button variant="volt" onClick={() => setEnrichOpen(true)}>
              <Database className="size-4" />
              {c.enrichContacts(pending.length)}
            </Button>
          )}
        </Card>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">
          {isCompany ? c.companiesHeading : c.prospectsHeading}
        </h3>
        <div className="flex items-center gap-2">
          <TableViews
            tableKey={isCompany ? "list-accounts" : "list-prospects"}
            prefs={isCompany ? accountColumnPrefs : columnPrefs}
          />
          <Button variant="outline" size="sm" onClick={() => setColumnsOpen(true)}>
            <Columns3 className="size-4" />
            <span className="hidden sm:inline">{c.columns}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            {isCompany ? c.addCompanies : c.addProspects}
          </Button>
        </div>
      </div>

      {isCompany ? (
        <DataTable
          columns={COMPANY_COLUMNS}
          visible={accountColumnPrefs.visible}
          rows={accountMembers}
          rowKey={(a) => a.id}
          locale={locale}
          onRowClick={(a) => navigate(`/companies/${a.id}`)}
          empty={c.emptyStateCo}
          pageSize={10}
          actions={(a) => (
            <Button
              variant="ghost"
              size="icon"
              aria-label={c.removeCompany(a.name)}
              className="text-muted-foreground hover:text-destructive size-8"
              onClick={() => {
                listStore.removeAccount(list.id, a.id)
                toast.success(c.removed)
              }}
            >
              <X className="size-4" />
            </Button>
          )}
        />
      ) : (
        <DataTable
          columns={PEOPLE_COLUMNS}
          visible={columnPrefs.visible}
          rows={members}
          rowKey={(p) => p.id}
          locale={locale}
          onRowClick={(p) => navigate(`/prospects/${p.id}`)}
          empty={c.emptyState}
          pageSize={10}
          actions={(p) => (
            <Button
              variant="ghost"
              size="icon"
              aria-label={c.removeFromList(`${p.firstName} ${p.lastName}`)}
              className="text-muted-foreground hover:text-destructive size-8"
              onClick={() => {
                listStore.removeProspect(list.id, p.id)
                toast.success(c.removed)
              }}
            >
              <X className="size-4" />
            </Button>
          )}
        />
      )}

      {isCompany ? (
        <ColumnManager
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={COMPANY_COLUMNS}
          groups={COMPANY_GROUPS}
          prefs={accountColumnPrefs}
          locale={locale}
        />
      ) : (
        <ColumnManager
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={PEOPLE_COLUMNS}
          groups={PEOPLE_GROUPS}
          prefs={columnPrefs}
          locale={locale}
        />
      )}

      <ListFormDialog open={editOpen} onOpenChange={setEditOpen} list={list} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={c.deleteTitle}
        description={c.deleteDescription(list.name)}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          listStore.remove(list.id)
          toast.success(c.listDeleted)
          navigate("/lists")
        }}
      />

      {isCompany ? (
        <AddCompaniesDialog open={addOpen} onOpenChange={setAddOpen} list={list} />
      ) : (
        <AddProspectsDialog open={addOpen} onOpenChange={setAddOpen} list={list} />
      )}

      <EnrichListDialog
        open={enrichOpen}
        onOpenChange={setEnrichOpen}
        pending={pending}
      />

      <ConfirmDialog
        open={campaignWarnOpen}
        onOpenChange={setCampaignWarnOpen}
        title={c.warnTitle}
        description={c.warnDescription(pending.length)}
        confirmLabel={c.startAnyway}
        cancelLabel={c.enrichFirst}
        onCancel={() => setEnrichOpen(true)}
        onConfirm={() => {
          setCampaignWarnOpen(false)
          launchCampaign()
        }}
      />
    </Page>
  )
}

function DynamicPlaylistPanel({ list }: { list: ProspectList }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const campaign = list.campaignId ? getCampaign(list.campaignId) : undefined
  const criteriaChips = list.criteria
    ? [
        ...list.criteria.titles,
        ...list.criteria.seniority,
        ...list.criteria.industries,
        ...list.criteria.headcount,
        ...list.criteria.locations,
        ...list.criteria.signals,
      ]
    : []
  const shown = criteriaChips.slice(0, 6)
  const extra = criteriaChips.length - shown.length

  return (
    <Card className="border-primary/20 from-primary/[0.04] to-card mb-6 gap-0 overflow-hidden bg-gradient-to-br p-0">
      <div className="flex flex-wrap items-center gap-2 border-b p-4">
        <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
          <Sparkles className="size-4" />
        </span>
        <span className="font-medium">{c.dynamicPlaylist}</span>
        <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
          <span className="relative flex size-1.5">
            <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
            <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
          </span>
          {c.live}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => toast(c.inflowPaused)}
        >
          <Pause className="size-4" />
          {c.pauseInflow}
        </Button>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Search className="size-3.5" />
            {c.audience}
          </p>
          <div className="flex flex-wrap gap-1">
            {shown.map((chip) => (
              <Badge key={chip} variant="secondary" className="font-normal">
                {chip}
              </Badge>
            ))}
            {extra > 0 && (
              <Badge variant="outline" className="font-normal">
                +{extra}
              </Badge>
            )}
            {shown.length === 0 && (
              <span className="text-muted-foreground text-sm">
                {list.criteria?.keywords || c.allProspects}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Database className="size-3.5" />
            {c.enrichment}
          </p>
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <RefreshCw className="text-primary size-3.5" />
            {list.enrichment === "continuous" ? c.keptFresh : c.enrichedOnAdd}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Send className="size-3.5" />
            {c.outreach}
          </p>
          {campaign ? (
            <p className="text-sm">
              <Link
                to={`/campaigns/${campaign.id}`}
                className="font-medium hover:underline"
              >
                {campaign.name}
              </Link>
              <span className="text-muted-foreground block text-xs">
                {list.sendMode === "continuous" ? c.autoEnrolls : c.oneTimeSend}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">{c.noSequence}</p>
          )}
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 border-t px-4 py-2.5 text-xs">
        {typeof list.newPerWeek === "number" && (
          <span className="text-foreground flex items-center gap-1 font-medium">
            <Zap className="text-chart-4 size-3.5" />
            {c.newPerWeek(list.newPerWeek)}
          </span>
        )}
        {list.lastSyncedAt && (
          <>
            <span>·</span>
            <span>{c.lastSynced(formatDate(list.lastSyncedAt))}</span>
          </>
        )}
      </div>
    </Card>
  )
}

function AddProspectsDialog({
  open,
  onOpenChange,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: ProspectList
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const prospects = useProspects()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  // Reset the selection whenever the dialog transitions to open (adjusting
  // state during render — the React-recommended pattern).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSelected(new Set())
  }

  const memberIds = React.useMemo(
    () => new Set(list.prospectIds),
    [list.prospectIds]
  )
  const candidates = React.useMemo(
    () => prospects.filter((p) => !memberIds.has(p.id)),
    [prospects, memberIds]
  )

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAdd() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    listStore.addProspects(list.id, ids)
    toast.success(c.added(ids.length))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{c.addProspectsTitle}</DialogTitle>
          <DialogDescription>
            {c.addProspectsDescription(list.name)}
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {c.allAlready}
          </p>
        ) : (
          <div className="-mx-1 max-h-80 space-y-1 overflow-y-auto px-1">
            {candidates.map((p) => (
              <ProspectRow
                key={p.id}
                prospect={p}
                checked={selected.has(p.id)}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button
            variant="volt"
            onClick={handleAdd}
            disabled={selected.size === 0}
          >
            {c.addSelected}
            {selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const checkboxId = `add-prospect-${prospect.id}`
  return (
    <label
      htmlFor={checkboxId}
      className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
    >
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={onToggle}
      />
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

function AddCompaniesDialog({
  open,
  onOpenChange,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: ProspectList
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const accounts = useAccounts()
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSelected(new Set())
  }

  const memberIds = React.useMemo(
    () => new Set(list.accountIds ?? []),
    [list.accountIds]
  )
  const candidates = React.useMemo(
    () => accounts.filter((a) => !memberIds.has(a.id)),
    [accounts, memberIds]
  )

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAdd() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    listStore.addAccounts(list.id, ids)
    toast.success(c.addedCo(ids.length))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{c.addCompaniesTitle}</DialogTitle>
          <DialogDescription>
            {c.addCompaniesDescription(list.name)}
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {c.allAlreadyCo}
          </p>
        ) : (
          <div className="-mx-1 max-h-80 space-y-1 overflow-y-auto px-1">
            {candidates.map((a) => (
              <AccountRow
                key={a.id}
                account={a}
                checked={selected.has(a.id)}
                onToggle={() => toggle(a.id)}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button
            variant="volt"
            onClick={handleAdd}
            disabled={selected.size === 0}
          >
            {c.addSelected}
            {selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AccountRow({
  account,
  checked,
  onToggle,
}: {
  account: Account
  checked: boolean
  onToggle: () => void
}) {
  const checkboxId = `add-account-${account.id}`
  return (
    <label
      htmlFor={checkboxId}
      className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
    >
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={onToggle} />
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white"
        style={{ backgroundColor: account.logoColor }}
      >
        {account.name.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{account.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {account.industry} · {account.location}
        </p>
      </div>
      <Badge variant="secondary" className="font-normal">
        {account.tier}
      </Badge>
    </label>
  )
}
