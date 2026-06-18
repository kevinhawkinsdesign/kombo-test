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
  HelpCircle,
  ChevronDown,
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
import { useLocale, type Locale } from "@/lib/locale"
import { initials } from "@/lib/format"

const LOCALE_FLAG: Record<Locale, string> = { en: "🇬🇧", es: "🇪🇸" }
const LOCALE_LABEL: Record<Locale, string> = { en: "English", es: "Español" }

const HELP_CENTER_URL = "https://info.getkombo.ai/en/"

// One-click support: open the Intercom Messenger if it's loaded, otherwise the
// help center.
function openSupport() {
  const w = window as unknown as { Intercom?: (command: string) => void }
  if (typeof w.Intercom === "function") {
    w.Intercom("show")
    return
  }
  window.open(HELP_CENTER_URL, "_blank", "noreferrer")
}

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { balance } = useCredits()
  const { locale, setLocale } = useLocale()
  const navigate = useNavigate()

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-2 border-b px-4 backdrop-blur md:gap-3 md:px-6">
      <MobileNav />

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

        {/* Permanent one-click support */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openSupport}
          aria-label="Help & support"
          title="Help & support"
          className="text-primary hover:text-primary"
        >
          <HelpCircle className="size-5" />
        </Button>

        {/* Language picker with flags */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 px-1.5"
              aria-label={`Language: ${LOCALE_LABEL[locale]}`}
            >
              <span className="text-base leading-none">
                {LOCALE_FLAG[locale]}
              </span>
              <ChevronDown className="text-muted-foreground size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(LOCALE_FLAG) as Locale[]).map((code) => (
              <DropdownMenuItem key={code} onClick={() => setLocale(code)}>
                <span className="text-base leading-none">
                  {LOCALE_FLAG[code]}
                </span>
                <span className="flex-1">{LOCALE_LABEL[code]}</span>
                {locale === code && <Check className="size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationsBell />

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
            <button className="focus-visible:ring-ring ml-0.5 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2">
              <Avatar>
                <AvatarFallback
                  style={{ backgroundColor: user?.avatarColor, color: "white" }}
                >
                  {initials(
                    user?.name.split(" ")[0] ?? "K",
                    user?.name.split(" ")[1]
                  )}
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
            <DropdownMenuItem onClick={openSupport}>
              <HelpCircle className="size-4" />
              Help &amp; support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
