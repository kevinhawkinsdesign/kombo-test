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
  Layers,
  Pause,
  Columns3,
  ShieldCheck,
  TriangleAlert,
  UserSearch,
  ChevronsUpDown,
  ListTodo,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { useLocale, type Locale } from "@/lib/locale"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DataTable } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import { TableViews } from "@/components/common/TableViews"
import { RecordActionsMenu } from "@/components/common/RecordActionsMenu"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { downloadCsv } from "@/lib/csv"
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
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { getProspect, getCampaign } from "@/lib/mock-data"
import { getAccount } from "@/lib/mock-extra"
import { PlaylistWizard } from "@/components/playlist/PlaylistWizard"
import { useLists, listStore } from "@/lib/store"
import { isEnriched } from "@/lib/enrichment"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ProspectList } from "@/lib/types"

const COPY = {
  en: {
    listNotFound: "List not found.",
    backToLists: "Back to lists",
    lists: "Lists",
    switchList: "Switch list",
    searchLists: "Search lists…",
    groupProspectLists: "Prospect lists",
    groupCompanyLists: "Company lists",
    noListsFound: "No lists match.",
    prospects: "prospects",
    edit: "Edit",
    deleteList: "Delete list",
    export: "Export",
    exported: "Exported to CSV",
    buildPlaylist: "Build a playlist",
    startCampaign: "Start campaign",
    enrolled: (count: number) => `${count} enrolled`,
    prospectsHeading: "Prospects",
    addProspects: "Find prospects",
    columns: "Columns",
    colProspect: "Prospect",
    colCompany: "Company",
    colScore: "Score",
    colStatus: "Status",
    removeFromListAction: "Remove from list",
    removed: "Removed from list",
    removedCount: (n: number) => `${n} removed from list`,
    emptyState: "No prospects yet — add some to get started.",
    deleteTitle: "Delete list?",
    deleteDescription: (name: string) =>
      `"${name}" will be permanently removed. Prospects stay in your workspace.`,
    deleteConfirm: "Delete",
    listDeleted: "List deleted",
    dynamicPlaylist: "Dynamic playlist",
    live: "Live",
    pauseInflow: "Pause inflow",
    inflowPaused: "Inflow paused — no new prospects will be added",
    audience: "Prospects",
    allProspects: "All prospects",
    enrichment: "Enrichment",
    keptFresh: "Kept fresh continuously",
    enrichedOnAdd: "Enriched once on add",
    outreach: "Outreach",
    autoEnrolls: "Auto-enrolls new prospects",
    oneTimeSend: "One-time send",
    noSequence: "No sequence attached",
    reviewManually: "Review manually",
    reviewManuallyDesc: "New matches create a task instead of sending",
    newPerWeek: (count: number) => `~${count} new prospects / week`,
    lastSynced: (date: string) => `Last synced ${date}`,
    addProspectsTitle: "Add prospects",
    addProspectsDescription: (name: string) =>
      `Pull prospects into "${name}" from any source.`,
    allAlready: "Every prospect is already in this list.",
    cancel: "Cancel",
    addSelected: "Add selected",
    added: (count: number) =>
      `${count} ${count === 1 ? "prospect" : "prospects"} added`,
    addSrcAi: "Find with Kombo AI",
    addSrcExisting: "Add from your prospects",
    addSrcImport: "Import from CSV",
    addSrcManual: "Add a contact manually",
    addSrcCrm: "Import from your CRM",
    addSearchExisting: "Search your prospects…",
    addBack: "Back",
    addNoMatch: "No prospects match.",
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
      `${count} ${count === 1 ? "contact" : "contacts"} in this list ${count === 1 ? "hasn't" : "haven't"} been enriched. Campaigns reach more prospects and bounce less when contacts have verified data. Enrich now, or start anyway?`,
    enrichFirst: "Enrich first",
    startAnyway: "Start anyway",
    // Company lists
    companies: "companies",
    companiesHeading: "Companies",
    addCompanies: "Find companies",
    findContacts: "Find contacts",
    emptyStateCo: "No companies yet — add some to get started.",
    addCompaniesTitle: "Add companies",
    addCompaniesDescription: (name: string) =>
      `Pull companies into "${name}" from any source.`,
    allAlreadyCo: "Every company is already in this list.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "company" : "companies"} added`,
    addCoSrcAi: "Find with Kombo AI",
    addCoSrcExisting: "Add from your companies",
    addCoSrcImport: "Import from CSV",
    addCoSrcManual: "Add a company manually",
    addCoSrcCrm: "Import from your CRM",
    addCoSearchExisting: "Search your companies…",
    addCoNoMatch: "No companies match.",
  },
  es: {
    listNotFound: "Lista no encontrada.",
    backToLists: "Volver a las listas",
    lists: "Listas",
    switchList: "Cambiar de lista",
    searchLists: "Buscar listas…",
    groupProspectLists: "Listas de prospectos",
    groupCompanyLists: "Listas de empresas",
    noListsFound: "Ninguna lista coincide.",
    prospects: "prospectos",
    edit: "Editar",
    deleteList: "Eliminar lista",
    export: "Exportar",
    exported: "Exportado a CSV",
    buildPlaylist: "Crear playlist",
    startCampaign: "Iniciar campaña",
    enrolled: (count: number) => `${count} inscritos`,
    prospectsHeading: "Prospectos",
    addProspects: "Buscar prospectos",
    columns: "Columnas",
    colProspect: "Prospecto",
    colCompany: "Empresa",
    colScore: "Puntuación",
    colStatus: "Estado",
    removeFromListAction: "Quitar de la lista",
    removed: "Quitado de la lista",
    removedCount: (n: number) => `${n} quitados de la lista`,
    emptyState: "Aún no hay prospectos — añade algunos para empezar.",
    deleteTitle: "¿Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" se eliminará de forma permanente. Los prospectos permanecen en tu espacio de trabajo.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    dynamicPlaylist: "Playlist dinámica",
    live: "En vivo",
    pauseInflow: "Pausar entrada",
    inflowPaused: "Entrada pausada — no se añadirán nuevos prospectos",
    audience: "Prospectos",
    allProspects: "Todos los prospectos",
    enrichment: "Enriquecimiento",
    keptFresh: "Actualizada de forma continua",
    enrichedOnAdd: "Enriquecida una vez al añadir",
    outreach: "Contacto",
    autoEnrolls: "Inscribe automáticamente a los nuevos prospectos",
    oneTimeSend: "Envío único",
    noSequence: "Sin secuencia asignada",
    reviewManually: "Revisar manualmente",
    reviewManuallyDesc: "Los nuevos coincidentes crean una tarea en lugar de enviarse",
    newPerWeek: (count: number) => `~${count} nuevos prospectos / semana`,
    lastSynced: (date: string) => `Última sincronización ${date}`,
    addProspectsTitle: "Añadir prospectos",
    addProspectsDescription: (name: string) =>
      `Trae prospectos a "${name}" desde cualquier fuente.`,
    allAlready: "Todos los prospectos ya están en esta lista.",
    cancel: "Cancelar",
    addSelected: "Añadir seleccionados",
    added: (count: number) =>
      `${count} ${count === 1 ? "prospecto añadido" : "prospectos añadidos"}`,
    addSrcAi: "Buscar con Kombo AI",
    addSrcExisting: "Añadir desde tus prospectos",
    addSrcImport: "Importar desde CSV",
    addSrcManual: "Añadir un contacto manualmente",
    addSrcCrm: "Importar desde tu CRM",
    addSearchExisting: "Busca tus prospectos…",
    addBack: "Atrás",
    addNoMatch: "Ningún prospecto coincide.",
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
      `${count} ${count === 1 ? "contacto" : "contactos"} de esta lista no ${count === 1 ? "ha sido enriquecido" : "han sido enriquecidos"}. Las campañas llegan a más prospectos y rebotan menos cuando los contactos tienen datos verificados. ¿Enriquecer ahora o iniciar de todos modos?`,
    enrichFirst: "Enriquecer primero",
    startAnyway: "Iniciar de todos modos",
    // Company lists
    companies: "empresas",
    companiesHeading: "Empresas",
    addCompanies: "Buscar empresas",
    findContacts: "Buscar contactos",
    emptyStateCo: "Aún no hay empresas — añade algunas para empezar.",
    addCompaniesTitle: "Añadir empresas",
    addCompaniesDescription: (name: string) =>
      `Trae empresas a "${name}" desde cualquier fuente.`,
    allAlreadyCo: "Todas las empresas ya están en esta lista.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "empresa añadida" : "empresas añadidas"}`,
    addCoSrcAi: "Buscar con Kombo AI",
    addCoSrcExisting: "Añadir desde tus empresas",
    addCoSrcImport: "Importar desde CSV",
    addCoSrcManual: "Añadir una empresa manualmente",
    addCoSrcCrm: "Importar desde tu CRM",
    addCoSearchExisting: "Busca tus empresas…",
    addCoNoMatch: "Ninguna empresa coincide.",
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
  const [findContactsOpen, setFindContactsOpen] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [enrichOpen, setEnrichOpen] = React.useState(false)
  const [campaignWarnOpen, setCampaignWarnOpen] = React.useState(false)
  const [playlistOpen, setPlaylistOpen] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkEnrichOpen, setBulkEnrichOpen] = React.useState(false)
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

  // Bulk selection — the same DataTable selection pattern People/Companies
  // use. Stale ids (removed members) are filtered out at compute time.
  const rowIds = isCompany
    ? accountMembers.map((a) => a.id)
    : members.map((p) => p.id)
  const selectedMembers = members.filter((p) => selectedIds.has(p.id))
  const selectedAccounts = accountMembers.filter((a) => selectedIds.has(a.id))
  const selectedCount = isCompany
    ? selectedAccounts.length
    : selectedMembers.length
  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id))
  const someSelected =
    !allSelected && rowIds.some((id) => selectedIds.has(id))
  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAllRows() {
    setSelectedIds(allSelected ? new Set() : new Set(rowIds))
  }
  const listId = list.id
  function removeSelected() {
    if (isCompany) {
      selectedAccounts.forEach((a) => listStore.removeAccount(listId, a.id))
    } else {
      selectedMembers.forEach((p) => listStore.removeProspect(listId, p.id))
    }
    toast.success(c.removedCount(selectedCount))
    setSelectedIds(new Set())
  }
  function exportSelected() {
    if (isCompany) {
      downloadCsv(
        "companies.csv",
        ["Company", "Industry", "Domain", "Tier"],
        selectedAccounts.map((a) => [a.name, a.industry, a.domain, a.tier])
      )
    } else {
      downloadCsv(
        "people.csv",
        ["Name", "Title", "Company", "Email", "Location"],
        selectedMembers.map((p) => [
          `${p.firstName} ${p.lastName}`,
          p.title,
          p.company,
          p.email,
          p.location,
        ])
      )
    }
    toast.success(c.exported)
    setSelectedIds(new Set())
  }

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
            <ListSwitcher current={list} lists={lists} locale={locale} />
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
          {!list.dynamic && (
            <Button variant="outline" onClick={() => setPlaylistOpen(true)}>
              <Sparkles className="size-4" />
              {c.buildPlaylist}
            </Button>
          )}
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
              <Layers className="size-4" />
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
          {isCompany && accountMembers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFindContactsOpen(true)}
            >
              <UserSearch className="size-4" />
              {c.findContacts}
            </Button>
          )}
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
          selection={{
            isSelected: (a) => selectedIds.has(a.id),
            toggle: (a) => toggleRow(a.id),
            toggleAll: toggleAllRows,
            allSelected,
            someSelected,
          }}
          actions={(a) => (
            <RecordActionsMenu
              kind="company"
              record={a}
              extra={{
                label: c.removeFromListAction,
                icon: <X className="size-4" />,
                destructive: true,
                onClick: () => {
                  listStore.removeAccount(list.id, a.id)
                  toast.success(c.removed)
                },
              }}
            />
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
          selection={{
            isSelected: (p) => selectedIds.has(p.id),
            toggle: (p) => toggleRow(p.id),
            toggleAll: toggleAllRows,
            allSelected,
            someSelected,
          }}
          actions={(p) => (
            <RecordActionsMenu
              kind="person"
              record={p}
              extra={{
                label: c.removeFromListAction,
                icon: <X className="size-4" />,
                destructive: true,
                onClick: () => {
                  listStore.removeProspect(list.id, p.id)
                  toast.success(c.removed)
                },
              }}
            />
          )}
        />
      )}

      <BulkActionsBar
        count={selectedCount}
        onClear={() => setSelectedIds(new Set())}
        onExport={exportSelected}
        onEnrich={isCompany ? undefined : () => setBulkEnrichOpen(true)}
        extra={{
          label: c.removeFromListAction,
          icon: <X className="size-4" />,
          destructive: true,
          onClick: removeSelected,
        }}
      />

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

      <PlaylistWizard open={playlistOpen} onOpenChange={setPlaylistOpen} />

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

      <AddRecordsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        kind={isCompany ? "company" : "contact"}
        listId={list.id}
      />

      {isCompany && (
        <AddRecordsDialog
          open={findContactsOpen}
          onOpenChange={setFindContactsOpen}
          kind="contact"
          scopeCompanies={accountMembers.map((a) => a.name)}
        />
      )}

      <EnrichListDialog
        open={enrichOpen}
        onOpenChange={setEnrichOpen}
        prospects={members}
      />

      {/* Bulk enrich — scoped to the selected members only. */}
      <EnrichListDialog
        open={bulkEnrichOpen}
        onOpenChange={setBulkEnrichOpen}
        prospects={selectedMembers}
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

// Turns the H1 into a switcher so the user can jump to another list without
// going back to /lists — grouped by kind since prospect and company lists
// don't share a namespace.
function ListSwitcher({
  current,
  lists,
  locale,
}: {
  current: ProspectList
  lists: ProspectList[]
  locale: Locale
}) {
  const c = COPY[locale]
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")

  const query = q.trim().toLowerCase()
  const filtered = lists.filter((l) => l.name.toLowerCase().includes(query))
  const peopleLists = filtered.filter((l) => (l.kind ?? "people") !== "company")
  const companyLists = filtered.filter((l) => l.kind === "company")

  function choose(id: string) {
    setOpen(false)
    setQ("")
    if (id !== current.id) navigate(`/lists/${id}`)
  }

  function renderRow(l: ProspectList) {
    return (
      <button
        key={l.id}
        type="button"
        onClick={() => choose(l.id)}
        className={cn(
          "hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
          l.id === current.id && "bg-primary/5"
        )}
      >
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: l.color }}
        />
        <span className="min-w-0 flex-1 truncate">{l.name}</span>
        <span className="bg-muted rounded-full px-1.5 py-0.5 text-[11px] tabular-nums">
          {(l.kind === "company" ? l.accountIds : l.prospectIds)?.length ?? 0}
        </span>
      </button>
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setQ("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={c.switchList}
          className="hover:bg-muted/60 group -ml-1 flex items-center gap-1.5 rounded-md px-1 py-0.5"
        >
          <h2 className="text-xl font-semibold tracking-tight">{current.name}</h2>
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0 opacity-60 group-hover:opacity-100" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={c.searchLists}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {peopleLists.length > 0 && (
            <>
              <p className="text-muted-foreground px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                {c.groupProspectLists}
              </p>
              {peopleLists.map(renderRow)}
            </>
          )}
          {companyLists.length > 0 && (
            <>
              <p className="text-muted-foreground px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                {c.groupCompanyLists}
              </p>
              {companyLists.map(renderRow)}
            </>
          )}
          {filtered.length === 0 && (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              {c.noListsFound}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
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
          {list.reviewMode === "manual_review" ? (
            <p className="text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <ListTodo className="text-primary size-3.5" />
                {c.reviewManually}
              </span>
              <span className="text-muted-foreground block text-xs">
                {c.reviewManuallyDesc}
              </span>
            </p>
          ) : campaign ? (
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
