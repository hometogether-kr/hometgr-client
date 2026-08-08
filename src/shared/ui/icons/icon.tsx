import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols 아이콘 이름 (예: "menu", "close", "arrow_back") */
  name: string;
  /** 아이콘 크기(px). 지정하지 않으면 부모 요소의 font-size를 따릅니다. */
  size?: number;
  /** 채워진 형태로 표시할지 여부 (Material Symbols의 FILL 변수축) */
  filled?: boolean;
}

/**
 * Material Symbols 아이콘 폰트(app/layout.tsx에서 로드)를 렌더링합니다.
 * 색상은 currentColor를 따르므로 부모의 text-* 클래스로 지정하세요.
 */
export function Icon({
  name,
  size,
  filled = false,
  className,
  style,
  "aria-label": ariaLabel,
  ...rest
}: IconProps) {
  const iconStyle: CSSProperties = {
    ...(size ? { fontSize: size } : null),
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
    ...style,
  };

  return (
    <span
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn("material-symbols-outlined select-none", className)}
      style={iconStyle}
      {...rest}
    >
      {name}
    </span>
  );
}
