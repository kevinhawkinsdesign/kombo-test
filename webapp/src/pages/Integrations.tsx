import * as React from "react"
import { toast } from "sonner"
import { Check, Plug, Wrench, Sparkles } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { integrations as seed } from "@/lib/mock-data"
import { mcpConnections } from "@/lib/mock-network"
import type { McpConnection } from "@/lib/mock-network"
import type { Integration } from "@/lib/types"

const CATEGORY_LABELS: Record<Integration["category"], string> = {
  crm: "CRM",
  email: "Email",
  calendar: "Calendar",
  social: "Social",
  outreach: "Outreach",
}

export default function Integrations() {
  const [items, setItems] = React.useState<Integration[]>(seed)
  const [mcp, setMcp] = React.useState<McpConnection[]>(mcpConnections)

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const connected = !it.connected
        toast.success(
          connected ? `${it.name} connected` : `${it.name} disconnected`
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
            ? `${it.name} connected — Kai can now use it`
            : `${it.name} disconnected`
        )
        return { ...it, connected }
      })
    )
  }

  return (
    <Page>
      <PageHeading
        title="Integrations"
        description="Connect Kombo to the tools your team already uses."
      />
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
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    {CATEGORY_LABELS[it.category]}
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
                {it.connected ? "Disconnect" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="text-primary size-5" />
          <h2 className="text-lg font-semibold tracking-tight">
            AI tool connections
          </h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          MCP servers Kai can call to take action on your behalf — search your
          CRM, book meetings, draft and send outreach.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mcp.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 flex size-11 items-center justify-center rounded-xl">
                    <Wrench className="text-primary size-5" />
                  </div>
                  {c.connected ? (
                    <Badge variant="success" className="gap-1">
                      <Check className="size-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-normal">
                      {c.category}
                    </Badge>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {c.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tools.map((t) => (
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
                  variant={c.connected ? "outline" : "default"}
                  className="w-full"
                  onClick={() => toggleMcp(c.id)}
                >
                  {c.connected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  )
}
