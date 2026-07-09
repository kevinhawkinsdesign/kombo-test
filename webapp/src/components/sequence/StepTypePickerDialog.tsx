import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"
import { CHANNELS } from "@/lib/step-channels"
import { cn } from "@/lib/utils"
import type { StepChannel } from "@/lib/types"

interface ChannelCardCopy {
  label: string
  description: string
}

type GroupKey = "email" | "linkedin" | "messaging" | "aiPowered" | "other"

const GROUPS: { key: GroupKey; channels: StepChannel[] }[] = [
  { key: "email", channels: ["email"] },
  { key: "linkedin", channels: ["linkedin_message", "linkedin_dm", "linkedin_inmail"] },
  { key: "messaging", channels: ["whatsapp", "call"] },
  { key: "aiPowered", channels: ["ai_call"] },
  { key: "other", channels: ["manual"] },
]

const COPY = {
  en: {
    title: "Add a step",
    description: "Pick what happens next in the sequence.",
    cancel: "Cancel",
    groups: {
      email: "Email",
      linkedin: "LinkedIn",
      messaging: "Phone & Messaging",
      aiPowered: "AI-powered",
      other: "Other",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "Email", description: "Send a personalized email." },
      whatsapp: { label: "WhatsApp", description: "Send a WhatsApp message." },
      call: { label: "Phone call", description: "Log a phone call to place." },
      ai_call: {
        label: "AI Voice Call — ElevenLabs",
        description: "Place an agentic AI voice call.",
      },
      linkedin_message: {
        label: "LinkedIn message",
        description: "Send a LinkedIn connection message.",
      },
      linkedin_dm: {
        label: "LinkedIn DM",
        description: "Send a LinkedIn direct message.",
      },
      linkedin_inmail: {
        label: "LinkedIn InMail",
        description: "Send a LinkedIn InMail.",
      },
      manual: {
        label: "Manual task",
        description: "Create a manual task for the rep.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
  },
  es: {
    title: "Añadir un paso",
    description: "Elige qué ocurre después en la secuencia.",
    cancel: "Cancelar",
    groups: {
      email: "Correo",
      linkedin: "LinkedIn",
      messaging: "Teléfono y mensajería",
      aiPowered: "Con IA",
      other: "Otro",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "Correo", description: "Envía un correo personalizado." },
      whatsapp: { label: "WhatsApp", description: "Envía un mensaje de WhatsApp." },
      call: { label: "Llamada", description: "Registra una llamada telefónica pendiente." },
      ai_call: {
        label: "Llamada de voz IA — ElevenLabs",
        description: "Realiza una llamada de voz con IA agente.",
      },
      linkedin_message: {
        label: "Mensaje de LinkedIn",
        description: "Envía un mensaje de conexión de LinkedIn.",
      },
      linkedin_dm: {
        label: "Mensaje directo de LinkedIn",
        description: "Envía un mensaje directo de LinkedIn.",
      },
      linkedin_inmail: {
        label: "InMail de LinkedIn",
        description: "Envía un InMail de LinkedIn.",
      },
      manual: {
        label: "Tarea manual",
        description: "Crea una tarea manual para el representante.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
  },
} as const

interface StepTypePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (channel: StepChannel) => void
  title?: string
  description?: string
}

export function StepTypePickerDialog({
  open,
  onOpenChange,
  onSelect,
  title,
  description,
}: StepTypePickerDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title ?? c.title}</DialogTitle>
          <DialogDescription>{description ?? c.description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
          {GROUPS.map((group) => (
            <div key={group.key} className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {c.groups[group.key]}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.channels.map((channel) => {
                  const meta = CHANNELS[channel]
                  const Icon = meta.Icon
                  const card = c.channels[channel]
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => {
                        onSelect(channel)
                        onOpenChange(false)
                      }}
                      className="hover:border-primary/40 hover:bg-muted/30 flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors"
                    >
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-md",
                          meta.tint
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{card.label}</span>
                        <span className="text-muted-foreground block text-xs">
                          {card.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
