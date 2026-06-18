import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Check,
  Monitor,
  Moon,
  Sun,
  Plus,
  Trash2,
  ExternalLink,
  Building2,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth"
import { team } from "@/lib/team"
import { initials } from "@/lib/format"
import {
  SALES_METHODOLOGIES,
  blacklistedCompanies as seedBlacklist,
  type BlacklistedCompany,
} from "@/lib/mock-settings"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const

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
    smartUploads: "Smart uploads",
    smartUploadsDesc: "How Kombo processes prospect lists you import.",
    autoEnrich: "Auto-enrich on upload",
    autoEnrichDesc: "Append 30 data points to every imported prospect.",
    autoAssign: "Auto-assign to a list",
    autoAssignDesc: "Group each upload into a new list automatically.",
    skipDuplicates: "Skip duplicates",
    skipDuplicatesDesc: "Ignore prospects already in your workspace.",
    uploadSaved: "Upload settings saved",
    icp: "Ideal Customer Profile",
    icpDesc: "Kombo uses this to score and recommend prospects.",
    targetIndustry: "Target industry",
    companySize: "Company size",
    targetTitles: "Target titles",
    icpSaved: "ICP saved",
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
    connections: "Connections",
    connectionsDesc: "Link the networks and systems Kombo works across.",
    professionalNetwork: "Professional network",
    new: "New",
    connectLinkedInDesc: "Connect LinkedIn to enrich and message in-app.",
    connect: "Connect",
    linkedInConnected: "LinkedIn connected",
    crmHubspot: "CRM (HubSpot)",
    crmHubspotDesc: "Two-way sync of contacts, activities, and deals.",
    connected: "Connected",
    manageAllIntegrations: "Manage all integrations",
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
    icp: "Perfil de cliente ideal",
    icpDesc: "Kombo lo usa para puntuar y recomendar prospectos.",
    targetIndustry: "Sector objetivo",
    companySize: "Tamaño de empresa",
    targetTitles: "Cargos objetivo",
    icpSaved: "Perfil de cliente ideal guardado",
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
    connections: "Conexiones",
    connectionsDesc:
      "Vincula las redes y sistemas con los que trabaja Kombo.",
    professionalNetwork: "Red profesional",
    new: "Nuevo",
    connectLinkedInDesc:
      "Conecta LinkedIn para enriquecer y enviar mensajes en la app.",
    connect: "Conectar",
    linkedInConnected: "LinkedIn conectado",
    crmHubspot: "CRM (HubSpot)",
    crmHubspotDesc:
      "Sincronización bidireccional de contactos, actividades y negocios.",
    connected: "Conectado",
    manageAllIntegrations: "Gestionar todas las integraciones",
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
  },
} as const

export default function Settings() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <Page className="max-w-3xl">
      <PageHeading title={c.title} description={c.description} />

      <Tabs defaultValue="account">
        <TabsList className="mb-4 h-auto flex-wrap">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.profileDetails}</CardTitle>
              <CardDescription>{c.profileDetailsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label={c.fullName} value={user?.name} />
                <Field
                  id="email"
                  label={c.email}
                  type="email"
                  value={user?.email}
                />
                <Field id="role" label={c.role} value={user?.role} />
                <Field id="company" label={c.company} value={user?.company} />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success(c.profileSaved)}>
                  {c.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.icp}</CardTitle>
              <CardDescription>{c.icpDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="icp-industry"
                  label={c.targetIndustry}
                  value="B2B SaaS"
                />
                <Field
                  id="icp-size"
                  label={c.companySize}
                  value="50–1000 employees"
                />
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="icp-titles">{c.targetTitles}</Label>
                  <Input
                    id="icp-titles"
                    defaultValue="VP Sales, CRO, Head of RevOps"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success(c.icpSaved)}>
                  {c.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.connections}</CardTitle>
              <CardDescription>{c.connectionsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center gap-3 rounded-md px-2 py-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#0a66c2]/10">
                  <LinkedinIcon className="size-5 text-[#0a66c2]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {c.professionalNetwork}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-chart-4/40 text-chart-4"
                    >
                      {c.new}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {c.connectLinkedInDesc}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="volt"
                  onClick={() => toast.success(c.linkedInConnected)}
                >
                  {c.connect}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center gap-3 rounded-md px-2 py-3">
                <span className="bg-muted flex size-9 items-center justify-center rounded-lg">
                  <Building2 className="text-muted-foreground size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.crmHubspot}</p>
                  <p className="text-muted-foreground text-xs">
                    {c.crmHubspotDesc}
                  </p>
                </div>
                <Badge variant="success" className="gap-1">
                  <Check className="size-3" />
                  {c.connected}
                </Badge>
              </div>
              <Separator />
              <div className="px-2 pt-2">
                <Button variant="link" asChild className="h-auto px-0">
                  <Link to="/integrations">
                    {c.manageAllIntegrations}
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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

function Field({
  id,
  label,
  value,
  type,
}: {
  id: string
  label: string
  value?: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} defaultValue={value} />
    </div>
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

function BlacklistCard() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [items, setItems] = React.useState<BlacklistedCompany[]>(seedBlacklist)
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const idRef = React.useRef(0)

  function add() {
    if (!name.trim() || !domain.trim()) return
    idRef.current += 1
    setItems((prev) => [
      ...prev,
      {
        id: `bl_new_${idRef.current}`,
        name: name.trim(),
        domain: domain.trim(),
        reason: "Manual",
      },
    ])
    setName("")
    setDomain("")
    toast.success(c.companyBlacklisted)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.blacklistedCompanies}</CardTitle>
        <CardDescription>{c.blacklistedCompaniesDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          {items.map((company) => (
            <div
              key={company.id}
              className="flex items-center gap-3 rounded-md px-2 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{company.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {company.domain}
                </p>
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
                  setItems((prev) => prev.filter((x) => x.id !== company.id))
                  toast.info(c.companyRemoved(company.name))
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Separator />
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
