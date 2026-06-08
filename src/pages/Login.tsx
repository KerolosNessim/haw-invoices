import { useTranslation } from "react-i18next"
import { LoginForm } from "@/features/auth/components/login-form"

export function Login() {
  const { t } = useTranslation()

  return (
    <div className="animate-in space-y-4 duration-700 fade-in slide-in-from-bottom-4">
      <img
        src="/logo.png"
        alt="logo"
        className="mx-auto h-24 w-24 object-contain"
      />
      <div className="space-y-2 text-center">
        <p className="text-center text-sm text-muted-foreground">
          {t("login_subtitle")}
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
