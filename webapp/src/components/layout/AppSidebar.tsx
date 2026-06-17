import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Search,
  FolderKanban,
  Inbox,
  Send,
  GraduationCap,
  Plug,
  Settings,
  Sparkles,
} from "lucide-react"

import { KomboLogo } from "@/components/KomboLogo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { conversations } from "@/lib/mock-data"

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const unread = conversations.reduce((sum, c) => sum + c.unread, 0)

const mainNav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/search", label: "Prospect Search", icon: Search },
  { to: "/lists", label: "Lists", icon: FolderKanban },
  {
    to: "/inbox",
    label: "Inbox",
    icon: Inbox,
    badge: unread ? String(unread) : undefined,
  },
  { to: "/campaigns", label: "Campaigns", icon: Send },
  { to: "/coach", label: "Coach", icon: GraduationCap },
]

const bottomNav: NavItem[] = [
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
]

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
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
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge className="h-5 min-w-5 justify-center px-1.5">
          {item.badge}
        </Badge>
      )}
    </NavLink>
  )
}

export function AppSidebar() {
  return (
    <aside className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="flex h-16 items-center px-5">
        <KomboLogo />
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2" size="sm">
          <Sparkles className="size-4" />
          New prospect search
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sidebar-foreground/50 px-3 pt-2 pb-1 text-xs font-medium tracking-wide uppercase">
          Workspace
        </p>
        {mainNav.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}

        <div className="mt-auto flex flex-col gap-1">
          {bottomNav.map((item) => (
            <NavRow key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </aside>
  )
}
