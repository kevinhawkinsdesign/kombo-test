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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { dealStore } from "@/lib/store"
import { accounts, DEAL_STAGES } from "@/lib/mock-extra"
import { team } from "@/lib/team"
import type { Deal, DealStage } from "@/lib/types"

interface DealFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal?: Deal
}

const DEFAULT_ACCOUNT_ID = accounts[0]?.id ?? ""
const DEFAULT_STAGE: DealStage = DEAL_STAGES[0]?.key ?? "lead"
const DEFAULT_OWNER_ID = "rep_1"

interface DealFormState {
  name: string
  accountId: string
  value: string
  stage: DealStage
  probability: string
  closeDate: string // yyyy-mm-dd for the date input
  contactName: string
  ownerId: string
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10)
}

function seedState(deal?: Deal): DealFormState {
  if (deal) {
    return {
      name: deal.name,
      accountId: deal.accountId,
      value: String(deal.value),
      stage: deal.stage,
      probability: String(deal.probability),
      closeDate: deal.closeDate.slice(0, 10),
      contactName: deal.contactName,
      ownerId: deal.ownerId,
    }
  }
  return {
    name: "",
    accountId: DEFAULT_ACCOUNT_ID,
    value: "",
    stage: DEFAULT_STAGE,
    probability: "",
    closeDate: todayInput(),
    contactName: "",
    ownerId: DEFAULT_OWNER_ID,
  }
}

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
}: DealFormDialogProps) {
  const [form, setForm] = React.useState<DealFormState>(() => seedState(deal))

  // Reset the form whenever the dialog transitions to open, seeding from the
  // deal being edited. Adjusting state during render (the React-recommended
  // pattern) avoids a cascading-render effect.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setForm(seedState(deal))
    }
  }

  const isEditing = deal !== undefined

  function setField<K extends keyof DealFormState>(
    key: K,
    value: DealFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSave() {
    const payload: Omit<Deal, "id" | "createdAt"> = {
      name: form.name.trim(),
      accountId: form.accountId,
      ownerId: form.ownerId,
      stage: form.stage,
      value: Number(form.value),
      probability: Number(form.probability),
      closeDate: new Date(form.closeDate).toISOString(),
      contactName: form.contactName.trim(),
    }

    if (deal) {
      dealStore.update(deal.id, payload)
      toast.success("Deal updated")
    } else {
      dealStore.create(payload)
      toast.success("Deal created")
    }
    onOpenChange(false)
  }

  const saveDisabled = form.name.trim().length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit deal" : "New deal"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this deal."
              : "Add a new deal to your pipeline."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="deal-name">Name</Label>
            <Input
              id="deal-name"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="e.g. Fever — Platform expansion"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="deal-account">Account</Label>
              <Select
                value={form.accountId}
                onValueChange={(value) => setField("accountId", value)}
              >
                <SelectTrigger id="deal-account" className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deal-owner">Owner</Label>
              <Select
                value={form.ownerId}
                onValueChange={(value) => setField("ownerId", value)}
              >
                <SelectTrigger id="deal-owner" className="w-full">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {team.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id}>
                      {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="deal-value">Value</Label>
              <Input
                id="deal-value"
                type="number"
                value={form.value}
                onChange={(event) => setField("value", event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deal-probability">Probability %</Label>
              <Input
                id="deal-probability"
                type="number"
                min={0}
                max={100}
                value={form.probability}
                onChange={(event) =>
                  setField("probability", event.target.value)
                }
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="deal-stage">Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(value) =>
                  setField("stage", value as DealStage)
                }
              >
                <SelectTrigger id="deal-stage" className="w-full">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((stage) => (
                    <SelectItem key={stage.key} value={stage.key}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deal-close-date">Close date</Label>
              <Input
                id="deal-close-date"
                type="date"
                value={form.closeDate}
                onChange={(event) =>
                  setField("closeDate", event.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deal-contact">Contact name</Label>
            <Input
              id="deal-contact"
              value={form.contactName}
              onChange={(event) =>
                setField("contactName", event.target.value)
              }
              placeholder="e.g. Jane Cooper"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveDisabled}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
