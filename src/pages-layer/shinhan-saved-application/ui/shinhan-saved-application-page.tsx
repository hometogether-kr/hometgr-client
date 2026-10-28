import Link from "next/link";

import { ShinhanIntakeRoleSlot } from "@/features/shinhan-intake";
import { ShinhanGuestSpaceExamples } from "@/widgets/shinhan-guest-intake";
import { HostIntroductionFrame, HostResultFrame } from "@/widgets/shinhan-host-followup";
import {
  SavedApplicationSummary,
  SavedGuestCompletionFrame,
  SavedHomeLink,
  SavedHostIncome,
  SavedHostIntroductionActions,
  SavedHostIntroductionFrame,
  SavedHostRegistrationFrame,
  SavedHostResultActions,
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
          guestExamples={<ShinhanGuestSpaceExamples />}
          guestBudgetComplete={
            <SavedGuestCompletionFrame
              applicationType="GUEST_BUDGET"
              summary={<SavedApplicationSummary />}
              actions={<SavedHomeLink role="guest" />}
            />
          }
          guestDemandComplete={
            <SavedGuestCompletionFrame
              applicationType="GUEST_DEMAND"
              summary={<SavedApplicationSummary />}
              actions={<SavedHomeLink role="guest" />}
            />
          }
        />
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}
