import * as React from "react"

export type AppVersion = "v1" | "v2"

const VERSION_KEY = "kombo-app-version"
const VERSION_EVENT = "kombo-version-change"

function readVersion(): AppVersion {
  try {
    const v = localStorage.getItem(VERSION_KEY)
    if (v === "v1" || v === "v2") return v
  } catch {
    /* ignore */
  }
  return "v1"
}

function writeVersion(v: AppVersion) {
  try {
    localStorage.setItem(VERSION_KEY, v)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(VERSION_EVENT))
}

export function useVersion() {
  const [version, setVersionState] = React.useState<AppVersion>(readVersion)

  React.useEffect(() => {
    function handler() {
      setVersionState(readVersion())
    }
    window.addEventListener(VERSION_EVENT, handler)
    return () => window.removeEventListener(VERSION_EVENT, handler)
  }, [])

  const setVersion = React.useCallback((v: AppVersion) => {
    writeVersion(v)
    setVersionState(v)
  }, [])

  return { version, setVersion }
}
