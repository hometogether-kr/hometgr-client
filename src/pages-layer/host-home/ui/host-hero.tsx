import Image from "next/image";

import { HostConsultationButton } from "@/features/request-host-consultation";

import { hostContainer } from "./section-heading";

export function HostHero() {
  return (
    <section className="overflow-hidden bg-white py-14 md:py-24 xl:py-[120px]">
      <div
        className={`${hostContainer} grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-6`}
      >
        <div className="relative z-10">
          <h1 className="text-[32px] leading-[1.4] font-light tracking-[-0.02em] text-grayscale-900 sm:text-[42px] xl:text-[54px]">
            비어 있는 <strong className="font-bold">방 한 칸,</strong>
            <br />
            <strong className="font-bold">검증된 청년</strong>으로 안심하고,
            <br />
            <strong className="font-bold">매달 생활비</strong>로 여유롭게.
          </h1>
          <p className="mt-7 text-lg leading-[1.5] font-semibold text-grayscale-500 md:text-2xl">
            방 준비부터 청년 입주, 거주 중 관리까지
            <br />
            홈투게더가 함께합니다.
          </p>
          <div className="mt-10 lg:mt-24">
            <HostConsultationButton />
          </div>
        </div>
        <Image
          src="/images/host-landing/hero.png"
          alt="비어 있는 방 한 칸을 생활비로 활용하는 집 평면도"
          width={837}
          height={730}
          preload
          className="mx-auto h-auto w-full max-w-[620px]"
          sizes="(max-width: 1023px) 90vw, 600px"
        />
      </div>
    </section>
  );
}
