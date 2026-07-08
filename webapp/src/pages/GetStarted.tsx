import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Building2,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Plus,
  Target,
  Trash2,
  Users,
  Search,
  Send,
  Inbox,
  Mail,
  CheckSquare,
  Briefcase,
  GraduationCap,
  BarChart3,
  Puzzle,
  Plug,
  FolderKanban,
  Sparkles,
  ArrowRight,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSetup, type SetupTaskId } from "@/lib/setup"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS = [
  "VP of Sales",
  "Head of Sales",
  "RevOps",
  "Account Executive",
  "SDR / BDR",
]

interface ChecklistTask {
  id: SetupTaskId
  icon: React.ComponentType<{ className?: string }>
}

const CHECKLIST: ChecklistTask[] = [
  { id: "crm", icon: Building2 },
  { id: "linkedin", icon: LinkedinIcon },
  { id: "team", icon: Users },
  { id: "profile", icon: Target },
  { id: "links", icon: LinkIcon },
]

// The product's capabilities, surfaced as an "explore what you can do" grid —
// each tile deep-links into the feature so onboarding doubles as a tour.
interface Capability {
  key: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}

const CAPABILITIES: Capability[] = [
  { key: "search", to: "/search", icon: Search, tint: "bg-primary/10 text-primary" },
  { key: "lists", to: "/lists", icon: FolderKanban, tint: "bg-chart-3/15 text-chart-3" },
  { key: "enrich", to: "/people", icon: Sparkles, tint: "bg-chart-5/15 text-chart-5" },
  { key: "campaigns", to: "/campaigns", icon: Send, tint: "bg-primary/10 text-primary" },
  { key: "inbox", to: "/inbox", icon: Inbox, tint: "bg-chart-1/15 text-chart-1" },
  { key: "templates", to: "/templates", icon: Mail, tint: "bg-chart-4/15 text-chart-4" },
  { key: "tasks", to: "/tasks", icon: CheckSquare, tint: "bg-chart-3/15 text-chart-3" },
  { key: "deals", to: "/deals", icon: Briefcase, tint: "bg-primary/10 text-primary" },
  { key: "coach", to: "/coach", icon: GraduationCap, tint: "bg-chart-5/15 text-chart-5" },
  { key: "analytics", to: "/analytics", icon: BarChart3, tint: "bg-chart-1/15 text-chart-1" },
  { key: "extension", to: "/extension", icon: Puzzle, tint: "bg-chart-4/15 text-chart-4" },
  { key: "integrations", to: "/integrations", icon: Plug, tint: "bg-chart-3/15 text-chart-3" },
]

const COPY = {
  en: {
    title: "Get started",
    description:
      "Finish setting up your workspace to get the most out of Kombo.",
    guidedTitle: "New here? Take the guided setup",
    guidedDesc:
      "A 2-minute walkthrough to tailor Kombo to your team, CRM, and tools.",
    guidedCta: "Start onboarding",
    saved: "Saved",
    linkAdded: "Link added",
    completeCount: (done: number, total: number) =>
      `${done} of ${total} complete`,
    allSet: "You're all set 🎉",
    exploreTitle: "Explore Kombo",
    exploreDesc: "Everything you can do — jump in and try a capability.",
    open: "Open",
    features: {
      search: {
        title: "Find Prospects",
        description:
          "Find your ideal customers with AI across millions of prospects & companies.",
      },
      lists: {
        title: "Lists & segments",
        description:
          "Group prospects and accounts into lists you can enrich and enroll.",
      },
      enrich: {
        title: "Data enrichment",
        description: "Reveal verified emails and direct dials for any contact.",
      },
      campaigns: {
        title: "Sequences & campaigns",
        description:
          "Run multi-step outreach across email and LinkedIn that auto-pauses on a reply.",
      },
      inbox: {
        title: "Unified inbox",
        description:
          "Reply to every channel in one place, with AI-drafted responses.",
      },
      templates: {
        title: "Message templates",
        description: "Save your best-performing copy and personalize it at scale.",
      },
      tasks: {
        title: "Tasks",
        description: "Stay on top of every follow-up — in-app or offline.",
      },
      deals: {
        title: "Pipeline & deals",
        description: "Track prospects from interested to won across outcome stages.",
      },
      coach: {
        title: "Call coaching",
        description: "Score calls and get actionable coaching to win more deals.",
      },
      analytics: {
        title: "Analytics",
        description: "Measure outreach performance and double down on what works.",
      },
      extension: {
        title: "Chrome extension",
        description: "Prospect and enrich directly on LinkedIn and any website.",
      },
      integrations: {
        title: "CRM & integrations",
        description: "Sync two-way with HubSpot, Salesforce, and your stack.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Setup checklist",
    setupChecklistDesc: "Knock these out to unlock the full Kombo experience.",
    roleGoals: "Your role & goals",
    roleGoalsDesc: "We use this to tailor your dashboards and AI suggestions.",
    role: "Role",
    selectRole: "Select your role",
    goals: "Goals",
    goalsPlaceholder:
      "e.g. Book 30 qualified meetings/month, grow pipeline 2x",
    save: "Save",
    quickLinks: "Quick links",
    quickLinksDesc: "Pin the tools and resources you reach for most.",
    removeLink: (label: string) => `Remove ${label}`,
    label: "Label",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://example.com",
    addLink: "Add link",
    linkedInConnected: "LinkedIn connected",
    connected: "Connected",
    connect: "Connect",
    done: "Done",
    inviteTeam: "Invite team",
    markDone: "Mark done",
    tasks: {
      crm: {
        title: "Connect your CRM",
        description: "Sync prospects, activities, and deals two-way.",
      },
      linkedin: {
        title: "Connect LinkedIn",
        description: "Enrich profiles and send outreach from Kombo.",
      },
      team: {
        title: "Invite your team",
        description: "Collaborate on pipeline and share templates.",
      },
      profile: {
        title: "Set your role & goals",
        description: "Tailor dashboards and AI recommendations.",
      },
      links: {
        title: "Add quick links",
        description: "Pin the tools you use every day.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
  es: {
    title: "Primeros pasos",
    description:
      "Termina de configurar tu espacio de trabajo para sacarle el máximo partido a Kombo.",
    guidedTitle: "¿Nuevo por aquí? Haz la configuración guiada",
    guidedDesc:
      "Un recorrido de 2 minutos para adaptar Kombo a tu equipo, CRM y herramientas.",
    guidedCta: "Empezar onboarding",
    saved: "Guardado",
    linkAdded: "Enlace añadido",
    completeCount: (done: number, total: number) =>
      `${done} de ${total} completados`,
    allSet: "¡Todo listo! 🎉",
    exploreTitle: "Explora Kombo",
    exploreDesc: "Todo lo que puedes hacer — entra y prueba una capacidad.",
    open: "Abrir",
    features: {
      search: {
        title: "Buscar prospectos",
        description:
          "Encuentra a tus clientes ideales con IA entre millones de prospectos y empresas.",
      },
      lists: {
        title: "Listas y segmentos",
        description:
          "Agrupa prospectos y cuentas en listas que puedes enriquecer e inscribir.",
      },
      enrich: {
        title: "Enriquecimiento de datos",
        description: "Revela correos verificados y teléfonos directos de cualquier contacto.",
      },
      campaigns: {
        title: "Secuencias y campañas",
        description:
          "Lanza outreach multipaso por correo y LinkedIn que se pausa al recibir respuesta.",
      },
      inbox: {
        title: "Bandeja unificada",
        description:
          "Responde a todos los canales en un solo lugar, con respuestas redactadas por IA.",
      },
      templates: {
        title: "Plantillas de mensajes",
        description: "Guarda tus textos de mayor rendimiento y personalízalos a escala.",
      },
      tasks: {
        title: "Tareas",
        description: "Mantén el control de cada seguimiento — en la app o fuera de ella.",
      },
      deals: {
        title: "Pipeline y negocios",
        description: "Sigue a los prospectos desde interesado hasta ganado por etapas.",
      },
      coach: {
        title: "Coaching de llamadas",
        description: "Evalúa llamadas y recibe coaching accionable para cerrar más.",
      },
      analytics: {
        title: "Analítica",
        description: "Mide el rendimiento del outreach y potencia lo que funciona.",
      },
      extension: {
        title: "Extensión de Chrome",
        description: "Prospecta y enriquece directamente en LinkedIn y cualquier web.",
      },
      integrations: {
        title: "CRM e integraciones",
        description: "Sincroniza en ambos sentidos con HubSpot, Salesforce y tu stack.",
      },
    } as Record<string, { title: string; description: string }>,
    setupChecklist: "Lista de configuración",
    setupChecklistDesc:
      "Complétalos para desbloquear toda la experiencia de Kombo.",
    roleGoals: "Tu rol y objetivos",
    roleGoalsDesc:
      "Lo usamos para personalizar tus paneles y las sugerencias de IA.",
    role: "Rol",
    selectRole: "Selecciona tu rol",
    goals: "Objetivos",
    goalsPlaceholder:
      "p. ej. Agendar 30 reuniones cualificadas al mes, duplicar el pipeline",
    save: "Guardar",
    quickLinks: "Enlaces rápidos",
    quickLinksDesc: "Fija las herramientas y recursos que más utilizas.",
    removeLink: (label: string) => `Eliminar ${label}`,
    label: "Etiqueta",
    labelPlaceholder: "LinkedIn Sales Navigator",
    url: "URL",
    urlPlaceholder: "https://ejemplo.com",
    addLink: "Añadir enlace",
    linkedInConnected: "LinkedIn conectado",
    connected: "Conectado",
    connect: "Conectar",
    done: "Hecho",
    inviteTeam: "Invitar al equipo",
    markDone: "Marcar como hecho",
    tasks: {
      crm: {
        title: "Conecta tu CRM",
        description: "Sincroniza prospectos, actividades y negocios en ambos sentidos.",
      },
      linkedin: {
        title: "Conecta LinkedIn",
        description: "Enriquece perfiles y envía outreach desde Kombo.",
      },
      team: {
        title: "Invita a tu equipo",
        description: "Colabora en el pipeline y comparte plantillas.",
      },
      profile: {
        title: "Define tu rol y objetivos",
        description: "Personaliza los paneles y las recomendaciones de IA.",
      },
      links: {
        title: "Añade enlaces rápidos",
        description: "Fija las herramientas que usas cada día.",
      },
    } as Record<SetupTaskId, { title: string; description: string }>,
  },
} as const

export default function GetStarted() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const setup = useSetup()
  const completedCount = setup.completed.size
  const allDone = setup.progress === 100

  const [role, setRole] = React.useState(setup.role)
  const [goals, setGoals] = React.useState(setup.goals)
  const [linkLabel, setLinkLabel] = React.useState("")
  const [linkUrl, setLinkUrl] = React.useState("")

  function handleSaveProfile() {
    setup.setProfile(role, goals)
    toast.success(c.saved)
  }

  function handleAddLink() {
    const label = linkLabel.trim()
    const url = linkUrl.trim()
    if (!label || !url) return
    setup.addQuickLink(label, url)
    setLinkLabel("")
    setLinkUrl("")
    toast.success(c.linkAdded)
  }

  return (
    <Page className="max-w-3xl">
      <PageHeading title={c.title} description={c.description} />

      <div className="space-y-4">
        {/* Guided onboarding entry point */}
        <Card className="from-primary/10 border-primary/20 bg-gradient-to-r to-transparent">
          <CardContent className="flex flex-wrap items-center gap-4 py-1">
            <span className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.guidedTitle}</p>
              <p className="text-muted-foreground text-sm">{c.guidedDesc}</p>
            </div>
            <Button variant="volt" asChild>
              <Link to="/onboarding">
                {c.guidedCta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {c.completeCount(completedCount, CHECKLIST.length)}
                </CardTitle>
                {allDone && <CardDescription>{c.allSet}</CardDescription>}
              </div>
              <span className="text-2xl font-semibold tabular-nums">
                {setup.progress}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={setup.progress} />
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.setupChecklist}</CardTitle>
            <CardDescription>{c.setupChecklistDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {CHECKLIST.map((task, i) => {
              const done = setup.isDone(task.id)
              const Icon = task.icon
              return (
                <React.Fragment key={task.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center gap-4 py-3">
                    <button
                      type="button"
                      aria-label={c.markDone}
                      aria-pressed={done}
                      onClick={() => setup.toggle(task.id)}
                      className="shrink-0 rounded-full"
                    >
                      {done ? (
                        <CheckCircle2 className="text-chart-1 size-5" />
                      ) : (
                        <Circle className="text-muted-foreground hover:text-foreground size-5 transition-colors" />
                      )}
                    </button>
                    <Icon className="text-muted-foreground size-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          done && "text-muted-foreground line-through"
                        )}
                      >
                        {c.tasks[task.id].title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {c.tasks[task.id].description}
                      </p>
                    </div>
                    <TaskAction task={task} done={done} setup={setup} />
                  </div>
                </React.Fragment>
              )
            })}
          </CardContent>
        </Card>

        {/* Explore features & capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.exploreTitle}</CardTitle>
            <CardDescription>{c.exploreDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((cap) => {
                const Icon = cap.icon
                const f = c.features[cap.key]
                return (
                  <Link
                    key={cap.key}
                    to={cap.to}
                    className="group hover:border-primary/40 hover:bg-muted/40 focus-visible:border-primary/40 focus-visible:ring-ring/50 flex flex-col gap-2 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-[3px]"
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg",
                        cap.tint
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-sm font-medium">
                      {f.title}
                      <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {f.description}
                    </span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role & goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.roleGoals}</CardTitle>
            <CardDescription>{c.roleGoalsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">{c.role}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder={c.selectRole} />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">{c.goals}</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder={c.goalsPlaceholder}
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>{c.save}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{c.quickLinks}</CardTitle>
            <CardDescription>{c.quickLinksDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setup.quickLinks.length > 0 && (
              <div className="space-y-1">
                {setup.quickLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <LinkIcon className="text-muted-foreground size-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {link.label}
                      </a>
                      <p className="text-muted-foreground truncate text-xs">
                        {link.url}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.removeLink(link.label)}
                      onClick={() => setup.removeQuickLink(link.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="link-label">{c.label}</Label>
                <Input
                  id="link-label"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder={c.labelPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">{c.url}</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={c.urlPlaceholder}
                />
              </div>
              <Button
                onClick={handleAddLink}
                disabled={!linkLabel.trim() || !linkUrl.trim()}
              >
                <Plus className="size-4" />
                {c.addLink}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}

function TaskAction({
  task,
  done,
  setup,
}: {
  task: ChecklistTask
  done: boolean
  setup: ReturnType<typeof useSetup>
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  if (task.id === "crm") {
    return done ? (
      <Badge variant="success" className="font-normal">
        {c.connected}
      </Badge>
    ) : (
      <Button asChild size="sm" variant="outline">
        <Link to="/integrations">{c.connect}</Link>
      </Button>
    )
  }

  if (task.id === "linkedin") {
    return done ? (
      <Badge variant="success" className="font-normal">
        {c.connected}
      </Badge>
    ) : (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setup.complete("linkedin")
          toast.success(c.linkedInConnected)
        }}
      >
        {c.connect}
      </Button>
    )
  }

  if (task.id === "team") {
    return done ? (
      <Badge variant="success" className="font-normal">
        {c.done}
      </Badge>
    ) : (
      <Button asChild size="sm" variant="outline">
        <Link to="/team">{c.inviteTeam}</Link>
      </Button>
    )
  }

  // profile + links are completed via their editor cards below.
  return done ? (
    <Badge variant="success" className="font-normal">
      {c.done}
    </Badge>
  ) : (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setup.complete(task.id)}
    >
      {c.markDone}
    </Button>
  )
}
