"use client";

import { useRouter } from "next/navigation";
import { type ButtonHTMLAttributes, type FormEvent, useState } from "react";

import { BtnCta, type BtnCtaProps } from "@/shared/ui/btn-cta";
import { TextField } from "@/shared/ui/text-field";

import { SHINHAN_GUEST_BUDGET_PATH, SHINHAN_GUEST_DEMAND_PATH } from "../config/routes";
import { useShinhanEntryAvailability } from "../model/entry-context";
import { shinhanGuestRegionSchema } from "../model/guest-conditions.schema";
import { useShinhanIntake } from "../model/intake-context";

type GuestFlow = "budget" | "demand";

function useStartGuestIntake() {
  const router = useRouter();
  const { startGuestDraft } = useShinhanIntake();
  const available = useShinhanEntryAvailability();
  function startIntake(flow: GuestFlow, region = "") {
    if (!available) return;
    startGuestDraft(flow === "budget" ? "GUEST_BUDGET" : "GUEST_DEMAND", region);
    router.push(flow === "budget" ? SHINHAN_GUEST_BUDGET_PATH : SHINHAN_GUEST_DEMAND_PATH);
  }
  return { available, startIntake };
}

interface GuestFormButtonProps extends Omit<BtnCtaProps, "onClick" | "disabled"> {
  flow: GuestFlow;
}

export function ShinhanGuestFormButton({ flow, ...props }: GuestFormButtonProps) {
  const { available, startIntake } = useStartGuestIntake();
  return <BtnCta {...props} disabled={!available} onClick={() => startIntake(flow)} />;
}

interface GuestRegionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "disabled"
> {
  region: string;
}

export function ShinhanGuestRegionButton({ region, ...props }: GuestRegionButtonProps) {
  const { available, startIntake } = useStartGuestIntake();
  return (
    <button
      {...props}
      type="button"
      disabled={!available}
      onClick={() => startIntake("demand", region)}
    />
  );
}

interface GuestSearchProps {
  fieldClassName?: string;
  buttonClassName?: string;
}

export function ShinhanGuestDemandSearch({ fieldClassName, buttonClassName }: GuestSearchProps) {
  const [region, setRegion] = useState("");
  const [attempted, setAttempted] = useState(false);
  const { available, startIntake } = useStartGuestIntake();
  const parsed = shinhanGuestRegionSchema.safeParse(region);
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (parsed.success) startIntake("demand", region);
  }
  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        disabled={!available}
        aria-label="희망하는 대학 또는 지역"
        placeholder="예) 서울과학기술대학교, 공릉역"
        aria-describedby="shinhan-guest-demand-status"
        className={fieldClassName}
        value={region}
        maxLength={200}
        onChange={(event) => setRegion(event.target.value)}
        error={attempted && !parsed.success ? parsed.error.issues[0]?.message : undefined}
        action={
          <BtnCta
            type="submit"
            disabled={!available}
            variant="stroke"
            size="l"
            className={buttonClassName}
          >
            검색
          </BtnCta>
        }
      />
    </form>
  );
}
