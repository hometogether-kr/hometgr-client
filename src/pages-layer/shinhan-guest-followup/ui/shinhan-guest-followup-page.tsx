import { ShinhanGuestFollowup } from "@/widgets/shinhan-guest-followup";
import { ShinhanGuestSpaceExamples } from "@/widgets/shinhan-guest-intake";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

export function ShinhanGuestFollowupPage() {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanServiceHeader
        mode="guest"
        skipTarget="#shinhan-guest-followup"
        skipLabel="신청 후 안내로 건너뛰기"
      />
      <main id="shinhan-guest-followup">
        <p className="mx-5 mt-6 rounded-xl bg-primary-50 px-5 py-3 text-sm leading-6 text-grayscale-700 min-[1160px]:mx-auto min-[1160px]:max-w-[1120px]">
          개발용 신청 후 화면 미리보기입니다. 실제로 접수되거나 저장된 신청이 아닙니다. 걱정
          선택·동의·연락처는 이 탭에서만 유지되며 전송하거나 알림을 보내지 않습니다. 새로고침하면
          초기화됩니다.
        </p>
        <ShinhanGuestFollowup examples={<ShinhanGuestSpaceExamples />} />
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}
