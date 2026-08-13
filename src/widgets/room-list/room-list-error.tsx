import { BtnCta } from "@/shared/ui/btn-cta";

interface RoomListErrorProps {
  /** QueryErrorBoundary가 주는 리셋 — 누르면 실제 refetch로 이어집니다 */
  reset: () => void;
}

/**
 * 매물 목록 조회 실패 폴백 (설계 §2 `error`)
 *
 * "다시 시도"는 `QueryErrorBoundary`의 리셋과 연결돼 있어 Suspense 훅이 다시 걸리며
 * 실제 refetch가 일어납니다.
 */
export function RoomListError({ reset }: RoomListErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-heading-2 font-medium text-grayscale-900">매물을 불러오지 못했어요</p>
        <p className="text-body-1 text-grayscale-500">잠시 후 다시 시도해 주세요.</p>
      </div>
      <BtnCta variant="default" size="m" onClick={reset}>
        다시 시도
      </BtnCta>
    </div>
  );
}
