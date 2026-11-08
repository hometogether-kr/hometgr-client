import { REGIONS } from "./regions.data";

export const SEARCH_REGIONS = REGIONS.flatMap((sido) =>
  sido.sigungu.map((sigungu) => ({
    sido: sido.code,
    sidoName: "서울특별시",
    sigungu: sigungu.code,
    label: `서울특별시 ${sigungu.name}`,
    name: sigungu.name,
  })),
);

export type SearchRegion = (typeof SEARCH_REGIONS)[number];

export function findSearchRegion(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return SEARCH_REGIONS.find((region) =>
    [region.label, region.name, `서울 ${region.name}`, `서울시 ${region.name}`].includes(
      normalized,
    ),
  );
}

export function getSelectedRegion(sido: string | null, sigungu: string | null) {
  return SEARCH_REGIONS.find((region) => region.sido === sido && region.sigungu === sigungu);
}
