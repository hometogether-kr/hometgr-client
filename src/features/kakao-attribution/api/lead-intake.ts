import type { KakaoLeadIntake } from "../model/lead-intake";

export class KakaoLeadIntakeRequestError extends Error {
  constructor() {
    super("문의 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    this.name = "KakaoLeadIntakeRequestError";
  }
}

export async function submitKakaoLeadIntake(input: KakaoLeadIntake): Promise<void> {
  const response = await fetch("/api/kakao/lead-intake", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) throw new KakaoLeadIntakeRequestError();
}
