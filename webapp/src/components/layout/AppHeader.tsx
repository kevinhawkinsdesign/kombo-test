import { useNavigate } from "react-router-dom"
import { Search, Moon, Sun, LogOut, User, CreditCard } from "lucide-react"

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
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth"
import { initials } from "@/lib/format"

export function AppHeader({ title }: { title?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 backdrop-blur md:px-6">
      {title && (
        <h1 className="text-base font-semibold md:text-lg">{title}</h1>
      )}

      <div className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search prospects, companies…"
          className="pl-9"
          onFocus={() => navigate("/search")}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="ml-auto md:ml-0"
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
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
