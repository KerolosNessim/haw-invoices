import { api } from "@/lib/api";
import { pickLocalized, unwrapDataArray } from "@/lib/api-payload";
import type { CountryOption } from "../types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function readCountryName(raw: unknown): string {
  if (typeof raw === "string") return raw.trim();
  return (
    pickLocalized(raw, "ar") ||
    pickLocalized(raw, "en") ||
    ""
  ).trim();
}

function normalizeCountryRow(raw: unknown): CountryOption | null {
  const r = asRecord(raw);
  if (!r) return null;

  const id = Number(r.id ?? r.country_id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const nameSource = r.name ?? r.title;
  const active = r.is_active ?? r.isActive ?? r.status;

  return {
    id,
    nameAr:
      pickLocalized(nameSource, "ar") ||
      readCountryName(nameSource) ||
      String(r.name_ar ?? "").trim(),
    nameEn:
      pickLocalized(nameSource, "en") ||
      readCountryName(nameSource) ||
      String(r.name_en ?? "").trim(),
    is_active: !(
      active === false ||
      active === 0 ||
      active === "0" ||
      active === "inactive"
    ),
  };
}

async function fetchCountriesWithLocale(lang: "ar" | "en"): Promise<CountryOption[]> {
  const urls = ["/v1/admin/countries", "/v1/countries"];

  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url, {
        headers: { "Accept-Language": lang },
      });
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return unwrapDataArray(body)
        .map((row) => normalizeCountryRow(row))
        .filter((x): x is CountryOption => x != null);
    } catch {
      /* try next */
    }
  }

  return [];
}

export async function fetchCountryOptions(): Promise<CountryOption[]> {
  const [arRows, enRows] = await Promise.all([
    fetchCountriesWithLocale("ar"),
    fetchCountriesWithLocale("en"),
  ]);

  const enById = new Map(enRows.map((row) => [row.id, row]));
  const merged = new Map<number, CountryOption>();

  for (const row of arRows) {
    const en = enById.get(row.id);
    merged.set(row.id, {
      id: row.id,
      nameAr: row.nameAr || en?.nameAr || en?.nameEn || row.nameEn,
      nameEn: en?.nameEn || en?.nameAr || row.nameEn || row.nameAr,
      is_active: row.is_active && (en?.is_active ?? true),
    });
  }

  for (const row of enRows) {
    if (merged.has(row.id)) continue;
    merged.set(row.id, row);
  }

  return [...merged.values()]
    .filter((row) => row.is_active)
    .sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
}

/** Prefer Saudi Arabia when present — most catalog items are scoped to it. */
export function pickDefaultCountryId(countries: CountryOption[]): number | null {
  if (countries.length === 0) return null;

  const saudi =
    countries.find((row) => row.id === 4) ||
    countries.find(
      (row) =>
        /سعود|saudi/i.test(row.nameAr) || /saudi/i.test(row.nameEn),
    );

  return (saudi ?? countries[0]).id;
}

export function countryLabel(
  country: CountryOption | undefined,
  locale: "ar" | "en",
): string {
  if (!country) return "";
  return locale === "ar"
    ? country.nameAr || country.nameEn
    : country.nameEn || country.nameAr;
}
