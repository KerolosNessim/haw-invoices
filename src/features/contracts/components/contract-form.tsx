import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import * as z from "zod"
import {
  CONTRACT_DURATION_OPTIONS,
  formatDurationAr,
} from "../contract-content"
import { useContractServicesPage } from "../hooks/useContractServices"
import {
  useContractDetail,
  useCreateContract,
  useUpdateContract,
} from "../hooks/useContracts"
import type {
  ContractDuration,
  ContractServiceId,
  ContractServiceOption,
} from "../types"
import {
  CONTRACT_CURRENCIES,
  DEFAULT_CONTRACT_CURRENCY,
  normalizeContractCurrency,
} from "../utils/contract-currency"
import ContractPreview from "./contract-preview"
import ContractServicesPicker from "./contract-services-picker"

const durationValues = CONTRACT_DURATION_OPTIONS as [
  ContractDuration,
  ...ContractDuration[],
]

const schema = z.object({
  client_title: z.string().min(1, { message: "validation.required" }),
  client_name: z.string().min(1, { message: "validation.required" }),
  business_name: z.string().min(1, { message: "validation.required" }),
  commercial_registration: z.string().min(1, { message: "validation.required" }),
  service_ids: z.array(z.string()).min(1, { message: "validation.required" }),
  duration: z.enum(durationValues),
  monthly_amount: z.number().min(0),
  currency: z.string().min(3).max(3),
  contract_date: z.string().min(1, { message: "validation.required" }),
})

type FormValues = z.infer<typeof schema>

type Props = {
  contractId?: string
}

export default function ContractForm({ contractId }: Props) {
  const isEdit = Boolean(contractId)
  const { t } = useTranslation("translation", { keyPrefix: "contracts.form" })
  const { t: pageT } = useTranslation("translation", { keyPrefix: "contracts" })
  const { t: commonT, i18n } = useTranslation("translation")
  const navigate = useNavigate()
  const [servicesPage, setServicesPage] = useState(1)
  const [serviceTitleById, setServiceTitleById] = useState<Record<string, string>>({})
  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const { data: existing, isLoading: loadingExisting } = useContractDetail(
    contractId ?? null,
  )
  const {
    rows: services,
    meta: servicesMeta,
    isLoading: servicesLoading,
    isError: servicesError,
    refetch: refetchServices,
  } = useContractServicesPage(servicesPage, 10)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_title: "السيد",
      client_name: "",
      business_name: "",
      commercial_registration: "",
      service_ids: [],
      duration: "6_months",
      monthly_amount: 0,
      currency: DEFAULT_CONTRACT_CURRENCY,
      contract_date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  useEffect(() => {
    if (!isEdit || !existing) return
    reset({
      client_title: existing.client_title,
      client_name: existing.client_name,
      business_name: existing.business_name,
      commercial_registration: existing.commercial_registration,
      service_ids: existing.service_ids,
      duration: existing.duration,
      monthly_amount: existing.monthly_amount,
      currency: existing.currency,
      contract_date: existing.contract_date,
    })
  }, [isEdit, existing, reset])

  const watched = watch()
  const isPending = createMutation.isPending || updateMutation.isPending

  const toggleService = (
    serviceId: ContractServiceId,
    checked: boolean,
    title?: string,
  ) => {
    const current = watched.service_ids ?? []
    const without = current.filter((x) => String(x) !== String(serviceId))
    const next = checked ? [...without, serviceId] : without
    setValue("service_ids", next, { shouldValidate: true })

    setServiceTitleById((prev) => {
      const copy = { ...prev }
      if (checked && title?.trim()) {
        copy[String(serviceId)] = title.trim()
      } else {
        delete copy[String(serviceId)]
      }
      return copy
    })
  }

  const serviceCatalogForPreview = useMemo(() => {
    const byId = new Map<string, ContractServiceOption>()
    for (const service of services) {
      byId.set(String(service.id), service)
    }
    for (const [id, listLabel] of Object.entries(serviceTitleById)) {
      if (!byId.has(id)) {
        byId.set(id, {
          id,
          order: 999,
          listLabel,
          detailTitle: listLabel,
          detailBody: "",
        })
      }
    }
    return [...byId.values()]
  }, [services, serviceTitleById])

  const onSubmit = (values: FormValues) => {
    if (isEdit && contractId) {
      updateMutation.mutate(
        { id: contractId, draft: values },
        { onSuccess: () => navigate(`/contracts/${contractId}`) },
      )
      return
    }

    createMutation.mutate(values, {
      onSuccess: (record) => navigate(`/contracts/${record.id}`),
    })
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (isEdit && !loadingExisting && !existing) {
    return (
      <p className="py-10 text-center text-muted-foreground">{pageT("not_found")}</p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        toast.error(t("validation_error"))
      })}
      className="space-y-10"
      dir="rtl"
    >
      <div className="rounded-[32px] border border-border/40 bg-white p-6 shadow-sm md:p-8">
        {isEdit && existing ? (
          <p className="mb-6 text-sm text-muted-foreground">
            {t("contract_number_hint")}{" "}
            <span className="font-mono font-bold text-foreground" dir="ltr">
              HWEY-CON-{existing.contract_number}
            </span>
          </p>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">
            {t("contract_number_auto_hint")}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Controller
            name="client_title"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("client_title")}</FieldLabel>
                <Input {...field} className="h-12 rounded-2xl" placeholder="السيد / السيدة" />
                <FieldError
                  errors={[
                    {
                      message:
                        errors.client_title?.message &&
                        commonT(errors.client_title.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name="client_name"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("client_name")}</FieldLabel>
                <Input {...field} className="h-12 rounded-2xl" />
                <FieldError
                  errors={[
                    {
                      message:
                        errors.client_name?.message &&
                        commonT(errors.client_name.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name="business_name"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("business_name")}</FieldLabel>
                <Input {...field} className="h-12 rounded-2xl" />
                <FieldError
                  errors={[
                    {
                      message:
                        errors.business_name?.message &&
                        commonT(errors.business_name.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name="commercial_registration"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("commercial_registration")}</FieldLabel>
                <Input {...field} dir="ltr" className="h-12 rounded-2xl" />
                <FieldError
                  errors={[
                    {
                      message:
                        errors.commercial_registration?.message &&
                        commonT(errors.commercial_registration.message),
                    },
                  ]}
                />
              </Field>
            )}
          />
          <Controller
            name="monthly_amount"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("monthly_amount")}</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  step="0.01"
                  dir="ltr"
                  className="h-12 rounded-2xl"
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </Field>
            )}
          />
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("currency")}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(normalizeContractCurrency(value))
                  }
                >
                  <SelectTrigger className="h-12! w-full rounded-2xl">
                    <SelectValue placeholder={t("currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_CURRENCIES.map((row) => (
                      <SelectItem key={row.code} value={row.code}>
                        {row.labelAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="contract_date"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("contract_date")}</FieldLabel>
                <Input {...field} type="date" dir="ltr" className="h-12 rounded-2xl" />
              </Field>
            )}
          />
        <div >
          <FieldLabel className="mb-1 block text-base">{t("duration")}</FieldLabel>
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12! w-full rounded-2xl">
                  <SelectValue placeholder={t("duration")} />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_DURATION_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatDurationAr(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        </div>


        <div className="mt-8">
          <ContractServicesPicker
            services={services}
            selectedIds={watched.service_ids ?? []}
            selectedCatalog={serviceCatalogForPreview}
            onToggle={toggleService}
            isLoading={servicesLoading}
            isError={servicesError}
            onRetry={() => void refetchServices()}
            meta={servicesMeta}
            onPageChange={setServicesPage}
            isRtl={i18n.language.startsWith("ar")}
          />
          {errors.service_ids ? (
            <p className="mt-2 text-sm text-destructive">{t("services_required")}</p>
          ) : null}
        </div>



        <div className="mt-8 flex justify-start gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-12!"
            onClick={() =>
              navigate(isEdit && contractId ? `/contracts/${contractId}` : "/contracts")
            }
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={
              isPending || servicesLoading || watched.service_ids.length === 0
            }
            className="rounded-xl px-8 font-bold h-12!"
          >
            {isPending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="me-2 h-4 w-4" />
            )}
            {isEdit ? t("update") : t("save")}
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">{t("preview_title")}</h2>
        <ContractPreview
          id="contract-preview-draft"
          contractNumber={existing?.contract_number}
          serviceCatalog={serviceCatalogForPreview}
          {...watched}
        />
      </section>
    </form>
  )
}
