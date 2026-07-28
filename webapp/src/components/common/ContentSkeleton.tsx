import { Skeleton } from "@/components/ui/skeleton"
import { Page } from "@/components/layout/Page"

/**
 * Rough placeholder shown for the brief window `useSkeletonTransition`
 * reports as "transitioning" (see `lib/use-skeleton-transition.ts`). Not
 * meant to mirror any specific destination pixel-for-pixel — just
 * approximate "a heading plus a few content blocks" so a route or tab
 * change reads as a deliberate, momentary loading state rather than an
 * instant flash to unrelated content.
 */
function SkeletonBlocks() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

/**
 * For in-page tab switches — the page heading and tab strip stay mounted
 * and only the content below them swaps, so this is body blocks only.
 */
export function TabSkeleton() {
  return <SkeletonBlocks />
}

/**
 * For top-level route navigation — the sidebar/header stay mounted and
 * this replaces the entire routed `<Outlet />` content, so it recreates
 * `Page`'s own padding plus a heading placeholder.
 */
export function PageSkeleton() {
  return (
    <Page>
      <div className="mb-6 space-y-2" aria-hidden="true">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <SkeletonBlocks />
    </Page>
  )
}
