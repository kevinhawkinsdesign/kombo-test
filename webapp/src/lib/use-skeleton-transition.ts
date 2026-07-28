import * as React from "react"

/**
 * Deliberate, brief delay before swapping in new page/tab content on
 * navigation, so a skeleton placeholder (see `components/common/
 * ContentSkeleton`) is visible long enough to register instead of an
 * instant, jarring content swap. Every page in this app is backed by
 * synchronous mock data, so this constant is the only "loading" time
 * there is — tune it here, not at each call site.
 */
export const SKELETON_TRANSITION_MS = 220

/**
 * Returns true for a brief window (`durationMs`) whenever `key` changes, so
 * a caller can render a skeleton placeholder instead of hard-swapping
 * straight from one page/tab's content to the next.
 *
 * Uses the same render-time-check idiom as `usePagedSelection`'s
 * `resetKey` (compare the incoming value against state *during* render,
 * not inside an effect) so the very first render after `key` changes
 * already reflects it — no stale frame of the old content ever commits.
 */
export function useSkeletonTransition(
  key: unknown,
  durationMs: number = SKELETON_TRANSITION_MS
): boolean {
  const [state, setState] = React.useState(() => ({ key, transitioning: false }))

  if (key !== state.key) {
    setState({ key, transitioning: true })
  }

  React.useEffect(() => {
    if (!state.transitioning) return
    const timer = window.setTimeout(() => {
      setState((s) => (s.key === key ? { ...s, transitioning: false } : s))
    }, durationMs)
    return () => window.clearTimeout(timer)
  }, [state.transitioning, state.key, key, durationMs])

  return state.transitioning
}
