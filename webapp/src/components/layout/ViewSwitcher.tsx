import { Users, Check, ChevronsUpDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useView } from "@/lib/view-context"
import { team } from "@/lib/team"
import { initials } from "@/lib/format"

export function ViewSwitcher() {
  const { impersonatingId, impersonate, exitImpersonation } = useView()
  const active = team.find((m) => m.id === impersonatingId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {active ? (
            <>
              <Eye className="size-4" />
              <span className="hidden sm:inline">Viewing as</span>
              <span className="font-medium">{active.name}</span>
            </>
          ) : (
            <>
              <Users className="size-4" />
              <span className="font-medium">Whole team</span>
            </>
          )}
          <ChevronsUpDown className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>View workspace as</DropdownMenuLabel>
        <DropdownMenuItem onClick={exitImpersonation}>
          <Users className="size-4" />
          <span className="flex-1">Whole team</span>
          {!active && <Check className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Impersonate a rep
        </DropdownMenuLabel>
        {team.map((rep) => (
          <DropdownMenuItem key={rep.id} onClick={() => impersonate(rep.id)}>
            <Avatar className="size-5">
              <AvatarFallback
                style={{ backgroundColor: rep.avatarColor, color: "white" }}
                className="text-[10px]"
              >
                {initials(rep.name.split(" ")[0], rep.name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{rep.name}</span>
            {active?.id === rep.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
