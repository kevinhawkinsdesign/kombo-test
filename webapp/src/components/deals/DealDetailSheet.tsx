import { CalendarDays, Pencil, User } from "lucide-react"

import { useLocale } from "@/lib/locale"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAccount } from "@/lib/mock-extra"
import { getRep } from "@/lib/team"
import { initials, formatDate, formatMoney as money } from "@/lib/format"
import type { Deal } from "@/lib/types"

const COPY = {
  en: {
    closeDate: "Close date",
    owner: "Owner",
    contact: "Contact",
    winProbability: "Win probability",
    edit: "Edit",
    close: "Close",
  },
  es: {
    closeDate: "Fecha de cierre",
    owner: "Responsable",
    contact: "Contacto",
    winProbability: "Probabilidad de cierre",
    edit: "Editar",
    close: "Cerrar",
  },
} as const

const STAGE_VARIANT: Record<
  Deal["stage"],
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  interested: "outline",
  meeting_booked: "secondary",
  needs_review: "secondary",
  qualified: "default",
  won: "success",
  not_interested: "destructive",
  disqualified: "destructive",
  lost: "destructive",
}

// Read-only "quick view" opened by clicking a deal card/row — distinct from
// DealFormDialog, which is the edit form. Reached via an explicit Edit
// button here, or the existing "…" menu's Edit item.
export function DealDetailSheet({
  deal,
  open,
  onOpenChange,
  onEdit,
  stageLabel,
}: {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (deal: Deal) => void
  stageLabel: Record<Deal["stage"], string>
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  if (!deal) return null
  const account = getAccount(deal.accountId)
  const rep = getRep(deal.ownerId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{deal.name}</SheetTitle>
          {account && <SheetDescription>{account.name}</SheetDescription>}
        </SheetHeader>

        <div className="space-y-5 px-4">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold tabular-nums">{money(deal.value)}</p>
            <Badge variant={STAGE_VARIANT[deal.stage]} className="font-normal">
              {stageLabel[deal.stage]}
            </Badge>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {c.closeDate}
              </dt>
              <dd>{formatDate(deal.closeDate)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <User className="size-4" />
                {c.owner}
              </dt>
              <dd className="flex items-center gap-2">
                {rep &&
                  (() => {
                    const [first, last] = rep.name.split(" ")
                    return (
                      <>
                        <Avatar className="size-5">
                          <AvatarFallback
                            style={{ backgroundColor: rep.avatarColor, color: "white" }}
                            className="text-[9px]"
                          >
                            {initials(first, last)}
                          </AvatarFallback>
                        </Avatar>
                        {rep.name}
                      </>
                    )
                  })()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{c.contact}</dt>
              <dd>{deal.contactName}</dd>
            </div>
          </dl>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{c.winProbability}</span>
              <span className="tabular-nums">{deal.probability}%</span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${deal.probability}%` }}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.close}
          </Button>
          <Button variant="volt" onClick={() => onEdit(deal)}>
            <Pencil className="size-4" />
            {c.edit}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
