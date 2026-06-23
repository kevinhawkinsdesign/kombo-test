import * as React from "react"
import { toast } from "sonner"
import { Search, Check, Plus, FolderKanban, Send } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useLists, useCampaigns, listStore, campaignStore } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { RecordKind } from "@/lib/crm-mapping"

const COPY = {
  en: {
    listTitle: (name: string) => `Add ${name} to a list`,
    campaignTitle: (name: string) => `Add ${name} to a campaign`,
    listDesc: "Search your lists and toggle membership.",
    campaignDesc: "Search your campaigns and enroll this prospect.",
    searchLists: "Search lists…",
    searchCampaigns: "Search campaigns…",
    create: (q: string) => `Create "${q}"`,
    noLists: "No lists match.",
    noCampaigns: "No campaigns match.",
    members: (n: number) => `${n} ${n === 1 ? "member" : "members"}`,
    enrolled: (n: number) => `${n} enrolled`,
    addedToList: (l: string) => `Added to ${l}`,
    removedFromList: (l: string) => `Removed from ${l}`,
    enrolledIn: (l: string) => `Enrolled in ${l}`,
    removedFromCampaign: (l: string) => `Removed from ${l}`,
    createdList: (l: string) => `Created ${l}`,
    createdCampaign: (l: string) => `Created ${l}`,
  },
  es: {
    listTitle: (name: string) => `Añadir ${name} a una lista`,
    campaignTitle: (name: string) => `Añadir ${name} a una campaña`,
    listDesc: "Busca tus listas y cambia la pertenencia.",
    campaignDesc: "Busca tus campañas e inscribe a este prospecto.",
    searchLists: "Buscar listas…",
    searchCampaigns: "Buscar campañas…",
    create: (q: string) => `Crear "${q}"`,
    noLists: "Ninguna lista coincide.",
    noCampaigns: "Ninguna campaña coincide.",
    members: (n: number) => `${n} ${n === 1 ? "miembro" : "miembros"}`,
    enrolled: (n: number) => `${n} inscritos`,
    addedToList: (l: string) => `Añadido a ${l}`,
    removedFromList: (l: string) => `Eliminado de ${l}`,
    enrolledIn: (l: string) => `Inscrito en ${l}`,
    removedFromCampaign: (l: string) => `Eliminado de ${l}`,
    createdList: (l: string) => `Lista ${l} creada`,
    createdCampaign: (l: string) => `Campaña ${l} creada`,
  },
} as const

const NEW_LIST_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"]

export function AddToCollectionDialog({
  open,
  onOpenChange,
  mode,
  recordKind,
  recordId,
  recordName,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode: "list" | "campaign"
  recordKind: RecordKind
  recordId: string
  recordName: string
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const lists = useLists()
  const campaigns = useCampaigns()
  const [query, setQuery] = React.useState("")

  const q = query.trim().toLowerCase()

  // Lists scoped to the record kind (people vs company lists).
  const scopedLists = lists.filter((l) =>
    recordKind === "company" ? l.kind === "company" : l.kind !== "company"
  )
  const listResults = scopedLists.filter(
    (l) => !q || `${l.name} ${l.description}`.toLowerCase().includes(q)
  )
  const campaignResults = campaigns.filter((cp) => !q || cp.name.toLowerCase().includes(q))

  const exactExists =
    mode === "list"
      ? scopedLists.some((l) => l.name.toLowerCase() === q)
      : campaigns.some((cp) => cp.name.toLowerCase() === q)

  function isInList(listId: string): boolean {
    const l = lists.find((x) => x.id === listId)
    if (!l) return false
    return recordKind === "company"
      ? (l.accountIds ?? []).includes(recordId)
      : l.prospectIds.includes(recordId)
  }

  function toggleList(listId: string, name: string) {
    const inList = isInList(listId)
    if (recordKind === "company") {
      if (inList) listStore.removeAccount(listId, recordId)
      else listStore.addAccounts(listId, [recordId])
    } else {
      if (inList) listStore.removeProspect(listId, recordId)
      else listStore.addProspects(listId, [recordId])
    }
    toast.success(inList ? c.removedFromList(name) : c.addedToList(name))
  }

  function isInCampaign(campaignId: string): boolean {
    const cp = campaigns.find((x) => x.id === campaignId)
    return Boolean(cp?.enrolledIds?.includes(recordId))
  }

  function toggleCampaign(campaignId: string, name: string) {
    if (isInCampaign(campaignId)) {
      campaignStore.removeProspect(campaignId, recordId)
      toast.success(c.removedFromCampaign(name))
    } else {
      campaignStore.addProspects(campaignId, [recordId])
      toast.success(c.enrolledIn(name))
    }
  }

  function createAndAdd() {
    const name = query.trim()
    if (!name) return
    if (mode === "list") {
      const color = NEW_LIST_COLORS[Math.floor(Math.random() * NEW_LIST_COLORS.length)]
      const list = listStore.create({
        name,
        description: "",
        color,
        kind: recordKind === "company" ? "company" : "people",
      })
      if (recordKind === "company") listStore.addAccounts(list.id, [recordId])
      else listStore.addProspects(list.id, [recordId])
      toast.success(c.createdList(name))
    } else {
      const cp = campaignStore.create({ name })
      campaignStore.addProspects(cp.id, [recordId])
      toast.success(c.createdCampaign(name))
    }
    setQuery("")
  }

  const title = mode === "list" ? c.listTitle(recordName) : c.campaignTitle(recordName)
  const desc = mode === "list" ? c.listDesc : c.campaignDesc
  const placeholder = mode === "list" ? c.searchLists : c.searchCampaigns

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setQuery("") }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>

        <div className="-mx-2 max-h-[50vh] overflow-y-auto px-2">
          {q && !exactExists && (
            <button
              type="button"
              onClick={createAndAdd}
              className="text-primary hover:bg-accent flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm font-medium"
            >
              <span className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-md">
                <Plus className="size-4" />
              </span>
              {c.create(query.trim())}
            </button>
          )}

          {mode === "list"
            ? listResults.map((l) => {
                const inList = isInList(l.id)
                const count =
                  recordKind === "company" ? (l.accountIds ?? []).length : l.prospectIds.length
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggleList(l.id, l.name)}
                    className="hover:bg-accent flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left"
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${l.color}1f` }}
                    >
                      <FolderKanban className="size-4" style={{ color: l.color }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{l.name}</span>
                      <span className="text-muted-foreground block text-xs">{c.members(count)}</span>
                    </span>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        inList ? "bg-primary border-primary text-primary-foreground" : "border-input"
                      )}
                    >
                      {inList && <Check className="size-3.5" />}
                    </span>
                  </button>
                )
              })
            : campaignResults.map((cp) => {
                const inCampaign = isInCampaign(cp.id)
                return (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => toggleCampaign(cp.id, cp.name)}
                    className="hover:bg-accent flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left"
                  >
                    <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
                      <Send className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{cp.name}</span>
                      <span className="text-muted-foreground block text-xs">{c.enrolled(cp.enrolled)}</span>
                    </span>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        inCampaign ? "bg-primary border-primary text-primary-foreground" : "border-input"
                      )}
                    >
                      {inCampaign && <Check className="size-3.5" />}
                    </span>
                  </button>
                )
              })}

          {mode === "list" && listResults.length === 0 && !q && (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">{c.noLists}</p>
          )}
          {mode === "campaign" && campaignResults.length === 0 && !q && (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">{c.noCampaigns}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
