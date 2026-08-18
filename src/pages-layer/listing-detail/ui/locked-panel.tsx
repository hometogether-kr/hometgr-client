import { BtnCta } from "@/shared/ui/btn-cta";

const IC_LOCK_OPEN = "/figma/ic-lock-open-f9856e6c.svg";

export interface LockedPanelProps {
  message: string;
  ctaLabel: string;
  onRequireLogin: () => void;
}

/**
 * 비회원 잠금 안내 (Figma: 가격 및 계약 조건 / 위치안내 잠금 상태, node 1141:28247 · 1220:28361)
 *
 * 자물쇠 아이콘 + 안내 문구 + CTA로 구성되며, CTA는 로그인 모달을 엽니다.
 */
export function LockedPanel({ message, ctaLabel, onRequireLogin }: LockedPanelProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 rounded-xl bg-grayscale-50 pt-9 pb-10">
      <div className="flex flex-col items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */}
        <img alt="" src={IC_LOCK_OPEN} className="block size-8 max-w-none" />
        <p className="text-center text-heading-2 font-semibold text-grayscale-800">{message}</p>
      </div>
      <BtnCta variant="emphasize" size="s" onClick={onRequireLogin}>
        {ctaLabel}
      </BtnCta>
    </div>
  );
}
