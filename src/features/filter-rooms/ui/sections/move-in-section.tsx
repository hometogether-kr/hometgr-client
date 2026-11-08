"use client";

import Image from "next/image";
import { useId } from "react";

import { Calendar } from "@/shared/ui/calendar";

import type { RoomFilter } from "../../model/room-filter";
import { SectionHeader } from "../section-header";

interface SectionProps {
  draft: RoomFilter;
  patch: (partial: Partial<RoomFilter>) => void;
}

function FilterCalendarChevron({
  orientation,
}: {
  orientation?: "left" | "right" | "up" | "down";
}) {
  return (
    <Image
      src={
        orientation === "left"
          ? "/figma/filter-calendar-previous.svg"
          : "/figma/filter-calendar-next.svg"
      }
      width={40}
      height={40}
      alt=""
    />
  );
}

/** "YYYY-MM-DD" → Date. 로컬 타임존 기준으로 조립합니다. */
function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Date → "YYYY-MM-DD". toISOString()은 UTC 변환으로 하루 밀릴 수 있어 로컬 필드로 조립(§6.7) */
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 입주 희망일 (단일 날짜) — Calendar는 Date를 주고받으므로 문자열 어댑터를 둡니다(§6.7) */
export function MoveInSection({ draft, patch }: SectionProps) {
  const titleId = useId();
  return (
    <div>
      <SectionHeader
        title="입주 가능한 날짜 선택"
        titleId={titleId}
        resetLabel="날짜 초기화"
        canReset={draft.moveInDate !== null}
        onReset={() => patch({ moveInDate: null })}
      />
      <div aria-labelledby={titleId}>
        <Calendar
          className="relative max-w-[486px]"
          components={{ Chevron: FilterCalendarChevron }}
          classNames={{
            nav: "absolute inset-x-4 top-4 flex h-[57px] items-center justify-between",
            button_previous:
              "flex size-14 items-center justify-center rounded-lg hover:bg-grayscale-100 focus-visible:outline-2 focus-visible:outline-primary-500",
            button_next:
              "flex size-14 items-center justify-center rounded-lg hover:bg-grayscale-100 focus-visible:outline-2 focus-visible:outline-primary-500",
            month_caption: "flex h-[57px] items-center justify-center px-14",
          }}
          mode="single"
          selected={toDate(draft.moveInDate)}
          onSelect={(date) => patch({ moveInDate: date ? toIsoDate(date) : null })}
        />
      </div>
    </div>
  );
}
