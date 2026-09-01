"use client";

import { useState } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { Icon } from "@/shared/ui/icons";
import { useToast } from "@/shared/ui/toast";

import type { VisitDateOption } from "../model/visit-request.types";
import { useVisitSelection } from "../model/use-visit-selection";
import { DateStrip } from "./date-strip";
import { SelectedVisitSlots } from "./selected-visit-slots";
import { TimeSlotGrid } from "./time-slot-grid";

export interface VisitSlotPickerProps {
  dateOptions: VisitDateOption[];
}

export function VisitSlotPicker({ dateOptions }: VisitSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.date ?? "");
  const { showToast } = useToast();
  const { maxVisitTimes, selectedVisitTimes, selectionMessage, toggleVisitTime, removeVisitTime } =
    useVisitSelection();
  const selectedDateOption = dateOptions.find((option) => option.date === selectedDate);

  const handleSubmit = () => {
    if (selectedVisitTimes.length === 0) return;
    showToast("방문 예약 요청은 API 연동 후 전송할 수 있어요.", { variant: "info" });
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="rounded-[20px] bg-white p-5 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-headline-1 font-bold text-grayscale-900 md:text-title-3">
            방문 희망 시간
          </h2>
          <span className="text-body-1 font-bold text-primary-500" aria-live="polite">
            {selectedVisitTimes.length}/{maxVisitTimes}
          </span>
        </div>

        <div className="mt-5 min-h-9">
          <SelectedVisitSlots selectedVisitTimes={selectedVisitTimes} onRemove={removeVisitTime} />
        </div>

        <div className="my-6 h-px bg-grayscale-200 md:my-8" />

        <div className="space-y-4">
          <h3 className="text-body-1 font-semibold text-grayscale-800">날짜를 선택해 주세요</h3>
          <DateStrip
            dates={dateOptions}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        <div className="mt-7 space-y-4">
          <h3 className="text-body-1 font-semibold text-grayscale-800">시간을 선택해 주세요</h3>
          <TimeSlotGrid
            slots={selectedDateOption?.slots ?? []}
            selectedVisitTimes={selectedVisitTimes}
            onSlotToggle={toggleVisitTime}
          />
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-grayscale-70 p-4 text-label-1 text-grayscale-600">
          <Icon name="info" size={20} className="mt-0.5 shrink-0 text-primary-500" />
          <p>호스트가 일정을 확인할 수 있도록 가능한 시간을 최대 3개 선택해 주세요.</p>
        </div>
        <p className="sr-only" aria-live="assertive">
          {selectionMessage}
        </p>
      </section>

      <BtnCta
        size="l"
        className="w-full md:ml-auto md:flex md:w-[280px]"
        disabled={selectedVisitTimes.length === 0}
        onClick={handleSubmit}
      >
        방문 예약 요청하기
      </BtnCta>
    </div>
  );
}
