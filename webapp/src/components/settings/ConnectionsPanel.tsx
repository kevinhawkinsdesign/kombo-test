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
import { RichTextEditor } from "@/components/common/RichTextEditor"
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
    connEmailSignature: "Email signature",
    connEmailSignatureDesc: "Appended to every email you send through Kombo.",
    connEmailSignaturePlaceholder: "Type or paste your signature…",
    discard: "Discard",
    saved: "Saved",
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
    connEmailSignature: "Firma de correo",
    connEmailSignatureDesc:
      "Se añade a cada correo que envíes a través de Kombo.",
    connEmailSignaturePlaceholder: "Escribe o pega tu firma…",
    discard: "Descartar",
    saved: "Guardado",
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
  it: {
    connect: "Connetti",
    connected: "Connesso",
    linkedInConnected: "LinkedIn connesso",
    save: "Salva",
    connProfNetwork: "Rete professionale",
    connProfNetworkDesc:
      "Collega la tua rete professionale in modo che KomboAI possa inviare messaggi per tuo conto.",
    connCountryLabel: "Seleziona il paese da cui lavori",
    connProfConnection: "Connessione della rete professionale",
    connConnectAccount: "Collega il tuo account:",
    connClaude: "Claude (MCP)",
    connBeta: "Beta",
    connClaudeDesc:
      "Collega Kombo a Claude.ai o Claude Desktop per arricchire le liste di prospect direttamente da una chat. Aggiungi un connettore MCP personalizzato con l'URL e il token qui sotto.",
    connServerUrl: "URL del server",
    connCopy: "Copia",
    connCopied: "URL del server copiato",
    connToken: "Token",
    connShow: "Mostra",
    connTokenHelp:
      "Ogni clic su Mostra genera un nuovo token. I token restano validi finché il tuo accesso MCP non viene revocato o il secret non viene ruotato — conservali con cura.",
    connOutreach: "Outreach",
    connOutreachDesc: "Esplora gli strumenti di Outreach con cui si collega Kombo.",
    connWhatsapp: "Whatsapp",
    connEmail: "Email",
    connEmailSignature: "Firma email",
    connEmailSignatureDesc:
      "Aggiunta a ogni email che invii tramite Kombo.",
    connEmailSignaturePlaceholder: "Scrivi o incolla la tua firma…",
    discard: "Scarta",
    saved: "Salvato",
    connCallSources: "Fonti delle chiamate",
    connCallSourcesDesc:
      "Collega le fonti da cui Kombo può estrarre le registrazioni delle chiamate. Ogni fonte può essere attivata in modo indipendente.",
    connTeams: "Microsoft Teams",
    connCrm: "Connessione CRM",
    connCrmDesc:
      "Esplora i CRM con cui si collega Kombo. Tieni presente che puoi collegare un solo CRM alla volta.",
    connCampaignSettings: "Impostazioni campagna",
    connTimeZone: "Fuso orario locale",
    connSettingsSaved: "Impostazioni salvate",
  },
  fr: {
    connect: "Connecter",
    connected: "Connecté",
    linkedInConnected: "LinkedIn connecté",
    save: "Enregistrer",
    connProfNetwork: "Réseau professionnel",
    connProfNetworkDesc:
      "Connectez votre réseau professionnel pour que KomboAI puisse envoyer des messages en votre nom.",
    connCountryLabel: "Sélectionnez le pays depuis lequel vous travaillez",
    connProfConnection: "Connexion du réseau professionnel",
    connConnectAccount: "Connectez votre compte :",
    connClaude: "Claude (MCP)",
    connBeta: "Bêta",
    connClaudeDesc:
      "Connectez Kombo à Claude.ai ou Claude Desktop pour enrichir des listes de prospects directement depuis un chat. Ajoutez un connecteur MCP personnalisé avec l'URL et le token ci-dessous.",
    connServerUrl: "URL du serveur",
    connCopy: "Copier",
    connCopied: "URL du serveur copiée",
    connToken: "Token",
    connShow: "Afficher",
    connTokenHelp:
      "Chaque clic sur Afficher génère un nouveau token. Les tokens restent valides jusqu'à la révocation de votre accès MCP ou la rotation du secret — conservez-les en lieu sûr.",
    connOutreach: "Outreach",
    connOutreachDesc: "Découvrez les outils Outreach avec lesquels Kombo se connecte.",
    connWhatsapp: "Whatsapp",
    connEmail: "E-mail",
    connEmailSignature: "Signature e-mail",
    connEmailSignatureDesc:
      "Ajoutée à chaque e-mail que vous envoyez via Kombo.",
    connEmailSignaturePlaceholder: "Saisissez ou collez votre signature…",
    discard: "Ignorer",
    saved: "Enregistré",
    connCallSources: "Sources d'appels",
    connCallSourcesDesc:
      "Connectez les sources depuis lesquelles Kombo peut récupérer des enregistrements d'appels. Chaque source peut être activée indépendamment.",
    connTeams: "Microsoft Teams",
    connCrm: "Connexion CRM",
    connCrmDesc:
      "Découvrez les CRM avec lesquels Kombo se connecte. Notez que vous ne pouvez connecter qu'un seul CRM à la fois.",
    connCampaignSettings: "Paramètres de campagne",
    connTimeZone: "Fuseau horaire local",
    connSettingsSaved: "Paramètres enregistrés",
  },
  de: {
    connect: "Verbinden",
    connected: "Verbunden",
    linkedInConnected: "LinkedIn verbunden",
    save: "Speichern",
    connProfNetwork: "Berufliches Netzwerk",
    connProfNetworkDesc:
      "Verbinde dein berufliches Netzwerk, damit KomboAI in deinem Namen Nachrichten senden kann.",
    connCountryLabel: "Wähle das Land, aus dem du arbeitest",
    connProfConnection: "Verbindung zum beruflichen Netzwerk",
    connConnectAccount: "Verbinde dein Konto:",
    connClaude: "Claude (MCP)",
    connBeta: "Beta",
    connClaudeDesc:
      "Verbinde Kombo mit Claude.ai oder Claude Desktop, um Prospect-Listen direkt aus einem Chat anzureichern. Füge unten einen benutzerdefinierten MCP-Connector mit URL und Token hinzu.",
    connServerUrl: "Server-URL",
    connCopy: "Kopieren",
    connCopied: "Server-URL kopiert",
    connToken: "Token",
    connShow: "Anzeigen",
    connTokenHelp:
      "Jeder Klick auf Anzeigen erzeugt ein neues Token. Tokens bleiben gültig, bis dein MCP-Zugriff widerrufen wird oder das Secret rotiert — bewahre sie sicher auf.",
    connOutreach: "Outreach",
    connOutreachDesc: "Entdecke die Outreach-Tools, mit denen sich Kombo verbindet.",
    connWhatsapp: "Whatsapp",
    connEmail: "E-Mail",
    connEmailSignature: "E-Mail-Signatur",
    connEmailSignatureDesc:
      "Wird an jede E-Mail angehängt, die du über Kombo versendest.",
    connEmailSignaturePlaceholder: "Signatur eingeben oder einfügen…",
    discard: "Verwerfen",
    saved: "Gespeichert",
    connCallSources: "Anrufquellen",
    connCallSourcesDesc:
      "Verbinde die Quellen, aus denen Kombo Anrufaufzeichnungen abrufen kann. Jede Quelle lässt sich unabhängig ein- und ausschalten.",
    connTeams: "Microsoft Teams",
    connCrm: "CRM-Verbindung",
    connCrmDesc:
      "Entdecke die CRMs, mit denen sich Kombo verbindet. Beachte, dass du jeweils nur ein CRM verbinden kannst.",
    connCampaignSettings: "Kampagneneinstellungen",
    connTimeZone: "Lokale Zeitzone",
    connSettingsSaved: "Einstellungen gespeichert",
  },
  pt: {
    connect: "Conectar",
    connected: "Conectado",
    linkedInConnected: "LinkedIn conectado",
    save: "Guardar",
    connProfNetwork: "Rede profissional",
    connProfNetworkDesc:
      "Conecte a sua rede profissional para que a KomboAI possa enviar mensagens em seu nome.",
    connCountryLabel: "Selecione o país a partir do qual trabalha",
    connProfConnection: "Conexão da rede profissional",
    connConnectAccount: "Conecte a sua conta:",
    connClaude: "Claude (MCP)",
    connBeta: "Beta",
    connClaudeDesc:
      "Conecte o Kombo ao Claude.ai ou ao Claude Desktop para enriquecer listas de prospects diretamente a partir de um chat. Adicione um conector MCP personalizado com o URL e o token abaixo.",
    connServerUrl: "URL do servidor",
    connCopy: "Copiar",
    connCopied: "URL do servidor copiada",
    connToken: "Token",
    connShow: "Mostrar",
    connTokenHelp:
      "Cada clique em Mostrar gera um novo token. Os tokens mantêm-se válidos até o seu acesso MCP ser revogado ou o segredo rodar — guarde-os em segurança.",
    connOutreach: "Outreach",
    connOutreachDesc: "Explore as ferramentas de Outreach com que o Kombo se conecta.",
    connWhatsapp: "Whatsapp",
    connEmail: "Email",
    connEmailSignature: "Assinatura de email",
    connEmailSignatureDesc:
      "Adicionada a cada email que envia através do Kombo.",
    connEmailSignaturePlaceholder: "Escreva ou cole a sua assinatura…",
    discard: "Descartar",
    saved: "Guardado",
    connCallSources: "Fontes de chamadas",
    connCallSourcesDesc:
      "Conecte as fontes de onde o Kombo pode obter gravações de chamadas. Cada fonte pode ser ativada de forma independente.",
    connTeams: "Microsoft Teams",
    connCrm: "Conexão de CRM",
    connCrmDesc:
      "Explore os CRMs com que o Kombo se conecta. Tenha em atenção que só pode conectar um CRM de cada vez.",
    connCampaignSettings: "Definições de campanha",
    connTimeZone: "Fuso horário local",
    connSettingsSaved: "Definições guardadas",
  },
  pt_BR: {
    connect: "Conectar",
    connected: "Conectado",
    linkedInConnected: "LinkedIn conectado",
    save: "Salvar",
    connProfNetwork: "Rede profissional",
    connProfNetworkDesc:
      "Conecte sua rede profissional para que a KomboAI possa enviar mensagens em seu nome.",
    connCountryLabel: "Selecione o país de onde você está trabalhando",
    connProfConnection: "Conexão da rede profissional",
    connConnectAccount: "Conecte sua conta:",
    connClaude: "Claude (MCP)",
    connBeta: "Beta",
    connClaudeDesc:
      "Conecte o Kombo ao Claude.ai ou ao Claude Desktop para enriquecer listas de prospects direto de um chat. Adicione um conector MCP personalizado com a URL e o token abaixo.",
    connServerUrl: "URL do servidor",
    connCopy: "Copiar",
    connCopied: "URL do servidor copiada",
    connToken: "Token",
    connShow: "Mostrar",
    connTokenHelp:
      "Cada clique em Mostrar gera um novo token. Os tokens continuam válidos até que seu acesso MCP seja revogado ou o segredo seja rotacionado — guarde-os com cuidado.",
    connOutreach: "Outreach",
    connOutreachDesc: "Explore as ferramentas de Outreach que o Kombo conecta.",
    connWhatsapp: "Whatsapp",
    connEmail: "E-mail",
    connEmailSignature: "Assinatura de e-mail",
    connEmailSignatureDesc:
      "Adicionada a cada e-mail que você envia pelo Kombo.",
    connEmailSignaturePlaceholder: "Digite ou cole sua assinatura…",
    discard: "Descartar",
    saved: "Salvo",
    connCallSources: "Fontes de chamadas",
    connCallSourcesDesc:
      "Conecte as fontes de onde o Kombo pode extrair gravações de chamadas. Cada fonte pode ser ativada de forma independente.",
    connTeams: "Microsoft Teams",
    connCrm: "Conexão de CRM",
    connCrmDesc:
      "Explore os CRMs que o Kombo conecta. Vale lembrar que você só pode conectar um CRM por vez.",
    connCampaignSettings: "Configurações de campanha",
    connTimeZone: "Fuso horário local",
    connSettingsSaved: "Configurações salvas",
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

  // Email signature — draft vs. last-saved baseline, Discard/Save only show
  // once dirty. "justSaved" briefly shows a "Saved" label, then clears.
  const [lastSavedSignature, setLastSavedSignature] = React.useState("")
  const [signatureDraft, setSignatureDraft] = React.useState("")
  const [justSaved, setJustSaved] = React.useState(false)
  const signatureDirty = signatureDraft !== lastSavedSignature

  React.useEffect(() => {
    if (!justSaved) return
    const t = window.setTimeout(() => setJustSaved(false), 2000)
    return () => window.clearTimeout(t)
  }, [justSaved])

  function handleSaveSignature() {
    setLastSavedSignature(signatureDraft)
    setJustSaved(true)
  }

  function handleDiscardSignature() {
    setSignatureDraft(lastSavedSignature)
  }

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
        {email && (
          <div className="space-y-1.5 pl-11">
            <p className="text-sm font-medium">{c.connEmailSignature}</p>
            <p className="text-muted-foreground text-xs">
              {c.connEmailSignatureDesc}
            </p>
            <RichTextEditor
              value={signatureDraft}
              onChange={setSignatureDraft}
              ariaLabel={c.connEmailSignature}
              placeholder={c.connEmailSignaturePlaceholder}
              minHeight="min-h-24"
            />
            {(signatureDirty || justSaved) && (
              <div className="flex items-center justify-end gap-2 pt-1">
                {justSaved && !signatureDirty && (
                  <span className="text-primary text-xs font-medium">
                    {c.saved}
                  </span>
                )}
                {signatureDirty && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDiscardSignature}
                    >
                      {c.discard}
                    </Button>
                    <Button
                      variant="volt"
                      size="sm"
                      onClick={handleSaveSignature}
                    >
                      {c.save}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
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
