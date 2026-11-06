import { shinhanHostEstimateSchema } from "./host-estimate.schema";
import type { ShinhanHostEstimateValues } from "./intake-draft";

// Keep the established Seoul v1 rent rules for the anonymous preview. Submission remains server-owned.
const districtTiers = [
  {
    min: 350000,
    districts: ["강북구", "구로구", "금천구", "노원구", "도봉구", "은평구", "중랑구"],
  },
  {
    min: 400000,
    districts: ["강동구", "강서구", "관악구", "동대문구", "서대문구", "성북구", "양천구"],
  },
  { min: 450000, districts: ["광진구", "동작구", "마포구", "영등포구", "종로구", "중구"] },
  { min: 500000, districts: ["성동구", "송파구", "용산구"] },
  { min: 550000, districts: ["강남구", "서초구"] },
];
const furnitureAmounts = { bed: 20000, desk: 10000, chair: 5000, wardrobe: 15000 };

export function calculateShinhanRentPreview(values: ShinhanHostEstimateValues) {
  const input = shinhanHostEstimateSchema.parse(values);
  const sido = input.address.sido.normalize("NFKC").trim();
  const district = input.address.sigungu.normalize("NFKC").trim().replace(/구?$/, "구");
  const tier = ["서울", "서울시", "서울특별시"].includes(sido)
    ? districtTiers.find((item) => item.districts.includes(district))
    : undefined;
  const base =
    tier?.min ??
    districtTiers.reduce((sum, item) => sum + item.min * item.districts.length, 0) / 25;
  const furniture = Object.entries(furnitureAmounts).reduce((sum, [key, amount]) => {
    const state = input.furniture[key as keyof typeof furnitureAmounts];
    return sum + (state === "OWNED" || state === "PLANNED" ? amount : 0);
  }, 0);
  const adjustment = furniture - 50000 + (input.bathroomCount === 2 ? 80000 : 0);
  const min = Math.round((base + adjustment) / 5000) * 5000;
  const max = Math.round((base + 100000 + adjustment) / 5000) * 5000;
  return { monthly: { min, max }, annual: { min: min * 12, max: max * 12 } };
}
