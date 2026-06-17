import * as React from "react"
import { toast } from "sonner"
import { Check, Plug } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { integrations as seed } from "@/lib/mock-data"
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
    </Page>
  )
}
