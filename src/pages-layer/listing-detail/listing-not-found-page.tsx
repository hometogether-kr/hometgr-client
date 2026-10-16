"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { parseRoomListReturnHref } from "@/features/filter-rooms";
import { BackLink } from "@/shared/ui/back-link";
import { SiteLayout } from "@/widgets/site-layout";

function ReturnToList() {
  const params = useSearchParams();
  return (
    <BackLink href={parseRoomListReturnHref(params.get("returnTo"))} scroll={false}>
      검색 결과로 돌아가기
    </BackLink>
  );
}

export function ListingNotFoundPage() {
  return (
    <SiteLayout background="white">
      <section className="mx-auto flex min-h-96 max-w-2xl flex-col items-center justify-center gap-5 px-5 py-16 text-center">
        <h1 className="text-title-3 font-semibold">현재 공개 중인 매물이 아니에요</h1>
        <p className="text-grayscale-600">
          공개가 중단되었거나 삭제된 매물일 수 있어요. 다른 매물을 확인해 주세요.
        </p>
        <Suspense fallback={<BackLink href="/rooms">매물 목록 보기</BackLink>}>
          <ReturnToList />
        </Suspense>
      </section>
    </SiteLayout>
  );
}
