import { Outlet } from "react-router-dom"

import { AppSidebar, MobileBottomNav } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { ImpersonationBanner } from "@/components/layout/ImpersonationBanner"
import { UpdateBanner } from "@/components/layout/UpdateBanner"
import { SupportWidget } from "@/components/support/SupportWidget"
import { NewCampaignProvider } from "@/components/campaign/NewCampaignWizard"

export function AppLayout() {
  return (
    <NewCampaignProvider>
    <div className="bg-muted/30 dark:bg-background flex min-h-svh">
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
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <SupportWidget />
    </div>
    </NewCampaignProvider>
  )
}
