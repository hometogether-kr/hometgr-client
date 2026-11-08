"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useState } from "react";

import type { MockRoomSourceOptions } from "@/features/preview-rooms";
import { createMockRoomSource } from "@/features/preview-rooms";
import { ApiError } from "@/shared/api";
import { BackLink } from "@/shared/ui/back-link";
import { BtnCta } from "@/shared/ui/btn-cta";
import { QueryErrorBoundary } from "@/shared/ui/error-boundary";
import { SiteLayout } from "@/widgets/site-layout";

const PreviewDetailContent = dynamic(
  () => import("./ui/preview-detail-content").then((module) => module.PreviewDetailContent),
  { ssr: false, loading: () => <DetailLoading /> },
);

interface PreviewListingDetailPageProps {
  id: string;
  previewOptions: MockRoomSourceOptions;
  viewer: "guest" | "member";
  returnHref: string;
}

function DetailLoading() {
  return (
    <div role="status" aria-label="매물 상세 불러오는 중" className="flex flex-col gap-10">
      <div className="h-[280px] animate-pulse rounded-2xl bg-grayscale-70 md:h-[420px]" />
      <div className="h-40 animate-pulse rounded-2xl bg-grayscale-70" />
    </div>
  );
}

export function PreviewListingDetailPage({
  id,
  previewOptions,
  viewer,
  returnHref,
}: PreviewListingDetailPageProps) {
  const [source] = useState(() => createMockRoomSource(previewOptions));
  const viewerHref = (mode: "guest" | "member") =>
    `/rooms/${encodeURIComponent(id)}?${new URLSearchParams({
      preview: "rooms",
      viewer: mode,
      returnTo: returnHref,
    }).toString()}`;

  return (
    <SiteLayout background="white">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-10 px-4 py-8 md:gap-12 md:px-10 xl:px-[200px] xl:py-[100px]">
        <nav aria-label="상세 미리보기" className="flex flex-wrap items-center gap-4 text-sm">
          <BackLink href={returnHref} scroll={false}>
            검색 결과로 돌아가기
          </BackLink>
          <span className="text-grayscale-600">모의 상세 · 실제 로그인 상태와 무관합니다.</span>
          <Link
            href={viewerHref("guest")}
            replace
            aria-current={viewer === "guest" ? "page" : undefined}
            className="rounded-lg border border-grayscale-200 px-3 py-2 aria-[current=page]:bg-primary-100"
          >
            비회원 미리보기
          </Link>
          <Link
            href={viewerHref("member")}
            replace
            aria-current={viewer === "member" ? "page" : undefined}
            className="rounded-lg border border-grayscale-200 px-3 py-2 aria-[current=page]:bg-primary-100"
          >
            회원 미리보기
          </Link>
        </nav>
        <QueryErrorBoundary
          key={`${id}:${viewer}`}
          fallback={({ error, reset }) => (
            <div
              role="alert"
              className="flex min-h-80 flex-col items-center justify-center gap-6 text-center"
            >
              <p>
                {error instanceof ApiError && error.status === 404
                  ? "매물을 찾을 수 없어요. 공개된 매물인지 확인해주세요."
                  : "매물 상세를 불러오지 못했어요."}
              </p>
              {!(error instanceof ApiError && error.status === 404) && (
                <BtnCta size="s" onClick={reset}>
                  다시 시도
                </BtnCta>
              )}
              <BackLink href={returnHref} scroll={false}>
                검색 결과로 돌아가기
              </BackLink>
            </div>
          )}
        >
          <Suspense fallback={<DetailLoading />}>
            <PreviewDetailContent
              id={id}
              viewer={viewer}
              source={source}
              previewOptions={previewOptions}
            />
          </Suspense>
        </QueryErrorBoundary>
      </div>
    </SiteLayout>
  );
}
