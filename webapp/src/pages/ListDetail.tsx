import * as React from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Send,
  Link2,
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
  ListTodo,
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
import { BulkCrmSyncDialog } from "@/components/common/BulkCrmSyncDialog"
import { ExportDialog } from "@/components/common/ExportDialog"
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { getProspect, getCampaign } from "@/lib/mock-data"
import { getAccount } from "@/lib/mock-extra"
import { PlaylistWizard } from "@/components/playlist/PlaylistWizard"
import { useLists, listStore, prospectStore, accountStore } from "@/lib/store"
import { listTabsStore } from "@/lib/list-tabs"
import { ListTabBar } from "@/components/lists/ListTabBar"
import { isEnriched } from "@/lib/enrichment"
import { usePagedSelection } from "@/lib/use-paged-selection"
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
    exportedAndSent: (email: string) => `Exported to CSV and sent to ${email}`,
    buildPlaylist: "Build a playlist",
    linkToCampaign: "Link to campaign",
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
    backToLists: "Volver a las listas",
    lists: "Listas",
    prospects: "prospectos",
    edit: "Editar",
    deleteList: "Eliminar lista",
    export: "Exportar",
    exported: "Exportado a CSV",
    exportedAndSent: (email: string) => `Exportado a CSV y enviado a ${email}`,
    buildPlaylist: "Crear playlist",
    linkToCampaign: "Vincular a campaña",
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
    backToLists: "Torna alle liste",
    lists: "Liste",
    prospects: "prospect",
    edit: "Modifica",
    deleteList: "Elimina lista",
    export: "Esporta",
    exported: "Esportato in CSV",
    exportedAndSent: (email: string) => `Esportato in CSV e inviato a ${email}`,
    buildPlaylist: "Crea una playlist",
    linkToCampaign: "Collega a una campagna",
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
    removed: "Rimosso dalla lista",
    removedCount: (n: number) => `${n} rimossi dalla lista`,
    emptyState: "Ancora nessun prospect — aggiungine alcuni per iniziare.",
    deleteTitle: "Eliminare la lista?",
    deleteDescription: (name: string) =>
      `"${name}" verrà eliminata definitivamente. I prospect restano nel tuo spazio di lavoro.`,
    deleteConfirm: "Elimina",
    listDeleted: "Lista eliminata",
    dynamicPlaylist: "Playlist dinamica",
    live: "Live",
    pauseInflow: "Metti in pausa l'ingresso",
    inflowPaused: "Ingresso in pausa — non verranno aggiunti nuovi prospect",
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
    backToLists: "Retour aux listes",
    lists: "Listes",
    prospects: "prospects",
    edit: "Modifier",
    deleteList: "Supprimer la liste",
    export: "Exporter",
    exported: "Exporté au format CSV",
    exportedAndSent: (email: string) => `Exporté au format CSV et envoyé à ${email}`,
    buildPlaylist: "Créer une playlist",
    linkToCampaign: "Lier à une campagne",
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
    removed: "Retiré de la liste",
    removedCount: (n: number) => `${n} retirés de la liste`,
    emptyState: "Aucun prospect pour le moment — ajoutez-en pour commencer.",
    deleteTitle: "Supprimer la liste ?",
    deleteDescription: (name: string) =>
      `« ${name} » sera définitivement supprimée. Les prospects restent dans votre espace de travail.`,
    deleteConfirm: "Supprimer",
    listDeleted: "Liste supprimée",
    dynamicPlaylist: "Playlist dynamique",
    live: "En direct",
    pauseInflow: "Mettre en pause l'arrivée",
    inflowPaused: "Arrivée en pause — aucun nouveau prospect ne sera ajouté",
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
    backToLists: "Zurück zu den Listen",
    lists: "Listen",
    prospects: "Prospects",
    edit: "Bearbeiten",
    deleteList: "Liste löschen",
    export: "Exportieren",
    exported: "Als CSV exportiert",
    exportedAndSent: (email: string) => `Als CSV exportiert und an ${email} gesendet`,
    buildPlaylist: "Playlist erstellen",
    linkToCampaign: "Mit Kampagne verknüpfen",
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
    removed: "Aus der Liste entfernt",
    removedCount: (n: number) => `${n} aus der Liste entfernt`,
    emptyState: "Noch keine Prospects — füge welche hinzu, um loszulegen.",
    deleteTitle: "Liste löschen?",
    deleteDescription: (name: string) =>
      `„${name}" wird dauerhaft entfernt. Prospects bleiben in deinem Workspace erhalten.`,
    deleteConfirm: "Löschen",
    listDeleted: "Liste gelöscht",
    dynamicPlaylist: "Dynamische Playlist",
    live: "Live",
    pauseInflow: "Zufluss pausieren",
    inflowPaused: "Zufluss pausiert — es werden keine neuen Prospects hinzugefügt",
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
    backToLists: "Voltar às listas",
    lists: "Listas",
    prospects: "prospects",
    edit: "Editar",
    deleteList: "Eliminar lista",
    export: "Exportar",
    exported: "Exportado para CSV",
    exportedAndSent: (email: string) => `Exportado para CSV e enviado para ${email}`,
    buildPlaylist: "Criar uma playlist",
    linkToCampaign: "Associar a uma campanha",
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
    removed: "Removido da lista",
    removedCount: (n: number) => `${n} removidos da lista`,
    emptyState: "Ainda não há prospects — adicione alguns para começar.",
    deleteTitle: "Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" será removida permanentemente. Os prospects permanecem no seu espaço de trabalho.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    dynamicPlaylist: "Playlist dinâmica",
    live: "Em direto",
    pauseInflow: "Pausar entrada",
    inflowPaused: "Entrada pausada — não serão adicionados novos prospects",
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
    backToLists: "Voltar para as listas",
    lists: "Listas",
    prospects: "prospects",
    edit: "Editar",
    deleteList: "Excluir lista",
    export: "Exportar",
    exported: "Exportado para CSV",
    exportedAndSent: (email: string) => `Exportado para CSV e enviado para ${email}`,
    buildPlaylist: "Criar uma playlist",
    linkToCampaign: "Vincular a uma campanha",
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
    removed: "Removido da lista",
    removedCount: (n: number) => `${n} removidos da lista`,
    emptyState: "Ainda não há prospects — adicione alguns para começar.",
    deleteTitle: "Excluir lista?",
    deleteDescription: (name: string) =>
      `"${name}" será removida permanentemente. Os prospects permanecem no seu espaço de trabalho.`,
    deleteConfirm: "Excluir",
    listDeleted: "Lista excluída",
    dynamicPlaylist: "Playlist dinâmica",
    live: "Ao vivo",
    pauseInflow: "Pausar entrada",
    inflowPaused: "Entrada pausada — nenhum novo prospect será adicionado",
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
  const [linkCampaignOpen, setLinkCampaignOpen] = React.useState(false)
  const [playlistOpen, setPlaylistOpen] = React.useState(false)
  const [bulkEnrichOpen, setBulkEnrichOpen] = React.useState(false)
  const [bulkAddOpen, setBulkAddOpen] = React.useState(false)
  const [bulkMoveOpen, setBulkMoveOpen] = React.useState(false)
  const [bulkCrmOpen, setBulkCrmOpen] = React.useState(false)
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
  const sel = usePagedSelection<Prospect | Account>(
    isCompany ? accountMembers : members,
    (r) => r.id,
    list?.id
  )
  const { selectedIds, allSelected, someSelected } = sel

  if (!list) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.listNotFound}</p>
        <BackLink to="/lists" label={c.backToLists} variant="link" />
      </Page>
    )
  }

  const memberCount = isCompany ? accountMembers.length : members.length
  const pending = members.filter((p) => !isEnriched(p))
  const enrichedCount = members.length - pending.length

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
  function exportSelected(opts: { sendTo?: string } = {}) {
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
    toast.success(opts.sendTo ? c.exportedAndSent(opts.sendTo) : c.exported)
    sel.clear()
  }

  return (
    <Page>
      <BackLink to="/lists" label={c.lists} />

      <ListTabBar currentId={list.id} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{list.description}</p>
          <p className="text-muted-foreground text-xs">
            {memberCount} {isCompany ? c.companies : c.prospects}
          </p>
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
          {!isCompany && (
            <Button variant="volt" onClick={() => setLinkCampaignOpen(true)}>
              <Link2 className="size-4" />
              {c.linkToCampaign}
            </Button>
          )}
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
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
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
        total={isCompany ? accountMembers.length : members.length}
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
          columns={allPeopleColumns}
          visible={columnPrefs.visible}
          rows={sel.pagedItems as Prospect[]}
          rowKey={(p) => p.id}
          locale={locale}
          editing={tableEditing}
          onUpdate={(p, patch) => prospectStore.update(p.id, patch)}
          onRowClick={(p) => navigate(`/prospects/${p.id}`)}
          empty={c.emptyState}
          selection={{
            isSelected: (p) => selectedIds.has(p.id),
            toggle: sel.toggleRow,
            toggleAll: sel.togglePage,
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
        onClear={sel.clear}
        onExport={() => setExportOpen(true)}
        onEnrich={isCompany ? undefined : () => setBulkEnrichOpen(true)}
        onAddToList={() => setBulkAddOpen(true)}
        onMoveToList={() => setBulkMoveOpen(true)}
        onAddToCrm={() => setBulkCrmOpen(true)}
        extra={{
          label: c.removeFromListAction,
          icon: <X className="size-4" />,
          destructive: true,
          onClick: removeSelected,
        }}
      />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        count={selectedCount}
        onConfirm={exportSelected}
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

      <BulkCrmSyncDialog
        open={bulkCrmOpen}
        onOpenChange={setBulkCrmOpen}
        count={selectedCount}
        onDone={sel.clear}
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

      <LinkListToCampaignDialog
        open={linkCampaignOpen}
        onOpenChange={setLinkCampaignOpen}
        list={list}
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
