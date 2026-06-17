import * as React from "react"
import { BookOpen, Keyboard, LifeBuoy, MessageCircle, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    Intercom?: (...args: unknown[]) => void
  }
}

interface SupportRowProps {
  icon: React.ReactNode
  label: string
  sub: string
}

function SupportRowContent({ icon, label, sub }: SupportRowProps) {
  return (
    <>
      <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-foreground text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-xs">{sub}</span>
      </span>
    </>
  )
}

const ROW_CLASS =
  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"

export function SupportWidget() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  function handleSendMessage() {
    if (typeof window.Intercom === "function") {
      window.Intercom("showNewMessage")
    } else {
      toast.info("Opening support chat…")
    }
    setOpen(false)
  }

  function handleShortcuts() {
    toast.info("Shortcuts — coming soon")
    setOpen(false)
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Help and support"
          className="bg-popover text-popover-foreground fixed right-6 bottom-20 z-50 w-72 rounded-xl border p-4 shadow-xl"
        >
          <div className="mb-3 space-y-0.5">
            <p className="text-foreground font-semibold">Help &amp; support</p>
            <p className="text-muted-foreground text-sm">We're here to help.</p>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={handleSendMessage}
              className={ROW_CLASS}
            >
              <SupportRowContent
                icon={<MessageCircle className="size-4" />}
                label="Send us a message"
                sub="Chat with our team"
              />
            </button>

            <a
              href="https://info.getkombo.ai/en/"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className={ROW_CLASS}
            >
              <SupportRowContent
                icon={<BookOpen className="size-4" />}
                label="Help center"
                sub="Browse articles & guides"
              />
            </a>

            <button
              type="button"
              onClick={handleShortcuts}
              className={ROW_CLASS}
            >
              <SupportRowContent
                icon={<Keyboard className="size-4" />}
                label="Keyboard shortcuts"
                sub="Tips to move faster"
              />
            </button>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Help and support"
        aria-expanded={open}
        className="fixed right-6 bottom-6 z-50 size-12 rounded-full shadow-lg"
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <LifeBuoy className={cn("size-5")} />
        )}
      </Button>
    </>
  )
}
