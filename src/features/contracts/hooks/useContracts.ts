import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getHttpErrorMessage } from "@/lib/http-error-message"
import { CONTRACTS_QUERY_KEY } from "../query-keys"
import {
  createContract,
  deleteContract,
  fetchContractById,
  fetchContractsPage,
  updateContract,
} from "../services/contracts-api"
import type { ContractFormDraft } from "../types"

export function useContracts(params: { page?: number; search?: string } = {}) {
  const page = params.page && params.page > 0 ? params.page : 1
  const search = params.search?.trim() || undefined

  const query = useQuery({
    queryKey: [...CONTRACTS_QUERY_KEY, { page, search: search ?? null }] as const,
    queryFn: () => fetchContractsPage({ page, search }),
    staleTime: 20_000,
    placeholderData: keepPreviousData,
  })

  return {
    ...query,
    rows: query.data?.rows ?? [],
    meta: query.data?.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
  }
}

export function useContractDetail(id: string | null) {
  return useQuery({
    queryKey: [...CONTRACTS_QUERY_KEY, "detail", id] as const,
    queryFn: () => (id ? fetchContractById(id) : null),
    enabled: Boolean(id),
  })
}

export function useCreateContract() {
  const { t } = useTranslation("translation", { keyPrefix: "contracts" })
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (draft: ContractFormDraft) => createContract(draft),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
      toast.success(t("create_success"))
    },
    onError: (err: unknown) => {
      toast.error(getHttpErrorMessage(err, { default: t("create_error") }))
    },
  })
}

export function useUpdateContract() {
  const { t } = useTranslation("translation", { keyPrefix: "contracts" })
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: ContractFormDraft }) =>
      updateContract(id, draft),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
      qc.invalidateQueries({
        queryKey: [...CONTRACTS_QUERY_KEY, "detail", vars.id],
      })
      toast.success(t("update_success"))
    },
    onError: (err: unknown) => {
      toast.error(getHttpErrorMessage(err, { default: t("update_error") }))
    },
  })
}

export function useDeleteContract() {
  const { t } = useTranslation("translation", { keyPrefix: "contracts" })
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
      toast.success(t("delete_success"))
    },
    onError: (err: unknown) => {
      toast.error(getHttpErrorMessage(err, { default: t("delete_error") }))
    },
  })
}
