import * as React from "react"
import { toast } from "sonner"
import { Search, Database, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SearchCombobox } from "@/components/common/SearchCombobox"
import {
  useSavedSearches,
  searchLeads,
  searchCompanies,
  type AiLead,
  type AiCompany,
} from "@/lib/mock-ai-search"
import { CRM_LISTS, CONNECTED_CRM_PROVIDER } from "@/lib/mock-depth"
import { listStore, prospectStore, accountStore } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { AccountTier, ProspectList } from "@/lib/types"

type Source = "saved_search" | "crm_list"

/* ----------------------------- materializers -----------------------------
 * Same pattern as AddRecordsDialog.tsx / Search.tsx: a saved search's query
 * is only ever a filter recipe, not real records, so linking a list to one
 * has to re-run that recipe against the current mock pool and turn the
 * matches into real prospectStore/accountStore rows — otherwise the list
 * just carries a label with no actual membership. */
function materializeLead(l: AiLead): string {
  return prospectStore.create({
    firstName: l.firstName,
    lastName: l.lastName,
    title: l.title,
    company: l.company,
    companyDomain: l.companyDomain,
    location: l.location,
    // Freshly sourced contacts arrive with only basic data — email is revealed
    // later via enrichment.
    email: "",
    linkedinUrl: "",
    avatarColor: l.avatarColor,
    score: l.fit,
    status: "new",
    tags: [],
    seniority: l.seniority,
    department: l.department,
    headcount: l.headcount,
    industry: l.industry,
    revenue: l.revenue,
    about: "",
    signals: l.signals,
    source: "search",
    enriched: false,
  }).id
}

function materializeCompany(co: AiCompany): string {
  const tier: AccountTier =
    co.headcountNum >= 1000
      ? "Enterprise"
      : co.headcountNum >= 200
        ? "Mid-market"
        : "SMB"
  return accountStore.create({
    name: co.name,
    domain: co.domain,
    industry: co.industry,
    employees: co.headcount,
    revenue: co.revenue,
    location: co.location,
    logoColor: co.logoColor,
    tier,
    healthScore: co.fit,
    openDeals: 0,
    pipeline: 0,
    contacts: 0,
    ownerId: "",
    about: "",
    signals: co.signals,
    keyExecutives: [],
  }).id
}

const COPY = {
  en: {
    title: "Add source",
    desc: (name: string) =>
      `Link "${name}" to a source — matching records keep flowing in automatically.`,
    savedSearch: "Saved search",
    crmList: "CRM list",
    pickSearch: "Choose a saved search…",
    pickCrmList: "Choose a CRM list…",
    noSearches: "No saved searches for this record type yet.",
    noCrmLists: "No CRM lists for this record type.",
    resultCount: (n: number) => `${n.toLocaleString()} results`,
    currentViaSearch: (name: string) => `Currently linked to saved search "${name}"`,
    currentViaCrm: (name: string) => `Currently linked to CRM list "${name}"`,
    removeSource: "Remove source",
    cancel: "Cancel",
    link: "Link source",
    linked: (name: string) => `Linked to "${name}"`,
    removed: "Source removed — this list is no longer dynamic",
  },
  es: {
    title: "Añadir fuente",
    desc: (name: string) =>
      `Vincula "${name}" a una fuente — los registros coincidentes seguirán llegando automáticamente.`,
    savedSearch: "Búsqueda guardada",
    crmList: "Lista del CRM",
    pickSearch: "Elige una búsqueda guardada…",
    pickCrmList: "Elige una lista del CRM…",
    noSearches: "Aún no hay búsquedas guardadas para este tipo de registro.",
    noCrmLists: "No hay listas del CRM para este tipo de registro.",
    resultCount: (n: number) => `${n.toLocaleString()} resultados`,
    currentViaSearch: (name: string) => `Actualmente vinculada a la búsqueda guardada "${name}"`,
    currentViaCrm: (name: string) => `Actualmente vinculada a la lista del CRM "${name}"`,
    removeSource: "Quitar fuente",
    cancel: "Cancelar",
    link: "Vincular fuente",
    linked: (name: string) => `Vinculada a "${name}"`,
    removed: "Fuente eliminada — esta lista ya no es dinámica",
  },
  it: {
    title: "Aggiungi fonte",
    desc: (name: string) =>
      `Collega "${name}" a una fonte — i record corrispondenti continueranno ad arrivare automaticamente.`,
    savedSearch: "Ricerca salvata",
    crmList: "Lista del CRM",
    pickSearch: "Scegli una ricerca salvata…",
    pickCrmList: "Scegli una lista del CRM…",
    noSearches: "Ancora nessuna ricerca salvata per questo tipo di record.",
    noCrmLists: "Nessuna lista del CRM per questo tipo di record.",
    resultCount: (n: number) => `${n.toLocaleString()} risultati`,
    currentViaSearch: (name: string) => `Attualmente collegata alla ricerca salvata "${name}"`,
    currentViaCrm: (name: string) => `Attualmente collegata alla lista del CRM "${name}"`,
    removeSource: "Rimuovi fonte",
    cancel: "Annulla",
    link: "Collega fonte",
    linked: (name: string) => `Collegata a "${name}"`,
    removed: "Fonte rimossa — questa lista non è più dinamica",
  },
  fr: {
    title: "Ajouter une source",
    desc: (name: string) =>
      `Liez « ${name} » à une source — les fiches correspondantes continueront d'arriver automatiquement.`,
    savedSearch: "Recherche enregistrée",
    crmList: "Liste du CRM",
    pickSearch: "Choisissez une recherche enregistrée…",
    pickCrmList: "Choisissez une liste du CRM…",
    noSearches: "Aucune recherche enregistrée pour ce type de fiche.",
    noCrmLists: "Aucune liste du CRM pour ce type de fiche.",
    resultCount: (n: number) => `${n.toLocaleString()} résultats`,
    currentViaSearch: (name: string) => `Actuellement liée à la recherche enregistrée « ${name} »`,
    currentViaCrm: (name: string) => `Actuellement liée à la liste du CRM « ${name} »`,
    removeSource: "Retirer la source",
    cancel: "Annuler",
    link: "Lier la source",
    linked: (name: string) => `Liée à « ${name} »`,
    removed: "Source retirée — cette liste n'est plus dynamique",
  },
  de: {
    title: "Quelle hinzufügen",
    desc: (name: string) =>
      `Verknüpfe „${name}“ mit einer Quelle — passende Datensätze fließen weiterhin automatisch ein.`,
    savedSearch: "Gespeicherte Suche",
    crmList: "CRM-Liste",
    pickSearch: "Wähle eine gespeicherte Suche…",
    pickCrmList: "Wähle eine CRM-Liste…",
    noSearches: "Noch keine gespeicherten Suchen für diesen Datensatztyp.",
    noCrmLists: "Keine CRM-Listen für diesen Datensatztyp.",
    resultCount: (n: number) => `${n.toLocaleString()} Ergebnisse`,
    currentViaSearch: (name: string) => `Aktuell mit der gespeicherten Suche „${name}“ verknüpft`,
    currentViaCrm: (name: string) => `Aktuell mit der CRM-Liste „${name}“ verknüpft`,
    removeSource: "Quelle entfernen",
    cancel: "Abbrechen",
    link: "Quelle verknüpfen",
    linked: (name: string) => `Mit „${name}“ verknüpft`,
    removed: "Quelle entfernt — diese Liste ist nicht mehr dynamisch",
  },
  pt: {
    title: "Adicionar fonte",
    desc: (name: string) =>
      `Associe "${name}" a uma fonte — os registos correspondentes continuarão a chegar automaticamente.`,
    savedSearch: "Pesquisa guardada",
    crmList: "Lista do CRM",
    pickSearch: "Escolha uma pesquisa guardada…",
    pickCrmList: "Escolha uma lista do CRM…",
    noSearches: "Ainda não há pesquisas guardadas para este tipo de registo.",
    noCrmLists: "Não há listas do CRM para este tipo de registo.",
    resultCount: (n: number) => `${n.toLocaleString()} resultados`,
    currentViaSearch: (name: string) => `Atualmente associada à pesquisa guardada "${name}"`,
    currentViaCrm: (name: string) => `Atualmente associada à lista do CRM "${name}"`,
    removeSource: "Remover fonte",
    cancel: "Cancelar",
    link: "Associar fonte",
    linked: (name: string) => `Associada a "${name}"`,
    removed: "Fonte removida — esta lista deixou de ser dinâmica",
  },
  pt_BR: {
    title: "Adicionar fonte",
    desc: (name: string) =>
      `Vincule "${name}" a uma fonte — os registros correspondentes continuarão chegando automaticamente.`,
    savedSearch: "Busca salva",
    crmList: "Lista do CRM",
    pickSearch: "Escolha uma busca salva…",
    pickCrmList: "Escolha uma lista do CRM…",
    noSearches: "Ainda não há buscas salvas para esse tipo de registro.",
    noCrmLists: "Não há listas do CRM para esse tipo de registro.",
    resultCount: (n: number) => `${n.toLocaleString()} resultados`,
    currentViaSearch: (name: string) => `Atualmente vinculada à busca salva "${name}"`,
    currentViaCrm: (name: string) => `Atualmente vinculada à lista do CRM "${name}"`,
    removeSource: "Remover fonte",
    cancel: "Cancelar",
    link: "Vincular fonte",
    linked: (name: string) => `Vinculada a "${name}"`,
    removed: "Fonte removida — esta lista não é mais dinâmica",
  },
} as const

// Links a list to an existing saved search (a live reference — editing the
// saved search later changes this list's inflow) or an existing CRM list
// (a snapshot of what's in the CRM today). Picking from existing sources
// only — this doesn't build new criteria from scratch.
export function AddSourceDialog({
  open,
  onOpenChange,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: ProspectList
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const savedSearches = useSavedSearches()
  const [tab, setTab] = React.useState<Source>("saved_search")
  const [pickId, setPickId] = React.useState("")

  const wantEntity = list.kind === "company" ? "companies" : "people"
  const matchingSearches = savedSearches.filter((s) => s.entity === wantEntity)
  const matchingCrmLists = CRM_LISTS.filter((l) => l.kind === (list.kind ?? "people"))

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTab(list.sourceType ?? "saved_search")
      setPickId("")
    }
  }

  const currentSearch = list.savedSearchId
    ? savedSearches.find((s) => s.id === list.savedSearchId)
    : undefined
  const currentCrmList = list.crmListId
    ? CRM_LISTS.find((l) => l.id === list.crmListId)
    : undefined
  const currentName = currentSearch?.name ?? currentCrmList?.name

  function linkSource() {
    if (!pickId) return
    if (tab === "saved_search") {
      const target = matchingSearches.find((s) => s.id === pickId)
      if (!target) return
      // Re-run the saved search's own filters against the current mock pool
      // and materialize the matches into real records — a saved search is
      // only ever a filter recipe, not a snapshot of members, so linking it
      // must actually import records rather than just label the list.
      if (wantEntity === "people") {
        listStore.addProspects(list.id, searchLeads(target.query).map(materializeLead))
      } else {
        listStore.addAccounts(list.id, searchCompanies(target.query).map(materializeCompany))
      }
      listStore.update(list.id, {
        dynamic: true,
        sourceType: "saved_search",
        savedSearchId: pickId,
        crmListId: undefined,
        enrichment: list.enrichment ?? "off",
        lastSyncedAt: new Date().toISOString(),
      })
      toast.success(c.linked(target.name))
    } else {
      const target = matchingCrmLists.find((l) => l.id === pickId)
      if (!target) return
      listStore.update(list.id, {
        dynamic: true,
        sourceType: "crm_list",
        crmListId: pickId,
        savedSearchId: undefined,
        enrichment: list.enrichment ?? "off",
        lastSyncedAt: new Date().toISOString(),
      })
      toast.success(c.linked(target.name))
    }
    onOpenChange(false)
  }

  function removeSource() {
    listStore.update(list.id, {
      dynamic: false,
      sourceType: undefined,
      savedSearchId: undefined,
      crmListId: undefined,
    })
    toast.success(c.removed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="text-primary size-5" />
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.desc(list.name)}</DialogDescription>
        </DialogHeader>

        {currentName && (
          <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm">
            <span className="min-w-0 truncate">
              {currentSearch ? c.currentViaSearch(currentName) : c.currentViaCrm(currentName)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={removeSource}
            >
              <X className="size-3.5" />
              {c.removeSource}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "saved_search" as const, label: c.savedSearch, icon: Search },
              { value: "crm_list" as const, label: c.crmList, icon: Database },
            ] as const
          ).map((opt) => {
            const Icon = opt.icon
            const active = tab === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTab(opt.value)
                  setPickId("")
                }}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border p-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                    : "hover:bg-muted/60"
                )}
              >
                <Icon className="size-4" />
                {opt.label}
              </button>
            )
          })}
        </div>

        {tab === "saved_search" ? (
          matchingSearches.length === 0 ? (
            <p className="text-muted-foreground text-sm">{c.noSearches}</p>
          ) : (
            <SearchCombobox
              value={pickId}
              onChange={setPickId}
              options={matchingSearches.map((s) => ({
                value: s.id,
                label: s.name,
                sublabel: ` · ${c.resultCount(s.resultCount)}`,
              }))}
              placeholder={c.pickSearch}
              searchPlaceholder={c.pickSearch}
              emptyText={c.pickSearch}
              className="w-full"
            />
          )
        ) : matchingCrmLists.length === 0 ? (
          <p className="text-muted-foreground text-sm">{c.noCrmLists}</p>
        ) : (
          <SearchCombobox
            value={pickId}
            onChange={setPickId}
            options={matchingCrmLists.map((l) => ({
              value: l.id,
              label: `${CONNECTED_CRM_PROVIDER.name}: ${l.name}`,
              sublabel: ` · ${c.resultCount(l.count)}`,
            }))}
            placeholder={c.pickCrmList}
            searchPlaceholder={c.pickCrmList}
            emptyText={c.pickCrmList}
            className="w-full"
          />
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={linkSource} disabled={!pickId}>
            {c.link}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
