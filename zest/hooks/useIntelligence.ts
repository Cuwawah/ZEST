import { useQuery } from "@tanstack/react-query";
import { getClientInsights, getPracticeInsights } from "@/app/actions/intelligence";

export function useClientInsights(clientId: string | null) {
  return useQuery({
    queryKey: ["clientInsights", clientId],
    queryFn: () => getClientInsights(clientId!),
    enabled: !!clientId,
    staleTime: 60_000,
  });
}

export function usePracticeInsights() {
  return useQuery({
    queryKey: ["practiceInsights"],
    queryFn: () => getPracticeInsights(),
    staleTime: 60_000,
  });
}
