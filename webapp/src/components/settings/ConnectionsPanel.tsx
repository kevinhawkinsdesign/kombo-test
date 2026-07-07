import * as React from "react"
import { toast } from "sonner"
import {
  Building2,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  Mail,
  MessageCircle,
  Server,
  Video,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

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
    connect: "Connect",
    connected: "Connected",
    linkedInConnected: "LinkedIn connected",
    save: "Save",
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
  },
  es: {
    connect: "Conectar",
    connected: "Conectado",
    linkedInConnected: "LinkedIn conectado",
    save: "Guardar",
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
  },
} as const

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

// The workspace-level connection cards (professional network, Claude MCP,
// outreach channels, call sources, CRM, campaign settings). Lived on
// Settings > Connections; now rendered by the Integrations page so every
// connect-things surface is in one place.
export function ConnectionsPanel() {
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
