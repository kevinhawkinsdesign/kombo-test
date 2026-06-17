import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
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
import { prospects } from "@/lib/mock-data"
import type { Prospect } from "@/lib/types"

const ALL = "all"

const industries = [ALL, ...new Set(prospects.map((p) => p.industry))]
const seniorities = [ALL, ...new Set(prospects.map((p) => p.seniority))]
const statuses: (Prospect["status"] | typeof ALL)[] = [
  ALL,
  "new",
  "contacted",
  "replied",
  "meeting",
  "not_interested",
]

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState("")
  const [industry, setIndustry] = React.useState(ALL)
  const [seniority, setSeniority] = React.useState(ALL)
  const [status, setStatus] = React.useState<string>(ALL)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = React.useState(false)

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return prospects.filter((p) => {
      const matchesQuery =
        !q ||
        `${p.firstName} ${p.lastName} ${p.title} ${p.company} ${p.industry}`
          .toLowerCase()
          .includes(q)
      const matchesIndustry = industry === ALL || p.industry === industry
      const matchesSeniority = seniority === ALL || p.seniority === seniority
      const matchesStatus = status === ALL || p.status === status
      return matchesQuery && matchesIndustry && matchesSeniority && matchesStatus
    })
  }, [query, industry, seniority, status])

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
  }

  const hasFilters =
    query || industry !== ALL || seniority !== ALL || status !== ALL

  return (
    <Page className="max-w-none">
      <PageHeading
        title="Prospect Search"
        description="Find and qualify your best-fit leads with AI scoring."
        action={
          <Button variant="outline">
            <Sparkles className="size-4" />
            AI lookalikes
          </Button>
        }
      />

      <Card className="mb-4 gap-0 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, title, company, or industry…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="text-muted-foreground hidden size-4 lg:block" />
            <FilterSelect
              value={industry}
              onChange={setIndustry}
              options={industries}
              placeholder="Industry"
            />
            <FilterSelect
              value={seniority}
              onChange={setSeniority}
              options={seniorities}
              placeholder="Seniority"
            />
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={statuses}
              placeholder="Status"
              capitalize
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="size-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-2 flex h-9 items-center justify-between px-1">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{results.length}</span>{" "}
          prospects
          {selected.size > 0 && ` · ${selected.size} selected`}
        </p>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add to list
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast.success(`${selected.size} prospects enrolled in campaign`)
              }
            >
              <Send className="size-4" />
              Start campaign
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Prospect</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden lg:table-cell">Industry</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden xl:table-cell">Tags</TableHead>
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
                    aria-label={`Select ${p.firstName}`}
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
                  <p className="text-muted-foreground text-sm">
                    No prospects match your filters.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={resetFilters}
                    className="mt-1"
                  >
                    Clear filters
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AddToListDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        count={selected.size}
        onAdded={(listName) => {
          toast.success(`${selected.size} prospects added to “${listName}”`)
          setSelected(new Set())
        }}
      />
    </Page>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  capitalize,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
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
            {opt === "all" ? `All ${placeholder.toLowerCase()}` : opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
