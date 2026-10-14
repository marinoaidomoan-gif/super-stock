// locale : 'fr' ou 'en' (i18n.resolvedLanguage)
export const formatNumber = (value, locale) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(value)

export const formatDateTime = (value, locale) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))