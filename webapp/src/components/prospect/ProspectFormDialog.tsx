import * as React from "react"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prospectStore } from "@/lib/store"
import type { Prospect, ProspectStatus } from "@/lib/types"

interface ProspectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect?: Prospect
}

interface FormValues {
  firstName: string
  lastName: string
  title: string
  company: string
  companyDomain: string
  email: string
  phone: string
  location: string
  industry: string
  seniority: string
  department: string
  score: string
  status: ProspectStatus
}

const STATUS_OPTIONS: { value: ProspectStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "meeting", label: "Meeting" },
  { value: "customer", label: "Customer" },
  { value: "not_interested", label: "Not interested" },
]

const AVATAR_COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
]

// Deterministic color pick from a seed string so the same prospect keeps a
// stable avatar color across renders.
function avatarColorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function emptyValues(): FormValues {
  return {
    firstName: "",
    lastName: "",
    title: "",
    company: "",
    companyDomain: "",
    email: "",
    phone: "",
    location: "",
    industry: "",
    seniority: "",
    department: "",
    score: "50",
    status: "new",
  }
}

function valuesFrom(prospect: Prospect): FormValues {
  return {
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    title: prospect.title,
    company: prospect.company,
    companyDomain: prospect.companyDomain,
    email: prospect.email,
    phone: prospect.phone ?? "",
    location: prospect.location,
    industry: prospect.industry,
    seniority: prospect.seniority,
    department: prospect.department,
    score: String(prospect.score),
    status: prospect.status,
  }
}

function clampScore(raw: string): number {
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return 0
  return Math.min(100, Math.max(0, parsed))
}

export function ProspectFormDialog({
  open,
  onOpenChange,
  prospect,
}: ProspectFormDialogProps) {
  const isEdit = Boolean(prospect)
  const [values, setValues] = React.useState<FormValues>(() =>
    prospect ? valuesFrom(prospect) : emptyValues()
  )

  // Reset the form whenever the dialog transitions to open, seeding from the
  // passed prospect. Adjusting state during render avoids a cascading effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(prospect ? valuesFrom(prospect) : emptyValues())
    }
  }

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const saveDisabled =
    !values.firstName.trim() ||
    !values.lastName.trim() ||
    !values.company.trim()

  function handleSave() {
    if (saveDisabled) return

    const firstName = values.firstName.trim()
    const lastName = values.lastName.trim()
    const title = values.title.trim()
    const company = values.company.trim()

    const formValues = {
      firstName,
      lastName,
      title,
      company,
      companyDomain: values.companyDomain.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      location: values.location.trim(),
      industry: values.industry.trim(),
      seniority: values.seniority.trim(),
      department: values.department.trim(),
      score: clampScore(values.score),
      status: values.status,
    }

    if (prospect) {
      prospectStore.update(prospect.id, { ...prospect, ...formValues })
      toast.success("Prospect updated")
    } else {
      prospectStore.create({
        ...formValues,
        avatarColor: avatarColorFor(`${firstName} ${lastName} ${company}`),
        tags: [],
        headcount: "50-200",
        revenue: "$10M-$50M",
        about: `${title || "Contact"} at ${company}.`,
        signals: [],
        linkedinUrl:
          `https://linkedin.com/in/${firstName}-${lastName}`.toLowerCase(),
      })
      toast.success("Prospect created")
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit prospect" : "Add prospect"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this prospect's details."
              : "Add a new prospect to your list."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="prospect-first-name"
            label="First name"
            value={values.firstName}
            onChange={(v) => setField("firstName", v)}
            autoFocus
          />
          <Field
            id="prospect-last-name"
            label="Last name"
            value={values.lastName}
            onChange={(v) => setField("lastName", v)}
          />
          <Field
            id="prospect-title"
            label="Title"
            value={values.title}
            onChange={(v) => setField("title", v)}
          />
          <Field
            id="prospect-company"
            label="Company"
            value={values.company}
            onChange={(v) => setField("company", v)}
          />
          <Field
            id="prospect-company-domain"
            label="Company domain"
            value={values.companyDomain}
            onChange={(v) => setField("companyDomain", v)}
            placeholder="acme.com"
          />
          <Field
            id="prospect-email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(v) => setField("email", v)}
            placeholder="name@acme.com"
          />
          <Field
            id="prospect-phone"
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(v) => setField("phone", v)}
          />
          <Field
            id="prospect-location"
            label="Location"
            value={values.location}
            onChange={(v) => setField("location", v)}
          />
          <Field
            id="prospect-industry"
            label="Industry"
            value={values.industry}
            onChange={(v) => setField("industry", v)}
          />
          <Field
            id="prospect-seniority"
            label="Seniority"
            value={values.seniority}
            onChange={(v) => setField("seniority", v)}
          />
          <Field
            id="prospect-department"
            label="Department"
            value={values.department}
            onChange={(v) => setField("department", v)}
          />
          <Field
            id="prospect-score"
            label="Score"
            type="number"
            min={0}
            max={100}
            value={values.score}
            onChange={(v) => setField("score", v)}
          />
          <div className="grid gap-2">
            <Label htmlFor="prospect-status">Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => setField("status", v as ProspectStatus)}
            >
              <SelectTrigger id="prospect-status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="volt" onClick={handleSave} disabled={saveDisabled}>
            {isEdit ? "Save changes" : "Add prospect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type,
  placeholder,
  autoFocus,
  min,
  max,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoFocus?: boolean
  min?: number
  max?: number
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        min={min}
        max={max}
      />
    </div>
  )
}
