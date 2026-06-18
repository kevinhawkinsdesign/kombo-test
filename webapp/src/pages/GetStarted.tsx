import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Building2,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Plus,
  Target,
  Trash2,
  Users,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { ImpactBand } from "@/components/common/ImpactBand"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSetup, type SetupTaskId } from "@/lib/setup"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS = [
  "VP of Sales",
  "Head of Sales",
  "RevOps",
  "Account Executive",
  "SDR / BDR",
]

interface ChecklistTask {
  id: SetupTaskId
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const CHECKLIST: ChecklistTask[] = [
  {
    id: "crm",
    title: "Connect your CRM",
    description: "Sync prospects, activities, and deals two-way.",
    icon: Building2,
  },
  {
    id: "linkedin",
    title: "Connect LinkedIn",
    description: "Enrich profiles and send outreach from Kombo.",
    icon: LinkedinIcon,
  },
  {
    id: "team",
    title: "Invite your team",
    description: "Collaborate on pipeline and share templates.",
    icon: Users,
  },
  {
    id: "profile",
    title: "Set your role & goals",
    description: "Tailor dashboards and AI recommendations.",
    icon: Target,
  },
  {
    id: "links",
    title: "Add quick links",
    description: "Pin the tools you use every day.",
    icon: LinkIcon,
  },
]

export default function GetStarted() {
  const setup = useSetup()
  const completedCount = setup.completed.size
  const allDone = setup.progress === 100

  const [role, setRole] = React.useState(setup.role)
  const [goals, setGoals] = React.useState(setup.goals)
  const [linkLabel, setLinkLabel] = React.useState("")
  const [linkUrl, setLinkUrl] = React.useState("")

  function handleSaveProfile() {
    setup.setProfile(role, goals)
    toast.success("Saved")
  }

  function handleAddLink() {
    const label = linkLabel.trim()
    const url = linkUrl.trim()
    if (!label || !url) return
    setup.addQuickLink(label, url)
    setLinkLabel("")
    setLinkUrl("")
    toast.success("Link added")
  }

  return (
    <Page className="max-w-3xl">
      <PageHeading
        title="Get started"
        description="Finish setting up your workspace to get the most out of Kombo."
      />

      <div className="space-y-4">
        <ImpactBand />

        {/* Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {completedCount} of {CHECKLIST.length} complete
                </CardTitle>
                {allDone && (
                  <CardDescription>You&apos;re all set 🎉</CardDescription>
                )}
              </div>
              <span className="text-2xl font-semibold tabular-nums">
                {setup.progress}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={setup.progress} />
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Setup checklist</CardTitle>
            <CardDescription>
              Knock these out to unlock the full Kombo experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {CHECKLIST.map((task, i) => {
              const done = setup.isDone(task.id)
              const Icon = task.icon
              return (
                <React.Fragment key={task.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center gap-4 py-3">
                    {done ? (
                      <CheckCircle2 className="text-chart-1 size-5 shrink-0" />
                    ) : (
                      <Circle className="text-muted-foreground size-5 shrink-0" />
                    )}
                    <Icon className="text-muted-foreground size-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          done && "text-muted-foreground line-through"
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {task.description}
                      </p>
                    </div>
                    <TaskAction task={task} done={done} setup={setup} />
                  </div>
                </React.Fragment>
              )
            })}
          </CardContent>
        </Card>

        {/* Role & goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your role &amp; goals</CardTitle>
            <CardDescription>
              We use this to tailor your dashboards and AI suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Book 30 qualified meetings/month, grow pipeline 2x"
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>Save</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick links</CardTitle>
            <CardDescription>
              Pin the tools and resources you reach for most.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setup.quickLinks.length > 0 && (
              <div className="space-y-1">
                {setup.quickLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <LinkIcon className="text-muted-foreground size-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {link.label}
                      </a>
                      <p className="text-muted-foreground truncate text-xs">
                        {link.url}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${link.label}`}
                      onClick={() => setup.removeQuickLink(link.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="link-label">Label</Label>
                <Input
                  id="link-label"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="LinkedIn Sales Navigator"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <Button
                onClick={handleAddLink}
                disabled={!linkLabel.trim() || !linkUrl.trim()}
              >
                <Plus className="size-4" />
                Add link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}

function TaskAction({
  task,
  done,
  setup,
}: {
  task: ChecklistTask
  done: boolean
  setup: ReturnType<typeof useSetup>
}) {
  if (task.id === "crm") {
    return done ? (
      <Badge variant="success" className="font-normal">
        Connected
      </Badge>
    ) : (
      <Button asChild size="sm" variant="outline">
        <Link to="/integrations">Connect</Link>
      </Button>
    )
  }

  if (task.id === "linkedin") {
    return done ? (
      <Badge variant="success" className="font-normal">
        Connected
      </Badge>
    ) : (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setup.complete("linkedin")
          toast.success("LinkedIn connected")
        }}
      >
        Connect
      </Button>
    )
  }

  if (task.id === "team") {
    return done ? (
      <Badge variant="success" className="font-normal">
        Done
      </Badge>
    ) : (
      <Button asChild size="sm" variant="outline">
        <Link to="/team">Invite team</Link>
      </Button>
    )
  }

  // profile + links are completed via their editor cards below.
  return done ? (
    <Badge variant="success" className="font-normal">
      Done
    </Badge>
  ) : (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setup.complete(task.id)}
    >
      Mark done
    </Button>
  )
}
