/** Normalize contract `service_ids` from API responses or form state (numeric service ids). */
export function normalizeContractServiceIds(ids: unknown[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  for (const item of ids) {
    let id = ""

    if (typeof item === "number" && Number.isFinite(item)) {
      id = String(item)
    } else if (typeof item === "string" && item.trim()) {
      id = item.trim()
    } else if (item && typeof item === "object") {
      const r = item as Record<string, unknown>
      const raw = r.id ?? r.service_id
      if (typeof raw === "number" && Number.isFinite(raw)) {
        id = String(raw)
      } else if (typeof raw === "string" && raw.trim()) {
        id = raw.trim()
      }
    }

    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }

  return out
}
