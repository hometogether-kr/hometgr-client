/**
 * 화면 단계 ↔ API 단계
 *
 * 화면은 1~10단계로 안내하지만 서버 계약은 2~11단계입니다(1단계는 서버에 없음).
 * 이 오프셋을 페이지마다 반복하지 않도록 여기서만 변환합니다.
 */
export const SCREEN_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type ScreenStep = (typeof SCREEN_STEPS)[number];

export const API_STEPS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type ApiStep = (typeof API_STEPS)[number];

const STEP_OFFSET = 1;

export function toApiStep(screenStep: ScreenStep): ApiStep {
  return (screenStep + STEP_OFFSET) as ApiStep;
}

export function toScreenStep(apiStep: ApiStep): ScreenStep {
  return (apiStep - STEP_OFFSET) as ScreenStep;
}

export function isScreenStep(value: number): value is ScreenStep {
  return SCREEN_STEPS.includes(value as ScreenStep);
}
