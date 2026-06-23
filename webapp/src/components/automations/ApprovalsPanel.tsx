import { toast } from "sonner"
import {
  ShieldCheck,
  Shield,
  Check,
  X,
  Zap,
  Repeat,
  TriangleAlert,
  Sparkles,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale"
import { relativeTime } from "@/lib/format"
import {
  useApprovals,
  approvalStore,
  type PendingApproval,
} from "@/lib/mock-approvals"
import { automationStore } from "@/lib/mock-automations"

const COPY = {
  en: {
    heroTitle: "You're always in charge",
    heroBody:
      "Kai asks before anything irreversible — sending, enrolling, or syncing. Approve, deny, or turn it into an automation so it just happens next time.",
    approvalRequired: "Approval required",
    irreversible: "Irreversible",
    trigger: "Trigger",
    approve: "Approve",
    deny: "Deny",
    automate: "Always do this",
    automateHint: "Run automatically next time this happens",
    pending: "Awaiting your approval",
    resolved: "Recently resolved",
    none: "Nothing needs your approval right now.",
    noneBody: "Kai will queue actions here before doing anything irreversible.",
    approved: "Approved",
    denied: "Denied",
    contacts: (n: number) => `${n.toLocaleString()} ${n === 1 ? "contact" : "contacts"}`,
    approvedToast: (target: string) => `Approved — running on ${target}`,
    deniedToast: "Denied — Kai won't proceed",
    automatedToast: (trigger: string) =>
      `Automation created — this now runs automatically on "${trigger}"`,
    dismiss: "Clear",
  },
  es: {
    heroTitle: "Siempre tienes el control",
    heroBody:
      "Kai pregunta antes de cualquier acción irreversible — enviar, inscribir o sincronizar. Aprueba, deniega o conviértela en automatización para que ocurra sola la próxima vez.",
    approvalRequired: "Aprobación requerida",
    irreversible: "Irreversible",
    trigger: "Disparador",
    approve: "Aprobar",
    deny: "Denegar",
    automate: "Hacer siempre esto",
    automateHint: "Ejecutar automáticamente la próxima vez que ocurra",
    pending: "Esperando tu aprobación",
    resolved: "Resueltas recientemente",
    none: "Nada necesita tu aprobación ahora mismo.",
    noneBody: "Kai pondrá en cola las acciones aquí antes de hacer algo irreversible.",
    approved: "Aprobada",
    denied: "Denegada",
    contacts: (n: number) => `${n.toLocaleString()} ${n === 1 ? "contacto" : "contactos"}`,
    approvedToast: (target: string) => `Aprobado — ejecutando en ${target}`,
    deniedToast: "Denegado — Kai no continuará",
    automatedToast: (trigger: string) =>
      `Automatización creada — ahora se ejecuta sola con "${trigger}"`,
    dismiss: "Quitar",
  },
} as const

// Infer a sensible step chain for the automation built from an approval.
function stepsFor(action: string): ("enrich" | "campaign" | "crm" | "list")[] {
  const a = action.toLowerCase()
  if (a.includes("crm") || a.includes("sync")) return ["enrich", "crm"]
  if (a.includes("sequence") || a.includes("send")) return ["enrich", "list", "campaign"]
  return ["enrich", "list", "campaign", "crm"]
}

export function ApprovalsPanel() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const approvals = useApprovals()

  const pending = approvals.filter((a) => a.status === "pending")
  const resolved = approvals.filter((a) => a.status !== "pending").slice(0, 6)

  function approve(a: PendingApproval) {
    approvalStore.approve(a.id)
    toast.success(c.approvedToast(a.target))
  }

  function deny(a: PendingApproval) {
    approvalStore.deny(a.id)
    toast(c.deniedToast)
  }

  // "Always do this when X happens" — turn the one-off approval into a running,
  // auto-approving automation, and approve the current run.
  function automate(a: PendingApproval) {
    automationStore.create({
      name: a.action,
      description: `${a.action} automatically whenever ${a.trigger.toLowerCase()}.`,
      trigger: a.trigger,
      cadence: "realtime",
      steps: stepsFor(a.action),
      approvalMode: "auto",
      status: "running",
    })
    approvalStore.approve(a.id)
    toast.success(c.automatedToast(a.trigger))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      {/* Hero */}
      <Card className="border-primary/20 from-primary/[0.05] to-card flex-row items-start gap-3 bg-gradient-to-br p-5">
        <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <p className="font-semibold">{c.heroTitle}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">{c.heroBody}</p>
        </div>
      </Card>

      {/* Pending */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          {c.pending}{" "}
          <span className="text-muted-foreground tabular-nums">
            ({pending.length})
          </span>
        </h3>

        {pending.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed py-10 text-center">
            <Sparkles className="text-primary mx-auto mb-2 size-5" />
            <p className="text-sm font-medium">{c.none}</p>
            <p className="text-xs">{c.noneBody}</p>
          </div>
        ) : (
          pending.map((a) => (
            <Card
              key={a.id}
              className="border-chart-4/30 from-chart-4/[0.05] to-card gap-3 bg-gradient-to-br p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-chart-4 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                  <Shield className="size-3.5" />
                  {c.approvalRequired}
                </span>
                {a.irreversible && (
                  <Badge
                    variant="outline"
                    className="border-destructive/30 text-destructive gap-1 font-normal"
                  >
                    <TriangleAlert className="size-3" />
                    {c.irreversible}
                  </Badge>
                )}
              </div>

              <div>
                <p className="font-semibold">
                  {a.action} <span className="text-muted-foreground">·</span>{" "}
                  {a.target}
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {a.detail}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Zap className="text-chart-4 size-3" />
                  {a.trigger}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {relativeTime(a.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                <Button
                  variant="volt"
                  size="sm"
                  onClick={() => approve(a)}
                  className="bg-chart-1/15 text-chart-1 hover:bg-chart-1/25 border-transparent"
                >
                  <Check className="size-4" />
                  {c.approve}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deny(a)}
                >
                  <X className="size-4" />
                  {c.deny}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary ml-auto"
                  onClick={() => automate(a)}
                  title={c.automateHint}
                >
                  <Repeat className="size-4" />
                  {c.automate}
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>

      {/* Resolved */}
      {resolved.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">{c.resolved}</h3>
          {resolved.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
            >
              <span
                className={
                  a.status === "approved"
                    ? "bg-chart-1/15 text-chart-1 flex size-7 shrink-0 items-center justify-center rounded-md"
                    : "bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md"
                }
              >
                {a.status === "approved" ? (
                  <Check className="size-4" />
                ) : (
                  <X className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {a.action} · {a.target}
                </p>
                <p className="text-muted-foreground text-xs">
                  {a.resolvedAt ? relativeTime(a.resolvedAt) : ""}
                </p>
              </div>
              <Badge
                variant={a.status === "approved" ? "success" : "secondary"}
                className="font-normal"
              >
                {a.status === "approved" ? c.approved : c.denied}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-7"
                aria-label={c.dismiss}
                onClick={() => approvalStore.remove(a.id)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
