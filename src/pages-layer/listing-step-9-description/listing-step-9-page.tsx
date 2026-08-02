"use client";

import { useState } from "react";
import { ChipNormal } from "@/shared/ui/chip-normal";
import { TextArea } from "@/shared/ui/text-area";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

const SECTIONS = [
  {
    key: "room",
    title: "1. 입주자가 사용할 방",
    description: "입주자가 사용할 방의 분위기와 장단점을 알려주세요.",
    tags: ["#조용해요", "#햇빛이 잘 들어요", "#깨끗해요", "#공부·업무하기 좋아요"],
    placeholder: "예) 조용하고 깨끗한 방입니다.",
  },
  {
    key: "residents",
    title: "2. 현재 거주원 소개",
    description: "현재 집에 거주하는 분들의 구성을 알려주세요.",
    tags: [
      "#호스트 혼자 거주",
      "#여성만 거주",
      "#남성만 거주",
      "#남녀 함께 거주",
      "#가족과 함께 거주",
    ],
    placeholder: "예) 호스트 혼자 거주하고 있습니다.",
  },
  {
    key: "rules",
    title: "3. 생활 시 주의사항",
    description: "입주자가 미리 알아야 할 생활 규칙이나 주의사항을 알려주세요.",
    tags: [
      "#실내 흡연 불가",
      "#외부인 방문 불가",
      "#밤에는 조용히",
      "#사용 후 정리 필요",
      "#반려동물 있음",
    ],
    placeholder: "예) 실내 흡연은 불가합니다.",
  },
] as const;

export interface ListingStep9PageProps {
  initialValues?: ListingStep9Values;
  onPrev?: () => void;
  onNext?: (values: ListingStep9Values) => void;
  isSaving?: boolean;
}

/** 세 섹션 모두 선택 입력이라 빈 문자열이 기본값입니다. */
export interface ListingStep9Values {
  roomDescription: string;
  currentResidentsDescription: string;
  precautions: string;
}

const EMPTY_VALUES: ListingStep9Values = {
  roomDescription: "",
  currentResidentsDescription: "",
  precautions: "",
};

/** 화면 섹션 키 → 서버 필드 */
const SECTION_FIELD = {
  room: "roomDescription",
  residents: "currentResidentsDescription",
  rules: "precautions",
} as const satisfies Record<string, keyof ListingStep9Values>;

/**
 * 9단계 · 방 설명 작성 (Figma: 호스트 매물 등록 메인, node 420:7182)
 *
 * - 섹션 3개, 각 섹션은 추천 태그 칩 + 자유 서술 textarea
 * - 태그를 누르면 해당 섹션 본문에 문구가 삽입됨
 */
export function ListingStep9Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep9PageProps) {
  const [texts, setTexts] = useState<ListingStep9Values>(initialValues);

  const appendTag = (key: keyof typeof SECTION_FIELD, tag: string) => {
    const field = SECTION_FIELD[key];

    setTexts((prev) => {
      const current = prev[field];
      if (current.includes(tag)) return prev;
      return { ...prev, [field]: current ? `${current} ${tag}` : tag };
    });
  };

  return (
    <ListingStepLayout
      step={9}
      title="추가 설명이 있다면 작성해주세요(선택)"
      onPrev={onPrev}
      onNext={() => onNext?.(texts)}
      nextDisabled={isSaving}
      autoSaving={isSaving}
    >
      <div className="flex w-full flex-col gap-12">
        {SECTIONS.map((section) => (
          <div key={section.key} className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-1">
              <h2 className="w-full text-lg font-semibold leading-[1.4] tracking-[-0.18px] text-grayscale-900">
                {section.title}
              </h2>
              <p className="w-full text-sm font-medium leading-[1.4] text-grayscale-600">
                {section.description}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3">
              <div className="flex flex-wrap items-start gap-1">
                {section.tags.map((tag) => (
                  <ChipNormal
                    key={tag}
                    shape="round"
                    size="s"
                    selected={texts[SECTION_FIELD[section.key]].includes(tag)}
                    onClick={() => appendTag(section.key, tag)}
                  >
                    {tag}
                  </ChipNormal>
                ))}
              </div>
              <TextArea
                size="l"
                className="w-full"
                placeholder={section.placeholder}
                value={texts[SECTION_FIELD[section.key]]}
                onChange={(e) =>
                  setTexts((prev) => ({ ...prev, [SECTION_FIELD[section.key]]: e.target.value }))
                }
              />
            </div>
          </div>
        ))}
      </div>
    </ListingStepLayout>
  );
}
