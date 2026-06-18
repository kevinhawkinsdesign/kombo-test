import * as React from "react"
import { toast } from "sonner"
import { Check, Plug, Wrench, Sparkles } from "lucide-react"

import { useLocale, type Locale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { integrations as seed } from "@/lib/mock-data"
import { mcpConnections } from "@/lib/mock-network"
import type { McpConnection } from "@/lib/mock-network"
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
  },
} as const

export default function Integrations() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [items, setItems] = React.useState<Integration[]>(seed)
  const [mcp, setMcp] = React.useState<McpConnection[]>(mcpConnections)

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
      <PageHeading title={c.title} description={c.description} />
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
      </div>
    </Page>
  )
}
