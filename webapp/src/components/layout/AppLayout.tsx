import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { ImpersonationBanner } from "@/components/layout/ImpersonationBanner"

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/search": "Prospect Search",
  "/lists": "Lists",
  "/inbox": "Inbox",
  "/campaigns": "Campaigns",
  "/coach": "Coach",
  "/integrations": "Integrations",
  "/settings": "Settings",
}

function titleForPath(path: string): string {
  if (TITLES[path]) return TITLES[path]
  if (path.startsWith("/prospects")) return "Prospect"
  if (path.startsWith("/lists/")) return "List"
  return "Kombo"
}

export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div className="bg-muted/30 flex min-h-svh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <AppHeader title={titleForPath(pathname)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
