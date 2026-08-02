import { ROUTES } from "@/shared/config";
import { GnbMobile } from "@/widgets/gnb-mobile";
import { Navigation } from "@/widgets/navigation";
import { ResumeDraftCard } from "./resume-draft-card";
import { StartLinkCard } from "./start-card";

/**
 * TODO: 아래 일러스트는 7일 후 만료되는 Figma 임시 URL입니다.
 * export해 public/에 커밋한 뒤 next/image로 교체하세요.
 */
const FIGMA_TEMP_ILLUST_NEW = "/figma/illust-new-4017aefc.svg";
const FIGMA_TEMP_ILLUST_DRAFT =
  "/figma/illust-draft-b4228895.svg";

/* eslint-disable @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */

/**
 * 매물 등록 시작 (Figma: 등록 시작, node 420:6593 · 538:18748)
 *
 * 임시저장 카드만 초안을 조회해야 해서 클라이언트 컴포넌트로 분리했습니다.
 */
export function ListingStartPage() {
  return (
    <div className="min-h-screen bg-white md:bg-grayscale-50">
      <div className="md:hidden">
        <GnbMobile variant="logo" />
      </div>
      <div className="hidden md:block">
        <Navigation />
      </div>
      <main className="flex justify-center px-5 py-8 md:px-[200px] md:py-20">
        <div className="flex w-full flex-col items-start gap-6 md:w-[1180px] md:gap-20">
          <header className="flex w-full flex-col items-start gap-3 md:w-[729px] md:gap-4">
            <div className="flex w-full flex-col items-start gap-2">
              <p className="whitespace-nowrap text-sm font-semibold leading-[1.4] text-primary-600 md:text-2xl md:tracking-[-0.24px]">
                Host
              </p>
              <h1 className="w-full text-[22px] font-semibold leading-[1.4] tracking-[-0.22px] text-grayscale-900 md:text-[40px] md:leading-[1.3] md:tracking-[-0.8px]">
                매물 등록을 단계별로 바로 시작할 수 있어요.
              </h1>
            </div>
            <p className="w-full text-sm font-medium leading-[1.5] text-grayscale-600 md:text-xl md:leading-[1.4] md:tracking-[-0.2px]">
              직접 등록이 어려운 경우, 소유자의 동의를 받은 가족이나 보호자가 대신 등록할 수 있어요.
            </p>
          </header>
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
            <StartLinkCard
              title="새 매물 등록하기"
              description="주소, 가격, 사진, 방문일정을 처음부터 등록"
              href={ROUTES.listing.checklist}
              illustration={
                <img
                  alt=""
                  src={FIGMA_TEMP_ILLUST_NEW}
                  className="absolute inset-0 block size-full max-w-none object-contain"
                />
              }
            />
            <ResumeDraftCard
              illustration={
                <img
                  alt=""
                  src={FIGMA_TEMP_ILLUST_DRAFT}
                  className="absolute inset-0 block size-full max-w-none object-contain"
                />
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
