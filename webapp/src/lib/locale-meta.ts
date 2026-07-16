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
