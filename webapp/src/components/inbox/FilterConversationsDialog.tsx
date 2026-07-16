import * as React from "react"
import { ListFilter } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { assignableUsers } from "@/lib/task-people"
import { STATUS_META, STATUS_ORDER } from "@/lib/conv-status"
import { initials } from "@/lib/format"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { ConversationFilters } from "@/lib/conversation-filters"
import type { Campaign } from "@/lib/types"

const COPY = {
  en: {
    title: "Filter conversations",
    description: "Narrow the list by campaign, outcome, or assigned rep.",
    campaignsGroup: "Campaigns",
    noCampaigns: "No campaigns yet.",
    outcomesGroup: "Outcomes",
    teamGroup: "Owner",
    clearAll: "Clear all",
    cancel: "Cancel",
    apply: "Apply",
  },
  es: {
    title: "Filtrar conversaciones",
    description: "Reduce la lista por campaña, resultado o responsable asignado.",
    campaignsGroup: "Campañas",
    noCampaigns: "Aún no hay campañas.",
    outcomesGroup: "Resultados",
    teamGroup: "Responsable",
    clearAll: "Limpiar todo",
    cancel: "Cancelar",
    apply: "Aplicar",
  },
  it: {
    title: "Filtra conversazioni",
    description: "Restringi l'elenco per campagna, esito o referente assegnato.",
    campaignsGroup: "Campagne",
    noCampaigns: "Ancora nessuna campagna.",
    outcomesGroup: "Esiti",
    teamGroup: "Referente",
    clearAll: "Cancella tutto",
    cancel: "Annulla",
    apply: "Applica",
  },
  fr: {
    title: "Filtrer les conversations",
    description: "Affinez la liste par campagne, résultat ou responsable assigné.",
    campaignsGroup: "Campagnes",
    noCampaigns: "Aucune campagne pour le moment.",
    outcomesGroup: "Résultats",
    teamGroup: "Responsable",
    clearAll: "Tout effacer",
    cancel: "Annuler",
    apply: "Appliquer",
  },
  de: {
    title: "Unterhaltungen filtern",
    description: "Grenze die Liste nach Kampagne, Ergebnis oder zugewiesenem Mitarbeiter ein.",
    campaignsGroup: "Kampagnen",
    noCampaigns: "Noch keine Kampagnen.",
    outcomesGroup: "Ergebnisse",
    teamGroup: "Owner",
    clearAll: "Alles löschen",
    cancel: "Abbrechen",
    apply: "Anwenden",
  },
  pt: {
    title: "Filtrar conversas",
    description: "Reduz a lista por campanha, resultado ou responsável atribuído.",
    campaignsGroup: "Campanhas",
    noCampaigns: "Ainda não há campanhas.",
    outcomesGroup: "Resultados",
    teamGroup: "Responsável",
    clearAll: "Limpar tudo",
    cancel: "Cancelar",
    apply: "Aplicar",
  },
  pt_BR: {
    title: "Filtrar conversas",
    description: "Reduza a lista por campanha, resultado ou responsável atribuído.",
    campaignsGroup: "Campanhas",
    noCampaigns: "Ainda não há campanhas.",
    outcomesGroup: "Resultados",
    teamGroup: "Responsável",
    clearAll: "Limpar tudo",
    cancel: "Cancelar",
    apply: "Aplicar",
  },
} as const

function nameInitials(name: string): string {
  const [first, ...rest] = name.split(" ")
  return initials(first, rest.at(-1))
}

function toggled<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function FilterConversationsDialog({
  open,
  onOpenChange,
  campaigns,
  filters,
  onApply,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  campaigns: Campaign[]
  filters: ConversationFilters
  onApply: (next: ConversationFilters) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const users = assignableUsers()

  const [campaignIds, setCampaignIds] = React.useState(filters.campaignIds)
  const [outcomes, setOutcomes] = React.useState(filters.outcomes)
  const [assigneeIds, setAssigneeIds] = React.useState(filters.assigneeIds)

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCampaignIds(new Set(filters.campaignIds))
      setOutcomes(new Set(filters.outcomes))
      setAssigneeIds(new Set(filters.assigneeIds))
    }
  }

  const totalSelected = campaignIds.size + outcomes.size + assigneeIds.size

  function handleApply() {
    onApply({ campaignIds, outcomes, assigneeIds })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <ListFilter className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <p className="text-muted-foreground px-1 text-xs font-medium">
              {c.campaignsGroup}
            </p>
            {campaigns.length === 0 ? (
              <p className="text-muted-foreground px-1 text-xs">{c.noCampaigns}</p>
            ) : (
              campaigns.map((camp) => (
                <label
                  key={camp.id}
                  className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm"
                >
                  <Checkbox
                    checked={campaignIds.has(camp.id)}
                    onCheckedChange={() => setCampaignIds((s) => toggled(s, camp.id))}
                  />
                  <span className="truncate">{camp.name}</span>
                </label>
              ))
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground px-1 text-xs font-medium">
              {c.outcomesGroup}
            </p>
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status]
              return (
                <label
                  key={status}
                  className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm"
                >
                  <Checkbox
                    checked={outcomes.has(status)}
                    onCheckedChange={() => setOutcomes((s) => toggled(s, status))}
                  />
                  <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
                  <span className="truncate">{meta[locale]}</span>
                </label>
              )
            })}
          </div>

          <div className="space-y-1.5">
            <p className="text-muted-foreground px-1 text-xs font-medium">{c.teamGroup}</p>
            {users.map((u) => (
              <label
                key={u.id}
                className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm"
              >
                <Checkbox
                  checked={assigneeIds.has(u.id)}
                  onCheckedChange={() => setAssigneeIds((s) => toggled(s, u.id))}
                />
                <Avatar className="size-5 shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: u.avatarColor, color: "white" }}
                    className="text-[10px] font-medium"
                  >
                    {nameInitials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{u.name}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            disabled={totalSelected === 0}
            onClick={() => {
              setCampaignIds(new Set())
              setOutcomes(new Set())
              setAssigneeIds(new Set())
            }}
          >
            {c.clearAll}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={handleApply}>
              {c.apply}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
