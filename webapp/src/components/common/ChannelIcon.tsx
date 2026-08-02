import { Mail } from "lucide-react"

import { LinkedinIcon, WhatsappIcon } from "@/components/icons/BrandIcons"
import type { Channel } from "@/lib/types"

// WhatsApp is a first-class channel alongside email and LinkedIn, so it needs
// its own glyph — it previously fell through to the LinkedIn mark, which
// mislabelled every WhatsApp thread. Remaining channels keep the LinkedIn
// fallback until they get real mock coverage.
export const ChannelIcon = ({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) =>
  channel === "email" ? (
    <Mail className={className ?? "size-3.5"} />
  ) : channel === "whatsapp" ? (
    <WhatsappIcon className={className ?? "size-3.5"} />
  ) : (
    <LinkedinIcon className={className ?? "size-3.5"} />
  )
