import { api } from "@/lib/api";
import {
  pickBilingualSlug,
  pickLocalized,
  readId,
  unwrapDataArray,
} from "@/lib/api-payload";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { InvoiceCatalogOption, InvoiceCatalogType } from "../types";
import { normalizeInvoiceCurrency } from "../utils/invoice-currency";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function humanizeSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

function readTextField(raw: unknown): string {
  if (typeof raw === "string") return plainTextFromHtml(raw);
  return "";
}

/** Resolve bilingual labels from common Laravel catalog shapes (`title`, `content.title`, `category`, `slug`). */
function readCatalogLabelPair(r: Record<string, unknown>): { ar: string; en: string } {
  let ar =
    pickLocalized(r.title, "ar") ||
    pickLocalized(r.name, "ar") ||
    readTextField(r.title_ar) ||
    readTextField(r.name_ar);
  let en =
    pickLocalized(r.title, "en") ||
    pickLocalized(r.name, "en") ||
    readTextField(r.title_en) ||
    readTextField(r.name_en);

  const content = asRecord(r.content);
  if (content) {
    const contentTitle = content.title;
    if (typeof contentTitle === "string" && contentTitle.trim()) {
      const text = plainTextFromHtml(contentTitle);
      ar = ar || text;
      en = en || text;
    } else {
      ar = ar || pickLocalized(contentTitle, "ar");
      en = en || pickLocalized(contentTitle, "en");
    }
  }

  const category = asRecord(r.category) ?? asRecord(r.package_category);
  if (category) {
    const categoryTitle = category.title;
    ar =
      ar ||
      pickLocalized(categoryTitle, "ar") ||
      (typeof categoryTitle === "string" ? plainTextFromHtml(categoryTitle) : "");
    en =
      en ||
      pickLocalized(categoryTitle, "en") ||
      (typeof categoryTitle === "string" ? plainTextFromHtml(categoryTitle) : "");
  }

  const slug = pickBilingualSlug(r.slug_local ?? r.slug);
  ar = ar || humanizeSlug(slug.ar);
  en = en || humanizeSlug(slug.en);

  return { ar: ar.trim(), en: en.trim() };
}

function parsePrice(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    const n = Number(raw.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function readCurrency(r: Record<string, unknown>): string {
  const c = r.currency ?? r.currency_code;
  return normalizeInvoiceCurrency(typeof c === "string" ? c : "");
}

function catalogOption(
  type: InvoiceCatalogType,
  id: string,
  labelAr: string,
  labelEn: string,
  price: number,
  currency: string,
): InvoiceCatalogOption {
  return {
    key: `${type}:${id}`,
    type,
    id,
    labelAr: labelAr || labelEn,
    labelEn: labelEn || labelAr,
    price,
    currency,
  };
}

function readContentTitle(r: Record<string, unknown>): string {
  const content = asRecord(r.content);
  if (!content) return "";

  const rawTitle = content.title;
  if (typeof rawTitle === "string" && rawTitle.trim()) {
    return plainTextFromHtml(rawTitle);
  }

  return plainTextFromHtml(
    pickLocalized(rawTitle, "ar") || pickLocalized(rawTitle, "en"),
  );
}

function optionsFromRecords(
  records: unknown[],
  type: InvoiceCatalogType,
): InvoiceCatalogOption[] {
  const out: InvoiceCatalogOption[] = [];
  for (const raw of records) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = readId(r);
    if (!id) continue;
    const labels = readCatalogLabelPair(r);
    const labelAr = labels.ar || labels.en;
    const labelEn = labels.en || labels.ar;
    const price = parsePrice(r.price ?? r.amount ?? r.cost);
    out.push(catalogOption(type, id, labelAr, labelEn, price, readCurrency(r)));
  }
  return out;
}

function optionsFromPackageRecords(records: unknown[]): InvoiceCatalogOption[] {
  const out: InvoiceCatalogOption[] = [];

  for (const raw of records) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = readId(r);
    if (!id) continue;

    const contentTitle = readContentTitle(r);
    const labels = readCatalogLabelPair(r);
    const labelAr = contentTitle || labels.ar || labels.en;
    const labelEn = contentTitle || labels.en || labels.ar;
    const price = parsePrice(r.price ?? r.amount ?? r.cost);

    out.push(catalogOption("package", id, labelAr, labelEn, price, readCurrency(r)));
  }

  return out;
}

function catalogQueryParams(countryId?: number): Record<string, string | number> {
  const params: Record<string, string | number> = { per_page: 200 };
  if (countryId && countryId > 0) params.country_id = countryId;
  return params;
}

async function fetchPackageTitlesByLocale(
  lang: "ar" | "en",
  countryId?: number,
): Promise<Map<string, string>> {
  const res = await api.get<unknown>("/v1/packages", {
    params: catalogQueryParams(countryId),
    headers: { "Accept-Language": lang },
  });
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const titles = new Map<string, string>();

  for (const raw of unwrapDataArray(body)) {
    const r = asRecord(raw);
    if (!r) continue;
    const id = readId(r);
    if (!id) continue;
    const title = readContentTitle(r);
    if (title) titles.set(id, title);
  }

  return titles;
}

async function fetchPackageCatalog(countryId?: number): Promise<InvoiceCatalogOption[]> {
  const urls = ["/v1/packages", "/v1/admin/packages"];

  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url, {
        params: catalogQueryParams(countryId),
      });
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      const records = unwrapDataArray(body);
      const options = optionsFromPackageRecords(records);

      if (url === "/v1/packages" && options.length > 0) {
        try {
          const [arTitles, enTitles] = await Promise.all([
            fetchPackageTitlesByLocale("ar", countryId),
            fetchPackageTitlesByLocale("en", countryId),
          ]);

          return options.map((opt) => ({
            ...opt,
            labelAr: arTitles.get(opt.id) || opt.labelAr,
            labelEn: enTitles.get(opt.id) || opt.labelEn,
          }));
        } catch {
          return options;
        }
      }

      if (options.some((opt) => opt.labelAr || opt.labelEn)) {
        return options;
      }
    } catch {
      /* try next */
    }
  }

  return [];
}

async function fetchCourseCatalog(countryId?: number): Promise<InvoiceCatalogOption[]> {
  const urls = ["/v1/admin/courses", "/v1/courses"];
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url, {
        params: catalogQueryParams(countryId),
      });
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return optionsFromRecords(unwrapDataArray(body), "course");
    } catch {
      /* try next */
    }
  }
  return [];
}

async function fetchServiceCatalog(countryId?: number): Promise<InvoiceCatalogOption[]> {
  const urls = ["/v1/admin/services", "/v1/services"];
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url, {
        params: catalogQueryParams(countryId),
      });
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      const rows = unwrapDataArray(body);
      const out: InvoiceCatalogOption[] = [];
      for (const raw of rows) {
        if (!raw || typeof raw !== "object") continue;
        const r = raw as Record<string, unknown>;
        const id = readId(r);
        if (!id) continue;
        const labels = readCatalogLabelPair(r);
        const labelAr = labels.ar || labels.en;
        const labelEn = labels.en || labels.ar;
        let price = 0;
        let currency = readCurrency(r);
        const packages = r.packages;
        if (packages && typeof packages === "object" && !Array.isArray(packages)) {
          const items = (packages as Record<string, unknown>).items;
          if (Array.isArray(items) && items.length > 0) {
            const first = items[0] as Record<string, unknown>;
            price = parsePrice(first.price);
            currency = readCurrency(first);
          }
        }
        out.push(catalogOption("service", id, labelAr, labelEn, price, currency));
      }
      return out;
    } catch {
      /* try next */
    }
  }
  return [];
}

export async function fetchInvoiceCatalogOptions(
  countryId?: number,
): Promise<InvoiceCatalogOption[]> {
  const [packages, courses, services] = await Promise.all([
    fetchPackageCatalog(countryId),
    fetchCourseCatalog(countryId),
    fetchServiceCatalog(countryId),
  ]);
  return [...packages, ...courses, ...services];
}

export function buildLineItemsFromKeys(
  catalogKeys: string[],
  options: InvoiceCatalogOption[],
  companyName: string,
  _locale: "ar" | "en",
  costOverrides?: Record<string, number>,
  invoiceCurrency?: string,
): import("../types").InvoiceLineItem[] {
  const byKey = new Map(options.map((o) => [o.key, o]));
  return catalogKeys
    .map((key) => byKey.get(key))
    .filter((o): o is InvoiceCatalogOption => Boolean(o))
    .map((o) => {
      const override = costOverrides?.[o.key];
      const cost =
        typeof override === "number" && Number.isFinite(override) && override >= 0
          ? override
          : o.price;
      return {
        catalogKey: o.key,
        type: o.type,
        id: o.id,
        serviceNameAr: o.labelAr,
        serviceNameEn: o.labelEn,
        siteName: companyName.trim() || "—",
        cost,
        currency: normalizeInvoiceCurrency(invoiceCurrency ?? o.currency),
      };
    });
}
