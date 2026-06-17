import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(
  undefined
)

const MEDIA = "(prefers-color-scheme: dark)"

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia(MEDIA).matches ? "dark" : "light"
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "kombo-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [systemTheme, setSystemTheme] = React.useState<"dark" | "light">(
    getSystemTheme
  )

  // Subscribe to OS-level theme changes (event subscription, not derived state).
  React.useEffect(() => {
    const mq = window.matchMedia(MEDIA)
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme = theme === "system" ? systemTheme : theme

  // Apply the resolved theme to the document (external system sync).
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const value = React.useMemo<ThemeProviderState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        localStorage.setItem(storageKey, next)
        setThemeState(next)
      },
    }),
    [theme, resolvedTheme, storageKey]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
