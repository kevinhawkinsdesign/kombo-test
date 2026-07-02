import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
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
  Search,
  LayoutGrid,
} from "lucide-react"

import { KomboLockup, KomboMark } from "@/components/KomboLogo"
import { ProspectSearchTrigger } from "@/components/layout/ProspectSearch"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { conversations } from "@/lib/mock-data"
import { copilotActions } from "@/lib/mock-copilot"
import { useLocale } from "@/lib/locale"
import { useSetup } from "@/lib/setup"
import { useReleaseMode, isV2OnlyPath } from "@/lib/release-mode"

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

// Always-visible top destinations. Home (the "Describe your ideal customer"
// hero) exists in both releases; the sales Dashboard is a separate v2 page.
const primary: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, isNew: true },
  {
    to: "/copilot",
    labelKey: "nav.copilot",
    icon: Sparkles,
    badge: String(copilotActions.length),
    isNew: true,
  },
  { to: "/workspaces", labelKey: "nav.workspaces", icon: LayoutGrid, isNew: true },
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
      { to: "/people", labelKey: "nav.people", icon: Users },
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
    { to: "/playbook", labelKey: "nav.playbook", icon: BookOpen },
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
            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
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
            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
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
            "text-sidebar-foreground/70 size-3.5 shrink-0 transition-transform",
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


// Collapsed rail: each accordion becomes a single group icon whose nested
// items open in a popover (instead of flattening every leaf icon).
function CollapsedGroupPopover({
  group,
  currentPath,
  onNavigate,
}: {
  group: NavGroup
  currentPath: string
  onNavigate?: () => void
}) {
  const { t } = useLocale()
  const Icon = group.icon
  const [open, setOpen] = React.useState(false)
  const label = t(group.labelKey)
  const hasActive = group.items.some((it) => isActivePath(currentPath, it.to))
  const hasNew = group.items.some((it) => it.isNew)
  const badgeTotal = group.items.reduce(
    (sum, it) => sum + (it.badge ? Number(it.badge) : 0),
    0
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
            hasActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60"
          )}
        >
          <Icon className="size-5 shrink-0" strokeWidth={2.25} />
          {(hasNew || badgeTotal > 0) && (
            <span
              className={cn(
                "ring-sidebar absolute -top-0.5 -right-1 size-1.5 rounded-full ring-2",
                hasNew ? "bg-volt" : "bg-primary"
              )}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="bg-sidebar text-sidebar-foreground border-sidebar-border w-56 p-1.5"
      >
        <p className="text-sidebar-foreground/60 px-2 py-1 text-[11px] font-medium tracking-wide uppercase">
          {label}
        </p>
        <div className="flex flex-col gap-0.5">
          {group.items.map((item) => (
            <NavRow
              key={item.to}
              item={item}
              onNavigate={() => {
                setOpen(false)
                onNavigate?.()
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const GROUP_KEY = "kombo-nav-group"

// Accordion: only one group is open at a time. Opening one closes the rest.
function useAccordionGroup(activeGroupKey: string | null) {
  const [openKey, setOpenKey] = React.useState<string | null>(() => {
    // Prefer the group containing the current page so it's visible on load.
    if (activeGroupKey) return activeGroupKey
    try {
      const stored = localStorage.getItem(GROUP_KEY)
      if (stored !== null) return stored === "" ? null : stored
    } catch {
      /* ignore */
    }
    // Default: outreach open so the New campaign CTA target is visible.
    return "outreach"
  })

  const setOpen = React.useCallback((key: string) => {
    setOpenKey((prev) => {
      const next = prev === key ? null : key
      try {
        localStorage.setItem(GROUP_KEY, next ?? "")
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { openKey, setOpen }
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
  const { isV1 } = useReleaseMode()

  // v1 only ships surfaces that exist in the Chrome extension. Gate by route
  // (V2_ONLY_PATHS), not the `isNew` badge — so a page can ship in v1 and still
  // be badged "New" (e.g. Analytics).
  const inV1 = (to: string) => !isV2OnlyPath(to)
  const visiblePrimary = isV1 ? primary.filter((it) => inV1(it.to)) : primary
  const visibleGroups = isV1
    ? groups
        .map((g) => ({ ...g, items: g.items.filter((it) => inV1(it.to)) }))
        .filter((g) => g.items.length > 0)
    : groups
  const visibleManage = isV1
    ? { ...manageGroup, items: manageGroup.items.filter((it) => inV1(it.to)) }
    : manageGroup

  const activeGroupKey =
    [...visibleGroups, visibleManage].find((g) =>
      g.items.some((it) => isActivePath(pathname, it.to))
    )?.key ?? null
  const { openKey, setOpen } = useAccordionGroup(activeGroupKey)

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

        <div className={cn("pb-2", collapsed ? "px-2" : "px-3")}>
          <ProspectSearchTrigger collapsed={collapsed} onNavigate={onNavigate} />
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
            // Icon rail: primary destinations as icons, then one icon per
            // accordion group whose nested items open in a popover.
            <>
              {visiblePrimary.map((item) => (
                <NavRow
                  key={item.to}
                  item={item}
                  onNavigate={onNavigate}
                  collapsed
                />
              ))}
              <div className="bg-sidebar-border my-1 h-px w-6" />
              {visibleGroups.map((group) => (
                <CollapsedGroupPopover
                  key={group.key}
                  group={group}
                  currentPath={pathname}
                  onNavigate={onNavigate}
                />
              ))}
              <div className="mt-auto flex flex-col items-center gap-0.5">
                <div className="bg-sidebar-border my-1 h-px w-6" />
                <CollapsedGroupPopover
                  group={visibleManage}
                  currentPath={pathname}
                  onNavigate={onNavigate}
                />
              </div>
            </>
          ) : (
            <>
              {visiblePrimary.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={onNavigate} />
              ))}

              <div className="my-1" />

              {visibleGroups.map((group) => (
                <NavGroupSection
                  key={group.key}
                  group={group}
                  open={openKey === group.key}
                  onToggle={() => setOpen(group.key)}
                  onNavigate={onNavigate}
                  currentPath={pathname}
                />
              ))}

              <div className="mt-auto pt-2">
                <NavGroupSection
                  group={visibleManage}
                  open={openKey === visibleManage.key}
                  onToggle={() => setOpen(visibleManage.key)}
                  onNavigate={onNavigate}
                  currentPath={pathname}
                />
              </div>
            </>
          )}

        </nav>

        {/* Pinned footer — always visible; the nav above scrolls behind it. */}
        {onToggleCollapse && (
          <div
            className={cn(
              "bg-sidebar border-sidebar-border shrink-0 border-t",
              collapsed ? "flex justify-center p-2" : "p-3"
            )}
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "text-sidebar-foreground hover:bg-sidebar-accent/60 flex items-center rounded-md text-sm font-medium transition-colors",
                collapsed ? "size-9 justify-center" : "w-full gap-3 px-3 py-2"
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
          </div>
        )}
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
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/copilot", labelKey: "nav.copilot", icon: Sparkles },
  { to: "/lists", labelKey: "nav.lists", icon: FolderKanban },
  {
    to: "/inbox",
    labelKey: "nav.inbox",
    icon: Inbox,
    badge: unread ? String(unread) : undefined,
  },
]

// v1 has no dashboard/signals — Home (the search hero), then prospecting.
const bottomBarItemsV1: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/search", labelKey: "nav.search", icon: Search },
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
  const { isV1 } = useReleaseMode()
  const [open, setOpen] = React.useState(false)
  const items = isV1 ? bottomBarItemsV1 : bottomBarItems

  return (
    <nav
      aria-label="Primary"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {items.map((item) => {
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
