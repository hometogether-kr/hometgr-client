import { ShinhanHostFollowup } from "@/widgets/shinhan-host-followup";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

export function ShinhanHostFollowupPage() {
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanServiceHeader
        mode="host"
        skipTarget="#shinhan-host-followup"
        skipLabel="호스트 수익·안내로 건너뛰기"
      />
      <main id="shinhan-host-followup">
        <p className="mx-5 mt-6 rounded-xl bg-primary-50 px-5 py-3 text-sm leading-6 text-grayscale-700 min-[1160px]:mx-auto min-[1160px]:max-w-[1120px]">
          개발용 화면 미리보기입니다. 수익은 API 계약의 고정 예시이며 입력하신 조건의 실제 계산
          결과가 아닙니다. 견적·걱정·소개서 신청은 저장·전송되지 않습니다. 작성 내용은 이 탭에서만
          유지되며 새로고침하면 초기화됩니다.
        </p>
        <ShinhanHostFollowup />
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}
