"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";
import { useToast } from "@/shared/ui/toast";

import { useCancelReservation } from "../model/use-cancel-reservation";

export interface CancelReservationButtonProps {
  reservationId: string;
  className?: string;
}

/**
 * 예약 취소 버튼 + 확인 모달 (Figma 5.1.1 사이드 패널의 "예약 취소")
 *
 * 확인 시 예약 취소 API를 호출하고 성공한 경우에만 목록으로 돌아갑니다.
 */
export function CancelReservationButton({
  reservationId,
  className,
}: CancelReservationButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { cancelReservation, isCancelling } = useCancelReservation();
  const [open, setOpen] = useState(false);

  const confirmCancel = async () => {
    try {
      await cancelReservation(reservationId);
      setOpen(false);
      showToast("예약을 취소했어요.", { variant: "success" });
      router.push(ROUTES.reservations);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "예약을 취소하지 못했어요.", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <BtnCta variant="emphasize" size="xl" className={className} onClick={() => setOpen(true)}>
        예약 취소
      </BtnCta>
      <Modal
        open={open}
        onClose={() => {
          if (!isCancelling) setOpen(false);
        }}
        title="예약을 취소할까요?"
        footer={
          <div className="flex gap-3">
            <BtnCta
              variant="stroke"
              size="l"
              className="flex-1"
              disabled={isCancelling}
              onClick={() => setOpen(false)}
            >
              닫기
            </BtnCta>
            <BtnCta
              variant="emphasize"
              size="l"
              className="flex-1"
              loading={isCancelling}
              onClick={() => void confirmCancel()}
            >
              {isCancelling ? "취소 중..." : "예약 취소"}
            </BtnCta>
          </div>
        }
      >
        <p className="text-body-2 text-grayscale-600">
          취소하면 이 방문 일정이 사라져요. 다시 방문하려면 매물에서 예약을 새로 신청해야 합니다.
        </p>
      </Modal>
    </>
  );
}
