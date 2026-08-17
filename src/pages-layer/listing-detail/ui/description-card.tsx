import type { ReactNode, SVGProps } from "react";

import { DetailSection } from "./detail-section";

export interface DescriptionCardProps {
  description: string;
  moveInLabel: string;
  parkingLabel: string;
  petPolicyLabel: string;
}

/**
 * 아이콘 3종 (입주 가능일 · 주차 · 반려동물)
 *
 * Figma는 각 아이콘을 여러 벡터 레이어로 내보냈지만, 24px 단색 라인 아이콘이라
 * currentColor 기반 단일 SVG로 다시 그려 유지보수를 단순화했습니다.
 */
function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" strokeLinecap="round" />
      <path d="M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M5 16.5V12l1.8-4.8A2 2 0 0 1 8.7 6h6.6a2 2 0 0 1 1.9 1.2L19 12v4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 16.5h16v2.2a1 1 0 0 1-1 1h-1.4a1 1 0 0 1-1-1V17M6.4 17v1.7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.2" />
      <circle cx="7.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M5 9c0-2.2 1.3-4 3-4 .9 0 1.7.6 2 1.5C10.3 5.6 11.1 5 12 5s1.7.6 2 1.5c.3-.9 1.1-1.5 2-1.5 1.7 0 3 1.8 3 4v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V9Z"
        strokeLinejoin="round"
      />
      <path d="M9.5 14v.01M14.5 14v.01" strokeLinecap="round" />
      <path d="M11 16.5c.4.4 1.6.4 2 0" strokeLinecap="round" />
    </svg>
  );
}

function DescriptionRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center text-grayscale-500">
          {icon}
        </span>
        <span className="text-headline-1 font-medium text-grayscale-500">{label}</span>
      </span>
      <span className="text-headline-1 font-medium text-grayscale-800">{value}</span>
    </div>
  );
}

/**
 * 상세 설명 — 회원 전용 (Figma: node 1222:45714)
 */
export function DescriptionCard({
  description,
  moveInLabel,
  parkingLabel,
  petPolicyLabel,
}: DescriptionCardProps) {
  return (
    <DetailSection title="상세 설명">
      <div className="flex flex-col gap-7">
        <p className="text-body-1 leading-[1.4] whitespace-pre-line text-grayscale-600">
          {description}
        </p>
        <div className="flex flex-col gap-4 rounded-xl bg-grayscale-50 px-8 py-6">
          <DescriptionRow icon={<CalendarIcon />} label="입주 가능일" value={moveInLabel} />
          <DescriptionRow icon={<CarIcon />} label="주차" value={parkingLabel} />
          <DescriptionRow icon={<DogIcon />} label="반려동물" value={petPolicyLabel} />
        </div>
      </div>
    </DetailSection>
  );
}
