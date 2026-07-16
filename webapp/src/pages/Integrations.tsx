import * as React from "react"
import { toast } from "sonner"
import { Check, Plug, Wrench, Sparkles, Download } from "lucide-react"

import { useLocale, type Locale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ViewToggle, type CollectionView } from "@/components/common/ViewToggle"
import { ConnectionsPanel } from "@/components/settings/ConnectionsPanel"
import { integrations as seed } from "@/lib/mock-data"
import { mcpConnections } from "@/lib/mock-network"
import type { McpConnection } from "@/lib/mock-network"
import { downloadCsv } from "@/lib/csv"
import type { Integration } from "@/lib/types"

const CATEGORY_LABELS: Record<Locale, Record<Integration["category"], string>> =
  {
    en: {
      crm: "CRM",
      email: "Email",
      calendar: "Calendar",
      social: "Social",
      outreach: "Outreach",
    },
    es: {
      crm: "CRM",
      email: "Email",
      calendar: "Calendario",
      social: "Social",
      outreach: "Captación",
    },
    it: {
      crm: "CRM",
      email: "Email",
      calendar: "Calendario",
      social: "Social",
      outreach: "Acquisizione",
    },
    fr: {
      crm: "CRM",
      email: "E-mail",
      calendar: "Calendrier",
      social: "Réseaux sociaux",
      outreach: "Prospection",
    },
    de: {
      crm: "CRM",
      email: "E-Mail",
      calendar: "Kalender",
      social: "Social",
      outreach: "Akquise",
    },
    pt: {
      crm: "CRM",
      email: "Email",
      calendar: "Calendário",
      social: "Redes sociais",
      outreach: "Captação",
    },
    pt_BR: {
      crm: "CRM",
      email: "Email",
      calendar: "Calendário",
      social: "Redes sociais",
      outreach: "Prospecção",
    },
  }

const COPY = {
  en: {
    title: "Integrations",
    description: "Connect Kombo to the tools your team already uses.",
    connectedToast: (name: string) => `${name} connected`,
    disconnectedToast: (name: string) => `${name} disconnected`,
    mcpConnectedToast: (name: string) => `${name} connected — Kai can now use it`,
    connected: "Connected",
    connect: "Connect",
    disconnect: "Disconnect",
    aiConnections: "AI tool connections",
    aiConnectionsDesc:
      "MCP servers Kai can call to take action on your behalf — search your CRM, book meetings, draft and send outreach.",
    workspaceConnections: "Workspace connections",
    workspaceConnectionsDesc:
      "Your professional network, outreach channels, call sources, CRM, and campaign defaults.",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Integrations exported to CSV",
    colName: "Name",
    colType: "Type",
    colCategory: "Category",
    colStatus: "Status",
    colTools: "Tools",
    notConnected: "Not connected",
    typeIntegration: "Integration",
    typeAi: "AI tool",
  },
  es: {
    title: "Integraciones",
    description:
      "Conecta Kombo a las herramientas que tu equipo ya utiliza.",
    connectedToast: (name: string) => `${name} conectado`,
    disconnectedToast: (name: string) => `${name} desconectado`,
    mcpConnectedToast: (name: string) =>
      `${name} conectado — Kai ya puede usarlo`,
    connected: "Conectado",
    connect: "Conectar",
    disconnect: "Desconectar",
    aiConnections: "Conexiones de herramientas de IA",
    aiConnectionsDesc:
      "Servidores MCP que Kai puede invocar para actuar en tu nombre: buscar en tu CRM, agendar reuniones y redactar y enviar outreach.",
    workspaceConnections: "Conexiones del espacio de trabajo",
    workspaceConnectionsDesc:
      "Tu red profesional, canales de outreach, fuentes de llamadas, CRM y ajustes de campaña.",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Integraciones exportadas a CSV",
    colName: "Nombre",
    colType: "Tipo",
    colCategory: "Categoría",
    colStatus: "Estado",
    colTools: "Herramientas",
    notConnected: "Sin conectar",
    typeIntegration: "Integración",
    typeAi: "Herramienta de IA",
  },
  it: {
    title: "Integrazioni",
    description: "Collega Kombo agli strumenti che il tuo team usa già.",
    connectedToast: (name: string) => `${name} connesso`,
    disconnectedToast: (name: string) => `${name} disconnesso`,
    mcpConnectedToast: (name: string) =>
      `${name} connesso — ora Kai può usarlo`,
    connected: "Connesso",
    connect: "Connetti",
    disconnect: "Disconnetti",
    aiConnections: "Connessioni degli strumenti IA",
    aiConnectionsDesc:
      "Server MCP che Kai può richiamare per agire per tuo conto: cercare nel tuo CRM, fissare riunioni, redigere e inviare outreach.",
    workspaceConnections: "Connessioni dello spazio di lavoro",
    workspaceConnectionsDesc:
      "La tua rete professionale, i canali di outreach, le fonti delle chiamate, il CRM e le impostazioni predefinite delle campagne.",
    viewCards: "Schede",
    viewTable: "Tabella",
    exportLabel: "Esporta",
    exported: "Integrazioni esportate in CSV",
    colName: "Nome",
    colType: "Tipo",
    colCategory: "Categoria",
    colStatus: "Stato",
    colTools: "Strumenti",
    notConnected: "Non connesso",
    typeIntegration: "Integrazione",
    typeAi: "Strumento IA",
  },
  fr: {
    title: "Intégrations",
    description: "Connectez Kombo aux outils que votre équipe utilise déjà.",
    connectedToast: (name: string) => `${name} connecté`,
    disconnectedToast: (name: string) => `${name} déconnecté`,
    mcpConnectedToast: (name: string) =>
      `${name} connecté — Kai peut désormais l'utiliser`,
    connected: "Connecté",
    connect: "Connecter",
    disconnect: "Déconnecter",
    aiConnections: "Connexions d'outils IA",
    aiConnectionsDesc:
      "Serveurs MCP que Kai peut appeler pour agir en votre nom : rechercher dans votre CRM, planifier des rendez-vous, rédiger et envoyer de l'outreach.",
    workspaceConnections: "Connexions de l'espace de travail",
    workspaceConnectionsDesc:
      "Votre réseau professionnel, vos canaux d'outreach, vos sources d'appels, votre CRM et les paramètres par défaut de vos campagnes.",
    viewCards: "Cartes",
    viewTable: "Tableau",
    exportLabel: "Exporter",
    exported: "Intégrations exportées en CSV",
    colName: "Nom",
    colType: "Type",
    colCategory: "Catégorie",
    colStatus: "Statut",
    colTools: "Outils",
    notConnected: "Non connecté",
    typeIntegration: "Intégration",
    typeAi: "Outil IA",
  },
  de: {
    title: "Integrationen",
    description: "Verbinde Kombo mit den Tools, die dein Team bereits nutzt.",
    connectedToast: (name: string) => `${name} verbunden`,
    disconnectedToast: (name: string) => `${name} getrennt`,
    mcpConnectedToast: (name: string) =>
      `${name} verbunden — Kai kann es jetzt nutzen`,
    connected: "Verbunden",
    connect: "Verbinden",
    disconnect: "Trennen",
    aiConnections: "KI-Tool-Verbindungen",
    aiConnectionsDesc:
      "MCP-Server, die Kai in deinem Namen aufrufen kann — dein CRM durchsuchen, Meetings buchen, Outreach entwerfen und versenden.",
    workspaceConnections: "Workspace-Verbindungen",
    workspaceConnectionsDesc:
      "Dein berufliches Netzwerk, Outreach-Kanäle, Anrufquellen, CRM und Kampagnen-Standardeinstellungen.",
    viewCards: "Karten",
    viewTable: "Tabelle",
    exportLabel: "Exportieren",
    exported: "Integrationen als CSV exportiert",
    colName: "Name",
    colType: "Typ",
    colCategory: "Kategorie",
    colStatus: "Status",
    colTools: "Tools",
    notConnected: "Nicht verbunden",
    typeIntegration: "Integration",
    typeAi: "KI-Tool",
  },
  pt: {
    title: "Integrações",
    description: "Conecte o Kombo às ferramentas que a sua equipa já utiliza.",
    connectedToast: (name: string) => `${name} conectado`,
    disconnectedToast: (name: string) => `${name} desconectado`,
    mcpConnectedToast: (name: string) =>
      `${name} conectado — o Kai já pode utilizá-lo`,
    connected: "Conectado",
    connect: "Conectar",
    disconnect: "Desconectar",
    aiConnections: "Conexões de ferramentas de IA",
    aiConnectionsDesc:
      "Servidores MCP que o Kai pode invocar para agir em seu nome — pesquisar no seu CRM, marcar reuniões, redigir e enviar outreach.",
    workspaceConnections: "Conexões do espaço de trabalho",
    workspaceConnectionsDesc:
      "A sua rede profissional, canais de outreach, fontes de chamadas, CRM e predefinições de campanha.",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Integrações exportadas para CSV",
    colName: "Nome",
    colType: "Tipo",
    colCategory: "Categoria",
    colStatus: "Estado",
    colTools: "Ferramentas",
    notConnected: "Não conectado",
    typeIntegration: "Integração",
    typeAi: "Ferramenta de IA",
  },
  pt_BR: {
    title: "Integrações",
    description: "Conecte o Kombo às ferramentas que o seu time já usa.",
    connectedToast: (name: string) => `${name} conectado`,
    disconnectedToast: (name: string) => `${name} desconectado`,
    mcpConnectedToast: (name: string) =>
      `${name} conectado — o Kai já pode usá-lo`,
    connected: "Conectado",
    connect: "Conectar",
    disconnect: "Desconectar",
    aiConnections: "Conexões de ferramentas de IA",
    aiConnectionsDesc:
      "Servidores MCP que o Kai pode chamar para agir em seu nome — buscar no seu CRM, marcar reuniões, escrever e enviar outreach.",
    workspaceConnections: "Conexões do espaço de trabalho",
    workspaceConnectionsDesc:
      "Sua rede profissional, canais de outreach, fontes de chamadas, CRM e configurações padrão de campanha.",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Integrações exportadas para CSV",
    colName: "Nome",
    colType: "Tipo",
    colCategory: "Categoria",
    colStatus: "Status",
    colTools: "Ferramentas",
    notConnected: "Não conectado",
    typeIntegration: "Integração",
    typeAi: "Ferramenta de IA",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export default function Integrations() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [items, setItems] = React.useState<Integration[]>(seed)
  const [mcp, setMcp] = React.useState<McpConnection[]>(mcpConnections)
  const [view, setView] = React.useState<CollectionView>("cards")

  function exportCsv() {
    const rows: (string | number)[][] = [
      ...items.map((it) => [
        it.name,
        c.typeIntegration,
        CATEGORY_LABELS[locale][it.category],
        it.connected ? c.connected : c.notConnected,
      ]),
      ...mcp.map((conn) => [
        conn.name,
        c.typeAi,
        conn.category,
        conn.connected ? c.connected : c.notConnected,
      ]),
    ]
    downloadCsv(
      "kombo-integrations.csv",
      [c.colName, c.colType, c.colCategory, c.colStatus],
      rows
    )
    toast.success(c.exported)
  }

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const connected = !it.connected
        toast.success(
          connected ? c.connectedToast(it.name) : c.disconnectedToast(it.name)
        )
        return { ...it, connected }
      })
    )
  }

  function toggleMcp(id: string) {
    setMcp((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const connected = !it.connected
        toast.success(
          connected
            ? c.mcpConnectedToast(it.name)
            : c.disconnectedToast(it.name)
        )
        return { ...it, connected }
      })
    )
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <div className="flex items-center gap-2">
            <ViewToggle
              view={view}
              onChange={setView}
              cardsLabel={c.viewCards}
              tableLabel={c.viewTable}
            />
            <Button variant="outline" onClick={exportCsv}>
              <Download className="size-4" />
              <span className="hidden sm:inline">{c.exportLabel}</span>
            </Button>
          </div>
        }
      />
      {view === "table" ? (
        <IntegrationTable
          rows={items}
          c={c}
          categoryLabel={(cat) => CATEGORY_LABELS[locale][cat]}
          onToggle={toggle}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.id}>
              <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="bg-muted flex size-11 items-center justify-center rounded-xl">
                    <Plug className="text-muted-foreground size-5" />
                  </div>
                  {it.connected ? (
                    <Badge variant="success" className="gap-1">
                      <Check className="size-3" />
                      {c.connected}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-normal">
                      {CATEGORY_LABELS[locale][it.category]}
                    </Badge>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{it.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {it.description}
                  </p>
                </div>
                <Button
                  variant={it.connected ? "outline" : "default"}
                  className="w-full"
                  onClick={() => toggle(it.id)}
                >
                  {it.connected ? c.disconnect : c.connect}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="text-primary size-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            {c.aiConnections}
          </h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          {c.aiConnectionsDesc}
        </p>
        {view === "table" ? (
          <McpTable rows={mcp} c={c} onToggle={toggleMcp} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mcp.map((conn) => (
              <Card key={conn.id}>
                <CardContent className="flex flex-col gap-4 pt-6">
                  <div className="flex items-start justify-between">
                    <div className="bg-primary/10 flex size-11 items-center justify-center rounded-xl">
                      <Wrench className="text-primary size-5" />
                    </div>
                    {conn.connected ? (
                      <Badge variant="success" className="gap-1">
                        <Check className="size-3" />
                        {c.connected}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        {conn.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{conn.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {conn.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {conn.tools.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="font-mono text-[11px] font-normal"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant={conn.connected ? "outline" : "default"}
                    className="w-full"
                    onClick={() => toggleMcp(conn.id)}
                  >
                    {conn.connected ? c.disconnect : c.connect}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Workspace connections — consolidated here from Settings > Connections
          so every connect-things surface lives on one page. */}
      <div className="mt-10">
        <div className="mb-1 flex items-center gap-2">
          <Plug className="text-primary size-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            {c.workspaceConnections}
          </h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          {c.workspaceConnectionsDesc}
        </p>
        <div className="space-y-4">
          <ConnectionsPanel />
        </div>
      </div>
    </Page>
  )
}

function StatusCell({
  connected,
  c,
}: {
  connected: boolean
  c: Copy
}) {
  return connected ? (
    <Badge variant="success" className="gap-1">
      <Check className="size-3" />
      {c.connected}
    </Badge>
  ) : (
    <span className="text-muted-foreground text-sm">{c.notConnected}</span>
  )
}

function IntegrationTable({
  rows,
  c,
  categoryLabel,
  onToggle,
}: {
  rows: Integration[]
  c: Copy
  categoryLabel: (cat: Integration["category"]) => string
  onToggle: (id: string) => void
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colCategory}</TableHead>
            <TableHead>{c.colStatus}</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((it) => (
            <TableRow key={it.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Plug className="text-muted-foreground size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-muted-foreground line-clamp-1 max-w-[280px] text-xs">
                      {it.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {categoryLabel(it.category)}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusCell connected={it.connected} c={c} />
              </TableCell>
              <TableCell>
                <Button
                  variant={it.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => onToggle(it.id)}
                >
                  {it.connected ? c.disconnect : c.connect}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function McpTable({
  rows,
  c,
  onToggle,
}: {
  rows: McpConnection[]
  c: Copy
  onToggle: (id: string) => void
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colCategory}</TableHead>
            <TableHead>{c.colTools}</TableHead>
            <TableHead>{c.colStatus}</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((conn) => (
            <TableRow key={conn.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <span className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Wrench className="text-primary size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{conn.name}</p>
                    <p className="text-muted-foreground line-clamp-1 max-w-[260px] text-xs">
                      {conn.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {conn.category}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {conn.tools.slice(0, 3).map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="font-mono text-[11px] font-normal"
                    >
                      {t}
                    </Badge>
                  ))}
                  {conn.tools.length > 3 && (
                    <Badge variant="outline" className="font-normal">
                      +{conn.tools.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusCell connected={conn.connected} c={c} />
              </TableCell>
              <TableCell>
                <Button
                  variant={conn.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => onToggle(conn.id)}
                >
                  {conn.connected ? c.disconnect : c.connect}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
