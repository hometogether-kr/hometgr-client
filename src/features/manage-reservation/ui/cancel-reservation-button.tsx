"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";
import { useToast } from "@/shared/ui/toast";

export interface CancelReservationButtonProps {
  className?: string;
}

/**
 * 예약 취소 버튼 + 확인 모달 (Figma 5.1.1 사이드 패널의 "예약 취소")
 *
 * 백엔드 연동 전이라 확인 시 성공 토스트를 띄우고 예약 목록으로 돌아갑니다.
 * 실제 취소 요청은 이 자리에서 호출하게 됩니다.
 */
export function CancelReservationButton({ className }: CancelReservationButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);

  const confirmCancel = () => {
    setOpen(false);
    showToast("예약을 취소했어요.", { variant: "success" });
    router.push(ROUTES.reservations);
  };

  return (
    <>
      <BtnCta variant="emphasize" size="xl" className={className} onClick={() => setOpen(true)}>
        예약 취소
      </BtnCta>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="예약을 취소할까요?"
        footer={
          <div className="flex gap-3">
            <BtnCta
              variant="stroke"
              size="l"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              닫기
            </BtnCta>
            <BtnCta variant="emphasize" size="l" className="flex-1" onClick={confirmCancel}>
              예약 취소
            </BtnCta>
          </div>
        }
      >
        <p className="text-body-2 text-grayscale-600">
          취소하면 이 방문 일정이 사라져요. 다시 방문하려면 매물에서 예약을 새로
          신청해야 합니다.
        </p>
      </Modal>
    </>
  );
}
