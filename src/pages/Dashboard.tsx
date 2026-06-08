import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, LayoutDashboard } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export function Dashboard() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -start-4 top-0 h-full w-1 rounded-full bg-primary opacity-50" />
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          {t("welcome_dashboard")}
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          {t("dashboard_description")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="border border-border/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              {t("sidebar.invoices")}
            </CardTitle>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("invoices.description")}</p>
            <Link
              to="/invoices"
              className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {t("invoices.view_all")}
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              {t("sidebar.home")}
            </CardTitle>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <LayoutDashboard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("dashboard_card_hint")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
