import ContractsTable from "@/features/contracts/components/contracts-table"
import { Button } from "@/components/ui/button"
import { FileSignature, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export default function ContractsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "contracts" })
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-20">
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <FileSignature className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h1>
            <p className="text-lg font-medium text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/contracts/create")}
          className="h-14 rounded-2xl px-8 font-bold shadow-xl shadow-primary/20"
        >
          <Plus className="me-2 h-6 w-6" />
          {t("add_button")}
        </Button>
      </div>

      <ContractsTable />
    </div>
  )
}
