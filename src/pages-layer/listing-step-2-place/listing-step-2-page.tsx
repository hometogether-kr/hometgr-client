"use client";

import Image from "next/image";
import { useState } from "react";
import { BUILDING_TYPE_OPTIONS, type BuildingType } from "@/domains/listing-draft";
import { cn } from "@/shared/lib/cn";
import type { SelectedAddress } from "@/shared/lib/kakao-postcode";
import { AddressSearchDialog } from "@/shared/ui/address-search-dialog";
import { BtnCta } from "@/shared/ui/btn-cta";
import { BtnIc } from "@/shared/ui/btn-ic";
import { ChipNormal } from "@/shared/ui/chip-normal";
import { TextField } from "@/shared/ui/text-field";
import { Toast, ToastViewport } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

/**
 * TODO: ic_search는 7일 후 만료되는 Figma 임시 URL입니다.
 * export해 public/icons 또는 public/figma에 커밋한 뒤 교체하세요.
 */
const FIGMA_TEMP_IC_SEARCH = "/figma/ic-search-2162f918.svg";
const IC_ERROR = "/icons/ic-error.svg";

export interface ListingStep2Values {
  addressRoad: string;
  addressDetail: string;
  /** 시·도 + 시·군·구 — 주소 검색 결과에서 채워집니다. */
  addressRegion: string;
  approximateLocation: string;
  buildingType: BuildingType | null;
  buildingTypeOther: string;
}

const EMPTY_VALUES: ListingStep2Values = {
  addressRoad: "",
  addressDetail: "",
  addressRegion: "",
  approximateLocation: "",
  buildingType: null,
  buildingTypeOther: "",
};

export interface ListingStep2PageProps {
  initialValues?: ListingStep2Values;
  onPrev?: () => void;
  onNext?: (values: ListingStep2Values) => void;
  isSaving?: boolean;
}

/**
 * 2단계 · 장소 기본 정보 (Figma: node 420:6707 · 420:10983 · 424:12339)
 *
 * - "입력하기" → 하단에 "대략적인 위치" 입력란 확장
 * - 주소(검색+상세) 또는 대략적인 위치 중 하나는 필수 — 미입력 시 에러 + 토스트
 */
export function ListingStep2Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
}: ListingStep2PageProps) {
  const [address, setAddress] = useState(initialValues.addressRoad);
  const [addressRegion, setAddressRegion] = useState(initialValues.addressRegion);
  const [zonecode, setZonecode] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [addressDetail, setAddressDetail] = useState(initialValues.addressDetail);
  const [roughLocation, setRoughLocation] = useState(initialValues.approximateLocation);
  const [buildingType, setBuildingType] = useState<BuildingType | null>(
    initialValues.buildingType,
  );
  const [buildingTypeOther, setBuildingTypeOther] = useState(initialValues.buildingTypeOther);
  const [manualOpen, setManualOpen] = useState(initialValues.approximateLocation !== "");
  const [showError, setShowError] = useState(false);

  const hasAddress = address.trim() !== "" && addressDetail.trim() !== "";
  const hasRough = roughLocation.trim() !== "";
  const needsBuildingTypeOther = buildingType === "other";
  const hasBuildingTypeOther = buildingTypeOther.trim() !== "";

  const handleNext = () => {
    if (!hasAddress && !hasRough) {
      setManualOpen(true);
      setShowError(true);
      return;
    }
    if (needsBuildingTypeOther && !hasBuildingTypeOther) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onNext?.({
      addressRoad: address.trim(),
      addressDetail: addressDetail.trim(),
      addressRegion: addressRegion.trim(),
      approximateLocation: roughLocation.trim(),
      buildingType,
      buildingTypeOther: buildingTypeOther.trim(),
    });
  };

  const handleAddressSelect = (selected: SelectedAddress) => {
    setAddress(selected.address);
    setAddressRegion(selected.region);
    setZonecode(selected.zonecode);
    setShowError(false);
  };

  return (
    <>
      {showError && (
        <ToastViewport>
          <Toast
            variant="error"
            description="정확한 주소를 안다면 주소 검색+상세 주소를 / 정확한 주소를 모르신다면 대략적인 위치를 입력해주세요."
            onClose={() => setShowError(false)}
          >
            필수항목을 작성해주세요.
          </Toast>
        </ToastViewport>
      )}
      <ListingStepLayout
        step={2}
        title="주소와 건물 기본 정보를 알려주세요."
        description="정확한 주소는 예약 확정 전까지 공개하지 않고, 동네 단위 정보만 먼저 노출합니다."
        onPrev={onPrev}
        onNext={handleNext}
        nextDisabled={isSaving}
        autoSaving={isSaving}
      >
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-end gap-3">
            <TextField
              label="주소 검색"
              placeholder="도로명, 지번, 건물명 검색"
              className="flex-1"
              size="L"
              value={address}
              /* 검색 결과만 들어가야 지역(시·군·구) 값과 어긋나지 않습니다. */
              readOnly
              onClick={() => setSearchOpen(true)}
              onFocus={() => setSearchOpen(true)}
            />
            <div className="flex items-center py-1">
              <BtnIc
                size="44"
                shape="square"
                tone="dark"
                label="주소 검색"
                onClick={() => setSearchOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 임시 Figma 에셋, 커밋된 SVG로 교체 예정 */}
                <img alt="" src={FIGMA_TEMP_IC_SEARCH} className="block size-[14.5px] max-w-none" />
              </BtnIc>
            </div>
          </div>
          {addressRegion && (
            <p className="-mt-3 pl-1 text-[13px] font-medium leading-[1.4] text-grayscale-500">
              {zonecode && `(${zonecode}) `}
              {addressRegion}
            </p>
          )}
          <TextField
            label="상세 주소"
            placeholder="예) 102동 1702호"
            size="L"
            className="w-full"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
          />
          <div className="flex w-full flex-col gap-3">
            <p className="w-full text-sm font-medium leading-[1.4] text-grayscale-600">건물 유형</p>
            <div className="flex items-center gap-1.5">
              {BUILDING_TYPE_OPTIONS.map((option) => (
                <ChipNormal
                  key={option.value}
                  shape="round"
                  size="m"
                  selected={buildingType === option.value}
                  onClick={() => setBuildingType(option.value)}
                >
                  {option.label}
                </ChipNormal>
              ))}
            </div>
            {/* 서버가 기타 유형 설명을 필수로 받아, 기타를 고르면 입력란을 엽니다. */}
            {needsBuildingTypeOther && (
              <TextField
                label="건물 유형 직접 입력"
                placeholder="예) 다가구 주택"
                size="L"
                className="w-full"
                value={buildingTypeOther}
                onChange={(e) => setBuildingTypeOther(e.target.value)}
                error={showError && !hasBuildingTypeOther ? "필수 항목입니다." : undefined}
              />
            )}
          </div>
          <div className="flex w-full flex-col">
            <div
              className={cn(
                "flex w-full flex-col gap-4 border border-grayscale-200 p-4 md:flex-row md:items-center md:justify-between md:gap-0 md:p-5",
                manualOpen ? "rounded-t-2xl" : "rounded-2xl",
              )}
            >
              <div className="flex flex-1 flex-col items-start gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Image
                    src={IC_ERROR}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="whitespace-nowrap text-sm font-bold leading-[1.4] text-grayscale-700">
                    주소 입력이 어려우신가요?
                  </p>
                </div>
                <p className="text-sm font-medium leading-[1.5] text-grayscale-600 md:whitespace-nowrap">
                  정확한 주소를 모르셔도 괜찮아요. 동 / 역 / 건물명 정도만 입력해 주시면 확인 후
                  연락드려요.
                </p>
              </div>
              {!manualOpen && (
                <div className="flex justify-end md:block">
                  <BtnCta variant="emphasize" size="xs" onClick={() => setManualOpen(true)}>
                    입력하기
                  </BtnCta>
                </div>
              )}
            </div>
            {manualOpen && (
              <div className="flex w-full flex-col rounded-b-2xl border-x border-b border-grayscale-200 px-5 pb-5 pt-4">
                <TextField
                  label="대략적인 위치"
                  placeholder="예) OO동 / OO역 근처 / OO아파트 근처"
                  size="L"
                  className="w-full"
                  value={roughLocation}
                  onChange={(e) => setRoughLocation(e.target.value)}
                  error={
                    showError
                      ? "정확한 주소를 모른다면 이곳에 대략적인 위치를 적어주세요."
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        </div>
      </ListingStepLayout>
      <AddressSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleAddressSelect}
      />
    </>
  );
}
