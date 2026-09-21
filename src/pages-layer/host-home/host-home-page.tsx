import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { SiteLayout } from "@/widgets/site-layout";

import { HostBenefits, HostSteps } from "./ui/host-benefits";
import { HostCommunity } from "./ui/host-community";
import { HostHero } from "./ui/host-hero";
import { HostHistory, HostPartners } from "./ui/host-history";
import { HostQuestions } from "./ui/host-questions";
import { hostContainer } from "./ui/section-heading";

export function HostHomePage() {
  return (
    <div className="pb-24 md:pb-0">
      <SiteLayout background="white">
        <HostHero />
        <HostBenefits />
        <HostSteps />
        <HostCommunity />
        <HostHistory />
        <HostPartners />
        <section className="bg-primary-50 py-16 text-center md:py-24">
          <div className={hostContainer}>
            <p className="mb-5 text-lg font-semibold text-primary-500">홈투게더에 방을 등록하면</p>
            <h2 className="text-[30px] leading-relaxed font-bold text-grayscale-900 md:text-[44px]">
              <span className="text-primary-500">1:1 전담 매니저가</span>
              <br />
              노하우를 안내해 드립니다
            </h2>
            <Link
              href={ROUTES.listing.start}
              className="mt-8 inline-flex min-h-[58px] items-center justify-center rounded-full bg-primary-500 px-12 py-4 text-lg font-bold text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
            >
              + 방 등록하기
            </Link>
          </div>
        </section>
        <HostQuestions />
        <Link
          href={ROUTES.listing.start}
          aria-label="홈투게더에 방 등록하기"
          className="fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 flex min-h-14 items-center gap-2 rounded-2xl border border-primary-100 bg-white px-5 py-3 text-sm font-bold text-grayscale-700 shadow-[0_4px_24px_rgba(34,125,255,0.16)] transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 md:right-8 md:bottom-8 md:h-[156px] md:w-[170px] md:flex-col md:justify-center md:gap-3 md:rounded-[28px] md:text-lg"
        >
          <span aria-hidden="true" className="text-2xl font-light text-primary-400 md:text-4xl">
            +
          </span>
          <span className="text-center">
            홈투게더에
            <span className="hidden md:block" /> 방 등록하기
          </span>
        </Link>
      </SiteLayout>
    </div>
  );
}
