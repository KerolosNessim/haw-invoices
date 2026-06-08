export const AUTH_STORAGE_KEY = "auth-storage"

export function clearPersistedAuth() {
  localStorage.removeItem("token")
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
