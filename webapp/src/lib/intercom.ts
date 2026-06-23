// Loads the Intercom Messenger when VITE_INTERCOM_APP_ID is configured.
// Without an app id this is a no-op; the top-bar Help menu still works
// and falls back to the help center.

interface IntercomFn {
  (...args: unknown[]): void
  q?: unknown[][]
  c?: (args: unknown[]) => void
}

declare global {
  interface Window {
    Intercom?: (...args: unknown[]) => void
    intercomSettings?: Record<string, unknown>
  }
}

export function bootIntercom(user?: { name?: string; email?: string }): void {
  const appId = import.meta.env.VITE_INTERCOM_APP_ID as string | undefined
  if (!appId || typeof window === "undefined") return

  window.intercomSettings = {
    app_id: appId,
    name: user?.name,
    email: user?.email,
  }

  const existing = window.Intercom
  if (typeof existing === "function") {
    existing("reattach_activator")
    existing("update", window.intercomSettings)
    return
  }

  const stub: IntercomFn = (...args: unknown[]) => {
    stub.c?.(args)
  }
  stub.q = []
  stub.c = (args: unknown[]) => {
    stub.q?.push(args)
  }
  window.Intercom = stub

  const load = () => {
    const s = document.createElement("script")
    s.async = true
    s.src = `https://widget.intercom.io/widget/${appId}`
    document.head.appendChild(s)
  }
  if (document.readyState === "complete") load()
  else window.addEventListener("load", load)
}
