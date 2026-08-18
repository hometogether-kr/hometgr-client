export interface RoomPrice {
  depositKrw: number;
  monthlyRentKrw: number;
  maintenanceFeeKrw: number;
}

export interface RoomPhoto {
  id: string;
  url: string;
  alt: string;
}

/**
 * 백엔드 공개 상세 응답(`GET /rooms/:id`)의 host 요약이 `{ name, createdAt }`뿐이라
 * 신원인증·응답률·소개·홈투게더 검수 배지 등은 아직 내려오지 않는다. 없는 데이터를
 * 화면에서 만들어내지 않기 위해 실제로 채울 수 있는 필드만 남겼다.
 */
export interface RoomHost {
  id: string | null;
  name: string | null;
  /** "2022년 5월" 처럼 화면에 바로 쓰는 표시용 가입일 */
  joinedLabel: string;
}

export interface RoomHousehold {
  residentCount: number;
  residentTypeLabel: string;
  genderCompositionLabel: string;
}

export interface RoomDetail {
  id: string;
  /**
   * v2 등록 플로우엔 제목 입력 단계 자체가 없고, 비회원 미리보기 응답에도
   * 제목이 내려오지 않는다. 그런 경우 건물 유형·위치로 표시용 제목을 만든다.
   */
  title: string;
  addressRegion: string | null;
  /** "상세 주소는 방문 예약 확정 후 공개됩니다" — 회원 여부와 무관하게 항상 노출 */
  addressDisclosureNote: string;
  /** 집주인 정보 페이지의 매물 요약 카드용 짧은 위치 표기 */
  locationSummary: string;
  price: RoomPrice;
  buildingTypeLabel: string;
  /** 정확한 평수 대신 서버가 주는 방 크기 구간("작은 방" 등)을 그대로 노출한다 */
  roomSizeLabel: string;
  /** 신규 등록(v2) 매물은 층수를 수집하지 않아 값이 없을 수 있다 */
  floor?: number;
  moveInLabel: string;
  parkingLabel: string;
  petPolicyLabel: string;
  description: string;
  amenities: string[];
  photos: RoomPhoto[];
  locationNote: string;
  /** 레거시 매물은 household 정보 자체가 없다 */
  household?: RoomHousehold;
  host: RoomHost;
}
