import { ShinhanIntakeRoleSlot, ShinhanPrivacyReturn } from "@/features/shinhan-intake";
import { ShinhanPrivacyDocument } from "@/widgets/shinhan-privacy";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

export function ShinhanPrivacyPage() {
  const skipProps = { skipTarget: "#shinhan-privacy", skipLabel: "개인정보 전문으로 건너뛰기" };
  return (
    <div className="bg-grayscale-50 text-grayscale-900">
      <ShinhanIntakeRoleSlot
        host={<ShinhanServiceHeader mode="host" {...skipProps} />}
        guest={<ShinhanServiceHeader mode="guest" {...skipProps} />}
        fallback={<ShinhanServiceHeader {...skipProps} />}
      />
      <main id="shinhan-privacy">
        <ShinhanPrivacyDocument
          topNavigation={
            <div className="flex flex-col gap-4">
              <p className="rounded-xl bg-primary-50 p-4 text-sm leading-6 text-grayscale-700">
                개발 확인용 전문입니다. Figma 원문을 표시하며, 운영 동의 승인본이나 서버의 로컬 동의
                버전과 연결되지 않았습니다. 열람만으로 동의하거나 신청이 접수되지 않습니다.
              </p>
              <div>
                <ShinhanPrivacyReturn />
              </div>
            </div>
          }
          bottomNavigation={<ShinhanPrivacyReturn />}
        />
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}
