import {
  ShinhanHostBenefits,
  ShinhanHostChecklist,
  ShinhanHostCommunity,
  ShinhanHostEstimateBand,
  ShinhanHostEstimatePrompt,
  ShinhanHostFaq,
  ShinhanHostHero,
  ShinhanHostProcess,
  ShinhanHostStory,
} from "@/widgets/shinhan-host-content";
import { ShinhanRoleFooter, ShinhanServiceHeader } from "@/widgets/shinhan-shell";

export function ShinhanHostPage() {
  return (
    <div className="bg-white pb-[calc(104px+env(safe-area-inset-bottom))] text-grayscale-900 min-[1848px]:pb-0">
      <ShinhanServiceHeader mode="host" />
      <main id="service-introduction" aria-label="홈투게더 호스트 서비스 소개">
        <ShinhanHostHero />
        <ShinhanHostBenefits />
        <ShinhanHostProcess />
        <ShinhanHostCommunity />
        <ShinhanHostStory />
        <ShinhanHostEstimateBand />
        <ShinhanHostChecklist />
        <ShinhanHostFaq />
      </main>
      <ShinhanRoleFooter />
      <ShinhanHostEstimatePrompt />
    </div>
  );
}
