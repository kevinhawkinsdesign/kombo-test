// Demo helper: a hard refresh (Cmd/Ctrl+Shift+R) wipes demo state — dismissed
// banners and feature intros, plus any data/numbers the user changed — so every
// walkthrough starts from a clean slate. Auth, theme, and language are kept.

const RESET_KEYS = ["kombo_store_v1", "kombo_feature_tours_v1"]

export function installDemoReset(): void {
  window.addEventListener(
    "keydown",
    (event) => {
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.shiftKey && (event.key === "R" || event.key === "r")) {
        // Clear demo state synchronously, then let the browser's hard reload
        // proceed (we don't preventDefault) so the app re-seeds fresh.
        try {
          for (const key of RESET_KEYS) localStorage.removeItem(key)
        } catch {
          /* ignore storage errors */
        }
      }
    },
    { capture: true }
  )
}
