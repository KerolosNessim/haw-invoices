import { useQuery } from "@tanstack/react-query";
import { INVOICE_CATALOG_QUERY_KEY } from "../query-keys";
import { fetchInvoiceCatalogOptions } from "../services/invoice-catalog-api";

export function useInvoiceCatalog(countryId?: number | null) {
  const safeCountryId = countryId && countryId > 0 ? countryId : undefined;

  return useQuery({
    queryKey: [...INVOICE_CATALOG_QUERY_KEY, safeCountryId ?? "all"] as const,
    queryFn: () => fetchInvoiceCatalogOptions(safeCountryId),
    enabled: Boolean(safeCountryId),
    staleTime: 60_000,
  });
}
