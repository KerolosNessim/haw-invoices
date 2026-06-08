/** Single source of truth for the Laravel backend host (no trailing slash). */
const DEFAULT_API_BASE_URL = "https://invoice.subcodeco.com"

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "")
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
)

/**
 * In dev, use the Vite `/api` proxy to avoid CORS.
 * In production, call the API host directly.
 */
export const API_URL = import.meta.env.DEV ? "/api" : `${API_BASE_URL}/api`
