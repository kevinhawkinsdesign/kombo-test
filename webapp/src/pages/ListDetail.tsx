import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Link2,
  Download,
  Pencil,
  Trash2,
  Copy,
  X,
  Plus,
  Search,
  Layers,
  Columns3,
  ShieldCheck,
  TriangleAlert,
  UserSearch,
  FolderOpen,
  FolderInput,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackLink } from "@/components/common/BackLink"
import { DataTable } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import { TableViews } from "@/components/common/TableViews"
import { RecordActionsMenu } from "@/components/common/RecordActionsMenu"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { SelectionControls } from "@/components/common/SelectionControls"
import { BulkAddDialog } from "@/components/common/BulkAddDialog"
import { BulkAddToCrmDialog } from "@/components/common/BulkAddToCrmDialog"
import { ExportDialog, type ExportFormat } from "@/components/common/ExportDialog"
import { CONNECTED_CRM_PROVIDER, CRM_LISTS } from "@/lib/mock-depth"
import { downloadCsv } from "@/lib/csv"
import {
  PEOPLE_COLUMNS,
  PEOPLE_GROUPS,
  PEOPLE_DEFAULT_IDS,
  COMPANY_COLUMNS,
  COMPANY_GROUPS,
  COMPANY_DEFAULT_IDS,
  AI_COLUMN_GROUP,
  aiColumnsToDefs,
  useColumnPrefs,
} from "@/lib/table-columns"
import { useAiColumns, aiColumnStore } from "@/lib/ai-columns"
import { AddAiColumnDialog } from "@/components/common/AddAiColumnDialog"
import { ListFormDialog } from "@/components/lists/ListFormDialog"
import { LinkListToCampaignDialog } from "@/components/lists/LinkListToCampaignDialog"
import { LinkListToCrmDialog } from "@/components/lists/LinkListToCrmDialog"
import { AddSourceDialog } from "@/components/lists/AddSourceDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { CompanyEnrichDialog } from "@/components/lists/CompanyEnrichDialog"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { getProspect, getCampaign } from "@/lib/mock-data"
import { getAccount } from "@/lib/mock-extra"
import { useSavedSearches } from "@/lib/mock-ai-search"
import { useLists, listStore, prospectStore, accountStore, blacklistStore } from "@/lib/store"
import { listTabsStore } from "@/lib/list-tabs"
import { ListTabBar } from "@/components/lists/ListTabBar"
import {
  isEnriched,
  isCompanyEnriched,
  needsAnyEnrichScope,
} from "@/lib/enrichment"
import { usePagedSelection } from "@/lib/use-paged-selection"
import { useTableSortFilter } from "@/lib/table-sort-filter"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Account, Prospect, ProspectList } from "@/lib/types"

const COPY = {
  en: {
    listNotFound: "List not found.",
    lists: "All Lists",
    prospects: "prospects",
    edit: "Edit",
    deleteList: "Delete",
    export: "Export",
    exported: (format: string) => `Exported to ${format}`,
    exportedAndSent: (format: string, email: string) => `Exported to ${format} and sent to ${email}`,
    crmSynced: (crm: string) => `Synced to ${crm}`,
    blacklistedCount: (n: number) => `${n} ${n === 1 ? "company" : "companies"} added to blacklist`,
    linkToCampaign: "Link to campaign",
    duplicateList: "Duplicate",
    copySuffix: "(copy)",
    duplicated: (name: string) => `"${name}" created`,
    addSource: "Add source",
    rename: "Rename",
    labelSource: "Source",
    labelEnrich: "Enrichment",
    labelCrm: "CRM",
    labelCampaign: "Outreach",
    notSet: "Not set",
    notLinked: "Not linked",
    noAutomation: "No automation",
    allEnrichedShort: "All enriched",
    needEnrichShort: (n: number) => `${n} to enrich`,
    linkToCrm: "Sync to CRM",
    crmLinked: (crm: string) => `Synced with ${crm}`,
    getStartedTitle: "Get started",
    getStartedDesc: "Add prospects to this list to begin working it.",
    getStartedDescCo: "Add companies to this list to begin working it.",
    importCsv: "Import",
    prospectsHeading: "Prospects",
    addProspects: "Find prospects",
    columns: "Columns",
    editTable: "Edit",
    editDone: "Done",
    editingHint: "Editing — changes save automatically",
    colProspect: "Prospect",
    colCompany: "Company",
    colScore: "Score",
    colStatus: "Status",
    removeFromListAction: "Remove from list",
    moveToListAction: "Move to list",
    enrichRow: "Enrich",
    removed: "Removed from list",
    removedCount: (n: number) => `${n} removed from list`,
    emptyState: "No prospects yet — add some to get started.",
    deleteTitle: "Delete list?",
    deleteDescription: (name: string) =>
      `"${name}" will be permanently removed. Prospects stay in your workspace.`,
    deleteConfirm: "Delete",
    listDeleted: "List deleted",
    dynamicBadge: "Dynamic",
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
    // Company lists
    companies: "companies",
    companiesHeading: "Companies",
    addCompanies: "Find companies",
    findContacts: "Find prospects",
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
    lists: "Todas las listas",
    prospects: "prospectos",
    edit: "Editar",
    deleteList: "Eliminar",
    export: "Exportar",
    exported: (format: string) => `Exportado a ${format}`,
    exportedAndSent: (format: string, email: string) => `Exportado a ${format} y enviado a ${email}`,
    crmSynced: (crm: string) => `Sincronizado con ${crm}`,
    blacklistedCount: (n: number) => `${n} ${n === 1 ? "empresa añadida" : "empresas añadidas"} a la lista negra`,
    linkToCampaign: "Vincular a campaña",
    duplicateList: "Duplicar",
    copySuffix: "(copia)",
    duplicated: (name: string) => `«${name}» creada`,
    addSource: "Añadir fuente",
    rename: "Renombrar",
    labelSource: "Fuente",
    labelEnrich: "Enriquecimiento",
    labelCrm: "CRM",
    labelCampaign: "Contacto",
    notSet: "Sin definir",
    notLinked: "Sin vincular",
    noAutomation: "Sin automatización",
    allEnrichedShort: "Todo enriquecido",
    needEnrichShort: (n: number) => `${n} por enriquecer`,
    linkToCrm: "Sincronizar con el CRM",
    crmLinked: (crm: string) => `Sincronizada con ${crm}`,
    getStartedTitle: "Empieza aquí",
    getStartedDesc: "Añade prospectos a esta lista para empezar a trabajarla.",
    getStartedDescCo: "Añade empresas a esta lista para empezar a trabajarla.",
    importCsv: "Importar",
    prospectsHeading: "Prospectos",
    addProspects: "Buscar prospectos",
    columns: "Columnas",
    editTable: "Editar",
    editDone: "Hecho",
    editingHint: "Editando — los cambios se guardan solos",
    colProspect: "Prospecto",
    colCompany: "Empresa",
    colScore: "Puntuación",
    colStatus: "Estado",
    removeFromListAction: "Quitar de la lista",
    moveToListAction: "Mover a lista",
    enrichRow: "Enriquecer",
    removed: "Quitado de la lista",
    removedCount: (n: number) => `${n} quitados de la lista`,
    emptyState: "Aún no hay prospectos — añade algunos para empezar.",
    deleteTitle: "¿Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" se eliminará de forma permanente. Los prospectos permanecen en tu espacio de trabajo.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    dynamicBadge: "Dinámica",
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
    // Company lists
    companies: "empresas",
    companiesHeading: "Empresas",
    addCompanies: "Buscar empresas",
    findContacts: "Buscar prospectos",
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
  it: {
    listNotFound: "Lista non trovata.",
    lists: "Tutte le liste",
    prospects: "prospect",
    edit: "Modifica",
    deleteList: "Elimina",
    export: "Esporta",
    exported: (format: string) => `Esportato in ${format}`,
    exportedAndSent: (format: string, email: string) => `Esportato in ${format} e inviato a ${email}`,
    crmSynced: (crm: string) => `Sincronizzato con ${crm}`,
    blacklistedCount: (n: number) => `${n} ${n === 1 ? "azienda aggiunta" : "aziende aggiunte"} alla blacklist`,
    linkToCampaign: "Collega a una campagna",
    duplicateList: "Duplica",
    copySuffix: "(copia)",
    duplicated: (name: string) => `"${name}" creata`,
    addSource: "Aggiungi fonte",
    rename: "Rinomina",
    labelSource: "Fonte",
    labelEnrich: "Arricchimento",
    labelCrm: "CRM",
    labelCampaign: "Contatto",
    notSet: "Non impostata",
    notLinked: "Non collegato",
    noAutomation: "Nessuna automazione",
    allEnrichedShort: "Tutto arricchito",
    needEnrichShort: (n: number) => `${n} da arricchire`,
    linkToCrm: "Sincronizza con il CRM",
    crmLinked: (crm: string) => `Sincronizzata con ${crm}`,
    getStartedTitle: "Inizia",
    getStartedDesc: "Aggiungi prospect a questa lista per iniziare a lavorarla.",
    getStartedDescCo: "Aggiungi aziende a questa lista per iniziare a lavorarla.",
    importCsv: "Importa",
    prospectsHeading: "Prospect",
    addProspects: "Trova prospect",
    columns: "Colonne",
    editTable: "Modifica",
    editDone: "Fatto",
    editingHint: "Modifica in corso — le modifiche si salvano automaticamente",
    colProspect: "Prospect",
    colCompany: "Azienda",
    colScore: "Punteggio",
    colStatus: "Stato",
    removeFromListAction: "Rimuovi dalla lista",
    moveToListAction: "Sposta in lista",
    enrichRow: "Arricchisci",
    removed: "Rimosso dalla lista",
    removedCount: (n: number) => `${n} rimossi dalla lista`,
    emptyState: "Ancora nessun prospect — aggiungine alcuni per iniziare.",
    deleteTitle: "Eliminare la lista?",
    deleteDescription: (name: string) =>
      `"${name}" verrà eliminata definitivamente. I prospect restano nel tuo spazio di lavoro.`,
    deleteConfirm: "Elimina",
    listDeleted: "Lista eliminata",
    dynamicBadge: "Dinamica",
    audience: "Prospect",
    allProspects: "Tutti i prospect",
    enrichment: "Arricchimento",
    keptFresh: "Mantenuto aggiornato in continuo",
    enrichedOnAdd: "Arricchito una volta all'aggiunta",
    outreach: "Contatto",
    autoEnrolls: "Iscrive automaticamente i nuovi prospect",
    oneTimeSend: "Invio una tantum",
    noSequence: "Nessuna sequenza collegata",
    reviewManually: "Rivedi manualmente",
    reviewManuallyDesc: "I nuovi risultati creano un'attività invece di inviare",
    newPerWeek: (count: number) => `~${count} nuovi prospect / settimana`,
    lastSynced: (date: string) => `Ultima sincronizzazione ${date}`,
    addProspectsTitle: "Aggiungi prospect",
    addProspectsDescription: (name: string) =>
      `Importa prospect in "${name}" da qualsiasi fonte.`,
    allAlready: "Tutti i prospect sono già in questa lista.",
    cancel: "Annulla",
    addSelected: "Aggiungi selezionati",
    added: (count: number) =>
      `${count} prospect ${count === 1 ? "aggiunto" : "aggiunti"}`,
    addSrcAi: "Trova con Kombo AI",
    addSrcExisting: "Aggiungi dai tuoi prospect",
    addSrcImport: "Importa da CSV",
    addSrcManual: "Aggiungi un contatto manualmente",
    addSrcCrm: "Importa dal tuo CRM",
    addSearchExisting: "Cerca nei tuoi prospect…",
    addBack: "Indietro",
    addNoMatch: "Nessun prospect corrisponde.",
    // Enrichment
    dataEnrichment: "Arricchimento dati",
    allEnriched: "Tutti i contatti arricchiti",
    allEnrichedDesc: "Email verificate, numeri diretti e dati completi sono pronti.",
    needEnrichment: (count: number) =>
      `${count} ${count === 1 ? "contatto necessita" : "contatti necessitano"} di arricchimento`,
    needEnrichmentDesc:
      "Arricchisci prima di lanciare una campagna per una migliore deliverability e più risposte.",
    enriched: (done: number, total: number) => `${done}/${total} arricchiti`,
    enrichContacts: (count: number) => `Arricchisci ${count}`,
    // Company lists
    companies: "aziende",
    companiesHeading: "Aziende",
    addCompanies: "Trova aziende",
    findContacts: "Trova prospect",
    emptyStateCo: "Ancora nessuna azienda — aggiungine alcune per iniziare.",
    addCompaniesTitle: "Aggiungi aziende",
    addCompaniesDescription: (name: string) =>
      `Importa aziende in "${name}" da qualsiasi fonte.`,
    allAlreadyCo: "Tutte le aziende sono già in questa lista.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "azienda aggiunta" : "aziende aggiunte"}`,
    addCoSrcAi: "Trova con Kombo AI",
    addCoSrcExisting: "Aggiungi dalle tue aziende",
    addCoSrcImport: "Importa da CSV",
    addCoSrcManual: "Aggiungi un'azienda manualmente",
    addCoSrcCrm: "Importa dal tuo CRM",
    addCoSearchExisting: "Cerca nelle tue aziende…",
    addCoNoMatch: "Nessuna azienda corrisponde.",
  },
  fr: {
    listNotFound: "Liste introuvable.",
    lists: "Toutes les listes",
    prospects: "prospects",
    edit: "Modifier",
    deleteList: "Supprimer",
    export: "Exporter",
    exported: (format: string) => `Exporté au format ${format}`,
    exportedAndSent: (format: string, email: string) => `Exporté au format ${format} et envoyé à ${email}`,
    crmSynced: (crm: string) => `Synchronisé avec ${crm}`,
    blacklistedCount: (n: number) => `${n} ${n === 1 ? "entreprise ajoutée" : "entreprises ajoutées"} à la liste noire`,
    linkToCampaign: "Lier à une campagne",
    duplicateList: "Dupliquer",
    copySuffix: "(copie)",
    duplicated: (name: string) => `« ${name} » créée`,
    addSource: "Ajouter une source",
    rename: "Renommer",
    labelSource: "Source",
    labelEnrich: "Enrichissement",
    labelCrm: "CRM",
    labelCampaign: "Prospection",
    notSet: "Non définie",
    notLinked: "Non lié",
    noAutomation: "Aucune automatisation",
    allEnrichedShort: "Tout enrichi",
    needEnrichShort: (n: number) => `${n} à enrichir`,
    linkToCrm: "Synchroniser avec le CRM",
    crmLinked: (crm: string) => `Synchronisée avec ${crm}`,
    getStartedTitle: "Pour commencer",
    getStartedDesc: "Ajoutez des prospects à cette liste pour commencer à la travailler.",
    getStartedDescCo: "Ajoutez des entreprises à cette liste pour commencer à la travailler.",
    importCsv: "Importer",
    prospectsHeading: "Prospects",
    addProspects: "Trouver des prospects",
    columns: "Colonnes",
    editTable: "Modifier",
    editDone: "Terminé",
    editingHint: "Modification en cours — les changements sont enregistrés automatiquement",
    colProspect: "Prospect",
    colCompany: "Entreprise",
    colScore: "Score",
    colStatus: "Statut",
    removeFromListAction: "Retirer de la liste",
    moveToListAction: "Déplacer vers une liste",
    enrichRow: "Enrichir",
    removed: "Retiré de la liste",
    removedCount: (n: number) => `${n} retirés de la liste`,
    emptyState: "Aucun prospect pour le moment — ajoutez-en pour commencer.",
    deleteTitle: "Supprimer la liste ?",
    deleteDescription: (name: string) =>
      `« ${name} » sera définitivement supprimée. Les prospects restent dans votre espace de travail.`,
    deleteConfirm: "Supprimer",
    listDeleted: "Liste supprimée",
    dynamicBadge: "Dynamique",
    audience: "Prospects",
    allProspects: "Tous les prospects",
    enrichment: "Enrichissement",
    keptFresh: "Maintenu à jour en continu",
    enrichedOnAdd: "Enrichi une seule fois à l'ajout",
    outreach: "Prospection",
    autoEnrolls: "Inscrit automatiquement les nouveaux prospects",
    oneTimeSend: "Envoi unique",
    noSequence: "Aucune séquence associée",
    reviewManually: "Vérifier manuellement",
    reviewManuallyDesc: "Les nouvelles correspondances créent une tâche au lieu d'envoyer",
    newPerWeek: (count: number) => `~${count} nouveaux prospects / semaine`,
    lastSynced: (date: string) => `Dernière synchronisation ${date}`,
    addProspectsTitle: "Ajouter des prospects",
    addProspectsDescription: (name: string) =>
      `Importez des prospects dans « ${name} » depuis n'importe quelle source.`,
    allAlready: "Tous les prospects sont déjà dans cette liste.",
    cancel: "Annuler",
    addSelected: "Ajouter la sélection",
    added: (count: number) =>
      `${count} ${count === 1 ? "prospect ajouté" : "prospects ajoutés"}`,
    addSrcAi: "Trouver avec Kombo AI",
    addSrcExisting: "Ajouter depuis vos prospects",
    addSrcImport: "Importer depuis un CSV",
    addSrcManual: "Ajouter un contact manuellement",
    addSrcCrm: "Importer depuis votre CRM",
    addSearchExisting: "Rechercher parmi vos prospects…",
    addBack: "Retour",
    addNoMatch: "Aucun prospect ne correspond.",
    // Enrichment
    dataEnrichment: "Enrichissement des données",
    allEnriched: "Tous les contacts enrichis",
    allEnrichedDesc: "E-mails vérifiés, lignes directes et données complètes sont prêts.",
    needEnrichment: (count: number) =>
      `${count} ${count === 1 ? "contact nécessite" : "contacts nécessitent"} un enrichissement`,
    needEnrichmentDesc:
      "Enrichissez avant de lancer une campagne pour une meilleure délivrabilité et un meilleur taux de réponse.",
    enriched: (done: number, total: number) => `${done}/${total} enrichis`,
    enrichContacts: (count: number) => `Enrichir ${count}`,
    // Company lists
    companies: "entreprises",
    companiesHeading: "Entreprises",
    addCompanies: "Trouver des entreprises",
    findContacts: "Trouver des prospects",
    emptyStateCo: "Aucune entreprise pour le moment — ajoutez-en pour commencer.",
    addCompaniesTitle: "Ajouter des entreprises",
    addCompaniesDescription: (name: string) =>
      `Importez des entreprises dans « ${name} » depuis n'importe quelle source.`,
    allAlreadyCo: "Toutes les entreprises sont déjà dans cette liste.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "entreprise ajoutée" : "entreprises ajoutées"}`,
    addCoSrcAi: "Trouver avec Kombo AI",
    addCoSrcExisting: "Ajouter depuis vos entreprises",
    addCoSrcImport: "Importer depuis un CSV",
    addCoSrcManual: "Ajouter une entreprise manuellement",
    addCoSrcCrm: "Importer depuis votre CRM",
    addCoSearchExisting: "Rechercher parmi vos entreprises…",
    addCoNoMatch: "Aucune entreprise ne correspond.",
  },
  de: {
    listNotFound: "Liste nicht gefunden.",
    lists: "Alle Listen",
    prospects: "Prospects",
    edit: "Bearbeiten",
    deleteList: "Löschen",
    export: "Exportieren",
    exported: (format: string) => `Als ${format} exportiert`,
    exportedAndSent: (format: string, email: string) => `Als ${format} exportiert und an ${email} gesendet`,
    crmSynced: (crm: string) => `Mit ${crm} synchronisiert`,
    blacklistedCount: (n: number) => `${n} Unternehmen zur Blacklist hinzugefügt`,
    linkToCampaign: "Mit Kampagne verknüpfen",
    duplicateList: "Duplizieren",
    copySuffix: "(Kopie)",
    duplicated: (name: string) => `„${name}“ erstellt`,
    addSource: "Quelle hinzufügen",
    rename: "Umbenennen",
    labelSource: "Quelle",
    labelEnrich: "Anreicherung",
    labelCrm: "CRM",
    labelCampaign: "Outreach",
    notSet: "Nicht gesetzt",
    notLinked: "Nicht verknüpft",
    noAutomation: "Keine Automatisierung",
    allEnrichedShort: "Alle angereichert",
    needEnrichShort: (n: number) => `${n} anzureichern`,
    linkToCrm: "Mit CRM synchronisieren",
    crmLinked: (crm: string) => `Synchronisiert mit ${crm}`,
    getStartedTitle: "Los geht's",
    getStartedDesc: "Füge dieser Liste Prospects hinzu, um loszulegen.",
    getStartedDescCo: "Füge dieser Liste Unternehmen hinzu, um loszulegen.",
    importCsv: "Importieren",
    prospectsHeading: "Prospects",
    addProspects: "Prospects finden",
    columns: "Spalten",
    editTable: "Bearbeiten",
    editDone: "Fertig",
    editingHint: "Bearbeitung läuft — Änderungen werden automatisch gespeichert",
    colProspect: "Prospect",
    colCompany: "Unternehmen",
    colScore: "Score",
    colStatus: "Status",
    removeFromListAction: "Aus der Liste entfernen",
    moveToListAction: "In Liste verschieben",
    enrichRow: "Anreichern",
    removed: "Aus der Liste entfernt",
    removedCount: (n: number) => `${n} aus der Liste entfernt`,
    emptyState: "Noch keine Prospects — füge welche hinzu, um loszulegen.",
    deleteTitle: "Liste löschen?",
    deleteDescription: (name: string) =>
      `„${name}" wird dauerhaft entfernt. Prospects bleiben in deinem Workspace erhalten.`,
    deleteConfirm: "Löschen",
    listDeleted: "Liste gelöscht",
    dynamicBadge: "Dynamisch",
    audience: "Prospects",
    allProspects: "Alle Prospects",
    enrichment: "Anreicherung",
    keptFresh: "Kontinuierlich aktuell gehalten",
    enrichedOnAdd: "Einmalig bei Hinzufügen angereichert",
    outreach: "Outreach",
    autoEnrolls: "Registriert neue Prospects automatisch",
    oneTimeSend: "Einmaliger Versand",
    noSequence: "Keine Sequenz verknüpft",
    reviewManually: "Manuell überprüfen",
    reviewManuallyDesc: "Neue Treffer erstellen eine Aufgabe, statt zu senden",
    newPerWeek: (count: number) => `~${count} neue Prospects / Woche`,
    lastSynced: (date: string) => `Zuletzt synchronisiert ${date}`,
    addProspectsTitle: "Prospects hinzufügen",
    addProspectsDescription: (name: string) =>
      `Ziehe Prospects aus jeder beliebigen Quelle in „${name}".`,
    allAlready: "Alle Prospects sind bereits in dieser Liste.",
    cancel: "Abbrechen",
    addSelected: "Auswahl hinzufügen",
    added: (count: number) =>
      `${count} ${count === 1 ? "Prospect" : "Prospects"} hinzugefügt`,
    addSrcAi: "Mit Kombo AI finden",
    addSrcExisting: "Aus deinen Prospects hinzufügen",
    addSrcImport: "Aus CSV importieren",
    addSrcManual: "Kontakt manuell hinzufügen",
    addSrcCrm: "Aus deinem CRM importieren",
    addSearchExisting: "Deine Prospects durchsuchen…",
    addBack: "Zurück",
    addNoMatch: "Keine Prospects gefunden.",
    // Enrichment
    dataEnrichment: "Datenanreicherung",
    allEnriched: "Alle Kontakte angereichert",
    allEnrichedDesc: "Verifizierte E-Mails, Durchwahlen und vollständige Datenpunkte sind bereit.",
    needEnrichment: (count: number) =>
      `${count} ${count === 1 ? "Kontakt benötigt" : "Kontakte benötigen"} eine Anreicherung`,
    needEnrichmentDesc:
      "Reichere an, bevor du eine Kampagne startest, für bessere Zustellbarkeit und Antwortquote.",
    enriched: (done: number, total: number) => `${done}/${total} angereichert`,
    enrichContacts: (count: number) => `${count} anreichern`,
    // Company lists
    companies: "Unternehmen",
    companiesHeading: "Unternehmen",
    addCompanies: "Unternehmen finden",
    findContacts: "Prospects finden",
    emptyStateCo: "Noch keine Unternehmen — füge welche hinzu, um loszulegen.",
    addCompaniesTitle: "Unternehmen hinzufügen",
    addCompaniesDescription: (name: string) =>
      `Ziehe Unternehmen aus jeder beliebigen Quelle in „${name}".`,
    allAlreadyCo: "Alle Unternehmen sind bereits in dieser Liste.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "Unternehmen hinzugefügt" : "Unternehmen hinzugefügt"}`,
    addCoSrcAi: "Mit Kombo AI finden",
    addCoSrcExisting: "Aus deinen Unternehmen hinzufügen",
    addCoSrcImport: "Aus CSV importieren",
    addCoSrcManual: "Unternehmen manuell hinzufügen",
    addCoSrcCrm: "Aus deinem CRM importieren",
    addCoSearchExisting: "Deine Unternehmen durchsuchen…",
    addCoNoMatch: "Keine Unternehmen gefunden.",
  },
  pt: {
    listNotFound: "Lista não encontrada.",
    lists: "Todas as listas",
    prospects: "prospects",
    edit: "Editar",
    deleteList: "Eliminar",
    export: "Exportar",
    exported: (format: string) => `Exportado para ${format}`,
    exportedAndSent: (format: string, email: string) => `Exportado para ${format} e enviado para ${email}`,
    crmSynced: (crm: string) => `Sincronizado com ${crm}`,
    blacklistedCount: (n: number) => `${n} ${n === 1 ? "empresa adicionada" : "empresas adicionadas"} à lista negra`,
    linkToCampaign: "Associar a uma campanha",
    duplicateList: "Duplicar",
    copySuffix: "(cópia)",
    duplicated: (name: string) => `"${name}" criada`,
    addSource: "Adicionar fonte",
    rename: "Renomear",
    labelSource: "Fonte",
    labelEnrich: "Enriquecimento",
    labelCrm: "CRM",
    labelCampaign: "Contacto",
    notSet: "Por definir",
    notLinked: "Não associado",
    noAutomation: "Sem automação",
    allEnrichedShort: "Tudo enriquecido",
    needEnrichShort: (n: number) => `${n} a enriquecer`,
    linkToCrm: "Sincronizar com o CRM",
    crmLinked: (crm: string) => `Sincronizada com ${crm}`,
    getStartedTitle: "Começar",
    getStartedDesc: "Adicione prospects a esta lista para começar a trabalhá-la.",
    getStartedDescCo: "Adicione empresas a esta lista para começar a trabalhá-la.",
    importCsv: "Importar",
    prospectsHeading: "Prospects",
    addProspects: "Encontrar prospects",
    columns: "Colunas",
    editTable: "Editar",
    editDone: "Concluído",
    editingHint: "A editar — as alterações são guardadas automaticamente",
    colProspect: "Prospect",
    colCompany: "Empresa",
    colScore: "Pontuação",
    colStatus: "Estado",
    removeFromListAction: "Remover da lista",
    moveToListAction: "Mover para lista",
    enrichRow: "Enriquecer",
    removed: "Removido da lista",
    removedCount: (n: number) => `${n} removidos da lista`,
    emptyState: "Ainda não há prospects — adicione alguns para começar.",
    deleteTitle: "Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" será removida permanentemente. Os prospects permanecem no seu espaço de trabalho.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    dynamicBadge: "Dinâmica",
    audience: "Prospects",
    allProspects: "Todos os prospects",
    enrichment: "Enriquecimento",
    keptFresh: "Mantido atualizado continuamente",
    enrichedOnAdd: "Enriquecido uma vez ao adicionar",
    outreach: "Contacto",
    autoEnrolls: "Inscreve automaticamente novos prospects",
    oneTimeSend: "Envio único",
    noSequence: "Nenhuma sequência associada",
    reviewManually: "Rever manualmente",
    reviewManuallyDesc: "As novas correspondências criam uma tarefa em vez de enviar",
    newPerWeek: (count: number) => `~${count} novos prospects / semana`,
    lastSynced: (date: string) => `Última sincronização ${date}`,
    addProspectsTitle: "Adicionar prospects",
    addProspectsDescription: (name: string) =>
      `Traga prospects para "${name}" de qualquer fonte.`,
    allAlready: "Todos os prospects já estão nesta lista.",
    cancel: "Cancelar",
    addSelected: "Adicionar selecionados",
    added: (count: number) =>
      `${count} ${count === 1 ? "prospect adicionado" : "prospects adicionados"}`,
    addSrcAi: "Encontrar com o Kombo AI",
    addSrcExisting: "Adicionar a partir dos seus prospects",
    addSrcImport: "Importar de CSV",
    addSrcManual: "Adicionar um contacto manualmente",
    addSrcCrm: "Importar do seu CRM",
    addSearchExisting: "Pesquisar os seus prospects…",
    addBack: "Voltar",
    addNoMatch: "Nenhum prospect corresponde.",
    // Enrichment
    dataEnrichment: "Enriquecimento de dados",
    allEnriched: "Todos os contactos enriquecidos",
    allEnrichedDesc: "Emails verificados, contactos diretos e dados completos estão prontos.",
    needEnrichment: (count: number) =>
      `${count} ${count === 1 ? "contacto precisa" : "contactos precisam"} de enriquecimento`,
    needEnrichmentDesc:
      "Enriqueça antes de lançar uma campanha para melhor entregabilidade e taxa de resposta.",
    enriched: (done: number, total: number) => `${done}/${total} enriquecidos`,
    enrichContacts: (count: number) => `Enriquecer ${count}`,
    // Company lists
    companies: "empresas",
    companiesHeading: "Empresas",
    addCompanies: "Encontrar empresas",
    findContacts: "Encontrar prospects",
    emptyStateCo: "Ainda não há empresas — adicione algumas para começar.",
    addCompaniesTitle: "Adicionar empresas",
    addCompaniesDescription: (name: string) =>
      `Traga empresas para "${name}" de qualquer fonte.`,
    allAlreadyCo: "Todas as empresas já estão nesta lista.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "empresa adicionada" : "empresas adicionadas"}`,
    addCoSrcAi: "Encontrar com o Kombo AI",
    addCoSrcExisting: "Adicionar a partir das suas empresas",
    addCoSrcImport: "Importar de CSV",
    addCoSrcManual: "Adicionar uma empresa manualmente",
    addCoSrcCrm: "Importar do seu CRM",
    addCoSearchExisting: "Pesquisar as suas empresas…",
    addCoNoMatch: "Nenhuma empresa corresponde.",
  },
  pt_BR: {
    listNotFound: "Lista não encontrada.",
    lists: "Todas as listas",
    prospects: "prospects",
    edit: "Editar",
    deleteList: "Excluir",
    export: "Exportar",
    exported: (format: string) => `Exportado para ${format}`,
    exportedAndSent: (format: string, email: string) => `Exportado para ${format} e enviado para ${email}`,
    crmSynced: (crm: string) => `Sincronizado com ${crm}`,
    blacklistedCount: (n: number) => `${n} ${n === 1 ? "empresa adicionada" : "empresas adicionadas"} à lista negra`,
    linkToCampaign: "Vincular a uma campanha",
    duplicateList: "Duplicar",
    copySuffix: "(cópia)",
    duplicated: (name: string) => `"${name}" criada`,
    addSource: "Adicionar fonte",
    rename: "Renomear",
    labelSource: "Fonte",
    labelEnrich: "Enriquecimento",
    labelCrm: "CRM",
    labelCampaign: "Contacto",
    notSet: "Por definir",
    notLinked: "Não associado",
    noAutomation: "Sem automação",
    allEnrichedShort: "Tudo enriquecido",
    needEnrichShort: (n: number) => `${n} a enriquecer`,
    linkToCrm: "Sincronizar com o CRM",
    crmLinked: (crm: string) => `Sincronizada com ${crm}`,
    getStartedTitle: "Começar",
    getStartedDesc: "Adicione prospects a esta lista para começar a trabalhá-la.",
    getStartedDescCo: "Adicione empresas a esta lista para começar a trabalhá-la.",
    importCsv: "Importar",
    prospectsHeading: "Prospects",
    addProspects: "Encontrar prospects",
    columns: "Colunas",
    editTable: "Editar",
    editDone: "Concluído",
    editingHint: "Editando — as alterações são salvas automaticamente",
    colProspect: "Prospect",
    colCompany: "Empresa",
    colScore: "Pontuação",
    colStatus: "Status",
    removeFromListAction: "Remover da lista",
    moveToListAction: "Mover para lista",
    enrichRow: "Enriquecer",
    removed: "Removido da lista",
    removedCount: (n: number) => `${n} removidos da lista`,
    emptyState: "Ainda não há prospects — adicione alguns para começar.",
    deleteTitle: "Excluir lista?",
    deleteDescription: (name: string) =>
      `"${name}" será removida permanentemente. Os prospects permanecem no seu espaço de trabalho.`,
    deleteConfirm: "Excluir",
    listDeleted: "Lista excluída",
    dynamicBadge: "Dinâmica",
    audience: "Prospects",
    allProspects: "Todos os prospects",
    enrichment: "Enriquecimento",
    keptFresh: "Mantido atualizado continuamente",
    enrichedOnAdd: "Enriquecido uma vez ao adicionar",
    outreach: "Contato",
    autoEnrolls: "Inscreve automaticamente novos prospects",
    oneTimeSend: "Envio único",
    noSequence: "Nenhuma sequência associada",
    reviewManually: "Revisar manualmente",
    reviewManuallyDesc: "As novas correspondências criam uma tarefa em vez de enviar",
    newPerWeek: (count: number) => `~${count} novos prospects / semana`,
    lastSynced: (date: string) => `Última sincronização ${date}`,
    addProspectsTitle: "Adicionar prospects",
    addProspectsDescription: (name: string) =>
      `Traga prospects para "${name}" de qualquer fonte.`,
    allAlready: "Todos os prospects já estão nesta lista.",
    cancel: "Cancelar",
    addSelected: "Adicionar selecionados",
    added: (count: number) =>
      `${count} ${count === 1 ? "prospect adicionado" : "prospects adicionados"}`,
    addSrcAi: "Encontrar com o Kombo AI",
    addSrcExisting: "Adicionar a partir dos seus prospects",
    addSrcImport: "Importar de CSV",
    addSrcManual: "Adicionar um contato manualmente",
    addSrcCrm: "Importar do seu CRM",
    addSearchExisting: "Buscar seus prospects…",
    addBack: "Voltar",
    addNoMatch: "Nenhum prospect corresponde.",
    // Enrichment
    dataEnrichment: "Enriquecimento de dados",
    allEnriched: "Todos os contatos enriquecidos",
    allEnrichedDesc: "Emails verificados, contatos diretos e dados completos estão prontos.",
    needEnrichment: (count: number) =>
      `${count} ${count === 1 ? "contato precisa" : "contatos precisam"} de enriquecimento`,
    needEnrichmentDesc:
      "Enriqueça antes de lançar uma campanha para melhor entregabilidade e taxa de resposta.",
    enriched: (done: number, total: number) => `${done}/${total} enriquecidos`,
    enrichContacts: (count: number) => `Enriquecer ${count}`,
    // Company lists
    companies: "empresas",
    companiesHeading: "Empresas",
    addCompanies: "Encontrar empresas",
    findContacts: "Encontrar prospects",
    emptyStateCo: "Ainda não há empresas — adicione algumas para começar.",
    addCompaniesTitle: "Adicionar empresas",
    addCompaniesDescription: (name: string) =>
      `Traga empresas para "${name}" de qualquer fonte.`,
    allAlreadyCo: "Todas as empresas já estão nesta lista.",
    addedCo: (count: number) =>
      `${count} ${count === 1 ? "empresa adicionada" : "empresas adicionadas"}`,
    addCoSrcAi: "Encontrar com o Kombo AI",
    addCoSrcExisting: "Adicionar a partir das suas empresas",
    addCoSrcImport: "Importar de CSV",
    addCoSrcManual: "Adicionar uma empresa manualmente",
    addCoSrcCrm: "Importar do seu CRM",
    addCoSearchExisting: "Buscar suas empresas…",
    addCoNoMatch: "Nenhuma empresa corresponde.",
  },
} as const

// "All contacts enriched" is dismissable, but the dismissal only applies to
// the specific enriched roster it was shown for — recorded as the member
// count at dismiss time. If the list's membership changes afterward (a new
// unenriched contact added, then re-enriched), that's a new "fully
// enriched" instance and the banner reappears without needing a reload.
function readAllEnrichedDismissCount(listId: string): number | null {
  const raw = localStorage.getItem(`kb_list_${listId}_all_enriched_dismiss`)
  return raw === null ? null : Number(raw)
}

function writeAllEnrichedDismissCount(listId: string, count: number): void {
  localStorage.setItem(`kb_list_${listId}_all_enriched_dismiss`, String(count))
}

export default function ListDetail() {
  const { locale, t } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const navigate = useNavigate()
  const lists = useLists()
  const list = id ? lists.find((l) => l.id === id) : undefined

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  // Which of AddRecordsDialog's own tabs to land on — the empty-state's
  // "Import from CSV" shortcut jumps straight to Import instead of Search.
  const [addInitialMode, setAddInitialMode] = React.useState<"search" | "import">("search")
  const [findContactsOpen, setFindContactsOpen] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [enrichOpen, setEnrichOpen] = React.useState(false)
  const [linkCampaignOpen, setLinkCampaignOpen] = React.useState(false)
  const [addSourceOpen, setAddSourceOpen] = React.useState(false)
  const [linkCrmOpen, setLinkCrmOpen] = React.useState(false)
  const [companyEnrichOpen, setCompanyEnrichOpen] = React.useState(false)
  const [bulkEnrichOpen, setBulkEnrichOpen] = React.useState(false)
  // Company lists only — the row menu's "Enrich" is always array-based
  // (CompanyEnrichDialog), so the bulk-selection version just scopes it to
  // the current selection instead of the whole list.
  const [bulkCompanyEnrichOpen, setBulkCompanyEnrichOpen] = React.useState(false)
  const [bulkCrmOpen, setBulkCrmOpen] = React.useState(false)
  // Company lists only — "Find prospects" scoped to the current selection,
  // distinct from the whole-list version in the toolbar above the table.
  const [selectionFindContactsOpen, setSelectionFindContactsOpen] = React.useState(false)
  // Per-row Enrich — a dedicated one-click action distinct from the "…"
  // menu's own Enrich item, scoped to a single member rather than the
  // current multi-select.
  const [rowEnrichProspect, setRowEnrichProspect] = React.useState<Prospect | null>(null)
  const [bulkAddOpen, setBulkAddOpen] = React.useState(false)
  const [bulkMoveOpen, setBulkMoveOpen] = React.useState(false)
  // Single-record "Move to list" from a row's own "…" menu — reuses the
  // same BulkAddDialog as the bulk action, just scoped to one id.
  const [moveOneId, setMoveOneId] = React.useState<string | null>(null)
  const [exportOpen, setExportOpen] = React.useState(false)
  const columnPrefs = useColumnPrefs("list-prospects", PEOPLE_DEFAULT_IDS)
  const accountColumnPrefs = useColumnPrefs("list-accounts", COMPANY_DEFAULT_IDS)
  // Inline editing + AI/custom columns — the same machinery People/Companies
  // use; the list is the user's own copy of the data.
  const [tableEditing, setTableEditing] = React.useState(false)
  const [aiColOpen, setAiColOpen] = React.useState(false)
  const peopleAiCols = useAiColumns("people")
  const companyAiCols = useAiColumns("company")
  const allPeopleColumns = React.useMemo(
    () => [...PEOPLE_COLUMNS, ...aiColumnsToDefs<Prospect>(peopleAiCols)],
    [peopleAiCols]
  )
  const allCompanyColumns = React.useMemo(
    () => [...COMPANY_COLUMNS, ...aiColumnsToDefs<Account>(companyAiCols)],
    [companyAiCols]
  )

  // Visiting a list registers it as an open tab — same mental model as a
  // browser tab appearing the moment you navigate somewhere.
  React.useEffect(() => {
    if (id) listTabsStore.open(id)
  }, [id])

  // Computed with safe fallbacks (rather than after the `!list` guard below)
  // so the paged-selection hook can be called unconditionally, per the rules
  // of hooks.
  const isCompany = list?.kind === "company"
  const members: Prospect[] = list
    ? list.prospectIds.map(getProspect).filter((p): p is Prospect => Boolean(p))
    : []
  const accountMembers: Account[] = list
    ? (list.accountIds ?? []).map(getAccount).filter((a): a is Account => Boolean(a))
    : []
  const peopleTsf = useTableSortFilter(allPeopleColumns, members)
  const companyTsf = useTableSortFilter(allCompanyColumns, accountMembers)
  const sel = usePagedSelection<Prospect | Account>(
    isCompany ? companyTsf.rows : peopleTsf.rows,
    (r) => r.id,
    list?.id
  )
  const { selectedIds, allSelected, someSelected } = sel

  // Dismissal is scoped to the current list and the roster it was shown for
  // (see readAllEnrichedDismissCount above) — re-derived whenever the list
  // itself changes, following the same render-time-check reset pattern as
  // usePagedSelection's resetKey, rather than an effect.
  const [allEnrichedDismissedFor, setAllEnrichedDismissedFor] = React.useState(() =>
    list ? readAllEnrichedDismissCount(list.id) : null
  )
  const [dismissTrackedListId, setDismissTrackedListId] = React.useState(list?.id)
  if (list?.id !== dismissTrackedListId) {
    setDismissTrackedListId(list?.id)
    setAllEnrichedDismissedFor(list ? readAllEnrichedDismissCount(list.id) : null)
  }

  if (!list) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.listNotFound}</p>
        <BackLink to="/lists" label={c.lists} variant="link" />
      </Page>
    )
  }

  const memberCount = isCompany ? accountMembers.length : members.length
  const pending = members.filter((p) => !isEnriched(p))
  const enrichedCount = members.length - pending.length
  // Fully-enriched records are excluded — re-enriching them is a no-op.
  const pendingEnrichCount = isCompany
    ? accountMembers.filter((a) => !isCompanyEnriched(a)).length
    : members.filter(needsAnyEnrichScope).length

  const selectedMembers = members.filter((p) => selectedIds.has(p.id))
  const selectedAccounts = accountMembers.filter((a) => selectedIds.has(a.id))
  const selectedCount = isCompany
    ? selectedAccounts.length
    : selectedMembers.length
  const listId = list.id
  function removeSelected() {
    if (isCompany) {
      selectedAccounts.forEach((a) => listStore.removeAccount(listId, a.id))
    } else {
      selectedMembers.forEach((p) => listStore.removeProspect(listId, p.id))
    }
    toast.success(c.removedCount(selectedCount))
    sel.clear()
  }
  // The per-row "…" menu's Export item — same CSV shape as the bulk
  // export, just for a single record and no format picker.
  function exportOneAccount(a: Account) {
    downloadCsv("company.csv", ["Company", "Industry", "Domain", "Tier"], [
      [a.name, a.industry, a.domain, a.tier],
    ])
    toast.success(c.exported("CSV"))
  }
  function exportOneProspect(p: Prospect) {
    downloadCsv(
      "prospect.csv",
      ["Name", "Title", "Company", "Email", "Location"],
      [[`${p.firstName} ${p.lastName}`, p.title, p.company, p.email, p.location]]
    )
    toast.success(c.exported("CSV"))
  }
  function confirmExport(opts: { format: ExportFormat; sendTo?: string }) {
    if (opts.format === "crm") {
      toast.success(c.crmSynced(CONNECTED_CRM_PROVIDER.name))
      sel.clear()
      return
    }
    const formatLabel = opts.format === "excel" ? "Excel" : "CSV"
    if (isCompany) {
      downloadCsv(
        opts.format === "excel" ? "companies.xlsx" : "companies.csv",
        ["Company", "Industry", "Domain", "Tier"],
        selectedAccounts.map((a) => [a.name, a.industry, a.domain, a.tier])
      )
    } else {
      downloadCsv(
        opts.format === "excel" ? "people.xlsx" : "people.csv",
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
    toast.success(
      opts.sendTo ? c.exportedAndSent(formatLabel, opts.sendTo) : c.exported(formatLabel)
    )
    sel.clear()
  }
  // Lookalike is a kind of search — hand the seed to the Search page, same
  // pattern as Companies.tsx/People.tsx, seeded from the first selected row.
  function findLookalikes() {
    if (isCompany) {
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
    } else {
      const p = selectedMembers[0]
      if (!p) return
      navigate("/search", {
        state: {
          lookalikeSeed: {
            id: p.id,
            kind: "person",
            name: `${p.firstName} ${p.lastName}`,
            sub: `${p.title} @ ${p.company}`,
            industry: p.industry,
            region: "",
            headcount: p.headcount,
          },
        },
      })
    }
  }
  // Mirrors the row menu's "Add to CRM" — this app only ever has one
  // connected CRM, so there's nothing to pick, just an owner to confirm.
  // Same never-overwrite rule as the row-level wizard: only fills in an
  // owner where one isn't already set.
  function confirmBulkCrm(ownerId: string | undefined) {
    if (ownerId) {
      if (isCompany) {
        selectedAccounts.forEach((a) => {
          if (!a.ownerId) accountStore.update(a.id, { ownerId })
        })
      } else {
        selectedMembers.forEach((p) => {
          if (!p.ownerId) prospectStore.update(p.id, { ownerId })
        })
      }
    }
    toast.success(c.crmSynced(CONNECTED_CRM_PROVIDER.name))
    sel.clear()
  }
  // Company lists only — mirrors the row menu's "Add to blacklist".
  function addSelectedToBlacklist() {
    blacklistStore.addMany(
      selectedAccounts.map((a) => ({ name: a.name, domain: a.domain, reason: "Manual" }))
    )
    toast.success(c.blacklistedCount(selectedAccounts.length))
    sel.clear()
  }

  return (
    <>
      <Page className="pb-0">
        <BackLink to="/lists" label={c.lists} />
      </Page>

      {/* Full-bleed within the main content area — not constrained to the
          page's max-w-7xl — so the tab strip spans from the sidebar edge to
          the viewport edge. Horizontal padding matches AppHeader's own
          px-4 md:px-6 so its edges still line up with the rest of the
          chrome. */}
      <div className="px-4 md:px-6">
        <ListTabBar currentId={list.id} />
      </div>

      <Page className="pt-0">
      <ListSettingsBox
        list={list}
        isCompany={isCompany}
        pendingEnrichCount={pendingEnrichCount}
        onRename={() => setEditOpen(true)}
        onDuplicate={() => {
          const created = listStore.create({
            name: `${list.name} ${c.copySuffix}`,
            description: list.description,
            color: list.color,
            kind: list.kind,
            source: list.source,
            assigneeId: list.assigneeId,
          })
          toast.success(c.duplicated(created.name))
          navigate(`/lists/${created.id}`)
        }}
        onDelete={() => setDeleteOpen(true)}
        onAddSource={() => setAddSourceOpen(true)}
        onEnrich={() =>
          isCompany ? setCompanyEnrichOpen(true) : setEnrichOpen(true)
        }
        onLinkToCrm={() => setLinkCrmOpen(true)}
        onLinkToCampaign={() => setLinkCampaignOpen(true)}
      />

      {!isCompany &&
        members.length > 0 &&
        list.enrichment !== "continuous" &&
        (pending.length > 0 || allEnrichedDismissedFor !== members.length) && (
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
          {pending.length > 0 ? (
            <Button variant="volt" onClick={() => setEnrichOpen(true)}>
              <Layers className="size-4" />
              {c.enrichContacts(pending.length)}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-8 shrink-0"
              onClick={() => {
                writeAllEnrichedDismissCount(list.id, members.length)
                setAllEnrichedDismissedFor(members.length)
              }}
              aria-label={t("common.dismiss")}
            >
              <X className="size-4" />
            </Button>
          )}
        </Card>
      )}

      {memberCount === 0 ? (
        <GetStartedPanel
          isCompany={isCompany}
          onFind={() => {
            setAddInitialMode("search")
            setAddOpen(true)
          }}
          onImport={() => {
            setAddInitialMode("import")
            setAddOpen(true)
          }}
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {isCompany ? c.companiesHeading : c.prospectsHeading}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(c.exported("CSV"))}
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">{c.export}</span>
              </Button>
              <TableViews
                tableKey={isCompany ? "list-accounts" : "list-prospects"}
                prefs={isCompany ? accountColumnPrefs : columnPrefs}
              />
              <Button variant="outline" size="sm" onClick={() => setColumnsOpen(true)}>
                <Columns3 className="size-4" />
                <span className="hidden sm:inline">{c.columns}</span>
              </Button>
              <Button
                variant={tableEditing ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTableEditing((v) => !v)}
              >
                <Pencil className="size-4" />
                <span className="hidden sm:inline">
                  {tableEditing ? c.editDone : c.editTable}
                </span>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddInitialMode("search")
                  setAddOpen(true)
                }}
              >
                <Plus className="size-4" />
                {isCompany ? c.addCompanies : c.addProspects}
              </Button>
            </div>
          </div>

          {tableEditing && (
            <p className="text-primary mb-3 flex items-center gap-1 text-xs">
              <Pencil className="size-3" />
              {c.editingHint}
            </p>
          )}

          <SelectionControls
            allSelected={allSelected}
            onTogglePage={sel.togglePage}
            selectedCount={selectedIds.size}
            selectableCount={sel.selectableCount}
            onSelectAllCapped={sel.selectAllCapped}
            pageStart={sel.pageStart}
            pageEnd={sel.pageEnd}
            total={isCompany ? companyTsf.rows.length : peopleTsf.rows.length}
            page={sel.page}
            pageCount={sel.pageCount}
            onPrevPage={() => sel.setPage(Math.max(0, sel.page - 1))}
            onNextPage={() => sel.setPage(Math.min(sel.pageCount - 1, sel.page + 1))}
          />

          {isCompany ? (
            <DataTable
              columns={allCompanyColumns}
              visible={accountColumnPrefs.visible}
              rows={sel.pagedItems as Account[]}
              rowKey={(a) => a.id}
              locale={locale}
              editing={tableEditing}
              onUpdate={(a, patch) => accountStore.update(a.id, patch)}
              onRowClick={(a) => navigate(`/companies/${a.id}`)}
              empty={c.emptyStateCo}
              selection={{
                isSelected: (a) => selectedIds.has(a.id),
                toggle: sel.toggleRow,
                toggleAll: sel.togglePage,
                allSelected,
                someSelected,
              }}
              actions={(a) => (
                <RecordActionsMenu
                  kind="company"
                  record={a}
                  onExport={() => exportOneAccount(a)}
                  extra={[
                    {
                      label: c.moveToListAction,
                      icon: <FolderInput className="size-4" />,
                      onClick: () => setMoveOneId(a.id),
                    },
                    {
                      label: c.removeFromListAction,
                      icon: <X className="size-4" />,
                      destructive: true,
                      onClick: () => {
                        listStore.removeAccount(list.id, a.id)
                        toast.success(c.removed)
                      },
                    },
                  ]}
                />
              )}
              sort={companyTsf.sort}
              onSortChange={companyTsf.setSort}
              filters={companyTsf.filters}
              onFilterChange={companyTsf.setFilter}
              filterRows={accountMembers}
              onAddColumn={() => setAiColOpen(true)}
              onReorderColumns={(from, to) => {
                const cur = [...accountColumnPrefs.visible]
                const fi = cur.indexOf(from)
                const ti = cur.indexOf(to)
                if (fi === -1 || ti === -1 || fi === ti) return
                cur.splice(fi, 1)
                cur.splice(ti, 0, from)
                accountColumnPrefs.setVisible(cur)
              }}
            />
          ) : (
            <DataTable
              columns={allPeopleColumns}
              visible={columnPrefs.visible}
              rows={sel.pagedItems as Prospect[]}
              rowKey={(p) => p.id}
              locale={locale}
              editing={tableEditing}
              onUpdate={(p, patch) => prospectStore.update(p.id, patch)}
              onRowClick={(p) => navigate(`/prospects/${p.id}`)}
              empty={c.emptyState}
              sort={peopleTsf.sort}
              onSortChange={peopleTsf.setSort}
              filters={peopleTsf.filters}
              onFilterChange={peopleTsf.setFilter}
              filterRows={members}
              selection={{
                isSelected: (p) => selectedIds.has(p.id),
                toggle: sel.toggleRow,
                toggleAll: sel.togglePage,
                allSelected,
                someSelected,
              }}
              actions={(p) => (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={c.enrichRow}
                    // Nothing left to reveal — enriching again is a no-op.
                    disabled={!needsAnyEnrichScope(p)}
                    onClick={() => setRowEnrichProspect(p)}
                  >
                    <Layers className="size-4" />
                  </Button>
                  <RecordActionsMenu
                    kind="person"
                    record={p}
                    onExport={() => exportOneProspect(p)}
                    extra={[
                      {
                        label: c.moveToListAction,
                        icon: <FolderInput className="size-4" />,
                        onClick: () => setMoveOneId(p.id),
                      },
                      {
                        label: c.removeFromListAction,
                        icon: <X className="size-4" />,
                        destructive: true,
                        onClick: () => {
                          listStore.removeProspect(list.id, p.id)
                          toast.success(c.removed)
                        },
                      },
                    ]}
                  />
                </div>
              )}
              onAddColumn={() => setAiColOpen(true)}
              onReorderColumns={(from, to) => {
                const cur = [...columnPrefs.visible]
                const fi = cur.indexOf(from)
                const ti = cur.indexOf(to)
                if (fi === -1 || ti === -1 || fi === ti) return
                cur.splice(fi, 1)
                cur.splice(ti, 0, from)
                columnPrefs.setVisible(cur)
              }}
            />
          )}

          <BulkActionsBar
            count={selectedCount}
            onClear={sel.clear}
            onExport={() => setExportOpen(true)}
            onEnrich={
              isCompany
                ? () => setBulkCompanyEnrichOpen(true)
                : () => setBulkEnrichOpen(true)
            }
            onAddToList={() => setBulkAddOpen(true)}
            onMoveToList={() => setBulkMoveOpen(true)}
            onLookalikes={findLookalikes}
            onFindContacts={isCompany ? () => setSelectionFindContactsOpen(true) : undefined}
            onAddToCrm={() => setBulkCrmOpen(true)}
            onAddToBlacklist={isCompany ? addSelectedToBlacklist : undefined}
            extra={{
              label: c.removeFromListAction,
              icon: <X className="size-4" />,
              destructive: true,
              onClick: removeSelected,
            }}
          />
        </>
      )}

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        count={selectedCount}
        onConfirm={confirmExport}
      />

      <BulkAddDialog
        open={bulkAddOpen}
        onOpenChange={setBulkAddOpen}
        mode="list"
        recordKind={isCompany ? "company" : "person"}
        ids={isCompany ? selectedAccounts.map((a) => a.id) : selectedMembers.map((p) => p.id)}
        excludeListId={listId}
        skipCostConfirm
        onDone={sel.clear}
      />

      <BulkAddDialog
        open={bulkMoveOpen}
        onOpenChange={setBulkMoveOpen}
        mode="list"
        recordKind={isCompany ? "company" : "person"}
        ids={isCompany ? selectedAccounts.map((a) => a.id) : selectedMembers.map((p) => p.id)}
        excludeListId={listId}
        moveFromListId={listId}
        skipCostConfirm
        onDone={sel.clear}
      />

      <BulkAddDialog
        open={moveOneId !== null}
        onOpenChange={(v) => !v && setMoveOneId(null)}
        mode="list"
        recordKind={isCompany ? "company" : "person"}
        ids={moveOneId ? [moveOneId] : []}
        excludeListId={listId}
        moveFromListId={listId}
        skipCostConfirm
        onDone={() => setMoveOneId(null)}
      />

      {isCompany ? (
        <ColumnManager
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={allCompanyColumns}
          groups={
            companyAiCols.length
              ? [...COMPANY_GROUPS, AI_COLUMN_GROUP]
              : COMPANY_GROUPS
          }
          prefs={accountColumnPrefs}
          locale={locale}
          onAddAiColumn={() => setAiColOpen(true)}
          aiColumnIds={new Set(companyAiCols.map((x) => x.id))}
          onDeleteColumn={(id) => aiColumnStore.remove(id)}
        />
      ) : (
        <ColumnManager
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={allPeopleColumns}
          groups={
            peopleAiCols.length
              ? [...PEOPLE_GROUPS, AI_COLUMN_GROUP]
              : PEOPLE_GROUPS
          }
          prefs={columnPrefs}
          locale={locale}
          onAddAiColumn={() => setAiColOpen(true)}
          aiColumnIds={new Set(peopleAiCols.map((x) => x.id))}
          onDeleteColumn={(id) => aiColumnStore.remove(id)}
        />
      )}

      <AddAiColumnDialog
        open={aiColOpen}
        onOpenChange={setAiColOpen}
        entity={isCompany ? "company" : "people"}
        onCreated={(id) => {
          const prefs = isCompany ? accountColumnPrefs : columnPrefs
          if (!prefs.visible.includes(id))
            prefs.setVisible([...prefs.visible, id])
        }}
      />

      <ListFormDialog open={editOpen} onOpenChange={setEditOpen} list={list} />

      <AddSourceDialog
        open={addSourceOpen}
        onOpenChange={setAddSourceOpen}
        list={list}
      />

      <LinkListToCrmDialog
        open={linkCrmOpen}
        onOpenChange={setLinkCrmOpen}
        list={list}
      />

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
        initialMode={addInitialMode}
      />

      {isCompany && (
        <AddRecordsDialog
          open={findContactsOpen}
          onOpenChange={setFindContactsOpen}
          kind="contact"
          scopeCompanies={accountMembers.map((a) => a.name)}
        />
      )}

      {/* Bulk "Find prospects" — scoped to the selected companies only,
          distinct from the whole-list toolbar version above. */}
      {isCompany && (
        <AddRecordsDialog
          open={selectionFindContactsOpen}
          onOpenChange={setSelectionFindContactsOpen}
          kind="contact"
          scopeCompanies={selectedAccounts.map((a) => a.name)}
        />
      )}

      <EnrichListDialog
        open={enrichOpen}
        onOpenChange={setEnrichOpen}
        prospects={members}
        list={list}
      />

      {/* Company enrich — the settings box's "Enrich" action for company lists. */}
      <CompanyEnrichDialog
        open={companyEnrichOpen}
        onOpenChange={setCompanyEnrichOpen}
        accounts={accountMembers}
        list={list}
      />

      {/* Bulk enrich — scoped to the selected members only. */}
      <EnrichListDialog
        open={bulkEnrichOpen}
        onOpenChange={setBulkEnrichOpen}
        prospects={selectedMembers}
      />

      {/* Bulk enrich for company lists — scoped to the selected accounts
          only, distinct from the settings box's whole-list version above. */}
      <CompanyEnrichDialog
        open={bulkCompanyEnrichOpen}
        onOpenChange={setBulkCompanyEnrichOpen}
        accounts={selectedAccounts}
      />

      {/* Per-row Enrich — scoped to whichever member's row action was clicked. */}
      <EnrichListDialog
        open={rowEnrichProspect !== null}
        onOpenChange={(v) => !v && setRowEnrichProspect(null)}
        prospects={rowEnrichProspect ? [rowEnrichProspect] : []}
      />

      <BulkAddToCrmDialog
        open={bulkCrmOpen}
        onOpenChange={setBulkCrmOpen}
        count={selectedCount}
        onConfirm={confirmBulkCrm}
      />

      <LinkListToCampaignDialog
        open={linkCampaignOpen}
        onOpenChange={setLinkCampaignOpen}
        list={list}
      />
      </Page>
    </>
  )
}

// The list's settings box — identity (name/duplicate/delete) plus the four
// primary automations that make a list "dynamic": Add Source, Enrich, Link
// to CRM, Link to Campaign. Always rendered, not just for dynamic lists —
// picking a source from here is what makes a static list dynamic in the
// first place.
function ListSettingsBox({
  list,
  isCompany,
  pendingEnrichCount,
  onRename,
  onDuplicate,
  onDelete,
  onAddSource,
  onEnrich,
  onLinkToCrm,
  onLinkToCampaign,
}: {
  list: ProspectList
  isCompany: boolean
  // Records still missing data. Already-enriched ones are excluded, so a
  // fully-enriched list reads "All enriched" instead of offering a no-op.
  pendingEnrichCount: number
  onRename: () => void
  onDuplicate: () => void
  onDelete: () => void
  onAddSource: () => void
  onEnrich: () => void
  onLinkToCrm: () => void
  onLinkToCampaign: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const savedSearches = useSavedSearches()
  const campaign = list.campaignId ? getCampaign(list.campaignId) : undefined

  const linkedSearch = list.savedSearchId
    ? savedSearches.find((s) => s.id === list.savedSearchId)
    : undefined
  const linkedCrmList = list.crmListId
    ? CRM_LISTS.find((l) => l.id === list.crmListId)
    : undefined

  const sourceLabel = linkedSearch?.name ?? linkedCrmList?.name

  // Inflow stats sit with the source that produces them, not in a separate
  // summary strip at the bottom of the card.
  const sourceHint = [
    typeof list.newPerWeek === "number" ? c.newPerWeek(list.newPerWeek) : null,
    list.lastSyncedAt ? c.lastSynced(formatDate(list.lastSyncedAt)) : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const enrichOn = list.enrichment === "continuous"
  const campaignHint = campaign
    ? list.reviewMode === "manual_review"
      ? c.reviewManually
      : list.sendMode === "continuous"
        ? c.autoEnrolls
        : c.oneTimeSend
    : undefined

  return (
    <Card className="mb-6 gap-0 overflow-hidden p-0">
      {/* The tab strip above already names the list, so this header carries
          status and record-level actions only. */}
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        {list.dynamic && (
          <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
            <span className="relative flex size-1.5">
              <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
              <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
            </span>
            {c.dynamicBadge}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onRename}>
            <Pencil className="size-4" />
            {c.rename}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate}>
            <Copy className="size-4" />
            {c.duplicateList}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            {c.deleteList}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <SettingCard
          icon={<Search className="size-3.5" />}
          label={c.labelSource}
          value={sourceLabel ?? c.notSet}
          hint={sourceLabel ? sourceHint : undefined}
          isSet={Boolean(sourceLabel)}
          onClick={onAddSource}
        />
        <SettingCard
          icon={<Layers className="size-3.5" />}
          label={c.labelEnrich}
          value={enrichOn ? c.keptFresh : c.noAutomation}
          hint={
            pendingEnrichCount > 0
              ? c.needEnrichShort(pendingEnrichCount)
              : c.allEnrichedShort
          }
          isSet={enrichOn}
          onClick={onEnrich}
        />
        <SettingCard
          icon={
            <span
              className="flex size-3.5 shrink-0 items-center justify-center rounded-[3px] text-[8px] font-semibold text-white"
              style={{ backgroundColor: CONNECTED_CRM_PROVIDER.logoColor }}
            >
              {CONNECTED_CRM_PROVIDER.name.charAt(0)}
            </span>
          }
          label={c.labelCrm}
          value={
            list.crmSynced
              ? c.crmLinked(CONNECTED_CRM_PROVIDER.name)
              : c.notLinked
          }
          hint={
            list.crmSynced && list.crmSyncedAt
              ? c.lastSynced(formatDate(list.crmSyncedAt))
              : undefined
          }
          isSet={Boolean(list.crmSynced)}
          onClick={onLinkToCrm}
        />
        {/* Company lists have no outreach — campaigns send to people. */}
        {!isCompany && (
          <SettingCard
            icon={<Link2 className="size-3.5" />}
            label={c.labelCampaign}
            value={campaign ? campaign.name : c.notLinked}
            hint={campaignHint}
            isSet={Boolean(campaign)}
            onClick={onLinkToCampaign}
          />
        )}
      </div>
    </Card>
  )
}

// One list setting, showing its current value inline rather than deferring
// to a shared summary line. Unset settings read as dashed placeholders so
// what's still unconfigured is obvious at a glance.
function SettingCard({
  icon,
  label,
  value,
  hint,
  isSet,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  isSet: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors",
        isSet
          ? "border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06]"
          : "hover:bg-muted/60 border-dashed"
      )}
    >
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "truncate text-sm font-medium",
          !isSet && "text-muted-foreground font-normal"
        )}
      >
        {value}
      </span>
      {hint && (
        <span className="text-muted-foreground truncate text-[11px]">
          {hint}
        </span>
      )}
    </button>
  )
}

// Empty-list state — nothing to view, filter, or edit yet, so the table
// toolbar (Export/Views/Columns/Edit) and the table itself stay hidden
// until there's something in the list.
function GetStartedPanel({
  isCompany,
  onFind,
  onImport,
}: {
  isCompany: boolean
  onFind: () => void
  onImport: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <Card className="flex flex-col items-center gap-4 border-dashed py-12 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <FolderOpen className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{c.getStartedTitle}</p>
        <p className="text-muted-foreground text-sm">
          {isCompany ? c.getStartedDescCo : c.getStartedDesc}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="volt" onClick={onFind}>
          <Plus className="size-4" />
          {isCompany ? c.addCompanies : c.addProspects}
        </Button>
        <Button variant="outline" onClick={onImport}>
          <Download className="size-4" />
          {c.importCsv}
        </Button>
      </div>
    </Card>
  )
}
