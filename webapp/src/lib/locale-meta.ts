import type { Locale } from "@/lib/locale"

export const LOCALES: Locale[] = ["en", "es", "it", "fr", "de", "pt", "pt_BR"]

// BCP-47 tags for Intl formatting (dates, numbers) per UI locale.
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-PT",
  pt_BR: "pt-BR",
}

// The flag + native-language label for each locale — used by the app-shell
// locale switcher and anywhere else a language needs to be picked from the
// full list of officially supported platform locales (e.g. a campaign's
// sending language), not just the current UI locale.
export const LOCALE_FLAG: Record<Locale, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  it: "🇮🇹",
  fr: "🇫🇷",
  de: "🇩🇪",
  pt: "🇵🇹",
  pt_BR: "🇧🇷",
}
export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  es: "Español",
  it: "Italiano",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  pt_BR: "Português (Brasil)",
}
