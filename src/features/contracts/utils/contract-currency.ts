export const DEFAULT_CONTRACT_CURRENCY = "OMR"

export const CONTRACT_CURRENCIES = [
  { code: "OMR", labelAr: "ريال عماني (ر.ع)", labelEn: "Omani Rial (OMR)" },
  { code: "SAR", labelAr: "ريال سعودي (ر.س)", labelEn: "Saudi Riyal (SAR)" },
  { code: "AED", labelAr: "درهم إماراتي (د.إ)", labelEn: "UAE Dirham (AED)" },
  { code: "USD", labelAr: "دولار أمريكي ($)", labelEn: "US Dollar (USD)" },
  { code: "KWD", labelAr: "دينار كويتي (د.ك)", labelEn: "Kuwaiti Dinar (KWD)" },
  { code: "BHD", labelAr: "دينار بحريني (د.ب)", labelEn: "Bahraini Dinar (BHD)" },
  { code: "QAR", labelAr: "ريال قطري (ر.ق)", labelEn: "Qatari Riyal (QAR)" },
  { code: "EGP", labelAr: "جنيه مصري (ج.م)", labelEn: "Egyptian Pound (EGP)" },
] as const

export function normalizeContractCurrency(raw: unknown): string {
  const trimmed = typeof raw === "string" ? raw.trim().toUpperCase() : ""
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed
  return DEFAULT_CONTRACT_CURRENCY
}

export function getContractCurrencyLabel(
  code: string,
  locale: "ar" | "en" = "ar",
): string {
  const normalized = normalizeContractCurrency(code)
  const row = CONTRACT_CURRENCIES.find((c) => c.code === normalized)
  if (!row) return normalized
  return locale === "ar" ? row.labelAr : row.labelEn
}
