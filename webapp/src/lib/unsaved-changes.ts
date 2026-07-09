// A module-level "is something dirty right now" signal — deliberately not
// React context, so a single global navigation guard (mounted once in
// AppLayout) can consult it without every page threading draft state down
// to a shared component.

interface UnsavedChangesBlocker {
  isDirty: () => boolean
}

let blocker: UnsavedChangesBlocker | null = null

export function registerUnsavedChangesBlocker(b: UnsavedChangesBlocker | null): void {
  blocker = b
}

export function hasUnsavedChanges(): boolean {
  return blocker?.isDirty() ?? false
}
