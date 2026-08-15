import { Icon } from "@/shared/ui/icons";

interface SectionHeaderProps {
  title: string;
  /** 제목 요소 id — 하위 입력 그룹의 aria-labelledby로 연결 */
  titleId: string;
  /** 이 섹션 조건이 하나라도 설정돼 있는지 (초기화 노출 여부) */
  canReset: boolean;
  /** 해당 섹션만 초기화 */
  onReset: () => void;
}

/**
 * 필터 섹션 헤더 — 제목 + 섹션별 초기화 (설계 §6.4의 "초기화 두 층" 중 안쪽)
 *
 * 칩 바의 "전체 초기화"(grayscale-400)와 달리 이건 primary-600, 해당 섹션 조건만
 * 비웁니다. 제목은 아래 입력 그룹이 `aria-labelledby`로 참조합니다.
 */
export function SectionHeader({ title, titleId, canReset, onReset }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p id={titleId} className="text-heading-2 font-medium text-grayscale-900">
        {title}
      </p>
      {canReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-0.5 text-label-1 font-medium text-primary-600 transition-colors hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Icon name="refresh" size={16} aria-hidden />
          초기화
        </button>
      )}
    </div>
  );
}