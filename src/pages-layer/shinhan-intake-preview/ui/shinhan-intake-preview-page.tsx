import { ShinhanIntakeRoleSlot } from "@/features/shinhan-intake";
import { ShinhanIntakePreview } from "@/widgets/shinhan-intake-preview";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

export function ShinhanIntakePreviewPage() {
  const skipProps = {
    skipTarget: "#shinhan-intake-preview",
    skipLabel: "신청 공통 확인 화면으로 건너뛰기",
  };
  return (
    <div className="min-h-screen bg-grayscale-50 text-grayscale-900">
      <ShinhanIntakeRoleSlot
        host={<ShinhanServiceHeader mode="host" {...skipProps} />}
        guest={<ShinhanServiceHeader mode="guest" {...skipProps} />}
        fallback={<ShinhanServiceHeader {...skipProps} />}
      />
      <main id="shinhan-intake-preview">
        <ShinhanIntakePreview />
      </main>
      <ShinhanRoleFooter />
    </div>
  );
}
