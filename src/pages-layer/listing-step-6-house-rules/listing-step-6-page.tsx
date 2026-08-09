"use client";

import { useState } from "react";

import {
  INTERACTION_PREFERENCE_OPTIONS,
  type InteractionPreference,
  PREFERRED_GENDER_OPTIONS,
  type PreferredGender,
  ROOM_CAPACITY_OPTIONS,
  type RoomCapacity,
  SMOKING_PREFERENCE_OPTIONS,
  type SmokingPreference,
  VISITOR_POLICY_OPTIONS,
  type VisitorPolicy,
} from "@/domains/listing-draft";
import { ChipField } from "@/shared/ui/chip-field";
import { TextArea } from "@/shared/ui/text-area";
import { useToast } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

const REQUIRED_MESSAGE = "필수 항목입니다.";

/** 반려동물만 서버 계약이 boolean이라 칩 선택지를 따로 둡니다. */
const PET_OPTIONS = [
  { value: "yes", label: "가능" },
  { value: "no", label: "불가능" },
] as const;

type PetAllowed = "yes" | "no";

export interface ListingStep6Values {
  visitorPolicy: VisitorPolicy;
  petAllowed: boolean;
  smokingPreference: SmokingPreference;
  preferredGender: PreferredGender;
  roomCapacity: RoomCapacity;
  interactionPreference: InteractionPreference;
  additionalGuidance: string;
}

export interface ListingStep6InitialValues {
  visitorPolicy: VisitorPolicy | null;
  petAllowed: boolean | null;
  smokingPreference: SmokingPreference | null;
  preferredGender: PreferredGender | null;
  roomCapacity: RoomCapacity | null;
  interactionPreference: InteractionPreference | null;
  additionalGuidance: string;
}

const EMPTY_VALUES: ListingStep6InitialValues = {
  visitorPolicy: null,
  petAllowed: null,
  smokingPreference: null,
  preferredGender: null,
  roomCapacity: null,
  interactionPreference: null,
  additionalGuidance: "",
};

export interface ListingStep6PageProps {
  initialValues?: ListingStep6InitialValues;
  onPrev?: () => void;
  onNext?: (values: ListingStep6Values) => void;
  isSaving?: boolean;
}

/**
 * 6단계 · 생활 안내 및 규칙 (Figma: node 420:6989 · 587:25057 · 587:25975)
 */
export function ListingStep6Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep6PageProps) {
  const [visitorPolicy, setVisitorPolicy] = useState<VisitorPolicy | null>(
    initialValues.visitorPolicy,
  );
  const [petAllowed, setPetAllowed] = useState<PetAllowed | null>(
    initialValues.petAllowed === null ? null : initialValues.petAllowed ? "yes" : "no",
  );
  const [smokingPreference, setSmokingPreference] = useState<SmokingPreference | null>(
    initialValues.smokingPreference,
  );
  const [preferredGender, setPreferredGender] = useState<PreferredGender | null>(
    initialValues.preferredGender,
  );
  const [roomCapacity, setRoomCapacity] = useState<RoomCapacity | null>(initialValues.roomCapacity);
  const [interactionPreference, setInteractionPreference] = useState<InteractionPreference | null>(
    initialValues.interactionPreference,
  );
  const [note, setNote] = useState(initialValues.additionalGuidance);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const requiredError = (value: unknown) => (submitted && !value ? REQUIRED_MESSAGE : undefined);

  const handleNext = () => {
    setSubmitted(true);
    if (
      !visitorPolicy ||
      !petAllowed ||
      !smokingPreference ||
      !preferredGender ||
      !roomCapacity ||
      !interactionPreference
    ) {
      showToast("필수항목을 모두 입력해주세요.", { variant: "error" });
      return;
    }

    onNext?.({
      visitorPolicy,
      petAllowed: petAllowed === "yes",
      smokingPreference,
      preferredGender,
      roomCapacity,
      interactionPreference,
      additionalGuidance: note.trim(),
    });
  };

  return (
    <ListingStepLayout
      step={6}
      title="생활 규칙에 대해 알려주세요"
      onPrev={onPrev}
      onNext={handleNext}
      nextDisabled={isSaving}
      autoSaving={isSaving}
    >
      <div className="flex w-full flex-col gap-9">
        <ChipField
          label="외부 방문객 초대"
          options={VISITOR_POLICY_OPTIONS}
          value={visitorPolicy}
          onChange={setVisitorPolicy}
          error={requiredError(visitorPolicy)}
        />
        <ChipField
          label="반려동물 가능 여부"
          options={PET_OPTIONS}
          value={petAllowed}
          onChange={setPetAllowed}
          error={requiredError(petAllowed)}
        />
        <ChipField
          label="실내 흡연 가능 여부"
          options={SMOKING_PREFERENCE_OPTIONS}
          value={smokingPreference}
          onChange={setSmokingPreference}
          error={requiredError(smokingPreference)}
        />
        <ChipField
          label="원하시는 입주자 성별"
          options={PREFERRED_GENDER_OPTIONS}
          value={preferredGender}
          onChange={setPreferredGender}
          error={requiredError(preferredGender)}
        />
        <ChipField
          label="등록하실 방 1개에 몇명까지 입주 허용 예정인가요?"
          options={ROOM_CAPACITY_OPTIONS}
          value={roomCapacity}
          onChange={setRoomCapacity}
          error={requiredError(roomCapacity)}
        />
        <ChipField
          label="선호하는 입주자 성향"
          options={INTERACTION_PREFERENCE_OPTIONS}
          value={interactionPreference}
          onChange={setInteractionPreference}
          error={requiredError(interactionPreference)}
        />
        <TextArea
          label="추가 안내사항(선택)"
          size="l"
          className="w-full"
          placeholder="게스트가 미리 알아야 할 생활 패턴이나 규칙이 있다면 적어주세요."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </ListingStepLayout>
  );
}
