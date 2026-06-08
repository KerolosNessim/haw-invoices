/** Default when catalog rows omit currency (Howeyah invoices). */
export const DEFAULT_INVOICE_CURRENCY = "SAR";

export const INVOICE_CURRENCIES = [
  { code: "SAR", labelAr: "ريال سعودي (SAR)", labelEn: "Saudi Riyal (SAR)" },
  { code: "OMR", labelAr: "ريال عماني (OMR)", labelEn: "Omani Rial (OMR)" },
  { code: "AED", labelAr: "درهم إماراتي (AED)", labelEn: "UAE Dirham (AED)" },
  { code: "USD", labelAr: "دولار أمريكي (USD)", labelEn: "US Dollar (USD)" },
  { code: "KWD", labelAr: "دينار كويتي (KWD)", labelEn: "Kuwaiti Dinar (KWD)" },
  { code: "BHD", labelAr: "دينار بحريني (BHD)", labelEn: "Bahraini Dinar (BHD)" },
  { code: "QAR", labelAr: "ريال قطري (QAR)", labelEn: "Qatari Riyal (QAR)" },
  { code: "EGP", labelAr: "جنيه مصري (EGP)", labelEn: "Egyptian Pound (EGP)" },
] as const;

/** Laravel expects exactly 3 uppercase ISO 4217 letters per line item. */
export function normalizeInvoiceCurrency(raw: unknown): string {
  const trimmed = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;
  return DEFAULT_INVOICE_CURRENCY;
}

export function getInvoiceCurrencyLabel(
  code: string,
  locale: "ar" | "en" = "ar",
): string {
  const normalized = normalizeInvoiceCurrency(code);
  const row = INVOICE_CURRENCIES.find((c) => c.code === normalized);
  if (!row) return normalized;
  return locale === "ar" ? row.labelAr : row.labelEn;
}
