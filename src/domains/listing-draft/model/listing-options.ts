/**
 * 매물 등록 선택지
 *
 * 화면 문구와 서버 enum을 한곳에서 짝지어, 페이지는 한글 문자열 대신 enum 값을
 * 상태로 들고 라벨만 빌려 씁니다. 화면과 API 사이의 번역을 이 파일로 몰아둡니다.
 */

export interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

function toOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): readonly SelectOption<TValue>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

/* 2단계 · 등록자 정보 (API step 2) */

export const REGISTRANT_RELATIONSHIPS = ["owner", "familyProxy"] as const;
export type RegistrantRelationship = (typeof REGISTRANT_RELATIONSHIPS)[number];

export const REGISTRANT_RELATIONSHIP_OPTIONS = [
  {
    value: "owner",
    label: "집주인 본인",
    description: "본인이 소유하거나 거주 중인 공간을 직접 등록합니다.",
  },
  {
    value: "familyProxy",
    label: "가족, 친인척 대리 등록",
    description: "소유자 확인 연락을 받을 수 있으면 대리 등록이 가능합니다.",
  },
] as const satisfies readonly (SelectOption<RegistrantRelationship> & { description: string })[];

/* 3단계 · 장소 기본 정보 (API step 3) */

export const BUILDING_TYPES = ["villa", "apartment", "detachedHouse", "other"] as const;
export type BuildingType = (typeof BUILDING_TYPES)[number];

export const BUILDING_TYPE_LABEL: Record<BuildingType, string> = {
  villa: "빌라",
  apartment: "아파트",
  detachedHouse: "단독주택",
  other: "기타",
};

export const BUILDING_TYPE_OPTIONS = toOptions(BUILDING_TYPES, BUILDING_TYPE_LABEL);

/* 4단계 · 상세 정보 (API step 4) */

export const AREA_RANGES = [
  "upTo10Pyeong",
  "teensPyeong",
  "twentiesPyeong",
  "thirtiesPyeong",
  "fortiesPyeong",
  "fiftiesPyeong",
  "overFiftyPyeong",
  "unknown",
] as const;
export type AreaRange = (typeof AREA_RANGES)[number];

export const AREA_RANGE_LABEL: Record<AreaRange, string> = {
  upTo10Pyeong: "10평 이하",
  teensPyeong: "10평대",
  twentiesPyeong: "20평대",
  thirtiesPyeong: "30평대",
  fortiesPyeong: "40평대",
  fiftiesPyeong: "50평대",
  overFiftyPyeong: "그 이상",
  unknown: "잘 모르겠어요",
};

export const AREA_RANGE_OPTIONS = toOptions(AREA_RANGES, AREA_RANGE_LABEL);

export const RESIDENT_TYPES = ["ownerOnly", "withFamily", "withOtherTenants"] as const;
export type ResidentType = (typeof RESIDENT_TYPES)[number];

export const RESIDENT_TYPE_LABEL: Record<ResidentType, string> = {
  ownerOnly: "집주인 혼자 거주",
  withFamily: "가족과 함께 거주",
  withOtherTenants: "다른 입주자 있음",
};

export const RESIDENT_TYPE_OPTIONS = toOptions(RESIDENT_TYPES, RESIDENT_TYPE_LABEL);

export const RESIDENT_GENDER_COMPOSITIONS = ["femaleOnly", "maleOnly", "mixed"] as const;
export type ResidentGenderComposition = (typeof RESIDENT_GENDER_COMPOSITIONS)[number];

export const RESIDENT_GENDER_COMPOSITION_LABEL: Record<ResidentGenderComposition, string> = {
  femaleOnly: "여성만 거주",
  maleOnly: "남성만 거주",
  mixed: "남여 함께 거주",
};

export const RESIDENT_GENDER_COMPOSITION_OPTIONS = toOptions(
  RESIDENT_GENDER_COMPOSITIONS,
  RESIDENT_GENDER_COMPOSITION_LABEL,
);

/**
 * 주차 상세는 서버에 자유 텍스트(`parkingDescription`) 한 칸만 있습니다.
 * 화면의 선택지를 그대로 잃지 않도록 라벨을 문장 앞머리로 붙여 보냅니다.
 */
export const PARKING_KINDS = ["freePlenty", "freeFirstCome", "paid"] as const;
export type ParkingKind = (typeof PARKING_KINDS)[number];

export const PARKING_KIND_OPTIONS = [
  { value: "freePlenty", label: "무료(여유)", description: "여유로운 무료 주차 공간이 있습니다." },
  {
    value: "freeFirstCome",
    label: "무료(선착순)",
    description: "선착순으로 이용 가능한 무료 주차 공간이 있습니다.",
  },
  { value: "paid", label: "유료", description: "유료 주차 공간이 있습니다." },
] as const satisfies readonly (SelectOption<ParkingKind> & { description: string })[];

/* 5단계 · 게스트 공간 (API step 5) */

export const RENTAL_SPACE_TYPES = ["onePrivateRoom", "other"] as const;
export type RentalSpaceType = (typeof RENTAL_SPACE_TYPES)[number];

export const RENTAL_SPACE_TYPE_OPTIONS = [
  {
    value: "onePrivateRoom",
    label: "방 1개 사용",
    description: "입주자 전용 방 1개를 제공합니다.",
  },
  { value: "other", label: "기타(직접 입력하기)", description: "" },
] as const satisfies readonly (SelectOption<RentalSpaceType> & { description: string })[];

export const PRIVATE_ROOM_SIZES = ["small", "medium", "large", "unknown"] as const;
export type PrivateRoomSize = (typeof PRIVATE_ROOM_SIZES)[number];

export const PRIVATE_ROOM_SIZE_LABEL: Record<PrivateRoomSize, string> = {
  small: "작은 방",
  medium: "보통 방",
  large: "큰 방",
  unknown: "잘 모르겠어요",
};

export const PRIVATE_ROOM_SIZE_OPTIONS = toOptions(PRIVATE_ROOM_SIZES, PRIVATE_ROOM_SIZE_LABEL);

export const PRIVATE_ROOM_OPTIONS_VALUES = [
  "bed",
  "desk",
  "chair",
  "airConditioner",
  "wifi",
  "doorLock",
  "wardrobe",
  "none",
] as const;
export type PrivateRoomOption = (typeof PRIVATE_ROOM_OPTIONS_VALUES)[number];

export const PRIVATE_ROOM_OPTION_LABEL: Record<PrivateRoomOption, string> = {
  bed: "침대",
  desk: "책상",
  chair: "의자",
  airConditioner: "에어컨",
  wifi: "와이파이",
  doorLock: "방문 잠금",
  wardrobe: "옷장",
  none: "없음",
};

export const PRIVATE_ROOM_OPTION_OPTIONS = toOptions(
  PRIVATE_ROOM_OPTIONS_VALUES,
  PRIVATE_ROOM_OPTION_LABEL,
);

/* 6단계 · 공용 시설 (API step 6) */

export const KITCHEN_USAGE_POLICIES = [
  "freeUse",
  "lightCookingOnly",
  "microwaveWaterPurifierOnly",
  "negotiable",
  "notAllowed",
] as const;
export type KitchenUsagePolicy = (typeof KITCHEN_USAGE_POLICIES)[number];

export const KITCHEN_USAGE_POLICY_LABEL: Record<KitchenUsagePolicy, string> = {
  freeUse: "자유롭게 사용 가능",
  lightCookingOnly: "간단한 조리만 가능",
  microwaveWaterPurifierOnly: "전자레인지/정수기 정도만 사용 가능",
  negotiable: "상담 후 결정",
  notAllowed: "사용 불가",
};

export const KITCHEN_USAGE_POLICY_OPTIONS = toOptions(
  KITCHEN_USAGE_POLICIES,
  KITCHEN_USAGE_POLICY_LABEL,
);

export const LIVING_ROOM_USAGE_POLICIES = [
  "freeUse",
  "sharedWithHost",
  "scheduledUseOnly",
  "restrictedUse",
  "notAllowed",
] as const;
export type LivingRoomUsagePolicy = (typeof LIVING_ROOM_USAGE_POLICIES)[number];

export const LIVING_ROOM_USAGE_POLICY_LABEL: Record<LivingRoomUsagePolicy, string> = {
  freeUse: "자유롭게 사용 가능",
  sharedWithHost: "호스트와 함께 사용 가능",
  scheduledUseOnly: "정해진 시간에만 사용 가능",
  restrictedUse: "사용 가능하지만 제한 있음",
  notAllowed: "사용 불가",
};

export const LIVING_ROOM_USAGE_POLICY_OPTIONS = toOptions(
  LIVING_ROOM_USAGE_POLICIES,
  LIVING_ROOM_USAGE_POLICY_LABEL,
);

export const WASHING_MACHINE_USAGE_POLICIES = [
  "freeUse",
  "scheduledUseOnly",
  "notifyHostBeforeUse",
  "negotiable",
  "notAllowed",
] as const;
export type WashingMachineUsagePolicy = (typeof WASHING_MACHINE_USAGE_POLICIES)[number];

export const WASHING_MACHINE_USAGE_POLICY_LABEL: Record<WashingMachineUsagePolicy, string> = {
  freeUse: "자유롭게 사용 가능",
  scheduledUseOnly: "정해진 시간에만 가능",
  notifyHostBeforeUse: "호스트에게 말하고 사용 가능",
  negotiable: "상담 후 결정",
  notAllowed: "사용 불가",
};

export const WASHING_MACHINE_USAGE_POLICY_OPTIONS = toOptions(
  WASHING_MACHINE_USAGE_POLICIES,
  WASHING_MACHINE_USAGE_POLICY_LABEL,
);

export const BATHROOM_USAGE_TYPES = [
  "tenantPrivate",
  "sharedWithHost",
  "sharedAmongTenants",
] as const;
export type BathroomUsageType = (typeof BATHROOM_USAGE_TYPES)[number];

export const BATHROOM_USAGE_TYPE_LABEL: Record<BathroomUsageType, string> = {
  tenantPrivate: "게스트 전용 화장실 있음",
  sharedWithHost: "호스트와 함께 사용",
  sharedAmongTenants: "입주자가 2명 이상이라, 하나의 화장실을 입주자끼리 함께 사용",
};

export const BATHROOM_USAGE_TYPE_OPTIONS = toOptions(
  BATHROOM_USAGE_TYPES,
  BATHROOM_USAGE_TYPE_LABEL,
);

/* 7단계 · 생활 규칙 (API step 7) */

export const VISITOR_POLICIES = ["allowed", "notAllowed", "negotiable"] as const;
export type VisitorPolicy = (typeof VISITOR_POLICIES)[number];

export const VISITOR_POLICY_LABEL: Record<VisitorPolicy, string> = {
  allowed: "가능",
  notAllowed: "불가능",
  negotiable: "협의 가능",
};

export const VISITOR_POLICY_OPTIONS = toOptions(VISITOR_POLICIES, VISITOR_POLICY_LABEL);

export const SMOKING_PREFERENCES = ["noPreference", "nonSmokerOnly"] as const;
export type SmokingPreference = (typeof SMOKING_PREFERENCES)[number];

export const SMOKING_PREFERENCE_LABEL: Record<SmokingPreference, string> = {
  noPreference: "상관없음",
  nonSmokerOnly: "비흡연자 선호",
};

export const SMOKING_PREFERENCE_OPTIONS = toOptions(SMOKING_PREFERENCES, SMOKING_PREFERENCE_LABEL);

export const PREFERRED_GENDERS = ["female", "male", "any"] as const;
export type PreferredGender = (typeof PREFERRED_GENDERS)[number];

export const PREFERRED_GENDER_LABEL: Record<PreferredGender, string> = {
  female: "여성만 가능",
  male: "남성만 가능",
  any: "성별 무관",
};

export const PREFERRED_GENDER_OPTIONS = toOptions(PREFERRED_GENDERS, PREFERRED_GENDER_LABEL);

export const ROOM_CAPACITIES = ["one", "two", "threeOrMore"] as const;
export type RoomCapacity = (typeof ROOM_CAPACITIES)[number];

export const ROOM_CAPACITY_LABEL: Record<RoomCapacity, string> = {
  one: "1명",
  two: "2명",
  threeOrMore: "3명 이상",
};

export const ROOM_CAPACITY_OPTIONS = toOptions(ROOM_CAPACITIES, ROOM_CAPACITY_LABEL);

export const INTERACTION_PREFERENCES = ["quiet", "moderateInteraction", "any"] as const;
export type InteractionPreference = (typeof INTERACTION_PREFERENCES)[number];

export const INTERACTION_PREFERENCE_LABEL: Record<InteractionPreference, string> = {
  quiet: "조용하게 지내시는 분",
  moderateInteraction: "적당히 교류하는 분",
  any: "상관없음",
};

export const INTERACTION_PREFERENCE_OPTIONS = toOptions(
  INTERACTION_PREFERENCES,
  INTERACTION_PREFERENCE_LABEL,
);

/* 11단계 · 연락처 (API step 11) */

export const PREFERRED_CONTACT_TIMES = [
  "morning",
  "afternoon",
  "lateAfternoon",
  "evening",
] as const;
export type PreferredContactTime = (typeof PREFERRED_CONTACT_TIMES)[number];

export const PREFERRED_CONTACT_TIME_LABEL: Record<PreferredContactTime, string> = {
  morning: "오전(9시-12시)",
  afternoon: "오후(12-15시)",
  lateAfternoon: "늦은 오후(15-18시)",
  evening: "저녁(18시 이후)",
};

export const PREFERRED_CONTACT_TIME_OPTIONS = toOptions(
  PREFERRED_CONTACT_TIMES,
  PREFERRED_CONTACT_TIME_LABEL,
);

export const PREFERRED_CONTACT_METHODS = ["kakaoTalk", "phoneCall", "sms", "any"] as const;
export type PreferredContactMethod = (typeof PREFERRED_CONTACT_METHODS)[number];

export const PREFERRED_CONTACT_METHOD_LABEL: Record<PreferredContactMethod, string> = {
  kakaoTalk: "카카오톡",
  phoneCall: "전화",
  sms: "문자",
  any: "상관없음",
};

export const PREFERRED_CONTACT_METHOD_OPTIONS = toOptions(
  PREFERRED_CONTACT_METHODS,
  PREFERRED_CONTACT_METHOD_LABEL,
);
