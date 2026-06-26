import { Navigate, Outlet, useLocation } from "react-router-dom"

import { AppSidebar, MobileBottomNav } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { ProspectSearch } from "@/components/layout/ProspectSearch"
import { ImpersonationBanner } from "@/components/layout/ImpersonationBanner"
import { UpdateBanner } from "@/components/layout/UpdateBanner"
import { NewCampaignProvider } from "@/components/campaign/NewCampaignWizard"
import { useReleaseMode, isV2OnlyPath, V1_HOME } from "@/lib/release-mode"

export function AppLayout() {
  const { isV1 } = useReleaseMode()
  const { pathname } = useLocation()
  // In v1 the new (extension-less) pages don't exist — bounce to the v1 home.
  const blockedInV1 = isV1 && isV2OnlyPath(pathname)

  return (
    <NewCampaignProvider>
    <div className="bg-muted/60 dark:bg-background flex min-h-svh">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <UpdateBanner />
        <ImpersonationBanner />
        <AppHeader />
        <main id="main-content" className="flex-1 pb-16 md:pb-0">
          {blockedInV1 ? <Navigate to={V1_HOME} replace /> : <Outlet />}
        </main>
      </div>
      <MobileBottomNav />
      <ProspectSearch />
    </div>
    </NewCampaignProvider>
  )
}
