import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  Building2,
  Pencil,
  Check,
  Columns3,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/common/DataTable"
import { RecordActionsMenu } from "@/components/common/RecordActionsMenu"
import { ColumnManager } from "@/components/common/ColumnManager"
import { TableViews } from "@/components/common/TableViews"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { SelectionControls } from "@/components/common/SelectionControls"
import { BulkAddDialog } from "@/components/common/BulkAddDialog"
import { BulkCrmSyncDialog } from "@/components/common/BulkCrmSyncDialog"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { downloadCsv } from "@/lib/csv"
import {
  COMPANY_COLUMNS,
  COMPANY_GROUPS,
  COMPANY_DEFAULT_IDS,
  AI_COLUMN_GROUP,
  aiColumnsToDefs,
  useColumnPrefs,
} from "@/lib/table-columns"
import { useAiColumns, aiColumnStore } from "@/lib/ai-columns"
import { AddAiColumnDialog } from "@/components/common/AddAiColumnDialog"
import { EmptyState } from "@/components/common/EmptyState"
import { useAccounts, accountStore, useLists } from "@/lib/store"
import { ListSelector } from "@/components/common/ListSelector"
import { useView } from "@/lib/view-context"
import { usePagedSelection } from "@/lib/use-paged-selection"
import { MAX_ENRICH_BATCH } from "@/lib/enrichment"
import type { Account, AccountTier } from "@/lib/types"

const ALL = "all"
const TIERS: (AccountTier | typeof ALL)[] = [ALL, "Enterprise", "Mid-market", "SMB"]
// Adding to a list happens in one batch at a time, same cap as enrichment —
// keep results paged so "select page" never grabs the whole (1000+) table.
const RESULTS_PER_PAGE = 50

const COPY = {
  en: {
    title: "Companies",
    description:
      "Every company you've found — across searches, imports & lists. Select to enrich, export, or add to a list.",
    exportedToast: (n: number) => `Exported ${n} to CSV`,
    enrichToast: (n: number) => `Enriching ${n} ${n === 1 ? "company" : "companies"}…`,
    lookalikeToast: (n: number) => `Finding lookalikes from ${n} selected…`,
    addCompany: "Find companies",
    addCompanyToast: "Add company — coming soon",
    introTitle: "Target the accounts that fit",
    introDescription:
      "Track companies that match your ICP and get notified when something changes that's worth a call.",
    introPoints: [
      "See headcount, funding & tech stack",
      "Subscribe to hiring and growth signals",
      "Find the full buying committee",
      "Add a whole account to a list",
    ],
    searchPlaceholder: "Search by name, industry, or domain…",
    tier: "Tier",
    allTiers: "All tiers",
    company: "company",
    companies: "companies",
    noMatch: "No companies match your filters.",
    allCompanies: "All companies",
    searchLists: "Search lists…",
    createList: "Create list",
    accountHealth: "Account health",
    openDeals: "Open deals",
    pipeline: "Pipeline",
    contacts: "Contacts",
    unassigned: "Unassigned",
    viewTable: "Table",
    viewCards: "Cards",
    columns: "Columns",
    edit: "Edit",
    done: "Done",
    editingHint: "Editing — changes save automatically",
    selectAll: "Select all",
    capNote: (max: number) => `Only ${max.toLocaleString()} contacts can be added at a time.`,
    colCompany: "Company",
    colIndustry: "Industry",
    colTier: "Tier",
    colEmployees: "Employees",
    colHealth: "Health",
    colOwner: "Owner",
  },
  es: {
    title: "Empresas",
    description:
      "Todas las empresas que has encontrado — de búsquedas, importaciones y listas. Selecciona para enriquecer, exportar o añadir a una lista.",
    exportedToast: (n: number) => `Exportadas ${n} a CSV`,
    enrichToast: (n: number) => `Enriqueciendo ${n} ${n === 1 ? "empresa" : "empresas"}…`,
    lookalikeToast: (n: number) => `Buscando similares de ${n} seleccionadas…`,
    addCompany: "Buscar empresas",
    addCompanyToast: "Añadir empresa — próximamente",
    introTitle: "Apunta a las cuentas que encajan",
    introDescription:
      "Sigue las empresas que coinciden con tu ICP y recibe avisos cuando cambie algo que merezca una llamada.",
    introPoints: [
      "Consulta plantilla, financiación y tecnología",
      "Suscríbete a señales de contratación y crecimiento",
      "Encuentra el comité de compra completo",
      "Añade una cuenta entera a una lista",
    ],
    searchPlaceholder: "Busca por nombre, sector o dominio…",
    tier: "Segmento",
    allTiers: "Todos los segmentos",
    company: "empresa",
    companies: "empresas",
    noMatch: "Ninguna empresa coincide con tus filtros.",
    allCompanies: "Todas las empresas",
    searchLists: "Buscar listas…",
    createList: "Crear lista",
    accountHealth: "Salud de la cuenta",
    openDeals: "Negocios abiertos",
    pipeline: "Pipeline",
    contacts: "Contactos",
    unassigned: "Sin asignar",
    viewTable: "Tabla",
    viewCards: "Tarjetas",
    columns: "Columnas",
    edit: "Editar",
    done: "Listo",
    editingHint: "Editando — los cambios se guardan solos",
    selectAll: "Seleccionar todo",
    capNote: (max: number) => `Solo se pueden añadir ${max.toLocaleString()} contactos a la vez.`,
    colCompany: "Empresa",
    colIndustry: "Sector",
    colTier: "Segmento",
    colEmployees: "Empleados",
    colHealth: "Salud",
    colOwner: "Responsable",
  },
  it: {
    title: "Aziende",
    description:
      "Tutte le aziende che hai trovato — da ricerche, importazioni e liste. Seleziona per arricchire, esportare o aggiungere a una lista.",
    exportedToast: (n: number) => `Esportate ${n} in CSV`,
    enrichToast: (n: number) => `Arricchimento di ${n} ${n === 1 ? "azienda" : "aziende"}…`,
    lookalikeToast: (n: number) => `Ricerca di simili da ${n} selezionate…`,
    addCompany: "Trova aziende",
    addCompanyToast: "Aggiungi azienda — in arrivo",
    introTitle: "Punta agli account giusti",
    introDescription:
      "Segui le aziende in linea con il tuo ICP e ricevi un avviso quando cambia qualcosa che merita una chiamata.",
    introPoints: [
      "Vedi organico, finanziamenti e stack tecnologico",
      "Iscriviti ai segnali di assunzione e crescita",
      "Trova l'intero comitato d'acquisto",
      "Aggiungi un account intero a una lista",
    ],
    searchPlaceholder: "Cerca per nome, settore o dominio…",
    tier: "Segmento",
    allTiers: "Tutti i segmenti",
    company: "azienda",
    companies: "aziende",
    noMatch: "Nessuna azienda corrisponde ai tuoi filtri.",
    allCompanies: "Tutte le aziende",
    searchLists: "Cerca liste…",
    createList: "Crea lista",
    accountHealth: "Salute dell'account",
    openDeals: "Trattative aperte",
    pipeline: "Pipeline",
    contacts: "Contatti",
    unassigned: "Non assegnata",
    viewTable: "Tabella",
    viewCards: "Schede",
    columns: "Colonne",
    edit: "Modifica",
    done: "Fatto",
    editingHint: "In modifica — le modifiche si salvano da sole",
    selectAll: "Seleziona tutto",
    capNote: (max: number) => `Puoi aggiungere solo ${max.toLocaleString()} contatti alla volta.`,
    colCompany: "Azienda",
    colIndustry: "Settore",
    colTier: "Segmento",
    colEmployees: "Dipendenti",
    colHealth: "Salute",
    colOwner: "Proprietario",
  },
  fr: {
    title: "Entreprises",
    description:
      "Toutes les entreprises que vous avez trouvées — recherches, imports et listes. Sélectionnez pour enrichir, exporter ou ajouter à une liste.",
    exportedToast: (n: number) => `${n} exportées en CSV`,
    enrichToast: (n: number) => `Enrichissement de ${n} ${n === 1 ? "entreprise" : "entreprises"}…`,
    lookalikeToast: (n: number) => `Recherche de profils similaires à partir de ${n} sélectionnées…`,
    addCompany: "Trouver des entreprises",
    addCompanyToast: "Ajouter une entreprise — bientôt disponible",
    introTitle: "Ciblez les comptes qui correspondent",
    introDescription:
      "Suivez les entreprises qui correspondent à votre ICP et soyez averti quand un changement mérite un appel.",
    introPoints: [
      "Consultez effectifs, financements et stack technique",
      "Abonnez-vous aux signaux de recrutement et de croissance",
      "Trouvez tout le comité d'achat",
      "Ajoutez un compte entier à une liste",
    ],
    searchPlaceholder: "Recherchez par nom, secteur ou domaine…",
    tier: "Segment",
    allTiers: "Tous les segments",
    company: "entreprise",
    companies: "entreprises",
    noMatch: "Aucune entreprise ne correspond à vos filtres.",
    allCompanies: "Toutes les entreprises",
    searchLists: "Rechercher des listes…",
    createList: "Créer une liste",
    accountHealth: "Santé du compte",
    openDeals: "Transactions ouvertes",
    pipeline: "Pipeline",
    contacts: "Contacts",
    unassigned: "Non attribuée",
    viewTable: "Tableau",
    viewCards: "Cartes",
    columns: "Colonnes",
    edit: "Modifier",
    done: "Terminé",
    editingHint: "Édition — les modifications s'enregistrent automatiquement",
    selectAll: "Tout sélectionner",
    capNote: (max: number) => `Seuls ${max.toLocaleString()} contacts peuvent être ajoutés à la fois.`,
    colCompany: "Entreprise",
    colIndustry: "Secteur",
    colTier: "Segment",
    colEmployees: "Employés",
    colHealth: "Santé",
    colOwner: "Propriétaire",
  },
  de: {
    title: "Unternehmen",
    description:
      "Alle Unternehmen, die du gefunden hast — aus Suchen, Importen & Listen. Wähle aus, um anzureichern, zu exportieren oder zu einer Liste hinzuzufügen.",
    exportedToast: (n: number) => `${n} als CSV exportiert`,
    enrichToast: (n: number) => `Reichere ${n} Unternehmen an…`,
    lookalikeToast: (n: number) => `Suche Lookalikes aus ${n} ausgewählten…`,
    addCompany: "Unternehmen finden",
    addCompanyToast: "Unternehmen hinzufügen — bald verfügbar",
    introTitle: "Ziele auf die Accounts, die passen",
    introDescription:
      "Verfolge Unternehmen, die zu deinem ICP passen, und werde benachrichtigt, wenn sich etwas ändert, das einen Anruf wert ist.",
    introPoints: [
      "Sieh Mitarbeiterzahl, Finanzierung & Tech-Stack",
      "Abonniere Einstellungs- und Wachstumssignale",
      "Finde das gesamte Buying Committee",
      "Füge einen ganzen Account zu einer Liste hinzu",
    ],
    searchPlaceholder: "Suche nach Name, Branche oder Domain…",
    tier: "Segment",
    allTiers: "Alle Segmente",
    company: "Unternehmen",
    companies: "Unternehmen",
    noMatch: "Keine Unternehmen entsprechen deinen Filtern.",
    allCompanies: "Alle Unternehmen",
    searchLists: "Listen suchen…",
    createList: "Liste erstellen",
    accountHealth: "Account-Gesundheit",
    openDeals: "Offene Deals",
    pipeline: "Pipeline",
    contacts: "Kontakte",
    unassigned: "Nicht zugewiesen",
    viewTable: "Tabelle",
    viewCards: "Karten",
    columns: "Spalten",
    edit: "Bearbeiten",
    done: "Fertig",
    editingHint: "Bearbeitung — Änderungen werden automatisch gespeichert",
    selectAll: "Alle auswählen",
    capNote: (max: number) => `Es können nur ${max.toLocaleString()} Kontakte auf einmal hinzugefügt werden.`,
    colCompany: "Unternehmen",
    colIndustry: "Branche",
    colTier: "Segment",
    colEmployees: "Mitarbeitende",
    colHealth: "Gesundheit",
    colOwner: "Owner",
  },
  pt: {
    title: "Empresas",
    description:
      "Todas as empresas que encontrou — de pesquisas, importações e listas. Selecione para enriquecer, exportar ou adicionar a uma lista.",
    exportedToast: (n: number) => `Exportadas ${n} para CSV`,
    enrichToast: (n: number) => `A enriquecer ${n} ${n === 1 ? "empresa" : "empresas"}…`,
    lookalikeToast: (n: number) => `A procurar semelhantes a partir de ${n} selecionadas…`,
    addCompany: "Encontrar empresas",
    addCompanyToast: "Adicionar empresa — em breve",
    introTitle: "Aponte às contas que encaixam",
    introDescription:
      "Siga as empresas que correspondem ao seu ICP e receba avisos quando mudar algo que mereça uma chamada.",
    introPoints: [
      "Veja número de colaboradores, financiamento e stack tecnológico",
      "Subscreva sinais de contratação e crescimento",
      "Encontre o comité de compra completo",
      "Adicione uma conta inteira a uma lista",
    ],
    searchPlaceholder: "Pesquise por nome, setor ou domínio…",
    tier: "Segmento",
    allTiers: "Todos os segmentos",
    company: "empresa",
    companies: "empresas",
    noMatch: "Nenhuma empresa corresponde aos seus filtros.",
    allCompanies: "Todas as empresas",
    searchLists: "Pesquisar listas…",
    createList: "Criar lista",
    accountHealth: "Saúde da conta",
    openDeals: "Negócios abertos",
    pipeline: "Pipeline",
    contacts: "Contactos",
    unassigned: "Sem responsável",
    viewTable: "Tabela",
    viewCards: "Cartões",
    columns: "Colunas",
    edit: "Editar",
    done: "Concluído",
    editingHint: "A editar — as alterações guardam-se automaticamente",
    selectAll: "Selecionar tudo",
    capNote: (max: number) => `Só é possível adicionar ${max.toLocaleString()} contactos de cada vez.`,
    colCompany: "Empresa",
    colIndustry: "Setor",
    colTier: "Segmento",
    colEmployees: "Colaboradores",
    colHealth: "Saúde",
    colOwner: "Proprietário",
  },
  pt_BR: {
    title: "Empresas",
    description:
      "Todas as empresas que você encontrou — de buscas, importações e listas. Selecione para enriquecer, exportar ou adicionar a uma lista.",
    exportedToast: (n: number) => `Exportadas ${n} para CSV`,
    enrichToast: (n: number) => `Enriquecendo ${n} ${n === 1 ? "empresa" : "empresas"}…`,
    lookalikeToast: (n: number) => `Buscando semelhantes a partir de ${n} selecionadas…`,
    addCompany: "Encontrar empresas",
    addCompanyToast: "Adicionar empresa — em breve",
    introTitle: "Mire nas contas que dão match",
    introDescription:
      "Acompanhe as empresas que combinam com seu ICP e receba avisos quando mudar algo que valha uma ligação.",
    introPoints: [
      "Veja número de funcionários, investimento e stack de tecnologia",
      "Assine sinais de contratação e crescimento",
      "Encontre o comitê de compra completo",
      "Adicione uma conta inteira a uma lista",
    ],
    searchPlaceholder: "Busque por nome, setor ou domínio…",
    tier: "Segmento",
    allTiers: "Todos os segmentos",
    company: "empresa",
    companies: "empresas",
    noMatch: "Nenhuma empresa corresponde aos seus filtros.",
    allCompanies: "Todas as empresas",
    searchLists: "Buscar listas…",
    createList: "Criar lista",
    accountHealth: "Saúde da conta",
    openDeals: "Negócios abertos",
    pipeline: "Pipeline",
    contacts: "Contatos",
    unassigned: "Sem responsável",
    viewTable: "Tabela",
    viewCards: "Cartões",
    columns: "Colunas",
    edit: "Editar",
    done: "Concluído",
    editingHint: "Editando — as alterações são salvas automaticamente",
    selectAll: "Selecionar tudo",
    capNote: (max: number) => `Só é possível adicionar ${max.toLocaleString()} contatos por vez.`,
    colCompany: "Empresa",
    colIndustry: "Setor",
    colTier: "Segmento",
    colEmployees: "Funcionários",
    colHealth: "Saúde",
    colOwner: "Responsável",
  },
} as const

export default function Companies() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const { impersonatingId } = useView()
  const accounts = useAccounts()
  const [query, setQuery] = React.useState("")
  const [tier, setTier] = React.useState<string>(ALL)
  const [listFilter, setListFilter] = React.useState<string>("all")
  const [editing, setEditing] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [bulkList, setBulkList] = React.useState(false)
  const [bulkCrmOpen, setBulkCrmOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [findContactsOpen, setFindContactsOpen] = React.useState(false)
  const [aiColOpen, setAiColOpen] = React.useState(false)
  const columnPrefs = useColumnPrefs("companies", COMPANY_DEFAULT_IDS)

  // User-defined AI columns merged into the table's column registry.
  const aiCols = useAiColumns("company")
  const allColumns = React.useMemo(
    () => [...COMPANY_COLUMNS, ...aiColumnsToDefs<Account>(aiCols)],
    [aiCols]
  )
  const allGroups = React.useMemo(
    () => (aiCols.length ? [...COMPANY_GROUPS, AI_COLUMN_GROUP] : COMPANY_GROUPS),
    [aiCols.length]
  )
  const aiColumnIds = React.useMemo(
    () => new Set(aiCols.map((co) => co.id)),
    [aiCols]
  )

  const source = impersonatingId
    ? accounts.filter((a) => a.ownerId === impersonatingId)
    : accounts

  // Company lists power the "filter by list" dropdown.
  const companyLists = useLists().filter((l) => l.kind === "company")
  const activeList = companyLists.find((l) => l.id === listFilter)

  const q = query.trim().toLowerCase()
  const results = source.filter((a) => {
    const matchesQuery =
      !q || `${a.name} ${a.industry} ${a.domain}`.toLowerCase().includes(q)
    const matchesTier = tier === ALL || a.tier === tier
    const matchesList = !activeList || (activeList.accountIds ?? []).includes(a.id)
    return matchesQuery && matchesTier && matchesList
  })

  const sel = usePagedSelection(
    results,
    (a) => a.id,
    `${query}|${tier}|${listFilter}`,
    RESULTS_PER_PAGE
  )
  const { selectedIds, allSelected, someSelected, overCap, selectableCount } = sel
  const selectedAccounts = accounts.filter((a) => selectedIds.has(a.id))
  // Adding to a list is capped at MAX_ENRICH_BATCH even if more got selected
  // (e.g. by paging through and selecting page-by-page past the cap).
  const addIdsArr = [...selectedIds].slice(0, MAX_ENRICH_BATCH)

  function exportSelected() {
    downloadCsv(
      "companies.csv",
      ["Company", "Industry", "Domain", "Tier", "Health", "Pipeline"],
      selectedAccounts.map((a) => [
        a.name,
        a.industry,
        a.domain,
        a.tier,
        a.healthScore,
        a.pipeline,
      ])
    )
    toast.success(c.exportedToast(selectedAccounts.length))
  }
  // Lookalike is a kind of search — hand the seed to the Search page.
  function findLookalikes() {
    const a = selectedAccounts[0]
    if (!a) return
    navigate("/search", {
      state: {
        lookalikeSeed: {
          id: a.id,
          kind: "company",
          name: a.name,
          sub: a.industry,
          industry: a.industry,
          region: "",
          headcount: a.employees,
        },
      },
    })
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => setAddOpen(true)}>
            <SearchIcon className="size-4" />
            {c.addCompany}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="companies"
        icon={Building2}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ListSelector
          value={listFilter}
          onChange={setListFilter}
          lists={companyLists.map((l) => ({
            id: l.id,
            name: l.name,
            color: l.color,
            count: l.accountIds?.length ?? 0,
          }))}
          allLabel={c.allCompanies}
          allIcon={Building2}
          allCount={source.length}
          countNoun={(n) => `${n} ${n === 1 ? c.company : c.companies}`}
          onCreate={() => navigate("/lists")}
          createLabel={c.createList}
          searchPlaceholder={c.searchLists}
        />
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="min-w-[150px]">
            <SelectValue placeholder={c.tier} />
          </SelectTrigger>
          <SelectContent>
            {TIERS.map((t) => (
              <SelectItem key={t} value={t}>
                {t === ALL ? c.allTiers : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TableViews tableKey="companies" prefs={columnPrefs} />
        <Button
          variant="outline"
          className="shrink-0"
          onClick={() => setColumnsOpen(true)}
        >
          <Columns3 className="size-4" />
          <span className="hidden sm:inline">{c.columns}</span>
        </Button>
        <Button
          variant={editing ? "secondary" : "outline"}
          className="shrink-0"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? (
            <>
              <Check className="size-4" />
              {c.done}
            </>
          ) : (
            <>
              <Pencil className="size-4" />
              {c.edit}
            </>
          )}
        </Button>
      </div>

      {editing && (
        <p className="text-primary mb-3 flex items-center gap-1 text-xs">
          <Pencil className="size-3" />
          {c.editingHint}
        </p>
      )}

      {results.length === 0 ? (
        <EmptyState description={c.noMatch} />
      ) : (
        <>
          <SelectionControls
            allSelected={allSelected}
            onTogglePage={sel.togglePage}
            selectedCount={selectedIds.size}
            selectableCount={selectableCount}
            onSelectAllCapped={sel.selectAllCapped}
            pageStart={sel.pageStart}
            pageEnd={sel.pageEnd}
            total={results.length}
            page={sel.page}
            pageCount={sel.pageCount}
            onPrevPage={() => sel.setPage(Math.max(0, sel.page - 1))}
            onNextPage={() => sel.setPage(Math.min(sel.pageCount - 1, sel.page + 1))}
          />

          <DataTable
            columns={allColumns}
            visible={columnPrefs.visible}
            rows={sel.pagedItems}
            rowKey={(a) => a.id}
            locale={locale}
            editing={editing}
            onUpdate={(a, patch) => accountStore.update(a.id, patch)}
            actions={(a) => <RecordActionsMenu kind="company" record={a} />}
            selection={{
              isSelected: (a) => selectedIds.has(a.id),
              toggle: sel.toggleRow,
              toggleAll: sel.togglePage,
              allSelected,
              someSelected,
            }}
          />
        </>
      )}

      <BulkActionsBar
        count={selectedIds.size}
        capNote={overCap ? c.capNote(MAX_ENRICH_BATCH) : undefined}
        onClear={sel.clear}
        onExport={exportSelected}
        onEnrich={() => toast.success(c.enrichToast(selectedIds.size))}
        onAddToList={() => setBulkList(true)}
        onAddToCrm={() => setBulkCrmOpen(true)}
        onLookalikes={findLookalikes}
        onFindContacts={() => setFindContactsOpen(true)}
      />

      <BulkAddDialog
        open={bulkList}
        onOpenChange={setBulkList}
        mode="list"
        recordKind="company"
        ids={addIdsArr}
      />

      <BulkCrmSyncDialog
        open={bulkCrmOpen}
        onOpenChange={setBulkCrmOpen}
        count={selectedIds.size}
        onDone={sel.clear}
      />

      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={allColumns}
        groups={allGroups}
        prefs={columnPrefs}
        locale={locale}
        onAddAiColumn={() => setAiColOpen(true)}
        aiColumnIds={aiColumnIds}
        onDeleteColumn={(id) => aiColumnStore.remove(id)}
      />
      <AddAiColumnDialog
        open={aiColOpen}
        onOpenChange={setAiColOpen}
        entity="company"
        onCreated={(id) => {
          if (!columnPrefs.visible.includes(id))
            columnPrefs.setVisible([...columnPrefs.visible, id])
        }}
      />

      <AddRecordsDialog open={addOpen} onOpenChange={setAddOpen} kind="company" />
      <AddRecordsDialog
        open={findContactsOpen}
        onOpenChange={setFindContactsOpen}
        kind="contact"
        scopeCompanies={selectedAccounts.map((a) => a.name)}
      />
    </Page>
  )
}
