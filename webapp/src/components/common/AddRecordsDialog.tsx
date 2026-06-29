import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Upload, UserPlus, Database, Plug, Search, ArrowRight, Users, Building2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

type Kind = "contact" | "company"
type Action = "search" | "csv" | "hubspot" | "extract" | "sync" | "manual"
type Brand = "linkedin" | "crunchbase" | "hubspot" | "neutral"
type Flow = "outbound" | "inbound"

interface SourceDef {
  key: string
  brand: Brand
  icon?: React.ComponentType<{ className?: string }>
  action: Action
  flow: Flow
  scope: "both" | "contact" | "company"
  label: Record<"en" | "es", (noun: string) => string>
}

const SOURCES: SourceDef[] = [
  // Outbound — go find net-new records to reach out to
  { key: "li-search", brand: "linkedin", action: "search", flow: "outbound", scope: "both", label: { en: (n) => `Search ${n} on LinkedIn`, es: (n) => `Buscar ${n} en LinkedIn` } },
  { key: "cb-search", brand: "crunchbase", action: "search", flow: "outbound", scope: "both", label: { en: (n) => `Search ${n} on Crunchbase`, es: (n) => `Buscar ${n} en Crunchbase` } },
  { key: "cb-investors", brand: "crunchbase", action: "search", flow: "outbound", scope: "contact", label: { en: () => "Search investors on Crunchbase", es: () => "Buscar inversores en Crunchbase" } },
  { key: "li-post", brand: "linkedin", action: "extract", flow: "outbound", scope: "contact", label: { en: () => "Extract contacts from a Post", es: () => "Extraer contactos de una publicación" } },
  { key: "li-event", brand: "linkedin", action: "extract", flow: "outbound", scope: "contact", label: { en: () => "Extract contacts from an Event", es: () => "Extraer contactos de un evento" } },
  { key: "li-poll", brand: "linkedin", action: "extract", flow: "outbound", scope: "contact", label: { en: () => "Extract contacts from a Poll", es: () => "Extraer contactos de una encuesta" } },
  // Inbound — bring in records that already came to you
  { key: "hubspot", brand: "hubspot", action: "hubspot", flow: "inbound", scope: "both", label: { en: (n) => `Import ${n} from HubSpot`, es: (n) => `Importar ${n} desde HubSpot` } },
  { key: "hubspot-list", brand: "hubspot", action: "hubspot", flow: "inbound", scope: "both", label: { en: (n) => `Import ${n} from a HubSpot List`, es: (n) => `Importar ${n} de una lista de HubSpot` } },
  { key: "li-connections", brand: "linkedin", action: "sync", flow: "inbound", scope: "contact", label: { en: () => "Import your LinkedIn connections", es: () => "Importar tus conexiones de LinkedIn" } },
  { key: "li-followers", brand: "linkedin", action: "sync", flow: "inbound", scope: "contact", label: { en: () => "Import your LinkedIn followers", es: () => "Importar tus seguidores de LinkedIn" } },
  { key: "csv", brand: "neutral", icon: Upload, action: "csv", flow: "inbound", scope: "both", label: { en: (n) => `Import ${n} from CSV`, es: (n) => `Importar ${n} desde CSV` } },
  { key: "manual", brand: "neutral", icon: UserPlus, action: "manual", flow: "inbound", scope: "both", label: { en: (n) => `Add a new ${n}`, es: (n) => `Añadir ${n}` } },
]

function SourceGroup({
  heading,
  hint,
  sources,
  activeKey,
  onSelect,
  label,
  className,
}: {
  heading: string
  hint: string
  sources: SourceDef[]
  activeKey: string
  onSelect: (key: string) => void
  label: (s: SourceDef) => string
  className?: string
}) {
  if (sources.length === 0) return null
  return (
    <div className={className}>
      <div className="px-2 pb-1 pt-2">
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
          {heading}
        </p>
        <p className="text-muted-foreground/70 text-[11px]">{hint}</p>
      </div>
      {sources.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onSelect(s.key)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors",
            activeKey === s.key ? "bg-muted font-medium" : "hover:bg-muted/60"
          )}
        >
          <SourceGlyph source={s} />
          <span className="min-w-0 flex-1 truncate">{label(s)}</span>
        </button>
      ))}
    </div>
  )
}

function SourceGlyph({ source }: { source: SourceDef }) {
  if (source.brand === "linkedin")
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#0a66c2]/10">
        <LinkedinIcon className="size-4 text-[#0a66c2]" />
      </span>
    )
  if (source.brand === "crunchbase")
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-[9px] font-bold text-white">
        cb
      </span>
    )
  if (source.brand === "hubspot")
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#ff7a59]/15">
        <Plug className="size-4 text-[#ff7a59]" />
      </span>
    )
  const Icon = source.icon ?? Database
  return (
    <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
      <Icon className="text-foreground size-4" />
    </span>
  )
}

/**
 * Two-pane "add records" picker (modelled on the extension's Create-list
 * modal): a contact/company tab, a list of import/search sources on the left,
 * and the selected source's detail on the right. Adding records is always a
 * search or import flow — never a manual entry form by default.
 */
export function AddRecordsDialog({
  open,
  onOpenChange,
  kind,
  onManual,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  kind: Kind
  onManual?: () => void
}) {
  const { locale } = useLocale()
  const navigate = useNavigate()
  const [tab, setTab] = React.useState<Kind>(kind)
  const [selected, setSelected] = React.useState("li-search")
  const [extractUrl, setExtractUrl] = React.useState("")
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setTab(kind)
    setSelected("li-search")
    setExtractUrl("")
  }
  if (!open && wasOpen) setWasOpen(false)

  const t = (en: string, es: string) => (locale === "es" ? es : en)
  const noun =
    tab === "company"
      ? t("companies", "empresas")
      : t("contacts", "contactos")
  const nounSingular =
    tab === "company" ? t("company", "empresa") : t("contact", "contacto")

  const sources = SOURCES.filter(
    (s) => s.scope === "both" || s.scope === tab
  )
  const outboundSources = sources.filter((s) => s.flow === "outbound")
  const inboundSources = sources.filter((s) => s.flow === "inbound")
  const active = sources.find((s) => s.key === selected) ?? sources[0]
  const label = (s: SourceDef) =>
    s.label[locale === "es" ? "es" : "en"](
      s.action === "manual" ? nounSingular : noun
    )

  function leave(to: string) {
    onOpenChange(false)
    navigate(to)
  }

  function runAction(s: SourceDef) {
    switch (s.action) {
      case "search":
        leave("/search")
        break
      case "csv":
        leave("/lists?import=1")
        break
      case "hubspot":
        leave("/integrations")
        break
      case "manual":
        onOpenChange(false)
        if (onManual) onManual()
        else navigate(tab === "company" ? "/companies" : "/people")
        break
      case "extract":
        toast.success(t("Extracting — we'll add matches shortly", "Extrayendo — añadiremos las coincidencias en breve"))
        onOpenChange(false)
        break
      case "sync":
        toast.success(t("Syncing — this can take a moment", "Sincronizando — puede tardar un momento"))
        onOpenChange(false)
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">
          {tab === "company"
            ? t("Add companies", "Añadir empresas")
            : t("Add prospects", "Añadir prospectos")}
        </DialogTitle>
        <div className="grid min-h-[26rem] grid-cols-1 sm:grid-cols-[260px_1fr]">
          {/* Left: source list */}
          <div className="bg-muted/20 flex flex-col border-r">
            <div className="border-b p-4">
              <p className="text-sm font-semibold">
                {tab === "company"
                  ? t("Add companies", "Añadir empresas")
                  : t("Add prospects", "Añadir prospectos")}
              </p>
              <div className="bg-muted mt-3 flex rounded-lg p-[3px]">
                {(
                  [
                    { v: "contact" as Kind, label: t("Contact", "Contacto"), icon: Users },
                    { v: "company" as Kind, label: t("Company", "Empresa"), icon: Building2 },
                  ]
                ).map((tb) => (
                  <button
                    key={tb.v}
                    type="button"
                    onClick={() => {
                      setTab(tb.v)
                      setSelected("li-search")
                    }}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                      tab === tb.v
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tb.icon className="size-3.5" />
                    {tb.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <SourceGroup
                heading={t("Outbound", "Outbound")}
                hint={t("Find net-new records", "Encuentra registros nuevos")}
                sources={outboundSources}
                activeKey={active.key}
                onSelect={setSelected}
                label={label}
              />
              <SourceGroup
                heading={t("Inbound", "Inbound")}
                hint={t("Bring in records you already have", "Trae registros que ya tienes")}
                sources={inboundSources}
                activeKey={active.key}
                onSelect={setSelected}
                label={label}
                className="mt-3"
              />
            </div>
          </div>

          {/* Right: selected source detail */}
          <div className="flex flex-col p-6">
            <h2 className="text-lg font-semibold">{label(active)}</h2>

            {active.action === "csv" ? (
              <>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t(
                    "Include either First Name, Last Name, and Company Name or a LinkedIn Profile URL.",
                    "Incluye Nombre, Apellido y Empresa, o una URL de perfil de LinkedIn."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => runAction(active)}
                  className="hover:border-primary/50 hover:bg-muted/40 mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors"
                >
                  <span className="bg-muted flex size-12 items-center justify-center rounded-full">
                    <Upload className="text-muted-foreground size-5" />
                  </span>
                  <span className="mt-3 text-sm font-medium">
                    {t("Drag and drop your file here or ", "Arrastra tu archivo aquí o ")}
                    <span className="text-primary underline">{t("browse", "explora")}</span>
                  </span>
                  <span className="text-muted-foreground mt-1 text-xs">
                    {t("Supports CSV and Excel files (.csv, .xlsx, .xls)", "Admite archivos CSV y Excel (.csv, .xlsx, .xls)")}
                  </span>
                </button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mt-1 text-sm">
                  {detailDescription(active.action, t)}
                </p>
                {active.action === "extract" && (
                  <Input
                    value={extractUrl}
                    onChange={(e) => setExtractUrl(e.target.value)}
                    placeholder={t("Paste the LinkedIn URL…", "Pega la URL de LinkedIn…")}
                    className="mt-4"
                  />
                )}
                <div className="mt-4">
                  <Button variant="volt" onClick={() => runAction(active)}>
                    {active.action === "search" && <Search className="size-4" />}
                    {active.action === "hubspot" && <Plug className="size-4" />}
                    {ctaLabel(active.action, t)}
                    {active.action === "search" && <ArrowRight className="size-4" />}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function detailDescription(action: Action, t: (en: string, es: string) => string): string {
  switch (action) {
    case "search":
      return t(
        "Build a one-time list of records that match your filters using our search.",
        "Crea una lista puntual de registros que coincidan con tus filtros con nuestra búsqueda."
      )
    case "hubspot":
      return t(
        "Connect HubSpot to pull records straight from your CRM.",
        "Conecta HubSpot para traer registros directamente de tu CRM."
      )
    case "extract":
      return t(
        "Paste a LinkedIn post, event, or poll URL and we'll extract everyone who engaged.",
        "Pega la URL de una publicación, evento o encuesta de LinkedIn y extraeremos a quienes interactuaron."
      )
    case "sync":
      return t(
        "Pull in everyone from your own LinkedIn network.",
        "Trae a todas las personas de tu propia red de LinkedIn."
      )
    case "manual":
      return t(
        "Add a single record by hand.",
        "Añade un registro a mano."
      )
    default:
      return ""
  }
}

function ctaLabel(action: Action, t: (en: string, es: string) => string): string {
  switch (action) {
    case "search":
      return t("Start search", "Iniciar búsqueda")
    case "hubspot":
      return t("Connect HubSpot", "Conectar HubSpot")
    case "extract":
      return t("Extract", "Extraer")
    case "sync":
      return t("Sync now", "Sincronizar")
    case "manual":
      return t("Open form", "Abrir formulario")
    default:
      return t("Continue", "Continuar")
  }
}
