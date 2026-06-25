import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Sparkles,
  Upload,
  Building2,
  Users,
  Database,
  Copy,
  Plus,
  Linkedin,
  ArrowRight,
  Lock,
} from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ImportCsvDialog } from "@/components/lists/ImportCsvDialog"
import { listStore, useLists } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import type { ProspectList } from "@/lib/types"

// Source definitions shared between people and company modes.
type SourceKey =
  | "ai_search"
  | "csv"
  | "linkedin_search"
  | "linkedin_post"
  | "linkedin_followers"
  | "crm"
  | "saved_search"
  | "duplicate"
  | "manual"

interface Source {
  key: SourceKey
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  available: boolean
  tag?: "soon"
}

const PEOPLE_SOURCES: Source[] = [
  {
    key: "ai_search",
    icon: Sparkles,
    label: "AI Search",
    description: "Search 30M+ contacts with a plain-language prompt. Kombo scores fit and auto-enriches results.",
    available: true,
  },
  {
    key: "csv",
    icon: Upload,
    label: "Import from CSV",
    description: "Upload a spreadsheet with first name, last name, email, LinkedIn URL, and company.",
    available: true,
  },
  {
    key: "linkedin_search",
    icon: Linkedin,
    label: "LinkedIn search",
    description: "Paste a LinkedIn search or Sales Navigator URL to pull matching contacts.",
    available: false,
    tag: "soon",
  },
  {
    key: "linkedin_post",
    icon: Linkedin,
    label: "LinkedIn post",
    description: "Extract everyone who liked or commented on a LinkedIn post.",
    available: false,
    tag: "soon",
  },
  {
    key: "linkedin_followers",
    icon: Linkedin,
    label: "LinkedIn followers",
    description: "Import followers of a company page or personal profile.",
    available: false,
    tag: "soon",
  },
  {
    key: "crm",
    icon: Database,
    label: "From CRM",
    description: "Sync contacts from HubSpot, Salesforce, or Pipedrive. Field mapping included.",
    available: false,
    tag: "soon",
  },
  {
    key: "saved_search",
    icon: Sparkles,
    label: "From saved search",
    description: "Pick a saved AI search and create a dynamic list that keeps filling automatically.",
    available: true,
  },
  {
    key: "duplicate",
    icon: Copy,
    label: "Duplicate a list",
    description: "Start from an existing list and modify it. Great for A/B testing segments.",
    available: true,
  },
  {
    key: "manual",
    icon: Plus,
    label: "Add contacts manually",
    description: "Build a list one contact at a time by searching or entering details.",
    available: true,
  },
]

const COMPANY_SOURCES: Source[] = [
  {
    key: "ai_search",
    icon: Sparkles,
    label: "AI Search",
    description: "Search companies by industry, size, tech stack, and intent signals.",
    available: true,
  },
  {
    key: "csv",
    icon: Upload,
    label: "Import from CSV",
    description: "Upload a spreadsheet with company name, domain, and firmographic data.",
    available: true,
  },
  {
    key: "linkedin_search",
    icon: Linkedin,
    label: "LinkedIn company search",
    description: "Paste a LinkedIn company search URL to pull matching accounts.",
    available: false,
    tag: "soon",
  },
  {
    key: "crm",
    icon: Database,
    label: "From CRM",
    description: "Sync accounts from HubSpot, Salesforce, or Pipedrive.",
    available: false,
    tag: "soon",
  },
  {
    key: "duplicate",
    icon: Copy,
    label: "Duplicate a list",
    description: "Start from an existing company list.",
    available: true,
  },
]

export interface CreateListDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated?: (listId: string) => void
}

export function CreateListDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateListDialogProps) {
  const navigate = useNavigate()
  const { locale } = useLocale()
  const lists = useLists()
  const [tab, setTab] = React.useState<"people" | "companies">("people")
  const [selected, setSelected] = React.useState<SourceKey | null>(null)
  const [csvOpen, setCsvOpen] = React.useState(false)

  const sources = tab === "people" ? PEOPLE_SOURCES : COMPANY_SOURCES

  function close() {
    onOpenChange(false)
    setSelected(null)
  }

  function handleSourceAction() {
    if (!selected) return
    switch (selected) {
      case "ai_search":
        close()
        navigate("/search")
        break
      case "csv":
        close()
        setCsvOpen(true)
        break
      case "saved_search": {
        const ss = lists.filter((l) => l.dynamic && l.source === "search")
        if (ss.length === 0) {
          toast.info("No saved searches yet — run a search first to save one.")
          break
        }
        const base = ss[0]
        const copy = listStore.create({
          name: `${base.name} (copy)`,
          description: base.description,
          color: base.color,
          source: base.source,
          prospectIds: [...base.prospectIds],
          kind: tab === "companies" ? "company" : undefined,
          dynamic: true,
          criteria: base.criteria,
          enrichment: base.enrichment,
          newPerWeek: base.newPerWeek,
        })
        toast.success(`List "${copy.name}" created`)
        close()
        onCreated?.(copy.id)
        navigate(`/lists/${copy.id}`)
        break
      }
      case "duplicate": {
        const targetLists = tab === "companies"
          ? lists.filter((l) => l.kind === "company")
          : lists.filter((l) => l.kind !== "company")
        if (targetLists.length === 0) {
          toast.info("No lists to duplicate yet.")
          break
        }
        const base = targetLists[0]
        const copy = listStore.create({
          name: `${base.name} (copy)`,
          description: base.description,
          color: base.color,
          source: base.source,
          prospectIds: [...base.prospectIds],
          kind: base.kind,
          accountIds: base.accountIds ? [...base.accountIds] : undefined,
        })
        toast.success(`List "${copy.name}" created`)
        close()
        onCreated?.(copy.id)
        navigate(`/lists/${copy.id}`)
        break
      }
      case "manual": {
        const newList = listStore.create({
          name: `New ${tab === "companies" ? "company" : "contact"} list`,
          description: "",
          color: "#7c3aed",
          source: "csv",
          prospectIds: [],
          kind: tab === "companies" ? "company" : undefined,
        })
        toast.success(`List "${newList.name}" created`)
        close()
        onCreated?.(newList.id)
        navigate(`/lists/${newList.id}`)
        break
      }
      default:
        break
    }
  }

  const selectedSource = sources.find((s) => s.key === selected)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle>Create list</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="border-b px-5">
            <div className="flex gap-0">
              {(["people", "companies"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setSelected(null) }}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium capitalize transition-colors",
                    tab === t
                      ? "border-primary text-foreground"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {t === "people" ? (
                    <Users className="size-3.5" />
                  ) : (
                    <Building2 className="size-3.5" />
                  )}
                  {t === "people" ? "Contact" : "Company"}
                </button>
              ))}
            </div>
          </div>

          {/* Source list */}
          <div className="max-h-[420px] overflow-y-auto px-2 py-2">
            {sources.map((source) => {
              const Icon = source.icon
              const isSelected = selected === source.key
              return (
                <button
                  key={source.key}
                  type="button"
                  disabled={!source.available}
                  onClick={() => setSelected(isSelected ? null : source.key)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "bg-primary/8 text-foreground"
                      : source.available
                        ? "hover:bg-muted/60 text-foreground"
                        : "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                      isSelected ? "bg-primary/15" : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{source.label}</span>
                      {source.tag === "soon" && (
                        <Badge variant="secondary" className="gap-1 font-normal text-[10px]">
                          <Lock className="size-2.5" />
                          Coming soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                      {source.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected source action */}
          {selectedSource && selectedSource.available && (
            <div className="border-t px-5 py-3">
              <Button
                className="w-full"
                onClick={handleSourceAction}
              >
                <ArrowRight className="size-4" />
                {selectedSource.key === "ai_search" && "Open AI Search"}
                {selectedSource.key === "csv" && "Upload CSV"}
                {selectedSource.key === "saved_search" && "Create from saved search"}
                {selectedSource.key === "duplicate" && "Duplicate a list"}
                {selectedSource.key === "manual" && "Create empty list"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ImportCsvDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        onImported={(count) => {
          toast.success(
            locale === "es"
              ? `${count} prospectos importados en una nueva lista`
              : `${count} prospects imported into a new list`
          )
        }}
      />
    </>
  )
}
