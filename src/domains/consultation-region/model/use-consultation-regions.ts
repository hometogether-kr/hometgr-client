import { useQuery } from "@tanstack/react-query";

import { fetchConsultationRegions } from "../api/consultation-regions.api";

const consultationRegionKeys = {
  list: (type: "university" | "subway") => ["consultation-regions", type] as const,
};

export function useConsultationRegions(type: "university" | "subway") {
  return useQuery({
    queryKey: consultationRegionKeys.list(type),
    queryFn: () => fetchConsultationRegions(type),
    staleTime: 300_000,
  });
}
