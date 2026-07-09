import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LogOut,
  User,
  CreditCard,
  Zap,
  Check,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  BookOpen,
  Keyboard,
  Rocket,
} from "lucide-react"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AppSearch } from "@/components/layout/AppSearch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReleaseToggle } from "@/components/layout/ReleaseToggle"
import { NotificationsBell } from "@/components/notifications/NotificationsBell"
import { useAuth } from "@/lib/auth"
import { useCredits } from "@/lib/credits"
import { useLocale, type Locale } from "@/lib/locale"
import { portraitFor } from "@/lib/avatars"
import { initials } from "@/lib/format"

const LOCALE_FLAG: Record<Locale, string> = { en: "🇬🇧", es: "🇪🇸" }
const LOCALE_LABEL: Record<Locale, string> = { en: "English", es: "Español" }

const HELP_CENTER_URL = "https://info.getkombo.ai/en/"

// Open the Intercom Messenger to start a new conversation if it's loaded,
// otherwise fall back to the help center.
function sendSupportMessage() {
  const w = window as unknown as { Intercom?: (command: string) => void }
  if (typeof w.Intercom === "function") {
    w.Intercom("showNewMessage")
    return
  }
  window.open(HELP_CENTER_URL, "_blank", "noreferrer")
}

function openHelpCenter() {
  window.open(HELP_CENTER_URL, "_blank", "noreferrer")
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const { balance } = useCredits()
  const { locale, setLocale, t } = useLocale()
  const navigate = useNavigate()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-2 border-b px-4 backdrop-blur md:gap-3 md:px-6">
      <ReleaseToggle />

      <AppSearch />

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <button
          onClick={() => navigate("/usage")}
          className="hover:bg-muted text-foreground hidden h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:flex"
          title={t("header.credits")}
        >
          <Zap className="text-chart-4 size-3.5" />
          <span className="tabular-nums">{balance.toLocaleString()}</span>
        </button>

        {/* Help & support menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("header.help")}
              title={t("header.help")}
              className="text-primary hover:text-primary"
            >
              <HelpCircle className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="space-y-0.5">
              <p className="font-semibold">{t("help.title")}</p>
              <p className="text-muted-foreground text-xs font-normal">
                {t("help.subtitle")}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 py-2" onClick={sendSupportMessage}>
              <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
                <MessageCircle className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{t("help.message")}</span>
                <span className="text-muted-foreground text-xs">{t("help.messageSub")}</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2" onClick={openHelpCenter}>
              <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
                <BookOpen className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{t("help.center")}</span>
                <span className="text-muted-foreground text-xs">{t("help.centerSub")}</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2" onClick={() => setShortcutsOpen(true)}>
              <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
                <Keyboard className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{t("help.shortcuts")}</span>
                <span className="text-muted-foreground text-xs">{t("help.shortcutsSub")}</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2" onClick={() => navigate("/get-started")}>
              <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
                <Rocket className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{t("nav.getStarted")}</span>
                <span className="text-muted-foreground text-xs">{t("help.getStartedSub")}</span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus-visible:ring-ring ml-0.5 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2">
              <Avatar className="size-9">
                {user && <AvatarImage src={user.avatarUrl ?? portraitFor(user.name)} alt="" />}
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
            <DropdownMenuItem onClick={() => navigate("/settings?tab=billing")}>
              <CreditCard className="size-4" />
              {t("menu.billing")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={sendSupportMessage}>
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

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("help.shortcutsTitle")}</DialogTitle>
            <DialogDescription>{t("help.shortcutsSub")}</DialogDescription>
          </DialogHeader>
          <div className="divide-border divide-y">
            {[
              { label: t("shortcut.search"), keys: ["⌘", "K"] },
              { label: t("shortcut.close"), keys: ["Esc"] },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2.5">
                <span className="text-sm">{s.label}</span>
                <span className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="bg-muted text-muted-foreground inline-flex h-6 min-w-6 items-center justify-center rounded border px-1.5 text-xs font-medium"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
