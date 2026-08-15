"use client";

import { DayPicker } from "@daypicker/react";
import { ko } from "@daypicker/react/locale";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

export type CalendarProps = ComponentProps<typeof DayPicker>;

/**
 * 캘린더 (Figma: 필터_방문예약, node 1299:38833)
 *
 * react-day-picker(@daypicker/react) v10을 프로젝트 디자인 토큰으로 감쌉니다.
 * 기본 스타일시트(@daypicker/react/style.css)는 불러오지 않고 classNames를 직접
 * 지정해, Tailwind 레이어와 섞이지 않도록 했습니다.
 *
 * mode가 그대로 전달되므로 단일·범위 선택 모두 사용할 수 있습니다.
 *
 * ```tsx
 * <Calendar mode="single" selected={date} onSelect={setDate} />
 * <Calendar mode="range" selected={range} onSelect={setRange} />
 * ```
 *
 * 셀은 flex-1 + aspect-square라 컨테이너 폭을 따라갑니다. Figma의 64px 셀은
 * 492px 모달 기준 값이고, 모바일에서는 자동으로 줄어듭니다.
 *
 * Figma에는 단일 선택 상태만 있어 범위 선택(range_start·middle·end)은
 * 선택 색(primary-500)과 연한 배경(primary-100)으로 확장해 정의했습니다.
 */
export function Calendar({ className, classNames, ...rest }: CalendarProps) {
  return (
    <DayPicker
      locale={ko}
      showOutsideDays
      className={cn("w-full rounded-lg p-4", className)}
      classNames={{
        root: "w-full",
        months: "flex w-full flex-col",
        month: "flex w-full flex-col",

        nav: "flex w-full items-center justify-between",
        button_previous:
          "flex size-10 items-center justify-center rounded border-0 bg-transparent text-grayscale-800 transition-colors hover:bg-grayscale-100 disabled:text-grayscale-300 disabled:hover:bg-transparent",
        button_next:
          "flex size-10 items-center justify-center rounded border-0 bg-transparent text-grayscale-800 transition-colors hover:bg-grayscale-100 disabled:text-grayscale-300 disabled:hover:bg-transparent",
        chevron: "size-4 fill-current",

        month_caption: "flex items-center justify-center p-2.5",
        caption_label: "text-heading-2 font-medium text-grayscale-800",

        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday:
          "flex h-12 flex-1 items-center justify-center text-label-1 font-normal text-grayscale-400 md:text-headline-1",
        weeks: "flex w-full flex-col",
        week: "flex w-full",

        day: "flex aspect-square flex-1 items-center justify-center p-0",
        day_button:
          "flex size-full items-center justify-center rounded-full border-0 bg-transparent text-body-1 font-normal text-grayscale-900 transition-colors hover:bg-grayscale-100 md:text-heading-2",

        hidden: "invisible",

        ...classNames,
      }}
      /*
       * 상태 스타일은 modifiersClassNames로 모읍니다. 여기 클래스는 날짜 칸(day)에
       * 붙으므로, 실제 버튼 모양은 [&>button]: 로 안쪽 DayButton을 겨냥합니다.
       */
      modifiersClassNames={{
        today: "[&>button]:font-semibold [&>button]:text-primary-500",
        selected:
          "[&>button]:bg-primary-500 [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-primary-600",
        range_start: "rounded-l-full bg-primary-100",
        range_end: "rounded-r-full bg-primary-100",
        range_middle:
          "bg-primary-100 [&>button]:bg-transparent [&>button]:font-medium [&>button]:text-grayscale-900 [&>button]:hover:bg-primary-200",
        outside: "[&>button]:text-grayscale-300",
        disabled:
          "[&>button]:cursor-not-allowed [&>button]:text-grayscale-300 [&>button]:hover:bg-transparent",
      }}
      {...rest}
    />
  );
}
