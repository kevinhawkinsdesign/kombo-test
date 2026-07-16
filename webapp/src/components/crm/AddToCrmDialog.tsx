import * as React from "react"
import { toast } from "sonner"
import { ArrowRight, Check, CheckCircle2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { CrmSyncFlow } from "@/components/crm/CrmSyncFlow"
import { useLocale } from "@/lib/locale"
import { CRM_PROVIDERS } from "@/lib/mock-depth"
import { crmSyncNeedsManualMapping } from "@/lib/crm-mapping"
import type { CrmProvider } from "@/lib/types"
import { cn } from "@/lib/utils"

// Localized copy for the assignment field (the rest of this dialog predates
// the per-file COPY convention).
const ASSIGN_COPY = {
  en: {
    assignTo: "Owner",
    assignToHint: "Who owns this record in your CRM.",
    crmDefaultOwner: "CRM default owner",
  },
  es: {
    assignTo: "Responsable",
    assignToHint: "Quién será el responsable de este registro en tu CRM.",
    crmDefaultOwner: "Responsable por defecto del CRM",
  },
  it: {
    assignTo: "Proprietario",
    assignToHint: "Chi sarà il proprietario di questo record nel tuo CRM.",
    crmDefaultOwner: "Proprietario predefinito del CRM",
  },
  fr: {
    assignTo: "Propriétaire",
    assignToHint: "Qui sera propriétaire de cet enregistrement dans votre CRM.",
    crmDefaultOwner: "Propriétaire par défaut du CRM",
  },
  de: {
    assignTo: "Owner",
    assignToHint: "Wem dieser Datensatz in deinem CRM gehört.",
    crmDefaultOwner: "Standard-Owner des CRM",
  },
  pt: {
    assignTo: "Proprietário",
    assignToHint: "Quem é o proprietário deste registo no seu CRM.",
    crmDefaultOwner: "Proprietário padrão do CRM",
  },
  pt_BR: {
    assignTo: "Proprietário",
    assignToHint: "Quem é o proprietário deste registro no seu CRM.",
    crmDefaultOwner: "Proprietário padrão do CRM",
  },
} as const

interface AddToCrmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: "prospect" | "company"
  recordId: string
  recordName: string
  accountName: string
  fields: { label: string; value: string }[]
}

const SKIP_FIELD = "— Skip —"

const CRM_FIELD_OPTIONS = [
  "First name",
  "Last name",
  "Email",
  "Phone",
  "Company",
  "Job title",
  "Website",
  "Industry",
  SKIP_FIELD,
] as const

// A duplicate choice is a matched record id, or "create" for a new record.
type DupChoice = string

const CREATE_NEW = "create"
const DEFAULT_DUP = "match_1"

const STEP_COUNT = 4

const STEP_TITLES: Record<number, string> = {
  0: "Choose CRM",
  1: "Map fields",
  2: "Review duplicates",
  3: "Done",
}

const STEP_DESCRIPTIONS: Record<number, string> = {
  0: "Pick the CRM you want to sync this record to.",
  1: "Match Kombo fields to fields in your CRM.",
  2: "We checked for existing records before syncing.",
  3: "Pushing this record to your CRM.",
}

const firstConnectedProviderId =
  CRM_PROVIDERS.find((provider) => provider.connected)?.id ??
  CRM_PROVIDERS[0]?.id ??
  ""

// Pick a sensible default CRM field for a given Kombo source label.
function defaultFieldFor(label: string): string {
  const normalized = label.toLowerCase()
  if (normalized.includes("first")) return "First name"
  if (normalized.includes("last")) return "Last name"
  if (normalized.includes("email")) return "Email"
  if (normalized.includes("phone")) return "Phone"
  if (normalized.includes("title") || normalized.includes("role"))
    return "Job title"
  if (normalized.includes("website") || normalized.includes("domain"))
    return "Website"
  if (normalized.includes("industry")) return "Industry"
  if (normalized.includes("company") || normalized.includes("account"))
    return "Company"
  return SKIP_FIELD
}

function buildDefaultMapping(
  fields: { label: string; value: string }[]
): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const field of fields) {
    mapping[field.label] = defaultFieldFor(field.label)
  }
  return mapping
}

function ProviderLogo({
  provider,
  className,
}: {
  provider: CrmProvider
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md text-base font-semibold text-white",
        className
      )}
      style={{ backgroundColor: provider.logoColor }}
    >
      {provider.name.charAt(0)}
    </span>
  )
}

export function AddToCrmDialog({
  open,
  onOpenChange,
  kind,
  recordId,
  recordName,
  accountName,
  fields,
}: AddToCrmDialogProps) {
  const { locale } = useLocale()
  const ac = ASSIGN_COPY[locale]
  const [step, setStep] = React.useState(0)
  const [providerId, setProviderId] = React.useState(firstConnectedProviderId)
  const [mapping, setMapping] = React.useState<Record<string, string>>(() =>
    buildDefaultMapping(fields)
  )
  const [dupChoice, setDupChoice] = React.useState<DupChoice>(DEFAULT_DUP)
  const [assigneeId, setAssigneeId] = React.useState<string | undefined>(
    undefined
  )

  // Reset the wizard whenever it transitions to open. Adjusting state during
  // render (the React-recommended pattern) avoids a cascading-render effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStep(0)
      setProviderId(firstConnectedProviderId)
      setMapping(buildDefaultMapping(fields))
      setDupChoice(DEFAULT_DUP)
      setAssigneeId(undefined)
    }
  }

  const provider = React.useMemo(
    () =>
      CRM_PROVIDERS.find((candidate) => candidate.id === providerId) ?? null,
    [providerId]
  )

  const selectedConnected = provider?.connected ?? false
  const hasDuplicate = providerId === "hubspot"
  const kindLabel = kind === "company" ? "company" : "prospect"

  // Simulated existing matches the CRM returned for this record.
  const dupMatches = React.useMemo(
    () => [
      {
        id: "match_1",
        name: recordName,
        detail: "Owner: Maya Patel · last activity 12d ago",
      },
      {
        id: "match_2",
        name: recordName,
        detail: "Owner: unassigned · imported from CSV · 3mo ago",
      },
    ],
    [recordName]
  )
  function selectProvider(candidate: CrmProvider) {
    if (!candidate.connected) {
      toast.info(`Connect ${candidate.name} first`)
      return
    }
    setProviderId(candidate.id)
  }

  function setFieldMapping(label: string, crmField: string) {
    setMapping((current) => ({ ...current, [label]: crmField }))
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  function handlePrimary() {
    setStep((current) => current + 1)
  }

  const primaryLabel = step === 2 ? "Confirm" : "Continue"
  const primaryDisabled = step === 0 && !selectedConnected
  const showBack = step !== 0 && step !== 3
  const needsManualMapping = crmSyncNeedsManualMapping(
    kind === "prospect" ? "person" : "company",
    recordId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{STEP_TITLES[step]}</DialogTitle>
          <DialogDescription>{STEP_DESCRIPTIONS[step]}</DialogDescription>

          {/* Stepper */}
          <ol className="mt-3 flex items-center gap-1.5">
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <li key={i} className="flex flex-1 items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                    i < step && "bg-primary text-primary-foreground",
                    i === step && "border-primary text-primary border-2",
                    i > step && "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    i === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {STEP_TITLES[i]}
                </span>
                {i < STEP_COUNT - 1 && <span className="bg-border h-px flex-1" />}
              </li>
            ))}
          </ol>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {CRM_PROVIDERS.map((candidate) => {
              const isSelected = candidate.id === providerId
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => selectProvider(candidate)}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border p-3 text-left transition-colors",
                    candidate.connected
                      ? "hover:bg-muted/60"
                      : "cursor-default opacity-80",
                    isSelected && candidate.connected
                      ? "border-primary ring-primary/30 ring-1"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ProviderLogo provider={candidate} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {candidate.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {candidate.objectName}
                      </p>
                    </div>
                    {isSelected && candidate.connected && (
                      <Check className="text-primary size-4" />
                    )}
                  </div>
                  {candidate.connected ? (
                    <Badge variant="success">Connected</Badge>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        Not connected
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={(event) => {
                          event.stopPropagation()
                          toast.info(`Connect ${candidate.name} first`)
                        }}
                      >
                        Connect
                      </Button>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{ac.assignTo}</p>
            <AssigneePicker
              value={assigneeId}
              onChange={setAssigneeId}
              unassignedLabel={ac.crmDefaultOwner}
            />
            <p className="text-muted-foreground text-xs">{ac.assignToHint}</p>
          </div>
          </div>
        )}

        {step === 1 && provider && (
          <div className="space-y-3">
            <p className="text-sm">
              Creating a new{" "}
              <span className="font-medium">{provider.objectName}</span> in{" "}
              <span className="font-medium">{provider.name}</span> from this{" "}
              {kindLabel}.
            </p>
            <Separator />
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.label} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {field.label}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {field.value}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                  <Select
                    value={mapping[field.label] ?? SKIP_FIELD}
                    onValueChange={(value) =>
                      setFieldMapping(field.label, value)
                    }
                  >
                    <SelectTrigger className="w-40 shrink-0">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {CRM_FIELD_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && provider && (
          <div className="space-y-3">
            {hasDuplicate ? (
              <div className="border-chart-4/40 bg-chart-4/10 space-y-3 rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">
                    {dupMatches.length} possible duplicates found
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Choose a {provider.objectName} to update, or create a new
                    one.
                  </p>
                </div>
                <div className="space-y-2">
                  {dupMatches.map((match) => (
                    <DupOption
                      key={match.id}
                      label={match.name}
                      detail={match.detail}
                      selected={dupChoice === match.id}
                      onSelect={() => setDupChoice(match.id)}
                    />
                  ))}
                  <DupOption
                    label="Create a new record instead"
                    selected={dupChoice === CREATE_NEW}
                    onSelect={() => setDupChoice(CREATE_NEW)}
                  />
                </div>
              </div>
            ) : (
              <div className="border-chart-1/40 bg-chart-1/10 flex items-start gap-3 rounded-lg border p-4">
                <CheckCircle2 className="text-chart-1 mt-0.5 size-5 shrink-0" />
                <p className="text-sm">
                  No duplicates found — will create a new{" "}
                  <span className="font-medium">{provider.objectName}</span>.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && provider && (
          <CrmSyncFlow
            crmName={provider.name}
            recordName={recordName}
            accountName={accountName}
            willFail={needsManualMapping}
            onDone={() => onOpenChange(false)}
          />
        )}

        {step !== 3 && (
          <DialogFooter>
            {showBack && (
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
            )}
            <Button variant="volt" onClick={handlePrimary} disabled={primaryDisabled}>
              {primaryLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DupOption({
  label,
  detail,
  selected,
  onSelect,
}: {
  label: string
  detail?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "bg-background flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
        selected ? "border-primary ring-primary/30 ring-1" : "border-border"
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary" : "border-muted-foreground/40"
        )}
      >
        {selected && <span className="bg-primary size-2 rounded-full" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{label}</span>
        {detail && (
          <span className="text-muted-foreground block truncate text-xs">
            {detail}
          </span>
        )}
      </span>
    </button>
  )
}
