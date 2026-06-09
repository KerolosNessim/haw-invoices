import { useQuery } from "@tanstack/react-query";
import { fetchCountryOptions } from "../services/countries-api";

export const COUNTRIES_QUERY_KEY = ["countries", "invoice"] as const;

export function useCountries() {
  return useQuery({
    queryKey: COUNTRIES_QUERY_KEY,
    queryFn: fetchCountryOptions,
    staleTime: 5 * 60_000,
  });
}
