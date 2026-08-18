import type { RoomDetail } from "../model/room";

const ROOM_PHOTO = "/figma/room-photo-7451d61e.png";
const ROOM_MAP_IMAGE = "/figma/room-map-image-8a62f291.png";

const PHOTO_COUNT = 8;

/**
 * 매물 상세 목업 (Figma: 3.1/3.2 매물 상세, node 1067:44532 · 1222:45286)
 *
 * 백엔드 공개 상세 조회(`GET /rooms/:id`)가 아직 연결되지 않아 고정 데이터를
 * 반환합니다. 실제 사진 8장 대신 Figma 목업이 반복 사용한 동일 사진을 그대로
 * 재사용합니다.
 */
export const ROOM_DETAIL_FIXTURE: RoomDetail = {
  id: "room-mock-1",
  title: "역삼동 5분거리 드림아파트",
  addressRegion: "서울특별시 강남구 역삼동",
  addressDisclosureNote: "상세 주소는 방문 예약 확정 후 공개됩니다",
  locationSummary: "역삼동 · 강남역 도보 5분",
  price: {
    depositKrw: 10_000_000,
    monthlyRentKrw: 800_000,
    maintenanceFeeKrw: 150_000,
  },
  buildingTypeLabel: "아파트",
  areaPyeong: 43,
  floor: 17,
  moveInLabel: "즉시 입주 가능(협의 가능)",
  parkingLabel: "1대 가능(자주식)",
  petPolicyLabel: "협의 가능",
  description:
    "강남역 도보 10분 거리에 위치한 풀옵션 1.5룸입니다. 최근 전체 리모델링을 마쳐 내외부가 매우 깔끔하며, 남향으로 창이 나 있어 채광이 훌륭합니다.\n\n주변에 편의점, 대형 마트, 세탁소 등 생활 편의시설이 밀집해 있어 실거주하기 매우 편리합니다. 대로변 이면도로에 위치해 소음이 적고 안전합니다.",
  amenities: ["에어컨", "냉장고", "세탁기", "침대", "TV", "인터넷 / Wi-Fi", "주차장", "엘리베이터"],
  photos: Array.from({ length: PHOTO_COUNT }, (_, index) => ({
    id: `photo-${index + 1}`,
    url: ROOM_PHOTO,
    alt: `역삼동 5분거리 드림아파트 사진 ${index + 1}`,
  })),
  mapImageUrl: ROOM_MAP_IMAGE,
  locationNote: "상세 위치는 방문 예약 후 확인할 수 있습니다.",
  household: {
    residentCount: 2,
    residentTypeLabel: "가족과 함께 거주",
    genderCompositionLabel: "여성만 거주",
  },
  host: {
    id: "host-mock-1",
    name: "김투게더",
    isVerified: true,
    responseRatePercent: 85,
    joinedLabel: "2022년 5월",
    livesWithGuests: true,
    introduction:
      "안녕하세요. 평일에는 출근하고 저녁에는 조용히 쉬는 편이에요. 필요한 일이 있을 때 편하게 말씀해주시면 도와드릴게요.",
    contactVerified: true,
    selfRegistered: true,
    hometogetherVerified: true,
  },
};
