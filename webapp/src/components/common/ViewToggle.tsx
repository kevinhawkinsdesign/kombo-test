import { LayoutGrid, Table2 } from "lucide-react"

import { cn } from "@/lib/utils"

export type CollectionView = "cards" | "table"

// A compact Cards / Table segmented toggle, shared by collection pages so the
// control looks and behaves identically everywhere.
export function ViewToggle({
  view,
  onChange,
  cardsLabel,
  tableLabel,
}: {
  view: CollectionView
  onChange: (view: CollectionView) => void
  cardsLabel: string
  tableLabel: string
}) {
  return (
    <div className="bg-muted text-muted-foreground inline-flex h-9 shrink-0 items-center rounded-lg p-[3px]">
      <Toggle
        active={view === "cards"}
        onClick={() => onChange("cards")}
        icon={LayoutGrid}
        label={cardsLabel}
      />
      <Toggle
        active={view === "table"}
        onClick={() => onChange("table")}
        icon={Table2}
        label={tableLabel}
      />
    </div>
  )
}

function Toggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
