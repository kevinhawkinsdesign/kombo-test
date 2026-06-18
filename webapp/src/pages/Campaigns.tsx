import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Mail,
  Play,
  Pause,
  MoreHorizontal,
  Clock,
  Send,
  Workflow,
  Sparkles,
  RefreshCw,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useCampaigns, useLists, campaignStore } from "@/lib/store"
import { formatDate } from "@/lib/format"
import { useLocale } from "@/lib/locale"
import type { Campaign, CampaignStatus } from "@/lib/types"

interface CampaignAudience {
  id: string
  name: string
  continuous: boolean
}

const COPY = {
  en: {
    statusLabel: {
      active: "Active",
      paused: "Paused",
      draft: "Draft",
      completed: "Completed",
    } as Record<CampaignStatus, string>,
    createdSteps: (date: string, steps: number) =>
      `Created ${date} · ${steps} steps`,
    fedBy: (name: string) => `Fed by ${name}`,
    continuous: "Continuous",
    pause: "Pause",
    activate: "Activate",
    campaignOptions: "Campaign options",
    editSequence: "Edit sequence",
    duplicate: "Duplicate",
    archive: "Archive",
    enrolled: "Enrolled",
    opened: "Opened",
    replied: "Replied",
    meetings: "Meetings",
    paused: (name: string) => `${name} paused`,
    activated: (name: string) => `${name} activated`,
    newCampaign: "New campaign",
    createIntro: "Give your campaign a name to get started.",
    campaignName: "Campaign name",
    namePlaceholder: "Q3 outbound — VP Sales",
    cancel: "Cancel",
    create: "Create",
    campaignCreated: "Campaign created",
    campaignDuplicated: "Campaign duplicated",
    campaignDeleted: "Campaign deleted",
    pageTitle: "Campaigns",
    pageDescription: "Multi-channel sequences across email and LinkedIn.",
    buildSequence: "Build sequence",
    introTitle: "Run multi-step sequences",
    introDescription:
      "Reach prospects across email and LinkedIn with timing that earns replies.",
    introPoints: [
      "Multi-channel, multi-step sequences",
      "A/B test your messaging",
      "Auto-pause the moment someone replies",
      "Track opens, replies & meetings booked",
    ],
    deleteTitle: "Delete campaign?",
    deleteDescription: (name: string) =>
      `"${name}" and its sequence will be permanently removed.`,
    delete: "Delete",
  },
  es: {
    statusLabel: {
      active: "Activa",
      paused: "En pausa",
      draft: "Borrador",
      completed: "Completada",
    } as Record<CampaignStatus, string>,
    createdSteps: (date: string, steps: number) =>
      `Creada el ${date} · ${steps} pasos`,
    fedBy: (name: string) => `Alimentada por ${name}`,
    continuous: "Continua",
    pause: "Pausar",
    activate: "Activar",
    campaignOptions: "Opciones de campaña",
    editSequence: "Editar secuencia",
    duplicate: "Duplicar",
    archive: "Archivar",
    enrolled: "Inscritos",
    opened: "Aperturas",
    replied: "Respuestas",
    meetings: "Reuniones",
    paused: (name: string) => `${name} en pausa`,
    activated: (name: string) => `${name} activada`,
    newCampaign: "Nueva campaña",
    createIntro: "Asigna un nombre a tu campaña para empezar.",
    campaignName: "Nombre de la campaña",
    namePlaceholder: "Outbound Q3 — VP de Ventas",
    cancel: "Cancelar",
    create: "Crear",
    campaignCreated: "Campaña creada",
    campaignDuplicated: "Campaña duplicada",
    campaignDeleted: "Campaña eliminada",
    pageTitle: "Campañas",
    pageDescription: "Secuencias multicanal por correo y LinkedIn.",
    buildSequence: "Crear secuencia",
    introTitle: "Ejecuta secuencias de varios pasos",
    introDescription:
      "Llega a tus prospectos por correo y LinkedIn con un ritmo que consigue respuestas.",
    introPoints: [
      "Secuencias multicanal y de varios pasos",
      "Haz pruebas A/B de tus mensajes",
      "Pausa automática en cuanto alguien responde",
      "Mide aperturas, respuestas y reuniones agendadas",
    ],
    deleteTitle: "¿Eliminar campaña?",
    deleteDescription: (name: string) =>
      `«${name}» y su secuencia se eliminarán de forma permanente.`,
    delete: "Eliminar",
  },
} as const

const STATUS_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "outline" | "success"
> = {
  active: "success",
  paused: "secondary",
  draft: "outline",
  completed: "default",
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  )
}

function CampaignCard({
  campaign,
  audience,
  onDuplicate,
  onDelete,
}: {
  campaign: Campaign
  audience?: CampaignAudience
  onDuplicate: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const replyRate = campaign.enrolled
    ? Math.round((campaign.replied / campaign.enrolled) * 100)
    : 0

  function toggleStatus() {
    const nextStatus: CampaignStatus =
      campaign.status === "active" ? "paused" : "active"
    campaignStore.update(campaign.id, { status: nextStatus })
    toast.success(
      nextStatus === "paused"
        ? c.paused(campaign.name)
        : c.activated(campaign.name)
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              <Link
                to={`/campaigns/${campaign.id}`}
                className="hover:text-primary"
              >
                {campaign.name}
              </Link>
            </CardTitle>
            <Badge variant={STATUS_VARIANT[campaign.status]}>
              {c.statusLabel[campaign.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {c.createdSteps(
              formatDate(campaign.createdAt),
              campaign.steps.length
            )}
          </p>
          {audience && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <Link to={`/lists/${audience.id}`}>
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Sparkles className="size-3" />
                  {c.fedBy(audience.name)}
                </Badge>
              </Link>
              {audience.continuous && (
                <Badge
                  variant="secondary"
                  className="text-chart-1 gap-1 font-normal"
                >
                  <RefreshCw className="size-3" />
                  {c.continuous}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={toggleStatus}>
            {campaign.status === "active" ? (
              <>
                <Pause className="size-4" />
                {c.pause}
              </>
            ) : (
              <>
                <Play className="size-4" />
                {c.activate}
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={c.campaignOptions}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/campaigns/${campaign.id}`}>{c.editSequence}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(campaign)}>
                {c.duplicate}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(campaign)}
              >
                {c.archive}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          <Metric label={c.enrolled} value={campaign.enrolled} />
          <Metric label={c.opened} value={campaign.opened} />
          <Metric label={c.replied} value={`${replyRate}%`} />
          <Metric label={c.meetings} value={campaign.meetings} />
        </div>

        {campaign.steps.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              {campaign.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 text-sm">
                  <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {i + 1}
                  </span>
                  {step.channel === "email" ? (
                    <Mail className="text-muted-foreground size-4" />
                  ) : (
                    <LinkedinIcon className="text-muted-foreground size-4" />
                  )}
                  <span className="truncate">
                    {step.subject ?? step.body}
                  </span>
                  {step.delayDays > 0 && (
                    <span className="text-muted-foreground ml-auto flex shrink-0 items-center gap-1 text-xs">
                      <Clock className="size-3" />+{step.delayDays}d
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CreateCampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const [name, setName] = React.useState("")

  // Reset the form whenever the dialog transitions to open. Adjusting state
  // during render is the React-recommended pattern over a cascading effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName("")
    }
  }

  const trimmedName = name.trim()

  function handleCreate() {
    if (!trimmedName) return
    const campaign = campaignStore.create({ name: trimmedName })
    toast.success(c.campaignCreated)
    onOpenChange(false)
    navigate(`/campaigns/${campaign.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{c.newCampaign}</DialogTitle>
          <DialogDescription>{c.createIntro}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleCreate()
          }}
          className="space-y-2"
        >
          <Label htmlFor="campaign-name">{c.campaignName}</Label>
          <Input
            id="campaign-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={c.namePlaceholder}
            autoFocus
          />
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {c.cancel}
            </Button>
            <Button type="submit" variant="volt" disabled={!trimmedName}>
              {c.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Campaigns() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const campaigns = useCampaigns()
  const lists = useLists()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState<Campaign | null>(
    null
  )

  // Map each campaign to the playlist that feeds it (if any).
  const audienceByCampaign = React.useMemo(() => {
    const map = new Map<string, CampaignAudience>()
    for (const list of lists) {
      if (list.campaignId && !map.has(list.campaignId)) {
        map.set(list.campaignId, {
          id: list.id,
          name: list.name,
          continuous: list.sendMode === "continuous",
        })
      }
    }
    return map
  }, [lists])

  function handleDuplicate(campaign: Campaign) {
    const copySuffix = locale === "es" ? "(copia)" : "(copy)"
    campaignStore.create({
      ...campaign,
      name: `${campaign.name} ${copySuffix}`,
    })
    toast.success(c.campaignDuplicated)
  }

  function handleDelete() {
    if (!pendingDelete) return
    campaignStore.remove(pendingDelete.id)
    toast.success(c.campaignDeleted)
  }

  return (
    <Page>
      <PageHeading
        title={c.pageTitle}
        description={c.pageDescription}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/sequence-builder">
                <Workflow className="size-4" />
                {c.buildSequence}
              </Link>
            </Button>
            <Button variant="volt" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              {c.newCampaign}
            </Button>
          </div>
        }
      />
      <FeatureIntro
        featureKey="campaigns"
        icon={Send}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            audience={audienceByCampaign.get(campaign.id)}
            onDuplicate={handleDuplicate}
            onDelete={setPendingDelete}
          />
        ))}
      </div>

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title={c.deleteTitle}
        description={
          pendingDelete ? c.deleteDescription(pendingDelete.name) : undefined
        }
        confirmLabel={c.delete}
        destructive
        onConfirm={handleDelete}
      />
    </Page>
  )
}
