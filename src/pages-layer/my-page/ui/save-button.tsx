export interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * 인라인 "수정완료" 버튼 (Figma: 646:26551)
 *
 * 입력 박스 오른쪽에 붙는 34px 높이 소형 CTA입니다. 공통 BtnCta의 size 목록에는
 * 없는 크기라 계정 정보 화면 안에서만 씁니다.
 */
export function SaveButton({ onClick, disabled }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[34px] items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-label-2 font-semibold whitespace-nowrap text-white transition-opacity hover:opacity-80 disabled:bg-grayscale-200 disabled:text-grayscale-400 disabled:hover:opacity-100"
    >
      수정완료
    </button>
  );
}
