import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
  Bell,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
} from "@/components/common/ProspectBits"
import { AddToListDialog } from "@/components/prospect/AddToListDialog"
import { ProspectFormDialog } from "@/components/prospect/ProspectFormDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useProspects, prospectStore } from "@/lib/store"
import { useView } from "@/lib/view-context"
import { useSubscriptions } from "@/lib/subscriptions"
import { ownerOf } from "@/lib/team"
import { cn } from "@/lib/utils"
import type { Prospect } from "@/lib/types"

const ALL = "all"

const COPY = {
  en: {
    title: "Prospect Search",
    descViewing: (name: string) => `Viewing ${name}'s prospects · AI-scored`,
    descDefault: "Find and qualify your best-fit leads with AI scoring.",
    aiLookalikes: "AI lookalikes",
    addProspect: "Add prospect",
    introTitle: "Find your next best prospects",
    introDescription:
      "Search millions of verified contacts and filter by the signals that predict a deal — role, company, tech stack, and buying intent.",
    introPoints: [
      "Filter by title, seniority, industry & company size",
      "Verified work emails and direct dials",
      "Save results to a list in one click",
      "Push straight into a sequence",
    ],
    searchPlaceholder: "Search by name, title, company, or industry…",
    industry: "Industry",
    seniority: "Seniority",
    status: "Status",
    tracked: "Tracked",
    clear: "Clear",
    prospects: "prospects",
    selected: (count: number) => ` · ${count} selected`,
    addToList: "Add to list",
    delete: "Delete",
    startCampaign: "Start campaign",
    enrolled: (count: number) => `${count} prospects enrolled in campaign`,
    selectAll: "Select all",
    colProspect: "Prospect",
    colCompany: "Company",
    colIndustry: "Industry",
    colScore: "Score",
    colStatus: "Status",
    colTags: "Tags",
    selectName: (name: string) => `Select ${name}`,
    noMatch: "No prospects match your filters.",
    clearFilters: "Clear filters",
    addedToList: (count: number, listName: string) =>
      `${count} prospects added to "${listName}"`,
    deletedToast: (count: number) => `${count} prospects deleted`,
    deleteTitle: (count: number) =>
      `Delete ${count} ${count === 1 ? "prospect" : "prospects"}?`,
    deleteDescription:
      "This will permanently remove the selected prospects and remove them from any lists. This action cannot be undone.",
    deleteConfirm: "Delete",
    allPrefix: (label: string) => `All ${label.toLowerCase()}`,
  },
  es: {
    title: "Búsqueda de prospectos",
    descViewing: (name: string) =>
      `Viendo los prospectos de ${name} · puntuados con IA`,
    descDefault:
      "Encuentra y cualifica los leads que mejor encajan con puntuación por IA.",
    aiLookalikes: "Similares con IA",
    addProspect: "Añadir prospecto",
    introTitle: "Encuentra tus próximos mejores prospectos",
    introDescription:
      "Busca entre millones de contactos verificados y filtra por las señales que predicen un negocio — cargo, empresa, tecnología e intención de compra.",
    introPoints: [
      "Filtra por cargo, antigüedad, sector y tamaño de empresa",
      "Correos de trabajo verificados y teléfonos directos",
      "Guarda los resultados en una lista con un clic",
      "Envíalos directamente a una secuencia",
    ],
    searchPlaceholder: "Busca por nombre, cargo, empresa o sector…",
    industry: "Sector",
    seniority: "Antigüedad",
    status: "Estado",
    tracked: "Seguidos",
    clear: "Limpiar",
    prospects: "prospectos",
    selected: (count: number) => ` · ${count} seleccionados`,
    addToList: "Añadir a lista",
    delete: "Eliminar",
    startCampaign: "Iniciar campaña",
    enrolled: (count: number) => `${count} prospectos inscritos en la campaña`,
    selectAll: "Seleccionar todo",
    colProspect: "Prospecto",
    colCompany: "Empresa",
    colIndustry: "Sector",
    colScore: "Puntuación",
    colStatus: "Estado",
    colTags: "Etiquetas",
    selectName: (name: string) => `Seleccionar ${name}`,
    noMatch: "Ningún prospecto coincide con tus filtros.",
    clearFilters: "Limpiar filtros",
    addedToList: (count: number, listName: string) =>
      `${count} prospectos añadidos a "${listName}"`,
    deletedToast: (count: number) => `${count} prospectos eliminados`,
    deleteTitle: (count: number) =>
      `¿Eliminar ${count} ${count === 1 ? "prospecto" : "prospectos"}?`,
    deleteDescription:
      "Esto eliminará de forma permanente los prospectos seleccionados y los quitará de cualquier lista. Esta acción no se puede deshacer.",
    deleteConfirm: "Eliminar",
    allPrefix: (label: string) => `Todos: ${label.toLowerCase()}`,
  },
} as const

const statuses: (Prospect["status"] | typeof ALL)[] = [
  ALL,
  "new",
  "contacted",
  "replied",
  "meeting",
  "not_interested",
]

export default function Search() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const prospects = useProspects()
  const { impersonating, impersonatingId } = useView()
  const { prospects: tracked } = useSubscriptions()
  const [query, setQuery] = React.useState("")
  const [industry, setIndustry] = React.useState(ALL)
  const [seniority, setSeniority] = React.useState(ALL)
  const [status, setStatus] = React.useState<string>(ALL)
  const [trackedOnly, setTrackedOnly] = React.useState(false)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const industries = React.useMemo(
    () => [ALL, ...new Set(prospects.map((p) => p.industry))],
    [prospects]
  )
  const seniorities = React.useMemo(
    () => [ALL, ...new Set(prospects.map((p) => p.seniority))],
    [prospects]
  )

  const source = React.useMemo(
    () =>
      impersonatingId
        ? prospects.filter((p) => ownerOf(p.id) === impersonatingId)
        : prospects,
    [prospects, impersonatingId]
  )

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return source.filter((p) => {
      const matchesQuery =
        !q ||
        `${p.firstName} ${p.lastName} ${p.title} ${p.company} ${p.industry}`
          .toLowerCase()
          .includes(q)
      const matchesIndustry = industry === ALL || p.industry === industry
      const matchesSeniority = seniority === ALL || p.seniority === seniority
      const matchesStatus = status === ALL || p.status === status
      const matchesTracked = !trackedOnly || tracked.has(p.id)
      return (
        matchesQuery &&
        matchesIndustry &&
        matchesSeniority &&
        matchesStatus &&
        matchesTracked
      )
    })
  }, [source, query, industry, seniority, status, trackedOnly, tracked])

  const allSelected = results.length > 0 && results.every((p) => selected.has(p.id))

  function toggleAll() {
    setSelected((prev) => {
      if (results.every((p) => prev.has(p.id))) {
        const next = new Set(prev)
        results.forEach((p) => next.delete(p.id))
        return next
      }
      return new Set([...prev, ...results.map((p) => p.id)])
    })
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function resetFilters() {
    setQuery("")
    setIndustry(ALL)
    setSeniority(ALL)
    setStatus(ALL)
    setTrackedOnly(false)
  }

  function deleteSelected() {
    const count = selected.size
    selected.forEach((id) => prospectStore.remove(id))
    setSelected(new Set())
    toast.success(c.deletedToast(count))
  }

  const hasFilters =
    query ||
    industry !== ALL ||
    seniority !== ALL ||
    status !== ALL ||
    trackedOnly

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={
          impersonating
            ? c.descViewing(impersonating.name.split(" ")[0])
            : c.descDefault
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">
              <Sparkles className="size-4" />
              {c.aiLookalikes}
            </Button>
            <Button variant="volt" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              {c.addProspect}
            </Button>
          </div>
        }
      />

      <FeatureIntro
        featureKey="search"
        icon={SearchIcon}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <Card className="mb-4 gap-0 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={c.searchPlaceholder}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="text-muted-foreground hidden size-4 lg:block" />
            <FilterSelect
              value={industry}
              onChange={setIndustry}
              options={industries}
              placeholder={c.industry}
              allPrefix={c.allPrefix}
            />
            <FilterSelect
              value={seniority}
              onChange={setSeniority}
              options={seniorities}
              placeholder={c.seniority}
              allPrefix={c.allPrefix}
            />
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={statuses}
              placeholder={c.status}
              allPrefix={c.allPrefix}
              capitalize
            />
            <Button
              variant={trackedOnly ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTrackedOnly((v) => !v)}
              aria-pressed={trackedOnly}
              className={cn(trackedOnly && "text-primary")}
            >
              <Bell className="size-4" />
              {c.tracked}
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="size-4" />
                {c.clear}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-2 flex min-h-9 flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{results.length}</span>{" "}
          {c.prospects}
          {selected.size > 0 && c.selected(selected.size)}
        </p>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              {c.addToList}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              {c.delete}
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success(c.enrolled(selected.size))}
            >
              <Send className="size-4" />
              {c.startCampaign}
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label={c.selectAll}
                />
              </TableHead>
              <TableHead>{c.colProspect}</TableHead>
              <TableHead className="hidden md:table-cell">{c.colCompany}</TableHead>
              <TableHead className="hidden lg:table-cell">
                {c.colIndustry}
              </TableHead>
              <TableHead>{c.colScore}</TableHead>
              <TableHead className="hidden sm:table-cell">{c.colStatus}</TableHead>
              <TableHead className="hidden xl:table-cell">{c.colTags}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => navigate(`/prospects/${p.id}`)}
              >
                <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    aria-label={c.selectName(p.firstName)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProspectAvatar prospect={p} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.title}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="font-medium">{p.company}</p>
                  <p className="text-muted-foreground text-xs">{p.location}</p>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                  {p.industry}
                </TableCell>
                <TableCell>
                  <ScoreBadge score={p.score} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary" className="font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-32 text-center">
                  <p className="text-muted-foreground text-sm">{c.noMatch}</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={resetFilters}
                    className="mt-1"
                  >
                    {c.clearFilters}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      <AddToListDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        count={selected.size}
        onAdded={(listName) => {
          toast.success(c.addedToList(selected.size, listName))
          setSelected(new Set())
        }}
      />

      <ProspectFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={c.deleteTitle(selected.size)}
        description={c.deleteDescription}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={deleteSelected}
      />
    </Page>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  allPrefix,
  capitalize,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  allPrefix: (label: string) => string
  capitalize?: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="min-w-[130px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className={capitalize ? "capitalize" : ""}>
            {opt === "all" ? allPrefix(placeholder) : opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
