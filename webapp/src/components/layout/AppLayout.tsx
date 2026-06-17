import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { ImpersonationBanner } from "@/components/layout/ImpersonationBanner"
import { SupportWidget } from "@/components/support/SupportWidget"
import { useLocale } from "@/lib/locale"

// Map routes to i18n keys (nav.*) so header titles localize. Detail routes
// fall back to plain labels.
const TITLE_KEYS: Record<string, string> = {
  "/": "nav.dashboard",
  "/search": "nav.search",
  "/companies": "nav.companies",
  "/intros": "nav.intros",
  "/lists": "nav.lists",
  "/inbox": "nav.inbox",
  "/campaigns": "nav.campaigns",
  "/channels": "nav.channels",
  "/templates": "nav.templates",
  "/playbook": "nav.playbook",
  "/tasks": "nav.tasks",
  "/deals": "nav.deals",
  "/analytics": "nav.analytics",
  "/coach": "nav.coach",
  "/team": "nav.team",
  "/referrals": "nav.referrals",
  "/usage": "nav.usage",
  "/integrations": "nav.integrations",
  "/settings": "nav.settings",
  "/get-started": "nav.getStarted",
  "/notifications": "Notifications",
}

function titleKeyForPath(path: string): string {
  if (TITLE_KEYS[path]) return TITLE_KEYS[path]
  if (path.startsWith("/prospects")) return "Prospect"
  if (path.startsWith("/companies/")) return "Company"
  if (path.startsWith("/lists/")) return "List"
  if (path.startsWith("/campaigns/")) return "Campaign"
  if (path.startsWith("/coach/")) return "Call analysis"
  return "Kombo"
}

export function AppLayout() {
  const { pathname } = useLocation()
  const { t } = useLocale()

  return (
    <div className="bg-muted/30 flex min-h-svh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <AppHeader title={t(titleKeyForPath(pathname))} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <SupportWidget />
    </div>
  )
}
