"use client";

import { useRouter } from "next/navigation";

import { SettlementAccountPage } from "@/pages-layer/settlement-account";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = () => {
    showToast("정산 계좌 저장 기능은 준비 중이에요.", { variant: "info" });
  };

  return (
    <SettlementAccountPage onSubmit={handleSubmit} onBack={() => router.push(ROUTES.myPage)} />
  );
}
