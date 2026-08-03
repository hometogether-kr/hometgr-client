"use client";

import { useState } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { Calendar } from "@/shared/ui/calendar";
import { Modal } from "@/shared/ui/modal";
import { useToast } from "@/shared/ui/toast";

export interface VisitRequestModalProps {
  open: boolean;
  onClose: () => void;
  /** 예약 신청 제출 */
  onSubmit?: (date: Date) => void;
  /** 예약할 수 없는 날짜 (호스트가 막아둔 날 등) */
  disabledDates?: Date[];
}

/** 오늘 00:00 — 지난 날짜를 막는 기준 */
function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * 방문 예약 신청 모달 (Figma: 1299:38833)
 *
 * 단일 날짜를 고르고 예약을 신청합니다. 오늘 이전 날짜는 선택할 수 없습니다.
 */
export function VisitRequestModal({
  open,
  onClose,
  onSubmit,
  disabledDates = [],
}: VisitRequestModalProps) {
  const [selected, setSelected] = useState<Date | undefined>();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!selected) {
      showToast("방문할 날짜를 선택해주세요", { variant: "error" });
      return;
    }
    onSubmit?.(selected);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="방문 예약 신청"
      footer={
        <BtnCta size="l" aria-disabled={!selected} className="w-full" onClick={handleSubmit}>
          예약 신청
        </BtnCta>
      }
    >
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        disabled={[{ before: startOfToday() }, ...disabledDates]}
        startMonth={startOfToday()}
      />
    </Modal>
  );
}
