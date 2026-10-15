"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { parseRoomListReturnHref } from "@/features/filter-rooms";
import { SiteLayout } from "@/widgets/site-layout";

function ReturnToList() {
  const params = useSearchParams();
  return (
    <Link
      href={parseRoomListReturnHref(params.get("returnTo"))}
      scroll={false}
      prefetch={false}
      className="text-primary-600 underline"
    >
      검색 결과로 돌아가기
    </Link>
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
        <Suspense fallback={<Link href="/rooms">매물 목록 보기</Link>}>
          <ReturnToList />
        </Suspense>
      </section>
    </SiteLayout>
  );
}
