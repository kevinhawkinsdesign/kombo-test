import * as React from "react"

export type Locale = "en" | "es"

type Dict = Record<string, string>

const en: Dict = {
  "nav.workspace": "Workspace",
  "nav.engage": "Engage",
  "nav.prospecting": "Prospect & Enrich",
  "nav.outreach": "Outreach",
  "nav.revenue": "Revenue",
  "nav.manage": "Manage",
  "nav.home": "Home",
  "nav.dashboard": "Dashboard",
  "nav.copilot": "Signals",
  "nav.search": "Find Prospects",
  "nav.companies": "Companies",
  "nav.people": "Prospects",
  "nav.discover": "Discover",
  "nav.intros": "Warm Intros",
  "nav.extension": "Browser extension",
  "nav.lists": "Lists",
  "nav.workspaces": "Workspaces",
  "nav.inbox": "Inbox",
  "nav.campaigns": "Campaigns",
  "nav.sequences": "Sequences",
  "nav.templates": "Templates",
  "nav.playbook": "Playbook",
  "nav.library": "Library",
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
  "nav.newSearch": "Find prospects",
  "common.language": "Language",
  "common.new": "New",
  "common.gotIt": "Got it",
  "common.exit": "Exit",
  "common.dismiss": "Dismiss",
  "header.searchPlaceholder": "Search the app…",
  "header.jumpTo": "Jump to",
  "help.title": "Help & support",
  "help.subtitle": "We're here to help.",
  "help.message": "Send us a message",
  "help.messageSub": "Chat with our team",
  "help.center": "Help center",
  "help.centerSub": "Browse articles & guides",
  "help.shortcuts": "Keyboard shortcuts",
  "help.shortcutsSub": "Tips to move faster",
  "help.shortcutsTitle": "Keyboard shortcuts",
  "shortcut.search": "Open search",
  "shortcut.close": "Close dialogs & menus",
  "search.navLabel": "Search",
  "search.placeholder": "Search prospects, companies, lists…",
  "search.suggested": "Suggested",
  "search.people": "Prospects",
  "search.companies": "Companies",
  "search.lists": "Lists",
  "search.searchAll": "Search everything for",
  "search.noResults": "No direct matches",
  "search.navigate": "navigate",
  "search.open": "open",
  "header.credits": "Credits remaining",
  "header.help": "Help & support",
  "menu.profile": "Profile",
  "menu.billing": "Plan & billing",
  "menu.logout": "Log out",
  "view.as": "View workspace as",
  "view.org": "Whole organization",
  "view.wholeTeam": "Whole team",
  "view.teams": "Teams & clients",
  "view.impersonate": "Impersonate a rep",
  "view.perspective": "Quick view",
  "view.salesManager": "Sales Manager",
  "view.sdr": "SDR",
  "view.viewingAs": "Viewing as",
  "banner.viewingAs": "You are viewing the workspace as",
  "banner.viewingTeam": "You are viewing the team",
  "kai.suggests": "Kai suggests",
  "release.label": "Release",
  "release.tooltip":
    "V1 shows only what's in today's Chrome extension. V2 reveals the full web-app vision.",
  "update.available": "A new version of Kombo is available.",
  "update.refresh": "Refresh",
  "update.dismiss": "Dismiss",
}

const es: Dict = {
  "nav.workspace": "Espacio de trabajo",
  "nav.engage": "Interacción",
  "nav.prospecting": "Prospectar y enriquecer",
  "nav.outreach": "Alcance",
  "nav.revenue": "Ingresos",
  "nav.manage": "Gestión",
  "nav.home": "Inicio",
  "nav.dashboard": "Panel",
  "nav.copilot": "Señales",
  "nav.search": "Buscar prospectos",
  "nav.companies": "Empresas",
  "nav.people": "Prospectos",
  "nav.discover": "Descubrir",
  "nav.intros": "Presentaciones",
  "nav.extension": "Extensión de navegador",
  "nav.lists": "Listas",
  "nav.workspaces": "Espacios de trabajo",
  "nav.inbox": "Bandeja de entrada",
  "nav.campaigns": "Campañas",
  "nav.sequences": "Secuencias",
  "nav.templates": "Plantillas",
  "nav.playbook": "Estrategia",
  "nav.library": "Biblioteca",
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
  "common.new": "Nuevo",
  "common.gotIt": "Entendido",
  "common.exit": "Salir",
  "common.dismiss": "Descartar",
  "header.searchPlaceholder": "Buscar en la app…",
  "header.jumpTo": "Ir a",
  "help.title": "Ayuda y soporte",
  "help.subtitle": "Estamos aquí para ayudarte.",
  "help.message": "Envíanos un mensaje",
  "help.messageSub": "Chatea con nuestro equipo",
  "help.center": "Centro de ayuda",
  "help.centerSub": "Artículos y guías",
  "help.shortcuts": "Atajos de teclado",
  "help.shortcutsSub": "Trucos para ir más rápido",
  "help.shortcutsTitle": "Atajos de teclado",
  "shortcut.search": "Abrir búsqueda",
  "shortcut.close": "Cerrar diálogos y menús",
  "search.navLabel": "Buscar",
  "search.placeholder": "Buscar prospectos, empresas, listas…",
  "search.suggested": "Sugeridos",
  "search.people": "Prospectos",
  "search.companies": "Empresas",
  "search.lists": "Listas",
  "search.searchAll": "Buscar todo:",
  "search.noResults": "Sin coincidencias directas",
  "search.navigate": "navegar",
  "search.open": "abrir",
  "header.credits": "Créditos restantes",
  "header.help": "Ayuda y soporte",
  "menu.profile": "Perfil",
  "menu.billing": "Plan y facturación",
  "menu.logout": "Cerrar sesión",
  "view.as": "Ver el espacio como",
  "view.org": "Toda la organización",
  "view.impersonate": "Ver como representante",
  "view.perspective": "Vista rápida",
  "view.salesManager": "Gerente de ventas",
  "view.sdr": "SDR",
  "view.wholeTeam": "Todo el equipo",
  "view.teams": "Equipos y clientes",
  "view.viewingAs": "Viendo como",
  "banner.viewingAs": "Estás viendo el espacio como",
  "banner.viewingTeam": "Estás viendo el equipo",
  "kai.suggests": "Kai sugiere",
  "release.label": "Versión",
  "release.tooltip":
    "V1 muestra solo lo que existe en la extensión de Chrome actual. V2 revela la visión completa de la app web.",
  "update.available": "Hay una nueva versión de Kombo disponible.",
  "update.refresh": "Actualizar",
  "update.dismiss": "Descartar",
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
