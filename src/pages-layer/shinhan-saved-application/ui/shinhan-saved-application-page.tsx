import Link from "next/link";

import { ShinhanIntakeRoleSlot } from "@/features/shinhan-intake";
import {
  GUEST_CONCERNS,
  GuestFollowupNotice,
  GuestGuideCard,
  GuestReceiptIntroduction,
} from "@/widgets/shinhan-guest-followup";
import { ShinhanGuestSpaceExamples } from "@/widgets/shinhan-guest-intake";
import {
  HOST_CONCERNS,
  HostIntroductionFrame,
  HostResultFrame,
} from "@/widgets/shinhan-host-followup";
import {
  SavedApplicationSummary,
  SavedGuestCompletionFrame,
  SavedHomeLink,
  SavedHostIncome,
  SavedHostIntroductionActions,
  SavedHostIntroductionFrame,
  SavedHostRegistrationFrame,
  SavedHostResultActions,
  SavedNavigationButton,
  ShinhanSavedApplicationFlow,
} from "@/widgets/shinhan-saved-application";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

export function ShinhanSavedApplicationPage() {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanIntakeRoleSlot
        host={
          <ShinhanServiceHeader
            mode="host"
            skipTarget="#shinhan-saved-application"
            skipLabel="저장된 신청으로 건너뛰기"
          />
        }
        guest={
          <ShinhanServiceHeader
            mode="guest"
            skipTarget="#shinhan-saved-application"
            skipLabel="저장된 신청으로 건너뛰기"
          />
        }
        fallback={
          <ShinhanServiceHeader
            skipTarget="#shinhan-saved-application"
            skipLabel="신청 안내로 건너뛰기"
          />
        }
      />
      <main id="shinhan-saved-application">
        <ShinhanSavedApplicationFlow
          hostRegistration={
            <SavedHostRegistrationFrame
              summary={<SavedApplicationSummary />}
              actions={<SavedHomeLink role="host" />}
            />
          }
          hostResult={
            <HostResultFrame income={<SavedHostIncome />}>
              <SavedHostResultActions />
            </HostResultFrame>
          }
          hostIntroduction={
            <HostIntroductionFrame>
              <SavedHostIntroductionActions />
            </HostIntroductionFrame>
          }
          hostIntroComplete={
            <SavedHostIntroductionFrame
              actions={
                <Link
                  href="/shinhan/host"
                  className="flex min-h-16 w-full items-center justify-center rounded-[14px] bg-primary-500 px-5 py-4 text-xl font-bold text-white hover:opacity-80 max-md:min-h-13 max-md:text-base"
                >
                  확인
                </Link>
              }
            />
          }
          guestBudgetComplete={
            <SavedGuestCompletionFrame
              applicationType="GUEST_BUDGET"
              summary={<SavedApplicationSummary />}
              actions={
                <div className="grid gap-3">
                  <SavedNavigationButton step="concerns">
                    걱정되는 점 선택하기
                  </SavedNavigationButton>
                  <SavedNavigationButton step="examples" variant="secondary">
                    ← 공간 사진 다시 보기
                  </SavedNavigationButton>
                </div>
              }
            />
          }
          guestDemandComplete={
            <SavedGuestCompletionFrame
              applicationType="GUEST_DEMAND"
              summary={<SavedApplicationSummary />}
              actions={
                <SavedNavigationButton step="concerns">
                  걱정되는 점 선택하기 →
                </SavedNavigationButton>
              }
            />
          }
          guideCards={GUEST_CONCERNS.map(({ code }) => ({
            code,
            content: <GuestGuideCard key={code} code={code} />,
          }))}
          guestNotice={
            <GuestFollowupNotice>
              <SavedNavigationButton step="receipt">내 신청 내역 확인하기</SavedNavigationButton>
            </GuestFollowupNotice>
          }
          guestReceiptIntroduction={<GuestReceiptIntroduction />}
          examples={<ShinhanGuestSpaceExamples />}
          hostConcerns={HOST_CONCERNS}
          guestConcerns={GUEST_CONCERNS}
        />
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}
