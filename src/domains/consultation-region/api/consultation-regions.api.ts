import { apiRequest } from "@/shared/api";

import { consultationRegionListSchema } from "../model/consultation-region.schema";

export async function fetchConsultationRegions(type: "university" | "subway") {
  const result = await apiRequest({
    path: "/consultation-regions",
    searchParams: { type, limit: 50 },
    schema: consultationRegionListSchema,
  });
  return result.items;
}
