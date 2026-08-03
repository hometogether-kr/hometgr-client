/** 보호자와의 관계 (Figma: 보호자 정보 (비상 연락처), node 646:26187) */
export type GuardianRelation =
  "father" | "mother" | "spouse" | "sibling" | "child" | "acquaintance" | "other";

export interface GuardianRelationOption {
  value: GuardianRelation;
  label: string;
}

export const GUARDIAN_RELATION_OPTIONS: readonly GuardianRelationOption[] = [
  { value: "father", label: "부" },
  { value: "mother", label: "모" },
  { value: "spouse", label: "배우자" },
  { value: "sibling", label: "형제 / 자매" },
  { value: "child", label: "자녀" },
  { value: "acquaintance", label: "지인 / 친구" },
  { value: "other", label: "기타" },
] as const;
