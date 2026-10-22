import type { ReactNode } from "react";

import { GUEST_CONCERNS } from "../config/content";
import {
  GuestFollowupBrand,
  GuestFollowupNotice,
  GuestGuideCard,
  GuestReceiptIntroduction,
} from "./followup-presentation";
import {
  GuestFollowupNavigationButton,
  ShinhanGuestFollowupFlow,
} from "./shinhan-guest-followup-flow";

export function ShinhanGuestFollowup({ examples }: { examples: ReactNode }) {
  return (
    <ShinhanGuestFollowupFlow
      guideCards={GUEST_CONCERNS.map(({ code }) => ({
        code,
        content: <GuestGuideCard key={code} code={code} />,
      }))}
      notice={
        <GuestFollowupNotice>
          <GuestFollowupNavigationButton step="receipt">
            내 신청 내역 확인하기
          </GuestFollowupNavigationButton>
        </GuestFollowupNotice>
      }
      receiptIntroduction={<GuestReceiptIntroduction />}
      brand={<GuestFollowupBrand />}
      examples={examples}
    />
  );
}
