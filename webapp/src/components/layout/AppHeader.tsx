import { useNavigate } from "react-router-dom"
import {
  Search,
  Moon,
  Sun,
  LogOut,
  User,
  CreditCard,
  Zap,
  Check,
  LifeBuoy,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewSwitcher } from "@/components/layout/ViewSwitcher"
import { MobileNav } from "@/components/layout/AppSidebar"
import { KaiAssistant } from "@/components/kai/KaiAssistant"
import { NotificationsBell } from "@/components/notifications/NotificationsBell"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth"
import { useCredits } from "@/lib/credits"
import { useLocale } from "@/lib/locale"
import { initials } from "@/lib/format"

export function AppHeader({ title }: { title?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { balance } = useCredits()
  const { locale, setLocale } = useLocale()
  const navigate = useNavigate()

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-2 border-b px-4 backdrop-blur md:gap-4 md:px-6">
      <MobileNav />
      {title && (
        <h1 className="hidden text-base font-semibold lg:block">{title}</h1>
      )}

      <ViewSwitcher />

      <div className="relative ml-auto hidden w-full max-w-xs md:block">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search prospects, companies…"
          aria-label="Search prospects and companies"
          className="pl-9"
          onFocus={() => navigate("/search")}
        />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <button
          onClick={() => navigate("/usage")}
          className="hover:bg-muted text-foreground hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:flex"
          title="Credits remaining"
        >
          <Zap className="text-chart-4 size-3.5" />
          <span className="tabular-nums">{balance.toLocaleString()}</span>
        </button>
        <KaiAssistant />
        <NotificationsBell />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus-visible:ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2">
            <Avatar>
              <AvatarFallback
                style={{ backgroundColor: user?.avatarColor, color: "white" }}
              >
                {initials(user?.name.split(" ")[0] ?? "K", user?.name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-muted-foreground text-xs">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <CreditCard className="size-4" />
            Plan &amp; billing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
            Language
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setLocale("en")}>
            <span className="flex-1">English</span>
            {locale === "en" && <Check className="size-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocale("es")}>
            <span className="flex-1">Español</span>
            {locale === "es" && <Check className="size-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="https://info.getkombo.ai/en/"
              target="_blank"
              rel="noreferrer"
            >
              <LifeBuoy className="size-4" />
              Help center
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
