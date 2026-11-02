"use client";

import type { ComponentType } from "react";

import { useDraftFormValues } from "@/features/save-listing-draft";
import { ChipNormal } from "@/shared/ui/chip-normal";
import { TextArea } from "@/shared/ui/text-area";

import { ListingStepLayout, type ListingStepLayoutProps } from "../listing-step-layout";

const SECTIONS = [
  {
    key: "room",
    title: "1. 입주자가 사용할 방",
    description:
      "학생들에게 보여지는 설명입니다. 방의 특징, 제공 시설, 주변 환경을 자세히 적어주세요. 실제 제공하는 내용만 작성해주세요.",
    tags: ["#조용해요", "#햇빛이 잘 들어요", "#깨끗해요", "#공부·업무하기 좋아요"],
    placeholder:
      "예) 방에는 침대와 책상, 옷장이 있으며 창문으로 오전 햇빛이 들어옵니다. 주방과 세탁기는 함께 사용할 수 있고 집 근처에는 편의점과 마트가 있습니다. 공부하기 좋은 시간대와 제공하는 가구, 이용 가능한 공간을 자세히 소개해주세요.",
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
  presentation?: "registration" | "management";
  onChange?: (values: ListingStep9Values) => void;
  Layout?: ComponentType<ListingStepLayoutProps>;
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
  presentation = "registration",
  Layout = ListingStepLayout,
  onChange,
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep9PageProps) {
  const { values: texts, update } = useDraftFormValues(initialValues, onChange);

  const appendTag = (key: keyof typeof SECTION_FIELD, tag: string) => {
    const field = SECTION_FIELD[key];

    const current = texts[field];
    if (current.includes(tag)) return;
    const next = current ? current + " " + tag : tag;
    if (next.length <= 2000) update({ [field]: next });
  };

  return (
    <Layout
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
              <h2 className="w-full text-lg leading-[1.4] font-semibold tracking-[-0.18px] text-grayscale-900">
                {section.title}
              </h2>
              <p className="w-full text-sm leading-[1.4] font-medium text-grayscale-600">
                {presentation === "management" && section.key === "room"
                  ? "입주자가 사용할 방의 분위기와 장단점을 알려주세요."
                  : section.description}
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
                aria-label={section.title}
                maxLength={2000}
                showCount
                className="w-full"
                placeholder={
                  presentation === "management"
                    ? {
                        room: "예) 조용하고 깨끗한 방입니다.",
                        residents:
                          "예) 집주인인 저는 작은 공방을 운영하고 있으며, 부부가 살고 있습니다.",
                        rules: "예) 실내 흡연은 불가하며, 밤 시간에는 조용히 지내주시면 좋습니다.",
                      }[section.key]
                    : section.placeholder
                }
                value={texts[SECTION_FIELD[section.key]]}
                onChange={(e) => update({ [SECTION_FIELD[section.key]]: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
