import * as React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Search,
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
} from "lucide-react"

import { KomboLogo } from "@/components/KomboLogo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { conversations } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale"

interface NavItem {
  to: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
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
      { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { to: "/search", labelKey: "nav.search", icon: Search },
      { to: "/companies", labelKey: "nav.companies", icon: Building2 },
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
      { to: "/tasks", labelKey: "nav.tasks", icon: CheckSquare },
    ],
  },
  {
    labelKey: "nav.revenue",
    items: [
      { to: "/deals", labelKey: "nav.deals", icon: Briefcase },
      { to: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
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
}: {
  item: NavItem
  onNavigate?: () => void
}) {
  const { t } = useLocale()
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{t(item.labelKey)}</span>
      {item.badge && (
        <Badge className="h-5 min-w-5 justify-center px-1.5">
          {item.badge}
        </Badge>
      )}
    </NavLink>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLocale()
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <KomboLogo />
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2" size="sm" asChild>
          <NavLink to="/search" onClick={onNavigate}>
            <Sparkles className="size-4" />
            {t("nav.newSearch")}
          </NavLink>
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.labelKey} className="mb-1">
            <p className="text-sidebar-foreground/50 px-3 pt-2 pb-1 text-xs font-medium tracking-wide uppercase">
              {t(section.labelKey)}
            </p>
            {section.items.map((item) => (
              <NavRow key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-1 pt-2">
          {bottomNav.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>
    </div>
  )
}

export function AppSidebar() {
  return (
    <aside className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 flex-col border-r md:flex">
      <SidebarContent />
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar w-72 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
