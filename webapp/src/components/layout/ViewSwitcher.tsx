import { Users, Check, ChevronsUpDown, Eye, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useView } from "@/lib/view-context"
import { team, teams } from "@/lib/team"
import { portraitFor } from "@/lib/avatars"
import { useLocale } from "@/lib/locale"
import { initials } from "@/lib/format"

export function ViewSwitcher() {
  const {
    scope,
    impersonating,
    impersonatingId,
    viewTeam,
    viewTeamId,
    impersonate,
    viewAsTeam,
    exitImpersonation,
  } = useView()
  const { t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          {impersonating ? (
            <>
              <Eye className="size-4" />
              <span className="hidden sm:inline">{t("view.viewingAs")}</span>
              <span className="max-w-32 truncate font-medium">
                {impersonating.name}
              </span>
            </>
          ) : viewTeam ? (
            <>
              <Building2 className="size-4" />
              <span className="max-w-32 truncate font-medium">
                {viewTeam.name}
              </span>
            </>
          ) : (
            <>
              <Users className="size-4" />
              <span className="font-medium">{t("view.org")}</span>
            </>
          )}
          <ChevronsUpDown className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[70svh] w-64 overflow-y-auto"
      >
        <DropdownMenuLabel>{t("view.as")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={exitImpersonation}>
          <Users className="size-4" />
          <span className="flex-1">{t("view.org")}</span>
          {scope.kind === "org" && <Check className="size-4" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          {t("view.teams")}
        </DropdownMenuLabel>
        {teams.map((tm) => (
          <DropdownMenuItem key={tm.id} onClick={() => viewAsTeam(tm.id)}>
            <Building2 className="text-muted-foreground size-4" />
            <span className="flex-1 truncate">{tm.name}</span>
            {tm.type === "client" && (
              <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
                client
              </span>
            )}
            {viewTeamId === tm.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          {t("view.impersonate")}
        </DropdownMenuLabel>
        {team.map((rep) => (
          <DropdownMenuItem key={rep.id} onClick={() => impersonate(rep.id)}>
            <Avatar className="size-5">
              <AvatarImage src={portraitFor(rep.name)} alt="" />
              <AvatarFallback
                style={{ backgroundColor: rep.avatarColor, color: "white" }}
                className="text-[10px]"
              >
                {initials(rep.name.split(" ")[0], rep.name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{rep.name}</span>
            {impersonatingId === rep.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
