/**
 * 앱 라우트 경로 모음
 *
 * TODO: 고객센터 등 미구현 라우트는 페이지 추가 시 함께 갱신하세요.
 */
export const ROUTES = {
  home: "/",
  /** 서비스 소개 — 홈에서 Host/Guest를 고르면 각 상세 소개로 들어갑니다. */
  intro: {
    root: "/",
    /** 집주인용 서비스 소개 */
    host: "/intro/host",
    /** 세입자용 서비스 소개 */
    guest: "/intro/guest",
  },
  support: "/support",
  auth: {
    /** 로그인 / 회원가입 */
    login: "/login",
    /**
     * 카카오 로그인 시작 (BFF Route Handler)
     *
     * SPA 라우터가 아니라 브라우저 전체 이동으로 열어야 합니다.
     * fetch로 호출하면 카카오 인증 화면으로 이동할 수 없습니다.
     */
    kakaoStart: "/auth/kakao",
    /** 로그아웃 (POST) */
    logout: "/api/auth/logout",
    /** 회원 탈퇴 (DELETE, BFF Route Handler) */
    account: "/api/auth/account",
    /** 약관 동의 (카카오 인증 직후) */
    terms: "/onboarding/terms",
    /** 회원 유형 선택 */
    role: "/onboarding/role",
  },
  listing: {
    /** 매물 등록 시작 (새 등록 / 임시저장 이어쓰기 선택) */
    start: "/listing/new",
    /** 사전 체크리스트 */
    checklist: "/listing/new/checklist",
    /**
     * 단계별 등록 폼 (1~10)
     *
     * 초안 ID를 URL에 실어야 새로고침·뒤로가기·이어쓰기에서 같은 초안으로 돌아옵니다.
     */
    step: (step: number, draftId?: string) =>
      draftId
        ? `/listing/new/steps/${step}?draftId=${encodeURIComponent(draftId)}`
        : `/listing/new/steps/${step}`,
    /** 등록 요청 완료 */
    complete: "/listing/new/complete",
    /** 내 방 관리 */
    manage: "/listing/manage",
  },
  /** 마이페이지 — 헤더 프로필·모바일 사이드바에서 진입 */
  myPage: "/mypage",
  /** 계정 정보 */
  accountInfo: "/mypage/account",
  /** 알림 설정 */
  notificationSettings: "/mypage/notifications",
  /** 정산 대금 입금계좌 등록·수정 (집주인 전용, 마이페이지 정산 정보에서 진입) */
  settlementAccount: "/mypage/settlement-account",
  rooms: "/rooms",
  /** 매물 상세 */
  roomDetail: (roomId: string) => `/rooms/${roomId}`,
  /** 집주인 정보 — 매물 상세의 "집주인 정보" 카드에서 진입 */
  roomHost: (roomId: string) => `/rooms/${roomId}/host`,
  reservations: "/reservations",
  favorites: "/favorites",
} as const;
