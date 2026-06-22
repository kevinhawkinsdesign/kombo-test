import * as React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Inbox,
  Send,
  Mail,
  CheckSquare,
  Briefcase,
  BarChart3,
  GraduationCap,
  Users,
  Plug,
  Settings,
  Sparkles,
  Gift,
  Zap,
  Menu,
  Waypoints,
  Radio,
  Rocket,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { KomboLockup, KomboMark } from "@/components/KomboLogo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { conversations } from "@/lib/mock-data"
import { copilotActions } from "@/lib/mock-copilot"
import { useLocale } from "@/lib/locale"
import { useSetup } from "@/lib/setup"

interface NavItem {
  to: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  // Marks a surface that doesn't exist in the Chrome extension yet.
  isNew?: boolean
}

interface NavSection {
  labelKey: string
  items: NavItem[]
}

const unread = conversations.reduce((sum, c) => sum + c.unread, 0)

const sections: NavSection[] = [
  {
    labelKey: "nav.workspace",
    items: [
      { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, isNew: true },
      {
        to: "/copilot",
        labelKey: "nav.copilot",
        icon: Sparkles,
        badge: String(copilotActions.length),
        isNew: true,
      },
      { to: "/companies", labelKey: "nav.companies", icon: Building2 },
      { to: "/intros", labelKey: "nav.intros", icon: Waypoints, isNew: true },
      { to: "/lists", labelKey: "nav.lists", icon: FolderKanban },
    ],
  },
  {
    labelKey: "nav.engage",
    items: [
      {
        to: "/inbox",
        labelKey: "nav.inbox",
        icon: Inbox,
        badge: unread ? String(unread) : undefined,
      },
      { to: "/campaigns", labelKey: "nav.campaigns", icon: Send },
      { to: "/templates", labelKey: "nav.templates", icon: Mail },
      { to: "/playbook", labelKey: "nav.playbook", icon: BookOpen, isNew: true },
      { to: "/channels", labelKey: "nav.channels", icon: Radio, isNew: true },
      { to: "/tasks", labelKey: "nav.tasks", icon: CheckSquare, isNew: true },
    ],
  },
  {
    labelKey: "nav.revenue",
    items: [
      { to: "/deals", labelKey: "nav.deals", icon: Briefcase, isNew: true },
      {
        to: "/analytics",
        labelKey: "nav.analytics",
        icon: BarChart3,
        isNew: true,
      },
      { to: "/coach", labelKey: "nav.coach", icon: GraduationCap },
    ],
  },
  {
    labelKey: "nav.manage",
    items: [
      { to: "/team", labelKey: "nav.team", icon: Users },
      { to: "/usage", labelKey: "nav.usage", icon: Zap },
      { to: "/referrals", labelKey: "nav.referrals", icon: Gift },
    ],
  },
]

const bottomNav: NavItem[] = [
  { to: "/integrations", labelKey: "nav.integrations", icon: Plug },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
]

function NavRow({
  item,
  onNavigate,
  collapsed,
}: {
  item: NavItem
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const { t } = useLocale()
  const Icon = item.icon
  const label = t(item.labelKey)

  const link = (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "group flex items-center rounded-md text-sm font-medium transition-colors",
          collapsed ? "size-9 justify-center" : "gap-3 px-3 py-2",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )
      }
    >
      <span className="relative">
        <Icon className="size-4 shrink-0" />
        {collapsed && (item.isNew || item.badge) && (
          <span
            className={cn(
              "ring-sidebar absolute -top-1 -right-1 size-2 rounded-full ring-2",
              item.isNew ? "bg-volt" : "bg-primary"
            )}
          />
        )}
      </span>
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && item.isNew && (
        <span className="bg-volt/15 text-volt rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase">
          {t("common.new")}
        </span>
      )}
      {!collapsed && item.badge && (
        <Badge className="h-5 min-w-5 justify-center px-1.5">
          {item.badge}
        </Badge>
      )}
    </NavLink>
  )

  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {item.isNew ? ` · ${t("common.new")}` : ""}
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const { t } = useLocale()
  const { progress } = useSetup()

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-16 items-center",
            collapsed ? "justify-center px-2" : "px-5"
          )}
        >
          {collapsed ? <KomboMark /> : <KomboLockup className="h-7" />}
        </div>

        <div className={cn(collapsed ? "px-2" : "px-3")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="volt" size="icon" className="mx-auto flex" asChild>
                  <NavLink to="/campaigns" onClick={onNavigate} aria-label={t("nav.newCampaign")}>
                    <Send className="size-4" />
                  </NavLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("nav.newCampaign")}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="volt"
              className="w-full justify-start gap-2"
              size="sm"
              asChild
            >
              <NavLink to="/campaigns" onClick={onNavigate}>
                <Send className="size-4" />
                {t("nav.newCampaign")}
              </NavLink>
            </Button>
          )}
        </div>

        {progress < 100 && !collapsed && (
          <div className="px-3 pt-2">
            <NavLink
              to="/get-started"
              onClick={onNavigate}
              className="border-volt/40 bg-volt/10 hover:bg-volt/15 text-sidebar-foreground flex items-center gap-3 rounded-md border border-dashed px-3 py-2 text-sm font-medium transition-colors"
            >
              <Rocket className="text-volt size-4 shrink-0" />
              <span className="flex-1">{t("nav.getStarted")}</span>
              <Badge className="bg-sidebar-foreground/15 text-sidebar-foreground border-transparent tabular-nums">
                {progress}%
              </Badge>
            </NavLink>
          </div>
        )}

        <nav
          className={cn(
            "flex flex-1 flex-col gap-1 overflow-y-auto",
            collapsed ? "items-center p-2" : "p-3"
          )}
        >
          {sections.map((section) => (
            <div key={section.labelKey} className="mb-1 w-full">
              {collapsed ? (
                <div className="bg-sidebar-border mx-auto my-1 h-px w-6" />
              ) : (
                <p className="text-sidebar-foreground/70 px-3 pt-2 pb-1 text-xs font-medium tracking-wide uppercase">
                  {t(section.labelKey)}
                </p>
              )}
              {section.items.map((item) => (
                <NavRow
                  key={item.to}
                  item={item}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ))}

          <div className="mt-auto flex w-full flex-col gap-1 pt-2">
            {bottomNav.map((item) => (
              <NavRow
                key={item.to}
                item={item}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />
            ))}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground flex items-center rounded-md text-sm font-medium transition-colors",
                  collapsed ? "size-9 justify-center" : "gap-3 px-3 py-2"
                )}
              >
                {collapsed ? (
                  <ChevronsRight className="size-4 shrink-0" />
                ) : (
                  <>
                    <ChevronsLeft className="size-4 shrink-0" />
                    <span className="flex-1 text-left">Collapse</span>
                  </>
                )}
              </button>
            )}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  )
}

const COLLAPSE_KEY = "kombo-sidebar-collapsed"

export function AppSidebar() {
  const [collapsed, setCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1"
    } catch {
      return false
    }
  })

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return (
    <aside
      className={cn(
        "bg-sidebar border-sidebar-border sticky top-0 hidden h-svh shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggleCollapse={toggle} />
    </aside>
  )
}

// Primary destinations shown in the native-style bottom bar on mobile.
const bottomBarItems: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/copilot", labelKey: "nav.copilot", icon: Sparkles },
  { to: "/lists", labelKey: "nav.lists", icon: FolderKanban },
  {
    to: "/inbox",
    labelKey: "nav.inbox",
    icon: Inbox,
    badge: unread ? String(unread) : undefined,
  },
]

/**
 * Fixed bottom navigation for mobile — like a native app. Shows the top
 * destinations plus a "More" button that opens the full nav in a sheet.
 */
export function MobileBottomNav() {
  const { t } = useLocale()
  const [open, setOpen] = React.useState(false)

  return (
    <nav
      aria-label="Primary"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {bottomBarItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <span className="relative">
              <Icon className="size-5" />
              {item.badge && (
                <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold">
                  {item.badge}
                </span>
              )}
            </span>
            {t(item.labelKey)}
          </NavLink>
        )
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium"
            aria-label="More navigation"
          >
            <Menu className="size-5" />
            More
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </nav>
  )
}
