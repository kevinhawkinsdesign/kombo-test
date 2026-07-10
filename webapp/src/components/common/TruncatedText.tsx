import * as React from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Wraps a single truncated element (e.g. `<p className="truncate">`) and only
// shows a tooltip with the full text when it's actually clipped —
// scrollWidth > clientWidth is the real signal, not just "has a truncate
// class," so short text that happens to fit never gets a pointless tooltip.
export function TruncatedText({
  children,
  label,
}: {
  children: React.ReactElement<{ ref?: React.Ref<HTMLElement> }>
  label: string
}) {
  const ref = React.useRef<HTMLElement>(null)
  const [overflowing, setOverflowing] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [label])

  const child = React.cloneElement(children, { ref })

  if (!overflowing) return child

  return (
    <Tooltip>
      <TooltipTrigger asChild>{child}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
