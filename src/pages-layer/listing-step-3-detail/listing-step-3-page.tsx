"use client";

import { useState } from "react";

import {
  AREA_RANGE_OPTIONS,
  type AreaRange,
  PARKING_TYPE_OPTIONS,
  type ParkingType,
  RESIDENT_GENDER_COMPOSITION_OPTIONS,
  RESIDENT_TYPE_OPTIONS,
  type ResidentGenderComposition,
  type ResidentType,
} from "@/domains/listing-draft";
import { ChipField } from "@/shared/ui/chip-field";
import { Counter } from "@/shared/ui/counter";
import { Radio } from "@/shared/ui/radio";
import { TextArea } from "@/shared/ui/text-area";
import { Toast, ToastViewport } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

/** 있음/없음, 가능/불가능처럼 boolean을 칩으로 고르는 선택지 */
const YES_NO_OPTIONS = [
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
] as const;

const PARKING_OPTIONS = [
  { value: "yes", label: "가능" },
  { value: "no", label: "불가능" },
] as const;

type YesNo = "yes" | "no";

const REQUIRED_MESSAGE = "필수 항목입니다.";
const COUNT_MESSAGE = "집 전체 방 개수, 거주 중인 인원(집주인 포함)은 1이상으로 선택해야합니다.";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="w-full pt-3 text-[13px] leading-[1.4] font-medium text-system-error">{message}</p>
  );
}

export interface ListingStep3Values {
  areaRange: AreaRange;
  totalRoomCount: number;
  residentCount: number;
  residentType: ResidentType;
  residentGenderComposition: ResidentGenderComposition;
  elevatorAvailable: boolean;
  parkingAvailable: boolean;
  /** 주차 가능일 때만 채웁니다. */
  parkingType: ParkingType | null;
  /** 주차 부가 설명(선택). 비어 있으면 null */
  parkingDescription: string | null;
}

export interface ListingStep3InitialValues {
  areaRange: AreaRange | null;
  totalRoomCount: number;
  residentCount: number;
  residentType: ResidentType | null;
  residentGenderComposition: ResidentGenderComposition | null;
  elevatorAvailable: boolean | null;
  parkingAvailable: boolean | null;
  parkingType: ParkingType | null;
  parkingDescription: string;
}

const EMPTY_VALUES: ListingStep3InitialValues = {
  areaRange: null,
  totalRoomCount: 0,
  residentCount: 0,
  residentType: null,
  residentGenderComposition: null,
  elevatorAvailable: null,
  parkingAvailable: null,
  parkingType: null,
  parkingDescription: "",
};

export interface ListingStep3PageProps {
  initialValues?: ListingStep3InitialValues;
  onPrev?: () => void;
  onNext?: (values: ListingStep3Values) => void;
  isSaving?: boolean;
}

function toYesNo(value: boolean | null): YesNo | null {
  return value === null ? null : value ? "yes" : "no";
}

/**
 * 3단계 · 상세 정보 (Figma: node 424:12972 · 420:6750 · 424:14261)
 *
 * - "주차 → 가능" 선택 시 세부 라디오 확장
 * - 다음으로 클릭 시 필드별 에러 + 상단 토스트
 */
export function ListingStep3Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep3PageProps) {
  const [areaRange, setAreaRange] = useState<AreaRange | null>(initialValues.areaRange);
  const [rooms, setRooms] = useState(initialValues.totalRoomCount);
  const [residents, setResidents] = useState(initialValues.residentCount);
  const [residentType, setResidentType] = useState<ResidentType | null>(initialValues.residentType);
  const [genderComposition, setGenderComposition] = useState<ResidentGenderComposition | null>(
    initialValues.residentGenderComposition,
  );
  const [elevator, setElevator] = useState<YesNo | null>(toYesNo(initialValues.elevatorAvailable));
  const [parking, setParking] = useState<YesNo | null>(toYesNo(initialValues.parkingAvailable));
  const [parkingKind, setParkingKind] = useState<ParkingType | null>(initialValues.parkingType);
  const [parkingNote, setParkingNote] = useState(initialValues.parkingDescription);
  const [submitted, setSubmitted] = useState(false);

  const parkingAvailable = parking === "yes";

  const errors = {
    areaRange: !areaRange ? REQUIRED_MESSAGE : undefined,
    counts: rooms < 1 || residents < 1 ? COUNT_MESSAGE : undefined,
    residentType: !residentType ? REQUIRED_MESSAGE : undefined,
    genderComposition: !genderComposition ? REQUIRED_MESSAGE : undefined,
    elevator: !elevator ? REQUIRED_MESSAGE : undefined,
    parking: !parking ? REQUIRED_MESSAGE : undefined,
    parkingKind: parkingAvailable && !parkingKind ? REQUIRED_MESSAGE : undefined,
  };
  const hasError = Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (submitted ? errors[key] : undefined);

  const handleNext = () => {
    setSubmitted(true);
    if (hasError) return;

    // 위 검증을 통과하면 필수 값이 모두 채워져 있지만, 타입 좁히기를 위해 한 번 더 확인합니다.
    if (!areaRange || !residentType || !genderComposition || !elevator || !parking) return;

    const note = parkingNote.trim();

    onNext?.({
      areaRange,
      totalRoomCount: rooms,
      residentCount: residents,
      residentType,
      residentGenderComposition: genderComposition,
      elevatorAvailable: elevator === "yes",
      parkingAvailable,
      // 주차가 불가능하면 서버가 두 필드를 아예 받지 않습니다.
      parkingType: parkingAvailable ? parkingKind : null,
      parkingDescription: parkingAvailable && note ? note : null,
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
        step={3}
        title="집 전체 정보를 알려주세요"
        description="집 전체의 크기와 구조를 대략적으로 알려주세요."
        onPrev={onPrev}
        onNext={handleNext}
        nextDisabled={isSaving}
        autoSaving={isSaving}
      >
        <div className="flex w-full flex-col gap-9">
          <ChipField
            label="집 평수"
            options={AREA_RANGE_OPTIONS}
            value={areaRange}
            onChange={setAreaRange}
            error={show("areaRange")}
          />
          <div className="flex w-full flex-col">
            <div className="flex flex-wrap items-start gap-8 md:gap-12">
              <Counter label="집 전체 방 개수" value={rooms} onChange={setRooms} />
              <Counter
                label="거주 중인 인원(집주인 포함)"
                value={residents}
                onChange={setResidents}
              />
            </div>
            <FieldError message={show("counts")} />
          </div>
          <ChipField
            label="현재 거주 형태"
            options={RESIDENT_TYPE_OPTIONS}
            value={residentType}
            onChange={setResidentType}
            error={show("residentType")}
          />
          <ChipField
            label="거주 중인 인원 성별"
            options={RESIDENT_GENDER_COMPOSITION_OPTIONS}
            value={genderComposition}
            onChange={setGenderComposition}
            error={show("genderComposition")}
          />
          <ChipField
            label="엘리베이터"
            options={YES_NO_OPTIONS}
            value={elevator}
            onChange={setElevator}
            error={show("elevator")}
          />
          <div className="flex w-full flex-col gap-4">
            <ChipField
              label="주차"
              options={PARKING_OPTIONS}
              value={parking}
              onChange={setParking}
              error={show("parking")}
            />
            {parkingAvailable && (
              <div className="flex flex-col gap-4">
                {PARKING_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <Radio
                      size="24"
                      name="parkingKind"
                      value={option.value}
                      checked={parkingKind === option.value}
                      onChange={() => setParkingKind(option.value)}
                    />
                    <span className="flex flex-col justify-center gap-1 whitespace-nowrap">
                      <span className="text-base leading-[1.6] font-semibold text-grayscale-700">
                        {option.label}
                      </span>
                      <span className="text-[13px] leading-[1.5] font-medium text-grayscale-500">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
                <FieldError message={show("parkingKind")} />
                <TextArea
                  label="주차 부가 설명 (선택)"
                  size="l"
                  className="w-full"
                  placeholder={
                    "주차 관련 안내 사항을 입력해 주세요.\n예) 1일 주차요금은 15,000원입니다 · 최대 2대 주차 가능하며, 사전 등록이 필요합니다."
                  }
                  value={parkingNote}
                  onChange={(e) => setParkingNote(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </ListingStepLayout>
    </>
  );
}
