import ContractPreview from "@/features/contracts/components/contract-preview"
import { useContractDetail } from "@/features/contracts/hooks/useContracts"
import { useContractServices } from "@/features/contracts/hooks/useContractServices"
import {
  downloadContractHtml,
  printContractElement,
} from "@/features/contracts/utils/download-contract"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Download, FileSignature, Pencil, Printer } from "lucide-react"
import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useParams } from "react-router-dom"

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation("translation", { keyPrefix: "contracts" })
  const navigate = useNavigate()
  const previewRef = useRef<HTMLDivElement>(null)
  const { data: contract, isLoading } = useContractDetail(id ?? null)
  const { data: services = [] } = useContractServices()

  const handlePrint = () => {
    const el = previewRef.current?.querySelector(
      "#contract-preview-detail",
    ) as HTMLElement | null
    if (!el || !contract) return
    printContractElement(el, `contract-${contract.contract_number}`)
  }

  const handleDownload = () => {
    const el = previewRef.current?.querySelector(
      "#contract-preview-detail",
    ) as HTMLElement | null
    if (!el || !contract) return
    downloadContractHtml(el, `contract-${contract.contract_number}`)
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-20" dir={i18n.dir()}>
      <div className="flex flex-col gap-4 border-b pb-8">
        <Button variant="ghost" className="w-fit rounded-xl h-12!" asChild>
          <Link to="/contracts">
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t("back_to_list")}
          </Link>
        </Button>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileSignature className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{t("details_title")}</h1>
              {contract ? (
                <p className="font-mono text-sm text-muted-foreground" dir="ltr">
                  HWEY-CON-{contract.contract_number}
                </p>
              ) : null}
            </div>
          </div>
          {contract ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-12!"
                onClick={() => navigate(`/contracts/${contract.id}/edit`)}
              >
                <Pencil className="me-2 h-4 w-4" />
                {t("edit")}
              </Button>
              <Button variant="outline" className="rounded-xl h-12!" onClick={handlePrint}>
                <Printer className="me-2 h-4 w-4" />
                {t("print")}
              </Button>
              <Button className="rounded-xl h-12!" onClick={handleDownload}>
                <Download className="me-2 h-4 w-4" />
                {t("download")}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div ref={previewRef}>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : contract ? (
          <ContractPreview
            id="contract-preview-detail"
            contractNumber={contract.contract_number}
            serviceCatalog={services}
            client_name={contract.client_name}
            client_title={contract.client_title}
            business_name={contract.business_name}
            commercial_registration={contract.commercial_registration}
            service_ids={contract.service_ids}
            duration={contract.duration}
            monthly_amount={contract.monthly_amount}
            currency={contract.currency}
            contract_date={contract.contract_date}
          />
        ) : (
          <p className="py-10 text-center text-muted-foreground">{t("not_found")}</p>
        )}
      </div>
    </div>
  )
}
