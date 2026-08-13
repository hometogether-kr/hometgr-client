import { BtnCta } from "@/shared/ui/btn-cta";

export type RoomListEmptyVariant = "all" | "filtered";

interface RoomListEmptyProps {
  variant: RoomListEmptyVariant;
  /** `filtered`에서 "필터 초기화" CTA를 누르면 호출 */
  onReset?: () => void;
}

interface EmptyContent {
  /* 일러스트는 장식이므로 alt="". 의미는 아래 텍스트가 전달합니다. */
  illustration: string;
  title: string;
  description: string;
}

// TODO(design): 빈 상태 일러스트는 기존 자산으로 임시 대체했습니다. Figma 노드
// 1067:44871(전체 없음) · 1067:44189(조건 불일치)를 Figma 연결 환경에서
// `pnpm assets:sync`로 내려받아 교체하세요.
const CONTENT: Record<RoomListEmptyVariant, EmptyContent> = {
  all: {
    illustration: "/figma/illust-house-7712687f.svg",
    title: "등록된 매물이 없어요",
    description: "곧 새로운 매물이 등록될 거예요.",
  },
  filtered: {
    illustration: "/figma/illust-new-4017aefc.svg",
    title: "조건에 맞는 집을 찾지 못했어요",
    description: "지역이나 가격 조건을 조금 넓혀 보세요.",
  },
};

/**
 * 매물 목록 빈 상태 (설계 §2)
 *
 * `all`: 필터·검색 없이 결과 0. `filtered`: 필터·검색이 있는데 결과 0 → 초기화 CTA.
 * 필터 UI는 B~D에서 붙으므로 A에서는 `all`만 실제로 나타납니다.
 */
export function RoomListEmpty({ variant, onReset }: RoomListEmptyProps) {
  const content = CONTENT[variant];

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- 장식용 정적 SVG, 최적화 불필요 */}
      <img src={content.illustration} alt="" width={120} height={120} />
      <div className="flex flex-col gap-2">
        <p className="text-heading-2 font-medium text-grayscale-900">{content.title}</p>
        <p className="text-body-1 text-grayscale-500">{content.description}</p>
      </div>
      {variant === "filtered" && (
        <BtnCta variant="default" size="m" className="mt-2" onClick={onReset}>
          필터 초기화
        </BtnCta>
      )}
    </div>
  );
}
