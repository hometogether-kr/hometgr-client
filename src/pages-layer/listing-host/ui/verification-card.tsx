const IC_SHIELD = "/figma/ic-shield-18da6024.svg";
const IC_CHECK = "/figma/ic-check-873614b7.svg";

/* eslint-disable @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */

const CHECKLIST = [
  "호스트 연락처를 확인했어요",
  "매물 등록 권한을 확인했어요",
  "등록 내용을 검토했어요",
];

/**
 * 홈투게더 확인 사이드바 (Figma: node 1222:54639)
 */
export function VerificationCard() {
  return (
    <aside className="flex w-full flex-col gap-6 rounded-2xl bg-grayscale-70 p-7 md:w-[380px] md:shrink-0 md:p-9">
      <div className="flex items-center gap-3">
        <img alt="" src={IC_SHIELD} className="block size-8 max-w-none" />
        <p className="text-heading-1 font-bold text-grayscale-900">홈투게더 확인</p>
      </div>
      <ul className="flex flex-col gap-4">
        {CHECKLIST.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <img alt="" src={IC_CHECK} className="block size-5 max-w-none" />
            <span className="text-headline-1 font-medium text-grayscale-700">{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
