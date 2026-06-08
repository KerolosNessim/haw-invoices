import { api } from "@/lib/api"
import { pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload"
import { plainTextFromHtml } from "@/lib/plain-text-from-html"
import type { ContractServiceOption } from "../types"

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null
}

function parseNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim()) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function pickMeta(payload: unknown, fallbackPerPage: number) {
  const root = asRecord(payload)
  const dataRec = root ? asRecord(root.data) : null
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta)
  return {
    current_page: parseNumber(meta?.current_page, 1),
    last_page: parseNumber(meta?.last_page, 1),
    per_page: parseNumber(meta?.per_page, fallbackPerPage),
    total: parseNumber(meta?.total, 0),
  }
}

function readServiceBody(r: Record<string, unknown>): string {
  const candidates = [
    pickLocalized(r.description, "ar"),
    pickLocalized(r.highlight_description, "ar"),
    pickLocalized(r.inside_desc, "ar"),
    pickLocalized(r.description, "en"),
    pickLocalized(r.highlight_description, "en"),
    pickLocalized(r.inside_desc, "en"),
  ]

  for (const raw of candidates) {
    const text = plainTextFromHtml(raw)
    if (text.trim()) return text
  }

  return ""
}

function optionFromRecord(
  raw: unknown,
  index: number,
): ContractServiceOption | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  if (r.is_active === false) return null

  const id = readId(r)
  if (!id) return null

  const title = plainTextFromHtml(
    pickLocalized(r.title, "ar") || pickLocalized(r.title, "en"),
  )
  const body = readServiceBody(r)

  const order =
    typeof r.sort_order === "number" && Number.isFinite(r.sort_order)
      ? r.sort_order
      : index + 1

  return {
    id,
    order,
    listLabel: title.trim() || `خدمة #${id}`,
    detailTitle: title.trim() || `خدمة #${id}`,
    detailBody:
      body ||
      `يلتزم الطرف الأول بتقديم خدمة ${title || id} للطرف الثاني وفق الباقة المتفق عليها.`,
  }
}

export type ContractServicesPageResult = {
  rows: ContractServiceOption[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

const SERVICE_LIST_URLS = ["/v1/admin/services", "/v1/services"] as const

export async function fetchContractServicesPage(params: {
  page?: number
  perPage?: number
}): Promise<ContractServicesPageResult> {
  const page = params.page && params.page > 0 ? params.page : 1
  const perPage = params.perPage ?? 10

  for (const url of SERVICE_LIST_URLS) {
    try {
      const res = await api.get<unknown>(url, {
        params: { page, per_page: perPage },
      })
      const body = (res.data as { data?: unknown })?.data ?? res.data
      const rows = unwrapDataArray(body)
        .map((row, index) => optionFromRecord(row, index))
        .filter((x): x is ContractServiceOption => x != null)

      return {
        rows,
        meta: pickMeta(res.data, perPage),
      }
    } catch {
      /* try next */
    }
  }

  return {
    rows: [],
    meta: { current_page: 1, last_page: 1, per_page: perPage, total: 0 },
  }
}

export async function fetchAllContractServices(): Promise<ContractServiceOption[]> {
  const perPage = 50
  const byId = new Map<string, ContractServiceOption>()
  let page = 1
  let lastPage = 1

  do {
    const result = await fetchContractServicesPage({ page, perPage })
    for (const row of result.rows) {
      if (!byId.has(row.id)) byId.set(row.id, row)
    }
    lastPage = result.meta.last_page
    if (result.rows.length === 0) break
    page += 1
  } while (page <= lastPage)

  return [...byId.values()].sort((a, b) => a.order - b.order)
}
