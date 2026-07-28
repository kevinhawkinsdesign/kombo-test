import * as React from "react"
import { ListFilter, Search as SearchIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    noCampaignMatch: "No campaigns match your search.",
    searchCampaigns: "Search campaigns…",
    outcomesGroup: "Outcomes",
    noOutcomeMatch: "No outcomes match your search.",
    searchOutcomes: "Search outcomes…",
    teamGroup: "Owner",
    noRepMatch: "No reps match your search.",
    searchReps: "Search reps…",
    clearAll: "Clear all",
    cancel: "Cancel",
    apply: "Apply",
  },
  es: {
    title: "Filtrar conversaciones",
    description: "Reduce la lista por campaña, resultado o responsable asignado.",
    campaignsGroup: "Campañas",
    noCampaigns: "Aún no hay campañas.",
    noCampaignMatch: "Ninguna campaña coincide con tu búsqueda.",
    searchCampaigns: "Buscar campañas…",
    outcomesGroup: "Resultados",
    noOutcomeMatch: "Ningún resultado coincide con tu búsqueda.",
    searchOutcomes: "Buscar resultados…",
    teamGroup: "Responsable",
    noRepMatch: "Ningún representante coincide con tu búsqueda.",
    searchReps: "Buscar representantes…",
    clearAll: "Limpiar todo",
    cancel: "Cancelar",
    apply: "Aplicar",
  },
  it: {
    title: "Filtra conversazioni",
    description: "Restringi l'elenco per campagna, esito o referente assegnato.",
    campaignsGroup: "Campagne",
    noCampaigns: "Ancora nessuna campagna.",
    noCampaignMatch: "Nessuna campagna corrisponde alla tua ricerca.",
    searchCampaigns: "Cerca campagne…",
    outcomesGroup: "Esiti",
    noOutcomeMatch: "Nessun esito corrisponde alla tua ricerca.",
    searchOutcomes: "Cerca esiti…",
    teamGroup: "Referente",
    noRepMatch: "Nessun rappresentante corrisponde alla tua ricerca.",
    searchReps: "Cerca rappresentanti…",
    clearAll: "Cancella tutto",
    cancel: "Annulla",
    apply: "Applica",
  },
  fr: {
    title: "Filtrer les conversations",
    description: "Affinez la liste par campagne, résultat ou responsable assigné.",
    campaignsGroup: "Campagnes",
    noCampaigns: "Aucune campagne pour le moment.",
    noCampaignMatch: "Aucune campagne ne correspond à votre recherche.",
    searchCampaigns: "Rechercher des campagnes…",
    outcomesGroup: "Résultats",
    noOutcomeMatch: "Aucun résultat ne correspond à votre recherche.",
    searchOutcomes: "Rechercher des résultats…",
    teamGroup: "Responsable",
    noRepMatch: "Aucun commercial ne correspond à votre recherche.",
    searchReps: "Rechercher des commerciaux…",
    clearAll: "Tout effacer",
    cancel: "Annuler",
    apply: "Appliquer",
  },
  de: {
    title: "Unterhaltungen filtern",
    description: "Grenze die Liste nach Kampagne, Ergebnis oder zugewiesenem Mitarbeiter ein.",
    campaignsGroup: "Kampagnen",
    noCampaigns: "Noch keine Kampagnen.",
    noCampaignMatch: "Keine Kampagnen entsprechen deiner Suche.",
    searchCampaigns: "Kampagnen suchen…",
    outcomesGroup: "Ergebnisse",
    noOutcomeMatch: "Keine Ergebnisse entsprechen deiner Suche.",
    searchOutcomes: "Ergebnisse suchen…",
    teamGroup: "Owner",
    noRepMatch: "Keine Vertriebler entsprechen deiner Suche.",
    searchReps: "Vertriebler suchen…",
    clearAll: "Alles löschen",
    cancel: "Abbrechen",
    apply: "Anwenden",
  },
  pt: {
    title: "Filtrar conversas",
    description: "Reduz a lista por campanha, resultado ou responsável atribuído.",
    campaignsGroup: "Campanhas",
    noCampaigns: "Ainda não há campanhas.",
    noCampaignMatch: "Nenhuma campanha corresponde à sua pesquisa.",
    searchCampaigns: "Pesquisar campanhas…",
    outcomesGroup: "Resultados",
    noOutcomeMatch: "Nenhum resultado corresponde à sua pesquisa.",
    searchOutcomes: "Pesquisar resultados…",
    teamGroup: "Responsável",
    noRepMatch: "Nenhum comercial corresponde à sua pesquisa.",
    searchReps: "Pesquisar comerciais…",
    clearAll: "Limpar tudo",
    cancel: "Cancelar",
    apply: "Aplicar",
  },
  pt_BR: {
    title: "Filtrar conversas",
    description: "Reduza a lista por campanha, resultado ou responsável atribuído.",
    campaignsGroup: "Campanhas",
    noCampaigns: "Ainda não há campanhas.",
    noCampaignMatch: "Nenhuma campanha corresponde à sua busca.",
    searchCampaigns: "Buscar campanhas…",
    outcomesGroup: "Resultados",
    noOutcomeMatch: "Nenhum resultado corresponde à sua busca.",
    searchOutcomes: "Buscar resultados…",
    teamGroup: "Responsável",
    noRepMatch: "Nenhum vendedor corresponde à sua busca.",
    searchReps: "Buscar vendedores…",
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

// One filterable checkbox section — mirrors ColumnManager's "Available
// fields" pane (search box + bold uppercase group header) so this dialog
// reads as the same kind of modal, but scoped per-group since Campaigns /
// Outcomes / Assignee are three unrelated lists, not one shared list split
// into sections. Unlike ColumnManager there's no "currently selected, drag
// to reorder" pane — these filters have no meaningful order to preserve, so
// that half of ColumnManager's shape is deliberately left out.
function FilterGroup<T>({
  heading,
  items,
  query,
  onQueryChange,
  searchPlaceholder,
  emptyMessage,
  noMatchMessage,
  getKey,
  getLabel,
  isChecked,
  onToggle,
  renderRow,
}: {
  heading: string
  items: T[]
  query: string
  onQueryChange: (value: string) => void
  searchPlaceholder: string
  emptyMessage: string
  noMatchMessage: string
  getKey: (item: T) => string
  getLabel: (item: T) => string
  isChecked: (item: T) => boolean
  onToggle: (item: T) => void
  renderRow: (item: T) => React.ReactNode
}) {
  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter((item) => getLabel(item).toLowerCase().includes(q)) : items

  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground px-2 py-1 text-[11px] font-medium tracking-wide uppercase">
        {heading}
      </p>
      {items.length === 0 ? (
        <p className="text-muted-foreground px-2 text-xs">{emptyMessage}</p>
      ) : (
        <>
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8 text-sm"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1 text-xs">{noMatchMessage}</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((item) => (
                <label
                  key={getKey(item)}
                  className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm"
                >
                  <Checkbox checked={isChecked(item)} onCheckedChange={() => onToggle(item)} />
                  {renderRow(item)}
                </label>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
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

  // Per-group search — each of the three sections is an unrelated list, so
  // each gets its own independent query rather than one global search.
  const [campaignQuery, setCampaignQuery] = React.useState("")
  const [outcomeQuery, setOutcomeQuery] = React.useState("")
  const [repQuery, setRepQuery] = React.useState("")

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCampaignIds(new Set(filters.campaignIds))
      setOutcomes(new Set(filters.outcomes))
      setAssigneeIds(new Set(filters.assigneeIds))
      setCampaignQuery("")
      setOutcomeQuery("")
      setRepQuery("")
    }
  }

  const totalSelected = campaignIds.size + outcomes.size + assigneeIds.size

  function handleApply() {
    onApply({ campaignIds, outcomes, assigneeIds })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <ListFilter className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-4">
          <FilterGroup
            heading={c.campaignsGroup}
            items={campaigns}
            query={campaignQuery}
            onQueryChange={setCampaignQuery}
            searchPlaceholder={c.searchCampaigns}
            emptyMessage={c.noCampaigns}
            noMatchMessage={c.noCampaignMatch}
            getKey={(camp) => camp.id}
            getLabel={(camp) => camp.name}
            isChecked={(camp) => campaignIds.has(camp.id)}
            onToggle={(camp) => setCampaignIds((s) => toggled(s, camp.id))}
            renderRow={(camp) => <span className="truncate">{camp.name}</span>}
          />

          <FilterGroup
            heading={c.outcomesGroup}
            items={STATUS_ORDER}
            query={outcomeQuery}
            onQueryChange={setOutcomeQuery}
            searchPlaceholder={c.searchOutcomes}
            emptyMessage={c.noOutcomeMatch}
            noMatchMessage={c.noOutcomeMatch}
            getKey={(status) => status}
            getLabel={(status) => STATUS_META[status][locale]}
            isChecked={(status) => outcomes.has(status)}
            onToggle={(status) => setOutcomes((s) => toggled(s, status))}
            renderRow={(status) => {
              const meta = STATUS_META[status]
              return (
                <>
                  <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
                  <span className="truncate">{meta[locale]}</span>
                </>
              )
            }}
          />

          <FilterGroup
            heading={c.teamGroup}
            items={users}
            query={repQuery}
            onQueryChange={setRepQuery}
            searchPlaceholder={c.searchReps}
            emptyMessage={c.noRepMatch}
            noMatchMessage={c.noRepMatch}
            getKey={(u) => u.id}
            getLabel={(u) => u.name}
            isChecked={(u) => assigneeIds.has(u.id)}
            onToggle={(u) => setAssigneeIds((s) => toggled(s, u.id))}
            renderRow={(u) => (
              <>
                <Avatar className="size-5 shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: u.avatarColor, color: "white" }}
                    className="text-[10px] font-medium"
                  >
                    {nameInitials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{u.name}</span>
              </>
            )}
          />
        </div>

        <DialogFooter className="border-t p-3 sm:justify-between">
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
