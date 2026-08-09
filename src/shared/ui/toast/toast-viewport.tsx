import type { ReactNode } from "react";

export interface ToastViewportProps {
  children: ReactNode;
}

/**
 * 화면 상단 중앙 토스트 영역
 *
 * - 모바일: 좌우 20px 여백 안에서 전체 폭 (Figma 335px)
 * - 데스크톱: 내용 폭 그대로 중앙 정렬
 */
export function ToastViewport({ children }: ToastViewportProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[42px] z-50 flex justify-center px-5 md:px-0">
      <div className="pointer-events-auto flex w-full justify-center md:w-fit">{children}</div>
    </div>
  );
}
