"use client";

import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";

const IC_KAKAO = "/icons/ic-kakao.svg";
const LOGO_MARK = "/figma/logo-mark-c645d4ce.svg";

export interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
}

/* eslint-disable @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */

function LogoMark() {
  return (
    <div
      aria-hidden="true"
      className="flex size-[54px] shrink-0 items-center justify-center rounded-[7px]"
      style={{
        backgroundImage:
          "linear-gradient(138deg, var(--color-primary-400) 7.5%, var(--color-primary-500) 88.9%)",
      }}
    >
      <img src={LOGO_MARK} alt="" className="block h-[23px] w-auto max-w-none" />
    </div>
  );
}

/**
 * 로그인 유도 모달 (Figma: 3.1.1 매물 상세 - 비회원 - 로그인 팝업, node 1222:39736)
 *
 * 비회원이 잠긴 정보(계약 조건·위치·예약)에 접근하려 할 때 뜹니다. 카카오로
 * 로그인하거나 "계속 둘러보기"로 닫고 매물 상세를 계속 볼 수 있습니다.
 */
export function LoginPromptModal({ open, onClose }: LoginPromptModalProps) {
  const handleKakaoLogin = () => {
    window.location.assign(ROUTES.auth.kakaoStart);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeButton="none"
      classNames={{ dialog: "md:w-[480px]", panel: "gap-8" }}
    >
      <div className="flex w-full justify-end">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex items-center p-3 transition-opacity hover:opacity-70"
        >
          <span className="flex size-5 items-center justify-center overflow-clip rounded-lg">
            <img alt="" src="/icons/ic-x-cancel.svg" className="block size-[14px] max-w-none" />
          </span>
        </button>
      </div>

      <div className="flex w-full flex-col items-center gap-5 text-center">
        <LogoMark />
        <div className="flex flex-col gap-3">
          <h2 className="text-title-2 font-semibold text-grayscale-900">로그인 후 이용하세요</h2>
          <p className="text-headline-1 font-medium text-grayscale-500">
            로그인하면 더 많은 집 정보 확인 후 방문 예약할 수 있어요.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-5">
        <div className="flex flex-col gap-3">
          <BtnCta
            variant="kakao"
            size="l"
            className="w-full"
            leftIcon={<img src={IC_KAKAO} alt="" />}
            onClick={handleKakaoLogin}
          >
            카카오로 시작하기
          </BtnCta>
          <BtnCta
            variant="stroke"
            size="l"
            className="w-full border-grayscale-300 text-grayscale-600"
            onClick={onClose}
          >
            계속 둘러보기
          </BtnCta>
        </div>
        <p className="text-center text-label-1 font-normal text-grayscale-500">
          로그인하면 현재 보고 있는 매물로 다시 돌아와요.
        </p>
      </div>
    </Modal>
  );
}
