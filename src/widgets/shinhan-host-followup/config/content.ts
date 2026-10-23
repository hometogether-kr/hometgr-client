import type { HostConcernCode } from "@/features/shinhan-intake";

interface HostConcernContent {
  code: HostConcernCode;
  title: string;
  description: string;
}

export const HOST_CONCERNS = [
  {
    code: "YOUNG_PERSON",
    title: "어떤 청년이 올지 걱정돼요",
    description: "어떤 사람인지 먼저 알고 싶어요",
  },
  {
    code: "LIFESTYLE",
    title: "생활 습관이 다를까 봐 걱정돼요",
    description: "수면 시간, 청소 습관이 중요해요",
  },
  {
    code: "PRIVACY",
    title: "내 공간과 사생활이 중요해요",
    description: "서로의 생활을 존중하며 지내고 싶어요",
  },
  {
    code: "RENT_MANAGEMENT",
    title: "월세와 집 관리가 걱정돼요",
    description: "비용과 집 사용 규칙을 정하고 싶어요",
  },
  {
    code: "PROCESS",
    title: "처음이라 절차가 막막해요",
    description: "준비할 것부터 차근차근 알고 싶어요",
  },
  {
    code: "UNSURE",
    title: "아직 잘 모르겠어요",
    description: "소개를 보면서 천천히 생각해 볼게요",
  },
] satisfies readonly HostConcernContent[];
