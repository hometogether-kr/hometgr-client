"use client";

import { useRouter } from "next/navigation";

import { BtnCta, type BtnCtaProps } from "@/shared/ui/btn-cta";

import { SHINHAN_HOST_ESTIMATE_PATH, SHINHAN_HOST_REGISTRATION_PATH } from "../config/routes";
import { useShinhanEntryAvailability } from "../model/entry-context";

interface HostFormButtonProps extends Omit<BtnCtaProps, "onClick" | "disabled"> {
  flow: "estimate" | "registration";
}

export function ShinhanHostFormButton({ flow, ...props }: HostFormButtonProps) {
  const router = useRouter();
  const available = useShinhanEntryAvailability();
  return (
    <BtnCta
      {...props}
      disabled={!available}
      onClick={() =>
        router.push(
          flow === "estimate" ? SHINHAN_HOST_ESTIMATE_PATH : SHINHAN_HOST_REGISTRATION_PATH,
        )
      }
    />
  );
}
