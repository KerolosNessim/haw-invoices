import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CONTRACT_SERVICES_QUERY_KEY } from "../query-keys"
import {
  fetchAllContractServices,
  fetchContractServicesPage,
} from "../services/contract-services-api"

export function useContractServicesPage(page = 1, perPage = 10) {
  const safePage = page > 0 ? page : 1

  const query = useQuery({
    queryKey: [...CONTRACT_SERVICES_QUERY_KEY, "page", { page: safePage, perPage }] as const,
    queryFn: () => fetchContractServicesPage({ page: safePage, perPage }),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })

  return {
    ...query,
    rows: query.data?.rows ?? [],
    meta: query.data?.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: 0,
    },
  }
}

/** Full catalog for contract table / detail preview labels. */
export function useContractServices() {
  return useQuery({
    queryKey: [...CONTRACT_SERVICES_QUERY_KEY, "all"] as const,
    queryFn: fetchAllContractServices,
    staleTime: 60_000,
  })
}
