"use client";

import { useState } from "react";
import { DateField } from "@/shared/ui/date-field";
import { OptionalAmountField } from "@/shared/ui/optional-amount-field";
import { TextField } from "@/shared/ui/text-field";
import { Toast, ToastViewport } from "@/shared/ui/toast";
import { ListingStepLayout } from "@/widgets/listing-step-layout";

type AmountMode = "none" | "custom" | null;

const REQUIRED_MESSAGE = "필수 항목입니다.";
const AMOUNT_MESSAGE = "금액을 숫자로 입력해주세요. 예) 65만원";
const PERIOD_MESSAGE = "거주 기간을 입력해주세요. 예) 6개월, 1년";
const DATE_REQUIRED_MESSAGE = "필수 항목입니다. 미정이라면 임의로 선택 후 문의 부탁드립니다.";

export interface ListingStep7Values {
  monthlyRentKrw: number;
  depositKrw: number;
  maintenanceFeeKrw: number;
  /** YYYY-MM-DD — 시간대 변환은 상위에서 처리합니다. */
  moveInAvailableOn: string;
  minStayMonths: number;
}

export interface ListingStep7InitialValues {
  monthlyRent: string;
  deposit: string;
  maintenanceFee: string;
  moveInAvailableOn: string;
  minStay: string;
}

const EMPTY_VALUES: ListingStep7InitialValues = {
  monthlyRent: "",
  deposit: "",
  maintenanceFee: "",
  moveInAvailableOn: "",
  minStay: "",
};

export interface ListingStep7PageProps {
  initialValues?: ListingStep7InitialValues;
  onPrev?: () => void;
  onNext?: (values: ListingStep7Values) => void;
  isSaving?: boolean;
  /** "65만원" 같은 표기를 원 단위 정수로 바꿉니다. 실패하면 null */
  parseAmount: (input: string) => number | null;
  /** "6개월" 같은 표기를 개월 수로 바꿉니다. 실패하면 null */
  parsePeriod: (input: string) => number | null;
}

/**
 * 7단계 · 계약 조건 (Figma: node 420:7052 · 472:14540 · 472:14888)
 *
 * - 보증금·관리비: 없음 / 있음(직접 입력) 라디오
 * - 입주 가능일 미선택 시 전용 안내 문구
 */
export function ListingStep7Page({
  initialValues = EMPTY_VALUES,
  onPrev,
  onNext,
  isSaving = false,
  parseAmount,
  parsePeriod,
}: ListingStep7PageProps) {
  const [rent, setRent] = useState(initialValues.monthlyRent);
  const [depositMode, setDepositMode] = useState<AmountMode>(
    initialValues.deposit === "" ? null : initialValues.deposit === "0" ? "none" : "custom",
  );
  const [deposit, setDeposit] = useState(initialValues.deposit === "0" ? "" : initialValues.deposit);
  const [maintenanceMode, setMaintenanceMode] = useState<AmountMode>(
    initialValues.maintenanceFee === ""
      ? null
      : initialValues.maintenanceFee === "0"
        ? "none"
        : "custom",
  );
  const [maintenance, setMaintenance] = useState(
    initialValues.maintenanceFee === "0" ? "" : initialValues.maintenanceFee,
  );
  const [availableFrom, setAvailableFrom] = useState(initialValues.moveInAvailableOn);
  const [minPeriod, setMinPeriod] = useState(initialValues.minStay);
  const [submitted, setSubmitted] = useState(false);

  /** "없음"은 0원으로 보냅니다. */
  const amountOf = (mode: AmountMode, value: string) =>
    mode === "none" ? 0 : mode === "custom" ? parseAmount(value) : null;

  const amountError = (mode: AmountMode, value: string) => {
    if (!mode) return REQUIRED_MESSAGE;
    if (mode === "none") return undefined;
    if (value.trim() === "") return REQUIRED_MESSAGE;
    return parseAmount(value) === null ? AMOUNT_MESSAGE : undefined;
  };

  const errors = {
    rent:
      rent.trim() === ""
        ? REQUIRED_MESSAGE
        : (parseAmount(rent) ?? 0) < 1
          ? AMOUNT_MESSAGE
          : undefined,
    deposit: amountError(depositMode, deposit),
    maintenance: amountError(maintenanceMode, maintenance),
    availableFrom: availableFrom === "" ? DATE_REQUIRED_MESSAGE : undefined,
    minPeriod:
      minPeriod.trim() === ""
        ? REQUIRED_MESSAGE
        : (parsePeriod(minPeriod) ?? 0) < 1
          ? PERIOD_MESSAGE
          : undefined,
  };
  const hasError = Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (submitted ? errors[key] : undefined);

  const handleNext = () => {
    setSubmitted(true);
    if (hasError) return;

    const monthlyRentKrw = parseAmount(rent);
    const depositKrw = amountOf(depositMode, deposit);
    const maintenanceFeeKrw = amountOf(maintenanceMode, maintenance);
    const minStayMonths = parsePeriod(minPeriod);

    if (
      monthlyRentKrw === null ||
      depositKrw === null ||
      maintenanceFeeKrw === null ||
      minStayMonths === null
    ) {
      return;
    }

    onNext?.({
      monthlyRentKrw,
      depositKrw,
      maintenanceFeeKrw,
      moveInAvailableOn: availableFrom,
      minStayMonths,
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
        step={7}
        title="가격과 입주 조건을 입력해주세요"
        description="입주자가 예약 전 확인할 수 있도록 월세, 보증금, 입주 가능일을 정확히 알려주세요."
        onPrev={onPrev}
        onNext={handleNext}
        nextDisabled={isSaving}
        autoSaving={isSaving}
      >
        <div className="flex w-full max-w-[580px] flex-col gap-6">
          <TextField
            label="월세"
            placeholder="예) 65만원"
            size="L"
            className="w-full"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            error={show("rent")}
          />
          <OptionalAmountField
            label="보증금"
            name="deposit"
            mode={depositMode}
            onModeChange={setDepositMode}
            value={deposit}
            onValueChange={setDeposit}
            placeholder="예) 500만원"
            error={show("deposit")}
          />
          <OptionalAmountField
            label="관리비"
            name="maintenance"
            mode={maintenanceMode}
            onModeChange={setMaintenanceMode}
            value={maintenance}
            onValueChange={setMaintenance}
            placeholder="예) 5만원"
            error={show("maintenance")}
          />
          <div className="flex w-full flex-col">
            <div className="flex items-end gap-3">
              <DateField
                label="입주 가능일"
                className="w-[249px]"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
              <p className="py-2.5 text-[13px] font-normal leading-[1.4] text-grayscale-600">
                이후부터 가능
              </p>
            </div>
            {show("availableFrom") && (
              <p className="w-full pl-1 pt-2 text-[13px] font-medium leading-[1.4] text-system-error">
                {show("availableFrom")}
              </p>
            )}
          </div>
          <TextField
            label="최소 거주 기간"
            placeholder="예) 6개월, 1년"
            size="L"
            className="w-full"
            value={minPeriod}
            onChange={(e) => setMinPeriod(e.target.value)}
            error={show("minPeriod")}
          />
        </div>
      </ListingStepLayout>
    </>
  );
}
