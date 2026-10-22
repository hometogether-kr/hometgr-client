import type { GuestConcernCode } from "@/features/shinhan-intake";

interface GuestConcernContent {
  code: GuestConcernCode;
  title: string;
  description: string;
  category: string;
  guideTitle: string;
  guideBody: string;
}

export const GUEST_CONCERNS = [
  {
    code: "PRIVACY",
    title: "혼자 쉴 공간이 필요해요",
    description: "개인방과 사생활이 잘 지켜질지 궁금해요",
    category: "사생활",
    guideTitle: "개인 공간과 사용 범위를 안내해요",
    guideBody: "개인방 잠금장치와 집주인의 출입 범위,\n함께 쓰는 공간을 확인해 안내할게요.",
  },
  {
    code: "HOST_RELATIONSHIP",
    title: "집주인과 함께 사는 게 낯설어요",
    description: "어떤 분인지, 편하게 지낼 수 있을지 궁금해요",
    category: "집주인과의 관계",
    guideTitle: "집주인 소개를 먼저 전해드려요",
    guideBody: "집주인 소개와 평소 생활 패턴을 확인해\n어떤 분과 함께 지내게 될지 안내할게요.",
  },
  {
    code: "HOUSE_RULES",
    title: "생활 규칙이 엄격할까 걱정돼요",
    description: "귀가 시간·친구 방문·주방 이용이 궁금해요",
    category: "생활 규칙",
    guideTitle: "생활 규칙을 미리 안내해요",
    guideBody: "귀가 시간, 친구 방문, 주방·세탁기 이용 등\n함께 지낼 때의 생활 규칙을 안내할게요.",
  },
  {
    code: "CLEANING_NOISE",
    title: "청소나 소음으로 불편할까 걱정돼요",
    description: "공용 공간 관리와 서로의 생활 시간이 궁금해요",
    category: "청소와 소음",
    guideTitle: "공용 공간의 약속을 확인해요",
    guideBody: "청소 분담과 소음에 주의할 시간대,\n불편한 점이 생겼을 때의 연락 방법을 확인할게요.",
  },
  {
    code: "COST_CONTRACT",
    title: "추가 비용과 계약이 걱정돼요",
    description: "관리비·보증금·중도 퇴실 조건을 확인하고 싶어요",
    category: "비용과 계약",
    guideTitle: "비용과 계약 조건을 정리해요",
    guideBody: "월세·관리비·공과금과 보증금,\n계약 기간과 중도 퇴실 조건을 확인해 안내할게요.",
  },
  {
    code: "GETTING_STARTED",
    title: "아직 잘 모르겠어요",
    description: "홈쉐어링이 어떻게 진행되는지 먼저 알고 싶어요",
    category: "처음 시작하는 홈셰어링",
    guideTitle: "먼저 보고 천천히 결정하세요",
    guideBody: "방 정보와 집주인 소개, 생활 규칙을 먼저 보고\n마음에 들면 집을 둘러보세요.",
  },
] satisfies readonly GuestConcernContent[];
