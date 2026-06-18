import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Check,
  Monitor,
  Moon,
  Sun,
  Plus,
  Trash2,
  ExternalLink,
  Building2,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth"
import { team } from "@/lib/team"
import { initials } from "@/lib/format"
import {
  SALES_METHODOLOGIES,
  blacklistedCompanies as seedBlacklist,
  type BlacklistedCompany,
} from "@/lib/mock-settings"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export default function Settings() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <Page className="max-w-3xl">
      <PageHeading
        title="Settings"
        description="Manage your account, value proposition, selling config, and connections."
      />

      <Tabs defaultValue="account">
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="value">Value props</TabsTrigger>
          <TabsTrigger value="selling">Selling</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="blacklists">Blacklists</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* ACCOUNT */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile details</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Full name" value={user?.name} />
                <Field id="email" label="Email" type="email" value={user?.email} />
                <Field id="role" label="Role" value={user?.role} />
                <Field id="company" label="Company" value={user?.company} />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Profile saved")}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart uploads</CardTitle>
              <CardDescription>
                How Kombo processes prospect lists you import.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <PreferenceRow
                title="Auto-enrich on upload"
                description="Append 30 data points to every imported prospect."
                defaultChecked
              />
              <PreferenceRow
                title="Auto-assign to a list"
                description="Group each upload into a new list automatically."
                defaultChecked
              />
              <PreferenceRow
                title="Skip duplicates"
                description="Ignore prospects already in your workspace."
                defaultChecked
              />
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Upload settings saved")}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VALUE PROPOSITION */}
        <TabsContent value="value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ideal Customer Profile</CardTitle>
              <CardDescription>
                Kombo uses this to score and recommend prospects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="icp-industry" label="Target industry" value="B2B SaaS" />
                <Field
                  id="icp-size"
                  label="Company size"
                  value="50–1000 employees"
                />
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="icp-titles">Target titles</Label>
                  <Input
                    id="icp-titles"
                    defaultValue="VP Sales, CRO, Head of RevOps"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("ICP saved")}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <UspsCard />
        </TabsContent>

        {/* SELLING CONFIGURATION */}
        <TabsContent value="selling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Outreach templates</CardTitle>
              <CardDescription>
                The templates and playbook Kai draws from when drafting outreach.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to="/templates">Manage templates</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/playbook">Open playbook</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales methodology</CardTitle>
              <CardDescription>
                Kai uses this to structure call prep and qualification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Methodology</Label>
                <Select defaultValue="MEDDIC">
                  <SelectTrigger className="w-full sm:w-72">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALES_METHODOLOGIES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Methodology saved")}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONNECTIONS */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connections</CardTitle>
              <CardDescription>
                Link the networks and systems Kombo works across.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center gap-3 rounded-md px-2 py-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#0a66c2]/10">
                  <LinkedinIcon className="size-5 text-[#0a66c2]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Professional network</p>
                    <Badge
                      variant="outline"
                      className="border-chart-4/40 text-chart-4"
                    >
                      New
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Connect LinkedIn to enrich and message in-app.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="volt"
                  onClick={() => toast.success("LinkedIn connected")}
                >
                  Connect
                </Button>
              </div>
              <Separator />
              <div className="flex items-center gap-3 rounded-md px-2 py-3">
                <span className="bg-muted flex size-9 items-center justify-center rounded-lg">
                  <Building2 className="text-muted-foreground size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">CRM (HubSpot)</p>
                  <p className="text-muted-foreground text-xs">
                    Two-way sync of contacts, activities, and deals.
                  </p>
                </div>
                <Badge variant="success" className="gap-1">
                  <Check className="size-3" />
                  Connected
                </Badge>
              </div>
              <Separator />
              <div className="px-2 pt-2">
                <Button variant="link" asChild className="h-auto px-0">
                  <Link to="/integrations">
                    Manage all integrations
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BLACKLISTS */}
        <TabsContent value="blacklists">
          <BlacklistCard />
        </TabsContent>

        {/* PREFERENCES */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>
                Customize how Kombo looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const active = theme === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        {active && (
                          <Check className="text-primary absolute top-2 right-2 size-4" />
                        )}
                        <Icon className="size-5" />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <Separator />
              <PreferenceRow
                title="AI suggestions"
                description="Surface recommended prospects and next steps."
                defaultChecked
              />
              <PreferenceRow
                title="Daily digest"
                description="A summary of pipeline activity each morning."
                defaultChecked
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Choose what you get notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <PreferenceRow
                title="Prospect replies"
                description="When a prospect replies to your outreach."
                defaultChecked
              />
              <PreferenceRow
                title="Meetings booked"
                description="When a meeting is booked from a sequence."
                defaultChecked
              />
              <PreferenceRow
                title="Deal stage changes"
                description="When a deal moves stage in the pipeline."
                defaultChecked
              />
              <PreferenceRow
                title="Mentions"
                description="When a teammate @mentions you."
                defaultChecked
              />
              <PreferenceRow
                title="Weekly digest"
                description="A Monday summary of team performance."
              />
              <Separator />
              <div className="flex justify-end">
                <Button
                  onClick={() => toast.success("Notification settings saved")}
                >
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current plan</CardTitle>
              <CardDescription>You are on the {user?.plan} plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{user?.plan}</p>
                    <Badge variant="success" className="font-normal">
                      Active
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Unlimited prospects · 5 seats · CRM sync
                  </p>
                </div>
                <p className="text-xl font-semibold">
                  $99<span className="text-muted-foreground text-sm">/mo</span>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast.info("Manage billing")}
                >
                  Manage billing
                </Button>
                <Button onClick={() => toast.info("Upgrade flow")}>
                  Upgrade plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Team seats</CardTitle>
                <CardDescription>
                  {team.length} of {team.length} seats used
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Invite sent — coming soon")}
              >
                Invite member
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2"
                >
                  <Avatar className="size-8">
                    <AvatarFallback
                      style={{ backgroundColor: member.avatarColor, color: "white" }}
                      className="text-xs"
                    >
                      {initials(
                        member.name.split(" ")[0],
                        member.name.split(" ")[1]
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {member.email}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-normal">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Page>
  )
}

function Field({
  id,
  label,
  value,
  type,
}: {
  id: string
  label: string
  value?: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} defaultValue={value} />
    </div>
  )
}

function UspsCard() {
  const [usps, setUsps] = React.useState<string[]>([
    "3x faster pipeline generation",
    "30-point AI enrichment on every contact",
    "Two-way CRM sync with no manual entry",
  ])
  const idRef = React.useRef(0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company USPs</CardTitle>
        <CardDescription>
          Unique selling points Kai weaves into outreach.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {usps.map((usp, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={usp}
              onChange={(e) =>
                setUsps((prev) =>
                  prev.map((u, idx) => (idx === i ? e.target.value : u))
                )
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Remove USP"
              onClick={() => setUsps((prev) => prev.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              idRef.current += 1
              setUsps((prev) => [...prev, ""])
            }}
          >
            <Plus className="size-4" />
            Add USP
          </Button>
          <Button size="sm" onClick={() => toast.success("USPs saved")}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function BlacklistCard() {
  const [items, setItems] = React.useState<BlacklistedCompany[]>(seedBlacklist)
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const idRef = React.useRef(0)

  function add() {
    if (!name.trim() || !domain.trim()) return
    idRef.current += 1
    setItems((prev) => [
      ...prev,
      {
        id: `bl_new_${idRef.current}`,
        name: name.trim(),
        domain: domain.trim(),
        reason: "Manual",
      },
    ])
    setName("")
    setDomain("")
    toast.success("Company blacklisted")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Blacklisted companies</CardTitle>
        <CardDescription>
          Prospects from these companies are excluded from search and outreach.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-md px-2 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {c.domain}
                </p>
              </div>
              <Badge variant="secondary" className="font-normal">
                {c.reason}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label={`Remove ${c.name}`}
                onClick={() => {
                  setItems((prev) => prev.filter((x) => x.id !== c.id))
                  toast.info(`${c.name} removed`)
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="domain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Button onClick={add} disabled={!name.trim() || !domain.trim()}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PreferenceRow({
  title,
  description,
  defaultChecked,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
