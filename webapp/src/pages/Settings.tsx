import * as React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Check,
  Monitor,
  Moon,
  Sun,
  Plus,
  Trash2,
  Camera,
  Download,
  Link2,
  Eye,
  X,
  Users,
  Building2,
  Mail,
  Plug,
  Sparkles,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useLists,
  useAccounts,
  useBlacklist,
  blacklistStore,
} from "@/lib/store"
import { useTheme } from "@/components/theme-provider"
import { IcpManager } from "@/components/settings/IcpManager"
import { ProductManager } from "@/components/settings/ProductManager"
import { SalesMethodologyCard } from "@/components/settings/SalesMethodologyCard"
import { useAuth } from "@/lib/auth"
import { useView } from "@/lib/view-context"
import { team, teams, type TeamMember } from "@/lib/team"
import { initials } from "@/lib/format"
import { portraitFor } from "@/lib/avatars"
import { integrations } from "@/lib/mock-data"
import { mcpConnections, connectedToolCount } from "@/lib/mock-network"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface PendingInvite {
  id: string
  email: string
  role: "employee" | "manager"
}

const THEME_OPTIONS = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const

const COPY = {
  en: {
    title: "Settings",
    description:
      "Manage your account, value proposition, and selling config.",
    tabAccount: "Account",
    tabAccountMgmt: "Account Management",
    teamRosterTitle: "Team roster",
    teamDesc: "See and manage the reps in your organization.",
    teamRep: "Rep",
    teamEmail: "Email",
    teamRole: "Role",
    teamViewAs: "View as",
    teamViewingAs: (name: string) => `Currently viewing as ${name}`,
    teamExit: "Exit",
    teamScope: "Data scope",
    teamScopeDesc: "Filter dashboards and reports to the whole organization or a single team.",
    teamWholeOrg: "Whole organization",
    teamClientBadge: "Client",
    teamViewTeam: "View",
    teamMembersTitle: "Team Members",
    teamMembersDesc: "Invite reps and manage their roles.",
    inviteEmailPlaceholder: "colleague@company.com",
    roleEmployee: "Employee",
    roleManager: "Manager",
    inviteStatus: "Status",
    invitePending: "Pending",
    resendInvite: "Resend invite",
    removeInvite: (email: string) => `Remove ${email}`,
    inviteSentTo: (email: string) => `Invite sent to ${email}`,
    inviteResentTo: (email: string) => `Invite resent to ${email}`,
    inviteRemovedToast: (email: string) => `${email} removed`,
    noInvites: "No teammates invited yet — invite your first one above.",
    tabValue: "Value Proposition",
    tabSelling: "Selling Configuration",
    tabConnections: "Connections",
    connectionsDesc:
      "Manage your CRM, professional network, outreach, and AI tool connections.",
    connIntegrations: "Integrations",
    connAiTools: "AI tool connections",
    connectedCount: (n: number, total: number) => `${n} of ${total} connected`,
    goToIntegrations: "Manage in Integrations",
    tabBlacklists: "Blacklists",
    tabPreferences: "Preferences",
    tabNotifications: "Notifications",
    profileDetails: "Profile details",
    profileDetailsDesc: "Update your personal information.",
    fullName: "Full name",
    email: "Email",
    role: "Role",
    company: "Company",
    saveChanges: "Save changes",
    profileSaved: "Profile saved",
    profilePhoto: "Profile photo",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    photoHint: "PNG, JPG or GIF.",
    photoUpdated: "Photo updated",
    photoRemoved: "Photo removed",
    smartUploads: "Smart uploads",
    smartUploadsDesc: "How Kombo processes prospect lists you import.",
    autoEnrich: "Auto-enrich on upload",
    autoEnrichDesc: "Append 30 data points to every imported prospect.",
    autoAssign: "Auto-assign to a list",
    autoAssignDesc: "Group each upload into a new list automatically.",
    skipDuplicates: "Skip duplicates",
    skipDuplicatesDesc: "Ignore prospects already in your workspace.",
    uploadSaved: "Upload settings saved",
    outreachTemplates: "Outreach templates",
    outreachTemplatesDesc:
      "The templates and playbook Kai draws from when drafting outreach.",
    manageTemplates: "Manage templates",
    openPlaybook: "Open playbook",
    appearance: "Appearance",
    appearanceDesc: "Customize how Kombo looks on your device.",
    theme: "Theme",
    themeOptions: { light: "Light", dark: "Dark", system: "System" },
    aiSuggestions: "AI suggestions",
    aiSuggestionsDesc: "Surface recommended prospects and next steps.",
    dailyDigest: "Daily digest",
    dailyDigestDesc: "A summary of pipeline activity each morning.",
    notifications: "Notifications",
    notificationsDesc: "Choose what you get notified about.",
    prospectReplies: "Prospect replies",
    prospectRepliesDesc: "When a prospect replies to your outreach.",
    meetingsBooked: "Meetings booked",
    meetingsBookedDesc: "When a meeting is booked from a sequence.",
    dealStageChanges: "Deal stage changes",
    dealStageChangesDesc: "When a deal moves stage in the pipeline.",
    mentions: "Mentions",
    mentionsDesc: "When a teammate @mentions you.",
    weeklyDigest: "Weekly digest",
    weeklyDigestDesc: "A Monday summary of team performance.",
    notificationsSaved: "Notification settings saved",
    preferencesSaved: "Preferences saved",
    currentPlan: "Current plan",
    currentPlanDesc: (plan?: string) => `You are on the ${plan} plan.`,
    active: "Active",
    planFeatures: "Unlimited prospects · 5 seats · CRM sync",
    perMonth: "/mo",
    manageBilling: "Manage billing",
    upgradePlan: "Upgrade plan",
    upgradeFlow: "Upgrade flow",
    teamSeats: "Team seats",
    seatsUsed: (used: number, total: number) => `${used} of ${total} seats used`,
    inviteMember: "Invite member",
    companyUsps: "Company USPs",
    companyUspsDesc: "Unique selling points Kai weaves into outreach.",
    removeUsp: "Remove USP",
    addUsp: "Add USP",
    save: "Save",
    uspsSaved: "USPs saved",
    blacklistedCompanies: "Blacklisted companies",
    blacklistedCompaniesDesc:
      "Prospects from these companies are excluded from search and outreach.",
    removeCompany: (name: string) => `Remove ${name}`,
    companyRemoved: (name: string) => `${name} removed`,
    companyName: "Company name",
    domainPlaceholder: "domain.com",
    add: "Add",
    companyBlacklisted: "Company blacklisted",
    // Company blacklist v2.
    blImportDesc:
      "Import the companies that should be excluded from your searches and campaigns.",
    blEmpty:
      "You do not have any Company Blacklists yet. To create a blacklist, import a list.",
    blImport: "Import",
    blCreateNew: "Create & associate a new list",
    blAssociateExisting: "Associate an existing company list",
    blDialogTitle: "Add to blacklist",
    blCreateDesc: "Create a new blacklist and associate it.",
    blAssociateDesc: "Pick one of your company lists to blacklist.",
    blImportDialogDesc: "Import a company list to exclude.",
    blNewListName: "Blacklist name",
    blNewListPlaceholder: "e.g. Existing customers",
    blCreate: "Create",
    blNoCompanyLists: "You have no company lists to associate yet.",
    blAssociate: "Associate",
    blImportSimulated:
      "Import simulated — companies added to your blacklist",
    blAssociatedToast: (n: number) =>
      `${n} ${n === 1 ? "company" : "companies"} added to your blacklist`,
    blCreatedToast: (name: string) => `Blacklist "${name}" created`,
    blCompanies: (n: number) => `${n} ${n === 1 ? "company" : "companies"}`,
    close: "Close",
  },
  es: {
    title: "Configuración",
    description:
      "Gestiona tu cuenta, propuesta de valor y configuración de ventas.",
    tabAccount: "Cuenta",
    tabAccountMgmt: "Gestión de cuenta",
    teamRosterTitle: "Vendedores del equipo",
    teamDesc: "Consulta y gestiona a los vendedores de tu organización.",
    teamRep: "Vendedor",
    teamEmail: "Email",
    teamRole: "Rol",
    teamViewAs: "Ver como",
    teamViewingAs: (name: string) => `Viendo actualmente como ${name}`,
    teamExit: "Salir",
    teamScope: "Alcance de datos",
    teamScopeDesc: "Filtra los paneles e informes por toda la organización o por un equipo.",
    teamWholeOrg: "Toda la organización",
    teamClientBadge: "Cliente",
    teamViewTeam: "Ver",
    teamMembersTitle: "Miembros del equipo",
    teamMembersDesc: "Invita a representantes y gestiona sus roles.",
    inviteEmailPlaceholder: "compañero@empresa.com",
    roleEmployee: "Empleado",
    roleManager: "Gerente",
    inviteStatus: "Estado",
    invitePending: "Pendiente",
    resendInvite: "Reenviar invitación",
    removeInvite: (email: string) => `Eliminar ${email}`,
    inviteSentTo: (email: string) => `Invitación enviada a ${email}`,
    inviteResentTo: (email: string) => `Invitación reenviada a ${email}`,
    inviteRemovedToast: (email: string) => `${email} eliminado`,
    noInvites: "Aún no has invitado a nadie — invita a tu primer compañero arriba.",
    tabValue: "Propuesta de valor",
    tabSelling: "Configuración de ventas",
    tabConnections: "Conexiones",
    connectionsDesc:
      "Gestiona tu CRM, red profesional, outreach y conexiones de herramientas de IA.",
    connIntegrations: "Integraciones",
    connAiTools: "Conexiones de herramientas de IA",
    connectedCount: (n: number, total: number) => `${n} de ${total} conectadas`,
    goToIntegrations: "Gestionar en Integraciones",
    tabBlacklists: "Listas negras",
    tabPreferences: "Preferencias",
    tabNotifications: "Notificaciones",
    profileDetails: "Datos del perfil",
    profileDetailsDesc: "Actualiza tu información personal.",
    fullName: "Nombre completo",
    email: "Correo",
    role: "Rol",
    company: "Empresa",
    saveChanges: "Guardar cambios",
    profileSaved: "Perfil guardado",
    profilePhoto: "Foto de perfil",
    changePhoto: "Cambiar foto",
    removePhoto: "Quitar",
    photoHint: "PNG, JPG o GIF.",
    photoUpdated: "Foto actualizada",
    photoRemoved: "Foto eliminada",
    smartUploads: "Cargas inteligentes",
    smartUploadsDesc:
      "Cómo procesa Kombo las listas de prospectos que importas.",
    autoEnrich: "Enriquecer al importar",
    autoEnrichDesc:
      "Añade 30 puntos de datos a cada prospecto importado.",
    autoAssign: "Asignar a una lista automáticamente",
    autoAssignDesc: "Agrupa cada carga en una nueva lista de forma automática.",
    skipDuplicates: "Omitir duplicados",
    skipDuplicatesDesc: "Ignora los prospectos que ya están en tu espacio.",
    uploadSaved: "Ajustes de carga guardados",
    outreachTemplates: "Plantillas de outreach",
    outreachTemplatesDesc:
      "Las plantillas y la estrategia que Kai utiliza al redactar el outreach.",
    manageTemplates: "Gestionar plantillas",
    openPlaybook: "Abrir estrategia",
    appearance: "Apariencia",
    appearanceDesc: "Personaliza el aspecto de Kombo en tu dispositivo.",
    theme: "Tema",
    themeOptions: { light: "Claro", dark: "Oscuro", system: "Sistema" },
    aiSuggestions: "Sugerencias de IA",
    aiSuggestionsDesc: "Muestra prospectos recomendados y próximos pasos.",
    dailyDigest: "Resumen diario",
    dailyDigestDesc: "Un resumen de la actividad del pipeline cada mañana.",
    notifications: "Notificaciones",
    notificationsDesc: "Elige sobre qué quieres recibir notificaciones.",
    prospectReplies: "Respuestas de prospectos",
    prospectRepliesDesc: "Cuando un prospecto responde a tu outreach.",
    meetingsBooked: "Reuniones agendadas",
    meetingsBookedDesc: "Cuando se agenda una reunión desde una secuencia.",
    dealStageChanges: "Cambios de etapa de negocio",
    dealStageChangesDesc: "Cuando un negocio cambia de etapa en el pipeline.",
    mentions: "Menciones",
    mentionsDesc: "Cuando un compañero te @menciona.",
    weeklyDigest: "Resumen semanal",
    weeklyDigestDesc: "Un resumen de los lunes del rendimiento del equipo.",
    notificationsSaved: "Ajustes de notificaciones guardados",
    preferencesSaved: "Preferencias guardadas",
    currentPlan: "Plan actual",
    currentPlanDesc: (plan?: string) => `Tienes el plan ${plan}.`,
    active: "Activo",
    planFeatures: "Prospectos ilimitados · 5 asientos · sincronización con CRM",
    perMonth: "/mes",
    manageBilling: "Gestionar facturación",
    upgradePlan: "Mejorar plan",
    upgradeFlow: "Flujo de mejora",
    teamSeats: "Asientos del equipo",
    seatsUsed: (used: number, total: number) =>
      `${used} de ${total} asientos usados`,
    inviteMember: "Invitar miembro",
    companyUsps: "Propuestas únicas de la empresa",
    companyUspsDesc:
      "Propuestas únicas de venta que Kai integra en el outreach.",
    removeUsp: "Eliminar propuesta",
    addUsp: "Añadir propuesta",
    save: "Guardar",
    uspsSaved: "Propuestas guardadas",
    blacklistedCompanies: "Empresas en lista negra",
    blacklistedCompaniesDesc:
      "Los prospectos de estas empresas se excluyen de la búsqueda y el outreach.",
    removeCompany: (name: string) => `Eliminar ${name}`,
    companyRemoved: (name: string) => `${name} eliminada`,
    companyName: "Nombre de la empresa",
    domainPlaceholder: "dominio.com",
    add: "Añadir",
    companyBlacklisted: "Empresa añadida a la lista negra",
    // Lista negra de empresas v2.
    blImportDesc:
      "Importa las empresas que deben excluirse de tus búsquedas y campañas.",
    blEmpty:
      "Aún no tienes ninguna lista negra de empresas. Para crear una, importa una lista.",
    blImport: "Importar",
    blCreateNew: "Crear y asociar una nueva lista",
    blAssociateExisting: "Asociar una lista de empresas existente",
    blDialogTitle: "Añadir a la lista negra",
    blCreateDesc: "Crea una nueva lista negra y asóciala.",
    blAssociateDesc: "Elige una de tus listas de empresas para vetar.",
    blImportDialogDesc: "Importa una lista de empresas para excluir.",
    blNewListName: "Nombre de la lista negra",
    blNewListPlaceholder: "p. ej. Clientes actuales",
    blCreate: "Crear",
    blNoCompanyLists: "Aún no tienes listas de empresas para asociar.",
    blAssociate: "Asociar",
    blImportSimulated:
      "Importación simulada — empresas añadidas a tu lista negra",
    blAssociatedToast: (n: number) =>
      `${n} ${n === 1 ? "empresa añadida" : "empresas añadidas"} a tu lista negra`,
    blCreatedToast: (name: string) => `Lista negra "${name}" creada`,
    blCompanies: (n: number) => `${n} ${n === 1 ? "empresa" : "empresas"}`,
    close: "Cerrar",
  },
  it: {
    title: "Impostazioni",
    description:
      "Gestisci il tuo account, la proposta di valore e la configurazione di vendita.",
    tabAccount: "Account",
    tabAccountMgmt: "Gestione account",
    teamRosterTitle: "Venditori del team",
    teamDesc: "Visualizza e gestisci i venditori della tua organizzazione.",
    teamRep: "Venditore",
    teamEmail: "Email",
    teamRole: "Ruolo",
    teamViewAs: "Visualizza come",
    teamViewingAs: (name: string) => `Stai visualizzando come ${name}`,
    teamExit: "Esci",
    teamScope: "Ambito dei dati",
    teamScopeDesc: "Filtra dashboard e report per l'intera organizzazione o per un singolo team.",
    teamWholeOrg: "Tutta l'organizzazione",
    teamClientBadge: "Cliente",
    teamViewTeam: "Visualizza",
    teamMembersTitle: "Membri del team",
    teamMembersDesc: "Invita venditori e gestisci i loro ruoli.",
    inviteEmailPlaceholder: "collega@azienda.com",
    roleEmployee: "Dipendente",
    roleManager: "Manager",
    inviteStatus: "Stato",
    invitePending: "In attesa",
    resendInvite: "Invia di nuovo",
    removeInvite: (email: string) => `Rimuovi ${email}`,
    inviteSentTo: (email: string) => `Invito inviato a ${email}`,
    inviteResentTo: (email: string) => `Invito inviato di nuovo a ${email}`,
    inviteRemovedToast: (email: string) => `${email} rimosso`,
    noInvites: "Non hai ancora invitato nessuno — invita il primo collega qui sopra.",
    tabValue: "Proposta di valore",
    tabSelling: "Configurazione vendite",
    tabConnections: "Connessioni",
    connectionsDesc:
      "Gestisci CRM, rete professionale, outreach e connessioni con strumenti IA.",
    connIntegrations: "Integrazioni",
    connAiTools: "Connessioni strumenti IA",
    connectedCount: (n: number, total: number) => `${n} di ${total} connesse`,
    goToIntegrations: "Gestisci in Integrazioni",
    tabBlacklists: "Liste nere",
    tabPreferences: "Preferenze",
    tabNotifications: "Notifiche",
    profileDetails: "Dati del profilo",
    profileDetailsDesc: "Aggiorna le tue informazioni personali.",
    fullName: "Nome completo",
    email: "Email",
    role: "Ruolo",
    company: "Azienda",
    saveChanges: "Salva le modifiche",
    profileSaved: "Profilo salvato",
    profilePhoto: "Foto del profilo",
    changePhoto: "Cambia foto",
    removePhoto: "Rimuovi",
    photoHint: "PNG, JPG o GIF.",
    photoUpdated: "Foto aggiornata",
    photoRemoved: "Foto rimossa",
    smartUploads: "Caricamenti intelligenti",
    smartUploadsDesc:
      "Come Kombo elabora le liste di prospect che importi.",
    autoEnrich: "Arricchimento automatico al caricamento",
    autoEnrichDesc:
      "Aggiunge 30 punti dati a ogni prospect importato.",
    autoAssign: "Assegna automaticamente a una lista",
    autoAssignDesc: "Raggruppa automaticamente ogni caricamento in una nuova lista.",
    skipDuplicates: "Salta i duplicati",
    skipDuplicatesDesc: "Ignora i prospect già presenti nel tuo spazio di lavoro.",
    uploadSaved: "Impostazioni di caricamento salvate",
    outreachTemplates: "Modelli di outreach",
    outreachTemplatesDesc:
      "I modelli e la strategia che Kai utilizza quando redige l'outreach.",
    manageTemplates: "Gestisci modelli",
    openPlaybook: "Apri strategia",
    appearance: "Aspetto",
    appearanceDesc: "Personalizza l'aspetto di Kombo sul tuo dispositivo.",
    theme: "Tema",
    themeOptions: { light: "Chiaro", dark: "Scuro", system: "Sistema" },
    aiSuggestions: "Suggerimenti IA",
    aiSuggestionsDesc: "Mostra prospect consigliati e prossimi passi.",
    dailyDigest: "Riepilogo giornaliero",
    dailyDigestDesc: "Un riepilogo dell'attività della pipeline ogni mattina.",
    notifications: "Notifiche",
    notificationsDesc: "Scegli per cosa ricevere notifiche.",
    prospectReplies: "Risposte dei prospect",
    prospectRepliesDesc: "Quando un prospect risponde al tuo outreach.",
    meetingsBooked: "Riunioni fissate",
    meetingsBookedDesc: "Quando una riunione viene fissata da una sequenza.",
    dealStageChanges: "Cambi di fase delle trattative",
    dealStageChangesDesc: "Quando una trattativa cambia fase nella pipeline.",
    mentions: "Menzioni",
    mentionsDesc: "Quando un collega ti @menziona.",
    weeklyDigest: "Riepilogo settimanale",
    weeklyDigestDesc: "Un riepilogo del lunedì sulle prestazioni del team.",
    notificationsSaved: "Impostazioni delle notifiche salvate",
    preferencesSaved: "Preferenze salvate",
    currentPlan: "Piano attuale",
    currentPlanDesc: (plan?: string) => `Hai il piano ${plan}.`,
    active: "Attivo",
    planFeatures: "Prospect illimitati · 5 postazioni · sincronizzazione CRM",
    perMonth: "/mese",
    manageBilling: "Gestisci fatturazione",
    upgradePlan: "Passa a un piano superiore",
    upgradeFlow: "Flusso di upgrade",
    teamSeats: "Postazioni del team",
    seatsUsed: (used: number, total: number) =>
      `${used} di ${total} postazioni utilizzate`,
    inviteMember: "Invita membro",
    companyUsps: "Punti di forza dell'azienda",
    companyUspsDesc:
      "I punti di forza unici che Kai integra nell'outreach.",
    removeUsp: "Rimuovi punto di forza",
    addUsp: "Aggiungi punto di forza",
    save: "Salva",
    uspsSaved: "Punti di forza salvati",
    blacklistedCompanies: "Aziende in lista nera",
    blacklistedCompaniesDesc:
      "I prospect di queste aziende sono esclusi dalla ricerca e dall'outreach.",
    removeCompany: (name: string) => `Rimuovi ${name}`,
    companyRemoved: (name: string) => `${name} rimossa`,
    companyName: "Nome dell'azienda",
    domainPlaceholder: "dominio.com",
    add: "Aggiungi",
    companyBlacklisted: "Azienda aggiunta alla lista nera",
    // Lista nera aziende v2.
    blImportDesc:
      "Importa le aziende da escludere dalle tue ricerche e campagne.",
    blEmpty:
      "Non hai ancora nessuna lista nera di aziende. Per crearne una, importa una lista.",
    blImport: "Importa",
    blCreateNew: "Crea e associa una nuova lista",
    blAssociateExisting: "Associa una lista di aziende esistente",
    blDialogTitle: "Aggiungi alla lista nera",
    blCreateDesc: "Crea una nuova lista nera e associala.",
    blAssociateDesc: "Scegli una delle tue liste di aziende da mettere in lista nera.",
    blImportDialogDesc: "Importa una lista di aziende da escludere.",
    blNewListName: "Nome della lista nera",
    blNewListPlaceholder: "es. Clienti attuali",
    blCreate: "Crea",
    blNoCompanyLists: "Non hai ancora liste di aziende da associare.",
    blAssociate: "Associa",
    blImportSimulated:
      "Importazione simulata — aziende aggiunte alla tua lista nera",
    blAssociatedToast: (n: number) =>
      `${n} ${n === 1 ? "azienda aggiunta" : "aziende aggiunte"} alla tua lista nera`,
    blCreatedToast: (name: string) => `Lista nera "${name}" creata`,
    blCompanies: (n: number) => `${n} ${n === 1 ? "azienda" : "aziende"}`,
    close: "Chiudi",
  },
  fr: {
    title: "Paramètres",
    description:
      "Gérez votre compte, votre proposition de valeur et votre configuration de vente.",
    tabAccount: "Compte",
    tabAccountMgmt: "Gestion du compte",
    teamRosterTitle: "Commerciaux de l'équipe",
    teamDesc: "Consultez et gérez les commerciaux de votre organisation.",
    teamRep: "Commercial",
    teamEmail: "E-mail",
    teamRole: "Rôle",
    teamViewAs: "Voir en tant que",
    teamViewingAs: (name: string) => `Vous consultez actuellement en tant que ${name}`,
    teamExit: "Quitter",
    teamScope: "Périmètre des données",
    teamScopeDesc: "Filtrez les tableaux de bord et les rapports sur toute l'organisation ou sur une seule équipe.",
    teamWholeOrg: "Toute l'organisation",
    teamClientBadge: "Client",
    teamViewTeam: "Voir",
    teamMembersTitle: "Membres de l'équipe",
    teamMembersDesc: "Invitez des commerciaux et gérez leurs rôles.",
    inviteEmailPlaceholder: "collegue@entreprise.com",
    roleEmployee: "Employé",
    roleManager: "Manager",
    inviteStatus: "Statut",
    invitePending: "En attente",
    resendInvite: "Renvoyer l'invitation",
    removeInvite: (email: string) => `Retirer ${email}`,
    inviteSentTo: (email: string) => `Invitation envoyée à ${email}`,
    inviteResentTo: (email: string) => `Invitation renvoyée à ${email}`,
    inviteRemovedToast: (email: string) => `${email} retiré`,
    noInvites: "Aucun collègue invité pour le moment — invitez-en un ci-dessus.",
    tabValue: "Proposition de valeur",
    tabSelling: "Configuration des ventes",
    tabConnections: "Connexions",
    connectionsDesc:
      "Gérez votre CRM, réseau professionnel, outreach et connexions aux outils IA.",
    connIntegrations: "Intégrations",
    connAiTools: "Connexions aux outils IA",
    connectedCount: (n: number, total: number) => `${n} sur ${total} connectées`,
    goToIntegrations: "Gérer dans Intégrations",
    tabBlacklists: "Listes noires",
    tabPreferences: "Préférences",
    tabNotifications: "Notifications",
    profileDetails: "Informations du profil",
    profileDetailsDesc: "Mettez à jour vos informations personnelles.",
    fullName: "Nom complet",
    email: "E-mail",
    role: "Rôle",
    company: "Entreprise",
    saveChanges: "Enregistrer les modifications",
    profileSaved: "Profil enregistré",
    profilePhoto: "Photo de profil",
    changePhoto: "Changer la photo",
    removePhoto: "Supprimer",
    photoHint: "PNG, JPG ou GIF.",
    photoUpdated: "Photo mise à jour",
    photoRemoved: "Photo supprimée",
    smartUploads: "Imports intelligents",
    smartUploadsDesc:
      "Comment Kombo traite les listes de prospects que vous importez.",
    autoEnrich: "Enrichissement automatique à l'import",
    autoEnrichDesc:
      "Ajoute 30 points de données à chaque prospect importé.",
    autoAssign: "Attribution automatique à une liste",
    autoAssignDesc: "Regroupe automatiquement chaque import dans une nouvelle liste.",
    skipDuplicates: "Ignorer les doublons",
    skipDuplicatesDesc: "Ignore les prospects déjà présents dans votre espace de travail.",
    uploadSaved: "Paramètres d'import enregistrés",
    outreachTemplates: "Modèles de prospection",
    outreachTemplatesDesc:
      "Les modèles et la stratégie que Kai utilise pour rédiger la prospection.",
    manageTemplates: "Gérer les modèles",
    openPlaybook: "Ouvrir la stratégie",
    appearance: "Apparence",
    appearanceDesc: "Personnalisez l'apparence de Kombo sur votre appareil.",
    theme: "Thème",
    themeOptions: { light: "Clair", dark: "Sombre", system: "Système" },
    aiSuggestions: "Suggestions IA",
    aiSuggestionsDesc: "Affiche des prospects recommandés et les prochaines étapes.",
    dailyDigest: "Résumé quotidien",
    dailyDigestDesc: "Un résumé de l'activité du pipeline chaque matin.",
    notifications: "Notifications",
    notificationsDesc: "Choisissez les notifications que vous recevez.",
    prospectReplies: "Réponses des prospects",
    prospectRepliesDesc: "Quand un prospect répond à votre prospection.",
    meetingsBooked: "Rendez-vous pris",
    meetingsBookedDesc: "Quand un rendez-vous est pris depuis une séquence.",
    dealStageChanges: "Changements d'étape des transactions",
    dealStageChangesDesc: "Quand une transaction change d'étape dans le pipeline.",
    mentions: "Mentions",
    mentionsDesc: "Quand un collègue vous @mentionne.",
    weeklyDigest: "Résumé hebdomadaire",
    weeklyDigestDesc: "Un résumé le lundi des performances de l'équipe.",
    notificationsSaved: "Paramètres de notification enregistrés",
    preferencesSaved: "Préférences enregistrées",
    currentPlan: "Plan actuel",
    currentPlanDesc: (plan?: string) => `Vous êtes sur le plan ${plan}.`,
    active: "Actif",
    planFeatures: "Prospects illimités · 5 licences · synchronisation CRM",
    perMonth: "/mois",
    manageBilling: "Gérer la facturation",
    upgradePlan: "Passer au plan supérieur",
    upgradeFlow: "Parcours de mise à niveau",
    teamSeats: "Licences de l'équipe",
    seatsUsed: (used: number, total: number) =>
      `${used} licences utilisées sur ${total}`,
    inviteMember: "Inviter un membre",
    companyUsps: "Atouts uniques de l'entreprise",
    companyUspsDesc:
      "Les arguments de vente uniques que Kai intègre dans la prospection.",
    removeUsp: "Supprimer l'atout",
    addUsp: "Ajouter un atout",
    save: "Enregistrer",
    uspsSaved: "Atouts enregistrés",
    blacklistedCompanies: "Entreprises sur liste noire",
    blacklistedCompaniesDesc:
      "Les prospects de ces entreprises sont exclus de la recherche et de la prospection.",
    removeCompany: (name: string) => `Supprimer ${name}`,
    companyRemoved: (name: string) => `${name} supprimée`,
    companyName: "Nom de l'entreprise",
    domainPlaceholder: "domaine.com",
    add: "Ajouter",
    companyBlacklisted: "Entreprise ajoutée à la liste noire",
    // Liste noire d'entreprises v2.
    blImportDesc:
      "Importez les entreprises à exclure de vos recherches et campagnes.",
    blEmpty:
      "Vous n'avez pas encore de liste noire d'entreprises. Pour en créer une, importez une liste.",
    blImport: "Importer",
    blCreateNew: "Créer et associer une nouvelle liste",
    blAssociateExisting: "Associer une liste d'entreprises existante",
    blDialogTitle: "Ajouter à la liste noire",
    blCreateDesc: "Créez une nouvelle liste noire et associez-la.",
    blAssociateDesc: "Choisissez l'une de vos listes d'entreprises à mettre sur liste noire.",
    blImportDialogDesc: "Importez une liste d'entreprises à exclure.",
    blNewListName: "Nom de la liste noire",
    blNewListPlaceholder: "ex. Clients existants",
    blCreate: "Créer",
    blNoCompanyLists: "Vous n'avez pas encore de liste d'entreprises à associer.",
    blAssociate: "Associer",
    blImportSimulated:
      "Import simulé — entreprises ajoutées à votre liste noire",
    blAssociatedToast: (n: number) =>
      `${n} ${n === 1 ? "entreprise ajoutée" : "entreprises ajoutées"} à votre liste noire`,
    blCreatedToast: (name: string) => `Liste noire "${name}" créée`,
    blCompanies: (n: number) => `${n} ${n === 1 ? "entreprise" : "entreprises"}`,
    close: "Fermer",
  },
  de: {
    title: "Einstellungen",
    description:
      "Verwalte dein Konto, dein Wertversprechen und deine Vertriebseinstellungen.",
    tabAccount: "Konto",
    tabAccountMgmt: "Kontoverwaltung",
    teamRosterTitle: "Vertriebler-Übersicht",
    teamDesc: "Sieh dir die Vertriebler deiner Organisation an und verwalte sie.",
    teamRep: "Vertriebler",
    teamEmail: "E-Mail",
    teamRole: "Rolle",
    teamViewAs: "Ansehen als",
    teamViewingAs: (name: string) => `Aktuelle Ansicht als ${name}`,
    teamExit: "Beenden",
    teamScope: "Datenbereich",
    teamScopeDesc: "Filtere Dashboards und Berichte nach der gesamten Organisation oder einem einzelnen Team.",
    teamWholeOrg: "Gesamte Organisation",
    teamClientBadge: "Kunde",
    teamViewTeam: "Ansehen",
    teamMembersTitle: "Teammitglieder",
    teamMembersDesc: "Lade Vertriebler ein und verwalte ihre Rollen.",
    inviteEmailPlaceholder: "kollege@unternehmen.com",
    roleEmployee: "Mitarbeiter",
    roleManager: "Manager",
    inviteStatus: "Status",
    invitePending: "Ausstehend",
    resendInvite: "Einladung erneut senden",
    removeInvite: (email: string) => `${email} entfernen`,
    inviteSentTo: (email: string) => `Einladung gesendet an ${email}`,
    inviteResentTo: (email: string) => `Einladung erneut gesendet an ${email}`,
    inviteRemovedToast: (email: string) => `${email} entfernt`,
    noInvites: "Noch niemand eingeladen — lade oben deinen ersten Kollegen ein.",
    tabValue: "Wertversprechen",
    tabSelling: "Vertriebskonfiguration",
    tabConnections: "Verbindungen",
    connectionsDesc:
      "Verwalte dein CRM, professionelles Netzwerk, Outreach und KI-Tool-Verbindungen.",
    connIntegrations: "Integrationen",
    connAiTools: "KI-Tool-Verbindungen",
    connectedCount: (n: number, total: number) => `${n} von ${total} verbunden`,
    goToIntegrations: "In Integrationen verwalten",
    tabBlacklists: "Blacklists",
    tabPreferences: "Präferenzen",
    tabNotifications: "Benachrichtigungen",
    profileDetails: "Profildaten",
    profileDetailsDesc: "Aktualisiere deine persönlichen Daten.",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    role: "Rolle",
    company: "Unternehmen",
    saveChanges: "Änderungen speichern",
    profileSaved: "Profil gespeichert",
    profilePhoto: "Profilfoto",
    changePhoto: "Foto ändern",
    removePhoto: "Entfernen",
    photoHint: "PNG, JPG oder GIF.",
    photoUpdated: "Foto aktualisiert",
    photoRemoved: "Foto entfernt",
    smartUploads: "Smarte Uploads",
    smartUploadsDesc:
      "Wie Kombo die Prospect-Listen verarbeitet, die du importierst.",
    autoEnrich: "Beim Upload automatisch anreichern",
    autoEnrichDesc:
      "Ergänzt jeden importierten Prospect um 30 Datenpunkte.",
    autoAssign: "Automatisch einer Liste zuweisen",
    autoAssignDesc: "Fasst jeden Upload automatisch in einer neuen Liste zusammen.",
    skipDuplicates: "Duplikate überspringen",
    skipDuplicatesDesc: "Ignoriert Prospects, die bereits in deinem Workspace sind.",
    uploadSaved: "Upload-Einstellungen gespeichert",
    outreachTemplates: "Outreach-Vorlagen",
    outreachTemplatesDesc:
      "Die Vorlagen und das Playbook, auf die Kai beim Verfassen von Outreach zurückgreift.",
    manageTemplates: "Vorlagen verwalten",
    openPlaybook: "Playbook öffnen",
    appearance: "Darstellung",
    appearanceDesc: "Passe an, wie Kombo auf deinem Gerät aussieht.",
    theme: "Design",
    themeOptions: { light: "Hell", dark: "Dunkel", system: "System" },
    aiSuggestions: "KI-Vorschläge",
    aiSuggestionsDesc: "Zeigt empfohlene Prospects und nächste Schritte an.",
    dailyDigest: "Tägliche Zusammenfassung",
    dailyDigestDesc: "Jeden Morgen eine Zusammenfassung der Pipeline-Aktivität.",
    notifications: "Benachrichtigungen",
    notificationsDesc: "Wähle aus, worüber du benachrichtigt wirst.",
    prospectReplies: "Antworten von Prospects",
    prospectRepliesDesc: "Wenn ein Prospect auf dein Outreach antwortet.",
    meetingsBooked: "Gebuchte Meetings",
    meetingsBookedDesc: "Wenn aus einer Sequenz ein Meeting gebucht wird.",
    dealStageChanges: "Phasenwechsel bei Deals",
    dealStageChangesDesc: "Wenn ein Deal in der Pipeline die Phase wechselt.",
    mentions: "Erwähnungen",
    mentionsDesc: "Wenn ein Teammitglied dich @erwähnt.",
    weeklyDigest: "Wöchentliche Zusammenfassung",
    weeklyDigestDesc: "Jeden Montag eine Zusammenfassung der Team-Performance.",
    notificationsSaved: "Benachrichtigungseinstellungen gespeichert",
    preferencesSaved: "Präferenzen gespeichert",
    currentPlan: "Aktueller Plan",
    currentPlanDesc: (plan?: string) => `Du nutzt den Plan ${plan}.`,
    active: "Aktiv",
    planFeatures: "Unbegrenzte Prospects · 5 Plätze · CRM-Sync",
    perMonth: "/Monat",
    manageBilling: "Abrechnung verwalten",
    upgradePlan: "Plan upgraden",
    upgradeFlow: "Upgrade-Flow",
    teamSeats: "Teamplätze",
    seatsUsed: (used: number, total: number) =>
      `${used} von ${total} Plätzen belegt`,
    inviteMember: "Mitglied einladen",
    companyUsps: "USPs des Unternehmens",
    companyUspsDesc:
      "Alleinstellungsmerkmale, die Kai in dein Outreach einbaut.",
    removeUsp: "USP entfernen",
    addUsp: "USP hinzufügen",
    save: "Speichern",
    uspsSaved: "USPs gespeichert",
    blacklistedCompanies: "Unternehmen auf der Blacklist",
    blacklistedCompaniesDesc:
      "Prospects aus diesen Unternehmen werden von Suche und Outreach ausgeschlossen.",
    removeCompany: (name: string) => `${name} entfernen`,
    companyRemoved: (name: string) => `${name} entfernt`,
    companyName: "Name des Unternehmens",
    domainPlaceholder: "domain.com",
    add: "Hinzufügen",
    companyBlacklisted: "Unternehmen zur Blacklist hinzugefügt",
    // Unternehmens-Blacklist v2.
    blImportDesc:
      "Importiere die Unternehmen, die von deinen Suchen und Kampagnen ausgeschlossen werden sollen.",
    blEmpty:
      "Du hast noch keine Unternehmens-Blacklists. Importiere eine Liste, um eine Blacklist zu erstellen.",
    blImport: "Importieren",
    blCreateNew: "Neue Liste erstellen und verknüpfen",
    blAssociateExisting: "Bestehende Unternehmensliste verknüpfen",
    blDialogTitle: "Zur Blacklist hinzufügen",
    blCreateDesc: "Erstelle eine neue Blacklist und verknüpfe sie.",
    blAssociateDesc: "Wähle eine deiner Unternehmenslisten für die Blacklist aus.",
    blImportDialogDesc: "Importiere eine Unternehmensliste zum Ausschließen.",
    blNewListName: "Name der Blacklist",
    blNewListPlaceholder: "z. B. Bestandskunden",
    blCreate: "Erstellen",
    blNoCompanyLists: "Du hast noch keine Unternehmenslisten zum Verknüpfen.",
    blAssociate: "Verknüpfen",
    blImportSimulated:
      "Import simuliert — Unternehmen zur Blacklist hinzugefügt",
    blAssociatedToast: (n: number) =>
      `${n} Unternehmen zu deiner Blacklist hinzugefügt`,
    blCreatedToast: (name: string) => `Blacklist "${name}" erstellt`,
    blCompanies: (n: number) => `${n} Unternehmen`,
    close: "Schließen",
  },
  pt: {
    title: "Definições",
    description:
      "Faça a gestão da sua conta, proposta de valor e configuração de vendas.",
    tabAccount: "Conta",
    tabAccountMgmt: "Gestão da conta",
    teamRosterTitle: "Comerciais da equipa",
    teamDesc: "Consulte e faça a gestão dos comerciais da sua organização.",
    teamRep: "Comercial",
    teamEmail: "Email",
    teamRole: "Função",
    teamViewAs: "Ver como",
    teamViewingAs: (name: string) => `A ver como ${name}`,
    teamExit: "Sair",
    teamScope: "Âmbito dos dados",
    teamScopeDesc: "Filtre os dashboards e relatórios por toda a organização ou por uma única equipa.",
    teamWholeOrg: "Toda a organização",
    teamClientBadge: "Cliente",
    teamViewTeam: "Ver",
    teamMembersTitle: "Membros da equipa",
    teamMembersDesc: "Convide comerciais e faça a gestão das suas funções.",
    inviteEmailPlaceholder: "colega@empresa.com",
    roleEmployee: "Colaborador",
    roleManager: "Gestor",
    inviteStatus: "Estado",
    invitePending: "Pendente",
    resendInvite: "Reenviar convite",
    removeInvite: (email: string) => `Remover ${email}`,
    inviteSentTo: (email: string) => `Convite enviado para ${email}`,
    inviteResentTo: (email: string) => `Convite reenviado para ${email}`,
    inviteRemovedToast: (email: string) => `${email} removido`,
    noInvites: "Ainda não convidou ninguém — convide o primeiro colega acima.",
    tabValue: "Proposta de valor",
    tabSelling: "Configuração de vendas",
    tabConnections: "Ligações",
    connectionsDesc:
      "Faça a gestão do seu CRM, rede profissional, outreach e ligações a ferramentas de IA.",
    connIntegrations: "Integrações",
    connAiTools: "Ligações a ferramentas de IA",
    connectedCount: (n: number, total: number) => `${n} de ${total} ligadas`,
    goToIntegrations: "Gerir em Integrações",
    tabBlacklists: "Listas negras",
    tabPreferences: "Preferências",
    tabNotifications: "Notificações",
    profileDetails: "Dados do perfil",
    profileDetailsDesc: "Atualize as suas informações pessoais.",
    fullName: "Nome completo",
    email: "Email",
    role: "Função",
    company: "Empresa",
    saveChanges: "Guardar alterações",
    profileSaved: "Perfil guardado",
    profilePhoto: "Foto de perfil",
    changePhoto: "Alterar foto",
    removePhoto: "Remover",
    photoHint: "PNG, JPG ou GIF.",
    photoUpdated: "Foto atualizada",
    photoRemoved: "Foto removida",
    smartUploads: "Carregamentos inteligentes",
    smartUploadsDesc:
      "Como o Kombo processa as listas de prospects que importa.",
    autoEnrich: "Enriquecer automaticamente ao carregar",
    autoEnrichDesc:
      "Acrescenta 30 pontos de dados a cada prospect importado.",
    autoAssign: "Atribuir automaticamente a uma lista",
    autoAssignDesc: "Agrupa automaticamente cada carregamento numa nova lista.",
    skipDuplicates: "Ignorar duplicados",
    skipDuplicatesDesc: "Ignora os prospects que já estão no seu espaço de trabalho.",
    uploadSaved: "Definições de carregamento guardadas",
    outreachTemplates: "Modelos de outreach",
    outreachTemplatesDesc:
      "Os modelos e a estratégia que o Kai utiliza ao redigir o outreach.",
    manageTemplates: "Gerir modelos",
    openPlaybook: "Abrir estratégia",
    appearance: "Aspeto",
    appearanceDesc: "Personalize o aspeto do Kombo no seu dispositivo.",
    theme: "Tema",
    themeOptions: { light: "Claro", dark: "Escuro", system: "Sistema" },
    aiSuggestions: "Sugestões de IA",
    aiSuggestionsDesc: "Mostra prospects recomendados e próximos passos.",
    dailyDigest: "Resumo diário",
    dailyDigestDesc: "Um resumo da atividade do pipeline todas as manhãs.",
    notifications: "Notificações",
    notificationsDesc: "Escolha sobre o que quer receber notificações.",
    prospectReplies: "Respostas de prospects",
    prospectRepliesDesc: "Quando um prospect responde ao seu outreach.",
    meetingsBooked: "Reuniões agendadas",
    meetingsBookedDesc: "Quando uma reunião é agendada a partir de uma sequência.",
    dealStageChanges: "Mudanças de fase dos negócios",
    dealStageChangesDesc: "Quando um negócio muda de fase no pipeline.",
    mentions: "Menções",
    mentionsDesc: "Quando um colega o @menciona.",
    weeklyDigest: "Resumo semanal",
    weeklyDigestDesc: "Um resumo à segunda-feira do desempenho da equipa.",
    notificationsSaved: "Definições de notificações guardadas",
    preferencesSaved: "Preferências guardadas",
    currentPlan: "Plano atual",
    currentPlanDesc: (plan?: string) => `Está no plano ${plan}.`,
    active: "Ativo",
    planFeatures: "Prospects ilimitados · 5 licenças · sincronização com o CRM",
    perMonth: "/mês",
    manageBilling: "Gerir faturação",
    upgradePlan: "Fazer upgrade do plano",
    upgradeFlow: "Fluxo de upgrade",
    teamSeats: "Licenças da equipa",
    seatsUsed: (used: number, total: number) =>
      `${used} de ${total} licenças usadas`,
    inviteMember: "Convidar membro",
    companyUsps: "Argumentos únicos da empresa",
    companyUspsDesc:
      "Argumentos de venda únicos que o Kai integra no outreach.",
    removeUsp: "Remover argumento",
    addUsp: "Adicionar argumento",
    save: "Guardar",
    uspsSaved: "Argumentos guardados",
    blacklistedCompanies: "Empresas na lista negra",
    blacklistedCompaniesDesc:
      "Os prospects destas empresas são excluídos da pesquisa e do outreach.",
    removeCompany: (name: string) => `Remover ${name}`,
    companyRemoved: (name: string) => `${name} removida`,
    companyName: "Nome da empresa",
    domainPlaceholder: "dominio.com",
    add: "Adicionar",
    companyBlacklisted: "Empresa adicionada à lista negra",
    // Lista negra de empresas v2.
    blImportDesc:
      "Importe as empresas que devem ser excluídas das suas pesquisas e campanhas.",
    blEmpty:
      "Ainda não tem nenhuma lista negra de empresas. Para criar uma, importe uma lista.",
    blImport: "Importar",
    blCreateNew: "Criar e associar uma nova lista",
    blAssociateExisting: "Associar uma lista de empresas existente",
    blDialogTitle: "Adicionar à lista negra",
    blCreateDesc: "Crie uma nova lista negra e associe-a.",
    blAssociateDesc: "Escolha uma das suas listas de empresas para colocar na lista negra.",
    blImportDialogDesc: "Importe uma lista de empresas para excluir.",
    blNewListName: "Nome da lista negra",
    blNewListPlaceholder: "p. ex. Clientes atuais",
    blCreate: "Criar",
    blNoCompanyLists: "Ainda não tem listas de empresas para associar.",
    blAssociate: "Associar",
    blImportSimulated:
      "Importação simulada — empresas adicionadas à sua lista negra",
    blAssociatedToast: (n: number) =>
      `${n} ${n === 1 ? "empresa adicionada" : "empresas adicionadas"} à sua lista negra`,
    blCreatedToast: (name: string) => `Lista negra "${name}" criada`,
    blCompanies: (n: number) => `${n} ${n === 1 ? "empresa" : "empresas"}`,
    close: "Fechar",
  },
  pt_BR: {
    title: "Configurações",
    description:
      "Gerencie sua conta, proposta de valor e configuração de vendas.",
    tabAccount: "Conta",
    tabAccountMgmt: "Gestão da conta",
    teamRosterTitle: "Vendedores do time",
    teamDesc: "Veja e gerencie os vendedores da sua organização.",
    teamRep: "Vendedor",
    teamEmail: "E-mail",
    teamRole: "Função",
    teamViewAs: "Ver como",
    teamViewingAs: (name: string) => `Vendo como ${name}`,
    teamExit: "Sair",
    teamScope: "Escopo dos dados",
    teamScopeDesc: "Filtre os dashboards e relatórios por toda a organização ou por um único time.",
    teamWholeOrg: "Toda a organização",
    teamClientBadge: "Cliente",
    teamViewTeam: "Ver",
    teamMembersTitle: "Membros do time",
    teamMembersDesc: "Convide vendedores e gerencie suas funções.",
    inviteEmailPlaceholder: "colega@empresa.com",
    roleEmployee: "Colaborador",
    roleManager: "Gerente",
    inviteStatus: "Status",
    invitePending: "Pendente",
    resendInvite: "Reenviar convite",
    removeInvite: (email: string) => `Remover ${email}`,
    inviteSentTo: (email: string) => `Convite enviado para ${email}`,
    inviteResentTo: (email: string) => `Convite reenviado para ${email}`,
    inviteRemovedToast: (email: string) => `${email} removido`,
    noInvites: "Você ainda não convidou ninguém — convide seu primeiro colega acima.",
    tabValue: "Proposta de valor",
    tabSelling: "Configuração de vendas",
    tabConnections: "Conexões",
    connectionsDesc:
      "Gerencie seu CRM, rede profissional, outreach e conexões com ferramentas de IA.",
    connIntegrations: "Integrações",
    connAiTools: "Conexões com ferramentas de IA",
    connectedCount: (n: number, total: number) => `${n} de ${total} conectadas`,
    goToIntegrations: "Gerenciar em Integrações",
    tabBlacklists: "Listas negras",
    tabPreferences: "Preferências",
    tabNotifications: "Notificações",
    profileDetails: "Dados do perfil",
    profileDetailsDesc: "Atualize suas informações pessoais.",
    fullName: "Nome completo",
    email: "E-mail",
    role: "Função",
    company: "Empresa",
    saveChanges: "Salvar alterações",
    profileSaved: "Perfil salvo",
    profilePhoto: "Foto de perfil",
    changePhoto: "Alterar foto",
    removePhoto: "Remover",
    photoHint: "PNG, JPG ou GIF.",
    photoUpdated: "Foto atualizada",
    photoRemoved: "Foto removida",
    smartUploads: "Uploads inteligentes",
    smartUploadsDesc:
      "Como o Kombo processa as listas de prospects que você importa.",
    autoEnrich: "Enriquecer automaticamente no upload",
    autoEnrichDesc:
      "Adiciona 30 pontos de dados a cada prospect importado.",
    autoAssign: "Atribuir automaticamente a uma lista",
    autoAssignDesc: "Agrupa automaticamente cada upload em uma nova lista.",
    skipDuplicates: "Ignorar duplicados",
    skipDuplicatesDesc: "Ignora os prospects que já estão no seu espaço de trabalho.",
    uploadSaved: "Configurações de upload salvas",
    outreachTemplates: "Modelos de outreach",
    outreachTemplatesDesc:
      "Os modelos e a estratégia que o Kai usa ao redigir o outreach.",
    manageTemplates: "Gerenciar modelos",
    openPlaybook: "Abrir estratégia",
    appearance: "Aparência",
    appearanceDesc: "Personalize a aparência do Kombo no seu dispositivo.",
    theme: "Tema",
    themeOptions: { light: "Claro", dark: "Escuro", system: "Sistema" },
    aiSuggestions: "Sugestões de IA",
    aiSuggestionsDesc: "Mostra prospects recomendados e próximos passos.",
    dailyDigest: "Resumo diário",
    dailyDigestDesc: "Um resumo da atividade do pipeline toda manhã.",
    notifications: "Notificações",
    notificationsDesc: "Escolha sobre o que você quer receber notificações.",
    prospectReplies: "Respostas de prospects",
    prospectRepliesDesc: "Quando um prospect responde ao seu outreach.",
    meetingsBooked: "Reuniões agendadas",
    meetingsBookedDesc: "Quando uma reunião é agendada a partir de uma sequência.",
    dealStageChanges: "Mudanças de etapa dos negócios",
    dealStageChangesDesc: "Quando um negócio muda de etapa no pipeline.",
    mentions: "Menções",
    mentionsDesc: "Quando um colega @menciona você.",
    weeklyDigest: "Resumo semanal",
    weeklyDigestDesc: "Um resumo às segundas do desempenho do time.",
    notificationsSaved: "Configurações de notificação salvas",
    preferencesSaved: "Preferências salvas",
    currentPlan: "Plano atual",
    currentPlanDesc: (plan?: string) => `Você está no plano ${plan}.`,
    active: "Ativo",
    planFeatures: "Prospects ilimitados · 5 licenças · sincronização com o CRM",
    perMonth: "/mês",
    manageBilling: "Gerenciar faturamento",
    upgradePlan: "Fazer upgrade do plano",
    upgradeFlow: "Fluxo de upgrade",
    teamSeats: "Licenças do time",
    seatsUsed: (used: number, total: number) =>
      `${used} de ${total} licenças usadas`,
    inviteMember: "Convidar membro",
    companyUsps: "Diferenciais da empresa",
    companyUspsDesc:
      "Diferenciais de venda que o Kai integra no outreach.",
    removeUsp: "Remover diferencial",
    addUsp: "Adicionar diferencial",
    save: "Salvar",
    uspsSaved: "Diferenciais salvos",
    blacklistedCompanies: "Empresas na lista negra",
    blacklistedCompaniesDesc:
      "Os prospects dessas empresas são excluídos da busca e do outreach.",
    removeCompany: (name: string) => `Remover ${name}`,
    companyRemoved: (name: string) => `${name} removida`,
    companyName: "Nome da empresa",
    domainPlaceholder: "dominio.com",
    add: "Adicionar",
    companyBlacklisted: "Empresa adicionada à lista negra",
    // Lista negra de empresas v2.
    blImportDesc:
      "Importe as empresas que devem ser excluídas das suas buscas e campanhas.",
    blEmpty:
      "Você ainda não tem nenhuma lista negra de empresas. Para criar uma, importe uma lista.",
    blImport: "Importar",
    blCreateNew: "Criar e associar uma nova lista",
    blAssociateExisting: "Associar uma lista de empresas existente",
    blDialogTitle: "Adicionar à lista negra",
    blCreateDesc: "Crie uma nova lista negra e associe-a.",
    blAssociateDesc: "Escolha uma das suas listas de empresas para colocar na lista negra.",
    blImportDialogDesc: "Importe uma lista de empresas para excluir.",
    blNewListName: "Nome da lista negra",
    blNewListPlaceholder: "ex.: Clientes atuais",
    blCreate: "Criar",
    blNoCompanyLists: "Você ainda não tem listas de empresas para associar.",
    blAssociate: "Associar",
    blImportSimulated:
      "Importação simulada — empresas adicionadas à sua lista negra",
    blAssociatedToast: (n: number) =>
      `${n} ${n === 1 ? "empresa adicionada" : "empresas adicionadas"} à sua lista negra`,
    blCreatedToast: (name: string) => `Lista negra "${name}" criada`,
    blCompanies: (n: number) => `${n} ${n === 1 ? "empresa" : "empresas"}`,
    close: "Fechar",
  },
} as const

export default function Settings() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { scope, impersonating, viewTeam, impersonate, viewAsTeam, exitImpersonation } =
    useView()
  // URL-addressable tabs: /settings?tab=accountManagement deep-links a tab.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") ?? "account"

  const [invites, setInvites] = React.useState<PendingInvite[]>([])
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState<PendingInvite["role"]>("employee")

  function viewAsRep(rep: TeamMember) {
    impersonate(rep.id)
    toast.success(c.teamViewingAs(rep.name))
  }

  function sendInvite() {
    if (!EMAIL_RE.test(inviteEmail)) return
    setInvites((prev) => [
      ...prev,
      { id: `inv_${Date.now()}_${prev.length}`, email: inviteEmail, role: inviteRole },
    ])
    toast.success(c.inviteSentTo(inviteEmail))
    setInviteEmail("")
    setInviteRole("employee")
  }

  function resendInvite(invite: PendingInvite) {
    toast.success(c.inviteResentTo(invite.email))
  }

  function removeInvite(invite: PendingInvite) {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    toast.success(c.inviteRemovedToast(invite.email))
  }

  function setInviteMemberRole(id: string, role: PendingInvite["role"]) {
    setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, role } : i)))
  }

  const connectedIntegrationsCount = integrations.filter((i) => i.connected).length

  return (
    <Page className="max-w-3xl">
      <PageHeading title={c.title} description={c.description} />

      <Tabs
        value={tab}
        onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })}
      >
        <TabsList className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-16 z-20 mb-4 h-auto flex-wrap backdrop-blur">
          <TabsTrigger value="account">{c.tabAccount}</TabsTrigger>
          <TabsTrigger value="accountManagement">{c.tabAccountMgmt}</TabsTrigger>
          <TabsTrigger value="value">{c.tabValue}</TabsTrigger>
          <TabsTrigger value="selling">{c.tabSelling}</TabsTrigger>
          <TabsTrigger value="connections">{c.tabConnections}</TabsTrigger>
          <TabsTrigger value="blacklists">{c.tabBlacklists}</TabsTrigger>
          <TabsTrigger value="preferences">{c.tabPreferences}</TabsTrigger>
          <TabsTrigger value="notifications">{c.tabNotifications}</TabsTrigger>
        </TabsList>

        {/* ACCOUNT */}
        <TabsContent value="account" className="space-y-4">
          <ProfileCard c={c} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.smartUploads}</CardTitle>
              <CardDescription>{c.smartUploadsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <PreferenceRow
                title={c.autoEnrich}
                description={c.autoEnrichDesc}
                defaultChecked
              />
              <PreferenceRow
                title={c.autoAssign}
                description={c.autoAssignDesc}
                defaultChecked
              />
              <PreferenceRow
                title={c.skipDuplicates}
                description={c.skipDuplicatesDesc}
                defaultChecked
              />
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success(c.uploadSaved)}>
                  {c.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNT MANAGEMENT */}
        <TabsContent value="accountManagement" className="space-y-4">
          {(impersonating || viewTeam) && (
            <div className="bg-primary/10 flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="size-4 shrink-0" />
                <span>
                  {impersonating
                    ? c.teamViewingAs(impersonating.name)
                    : viewTeam && c.teamViewingAs(viewTeam.name)}
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={exitImpersonation}>
                <X className="size-3.5" />
                {c.teamExit}
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.teamScope}</CardTitle>
              <CardDescription>{c.teamScopeDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="hover:bg-muted/60 flex items-center gap-3 rounded-md px-2 py-2">
                <Users className="text-muted-foreground size-4 shrink-0" />
                <p className="flex-1 truncate text-sm font-medium">{c.teamWholeOrg}</p>
                {scope.kind === "org" ? (
                  <Check className="text-primary size-4 shrink-0" />
                ) : (
                  <Button variant="outline" size="sm" onClick={exitImpersonation}>
                    {c.teamViewTeam}
                  </Button>
                )}
              </div>
              {teams.map((tm) => (
                <div
                  key={tm.id}
                  className="hover:bg-muted/60 flex items-center gap-3 rounded-md px-2 py-2"
                >
                  <Building2 className="text-muted-foreground size-4 shrink-0" />
                  <p className="flex-1 truncate text-sm font-medium">
                    {tm.name}
                    {tm.type === "client" && (
                      <span className="text-muted-foreground ml-2 text-[10px] font-normal tracking-wide uppercase">
                        {c.teamClientBadge}
                      </span>
                    )}
                  </p>
                  {scope.kind === "team" && scope.id === tm.id ? (
                    <Check className="text-primary size-4 shrink-0" />
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => viewAsTeam(tm.id)}>
                      {c.teamViewTeam}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.teamRosterTitle}</CardTitle>
              <CardDescription>{c.teamDesc}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{c.teamRep}</TableHead>
                    <TableHead className="hidden md:table-cell">
                      {c.teamEmail}
                    </TableHead>
                    <TableHead>{c.teamRole}</TableHead>
                    <TableHead className="w-px text-right">{c.teamViewAs}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((rep) => {
                    const [first, last] = rep.name.split(" ")
                    return (
                      <TableRow key={rep.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarImage src={portraitFor(rep.name)} alt="" />
                              <AvatarFallback
                                style={{ backgroundColor: rep.avatarColor, color: "white" }}
                                className="text-xs"
                              >
                                {initials(first, last)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="truncate font-medium">{rep.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {rep.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {rep.role}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => viewAsRep(rep)}>
                            <Eye className="size-4" />
                            {c.teamViewAs}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.teamMembersTitle}</CardTitle>
              <CardDescription>
                {c.teamMembersDesc} {c.seatsUsed(team.length, team.length)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={c.inviteEmailPlaceholder}
                  className="sm:flex-1"
                />
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as PendingInvite["role"])}
                >
                  <SelectTrigger className="sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">{c.roleEmployee}</SelectItem>
                    <SelectItem value="manager">{c.roleManager}</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={sendInvite} disabled={!EMAIL_RE.test(inviteEmail)}>
                  <Plus className="size-4" />
                  {c.inviteMember}
                </Button>
              </div>

              {invites.length === 0 ? (
                <p className="text-muted-foreground text-sm">{c.noInvites}</p>
              ) : (
                <div className="space-y-1">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="hover:bg-muted/60 flex items-center gap-3 rounded-md px-2 py-2"
                    >
                      <p className="min-w-0 flex-1 truncate text-sm font-medium">
                        {invite.email}
                      </p>
                      <Badge variant="secondary" className="font-normal">
                        {c.invitePending}
                      </Badge>
                      <Select
                        value={invite.role}
                        onValueChange={(v) =>
                          setInviteMemberRole(invite.id, v as PendingInvite["role"])
                        }
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">{c.roleEmployee}</SelectItem>
                          <SelectItem value="manager">{c.roleManager}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={c.resendInvite}
                        onClick={() => resendInvite(invite)}
                      >
                        <Mail className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={c.removeInvite(invite.email)}
                        onClick={() => removeInvite(invite)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.currentPlan}</CardTitle>
              <CardDescription>{c.currentPlanDesc(user?.plan)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{user?.plan}</p>
                    <Badge variant="success" className="font-normal">
                      {c.active}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {c.planFeatures}
                  </p>
                </div>
                <p className="text-xl font-semibold">
                  $99
                  <span className="text-muted-foreground text-sm">
                    {c.perMonth}
                  </span>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast.info(c.manageBilling)}
                >
                  {c.manageBilling}
                </Button>
                <Button onClick={() => toast.info(c.upgradeFlow)}>
                  {c.upgradePlan}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VALUE PROPOSITION */}
        <TabsContent value="value" className="space-y-4">
          <IcpManager />

          <ProductManager />

          <UspsCard />
        </TabsContent>

        {/* SELLING CONFIGURATION */}
        <TabsContent value="selling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.outreachTemplates}</CardTitle>
              <CardDescription>{c.outreachTemplatesDesc}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to="/templates">{c.manageTemplates}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/playbook">{c.openPlaybook}</Link>
              </Button>
            </CardContent>
          </Card>

          <SalesMethodologyCard />
        </TabsContent>

        {/* BLACKLISTS */}
        <TabsContent value="blacklists">
          <BlacklistCard />
        </TabsContent>

        {/* PREFERENCES */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.appearance}</CardTitle>
              <CardDescription>{c.appearanceDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{c.theme}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const active = theme === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        {active && (
                          <Check className="text-primary absolute top-2 right-2 size-4" />
                        )}
                        <Icon className="size-5" />
                        {c.themeOptions[opt.value]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <Separator />
              <PreferenceRow
                title={c.aiSuggestions}
                description={c.aiSuggestionsDesc}
                defaultChecked
              />
              <PreferenceRow
                title={c.dailyDigest}
                description={c.dailyDigestDesc}
                defaultChecked
              />
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success(c.preferencesSaved)}>
                  {c.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.notifications}</CardTitle>
              <CardDescription>{c.notificationsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <PreferenceRow
                title={c.prospectReplies}
                description={c.prospectRepliesDesc}
                defaultChecked
              />
              <PreferenceRow
                title={c.meetingsBooked}
                description={c.meetingsBookedDesc}
                defaultChecked
              />
              <PreferenceRow
                title={c.dealStageChanges}
                description={c.dealStageChangesDesc}
                defaultChecked
              />
              <PreferenceRow
                title={c.mentions}
                description={c.mentionsDesc}
                defaultChecked
              />
              <PreferenceRow
                title={c.weeklyDigest}
                description={c.weeklyDigestDesc}
              />
              <Separator />
              <div className="flex justify-end">
                <Button
                  onClick={() => toast.success(c.notificationsSaved)}
                >
                  {c.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONNECTIONS */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.tabConnections}</CardTitle>
              <CardDescription>{c.connectionsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
                    <Plug className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.connIntegrations}</p>
                    <p className="text-muted-foreground text-xs">
                      {c.connectedCount(connectedIntegrationsCount, integrations.length)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.connAiTools}</p>
                    <p className="text-muted-foreground text-xs">
                      {c.connectedCount(connectedToolCount, mcpConnections.length)}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button asChild>
                  <Link to="/integrations">{c.goToIntegrations}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Page>
  )
}

function ProfileCard({ c }: { c: { profileDetails: string; profileDetailsDesc: string; fullName: string; email: string; role: string; company: string; saveChanges: string; profileSaved: string; profilePhoto: string; changePhoto: string; removePhoto: string; photoHint: string; photoUpdated: string; photoRemoved: string } }) {
  const { user, updateProfile } = useAuth()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [name, setName] = React.useState(user?.name ?? "")
  const [email, setEmail] = React.useState(user?.email ?? "")
  const [role, setRole] = React.useState(user?.role ?? "")
  const [company, setCompany] = React.useState(user?.company ?? "")
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(user?.avatarUrl)

  const previewSrc = avatarUrl ?? (user ? portraitFor(user.name) : undefined)

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setAvatarUrl(url)
      updateProfile({ avatarUrl: url })
      toast.success(c.photoUpdated)
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setAvatarUrl(undefined)
    updateProfile({ avatarUrl: undefined })
    toast.success(c.photoRemoved)
  }

  function save() {
    updateProfile({ name, email, role, company })
    toast.success(c.profileSaved)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.profileDetails}</CardTitle>
        <CardDescription>{c.profileDetailsDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar editor */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative rounded-full"
            aria-label={c.changePhoto}
          >
            <Avatar className="size-16">
              {previewSrc && <AvatarImage src={previewSrc} alt="" />}
              <AvatarFallback
                style={{ backgroundColor: user?.avatarColor, color: "white" }}
                className="text-lg"
              >
                {initials(name.split(" ")[0] || "K", name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5" />
            </span>
          </button>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Camera className="size-4" />
                {c.changePhoto}
              </Button>
              {avatarUrl && (
                <Button variant="ghost" size="sm" onClick={removePhoto}>
                  {c.removePhoto}
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-xs">{c.photoHint}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickPhoto}
          />
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-name">{c.fullName}</Label>
            <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-email">{c.email}</Label>
            <Input id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-role">{c.role}</Label>
            <Input id="pf-role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-company">{c.company}</Label>
            <Input id="pf-company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button onClick={save}>{c.saveChanges}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function UspsCard() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [usps, setUsps] = React.useState<string[]>([
    "3x faster pipeline generation",
    "30-point AI enrichment on every contact",
    "Two-way CRM sync with no manual entry",
  ])
  const idRef = React.useRef(0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.companyUsps}</CardTitle>
        <CardDescription>{c.companyUspsDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {usps.map((usp, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={usp}
              onChange={(e) =>
                setUsps((prev) =>
                  prev.map((u, idx) => (idx === i ? e.target.value : u))
                )
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label={c.removeUsp}
              onClick={() => setUsps((prev) => prev.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              idRef.current += 1
              setUsps((prev) => [...prev, ""])
            }}
          >
            <Plus className="size-4" />
            {c.addUsp}
          </Button>
          <Button size="sm" onClick={() => toast.success(c.uspsSaved)}>
            {c.save}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------- Company blacklist card -------------------------- */

function BlacklistCard() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const items = useBlacklist()
  const lists = useLists()
  const accounts = useAccounts()

  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"create" | "associate" | "import">(
    "associate"
  )
  const [newListName, setNewListName] = React.useState("")

  // Company lists the user can associate — lists that hold accounts.
  const companyLists = lists.filter(
    (l) => l.kind === "company" && (l.accountIds?.length ?? 0) > 0
  )
  const accountById = React.useMemo(() => {
    const map = new Map<string, (typeof accounts)[number]>()
    for (const a of accounts) map.set(a.id, a)
    return map
  }, [accounts])

  function openDialog(next: "create" | "associate" | "import") {
    setMode(next)
    setNewListName("")
    setDialogOpen(true)
  }

  function add() {
    if (!name.trim() || !domain.trim()) return
    blacklistStore.add({
      name: name.trim(),
      domain: domain.trim(),
      reason: "Manual",
    })
    setName("")
    setDomain("")
    toast.success(c.companyBlacklisted)
  }

  function createBlacklist() {
    const trimmed = newListName.trim()
    if (!trimmed) return
    blacklistStore.add({ name: trimmed, domain: "", reason: "Custom list" })
    toast.success(c.blCreatedToast(trimmed))
    setDialogOpen(false)
  }

  function associateList(listId: string) {
    const list = companyLists.find((l) => l.id === listId)
    if (!list) return
    const companies = (list.accountIds ?? [])
      .map((id) => accountById.get(id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => ({ name: a.name, domain: a.domain, reason: list.name }))
    blacklistStore.addMany(companies)
    toast.success(c.blAssociatedToast(companies.length))
    setDialogOpen(false)
  }

  function simulateImport() {
    toast.success(c.blImportSimulated)
    setDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.blacklistedCompanies}</CardTitle>
        <CardDescription>{c.blImportDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <p className="text-muted-foreground mx-auto max-w-sm text-sm">
              {c.blEmpty}
            </p>
            <Button className="mt-4" onClick={() => openDialog("import")}>
              <Download className="size-4" />
              {c.blImport}
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((company) => (
              <div
                key={company.id}
                className="flex items-center gap-3 rounded-md px-2 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{company.name}</p>
                  {company.domain && (
                    <p className="text-muted-foreground truncate text-xs">
                      {company.domain}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="font-normal">
                  {company.reason}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label={c.removeCompany(company.name)}
                  onClick={() => {
                    blacklistStore.remove(company.id)
                    toast.info(c.companyRemoved(company.name))
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Three ways to add companies to the blacklist. */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => openDialog("create")}>
            <Plus className="size-4" />
            {c.blCreateNew}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDialog("associate")}
          >
            <Link2 className="size-4" />
            {c.blAssociateExisting}
          </Button>
          <Button variant="outline" size="sm" onClick={() => openDialog("import")}>
            <Download className="size-4" />
            {c.blImport}
          </Button>
        </div>

        <Separator />

        {/* Manual single-company add. */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder={c.companyName}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder={c.domainPlaceholder}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Button onClick={add} disabled={!name.trim() || !domain.trim()}>
            <Plus className="size-4" />
            {c.add}
          </Button>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{c.blDialogTitle}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? c.blCreateDesc
                : mode === "associate"
                  ? c.blAssociateDesc
                  : c.blImportDialogDesc}
            </DialogDescription>
          </DialogHeader>

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="bl-new-name">{c.blNewListName}</Label>
              <Input
                id="bl-new-name"
                placeholder={c.blNewListPlaceholder}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
          )}

          {mode === "associate" && (
            <div className="space-y-1">
              {companyLists.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {c.blNoCompanyLists}
                </p>
              ) : (
                companyLists.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {c.blCompanies(l.accountIds?.length ?? 0)}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => associateList(l.id)}>
                      {c.blAssociate}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {mode === "import" && (
            <div className="rounded-lg border border-dashed py-8 text-center">
              <Download className="text-muted-foreground mx-auto size-6" />
              <p className="text-muted-foreground mt-2 text-sm">
                {c.blImportDialogDesc}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              {c.close}
            </Button>
            {mode === "create" && (
              <Button onClick={createBlacklist} disabled={!newListName.trim()}>
                {c.blCreate}
              </Button>
            )}
            {mode === "import" && (
              <Button onClick={simulateImport}>
                <Download className="size-4" />
                {c.blImport}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function PreferenceRow({
  title,
  description,
  defaultChecked,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
