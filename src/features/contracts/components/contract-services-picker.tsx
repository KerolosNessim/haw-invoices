import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"
import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { resolveSelectedContractServices } from "../contract-content"
import type { ContractServiceOption, ContractServiceId } from "../types"

type Props = {
  services: ContractServiceOption[]
  selectedIds: ContractServiceId[]
  selectedCatalog?: ContractServiceOption[]
  onToggle: (id: ContractServiceId, checked: boolean, title?: string) => void
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  errorMessage?: string
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  onPageChange?: (page: number) => void
  isRtl?: boolean
}

export default function ContractServicesPicker({
  services,
  selectedIds,
  selectedCatalog,
  onToggle,
  isLoading,
  isError,
  onRetry,
  errorMessage,
  meta,
  onPageChange,
  isRtl = true,
}: Props) {
  const { t } = useTranslation("translation", { keyPrefix: "contracts.form" })
  const { t: pageT } = useTranslation("translation", { keyPrefix: "contracts" })
  const catalogForSelected = selectedCatalog ?? services
  const selectedServices = resolveSelectedContractServices(
    selectedIds,
    catalogForSelected,
  )

  const paginationMeta = meta
    ? {
        current_page: meta.current_page,
        last_page: meta.last_page,
        per_page: meta.per_page,
        total: meta.total,
        path: "",
        from:
          meta.total === 0
            ? null
            : (meta.current_page - 1) * meta.per_page + 1,
        to:
          meta.total === 0
            ? null
            : Math.min(meta.current_page * meta.per_page, meta.total),
      }
    : null

  return (
    <div className="space-y-4">
      <FieldLabel className="block text-base">{t("services")}</FieldLabel>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center gap-2 rounded-2xl border border-dashed px-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("services_loading")}
        </div>
      ) : isError ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-destructive">
            {errorMessage ?? t("services_load_error")}
          </p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void onRetry()}
            >
              {t("services_retry")}
            </Button>
          ) : null}
        </div>
      ) : services.length === 0 && (meta?.total ?? 0) === 0 ? (
        <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          {t("services_empty")}
        </p>
      ) : (
        <>
          {selectedServices.length > 0 ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-xs font-semibold text-primary">
                {t("services_selected", { count: selectedServices.length })}
              </p>
              <ul className="flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <li
                    key={service.id}
                    className="rounded-full bg-white px-3 py-1 text-sm font-medium shadow-sm ring-1 ring-primary/20"
                  >
                    {service.listLabel}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("services_select_hint")}</p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((service) => {
              const checked = selectedIds.some(
                (id) => String(id) === String(service.id),
              )
              return (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-muted/10 px-4 py-3 transition-colors hover:bg-primary/5 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/10"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      onToggle(service.id, v === true, service.listLabel)
                    }
                  />
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug">
                    {service.listLabel}
                  </span>
                </label>
              )
            })}
          </div>

          {paginationMeta && onPageChange && meta && meta.last_page > 1 ? (
            <div className="border-t border-border/40 pt-4">
              <LaravelResourcePagination
                meta={paginationMeta}
                onPageChange={onPageChange}
                isRtl={isRtl}
                previousLabel={pageT("pagination.previous")}
                nextLabel={pageT("pagination.next")}
                hideWhenSinglePage
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
