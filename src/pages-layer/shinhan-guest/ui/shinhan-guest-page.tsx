import {
  ShinhanGuestBudgetPrompt,
  ShinhanGuestEmpathy,
  ShinhanGuestFaq,
  ShinhanGuestFinalCallToAction,
  ShinhanGuestHero,
  ShinhanGuestHostBand,
  ShinhanGuestRegions,
  ShinhanGuestReviews,
  ShinhanGuestService,
  ShinhanGuestSpaces,
} from "@/widgets/shinhan-guest-content";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

export function ShinhanGuestPage() {
  return (
    <div className="bg-white pb-[calc(104px+env(safe-area-inset-bottom))] text-grayscale-900 md:pb-0">
      <ShinhanServiceHeader mode="guest" />
      <main id="service-introduction" aria-label="홈투게더 게스트 서비스 소개">
        <ShinhanGuestHero />
        <ShinhanGuestEmpathy />
        <ShinhanGuestSpaces />
        <ShinhanGuestRegions />
        <ShinhanGuestService />
        <ShinhanGuestHostBand />
        <ShinhanGuestReviews />
        <ShinhanGuestFinalCallToAction />
        <ShinhanGuestFaq />
      </main>
      <ShinhanRoleFooter />
      <ShinhanGuestBudgetPrompt />
    </div>
  );
}
