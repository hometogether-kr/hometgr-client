import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * globals.css의 `--text-*` 토큰 이름
 *
 * tailwind-merge는 `text-*`가 글자 크기인지 색인지 이름만 보고 구분하므로,
 * 커스텀 크기를 등록하지 않으면 `text-body-1 text-grayscale-600`을 같은 그룹으로
 * 보고 앞의 크기를 지워버립니다.
 *
 * 색상(`--color-*`)은 tailwind-merge가 임의의 이름을 허용해 등록이 필요 없습니다.
 */
const FONT_SIZES = [
  "display-1",
  "display-2",
  "display-3",
  "title-1",
  "title-2",
  "title-3",
  "heading-1",
  "heading-2",
  "headline-1",
  "headline-2",
  "body-1",
  "body-2",
  "label-1",
  "label-2",
  "caption-1",
  "caption-2",
];

/** globals.css의 `--shadow-*` 토큰 이름 */
const SHADOWS = ["toast", "dropdown"];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: FONT_SIZES,
      shadow: SHADOWS,
    },
  },
});

/**
 * Tailwind 클래스 병합
 *
 * clsx가 조건부 클래스를 조립하고, tailwind-merge가 뒤에 온 클래스와 충돌하는
 * 앞쪽 클래스를 제거합니다. 문자열을 그냥 이어 붙이면 어느 쪽이 이길지는 클래스
 * 순서가 아니라 Tailwind의 CSS 출력 순서가 정하기 때문에, className으로 스타일을
 * 덮어쓸 수 있는 컴포넌트는 반드시 이 함수를 쓰세요.
 *
 * ```ts
 * cn("bg-primary-500 text-white", "bg-grayscale-200") // → "text-white bg-grayscale-200"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
