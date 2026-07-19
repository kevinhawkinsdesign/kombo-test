import * as React from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Play,
  Plus,
  Send,
  Sparkles,
  ArrowRight,
  Check,
  Bookmark,
  X,
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
import { SequenceCanvas } from "@/components/sequence/SequenceCanvas"
import { AutomationStatusBox } from "@/components/campaigns/AutomationStatusBox"
import { SequenceCostSummary } from "@/components/campaigns/SequenceCostSummary"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { isEnriched } from "@/lib/enrichment"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import { useReleaseMode } from "@/lib/release-mode"
import { useLists, useCampaigns, useProspects } from "@/lib/store"
import { useSavedSearches, type SavedAiSearch } from "@/lib/mock-ai-search"
import {
  useWorkspace,
  useWorkspaces,
  workspaceStore,
  ownerOf,
} from "@/lib/workspaces"
import type { Campaign, ProspectList, Prospect } from "@/lib/types"

type Step = "source" | "audience" | "outreach"

const COPY = {
  en: {
    back: "Workspaces",
    untitled: "Untitled workspace",
    namePlaceholder: "Name this workspace…",
    run: "Run workspace",
    running: "Running workspace — we'll refresh each step",
    savedSearches: "Saved searches",
    addSavedSearches: "Add saved searches",
    noSearches: "No saved searches yet — add one to source this workspace.",
    searchesChip: (n: number) => `${n} ${n === 1 ? "search" : "searches"}`,
    searchResults: (n: number) => `${n.toLocaleString()} results`,
    openInSearch: "Open in Search",
    removeSearch: (name: string) => `Remove ${name}`,
    removeList: "Remove from workspace",
    removedList: (name: string) => `${name} removed from workspace`,
    searchPickerEmpty: "No saved searches yet. Save one from the Search page.",
    entityPeople: "Prospects",
    entityCompanies: "Companies",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "list" : "lists"} · ${campaigns} live ${campaigns === 1 ? "campaign" : "campaigns"} · synced recently`,
    stepSource: "Source",
    stepAudience: "Prospects",
    stepOutreach: "Outreach",
    catSource: "Source",
    catAudience: "Prospects",
    catOutreach: "Outreach",
    titleSearch: "Search",
    titleLists: "Lists",
    titleCampaign: "Campaign",
    found: (n: number) => `${n.toLocaleString()} found`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "list" : "lists"} · ${p.toLocaleString()} prospects`,
    multichannel: "multichannel",
    stComplete: "complete",
    stEnriching: "enriching",
    stLive: "live",
    stReady: "ready",
    addFilter: "Add filter",
    matching: (p: number, co: number) =>
      `Matching ${p.toLocaleString()} prospects across ${co.toLocaleString()} companies — push results into a list to start enriching.`,
    noSource: "No source search yet.",
    runSearch: "Run a search",
    newList: "New list",
    enrichAll: "Enrich all",
    colName: "Name",
    colCompany: "Company",
    colLocation: "Location",
    colEmail: "Email",
    colStatus: "Status",
    stEnriched: "Enriched",
    stQueued: "Queued",
    stPending: "Pending",
    tableFoot: (n: number, e: number) =>
      `${n} prospects · ${e} enriched · auto-refreshing every 24h`,
    noLists: "No lists yet — push search results into a list.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `Pulling from ${lists === 1 ? "1 list" : `all ${lists} lists`} · ${enrolled.toLocaleString()} enrolled · ${reply}% reply rate`,
    pause: "Pause",
    paused: "Campaign paused",
    editSteps: "Edit steps",
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
    savedSearches: "Búsquedas guardadas",
    addSavedSearches: "Añadir búsquedas guardadas",
    noSearches: "Aún no hay búsquedas guardadas — añade una para alimentar este espacio.",
    searchesChip: (n: number) => `${n} ${n === 1 ? "búsqueda" : "búsquedas"}`,
    searchResults: (n: number) => `${n.toLocaleString()} resultados`,
    openInSearch: "Abrir en Búsqueda",
    removeSearch: (name: string) => `Eliminar ${name}`,
    removeList: "Quitar del espacio",
    removedList: (name: string) => `${name} quitada del espacio`,
    searchPickerEmpty: "Aún no hay búsquedas guardadas. Guarda una desde la página de Búsqueda.",
    entityPeople: "Prospectos",
    entityCompanies: "Empresas",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "lista" : "listas"} · ${campaigns} ${campaigns === 1 ? "campaña activa" : "campañas activas"} · sincronizado hace poco`,
    stepSource: "Fuente",
    stepAudience: "Prospectos",
    stepOutreach: "Difusión",
    catSource: "Fuente",
    catAudience: "Prospectos",
    catOutreach: "Difusión",
    titleSearch: "Búsqueda",
    titleLists: "Listas",
    titleCampaign: "Campaña",
    found: (n: number) => `${n.toLocaleString()} encontrados`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "lista" : "listas"} · ${p.toLocaleString()} prospectos`,
    multichannel: "multicanal",
    stComplete: "completo",
    stEnriching: "enriqueciendo",
    stLive: "activo",
    stReady: "listo",
    addFilter: "Añadir filtro",
    matching: (p: number, co: number) =>
      `${p.toLocaleString()} prospectos en ${co.toLocaleString()} empresas — envía resultados a una lista para enriquecer.`,
    noSource: "Aún no hay búsqueda de origen.",
    runSearch: "Ejecutar búsqueda",
    newList: "Nueva lista",
    enrichAll: "Enriquecer todo",
    colName: "Nombre",
    colCompany: "Empresa",
    colLocation: "Ubicación",
    colEmail: "Email",
    colStatus: "Estado",
    stEnriched: "Enriquecido",
    stQueued: "En cola",
    stPending: "Pendiente",
    tableFoot: (n: number, e: number) =>
      `${n} prospectos · ${e} enriquecidos · actualización cada 24 h`,
    noLists: "Aún no hay listas — envía resultados a una lista.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `Desde ${lists === 1 ? "1 lista" : `${lists} listas`} · ${enrolled.toLocaleString()} inscritos · ${reply}% de respuesta`,
    pause: "Pausar",
    paused: "Campaña pausada",
    editSteps: "Editar pasos",
    noCampaign: "Aún no hay campaña — añade una para empezar.",
    addCampaign: "Añadir campaña",
    notFound: "Espacio de trabajo no encontrado.",
    addLists: "Añadir listas",
    pickerEmpty: "Nada que añadir todavía.",
    inOther: (name: string) => `En «${name}»`,
    inOtherUntitled: "En otro espacio",
    done: "Listo",
  },
  it: {
    back: "Spazi di lavoro",
    untitled: "Spazio di lavoro senza titolo",
    namePlaceholder: "Dai un nome a questo spazio di lavoro…",
    run: "Esegui spazio di lavoro",
    running: "Spazio di lavoro in esecuzione — aggiorneremo ogni fase",
    savedSearches: "Ricerche salvate",
    addSavedSearches: "Aggiungi ricerche salvate",
    noSearches:
      "Ancora nessuna ricerca salvata — aggiungine una per alimentare questo spazio di lavoro.",
    searchesChip: (n: number) => `${n} ${n === 1 ? "ricerca" : "ricerche"}`,
    searchResults: (n: number) => `${n.toLocaleString()} risultati`,
    openInSearch: "Apri in Cerca",
    removeSearch: (name: string) => `Rimuovi ${name}`,
    removeList: "Rimuovi dallo spazio di lavoro",
    removedList: (name: string) => `${name} rimossa dallo spazio di lavoro`,
    searchPickerEmpty: "Ancora nessuna ricerca salvata. Salvane una dalla pagina Cerca.",
    entityPeople: "Prospect",
    entityCompanies: "Aziende",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "lista" : "liste"} · ${campaigns} ${campaigns === 1 ? "campagna attiva" : "campagne attive"} · sincronizzato di recente`,
    stepSource: "Fonte",
    stepAudience: "Prospect",
    stepOutreach: "Contatto",
    catSource: "Fonte",
    catAudience: "Prospect",
    catOutreach: "Contatto",
    titleSearch: "Cerca",
    titleLists: "Liste",
    titleCampaign: "Campagna",
    found: (n: number) => `${n.toLocaleString()} trovati`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "lista" : "liste"} · ${p.toLocaleString()} prospect`,
    multichannel: "multicanale",
    stComplete: "completo",
    stEnriching: "arricchimento",
    stLive: "live",
    stReady: "pronto",
    addFilter: "Aggiungi filtro",
    matching: (p: number, co: number) =>
      `${p.toLocaleString()} prospect corrispondenti in ${co.toLocaleString()} aziende — invia i risultati a una lista per iniziare ad arricchire.`,
    noSource: "Ancora nessuna ricerca di origine.",
    runSearch: "Esegui una ricerca",
    newList: "Nuova lista",
    enrichAll: "Arricchisci tutti",
    colName: "Nome",
    colCompany: "Azienda",
    colLocation: "Posizione",
    colEmail: "Email",
    colStatus: "Stato",
    stEnriched: "Arricchito",
    stQueued: "In coda",
    stPending: "In sospeso",
    tableFoot: (n: number, e: number) =>
      `${n} prospect · ${e} arricchiti · aggiornamento automatico ogni 24 h`,
    noLists: "Ancora nessuna lista — invia i risultati di ricerca a una lista.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `Da ${lists === 1 ? "1 lista" : `tutte le ${lists} liste`} · ${enrolled.toLocaleString()} iscritti · ${reply}% di risposta`,
    pause: "Pausa",
    paused: "Campagna in pausa",
    editSteps: "Modifica passaggi",
    noCampaign: "Ancora nessuna campagna — aggiungine una per iniziare il contatto.",
    addCampaign: "Aggiungi campagna",
    notFound: "Spazio di lavoro non trovato.",
    addLists: "Aggiungi liste",
    pickerEmpty: "Ancora niente da aggiungere.",
    inOther: (name: string) => `In «${name}»`,
    inOtherUntitled: "In un altro spazio di lavoro",
    done: "Fatto",
  },
  fr: {
    back: "Espaces de travail",
    untitled: "Espace de travail sans titre",
    namePlaceholder: "Nommez cet espace de travail…",
    run: "Exécuter l'espace de travail",
    running: "Espace de travail en cours d'exécution — nous actualiserons chaque étape",
    savedSearches: "Recherches enregistrées",
    addSavedSearches: "Ajouter des recherches enregistrées",
    noSearches:
      "Aucune recherche enregistrée pour le moment — ajoutez-en une pour alimenter cet espace de travail.",
    searchesChip: (n: number) => `${n} ${n === 1 ? "recherche" : "recherches"}`,
    searchResults: (n: number) => `${n.toLocaleString()} résultats`,
    openInSearch: "Ouvrir dans Rechercher",
    removeSearch: (name: string) => `Supprimer ${name}`,
    removeList: "Retirer de l'espace de travail",
    removedList: (name: string) => `${name} retirée de l'espace de travail`,
    searchPickerEmpty:
      "Aucune recherche enregistrée pour le moment. Enregistrez-en une depuis la page Rechercher.",
    entityPeople: "Prospects",
    entityCompanies: "Entreprises",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "liste" : "listes"} · ${campaigns} ${campaigns === 1 ? "campagne active" : "campagnes actives"} · synchronisé récemment`,
    stepSource: "Source",
    stepAudience: "Prospects",
    stepOutreach: "Prospection",
    catSource: "Source",
    catAudience: "Prospects",
    catOutreach: "Prospection",
    titleSearch: "Rechercher",
    titleLists: "Listes",
    titleCampaign: "Campagne",
    found: (n: number) => `${n.toLocaleString()} trouvés`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "liste" : "listes"} · ${p.toLocaleString()} prospects`,
    multichannel: "multicanal",
    stComplete: "terminé",
    stEnriching: "enrichissement",
    stLive: "en direct",
    stReady: "prêt",
    addFilter: "Ajouter un filtre",
    matching: (p: number, co: number) =>
      `${p.toLocaleString()} prospects correspondants dans ${co.toLocaleString()} entreprises — envoyez les résultats vers une liste pour commencer l'enrichissement.`,
    noSource: "Aucune recherche source pour le moment.",
    runSearch: "Lancer une recherche",
    newList: "Nouvelle liste",
    enrichAll: "Tout enrichir",
    colName: "Nom",
    colCompany: "Entreprise",
    colLocation: "Localisation",
    colEmail: "E-mail",
    colStatus: "Statut",
    stEnriched: "Enrichi",
    stQueued: "En file d'attente",
    stPending: "En attente",
    tableFoot: (n: number, e: number) =>
      `${n} prospects · ${e} enrichis · actualisation automatique toutes les 24 h`,
    noLists: "Aucune liste pour le moment — envoyez les résultats de recherche vers une liste.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `Depuis ${lists === 1 ? "1 liste" : `les ${lists} listes`} · ${enrolled.toLocaleString()} inscrits · ${reply} % de réponse`,
    pause: "Pause",
    paused: "Campagne en pause",
    editSteps: "Modifier les étapes",
    noCampaign: "Aucune campagne pour le moment — ajoutez-en une pour démarrer la prospection.",
    addCampaign: "Ajouter une campagne",
    notFound: "Espace de travail introuvable.",
    addLists: "Ajouter des listes",
    pickerEmpty: "Rien à ajouter pour le moment.",
    inOther: (name: string) => `Dans « ${name} »`,
    inOtherUntitled: "Dans un autre espace de travail",
    done: "Terminé",
  },
  de: {
    back: "Workspaces",
    untitled: "Unbenannter Workspace",
    namePlaceholder: "Benenne diesen Workspace…",
    run: "Workspace ausführen",
    running: "Workspace läuft — wir aktualisieren jeden Schritt",
    savedSearches: "Gespeicherte Suchen",
    addSavedSearches: "Gespeicherte Suchen hinzufügen",
    noSearches:
      "Noch keine gespeicherten Suchen — füge eine hinzu, um diesen Workspace zu befüllen.",
    searchesChip: (n: number) => `${n} ${n === 1 ? "Suche" : "Suchen"}`,
    searchResults: (n: number) => `${n.toLocaleString()} Ergebnisse`,
    openInSearch: "In der Suche öffnen",
    removeSearch: (name: string) => `${name} entfernen`,
    removeList: "Aus dem Workspace entfernen",
    removedList: (name: string) => `${name} aus dem Workspace entfernt`,
    searchPickerEmpty: "Noch keine gespeicherten Suchen. Speichere eine über die Seite Suche.",
    entityPeople: "Prospects",
    entityCompanies: "Unternehmen",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "Liste" : "Listen"} · ${campaigns} ${campaigns === 1 ? "aktive Kampagne" : "aktive Kampagnen"} · kürzlich synchronisiert`,
    stepSource: "Quelle",
    stepAudience: "Prospects",
    stepOutreach: "Outreach",
    catSource: "Quelle",
    catAudience: "Prospects",
    catOutreach: "Outreach",
    titleSearch: "Suche",
    titleLists: "Listen",
    titleCampaign: "Kampagne",
    found: (n: number) => `${n.toLocaleString()} gefunden`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "Liste" : "Listen"} · ${p.toLocaleString()} Prospects`,
    multichannel: "Multichannel",
    stComplete: "abgeschlossen",
    stEnriching: "wird angereichert",
    stLive: "live",
    stReady: "bereit",
    addFilter: "Filter hinzufügen",
    matching: (p: number, co: number) =>
      `${p.toLocaleString()} passende Prospects in ${co.toLocaleString()} Unternehmen — sende Ergebnisse in eine Liste, um mit der Anreicherung zu beginnen.`,
    noSource: "Noch keine Quellsuche.",
    runSearch: "Suche ausführen",
    newList: "Neue Liste",
    enrichAll: "Alle anreichern",
    colName: "Name",
    colCompany: "Unternehmen",
    colLocation: "Standort",
    colEmail: "E-Mail",
    colStatus: "Status",
    stEnriched: "Angereichert",
    stQueued: "In der Warteschlange",
    stPending: "Ausstehend",
    tableFoot: (n: number, e: number) =>
      `${n} Prospects · ${e} angereichert · automatische Aktualisierung alle 24 Std.`,
    noLists: "Noch keine Listen — sende Suchergebnisse in eine Liste.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `Aus ${lists === 1 ? "1 Liste" : `allen ${lists} Listen`} · ${enrolled.toLocaleString()} angemeldet · ${reply}% Antwortquote`,
    pause: "Pause",
    paused: "Kampagne pausiert",
    editSteps: "Schritte bearbeiten",
    noCampaign: "Noch keine Kampagne — füge eine hinzu, um mit dem Outreach zu beginnen.",
    addCampaign: "Kampagne hinzufügen",
    notFound: "Workspace nicht gefunden.",
    addLists: "Listen hinzufügen",
    pickerEmpty: "Noch nichts zum Hinzufügen.",
    inOther: (name: string) => `In „${name}"`,
    inOtherUntitled: "In einem anderen Workspace",
    done: "Fertig",
  },
  pt: {
    back: "Espaços de trabalho",
    untitled: "Espaço de trabalho sem título",
    namePlaceholder: "Dê um nome a este espaço de trabalho…",
    run: "Executar espaço de trabalho",
    running: "A executar o espaço de trabalho — vamos atualizar cada etapa",
    savedSearches: "Pesquisas guardadas",
    addSavedSearches: "Adicionar pesquisas guardadas",
    noSearches:
      "Ainda não há pesquisas guardadas — adicione uma para alimentar este espaço de trabalho.",
    searchesChip: (n: number) => `${n} ${n === 1 ? "pesquisa" : "pesquisas"}`,
    searchResults: (n: number) => `${n.toLocaleString()} resultados`,
    openInSearch: "Abrir em Pesquisar",
    removeSearch: (name: string) => `Remover ${name}`,
    removeList: "Remover do espaço de trabalho",
    removedList: (name: string) => `${name} removida do espaço de trabalho`,
    searchPickerEmpty:
      "Ainda não há pesquisas guardadas. Guarde uma a partir da página Pesquisar.",
    entityPeople: "Prospects",
    entityCompanies: "Empresas",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "lista" : "listas"} · ${campaigns} ${campaigns === 1 ? "campanha ativa" : "campanhas ativas"} · sincronizado recentemente`,
    stepSource: "Fonte",
    stepAudience: "Prospects",
    stepOutreach: "Contacto",
    catSource: "Fonte",
    catAudience: "Prospects",
    catOutreach: "Contacto",
    titleSearch: "Pesquisar",
    titleLists: "Listas",
    titleCampaign: "Campanha",
    found: (n: number) => `${n.toLocaleString()} encontrados`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "lista" : "listas"} · ${p.toLocaleString()} prospects`,
    multichannel: "multicanal",
    stComplete: "concluído",
    stEnriching: "a enriquecer",
    stLive: "em direto",
    stReady: "pronto",
    addFilter: "Adicionar filtro",
    matching: (p: number, co: number) =>
      `${p.toLocaleString()} prospects em ${co.toLocaleString()} empresas — envie os resultados para uma lista para começar a enriquecer.`,
    noSource: "Ainda não há pesquisa de origem.",
    runSearch: "Executar uma pesquisa",
    newList: "Nova lista",
    enrichAll: "Enriquecer todos",
    colName: "Nome",
    colCompany: "Empresa",
    colLocation: "Localização",
    colEmail: "Email",
    colStatus: "Estado",
    stEnriched: "Enriquecido",
    stQueued: "Em fila",
    stPending: "Pendente",
    tableFoot: (n: number, e: number) =>
      `${n} prospects · ${e} enriquecidos · atualização automática a cada 24 h`,
    noLists: "Ainda não há listas — envie os resultados da pesquisa para uma lista.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `De ${lists === 1 ? "1 lista" : `todas as ${lists} listas`} · ${enrolled.toLocaleString()} inscritos · ${reply}% de resposta`,
    pause: "Pausar",
    paused: "Campanha pausada",
    editSteps: "Editar etapas",
    noCampaign: "Ainda não há campanha — adicione uma para começar o contacto.",
    addCampaign: "Adicionar campanha",
    notFound: "Espaço de trabalho não encontrado.",
    addLists: "Adicionar listas",
    pickerEmpty: "Ainda não há nada para adicionar.",
    inOther: (name: string) => `Em "${name}"`,
    inOtherUntitled: "Noutro espaço de trabalho",
    done: "Concluído",
  },
  pt_BR: {
    back: "Espaços de trabalho",
    untitled: "Espaço de trabalho sem título",
    namePlaceholder: "Dê um nome a este espaço de trabalho…",
    run: "Executar espaço de trabalho",
    running: "Executando o espaço de trabalho — vamos atualizar cada etapa",
    savedSearches: "Buscas salvas",
    addSavedSearches: "Adicionar buscas salvas",
    noSearches:
      "Ainda não há buscas salvas — adicione uma para alimentar este espaço de trabalho.",
    searchesChip: (n: number) => `${n} ${n === 1 ? "busca" : "buscas"}`,
    searchResults: (n: number) => `${n.toLocaleString()} resultados`,
    openInSearch: "Abrir em Buscar",
    removeSearch: (name: string) => `Remover ${name}`,
    removeList: "Remover do espaço de trabalho",
    removedList: (name: string) => `${name} removida do espaço de trabalho`,
    searchPickerEmpty: "Ainda não há buscas salvas. Salve uma a partir da página Buscar.",
    entityPeople: "Prospects",
    entityCompanies: "Empresas",
    summary: (lists: number, campaigns: number) =>
      `${lists} ${lists === 1 ? "lista" : "listas"} · ${campaigns} ${campaigns === 1 ? "campanha ativa" : "campanhas ativas"} · sincronizado recentemente`,
    stepSource: "Fonte",
    stepAudience: "Prospects",
    stepOutreach: "Contato",
    catSource: "Fonte",
    catAudience: "Prospects",
    catOutreach: "Contato",
    titleSearch: "Buscar",
    titleLists: "Listas",
    titleCampaign: "Campanha",
    found: (n: number) => `${n.toLocaleString()} encontrados`,
    listsPeople: (l: number, p: number) =>
      `${l} ${l === 1 ? "lista" : "listas"} · ${p.toLocaleString()} prospects`,
    multichannel: "multicanal",
    stComplete: "concluído",
    stEnriching: "enriquecendo",
    stLive: "ao vivo",
    stReady: "pronto",
    addFilter: "Adicionar filtro",
    matching: (p: number, co: number) =>
      `${p.toLocaleString()} prospects em ${co.toLocaleString()} empresas — envie os resultados para uma lista para começar a enriquecer.`,
    noSource: "Ainda não há busca de origem.",
    runSearch: "Executar uma busca",
    newList: "Nova lista",
    enrichAll: "Enriquecer todos",
    colName: "Nome",
    colCompany: "Empresa",
    colLocation: "Localização",
    colEmail: "Email",
    colStatus: "Status",
    stEnriched: "Enriquecido",
    stQueued: "Na fila",
    stPending: "Pendente",
    tableFoot: (n: number, e: number) =>
      `${n} prospects · ${e} enriquecidos · atualização automática a cada 24 h`,
    noLists: "Ainda não há listas — envie os resultados da busca para uma lista.",
    pull: (lists: number, enrolled: number, reply: number) =>
      `De ${lists === 1 ? "1 lista" : `todas as ${lists} listas`} · ${enrolled.toLocaleString()} inscritos · ${reply}% de resposta`,
    pause: "Pausar",
    paused: "Campanha pausada",
    editSteps: "Editar etapas",
    noCampaign: "Ainda não há campanha — adicione uma para começar o contato.",
    addCampaign: "Adicionar campanha",
    notFound: "Espaço de trabalho não encontrado.",
    addLists: "Adicionar listas",
    pickerEmpty: "Ainda não há nada para adicionar.",
    inOther: (name: string) => `Em "${name}"`,
    inOtherUntitled: "Em outro espaço de trabalho",
    done: "Concluído",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function listCount(l: ProspectList): number {
  return l.kind === "company" ? (l.accountIds?.length ?? 0) : l.prospectIds.length
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
  const allSearches = useSavedSearches()
  const { isV1 } = useReleaseMode()

  const [step, setStep] = React.useState<Step>("source")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [searchPickerOpen, setSearchPickerOpen] = React.useState(false)
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
  const searchById = new Map(allSearches.map((s) => [s.id, s]))
  const searches = workspace.searchIds
    .map((sid) => searchById.get(sid))
    .filter((s): s is SavedAiSearch => Boolean(s))
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
        {/* Run = the advanced "playlist" automation (continuously searches,
            updates lists, runs the campaign). v2 only — hidden in v1. */}
        {!isV1 && (
          <Button variant="volt" onClick={() => toast.success(c.running)}>
            <Play className="size-4" />
            {c.run}
          </Button>
        )}
      </div>

      {/* Pipeline */}
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        <PipelineCard
          n={1}
          category={c.catSource}
          title={c.titleSearch}
          chip={searches.length ? c.searchesChip(searches.length) : c.runSearch}
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
          <SourcePanel
            c={c}
            searches={searches}
            onAdd={() => setSearchPickerOpen(true)}
            onRemove={(sid) =>
              workspaceStore.dissociate(workspace.id, "search", sid)
            }
            onOpen={(s) =>
              navigate("/search", { state: { loadSearchId: s.id } })
            }
          />
        ) : step === "audience" ? (
          <AudiencePanel
            c={c}
            lists={lists}
            selectedList={selectedList}
            onSelectList={setSelectedListId}
            onNewList={() => setPickerOpen(true)}
            onRemoveList={(id, name) => {
              workspaceStore.dissociate(workspace.id, "list", id)
              toast.success(c.removedList(name))
              if (selectedListId === id) {
                setSelectedListId(lists.find((l) => l.id !== id)?.id ?? null)
              }
            }}
            prospects={prospects}
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

      {searchPickerOpen && (
        <AddSearchesDialog
          workspaceId={workspace.id}
          allSearches={allSearches}
          c={c}
          onOpenChange={(o) => !o && setSearchPickerOpen(false)}
        />
      )}
    </Page>
  )
}

function BackLink({ label, pill, color }: { label: string; pill?: string; color?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const hasHistory = location.key !== "default"
  const { t } = useLocale()

  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      {hasHistory ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </button>
      ) : (
        <Link
          to="/workspaces"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-4" />
          {label}
        </Link>
      )}
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
  c,
  searches,
  onAdd,
  onRemove,
  onOpen,
}: {
  c: Copy
  searches: SavedAiSearch[]
  onAdd: () => void
  onRemove: (id: string) => void
  onOpen: (search: SavedAiSearch) => void
}) {
  if (searches.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground text-sm">{c.noSearches}</p>
        <Button variant="volt" onClick={onAdd}>
          <Bookmark className="size-4" />
          {c.addSavedSearches}
        </Button>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{c.savedSearches}</h2>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          {c.addSavedSearches}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {searches.map((s) => (
          <Card key={s.id} className="gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Sparkles className="text-primary size-4 shrink-0" />
                <p className="truncate text-sm font-semibold">{s.name}</p>
              </div>
              <button
                type="button"
                aria-label={c.removeSearch(s.name)}
                onClick={() => onRemove(s.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {s.prompt}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <Badge variant="secondary" className="font-normal">
                {s.entity === "people" ? c.entityPeople : c.entityCompanies}
              </Badge>
              <span className="text-muted-foreground text-xs tabular-nums">
                {c.searchResults(s.resultCount)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 -ml-2 self-start"
              onClick={() => onOpen(s)}
            >
              {c.openInSearch}
              <ArrowRight className="size-3.5" />
            </Button>
          </Card>
        ))}
      </div>
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
  onRemoveList,
  prospects,
}: {
  c: Copy
  lists: ProspectList[]
  selectedList: ProspectList | undefined
  onSelectList: (id: string) => void
  onNewList: () => void
  onRemoveList: (id: string, name: string) => void
  prospects: Prospect[]
}) {
  const [enrichOpen, setEnrichOpen] = React.useState(false)
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
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveList(selectedList.id, selectedList.name)}
              >
                <X className="size-4" />
                {c.removeList}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEnrichOpen(true)}
              >
                <Sparkles className="size-4" />
                {c.enrichAll}
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
          <EnrichListDialog
            open={enrichOpen}
            onOpenChange={setEnrichOpen}
            prospects={members}
          />
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPause}>
            {c.pause}
          </Button>
          <Button variant="volt" size="sm" onClick={onEdit}>
            {c.editSteps}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AutomationStatusBox autoPauseOnReply={campaign.autoPauseOnReply ?? true} />
        <SequenceCostSummary steps={campaign.steps} />
      </div>
      <div className="mt-3">
        <SequenceCanvas steps={campaign.steps} mode="readonly" />
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

// Entry point to all saved searches: associate one or more to the workspace.
function AddSearchesDialog({
  workspaceId,
  allSearches,
  c,
  onOpenChange,
}: {
  workspaceId: string
  allSearches: SavedAiSearch[]
  c: Copy
  onOpenChange: (open: boolean) => void
}) {
  const workspaces = useWorkspaces()
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.savedSearches}</DialogTitle>
          <DialogDescription className="sr-only">
            {c.addSavedSearches}
          </DialogDescription>
        </DialogHeader>
        {allSearches.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {c.searchPickerEmpty}
          </p>
        ) : (
          <div className="-mx-2 max-h-[55vh] space-y-0.5 overflow-y-auto px-2">
            {allSearches.map((s) => {
              const owner = ownerOf(workspaces, "search", s.id)
              const inThis = owner?.id === workspaceId
              const inOther = owner && !inThis
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    inThis
                      ? workspaceStore.dissociate(workspaceId, "search", s.id)
                      : workspaceStore.associate(workspaceId, "search", s.id)
                  }
                  className="hover:bg-muted/60 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border",
                      inThis
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input"
                    )}
                  >
                    {inThis && <Check className="size-3.5" />}
                  </span>
                  <Sparkles className="text-primary size-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {s.name}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {s.prompt}
                    </span>
                  </span>
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
