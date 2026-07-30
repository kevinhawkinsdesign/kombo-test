import * as React from "react"
import { Clock, ListChecks, ListFilter, Megaphone, Star, Users } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Segmented } from "@/components/common/Segmented"
import { MultiSelectCombobox } from "@/components/common/MultiSelectCombobox"
import { assignableUsers } from "@/lib/task-people"
import { STATUS_META, STATUS_ORDER } from "@/lib/conv-status"
import { initials } from "@/lib/format"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { AvailabilityFilter, ConversationFilters } from "@/lib/conversation-filters"
import type { Campaign, ProspectStatus } from "@/lib/types"

const PROSPECT_STATUS_ORDER: ProspectStatus[] = [
  "new",
  "contacted",
  "replied",
  "meeting",
  "customer",
  "not_interested",
]

const COPY = {
  en: {
    title: "Filter conversations",
    description: "Narrow the list by campaign, outcome, status, availability, or assigned rep.",
    campaignsGroup: "Selected campaigns",
    campaignsPlaceholder: "Select one or more campaigns",
    noCampaigns: "No campaigns yet.",
    noCampaignMatch: "No campaigns match your search.",
    searchCampaigns: "Search campaigns…",
    outcomesGroup: "Outcomes",
    outcomesPlaceholder: "Select one or more outcomes",
    noOutcomeMatch: "No outcomes match your search.",
    searchOutcomes: "Search outcomes…",
    statusGroup: "Status",
    statusPlaceholder: "Select one or more statuses",
    noStatusMatch: "No statuses match your search.",
    searchStatuses: "Search statuses…",
    availabilityGroup: "Availability",
    availabilityAny: "Any",
    availabilityOnly: "Only out-of-office",
    availabilityExclude: "Exclude out-of-office",
    teamGroup: "Owner",
    teamPlaceholder: "Select one or more reps",
    noRepMatch: "No reps match your search.",
    searchReps: "Search reps…",
    clearAllCount: (n: number) => `Clear all (${n})`,
    clearAll: "Clear all",
    cancel: "Cancel",
    apply: "Apply",
    statuses: {
      new: "New",
      contacted: "Contacted",
      replied: "Replied",
      meeting: "Meeting",
      customer: "Customer",
      not_interested: "Not interested",
    },
  },
  es: {
    title: "Filtrar conversaciones",
    description: "Reduce la lista por campaña, resultado, estado, disponibilidad o responsable asignado.",
    campaignsGroup: "Campañas seleccionadas",
    campaignsPlaceholder: "Selecciona una o más campañas",
    noCampaigns: "Aún no hay campañas.",
    noCampaignMatch: "Ninguna campaña coincide con tu búsqueda.",
    searchCampaigns: "Buscar campañas…",
    outcomesGroup: "Resultados",
    outcomesPlaceholder: "Selecciona uno o más resultados",
    noOutcomeMatch: "Ningún resultado coincide con tu búsqueda.",
    searchOutcomes: "Buscar resultados…",
    statusGroup: "Estado",
    statusPlaceholder: "Selecciona uno o más estados",
    noStatusMatch: "Ningún estado coincide con tu búsqueda.",
    searchStatuses: "Buscar estados…",
    availabilityGroup: "Disponibilidad",
    availabilityAny: "Cualquiera",
    availabilityOnly: "Solo fuera de la oficina",
    availabilityExclude: "Excluir fuera de la oficina",
    teamGroup: "Responsable",
    teamPlaceholder: "Selecciona uno o más representantes",
    noRepMatch: "Ningún representante coincide con tu búsqueda.",
    searchReps: "Buscar representantes…",
    clearAllCount: (n: number) => `Limpiar todo (${n})`,
    clearAll: "Limpiar todo",
    cancel: "Cancelar",
    apply: "Aplicar",
    statuses: {
      new: "Nuevo",
      contacted: "Contactado",
      replied: "Respondió",
      meeting: "Reunión",
      customer: "Cliente",
      not_interested: "No interesado",
    },
  },
  it: {
    title: "Filtra conversazioni",
    description: "Restringi l'elenco per campagna, esito, stato, disponibilità o referente assegnato.",
    campaignsGroup: "Campagne selezionate",
    campaignsPlaceholder: "Seleziona una o più campagne",
    noCampaigns: "Ancora nessuna campagna.",
    noCampaignMatch: "Nessuna campagna corrisponde alla tua ricerca.",
    searchCampaigns: "Cerca campagne…",
    outcomesGroup: "Esiti",
    outcomesPlaceholder: "Seleziona uno o più esiti",
    noOutcomeMatch: "Nessun esito corrisponde alla tua ricerca.",
    searchOutcomes: "Cerca esiti…",
    statusGroup: "Stato",
    statusPlaceholder: "Seleziona uno o più stati",
    noStatusMatch: "Nessuno stato corrisponde alla tua ricerca.",
    searchStatuses: "Cerca stati…",
    availabilityGroup: "Disponibilità",
    availabilityAny: "Qualsiasi",
    availabilityOnly: "Solo fuori sede",
    availabilityExclude: "Escludi fuori sede",
    teamGroup: "Referente",
    teamPlaceholder: "Seleziona uno o più referenti",
    noRepMatch: "Nessun rappresentante corrisponde alla tua ricerca.",
    searchReps: "Cerca rappresentanti…",
    clearAllCount: (n: number) => `Cancella tutto (${n})`,
    clearAll: "Cancella tutto",
    cancel: "Annulla",
    apply: "Applica",
    statuses: {
      new: "Nuovo",
      contacted: "Contattato",
      replied: "Ha risposto",
      meeting: "Riunione",
      customer: "Cliente",
      not_interested: "Non interessato",
    },
  },
  fr: {
    title: "Filtrer les conversations",
    description: "Affinez la liste par campagne, résultat, statut, disponibilité ou responsable assigné.",
    campaignsGroup: "Campagnes sélectionnées",
    campaignsPlaceholder: "Sélectionnez une ou plusieurs campagnes",
    noCampaigns: "Aucune campagne pour le moment.",
    noCampaignMatch: "Aucune campagne ne correspond à votre recherche.",
    searchCampaigns: "Rechercher des campagnes…",
    outcomesGroup: "Résultats",
    outcomesPlaceholder: "Sélectionnez un ou plusieurs résultats",
    noOutcomeMatch: "Aucun résultat ne correspond à votre recherche.",
    searchOutcomes: "Rechercher des résultats…",
    statusGroup: "Statut",
    statusPlaceholder: "Sélectionnez un ou plusieurs statuts",
    noStatusMatch: "Aucun statut ne correspond à votre recherche.",
    searchStatuses: "Rechercher des statuts…",
    availabilityGroup: "Disponibilité",
    availabilityAny: "Toutes",
    availabilityOnly: "Absents du bureau uniquement",
    availabilityExclude: "Exclure les absents du bureau",
    teamGroup: "Responsable",
    teamPlaceholder: "Sélectionnez un ou plusieurs commerciaux",
    noRepMatch: "Aucun commercial ne correspond à votre recherche.",
    searchReps: "Rechercher des commerciaux…",
    clearAllCount: (n: number) => `Tout effacer (${n})`,
    clearAll: "Tout effacer",
    cancel: "Annuler",
    apply: "Appliquer",
    statuses: {
      new: "Nouveau",
      contacted: "Contacté",
      replied: "A répondu",
      meeting: "Rendez-vous",
      customer: "Client",
      not_interested: "Pas intéressé",
    },
  },
  de: {
    title: "Unterhaltungen filtern",
    description: "Grenze die Liste nach Kampagne, Ergebnis, Status, Verfügbarkeit oder zugewiesenem Mitarbeiter ein.",
    campaignsGroup: "Ausgewählte Kampagnen",
    campaignsPlaceholder: "Eine oder mehrere Kampagnen auswählen",
    noCampaigns: "Noch keine Kampagnen.",
    noCampaignMatch: "Keine Kampagnen entsprechen deiner Suche.",
    searchCampaigns: "Kampagnen suchen…",
    outcomesGroup: "Ergebnisse",
    outcomesPlaceholder: "Ein oder mehrere Ergebnisse auswählen",
    noOutcomeMatch: "Keine Ergebnisse entsprechen deiner Suche.",
    searchOutcomes: "Ergebnisse suchen…",
    statusGroup: "Status",
    statusPlaceholder: "Einen oder mehrere Status auswählen",
    noStatusMatch: "Kein Status entspricht deiner Suche.",
    searchStatuses: "Status suchen…",
    availabilityGroup: "Verfügbarkeit",
    availabilityAny: "Beliebig",
    availabilityOnly: "Nur abwesend",
    availabilityExclude: "Abwesende ausschließen",
    teamGroup: "Owner",
    teamPlaceholder: "Einen oder mehrere Vertriebler auswählen",
    noRepMatch: "Keine Vertriebler entsprechen deiner Suche.",
    searchReps: "Vertriebler suchen…",
    clearAllCount: (n: number) => `Alles löschen (${n})`,
    clearAll: "Alles löschen",
    cancel: "Abbrechen",
    apply: "Anwenden",
    statuses: {
      new: "Neu",
      contacted: "Kontaktiert",
      replied: "Geantwortet",
      meeting: "Meeting",
      customer: "Kunde",
      not_interested: "Nicht interessiert",
    },
  },
  pt: {
    title: "Filtrar conversas",
    description: "Reduz a lista por campanha, resultado, estado, disponibilidade ou responsável atribuído.",
    campaignsGroup: "Campanhas selecionadas",
    campaignsPlaceholder: "Seleciona uma ou mais campanhas",
    noCampaigns: "Ainda não há campanhas.",
    noCampaignMatch: "Nenhuma campanha corresponde à sua pesquisa.",
    searchCampaigns: "Pesquisar campanhas…",
    outcomesGroup: "Resultados",
    outcomesPlaceholder: "Seleciona um ou mais resultados",
    noOutcomeMatch: "Nenhum resultado corresponde à sua pesquisa.",
    searchOutcomes: "Pesquisar resultados…",
    statusGroup: "Estado",
    statusPlaceholder: "Seleciona um ou mais estados",
    noStatusMatch: "Nenhum estado corresponde à sua pesquisa.",
    searchStatuses: "Pesquisar estados…",
    availabilityGroup: "Disponibilidade",
    availabilityAny: "Qualquer",
    availabilityOnly: "Apenas ausentes",
    availabilityExclude: "Excluir ausentes",
    teamGroup: "Responsável",
    teamPlaceholder: "Seleciona um ou mais comerciais",
    noRepMatch: "Nenhum comercial corresponde à sua pesquisa.",
    searchReps: "Pesquisar comerciais…",
    clearAllCount: (n: number) => `Limpar tudo (${n})`,
    clearAll: "Limpar tudo",
    cancel: "Cancelar",
    apply: "Aplicar",
    statuses: {
      new: "Novo",
      contacted: "Contactado",
      replied: "Respondeu",
      meeting: "Reunião",
      customer: "Cliente",
      not_interested: "Não interessado",
    },
  },
  pt_BR: {
    title: "Filtrar conversas",
    description: "Reduza a lista por campanha, resultado, status, disponibilidade ou responsável atribuído.",
    campaignsGroup: "Campanhas selecionadas",
    campaignsPlaceholder: "Selecione uma ou mais campanhas",
    noCampaigns: "Ainda não há campanhas.",
    noCampaignMatch: "Nenhuma campanha corresponde à sua busca.",
    searchCampaigns: "Buscar campanhas…",
    outcomesGroup: "Resultados",
    outcomesPlaceholder: "Selecione um ou mais resultados",
    noOutcomeMatch: "Nenhum resultado corresponde à sua busca.",
    searchOutcomes: "Buscar resultados…",
    statusGroup: "Status",
    statusPlaceholder: "Selecione um ou mais status",
    noStatusMatch: "Nenhum status corresponde à sua busca.",
    searchStatuses: "Buscar status…",
    availabilityGroup: "Disponibilidade",
    availabilityAny: "Qualquer",
    availabilityOnly: "Apenas ausentes",
    availabilityExclude: "Excluir ausentes",
    teamGroup: "Responsável",
    teamPlaceholder: "Selecione um ou mais vendedores",
    noRepMatch: "Nenhum vendedor corresponde à sua busca.",
    searchReps: "Buscar vendedores…",
    clearAllCount: (n: number) => `Limpar tudo (${n})`,
    clearAll: "Limpar tudo",
    cancel: "Cancelar",
    apply: "Aplicar",
    statuses: {
      new: "Novo",
      contacted: "Contactado",
      replied: "Respondeu",
      meeting: "Reunião",
      customer: "Cliente",
      not_interested: "Não interessado",
    },
  },
} as const

function nameInitials(name: string): string {
  const [first, ...rest] = name.split(" ")
  return initials(first, rest.at(-1))
}

// One combobox filter section — icon + heading above a MultiSelectCombobox
// (which renders its own chips/clear-all below the trigger once something's
// selected). Mirrors the extension's "Filter conversations" drawer: each
// group is its own icon-labeled block, not one shared checkbox list.
function FilterSection({
  icon: Icon,
  heading,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  heading: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground flex items-center gap-1.5 px-0.5 py-1 text-[11px] font-medium tracking-wide uppercase">
        <Icon className="size-3.5" />
        {heading}
      </p>
      {children}
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
  const [statuses, setStatuses] = React.useState(filters.statuses)
  const [availability, setAvailability] = React.useState<AvailabilityFilter>(filters.availability)
  const [assigneeIds, setAssigneeIds] = React.useState(filters.assigneeIds)

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCampaignIds(new Set(filters.campaignIds))
      setOutcomes(new Set(filters.outcomes))
      setStatuses(new Set(filters.statuses))
      setAvailability(filters.availability)
      setAssigneeIds(new Set(filters.assigneeIds))
    }
  }

  const totalSelected =
    campaignIds.size +
    outcomes.size +
    statuses.size +
    (availability !== "any" ? 1 : 0) +
    assigneeIds.size

  function handleApply() {
    onApply({ campaignIds, outcomes, statuses, availability, assigneeIds })
    onOpenChange(false)
  }

  const availabilityOptions: { v: AvailabilityFilter; label: string }[] = [
    { v: "any", label: c.availabilityAny },
    { v: "only", label: c.availabilityOnly },
    { v: "exclude", label: c.availabilityExclude },
  ]

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
          <FilterSection icon={Megaphone} heading={c.campaignsGroup}>
            {campaigns.length === 0 ? (
              <p className="text-muted-foreground px-0.5 text-xs">{c.noCampaigns}</p>
            ) : (
              <MultiSelectCombobox
                items={campaigns}
                values={campaignIds}
                onChange={setCampaignIds}
                getKey={(camp) => camp.id}
                getLabel={(camp) => camp.name}
                placeholder={c.campaignsPlaceholder}
                searchPlaceholder={c.searchCampaigns}
                emptyText={c.noCampaigns}
                noMatchText={c.noCampaignMatch}
                clearAllLabel={c.clearAllCount}
              />
            )}
          </FilterSection>

          <FilterSection icon={Star} heading={c.outcomesGroup}>
            <MultiSelectCombobox
              items={STATUS_ORDER}
              values={outcomes}
              onChange={setOutcomes}
              getKey={(status) => status}
              getLabel={(status) => STATUS_META[status][locale]}
              renderOption={(status) => {
                const meta = STATUS_META[status]
                return (
                  <>
                    <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
                    <span className="truncate">{meta[locale]}</span>
                  </>
                )
              }}
              placeholder={c.outcomesPlaceholder}
              searchPlaceholder={c.searchOutcomes}
              emptyText={c.noOutcomeMatch}
              noMatchText={c.noOutcomeMatch}
              clearAllLabel={c.clearAllCount}
            />
          </FilterSection>

          <FilterSection icon={ListChecks} heading={c.statusGroup}>
            <MultiSelectCombobox
              items={PROSPECT_STATUS_ORDER}
              values={statuses}
              onChange={setStatuses}
              getKey={(status) => status}
              getLabel={(status) => c.statuses[status]}
              placeholder={c.statusPlaceholder}
              searchPlaceholder={c.searchStatuses}
              emptyText={c.noStatusMatch}
              noMatchText={c.noStatusMatch}
              clearAllLabel={c.clearAllCount}
            />
          </FilterSection>

          <FilterSection icon={Clock} heading={c.availabilityGroup}>
            <Segmented options={availabilityOptions} value={availability} onChange={setAvailability} />
          </FilterSection>

          <FilterSection icon={Users} heading={c.teamGroup}>
            <MultiSelectCombobox
              items={users}
              values={assigneeIds}
              onChange={setAssigneeIds}
              getKey={(u) => u.id}
              getLabel={(u) => u.name}
              renderOption={(u) => (
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
              placeholder={c.teamPlaceholder}
              searchPlaceholder={c.searchReps}
              emptyText={c.noRepMatch}
              noMatchText={c.noRepMatch}
              clearAllLabel={c.clearAllCount}
            />
          </FilterSection>
        </div>

        <DialogFooter className="border-t p-3 sm:justify-between">
          <Button
            variant="ghost"
            disabled={totalSelected === 0}
            onClick={() => {
              setCampaignIds(new Set())
              setOutcomes(new Set())
              setStatuses(new Set())
              setAvailability("any")
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
