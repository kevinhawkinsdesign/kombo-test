import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Users,
  FolderKanban,
  Upload,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
  RefreshCw,
  Zap,
  Database,
  Building2,
  ListTodo,
  Columns3,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/common/DataTable"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { ColumnManager } from "@/components/common/ColumnManager"
import {
  useColumnPrefs,
  type ColumnDef,
  type ColGroup,
} from "@/lib/table-columns"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { ImportCsvDialog } from "@/components/lists/ImportCsvDialog"
import { ListFormDialog } from "@/components/lists/ListFormDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { getProspect } from "@/lib/mock-data"
import { getAccount } from "@/lib/mock-extra"
import { useLists, listStore } from "@/lib/store"
import { downloadCsv } from "@/lib/csv"
import { isEnriched } from "@/lib/enrichment"
import { formatDate } from "@/lib/format"
import type { ProspectList } from "@/lib/types"

const COPY = {
  en: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "CSV import",
    sourceSearch: "Saved search",
    perWeek: "/week",
    autoEnriched: "Auto-enriched",
    enrichedOnce: "Enriched once",
    autoSending: "Auto-sending",
    reviewManually: "Review manually",
    title: "Lists & playlists",
    description:
      "The home base for your prospects — and the engine that keeps them flowing.",
    importCsv: "Import CSV",
    newList: "New list",
    buildPlaylist: "Build a playlist",
    introTitle: "Playlists: lists that fill, enrich, and reach out on their own",
    introDescription:
      "A playlist is a saved search that keeps adding matching prospects, enriches them, and auto-enrolls them into outreach — so your pipeline builds itself.",
    introPoints: [
      "Saved search drips in new matching prospects",
      "Enrich once or keep data fresh continuously",
      "Auto-enroll new prospects into a sequence",
      "Or build a simple static list or CSV import",
    ],
    openList: (name: string) => `Open ${name}`,
    listActions: "List actions",
    edit: "Edit",
    delete: "Delete",
    live: "Live",
    synced: (date: string) => `Synced ${date}`,
    created: (date: string) => `Created ${date}`,
    deleteTitle: "Delete list?",
    deleteDescription: (name: string) =>
      `"${name}" will be permanently removed. Prospects stay in your workspace.`,
    deleteConfirm: "Delete",
    listDeleted: "List deleted",
    deleteSelectedTitle: (n: number) => `Delete ${n} ${n === 1 ? "list" : "lists"}?`,
    deleteSelectedDescription:
      "These lists will be permanently removed. Prospects and companies stay in your workspace.",
    listsDeleted: (n: number) => `${n} ${n === 1 ? "list" : "lists"} deleted`,
    imported: (count: number) =>
      `${count} prospects imported into a new list`,
    needEnrich: (count: number) => `${count} to enrich`,
    peopleList: "Prospects",
    companyList: "Companies",
    search: "Search lists…",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Lists exported to CSV",
    noResults: "No lists match your search.",
    sortDefault: "Playlists first",
    sortName: "Name (A–Z)",
    sortMembers: "Most members",
    sortRecent: "Newest",
    colName: "List",
    colType: "Type",
    colSource: "Source",
    colMembers: "Members",
    colCreated: "Created",
    columns: "Columns",
  },
  es: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "Importación CSV",
    sourceSearch: "Búsqueda guardada",
    perWeek: "/semana",
    autoEnriched: "Enriquecida automáticamente",
    enrichedOnce: "Enriquecida una vez",
    autoSending: "Envío automático",
    reviewManually: "Revisar manualmente",
    title: "Listas y playlists",
    description:
      "El centro de operaciones de tus prospectos — y el motor que mantiene el flujo.",
    importCsv: "Importar CSV",
    newList: "Nueva lista",
    buildPlaylist: "Crear playlist",
    introTitle: "Playlists: listas que se llenan, enriquecen y contactan solas",
    introDescription:
      "Una playlist es una búsqueda guardada que sigue añadiendo prospectos que coinciden, los enriquece y los inscribe automáticamente en el contacto — para que tu pipeline se construya solo.",
    introPoints: [
      "La búsqueda guardada añade nuevos prospectos que coinciden",
      "Enriquece una vez o mantén los datos actualizados de forma continua",
      "Inscribe automáticamente a los nuevos prospectos en una secuencia",
      "O crea una lista estática simple o importa un CSV",
    ],
    openList: (name: string) => `Abrir ${name}`,
    listActions: "Acciones de la lista",
    edit: "Editar",
    delete: "Eliminar",
    live: "En vivo",
    synced: (date: string) => `Sincronizada ${date}`,
    created: (date: string) => `Creada ${date}`,
    deleteTitle: "¿Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" se eliminará de forma permanente. Los prospectos permanecen en tu espacio de trabajo.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    deleteSelectedTitle: (n: number) => `¿Eliminar ${n} ${n === 1 ? "lista" : "listas"}?`,
    deleteSelectedDescription:
      "Estas listas se eliminarán de forma permanente. Los prospectos y empresas permanecen en tu espacio de trabajo.",
    listsDeleted: (n: number) => `${n} ${n === 1 ? "lista eliminada" : "listas eliminadas"}`,
    imported: (count: number) =>
      `${count} prospectos importados a una nueva lista`,
    needEnrich: (count: number) => `${count} por enriquecer`,
    peopleList: "Prospectos",
    companyList: "Empresas",
    search: "Buscar listas…",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Listas exportadas a CSV",
    noResults: "Ninguna lista coincide con tu búsqueda.",
    sortDefault: "Playlists primero",
    sortName: "Nombre (A–Z)",
    sortMembers: "Más miembros",
    sortRecent: "Más recientes",
    colName: "Lista",
    colType: "Tipo",
    colSource: "Origen",
    colMembers: "Miembros",
    colCreated: "Creada",
    columns: "Columnas",
  },
  it: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "Importazione CSV",
    sourceSearch: "Ricerca salvata",
    perWeek: "/settimana",
    autoEnriched: "Arricchita automaticamente",
    enrichedOnce: "Arricchita una volta",
    autoSending: "Invio automatico",
    reviewManually: "Rivedi manualmente",
    title: "Liste e playlist",
    description:
      "La base operativa dei tuoi prospect — e il motore che li tiene in movimento.",
    importCsv: "Importa CSV",
    newList: "Nuova lista",
    buildPlaylist: "Crea una playlist",
    introTitle: "Playlist: liste che si riempiono, si arricchiscono e contattano da sole",
    introDescription:
      "Una playlist è una ricerca salvata che continua ad aggiungere prospect corrispondenti, li arricchisce e li inserisce automaticamente nell'outreach — così la tua pipeline si costruisce da sola.",
    introPoints: [
      "La ricerca salvata aggiunge nuovi prospect corrispondenti",
      "Arricchisci una volta o mantieni i dati sempre aggiornati",
      "Inserisci automaticamente i nuovi prospect in una sequenza",
      "Oppure crea una semplice lista statica o importa un CSV",
    ],
    openList: (name: string) => `Apri ${name}`,
    listActions: "Azioni della lista",
    edit: "Modifica",
    delete: "Elimina",
    live: "Live",
    synced: (date: string) => `Sincronizzata ${date}`,
    created: (date: string) => `Creata ${date}`,
    deleteTitle: "Eliminare la lista?",
    deleteDescription: (name: string) =>
      `"${name}" verrà eliminata definitivamente. I prospect restano nel tuo spazio di lavoro.`,
    deleteConfirm: "Elimina",
    listDeleted: "Lista eliminata",
    deleteSelectedTitle: (n: number) => `Eliminare ${n} ${n === 1 ? "lista" : "liste"}?`,
    deleteSelectedDescription:
      "Queste liste verranno eliminate definitivamente. Prospect e aziende restano nel tuo spazio di lavoro.",
    listsDeleted: (n: number) => `${n} ${n === 1 ? "lista eliminata" : "liste eliminate"}`,
    imported: (count: number) =>
      `${count} prospect importati in una nuova lista`,
    needEnrich: (count: number) => `${count} da arricchire`,
    peopleList: "Prospect",
    companyList: "Aziende",
    search: "Cerca liste…",
    viewCards: "Schede",
    viewTable: "Tabella",
    exportLabel: "Esporta",
    exported: "Liste esportate in CSV",
    noResults: "Nessuna lista corrisponde alla tua ricerca.",
    sortDefault: "Prima le playlist",
    sortName: "Nome (A–Z)",
    sortMembers: "Più membri",
    sortRecent: "Più recenti",
    colName: "Lista",
    colType: "Tipo",
    colSource: "Origine",
    colMembers: "Membri",
    colCreated: "Creata",
    columns: "Colonne",
  },
  fr: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "Import CSV",
    sourceSearch: "Recherche enregistrée",
    perWeek: "/semaine",
    autoEnriched: "Enrichie automatiquement",
    enrichedOnce: "Enrichie une fois",
    autoSending: "Envoi automatique",
    reviewManually: "Vérifier manuellement",
    title: "Listes et playlists",
    description:
      "Le camp de base de vos prospects — et le moteur qui les fait avancer.",
    importCsv: "Importer un CSV",
    newList: "Nouvelle liste",
    buildPlaylist: "Créer une playlist",
    introTitle: "Playlists : des listes qui se remplissent, s'enrichissent et prospectent toutes seules",
    introDescription:
      "Une playlist est une recherche enregistrée qui ajoute en continu les prospects correspondants, les enrichit et les inscrit automatiquement dans la prospection — votre pipeline se construit tout seul.",
    introPoints: [
      "La recherche enregistrée ajoute les nouveaux prospects correspondants",
      "Enrichissez une fois ou gardez les données à jour en continu",
      "Inscrivez automatiquement les nouveaux prospects dans une séquence",
      "Ou créez une simple liste statique ou importez un CSV",
    ],
    openList: (name: string) => `Ouvrir ${name}`,
    listActions: "Actions de la liste",
    edit: "Modifier",
    delete: "Supprimer",
    live: "En direct",
    synced: (date: string) => `Synchronisée ${date}`,
    created: (date: string) => `Créée ${date}`,
    deleteTitle: "Supprimer la liste ?",
    deleteDescription: (name: string) =>
      `« ${name} » sera supprimée définitivement. Les prospects restent dans votre espace de travail.`,
    deleteConfirm: "Supprimer",
    listDeleted: "Liste supprimée",
    deleteSelectedTitle: (n: number) => `Supprimer ${n} ${n === 1 ? "liste" : "listes"} ?`,
    deleteSelectedDescription:
      "Ces listes seront supprimées définitivement. Les prospects et les entreprises restent dans votre espace de travail.",
    listsDeleted: (n: number) => `${n} ${n === 1 ? "liste supprimée" : "listes supprimées"}`,
    imported: (count: number) =>
      `${count} prospects importés dans une nouvelle liste`,
    needEnrich: (count: number) => `${count} à enrichir`,
    peopleList: "Prospects",
    companyList: "Entreprises",
    search: "Rechercher des listes…",
    viewCards: "Cartes",
    viewTable: "Tableau",
    exportLabel: "Exporter",
    exported: "Listes exportées en CSV",
    noResults: "Aucune liste ne correspond à votre recherche.",
    sortDefault: "Playlists d'abord",
    sortName: "Nom (A–Z)",
    sortMembers: "Plus de membres",
    sortRecent: "Plus récentes",
    colName: "Liste",
    colType: "Type",
    colSource: "Source",
    colMembers: "Membres",
    colCreated: "Créée",
    columns: "Colonnes",
  },
  de: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "CSV-Import",
    sourceSearch: "Gespeicherte Suche",
    perWeek: "/Woche",
    autoEnriched: "Automatisch angereichert",
    enrichedOnce: "Einmal angereichert",
    autoSending: "Automatischer Versand",
    reviewManually: "Manuell prüfen",
    title: "Listen & Playlists",
    description:
      "Die Homebase für deine Prospects — und der Motor, der sie in Bewegung hält.",
    importCsv: "CSV importieren",
    newList: "Neue Liste",
    buildPlaylist: "Playlist erstellen",
    introTitle: "Playlists: Listen, die sich von selbst füllen, anreichern und Kontakt aufnehmen",
    introDescription:
      "Eine Playlist ist eine gespeicherte Suche, die laufend passende Prospects hinzufügt, sie anreichert und automatisch ins Outreach aufnimmt — deine Pipeline baut sich von selbst auf.",
    introPoints: [
      "Die gespeicherte Suche fügt laufend neue passende Prospects hinzu",
      "Einmal anreichern oder Daten kontinuierlich aktuell halten",
      "Neue Prospects automatisch in eine Sequenz aufnehmen",
      "Oder baue eine einfache statische Liste oder importiere ein CSV",
    ],
    openList: (name: string) => `${name} öffnen`,
    listActions: "Listenaktionen",
    edit: "Bearbeiten",
    delete: "Löschen",
    live: "Live",
    synced: (date: string) => `Synchronisiert ${date}`,
    created: (date: string) => `Erstellt ${date}`,
    deleteTitle: "Liste löschen?",
    deleteDescription: (name: string) =>
      `„${name}“ wird dauerhaft entfernt. Die Prospects bleiben in deinem Workspace.`,
    deleteConfirm: "Löschen",
    listDeleted: "Liste gelöscht",
    deleteSelectedTitle: (n: number) => `${n} ${n === 1 ? "Liste" : "Listen"} löschen?`,
    deleteSelectedDescription:
      "Diese Listen werden dauerhaft entfernt. Prospects und Unternehmen bleiben in deinem Workspace.",
    listsDeleted: (n: number) => `${n} ${n === 1 ? "Liste" : "Listen"} gelöscht`,
    imported: (count: number) =>
      `${count} Prospects in eine neue Liste importiert`,
    needEnrich: (count: number) => `${count} anzureichern`,
    peopleList: "Prospects",
    companyList: "Unternehmen",
    search: "Listen suchen…",
    viewCards: "Karten",
    viewTable: "Tabelle",
    exportLabel: "Exportieren",
    exported: "Listen als CSV exportiert",
    noResults: "Keine Listen entsprechen deiner Suche.",
    sortDefault: "Playlists zuerst",
    sortName: "Name (A–Z)",
    sortMembers: "Meiste Mitglieder",
    sortRecent: "Neueste",
    colName: "Liste",
    colType: "Typ",
    colSource: "Quelle",
    colMembers: "Mitglieder",
    colCreated: "Erstellt",
    columns: "Spalten",
  },
  pt: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "Importação CSV",
    sourceSearch: "Pesquisa guardada",
    perWeek: "/semana",
    autoEnriched: "Enriquecida automaticamente",
    enrichedOnce: "Enriquecida uma vez",
    autoSending: "Envio automático",
    reviewManually: "Rever manualmente",
    title: "Listas e playlists",
    description:
      "A base de operações dos seus prospects — e o motor que os mantém a fluir.",
    importCsv: "Importar CSV",
    newList: "Nova lista",
    buildPlaylist: "Criar playlist",
    introTitle: "Playlists: listas que se preenchem, enriquecem e contactam sozinhas",
    introDescription:
      "Uma playlist é uma pesquisa guardada que continua a adicionar prospects correspondentes, enriquece-os e inscreve-os automaticamente na prospeção — para que o seu pipeline se construa sozinho.",
    introPoints: [
      "A pesquisa guardada adiciona novos prospects correspondentes",
      "Enriqueça uma vez ou mantenha os dados sempre atualizados",
      "Inscreva automaticamente os novos prospects numa sequência",
      "Ou crie uma lista estática simples ou importe um CSV",
    ],
    openList: (name: string) => `Abrir ${name}`,
    listActions: "Ações da lista",
    edit: "Editar",
    delete: "Eliminar",
    live: "Em direto",
    synced: (date: string) => `Sincronizada ${date}`,
    created: (date: string) => `Criada ${date}`,
    deleteTitle: "Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" será eliminada permanentemente. Os prospects permanecem no seu espaço de trabalho.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    deleteSelectedTitle: (n: number) => `Eliminar ${n} ${n === 1 ? "lista" : "listas"}?`,
    deleteSelectedDescription:
      "Estas listas serão eliminadas permanentemente. Os prospects e as empresas permanecem no seu espaço de trabalho.",
    listsDeleted: (n: number) => `${n} ${n === 1 ? "lista eliminada" : "listas eliminadas"}`,
    imported: (count: number) =>
      `${count} prospects importados para uma nova lista`,
    needEnrich: (count: number) => `${count} por enriquecer`,
    peopleList: "Prospects",
    companyList: "Empresas",
    search: "Pesquisar listas…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Listas exportadas para CSV",
    noResults: "Nenhuma lista corresponde à sua pesquisa.",
    sortDefault: "Playlists primeiro",
    sortName: "Nome (A–Z)",
    sortMembers: "Mais membros",
    sortRecent: "Mais recentes",
    colName: "Lista",
    colType: "Tipo",
    colSource: "Origem",
    colMembers: "Membros",
    colCreated: "Criada",
    columns: "Colunas",
  },
  pt_BR: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "Importação CSV",
    sourceSearch: "Busca salva",
    perWeek: "/semana",
    autoEnriched: "Enriquecida automaticamente",
    enrichedOnce: "Enriquecida uma vez",
    autoSending: "Envio automático",
    reviewManually: "Revisar manualmente",
    title: "Listas e playlists",
    description:
      "A base de operações dos seus prospects — e o motor que os mantém fluindo.",
    importCsv: "Importar CSV",
    newList: "Nova lista",
    buildPlaylist: "Criar playlist",
    introTitle: "Playlists: listas que se preenchem, enriquecem e entram em contato sozinhas",
    introDescription:
      "Uma playlist é uma busca salva que continua adicionando prospects correspondentes, os enriquece e os inscreve automaticamente na prospecção — para que seu pipeline se construa sozinho.",
    introPoints: [
      "A busca salva adiciona novos prospects correspondentes",
      "Enriqueça uma vez ou mantenha os dados sempre atualizados",
      "Inscreva automaticamente os novos prospects em uma sequência",
      "Ou crie uma lista estática simples ou importe um CSV",
    ],
    openList: (name: string) => `Abrir ${name}`,
    listActions: "Ações da lista",
    edit: "Editar",
    delete: "Excluir",
    live: "Ao vivo",
    synced: (date: string) => `Sincronizada ${date}`,
    created: (date: string) => `Criada ${date}`,
    deleteTitle: "Excluir lista?",
    deleteDescription: (name: string) =>
      `"${name}" será excluída permanentemente. Os prospects permanecem no seu espaço de trabalho.`,
    deleteConfirm: "Excluir",
    listDeleted: "Lista excluída",
    deleteSelectedTitle: (n: number) => `Excluir ${n} ${n === 1 ? "lista" : "listas"}?`,
    deleteSelectedDescription:
      "Essas listas serão excluídas permanentemente. Os prospects e as empresas permanecem no seu espaço de trabalho.",
    listsDeleted: (n: number) => `${n} ${n === 1 ? "lista excluída" : "listas excluídas"}`,
    imported: (count: number) =>
      `${count} prospects importados para uma nova lista`,
    needEnrich: (count: number) => `${count} para enriquecer`,
    peopleList: "Prospects",
    companyList: "Empresas",
    search: "Buscar listas…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Listas exportadas para CSV",
    noResults: "Nenhuma lista corresponde à sua busca.",
    sortDefault: "Playlists primeiro",
    sortName: "Nome (A–Z)",
    sortMembers: "Mais membros",
    sortRecent: "Mais recentes",
    colName: "Lista",
    colType: "Tipo",
    colSource: "Origem",
    colMembers: "Membros",
    colCreated: "Criada",
    columns: "Colunas",
  },
} as const

function DynamicChips({ list }: { list: ProspectList }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  if (!list.dynamic) return null
  const autoSend = Boolean(list.campaignId) && list.sendMode === "continuous"
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-6">
      {typeof list.newPerWeek === "number" && (
        <Badge variant="secondary" className="gap-1 font-normal">
          <RefreshCw className="size-3" />~{list.newPerWeek}
          {c.perWeek}
        </Badge>
      )}
      <Badge variant="secondary" className="gap-1 font-normal">
        <Sparkles className="size-3" />
        {list.enrichment === "continuous" ? c.autoEnriched : c.enrichedOnce}
      </Badge>
      {autoSend && (
        <Badge variant="secondary" className="text-chart-1 gap-1 font-normal">
          <Zap className="size-3" />
          {c.autoSending}
        </Badge>
      )}
      {list.reviewMode === "manual_review" && (
        <Badge variant="secondary" className="gap-1 font-normal">
          <ListTodo className="size-3" />
          {c.reviewManually}
        </Badge>
      )}
    </div>
  )
}

export default function Lists() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const lists = useLists()
  const [searchParams, setSearchParams] = useSearchParams()
  // Deep link: /lists?import=1 (e.g. from the Search "Import data" card) opens
  // the CSV import dialog straight away.
  const [importOpen, setImportOpen] = React.useState(
    () => searchParams.get("import") === "1"
  )
  function closeImport(open: boolean) {
    setImportOpen(open)
    if (!open && searchParams.get("import")) {
      const next = new URLSearchParams(searchParams)
      next.delete("import")
      setSearchParams(next, { replace: true })
    }
  }
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingList, setEditingList] = React.useState<ProspectList | undefined>(
    undefined
  )
  const [deletingList, setDeletingList] = React.useState<
    ProspectList | undefined
  >(undefined)
  const [view, setView] = React.useState<CollectionView>("table")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("default")
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const listColPrefs = useColumnPrefs("lists", LIST_COL_DEFAULT_IDS)
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  function openCreate() {
    setEditingList(undefined)
    setFormOpen(true)
  }

  function openEdit(list: ProspectList) {
    setEditingList(list)
    setFormOpen(true)
  }

  const sortedLists = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? lists.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
        )
      : lists
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "members":
          return memberCountOfList(b) - memberCountOfList(a)
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          // Dynamic "playlists" lead — they're the flagship way to work.
          return Number(Boolean(b.dynamic)) - Number(Boolean(a.dynamic))
      }
    })
    return sorted
  }, [lists, query, sort])

  function listsToRows(rows: ProspectList[]) {
    return rows.map((l) => [
      l.name,
      l.kind === "company" ? c.companyList : c.peopleList,
      l.source,
      memberCountOfList(l),
      formatDate(l.createdAt),
    ])
  }

  function exportCsv() {
    downloadCsv(
      "kombo-lists.csv",
      [c.colName, c.colType, c.colSource, c.colMembers, c.colCreated],
      listsToRows(sortedLists)
    )
    toast.success(c.exported)
  }

  // Bulk selection — same DataTable selection pattern used elsewhere (Templates.tsx).
  const rowIds = sortedLists.map((l) => l.id)
  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id))
  const someSelected = !allSelected && rowIds.some((id) => selectedIds.has(id))
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
  function exportSelectedCsv() {
    downloadCsv(
      "kombo-lists.csv",
      [c.colName, c.colType, c.colSource, c.colMembers, c.colCreated],
      listsToRows(sortedLists.filter((l) => selectedIds.has(l.id)))
    )
    toast.success(c.exported)
  }
  function deleteSelected() {
    selectedIds.forEach((id) => listStore.remove(id))
    toast.success(c.listsDeleted(selectedIds.size))
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" />
              {c.importCsv}
            </Button>
            <Button variant="volt" onClick={openCreate}>
              <Plus className="size-4" />
              {c.newList}
            </Button>
          </div>
        }
      />

      <FeatureIntro
        featureKey="lists"
        icon={Sparkles}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            {c.newList}
          </Button>
        }
        className="mb-6"
      />

      <CollectionToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={c.search}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "default", label: c.sortDefault },
          { value: "name", label: c.sortName },
          { value: "members", label: c.sortMembers },
          { value: "recent", label: c.sortRecent },
        ]}
        view={view}
        onViewChange={setView}
        cardsLabel={c.viewCards}
        tableLabel={c.viewTable}
        onExport={exportCsv}
        exportLabel={c.exportLabel}
      >
        {view === "table" && (
          <Button variant="outline" onClick={() => setColumnsOpen(true)}>
            <Columns3 className="size-4" />
            <span className="hidden sm:inline">{c.columns}</span>
          </Button>
        )}
      </CollectionToolbar>

      {sortedLists.length === 0 ? (
        <Card className="text-muted-foreground p-8 text-center text-sm">
          {c.noResults}
        </Card>
      ) : view === "table" ? (
        <>
        <DataTable
          columns={LIST_COLUMNS}
          visible={listColPrefs.visible}
          rows={sortedLists}
          rowKey={(l) => l.id}
          locale={locale}
          onRowClick={(l) => navigate(`/lists/${l.id}`)}
          selection={{
            isSelected: (l) => selectedIds.has(l.id),
            toggle: (l) => toggleRow(l.id),
            toggleAll: toggleAllRows,
            allSelected,
            someSelected,
          }}
          actions={(list) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={c.listActions}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => openEdit(list)}>
                  <Pencil className="size-4" />
                  {c.edit}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeletingList(list)}
                >
                  <Trash2 className="size-4" />
                  {c.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
        <BulkActionsBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onExport={exportSelectedCsv}
          extra={{
            label: c.delete,
            icon: <Trash2 className="size-4" />,
            destructive: true,
            onClick: () => setBulkDeleteOpen(true),
          }}
        />
        </>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedLists.map((list) => {
          const isCompany = list.kind === "company"
          const members = list.prospectIds
            .map(getProspect)
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
          const accounts = (list.accountIds ?? [])
            .map(getAccount)
            .filter((a): a is NonNullable<typeof a> => Boolean(a))
          const memberCount = isCompany
            ? list.accountIds?.length ?? 0
            : list.prospectIds.length
          const pendingCount = isCompany
            ? 0
            : members.filter((p) => !isEnriched(p)).length
          return (
            <Card
              key={list.id}
              className="hover:border-primary/40 relative h-full gap-4 transition-colors"
            >
              <Link
                to={`/lists/${list.id}`}
                aria-label={c.openList(list.name)}
                className="absolute inset-0 z-0 rounded-xl"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.listActions}
                    className="absolute top-3 right-3 z-10 size-8"
                    onClick={(event) => {
                      event.stopPropagation()
                      event.preventDefault()
                    }}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => openEdit(list)}
                  >
                    <Pencil className="size-4" />
                    {c.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDeletingList(list)}
                  >
                    <Trash2 className="size-4" />
                    {c.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CardHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${list.color}1a` }}
                  >
                    {list.dynamic ? (
                      <Sparkles className="size-4" style={{ color: list.color }} />
                    ) : isCompany ? (
                      <Building2 className="size-4" style={{ color: list.color }} />
                    ) : (
                      <FolderKanban
                        className="size-4"
                        style={{ color: list.color }}
                      />
                    )}
                  </span>
                  <div className="mr-8 ml-auto flex items-center gap-1.5">
                    {list.dynamic && (
                      <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
                        <span className="relative flex size-1.5">
                          <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                          <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
                        </span>
                        {c.live}
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1 font-normal">
                      {isCompany ? (
                        <Building2 className="size-3" />
                      ) : (
                        <Users className="size-3" />
                      )}
                      {isCompany ? c.companyList : c.peopleList}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{list.name}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                    {list.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {isCompany
                    ? accounts.slice(0, 4).map((a) => (
                        <span
                          key={a.id}
                          className="ring-background flex size-7 items-center justify-center rounded-md text-xs font-semibold text-white ring-2"
                          style={{ backgroundColor: a.logoColor }}
                          title={a.name}
                        >
                          {a.name.charAt(0)}
                        </span>
                      ))
                    : members.slice(0, 4).map((p) => (
                        <ProspectAvatar
                          key={p.id}
                          prospect={p}
                          className="ring-background size-7 ring-2"
                        />
                      ))}
                  {memberCount > 4 && (
                    <span className="bg-muted ring-background text-muted-foreground flex size-7 items-center justify-center rounded-full text-xs ring-2">
                      +{memberCount - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingCount > 0 && (
                    <Badge
                      variant="outline"
                      className="border-chart-4/40 text-chart-4 gap-1 font-normal"
                    >
                      <Database className="size-3" />
                      {c.needEnrich(pendingCount)}
                    </Badge>
                  )}
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    {isCompany ? (
                      <Building2 className="size-3.5" />
                    ) : (
                      <Users className="size-3.5" />
                    )}
                    {memberCount}
                  </div>
                </div>
              </CardContent>
              <DynamicChips list={list} />
              <div className="text-muted-foreground px-6 text-xs">
                {list.dynamic && list.lastSyncedAt
                  ? c.synced(formatDate(list.lastSyncedAt))
                  : c.created(formatDate(list.createdAt))}
              </div>
            </Card>
          )
        })}
      </div>
      )}


      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={LIST_COLUMNS}
        groups={LIST_COL_GROUPS}
        prefs={listColPrefs}
        locale={locale}
      />

      <ListFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        list={editingList}
      />

      <ConfirmDialog
        open={Boolean(deletingList)}
        onOpenChange={(open) => {
          if (!open) setDeletingList(undefined)
        }}
        title={c.deleteTitle}
        description={
          deletingList ? c.deleteDescription(deletingList.name) : undefined
        }
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (!deletingList) return
          listStore.remove(deletingList.id)
          toast.success(c.listDeleted)
          setDeletingList(undefined)
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={c.deleteSelectedTitle(selectedIds.size)}
        description={c.deleteSelectedDescription}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={deleteSelected}
      />

      <ImportCsvDialog
        open={importOpen}
        onOpenChange={closeImport}
        onImported={(count) => toast.success(c.imported(count))}
      />
    </Page>
  )
}

// Table-view columns — the same shared registry shape + ColumnManager +
// DataTable that every prospect/company table uses (page-local defs, like
// CampaignDetail's prospect table).
const memberCountOfList = (l: ProspectList) =>
  l.kind === "company" ? (l.accountIds?.length ?? 0) : l.prospectIds.length

const LIST_COL_GROUPS: ColGroup[] = [
  {
    id: "list",
    label: {
      en: "List",
      es: "Lista",
      it: "Lista",
      fr: "Liste",
      de: "Liste",
      pt: "Lista",
      pt_BR: "Lista",
    },
  },
]
const LIST_COL_DEFAULT_IDS = ["type", "source", "members", "created"]

const LIST_COLUMNS: ColumnDef<ProspectList>[] = [
  {
    id: "name",
    label: {
      en: COPY.en.colName,
      es: COPY.es.colName,
      it: COPY.it.colName,
      fr: COPY.fr.colName,
      de: COPY.de.colName,
      pt: COPY.pt.colName,
      pt_BR: COPY.pt_BR.colName,
    },
    group: "list",
    pinned: true,
    minWidth: "220px",
    render: (l, locale) => {
      const cc = COPY[locale]
      const isCompany = l.kind === "company"
      return (
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${l.color}1a` }}
          >
            {l.dynamic ? (
              <Sparkles className="size-3.5" style={{ color: l.color }} />
            ) : isCompany ? (
              <Building2 className="size-3.5" style={{ color: l.color }} />
            ) : (
              <FolderKanban className="size-3.5" style={{ color: l.color }} />
            )}
          </span>
          <Link to={`/lists/${l.id}`} className="font-medium hover:underline">
            {l.name}
          </Link>
          {l.dynamic && (
            <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
              <span className="relative flex size-1.5">
                <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
              </span>
              {cc.live}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "type",
    label: {
      en: COPY.en.colType,
      es: COPY.es.colType,
      it: COPY.it.colType,
      fr: COPY.fr.colType,
      de: COPY.de.colType,
      pt: COPY.pt.colType,
      pt_BR: COPY.pt_BR.colType,
    },
    group: "list",
    default: true,
    render: (l, locale) => {
      const cc = COPY[locale]
      const isCompany = l.kind === "company"
      return (
        <Badge variant="outline" className="gap-1 font-normal">
          {isCompany ? (
            <Building2 className="size-3" />
          ) : (
            <Users className="size-3" />
          )}
          {isCompany ? cc.companyList : cc.peopleList}
        </Badge>
      )
    },
  },
  {
    id: "source",
    label: {
      en: COPY.en.colSource,
      es: COPY.es.colSource,
      it: COPY.it.colSource,
      fr: COPY.fr.colSource,
      de: COPY.de.colSource,
      pt: COPY.pt.colSource,
      pt_BR: COPY.pt_BR.colSource,
    },
    group: "list",
    default: true,
    render: (l, locale) => {
      const cc = COPY[locale]
      const sourceLabels: Record<string, string> = {
        linkedin: cc.sourceLinkedin,
        salesnav: cc.sourceSalesnav,
        csv: cc.sourceCsv,
        search: cc.sourceSearch,
      }
      return (
        <span className="text-muted-foreground text-sm">
          {sourceLabels[l.source]}
        </span>
      )
    },
  },
  {
    id: "members",
    label: {
      en: COPY.en.colMembers,
      es: COPY.es.colMembers,
      it: COPY.it.colMembers,
      fr: COPY.fr.colMembers,
      de: COPY.de.colMembers,
      pt: COPY.pt.colMembers,
      pt_BR: COPY.pt_BR.colMembers,
    },
    group: "list",
    default: true,
    align: "right",
    render: (l) => <span className="tabular-nums">{memberCountOfList(l)}</span>,
  },
  {
    id: "created",
    label: {
      en: COPY.en.colCreated,
      es: COPY.es.colCreated,
      it: COPY.it.colCreated,
      fr: COPY.fr.colCreated,
      de: COPY.de.colCreated,
      pt: COPY.pt.colCreated,
      pt_BR: COPY.pt_BR.colCreated,
    },
    group: "list",
    default: true,
    align: "right",
    render: (l) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatDate(l.createdAt)}
      </span>
    ),
  },
]
