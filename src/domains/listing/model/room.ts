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

export interface RoomHost {
  id: string;
  name: string;
  isVerified: boolean;
  responseRatePercent: number;
  /** "2022년 5월" 처럼 화면에 바로 쓰는 표시용 가입일 */
  joinedLabel: string;
  livesWithGuests: boolean;
  introduction: string;
  contactVerified: boolean;
  selfRegistered: boolean;
  hometogetherVerified: boolean;
}

export interface RoomHousehold {
  residentCount: number;
  residentTypeLabel: string;
  genderCompositionLabel: string;
}

export interface RoomDetail {
  id: string;
  title: string;
  addressRegion: string;
  /** "상세 주소는 방문 예약 확정 후 공개됩니다" — 회원 여부와 무관하게 항상 노출 */
  addressDisclosureNote: string;
  /** "역삼동 · 강남역 도보 5분" — 집주인 정보 페이지의 매물 요약 카드용 짧은 위치 표기 */
  locationSummary: string;
  price: RoomPrice;
  buildingTypeLabel: string;
  areaPyeong: number;
  floor: number;
  moveInLabel: string;
  parkingLabel: string;
  petPolicyLabel: string;
  description: string;
  amenities: string[];
  photos: RoomPhoto[];
  mapImageUrl: string;
  locationNote: string;
  household: RoomHousehold;
  host: RoomHost;
}
