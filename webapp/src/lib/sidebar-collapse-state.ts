import * as React from "react"

export type SidebarCollapseState = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}

export const SidebarCollapseContext = React.createContext<SidebarCollapseState | undefined>(
  undefined
)

export function useSidebarCollapsed() {
  const context = React.useContext(SidebarCollapseContext)
  if (context === undefined) {
    throw new Error("useSidebarCollapsed must be used within a SidebarCollapseProvider")
  }
  return context
}
