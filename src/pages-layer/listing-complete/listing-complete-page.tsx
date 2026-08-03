import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Navigation } from "@/widgets/navigation";

const IC_SUCCESS = "/icons/ic-success.svg";

const NEXT_STEPS = [
  {
    title: "담당자가 입력 내용 확인",
    description: "매물 정보의 정확성과 가독성을 위해 상세히 검토합니다.",
  },
  {
    title: "필요한 경우 수정 요청",
    description:
      "추가 사진이나 확인이 필요한 정보가 있을 경우 가입하신 번호로 연락을 드릴 수 있습니다.",
  },
  {
    title: "검수 완료 후 매물 페이지 등록",
    description: "모든 검수가 끝나면 홈투게더 홈페이지에 공식적으로 노출됩니다.",
  },
];

/**
 * 매물 등록 완료 (Figma: 호스트 매물 등록 메인, node 420:7312)
 *
 * - 딤 배경 위 620px 카드
 */
export function ListingCompletePage() {
  return (
    <div className="min-h-screen bg-grayscale-50">
      <Navigation />
      <div className="flex min-h-[calc(100vh-52px)] items-start justify-center px-5 py-8 md:bg-black/40 md:px-4 md:py-[143px]">
        <div className="w-full rounded-[20px] bg-white md:w-[620px] md:px-16 md:py-12">
          <div className="flex flex-col items-center gap-6">
            <Image
              src={IC_SUCCESS}
              alt=""
              width={80}
              height={80}
              className="size-20"
              aria-hidden="true"
            />
            <h1 className="text-center text-2xl leading-[1.4] font-semibold tracking-[-0.24px] text-grayscale-900">
              매물 등록 요청이 완료되었습니다
            </h1>
            <p className="w-full text-center text-sm leading-[1.5] font-medium text-grayscale-600">
              정성껏 작성해주신 소중한 정보가 안전하게 접수되었습니다. 담당자가 확인 후 영업일 기준
              24시간 이내에 연락드릴 예정입니다. 검수 이전에는 세입자에게 공개되지 않으니, 부족한
              내용이 있더라도 걱정하지 마세요!
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-grayscale-70 px-6 py-4">
            <h2 className="text-lg leading-[1.4] font-semibold tracking-[-0.18px] text-grayscale-900">
              향후 진행 과정
            </h2>
            <ol className="mt-5 flex flex-col gap-5">
              {NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-base leading-[1.4] font-semibold text-grayscale-700">
                    {index + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-base leading-[1.4] font-semibold text-grayscale-800">
                      {step.title}
                    </span>
                    <span className="text-sm leading-[1.5] font-medium text-grayscale-600">
                      {step.description}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 md:flex-row">
            <Link href={ROUTES.home} className="w-full md:w-auto">
              <BtnCta variant="stroke" size="m" className="h-11 w-full md:w-[196px]">
                홈으로 가기
              </BtnCta>
            </Link>
            {/* TODO: 신청 내역 라우트가 정해지면 교체하세요. */}
            <Link href={ROUTES.listing.manage} className="w-full md:w-auto">
              <BtnCta size="m" className="h-11 w-full md:w-[196px]">
                신청 내역 보러가기
              </BtnCta>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
