import { Mail } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import type { Channel } from "@/lib/types"

export const ChannelIcon = ({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) =>
  channel === "email" ? (
    <Mail className={className ?? "size-3.5"} />
  ) : (
    <LinkedinIcon className={className ?? "size-3.5"} />
  )
