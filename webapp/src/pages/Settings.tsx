import { toast } from "sonner"
import { Check, Monitor, Moon, Sun } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth"
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
        description="Manage your account, preferences, and plan."
      />

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="ai">AI &amp; data</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Plan &amp; billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={user?.role} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue={user?.company} />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Profile saved")}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                title="Email notifications"
                description="Get notified when a prospect replies."
                defaultChecked
              />
              <PreferenceRow
                title="Daily digest"
                description="A summary of pipeline activity each morning."
                defaultChecked
              />
              <PreferenceRow
                title="AI suggestions"
                description="Surface recommended prospects and next steps."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ideal customer profile</CardTitle>
              <CardDescription>
                Kombo uses this to score and recommend prospects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="icp-industry">Target industry</Label>
                  <Input id="icp-industry" defaultValue="B2B SaaS" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icp-size">Company size</Label>
                  <Input id="icp-size" defaultValue="50–1000 employees" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="icp-titles">Target titles</Label>
                  <Input
                    id="icp-titles"
                    defaultValue="VP Sales, CRO, Head of RevOps"
                  />
                </div>
              </div>
              <Separator />
              <PreferenceRow
                title="Auto-enrich new prospects"
                description="Enrich the moment a prospect is added to a list."
                defaultChecked
              />
              <PreferenceRow
                title="Two-way CRM sync"
                description="Keep prospect and activity data in sync with your CRM."
                defaultChecked
              />
              <PreferenceRow
                title="AI email drafting"
                description="Let Kai draft first-touch emails using your templates."
                defaultChecked
              />
              <div className="space-y-2">
                <Label htmlFor="kai-persona">Kai writing tone</Label>
                <Input id="kai-persona" defaultValue="Concise, consultative" />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("AI settings saved")}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>
                Choose what you get notified about.
              </CardDescription>
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

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current plan</CardTitle>
              <CardDescription>
                You are on the {user?.plan} plan.
              </CardDescription>
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
        </TabsContent>
      </Tabs>
    </Page>
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
