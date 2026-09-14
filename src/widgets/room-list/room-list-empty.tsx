import { BtnCta } from "@/shared/ui/btn-cta";

export type RoomListEmptyVariant = "all" | "filtered";

interface RoomListEmptyProps {
  variant: RoomListEmptyVariant;
  /** `filtered`에서 "전체 매물 보기" CTA를 누르면 호출 (필터를 비워 전체 목록으로) */
  onReset?: () => void;
}

interface EmptyContent {
  /* 일러스트는 장식이므로 alt="". 의미는 아래 텍스트가 전달합니다. */
  illustration: string;
  title: string;
  description: string;
}

// TODO(design): Figma는 all·filtered 둘 다 같은 일러스트(돋보기+X, 120×120 안 119.6×113.5)를
// 씁니다(QA §6). 현재는 서로 다른 임시 자산이라 통합 대상입니다. Figma 노드 1067:44871·
// 1067:44189를 Figma 연결 환경에서 `pnpm assets:sync`로 내려받아 두 variant를 하나로 교체하세요.
const CONTENT: Record<RoomListEmptyVariant, EmptyContent> = {
  all: {
    illustration: "/figma/illust-house-7712687f.svg",
    title: "등록된 매물이 없어요",
    // TODO(design): Figma 원문이 미확정 플레이스홀더라 임시 문구입니다(QA §5-7).
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
 * `all`: 필터·검색 없이 결과 0. `filtered`: 필터·검색이 있는데 결과 0 → 전체 매물 보기 CTA.
 * 필터 UI는 B~D에서 붙으므로 A에서는 `all`만 실제로 나타납니다.
 */
export function RoomListEmpty({ variant, onReset }: RoomListEmptyProps) {
  const content = CONTENT[variant];

  return (
    <div className="flex flex-col items-center gap-7 py-34 text-center">
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- 장식용 정적 SVG, 최적화 불필요 */}
        <img src={content.illustration} alt="" width={120} height={120} />
        <p className="text-title-2 font-semibold text-grayscale-800">{content.title}</p>
        <p className="text-heading-2 font-medium text-grayscale-400">{content.description}</p>
      </div>
      {variant === "filtered" && (
        <BtnCta variant="default" size="s" onClick={onReset}>
          전체 매물 보기
        </BtnCta>
      )}
    </div>
  );
}