"use client";

import { useState } from "react";

import {
  BATHROOM_USAGE_TYPE_OPTIONS,
  type BathroomUsageType,
  KITCHEN_USAGE_POLICY_OPTIONS,
  type KitchenUsagePolicy,
  LIVING_ROOM_USAGE_POLICY_OPTIONS,
  type LivingRoomUsagePolicy,
  WASHING_MACHINE_USAGE_POLICY_OPTIONS,
  type WashingMachineUsagePolicy,
} from "@/domains/listing-draft";
import type { ChipOption } from "@/shared/ui/chip-field";
import { Radio } from "@/shared/ui/radio";
import { SelectTile } from "@/shared/ui/select-tile";
import { TextArea } from "@/shared/ui/text-area";
import { useToast } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

const REQUIRED_MESSAGE = "필수 항목입니다.";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="w-full pt-3 pl-1 text-[13px] leading-[1.4] font-medium text-system-error">
      {message}
    </p>
  );
}

interface FacilityCardProps<TValue extends string> {
  label: string;
  options: readonly ChipOption<TValue>[];
  value: TValue | null;
  onChange: (value: TValue) => void;
  error?: string;
}

/** 선택 타일 5개를 2·2·1 그리드로 배치한 카드 (Figma: node 426:15809) */
function FacilityCard<TValue extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: FacilityCardProps<TValue>) {
  const renderTile = (option: ChipOption<TValue>) => (
    <SelectTile
      key={option.value}
      selected={value === option.value}
      onClick={() => onChange(option.value)}
    >
      {option.label}
    </SelectTile>
  );

  return (
    <div className="flex w-full flex-col rounded-2xl border border-grayscale-200 bg-white p-6">
      <div className="flex flex-col gap-3">
        <p className="pl-1 text-base leading-[1.5] font-semibold text-grayscale-800">{label}</p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 md:flex-row">
            {options.slice(0, 2).map(renderTile)}
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            {options.slice(2, 4).map(renderTile)}
          </div>
          <div className="flex w-full gap-2 md:w-[calc(50%-4px)]">
            {options.slice(4, 5).map(renderTile)}
          </div>
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export interface ListingStep5Values {
  kitchenUsagePolicy: KitchenUsagePolicy;
  livingRoomUsagePolicy: LivingRoomUsagePolicy;
  washingMachineUsagePolicy: WashingMachineUsagePolicy;
  bathroomUsageType: BathroomUsageType;
  bathroomDescription: string;
}

export interface ListingStep5InitialValues {
  kitchenUsagePolicy: KitchenUsagePolicy | null;
  livingRoomUsagePolicy: LivingRoomUsagePolicy | null;
  washingMachineUsagePolicy: WashingMachineUsagePolicy | null;
  bathroomUsageType: BathroomUsageType | null;
  bathroomDescription: string;
}

const EMPTY_VALUES: ListingStep5InitialValues = {
  kitchenUsagePolicy: null,
  livingRoomUsagePolicy: null,
  washingMachineUsagePolicy: null,
  bathroomUsageType: null,
  bathroomDescription: "",
};

export interface ListingStep5PageProps {
  initialValues?: ListingStep5InitialValues;
  onPrev?: () => void;
  onNext?: (values: ListingStep5Values) => void;
  isSaving?: boolean;
}

/**
 * 5단계 · 공용 시설 정보 (Figma: node 427:16228 · 426:15809 · 427:16663)
 *
 * - 주방/거실/세탁기: 각 카드 안에 5개 선택 타일(2·2·1 그리드)
 * - 화장실 사용 방식: 라디오
 */
export function ListingStep5Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep5PageProps) {
  const [kitchen, setKitchen] = useState<KitchenUsagePolicy | null>(
    initialValues.kitchenUsagePolicy,
  );
  const [living, setLiving] = useState<LivingRoomUsagePolicy | null>(
    initialValues.livingRoomUsagePolicy,
  );
  const [laundry, setLaundry] = useState<WashingMachineUsagePolicy | null>(
    initialValues.washingMachineUsagePolicy,
  );
  const [bathroom, setBathroom] = useState<BathroomUsageType | null>(
    initialValues.bathroomUsageType,
  );
  const [note, setNote] = useState(initialValues.bathroomDescription);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const requiredError = (value: unknown) => (submitted && !value ? REQUIRED_MESSAGE : undefined);

  const handleNext = () => {
    setSubmitted(true);
    if (!kitchen || !living || !laundry || !bathroom) {
      showToast("필수항목을 모두 입력해주세요.", { variant: "error" });
      return;
    }

    onNext?.({
      kitchenUsagePolicy: kitchen,
      livingRoomUsagePolicy: living,
      washingMachineUsagePolicy: laundry,
      bathroomUsageType: bathroom,
      bathroomDescription: note.trim(),
    });
  };

  return (
    <ListingStepLayout
      step={5}
      eyebrow="공용 시설 정보"
      title="함께 사용할 공간에 대해 알려주세요"
      description="주방, 거실, 세탁기 등 입주자가 함께 사용할 수 있는 공간에 대해 알려주세요."
      onPrev={onPrev}
      onNext={handleNext}
      nextDisabled={isSaving}
      autoSaving={isSaving}
    >
      <div className="flex w-full flex-col gap-9">
        <div className="flex w-full flex-col gap-6">
          <FacilityCard
            label="주방"
            options={KITCHEN_USAGE_POLICY_OPTIONS}
            value={kitchen}
            onChange={setKitchen}
            error={requiredError(kitchen)}
          />
          <FacilityCard
            label="거실"
            options={LIVING_ROOM_USAGE_POLICY_OPTIONS}
            value={living}
            onChange={setLiving}
            error={requiredError(living)}
          />
          <FacilityCard
            label="세탁기"
            options={WASHING_MACHINE_USAGE_POLICY_OPTIONS}
            value={laundry}
            onChange={setLaundry}
            error={requiredError(laundry)}
          />
        </div>
        <hr className="w-full border-grayscale-200" />
        <div className="flex w-full flex-col gap-9">
          <div className="flex w-full flex-col">
            <div className="flex w-full flex-col gap-3">
              <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-grayscale-800">
                화장실 사용 방식
              </p>
              <div className="flex flex-col gap-4">
                {BATHROOM_USAGE_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <Radio
                      size="24"
                      name="bathroom"
                      value={option.value}
                      checked={bathroom === option.value}
                      onChange={() => setBathroom(option.value)}
                    />
                    <span className="text-base leading-[1.6] font-medium text-grayscale-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <FieldError message={requiredError(bathroom)} />
          </div>
          <TextArea
            label="화장실 사용 부가 설명(선택)"
            size="l"
            className="w-full"
            placeholder="화장실 사용에 대한 추가 안내 사항을 입력해 주세요. 예) 밤 11시 이후 샤워는 자제해 주세요."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </ListingStepLayout>
  );
}
