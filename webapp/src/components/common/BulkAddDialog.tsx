import * as React from "react"
import { toast } from "sonner"
import { Search, Plus, FolderKanban, Send } from "lucide-react"

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
import type { RecordKind } from "@/lib/crm-mapping"

const COPY = {
  en: {
    listTitle: (n: number) => `Add ${n} to a list`,
    campaignTitle: (n: number) => `Add ${n} to a campaign`,
    listDesc: "Pick a list, or create a new one for the selection.",
    campaignDesc: "Pick a campaign — selected prospects join its list.",
    searchLists: "Search lists…",
    searchCampaigns: "Search campaigns…",
    create: (q: string) => `Create "${q}"`,
    members: (n: number) => `${n} ${n === 1 ? "member" : "members"}`,
    enrolled: (n: number) => `${n} enrolled`,
    addedToList: (n: number, l: string) => `Added ${n} to ${l}`,
    enrolledIn: (n: number, l: string) => `Added ${n} to ${l}`,
    noLists: "No lists yet — type a name to create one.",
    noCampaigns: "No campaigns yet — type a name to create one.",
  },
  es: {
    listTitle: (n: number) => `Añadir ${n} a una lista`,
    campaignTitle: (n: number) => `Añadir ${n} a una campaña`,
    listDesc: "Elige una lista o crea una nueva para la selección.",
    campaignDesc: "Elige una campaña — los prospectos entran en su lista.",
    searchLists: "Buscar listas…",
    searchCampaigns: "Buscar campañas…",
    create: (q: string) => `Crear "${q}"`,
    members: (n: number) => `${n} ${n === 1 ? "miembro" : "miembros"}`,
    enrolled: (n: number) => `${n} inscritos`,
    addedToList: (n: number, l: string) => `Añadidos ${n} a ${l}`,
    enrolledIn: (n: number, l: string) => `Añadidos ${n} a ${l}`,
    noLists: "Aún no hay listas — escribe un nombre para crear una.",
    noCampaigns: "Aún no hay campañas — escribe un nombre para crear una.",
  },
} as const

const NEW_LIST_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"]

/**
 * Adds a multi-selection of records to a chosen list or campaign in one shot
 * (no per-record toggle). Used by the People & Companies bulk action bars.
 */
export function BulkAddDialog({
  open,
  onOpenChange,
  mode,
  recordKind,
  ids,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode: "list" | "campaign"
  recordKind: RecordKind
  ids: string[]
  onDone?: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const lists = useLists()
  const campaigns = useCampaigns()
  const [query, setQuery] = React.useState("")

  const q = query.trim().toLowerCase()
  const n = ids.length

  const scopedLists = lists.filter((l) =>
    recordKind === "company" ? l.kind === "company" : l.kind !== "company"
  )
  const listResults = scopedLists.filter(
    (l) => !q || `${l.name} ${l.description}`.toLowerCase().includes(q)
  )
  const campaignResults = campaigns.filter(
    (cp) => !q || cp.name.toLowerCase().includes(q)
  )
  const exactExists =
    mode === "list"
      ? scopedLists.some((l) => l.name.toLowerCase() === q)
      : campaigns.some((cp) => cp.name.toLowerCase() === q)

  function close() {
    onOpenChange(false)
    setQuery("")
    onDone?.()
  }

  function addToList(listId: string, name: string) {
    if (recordKind === "company") listStore.addAccounts(listId, ids)
    else listStore.addProspects(listId, ids)
    toast.success(c.addedToList(n, name))
    close()
  }

  function addToCampaign(campaignId: string, name: string) {
    campaignStore.addProspects(campaignId, ids)
    toast.success(c.enrolledIn(n, name))
    close()
  }

  function createAndAdd() {
    const name = query.trim()
    if (!name) return
    if (mode === "list") {
      const list = listStore.create({
        name,
        description: "",
        color: NEW_LIST_COLORS[name.length % NEW_LIST_COLORS.length],
        kind: recordKind === "company" ? "company" : "people",
      })
      addToList(list.id, name)
    } else {
      const cp = campaignStore.create({ name })
      addToCampaign(cp.id, name)
    }
  }

  const title = mode === "list" ? c.listTitle(n) : c.campaignTitle(n)
  const desc = mode === "list" ? c.listDesc : c.campaignDesc
  const placeholder = mode === "list" ? c.searchLists : c.searchCampaigns

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setQuery("")
      }}
    >
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
                const count =
                  recordKind === "company"
                    ? (l.accountIds ?? []).length
                    : l.prospectIds.length
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => addToList(l.id, l.name)}
                    className="hover:bg-accent flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left"
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${l.color}1f` }}
                    >
                      <FolderKanban className="size-4" style={{ color: l.color }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {l.name}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        {c.members(count)}
                      </span>
                    </span>
                  </button>
                )
              })
            : campaignResults.map((cp) => (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => addToCampaign(cp.id, cp.name)}
                  className="hover:bg-accent flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left"
                >
                  <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
                    <Send className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {cp.name}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {c.enrolled(cp.enrolled)}
                    </span>
                  </span>
                </button>
              ))}

          {mode === "list" && listResults.length === 0 && !q && (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              {c.noLists}
            </p>
          )}
          {mode === "campaign" && campaignResults.length === 0 && !q && (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              {c.noCampaigns}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
