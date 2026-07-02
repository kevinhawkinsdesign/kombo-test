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
  Building2,
  Camera,
  ChevronDown,
  Copy,
  Eye,
  Server,
  Mail,
  MessageCircle,
  Video,
  Download,
  Link2,
  Clock,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

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
import { useAuth } from "@/lib/auth"
import { team } from "@/lib/team"
import { initials } from "@/lib/format"
import { portraitFor } from "@/lib/avatars"
import { SALES_METHODOLOGIES } from "@/lib/mock-settings"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const

const CONNECTION_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Spain",
  "Germany",
  "France",
  "Italy",
  "Netherlands",
  "Canada",
] as const

const TIME_ZONES = [
  "Europe/Madrid (CET) (UTC +1)",
  "America/New_York (ET) (UTC -5)",
  "America/Los_Angeles (PT) (UTC -8)",
  "Europe/London (GMT) (UTC +0)",
] as const

// CRMs Kombo can connect to — single-select (radio-like) in the UI.
const CRM_OPTIONS = [
  "Hubspot",
  "Salesforce",
  "Pipedrive",
  "Dynamics",
  "Zoho",
  "Monday",
] as const

const MCP_SERVER_URL = "https://hello-mcp-le3wysim3q-no.a.run.app/mcp"

const COPY = {
  en: {
    title: "Settings",
    description:
      "Manage your account, value proposition, selling config, and connections.",
    tabAccount: "Account",
    tabValue: "Value props",
    tabSelling: "Selling",
    tabConnections: "Connections",
    tabBlacklists: "Blacklists",
    tabPreferences: "Preferences",
    tabNotifications: "Notifications",
    tabBilling: "Billing",
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
    salesMethodology: "Sales methodology",
    salesMethodologyDesc:
      "Kai uses this to structure call prep and qualification.",
    methodology: "Methodology",
    methodologySaved: "Methodology saved",
    connect: "Connect",
    connected: "Connected",
    linkedInConnected: "LinkedIn connected",
    // Connections v2 — collapsible section cards.
    connProfNetwork: "Professional network",
    connProfNetworkDesc:
      "Connect your professional network so KomboAI can send messages on your behalf.",
    connCountryLabel: "Select the country you are working from",
    connProfConnection: "Professional network connection",
    connConnectAccount: "Connect your account:",
    connClaude: "Claude (MCP)",
    connBeta: "Beta",
    connClaudeDesc:
      "Connect Kombo to Claude.ai or Claude Desktop to enrich prospect lists directly from a chat. Add a custom MCP connector with the URL and token below.",
    connServerUrl: "Server URL",
    connCopy: "Copy",
    connCopied: "Server URL copied",
    connToken: "Token",
    connShow: "Show",
    connTokenHelp:
      "Each click on Show generates a fresh token. Tokens stay valid until your MCP access is revoked or the secret rotates — keep them safe.",
    connOutreach: "Outreach",
    connOutreachDesc: "Explore the Outreach tools that Kombo connects with.",
    connWhatsapp: "Whatsapp",
    connEmail: "Email",
    connCallSources: "Call sources",
    connCallSourcesDesc:
      "Connect the sources Kombo can pull call recordings from. Each source can be toggled independently.",
    connTeams: "Microsoft Teams",
    connCrm: "CRM Connection",
    connCrmDesc:
      "Explore the CRMs that Kombo connects with. Please note, you can only connect one CRM at a time.",
    connCampaignSettings: "Campaign Settings",
    connTimeZone: "Local Time Zone",
    connSettingsSaved: "Settings saved",
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
    inviteSent: "Invite sent — coming soon",
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
      "Gestiona tu cuenta, propuesta de valor, configuración de ventas y conexiones.",
    tabAccount: "Cuenta",
    tabValue: "Propuesta de valor",
    tabSelling: "Ventas",
    tabConnections: "Conexiones",
    tabBlacklists: "Listas negras",
    tabPreferences: "Preferencias",
    tabNotifications: "Notificaciones",
    tabBilling: "Facturación",
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
    salesMethodology: "Metodología de ventas",
    salesMethodologyDesc:
      "Kai la usa para estructurar la preparación de llamadas y la cualificación.",
    methodology: "Metodología",
    methodologySaved: "Metodología guardada",
    connect: "Conectar",
    connected: "Conectado",
    linkedInConnected: "LinkedIn conectado",
    // Conexiones v2 — tarjetas de sección plegables.
    connProfNetwork: "Red profesional",
    connProfNetworkDesc:
      "Conecta tu red profesional para que KomboAI pueda enviar mensajes en tu nombre.",
    connCountryLabel: "Selecciona el país desde el que trabajas",
    connProfConnection: "Conexión de la red profesional",
    connConnectAccount: "Conecta tu cuenta:",
    connClaude: "Claude (MCP)",
    connBeta: "Beta",
    connClaudeDesc:
      "Conecta Kombo con Claude.ai o Claude Desktop para enriquecer listas de prospectos directamente desde un chat. Añade un conector MCP personalizado con la URL y el token de abajo.",
    connServerUrl: "URL del servidor",
    connCopy: "Copiar",
    connCopied: "URL del servidor copiada",
    connToken: "Token",
    connShow: "Mostrar",
    connTokenHelp:
      "Cada clic en Mostrar genera un token nuevo. Los tokens siguen siendo válidos hasta que se revoque tu acceso MCP o rote el secreto — guárdalos con cuidado.",
    connOutreach: "Outreach",
    connOutreachDesc:
      "Explora las herramientas de Outreach con las que conecta Kombo.",
    connWhatsapp: "Whatsapp",
    connEmail: "Email",
    connCallSources: "Fuentes de llamadas",
    connCallSourcesDesc:
      "Conecta las fuentes de las que Kombo puede extraer grabaciones de llamadas. Cada fuente se activa de forma independiente.",
    connTeams: "Microsoft Teams",
    connCrm: "Conexión de CRM",
    connCrmDesc:
      "Explora los CRMs con los que conecta Kombo. Ten en cuenta que solo puedes conectar un CRM a la vez.",
    connCampaignSettings: "Ajustes de campaña",
    connTimeZone: "Zona horaria local",
    connSettingsSaved: "Ajustes guardados",
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
    inviteSent: "Invitación enviada — próximamente",
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
} as const

export default function Settings() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  // URL-addressable tabs: /settings?tab=billing deep-links the Billing tab.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") ?? "account"

  return (
    <Page className="max-w-3xl">
      <PageHeading title={c.title} description={c.description} />

      <Tabs
        value={tab}
        onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })}
      >
        <TabsList className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-16 z-20 mb-4 h-auto flex-wrap backdrop-blur">
          <TabsTrigger value="account">{c.tabAccount}</TabsTrigger>
          <TabsTrigger value="value">{c.tabValue}</TabsTrigger>
          <TabsTrigger value="selling">{c.tabSelling}</TabsTrigger>
          <TabsTrigger value="connections">{c.tabConnections}</TabsTrigger>
          <TabsTrigger value="blacklists">{c.tabBlacklists}</TabsTrigger>
          <TabsTrigger value="preferences">{c.tabPreferences}</TabsTrigger>
          <TabsTrigger value="notifications">{c.tabNotifications}</TabsTrigger>
          <TabsTrigger value="billing">{c.tabBilling}</TabsTrigger>
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

        {/* VALUE PROPOSITION */}
        <TabsContent value="value" className="space-y-4">
          <IcpManager />

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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.salesMethodology}</CardTitle>
              <CardDescription>{c.salesMethodologyDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{c.methodology}</Label>
                <Select defaultValue="MEDDIC">
                  <SelectTrigger className="w-full sm:w-72">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALES_METHODOLOGIES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success(c.methodologySaved)}>
                  {c.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONNECTIONS */}
        <TabsContent value="connections" className="space-y-4">
          <ConnectionsTab />
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

        {/* BILLING */}
        <TabsContent value="billing" className="space-y-4">
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

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{c.teamSeats}</CardTitle>
                <CardDescription>
                  {c.seatsUsed(team.length, team.length)}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(c.inviteSent)}
              >
                {c.inviteMember}
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2"
                >
                  <Avatar className="size-8">
                    <AvatarFallback
                      style={{ backgroundColor: member.avatarColor, color: "white" }}
                      className="text-xs"
                    >
                      {initials(
                        member.name.split(" ")[0],
                        member.name.split(" ")[1]
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {member.email}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-normal">
                    {member.role}
                  </Badge>
                </div>
              ))}
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

/* ---------------------- Connections (collapsible cards) ---------------------- */

// A card whose body collapses behind an icon + title header and a chevron.
function CollapsibleSection({
  icon,
  title,
  description,
  badge,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <Card>
      <CardHeader className="p-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="hover:bg-muted/40 flex w-full items-start gap-3 rounded-t-xl px-6 py-4 text-left transition-colors"
        >
          <span className="bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
            {icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <CardTitle className="text-base">{title}</CardTitle>
              {badge}
            </span>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </span>
          <ChevronDown
            className={cn(
              "text-muted-foreground mt-1 size-5 shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CardHeader>
      {open && <CardContent className="space-y-4">{children}</CardContent>}
    </Card>
  )
}

function ConnectionsTab() {
  const { locale } = useLocale()
  const c = COPY[locale]

  const [country, setCountry] = React.useState<string>(CONNECTION_COUNTRIES[0])
  const [linkedInConnected, setLinkedInConnected] = React.useState(false)

  // MCP token — generated only on click (never during render) from a counter,
  // so the react-compiler lint stays happy (no Math.random/Date.now in render).
  const tokenCounter = React.useRef(0)
  const [token, setToken] = React.useState<string | null>(null)
  function revealToken() {
    tokenCounter.current += 1
    const seed = (tokenCounter.current * 2654435761) >>> 0
    const next = `kb_mcp_${seed.toString(36)}${(seed ^ 0x9e3779b9).toString(36)}`
    setToken(next)
  }

  const [whatsapp, setWhatsapp] = React.useState(true)
  const [email, setEmail] = React.useState(true)
  const [teams, setTeams] = React.useState(true)
  // Single-select CRM (radio-like): turning one on turns the others off.
  const [crm, setCrm] = React.useState<string>("Hubspot")
  const [timeZone, setTimeZone] = React.useState<string>(TIME_ZONES[0])

  return (
    <>
      {/* 1. Professional network */}
      <CollapsibleSection
        icon={<LinkedinIcon className="size-5 text-[#0a66c2]" />}
        title={c.connProfNetwork}
        description={c.connProfNetworkDesc}
      >
        <div className="space-y-2">
          <Label>{c.connCountryLabel}</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONNECTION_COUNTRIES.map((co) => (
                <SelectItem key={co} value={co}>
                  {co}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">{c.connProfConnection}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">
              {c.connConnectAccount}
            </span>
            {linkedInConnected ? (
              <Badge variant="success" className="gap-1">
                <Check className="size-3" />
                {c.connected}
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="volt"
                onClick={() => {
                  setLinkedInConnected(true)
                  toast.success(c.linkedInConnected)
                }}
              >
                {c.connect}
              </Button>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. Claude (MCP) — Beta */}
      <CollapsibleSection
        icon={<Server className="text-primary size-5" />}
        title={c.connClaude}
        description={c.connClaudeDesc}
        badge={
          <Badge variant="outline" className="border-chart-4/40 text-chart-4">
            {c.connBeta}
          </Badge>
        }
      >
        <div className="space-y-2">
          <Label>{c.connServerUrl}</Label>
          <div className="flex gap-2">
            <Input readOnly value={MCP_SERVER_URL} className="font-mono text-xs" />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(MCP_SERVER_URL)
                toast.success(c.connCopied)
              }}
            >
              <Copy className="size-4" />
              {c.connCopy}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{c.connToken}</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={token ?? "••••••••••••••••••••••••"}
              className="font-mono text-xs"
            />
            <Button variant="outline" onClick={revealToken}>
              <Eye className="size-4" />
              {c.connShow}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">{c.connTokenHelp}</p>
        </div>
      </CollapsibleSection>

      {/* 3. Outreach */}
      <CollapsibleSection
        icon={<MessageCircle className="text-primary size-5" />}
        title={c.connOutreach}
        description={c.connOutreachDesc}
      >
        <ConnectionToggleRow
          icon={<MessageCircle className="size-5 text-emerald-600" />}
          label={c.connWhatsapp}
          checked={whatsapp}
          onChange={setWhatsapp}
        />
        <ConnectionToggleRow
          icon={<Mail className="text-muted-foreground size-5" />}
          label={c.connEmail}
          checked={email}
          onChange={setEmail}
        />
      </CollapsibleSection>

      {/* 4. Call sources */}
      <CollapsibleSection
        icon={<Video className="text-primary size-5" />}
        title={c.connCallSources}
        description={c.connCallSourcesDesc}
      >
        <ConnectionToggleRow
          icon={<Video className="size-5 text-[#4b53bc]" />}
          label={c.connTeams}
          checked={teams}
          onChange={setTeams}
        />
      </CollapsibleSection>

      {/* 5. CRM Connection — single-select */}
      <CollapsibleSection
        icon={<Building2 className="text-primary size-5" />}
        title={c.connCrm}
        description={c.connCrmDesc}
      >
        {CRM_OPTIONS.map((name) => (
          <ConnectionToggleRow
            key={name}
            icon={<Building2 className="text-muted-foreground size-5" />}
            label={name}
            checked={crm === name}
            // Radio-like: selecting one deselects the rest.
            onChange={(on) => setCrm(on ? name : "")}
          />
        ))}
      </CollapsibleSection>

      {/* 6. Campaign Settings */}
      <CollapsibleSection
        icon={<Clock className="text-primary size-5" />}
        title={c.connCampaignSettings}
      >
        <div className="space-y-2">
          <Label>{c.connTimeZone}</Label>
          <Select value={timeZone} onValueChange={setTimeZone}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_ZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast.success(c.connSettingsSaved)}>
            {c.save}
          </Button>
        </div>
      </CollapsibleSection>
    </>
  )
}

function ConnectionToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
      <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{label}</p>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
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
