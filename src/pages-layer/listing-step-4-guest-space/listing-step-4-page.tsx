"use client";

import { useState } from "react";
import {
  PRIVATE_ROOM_OPTION_OPTIONS,
  PRIVATE_ROOM_SIZE_OPTIONS,
  type PrivateRoomOption,
  type PrivateRoomSize,
  RENTAL_SPACE_TYPE_OPTIONS,
  type RentalSpaceType,
} from "@/domains/listing-draft";
import { ChipField } from "@/shared/ui/chip-field";
import { Radio } from "@/shared/ui/radio";
import { TextField } from "@/shared/ui/text-field";
import { Toast, ToastViewport } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

const REQUIRED_MESSAGE = "필수 항목입니다.";
const OPTIONS_MESSAGE = "필수 항목입니다. (없다면 '없음' 선택)";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="w-full pl-1 pt-3 text-[13px] font-medium leading-[1.4] text-system-error">
      {message}
    </p>
  );
}

export interface ListingStep4Values {
  rentalSpaceType: RentalSpaceType;
  rentalSpaceTypeOther: string;
  privateRoomSize: PrivateRoomSize;
  privateRoomOptions: PrivateRoomOption[];
}

export interface ListingStep4InitialValues {
  rentalSpaceType: RentalSpaceType | null;
  rentalSpaceTypeOther: string;
  privateRoomSize: PrivateRoomSize | null;
  privateRoomOptions: PrivateRoomOption[];
}

const EMPTY_VALUES: ListingStep4InitialValues = {
  rentalSpaceType: null,
  rentalSpaceTypeOther: "",
  privateRoomSize: null,
  privateRoomOptions: [],
};

export interface ListingStep4PageProps {
  initialValues?: ListingStep4InitialValues;
  onPrev?: () => void;
  onNext?: (values: ListingStep4Values) => void;
  isSaving?: boolean;
}

/**
 * 4단계 · 입주자 공간 정보 (Figma: node 424:14734 · 420:6850 · 424:15422)
 *
 * - 이용 형태: 라디오. "기타" 선택 시 직접 입력 필드 노출
 * - 방 옵션: 복수선택 칩. "없음" 선택 시 나머지 해제
 */
export function ListingStep4Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep4PageProps) {
  const [usage, setUsage] = useState<RentalSpaceType | null>(initialValues.rentalSpaceType);
  const [usageEtc, setUsageEtc] = useState(initialValues.rentalSpaceTypeOther);
  const [roomSize, setRoomSize] = useState<PrivateRoomSize | null>(initialValues.privateRoomSize);
  const [options, setOptions] = useState<PrivateRoomOption[]>(initialValues.privateRoomOptions);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    usage: !usage || (usage === "other" && usageEtc.trim() === "") ? REQUIRED_MESSAGE : undefined,
    roomSize: !roomSize ? REQUIRED_MESSAGE : undefined,
    options: options.length === 0 ? OPTIONS_MESSAGE : undefined,
  };
  const hasError = Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (submitted ? errors[key] : undefined);

  const handleNext = () => {
    setSubmitted(true);
    if (hasError || !usage || !roomSize) return;

    onNext?.({
      rentalSpaceType: usage,
      rentalSpaceTypeOther: usageEtc.trim(),
      privateRoomSize: roomSize,
      privateRoomOptions: options,
    });
  };

  return (
    <>
      {submitted && hasError && (
        <ToastViewport>
          <Toast variant="error">필수항목을 모두 입력해주세요.</Toast>
        </ToastViewport>
      )}
      <ListingStepLayout
        step={4}
        eyebrow="입주자 공간 정보"
        title="입주자가 사용할 공간에 대해 알려주세요"
        description="집 전체가 아닌, 입주자가 실제로 사용할 수 있는 공간을 선택해주세요."
        onPrev={onPrev}
        onNext={handleNext}
        nextDisabled={isSaving}
        autoSaving={isSaving}
      >
        <div className="flex w-full flex-col gap-9">
          <div className="flex w-full flex-col">
            <div className="flex w-full flex-col gap-3">
              <p className="w-full text-sm font-medium leading-[1.4] text-grayscale-600">
                이용 형태
              </p>
              <div className="flex flex-col gap-3">
                {RENTAL_SPACE_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <Radio
                      size="24"
                      name="usage"
                      value={option.value}
                      checked={usage === option.value}
                      onChange={() => setUsage(option.value)}
                    />
                    <span className="flex items-center gap-2.5 whitespace-nowrap">
                      <span className="text-base font-semibold leading-[1.4] text-grayscale-700">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-[13px] font-medium leading-[1.5] text-grayscale-500">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
                {usage === "other" && (
                  <TextField
                    placeholder="입력해주세요"
                    size="L"
                    className="w-full"
                    value={usageEtc}
                    onChange={(e) => setUsageEtc(e.target.value)}
                  />
                )}
              </div>
            </div>
            <FieldError message={show("usage")} />
          </div>
          <ChipField
            label="입주자 방 크기"
            options={PRIVATE_ROOM_SIZE_OPTIONS}
            value={roomSize}
            onChange={setRoomSize}
            error={show("roomSize")}
          />
          {/* 복수 선택은 props 유니온 때문에 값 타입이 추론되지 않아 명시합니다. */}
          <ChipField<PrivateRoomOption>
            label="방 옵션 (복수선택 가능)"
            options={PRIVATE_ROOM_OPTION_OPTIONS}
            multiple
            exclusiveOption="none"
            value={options}
            onChange={setOptions}
            error={show("options")}
          />
        </div>
      </ListingStepLayout>
    </>
  );
}
