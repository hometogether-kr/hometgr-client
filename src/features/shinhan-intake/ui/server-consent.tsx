"use client";

import type { ReactNode } from "react";

import { useShinhanStorage } from "../model/storage-context";
import { ShinhanLivePreparation, ShinhanSessionRestart } from "./live-submit";
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
  const {
    consents,
    consentPreparationStarted,
    preparing,
    error,
    application,
    sessionMode,
    submissionAvailable,
  } = useShinhanStorage();
  if (!consents) {
    if (!consentPreparationStarted && sessionMode === "local") return fallback;
    return (
      <article className="mx-auto max-w-4xl space-y-6 px-5 py-10 md:px-8 md:py-16">
        <ShinhanPrivacyReturn />
        <h1 className="text-2xl leading-snug font-bold md:text-4xl">
          {preparing ? "개인정보 전문을 준비하고 있어요" : "개인정보 전문을 다시 확인해 주세요"}
        </h1>
        <p className="text-base leading-8">
          {submissionAvailable
            ? "개인정보 안내를 불러와 주세요. 작성한 내용과 선택값은 유지되며, 전문을 확인한 뒤 필수 동의를 선택할 수 있습니다."
            : "신청 화면에서 개인정보 안내를 불러온 뒤 전문을 확인할 수 있습니다. 열람만으로 동의하거나 신청이 접수되지 않습니다."}
        </p>
        <ShinhanLivePreparation />
        {error && (
          <p role="alert" className="text-sm leading-6 text-system-error">
            {error.message}
          </p>
        )}
        <ShinhanSessionRestart />
        <ShinhanPrivacyReturn />
      </article>
    );
  }
  const snapshot = consents.required;
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
        {consents.localOnly && (
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
