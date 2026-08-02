import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ChoiceCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  title: string;
  description?: string;
  /** 카드 상단 일러스트 슬롯 */
  illustration?: ReactNode;
  selected?: boolean;
}

/**
 * 일러스트가 있는 선택 카드 (Figma: 693:14204)
 *
 * - 기본: bg grayscale-50 · border 1px grayscale-200
 * - 선택: bg primary-100 · border 1.8px primary-500 · 제목 primary-600
 *
 * 컨트롤(라디오/체크박스)이 붙는 목록형 카드는 BtnCard를, 텍스트만 있는 카드는
 * SelectTile을 사용하세요.
 */
export function ChoiceCard({
  title,
  description,
  illustration,
  selected = false,
  className,
  ...rest
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        "flex w-full flex-col items-center gap-2 rounded-xl border-solid px-4 py-3 text-left transition-colors",
        selected
          ? "border-[1.8px] border-primary-500 bg-primary-100"
          : "border border-grayscale-200 bg-grayscale-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {illustration && (
        <span className="flex w-full items-center justify-center overflow-clip">
          {illustration}
        </span>
      )}
      <span
        className={[
          "w-full text-headline-2 font-semibold",
          selected ? "text-primary-600" : "text-grayscale-900",
        ].join(" ")}
      >
        {title}
      </span>
      {description && (
        <span className="w-full text-caption-1 font-medium text-grayscale-700">{description}</span>
      )}
    </button>
  );
}
