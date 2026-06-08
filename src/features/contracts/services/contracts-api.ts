import { api } from "@/lib/api"
import { readId, unwrapDataArray, unwrapShowResource } from "@/lib/api-payload"
import { normalizeContractCurrency } from "../utils/contract-currency"
import { normalizeContractServiceIds } from "../utils/normalize-service-ids"
import type {
  ContractDuration,
  ContractFormDraft,
  ContractRecord,
  CreateContractPayload,
  UpdateContractPayload,
} from "../types"

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

const VALID_DURATIONS = new Set<ContractDuration>([
  "3_months",
  "6_months",
  "12_months",
  "1_year",
])

function normalizeDuration(raw: unknown): ContractDuration {
  if (typeof raw === "string" && VALID_DURATIONS.has(raw as ContractDuration)) {
    return raw as ContractDuration
  }
  if (typeof raw === "number") {
    if (raw === 3) return "3_months"
    if (raw === 6) return "6_months"
    if (raw === 12) return "12_months"
  }
  if (raw === "1_year") return "1_year"
  return "6_months"
}

function normalizeServiceIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return normalizeContractServiceIds(raw)
}

function normalizeContractRow(raw: unknown): ContractRecord | null {
  const r = asRecord(raw)
  if (!r) return null
  const id = readId(r)
  if (!id) return null

  return {
    id,
    contract_number: String(r.contract_number ?? ""),
    client_title: String(r.client_title ?? "السيد"),
    client_name: String(r.client_name ?? ""),
    business_name: String(r.business_name ?? ""),
    commercial_registration: String(r.commercial_registration ?? ""),
    contract_date: String(r.contract_date ?? ""),
    duration: normalizeDuration(r.duration ?? r.duration_months),
    monthly_amount: parseNumber(r.monthly_amount),
    currency: normalizeContractCurrency(r.currency),
    service_ids: normalizeServiceIds(r.service_ids),
    created_at: String(r.created_at ?? ""),
    updated_at:
      typeof r.updated_at === "string" ? r.updated_at : undefined,
  }
}

function pickMeta(payload: unknown) {
  const root = asRecord(payload)
  const dataRec = root ? asRecord(root.data) : null
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta)
  return {
    current_page: parseNumber(meta?.current_page, 1),
    last_page: parseNumber(meta?.last_page, 1),
    per_page: parseNumber(meta?.per_page, 15),
    total: parseNumber(meta?.total, 0),
  }
}

export type ContractsListResult = {
  rows: ContractRecord[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function fetchContractsPage(params: {
  page?: number
  search?: string
  perPage?: number
}): Promise<ContractsListResult> {
  const query: Record<string, string | number> = {
    per_page: params.perPage ?? 15,
  }
  if (params.page && params.page > 0) query.page = params.page
  if (params.search?.trim()) query.search = params.search.trim()

  const res = await api.get<unknown>("/v1/admin/contracts", { params: query })
  const body = (res.data as { data?: unknown })?.data ?? res.data
  const rows = unwrapDataArray(body)
    .map((row) => normalizeContractRow(row))
    .filter((x): x is ContractRecord => x != null)

  return { rows, meta: pickMeta(res.data) }
}

export async function fetchContractById(id: string): Promise<ContractRecord | null> {
  const res = await api.get<unknown>(`/v1/admin/contracts/${id}`)
  const body = (res.data as { data?: unknown })?.data ?? res.data
  const entity =
    asRecord(body)?.data && typeof (body as Record<string, unknown>).data === "object"
      ? (body as Record<string, unknown>).data
      : body

  try {
    const record = unwrapShowResource(res.data)
    return normalizeContractRow(record)
  } catch {
    return normalizeContractRow(entity)
  }
}

type ContractApiBody = ContractFormDraft

function buildRequestBody(
  payload: CreateContractPayload | UpdateContractPayload,
): ContractApiBody {
  return {
    client_title: payload.client_title.trim(),
    client_name: payload.client_name.trim(),
    business_name: payload.business_name.trim(),
    commercial_registration: payload.commercial_registration.trim(),
    contract_date: payload.contract_date,
    duration: payload.duration,
    monthly_amount: Number(payload.monthly_amount) || 0,
    currency: normalizeContractCurrency(payload.currency),
    service_ids: normalizeContractServiceIds(payload.service_ids),
  }
}

export async function createContract(
  payload: CreateContractPayload,
): Promise<ContractRecord> {
  const res = await api.post<unknown>("/v1/admin/contracts", buildRequestBody(payload))
  const body = (res.data as { data?: unknown })?.data ?? res.data
  const parsed = normalizeContractRow(body)
  if (parsed) return parsed

  try {
    return normalizeContractRow(unwrapShowResource(res.data))!
  } catch {
    throw new Error("Invalid contract response")
  }
}

export async function updateContract(
  id: string,
  payload: UpdateContractPayload,
): Promise<ContractRecord> {
  const res = await api.put<unknown>(
    `/v1/admin/contracts/${id}`,
    buildRequestBody(payload),
  )
  const body = (res.data as { data?: unknown })?.data ?? res.data
  const parsed = normalizeContractRow(body)
  if (parsed) return parsed

  try {
    return normalizeContractRow(unwrapShowResource(res.data))!
  } catch {
    throw new Error("Invalid contract response")
  }
}

export async function deleteContract(id: string): Promise<void> {
  await api.delete(`/v1/admin/contracts/${id}`)
}
