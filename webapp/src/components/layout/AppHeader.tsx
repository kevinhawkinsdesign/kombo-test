import { useState, type FormEvent } from "react"
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

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
import { NotificationsBell } from "@/components/notifications/NotificationsBell"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth"
import { useCredits } from "@/lib/credits"
import { useLocale, type Locale } from "@/lib/locale"
import { portraitFor } from "@/lib/avatars"
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
  const { locale, setLocale, t } = useLocale()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState("")

  // Don't jump to the search page on focus — let the user submit their prompt
  // first, then hand it to the unified Kai search surface.
  function submitSearch(e: FormEvent) {
    e.preventDefault()
    const q = searchValue.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
    setSearchValue("")
  }

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-2 border-b px-4 backdrop-blur md:gap-3 md:px-6">
      <ViewSwitcher />

      <form
        role="search"
        onSubmit={submitSearch}
        className="relative ml-auto hidden w-full max-w-xs md:block"
      >
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t("header.searchPlaceholder")}
          aria-label={t("header.searchPlaceholder")}
          className="pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <button
          onClick={() => navigate("/usage")}
          className="hover:bg-muted text-foreground hidden h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:flex"
          title={t("header.credits")}
        >
          <Zap className="text-chart-4 size-3.5" />
          <span className="tabular-nums">{balance.toLocaleString()}</span>
        </button>

        {/* Permanent one-click support */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openSupport}
          aria-label={t("header.help")}
          title={t("header.help")}
          className="text-primary hover:text-primary"
        >
          <HelpCircle className="size-5" />
        </Button>

        {/* Language picker with flags */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="gap-1 px-2"
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
              <Avatar className="size-9">
                {user && <AvatarImage src={portraitFor(user.name)} alt="" />}
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
              {t("menu.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <CreditCard className="size-4" />
              {t("menu.billing")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openSupport}>
              <HelpCircle className="size-4" />
              {t("header.help")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="size-4" />
              {t("menu.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
