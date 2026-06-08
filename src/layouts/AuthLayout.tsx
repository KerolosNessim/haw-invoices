import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/user-store"

export function AuthLayout() {
  const { user } = useAuthStore()
  if (user) {
    return <Navigate to="/" replace />
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <Outlet />
      </div>
    </div>
  )
}
