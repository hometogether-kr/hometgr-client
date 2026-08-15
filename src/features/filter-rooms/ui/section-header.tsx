import { Icon } from "@/shared/ui/icons";

interface SectionHeaderProps {
  title: string;
  /** 제목 요소 id — 하위 입력 그룹의 aria-labelledby로 연결 */
  titleId: string;
  /**
   * 이 섹션 조건이 하나라도 설정돼 있는지.
   * 초기화는 값이 없어도 항상 노출되므로(D2) 렌더에는 쓰지 않습니다 — 섹션 리워크(step 7)에서
   * 제거 예정인 호출부 호환용 prop입니다.
   */
  canReset?: boolean;
  /** 초기화 버튼 라벨. 섹션별로 "지역 초기화"·"날짜 초기화" 등 (D3). 기본 "초기화" */
  resetLabel?: string;
  /** 해당 섹션만 초기화 */
  onReset: () => void;
}

/**
 * 필터 섹션 헤더 — 제목 + 섹션별 초기화 (설계 §6.4의 "초기화 두 층" 중 안쪽)
 *
 * 칩 바의 "전체 초기화"와 달리 이건 primary-600, 해당 섹션 조건만 비웁니다. Figma에 비활성
 * 변형이 없어 값이 없어도 항상 노출합니다(D2). 제목은 아래 입력 그룹이 `aria-labelledby`로
 * 참조하며, 색은 G800 · Heading 2 Medium입니다(D1).
 */
export function SectionHeader({
  title,
  titleId,
  resetLabel = "초기화",
  onReset,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p id={titleId} className="text-heading-2 font-medium text-grayscale-800">
        {title}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-label-1 leading-normal font-medium text-primary-600 transition-colors hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Icon name="refresh" size={16} aria-hidden />
        {resetLabel}
      </button>
    </div>
  );
}