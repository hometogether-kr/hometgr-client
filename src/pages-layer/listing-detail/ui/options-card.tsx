import { DetailSection } from "./detail-section";

export interface OptionsCardProps {
  amenities: string[];
}

const IC_CHECK = "/figma/ic-check-46736b35.svg";

/**
 * 옵션 및 시설 — 회원 전용 (Figma: node 1222:45918)
 */
export function OptionsCard({ amenities }: OptionsCardProps) {
  return (
    <DetailSection title="옵션 및 시설">
      <div className="flex flex-wrap gap-x-10 gap-y-5">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- next/image는 dangerouslyAllowSVG 없이 SVG를 막습니다 */}
            <img alt="" src={IC_CHECK} className="block size-5 max-w-none" />
            <span className="text-headline-1 font-medium whitespace-nowrap text-grayscale-800">
              {amenity}
            </span>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}
