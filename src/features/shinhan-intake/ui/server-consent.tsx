"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { getShinhanConsents, shinhanApplicationKeys } from "@/domains/shinhan-application";
import { BtnCta } from "@/shared/ui/btn-cta";

import { useShinhanStorage } from "../model/storage-context";
import { ShinhanPrivacyLink, ShinhanPrivacyReturn } from "./privacy-navigation";

export function ShinhanServerConsentSummary() {
  const { consents, consentPreparationStarted } = useShinhanStorage();
  if (!consents)
    return (
      <p className="mt-2 text-sm leading-6 text-grayscale-600">
        {consentPreparationStarted
          ? "개인정보 안내를 다시 불러온 뒤 동의해 주세요. 기존 입력 내용은 유지됩니다."
          : "개인정보 안내를 먼저 불러온 뒤 내용을 확인하고 동의해 주세요."}
      </p>
    );
  return (
    <div className="mt-2 text-sm leading-6 text-grayscale-600">
      <p>
        동의 전문 버전: <span className="break-all">{consents.required.version}</span>
      </p>
      {consents.localOnly && <p>로컬 확인용 전문이며 운영 승인본이 아닙니다.</p>}
      <ShinhanPrivacyLink>필수 동의 전문 보기</ShinhanPrivacyLink>
    </div>
  );
}

export function ServerConsentDocument({ fallback }: { fallback: ReactNode }) {
  const { consents, consentPreparationStarted, application, sessionMode } = useShinhanStorage();
  const documentQuery = useQuery({
    queryKey: shinhanApplicationKeys.consentDocument(),
    queryFn: ({ signal }) => getShinhanConsents(signal),
    enabled: !consents && sessionMode !== "unavailable",
  });
  // Reading the document must not mark the application session as ready to submit.
  const document = consents ?? documentQuery.data;
  if (!document) {
    if (sessionMode === "local" && !consentPreparationStarted && documentQuery.isError)
      return fallback;
    return (
      <article className="mx-auto max-w-4xl space-y-6 px-5 py-10 md:px-8 md:py-16">
        <ShinhanPrivacyReturn />
        <h1 className="text-2xl leading-snug font-bold md:text-4xl">
          {documentQuery.isFetching
            ? "개인정보 전문을 준비하고 있어요"
            : "개인정보 전문을 불러오지 못했어요"}
        </h1>
        <p className="text-base leading-8">
          {sessionMode === "unavailable"
            ? "현재 개인정보 안내를 불러올 수 없습니다. 잠시 후 다시 방문해 주세요."
            : "열람만으로 동의하거나 신청이 접수되지 않습니다."}
        </p>
        {documentQuery.error && <p role="alert">{documentQuery.error.message}</p>}
        {sessionMode !== "unavailable" && (
          <BtnCta
            variant="stroke"
            loading={documentQuery.isFetching}
            onClick={() => void documentQuery.refetch()}
          >
            개인정보 전문 다시 불러오기
          </BtnCta>
        )}
        <ShinhanPrivacyReturn />
      </article>
    );
  }
  const snapshot = document.required;
  return (
    <article className="mx-auto max-w-4xl space-y-6 px-5 py-10 md:px-8 md:py-16">
      <ShinhanPrivacyReturn />
      <header className="space-y-3">
        <h1 className="text-2xl leading-snug font-bold md:text-4xl">
          개인정보 수집·이용 전문 (필수)
        </h1>
        <p className="text-sm leading-6 break-all text-grayscale-600">
          전문 버전: {snapshot.version}
        </p>
        {document.localOnly && (
          <p className="rounded-xl bg-primary-50 p-4 text-sm leading-6">
            로컬 저장 확인용 전문입니다. 운영 승인본이 아닙니다. 열람만으로 동의하거나 신청을
            저장하지 않습니다.
          </p>
        )}
        {application && application.requiredConsent.version !== snapshot.version && (
          <p className="text-sm leading-6 text-grayscale-600">
            현재 제출에 사용할 전문입니다. 기존 신청에 기록된 필수 동의 버전은{" "}
            {application.requiredConsent.version}이며, 이 전문을 열람하거나 다시 불러와도 기존 동의
            기록은 변경되지 않습니다.
          </p>
        )}
      </header>
      <div className="rounded-2xl bg-white p-5 text-base leading-8 break-words whitespace-pre-wrap md:p-8">
        {snapshot.content}
      </div>
      <ShinhanPrivacyReturn />
    </article>
  );
}
