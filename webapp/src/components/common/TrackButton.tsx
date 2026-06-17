import { Bell, BellRing } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useSubscriptions } from "@/lib/subscriptions"

export function TrackButton({
  kind,
  id,
  name,
  className,
}: {
  kind: "prospect" | "account"
  id: string
  name: string
  className?: string
}) {
  const { isSubscribed, toggle } = useSubscriptions()
  const subscribed = isSubscribed(kind, id)

  const label =
    kind === "prospect"
      ? `${name} — you'll be notified about job changes & company news`
      : `${name} — you'll be notified about news & hiring changes`

  function onClick() {
    const now = toggle(kind, id)
    if (now) toast.success(`Tracking ${name}`, { description: label })
    else toast.info(`Stopped tracking ${name}`)
  }

  return (
    <Button
      variant={subscribed ? "secondary" : "outline"}
      onClick={onClick}
      className={className}
      aria-pressed={subscribed}
    >
      {subscribed ? (
        <BellRing className="size-4" />
      ) : (
        <Bell className="size-4" />
      )}
      {subscribed ? "Tracking" : "Track changes"}
    </Button>
  )
}
