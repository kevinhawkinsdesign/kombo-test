import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { CalendarClock, Plus, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocale } from "@/lib/locale"
import { useCampaigns } from "@/lib/store"
import { isCampaignScheduled } from "@/lib/format"
import { campaignTabsStore, useOpenCampaignIds } from "@/lib/campaign-tabs"
import { useNewCampaign } from "@/components/campaign/NewCampaignWizard"
import { cn } from "@/lib/utils"
import type { Campaign, CampaignStatus } from "@/lib/types"

const COPY = {
  en: {
    closeTab: (name: string) => `Close ${name}`,
    addTab: "Open another campaign",
    searchToOpen: "Search campaigns to open…",
    noOtherCampaigns: "No other campaigns to open.",
    createNewCampaign: "Create new campaign",
    statusLabel: {
      active: "Active",
      paused: "Paused",
      draft: "Draft",
      completed: "Ended",
    } as Record<CampaignStatus, string>,
    scheduledBadge: "Scheduled",
  },
  es: {
    closeTab: (name: string) => `Cerrar ${name}`,
    addTab: "Abrir otra campaña",
    searchToOpen: "Buscar campañas para abrir…",
    noOtherCampaigns: "No hay más campañas para abrir.",
    createNewCampaign: "Crear nueva campaña",
    statusLabel: {
      active: "Activa",
      paused: "En pausa",
      draft: "Borrador",
      completed: "Finalizada",
    } as Record<CampaignStatus, string>,
    scheduledBadge: "Programada",
  },
  it: {
    closeTab: (name: string) => `Chiudi ${name}`,
    addTab: "Apri un'altra campagna",
    searchToOpen: "Cerca campagne da aprire…",
    noOtherCampaigns: "Nessun'altra campagna da aprire.",
    createNewCampaign: "Crea nuova campagna",
    statusLabel: {
      active: "Attiva",
      paused: "In pausa",
      draft: "Bozza",
      completed: "Terminata",
    } as Record<CampaignStatus, string>,
    scheduledBadge: "Programmata",
  },
  fr: {
    closeTab: (name: string) => `Fermer ${name}`,
    addTab: "Ouvrir une autre campagne",
    searchToOpen: "Rechercher des campagnes à ouvrir…",
    noOtherCampaigns: "Aucune autre campagne à ouvrir.",
    createNewCampaign: "Créer une nouvelle campagne",
    statusLabel: {
      active: "Active",
      paused: "En pause",
      draft: "Brouillon",
      completed: "Terminée",
    } as Record<CampaignStatus, string>,
    scheduledBadge: "Planifiée",
  },
  de: {
    closeTab: (name: string) => `${name} schließen`,
    addTab: "Weitere Kampagne öffnen",
    searchToOpen: "Kampagnen zum Öffnen suchen…",
    noOtherCampaigns: "Keine weiteren Kampagnen zum Öffnen.",
    createNewCampaign: "Neue Kampagne erstellen",
    statusLabel: {
      active: "Aktiv",
      paused: "Pausiert",
      draft: "Entwurf",
      completed: "Beendet",
    } as Record<CampaignStatus, string>,
    scheduledBadge: "Geplant",
  },
  pt: {
    closeTab: (name: string) => `Fechar ${name}`,
    addTab: "Abrir outra campanha",
    searchToOpen: "Pesquisar campanhas para abrir…",
    noOtherCampaigns: "Não há mais campanhas para abrir.",
    createNewCampaign: "Criar nova campanha",
    statusLabel: {
      active: "Ativa",
      paused: "Em pausa",
      draft: "Rascunho",
      completed: "Terminada",
    } as Record<CampaignStatus, string>,
    scheduledBadge: "Agendada",
  },
  pt_BR: {
    closeTab: (name: string) => `Fechar ${name}`,
    addTab: "Abrir outra campanha",
    searchToOpen: "Buscar campanhas para abrir…",
    noOtherCampaigns: "Não há outras campanhas para abrir.",
    createNewCampaign: "Criar nova campanha",
    statusLabel: {
      active: "Ativa",
      paused: "Em pausa",
      draft: "Rascunho",
      completed: "Encerrada",
    } as Record<CampaignStatus, string>,
    scheduledBadge: "Agendada",
  },
} as const

// The active tab doubles as the page header (see CampaignDetail, which
// renders no separate <h1>), so it — and only it — carries the status badge.
const STATUS_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "outline" | "success"
> = {
  active: "success",
  paused: "secondary",
  draft: "outline",
  completed: "default",
}

// Non-active tabs get a small dot instead of the full badge (too wide/noisy
// once several tabs are open) — colored to match the exact same variant each
// status already renders as above: success stays chart-1 green, default
// (completed/"Ended") stays primary purple, and the deliberately unfilled
// secondary/outline variants become a neutral gray fill vs. a hollow ring, so
// "paused" and "draft" both read as muted but stay distinguishable from
// each other.
const STATUS_DOT_CLASS: Record<CampaignStatus, string> = {
  active: "bg-chart-1",
  paused: "bg-muted-foreground",
  draft: "border border-muted-foreground bg-transparent",
  completed: "bg-primary",
}

// Chrome/Lemlist-style tab strip for campaigns the user has open at once —
// mirrors ListTabBar's shape and store pattern (lib/campaign-tabs.ts).
export function CampaignTabBar({ currentId }: { currentId: string }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const campaigns = useCampaigns()
  const { open: openNewCampaign } = useNewCampaign()
  const openIds = useOpenCampaignIds(
    React.useMemo(() => campaigns.map((cm) => cm.id), [campaigns])
  )
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const activeTabRef = React.useRef<HTMLDivElement>(null)

  const tabs = openIds
    .map((id) => campaigns.find((cm) => cm.id === id))
    .filter((cm): cm is Campaign => Boolean(cm))

  // Keep the active tab visible — the strip clips it at the container's
  // right edge otherwise, both on first mount and when navigating between
  // already-open campaigns.
  React.useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [currentId])

  function closeTab(id: string) {
    const remaining = tabs.filter((t) => t.id !== id)
    campaignTabsStore.close(id)
    if (id !== currentId) return
    if (remaining.length > 0) navigate(`/campaigns/${remaining[0].id}`)
    else navigate("/campaigns")
  }

  function openExisting(id: string) {
    campaignTabsStore.open(id)
    setPickerOpen(false)
    setQuery("")
    navigate(`/campaigns/${id}`)
  }

  const q = query.trim().toLowerCase()
  const closedCampaigns = campaigns.filter((cm) => !openIds.includes(cm.id))
  const filteredClosed = q
    ? closedCampaigns.filter((cm) => cm.name.toLowerCase().includes(q))
    : closedCampaigns

  return (
    <div className="scrollbar-thin-x mb-6 flex items-end gap-0.5 border-b">
      {tabs.map((t) => {
        const active = t.id === currentId
        return (
          <div
            key={t.id}
            ref={active ? activeTabRef : undefined}
            className={cn(
              "group relative -mb-px flex shrink-0 items-center gap-2 rounded-t-lg border transition-colors",
              active
                ? "border-border border-b-background bg-background text-foreground px-4 py-2.5 text-base font-semibold"
                : "border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
            )}
          >
            <Link
              to={`/campaigns/${t.id}`}
              className={cn(
                "flex min-w-0 items-center gap-1.5",
                active ? "max-w-64" : "max-w-40"
              )}
            >
              {!active && (
                <span
                  role="img"
                  aria-label={c.statusLabel[t.status]}
                  title={c.statusLabel[t.status]}
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    STATUS_DOT_CLASS[t.status]
                  )}
                />
              )}
              <span className="truncate">{t.name}</span>
            </Link>
            {active &&
              (isCampaignScheduled(t) ? (
                <Badge variant="secondary" className="shrink-0 gap-1">
                  <CalendarClock className="size-3" />
                  {c.scheduledBadge}
                </Badge>
              ) : (
                <Badge variant={STATUS_VARIANT[t.status]} className="shrink-0">
                  {c.statusLabel[t.status]}
                </Badge>
              ))}
            <button
              type="button"
              aria-label={c.closeTab(t.name)}
              onClick={() => closeTab(t.id)}
              className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}

      <Popover
        open={pickerOpen}
        onOpenChange={(v) => {
          setPickerOpen(v)
          if (!v) setQuery("")
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={c.addTab}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground mb-1 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.searchToOpen}
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredClosed.length === 0 ? (
              <p className="text-muted-foreground px-2 py-4 text-center text-sm">
                {c.noOtherCampaigns}
              </p>
            ) : (
              filteredClosed.map((cm) => (
                <button
                  key={cm.id}
                  type="button"
                  onClick={() => openExisting(cm.id)}
                  className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">{cm.name}</span>
                </button>
              ))
            )}
          </div>
          <div className="border-t p-1">
            <button
              type="button"
              onClick={() => {
                setPickerOpen(false)
                setQuery("")
                openNewCampaign()
              }}
              className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium"
            >
              <Plus className="size-4" />
              {c.createNewCampaign}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
