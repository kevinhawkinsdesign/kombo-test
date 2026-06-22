import * as React from "react"
import { toast } from "sonner"
import {
  Puzzle,
  Mail,
  Calendar,
  Database,
  Globe,
  Search,
  Sparkles,
  Save,
  Check,
  ArrowRight,
  Star,
  Mic,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { cn } from "@/lib/utils"

const STORE_URL =
  "https://chromewebstore.google.com/detail/kombo-prepare-your-first/djcmkdkjdchgplhaadeffehffgjcbohe"
const RECORDER_URL =
  "https://chromewebstore.google.com/detail/komboai-recorder/fkocennpfikhfaikkgjdfbaoeaniccla"

type TabId = "linkedin" | "gmail" | "calendar" | "crm" | "everywhere"

const COPY = {
  en: {
    title: "Kombo for Chrome",
    description: "Prospect, research, and engage anywhere you already work.",
    eyebrow: "Build pipeline from anywhere",
    heroTitle: "Bring Kombo everywhere you sell",
    heroBody:
      "Pin the Kombo extension and get AI-scored prospect intelligence, verified contact data, and one-click outreach right inside LinkedIn, Gmail, your calendar, and your CRM — without switching tabs.",
    addToChrome: "Add to Chrome — it's free",
    rating: "4.8 on the Chrome Web Store",
    howItWorks: "How it works",
    tabsLabel: "Works where you do",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Calendar",
      crm: "CRM",
      everywhere: "Everywhere",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn & Sales Navigator",
        heading: "Turn any profile into a scored prospect",
        body: "Open the Kombo panel on any LinkedIn profile to see fit score, verified email and direct dial, and the buying signals that matter — then save to a list or start a sequence in one click.",
        cta: "Try it on LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personalize and track from your inbox",
        body: "Pull contact and company insights into the compose window, drop in templates, and track opens, clicks, and replies without leaving Gmail.",
        cta: "Try it in Gmail",
      },
      calendar: {
        eyebrow: "Google Calendar",
        heading: "Walk into every meeting prepared",
        body: "Research your meeting guests with company insights, recent signals, and talking points — surfaced automatically next to each calendar event.",
        cta: "Try it on Calendar",
      },
      crm: {
        eyebrow: "Salesforce & HubSpot",
        heading: "Keep your CRM clean automatically",
        body: "Save contacts and enriched company data straight to your CRM, with activity synced so you cut manual data entry and keep one source of truth.",
        cta: "Connect your CRM",
      },
      everywhere: {
        eyebrow: "Kombo Everywhere",
        heading: "Find new leads on any website",
        body: "Turn any company website into opportunities as you browse — save contacts while you read detailed overviews, insights, and current employees.",
        cta: "Try it on any website",
      },
    },
    panelName: "Kombo",
    match: "Excellent match",
    about: "About",
    aboutBody:
      "Fever is a Madrid-based live-entertainment marketplace. Recently hired 5 SDRs and posted about scaling outbound.",
    save: "Save to list",
    saved: "Saved to list",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1,000 employees",
    dataRevenue: "$100M–$250M revenue",
    benefitsTitle: "Why reps pin Kombo",
    benefits: [
      {
        title: "Prospect in context",
        body: "Score and qualify the person you're already looking at — no copy-pasting between tabs.",
      },
      {
        title: "Verified data on tap",
        body: "Work emails and direct dials enriched with ~30 data points, the moment you need them.",
      },
      {
        title: "One-click to outreach",
        body: "Save to a list or drop straight into a multi-channel sequence without leaving the page.",
      },
    ],
    recorderEyebrow: "Also from Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Record and transcribe your sales calls across Google Meet, Zoom, and Teams — then get AI coaching scorecards and next steps automatically.",
    recorderPoints: [
      "Auto-join & record meetings",
      "Transcripts + AI call scorecards",
      "Next steps synced to your CRM",
    ],
    addRecorder: "Add Recorder to Chrome",
    ctaTitle: "Add Kombo to Chrome",
    ctaBody: "Install in seconds, pin it to your toolbar, and start building pipeline from anywhere.",
    installToast: "Opening the Chrome Web Store…",
    permanentEverywhere: "Pin Kombo so it's always one click away.",
  },
  es: {
    title: "Kombo para Chrome",
    description: "Prospecta, investiga e interactúa donde ya trabajas.",
    eyebrow: "Construye pipeline desde cualquier lugar",
    heroTitle: "Lleva Kombo a todas partes donde vendes",
    heroBody:
      "Ancla la extensión de Kombo y obtén inteligencia de prospectos puntuada por IA, datos de contacto verificados y contacto en un clic dentro de LinkedIn, Gmail, tu calendario y tu CRM — sin cambiar de pestaña.",
    addToChrome: "Añadir a Chrome — es gratis",
    rating: "4.8 en la Chrome Web Store",
    howItWorks: "Cómo funciona",
    tabsLabel: "Funciona donde trabajas",
    tabs: {
      linkedin: "LinkedIn",
      gmail: "Gmail",
      calendar: "Calendario",
      crm: "CRM",
      everywhere: "En todas partes",
    },
    scenes: {
      linkedin: {
        eyebrow: "LinkedIn y Sales Navigator",
        heading: "Convierte cualquier perfil en un prospecto puntuado",
        body: "Abre el panel de Kombo en cualquier perfil de LinkedIn para ver el encaje, el email verificado y el teléfono directo, y las señales de compra que importan — y guárdalo en una lista o inicia una secuencia en un clic.",
        cta: "Pruébalo en LinkedIn",
      },
      gmail: {
        eyebrow: "Gmail",
        heading: "Personaliza y haz seguimiento desde tu bandeja",
        body: "Trae datos de contacto y empresa a la ventana de redacción, inserta plantillas y haz seguimiento de aperturas, clics y respuestas sin salir de Gmail.",
        cta: "Pruébalo en Gmail",
      },
      calendar: {
        eyebrow: "Google Calendar",
        heading: "Llega preparado a cada reunión",
        body: "Investiga a los invitados con información de empresa, señales recientes y puntos de conversación — junto a cada evento del calendario.",
        cta: "Pruébalo en el calendario",
      },
      crm: {
        eyebrow: "Salesforce y HubSpot",
        heading: "Mantén tu CRM limpio automáticamente",
        body: "Guarda contactos y datos enriquecidos directamente en tu CRM, con la actividad sincronizada para reducir la entrada manual de datos.",
        cta: "Conecta tu CRM",
      },
      everywhere: {
        eyebrow: "Kombo en todas partes",
        heading: "Encuentra nuevos leads en cualquier web",
        body: "Convierte cualquier web de empresa en oportunidades mientras navegas — guarda contactos mientras lees descripciones, señales y empleados actuales.",
        cta: "Pruébalo en cualquier web",
      },
    },
    panelName: "Kombo",
    match: "Encaje excelente",
    about: "Acerca de",
    aboutBody:
      "Fever es un marketplace de entretenimiento en vivo con sede en Madrid. Contrató 5 SDRs y publicó sobre escalar su outbound.",
    save: "Guardar en lista",
    saved: "Guardado en la lista",
    dataLocation: "Madrid, ES",
    dataEmployees: "500–1.000 empleados",
    dataRevenue: "$100M–$250M de ingresos",
    benefitsTitle: "Por qué los comerciales anclan Kombo",
    benefits: [
      {
        title: "Prospecta en contexto",
        body: "Puntúa y cualifica a la persona que ya estás mirando — sin copiar y pegar entre pestañas.",
      },
      {
        title: "Datos verificados al instante",
        body: "Emails de trabajo y teléfonos directos enriquecidos con ~30 datos, justo cuando los necesitas.",
      },
      {
        title: "Contacto en un clic",
        body: "Guarda en una lista o entra directo en una secuencia multicanal sin salir de la página.",
      },
    ],
    recorderEyebrow: "También de Kombo",
    recorderTitle: "Kombo Recorder",
    recorderBody:
      "Graba y transcribe tus llamadas de ventas en Google Meet, Zoom y Teams — y obtén scorecards de coaching con IA y próximos pasos automáticamente.",
    recorderPoints: [
      "Se une y graba reuniones automáticamente",
      "Transcripciones + scorecards de llamada con IA",
      "Próximos pasos sincronizados con tu CRM",
    ],
    addRecorder: "Añadir Recorder a Chrome",
    ctaTitle: "Añade Kombo a Chrome",
    ctaBody: "Instálalo en segundos, ánclalo a tu barra y empieza a construir pipeline desde cualquier lugar.",
    installToast: "Abriendo la Chrome Web Store…",
    permanentEverywhere: "Ancla Kombo para tenerlo siempre a un clic.",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

const TABS: { id: TabId; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "linkedin", icon: LinkedinIcon },
  { id: "gmail", icon: Mail },
  { id: "calendar", icon: Calendar },
  { id: "crm", icon: Database },
  { id: "everywhere", icon: Globe },
]

export default function Extension() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [tab, setTab] = React.useState<TabId>("linkedin")
  const scene = c.scenes[tab]

  function install() {
    toast.success(c.installToast)
    window.open(STORE_URL, "_blank", "noreferrer")
  }
  function installRecorder() {
    toast.success(c.installToast)
    window.open(RECORDER_URL, "_blank", "noreferrer")
  }

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />

      {/* Hero */}
      <Card className="from-primary/[0.06] to-card mb-8 items-center gap-6 overflow-hidden bg-gradient-to-br p-8 text-center md:p-12">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {c.eyebrow}
        </p>
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {c.heroTitle}
        </h2>
        <p className="text-muted-foreground max-w-2xl text-pretty">{c.heroBody}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button variant="volt" size="lg" onClick={install}>
            <Puzzle className="size-4" />
            {c.addToChrome}
          </Button>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
            <Star className="size-4 fill-chart-4 text-chart-4" />
            {c.rating}
          </span>
        </div>
      </Card>

      {/* Platform tabs */}
      <p className="text-muted-foreground mb-3 text-center text-sm font-medium tracking-wide uppercase">
        {c.tabsLabel}
      </p>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "border-primary bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
            {c.tabs[id]}
          </button>
        ))}
      </div>

      {/* Feature scene */}
      <Card className="mb-8 grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
        <div className="space-y-4">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            {scene.eyebrow}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight">{scene.heading}</h3>
          <p className="text-muted-foreground text-pretty">{scene.body}</p>
          <Button variant="secondary" onClick={install}>
            {scene.cta}
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <ExtensionMock c={c} tab={tab} />
      </Card>

      {/* Benefits */}
      <h3 className="mb-4 text-center text-lg font-semibold">{c.benefitsTitle}</h3>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {c.benefits.map((b, i) => {
          const Icon = [Search, Sparkles, Save][i]
          return (
            <Card key={b.title} className="gap-2 p-5">
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <Icon className="size-4" />
              </span>
              <p className="mt-1 font-semibold">{b.title}</p>
              <p className="text-muted-foreground text-sm">{b.body}</p>
            </Card>
          )
        })}
      </div>

      {/* Second extension: Recorder */}
      <Card className="mb-8 grid items-center gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
        <div className="space-y-3">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            {c.recorderEyebrow}
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-chart-5/15 text-chart-5 flex size-9 items-center justify-center rounded-lg">
              <Mic className="size-5" />
            </span>
            <h3 className="text-xl font-semibold tracking-tight">{c.recorderTitle}</h3>
            <Badge variant="secondary" className="font-normal">2</Badge>
          </div>
          <p className="text-muted-foreground max-w-xl text-pretty">{c.recorderBody}</p>
          <ul className="grid gap-1.5 sm:grid-cols-3">
            {c.recorderPoints.map((p) => (
              <li key={p} className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Check className="text-chart-1 size-3.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="secondary" size="lg" onClick={installRecorder} className="md:self-center">
          <Mic className="size-4" />
          {c.addRecorder}
        </Button>
      </Card>

      {/* Final CTA */}
      <Card className="bg-sidebar text-sidebar-foreground items-center gap-4 p-8 text-center md:p-12">
        <span className="bg-volt/15 text-volt flex size-12 items-center justify-center rounded-xl">
          <Puzzle className="size-6" />
        </span>
        <h3 className="text-2xl font-bold tracking-tight">{c.ctaTitle}</h3>
        <p className="text-sidebar-foreground/70 max-w-xl">{c.ctaBody}</p>
        <Button variant="volt" size="lg" onClick={install}>
          <Puzzle className="size-4" />
          {c.addToChrome}
        </Button>
      </Card>
    </Page>
  )
}

function ExtensionMock({ c, tab }: { c: Copy; tab: TabId }) {
  const [saved, setSaved] = React.useState(false)
  const TabIcon = TABS.find((t) => t.id === tab)?.icon ?? Globe

  return (
    <div className="bg-muted/40 relative rounded-xl border p-4 sm:p-6">
      {/* faux browser chrome */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-yellow-400/70" />
        <span className="size-2.5 rounded-full bg-green-400/70" />
        <span className="text-muted-foreground ml-2 inline-flex items-center gap-1.5 text-xs">
          <TabIcon className="size-3.5" />
          {c.tabs[tab]}
        </span>
      </div>

      {/* Kombo panel */}
      <div className="bg-card mx-auto max-w-xs rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <span className="bg-primary/15 text-primary flex size-5 items-center justify-center rounded">
            <Sparkles className="size-3" />
          </span>
          <span className="text-sm font-semibold">{c.panelName}</span>
        </div>
        <div className="space-y-3 p-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "#E5006D" }}
            >
              F
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Sarah Chen · Fever</p>
              <p className="text-muted-foreground truncate text-xs">VP of Sales</p>
            </div>
          </div>

          <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
            <span className="bg-chart-1 size-1.5 rounded-full" />
            92 · {c.match}
          </Badge>

          <div className="text-muted-foreground space-y-1 text-xs">
            <p>📍 {c.dataLocation}</p>
            <p>👥 {c.dataEmployees}</p>
            <p>💰 {c.dataRevenue}</p>
          </div>

          <Button
            size="sm"
            variant={saved ? "secondary" : "volt"}
            className="w-full"
            onClick={() => setSaved(true)}
          >
            {saved ? (
              <>
                <Check className="size-4" />
                {c.saved}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {c.save}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
