import * as React from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCredits } from "@/lib/credits"
import { creditPackages, type CreditPackage } from "@/lib/mock-settings"
import { cn } from "@/lib/utils"

interface TopUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultPackageId =
  creditPackages.find((pkg) => pkg.popular)?.id ?? creditPackages[0]?.id ?? ""

// Total credits granted by a package (base credits plus any bonus).
function totalCredits(pkg: CreditPackage): number {
  return pkg.credits + (pkg.bonus ?? 0)
}

export function TopUpDialog({ open, onOpenChange }: TopUpDialogProps) {
  const { topUp } = useCredits()
  const [selectedId, setSelectedId] = React.useState(defaultPackageId)

  // Reset the selection whenever the dialog transitions to open. Adjusting
  // state during render (the React-recommended pattern) avoids a cascading
  // effect-driven re-render.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSelectedId(defaultPackageId)
    }
  }

  const selectedPackage =
    creditPackages.find((pkg) => pkg.id === selectedId) ?? null

  function handlePurchase() {
    if (!selectedPackage) return
    const total = totalCredits(selectedPackage)
    topUp(total, `Top-up — ${total} credits`)
    toast.success(`${total.toLocaleString()} credits added`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Top up credits</DialogTitle>
          <DialogDescription>
            Credits are used for contact reveals, enrichment, and exports.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          {creditPackages.map((pkg) => {
            const isSelected = pkg.id === selectedId
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedId(pkg.id)}
                className={cn(
                  "relative flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/60",
                  isSelected
                    ? "border-primary ring-primary ring-1"
                    : "border-border"
                )}
              >
                {pkg.popular && (
                  <Badge variant="success" className="absolute top-2 right-2">
                    Most popular
                  </Badge>
                )}
                {isSelected && (
                  <Check className="text-primary absolute bottom-3 right-3 size-4" />
                )}
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {pkg.credits.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-xs">credits</p>
                </div>
                {pkg.bonus ? (
                  <p className="text-chart-1 text-xs font-medium">
                    +{pkg.bonus} bonus
                  </p>
                ) : null}
                <p className="text-sm font-semibold">${pkg.price}</p>
              </button>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={!selectedPackage}>
            {selectedPackage ? `Pay $${selectedPackage.price}` : "Purchase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
