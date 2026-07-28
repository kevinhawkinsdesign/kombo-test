import { Outlet, useLocation } from "react-router-dom"

import { PageSkeleton } from "@/components/common/ContentSkeleton"
import { useSkeletonTransition } from "@/lib/use-skeleton-transition"

/**
 * Wraps the routed page content (in place of a bare `<Outlet />`) so
 * navigating to a different page — via the sidebar or otherwise — briefly
 * shows a skeleton instead of hard-swapping straight from one page's
 * content to the next. See `useSkeletonTransition` for the timing.
 */
export function RouteTransition() {
  const { pathname } = useLocation()
  const transitioning = useSkeletonTransition(pathname)

  if (transitioning) return <PageSkeleton />
  return <Outlet />
}
