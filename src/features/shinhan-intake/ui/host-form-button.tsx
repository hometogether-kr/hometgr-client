"use client";

import { useRouter } from "next/navigation";

import { BtnCta, type BtnCtaProps } from "@/shared/ui/btn-cta";

import { SHINHAN_HOST_ESTIMATE_PATH, SHINHAN_HOST_REGISTRATION_PATH } from "../config/routes";

interface HostFormButtonProps extends Omit<BtnCtaProps, "onClick" | "disabled"> {
  flow: "estimate" | "registration";
}

export function ShinhanHostFormButton({ flow, ...props }: HostFormButtonProps) {
  const router = useRouter();
  return (
    <BtnCta
      {...props}
      disabled={process.env.NODE_ENV !== "development"}
      onClick={() =>
        router.push(
          flow === "estimate" ? SHINHAN_HOST_ESTIMATE_PATH : SHINHAN_HOST_REGISTRATION_PATH,
        )
      }
    />
  );
}
