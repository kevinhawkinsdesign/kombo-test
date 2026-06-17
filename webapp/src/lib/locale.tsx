import * as React from "react"

export type Locale = "en" | "es"

type Dict = Record<string, string>

const en: Dict = {
  "nav.workspace": "Workspace",
  "nav.engage": "Engage",
  "nav.revenue": "Revenue",
  "nav.manage": "Manage",
  "nav.dashboard": "Dashboard",
  "nav.search": "Prospect Search",
  "nav.companies": "Companies",
  "nav.intros": "Warm Intros",
  "nav.lists": "Lists",
  "nav.inbox": "Inbox",
  "nav.campaigns": "Campaigns",
  "nav.templates": "Templates",
  "nav.playbook": "Playbook",
  "nav.channels": "Channels",
  "nav.tasks": "Tasks",
  "nav.deals": "Deals",
  "nav.analytics": "Analytics",
  "nav.coach": "Coach",
  "nav.team": "Team",
  "nav.integrations": "Integrations",
  "nav.settings": "Settings",
  "nav.referrals": "Referrals",
  "nav.usage": "Usage & credits",
  "nav.getStarted": "Get started",
  "nav.newSearch": "New prospect search",
  "common.language": "Language",
}

const es: Dict = {
  "nav.workspace": "Espacio de trabajo",
  "nav.engage": "Interacción",
  "nav.revenue": "Ingresos",
  "nav.manage": "Gestión",
  "nav.dashboard": "Panel",
  "nav.search": "Búsqueda de prospectos",
  "nav.companies": "Empresas",
  "nav.intros": "Presentaciones",
  "nav.lists": "Listas",
  "nav.inbox": "Bandeja de entrada",
  "nav.campaigns": "Campañas",
  "nav.templates": "Plantillas",
  "nav.playbook": "Estrategia",
  "nav.channels": "Canales",
  "nav.tasks": "Tareas",
  "nav.deals": "Negocios",
  "nav.analytics": "Analíticas",
  "nav.coach": "Coach",
  "nav.team": "Equipo",
  "nav.integrations": "Integraciones",
  "nav.settings": "Configuración",
  "nav.referrals": "Referidos",
  "nav.usage": "Uso y créditos",
  "nav.getStarted": "Primeros pasos",
  "nav.newSearch": "Nueva búsqueda",
  "common.language": "Idioma",
}

const DICTS: Record<Locale, Dict> = { en, es }

interface LocaleState {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const LocaleContext = React.createContext<LocaleState | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    const saved = localStorage.getItem("kb_locale")
    return saved === "es" ? "es" : "en"
  })

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem("kb_locale", l)
  }, [])

  const t = React.useCallback(
    (key: string) => DICTS[locale][key] ?? en[key] ?? key,
    [locale]
  )

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider")
  return ctx
}
