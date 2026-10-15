export interface RoomPrice {
  depositKrw: number | null;
  /** 공개 API의 monthlyRentKrw 값은 만원 단위이므로 모델에서 이름을 구분합니다. */
  monthlyRentManwon: number | null;
  maintenanceFeeKrw: number | null;
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
  /** 서버에서 생성한 제목. 누락된 레거시 응답만 지역으로 대체합니다. */
  title: string;
  /** 관리자가 입력한 선택 부제목. */
  subtitle: string | null;
  addressRegion: string | null;
  /** "상세 주소는 방문 예약 확정 후 공개됩니다" — 회원 여부와 무관하게 항상 노출 */
  addressDisclosureNote: string;
  /** 집주인 정보 페이지의 매물 요약 카드용 짧은 위치 표기 */
  locationSummary: string;
  price: RoomPrice;
  buildingTypeLabel: string;
  /** 집 전체 전용면적. v2는 등록된 평수 범위를 표시한다. */
  roomSizeLabel: string;
  /** 신규 등록(v2) 매물은 층수를 수집하지 않아 값이 없을 수 있다 */
  floor?: number;
  moveInLabel: string;
  parkingLabel: string;
  petPolicyLabel: string;
  description: string;
  currentResidentsDescription?: string;
  precautions?: string;
  capacityLabel?: string;
  minStayMonths?: number;
  amenities: string[];
  photos: RoomPhoto[];
  locationNote: string;
  /** 레거시 매물은 household 정보 자체가 없다 */
  household?: RoomHousehold;
  host: RoomHost;
  /** 현재 학생의 최신 예약. 비회원·비학생이거나 예약이 없으면 null */
  latestReservation: {
    id: string;
    status: string;
  } | null;
  /** 서버가 현재 사용자와 예약 상태를 기준으로 계산한 방문 요청 가능 여부 */
  canRequestVisit: boolean;
}
