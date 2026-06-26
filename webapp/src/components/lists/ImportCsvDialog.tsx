import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowRight, FileText, Trash2, Upload } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { listStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface ImportCsvDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: (count: number) => void
}

const STEP_COUNT = 3

const FILE_NAME = "prospects.csv"
const ROW_COUNT = 128
const DUPLICATE_COUNT = 4
const NEW_COUNT = ROW_COUNT - DUPLICATE_COUNT

const SKIP_FIELD = "— Skip —"

const CSV_COLUMNS = [
  "First Name",
  "Last Name",
  "Email",
  "Company",
  "Job Title",
  "LinkedIn URL",
] as const

const KOMBO_FIELDS = [
  "First name",
  "Last name",
  "Email",
  "Company",
  "Job title",
  "LinkedIn",
  SKIP_FIELD,
] as const

interface SampleRow {
  name: string
  email: string
  company: string
}

const SAMPLE_ROWS: SampleRow[] = [
  { name: "Ava Bennett", email: "ava@northwind.io", company: "Fever" },
  { name: "Liam Carter", email: "liam@brightloop.com", company: "Brightloop" },
  { name: "Maya Singh", email: "maya@vertexlabs.co", company: "Product Hackers" },
]

const STEP_TITLES: Record<number, string> = {
  0: "Upload CSV",
  1: "Map columns",
  2: "Review & import",
}

const STEP_DESCRIPTIONS: Record<number, string> = {
  0: "Choose a CSV file of prospects to import.",
  1: "Match each CSV column to a Kombo field.",
  2: "Double-check the summary before importing.",
}

// Pick a sensible default Kombo field for a detected CSV column header.
function defaultFieldFor(column: string): string {
  const normalized = column.toLowerCase()
  if (normalized.includes("first")) return "First name"
  if (normalized.includes("last")) return "Last name"
  if (normalized.includes("email")) return "Email"
  if (normalized.includes("title") || normalized.includes("role"))
    return "Job title"
  if (normalized.includes("linkedin")) return "LinkedIn"
  if (normalized.includes("company") || normalized.includes("account"))
    return "Company"
  return SKIP_FIELD
}

function buildDefaultMapping(): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const column of CSV_COLUMNS) {
    mapping[column] = defaultFieldFor(column)
  }
  return mapping
}

export function ImportCsvDialog({
  open,
  onOpenChange,
  onImported,
}: ImportCsvDialogProps) {
  const navigate = useNavigate()
  const [step, setStep] = React.useState(0)
  const [selected, setSelected] = React.useState(false)
  const [mapping, setMapping] = React.useState<Record<string, string>>(() =>
    buildDefaultMapping()
  )

  // Reset the wizard whenever it transitions to open. Adjusting state during
  // render (the React-recommended pattern) avoids a cascading-render effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStep(0)
      setSelected(false)
      setMapping(buildDefaultMapping())
    }
  }

  const mappedFieldCount = React.useMemo(
    () =>
      Object.values(mapping).filter((field) => field !== SKIP_FIELD).length,
    [mapping]
  )

  function setColumnMapping(column: string, field: string) {
    setMapping((current) => ({ ...current, [column]: field }))
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  function handlePrimary() {
    if (step === 0 || step === 1) {
      setStep((current) => current + 1)
      return
    }
    // Materialize a real list so the user lands on what they imported.
    const list = listStore.create({
      name: "Imported contacts",
      description: "",
      color: "#0ea5e9",
      kind: "people",
    })
    onImported(NEW_COUNT)
    toast.success(`${NEW_COUNT} prospects imported`)
    onOpenChange(false)
    navigate(`/lists/${list.id}`)
  }

  const primaryLabel =
    step === 2 ? `Import ${NEW_COUNT} prospects` : "Continue"
  const primaryDisabled = step === 0 && !selected
  const showBack = step !== 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="text-muted-foreground text-xs font-medium">
            Step {step + 1} of {STEP_COUNT}
          </div>
          <DialogTitle>{STEP_TITLES[step]}</DialogTitle>
          <DialogDescription>{STEP_DESCRIPTIONS[step]}</DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-3">
            <div className="border-input rounded-lg border-2 border-dashed p-10 text-center">
              <Upload className="text-muted-foreground mx-auto size-8" />
              <p className="mt-3 text-sm font-medium">
                Drag &amp; drop your CSV here
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                or browse to pick a file
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSelected(true)}
              >
                Choose file
              </Button>
            </div>

            {selected && (
              <div className="flex items-center gap-3 rounded-md border px-3 py-2">
                <FileText className="text-muted-foreground size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{FILE_NAME}</p>
                  <p className="text-muted-foreground text-xs">
                    {ROW_COUNT} rows
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-8 shrink-0"
                  aria-label="Remove file"
                  onClick={() => setSelected(false)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CSV column</TableHead>
                  <TableHead className="w-8" aria-hidden />
                  <TableHead>Kombo field</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CSV_COLUMNS.map((column) => (
                  <TableRow key={column}>
                    <TableCell className="font-medium">{column}</TableCell>
                    <TableCell className="w-8">
                      <ArrowRight className="text-muted-foreground size-4" />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={mapping[column] ?? SKIP_FIELD}
                        onValueChange={(value) =>
                          setColumnMapping(column, value)
                        }
                      >
                        <SelectTrigger className="w-44" size="sm">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {KOMBO_FIELDS.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-muted-foreground text-xs">
              {ROW_COUNT} rows detected · duplicates will be skipped
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-sm">
                <span className="font-medium">{ROW_COUNT} prospects</span> ·{" "}
                {mappedFieldCount} mapped fields · ~{DUPLICATE_COUNT} duplicates
                skipped →{" "}
                <span className="text-foreground font-medium">
                  {NEW_COUNT} new
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                Sample preview
              </p>
              <Separator />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_ROWS.map((row) => (
                    <TableRow key={row.email}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.company}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter>
          {showBack && (
            <Button variant="outline" onClick={goBack}>
              Back
            </Button>
          )}
          <Button
            onClick={handlePrimary}
            disabled={primaryDisabled}
            className={cn(step === 2 && "min-w-[160px]")}
          >
            {primaryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
