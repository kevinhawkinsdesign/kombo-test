import * as React from "react"
import { toast } from "sonner"
import {
  Briefcase,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { DealFormDialog } from "@/components/deals/DealFormDialog"
import { useView } from "@/lib/view-context"
import { useDeals, dealStore } from "@/lib/store"
import { getAccount, DEAL_STAGES } from "@/lib/mock-extra"
import { getRep } from "@/lib/team"
import { initials, formatDate, formatMoney as money } from "@/lib/format"
import type { Deal } from "@/lib/types"

function OwnerAvatar({ ownerId }: { ownerId: string }) {
  const rep = getRep(ownerId)
  if (!rep) return null
  const [first, last] = rep.name.split(" ")
  return (
    <Avatar className="size-6">
      <AvatarFallback
        style={{ backgroundColor: rep.avatarColor, color: "white" }}
        className="text-[10px]"
      >
        {initials(first, last)}
      </AvatarFallback>
    </Avatar>
  )
}

function DealCard({
  deal,
  onEdit,
  onDelete,
}: {
  deal: Deal
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
}) {
  const account = getAccount(deal.accountId)
  return (
    <div className="bg-card hover:border-primary/40 space-y-2 rounded-lg border p-3 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{deal.name}</p>
          {account && (
            <p className="text-muted-foreground text-xs">{account.name}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-1 size-7 shrink-0"
              aria-label="Deal actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => onEdit(deal)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            {DEAL_STAGES.map((stage) => (
              <DropdownMenuItem
                key={stage.key}
                disabled={stage.key === deal.stage}
                onSelect={() => {
                  dealStore.move(deal.id, stage.key)
                  toast.success(`Moved to ${stage.label}`)
                }}
              >
                {stage.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(deal)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="font-semibold tabular-nums">{money(deal.value)}</p>

      <div className="space-y-1">
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${deal.probability}%` }}
          />
        </div>
        <p className="text-muted-foreground text-xs tabular-nums">
          {deal.probability}%
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <CalendarDays className="size-3.5" />
          {formatDate(deal.closeDate)}
        </span>
        <OwnerAvatar ownerId={deal.ownerId} />
      </div>
    </div>
  )
}

export default function Deals() {
  const { impersonatingId } = useView()
  const deals = useDeals()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingDeal, setEditingDeal] = React.useState<Deal | undefined>(
    undefined
  )
  const [deletingDeal, setDeletingDeal] = React.useState<Deal | null>(null)

  const scoped = impersonatingId
    ? deals.filter((d) => d.ownerId === impersonatingId)
    : deals

  const openDeals = scoped.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  )
  const openPipeline = openDeals.reduce((sum, d) => sum + d.value, 0)
  const weightedForecast = openDeals.reduce(
    (sum, d) => sum + (d.value * d.probability) / 100,
    0
  )

  const summary = [
    { label: "Open pipeline", value: money(openPipeline) },
    { label: "Weighted forecast", value: money(Math.round(weightedForecast)) },
    { label: "Open deals", value: String(openDeals.length) },
  ]

  function openCreate() {
    setEditingDeal(undefined)
    setFormOpen(true)
  }

  function openEdit(deal: Deal) {
    setEditingDeal(deal)
    setFormOpen(true)
  }

  return (
    <Page>
      <PageHeading
        title="Deals"
        description="Your pipeline by stage."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New deal
          </Button>
        }
      />

      <FeatureIntro
        featureKey="deals"
        icon={Briefcase}
        title="Manage your pipeline"
        description="Track every open deal through your stages and forecast with confidence."
        points={[
          "Drag deals across stages",
          "Weighted forecast by win probability",
          "Spot stalled deals before they slip",
        ]}
        className="mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = scoped.filter((d) => d.stage === stage.key)
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
          return (
            <div
              key={stage.key}
              className="bg-muted/40 w-[280px] min-w-[280px] shrink-0 space-y-3 rounded-lg p-2"
            >
              <div className="flex items-center gap-2 px-1 pt-1">
                <span className="font-medium">{stage.label}</span>
                <Badge variant="secondary" className="tabular-nums">
                  {stageDeals.length}
                </Badge>
                <span className="text-muted-foreground ml-auto text-sm tabular-nums">
                  {money(stageValue)}
                </span>
              </div>

              <div className="space-y-2">
                {stageDeals.length > 0 ? (
                  stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onEdit={openEdit}
                      onDelete={setDeletingDeal}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground px-1 py-6 text-center text-xs">
                    No deals
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <DealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
      />

      <ConfirmDialog
        open={deletingDeal !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingDeal(null)
        }}
        title="Delete deal?"
        description={
          deletingDeal
            ? `"${deletingDeal.name}" will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deletingDeal) {
            dealStore.remove(deletingDeal.id)
            toast.success("Deal deleted")
          }
        }}
      />
    </Page>
  )
}
