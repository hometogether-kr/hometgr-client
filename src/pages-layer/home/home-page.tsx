import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { SiteLayout } from "@/widgets/site-layout";

const IC_CHEVRON = "/figma/ic-chevron-4aebc6c0.svg";

interface AudiencePanelProps {
  role: string;
  title: string[];
  description: string[];
  ctaLabel: string;
  href: string;
  className?: string;
}

function LearnMoreLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <Link
        href={href}
        className="inline-flex h-14 w-40 items-center justify-center rounded-lg bg-white px-4 text-label-1 font-bold text-primary-500 shadow-[0_4px_2px_0_var(--color-grayscale-500)] transition-opacity hover:opacity-80 md:h-20 md:w-[200px] md:text-[24px] md:leading-[34px] md:[letter-spacing:0]"
      >
        {label}
      </Link>
      <span
        className="mt-[14px] flex h-3 w-[21px] items-center justify-center md:mt-[27px]"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG 에셋을 원본 그대로 렌더링합니다 */}
        <img src={IC_CHEVRON} alt="" className="block h-1.5 w-[10.5px] max-w-none" />
      </span>
    </div>
  );
}

function AudiencePanel({
  role,
  title,
  description,
  ctaLabel,
  href,
  className,
}: AudiencePanelProps) {
  return (
    <article
      className={[
        "relative flex min-h-[520px] flex-col items-center px-5 py-14 text-center md:min-h-[964px] md:px-8 md:pt-[142px] md:pb-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-[22px] leading-8 font-bold [letter-spacing:0] text-primary-500 md:text-[26px] md:leading-9">
        {role}
      </p>
      <h1 className="mt-7 text-[32px] leading-[46px] font-bold [letter-spacing:0] text-grayscale-900 md:mt-[27px] md:text-[56px] md:leading-[90px]">
        {title.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>
      <p className="mt-12 text-[24px] leading-[40px] font-semibold [letter-spacing:0] text-grayscale-800 md:mt-[134px] md:text-[40px] md:leading-[70px]">
        {description.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      <div className="mt-14 md:mt-[86px]">
        <LearnMoreLink href={href} label={ctaLabel} />
      </div>
    </article>
  );
}

/**
 * 서비스 소개 홈 (Figma node 92:1056)
 *
 * Figma 원본은 1920×1024 한 프레임에 상단 GNB(60px)와 좌우 Host/Guest 소개를
 * 담고 있어, 본문 세로 값은 GNB를 뺀 964px 기준입니다. GNB·푸터는 프로젝트 공통
 * 위젯을 재사용합니다.
 */
export function HomePage() {
  return (
    <SiteLayout background="white">
      <section className="relative isolate overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[220px]" />
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-0 hidden w-1/2 bg-grayscale-50 md:block"
          aria-hidden="true"
        />
        <div className="relative grid md:grid-cols-2">
          <AudiencePanel
            role="Host"
            title={["거주하는 댁에", "비어있는 방이 있으신가요?"]}
            description={["밥 챙겨주지 않아도 되는", "하숙으로 제태크 시작하세요!"]}
            ctaLabel="더 알아보기"
            href={ROUTES.intro.host}
            className="bg-grayscale-50 md:bg-transparent"
          />
          <AudiencePanel
            role="Guest"
            title={["집을", "구하고 계신가요?"]}
            description={["원룸보다 저렴하게", "아파트에서 거주하세요!"]}
            ctaLabel="더 알아보기"
            href={ROUTES.intro.guest}
            className="bg-white"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
