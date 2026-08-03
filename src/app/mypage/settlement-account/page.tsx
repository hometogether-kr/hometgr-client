"use client";

import { useRouter } from "next/navigation";

import { SettlementAccountPage } from "@/pages-layer/settlement-account";
import { ROUTES } from "@/shared/config";
import { useToast } from "@/shared/ui/toast";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();

  // TODO: 정산 계좌 저장 API가 생기면 뮤테이션으로 교체하세요.
  const handleSubmit = () => {
    showToast("수정이 성공적으로 완료되었습니다.", { variant: "success" });
    router.push(ROUTES.myPage);
  };

  return (
    <SettlementAccountPage onSubmit={handleSubmit} onBack={() => router.push(ROUTES.myPage)} />
  );
}
