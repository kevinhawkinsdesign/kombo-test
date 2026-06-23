import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
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
  ChevronDown,
  Telescope,
  Megaphone,
  TrendingUp,
  Settings2,
  Puzzle,
  Workflow,
  LibraryBig,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { useNewCampaign } from "@/components/campaign/NewCampaignWizard"

interface NavItem {
  to: string
  labelKey: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  badge?: string
  // Marks a surface that doesn't exist in the Chrome extension yet.
  isNew?: boolean
}

interface NavGroup {
  key: string
  labelKey: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  items: NavItem[]
}

const unread = conversations.reduce((sum, c) => sum + c.unread, 0)

// Always-visible top destinations.
const primary: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, isNew: true },
  {
    to: "/copilot",
    labelKey: "nav.copilot",
    icon: Sparkles,
    badge: String(copilotActions.length),
    isNew: true,
  },
  {
    to: "/inbox",
    labelKey: "nav.inbox",
    icon: Inbox,
    badge: unread ? String(unread) : undefined,
  },
]

// Collapsible groups keep the rail short — most pages live one click away.
const groups: NavGroup[] = [
  {
    key: "prospecting",
    labelKey: "nav.prospecting",
    icon: Telescope,
    items: [
      { to: "/companies", labelKey: "nav.companies", icon: Building2 },
      { to: "/discover", labelKey: "nav.discover", icon: Telescope, isNew: true },
      { to: "/lists", labelKey: "nav.lists", icon: FolderKanban },
      { to: "/intros", labelKey: "nav.intros", icon: Waypoints, isNew: true },
      { to: "/extension", labelKey: "nav.extension", icon: Puzzle, isNew: true },
    ],
  },
  {
    key: "outreach",
    labelKey: "nav.outreach",
    icon: Megaphone,
    items: [
      { to: "/campaigns", labelKey: "nav.campaigns", icon: Send },
      { to: "/sequences", labelKey: "nav.sequences", icon: Workflow, isNew: true },
      { to: "/templates", labelKey: "nav.templates", icon: Mail },
      { to: "/library", labelKey: "nav.library", icon: LibraryBig, isNew: true },
      { to: "/playbook", labelKey: "nav.playbook", icon: BookOpen, isNew: true },
      { to: "/channels", labelKey: "nav.channels", icon: Radio, isNew: true },
      { to: "/tasks", labelKey: "nav.tasks", icon: CheckSquare, isNew: true },
    ],
  },
  {
    key: "revenue",
    labelKey: "nav.revenue",
    icon: TrendingUp,
    items: [
      { to: "/deals", labelKey: "nav.deals", icon: Briefcase, isNew: true },
      { to: "/analytics", labelKey: "nav.analytics", icon: BarChart3, isNew: true },
      { to: "/coach", labelKey: "nav.coach", icon: GraduationCap },
    ],
  },
]

const manageGroup: NavGroup = {
  key: "manage",
  labelKey: "nav.manage",
  icon: Settings2,
  items: [
    { to: "/team", labelKey: "nav.team", icon: Users },
    { to: "/usage", labelKey: "nav.usage", icon: Zap },
    { to: "/referrals", labelKey: "nav.referrals", icon: Gift },
    { to: "/integrations", labelKey: "nav.integrations", icon: Plug },
    { to: "/settings", labelKey: "nav.settings", icon: Settings },
  ],
}

function isActivePath(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(`${to}/`)
}

function NavRow({
  item,
  onNavigate,
  collapsed,
  inset,
}: {
  item: NavItem
  onNavigate?: () => void
  collapsed?: boolean
  inset?: boolean
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
          inset && !collapsed && "py-1.5",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : collapsed
              ? "text-sidebar-foreground hover:bg-sidebar-accent/60"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )
      }
    >
      <span className="relative">
        <Icon
          className={cn("shrink-0", collapsed ? "size-5" : "size-4")}
          strokeWidth={collapsed ? 2.25 : 2}
        />
        {collapsed && (item.isNew || item.badge) && (
          <span
            className={cn(
              "ring-sidebar absolute -top-0.5 -right-1 size-1.5 rounded-full ring-2",
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

function NavGroupSection({
  group,
  open,
  onToggle,
  onNavigate,
  currentPath,
}: {
  group: NavGroup
  open: boolean
  onToggle: () => void
  onNavigate?: () => void
  currentPath: string
}) {
  const { t } = useLocale()
  const Icon = group.icon
  const hasActive = group.items.some((it) => isActivePath(currentPath, it.to))
  const hasNew = group.items.some((it) => it.isNew)
  const badgeTotal = group.items.reduce(
    (sum, it) => sum + (it.badge ? Number(it.badge) : 0),
    0
  )

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          hasActive && !open
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )}
      >
        <span className="relative">
          <Icon className="size-5 shrink-0" strokeWidth={2.25} />
          {!open && hasNew && (
            <span className="bg-volt ring-sidebar absolute -top-0.5 -right-1 size-1.5 rounded-full ring-2" />
          )}
        </span>
        <span className="flex-1 text-left">{t(group.labelKey)}</span>
        {!open && badgeTotal > 0 && (
          <Badge className="h-5 min-w-5 justify-center px-1.5">
            {badgeTotal}
          </Badge>
        )}
        <ChevronDown
          className={cn(
            "text-sidebar-foreground/60 size-3.5 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="border-sidebar-border/70 mt-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2">
          {group.items.map((item) => (
            <NavRow
              key={item.to}
              item={item}
              onNavigate={onNavigate}
              inset
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Collapsed rail: a single group icon that opens a flyout of its pages, so the
// rail stays short and crisp while every page is still one click away.
function CollapsedGroupIcon({
  group,
  currentPath,
  onNavigate,
}: {
  group: NavGroup
  currentPath: string
  onNavigate?: () => void
}) {
  const { t } = useLocale()
  const [open, setOpen] = React.useState(false)
  const Icon = group.icon
  const hasActive = group.items.some((it) => isActivePath(currentPath, it.to))
  const hasNew = group.items.some((it) => it.isNew)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t(group.labelKey)}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-md transition-colors",
            hasActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60"
          )}
        >
          <Icon className="size-5 shrink-0" strokeWidth={2.25} />
          {hasNew && (
            <span className="bg-volt ring-sidebar absolute top-1 right-1 size-2 rounded-full ring-2" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-56 p-1.5">
        <p className="text-muted-foreground px-2 py-1 text-xs font-medium tracking-wide uppercase">
          {t(group.labelKey)}
        </p>
        {group.items.map((item) => {
          const Leaf = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/60"
                )
              }
            >
              <Leaf className="size-4 shrink-0" />
              <span className="flex-1">{t(item.labelKey)}</span>
              {item.isNew && (
                <span className="bg-volt/15 text-volt rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase">
                  {t("common.new")}
                </span>
              )}
              {item.badge && (
                <Badge className="h-5 min-w-5 justify-center px-1.5">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

const GROUPS_KEY = "kombo-nav-groups"

function useExpandedGroups() {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(GROUPS_KEY)
      if (raw) return new Set(JSON.parse(raw) as string[])
    } catch {
      /* ignore */
    }
    // Default: outreach open so the New campaign CTA target is visible.
    return new Set(["outreach"])
  })

  const toggle = React.useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      try {
        localStorage.setItem(GROUPS_KEY, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { expanded, toggle }
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
  const { pathname } = useLocation()
  const { expanded, toggle } = useExpandedGroups()
  const newCampaign = useNewCampaign()

  function startNewCampaign() {
    onNavigate?.()
    newCampaign.open()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-16 items-center",
            collapsed ? "justify-center px-2" : "px-5"
          )}
        >
          <NavLink
            to="/"
            onClick={onNavigate}
            aria-label="Kombo home"
            className="rounded-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
          >
            {collapsed ? <KomboMark /> : <KomboLockup className="h-7" />}
          </NavLink>
        </div>

        <div className={cn(collapsed ? "px-2" : "px-3")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="volt"
                  size="icon"
                  className="mx-auto flex"
                  aria-label={t("nav.newCampaign")}
                  onClick={startNewCampaign}
                >
                  <Send className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("nav.newCampaign")}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="volt"
              className="w-full justify-start gap-2"
              size="sm"
              onClick={startNewCampaign}
            >
              <Send className="size-4" />
              {t("nav.newCampaign")}
            </Button>
          )}
        </div>

        {progress < 100 &&
          (collapsed ? (
            <div className="px-2 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-volt/40 bg-volt/10 hover:bg-volt/15 relative mx-auto flex border-dashed"
                    asChild
                  >
                    <NavLink
                      to="/get-started"
                      onClick={onNavigate}
                      aria-label={`${t("nav.getStarted")} · ${progress}%`}
                    >
                      <Rocket className="text-volt size-5" strokeWidth={2.25} />
                      <span className="bg-volt ring-sidebar absolute -top-0.5 -right-1 size-1.5 rounded-full ring-2" />
                    </NavLink>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t("nav.getStarted")} · {progress}%
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
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
          ))}

        <nav
          className={cn(
            "flex flex-1 flex-col gap-0.5 overflow-y-auto",
            collapsed ? "items-center p-2" : "p-3"
          )}
        >
          {collapsed ? (
            // Short icon rail: primary pages as icons, groups as flyouts so
            // every page stays one click away without crowding the rail.
            <>
              {primary.map((item) => (
                <NavRow
                  key={item.to}
                  item={item}
                  onNavigate={onNavigate}
                  collapsed
                />
              ))}
              <div className="bg-sidebar-border my-1 h-px w-6" />
              {groups.map((group) => (
                <CollapsedGroupIcon
                  key={group.key}
                  group={group}
                  currentPath={pathname}
                  onNavigate={onNavigate}
                />
              ))}
              <div className="mt-auto" />
              <CollapsedGroupIcon
                group={manageGroup}
                currentPath={pathname}
                onNavigate={onNavigate}
              />
            </>
          ) : (
            <>
              {primary.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={onNavigate} />
              ))}

              <div className="my-1" />

              {groups.map((group) => (
                <NavGroupSection
                  key={group.key}
                  group={group}
                  open={expanded.has(group.key) || group.items.some((it) => isActivePath(pathname, it.to))}
                  onToggle={() => toggle(group.key)}
                  onNavigate={onNavigate}
                  currentPath={pathname}
                />
              ))}

              <div className="mt-auto pt-2">
                <NavGroupSection
                  group={manageGroup}
                  open={
                    expanded.has(manageGroup.key) ||
                    manageGroup.items.some((it) => isActivePath(pathname, it.to))
                  }
                  onToggle={() => toggle(manageGroup.key)}
                  onNavigate={onNavigate}
                  currentPath={pathname}
                />
              </div>
            </>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground mt-1 flex items-center rounded-md text-sm font-medium transition-colors",
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
