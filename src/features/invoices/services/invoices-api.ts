import { api } from "@/lib/api";
import { pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type {
  CreateInvoicePayload,
  InvoiceCatalogType,
  InvoiceDetail,
  InvoiceLineItem,
  InvoiceRow,
} from "../types";
import { normalizeInvoiceCurrency } from "../utils/invoice-currency";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function parseNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function normalizeLineItem(raw: unknown): InvoiceLineItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const type = r.type as InvoiceCatalogType;
  if (type !== "package" && type !== "service" && type !== "course")
    return null;
  const id = readId(r) || String(r.catalog_id ?? r.item_id ?? "");
  if (!id) return null;
  return {
    catalogKey: `${type}:${id}`,
    type,
    id,
    serviceNameAr: plainTextFromHtml(
      String(r.service_name_ar ?? r.title_ar ?? r.title ?? ""),
    ),
    serviceNameEn: plainTextFromHtml(
      String(r.service_name_en ?? r.title_en ?? r.title ?? ""),
    ),
    siteName: plainTextFromHtml(String(r.site_name ?? r.company_name ?? "")),
    cost: parseNumber(r.cost ?? r.price ?? r.amount),
    currency: typeof r.currency === "string" ? r.currency : "",
  };
}

function readCountryNames(r: Record<string, unknown>): {
  country_id?: number;
  country_name_ar?: string;
  country_name_en?: string;
} {
  const country = asRecord(r.country);
  const countryId = parseNumber(r.country_id, 0) || parseNumber(country?.id, 0);
  const nameSource = country?.name ?? country?.title ?? r.country_name;

  const country_name_ar =
    pickLocalized(nameSource, "ar") ||
    (typeof nameSource === "string" ? nameSource : "") ||
    String(r.country_name_ar ?? "").trim();
  const country_name_en =
    pickLocalized(nameSource, "en") ||
    (typeof nameSource === "string" ? nameSource : "") ||
    String(r.country_name_en ?? "").trim();

  return {
    country_id: countryId > 0 ? countryId : undefined,
    country_name_ar: country_name_ar || undefined,
    country_name_en: country_name_en || undefined,
  };
}

function normalizeInvoiceRow(raw: unknown): InvoiceRow | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = readId(r);
  if (!id) return null;
  const lineItems = Array.isArray(r.line_items)
    ? r.line_items
    : Array.isArray(r.items)
      ? r.items
      : [];
  const country = readCountryNames(r);
  const notes =
    typeof r.notes === "string" && r.notes.trim() ? r.notes.trim() : undefined;

  return {
    id,
    invoice_number: String(r.invoice_number ?? r.number ?? ""),
    client_name: String(r.client_name ?? r.name ?? ""),
    client_phone: String(r.client_phone ?? r.phone ?? ""),
    company_name: String(r.company_name ?? ""),
    subtotal: parseNumber(r.subtotal),
    discount: parseNumber(r.discount),
    tax: parseNumber(r.tax),
    total: parseNumber(r.total ?? r.total_due),
    currency: typeof r.currency === "string" ? r.currency : "",
    created_at: String(r.created_at ?? r.invoice_date ?? ""),
    line_items_count: parseNumber(r.line_items_count, lineItems.length),
    notes,
    country_id: country.country_id,
  };
}

function normalizeInvoiceDetail(raw: unknown): InvoiceDetail | null {
  const row = normalizeInvoiceRow(raw);
  if (!row) return null;
  const r = asRecord(raw)!;
  const itemsRaw = Array.isArray(r.line_items)
    ? r.line_items
    : Array.isArray(r.items)
      ? r.items
      : [];
  const line_items = itemsRaw
    .map((item) => normalizeLineItem(item))
    .filter((x): x is InvoiceLineItem => x != null);
  const country = readCountryNames(r);
  return {
    ...row,
    line_items,
    line_items_count: line_items.length || row.line_items_count,
    country_name_ar: country.country_name_ar,
    country_name_en: country.country_name_en,
  };
}

function pickMeta(payload: unknown) {
  const root = asRecord(payload);
  const dataRec = root ? asRecord(root.data) : null;
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta);
  return {
    current_page: parseNumber(meta?.current_page, 1),
    last_page: parseNumber(meta?.last_page, 1),
    per_page: parseNumber(meta?.per_page, 15),
    total: parseNumber(meta?.total, 0),
  };
}

export type InvoicesListResult = {
  rows: InvoiceRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export async function fetchInvoicesPage(params: {
  page?: number;
  search?: string;
}): Promise<InvoicesListResult> {
  const query: Record<string, string | number> = {};
  if (params.page && params.page > 0) query.page = params.page;
  if (params.search?.trim()) query.search = params.search.trim();

  const res = await api.get<unknown>("/v1/admin/invoices", { params: query });
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const rows = unwrapDataArray(body)
    .map((row) => normalizeInvoiceRow(row))
    .filter((x): x is InvoiceRow => x != null);

  return { rows, meta: pickMeta(res.data) };
}

export async function fetchInvoiceById(
  id: string,
): Promise<InvoiceDetail | null> {
  const res = await api.get<unknown>(`/v1/admin/invoices/${id}`);
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const entity =
    asRecord(body)?.data &&
    typeof (body as Record<string, unknown>).data === "object"
      ? (body as Record<string, unknown>).data
      : body;
  return normalizeInvoiceDetail(entity);
}

function invoiceDetailFromPayload(
  payload: CreateInvoicePayload,
  raw: unknown,
): InvoiceDetail {
  const parsed = normalizeInvoiceDetail(raw);
  if (parsed) return parsed;

  const root = asRecord(raw);
  const nested = asRecord(root?.data);
  const fromNested = normalizeInvoiceDetail(nested ?? raw);
  if (fromNested) return fromNested;

  const subtotal = payload.line_items.reduce((sum, row) => sum + row.cost, 0);
  const discount = payload.discount ?? 0;
  const tax = payload.tax ?? 0;
  const currency =
    normalizeInvoiceCurrency(payload.line_items[0]?.currency) || "SAR";

  return {
    id: (root ? readId(root) : "") || (nested ? readId(nested) : "") || payload.invoice_number,
    invoice_number: payload.invoice_number,
    client_name: payload.client_name,
    client_phone: payload.client_phone,
    company_name: payload.company_name,
    subtotal,
    discount,
    tax,
    total: Math.max(0, subtotal - discount + tax),
    currency,
    created_at: new Date().toISOString(),
    line_items_count: payload.line_items.length,
    notes: payload.notes?.trim() || undefined,
    country_id: payload.country_id,
    line_items: payload.line_items.map((item) => ({
      catalogKey: `${item.type}:${item.id}`,
      type: item.type,
      id: String(item.id),
      serviceNameAr: "",
      serviceNameEn: "",
      siteName: payload.company_name,
      cost: item.cost,
      currency: normalizeInvoiceCurrency(item.currency),
    })),
  };
}

export async function createInvoice(
  payload: CreateInvoicePayload,
): Promise<InvoiceDetail> {
  if (payload.line_items.length === 0) {
    throw new Error("At least one line item is required");
  }

  const requestBody: CreateInvoicePayload = {
    ...payload,
    notes: payload.notes?.trim() || undefined,
    country_id: payload.country_id,
    line_items: payload.line_items.map((item) => ({
      type: item.type,
      id: String(item.id),
      cost: Number(item.cost) || 0,
      currency: normalizeInvoiceCurrency(item.currency),
    })),
  };

  const res = await api.post<unknown>("/v1/admin/invoices", requestBody);
  const body = res.data;
  return invoiceDetailFromPayload(payload, body);
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/v1/admin/invoices/${id}`);
}

/** Optional server PDF; falls back to client download when unavailable. */
export async function downloadInvoicePdfFromApi(
  id: string,
): Promise<Blob | null> {
  try {
    const res = await api.get(`/v1/admin/invoices/${id}/download`, {
      responseType: "blob",
    });
    if (res.data instanceof Blob) return res.data;
    return null;
  } catch {
    return null;
  }
}
